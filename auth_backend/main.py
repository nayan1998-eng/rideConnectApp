import secrets
from auth_backend.auth import get_password_hash, verify_password
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import model, schema
from .database import SessionLocal, engine, get_db
from datetime import datetime, timedelta
from jose import JWTError, jwt

app = FastAPI()

# Generate a secure random secret key
SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256" 
TOKEN_EXPIRE_MINUTES = 30

def create_Token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/")
def root():
    return {"message": "Welcome to the Backend of RideConnect App!"}


@app.post("/register", response_model=schema.UserResponse)
def register_user(request: schema.RegisterRequest, db: Session = Depends(get_db())):
    user = db.query(model.appUser).filter((model.appUser.email == request.email) | (model.appUser.phone == request.phone)).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or phone already registered")
    
    # In production, use a proper hashing algorithm like bcrypt
    hashed_password = get_password_hash(request.password)
    new_user = model.appUser(
        name=request.name,
        email=request.email,
        phone=request.phone,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db())):
    user = db.query(model.appUser).filter(model.appUser.email == form_data.username).first()
    if not user or verify_password(form_data.password, user.password) == False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    token_data = {"sub": user.email}
    token = create_Token(token_data)
    return {"access_token": token, "token_type": "bearer"}


