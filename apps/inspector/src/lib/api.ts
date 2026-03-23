import type { CapturedRequest } from "./types";

const BASE = "";

export async function fetchRequests(params?: {
  limit?: number;
  q?: string;
  status?: string;
}): Promise<CapturedRequest[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.q) searchParams.set("q", params.q);
  if (params?.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  const url = `${BASE}/api/requests${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchRequest(id: string): Promise<CapturedRequest> {
  const res = await fetch(`${BASE}/api/requests/${id}`);
  if (!res.ok) throw new Error("Request not found");
  return res.json();
}

export async function clearRequests(): Promise<void> {
  await fetch(`${BASE}/api/requests`, { method: "DELETE" });
}

export async function fetchStatus(): Promise<{ requestCount: number }> {
  const res = await fetch(`${BASE}/api/status`);
  return res.json();
}

export interface ReplayPayload {
  headers?: Record<string, string[]>;
  body?: string; // base64-encoded
}

export async function replayRequest(
  id: string,
  payload?: ReplayPayload
): Promise<CapturedRequest> {
  const res = await fetch(`${BASE}/api/requests/${id}/replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Replay failed");
  }
  return res.json();
}

export interface MockPayload {
  method: string;
  path: string;
  query?: string;
  headers?: Record<string, string[]>;
  body?: string; // base64-encoded
}

export async function sendMock(payload: MockPayload): Promise<CapturedRequest> {
  const res = await fetch(`${BASE}/api/mock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Mock failed");
  }
  return res.json();
}

// --- Diff API ---

export interface DiffChange {
  section: string;
  type: "modified" | "added" | "removed";
  key: string;
  left: string;
  right: string;
}

export interface DiffSummary {
  totalChanges: number;
  added: number;
  removed: number;
  modified: number;
}

export interface RequestSummary {
  id: string;
  method: string;
  path: string;
  timestamp: string;
}

export interface DiffResult {
  left: RequestSummary;
  right: RequestSummary;
  changes: DiffChange[];
  summary: DiffSummary;
}

export async function fetchDiff(leftId: string, rightId: string): Promise<DiffResult> {
  const res = await fetch(`${BASE}/api/diff?left=${leftId}&right=${rightId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Diff failed");
  }
  return res.json();
}

// --- Signature Verification API ---

export interface SignatureResult {
  valid: boolean;
  provider: string;
  error?: string;
  header: string;
  value: string;
}

export interface SignatureProvider {
  name: string;
  header: string;
}

export async function verifySignature(
  requestId: string,
  provider: string,
  secret: string
): Promise<SignatureResult> {
  const params = new URLSearchParams({ provider, secret });
  const res = await fetch(`${BASE}/api/requests/${requestId}/verify-signature?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Verification failed");
  }
  return res.json();
}

export async function fetchSignatureProviders(): Promise<SignatureProvider[]> {
  const res = await fetch(`${BASE}/api/signature/providers`);
  return res.json();
}
