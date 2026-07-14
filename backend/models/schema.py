from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class UrgencyTier(str, Enum):
    ROUTINE = "ROUTINE"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"


class ConfidenceLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VitalsInput(BaseModel):
    blood_pressure_systolic: Optional[int] = Field(default=None, ge=40, le=250)
    blood_pressure_diastolic: Optional[int] = Field(default=None, ge=20, le=160)
    heart_rate: Optional[int] = Field(default=None, ge=20, le=250)
    temperature_f: Optional[float] = Field(default=None, ge=80, le=115)
    oxygen_saturation: Optional[int] = Field(default=None, ge=50, le=100)


class SymptomEntry(BaseModel):
    symptom: str = Field(..., min_length=1)
    severity: str = Field(..., pattern="^(mild|moderate|severe)$")
    duration: str = Field(..., min_length=1)
    onset: str = Field(..., pattern="^(sudden|gradual)$")


class TriageRequest(BaseModel):
    patient_name: str = Field(..., min_length=1)
    patient_age: int = Field(..., ge=0, le=120)
    patient_gender: str = Field(..., min_length=1)
    chief_complaint: str = Field(..., min_length=1)
    symptoms: List[SymptomEntry] = Field(..., min_length=1)
    vitals: Optional[VitalsInput] = None
    medical_history: Optional[str] = None
    current_medications: Optional[str] = None
    allergies: Optional[str] = None


class EvidenceChunk(BaseModel):
    source: str
    content: str
    relevance_score: float


class TriageResponse(BaseModel):
    case_id: str
    urgency_tier: UrgencyTier
    urgency_score: int
    confidence_level: ConfidenceLevel
    ai_reasoning: str
    recommended_action: str
    retrieved_evidence: List[EvidenceChunk]


class CaseOverrideRequest(BaseModel):
    override_tier: UrgencyTier
    override_reason: str = Field(..., min_length=3)