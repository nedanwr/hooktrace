export interface CapturedRequest {
  id: string;
  method: string;
  path: string;
  query?: string;
  headers: Record<string, string[]>;
  body?: string; // base64
  timestamp: string;
  response?: CapturedResponse;
  duration: number; // nanoseconds
}

export interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string[]>;
  body?: string; // base64
}

export interface WSEvent {
  type: string;
  data: CapturedRequest;
}
