from datetime import datetime, timezone
from models.schema import (
    TriageRequest,
    TriageResponse,
    EvidenceChunk,
    UrgencyTier,
    ConfidenceLevel,
)
from services.supabase_service import supabase
from services.llm_services import run_triage_llm
from services.rag_service import retrieve_clinical_evidence

def build_rag_query(request: TriageRequest) -> str:
    """
    Build a search query from the patient presentation.
    This query is used to retrieve relevant guideline chunks from FAISS.
    """

    symptom_parts = []

    for symptom in request.symptoms:
        symptom_parts.append(
            f"{symptom.symptom} severity {symptom.severity} "
            f"duration {symptom.duration} onset {symptom.onset}"
        )

    vitals_parts = []

    if request.vitals:
        if request.vitals.blood_pressure_systolic:
            vitals_parts.append(
                f"blood pressure {request.vitals.blood_pressure_systolic}/"
                f"{request.vitals.blood_pressure_diastolic or '?'}"
            )

        if request.vitals.heart_rate:
            vitals_parts.append(f"heart rate {request.vitals.heart_rate}")

        if request.vitals.temperature_f:
            vitals_parts.append(f"temperature {request.vitals.temperature_f} Fahrenheit")

        if request.vitals.oxygen_saturation:
            vitals_parts.append(f"oxygen saturation {request.vitals.oxygen_saturation}")

    query = f"""
Chief complaint: {request.chief_complaint}
Symptoms: {"; ".join(symptom_parts)}
Vitals: {"; ".join(vitals_parts)}
Age: {request.patient_age}
Medical history: {request.medical_history or "none"}
""".strip()

    return query


async def run_triage_pipeline(request: TriageRequest) -> TriageResponse:
    """
    Full AI triage pipeline:
    1. Build RAG query
    2. Retrieve clinical evidence from FAISS
    3. Send patient data + evidence to Groq LLM
    4. Save result to records table
    5. Save audit log
    6. Return triage response
    """

    rag_query = build_rag_query(request)

    evidence_chunks = retrieve_clinical_evidence(
        query=rag_query,
        k=4,
    )

    patient_data = request.model_dump()

    llm_result = run_triage_llm(
        patient_data=patient_data,
        evidence_chunks=evidence_chunks,
    )

    evidence_list = []

    for source, content, score in evidence_chunks:
        evidence_list.append(
            {
                "source": source,
                "content": content,
                "relevance_score": round(float(score), 4),
            }
        )

    case_data = {
        "patient_name": request.patient_name,
        "patient_age": request.patient_age,
        "patient_gender": request.patient_gender,
        "chief_complaint": request.chief_complaint,
        "symptoms": [
            symptom.model_dump()
            for symptom in request.symptoms
        ],
        "vitals": request.vitals.model_dump() if request.vitals else None,
        "medical_history": request.medical_history,
        "current_medications": request.current_medications,
        "allergies": request.allergies,
        "urgency_tier": llm_result["urgency_tier"],
        "urgency_score": llm_result["urgency_score"],
        "confidence_level": llm_result["confidence_level"],
        "ai_reasoning": llm_result["ai_reasoning"],
        "recommended_action": llm_result["recommended_action"],
        "retrieved_evidence": evidence_list,
        "status": "PENDING",
    }

    case_result = (
        supabase
        .table("records")
        .insert(case_data)
        .execute()
    )

    if not case_result.data:
        raise RuntimeError("Failed to insert record into Supabase.")

    record_id = case_result.data[0]["id"]

    audit_data = {
        "case_id": record_id,
        "action": "AI_TRIAGE",
        "details": {
            "pipeline_stage": "rag_groq_triage",
            "rag_query": rag_query,
            "retrieved_chunks_count": len(evidence_chunks),
            "retrieved_evidence": evidence_list,
            "llm_model": "llama3-70b-8192",
            "llm_result": llm_result,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }

    supabase.table("audit_log").insert(audit_data).execute()

    return TriageResponse(
        case_id=record_id,
        urgency_tier=llm_result["urgency_tier"],
        urgency_score=llm_result["urgency_score"],
        confidence_level=llm_result["confidence_level"],
        ai_reasoning=llm_result["ai_reasoning"],
        recommended_action=llm_result["recommended_action"],
        retrieved_evidence=[
            EvidenceChunk(**item)
            for item in evidence_list
        ],
    )