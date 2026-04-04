import {
  Terminal,
  Zap,
  Shield,
  Globe,
  Layers,
  Eye,
  Lock,
  Cloud,
  Palette,
  Repeat
} from "lucide-react";

export const FREE_FEATURES = [
  {
    icon: Lock,
    title: "Secure Tunnels",
    desc: "Encrypted connections from the public internet to your localhost. No configuration needed."
  },
  {
    icon: Eye,
    title: "Live Inspection",
    desc: "Real-time request and response viewer with syntax highlighting and formatting."
  },
  {
    icon: Repeat,
    title: "Instant Replay",
    desc: "Replay any webhook with a single click. Modify headers or body before resending."
  },
  {
    icon: Terminal,
    title: "Local Dashboard",
    desc: "A full-featured debugging interface running on your machine. No cloud required."
  },
  {
    icon: Shield,
    title: "Signature Verification",
    desc: "Automatically verify webhook signatures for supported providers."
  }
];

export const PAID_FEATURES = [
  {
    icon: Cloud,
    title: "Cloud Dashboard",
    desc: "Persistent webhook history accessible from anywhere. Share requests with your team via link.",
    tag: "Pro"
  },
  {
    icon: Globe,
    title: "Custom Subdomains",
    desc: "Reserve a permanent subdomain like acme.usetunnl.com. Never update webhook URLs again.",
    tag: "Pro"
  },
  {
    icon: Layers,
    title: "Request Diffing",
    desc: "Compare webhook payloads side-by-side to spot changes between deliveries.",
    tag: "Pro"
  },
  {
    icon: Zap,
    title: "Mock Webhooks",
    desc: "Test with realistic payloads from Stripe, GitHub, Clerk, Shopify and more. Pre-built and ready to fire.",
    tag: "Pro"
  },
  {
    icon: Palette,
    title: "Mock Builder",
    desc: "Create custom webhook payloads for any integration. Save templates and share with your team.",
    tag: "Pro"
  }
];
