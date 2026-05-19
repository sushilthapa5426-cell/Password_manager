# app/db/models.py it helps to map the mysql tables 
# this file contain database models. a model represent a table, columns, relationship and constraints 

from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

# 👇 users table model
class User(Base):               # Every model must inherit from Base.

    __tablename__ = "users"

    # 👇 primary key
    id = Column(Integer, primary_key=True, index=True)

    # 👇 user email
    email = Column(String(255), unique=True, nullable=False)

    # 👇 hashed password
    password_hash = Column(String(255), nullable=False)

    # 👇 additional fields
    full_name = Column(String(255), nullable=False)
    address = Column(String(255))
    phone = Column(String(20), unique=True)

    # 👇 timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())

class UserInformation(Base):
    __tablename__ = "user_information"

    #primary key as string UUID
    uuid = Column(String(36), primary_key=True)

    #application name e.g "Netflix", "Github"
    application_name = Column(String(255), nullable=False)

    #email used in that application 
    registered_email = Column(String(255), nullable=False)

    #password of that application (stored in hashed)
    registered_password = Column(String(255), nullable=False)

    #forigen key -links to users.id to know which user owns this
    userid = Column (Integer, ForeignKey("users.id"), nullable= False)


