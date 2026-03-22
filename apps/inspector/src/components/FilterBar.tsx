import { useRequests } from "~/hooks/useRequests";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "success", label: "2xx" },
  { value: "redirect", label: "3xx" },
  { value: "client_error", label: "4xx" },
  { value: "server_error", label: "5xx" },
];

export default function FilterBar() {
  const {
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    clearRequests,
    requests,
  } = useRequests();

  return (
    <div className="flex items-center gap-3 mb-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Filter requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-shadow"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        />
      </div>

      {/* Status filter pills */}
      <div
        className="flex items-center rounded-lg p-0.5"
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-2.5 py-[5px] rounded-md text-[12px] font-medium transition-all ${
              statusFilter === opt.value
                ? "bg-violet-500/15 text-violet-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Clear */}
      {requests.length > 0 && (
        <button
          onClick={clearRequests}
          className="ml-auto px-3 py-[7px] rounded-lg text-[12px] font-medium text-zinc-500 hover:text-red-400 transition-colors"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
