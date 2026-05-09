from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class appUser(Base):
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    password = Column(String)


class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    driver_name = Column(String, nullable=False)
    driver_contact = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=False)
    available_seats = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    travel_date = Column(String, nullable=False)
    travel_time = Column(String, nullable=False)
    pickup_point = Column(String, nullable=False)
    drop_point = Column(String, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)