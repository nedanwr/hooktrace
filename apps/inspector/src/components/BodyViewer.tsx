import { useMemo, useState } from "react";

interface BodyViewerProps {
  body?: string;
  contentType?: string;
}

export default function BodyViewer({ body, contentType }: BodyViewerProps) {
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty");
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => {
    if (!body) return "";
    try {
      return atob(body);
    } catch {
      return typeof body === "string" ? body : "";
    }
  }, [body]);

  const prettyBody = useMemo(() => {
    if (!decoded) return "";
    const ct = contentType?.toLowerCase() ?? "";
    if (
      ct.includes("json") ||
      decoded.startsWith("{") ||
      decoded.startsWith("[")
    ) {
      try {
        return JSON.stringify(JSON.parse(decoded), null, 2);
      } catch {
        return decoded;
      }
    }
    return decoded;
  }, [decoded, contentType]);

  const syntaxHighlighted = useMemo(() => {
    if (viewMode !== "pretty") return null;
    const text = prettyBody;
    // Only highlight JSON
    if (!text.startsWith("{") && !text.startsWith("[")) return null;
    return highlightJSON(text);
  }, [prettyBody, viewMode]);

  if (!body || decoded.length === 0) {
    return (
      <div className="py-6 text-center text-[13px] text-zinc-600 italic">
        No body
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(viewMode === "pretty" ? prettyBody : decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = (viewMode === "pretty" ? prettyBody : decoded).split("\n");

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-3 py-1.5 rounded-t-lg"
        style={{
          background: "var(--color-surface-overlay)",
          border: "1px solid var(--color-border)",
          borderBottom: "none",
        }}
      >
        <div
          className="flex items-center rounded-md p-0.5 mr-2"
          style={{ background: "var(--color-surface)" }}
        >
          <button
            onClick={() => setViewMode("pretty")}
            className={`px-2 py-[3px] rounded text-[11px] font-medium transition-all ${
              viewMode === "pretty"
                ? "bg-violet-500/15 text-violet-300"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Pretty
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-2 py-[3px] rounded text-[11px] font-medium transition-all ${
              viewMode === "raw"
                ? "bg-violet-500/15 text-violet-300"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Raw
          </button>
        </div>

        <span className="text-[11px] text-zinc-700 font-mono ml-auto mr-2">
          {formatBytes(decoded.length)}
        </span>

        <button
          onClick={handleCopy}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
          title="Copy body"
        >
          {copied ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m20 6-11 11-5-5" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </button>
      </div>

      {/* Body content with line numbers */}
      <div
        className="rounded-b-lg overflow-auto max-h-[480px]"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <pre className="text-[12px] font-mono leading-[1.65]">
          <div className="flex">
            {/* Line numbers */}
            <div
              className="select-none shrink-0 text-right pr-3 pl-3 py-3 text-zinc-700"
              style={{ borderRight: "1px solid var(--color-border-subtle)" }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <div className="py-3 px-4 flex-1 overflow-x-auto">
              {syntaxHighlighted ? (
                <div dangerouslySetInnerHTML={{ __html: syntaxHighlighted }} />
              ) : (
                <div className="text-zinc-300 whitespace-pre">
                  {viewMode === "pretty" ? prettyBody : decoded}
                </div>
              )}
            </div>
          </div>
        </pre>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightJSON(json: string): string {
  return json.replace(
    /("(?:[^"\\]|\\.)*")\s*(:)|("(?:[^"\\]|\\.)*")|((?:-?\d+\.?\d*(?:[eE][+-]?\d+)?))|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],])/g,
    (
      _match,
      key: string,
      colon: string,
      str: string,
      num: string,
      bool: string,
      nullVal: string,
      bracket: string
    ) => {
      if (key && colon) {
        return `<span class="json-key">${escapeHtml(key)}</span>${colon}`;
      }
      if (str) return `<span class="json-string">${escapeHtml(str)}</span>`;
      if (num) return `<span class="json-number">${escapeHtml(num)}</span>`;
      if (bool) return `<span class="json-boolean">${escapeHtml(bool)}</span>`;
      if (nullVal)
        return `<span class="json-null">${escapeHtml(nullVal)}</span>`;
      if (bracket)
        return `<span class="json-bracket">${escapeHtml(bracket)}</span>`;
      return escapeHtml(_match);
    }
  );
}
