import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Grievance
from schemas import DashboardStats
from sqlalchemy import func

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_analytics(
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Dynamic list of all states & cities existing in database
    states_rows = db.query(Grievance.state).distinct().all()
    available_states = sorted([r[0] for r in states_rows if r[0]])

    city_query = db.query(Grievance.city).distinct()
    if state and state != "All":
        city_query = city_query.filter(Grievance.state == state)
    city_rows = city_query.all()
    available_cities = sorted([r[0] for r in city_rows if r[0]])

    # Base query for filtered stats
    query = db.query(Grievance)
    if state and state != "All":
        query = query.filter(Grievance.state == state)
    if city and city != "All":
        query = query.filter(Grievance.city == city)

    total = query.count()
    pending = query.filter(Grievance.status.in_(["Submitted", "Assigned"])).count()
    in_progress = query.filter(Grievance.status == "Under Investigation").count()
    resolved = query.filter(Grievance.status == "Resolved").count()
    high_priority = query.filter(Grievance.priority == "High").count()

    now = datetime.datetime.utcnow()
    one_day_ago = now - datetime.timedelta(hours=24)
    escalated = query.filter(
        Grievance.status.in_(["Submitted", "Assigned", "Under Investigation"]),
        Grievance.created_at <= one_day_ago
    ).count()

    ratings = query.filter(Grievance.rating.isnot(None)).all()
    if ratings:
        avg_rating = round(sum(g.rating for g in ratings) / len(ratings), 1)
    else:
        avg_rating = 4.8

    categories = ["Roads", "Water", "Electricity", "Sanitation", "Transport", "Public Safety", "Other"]
    category_data = []
    for cat in categories:
        cnt = query.filter(Grievance.category == cat).count()
        category_data.append({"category": cat, "count": cnt})

    languages = ["Telugu", "Hindi", "Tamil", "Kannada", "Marathi", "English"]
    language_data = []
    for lang in languages:
        cnt = query.filter(Grievance.language == lang).count()
        if cnt > 0 or total == 0:
            language_data.append({"language": lang, "count": cnt})

    statuses = ["Submitted", "Assigned", "Under Investigation", "Resolved"]
    status_data = []
    for st in statuses:
        cnt = query.filter(Grievance.status == st).count()
        status_data.append({"status": st, "count": cnt})

    # 100% Dynamic Ward Aggregation from DB
    wards_query = query.with_entities(Grievance.ward, func.count(Grievance.id)).group_by(Grievance.ward).all()
    ward_data = []
    for ward_name, cnt in wards_query:
        if ward_name:
            high_cnt = query.filter(Grievance.ward == ward_name, Grievance.priority == "High").count()
            sample_g = query.filter(Grievance.ward == ward_name).first()
            ward_data.append({
                "ward": ward_name,
                "count": cnt,
                "high_priority": high_cnt,
                "city": sample_g.city if (sample_g and sample_g.city) else (city if city and city != "All" else "District Zone"),
                "state": sample_g.state if (sample_g and sample_g.state) else (state if state and state != "All" else "State"),
                "area": sample_g.area if sample_g else ward_name,
                "category": sample_g.category if sample_g else "Civic Infrastructure"
            })

    return DashboardStats(
        total_grievances=total,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        high_priority=high_priority,
        escalated_count=escalated,
        average_rating=avg_rating,
        selected_state=state or "All",
        selected_city=city or "All",
        available_states=available_states,
        available_cities=available_cities,
        category_breakdown=category_data,
        language_breakdown=language_data,
        status_breakdown=status_data,
        ward_breakdown=ward_data
    )
