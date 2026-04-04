"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const TERMINAL_LINES = [
  { text: "$ tunnl start --port 3000", delay: 0, type: "command" as const },
  { text: "", delay: 600, type: "blank" as const },
  {
    text: "  ◆ Tunnel established",
    delay: 900,
    type: "success" as const
  },
  {
    text: "  → https://dev-f7k2.usetunnl.com → localhost:3000",
    delay: 1300,
    type: "url" as const
  },
  { text: "", delay: 1600, type: "blank" as const },
  {
    text: "  ● POST /webhooks/stripe     200  23ms",
    delay: 2200,
    type: "request" as const
  },
  {
    text: "  ● POST /webhooks/clerk      200  18ms",
    delay: 2900,
    type: "request" as const
  },
  {
    text: "  ● POST /webhooks/github     200  31ms",
    delay: 3500,
    type: "request" as const
  },
  {
    text: "  ● POST /webhooks/discord    200  12ms",
    delay: 4100,
    type: "request" as const
  }
];

export function CRTTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    TERMINAL_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const getLineClassName = (type: string) => {
    switch (type) {
      case "command":
        return "text-stone-100";
      case "success":
        return "text-amber-300";
      case "url":
        return "text-amber-500";
      case "request":
        return "text-stone-400";
      default:
        return "text-transparent";
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        className="absolute -inset-4 rounded-2xl bg-[radial-gradient(ellipse,rgba(245,158,11,0.15),transparent_70%)] opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.15), transparent 70%)"
        }}
      />

      <div className="relative overflow-hidden rounded-xl border border-amber-500/15 bg-[#0A0908]">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
          </div>
          <span className="ml-2 text-[11px] font-medium tracking-wider text-stone-400 uppercase">
            Terminal
          </span>
        </div>

        <div className="relative min-h-[240px] p-5 font-mono text-[13px] leading-relaxed sm:min-h-[280px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,158,11,0.08) 2px, rgba(245,158,11,0.08) 4px)"
            }}
          />

          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`whitespace-pre ${getLineClassName(line.type)}`}
              style={{ minHeight: "1.6em" }}
            >
              {line.text}
              {i === visibleLines - 1 && line.type !== "blank" && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] bg-amber-500"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
