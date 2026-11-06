import { type Bundle } from "../lib/registry";

interface Props {
  bundle: Bundle;
  casaVerified: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

// Interstitial shown BEFORE consent for restricted scopes (Gmail / full Drive).
// In production this is gated by a CASA_VERIFIED feature flag (ticket IA-2):
// restricted scopes can't ship until a CASA Tier 2 Letter of Validation is on file.
export function CasaGate({ bundle, casaVerified, onProceed, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fef2f2] text-xl">
            {bundle.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[#1a1d21]">
              {bundle.feature} needs a restricted scope
            </h2>
            <p className="text-sm text-[#dc2626]">Requires CASA Tier 2 verification</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#5f6570]">
          {bundle.feature} requests a <b>restricted</b> Google scope
          {" "}
          (<span className="font-mono text-xs text-[#dc2626]">{bundle.scopes[0]?.scope}</span>).
          Google requires any app using restricted scopes to pass an annual third-party
          security audit before it can serve more than 100 users.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <Stat label="Cost" value="$675–3,600" />
          <Stat label="Timeline" value="~6 weeks" />
          <Stat label="Cadence" value="Annual" />
        </div>

        <div className="mt-4 rounded-lg bg-[#f7f8fa] px-4 py-3 text-xs text-[#5f6570]">
          <b className="text-[#1a1d21]">Why this is gated last:</b> only users who opt
          into Gmail/Drive ever pull the app into CASA scope. Sign-in, Calendar and
          Docs (via <span className="font-mono">drive.file</span>) avoid it entirely.
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: casaVerified ? "#dcfce7" : "#fee2e2",
              color: casaVerified ? "#15803d" : "#b91c1c",
            }}
          >
            CASA_VERIFIED = {String(casaVerified)}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#5f6570] hover:bg-[#f1f2f4]"
            >
              Cancel
            </button>
            <button
              onClick={onProceed}
              disabled={!casaVerified}
              className="rounded-md bg-[#dc2626] px-5 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {casaVerified ? "Continue to consent" : "Blocked — flag off"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e6e8ec] py-2">
      <div className="font-semibold text-[#1a1d21]">{value}</div>
      <div className="text-[#8a909a]">{label}</div>
    </div>
  );
}
