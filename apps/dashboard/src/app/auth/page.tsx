"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function AuthPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050504]">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-right aurora sweep */}
        <div
          className="absolute -top-[30%] -right-[10%] h-[80%] w-[70%] rotate-[-15deg] rounded-full opacity-[0.07] blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at center, #F59E0B 0%, #D97706 40%, transparent 70%)"
          }}
        />
        {/* Bottom-left subtle fill */}
        <div
          className="absolute -bottom-[20%] -left-[15%] h-[60%] w-[50%] rounded-full opacity-[0.04] blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse at center, #FBBF24 0%, transparent 70%)"
          }}
        />
        {/* Subtle noise grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px"
          }}
        />
      </div>

      {/* ── Back to home ── */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link
          href="/"
          className="group flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Home
        </Link>
      </motion.div>

      {/* ── Auth card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex w-full max-w-[420px] flex-col items-center px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex size-14 items-center justify-center rounded-2xl border border-white/1 bg-white/4 shadow-[0_0_40px_rgba(245,158,11,0.06)]"
        >
          <Image
            src="/favicon.svg"
            alt="Tunnl"
            width={28}
            height={28}
            className="drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
          />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10 text-center"
        >
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-white">
            Log in to Tunnl
          </h1>
          <p className="mt-2 text-[0.9rem] text-white/40">
            Debug, replay and test webhooks locally.
          </p>
        </motion.div>

        {/* OAuth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex w-full flex-col gap-3"
        >
          <button className="group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/1 bg-white/4 text-[0.9rem] font-medium text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/7 hover:text-white active:scale-[0.98]">
            <GoogleIcon className="size-[18px]" />
            Continue with Google
          </button>

          <button className="group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/1 bg-white/4 text-[0.9rem] font-medium text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/7 hover:text-white active:scale-[0.98]">
            <GitHubIcon className="size-[18px]" />
            Continue with GitHub
          </button>
        </motion.div>

        {/* Divider with amber accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="my-8 flex w-full items-center gap-4"
        >
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/6" />
          <div className="size-1 rounded-full bg-amber-500/30" />
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/6" />
        </motion.div>

        {/* Info text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-[0.8rem] leading-relaxed text-white/25"
        >
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="text-white/40 underline decoration-white/10 underline-offset-2 transition-colors hover:text-white/60 hover:decoration-white/20"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-white/40 underline decoration-white/10 underline-offset-2 transition-colors hover:text-white/60 hover:decoration-white/20"
          >
            Privacy Policy
          </Link>
          .
        </motion.p>
      </motion.div>
    </div>
  );
}
