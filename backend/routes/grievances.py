import datetime
import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from database import get_db
from models import Grievance, StatusHistory, Officer
from schemas import (
    AnalyzeRequest, AIAnalysisResponse, GrievanceCreate,
    GrievanceResponse, StatusUpdate, DuplicateCheckResult, FeedbackSubmit,
    LoginRequest, LoginResponse, OfficerCreate, OfficerResponse
)
from services.ai_service import analyze_grievance
from services.duplicate_service import check_duplicate_grievance

router = APIRouter(prefix="/api", tags=["Grievances"])

def generate_ticket_id(db: Session) -> str:
    year = datetime.datetime.now().year
    count = db.query(Grievance).count() + 1
    ticket_id = f"GRV-{year}-{count + 124:05d}"
    return ticket_id

# --- AUTH & OFFICER MANAGEMENT ---

@router.post("/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest):
    if payload.username.strip().lower() == "admin" and payload.password == "admin123":
        return LoginResponse(
            success=True,
            token="janseva-admin-token-2026-hackathon",
            message="Admin authentication successful.",
            username="admin"
        )
    raise HTTPException(status_code=401, detail="Invalid admin username or password. (Use 'admin' / 'admin123')")

@router.post("/officers", response_model=OfficerResponse)
def create_officer(payload: OfficerCreate, db: Session = Depends(get_db)):
    existing = db.query(Officer).filter(Officer.username == payload.username.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '{payload.username}' is already registered.")

    new_officer = Officer(
        name=payload.name,
        username=payload.username.strip().lower(),
        role=payload.role or "Ward Officer",
        state=payload.state,
        city=payload.city,
        ward=payload.ward
    )
    db.add(new_officer)
    db.commit()
    db.refresh(new_officer)
    return new_officer

@router.get("/officers", response_model=List[OfficerResponse])
def list_officers(db: Session = Depends(get_db)):
    return db.query(Officer).order_by(Officer.created_at.desc()).all()


# --- GRIEVANCE RESOLUTION ENDPOINTS ---

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_grievance_endpoint(req: AnalyzeRequest, db: Session = Depends(get_db)):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Grievance text cannot be empty.")
    
    ai_result = await analyze_grievance(req.text, req.language, req.category)
    dup_res = check_duplicate_grievance(req.text, ai_result["translation"], db)
    
    return AIAnalysisResponse(
        language=ai_result["language"],
        translation=ai_result["translation"],
        category=ai_result["category"],
        priority=ai_result["priority"],
        department=ai_result["department"],
        summary=ai_result["summary"],
        suggested_action=ai_result["suggested_action"],
        duplicate=DuplicateCheckResult(**dup_res)
    )

@router.post("/grievances", response_model=GrievanceResponse)
async def create_grievance(payload: GrievanceCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)

    new_grievance = Grievance(
        ticket_id=ticket_id,
        original_text=payload.original_text,
        language=payload.language,
        translation=payload.translation,
        category=payload.category,
        priority=payload.priority,
        department=payload.department,
        state=payload.state or "Telangana",
        city=payload.city or "Hyderabad",
        area=payload.area or "Central Zone",
        ward=payload.ward or "Ward 12 - Central",
        landmark=payload.landmark or "",
        latitude=payload.latitude or "17.3850",
        longitude=payload.longitude or "78.4867",
        summary=payload.summary,
        suggested_action=payload.suggested_action,
        status="Submitted"
    )

    db.add(new_grievance)
    db.commit()
    db.refresh(new_grievance)

    hist = StatusHistory(
        grievance_id=new_grievance.id,
        status="Submitted",
        comment="Grievance registered successfully via JanSeva AI platform."
    )
    db.add(hist)

    hist_route = StatusHistory(
        grievance_id=new_grievance.id,
        status="Assigned",
        comment=f"AI system classified as '{payload.category}' and routed to {payload.department}."
    )
    db.add(hist_route)
    db.commit()
    db.refresh(new_grievance)

    return new_grievance

@router.get("/grievances/export/csv")
def export_grievances_csv(
    state: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Grievance)
    if state and state != "All":
        query = query.filter(Grievance.state == state)
    if city and city != "All":
        query = query.filter(Grievance.city == city)

    grievances = query.order_by(Grievance.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Ticket ID", "Status", "Priority", "Category", "Department",
        "Language", "Original Text", "English Translation", "Summary",
        "State", "City", "Area", "Ward", "Rating", "Citizen Feedback", "Created At"
    ])
    
    for g in grievances:
        writer.writerow([
            g.ticket_id, g.status, g.priority, g.category, g.department,
            g.language, g.original_text, g.translation, g.summary or "",
            g.state or "", g.city or "", g.area or "", g.ward or "",
            g.rating or "", g.feedback_comment or "",
            g.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    csv_content = output.getvalue()
    filename = f"JanSeva_Grievances_{state or 'All'}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/grievances", response_model=List[GrievanceResponse])
def list_grievances(
    status: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    priority: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Grievance)

    if status and status != "All":
        query = query.filter(Grievance.status == status)
    if category and category != "All":
        query = query.filter(Grievance.category == category)
    if language and language != "All":
        query = query.filter(Grievance.language == language)
    if priority and priority != "All":
        query = query.filter(Grievance.priority == priority)
    if state and state != "All":
        query = query.filter(Grievance.state == state)
    if city and city != "All":
        query = query.filter(Grievance.city == city)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Grievance.ticket_id.ilike(s)) |
            (Grievance.original_text.ilike(s)) |
            (Grievance.translation.ilike(s)) |
            (Grievance.department.ilike(s)) |
            (Grievance.city.ilike(s)) |
            (Grievance.state.ilike(s)) |
            (Grievance.ward.ilike(s))
        )

    return query.order_by(Grievance.created_at.desc()).all()

@router.get("/grievances/{ticket_id}", response_model=GrievanceResponse)
def get_grievance_by_ticket(ticket_id: str, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.ticket_id.ilike(ticket_id.strip())).first()
    if not grievance:
        raise HTTPException(status_code=404, detail=f"Grievance ticket '{ticket_id}' not found.")
    return grievance

@router.put("/grievances/{ticket_id}/status", response_model=GrievanceResponse)
def update_grievance_status(ticket_id: str, payload: StatusUpdate, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.ticket_id.ilike(ticket_id.strip())).first()
    if not grievance:
        raise HTTPException(status_code=404, detail=f"Grievance ticket '{ticket_id}' not found.")

    grievance.status = payload.status
    grievance.updated_at = datetime.datetime.utcnow()

    comment_str = payload.comment or f"Status updated to '{payload.status}' by administrator."
    hist = StatusHistory(
        grievance_id=grievance.id,
        status=payload.status,
        comment=comment_str
    )
    db.add(hist)
    db.commit()
    db.refresh(grievance)

    return grievance

@router.post("/grievances/{ticket_id}/feedback", response_model=GrievanceResponse)
def submit_grievance_feedback(ticket_id: str, payload: FeedbackSubmit, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.ticket_id.ilike(ticket_id.strip())).first()
    if not grievance:
        raise HTTPException(status_code=404, detail=f"Grievance ticket '{ticket_id}' not found.")

    grievance.rating = payload.rating
    grievance.feedback_comment = payload.feedback_comment
    grievance.updated_at = datetime.datetime.utcnow()

    hist = StatusHistory(
        grievance_id=grievance.id,
        status=grievance.status,
        comment=f"Citizen rated resolution {payload.rating}/5 stars. Feedback: '{payload.feedback_comment or 'No comment provided.'}'"
    )
    db.add(hist)
    db.commit()
    db.refresh(grievance)

    return grievance
