import Link from "next/link";
import Image from "next/image";

export default function LegalLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, rgba(245,158,11,0.08), transparent 28%), #050504"
      }}
    >
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-display flex items-center gap-2.5 text-sm font-bold tracking-tight text-stone-100"
          >
            <Image
              src="/favicon.svg"
              alt="Tunnl"
              width={28}
              height={28}
              className="size-7"
            />
            Tunnl
          </Link>
          <nav className="flex items-center gap-4 text-xs text-stone-400 sm:gap-6">
            <Link href="/terms" className="transition-colors hover:text-white">
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">{children}</main>
    </div>
  );
}
