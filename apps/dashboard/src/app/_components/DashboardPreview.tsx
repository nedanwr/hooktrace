"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Repeat } from "lucide-react";

import { cn } from "~/lib/utils";

const DASHBOARD_EVENTS = [
  {
    id: "evt_1",
    method: "POST",
    path: "/api/webhooks/stripe",
    status: 200,
    time: "2s ago"
  },
  {
    id: "evt_2",
    method: "POST",
    path: "/api/webhooks/github",
    status: 200,
    time: "14s ago"
  },
  {
    id: "evt_3",
    method: "POST",
    path: "/api/webhooks/shopify",
    status: 401,
    time: "28s ago"
  },
  {
    id: "evt_4",
    method: "POST",
    path: "/api/webhooks/clerk",
    status: 200,
    time: "43s ago"
  }
] as const;

const JSON_KEY_COLOR = "#92610A";
const JSON_STRING_COLOR = "#A78BFA";
const JSON_NUMBER_COLOR = "#34D399";

export function DashboardPreview() {
  const [selectedEvent, setSelectedEvent] = useState(DASHBOARD_EVENTS[0]!);
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "response">(
    "headers"
  );

  const detailTabs = ["headers", "body", "response"] as const;

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0A0908]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-[11px] font-medium tracking-wider text-stone-400 uppercase">
            Tunnl Inspector
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-500">
          <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
          Live
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: 380 }}>
        <div className="shrink-0 border-b border-white/5 lg:w-[320px] lg:border-r lg:border-b-0">
          <div className="border-b border-white/5 px-4 py-2.5 text-[11px] font-medium tracking-wider text-stone-400 uppercase">
            Recent Events
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {DASHBOARD_EVENTS.map((evt) => (
              <button
                key={evt.id}
                onClick={() => setSelectedEvent(evt as typeof selectedEvent)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors",
                  selectedEvent.id === evt.id
                    ? "bg-amber-500/4"
                    : "hover:bg-white/2"
                )}
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    background:
                      evt.status < 400
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                    color: evt.status < 400 ? "#22C55E" : "#EF4444"
                  }}
                >
                  {evt.status}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-stone-100">
                  {evt.path}
                </span>
                <span className="shrink-0 text-[11px] text-stone-400">
                  {evt.time}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/8 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-500">
                {selectedEvent.method}
              </span>
              <span className="font-mono text-xs text-stone-100">
                {selectedEvent.path}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-medium text-stone-400 transition-colors hover:bg-white/5"
              >
                <Repeat className="mr-1 inline size-3" />
                Replay
              </button>
            </div>
          </div>

          <div className="flex gap-0 border-b border-white/5">
            {detailTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-4 py-2.5 text-[11px] font-medium tracking-wider capitalize transition-colors",
                  activeTab === tab ? "text-amber-500" : "text-stone-400"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="dash-tab"
                    className="absolute right-0 bottom-0 left-0 h-px bg-amber-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 font-mono text-xs leading-relaxed">
            {activeTab === "headers" && (
              <div className="space-y-1.5">
                {[
                  ["content-type", "application/json"],
                  ["stripe-signature", "t=1714000000,v1=abc123..."],
                  ["user-agent", "Stripe/1.0 (+https://stripe.com)"],
                  ["x-request-id", "req_f7k2m9x3"],
                  ["x-forwarded-for", "54.187.205.235"]
                ].map(([key, val]) => (
                  <div key={key} className="flex gap-2">
                    <span style={{ color: JSON_KEY_COLOR }}>{key}:</span>
                    <span className="text-stone-400">{val}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "body" && (
              <pre className="text-stone-400">
                <span className="text-stone-100">{"{"}</span>
                {"\n"}
                {"  "}
                <span style={{ color: JSON_KEY_COLOR }}>&quot;id&quot;</span>
                <span className="text-stone-100">: </span>
                <span style={{ color: JSON_STRING_COLOR }}>
                  &quot;evt_1PwQ9kJ0hXy&quot;
                </span>
                ,{"\n"}
                {"  "}
                <span style={{ color: JSON_KEY_COLOR }}>&quot;type&quot;</span>
                <span className="text-stone-100">: </span>
                <span style={{ color: JSON_STRING_COLOR }}>
                  &quot;checkout.session.completed&quot;
                </span>
                ,{"\n"}
                {"  "}
                <span style={{ color: JSON_KEY_COLOR }}>&quot;data&quot;</span>
                <span className="text-stone-100">: {"{"}</span>
                {"\n"}
                {"    "}
                <span style={{ color: JSON_KEY_COLOR }}>&quot;amount&quot;</span>
                <span className="text-stone-100">: </span>
                <span style={{ color: JSON_NUMBER_COLOR }}>4999</span>,{"\n"}
                {"    "}
                <span style={{ color: JSON_KEY_COLOR }}>
                  &quot;currency&quot;
                </span>
                <span className="text-stone-100">: </span>
                <span style={{ color: JSON_STRING_COLOR }}>&quot;usd&quot;</span>
                {"\n"}
                {"  "}
                <span className="text-stone-100">{"}"}</span>
                {"\n"}
                <span className="text-stone-100">{"}"}</span>
              </pre>
            )}
            {activeTab === "response" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#22C55E"
                    }}
                  >
                    200 OK
                  </span>
                  <span className="text-stone-400">{selectedEvent.time}</span>
                </div>
                <pre className="text-stone-400">
                  <span className="text-stone-100">{"{"}</span>
                  {"\n"}
                  {"  "}
                  <span style={{ color: JSON_KEY_COLOR }}>
                    &quot;received&quot;
                  </span>
                  <span className="text-stone-100">: </span>
                  <span style={{ color: JSON_NUMBER_COLOR }}>true</span>
                  {"\n"}
                  <span className="text-stone-100">{"}"}</span>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
