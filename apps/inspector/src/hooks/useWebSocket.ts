import { useEffect, useRef } from "react";

import { createWSConnection } from "~/lib/ws";
import { useRequestStore } from "~/store/requestStore";
import type { WSEvent } from "~/lib/types";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const addRequest = useRequestStore((s) => s.addRequest);
  const updateRequest = useRequestStore((s) => s.updateRequest);
  const hydrate = useRequestStore((s) => s.hydrate);

  useEffect(() => {
    // Initial hydration from REST API.
    hydrate();

    // Connect to WebSocket for live updates.
    wsRef.current = createWSConnection((event) => {
      try {
        const parsed: WSEvent = JSON.parse(event.data);
        switch (parsed.type) {
          case "request:new":
            addRequest(parsed.data);
            break;
          case "request:updated":
            updateRequest(parsed.data);
            break;
          case "requests:cleared":
            hydrate();
            break;
        }
      } catch {
        // Ignore malformed messages.
      }
    });

    return () => {
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
