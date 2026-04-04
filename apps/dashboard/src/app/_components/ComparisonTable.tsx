"use client";

import { Check, X } from "lucide-react";

const COMPARISON_ROWS = [
  { feature: "Free tier", tunnl: true, ngrok: "Limited", cloudflared: true },
  { feature: "Webhook replay", tunnl: true, ngrok: false, cloudflared: false },
  {
    feature: "Local dashboard",
    tunnl: true,
    ngrok: false,
    cloudflared: false
  },
  {
    feature: "Request inspection",
    tunnl: true,
    ngrok: true,
    cloudflared: false
  },
  {
    feature: "Custom domains",
    tunnl: "Pro",
    ngrok: "Paid",
    cloudflared: true
  },
  {
    feature: "Mock webhooks",
    tunnl: "Pro",
    ngrok: false,
    cloudflared: false
  },
  { feature: "Open source", tunnl: true, ngrok: false, cloudflared: true },
  {
    feature: "Request diffing",
    tunnl: "Pro",
    ngrok: false,
    cloudflared: false
  }
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/5 text-white/20">
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  }

  return <span className="text-xs font-medium text-amber-800">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="mt-16 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="border-b text-left"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <th className="pr-8 pb-4 text-xs font-medium tracking-wider text-stone-400 uppercase">
              Feature
            </th>
            <th className="pr-8 pb-4 text-center">
              <span className="font-display text-sm font-bold text-amber-500">
                Tunnl
              </span>
            </th>
            <th className="font-display pr-8 pb-4 text-center text-sm font-medium text-stone-400">
              ngrok
            </th>
            <th className="font-display pb-4 text-center text-sm font-medium text-stone-400">
              cloudflared
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr
              key={row.feature}
              className="border-b transition-colors hover:bg-white/1"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <td className="py-4 pr-8 text-sm text-stone-100">
                {row.feature}
              </td>
              <td className="py-4 pr-8 text-center">
                <div className="flex justify-center">
                  <ComparisonCell value={row.tunnl} />
                </div>
              </td>
              <td className="py-4 pr-8 text-center">
                <div className="flex justify-center">
                  <ComparisonCell value={row.ngrok} />
                </div>
              </td>
              <td className="py-4 text-center">
                <div className="flex justify-center">
                  <ComparisonCell value={row.cloudflared} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
