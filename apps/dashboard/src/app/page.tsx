"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode
} from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Copy,
  CheckCheck,
  Github,
  Download,
  Globe,
  Wrench
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { FREE_FEATURES, PAID_FEATURES } from "./constants";
import { ComparisonTable } from "./_components/ComparisonTable";
import { DashboardPreview } from "./_components/DashboardPreview";
import { FaqSection } from "./_components/FaqSection";
import { HeroSection } from "./_components/HeroSection";
import { PricingSection } from "./_components/PricingSection";

const INSTALL_COMMANDS = {
  brew: "brew install usetunnl/tap/tunnl && tunnl start --port 3000",
  npm: "npx tunnl@latest start --port 3000",
  curl: "curl -fsSL https://get.usetunnl.com | sh"
} as const;

const PROVIDERS = [
  "Stripe",
  "GitHub",
  "Clerk",
  "Discord",
  "Shopify",
  "Twilio",
  "SendGrid",
  "Slack"
];

function Reveal({
  children,
  className,
  delay = 0,
  y = 30
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-4 inline-block text-xs font-medium tracking-[0.25em] text-amber-500 uppercase">
      {children}
    </span>
  );
}

function SectionHeading({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-3xl leading-[1.1] font-bold tracking-tight text-stone-100 sm:text-4xl lg:text-5xl",
        className
      )}
    >
      {children}
    </h2>
  );
}

