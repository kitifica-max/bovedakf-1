# Site Redesign — Sub-project B: Public site + auth (Design)

**Date:** 2026-09-04
**Status:** Approved in brainstorming, pending writing-plans
**Reference:** 1password.com (visual language, section rhythm, credibility-through-substance — NOT its enterprise positioning or multi-product IA)

## Context

Bóveda KF-1 is a free credential-sharing vault for small teams (5–20), also a discovery funnel for Kitifica. The current public site is a single long `src/app/page.tsx` (~410 lines) plus `(marketing)/` pages (contacto, términos, privacidad) and `(auth)/` pages (login, register, reset, reset/[token], invite/[token]). It works and is on-brand (dark theme, Silkscreen pixel font for headings, blue `#1d5f8f` accent) but the craft — spacing rhythm, type hierarchy, imagery — is below the bar 1Password sets.

This is **sub-project B** of a 3-part full-UI redesign. B ships the evolved design-system layer that **C (dashboard)** and **D (admin)** will consume. C and D are separate spec→plan→build cycles and are out of scope here.

### Decisions locked in brainstorming

| Question | Decision |
|---|---|
| What to borrow from 1P | Visual language (air, hierarchy, section rhythm, large product imagery), structure/cadence, and credibility-through-technical-substance. **Not** the enterprise tone or "Talk to sales" CTAs. |
| Brand identity | **Keep it.** Dark theme, blue accent, Silkscreen for the wordmark. Raise the craft within it — this is a refinement pass, not a rebrand. |
| Site IA | **One landing, better rhythm.** No new pages, no route changes, no multi-product hub. |
| Product imagery | **Stylized inline-SVG illustrations** in KF-1's visual language. No screenshots now (real dashboard is redesigned in C); screenshots can be added after C. |
| Credibility signal | **A security fact sheet** (`<SecuritySpec>`) — technical claims presented as a spec, each cross-checked against the code. No customer logos, testimonials, user counts, or awards (none exist). |
| Typography | Silkscreen (pixel) → **accents only**: wordmark, section kickers, small labels. **Archivo** (the existing `--font-display`) → all large headings (h1/h2). Never Silkscreen in an h1/h2 again. |
| Execution approach | **Approach 1** — evolve in place, section by section, against a lean new primitive layer. Extract each landing section to its own component file. |

## Global Constraints (from CLAUDE.md / repo)

