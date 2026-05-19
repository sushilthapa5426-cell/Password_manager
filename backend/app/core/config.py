# app/core/config.py

from pydantic_settings import BaseSettings

# 👇 reads values from .env
class Settings(BaseSettings):

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ENCRYPTION_KEY: str

    class Config:
        env_file = ".env"

# 👇 create settings object
settings = Settings()