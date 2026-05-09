from pydantic import BaseModel, ConfigDict


class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

    model_config = ConfigDict(from_attributes=True)


class RideCreate(BaseModel):
    source: str
    destination: str
    driver_name: str
    driver_contact: str
    vehicle_type: str
    available_seats: int
    price: float
    travel_date: str
    travel_time: str
    pickup_point: str
    drop_point: str


class RideResponse(BaseModel):
    id: int
    source: str
    destination: str
    driver_name: str
    driver_contact: str
    vehicle_type: str
    available_seats: int
    price: float
    travel_date: str
    travel_time: str
    pickup_point: str
    drop_point: str
    created_by_user_id: int

    model_config = ConfigDict(from_attributes=True)