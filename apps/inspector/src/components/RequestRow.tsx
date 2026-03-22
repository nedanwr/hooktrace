import { Link } from "react-router";

import type { CapturedRequest } from "~/lib/types";
import StatusBadge from "./StatusBadge";

interface RequestRowProps {
  request: CapturedRequest;
  isNew?: boolean;
}

function formatDuration(ns: number): string {
  const ms = ns / 1_000_000;
  if (ms < 1) return `<1ms`;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatRelativeTime(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const METHOD_STYLES: Record<string, { text: string; bg: string }> = {
  GET: { text: "#60a5fa", bg: "rgba(96, 165, 250, 0.08)" },
  POST: { text: "#4ade80", bg: "rgba(74, 222, 128, 0.08)" },
  PUT: { text: "#facc15", bg: "rgba(250, 204, 21, 0.08)" },
  PATCH: { text: "#fb923c", bg: "rgba(251, 146, 60, 0.08)" },
  DELETE: { text: "#f87171", bg: "rgba(248, 113, 113, 0.08)" },
};

export default function RequestRow({ request }: RequestRowProps) {
  const statusCode = request.response?.statusCode ?? 0;
  const methodStyle = METHOD_STYLES[request.method] ?? {
    text: "#a1a1aa",
    bg: "rgba(161, 161, 170, 0.08)",
  };
  const path = request.query
    ? `${request.path}?${request.query}`
    : request.path;

  return (
    <Link
      to={`/requests/${request.id}`}
      className="group flex items-center gap-4 px-4 py-2.5 transition-colors animate-fade-in hover:!bg-white/[0.03]"
      style={{
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Method pill */}
      <span
        className="font-mono text-[11px] font-semibold w-[52px] shrink-0 text-center py-[3px] rounded-md"
        style={{ color: methodStyle.text, background: methodStyle.bg }}
      >
        {request.method}
      </span>

      {/* Path */}
      <span className="font-mono text-[13px] text-zinc-400 truncate flex-1 group-hover:text-zinc-200 transition-colors">
        {path}
      </span>

      {/* Status */}
      <StatusBadge statusCode={statusCode} />

      {/* Duration */}
      <span className="font-mono text-[11px] text-zinc-600 w-14 text-right shrink-0 tabular-nums">
        {formatDuration(request.duration)}
      </span>

      {/* Time */}
      <span className="text-[11px] text-zinc-700 w-16 text-right shrink-0">
        {formatRelativeTime(request.timestamp)}
      </span>

      {/* Chevron */}
      <svg
        className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}
