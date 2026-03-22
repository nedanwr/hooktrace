export type WSMessageHandler = (event: MessageEvent) => void;

export function createWSConnection(onMessage: WSMessageHandler): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${protocol}//${window.location.host}/ws`;

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[HookTrace] WebSocket connected");
  };

  ws.onmessage = onMessage;

  ws.onclose = (e) => {
    console.log("[HookTrace] WebSocket disconnected, reconnecting...", e.code);
    // Reconnect after a short delay.
    setTimeout(() => {
      createWSConnection(onMessage);
    }, 1000);
  };

  ws.onerror = (e) => {
    console.error("[HookTrace] WebSocket error", e);
  };

  return ws;
}
