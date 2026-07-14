import os
import sys
from pathlib import Path

# Allow script to import backend services
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BACKEND_DIR))

from services.rag_service import build_faiss_index


KB_PATH = BACKEND_DIR / "data" / "knowledge_base"
KB_PATH.mkdir(parents=True, exist_ok=True)


sample_docs = {
    "chest_pain_guidelines.txt": """
CHEST PAIN CLINICAL GUIDELINES

EMERGENCY RED FLAGS:
- Crushing or pressure-like chest pain radiating to arm, jaw, or back
- Chest pain associated with sweating, nausea, or shortness of breath
- Sudden onset severe chest pain
- Chest pain with fainting, near-fainting, or confusion
- Oxygen saturation below 90 percent with chest pain

URGENT EVALUATION:
- Chest pain lasting more than 20 minutes without a clear muscle-related cause
- New exertional chest pain
- Chest pain in a patient with known heart disease, diabetes, or hypertension
- Chest pain with fever or productive cough

ROUTINE MANAGEMENT:
- Reproducible chest wall pain
- Chest discomfort clearly related to reflux
- Anxiety-related chest tightness in a stable patient
""",

    "stroke_guidelines.txt": """
STROKE RECOGNITION AND RESPONSE

EMERGENCY RED FLAGS:
Use FAST screening:
- Face drooping or asymmetric smile
- Arm weakness, especially one-sided weakness
- Speech difficulty, slurred speech, or trouble speaking
- Time to call emergency services immediately

Additional warning signs:
- Sudden severe headache
- Sudden vision loss
- Sudden confusion
- Sudden loss of balance or coordination
- Sudden numbness or weakness in face, arm, or leg, especially on one side

Any suspected stroke symptoms require immediate emergency evaluation.
""",

    "respiratory_distress_guidelines.txt": """
RESPIRATORY DISTRESS TRIAGE GUIDELINES

EMERGENCY INDICATORS:
- Oxygen saturation below 90 percent on room air
- Severe shortness of breath
- Inability to speak in full sentences
- Blue lips or fingertips
- Stridor or high-pitched breathing
- Altered mental status with breathing symptoms
- Severe wheezing not improving with usual treatment

URGENT EVALUATION:
- Oxygen saturation between 90 and 94 percent
- Productive cough with fever above 101 degrees Fahrenheit
- Asthma or COPD symptoms not responding to usual treatment
- Coughing blood
- Moderate breathing difficulty

ROUTINE:
- Mild upper respiratory symptoms without fever
- Stable chronic cough without acute worsening
- Allergic symptoms without breathing compromise
""",

    "abdominal_pain_guidelines.txt": """
ABDOMINAL PAIN TRIAGE GUIDELINES

EMERGENCY RED FLAGS:
- Severe abdominal pain with rigid abdomen
- Abdominal pain with low blood pressure or signs of shock
- Severe right lower abdominal pain with fever and rebound tenderness
- Abdominal pain with bloody diarrhea and fever
- Lower abdominal pain with possible pregnancy concern

URGENT EVALUATION:
- Acute abdominal pain lasting more than 6 hours
- Vomiting with inability to keep fluids down
- Right upper abdominal pain
- Flank pain radiating to groin
- Abdominal pain with urinary symptoms and fever

ROUTINE:
- Chronic intermittent abdominal discomfort with stable pattern
- Known IBS-type symptoms with typical flare
- Constipation without fever, vomiting, or severe pain
""",

    "fever_infection_guidelines.txt": """
FEVER AND INFECTION TRIAGE GUIDELINES

EMERGENCY RED FLAGS:
- Fever with confusion or altered mental status
- Fever with stiff neck
- Fever with difficulty breathing
- Fever with widespread purple rash
- Signs of sepsis such as low blood pressure, rapid heart rate, confusion, or severe weakness

URGENT EVALUATION:
- Fever above 101 degrees Fahrenheit with worsening symptoms
- Fever lasting more than 3 days
- Fever with localized severe pain
- Fever in elderly, immunocompromised, or high-risk patients
- Suspected wound infection with spreading redness

ROUTINE:
- Mild fever with stable symptoms
- Common cold symptoms without breathing difficulty
- Mild sore throat without red flags
"""
}


print("Creating sample clinical knowledge base documents...")

for filename, content in sample_docs.items():
    file_path = KB_PATH / filename
    file_path.write_text(content.strip(), encoding="utf-8")
    print(f"Created: {file_path}")

print("\nBuilding FAISS index...")
build_faiss_index()

print("\nKnowledge base index built successfully.")