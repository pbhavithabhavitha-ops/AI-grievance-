import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

db_dir = os.path.dirname(os.path.abspath(__file__))
default_db_path = os.path.join(db_dir, "janseva.db")

if os.environ.get("VERCEL") or not os.access(db_dir, os.W_OK):
    tmp_db_path = "/tmp/janseva.db"
    if not os.path.exists(tmp_db_path) and os.path.exists(default_db_path):
        import shutil
        shutil.copy2(default_db_path, tmp_db_path)
    DB_PATH = tmp_db_path
else:
    DB_PATH = os.environ.get("DB_PATH", default_db_path)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
