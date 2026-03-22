import { useRequests } from "~/hooks/useRequests";

import RequestRow from "./RequestRow";
import FilterBar from "./FilterBar";

export default function RequestList() {
  const { requests, loading } = useRequests();

  return (
    <div>
      <FilterBar />

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Column header */}
        <div
          className="flex items-center gap-4 px-4 py-2"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span className="w-[52px] shrink-0 text-[11px] text-zinc-600 font-medium">
            Method
          </span>
          <span className="flex-1 text-[11px] text-zinc-600 font-medium">
            Path
          </span>
          <span className="text-[11px] text-zinc-600 font-medium">Status</span>
          <span className="w-14 text-right text-[11px] text-zinc-600 font-medium shrink-0">
            Latency
          </span>
          <span className="w-16 text-right text-[11px] text-zinc-600 font-medium shrink-0">
            Time
          </span>
          <span className="w-3.5 shrink-0" />
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-violet-400 rounded-full animate-spin" />
            <span className="text-[13px] text-zinc-600">
              Loading requests...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 animate-fade-in">
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
                <path
                  d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                  strokeLinecap="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] text-zinc-400 font-medium mb-1">
                Waiting for webhooks
              </p>
              <p className="text-[13px] text-zinc-600 max-w-xs">
                Send a request to the capture URL and it will appear here in
                real time.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {requests.map((req: any) => (
              <RequestRow key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
