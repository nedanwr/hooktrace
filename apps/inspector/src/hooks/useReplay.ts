import { useState } from "react";

import { replayRequest, type ReplayPayload } from "~/lib/api";
import type { CapturedRequest } from "~/lib/types";

interface UseReplayReturn {
  replaying: boolean;
  error: string | null;
  result: CapturedRequest | null;
  replay: (id: string, payload?: ReplayPayload) => Promise<void>;
  clearResult: () => void;
}

export function useReplay(): UseReplayReturn {
  const [replaying, setReplaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CapturedRequest | null>(null);

  const replay = async (id: string, payload?: ReplayPayload) => {
    setReplaying(true);
    setError(null);
    setResult(null);
    try {
      const res = await replayRequest(id, payload);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replay failed");
    } finally {
      setReplaying(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return { replaying, error, result, replay, clearResult };
}
