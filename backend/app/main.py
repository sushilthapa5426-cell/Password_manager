# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.dashboard import router as dashboard_router
from app.db.database import Base, engine
from app.api.routes.auth import router as auth_router
from app.api.routes.AddPasswordAuth import router as Addpassword
from app.api.routes.MyPassword import router as mypassword_router

# 👇 create tables automatically
Base.metadata.create_all(bind=engine)

# 👇 create FastAPI app
app = FastAPI()

# 👇 allow React frontend
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,  #allow cookies, auth headers and JWT auth headers 

    allow_methods=["*"],     # allow get, post and others method 
 
    allow_headers=["*"],     # allow all request headers 
)

# 👇 register routes which adds all routes from auth.py, without this routs donot work and you only get 404 not found error
app.include_router(auth_router)
app.include_router(Addpassword)
app.include_router(dashboard_router)
app.include_router(mypassword_router)

# ================= TEST ROUTE =================
@app.get("/")
def home():

    return {
        "message": "Backend running successfully"
    }