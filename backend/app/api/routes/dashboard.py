# app/api/routes/dashboard.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import decode_access_token

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"]
)

security = HTTPBearer()

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found in token")

    return user_id

@router.get("/dashboard")
def get_dashboard(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "full_name": user.full_name,
        "email": user.email,
        "address": user.address,
        "phone": user.phone,
         "created_at": str(user.created_at) if user.created_at else None,  
        "updated_at": str(user.updated_at) if user.updated_at else None,
    }