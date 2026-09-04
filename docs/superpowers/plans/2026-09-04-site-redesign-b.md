# Site Redesign — Sub-project B (Public site + auth) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public landing (`src/app/page.tsx`), plus the auth and marketing pages, against an evolved dark-theme design-system layer — 1Password-level spacing, hierarchy, and section rhythm — keeping KF-1's identity (dark, blue accent, Silkscreen wordmark).

**Architecture:** A lean primitive layer in `src/components/site/` (`Section`, `SectionHead`, `FeatureCard`, `Illustration`, `CTAButton`, `SecuritySpec`), plus 6 inline-SVG illustrations in `src/components/illustrations/`, plus a `src/content/landing.ts` content module. The landing becomes a thin composition of 8 section components. Type roles are utility classes in `globals.css`. No route changes, no auth/logic changes, no new dependencies. The existing motion system (`Reveals`, `HeroReveal`) is reused via `[data-reveal]`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript, GSAP (already installed).

**Spec:** `docs/superpowers/specs/2026-09-04-site-redesign-b-design.md` — read it alongside this plan. Section numbers below (S1–S6) refer to it.

## Global Constraints

- **No test framework exists** (`package.json` scripts: `dev`, `build`, `start`, `lint`). Per-task verification is `npm run build` (must be tsc-clean) + `npm run lint` (must be clean) + a stated visual/a11y check. **Do not add a test runner.**
- **No new dependencies.** GSAP is the only animation lib and it's present.
- **No route changes, no auth/logic/flow changes.** This is presentation only.
- **Brand identity is kept:** dark theme, blue `#1d5f8f` accent, Silkscreen (`--font-pixel`) for the wordmark and `.t-kicker` only — never in an `h1`/`h2`.
- **Copy:** terse Spanish, rioplatense "vos". Reuse existing strings verbatim where the spec says so.
- **Tokens** (`src/app/globals.css`, already defined): `--color-gray #0a0e15`, `--color-paper #212631`, `--color-ink #edf0f4`, `--color-ink-soft #e0e4eb`, `--color-ink-reverse #0a0e15`, `--color-blue #1d5f8f`, `--color-blue-soft #cfe6ee`, `--color-danger #f87171`, `--color-border rgba(255,255,255,0.12)`. Fonts: `--font-display` (Archivo), `--font-pixel` (Silkscreen), `--font-body-sans` (IBM Plex Sans), `--font-geist-mono`.
- **Already in `globals.css`:** `button:not(:disabled):active { transform: scale(0.97) }`, and a `@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)` block that solidifies `.glass` and `[class*="backdrop-blur"]`. Do not remove or duplicate these.
- **Existing motion components stay untouched:** `src/components/reveals.tsx` (`<Reveals />` animates every `[data-reveal]` on scroll; already handles `prefers-reduced-motion`), `src/components/hero-reveal.tsx` (`<HeroReveal>` staggers `[data-reveal]` inside `[data-hero]`; also runs one float loop on `[data-float]` — after this plan there are no `[data-float]` elements, which is fine).
- **Commit + push each task** to the feature branch `feat/site-redesign-b`. Do not merge to `develop`/`main` until the whole plan is verified.
- **Out of scope:** dashboard (sub-project C), admin (sub-project D), any brand/logo/palette change, real screenshots, removing `public/anim-bits-hero-1.*` (just stop referencing them).

---

## Task 1: Type scale + spacing conventions in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS utility classes `.t-display`, `.t-h2`, `.t-h3`, `.t-kicker`. Every later task uses these for headings.

- [ ] **Step 1: Add the type-role utilities**

In `src/app/globals.css`, after the `.glass { ... }` rule (and before the `code, kbd` rule), add:

```css
/* ── Type roles ──────────────────────────────────────────────────────────
   Redesign scale. Silkscreen (--font-pixel) is now accents only: the
   wordmark and .t-kicker. All large headings use Archivo (--font-display). */
.t-display {
  font-family: var(--font-display), ui-sans-serif, sans-serif;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.t-h2 {
  font-family: var(--font-display), ui-sans-serif, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.15;
  letter-spacing: -0.015em;
  font-weight: 600;
}
.t-h3 {
  font-family: var(--font-display), ui-sans-serif, sans-serif;
  font-size: 1.125rem;
  line-height: 1.3;
  letter-spacing: 0;
  font-weight: 600;
}
.t-kicker {
  font-family: var(--font-pixel), ui-monospace, monospace;
  font-size: 0.75rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-blue);
}

/* Section rhythm (reference — applied via Tailwind classes in components):
   between top-level sections: gap-16 sm:gap-24
   carded-section padding:     p-8 sm:p-12
   section-head bottom margin: mb-10 sm:mb-14, max-w-2xl
   shell width: max-w-5xl (max-w-6xl for illustration-wide sections)
   prose block width: max-w-2xl */
```

- [ ] **Step 2: Verify**

