import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

import type { CapturedRequest } from "~/lib/types";
import { useReplay } from "~/hooks/useReplay";
import EditableHeadersTable, {
  headersToEntries,
  entriesToHeaders,
  type HeaderEntry,
} from "~/components/EditableHeadersTable";
import StatusBadge from "~/components/StatusBadge";

interface ReplayPanelProps {
  request: CapturedRequest;
}

export default function ReplayPanel({ request }: ReplayPanelProps) {
  const { replaying, error, result, replay, clearResult } = useReplay();

  // Initialize editable state from the original request.
  const [headers, setHeaders] = useState<HeaderEntry[]>(() =>
    headersToEntries(request.headers ?? {})
  );

  const decodedBody = useMemo(() => {
    if (!request.body) return "";
    try {
      return atob(request.body as unknown as string);
    } catch {
      return typeof request.body === "string" ? (request.body as string) : "";
    }
  }, [request.body]);

  const [body, setBody] = useState(() => {
    // Try to pretty-print JSON for a nicer editing experience.
    try {
      return JSON.stringify(JSON.parse(decodedBody), null, 2);
    } catch {
      return decodedBody;
    }
  });

  const handleReplay = useCallback(async () => {
    const headersMap = entriesToHeaders(headers);
    const encodedBody = body ? btoa(body) : undefined;

    await replay(request.id, {
      headers: headersMap,
      body: encodedBody,
    });
  }, [headers, body, request.id, replay]);

  const handleReset = useCallback(() => {
    setHeaders(headersToEntries(request.headers ?? {}));
    try {
      setBody(JSON.stringify(JSON.parse(decodedBody), null, 2));
    } catch {
      setBody(decodedBody);
    }
    clearResult();
  }, [request.headers, decodedBody, clearResult]);

  return (
    <div className="space-y-5">
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
            minHeight="120px"
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
          onClick={handleReplay}
          disabled={replaying}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            color: "white",
            boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
          }}
        >
          {replaying ? (
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
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Replay
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          Reset
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
              Replay Result
            </span>
            <StatusBadge
              statusCode={result.response?.statusCode ?? 0}
              size="sm"
            />
          </div>
          <p className="text-[13px] text-zinc-400 mb-2">
            New request created:{" "}
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
