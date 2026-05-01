from sqlalchemy import Column, Integer, String
from database import Base

class appUser(Base):
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone= Column(String, unique=True, index=True)
    password = Column(String)