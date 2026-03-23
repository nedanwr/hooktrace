import { Outlet, Link, useLocation } from "react-router";

import { useRequestStore } from "~/store/requestStore";

export default function Layout() {
  const requestCount = useRequestStore((s) => s.requests.length);
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(10, 10, 11, 0.8)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="drop-shadow-sm"
                >
                  <path
                    d="M6 1L7.5 5H11L8 7.5L9.5 11L6 8.5L2.5 11L4 7.5L1 5H4.5L6 1Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="font-semibold text-[15px] text-zinc-100 tracking-tight">
                HookTrace
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavLink to="/" active={location.pathname === "/"}>
                Requests
              </NavLink>
              <NavLink to="/mock" active={location.pathname === "/mock"}>
                Mock
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-[13px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-zinc-400">Live</span>
              </span>
            </div>
            <div
              className="h-4"
              style={{ borderLeft: "1px solid var(--color-border)" }}
            />
            <span className="text-[13px] text-zinc-500 font-mono tabular-nums">
              {requestCount}
              <span className="text-zinc-600 ml-1">
                {requestCount === 1 ? "request" : "requests"}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-5">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
        active
          ? "text-zinc-100 bg-white/5"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/3"
      }`}
    >
      {children}
    </Link>
  );
}
