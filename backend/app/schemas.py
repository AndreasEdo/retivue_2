"""Pydantic models untuk request/response (AI + domain)."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr


# ----------------- AI / health (lama) -----------------
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    mode: Optional[str] = None
    db_connected: Optional[bool] = None


class PredictResponse(BaseModel):
    grade: int
    label: str
    raw_score: float
    confidence: float
    thresholds: List[float]
    ben_graham_image: str
    disclaimer: str
    n_folds: Optional[int] = None
    fold_scores: Optional[List[float]] = None


class ExplainResponse(BaseModel):
    gradcam_image: str
    method: str
    note: str


# ----------------- Auth -----------------
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    status: str = "active"
    specialty: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


class PatientRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None   # YYYY-MM-DD
    age: Optional[int] = None
    gender: Optional[str] = None


# ----------------- Admin: users & schedules -----------------
class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # 'dokter' | 'medical_record'
    specialty: Optional[str] = None
    title: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    specialty: Optional[str] = None
    title: Optional[str] = None


class ScheduleCreate(BaseModel):
    doctor_id: str
    date: str          # YYYY-MM-DD
    start_time: str    # HH:MM
    end_time: str
    quota: int = 10


# ----------------- Appointment -----------------
class AppointmentCreate(BaseModel):
    schedule_id: str
    complaint: str
    symptom_duration: Optional[str] = None


# ----------------- Doctor review -----------------
class RejectBody(BaseModel):
    reject_note: str


class ApproveBody(BaseModel):
    final_diagnosis: str
    lifestyle_recommendation: str = ""
    food_recommendation: str = ""
    follow_up_plan: str = ""


LoginResponse.model_rebuild()
