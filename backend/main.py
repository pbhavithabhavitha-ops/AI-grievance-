import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from seed_data import seed_db_if_empty
from routes import grievances, dashboard

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Seed initial demo data if database is empty
db = SessionLocal()
try:
    seed_db_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title="JanSeva AI - Multilingual Public Grievance Resolution API",
    description="Backend API for AI-based grievance classification, routing, and tracking.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grievances.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "JanSeva AI Platform Backend API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
