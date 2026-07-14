from fastapi import APIRouter, HTTPException
from services.supabase_service import supabase

router = APIRouter(
    prefix="/audit",
    tags=["audit"]
)


@router.get("/{record_id}")
async def get_audit_log(record_id: str):
    """
    Get full audit history for one patient record.
    """

    try:
        result = (
            supabase
            .table("audit_log")
            .select("*")
            .eq("case_id", record_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "count": len(result.data),
            "audit_log": result.data
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch audit log: {str(error)}"
        )