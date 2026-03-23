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
