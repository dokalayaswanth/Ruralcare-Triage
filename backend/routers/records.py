from fastapi import APIRouter, HTTPException
from services.supabase_service import supabase
from datetime import datetime, timezone
from models.schema import CaseOverrideRequest

# Create router for all /cases endpoints
router = APIRouter(
    prefix="/records",
    tags=["records"]
)


@router.get("/")
async def list_cases():
    try:
        result = (
            supabase
            .table("records")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "count": len(result.data),
            "cases": result.data
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch cases: {str(error)}"
        )
    

@router.get("/{record_id}")
async def get_record(record_id: str):
    try:
        result = (
            supabase.
            table("records")
            .select("*")
            .eq("id", record_id)
            .single()
            .execute()
        )
        return {
            "recorfd": result.data
        }
    except Exception as error:
        raise HTTPException(
            status_code = 500,
            detail=f"Failed to fetch records: {str(error)}"
        )


@router.patch("/{record_id}/override")
async def override_case(record_id: str, override: CaseOverrideRequest):
    """
    Clinician overrides the AI triage decision.

    Example:
    AI says URGENT, clinician changes to EMERGENCY with reason.
    """

    try:
        update_data = {
            "override_tier": override.override_tier.value,
            "override_reason": override.override_reason,
            "override_at": datetime.now(timezone.utc).isoformat(),
            "status": "OVERRIDDEN"
        }

        result = (
            supabase
            .table("records")
            .update(update_data)
            .eq("id", record_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Record not found or override failed"
            )

        audit_data = {
            "case_id": record_id,
            "action": "OVERRIDE",
            "details": {
                "override_tier": override.override_tier.value,
                "override_reason": override.override_reason,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

        supabase.table("audit_log").insert(audit_data).execute()

        return {
            "message": "Record overridden successfully",
            "record": result.data[0]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to override record: {str(error)}"
        )


@router.patch("/{record_id}/resolve")
async def resolve_case(record_id: str):
    """
    Mark a patient record as resolved.
    """

    try:
        update_data = {
            "status": "RESOLVED"
        }

        result = (
            supabase
            .table("records")
            .update(update_data)
            .eq("id", record_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Record not found or resolve failed"
            )

        audit_data = {
            "case_id": record_id,
            "action": "RESOLVE",
            "details": {
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

        supabase.table("audit_log").insert(audit_data).execute()

        return {
            "message": "Record resolved successfully",
            "record": result.data[0]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to resolve record: {str(error)}"
        )