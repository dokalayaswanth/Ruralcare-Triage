import json
import os
from typing import List, Tuple

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

load_dotenv()


def build_triage_prompt(
    patient_data: dict,
    evidence_chunks: List[Tuple[str, str, float]],
) -> str:
    """
    Build the prompt sent to Groq.

    The LLM must return valid JSON only so the backend can safely parse it.
    """

    evidence_text = ""

    for index, evidence in enumerate(evidence_chunks, start=1):
        source, content, score = evidence

        evidence_text += f"""
[GUIDELINE {index}]
Source: {source}
Relevance Score: {round(score, 4)}
Content:
{content}
"""

    symptoms_text = ""

    for symptom in patient_data.get("symptoms", []):
        symptoms_text += (
            f"- {symptom.get('symptom')} "
            f"(severity: {symptom.get('severity')}, "
            f"duration: {symptom.get('duration')}, "
            f"onset: {symptom.get('onset')})\n"
        )

    vitals_text = "Not recorded"

    vitals = patient_data.get("vitals")

    if vitals:
        vitals_parts = []

        systolic = vitals.get("blood_pressure_systolic")
        diastolic = vitals.get("blood_pressure_diastolic")
        heart_rate = vitals.get("heart_rate")
        temperature_f = vitals.get("temperature_f")
        oxygen_saturation = vitals.get("oxygen_saturation")

        if systolic:
            vitals_parts.append(f"BP: {systolic}/{diastolic or '?'} mmHg")

        if heart_rate:
            vitals_parts.append(f"HR: {heart_rate} bpm")

        if temperature_f:
            vitals_parts.append(f"Temp: {temperature_f} F")

        if oxygen_saturation:
            vitals_parts.append(f"SpO2: {oxygen_saturation}%")

        if vitals_parts:
            vitals_text = ", ".join(vitals_parts)

    prompt = f"""
You are a clinical triage AI assistant for a rural healthcare setting.

Your job:
Analyze the patient's symptoms, history, and vitals using the retrieved clinical guideline excerpts.
Return a structured triage decision.

Important safety rules:
- You are not diagnosing.
- You are recommending an urgency tier for clinician review.
- If emergency red flags are present, choose EMERGENCY.
- If information is insufficient but concerning, choose URGENT with LOW or MEDIUM confidence.
- Do not invent guideline sources.
- Use only the retrieved guideline excerpts and patient presentation.

PATIENT PRESENTATION:
Name: {patient_data.get("patient_name")}
Age: {patient_data.get("patient_age")}
Gender: {patient_data.get("patient_gender")}
Chief Complaint: {patient_data.get("chief_complaint")}

Symptoms:
{symptoms_text}

Vitals:
{vitals_text}

Medical History:
{patient_data.get("medical_history") or "None reported"}

Current Medications:
{patient_data.get("current_medications") or "None reported"}

Allergies:
{patient_data.get("allergies") or "None reported"}

RETRIEVED CLINICAL GUIDELINES:
{evidence_text}

URGENCY TIERS:
- EMERGENCY: Life-threatening or possible life-threatening red flags. Immediate emergency evaluation.
- URGENT: Serious symptoms needing same-day clinician or specialist evaluation.
- ROUTINE: Non-urgent symptoms that can be managed with scheduled follow-up.

CONFIDENCE LEVELS:
- HIGH: Presentation clearly matches guideline criteria.
- MEDIUM: Some uncertainty but enough evidence supports the recommendation.
- LOW: Insufficient, conflicting, or atypical information.

Return valid JSON only.
Do not include markdown.
Do not include explanation outside JSON.

Use exactly this JSON structure:
{{
  "urgency_tier": "ROUTINE" | "URGENT" | "EMERGENCY",
  "urgency_score": <integer from 1 to 100>,
  "confidence_level": "LOW" | "MEDIUM" | "HIGH",
  "ai_reasoning": "<2 to 4 sentences explaining the triage decision using patient details and retrieved evidence>",
  "recommended_action": "<specific next step for care team>",
  "red_flags_identified": ["<red flag 1>", "<red flag 2>"],
  "guidelines_applied": ["<guideline source 1>", "<guideline source 2>"]
}}
"""

    return prompt


def parse_llm_json(raw_text: str) -> dict:
    """
    Parse Groq response into JSON.

    Includes cleanup in case the model wraps JSON in markdown.
    """

    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "")
        cleaned = cleaned.replace("```", "")
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:
        return {
            "urgency_tier": "URGENT",
            "urgency_score": 50,
            "confidence_level": "LOW",
            "ai_reasoning": (
                "The AI response could not be parsed into valid JSON. "
                "Manual clinician review is required."
            ),
            "recommended_action": "Route this case for immediate clinician review.",
            "red_flags_identified": [],
            "guidelines_applied": [],
        }


def validate_llm_result(result: dict) -> dict:
    """
    Normalize and validate the LLM result.

    This prevents invalid urgency tiers or scores from breaking the API.
    """

    allowed_tiers = {"ROUTINE", "URGENT", "EMERGENCY"}
    allowed_confidence = {"LOW", "MEDIUM", "HIGH"}

    urgency_tier = result.get("urgency_tier", "URGENT")
    confidence_level = result.get("confidence_level", "LOW")

    if urgency_tier not in allowed_tiers:
        urgency_tier = "URGENT"

    if confidence_level not in allowed_confidence:
        confidence_level = "LOW"

    try:
        urgency_score = int(result.get("urgency_score", 50))
    except (TypeError, ValueError):
        urgency_score = 50

    urgency_score = max(1, min(100, urgency_score))

    return {
        "urgency_tier": urgency_tier,
        "urgency_score": urgency_score,
        "confidence_level": confidence_level,
        "ai_reasoning": result.get(
            "ai_reasoning",
            "Clinician review is recommended based on the submitted intake data.",
        ),
        "recommended_action": result.get(
            "recommended_action",
            "Review this case with a qualified clinician.",
        ),
        "red_flags_identified": result.get("red_flags_identified", []),
        "guidelines_applied": result.get("guidelines_applied", []),
    }


def run_triage_llm(
    patient_data: dict,
    evidence_chunks: List[Tuple[str, str, float]],
) -> dict:
    """
    Run Groq LLM triage and return a validated structured decision.
    """

    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is missing from .env")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=1024,
        api_key=groq_api_key,
    )

    prompt = build_triage_prompt(
        patient_data=patient_data,
        evidence_chunks=evidence_chunks,
    )

    messages = [
        SystemMessage(
            content=(
                "You are a clinical triage assistant. "
                "Return valid JSON only. Do not include markdown."
            )
        ),
        HumanMessage(content=prompt),
    ]

    response = llm.invoke(messages)

    parsed = parse_llm_json(response.content)

    validated = validate_llm_result(parsed)

    return validated