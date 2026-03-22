interface StatusBadgeProps {
  statusCode: number;
  size?: "sm" | "md";
}

export default function StatusBadge({ statusCode, size = "sm" }: StatusBadgeProps) {
  const config = getStatusConfig(statusCode);
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium ${sizeClasses}`}
      style={{
        background: config.bg,
        color: config.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.dot }}
      />
      {statusCode || "ERR"}
    </span>
  );
}

function getStatusConfig(code: number) {
  if (code === 0) {
    return { bg: "#27272a", text: "#71717a", dot: "#52525b" };
  }
  if (code < 300) {
    return { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" };
  }
  if (code < 400) {
    return { bg: "rgba(234, 179, 8, 0.1)", text: "#facc15", dot: "#eab308" };
  }
  if (code < 500) {
    return { bg: "rgba(249, 115, 22, 0.1)", text: "#fb923c", dot: "#f97316" };
  }
  return { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" };
}
