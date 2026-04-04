"use client";

import { ArrowRight, Check } from "lucide-react";

import { Button } from "~/components/ui/button";

const FREE_TIER_FEATURES = [
  "Secure encrypted tunnels",
  "Live request inspection",
  "Instant webhook replay",
  "Local debugging dashboard",
  "Signature verification",
  "Community support"
] as const;

const PRO_TIER_FEATURES = [
  "Everything in Free",
  "Cloud dashboard & history",
  "Custom subdomains",
  "Request diffing",
  "Mock webhooks (Stripe, GitHub, etc.)",
  "Mock builder for custom payloads",
  "Team workspaces",
  "Shareable request links",
  "Priority support"
] as const;

function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #F5F0E8 0.8px, transparent 0.8px)",
        backgroundSize: "24px 24px"
      }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-4 inline-block text-xs font-medium tracking-[0.25em] text-amber-500 uppercase">
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-stone-100 sm:text-4xl lg:text-5xl">
      {children}
    </h2>
  );
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
      {children}
    </p>
  );
}

export function PricingSection() {
  return (
    <section className="relative py-28 sm:py-36" id="pricing">
      <DotGrid />
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading>
            Free to start. Pro when you&apos;re ready.
          </SectionHeading>
          <SectionSub>
            No surprises. The free tier is genuinely free — forever. Upgrade
            when your team needs cloud features.
          </SectionSub>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          <div className="flex h-full flex-col rounded-xl border border-white/5 bg-white/1 p-8">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-100">
                Free
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-stone-100">
                  $0
                </span>
                <span className="text-sm text-stone-400">/ forever</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Everything you need for local webhook development. No limits, no
                trial.
              </p>
            </div>

            <div className="mt-8 flex-1 space-y-3">
              {FREE_TIER_FEATURES.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm">
                  <Check className="size-3.5 shrink-0 text-stone-400" />
                  <span className="text-stone-400">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="#install"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-3 text-sm font-semibold text-stone-100 transition-colors hover:bg-white/5"
            >
              Get Started
            </a>
          </div>

          <div className="relative h-full rounded-xl">
            <div
              className="absolute -inset-px rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.4), rgba(245,158,11,0.05) 40%, rgba(245,158,11,0.05) 60%, rgba(245,158,11,0.25))"
              }}
            />
            <div
              className="pointer-events-none absolute -inset-px rounded-xl opacity-50 blur-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.15), transparent 50%)"
              }}
            />
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-xl p-8"
              style={{
                background:
                  "linear-gradient(170deg, rgba(245,158,11,0.06), #0A0908 60%)"
              }}
            >
              <div className="absolute top-6 right-6 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-500 uppercase">
                Popular
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-amber-500">
                  Pro
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-stone-100">
                    $8
                  </span>
                  <span className="text-sm text-stone-400">/ month</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-400">
                  Cloud dashboard, custom domains, mock webhooks, and team
                  features for professional development.
                </p>
              </div>

              <div className="mt-8 flex-1 space-y-3">
                {PRO_TIER_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm">
                    <Check className="size-3.5 shrink-0 text-amber-500" />
                    <span className="text-stone-400">{item}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-8 w-full py-3 text-sm">
                <a href="#install">
                  Start Free, Upgrade Later
                  <ArrowRight className="size-4" />
                </a>
              </Button>

              <div className="pointer-events-none absolute -right-16 -bottom-16 size-48 rounded-full bg-amber-500 opacity-15 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
