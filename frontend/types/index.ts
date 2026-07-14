export type UrgencyTier = "ROUTINE" | "URGENT" | "EMERGENCY";

export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export type CaseStatus = "PENDING" | "REVIEWED" | "OVERRIDDEN" | "RESOLVED";

export interface SymptomEntry {
  symptom: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  onset: "sudden" | "gradual";
}

export interface VitalsInput {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature_f?: number;
  oxygen_saturation?: number;
}

export interface EvidenceChunk {
  source: string;
  content: string;
  relevance_score: number;
}

export interface TriageRequest {
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  symptoms: SymptomEntry[];
  vitals?: VitalsInput;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
}

export interface TriageResponse {
  case_id: string;
  urgency_tier: UrgencyTier;
  urgency_score: number;
  confidence_level: ConfidenceLevel;
  ai_reasoning: string;
  recommended_action: string;
  retrieved_evidence: EvidenceChunk[];
}

export interface PatientRecord {
  id: string;
  created_at: string;
  updated_at?: string;

  patient_name: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  symptoms: SymptomEntry[];
  vitals?: VitalsInput;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;

  urgency_tier: UrgencyTier;
  urgency_score: number;
  confidence_level: ConfidenceLevel;
  ai_reasoning: string;
  recommended_action: string;
  retrieved_evidence: EvidenceChunk[];

  status: CaseStatus;
  override_tier?: UrgencyTier;
  override_reason?: string;
  override_at?: string;
}

export interface AuditLogEntry {
  id: string;
  created_at: string;
  case_id: string;
  action: "AI_TRIAGE" | "CLINICIAN_REVIEW" | "OVERRIDE" | "RESOLVE";
  performed_by?: string | null;
  details: Record<string, unknown>;
}