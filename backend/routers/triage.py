from fastapi import APIRouter, HTTPException
from models.schema import TriageRequest, TriageResponse
from services.triage_service import run_temporary_triage_pipeline

router = APIRouter(
    prefix="/triage",
    tags=["triage"]
)


@router.post("/", response_model=TriageResponse)
async def submit_triage(request: TriageRequest):
    """
    Submit patient intake data and receive a triage result.

    Current version:
    - Validates request body
    - Runs temporary rule-based triage
    - Saves case to Supabase
    - Writes audit log
    - Returns structured response

    Later version:
    - Adds RAG
    - Adds Groq LLM
    - Adds retrieved medical guideline evidence
    """

    try:
        result = await run_temporary_triage_pipeline(request)
        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Triage pipeline error: {str(error)}"
        )