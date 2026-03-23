import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";

import type { CapturedRequest } from "~/lib/types";
import type { DiffResult } from "~/lib/api";
import { fetchRequests, fetchDiff } from "~/lib/api";
import DiffView from "~/components/DiffView";
import StatusBadge from "~/components/StatusBadge";

export default function DiffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [leftId, setLeftId] = useState(searchParams.get("left") ?? "");
  const [rightId, setRightId] = useState(searchParams.get("right") ?? "");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load request list for selectors.
  useEffect(() => {
    fetchRequests({ limit: 50 }).then(setRequests).catch(() => {});
  }, []);

  // Auto-run diff when both IDs are set.
  useEffect(() => {
    if (!leftId || !rightId) {
      setDiffResult(null);
      return;
    }
    if (leftId === rightId) {
      setDiffResult(null);
      setError("Select two different requests to compare");
      return;
    }

    setLoading(true);
    setError(null);
    setDiffResult(null);

    // Update URL params.
    setSearchParams({ left: leftId, right: rightId });

    fetchDiff(leftId, rightId)
      .then(setDiffResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Diff failed"))
      .finally(() => setLoading(false));
  }, [leftId, rightId, setSearchParams]);

  return (
    <div className="animate-fade-in">
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

      <h2 className="text-[18px] font-semibold text-zinc-100 mb-5">
        Compare Requests
      </h2>

      {/* Selectors */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <RequestSelector
            label="Left"
            requests={requests}
            selectedId={leftId}
            otherId={rightId}
            onChange={setLeftId}
          />

          <div className="flex items-center justify-center pt-7">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-surface-overlay)", border: "1px solid var(--color-border)" }}
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
                className="text-zinc-600"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                <path d="M12 20v-5" />
                <path d="m9 18 3 3 3-3" />
                <path d="M12 4v5" />
                <path d="m9 6 3-3 3 3" />
              </svg>
            </div>
          </div>

          <RequestSelector
            label="Right"
            requests={requests}
            selectedId={rightId}
            otherId={leftId}
            onChange={setRightId}
          />
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="py-12 flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-violet-400 rounded-full animate-spin" />
          <span className="text-[13px] text-zinc-600">Comparing...</span>
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-lg p-4 text-[13px] text-amber-400"
          style={{
            background: "rgba(251, 191, 36, 0.06)",
            border: "1px solid rgba(251, 191, 36, 0.15)",
          }}
        >
          {error}
        </div>
      )}

      {diffResult && !loading && (
        <DiffView changes={diffResult.changes} summary={diffResult.summary} />
      )}

      {!leftId && !rightId && !loading && (
        <div className="py-16 flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--color-surface-overlay)",
              border: "1px solid var(--color-border)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-zinc-600"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
              <path d="M12 8v8" />
              <path d="m9 11 3-3 3 3" />
            </svg>
          </div>
          <p className="text-[14px] text-zinc-400">
            Select two requests to compare
          </p>
          <p className="text-[12px] text-zinc-600">
            See differences in headers, body, status, and more
          </p>
        </div>
      )}
    </div>
  );
}

function RequestSelector({
  label,
  requests,
  selectedId,
  otherId,
  onChange,
}: {
  label: string;
  requests: CapturedRequest[];
  selectedId: string;
  otherId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId),
    [requests, selectedId]
  );

  return (
    <div className="space-y-2">
      <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {selected ? (
            <RequestOption request={selected} />
          ) : (
            <span className="text-zinc-600">Select a request...</span>
          )}
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute z-20 top-full mt-1 left-0 right-0 max-h-[280px] overflow-auto rounded-lg shadow-xl"
              style={{
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
              }}
            >
              {requests.length === 0 ? (
                <div className="px-3 py-4 text-[13px] text-zinc-600 text-center">
                  No requests captured yet
                </div>
              ) : (
                requests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => {
                      onChange(req.id);
                      setOpen(false);
                    }}
                    disabled={req.id === otherId}
                    className={`w-full text-left px-3 py-2 transition-colors hover:bg-white/3 ${
                      req.id === selectedId
                        ? "bg-violet-500/10"
                        : req.id === otherId
                        ? "opacity-30 cursor-not-allowed"
                        : ""
                    }`}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <RequestOption request={req} />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const METHOD_COLORS: Record<string, string> = {
  GET: "#60a5fa",
  POST: "#4ade80",
  PUT: "#facc15",
  PATCH: "#fb923c",
  DELETE: "#f87171",
};

function RequestOption({ request }: { request: CapturedRequest }) {
  const color = METHOD_COLORS[request.method] ?? "#a1a1aa";
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        className="font-mono text-[11px] font-semibold shrink-0"
        style={{ color }}
      >
        {request.method}
      </span>
      <span className="font-mono text-[12px] text-zinc-300 truncate flex-1">
        {request.path}
      </span>
      {request.response && (
        <StatusBadge statusCode={request.response.statusCode} size="sm" />
      )}
      <span className="text-[11px] text-zinc-700 font-mono shrink-0">
        {request.id.slice(0, 8)}
      </span>
    </div>
  );
}
