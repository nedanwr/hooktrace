import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

import type { CapturedRequest } from "~/lib/types";
import { fetchRequest } from "~/lib/api";
import StatusBadge from "~/components/StatusBadge";
import HeadersTable from "~/components/HeadersTable";
import BodyViewer from "~/components/BodyViewer";

function formatDuration(ns: number): string {
  const ms = ns / 1_000_000;
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState<CapturedRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"request" | "response">("request");
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRequest(id)
      .then(setRequest)
      .catch(() => setError("Request not found"));
  }, [id]);

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 animate-fade-in">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "var(--color-surface-overlay)",
            border: "1px solid var(--color-border)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[14px] text-zinc-400">{error}</p>
        <Link
          to="/"
          className="text-[13px] text-violet-400 hover:text-violet-300 transition-colors"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-violet-400 rounded-full animate-spin" />
        <span className="text-[13px] text-zinc-600">Loading...</span>
      </div>
    );
  }

  const statusCode = request.response?.statusCode ?? 0;
  const requestContentType =
    request.headers?.["Content-Type"]?.[0] ?? "";
  const responseContentType =
    request.response?.headers?.["Content-Type"]?.[0] ?? "";
  const path = request.query
    ? `${request.path}?${request.query}`
    : request.path;

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const METHOD_STYLES: Record<string, { text: string; bg: string }> = {
    GET: { text: "#60a5fa", bg: "rgba(96, 165, 250, 0.08)" },
    POST: { text: "#4ade80", bg: "rgba(74, 222, 128, 0.08)" },
    PUT: { text: "#facc15", bg: "rgba(250, 204, 21, 0.08)" },
    PATCH: { text: "#fb923c", bg: "rgba(251, 146, 60, 0.08)" },
    DELETE: { text: "#f87171", bg: "rgba(248, 113, 113, 0.08)" },
  };
  const methodStyle = METHOD_STYLES[request.method] ?? {
    text: "#a1a1aa",
    bg: "rgba(161, 161, 170, 0.08)",
  };

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors mb-5 group"
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
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Requests
      </Link>

      {/* Summary card */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Method + Path */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="font-mono text-[12px] font-semibold px-2.5 py-1 rounded-md shrink-0"
                style={{ color: methodStyle.text, background: methodStyle.bg }}
              >
                {request.method}
              </span>
              <span className="font-mono text-[15px] text-zinc-200 truncate">
                {path}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap">
              <StatusBadge statusCode={statusCode} size="md" />

              <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDuration(request.duration)}
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {new Date(request.timestamp).toLocaleString()}
              </div>

              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-400 font-mono transition-colors ml-auto"
                title="Copy request ID"
              >
                {copiedId ? (
                  <span className="text-emerald-400">Copied!</span>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    {request.id.slice(0, 12)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 mb-5"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {(["request", "response"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors capitalize ${
              tab === t ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
            {t === "response" && request.response && (
              <span className="ml-1.5 text-[11px] text-zinc-600">
                {request.response.statusCode}
              </span>
            )}
            {tab === t && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-violet-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in space-y-5" key={tab}>
        {tab === "request" ? (
          <>
            <Section title="Headers" count={Object.keys(request.headers ?? {}).length}>
              <HeadersTable headers={request.headers ?? {}} />
            </Section>
            <Section title="Body">
              <BodyViewer
                body={request.body as unknown as string}
                contentType={requestContentType}
              />
            </Section>
          </>
        ) : request.response ? (
          <>
            <Section title="Headers" count={Object.keys(request.response.headers ?? {}).length}>
              <HeadersTable headers={request.response.headers ?? {}} />
            </Section>
            <Section title="Body">
              <BodyViewer
                body={request.response.body as unknown as string}
                contentType={responseContentType}
              />
            </Section>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--color-surface-overlay)",
                border: "1px solid var(--color-border)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[13px] text-zinc-600">
              No response received from target server
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <h3 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
          {title}
        </h3>
        {count !== undefined && (
          <span className="text-[11px] text-zinc-700 font-mono">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}
