import { useState, useCallback } from "react";

export interface HeaderEntry {
  key: string;
  value: string;
}

interface EditableHeadersTableProps {
  headers: HeaderEntry[];
  onChange: (headers: HeaderEntry[]) => void;
}

export default function EditableHeadersTable({
  headers,
  onChange,
}: EditableHeadersTableProps) {
  const [focusedRow, setFocusedRow] = useState<number | null>(null);

  const updateHeader = useCallback(
    (index: number, field: "key" | "value", val: string) => {
      const updated = headers.map((h, i) =>
        i === index ? { ...h, [field]: val } : h
      );
      onChange(updated);
    },
    [headers, onChange]
  );

  const removeHeader = useCallback(
    (index: number) => {
      onChange(headers.filter((_, i) => i !== index));
    },
    [headers, onChange]
  );

  const addHeader = useCallback(() => {
    onChange([...headers, { key: "", value: "" }]);
  }, [headers, onChange]);

  return (
    <div>
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Column headers */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span className="w-[200px] shrink-0">Name</span>
          <span className="flex-1">Value</span>
          <span className="w-8 shrink-0" />
        </div>

        {headers.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-zinc-600 italic">
            No headers — click "Add header" to get started
          </div>
        ) : (
          headers.map((header, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 group transition-colors"
              style={{
                borderBottom:
                  i < headers.length - 1
                    ? "1px solid var(--color-border-subtle)"
                    : "none",
                background:
                  focusedRow === i ? "rgba(139, 92, 246, 0.03)" : "transparent",
              }}
            >
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(i, "key", e.target.value)}
                onFocus={() => setFocusedRow(i)}
                onBlur={() => setFocusedRow(null)}
                placeholder="Header name"
                className="w-[200px] shrink-0 font-mono text-[12px] text-violet-400/80 bg-transparent outline-none py-1.5 placeholder:text-zinc-700"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(i, "value", e.target.value)}
                onFocus={() => setFocusedRow(i)}
                onBlur={() => setFocusedRow(null)}
                placeholder="Value"
                className="flex-1 font-mono text-[12px] text-zinc-400 bg-transparent outline-none py-1.5 placeholder:text-zinc-700"
              />
              <button
                onClick={() => removeHeader(i)}
                className="w-8 h-8 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all rounded"
                title="Remove header"
              >
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
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add header button */}
      <button
        onClick={addHeader}
        className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-violet-400 transition-colors"
      >
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
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add header
      </button>
    </div>
  );
}

// Utility: convert Record<string, string[]> to HeaderEntry[]
export function headersToEntries(
  headers: Record<string, string[]>
): HeaderEntry[] {
  return Object.entries(headers).flatMap(([key, values]) =>
    values.map((value) => ({ key, value }))
  );
}

// Utility: convert HeaderEntry[] to Record<string, string[]>
export function entriesToHeaders(
  entries: HeaderEntry[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const { key, value } of entries) {
    if (!key.trim()) continue;
    if (!result[key]) result[key] = [];
    result[key].push(value);
  }
  return result;
}
