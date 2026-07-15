from fastapi import APIRouter, HTTPException

from models.schema import TriageRequest, TriageResponse
from services.triage_service import run_triage_pipeline
from services.supabase_service import supabase


router = APIRouter(
    prefix="/triage",
    tags=["triage"],
)


@router.post("/", response_model=TriageResponse)
async def submit_triage(request: TriageRequest):
    """
    Submit patient intake data and receive an AI-assisted triage result.

    Pipeline:
    - Build RAG query
    - Retrieve clinical guideline evidence from FAISS
    - Send patient data + evidence to Groq LLM
    - Save record to Supabase
    - Save audit log
    - Return structured triage response
    """

    try:
        result = await run_triage_pipeline(request)
        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Triage pipeline error: {str(error)}",
        )
    
@router.get("/result/{record_id}")
async def get_public_triage_result(record_id: str):
    try:
        result = (
            supabase
            .table("records")
            .select(
                "id, created_at, patient_name, urgency_tier, urgency_score, "
                "confidence_level, ai_reasoning, recommended_action, "
                "retrieved_evidence, status, symptoms"
            )
            .eq("id", record_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Triage result not found",
            )

        return {
            "record": result.data,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch triage result: {str(error)}",
        )