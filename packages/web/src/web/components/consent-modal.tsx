import { useEffect, useState } from "react";
import { type Bundle, type ScopeDef, classColor } from "../lib/registry";

interface Props {
  bundle: Bundle;
  email: string;
  alreadyGranted: string[]; // scopes already on the grant (incremental)
  onAllow: (grantedScopes: string[]) => void;
  onCancel: () => void;
}

// Simulates Google's granular (partial) consent screen.
// Users can untick individual scopes — restricted scopes render UNCHECKED by default,
// exactly like Google's real combined-consent behavior.
export function ConsentModal({ bundle, email, alreadyGranted, onAllow, onCancel }: Props) {
  const newScopes = bundle.scopes.filter((s) => !alreadyGranted.includes(s.scope));

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(newScopes.map((s) => [s.scope, bundle.class !== "restricted"])),
  );

  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const toggle = (scope: string) =>
    setChecked((c) => ({ ...c, [scope]: !c[scope] }));

  const anyChecked = Object.values(checked).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200"
        style={{
          transform: visible ? "scale(1)" : "scale(0.96)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Google-style header */}
        <div className="border-b border-[#e6e8ec] px-6 pt-6 pb-4">
          <GoogleG />
          <h2 className="mt-3 text-[20px] font-normal text-[#202124]">
            Runable wants additional access
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#5f6368]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1a73e8] text-[10px] text-white">
              {email.charAt(0).toUpperCase()}
            </span>
            {email}
          </p>
        </div>

        <div className="max-h-[46vh] overflow-y-auto px-6 py-4">
          <p className="mb-3 text-sm text-[#5f6368]">
            This will let <b>Runable</b> for <b>{bundle.feature}</b>:
          </p>

          {bundle.class === "restricted" && (
            <div className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
              ⚠ Restricted scope. Google shows these <b>unchecked by default</b> and
              requires CASA verification before this can ship to all users.
            </div>
          )}

          {newScopes.length === 0 && (
            <p className="text-sm text-[#16a34a]">
              ✓ All scopes for this feature are already granted.
            </p>
          )}

          <ul className="space-y-1">
            {newScopes.map((s) => (
              <ScopeRow
                key={s.scope}
                scope={s}
                checked={!!checked[s.scope]}
                color={classColor(bundle.class)}
                onToggle={() => toggle(s.scope)}
              />
            ))}
          </ul>

          {alreadyGranted.some((g) => bundle.scopes.find((s) => s.scope === g)) && (
            <p className="mt-3 text-xs text-[#5f6368]">
              Some scopes were granted earlier and stack onto the same Google grant
              (incremental authorization).
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#e6e8ec] px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#f1f5ff]"
          >
            Cancel
          </button>
          <button
            disabled={newScopes.length > 0 && !anyChecked}
            onClick={() =>
              onAllow(newScopes.filter((s) => checked[s.scope]).map((s) => s.scope))
            }
            className="rounded-md bg-[#1a73e8] px-5 py-2 text-sm font-medium text-white hover:bg-[#1765cc] disabled:opacity-40"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}

function ScopeRow({
  scope,
  checked,
  color,
  onToggle,
}: {
  scope: ScopeDef;
  checked: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-[#f8f9fa]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 accent-[#1a73e8]"
        />
        <span>
          <span className="block text-sm text-[#202124]">{scope.label}</span>
          <span className="block font-mono text-[11px]" style={{ color }}>
            {scope.scope}
          </span>
        </span>
      </label>
    </li>
  );
}

function GoogleG() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
