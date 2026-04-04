"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "Is Tunnl really free?",
    a: "Yes. The core features - secure tunnels, live inspection, replay, local dashboard, and signature verification - are free forever. No credit card, no trial period. Pro features like request diffing, mock webhooks, and custom subdomains are available with an upgrade."
  },
  {
    q: "How does the secure tunnel work?",
    a: "Tunnl establishes an encrypted connection between our edge network and your local development server. Incoming webhooks hit your public usetunnl.com URL and are forwarded to localhost in real-time."
  },
  {
    q: "Can I replay webhooks?",
    a: "Absolutely. Every webhook captured by Tunnl can be replayed with one click. You can also modify headers and body before resending, making it easy to test edge cases."
  },
  {
    q: "What providers are supported?",
    a: "Tunnl works with any service that sends webhooks - Stripe, GitHub, Clerk, Discord, Shopify, Twilio, SendGrid, Slack, and hundreds more. If it sends HTTP, Tunnl can catch it."
  },
  {
    q: "How is Tunnl different from ngrok?",
    a: "Tunnl is purpose-built for webhook development. While ngrok is a general tunnel, Tunnl adds replay, signature verification, and a dedicated debugging dashboard for free - plus Pro features like diffing, mock webhooks, and custom subdomains."
  },
  {
    q: "How is Tunnl different from cloudflared?",
    a: "cloudflared is a solid tunnel for exposing local services, but it does not focus on webhook workflows. Tunnl adds built-in request inspection, replay, signature verification, and a dedicated local dashboard, with Pro options for diffing, mock webhooks, and team features."
  },
  {
    q: "Is my data secure?",
    a: "All tunnel traffic is encrypted end-to-end with TLS. Webhook data in the free tier is ephemeral and only exists locally. Pro tier cloud data is encrypted at rest and in transit."
  }
] as const;

function Reveal({
  children,
  delay = 0
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function FaqSection() {
  return (
    <section className="relative py-28 sm:py-36" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="mb-4 inline-block text-xs font-medium tracking-[0.25em] text-amber-500 uppercase">
              FAQ
            </span>
            <h2 className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-stone-100 sm:text-4xl lg:text-5xl">
              Common questions.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-14 space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border bg-white/1 backdrop-blur-none"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <AccordionTrigger className="text-stone-100 hover:text-amber-400">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-stone-400">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