function SectionSub({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
      {children}
    </p>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-200 hover:bg-white/10",
        copied ? "text-amber-500" : "text-stone-400"
      )}
      aria-label="Copy command"
    >
      {copied ? (
        <CheckCheck className="size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

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

function GradientDivider() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)`
        }}
      />
    </div>
  );
}

function GlowCard({
  children,
  className,
  glowOnHover = true
}: {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}) {
  return (
    <div className={cn("group/glow relative h-full rounded-xl", className)}>
      {/* Gradient border layer */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500",
          glowOnHover && "group-hover/glow:opacity-100"
        )}
        style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.3), transparent 40%, transparent 60%, rgba(245,158,11,0.15))`
        }}
      />
      {/* Outer glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-md transition-opacity duration-500",
          glowOnHover && "group-hover/glow:opacity-100"
        )}
        style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.1), transparent 50%)`
        }}
      />
      {/* Inner content */}
      <div className="relative h-full rounded-xl border border-white/5 bg-white/1 p-6">
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [installTab, setInstallTab] = useState<"brew" | "npm" | "curl">("brew");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050504] font-sans text-stone-100 antialiased">
      {/* ─── NAVBAR ─── */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "border-b bg-[#050504]/80 backdrop-blur-xl"
            : "bg-transparent"
        )}
        style={{
          borderColor: scrolled ? "rgba(255,255,255,0.05)" : "transparent"
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a
            href="#"
            className="font-display flex items-center gap-2.5 text-lg font-bold tracking-tight"
          >
            <Image
              src="/favicon.svg"
              alt="Tunnl"
              width={28}
              height={28}
              className="size-7"
            />
            Tunnl
          </a>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[13px] font-medium text-stone-400 md:flex">
            {["Features", "Pricing", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="transition-colors duration-200 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/usetunnl/tunnl"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white lg:flex"
            >
              <Github className="size-3.5" />
              <span>GitHub</span>
            </a>
            <Button asChild className="px-5 py-1.5 text-[13px]">
              <a href="#install">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection />

      <GradientDivider />

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-28 sm:py-36" id="how-it-works">
        <DotGrid />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>How it works</SectionLabel>
              <SectionHeading>Three commands. Zero friction.</SectionHeading>
              <SectionSub>
                Go from install to live webhook debugging in under 30 seconds.
                No accounts, no dashboards, no configuration files.
              </SectionSub>
            </div>
          </Reveal>

          <div className="relative mt-20 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                step: "01",
                title: "Install",
                icon: Download,
                desc: "One command. Works with npm, Homebrew, or curl. No signup required.",
                code: "brew install usetunnl/tap/tunnl"
              },
              {
                step: "02",
                title: "Connect",
                icon: Globe,
                desc: "Start a secure tunnel to your local dev server. Get a public URL instantly.",
                code: "tunnl start --port 3000"
              },
              {
                step: "03",
                title: "Debug",
                icon: Wrench,
                desc: "Inspect requests, replay webhooks, verify signatures. All from your browser.",
                code: "→ localhost:4040"
              }
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="relative rounded-xl border border-white/5 bg-white/1 p-6 transition-colors hover:border-amber-500/20 sm:p-8">
                  {/* Step icon */}
                  <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                    <item.icon className="size-5" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-stone-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    {item.desc}
                  </p>

                  {/* Code snippet */}
                  <div className="mt-5 rounded-md border border-white/5 bg-black/30 px-3 py-2 font-mono text-xs text-amber-800">
                    {item.code}
                  </div>

                  {/* Watermark number */}
                  <span
                    className="font-display pointer-events-none absolute top-5 right-6 text-7xl leading-none font-black select-none"
                    style={{ color: "rgba(255,255,255,0.04)" }}
                  >
                    {item.step}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Local Dashboard</SectionLabel>
              <SectionHeading>
                Every request, under a microscope.
              </SectionHeading>
              <SectionSub>
                Headers, body, response, timing — inspect every detail of every
                webhook. Replay with one click. Diff between requests. No cloud
                needed.
              </SectionSub>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mt-16">
              {/* Ambient glow behind dashboard */}
              <div
                className="pointer-events-none absolute -inset-8 rounded-3xl opacity-30 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center top, rgba(245, 158, 11, 0.08), transparent 60%)"
                }}
              />
              <DashboardPreview />
            </div>
          </Reveal>
        </div>
      </section>

      <GradientDivider />

      {/* ─── FREE FEATURES ─── */}
      <section className="relative py-28 sm:py-36" id="features">
        <DotGrid />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Free forever</SectionLabel>
              <SectionHeading>
                Everything you need to debug webhooks.
              </SectionHeading>
              <SectionSub>
                All core features are free, open source, and run entirely on
                your machine. No usage limits, no trial periods.
              </SectionSub>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FREE_FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 0.06} className="h-full">
                <GlowCard>
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-amber-500/8 text-amber-500 transition-colors group-hover/glow:bg-amber-500/15">
                    <feat.icon className="size-5" />
                  </div>

                  <h3 className="font-display text-base font-semibold text-stone-100">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    {feat.desc}
                  </p>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PAID FEATURES ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Pro features</SectionLabel>
              <SectionHeading>Level up your webhook workflow.</SectionHeading>
              <SectionSub>
                Custom domains, cloud history, mock webhooks, and more. Built
                for teams that ship fast.
              </SectionSub>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PAID_FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 0.06} className="h-full">
                <GlowCard>
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/8 text-amber-500 transition-colors group-hover/glow:bg-amber-500/15">
                      <feat.icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-500 uppercase">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-stone-100">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    {feat.desc}
                  </p>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROVIDER CLOUD ─── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Works with everything</SectionLabel>
              <SectionHeading className="text-2xl sm:text-3xl lg:text-4xl">
                If it sends webhooks, Tunnl catches it.
              </SectionHeading>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-14">
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
                {PROVIDERS.map((name, i) => (
                  <motion.span
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
                    className="font-display text-lg font-semibold tracking-tight transition-colors duration-300 hover:text-amber-400 sm:text-xl"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    {name}
                  </motion.span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GradientDivider />

      {/* ─── COMPARISON TABLE ─── */}
      <section className="relative py-28 sm:py-36">
        <DotGrid />
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Comparison</SectionLabel>
              <SectionHeading>Tunnl vs. the alternatives.</SectionHeading>
              <SectionSub>
                Built specifically for webhook development, not just generic
                tunneling.
              </SectionSub>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ComparisonTable />
          </Reveal>
        </div>
      </section>

      {/* ─── INSTALL / QUICK START ─── */}
      <section className="relative py-28 sm:py-36" id="install">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Quick start</SectionLabel>
              <SectionHeading>Up and running in one command.</SectionHeading>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12">
              <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0A0908]">
                {/* Tab bar */}
                <div className="flex border-b border-white/5">
                  {(["brew", "npm", "curl"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInstallTab(tab)}
                      className={cn(
                        "relative px-5 py-3 font-mono text-xs font-medium transition-colors",
                        installTab === tab ? "text-amber-500" : "text-stone-400"
                      )}
                    >
                      {tab}
                      {installTab === tab && (
                        <motion.div
                          layoutId="install-tab"
                          className="absolute right-0 bottom-0 left-0 h-px bg-amber-500"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Command */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <AnimatePresence mode="wait">
                    <motion.code
                      key={installTab}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="font-mono text-sm text-stone-400"
                    >
                      <span className="text-amber-800">$</span>{" "}
                      {INSTALL_COMMANDS[installTab]}
                    </motion.code>
                  </AnimatePresence>
                  <CopyButton text={INSTALL_COMMANDS[installTab]!} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GradientDivider />

      <PricingSection />

      <FaqSection />

      {/* ─── FOOTER CTA BANNER ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-2xl border px-8 py-16 text-center sm:px-16 sm:py-20"
              style={{
                borderColor: `rgba(245, 158, 11, 0.12)`,
                background: `linear-gradient(135deg, rgba(245,158,11,0.06), rgba(0,0,0,0.4) 70%)`
              }}
            >
              <DotGrid />

              <h2 className="font-display relative text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl lg:text-5xl">
                Ready to stop guessing?
              </h2>
              <p className="relative mt-4 text-base text-stone-400 sm:text-lg">
                Get started in 30 seconds. No signup required.
              </p>

              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild className="group px-7 py-3 text-sm">
                  <a href="#install">
                    Get Started
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <a
                  href="https://github.com/usetunnl/tunnl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-stone-400 transition-colors hover:text-white"
                >
                  Star on GitHub
                </a>
              </div>

              {/* Decorative glows */}
              <div
                className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full opacity-20 blur-[100px]"
                style={{ background: "#F59E0B" }}
              />
              <div
                className="pointer-events-none absolute -right-24 -bottom-24 size-64 rounded-full opacity-10 blur-[100px]"
                style={{ background: "#F59E0B" }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="border-t py-12"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="font-display flex items-center gap-2.5 text-base font-bold tracking-tight">
              <span className="flex size-6 items-center justify-center rounded-md bg-amber-500 text-[10px] font-black text-black">
                T
              </span>
              Tunnl
            </div>

            <div className="flex items-center gap-6 text-xs text-stone-400 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <a
                href="https://github.com/usetunnl/tunnl"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                GitHub
              </a>
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy
              </Link>
              <Link href="/dpa" className="transition-colors hover:text-white">
                DPA
              </Link>
              <Link
                href="/subprocessors"
                className="transition-colors hover:text-white"
              >
                Subprocessors
              </Link>
              <Link href="/aup" className="transition-colors hover:text-white">
                AUP
              </Link>
              <a href="#" className="transition-colors hover:text-white">
                Documentation
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Twitter
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Discord
              </a>
            </div>

            <p className="text-xs text-white/15">
              &copy; {new Date().getFullYear()} Tunnl. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
