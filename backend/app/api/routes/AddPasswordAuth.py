from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import AddPasswordSchema
from app.services.user_service import save_user_information 
from app.core.security import decode_access_token, encrypt_password  #to read userid from token #for encryption and decryption of passwords

router = APIRouter(
    prefix="/api",
    tags=["Passwords"]
)

security = HTTPBearer() #reads Bearer token from request header 

#helper function- extracts logged-in users is from JWT token
def get_current_user_id(
        credentials: HTTPAuthorizationCredentials = Depends(security)
):
    #get token string from "Authorization: Bearer <token>"
    token = credentials.credentials 

    #decode the token to get payload
    payload = decode_access_token(token)

    #if token is invalid or expired
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    #extract user_id that was stored during login
    user_id=payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found in token")
    
    #returns e.g 1,2,3 depending on who is logged in
    return user_id 


# POST /api/add-password --saves password entry for logged-in user
@router.post("/add-password")
def add_password(
    data: AddPasswordSchema,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
    ):
   # 👇 encrypt password before saving
    encrypted = encrypt_password(data.registered_password)
    # "Pass@1234" → "gAAAAABh..."

    data.registered_password = encrypted
    # 👆 replace plain text with encrypted version

    entry = save_user_information(db, data, user_id)
    # 👆 saves encrypted password to database

    return {"message": "Password saved successfully"}


