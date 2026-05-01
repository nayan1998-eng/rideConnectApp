from pydantic import BaseModel

#JSON request → RegisterRequest → validation → DB insert → User object → UserResponse → JSON response
#This defines input for register API
class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str

#JSON request → LoginRequest → validation → DB fetch → manual response
#Input for login API
class LoginRequest(BaseModel):
    name: str
    password: str

#This defines output format
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

#Read data directly from object attributes instead of dict
class Config:
    orm_mode = True 

