from fastapi import APIRouter, HTTPException, Query
from services.rag_service import retrieve_clinical_evidence

router = APIRouter(
    prefix="/rag",
    tags=["rag"]
)


@router.get("/search")
async def search_guidelines(
    query: str = Query(..., min_length=3),
    k: int = Query(default=4, ge=1, le=10),
):
    """
    Search the clinical knowledge base using FAISS similarity search.
    """

    try:
        evidence = retrieve_clinical_evidence(query=query, k=k)

        return {
            "query": query,
            "count": len(evidence),
            "results": [
                {
                    "source": source,
                    "content": content,
                    "relevance_score": round(score, 4),
                }
                for source, content, score in evidence
            ],
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"RAG search failed: {str(error)}"
        )