import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False)
    original_text = Column(Text, nullable=False)
    language = Column(String(50), nullable=False, default="English")
    translation = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")
    department = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True, default="Telangana")
    city = Column(String(100), nullable=True, default="Hyderabad")
    area = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True)
    landmark = Column(String(150), nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="Submitted")
    rating = Column(Integer, nullable=True)
    feedback_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    history = relationship("StatusHistory", back_populates="grievance", cascade="all, delete-orphan")

class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False)
    status = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    grievance = relationship("Grievance", back_populates="history")

class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False, default="Ward Officer")
    state = Column(String(100), nullable=False, default="Telangana")
    city = Column(String(100), nullable=False, default="Hyderabad")
    ward = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
