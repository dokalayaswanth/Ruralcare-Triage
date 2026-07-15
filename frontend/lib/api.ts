import {
  AuditLogEntry,
  PatientRecord,
  TriageRequest,
  TriageResponse,
  UrgencyTier,
} from "@/types";
import { getCurrentSession } from "@/lib/auth";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getCurrentSession();

  if (!session?.access_token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

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
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_URL}/records/${recordId}`, {
    cache: "no-store",
    headers: {
      ...authHeaders,
    },
  });

  const data = await handleResponse<
    PatientRecord | { record: PatientRecord } | { case: PatientRecord }
  >(response);

  if ("record" in data) {
    return data.record;
  }

  if ("case" in data) {
    return data.case;
  }

  return data;
}

export async function overrideRecord(
  recordId: string,
  payload: {
    override_tier: UrgencyTier;
    override_reason: string;
  }
): Promise<{ message: string; record: PatientRecord }> {
  const response = await fetch(`${API_URL}/records/${recordId}/override`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string; record: PatientRecord }>(response);
}

export async function resolveRecord(
  recordId: string
): Promise<{ message: string; record: PatientRecord }> {
  const response = await fetch(`${API_URL}/records/${recordId}/resolve`, {
    method: "PATCH",
    headers: {
      ...(await getAuthHeaders()),
    },
  });

  return handleResponse<{ message: string; record: PatientRecord }>(response);
}

export async function getAuditLog(
  recordId: string
): Promise<{ count: number; audit_log: AuditLogEntry[] }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_URL}/audit/${recordId}`, {
    cache: "no-store",
    headers: {
      ...authHeaders,
    },
  });

  return handleResponse<{ count: number; audit_log: AuditLogEntry[] }>(
    response
  );
}

export async function getPublicTriageResult(
  recordId: string
): Promise<PatientRecord> {
  const response = await fetch(`${API_URL}/triage/result/${recordId}`, {
    cache: "no-store",
  });

  const data = await handleResponse<PatientRecord | { record: PatientRecord }>(
    response
  );

  if ("record" in data) {
    return data.record;
  }

  return data;
}