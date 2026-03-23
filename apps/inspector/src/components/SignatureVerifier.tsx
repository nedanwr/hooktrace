import { useEffect, useState } from "react";

import type { CapturedRequest } from "~/lib/types";
import type { SignatureResult, SignatureProvider } from "~/lib/api";
import { verifySignature, fetchSignatureProviders } from "~/lib/api";

interface SignatureVerifierProps {
  request: CapturedRequest;
}

export default function SignatureVerifier({ request }: SignatureVerifierProps) {
  const [providers, setProviders] = useState<SignatureProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchSignatureProviders()
      .then((p) => {
        setProviders(p);
        if (p.length > 0) {
          // Auto-detect provider from headers.
          const detected = p.find((provider) => {
            const headerName = provider.header;
            return Object.keys(request.headers).some(
              (k) => k.toLowerCase() === headerName.toLowerCase()
            );
          });
          setSelectedProvider(detected?.name ?? p[0].name);
        }
      })
      .catch(() => {});
  }, [request.headers]);

  const selectedProviderInfo = providers.find((p) => p.name === selectedProvider);

  const signatureHeaderValue = selectedProviderInfo
    ? findHeader(request.headers, selectedProviderInfo.header)
    : null;

  const handleVerify = async () => {
    if (!selectedProvider || !secret) return;
    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      const res = await verifySignature(request.id, selectedProvider, secret);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Provider selector */}
      <div className="space-y-2">
        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider block">
          Provider
        </label>
        <div className="flex gap-2 flex-wrap">
          {providers.map((p) => {
            const hasHeader = findHeader(request.headers, p.header) !== null;
            return (
              <button
                key={p.name}
                onClick={() => {
                  setSelectedProvider(p.name);
                  setResult(null);
                }}
                className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  selectedProvider === p.name
                    ? "text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    selectedProvider === p.name
                      ? "var(--color-surface-overlay)"
                      : "var(--color-surface)",
                  border: `1px solid ${
                    selectedProvider === p.name
                      ? "var(--color-accent)"
                      : "var(--color-border)"
                  }`,
                }}
              >
                <span className="capitalize">{p.name}</span>
                {hasHeader && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detected signature header */}
      {selectedProviderInfo && (
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-medium text-zinc-500">
              Signature Header
            </span>
            <span className="font-mono text-[12px] text-violet-400/80">
              {selectedProviderInfo.header}
            </span>
          </div>
          {signatureHeaderValue ? (
            <div className="font-mono text-[12px] text-zinc-400 break-all bg-black/20 rounded-md px-3 py-2">
              {signatureHeaderValue}
            </div>
          ) : (
            <div className="text-[12px] text-amber-400/80 italic">
              Header not found in this request
            </div>
          )}
        </div>
      )}

      {/* Secret input */}
      <div className="space-y-2">
        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider block">
          Signing Secret
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
              placeholder={
                selectedProvider === "stripe"
                  ? "whsec_..."
                  : "Enter your webhook signing secret"
              }
              className="w-full font-mono text-[13px] text-zinc-300 px-3 py-2 rounded-lg outline-none transition-colors placeholder:text-zinc-700"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1"
              title={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={handleVerify}
            disabled={!secret || verifying}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-accent)",
              color: "white",
            }}
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying
              </span>
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {error && (
        <div
          className="rounded-lg p-4 text-[13px] text-red-400"
          style={{
            background: "rgba(248, 113, 113, 0.06)",
            border: "1px solid rgba(248, 113, 113, 0.15)",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          className="rounded-lg p-5"
          style={{
            background: result.valid
              ? "rgba(52, 211, 153, 0.06)"
              : "rgba(248, 113, 113, 0.06)",
            border: `1px solid ${
              result.valid
                ? "rgba(52, 211, 153, 0.2)"
                : "rgba(248, 113, 113, 0.2)"
            }`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.valid ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(52, 211, 153)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14px] font-medium text-emerald-400">
                    Signature Valid
                  </div>
                  <div className="text-[12px] text-zinc-500">
                    The webhook signature is authentic
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(248, 113, 113)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6M9 9l6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14px] font-medium text-red-400">
                    Signature Invalid
                  </div>
                  {result.error && (
                    <div className="text-[12px] text-zinc-500">
                      {result.error}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div
            className="rounded-md p-3 space-y-1.5"
            style={{ background: "var(--color-surface)" }}
          >
            <DetailRow label="Provider" value={result.provider} />
            <DetailRow label="Header" value={result.header} />
            {result.value && (
              <DetailRow
                label="Signature"
                value={result.value}
                mono
                truncate
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] text-zinc-600 w-[70px] shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-[12px] text-zinc-400 break-all ${mono ? "font-mono" : ""} ${
          truncate ? "truncate max-w-[400px]" : ""
        }`}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function findHeader(
  headers: Record<string, string[]>,
  name: string
): string | null {
  // Direct match.
  if (headers[name]?.length) return headers[name][0];
  // Case-insensitive match.
  const lowerName = name.toLowerCase();
  for (const [key, vals] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName && vals.length > 0) {
      return vals[0];
    }
  }
  return null;
}
