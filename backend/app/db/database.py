# app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 👇 create MySQL connection
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

# 👇 creates DB sessions, a session is like temperorary conversation with database
# it handles queris insert, update,commits and rollback and so on
SessionLocal = sessionmaker(
    bind=engine,                # thConnectis session to MySQL engine.
    autoflush=False,            # Do NOT automatically push changes to DB.
    autocommit=False            # Do NOT auto-save every query.
)

# 👇 base class for models
Base = declarative_base()        #This creates the parent class for all models. for eg for all class User(Base):

# 👇 dependency injection for DB. Creates a DB session for each request
def get_db():

    db = SessionLocal()     # Creates new database session.

    try:
        yield db              #Temporarily gives session to route/service.

    finally:
        db.close()          # Closes DB connection after request finishes.