from fastapi import APIRouter, HTTPException

from models.schema import TriageRequest, TriageResponse
from services.triage_service import run_triage_pipeline


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