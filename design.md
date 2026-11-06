# Design — Connect Google Prototype

Internal engineering demo showing the native OAuth incremental-authorization UX. Clean, product-grade, Google-adjacent but clearly a Runable surface.

## Typography
- Display + body: **Poppins** (Google Fonts). Headings 600/700, body 400/500.
- Mono for scope strings + code: `ui-monospace, "SF Mono", Menlo, monospace`.

## Color
- Surface: near-white `#f7f8fa` app bg, white cards.
- Ink: `#1a1d21` primary text, `#5f6570` muted.
- Accent (Runable/primary action): deep indigo `#4f46e5`.
- Google consent modal uses Google's palette for realism: blue `#1a73e8`, greys.
- Scope class semantics: none = grey, sensitive = amber `#b45309`/`#f59e0b`, restricted = red `#dc2626`.
- Success/granted = green `#16a34a`.

## Layout
- Centered app shell, max-w ~980px. Left: account + capability grid. Modal overlays for consent.
- Cards with soft border `#e6e8ec`, radius 14px, subtle shadow.

## Motion
- Staggered fade-up on load. Consent modal scales in. Granting a scope animates the capability tile flipping to unlocked.

## UX patterns
- One "Connect Google" primary button = single entry point.
- Feature tiles gated by capability resolver; locked tiles show "Enable — needs Google X".
- Consent modal simulates Google's granular consent (checkboxes, restricted scopes shown with warnings).
- Restricted (Gmail/Drive) triggers a distinct CASA interstitial before the consent modal.
- Event log panel shows the underlying OAuth mechanics (scopes requested, granted, incremental stacking) so engineers see what's happening.
