# app/core/security.py

import bcrypt 
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from cryptography.fernet import Fernet #


# 👇 convert plain password → hashed password
def hash_password(password: str)-> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


# 👇 verify password during login
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# 👇 create JWT token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    token = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token

# ================= DECODE JWT TOKEN =================
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except Exception:
        return None
    
def encrypt_password(plain_password: str) -> str:
     f = Fernet(settings.ENCRYPTION_KEY.encode())
     # 👆 creates Fernet object using your secret key from .env

     encrypted = f.encrypt(plain_password.encode("utf-8"))
     # 👆 encrypts password
     # "Pass@1234" → b"gAAAAABh..."

     return encrypted.decode("utf-8")
     # 👆 converts bytes → string for storing in database

def decrypt_password(encrypted_password: str) -> str:
    f = Fernet(settings.ENCRYPTION_KEY.encode())
    # 👆 same key used to encrypt — must match

    decrypted = f.decrypt(encrypted_password.encode("utf-8"))
    # 👆 decrypts back to original
    # "gAAAAABh..." → b"Pass@1234"

    return decrypted.decode("utf-8")
    # 👆 converts bytes → string
    # returns "Pass@1234"

