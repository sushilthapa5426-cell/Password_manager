# app/services/user_service.py

from sqlalchemy.orm import Session
from app.db.models import User, UserInformation
from app.schemas.user import RegisterUser, AddPasswordSchema
from app.core.security import hash_password, verify_password
import uuid

def create_user(db: Session, user: RegisterUser):
    existing = db.query(User).filter(User.email == user.email).first() 
    if existing:
        return None

    new_user = User(
        full_name=user.fullName,
        email=user.email,
        password_hash=hash_password(user.password),
        address=user.address,
        phone=user.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def save_user_information(db: Session, data: AddPasswordSchema, user_id: int):
    entry = UserInformation(
        uuid=str(uuid.uuid4()),
        application_name=data.application_name,
        registered_email=data.registered_email,
        registered_password=data.registered_password,
        userid=user_id
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry