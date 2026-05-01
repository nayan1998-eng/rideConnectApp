#This script creates the database tables
#This should be run once to create the tables in the database before running the main application

from database import engine, Base
from model import User

# Create the tables in the database
Base.metadata.create_all(bind=engine)