- **No test framework.** Verification = `npm run build` (tsc) + `npm run lint` + visual review + a11y checks. Do not add a test runner.
- Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript. No new dependencies (GSAP already present).
- Copy: terse Spanish, rioplatense "vos", matching existing voice.
- Commit + push each task. This work lands on a feature branch, merged to `develop` then `main` (repo's flow); Netlify auto-deploys.
- Dark-theme-first. Tokens live in `src/app/globals.css` (`--color-gray #0a0e15`, `--color-paper #212631`, `--color-ink #edf0f4`, `--color-ink-soft #e0e4eb`, `--color-blue #1d5f8f`, `--color-blue-soft #cfe6ee`, `--color-danger #f87171`, `--color-border rgba(255,255,255,0.12)`).
- Fonts already wired in `src/app/layout.tsx`: `--font-body-sans` (IBM Plex Sans), `--font-archivo` (Archivo, mapped to `--font-display`), `--font-silkscreen` (mapped to `--font-pixel`), `--font-geist-mono`.
- Existing motion system stays: `src/components/reveals.tsx` (`Reveals` — scroll-in fade+y on every `[data-reveal]`, dynamic GSAP import, reduced-motion guarded) and `src/components/hero-reveal.tsx` (`HeroReveal` — entrance stagger on `[data-reveal]` inside `[data-hero]`, plus one slow float loop on `[data-float]`). `active:scale(0.97)` on `button` and a `prefers-reduced-transparency`/`prefers-contrast` solid-surface block already exist in `globals.css`.

---

## Section 1 — Design-system layer

Added to `src/app/globals.css`. C and D inherit these.

### Type scale

Four heading roles + body. Implemented as **utility classes** in `globals.css` (the one sanctioned deviation from the repo's "Tailwind inline everywhere" pattern — it prevents drift across ~15 headings and 3 sub-projects):

```css
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
```

Body text: unchanged (IBM Plex Sans via `--font-body-sans`), `text-sm`/`text-base`, `leading-relaxed` (~1.6). `text-ink` for primary, `text-ink-soft` for secondary.

**Every `font-pixel ... tracking-tight` heading in the codebase is replaced** by `.t-display` or `.t-h2`. Silkscreen survives only in: the logo SVG (unchanged), `.t-kicker`, and any explicit small label.

### Spacing / rhythm

| Token | Value | Where |
|---|---|---|
| Between top-level sections | `gap-16 sm:gap-24` | `<main>` on the landing (was `gap-6`) |
| Carded-section inner padding | `p-8 sm:p-12` | `<Section variant="card" \| "emphasis" \| "glass">` |
| Section-head bottom margin | `mb-10 sm:mb-14` | `<SectionHead>` |
| Section-head max width | `max-w-2xl` | `<SectionHead>` |
| Content shell max width | `max-w-5xl` | `<Section>` default |
| Wide shell (illustration sections) | `max-w-6xl` | `<Section wide>` |
| Body-text block max width | `max-w-2xl` | prose inside sections |

### Surfaces (3 documented levels)

1. **Page** — `bg-[--color-gray]` (`#0a0e15`), the `<body>` ground + `body::before` ambient blue radial (unchanged).
2. **Raised card** — `bg-paper border border-border-soft rounded-2xl` (`#212631`). Neutral content cards (problems, FAQ, features that aren't emphasis).
3. **Emphasis card** — `bg-blue/[0.07] border border-blue/25 rounded-2xl backdrop-blur-md`. Team section, feature cards, credential cards. (Already the pattern; formalized.)

`.glass` (`rgb(33 38 49 / 0.55)` + `backdrop-filter: blur(20px)`) stays an **exception**, used only where a translucent layer over the ambient glow genuinely helps (hero illustration frame, the security section optionally, auth cards). Never stacked on another translucent surface.

### Motion

- Keep `Reveals` + `HeroReveal` exactly as-is. New sections/illustrations get `data-reveal`.
- **No new loops, no bounce, no spring.** The hero `[data-float]` loop (badge cluster today) is removed with the badges; do not re-add a loop.
- Illustrations: `data-reveal` fade+y only. No internal animation. (Hero illustration MAY get a one-shot GSAP stroke draw-in — flagged optional in the plan, default off.)
- `active:scale(0.97)` press feedback already global on `button`; `<CTAButton>` includes it for its `<Link>` render too (`active:scale-[0.98]`).

---

## Section 2 — Component kit

New directory `src/components/site/`. All presentational, props-in, no local state (motion is external via `[data-reveal]`).

### `<Section>` — `src/components/site/section.tsx`

```tsx
type SectionProps = {
  id?: string;
  variant?: "plain" | "card" | "emphasis" | "glass";  // default "plain"
  wide?: boolean;        // max-w-6xl instead of max-w-5xl
  className?: string;
  children: React.ReactNode;
};
```

Renders `<section id={id} className="w-full {wide ? max-w-6xl : max-w-5xl} {surface classes for variant}">`. `variant="plain"` = no card chrome (just the width wrapper). `card`/`emphasis`/`glass` add the surface + `p-8 sm:p-12`.

### `<SectionHead>` — `src/components/site/section-head.tsx`

```tsx
type SectionHeadProps = {
  kicker: string;
  title: string;
  lead?: string;
};
```

Renders (all `data-reveal`):
```
<div class="max-w-2xl mb-10 sm:mb-14">
  <p class="t-kicker">{kicker}</p>
  <h2 class="t-h2 mt-2 text-ink">{title}</h2>
  {lead && <p class="mt-4 text-ink-soft leading-relaxed">{lead}</p>}
</div>
```
`id` for the h2 is derived from `kicker`/`title` slug for `aria-labelledby` on the parent `<Section>` where needed — or the consumer passes `id` to `<Section>` and adds `aria-labelledby` manually. Plan decides; default: `<SectionHead>` sets `id={slug(title)}` on the h2 and the consuming `<Section>` gets `aria-labelledby={slug(title)}`.

### `<FeatureCard>` — `src/components/site/feature-card.tsx`

```tsx
type FeatureCardProps = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  wide?: boolean;  // sm:col-span-2
};
```

Extracted verbatim from the current inline feature-card markup in `page.tsx` (emphasis surface, `bg-blue-soft` icon chip `h-9 w-9`, `.t-h3` title, `text-ink-soft` body, `data-reveal`).

### `<Illustration>` — `src/components/site/illustration.tsx`

```tsx
type IllustrationProps = {
  children: React.ReactNode;   // the inline <svg>
  caption?: string;
  align?: "center" | "start";  // default "center"
};
```

Frames an illustration: `data-reveal` wrapper, consistent max-width (`max-w-md` for step illustrations, controlled by parent for the hero), `[&>svg]:w-full [&>svg]:h-auto`, optional `<p class="mt-3 text-xs text-ink-soft text-center">` caption. Decorative SVGs stay `aria-hidden` (set on the SVG itself, not here).

### `<CTAButton>` — `src/components/site/cta-button.tsx`

```tsx
type CTAButtonProps =
  | { href: string; variant?: "primary" | "secondary"; children: React.ReactNode; className?: string }
  | { type: "submit" | "button"; variant?: "primary" | "secondary"; disabled?: boolean; children: React.ReactNode; className?: string };
```

`href` → renders `next/link` `<Link>`. `type` → renders `<button>`. Both:
- `primary`: `rounded-full bg-ink px-6 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 active:scale-[0.98]` (on `bg-ink` sections use `bg-blue-soft text-ink-reverse` — pass `className` override or add a `tone` — plan keeps it simple: `primary` is `bg-ink`, and the final CTA panel passes a `className` override for `bg-blue-soft`).
- `secondary`: `rounded-full border border-border-soft px-6 py-3 text-sm font-medium text-ink transition hover:bg-paper active:scale-[0.98]`.
- Disabled state on the `<button>` form: `disabled:cursor-not-allowed disabled:opacity-50`.

Replaces the repeated inline CTA class strings in `page.tsx`, the auth forms, `invite` forms, `reset` forms.

### `<SecuritySpec>` — `src/components/site/security-spec.tsx`

```tsx
type SpecGroup = { label: string; items: { claim: string; plain: string }[] };
type SecuritySpecProps = { groups: SpecGroup[]; compact?: boolean };
```

Renders grouped claims. Full: a responsive grid, one column per group on desktop, each group a `label` (`.t-kicker`) + a list of `claim` (bold, `text-ink`) / `plain` (one line, `text-ink-soft`). `compact` (auth sidebar): single column, smaller, fewer visual dividers. All `data-reveal`.

### `SiteHeader` / `SiteFooter` — refine existing files

`src/components/site-header.tsx`, `src/components/site-footer.tsx`. **Not rewrites.** Adjust: spacing to the new scale, keep the dark pill nav and the active-route pill (`usePathname`, already there), tune type to `.t-kicker`/body where relevant. Footer: same structure, spacing pass.

### Content module — `src/content/landing.ts`

All static landing content moves here from `page.tsx` inline `const`s:

```ts
export const stats: { label: string; value: string; Icon: IconType }[]
export const problems: { title: string; body: string; Icon: IconType }[]      // 3
export const steps: { n: string; title: string; body: string; Illustration: Comp }[]  // 3
export const teamSteps: { n: string; title: string; body: string }[]          // 3
export const features: { title: string; body: string; Icon: IconType; wide?: boolean }[]  // 4 (trimmed)
export const faqs: { q: string; a: string }[]
export const securitySpec: SpecGroup[]   // Cifrado / Compartir / Cuenta / Auditoría
```

`IconType = React.ComponentType<{ className?: string }>`. `page.tsx` imports from here and composes.

### File structure after B

```
src/components/site/           section.tsx section-head.tsx feature-card.tsx
                               illustration.tsx cta-button.tsx security-spec.tsx
src/components/illustrations/   key-flow.tsx scattered-secrets.tsx step-save.tsx
                               step-share.tsx step-audit.tsx roles.tsx
src/content/landing.ts
src/app/page.tsx               composition, ~120 lines (was ~410)
src/app/globals.css            + type-scale utilities, spacing conventions in comments
src/components/site-header.tsx / site-footer.tsx   refined
src/app/(auth)/layout.tsx      sidebar → <SecuritySpec compact>
src/app/(auth)/**              restyle only (CTAButton, tokens); no flow changes
```

---

## Section 3 — Landing, section by section

One page. Order and per-section spec:

### 1. Hero
- `<Section wide>` (custom, not the standard head).
- Left: eyebrow pill (`bg-blue-soft`, `LockIcon`, "Encriptado extremo a extremo en cada link" — keep), `h1.t-display` "Comparte credenciales sin dejar rastro en el chat", subhead (current team-aware copy), two `<CTAButton>` ("Crear mi bóveda →" primary /register, "Ya tengo cuenta" secondary /login), then the stats bar (`border-t`, the 2 stats, unchanged data).
- Right: `<KeyFlowIllustration>` in an `<Illustration>` framed with `.glass`. **Replaces** the `<video>` + the 2×2 security badge grid.
- The 4 badges (AES-256 / GCM / E2E / 2FA) move to Section 5 as spec items. The `<video>` element and `anim-bits-hero-1.{mp4,webm}` references are removed from `page.tsx` (files stay in `public/` untouched).
- `HeroReveal` wraps the hero; `[data-reveal]` on: pill, h1, subhead, CTA row, stats row, illustration. No `[data-float]`.

### 2. El problema
- `<Section>` + `<SectionHead kicker="El problema" title="No es la contraseña. Es dónde vive." />`.
- `<ScatteredSecretsIllustration>` (`<Illustration align="center">`) above or beside the cards.
- 3 `<div>` cards (raised surface), one per `problems[]` entry: `Icon` (h-6, `text-blue`), `.t-h3` title, `text-ink-soft` body. `data-reveal` each.

### 3. Cómo funciona
- `<Section variant="card">` + `<SectionHead kicker="Cómo funciona" title="Tres pasos, cero fricción" />`.
- 3-col grid; each `steps[]` entry renders: the step's `<Illustration>` (mini SVG: `StepSave` / `StepShare` / `StepAudit`), then `n` (`.t-kicker`-ish, `text-blue`), `.t-h3` title, body. `data-reveal` each.
- One `<CTAButton variant="secondary" href="/register">Crear mi bóveda</CTAButton>` after the grid.

### 4. Para equipos
- `<Section variant="emphasis">` + `<SectionHead kicker="Para equipos" title="Sumá a tu equipo por correo, en segundos" lead="Sin asientos que pagar, sin panel de IT. Invitás, la persona crea su cuenta y entra con el rol que le diste." />`.
- `<RolesIllustration>`.
- 3-col grid from `teamSteps[]` (Invitás por correo / Crea su contraseña / Entra con su rol — current copy). `data-reveal` each.
- `<CTAButton variant="secondary" href="/register">Crear mi bóveda</CTAButton>`.

### 5. Seguridad
- `<Section variant="glass">` (or `card` — plan picks; `glass` preferred for the "protected" feel), `aria-labelledby`.
- `<SectionHead kicker="Seguridad" title="Ni nosotros podemos abrir lo que compartís" />` (no `lead` — the two paragraphs follow).
- The two plain-language paragraphs (already in `page.tsx`, moved here verbatim): "Pensá cada link como una llave que le das a una sola persona…" / "La persona que recibe el link lo abre en su propio dispositivo…".
- `<SecuritySpec groups={securitySpec} />`. Groups:
  - **Cifrado** — `AES-256-GCM` / "Cada credencial se guarda cifrada, con un estándar que usan bancos y gobiernos." · `Zero-knowledge en los links` / "La llave para abrir un link nunca toca nuestro servidor. Sin ella, lo que guardamos es texto ilegible."
  - **Compartir** — `Expiración 1h–7d` / "Cada link deja de funcionar solo, en el plazo que elijas." · `Revocación instantánea` / "Cortás cualquier link con un click, antes de que expire." · `Un destinatario` / "Un link es para una persona. Cada apertura queda registrada."
  - **Cuenta** — `Passkeys y 2FA` / "Entrá con huella, cara o PIN, o con código de una app de autenticación." · `Sesión que expira` / "Si te quedás inactivo, te avisamos antes de cerrar la sesión." · `Anti-fuerza bruta` / "Límite de intentos en el login por IP."
  - **Auditoría** — `Registro inmutable` / "Cada vista, cada revocación, cada cambio de acceso queda escrito y no se puede editar." · `Con IP aproximada y persona` / "Sabés quién entró a qué y cuándo. La IP se guarda truncada."
- **Every claim is verified against the code as a plan task** (Section 6).

### 6. Y además (trimmed feature grid)
- `<Section>` + `<SectionHead kicker="Y además" title="Todo lo que incluye" />`.
- `<FeatureCard>` grid, 4 entries (drop "Tu equipo, con roles" → Section 4; drop "Clave que nunca vemos" → Section 5): **Expiración automática**, **Revocación instantánea**, **Passkeys y 2FA**, **Sesión que se cuida sola**. 2-col grid, no `wide`.

### 7. FAQ
- `<Section>` + centered `h2.t-h2` "Preguntas frecuentes".
- `<details>` list, current `faqs[]` (incl. the team FAQ and the rewritten "¿Ustedes pueden ver mis contraseñas?"). Restyle: raised surface, `.t-h3`-weight summary, `ChevronDownIcon` rotate. `data-reveal` each.

### 8. CTA final
- `<section className="... bg-ink ...">` (keep the ink panel; not a `<Section>` variant — it's full-bleed-ish dark).
- `h2.t-display` "Dejá de reenviar contraseñas por chat", lead `text-gray/70`, one `<CTAButton href="/register" className="bg-blue-soft text-ink-reverse hover:brightness-95">Crear mi bóveda gratis →</CTAButton>`.
- `<SiteFooter />` then `<Reveals />` after.

**Micro-CTAs total:** hero (2), cómo-funciona (1), para-equipos (1), final (1). Nothing else.

---

## Section 4 — Auth pages

- `src/app/(auth)/layout.tsx`: same shell (`SiteHeader` + left panel + `{children}` + `SiteFooter`). The left panel's 3 hardcoded trust bullets → `<SecuritySpec compact groups={...}/>` (a 2–3 item subset — Cifrado + Auditoría). Restyle spacing/type to the new scale.
- `login-form.tsx`, `register-form.tsx`, `reset-request-form.tsx`, `reset/[token]/reset-form.tsx`, `invite/[token]/page.tsx` + `accept-form.tsx` + `invite-signup-form.tsx`, `verify-banner.tsx`, `verify-result.tsx`: **no flow/logic changes.** Swap CTA/submit buttons to `<CTAButton>`, headings to `.t-display`/`.t-h2`, apply token-consistent input styling (keep the existing `inputCls` recipe, tune to spacing scale). Cards keep `.glass max-w-sm`.
- Marketing pages (`contacto`, `terminos`, `privacidad`): restyle headings to `.t-display`/`.t-h2`, apply `<Section>`/spacing where it fits. `contacto` cards already got icons this cycle — keep, restyle to the kit. `(marketing)/layout.tsx` spacing pass.

---

## Section 5 — Illustrations

`src/components/illustrations/*.tsx`, one inline-SVG component each.

- **Format:** `export function XIllustration()` returning `<svg viewBox="..." aria-hidden="true" className="...">`. Colors: `#1d5f8f` (blue), `#cfe6ee` (blue-soft), `#edf0f4`/`#e0e4eb` (ink), on transparent (sits on the section surface). Thin strokes (`stroke-width` 1.5–2) + a few filled blocks. `viewBox`-scaled, no fixed px.
- **Style:** geometric, pixel-art-adjacent (nods to Silkscreen), "technical diagram with personality." No 3D, no heavy gradients, no photography.
- **List:**
  1. `KeyFlowIllustration` (hero, ~16:10) — closed box (credential) → link chip with a key glyph → a device/person opening it. Optional GSAP one-shot stroke draw-in (default off).
  2. `ScatteredSecretsIllustration` (problema, ~16:9) — password fragments across chat bubbles / a doc / an envelope, deliberately unaligned.
  3. `StepSaveIllustration` / `StepShareIllustration` / `StepAuditIllustration` (~1:1, small) — lock closing / link with a timer ring / list with checkmarks + an eye.
  4. `RolesIllustration` (para equipos, ~16:9) — two badges (Editor / Lector) with differing capability dots, an invite envelope feeding in.
- Each wrapped by the consumer in `<Illustration>` → `data-reveal`. No internal animation except the optional hero draw-in.

---

## Section 6 — Verification

Per plan task:
- `npm run build` (tsc clean) + `npm run lint` (clean).
- Visual review each section at desktop width and 375px.
- A11y:
  - `prefers-reduced-motion: reduce` → reveals instant (existing global block covers `transition-duration`; confirm no transform stuck).
  - `prefers-reduced-transparency` / `prefers-contrast: more` → `.glass` and `[class*="backdrop-blur"]` go solid (existing block; re-verify against the new surfaces, esp. the hero illustration frame and Section 5).
  - Visible `:focus-visible` on `SiteHeader` links, all `<CTAButton>`, form fields.
  - Exactly one `<h1>` (hero); `<h2>` per section in reading order; illustrations `aria-hidden`, never sole carriers of meaning.
- **Security-spec claim verification** (dedicated plan task): grep the code for each claim:
  - AES-256-GCM at rest → `src/lib/crypto.ts` (`aes-256-gcm`).
  - Zero-knowledge share links → `src/lib/crypto.ts` `generateLinkKey`/`encryptForLink`, key returned once in `createShareLinkAction`, never persisted.
  - Expiry 1h–7d → `src/lib/validation.ts` `shareLinkSchema` (`min 1, max 168`).
  - Revocation → `revokeShareLinkAction`.
  - Passkeys + TOTP → `src/lib/auth.ts` (Passkey provider), `initTotpEnrollmentAction` etc.
  - Idle timeout → `src/components/idle-session-guard.tsx`.
  - Login rate limit → `checkPasswordAction` / `authorize` (`rateLimit("login:…")`).
  - Immutable audit + truncated IP → `AuditLog` model (append-only in code), `src/lib/audit.ts` `anonymizeIp`.
  Any claim that doesn't check out is reworded or cut.
- `Reveals` / `HeroReveal` still animate the new `[data-reveal]` nodes (manual scroll check).

---

## Out of scope for B

- Dashboard UI (sub-project C) and admin UI (sub-project D).
- Any auth/logic/flow change.
- New routes or pages; multi-product hub.
- Brand identity change (logo, theme, palette).
- Real product screenshots (post-C).
- Removing `anim-bits-hero-1.*` from `public/` (just stop referencing it).
- New dependencies.

## Self-review notes

- **Placeholders:** none — every section has concrete values, component signatures, and copy. The one "plan picks" (Section 5 `glass` vs `card`, `<SectionHead>` id derivation) is a deliberate small latitude, both options specified.
- **Consistency:** type scale (S1) ↔ component usage (S2) ↔ section specs (S3) use the same class names (`.t-display`, `.t-h2`, `.t-h3`, `.t-kicker`). Surface variants (`plain/card/emphasis/glass`) consistent across S1 and S2/S3. `<CTAButton>` variants (`primary/secondary`) consistent S2 ↔ S3 ↔ S4.
- **Scope:** single implementation plan is feasible — ~1 design-system task, ~6 component tasks, ~6 illustration tasks, ~8 section tasks, ~1 auth task, ~1 marketing task, ~1 claim-verification task. Sequential, each build+lint verifiable.
- **Ambiguity:** "raise the craft" made concrete via the spacing table, type scale, and surface levels — not left to taste.
