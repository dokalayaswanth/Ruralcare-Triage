import {
  AuditLogEntry,
  PatientRecord,
  TriageRequest,
  TriageResponse,
  UrgencyTier,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "API request failed";

    try {
      const errorBody = await response.json();
      message = errorBody.detail || JSON.stringify(errorBody);
    } catch {
      message = response.statusText;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function submitTriage(
  payload: TriageRequest
): Promise<TriageResponse> {
  const response = await fetch(`${API_URL}/triage/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<TriageResponse>(response);
}

export async function getRecords(params?: {
  status?: string;
  urgency_tier?: string;
}): Promise<{ count: number; records: PatientRecord[] }> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.urgency_tier) {
    searchParams.set("urgency_tier", params.urgency_tier);
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_URL}/records/?${queryString}`
    : `${API_URL}/records/`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  return handleResponse<{ count: number; records: PatientRecord[] }>(response);
}

export async function getRecord(recordId: string): Promise<PatientRecord> {
  const response = await fetch(`${API_URL}/records/${recordId}`, {
    cache: "no-store",
  });

  return handleResponse<PatientRecord>(response);
}

export async function overrideRecord(
  recordId: string,
  payload: {
    override_tier: UrgencyTier;
    override_reason: string;
  }
): Promise<{ message: string; record: PatientRecord }> {
  const response = await fetch(`${API_URL}/cases/${recordId}/override`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string; record: PatientRecord }>(response);
}

export async function resolveRecord(
  recordId: string
): Promise<{ message: string; record: PatientRecord }> {
  const response = await fetch(`${API_URL}/cases/${recordId}/resolve`, {
    method: "PATCH",
  });

  return handleResponse<{ message: string; record: PatientRecord }>(response);
}

export async function getAuditLog(
  recordId: string
): Promise<{ count: number; audit_log: AuditLogEntry[] }> {
  const response = await fetch(`${API_URL}/audit/${recordId}`, {
    cache: "no-store",
  });

  return handleResponse<{ count: number; audit_log: AuditLogEntry[] }>(
    response
  );
}