from fastapi import Header, HTTPException
from services.supabase_service import supabase


async def require_specialist(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header",
        )

    token = authorization.replace("Bearer ", "").strip()

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid user token",
            )

        role_response = (
            supabase
            .table("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single()
            .execute()
        )

        if not role_response.data:
            raise HTTPException(
                status_code=403,
                detail="User role not found",
            )

        if role_response.data["role"] != "specialist":
            raise HTTPException(
                status_code=403,
                detail="Specialist access required",
            )

        return user

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(error)}",
        )