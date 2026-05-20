from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import UserInformation,UserHistory
from app.core.security import decode_access_token, decrypt_password, encrypt_password  #to read userid from token and decrypt the passwords
from app.schemas.user import UpdatePasswordSchema # to validate the data coming from React form of EditPassword
import uuid as uuid_lib  #  generates unique id for history record


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
        try:
            decrypted = decrypt_password(p.registered_password)
        except Exception:
            decrypted = "cannot decrypt"
        result.append({
            "uuid": p.uuid,
            "application_name": p.application_name,
            "registered_email": p.registered_email,
            "registered_password": decrypted,
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
   # Step 2 — save OLD data to user_history BEFORE updating
    # this is the key step — copy current data to history first
    history = UserHistory(
        history_uuid=str(uuid_lib.uuid4()),
        # 👆 fresh unique id for this history record
        # every update creates a new history record

        ref_uuid=password.uuid,
        # 👆 points to user_information.uuid
        # links history to original entry
        # e.g "abc-123" = Netflix entry was updated

        application_name=password.application_name,
        # 👆 OLD name — saved BEFORE we change it
        # e.g "Netflix"

        registered_email=password.registered_email,
        # 👆 OLD email — saved BEFORE we change it

        registered_password=password.registered_password,
        # 👆 OLD encrypted password — saved BEFORE we change it
        # still encrypted — decrypted when fetching history

        userid=user_id,
        # 👆 which user owns this history record
    )
    db.add(history)
    # 👆 prepares INSERT into user_history table
    # not saved yet — saved together with update below

    # Step 3 — now update user_information with NEW data
    password.application_name = data.application_name
    # 👆 "Netflix" → "Netflix Premium"

    password.registered_email = data.registered_email
    # 👆 new email from edit form

    password.registered_password = encrypt_password(data.registered_password)
    # 👆 encrypt new password before saving
    # "NewPass@1234" → "gAAAAABh..."
    # NEVER store plain text

    # Step 4 — save BOTH at same time
    db.commit()
    # 👆 one commit does two things:
    # 1. INSERT old data into user_history
    # 2. UPDATE user_information with new data

    return{"message": "Password updated successfully"}