Run: `npm run build && npm run lint`
Expected: both clean. Nothing consumes the classes yet.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(redesign): type-scale utilities (.t-display/.t-h2/.t-h3/.t-kicker)"
```

---

## Task 2: `<Section>` + `<SectionHead>`

**Files:**
- Create: `src/components/site/section.tsx`
- Create: `src/components/site/section-head.tsx`

**Interfaces:**
- Consumes: `.t-h2`, `.t-kicker` (Task 1).
- Produces:
  - `Section({ id?, variant?: "plain" | "card" | "emphasis" | "glass", wide?: boolean, className?, children }): JSX` — default `variant="plain"`.
  - `SectionHead({ kicker: string, title: string, lead?: string }): JSX` — renders a `data-reveal` block; the `<h2>` gets `id={slug(title)}`.
  - `slug(s: string): string` exported from `section-head.tsx` (lowercase, spaces→`-`, strip non-`[a-z0-9-]`).

- [ ] **Step 1: `section-head.tsx`**

Create `src/components/site/section-head.tsx`:

```tsx
export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SectionHead({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: string;
  lead?: string;
}) {
  return (
    <div data-reveal className="mb-10 max-w-2xl sm:mb-14">
      <p className="t-kicker">{kicker}</p>
      <h2 id={slug(title)} className="t-h2 mt-2 text-ink">
        {title}
      </h2>
      {lead ? <p className="mt-4 leading-relaxed text-ink-soft">{lead}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: `section.tsx`**

Create `src/components/site/section.tsx`:

```tsx
type Variant = "plain" | "card" | "emphasis" | "glass";

const SURFACE: Record<Variant, string> = {
  plain: "",
  card: "rounded-2xl border border-border-soft bg-paper p-8 sm:p-12",
  emphasis: "rounded-2xl border border-blue/25 bg-blue/[0.07] p-8 backdrop-blur-md sm:p-12",
  glass: "glass rounded-2xl p-8 sm:p-12",
};

export function Section({
  id,
  variant = "plain",
  wide = false,
  className = "",
  children,
}: {
  id?: string;
  variant?: Variant;
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`w-full ${wide ? "max-w-6xl" : "max-w-5xl"} ${SURFACE[variant]} ${className}`}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 3: Verify**

`npm run build && npm run lint` — clean. Not yet used.

- [ ] **Step 4: Commit**

```bash
git add src/components/site/section.tsx src/components/site/section-head.tsx
git commit -m "feat(redesign): Section + SectionHead primitives"
```

---

## Task 3: `<CTAButton>` (Link + submit)

**Files:**
- Create: `src/components/site/cta-button.tsx`

**Interfaces:**
- Consumes: `next/link`.
- Produces: `CTAButton(props): JSX` where `props` is one of:
  - `{ href: string; variant?: "primary" | "secondary"; className?: string; children }` → renders `<Link>`.
  - `{ type: "submit" | "button"; variant?: "primary" | "secondary"; disabled?: boolean; className?: string; children }` → renders `<button>`.
  - default `variant = "primary"`.

- [ ] **Step 1: Write it**

Create `src/components/site/cta-button.tsx`:

```tsx
import Link from "next/link";

const BASE =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition active:scale-[0.98]";
const VARIANT = {
  primary: "bg-ink text-gray hover:bg-ink/90",
  secondary: "border border-border-soft text-ink hover:bg-paper",
} as const;

type Common = {
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
};

export function CTAButton(
  props: Common & ({ href: string } | { type: "submit" | "button"; disabled?: boolean })
) {
  const { variant = "primary", className = "", children } = props;
  const cls = `${BASE} ${VARIANT[variant]} ${className}`;
  if ("href" in props) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={props.type}
      disabled={props.disabled}
      className={`${cls} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify** — `npm run build && npm run lint` clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/site/cta-button.tsx
git commit -m "feat(redesign): CTAButton (Link + submit variants)"
```

---

## Task 4: `<FeatureCard>` + `<Illustration>`

**Files:**
- Create: `src/components/site/feature-card.tsx`
- Create: `src/components/site/illustration.tsx`

**Interfaces:**
- Consumes: `.t-h3` (Task 1).
- Produces:
  - `FeatureCard({ Icon, title, body, wide? }): JSX` where `Icon: React.ComponentType<{ className?: string }>`.
  - `Illustration({ children, caption?, align? }): JSX`, `align?: "center" | "start"` default `"center"`.

- [ ] **Step 1: `feature-card.tsx`**

Create `src/components/site/feature-card.tsx` (extracted from the current inline markup in `src/app/page.tsx` — the "Qué incluye" grid cards):

```tsx
export function FeatureCard({
  Icon,
  title,
  body,
  wide = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  wide?: boolean;
}) {
  return (
    <div
      data-reveal
      className={`rounded-2xl border border-blue/30 bg-blue/[0.08] p-6 backdrop-blur-md ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-full bg-blue-soft text-blue"
      >
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="t-h3 mt-4 text-ink">{title}</h3>
      <p className="mt-1 max-w-xl text-sm text-ink-soft">{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: `illustration.tsx`**

Create `src/components/site/illustration.tsx`:

```tsx
export function Illustration({
  children,
  caption,
  align = "center",
}: {
  children: React.ReactNode;
  caption?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      data-reveal
      className={`w-full ${align === "center" ? "mx-auto" : ""} [&>svg]:h-auto [&>svg]:w-full`}
    >
      {children}
      {caption ? (
        <p className="mt-3 text-center text-xs text-ink-soft">{caption}</p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Verify** — `npm run build && npm run lint` clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/site/feature-card.tsx src/components/site/illustration.tsx
git commit -m "feat(redesign): FeatureCard + Illustration primitives"
```

---

## Task 5: `<SecuritySpec>`

**Files:**
- Create: `src/components/site/security-spec.tsx`

**Interfaces:**
- Consumes: `.t-kicker` (Task 1).
- Produces: `SecuritySpec({ groups, compact? }): JSX` where
  `groups: { label: string; items: { claim: string; plain: string }[] }[]`, `compact?: boolean`.

- [ ] **Step 1: Write it**

Create `src/components/site/security-spec.tsx`:

```tsx
type SpecGroup = { label: string; items: { claim: string; plain: string }[] };

export function SecuritySpec({
  groups,
  compact = false,
}: {
  groups: SpecGroup[];
  compact?: boolean;
}) {
  return (
    <div
      data-reveal
      className={
        compact
          ? "flex flex-col gap-6"
          : "grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2"
      }
    >
      {groups.map((g) => (
        <div key={g.label}>
          <p className="t-kicker">{g.label}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {g.items.map((it) => (
              <li key={it.claim}>
                <p className="text-sm font-semibold text-ink">{it.claim}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{it.plain}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify** — `npm run build && npm run lint` clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/site/security-spec.tsx
git commit -m "feat(redesign): SecuritySpec fact-sheet component"
```

---

## Task 6: Refine `SiteHeader` + `SiteFooter`

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`

**Interfaces:** No signature change. Visual only.

- [ ] **Step 1: Read both files** and the current landing usage.

- [ ] **Step 2: `SiteHeader` pass**

Keep: the dark pill `<nav>`, the logo `<img>`, the active-route pill logic (`usePathname` — it's already a client component), all links and hrefs. Adjust only:
- Ensure the wordmark and any text labels use consistent sizing; nav link labels stay body font, `text-sm`.
- Keep `active` state = `bg-blue-soft text-ink-reverse`, inactive = `text-gray/80 hover:text-gray`.
- Spacing: `px-5 py-3` on the pill is fine; ensure `gap-3` between nav links on `sm`.
- No structural rewrite. If nothing needs changing, leave it — note that in the task completion.

- [ ] **Step 3: `SiteFooter` pass**

Keep structure (columns, legal links, Kitifica credit). Adjust: column headings to `.t-kicker`, comfortable `gap` and top padding consistent with the new section rhythm (`mt-16 sm:mt-24` equivalent via the page layout, not the footer itself). Body links `text-sm text-ink-soft hover:text-ink`.

- [ ] **Step 4: Verify** — `npm run build && npm run lint` clean. Load `/` and `/login` in the dev server; header + footer render, nav active pill still works on `/login`.

- [ ] **Step 5: Commit**

```bash
git add src/components/site-header.tsx src/components/site-footer.tsx
git commit -m "feat(redesign): SiteHeader + SiteFooter craft pass"
```

---

## Task 7: `KeyFlowIllustration` (hero)

**Files:**
- Create: `src/components/illustrations/key-flow.tsx`

**Interfaces:**
- Produces: `KeyFlowIllustration(): JSX` — a single inline `<svg aria-hidden="true">`.

**Composition brief (S5):** ~16:10 `viewBox` (e.g. `0 0 480 300`). Three beats left→right: (1) a closed box = the stored credential (filled block, small keyhole), (2) a link "chip" carrying a key glyph = the share link, (3) a device/person opening it (screen outline with the secret revealed as short bars). Connect the beats with thin directional strokes/arrows. Palette: strokes `#1d5f8f` / `#cfe6ee`, fills sparing in `#1d5f8f` at low opacity and `#cfe6ee`, text-tone details `#e0e4eb`. Geometric, pixel-art-adjacent (right-angle joints, blocky), `stroke-width` 2, `stroke-linecap="square"`. No gradients, no 3D, transparent background. Must read at ~380px wide.

- [ ] **Step 1: Author the component**

Create `src/components/illustrations/key-flow.tsx`:

```tsx
export function KeyFlowIllustration() {
  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      aria-hidden="true"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Author the 3-beat key-flow per the composition brief.
          Groups: #credential (closed box), #link (chip + key), #open (device).
          Connect with <path stroke="#1d5f8f" stroke-width="2"> arrows. */}
    </svg>
  );
}
```

Then fill the `<svg>` with the actual paths/rects/lines realizing the brief. Keep every coordinate deliberate; no `<image>`, no external refs.

- [ ] **Step 2: Verify visually**

`npm run build && npm run lint`. In the dev server, temporarily drop `<KeyFlowIllustration />` onto `/` (or a scratch route) and check: renders crisp at desktop and at 375px, colors match the palette, no layout overflow, reads as "credential → link → opened".

- [ ] **Step 3: Commit**

```bash
git add src/components/illustrations/key-flow.tsx
git commit -m "feat(redesign): KeyFlowIllustration (hero)"
```

---

## Task 8: Step illustrations (Save / Share / Audit)

**Files:**
- Create: `src/components/illustrations/step-save.tsx`
- Create: `src/components/illustrations/step-share.tsx`
- Create: `src/components/illustrations/step-audit.tsx`

**Interfaces:**
- Produces: `StepSaveIllustration()`, `StepShareIllustration()`, `StepAuditIllustration()` — each a single inline `<svg aria-hidden="true">`.

**Composition brief (S5):** ~1:1 `viewBox` (`0 0 120 120`), small, one concept each:
- Save: a lock closing over a small block (the credential going in encrypted).
- Share: a link chip with a timer ring around it (expiry).
- Audit: a short list with checkmarks and an eye glyph.
Same palette and geometric style as Task 7. `stroke-width` 2. Transparent bg.

- [ ] **Step 1: Author the three components**

For each file:

```tsx
export function StepSaveIllustration() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-hidden="true" className="w-full" xmlns="http://www.w3.org/2000/svg">
      {/* lock closing over a block — per brief */}
    </svg>
  );
}
```

(and the analogous `StepShareIllustration` / `StepAuditIllustration`). Fill each with real geometry.

- [ ] **Step 2: Verify** — `npm run build && npm run lint`. Visual spot-check the three at ~80–120px.

- [ ] **Step 3: Commit**

```bash
git add src/components/illustrations/step-save.tsx src/components/illustrations/step-share.tsx src/components/illustrations/step-audit.tsx
git commit -m "feat(redesign): step illustrations (save/share/audit)"
```

---

## Task 9: `ScatteredSecretsIllustration` + `RolesIllustration`

**Files:**
- Create: `src/components/illustrations/scattered-secrets.tsx`
- Create: `src/components/illustrations/roles.tsx`

**Interfaces:**
- Produces: `ScatteredSecretsIllustration()`, `RolesIllustration()` — inline `<svg aria-hidden="true">` each.

**Composition brief (S5):**
- Scattered secrets: ~16:9 (`0 0 400 225`). Password-shaped fragments (blocky `••••` bars, a `key=value` scrap) placed across a chat bubble, a doc corner, an envelope — deliberately unaligned, slightly rotated. Conveys "dispersas, sin control". Same palette; use `#f87171` (danger) sparingly on one exposed fragment.
- Roles: ~16:9 (`0 0 400 225`). Two badge shapes labelled with dot-rows: "Editor" (more filled dots) and "Lector" (fewer), and an envelope feeding into them (the invite). Blue palette, no danger tone.

- [ ] **Step 1: Author both.** Same file skeleton as Task 7/8; fill with real geometry per brief.

- [ ] **Step 2: Verify** — `npm run build && npm run lint`. Visual spot-check.

- [ ] **Step 3: Commit**

```bash
git add src/components/illustrations/scattered-secrets.tsx src/components/illustrations/roles.tsx
git commit -m "feat(redesign): scattered-secrets + roles illustrations"
```

---

## Task 10: `src/content/landing.ts`

**Files:**
- Create: `src/content/landing.ts`

**Interfaces:**
- Consumes: icon components from `@/components/icons`, illustration components from Tasks 7–9.
- Produces (exact exports the section components in Tasks 11–14 import):
  - `stats: { label: string; value: string; Icon: IconType }[]`
  - `problems: { title: string; body: string; Icon: IconType }[]` (3, verbatim from current `page.tsx`)
  - `steps: { n: string; title: string; body: string; Illustration: () => JSX.Element }[]` (3, bodies verbatim, `Illustration` = the matching Step component)
  - `teamSteps: { n: string; title: string; body: string }[]` (3, verbatim from current `page.tsx` "Para equipos" inline array)
  - `features: { title: string; body: string; Icon: IconType; wide?: boolean }[]` — **exactly these 4** (drop "Tu equipo, con roles" and "Clave que nunca vemos"): `Expiración automática`, `Revocación instantánea`, `Passkeys y 2FA`, `Sesión que se cuida sola` — bodies verbatim from current `page.tsx`.
  - `faqs: { q: string; a: string }[]` (verbatim from current `page.tsx`, including the team FAQ and the rewritten "¿Ustedes pueden ver mis contraseñas?").
  - `securitySpec: { label: string; items: { claim: string; plain: string }[] }[]` — the 4 groups from spec S3 §5 (Cifrado / Compartir / Cuenta / Auditoría), copied verbatim.
  - `type IconType = React.ComponentType<{ className?: string }>` (exported).

- [ ] **Step 1: Create the module**

Open the current `src/app/page.tsx`, copy the `stats`, `problems`, `steps` (drop the `Icon`, add `Illustration`), `teamSteps` (the inline array in the "Para equipos" section), `faqs` arrays verbatim into `src/content/landing.ts`. Add the trimmed `features` (4 entries) and the `securitySpec` groups from the spec. Example shape:

```ts
import type { ComponentType } from "react";
import {
  ClockIcon, ShieldOffIcon, FingerprintIcon, LogOutIcon,
  ShuffleIcon, SearchXIcon, ShieldAlertIcon, KeyRoundIcon,
} from "@/components/icons";
import { StepSaveIllustration } from "@/components/illustrations/step-save";
import { StepShareIllustration } from "@/components/illustrations/step-share";
import { StepAuditIllustration } from "@/components/illustrations/step-audit";

export type IconType = ComponentType<{ className?: string }>;

export const stats: { label: string; value: string; Icon: IconType }[] = [
  { label: "Credenciales gratis de libre uso por cuenta", value: "20", Icon: KeyRoundIcon },
  { label: "Rango de expiración configurable por link", value: "1h–7d", Icon: ClockIcon },
];

export const problems: { title: string; body: string; Icon: IconType }[] = [
  /* copy the 3 from page.tsx verbatim */
];

export const steps: { n: string; title: string; body: string; Illustration: () => React.JSX.Element }[] = [
  { n: "01", title: "Guarda", body: "…verbatim…", Illustration: StepSaveIllustration },
  { n: "02", title: "Comparte", body: "…verbatim…", Illustration: StepShareIllustration },
  { n: "03", title: "Audita", body: "…verbatim…", Illustration: StepAuditIllustration },
];

export const teamSteps: { n: string; title: string; body: string }[] = [
  /* copy the 3 from the "Para equipos" inline array verbatim */
];

export const features: { title: string; body: string; Icon: IconType; wide?: boolean }[] = [
  { title: "Expiración automática", body: "…verbatim…", Icon: ClockIcon },
  { title: "Revocación instantánea", body: "…verbatim…", Icon: ShieldOffIcon },
  { title: "Passkeys y 2FA", body: "…verbatim…", Icon: FingerprintIcon },
  { title: "Sesión que se cuida sola", body: "…verbatim…", Icon: LogOutIcon },
];

export const faqs: { q: string; a: string }[] = [
  /* copy verbatim from page.tsx */
];

export const securitySpec: { label: string; items: { claim: string; plain: string }[] }[] = [
  {
    label: "Cifrado",
    items: [
      { claim: "AES-256-GCM", plain: "Cada credencial se guarda cifrada, con un estándar que usan bancos y gobiernos." },
      { claim: "Zero-knowledge en los links", plain: "La llave para abrir un link nunca toca nuestro servidor. Sin ella, lo que guardamos es texto ilegible." },
    ],
  },
  {
    label: "Compartir",
    items: [
      { claim: "Expiración 1h–7d", plain: "Cada link deja de funcionar solo, en el plazo que elijas." },
      { claim: "Revocación instantánea", plain: "Cortás cualquier link con un click, antes de que expire." },
      { claim: "Un destinatario", plain: "Un link es para una persona. Cada apertura queda registrada." },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { claim: "Passkeys y 2FA", plain: "Entrá con huella, cara o PIN, o con código de una app de autenticación." },
      { claim: "Sesión que expira", plain: "Si te quedás inactivo, te avisamos antes de cerrar la sesión." },
      { claim: "Anti-fuerza bruta", plain: "Límite de intentos en el login por IP." },
    ],
  },
  {
    label: "Auditoría",
    items: [
      { claim: "Registro inmutable", plain: "Cada vista, cada revocación, cada cambio de acceso queda escrito y no se puede editar." },
      { claim: "Con IP aproximada y persona", plain: "Sabés quién entró a qué y cuándo. La IP se guarda truncada." },
    ],
  },
];
```

- [ ] **Step 2: Verify** — `npm run build && npm run lint`. `page.tsx` still uses its own inline consts and is untouched; this module just exists.

- [ ] **Step 3: Commit**

```bash
git add src/content/landing.ts
git commit -m "feat(redesign): landing content module"
```

---

## Task 11: Hero section component + wire into `page.tsx`

**Files:**
- Create: `src/components/site/sections/hero.tsx`
- Modify: `src/app/page.tsx` (replace the hero block; remove `<video>` + security-badge grid)

**Interfaces:**
- Consumes: `Section`, `CTAButton` (Tasks 2–3), `Illustration` (Task 4), `KeyFlowIllustration` (Task 7), `stats` (Task 10), `HeroReveal`, `SiteHeader`, `LockIcon`.
- Produces: `HeroSection(): JSX`.

- [ ] **Step 1: Build `hero.tsx`**

```tsx
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { HeroReveal } from "@/components/hero-reveal";
import { Section } from "@/components/site/section";
import { CTAButton } from "@/components/site/cta-button";
import { Illustration } from "@/components/site/illustration";
import { KeyFlowIllustration } from "@/components/illustrations/key-flow";
import { LockIcon } from "@/components/icons";
import { stats } from "@/content/landing";

export function HeroSection() {
  return (
    <div className="w-full max-w-5xl rounded-2xl border border-border-soft bg-paper p-4 shadow-[0_1px_0_rgba(22,19,14,0.04)] sm:p-6">
      <SiteHeader />
      <HeroReveal>
        <div data-hero className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="flex flex-col">
            <span
              data-reveal
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-xs font-medium text-ink-reverse"
            >
              <LockIcon aria-hidden="true" className="h-3.5 w-3.5" /> Encriptado extremo a extremo en cada link
            </span>
            <h1 data-reveal className="t-display text-ink">
              Comparte credenciales sin dejar rastro en el chat
            </h1>
            <p data-reveal className="mt-5 max-w-md leading-relaxed text-ink-soft">
              Invitá a tu equipo por correo, guarda accesos con links que se autodestruyen en
              horas o días, y mira exactamente quién entró a qué y cuándo. Sin spreadsheets,
              sin plaintext.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <CTAButton href="/register">Crear mi bóveda →</CTAButton>
              <CTAButton href="/login" variant="secondary">Ya tengo cuenta</CTAButton>
            </div>
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-6 border-t border-border-soft pt-5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue" />
                  <div>
                    <p className="font-display text-lg font-semibold leading-none text-ink">{s.value}</p>
                    <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Illustration>
            <div className="glass rounded-2xl p-6 sm:p-8">
              <KeyFlowIllustration />
            </div>
          </Illustration>
        </div>
      </HeroReveal>
    </div>
  );
}
```

- [ ] **Step 2: Swap into `page.tsx`**

In `src/app/page.tsx`: replace the entire hero `<div className="w-full max-w-5xl rounded-2xl ...">…</div>` block (the one containing `<SiteHeader />` and `<HeroReveal>`) with `<HeroSection />`. Add `import { HeroSection } from "@/components/site/sections/hero";`. Delete the now-unused `securityBadges` const, the `<video>`/`<source>` markup (was inside the old hero), and any icon imports that become unused (run lint to find them). Do NOT touch the other sections yet.

- [ ] **Step 3: Verify**

`npm run build && npm run lint` — clean. Dev server `/`: hero renders with the illustration where the video/badge grid was; entrance animation plays; CTAs work; stats show; no console errors; 375px OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/site/sections/hero.tsx src/app/page.tsx
git commit -m "feat(redesign): hero section — KeyFlowIllustration replaces video + badge grid"
```

---

## Task 12: "El problema" + "Cómo funciona" sections

**Files:**
- Create: `src/components/site/sections/problema.tsx`
- Create: `src/components/site/sections/como-funciona.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Section`, `SectionHead`, `Illustration`, `CTAButton`, `problems` + `steps` (Task 10), `ScatteredSecretsIllustration` (Task 9).
- Produces: `ProblemaSection()`, `ComoFuncionaSection()`.

- [ ] **Step 1: `problema.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { ScatteredSecretsIllustration } from "@/components/illustrations/scattered-secrets";
import { problems } from "@/content/landing";

export function ProblemaSection() {
  return (
    <Section aria-labelledby={slug("No es la contraseña. Es dónde vive.")}>
      <SectionHead kicker="El problema" title="No es la contraseña. Es dónde vive." />
      <Illustration>
        <div className="mb-8 max-w-xl">
          <ScatteredSecretsIllustration />
        </div>
      </Illustration>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {problems.map((p) => (
          <div key={p.title} data-reveal className="rounded-2xl border border-border-soft bg-paper p-6">
            <p.Icon aria-hidden="true" className="h-6 w-6 text-blue" />
            <h3 className="t-h3 mt-4 text-ink">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

> Note: `<Section>` doesn't forward `aria-labelledby`. Either add `...rest` spread to `Section`'s props, or wrap the `aria-labelledby` on the inner content. Simplest: extend `Section` to accept and spread `aria-labelledby?: string` onto the `<section>`. Do that in this task (one-line prop addition to `section.tsx`).

- [ ] **Step 2: Extend `Section` for `aria-labelledby`**

In `src/components/site/section.tsx`, add `"aria-labelledby"?: string` to the props type and pass it through to `<section>`.

- [ ] **Step 3: `como-funciona.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { CTAButton } from "@/components/site/cta-button";
import { steps } from "@/content/landing";

export function ComoFuncionaSection() {
  return (
    <Section variant="card" aria-labelledby={slug("Tres pasos, cero fricción")}>
      <SectionHead kicker="Cómo funciona" title="Tres pasos, cero fricción" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} data-reveal>
            <div className="max-w-[7rem]">
              <s.Illustration />
            </div>
            <p className="mt-4 font-display text-sm font-semibold text-blue">{s.n}</p>
            <h3 className="t-h3 mt-2 text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10" data-reveal>
        <CTAButton href="/register" variant="secondary">Crear mi bóveda</CTAButton>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Swap into `page.tsx`** — replace the current `{/* Problema */}` `<section>` with `<ProblemaSection />` and `{/* Cómo funciona */}` `<section>` with `<ComoFuncionaSection />`. Add imports. Remove now-dead inline `problems`/`steps` consts and unused icon imports (lint will flag).

- [ ] **Step 5: Verify** — `npm run build && npm run lint`; dev `/` renders both sections with illustrations and reveal-on-scroll; 375px OK.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/section.tsx src/components/site/sections/problema.tsx src/components/site/sections/como-funciona.tsx src/app/page.tsx
git commit -m "feat(redesign): problema + cómo-funciona sections"
```

---

## Task 13: "Para equipos" + "Seguridad" sections

**Files:**
- Create: `src/components/site/sections/para-equipos.tsx`
- Create: `src/components/site/sections/seguridad.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Section`, `SectionHead`, `Illustration`, `CTAButton`, `SecuritySpec`, `teamSteps` + `securitySpec` (Task 10), `RolesIllustration` (Task 9).
- Produces: `ParaEquiposSection()`, `SeguridadSection()`.

- [ ] **Step 1: `para-equipos.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { CTAButton } from "@/components/site/cta-button";
import { RolesIllustration } from "@/components/illustrations/roles";
import { teamSteps } from "@/content/landing";

export function ParaEquiposSection() {
  return (
    <Section variant="emphasis" aria-labelledby={slug("Sumá a tu equipo por correo, en segundos")}>
      <SectionHead
        kicker="Para equipos"
        title="Sumá a tu equipo por correo, en segundos"
        lead="Sin asientos que pagar, sin panel de IT. Invitás, la persona crea su cuenta y entra con el rol que le diste."
      />
      <Illustration>
        <div className="mb-8 max-w-xl">
          <RolesIllustration />
        </div>
      </Illustration>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {teamSteps.map((s) => (
          <div key={s.n} data-reveal>
            <p className="font-display text-sm font-semibold text-blue">{s.n}</p>
            <h3 className="t-h3 mt-2 text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10" data-reveal>
        <CTAButton href="/register" variant="secondary">Crear mi bóveda</CTAButton>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: `seguridad.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { SecuritySpec } from "@/components/site/security-spec";
import { securitySpec } from "@/content/landing";

export function SeguridadSection() {
  return (
    <Section variant="glass" aria-labelledby={slug("Ni nosotros podemos abrir lo que compartís")}>
      <SectionHead kicker="Seguridad" title="Ni nosotros podemos abrir lo que compartís" />
      <div className="max-w-2xl">
        <p data-reveal className="text-sm leading-relaxed text-ink-soft">
          Pensá cada link como una llave que le das a una sola persona. Nosotros guardamos la
          credencial cerrada — la llave para abrirla no la tenemos, así que no podemos leer lo
          que compartís, y nadie que entre a nuestros servidores tampoco: encontraría texto
          ilegible.
        </p>
        <p data-reveal className="mt-3 text-sm leading-relaxed text-ink-soft">
          La persona que recibe el link lo abre en su propio dispositivo. Y esa llave caduca
          sola —a las horas o días que elijas deja de servir— y podés cortarla antes con un
          click. El control siempre es tuyo.
        </p>
      </div>
      <div className="mt-10">
        <SecuritySpec groups={securitySpec} />
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Swap into `page.tsx`** — replace `{/* Para equipos */}` and `{/* Mecanismo de seguridad */}` sections with `<ParaEquiposSection />` and `<SeguridadSection />`. Remove the inline `teamSteps` array and the old mecanismo paragraph markup. Add imports.

- [ ] **Step 4: Verify** — `npm run build && npm run lint`; both sections render; the fact-sheet lays out 2-col on desktop, 1-col on mobile.

- [ ] **Step 5: Commit**

```bash
git add src/components/site/sections/para-equipos.tsx src/components/site/sections/seguridad.tsx src/app/page.tsx
git commit -m "feat(redesign): para-equipos + seguridad (fact-sheet) sections"
```

---

## Task 14: "Y además" + FAQ + CTA final + `page.tsx` cleanup

**Files:**
- Create: `src/components/site/sections/y-ademas.tsx`
- Create: `src/components/site/sections/faq.tsx`
- Create: `src/components/site/sections/cta-final.tsx`
- Modify: `src/app/page.tsx` (final form)

**Interfaces:**
- Consumes: `Section`, `SectionHead`, `FeatureCard`, `CTAButton`, `features` + `faqs` (Task 10), `ChevronDownIcon`.
- Produces: `YAdemasSection()`, `FaqSection()`, `CtaFinalSection()`.

- [ ] **Step 1: `y-ademas.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { FeatureCard } from "@/components/site/feature-card";
import { features } from "@/content/landing";

export function YAdemasSection() {
  return (
    <Section aria-labelledby={slug("Todo lo que incluye")}>
      <SectionHead kicker="Y además" title="Todo lo que incluye" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <FeatureCard key={f.title} Icon={f.Icon} title={f.title} body={f.body} wide={f.wide} />
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: `faq.tsx`**

```tsx
import { Section } from "@/components/site/section";
import { slug } from "@/components/site/section-head";
import { ChevronDownIcon } from "@/components/icons";
import { faqs } from "@/content/landing";

export function FaqSection() {
  return (
    <Section aria-labelledby={slug("Preguntas frecuentes")}>
      <h2 id={slug("Preguntas frecuentes")} data-reveal className="t-h2 mb-8 text-center text-ink">
        Preguntas frecuentes
      </h2>
      <div className="flex flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} data-reveal className="group rounded-2xl border border-border-soft bg-paper p-5 open:pb-5">
            <summary className="t-h3 flex cursor-pointer list-none items-center justify-between gap-4 text-ink marker:hidden">
              {f.q}
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: `cta-final.tsx`**

```tsx
import { CTAButton } from "@/components/site/cta-button";

export function CtaFinalSection() {
  return (
    <section className="w-full max-w-5xl rounded-2xl bg-ink p-10 text-center text-gray sm:p-16">
      <h2 data-reveal className="t-display">Dejá de reenviar contraseñas por chat</h2>
      <p data-reveal className="mx-auto mt-4 max-w-md leading-relaxed text-gray/70">
        Creá tu bóveda en menos de un minuto. Sin tarjeta de crédito, hasta 20 credenciales gratis.
      </p>
      <div data-reveal className="mt-8 flex justify-center">
        <CTAButton href="/register" className="bg-blue-soft text-ink-reverse hover:brightness-95">
          Crear mi bóveda gratis →
        </CTAButton>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Final `page.tsx`**

Rewrite `src/app/page.tsx` to its final ~40-line form:

```tsx
import { HeroSection } from "@/components/site/sections/hero";
import { ProblemaSection } from "@/components/site/sections/problema";
import { ComoFuncionaSection } from "@/components/site/sections/como-funciona";
import { ParaEquiposSection } from "@/components/site/sections/para-equipos";
import { SeguridadSection } from "@/components/site/sections/seguridad";
import { YAdemasSection } from "@/components/site/sections/y-ademas";
import { FaqSection } from "@/components/site/sections/faq";
import { CtaFinalSection } from "@/components/site/sections/cta-final";
import { SiteFooter } from "@/components/site-footer";
import { Reveals } from "@/components/reveals";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bóveda KF-1",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "Gestor de credenciales compartidas seguro para equipos: invitá a tu equipo por correo con rol de Editor o Lector, encriptación en cada link, expiración configurable y auditoría completa de accesos.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HomePage() {
  return (
    <main className="flex flex-col items-center gap-16 p-4 pb-16 sm:gap-24 sm:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />
      <ProblemaSection />
      <ComoFuncionaSection />
      <ParaEquiposSection />
      <SeguridadSection />
      <YAdemasSection />
      <FaqSection />
      <CtaFinalSection />
      <SiteFooter />
      <Reveals />
    </main>
  );
}
```

Confirm no orphaned imports/consts remain (the old `features`/`faqs` inline arrays, `Link`, icon imports, `HeroReveal`, `SiteHeader` — all now live in section components). Lint will flag leftovers.

- [ ] **Step 5: Verify**

`npm run build && npm run lint` — clean. Full-page scroll on `/` at desktop and 375px: all 8 sections in order, reveal animations fire section-by-section, spacing reads generous (1P-ish), no horizontal scroll, no console errors. Toggle OS "reduce motion" → reveals become instant, nothing stuck invisible. Toggle "reduce transparency" → `.glass`/blur sections go solid, text still legible.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/sections/y-ademas.tsx src/components/site/sections/faq.tsx src/components/site/sections/cta-final.tsx src/app/page.tsx
git commit -m "feat(redesign): y-además + faq + cta-final; page.tsx is now composition-only"
```

---

## Task 15: Auth pages restyle

**Files:**
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/app/(auth)/login/login-form.tsx`, `src/app/(auth)/register/register-form.tsx`, `src/app/(auth)/reset/reset-request-form.tsx`, `src/app/(auth)/reset/[token]/reset-form.tsx`, `src/app/(auth)/invite/[token]/page.tsx`, `src/app/(auth)/invite/[token]/accept-form.tsx`, `src/app/(auth)/invite/[token]/invite-signup-form.tsx`
- Modify: `src/components/verify-banner.tsx`, `src/components/verify-result.tsx`

**Interfaces:**
- Consumes: `CTAButton` (Task 3), `SecuritySpec` (Task 5), `.t-display`/`.t-h2` (Task 1).
- Produces: nothing. **No flow/logic/validation changes** — restyle only.

- [ ] **Step 1: `(auth)/layout.tsx` sidebar**

Replace the hardcoded `trustPoints` array + its rendered list with `<SecuritySpec compact groups={AUTH_SPEC} />` where `AUTH_SPEC` is a 2-group subset — import `securitySpec` from `@/content/landing` and slice to `["Cifrado", "Auditoría"]`:

```tsx
import { securitySpec } from "@/content/landing";
import { SecuritySpec } from "@/components/site/security-spec";
const AUTH_SPEC = securitySpec.filter((g) => g.label === "Cifrado" || g.label === "Auditoría");
```

Render `<SecuritySpec compact groups={AUTH_SPEC} />` in the `hidden ... lg:flex` sidebar slot. Keep the sidebar heading (`<h2 class="t-h2">` "Tu bóveda, cifrada de punta a punta" or similar). Keep `SiteHeader`/`SiteFooter`.

- [ ] **Step 2: Forms — swap submit buttons to `<CTAButton>`**

In each `*-form.tsx`, replace the primary submit `<button ...>` with `<CTAButton type="submit" disabled={pending} className="mt-2 w-full">{pending ? "…" : "…"}</CTAButton>` (keep the exact pending/label text). Secondary/link actions ("Ya tengo cuenta", "Volver a entrar", "¿Olvidaste tu contraseña?") → `<CTAButton href=... variant="secondary">` where they're prominent, or leave as plain underline `<Link>` where they're tertiary (keep current treatment for those).

- [ ] **Step 3: Headings + card polish**

- Every form/page `<h1>` → class `t-display` (drop `font-display text-3xl font-semibold tracking-tight`). `<h1>` stays an `<h1>`.
- Card wrapper stays `glass w-full max-w-sm rounded-2xl p-8`.
- Input recipe: keep the existing `inputCls` string in each file, no change (it's already token-consistent).
- `verify-banner.tsx` / `verify-result.tsx`: headings/labels to body scale, buttons unchanged in behavior; ensure they use `text-ink`/`text-ink-soft` tokens (they already do — light touch only).

- [ ] **Step 4: `invite/[token]/page.tsx`**

Its local `Shell` already renders just `<div className="glass ...">` (it was moved into `(auth)` earlier). Headings → `t-display`/`t-h2`. The `<Link>` buttons ("Entrar", "Crear cuenta" — wait, the current version has `InviteSignupForm` + a text "Entrá para aceptar" link) → the signup form's submit becomes `<CTAButton type="submit">`; the "Entrá para aceptar" stays a plain underline link.

- [ ] **Step 5: Verify**

`npm run build && npm run lint` — clean. Walk each auth route in the dev server: `/login`, `/register`, `/reset`, `/reset/anything`, `/invite/bogus` — renders, forms submit (they'll error without valid data, that's fine), no layout break at 375px, sidebar shows the compact fact-sheet on `lg`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(auth)" src/components/verify-banner.tsx src/components/verify-result.tsx
git commit -m "feat(redesign): auth pages restyle (CTAButton, t-scale, SecuritySpec sidebar)"
```

---

## Task 16: Marketing pages restyle

**Files:**
- Modify: `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/contacto/page.tsx`, `src/app/(marketing)/terminos/page.tsx`, `src/app/(marketing)/privacidad/page.tsx`

**Interfaces:** Consumes `.t-display`/`.t-h2`/`.t-h3` (Task 1), `Section` (Task 2, optional). No content changes beyond heading classes and spacing.

- [ ] **Step 1: `(marketing)/layout.tsx`** — spacing pass so the content column matches the landing rhythm (`gap`/padding consistent with `p-4 sm:p-8` and generous vertical spacing). Keep `SiteHeader`/`SiteFooter`.

- [ ] **Step 2: `contacto/page.tsx`** — `<h1>` → `t-display`. The two channel cards (already have icons from a prior task) keep their `flex items-start gap-4` layout; card titles → `t-h3`; wrap the page in `<Section>` if it cleanly fits, else just apply the width/spacing classes. `active:scale-[0.99]` on the `<a>` cards stays.

- [ ] **Step 3: `terminos/page.tsx` + `privacidad/page.tsx`** — `<h1>` → `t-display`, any `<h2>` → `t-h2`, `<h3>` → `t-h3`. Prose stays body scale, `max-w-2xl`, `leading-relaxed`. No content edits.

- [ ] **Step 4: Verify** — `npm run build && npm run lint` clean; `/contacto`, `/terminos`, `/privacidad` render with the new type scale; 375px OK.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)"
git commit -m "feat(redesign): marketing pages restyle"
```

---

## Task 17: Security-spec claim verification

**Files:** none (audit task; produces at most small copy edits to `src/content/landing.ts`).

- [ ] **Step 1: Verify each `securitySpec` claim against the code**

| Claim | Check | File |
|---|---|---|
| AES-256-GCM at rest | `createCipheriv("aes-256-gcm", ...)` | `src/lib/crypto.ts` |
| Zero-knowledge in links | link key returned once, never persisted; `payload` re-encrypted with it | `src/lib/crypto.ts` (`generateLinkKey`, `encryptForLink`), `src/app/dashboard/actions.ts` (`createShareLinkAction`) |
| Expiración 1h–7d | `shareLinkSchema` `expiresInHours` min 1 / max 168 | `src/lib/validation.ts` |
| Revocación instantánea | `revokeShareLinkAction` sets `revokedAt`; `/api/share/[publicId]` rejects revoked | `src/app/dashboard/actions.ts`, `src/app/api/share/[publicId]/route.ts` |
| Un destinatario / cada apertura registrada | `link_viewed` audit row per fetch | `src/app/api/share/[publicId]/route.ts` |
| Passkeys y 2FA | Passkey provider + TOTP enrollment actions | `src/lib/auth.ts`, `src/app/dashboard/actions.ts` |
| Sesión que expira | idle guard component mounted in dashboard layout | `src/components/idle-session-guard.tsx`, `src/app/dashboard/layout.tsx` |
| Anti-fuerza bruta (login rate limit) | `rateLimit("login:" + ip)` in `checkPasswordAction` and `authorize` | `src/app/(auth)/actions.ts`, `src/lib/auth.ts` |
| Registro inmutable | `AuditLog` rows only ever created, never updated/deleted in app code | grep `db.auditLog.` across `src/` |
| IP truncada | `anonymizeIp` applied before persisting `ipAddress` | `src/lib/audit.ts`, `src/app/api/share/[publicId]/route.ts` |

- [ ] **Step 2: Rework any mismatch**

For any claim that doesn't hold exactly, reword it in `src/content/landing.ts` to what the code actually does, or remove the item. Note each change in the commit message.

- [ ] **Step 3: Verify + commit**

```bash
npm run build && npm run lint
git add src/content/landing.ts   # only if edits were made
git commit -m "chore(redesign): verify security-spec claims against code" --allow-empty
```

---

## Task 18: A11y + responsive final sweep

**Files:** small fixes across the redesigned files as needed.

- [ ] **Step 1: Heading order** — view `/` source: exactly one `<h1>` (hero), then `<h2>` per section in DOM order, `<h3>` only inside cards. Fix any skips.
- [ ] **Step 2: Landmarks** — `/` has one `<main>`; each section is a `<section>` with `aria-labelledby` pointing at its `<h2>` id (Tasks 12–14 wired this via `slug`). Verify the ids resolve.
- [ ] **Step 3: Focus visibility** — tab through `/` and `/login`: `SiteHeader` links, every `CTAButton`, form fields, and `<details>` summaries show the `:focus-visible` outline (globals.css `:focus-visible` rule). Fix any element that traps or hides focus.
- [ ] **Step 4: Illustrations** — every `src/components/illustrations/*` `<svg>` has `aria-hidden="true"` and the surrounding copy conveys the meaning without it.
- [ ] **Step 5: Reduced motion** — OS setting on: reload `/`, scroll; reveals appear without transform travel, nothing stuck at `opacity:0`.
- [ ] **Step 6: Reduced transparency / contrast** — OS setting on: `.glass` hero frame, `variant="glass"` Seguridad section, and `backdrop-blur` cards render solid (`--color-paper`), text legible.
- [ ] **Step 7: 375px** — no horizontal scroll on any page; the hero grid stacks; the fact-sheet is 1-col; section padding doesn't crush content.
- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(redesign): a11y + responsive sweep" --allow-empty
```

---

## Self-Review

**1. Spec coverage:**
- S1 type scale + spacing + surfaces + motion → Task 1 (+ conventions referenced in every component task). ✅
- S2 all 6 primitives + `SiteHeader`/`SiteFooter` refine + content module → Tasks 2–6, 10. ✅
- S3 all 8 landing sections in the specified order, with the specified illustrations, the trimmed 4-feature grid, the fact-sheet, video/badge removal → Tasks 11–14. ✅
- S4 auth layout sidebar → `SecuritySpec compact`, forms restyle no-logic, marketing pages → Tasks 15–16. ✅
- S5 6 illustrations, format + composition briefs → Tasks 7–9. ✅
- S6 verification: build/lint every task; claim verification → Task 17; a11y/responsive/reduced-motion/reduced-transparency → Task 18. ✅

**2. Placeholder scan:** The illustration tasks (7–9) give `viewBox`, palette, style, and a per-illustration composition brief plus a skeleton, then say "author the SVG." SVG art cannot be fully pre-written in a plan without the plan *being* the implementation; the briefs + acceptance criteria ("reads as X", "crisp at 375px", palette-locked) are the contract. Every other task has literal code. No "TODO", no "add error handling", no "similar to Task N".

**3. Type consistency:**
- `Section` props (`variant: "plain"|"card"|"emphasis"|"glass"`, `wide`, `aria-labelledby` added in Task 12) — used consistently in Tasks 11–16.
- `CTAButton` discriminated union (`href` xor `type`) — call sites in Tasks 11–16 pass exactly one.
- `SectionHead` / `slug` — `slug(title)` used for both the `<h2 id>` and the parent `aria-labelledby` in Tasks 12–14, matching Task 2's definition.
- `IconType = ComponentType<{ className?: string }>` defined in Task 10, consumed by `FeatureCard` (Task 4) and the content arrays.
- `securitySpec` group shape (`{ label, items: { claim, plain }[] }`) — defined in Task 10, consumed by `SecuritySpec` (Task 5), the Seguridad section (Task 13), and the auth sidebar (Task 15).
- `steps[].Illustration` is a component ref (`() => JSX.Element`) — produced in Task 10, rendered as `<s.Illustration />` in Task 12.

**4. Ambiguity:** "raise the craft" is pinned to concrete values (Task 1 tables). Section order, surface per section, and which features survive the trim are all explicit. The only latitude is the SVG art itself, bounded by the briefs.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-04-site-redesign-b.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
