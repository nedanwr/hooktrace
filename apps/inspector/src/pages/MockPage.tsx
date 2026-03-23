import { Link } from "react-router";

import MockSender from "~/components/MockSender";

export default function MockPage() {
  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors mb-5 group"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Requests
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[18px] font-semibold text-zinc-100 mb-1.5">
          Mock Webhook
        </h1>
        <p className="text-[13px] text-zinc-500">
          Compose and send a mock webhook request to your local dev server.
        </p>
      </div>

      <MockSender />
    </div>
  );
}
