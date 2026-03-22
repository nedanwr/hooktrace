import { useState } from "react";

interface HeadersTableProps {
  headers: Record<string, string[]>;
}

export default function HeadersTable({ headers }: HeadersTableProps) {
  const entries = Object.entries(headers).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  if (entries.length === 0) {
    return (
      <div className="py-6 text-center text-[13px] text-zinc-600 italic">
        No headers
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
      }}
    >
      {entries.map(([name, values], i) => (
        <HeaderRow
          key={name}
          name={name}
          value={values.join(", ")}
          isLast={i === entries.length - 1}
        />
      ))}
    </div>
  );
}

function HeaderRow({
  name,
  value,
  isLast,
}: {
  name: string;
  value: string;
  isLast: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group flex items-start gap-4 px-4 py-2 hover:bg-white/2 transition-colors"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-border-subtle)",
      }}
    >
      <span className="font-mono text-[12px] text-violet-400/80 w-[200px] shrink-0 py-0.5 select-all">
        {name}
      </span>
      <span className="font-mono text-[12px] text-zinc-400 flex-1 break-all py-0.5 select-all">
        {value}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-300 shrink-0 mt-0.5"
        title="Copy value"
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
  );
}
