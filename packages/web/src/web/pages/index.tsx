import { useState } from "react";
import { ALL_BUNDLES, BUNDLES, SIGN_IN, type Bundle, classColor, classLabel } from "../lib/registry";
import { ConsentModal } from "../components/consent-modal";
import { CasaGate } from "../components/casa-gate";

const DEMO_EMAIL = "amal@runable.com";

type Phase = "idle" | "casa" | "consent";
interface LogEntry {
  t: string;
  kind: "info" | "grant" | "warn" | "start";
  msg: string;
}

function Index() {
  const [connected, setConnected] = useState(false);
  const [granted, setGranted] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState<Bundle | null>(null);
  const [casaVerified, setCasaVerified] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (kind: LogEntry["kind"], msg: string) =>
    setLog((l) => [
      { t: new Date().toLocaleTimeString([], { hour12: false }), kind, msg },
      ...l,
    ]);

  // Capability resolver (ticket OA-5): derive unlock state purely from granted scopes.
  const scopeState = (b: Bundle): "locked" | "partial" | "unlocked" => {
    const has = b.scopes.filter((s) => granted.includes(s.scope)).length;
    if (has === 0) return "locked";
    if (has === b.scopes.length) return "unlocked";
    return "partial";
  };

  // Start the (native) OAuth flow for a bundle.
  const startFlow = (b: Bundle) => {
    setPending(b);
    addLog(
      "start",
      `GET /auth/google/start?bundle=${b.id}  scopes=[${b.scopes.map((s) => s.scope).join(", ")}]  include_granted_scopes=true`,
    );
    if (b.requiresCasa) {
      setPhase("casa");
    } else {
      setPhase("consent");
    }
  };

  const handleConnect = () => {
    setConnected(true);
    setGranted(SIGN_IN.scopes.map((s) => s.scope));
    addLog("grant", `Connected ${DEMO_EMAIL} — granted sign-in scopes, refresh token stored (encrypted)`);
  };

  const onConsentAllow = (newScopes: string[]) => {
    if (!pending) return;
    const requested = pending.scopes.filter((s) => !granted.includes(s.scope));
    const declined = requested.filter((s) => !newScopes.includes(s.scope));
    setGranted((g) => Array.from(new Set([...g, ...newScopes])));
    addLog(
      "grant",
      `Callback → token exchange OK. Granted: [${newScopes.join(", ") || "none"}]${declined.length ? `  Declined: [${declined.map((s) => s.scope).join(", ")}]` : ""}`,
    );
    if (declined.length) {
      addLog("warn", `Partial consent detected — feature "${pending.feature}" stays gated on missing scopes`);
    }
    setPhase("idle");
    setPending(null);
  };

  const reset = () => {
    setConnected(false);
    setGranted([]);
    setLog([]);
    setPhase("idle");
    setPending(null);
    addLog("info", "Disconnected — tokens revoked, granted-scope set cleared");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-[Poppins,sans-serif] text-[#1a1d21]">
      <div className="mx-auto max-w-[1000px] px-5 py-10">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4f46e5]">
              Native OAuth · Prototype
            </p>
            <h1 className="mt-1 text-3xl font-bold">Connect Google</h1>
            <p className="mt-1 max-w-xl text-sm text-[#5f6570]">
              One entry point, incremental authorization. Sign-in + Calendar + Docs stay
              CASA-free; Gmail &amp; full Drive are gated just-in-time.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#e6e8ec] bg-white px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={casaVerified}
              onChange={(e) => {
                setCasaVerified(e.target.checked);
                addLog("info", `Feature flag CASA_VERIFIED set to ${e.target.checked}`);
              }}
              className="h-4 w-4 accent-[#dc2626]"
            />
            CASA_VERIFIED flag
          </label>
        </header>

        {/* Account card */}
        <section className="mb-6 rounded-2xl border border-[#e6e8ec] bg-white p-5">
          {!connected ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-sm text-[#5f6570]">
                No Google account connected. This single button is your whole entry point.
              </p>
              <button
                onClick={handleConnect}
                className="flex items-center gap-3 rounded-lg border border-[#dadce0] bg-white px-6 py-3 text-sm font-medium text-[#3c4043] shadow-sm transition hover:bg-[#f8f9fa]"
              >
                <GoogleG /> Connect Google
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f46e5] text-lg font-semibold text-white">
                  {DEMO_EMAIL.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold">{DEMO_EMAIL}</p>
                  <p className="text-xs text-[#5f6570]">
                    {granted.length} scopes granted · 1 Google grant (incremental)
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="rounded-md px-3 py-2 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2]"
              >
                Disconnect
              </button>
            </div>
          )}
        </section>

        {connected && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Feature grid */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8a909a]">
                Features
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {BUNDLES.map((b) => (
                  <FeatureTile
                    key={b.id}
                    bundle={b}
                    state={scopeState(b)}
                    onEnable={() => startFlow(b)}
                  />
                ))}
              </div>
            </section>

            {/* Event log */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8a909a]">
                OAuth event log
              </h2>
              <div className="h-[420px] overflow-y-auto rounded-2xl border border-[#e6e8ec] bg-[#0f1117] p-4 font-mono text-[11px] leading-relaxed">
                {log.length === 0 && (
                  <p className="text-[#5f6570]">Waiting for events…</p>
                )}
                {log.map((e, i) => (
                  <div key={i} className="mb-1.5">
                    <span className="text-[#4b5563]">{e.t} </span>
                    <span style={{ color: logColor(e.kind) }}>{e.msg}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Modals */}
      {phase === "casa" && pending && (
        <CasaGate
          bundle={pending}
          casaVerified={casaVerified}
          onProceed={() => setPhase("consent")}
          onCancel={() => {
            addLog("warn", `CASA gate cancelled for ${pending.feature}`);
            setPhase("idle");
            setPending(null);
          }}
        />
      )}
      {phase === "consent" && pending && (
        <ConsentModal
          bundle={pending}
          email={DEMO_EMAIL}
          alreadyGranted={granted}
          onAllow={onConsentAllow}
          onCancel={() => {
            addLog("warn", `Consent cancelled for ${pending.feature}`);
            setPhase("idle");
            setPending(null);
          }}
        />
      )}
    </div>
  );
}

function FeatureTile({
  bundle,
  state,
  onEnable,
}: {
  bundle: Bundle;
  state: "locked" | "partial" | "unlocked";
  onEnable: () => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl border bg-white p-4 transition"
      style={{
        borderColor: state === "unlocked" ? "#bbf7d0" : "#e6e8ec",
        boxShadow: state === "unlocked" ? "0 0 0 1px #bbf7d0" : undefined,
      }}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f8fa] text-lg">
          {bundle.icon}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${classColor(bundle.class)}18`, color: classColor(bundle.class) }}
        >
          {classLabel(bundle.class)}
        </span>
      </div>
      <h3 className="text-sm font-semibold">{bundle.feature}</h3>
      <p className="mt-0.5 mb-3 flex-1 text-xs leading-relaxed text-[#5f6570]">
        {bundle.description}
      </p>

      {state === "unlocked" ? (
        <div className="rounded-lg bg-[#f0fdf4] px-3 py-2 text-xs font-medium text-[#15803d]">
          ✓ Unlocked · {bundle.demoAction}
        </div>
      ) : (
        <button
          onClick={onEnable}
          className="rounded-lg bg-[#4f46e5] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#4338ca]"
        >
          {state === "partial" ? "Grant remaining access" : `Enable — needs ${bundle.feature} access`}
        </button>
      )}
    </div>
  );
}

function logColor(k: LogEntry["kind"]): string {
  switch (k) {
    case "grant":
      return "#4ade80";
    case "warn":
      return "#fbbf24";
    case "start":
      return "#60a5fa";
    default:
      return "#9ca3af";
  }
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// keep referenced so tree-shaking/lint stays happy with the full registry export
void ALL_BUNDLES;

export default Index;
