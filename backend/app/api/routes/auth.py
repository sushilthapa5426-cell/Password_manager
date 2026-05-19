# app/api/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# these are used for the security purpose while fetching the data
from fastapi.security import(HTTPBearer, HTTPAuthorizationCredentials)

from app.db.database import get_db #from database.py it serves database connection/DB session and automatioc closing

# bring the validation rules for register and login from app/schemas/user.py
from app.schemas.user import (
    RegisterUser,
    LoginUser
)

#import the logic function sush as insert, delete and others
from app.services.user_service import (
    create_user,
    authenticate_user
)

#security logic such as jwt token, password hashing and others 
from app.core.security import (create_access_token, decode_access_token)

# create route group and all routes starts with /api for e.g @router.post("/login") becomes/api/login
router = APIRouter(
    prefix="/api", 
    tags=["Authentication"]
)

# security = HTTPBearer() is a FastAPI security utility used for handling JWT/Bearer token authentication in APIs.
security = HTTPBearer()

from app.db.models import User

#  REGISTER 
@router.post("/register") #creates POST endpoint e.g POST/api/register
def register(
    user: RegisterUser,  #reades JSON body, validates using schema, converts into python object
    db: Session = Depends(get_db) 
):

    # 👇 create user
    new_user = create_user(db, user)

    # 👇 if email exists
    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User registered successfully"
    }


# ================= LOGIN =================
@router.post("/login")
def login(
    user: LoginUser,
    db: Session = Depends(get_db)
):

    # 👇 authenticate user
    db_user = authenticate_user(
        db,
        user.email,
        user.password
    )

    # 👇 invalid credentials
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # 👇 generate JWT token
    token = create_access_token({
        "user_id": db_user.id
    })

    return {
        "token": token,

        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "fullName": db_user.full_name
        }
    }




