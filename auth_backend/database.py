from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database configuration(Currently using local postgres 4 app)
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:ChangeIt123%21@localhost:5432/user_db"

#database engine to create connection to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#help to create session to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#base class for create tables in class
Base = declarative_base()

# Dependency to get db session for each request and close it after the request is done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
