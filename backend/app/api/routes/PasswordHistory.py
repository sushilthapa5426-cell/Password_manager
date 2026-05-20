# app/api/routes/PasswordHistory.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
# 👆 gives us database connection for each request

from app.db.models import UserHistory
# 👆 UserHistory model maps to user_history table in MySQL

from app.core.security import decode_access_token, decrypt_password
# 👆 decode_access_token — reads user_id from JWT token
# 👆 decrypt_password    — converts encrypted password back to plain text
import uuid as uuid_lib  #  generates unique id for history record


router = APIRouter(
    prefix="/api",
    # 👆 all routes in this file start with /api
    # e.g /api/password-history

    tags=["PasswordHistory"]
    # 👆 groups routes in /docs page
)

security = HTTPBearer()
# 👆 tells FastAPI to read Authorization header
# reads: "Bearer eyJhbGciOiJIUzI1NiJ9..."


# ================= HELPER FUNCTION =================
# this runs before every route to verify who is logged in

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
    # 👆 FastAPI automatically reads Authorization header
    # and passes it here as credentials
):
    # Step 1 — extract token string from header
    token = credentials.credentials
    # token = "eyJhbGciOiJIUzI1NiJ9..."
    # this is the JWT token saved in localStorage after login

    # Step 2 — decode token to get payload
    payload = decode_access_token(token)
    # payload = {"user_id": 1, "exp": 1234567890}
    # if token is invalid or expired → returns None

    # Step 3 — check if token is valid
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    # 👆 stops here if token is bad
    # returns 401 to frontend
    # api.js interceptor catches 401 → redirects to login

    # Step 4 — extract user_id from payload
    user_id = payload.get("user_id")
    # user_id = 1

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User not found in token"
        )

    return user_id
    # 👆 passes user_id to the route function
    # route knows who is making the request


# ================= GET PASSWORD HISTORY =================

@router.get("/password-history")
# 👆 handles: GET /api/password-history
# called from PasswordHistory.jsx when page loads
# also called when user clicks page number button

def get_password_history(
    page: int = 1,
    # 👆 reads ?page=1 from URL
    # default = 1 if not provided

    limit: int = 3,
    # 👆 reads &limit=3 from URL
    # how many history records per page

    user_id: int = Depends(get_current_user_id),
    # 👆 runs get_current_user_id first
    # gets user_id from token
    # only this user's history is returned

    db: Session = Depends(get_db)
    # 👆 opens database connection
    # automatically closes after request finishes
):

    # ===== STEP 1 — Count total history records =====
    total = db.query(UserHistory)\
        .filter(UserHistory.userid == user_id)\
        .count()
    # SQL: SELECT COUNT(*) FROM user_history WHERE userid = 1
    # e.g total = 9
    # needed to calculate total pages and hasMore


    # ===== STEP 2 — Calculate how many records to skip =====
    skip = (page - 1) * limit
    # Page 1: skip = (1-1)*3 = 0  → start from beginning
    # Page 2: skip = (2-1)*3 = 3  → skip first 3 records
    # Page 3: skip = (3-1)*3 = 6  → skip first 6 records


    # ===== STEP 3 — Fetch only current page records =====
    history_records = db.query(UserHistory)\
        .filter(UserHistory.userid == user_id)\
            .order_by(UserHistory.updated_at.desc())\
                .offset(skip)\
                    .limit(limit)\
                        .all()
         

    # SQL: SELECT * FROM user_history
    #      WHERE userid = 1
    #      ORDER BY updated_at DESC
    #      OFFSET 0 LIMIT 3


    # ===== STEP 4 — Build response with decrypted passwords =====
    result = []
    # 👆 starts as empty list
    # we build it by looping through each history record

    for h in history_records:
    # h = one row from user_history table
    # {history_uuid, ref_uuid, application_name,
    #  registered_email, registered_password, userid, updated_at}

        result.append({
            "history_uuid": h.history_uuid,
            # 👆 unique id for this history record
            # used as key in React .map()

            "ref_uuid": h.ref_uuid,
            # 👆 which user_information entry was updated
            # "abc-123" = Netflix entry was updated

            "application_name": h.application_name,
            # 👆 OLD application name before update
            # e.g "Netflix" (before user changed to "Netflix Premium")

            "registered_email": h.registered_email,
            # 👆 OLD email before update

            "registered_password": decrypt_password(h.registered_password),
            # 👆 h.registered_password = "gAAAAABh..." (encrypted)
            # decrypt_password() converts it back to "Pass@1234"
            # so frontend can show the real password

            "updated_at": str(h.updated_at),
            # 👆 when this update happened
            # "2026-05-07 15:56:45"
            # str() converts datetime object to string
            # frontend formats it nicely with new Date()
        })


    # ===== STEP 5 — Return response to frontend =====
    return {
        "history": result,
        #  list of history records with decrypted passwords

        "total": total,
        #  total count e.g 9
        # frontend uses this to calculate total pages

        "page": page,
        #  current page number e.g 1

        "hasMore": (skip + limit) < total
        #  tells frontend if more pages exist
        # Page 1: (0+3) < 9 → True  → more pages exist
        # Page 3: (6+3) < 9 → False → no more pages
    }