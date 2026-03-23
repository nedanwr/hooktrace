import { useMemo } from "react";

import type { DiffChange, DiffSummary } from "~/lib/api";

interface DiffViewProps {
  changes: DiffChange[];
  summary: DiffSummary;
}

const SECTION_LABELS: Record<string, string> = {
  method: "Method",
  path: "Path",
  query: "Query String",
  header: "Request Headers",
  body: "Request Body",
  status: "Response Status",
  response_header: "Response Headers",
  response_body: "Response Body",
};

const SECTION_ORDER = [
  "method",
  "path",
  "query",
  "status",
  "header",
  "response_header",
  "body",
  "response_body",
];

export default function DiffView({ changes, summary }: DiffViewProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, DiffChange[]> = {};
    for (const change of changes) {
      if (!groups[change.section]) {
        groups[change.section] = [];
      }
      groups[change.section].push(change);
    }
    return groups;
  }, [changes]);

  const orderedSections = useMemo(() => {
    return SECTION_ORDER.filter((s) => grouped[s]);
  }, [grouped]);

  if (changes.length === 0) {
    return (
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
            className="text-emerald-400"
          >
            <path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[14px] text-zinc-400">
          These requests are identical
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-zinc-500">
          {summary.totalChanges} {summary.totalChanges === 1 ? "change" : "changes"}
        </span>
        {summary.added > 0 && (
          <Badge color="emerald" label={`+${summary.added} added`} />
        )}
        {summary.removed > 0 && (
          <Badge color="red" label={`-${summary.removed} removed`} />
        )}
        {summary.modified > 0 && (
          <Badge color="amber" label={`~${summary.modified} modified`} />
        )}
      </div>

      {/* Changes by section */}
      {orderedSections.map((section) => (
        <DiffSection
          key={section}
          title={SECTION_LABELS[section] ?? section}
          changes={grouped[section]}
        />
      ))}
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  const colorMap: Record<string, { text: string; bg: string }> = {
    emerald: { text: "rgb(52, 211, 153)", bg: "rgba(52, 211, 153, 0.1)" },
    red: { text: "rgb(248, 113, 113)", bg: "rgba(248, 113, 113, 0.1)" },
    amber: { text: "rgb(251, 191, 36)", bg: "rgba(251, 191, 36, 0.1)" },
  };
  const c = colorMap[color] ?? colorMap.amber;

  return (
    <span
      className="text-[11px] font-mono px-2 py-0.5 rounded-md"
      style={{ color: c.text, background: c.bg }}
    >
      {label}
    </span>
  );
}

function DiffSection({
  title,
  changes,
}: {
  title: string;
  changes: DiffChange[];
}) {
  const isBodySection = changes.some(
    (c) => c.section === "body" || c.section === "response_body"
  );

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="px-4 py-2.5 text-[12px] font-medium text-zinc-500 uppercase tracking-wider"
        style={{
          background: "var(--color-surface-overlay)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {title}
      </div>

      {isBodySection ? (
        <div className="divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
          {changes.map((change, i) => (
            <BodyDiffRow key={i} change={change} />
          ))}
        </div>
      ) : (
        <div>
          {changes.map((change, i) => (
            <FieldDiffRow
              key={i}
              change={change}
              isLast={i === changes.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldDiffRow({
  change,
  isLast,
}: {
  change: DiffChange;
  isLast: boolean;
}) {
  const typeColors: Record<string, { text: string; bg: string; label: string }> = {
    added: { text: "rgb(52, 211, 153)", bg: "rgba(52, 211, 153, 0.08)", label: "+" },
    removed: { text: "rgb(248, 113, 113)", bg: "rgba(248, 113, 113, 0.08)", label: "-" },
    modified: { text: "rgb(251, 191, 36)", bg: "rgba(251, 191, 36, 0.08)", label: "~" },
  };
  const c = typeColors[change.type] ?? typeColors.modified;

  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-border-subtle)",
        background: c.bg,
      }}
    >
      <span
        className="font-mono text-[11px] font-bold w-4 text-center shrink-0 pt-0.5"
        style={{ color: c.text }}
      >
        {c.label}
      </span>
      <span className="font-mono text-[12px] text-violet-400/80 w-[180px] shrink-0 pt-0.5">
        {change.key}
      </span>
      <div className="flex-1 min-w-0 flex gap-2">
        {change.type === "modified" ? (
          <>
            <div className="flex-1 min-w-0">
              <span
                className="font-mono text-[12px] break-all px-1.5 py-0.5 rounded"
                style={{ color: "rgb(248, 113, 113)", background: "rgba(248, 113, 113, 0.06)" }}
              >
                {change.left || <em className="text-zinc-700">empty</em>}
              </span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-zinc-700 shrink-0 mt-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <div className="flex-1 min-w-0">
              <span
                className="font-mono text-[12px] break-all px-1.5 py-0.5 rounded"
                style={{ color: "rgb(52, 211, 153)", background: "rgba(52, 211, 153, 0.06)" }}
              >
                {change.right || <em className="text-zinc-700">empty</em>}
              </span>
            </div>
          </>
        ) : (
          <span className="font-mono text-[12px] text-zinc-400 break-all pt-0.5">
            {change.type === "added" ? change.right : change.left}
          </span>
        )}
      </div>
    </div>
  );
}

function BodyDiffRow({ change }: { change: DiffChange }) {
  if (change.type === "added" || change.type === "removed") {
    const isAdded = change.type === "added";
    const body = isAdded ? change.right : change.left;
    const lines = body.split("\n");

    return (
      <div className="p-4">
        <span
          className="inline-block text-[11px] font-mono font-bold px-1.5 py-0.5 rounded mb-2"
          style={{
            color: isAdded ? "rgb(52, 211, 153)" : "rgb(248, 113, 113)",
            background: isAdded ? "rgba(52, 211, 153, 0.1)" : "rgba(248, 113, 113, 0.1)",
          }}
        >
          {isAdded ? "Added" : "Removed"}
        </span>
        <pre
          className="text-[12px] font-mono text-zinc-400 overflow-auto max-h-[300px] rounded-lg p-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)" }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line || " "}</div>
          ))}
        </pre>
      </div>
    );
  }

  // Modified body — show side-by-side.
  const leftLines = change.left.split("\n");
  const rightLines = change.right.split("\n");

  return (
    <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--color-border)" }}>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ color: "rgb(248, 113, 113)", background: "rgba(248, 113, 113, 0.1)" }}
          >
            Left
          </span>
        </div>
        <pre
          className="text-[12px] font-mono overflow-auto max-h-[300px] rounded-lg p-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)" }}
        >
          {leftLines.map((line, i) => {
            const rightLine = rightLines[i];
            const isDifferent = rightLine !== undefined && line !== rightLine;
            const isExtra = i >= rightLines.length;
            return (
              <div
                key={i}
                style={{
                  background: isDifferent
                    ? "rgba(248, 113, 113, 0.06)"
                    : isExtra
                    ? "rgba(248, 113, 113, 0.04)"
                    : undefined,
                  color: isDifferent || isExtra ? "rgb(248, 113, 113)" : "rgb(161, 161, 170)",
                }}
              >
                {line || " "}
              </div>
            );
          })}
        </pre>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ color: "rgb(52, 211, 153)", background: "rgba(52, 211, 153, 0.1)" }}
          >
            Right
          </span>
        </div>
        <pre
          className="text-[12px] font-mono overflow-auto max-h-[300px] rounded-lg p-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)" }}
        >
          {rightLines.map((line, i) => {
            const leftLine = leftLines[i];
            const isDifferent = leftLine !== undefined && line !== leftLine;
            const isExtra = i >= leftLines.length;
            return (
              <div
                key={i}
                style={{
                  background: isDifferent
                    ? "rgba(52, 211, 153, 0.06)"
                    : isExtra
                    ? "rgba(52, 211, 153, 0.04)"
                    : undefined,
                  color: isDifferent || isExtra ? "rgb(52, 211, 153)" : "rgb(161, 161, 170)",
                }}
              >
                {line || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
