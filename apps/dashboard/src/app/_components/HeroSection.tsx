"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";

import { CRTTerminal } from "./CRTTerminal";

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

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.7], [0, -60]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      <DotGrid />

      <div
        className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/3 opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent 65%)"
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/3 opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.12), transparent 65%)"
        }}
      />

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative mx-auto max-w-7xl px-6"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div
                className="relative mb-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-[12px] font-medium text-amber-500"
              >
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.12) 50%, transparent 100%)"
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2
                  }}
                />
                <Sparkles className="relative size-3" />
                <span className="relative">Open source · Free forever</span>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="font-display text-[3.2rem] leading-[1.05] font-bold tracking-[-0.03em] text-stone-100 sm:text-[4.2rem] lg:text-[4.8rem]">
                Webhooks,{" "}
                <span
                  className="text-amber-500"
                  style={{
                    textShadow: "0 0 60px rgba(245, 158, 11, 0.15)"
                  }}
                >
                  decoded.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-400">
                Debug, replay, and test live webhook integrations on localhost.
                Secure tunnels, instant replays, and a local dashboard — all
                free.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild className="group overflow-hidden px-7 py-3 text-sm">
                  <a href="#install">
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)"
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 3
                      }}
                    />
                    <span className="relative">Get Started</span>
                  </a>
                </Button>
                <a
                  href="#features"
                  className="text-sm font-medium text-stone-400 transition-colors hover:text-white"
                >
                  See Features
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-12 flex gap-8">
                {[
                  { n: "< 30s", label: "Setup time" },
                  { n: "0", label: "Config needed" },
                  { n: "∞", label: "Free replays" }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-xl font-bold text-amber-500">
                      {stat.n}
                    </div>
                    <div className="mt-0.5 text-xs text-stone-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={40}>
            <CRTTerminal />
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
