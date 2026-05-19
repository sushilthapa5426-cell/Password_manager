from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import UserInformation
from app.core.security import decode_access_token, decrypt_password  #to read userid from token and decrypt the passwords
from app.schemas.user import UpdatePasswordSchema # to validate the data coming from React form of EditPassword



router = APIRouter(
    prefix="/api",
    tags=["MyPasswords"]
)

security = HTTPBearer() #reads Bearer token from request header
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



# Get the mypassword info from of the loggedin id

@router.get("/my-password")
def get_my_password(
    page: int=1,
    limit: int = 3,
        user_id: int = Depends(get_current_user_id),
        db: Session = Depends(get_db)
):
    #step1- count total passwords for this user
    total_passwords = db.query(UserInformation)\
          .filter(UserInformation.userid == user_id)\
              .count()
    
    #stp 2- calculate how many to skip or skip previous page
    skip = (page-1)*limit
    #page 1 -> skip=0, Page 2-> skip=3, page 3 -> skip=6
    
    # returns only logged-in user's passwords

    passwords = db.query(UserInformation)\
        .filter(UserInformation.userid == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # 👇 decrypt each password before sending to frontend
    result = []
    for p in passwords:
        result.append({
            "uuid": p.uuid,
            "application_name": p.application_name,
            "registered_email": p.registered_email,
            "registered_password": decrypt_password(p.registered_password),
            # 👆 "gAAAAABh..." → "Pass@1234"
        })
    # now fetch only current page items
    return{
        "passwords": result,
        "total":total_passwords,
        "page": page,
        "hasMore": (skip+limit)<total_passwords #tells frontend if more items exist
        #page 1: (0+3)<9 True -> show load More button
        #page 2: (3+3)<9 True-> show Load More
        #page 3: (6+3)<9 False -> hide Load More
    }

#Delete Function
@router.delete("/my-password/{uuid}") #uuid identifies which password to delete
def delete_password(
    uuid: str,                     #reads uuid from URL path
    user_id: int = Depends(get_current_user_id), #identifies who is logged in
    db: Session = Depends(get_db) #provides database session
):
    #step1- find the password by uuid
    password = db.query(UserInformation)\
        .filter(UserInformation.uuid == uuid, # it will check if the uuid belongs to the logged in user or not
            UserInformation.userid == user_id # it will check if the user_id belongs to the logged in user or not
            ).first()  
    #step2- if password not found or does not belong to user, raise error
    if not password:
        raise HTTPException(status_code=404, detail="Password not found or access denied")

    #step3- delete the password
    db.delete(password)
    db.commit()

    return {"detail": "Password deleted successfully"}

# ===== UPDATE =====


@router.put("/my-password/{uuid}") #uuid identifies which password to update
def update_password(
    uuid: str,                      #reads uuid from URL path
    data: UpdatePasswordSchema, #reads new password data from request body defined in models.py
    user_id: int = Depends(get_current_user_id), #identifies who is logged in
    db: Session = Depends(get_db) #provides database session
):
    #step1- find the password by uuid
    password = db.query(UserInformation)\
        .filter(UserInformation.uuid == uuid, # it will check if the uuid belongs to the logged in user or not
            UserInformation.userid == user_id # it will check if the user_id belongs to the logged in user or not
            ).first()
    #step2- if password not found or does not belong to user, raise error
    if not password:
        raise HTTPException(status_code=404, detail="Password not found or access denied")
    
    #step3- update the password fields where password.field store the changed value 
    password.application_name = data.application_name #it brings the new application name from request body and updates the existing one
    password.registered_email = data.registered_email #it brings the new registered email from request body and updates the existing one
    password.registered_password = data.registered_password #it brings the new registered password from request body and updates the existing one  

    db.commit() #saves the changes to database

    return{"message": "Password updated successfully"}


