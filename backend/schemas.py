import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class StatusHistorySchema(BaseModel):
    id: int
    grievance_id: int
    status: str
    comment: Optional[str] = None
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyzeRequest(BaseModel):
    text: str
    language: Optional[str] = "Auto Detect"
    category: Optional[str] = "Auto Detect"

class DuplicateCheckResult(BaseModel):
    is_duplicate: bool
    similarity: float
    matched_ticket_id: Optional[str] = None
    matched_text: Optional[str] = None

class AIAnalysisResponse(BaseModel):
    language: str
    translation: str
    category: str
    priority: str
    department: str
    summary: str
    suggested_action: str
    duplicate: Optional[DuplicateCheckResult] = None

class GrievanceCreate(BaseModel):
    original_text: str
    language: str
    translation: str
    category: str
    priority: str
    department: str
    summary: str
    suggested_action: str
    state: Optional[str] = "Telangana"
    city: Optional[str] = "Hyderabad"
    area: Optional[str] = "Central Zone"
    ward: Optional[str] = "Ward 12 - Central"
    landmark: Optional[str] = ""
    latitude: Optional[str] = "17.3850"
    longitude: Optional[str] = "78.4867"

class StatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = None

class FeedbackSubmit(BaseModel):
    rating: int
    feedback_comment: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    message: str
    username: str

class OfficerCreate(BaseModel):
    name: str
    username: str
    role: Optional[str] = "Ward Officer"
    state: str
    city: str
    ward: Optional[str] = "Central Ward"

class OfficerResponse(BaseModel):
    id: int
    name: str
    username: str
    role: str
    state: str
    city: str
    ward: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class GrievanceResponse(BaseModel):
    id: int
    ticket_id: str
    original_text: str
    language: str
    translation: str
    category: str
    priority: str
    department: str
    state: Optional[str] = "Telangana"
    city: Optional[str] = "Hyderabad"
    area: Optional[str] = None
    ward: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    summary: Optional[str] = None
    suggested_action: Optional[str] = None
    status: str
    rating: Optional[int] = None
    feedback_comment: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    history: List[StatusHistorySchema] = []

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_grievances: int
    pending: int
    in_progress: int
    resolved: int
    high_priority: int
    escalated_count: int
    average_rating: float
    selected_state: str
    selected_city: str
    available_states: List[str] = []
    available_cities: List[str] = []
    category_breakdown: List[dict]
    language_breakdown: List[dict]
    status_breakdown: List[dict]
    ward_breakdown: List[dict]
