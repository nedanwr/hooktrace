import { useState, useCallback } from "react";
import { Link } from "react-router";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

import { sendMock } from "~/lib/api";
import type { CapturedRequest } from "~/lib/types";
import EditableHeadersTable, {
  entriesToHeaders,
  type HeaderEntry,
} from "~/components/EditableHeadersTable";
import StatusBadge from "~/components/StatusBadge";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const METHOD_STYLES: Record<string, { text: string; bg: string }> = {
  GET: { text: "#60a5fa", bg: "rgba(96, 165, 250, 0.08)" },
  POST: { text: "#4ade80", bg: "rgba(74, 222, 128, 0.08)" },
  PUT: { text: "#facc15", bg: "rgba(250, 204, 21, 0.08)" },
  PATCH: { text: "#fb923c", bg: "rgba(251, 146, 60, 0.08)" },
  DELETE: { text: "#f87171", bg: "rgba(248, 113, 113, 0.08)" },
};

export default function MockSender() {
  const [method, setMethod] = useState<string>("POST");
  const [path, setPath] = useState("/webhook");
  const [headers, setHeaders] = useState<HeaderEntry[]>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState('{\n  "event": "test",\n  "data": {}\n}');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CapturedRequest | null>(null);

  const handleSend = useCallback(async () => {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const headersMap = entriesToHeaders(headers);
      const encodedBody = body ? btoa(body) : undefined;
      const res = await sendMock({
        method,
        path,
        headers: headersMap,
        body: encodedBody,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mock request failed");
    } finally {
      setSending(false);
    }
  }, [method, path, headers, body]);

  const handleClear = useCallback(() => {
    setMethod("POST");
    setPath("/webhook");
    setHeaders([{ key: "Content-Type", value: "application/json" }]);
    setBody('{\n  "event": "test",\n  "data": {}\n}');
    setResult(null);
    setError(null);
  }, []);

  const methodStyle = METHOD_STYLES[method] ?? {
    text: "#a1a1aa",
    bg: "rgba(161, 161, 170, 0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Method + Path row */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
            Endpoint
          </h3>
        </div>
        <div
          className="flex items-center gap-0 rounded-lg overflow-hidden"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Method selector */}
          <div className="relative shrink-0">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="appearance-none font-mono text-[13px] font-semibold px-3 py-2.5 pr-8 bg-transparent outline-none cursor-pointer"
              style={{
                color: methodStyle.text,
                background: methodStyle.bg,
                borderRight: "1px solid var(--color-border)",
              }}
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Path input */}
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/webhook/endpoint"
            className="flex-1 font-mono text-[13px] text-zinc-200 bg-transparent px-3 py-2.5 outline-none placeholder:text-zinc-700"
          />
        </div>
      </section>

      {/* Headers section */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
            Headers
          </h3>
          <span className="text-[11px] text-zinc-700 font-mono">
            {headers.length}
          </span>
        </div>
        <EditableHeadersTable headers={headers} onChange={setHeaders} />
      </section>

      {/* Body section */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
            Body
          </h3>
          {body && (
            <span className="text-[11px] text-zinc-700 font-mono">
              {new Blob([body]).size} B
            </span>
          )}
        </div>
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <CodeMirror
            value={body}
            onChange={setBody}
            extensions={[json()]}
            theme={oneDark}
            minHeight="150px"
            maxHeight="400px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
            }}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            color: "white",
            boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
          }}
        >
          {sending ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
              Send
            </>
          )}
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-[13px] text-red-300 flex items-center gap-2"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
              Response
            </span>
            <StatusBadge
              statusCode={result.response?.statusCode ?? 0}
              size="sm"
            />
          </div>
          <p className="text-[13px] text-zinc-400 mb-2">
            Request created:{" "}
            <Link
              to={`/requests/${result.id}`}
              className="text-violet-400 hover:text-violet-300 transition-colors font-mono"
            >
              {result.id.slice(0, 12)}
            </Link>
          </p>
          {result.response && (
            <p className="text-[12px] text-zinc-600">
              {result.response.statusCode}{" "}
              {result.response.body
                ? `— ${
                    new Blob([atob(result.response.body as unknown as string)])
                      .size
                  } bytes`
                : "— no body"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
