import secrets
from datetime import datetime, timedelta

from auth import get_password_hash, verify_password
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

import model
import schema
from database import get_db


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "rideconnect_super_secret_key_for_testing"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30


def create_Token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.get("/")
def root():
    return {"message": "Welcome to the Backend of RideConnect App!"}


@app.post("/register", response_model=schema.UserResponse)
def register_user(request: schema.RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(model.appUser).filter(
        (model.appUser.email == request.email) |
        (model.appUser.phone == request.phone)
    ).first()

    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or phone already registered"
        )

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
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(model.appUser).filter(
        model.appUser.email == form_data.username
    ).first()

    if not user or verify_password(form_data.password, user.password) is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token_data = {"sub": user.email}
    token = create_Token(token_data)

    return {"access_token": token, "token_type": "bearer"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(model.appUser).filter(model.appUser.email == email).first()

    if user is None:
        raise credentials_exception

    return user


def is_ride_active(ride):
    ride_datetime_text = f"{ride.travel_date} {ride.travel_time}"

    try:
        ride_datetime = datetime.strptime(ride_datetime_text, "%Y-%m-%d %H:%M")
    except ValueError:
        return False

    expiry_time = ride_datetime + timedelta(hours=24)

    return datetime.now() <= expiry_time


@app.post("/rides", response_model=schema.RideResponse)
def create_ride(
    ride: schema.RideCreate,
    db: Session = Depends(get_db),
    current_user: model.appUser = Depends(get_current_user)
):
    new_ride = model.Ride(
        source=ride.source,
        destination=ride.destination,
        driver_name=ride.driver_name,
        driver_contact=ride.driver_contact,
        vehicle_type=ride.vehicle_type,
        available_seats=ride.available_seats,
        price=ride.price,
        travel_date=ride.travel_date,
        travel_time=ride.travel_time,
        pickup_point=ride.pickup_point,
        drop_point=ride.drop_point,
        created_by_user_id=current_user.id
    )

    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)

    return new_ride


@app.get("/rides", response_model=list[schema.RideResponse])
def get_rides(
    db: Session = Depends(get_db),
    current_user: model.appUser = Depends(get_current_user)
):
    rides = db.query(model.Ride).all()

    active_rides = []

    for ride in rides:
        if is_ride_active(ride):
            active_rides.append(ride)

    return active_rides


@app.get("/rides/search", response_model=list[schema.RideResponse])
def search_rides(
    source: str = "",
    destination: str = "",
    db: Session = Depends(get_db),
    current_user: model.appUser = Depends(get_current_user)
):
    query = db.query(model.Ride)

    if source:
        query = query.filter(model.Ride.source.ilike(f"%{source}%"))

    if destination:
        query = query.filter(model.Ride.destination.ilike(f"%{destination}%"))

    rides = query.all()

    active_rides = []

    for ride in rides:
        if is_ride_active(ride):
            active_rides.append(ride)

    return active_rides


@app.get("/rides/history", response_model=list[schema.RideResponse])
def get_ride_history(
    db: Session = Depends(get_db),
    current_user: model.appUser = Depends(get_current_user)
):
    rides = db.query(model.Ride).filter(
        model.Ride.created_by_user_id == current_user.id
    ).all()

    history_rides = []

    for ride in rides:
        if not is_ride_active(ride):
            history_rides.append(ride)

    return history_rides