# Enterprise SSO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar SSO/SAML enterprise via WorkOS con auto-provisioning de usuarios y control de acceso a bóvedas por rol organizacional.

**Architecture:** Flujo SSO paralelo que no toca el auth stack existente (Credentials + Passkey). WorkOS maneja SAML; un nonce de 60s hace de bridge hacia NextAuth. Usuarios SSO se auto-provisionan al primer login y reciben acceso automático a bóvedas de org según su `OrgRole`.

**Tech Stack:** Next.js 16 App Router, NextAuth v5 beta.32, Prisma 6, PostgreSQL, `@workos-inc/node` v10.13.0, Netlify.

**Spec:** `docs/superpowers/specs/2026-09-12-enterprise-sso-design.md`

## Global Constraints

- Node `@workos-inc/node` v10.13.0 — ya instalado, no actualizar.
- NextAuth v5 beta.32 — no actualizar. `signIn` de `next-auth/react` para el cliente.
- Prisma 6.19.3 — usar `db.model.createMany({ skipDuplicates: true })` para upserts idempotentes.
- Todos los strings de error visibles al usuario en español rioplatense.
- Estilos: seguir el sistema de diseño existente (`glass`, `rounded-2xl`, `text-ink`, `text-ink-soft`, `bg-paper`, `border-border-soft`, `text-blue`).
- Rate limiting: usar `rateLimit` + `clientIp` de `@/lib/rate-limit` (ya existe).
- Admin gate: usar `isAdmin()` de `@/lib/admin` (ya existe).
- Branch activo: `feature/enterprise-sso`.

---

## File Map

| Acción | Archivo |
|--------|---------|
| Modify | `prisma/schema.prisma` |
| Create | `src/lib/workos.ts` |
| Create | `src/lib/sso-provisioning.ts` |
| Modify | `src/lib/auth.ts` |
| Modify | `src/types/next-auth.d.ts` |
| Create | `src/app/api/auth/sso/initiate/route.ts` |
| Create | `src/app/api/auth/sso/callback/route.ts` |
| Modify | `src/app/(auth)/login/login-form.tsx` |
| Create | `src/app/(auth)/login/sso/page.tsx` |
| Create | `src/app/admin/orgs/page.tsx` |
| Create | `src/app/admin/orgs/actions.ts` |
| Create | `src/app/dashboard/org/page.tsx` |
| Create | `src/app/dashboard/org/actions.ts` |
| Modify | `.env.example` |

---

## Task 1: Schema + Migration

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `OrgRole` enum, `Organization` model, `SsoNonce` model; campos `organizationId`, `orgRole`, `workosUserId` en `User`; campos `organizationId`, `orgMinRole` en `Vault`.

- [ ] **Step 1: Agregar enum OrgRole al schema**

En `prisma/schema.prisma`, agregar después del enum `VaultRole`:

```prisma
enum OrgRole {
  OWNER
  ADMIN
  MEMBER
}
```

- [ ] **Step 2: Agregar modelo Organization**

```prisma
model Organization {
  id              String    @id @default(cuid())
  name            String
  workosOrgId     String?   @unique
  domain          String?   @unique
  ssoEnabled      Boolean   @default(false)
  firstOwnerEmail String?
  createdAt       DateTime  @default(now())
  members         User[]
  vaults          Vault[]
}
```

- [ ] **Step 3: Agregar modelo SsoNonce**

```prisma
model SsoNonce {
  id        String   @id @default(cuid())
  nonce     String   @unique @default(cuid())
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}
```

- [ ] **Step 4: Modificar modelo User — agregar 3 campos nuevos**

Dentro de `model User { ... }`, agregar después del campo `cliTokens`:

```prisma
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  orgRole         OrgRole?
  workosUserId    String?       @unique
```

- [ ] **Step 5: Modificar modelo Vault — agregar 2 campos nuevos**

Dentro de `model Vault { ... }`, agregar después del campo `createdAt`:

```prisma
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  orgMinRole      OrgRole?
```

- [ ] **Step 6: Generar y ejecutar migración**

```bash
npx prisma migrate dev --name enterprise_sso
```

Verificar que la migración no reporte errores y que el cliente Prisma se regenere sin errores de tipo.

- [ ] **Step 7: Verificar build de Prisma**

```bash
npx prisma generate
```

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(schema): add Organization, SsoNonce, OrgRole for enterprise SSO"
```

---

## Task 2: WorkOS client + variables de entorno

**Files:**
- Create: `src/lib/workos.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `workos` singleton exportado desde `@/lib/workos`.

- [ ] **Step 1: Crear singleton WorkOS**

Crear `src/lib/workos.ts`:

```typescript
import { WorkOS } from "@workos-inc/node";

export const workos = new WorkOS(process.env.WORKOS_API_KEY!);
```

- [ ] **Step 2: Actualizar .env.example**

Agregar al final de `.env.example`:

```bash
# WorkOS — Enterprise SSO (https://dashboard.workos.com)
# API key del proyecto WorkOS
WORKOS_API_KEY=sk_...
# Client ID para Admin Portal (configuración self-service por org)
WORKOS_CLIENT_ID=client_...
# URL de callback que WorkOS redirige tras autenticación SSO
WORKOS_REDIRECT_URI=https://kf1.kitifica.com/api/auth/sso/callback
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/workos.ts .env.example
git commit -m "feat(workos): add WorkOS client singleton and env vars"
```

---

## Task 3: SSO provisioning logic

**Files:**
- Create: `src/lib/sso-provisioning.ts`

**Interfaces:**
- Consumes: `db` de `@/lib/db`; `OrgRole`, `VaultRole` de `@prisma/client`; `Profile` de `@workos-inc/node`.
- Produces:
  - `provisionOrgVaults(userId: string, orgId: string, orgRole: OrgRole): Promise<void>`
  - `removeOrgVaultAccess(userId: string, orgId: string, rolesToRemove: OrgRole[]): Promise<void>`
  - `handleSsoUser(profile: Profile): Promise<string>` — retorna `userId`

- [ ] **Step 1: Crear src/lib/sso-provisioning.ts**

```typescript
import { db } from "@/lib/db";
import type { Profile } from "@workos-inc/node";
import { OrgRole, VaultRole } from "@prisma/client";

// Qué orgMinRole puede ver cada OrgRole
const ORG_VAULT_ACCESS: Record<OrgRole, OrgRole[]> = {
  [OrgRole.OWNER]: [OrgRole.MEMBER, OrgRole.ADMIN, OrgRole.OWNER],
  [OrgRole.ADMIN]: [OrgRole.MEMBER, OrgRole.ADMIN],
  [OrgRole.MEMBER]: [OrgRole.MEMBER],
};

export async function provisionOrgVaults(
  userId: string,
  orgId: string,
  orgRole: OrgRole
): Promise<void> {
  const accessibleRoles = ORG_VAULT_ACCESS[orgRole];

  const vaults = await db.vault.findMany({
    where: { organizationId: orgId, orgMinRole: { in: accessibleRoles } },
    select: { id: true },
  });

  if (vaults.length === 0) return;

  await db.vaultMember.createMany({
    data: vaults.map((v) => ({
      vaultId: v.id,
      userId,
      role: VaultRole.VIEWER,
    })),
    skipDuplicates: true,
  });
}

export async function removeOrgVaultAccess(
  userId: string,
  orgId: string,
  rolesToRemove: OrgRole[]
): Promise<void> {
  const vaults = await db.vault.findMany({
    where: { organizationId: orgId, orgMinRole: { in: rolesToRemove } },
    select: { id: true },
  });

  if (vaults.length === 0) return;

  await db.vaultMember.deleteMany({
    where: { userId, vaultId: { in: vaults.map((v) => v.id) } },
  });
}

export async function handleSsoUser(profile: Profile): Promise<string> {
  const org = await db.organization.findFirst({
    where: { workosOrgId: profile.organizationId ?? undefined },
  });

  if (!org) throw new Error(`No org for workosOrgId: ${profile.organizationId}`);

  const isFirstOwner =
    !!org.firstOwnerEmail &&
    org.firstOwnerEmail.toLowerCase() === profile.email.toLowerCase();
  const orgRole = isFirstOwner ? OrgRole.OWNER : OrgRole.MEMBER;

  // Buscar usuario existente — por workosUserId primero, luego por email
  const byWorkosId = profile.id
    ? await db.user.findUnique({ where: { workosUserId: profile.id } })
    : null;

  const byEmail = await db.user.findUnique({ where: { email: profile.email } });

  const existing = byWorkosId ?? byEmail;

  if (existing) {
    // Auto-link: actualizar con datos SSO
    await db.user.update({
      where: { id: existing.id },
      data: { workosUserId: profile.id, organizationId: org.id, orgRole },
    });
    await provisionOrgVaults(existing.id, org.id, orgRole);
    return existing.id;
  }

  // Usuario nuevo — provisionar sin contraseña
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;

  const user = await db.user.create({
    data: {
      email: profile.email,
      name: fullName,
      workosUserId: profile.id,
      organizationId: org.id,
      orgRole,
      passwordHash: "",
      passwordSalt: "",
    },
  });

  await provisionOrgVaults(user.id, org.id, orgRole);
  return user.id;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/sso-provisioning.ts
git commit -m "feat(sso): add provisioning logic — handleSsoUser, provisionOrgVaults"
```

---

## Task 4: NextAuth — sso-nonce provider + tipos de sesión

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/types/next-auth.d.ts`

**Interfaces:**
- Consumes: `db` de `@/lib/db`; `OrgRole` de `@prisma/client`.
- Produces: provider `"sso-nonce"` disponible en NextAuth; `session.user.orgRole: OrgRole | null` disponible en cliente y servidor.

- [ ] **Step 1: Agregar orgRole a los tipos de sesión**

En `src/types/next-auth.d.ts`, reemplazar el contenido:

```typescript
import { OrgRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyName: string | null;
      orgRole: OrgRole | null;
    } & DefaultSession["user"];
  }
  interface User {
    companyName?: string | null;
    orgRole?: OrgRole | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    companyName?: string | null;
    orgRole?: OrgRole | null;
  }
}
```

- [ ] **Step 2: Agregar provider sso-nonce en auth.ts**

En `src/lib/auth.ts`, dentro de `providers: [...]`, agregar después del provider `Credentials` existente:

```typescript
Credentials({
  id: "sso-nonce",
  credentials: { nonce: {} },
  authorize: async (creds) => {
    const nonce = creds?.nonce as string | undefined;
    if (!nonce) return null;

    const record = await db.ssoNonce.findUnique({ where: { nonce } });
    if (!record || record.expiresAt < new Date()) return null;

    // Nonce de un solo uso — borrar inmediatamente
    await db.ssoNonce.delete({ where: { nonce } });

    const user = await db.user.findUnique({
      where: { id: record.userId },
      select: { id: true, email: true, companyName: true, orgRole: true },
    });

    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      companyName: user.companyName,
      orgRole: user.orgRole,
    };
  },
}),
```

- [ ] **Step 3: Propagar orgRole en callbacks jwt y session**

En el callback `jwt`, agregar dentro de `if (user) { ... }`:
```typescript
token.orgRole = (user as { orgRole?: import("@prisma/client").OrgRole | null }).orgRole ?? null;
```

En el callback `session`, agregar dentro de `if (session.user) { ... }`:
```typescript
session.user.orgRole = (token.orgRole as import("@prisma/client").OrgRole | null) ?? null;
```

- [ ] **Step 4: Verificar que el build de TypeScript no tiene errores**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/types/next-auth.d.ts
git commit -m "feat(auth): add sso-nonce Credentials provider and orgRole to session"
```

---

## Task 5: API — SSO initiate

**Files:**
- Create: `src/app/api/auth/sso/initiate/route.ts`

**Interfaces:**
- Consumes: `workos` de `@/lib/workos`; `db` de `@/lib/db`; `rateLimit`, `clientIp` de `@/lib/rate-limit`.
- Produces: `POST /api/auth/sso/initiate` — body `{ email: string }` → `{ url: string }` + cookie `sso_state` httpOnly.

- [ ] **Step 1: Crear route.ts**

Crear `src/app/api/auth/sso/initiate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`sso-init:${clientIp(req.headers)}`, 10)).success) {
      return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const domain = email.split("@")[1];

    const org = await db.organization.findFirst({
      where: { domain, ssoEnabled: true },
      select: { workosOrgId: true },
    });

    if (!org?.workosOrgId) {
      return NextResponse.json(
        { error: "SSO no está configurado para este dominio." },
        { status: 404 }
      );
    }

    const state = crypto.randomUUID();

    const { url } = workos.sso.getAuthorizationUrl({
      organizationId: org.workosOrgId,
      redirectUri: process.env.WORKOS_REDIRECT_URI!,
      state,
    });

    const res = NextResponse.json({ url });
    res.cookies.set("sso_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Error interno. Intentá de nuevo." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/sso/initiate/route.ts
git commit -m "feat(api): POST /api/auth/sso/initiate — domain lookup + WorkOS redirect"
```

---

## Task 6: API — SSO callback

**Files:**
- Create: `src/app/api/auth/sso/callback/route.ts`

**Interfaces:**
- Consumes: `workos` de `@/lib/workos`; `db` de `@/lib/db`; `handleSsoUser` de `@/lib/sso-provisioning`.
- Produces: `GET /api/auth/sso/callback?code=&state=` — valida CSRF, crea `SsoNonce`, redirige a `/login?sso_nonce=<nonce>`.

- [ ] **Step 1: Crear route.ts**

Crear `src/app/api/auth/sso/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { db } from "@/lib/db";
import { handleSsoUser } from "@/lib/sso-provisioning";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("sso_state")?.value;

  // CSRF: validar state
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=sso_invalid", req.url));
  }

  try {
    const { profile } = await workos.sso.getProfileAndToken({ code });
    const userId = await handleSsoUser(profile);

    const record = await db.ssoNonce.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const res = NextResponse.redirect(
      new URL(`/login?sso_nonce=${record.nonce}`, req.url)
    );
    res.cookies.delete("sso_state");
    return res;
  } catch (err) {
    console.error("[sso/callback]", err);
    return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/sso/callback/route.ts
git commit -m "feat(api): GET /api/auth/sso/callback — CSRF check, provisioning, nonce redirect"
```

---

## Task 7: Login UI — SSO entry point

**Files:**
- Modify: `src/app/(auth)/login/login-form.tsx`
- Create: `src/app/(auth)/login/sso/page.tsx`

**Interfaces:**
- Consumes: `signIn` de `next-auth/react`; `POST /api/auth/sso/initiate`.
- Produces: link "Entrar con SSO corporativo" en el login form; página `/login/sso` con campo email y redirect a WorkOS; auto-login cuando URL tiene `?sso_nonce=`.

- [ ] **Step 1: Agregar detección de sso_nonce y link SSO en login-form.tsx**

En `src/app/(auth)/login/login-form.tsx`:

1. Agregar import de `useSearchParams` si no existe:
```typescript
import { useSearchParams } from "next/navigation";
```

2. Al inicio del componente, agregar detección del nonce (después de los estados existentes):
```typescript
const searchParams = useSearchParams();

// Auto-login cuando viene de callback SSO
useEffect(() => {
  const nonce = searchParams.get("sso_nonce");
  if (!nonce) return;
  signIn("sso-nonce", { nonce, redirectTo: "/dashboard" });
}, [searchParams]);
```

> Nota: `signIn` aquí es la misma importación de `next-auth/react` que ya usa el componente para el flujo de Credentials.

3. Agregar link SSO al final de la sección de links (después de "Crear una bóveda nueva"):
```tsx
<div className="mt-5 flex flex-col items-center gap-1.5 text-sm text-ink-soft">
  <Link href="/reset" className="underline">¿Olvidaste tu contraseña?</Link>
  <Link href="/register" className="underline">Crear una bóveda nueva</Link>
  {/* SSO link — solo se muestra, no remplaza el flujo normal */}
  <Link href="/login/sso" className="mt-1 flex items-center gap-1 text-blue underline">
    Entrar con SSO corporativo
  </Link>
</div>
```

- [ ] **Step 2: Crear /login/sso page**

Crear `src/app/(auth)/login/sso/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function SsoLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sso/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar SSO.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass w-full max-w-sm rounded-2xl p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue">
        Login corporativo
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">
        Entrar con SSO
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Ingresá tu email corporativo y te redirigimos a tu proveedor de identidad.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email corporativo
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@tuempresa.com"
            required
            disabled={loading}
            className="w-full rounded-xl border border-border-soft bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-blue focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="mt-1 w-full cursor-pointer rounded-full bg-blue px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Redirigiendo..." : "Continuar con SSO →"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-ink-soft">
        <Link href="/login" className="underline">← Volver al login normal</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar en browser que /login/sso renderiza correctamente y /login muestra el link SSO**

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/login/login-form.tsx src/app/(auth)/login/sso/page.tsx
git commit -m "feat(ui): add SSO login entry point — /login/sso and sso_nonce auto-login"
```

---

## Task 8: Super-admin — gestión de organizaciones

**Files:**
- Create: `src/app/admin/orgs/page.tsx`
- Create: `src/app/admin/orgs/actions.ts`

**Interfaces:**
- Consumes: `isAdmin()` de `@/lib/admin`; `auth` de `@/lib/auth`; `workos` de `@/lib/workos`; `db` de `@/lib/db`.
- Produces: página `/admin/orgs` con listado de orgs y formulario de creación; server action `createOrganization`; server action `generateAdminPortalLink`.

- [ ] **Step 1: Crear server actions**

Crear `src/app/admin/orgs/actions.ts`:

```typescript
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { workos } from "@/lib/workos";

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/dashboard");
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const domain = (formData.get("domain") as string)?.trim().toLowerCase();
  const workosOrgId = (formData.get("workosOrgId") as string)?.trim() || null;
  const firstOwnerEmail = (formData.get("firstOwnerEmail") as string)?.trim().toLowerCase() || null;

  if (!name || !domain) throw new Error("Nombre y dominio son requeridos.");

  await db.organization.create({
    data: { name, domain, workosOrgId, firstOwnerEmail, ssoEnabled: false },
  });

  redirect("/admin/orgs");
}

export async function toggleSso(orgId: string, enabled: boolean) {
  await requireAdmin();
  await db.organization.update({ where: { id: orgId }, data: { ssoEnabled: enabled } });
}

export async function generateAdminPortalLink(orgId: string): Promise<string> {
  await requireAdmin();

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org?.workosOrgId) throw new Error("Esta org no tiene WorkOS Org ID configurado.");

  const { link } = await workos.portal.generateLink({
    organization: org.workosOrgId,
    intent: "sso",
  });

  return link;
}
```

- [ ] **Step 2: Crear página /admin/orgs**

Crear `src/app/admin/orgs/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { createOrganization, toggleSso, generateAdminPortalLink } from "./actions";

export const metadata = { title: "Admin — Organizaciones", robots: { index: false } };

export default async function AdminOrgsPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/dashboard");

  const orgs = await db.organization.findMany({
    include: { _count: { select: { members: true, vaults: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Organizaciones</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Administrá las organizaciones enterprise y sus conexiones SSO.
      </p>

      {/* Formulario de creación */}
      <section className="mt-8 rounded-2xl border border-border-soft bg-paper p-6">
        <h2 className="font-semibold text-ink">Nueva organización</h2>
        <form action={createOrganization} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Nombre</label>
              <input name="name" required placeholder="Acme Corp"
                className="w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink focus:border-blue focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Dominio SSO</label>
              <input name="domain" required placeholder="acme.com"
                className="w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink focus:border-blue focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">WorkOS Org ID</label>
              <input name="workosOrgId" placeholder="org_xxxxx"
                className="w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink focus:border-blue focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Email primer OWNER</label>
              <input name="firstOwnerEmail" type="email" placeholder="cto@acme.com"
                className="w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink focus:border-blue focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit"
              className="rounded-full bg-blue px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
              Crear organización
            </button>
          </div>
        </form>
      </section>

      {/* Lista de orgs */}
      <section className="mt-8 flex flex-col gap-4">
        {orgs.length === 0 && (
          <p className="text-sm text-ink-soft">No hay organizaciones todavía.</p>
        )}
        {orgs.map((org) => (
          <div key={org.id} className="rounded-2xl border border-border-soft bg-paper p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{org.name}</p>
                <p className="text-xs text-ink-soft">{org.domain} · {org._count.members} miembros · {org._count.vaults} bóvedas</p>
                {org.workosOrgId && (
                  <p className="mt-0.5 text-xs font-mono text-ink-soft">{org.workosOrgId}</p>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${org.ssoEnabled ? "bg-green-100 text-green-700" : "bg-gray/40 text-ink-soft"}`}>
                {org.ssoEnabled ? "SSO activo" : "SSO inactivo"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <form action={async () => { "use server"; await toggleSso(org.id, !org.ssoEnabled); }}>
                <button type="submit" className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-ink hover:bg-gray/20">
                  {org.ssoEnabled ? "Desactivar SSO" : "Activar SSO"}
                </button>
              </form>
              {org.workosOrgId && (
                <form action={async () => {
                  "use server";
                  const link = await generateAdminPortalLink(org.id);
                  // El link se genera server-side — copiarlo manualmente desde los logs
                  console.log(`[Admin Portal] ${org.name}: ${link}`);
                }}>
                  <button type="submit" className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-blue hover:bg-blue/5">
                    Generar link Admin Portal → (ver logs)
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
```

> **Nota sobre Admin Portal link:** `generateAdminPortalLink` retorna la URL en el servidor. Para esta v1 se loguea en consola (visible en Netlify Functions logs). En v2 se puede enviar por email o copiar via una UI client-side.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/orgs/
git commit -m "feat(admin): /admin/orgs — create orgs, toggle SSO, generate WorkOS Admin Portal link"
```

---

## Task 9: Org admin dashboard — miembros y bóvedas

**Files:**
- Create: `src/app/dashboard/org/page.tsx`
- Create: `src/app/dashboard/org/actions.ts`

**Interfaces:**
- Consumes: `auth` de `@/lib/auth`; `db` de `@/lib/db`; `provisionOrgVaults`, `removeOrgVaultAccess` de `@/lib/sso-provisioning`; `OrgRole`, `VaultRole` de `@prisma/client`.
- Produces: página `/dashboard/org` visible solo a OWNER y ADMIN; `changeMemberRole(memberId, newRole)`; `createOrgVault(name, orgMinRole)`.

- [ ] **Step 1: Crear server actions**

Crear `src/app/dashboard/org/actions.ts`:

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrgRole, VaultRole } from "@prisma/client";
import { provisionOrgVaults, removeOrgVaultAccess } from "@/lib/sso-provisioning";

async function requireOrgAdmin() {
  const session = await auth();
  const orgRole = session?.user?.orgRole;
  if (!session?.user?.id || (orgRole !== OrgRole.OWNER && orgRole !== OrgRole.ADMIN)) {
    redirect("/dashboard");
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, orgRole: true },
  });
  if (!user?.organizationId) redirect("/dashboard");
  return { userId: session.user.id, orgId: user.organizationId, orgRole: user.orgRole! };
}

const ROLE_RANK: Record<OrgRole, number> = {
  [OrgRole.MEMBER]: 0,
  [OrgRole.ADMIN]: 1,
  [OrgRole.OWNER]: 2,
};

export async function changeMemberRole(memberId: string, newRole: OrgRole) {
  const { orgId, orgRole: callerRole } = await requireOrgAdmin();

  // Solo OWNER puede promover/degradar a otro OWNER
  if (newRole === OrgRole.OWNER && callerRole !== OrgRole.OWNER) {
    throw new Error("Solo el OWNER puede asignar ese rol.");
  }

  const member = await db.user.findUnique({
    where: { id: memberId, organizationId: orgId },
    select: { orgRole: true },
  });
  if (!member) throw new Error("Miembro no encontrado.");

  const oldRole = member.orgRole ?? OrgRole.MEMBER;

  await db.user.update({ where: { id: memberId }, data: { orgRole: newRole } });

  // Propagar cambios de acceso a bóvedas
  if (ROLE_RANK[newRole] > ROLE_RANK[oldRole]) {
    // Rol subió — provisionar bóvedas adicionales
    await provisionOrgVaults(memberId, orgId, newRole);
  } else if (ROLE_RANK[newRole] < ROLE_RANK[oldRole]) {
    // Rol bajó — quitar acceso a bóvedas que ya no le corresponden
    // Roles que newRole ya NO puede ver pero oldRole sí podía
    const toRemove =
      oldRole === OrgRole.OWNER
        ? newRole === OrgRole.ADMIN
          ? [OrgRole.OWNER]
          : [OrgRole.OWNER, OrgRole.ADMIN]
        : [OrgRole.ADMIN]; // ADMIN → MEMBER
    await removeOrgVaultAccess(memberId, orgId, toRemove);
  }

  revalidatePath("/dashboard/org");
}

export async function createOrgVault(formData: FormData) {
  const { orgId } = await requireOrgAdmin();

  const name = (formData.get("name") as string)?.trim();
  const orgMinRole = formData.get("orgMinRole") as OrgRole;

  if (!name || !Object.values(OrgRole).includes(orgMinRole)) {
    throw new Error("Nombre y rol mínimo son requeridos.");
  }

  // Crear bóveda de org
  const vault = await db.vault.create({
    data: {
      name,
      ownerId: (await auth())!.user!.id!,
      organizationId: orgId,
      orgMinRole,
    },
  });

  // Provisionar acceso a todos los miembros que califican
  const qualifying = await db.user.findMany({
    where: {
      organizationId: orgId,
      orgRole: {
        in:
          orgMinRole === OrgRole.MEMBER
            ? [OrgRole.MEMBER, OrgRole.ADMIN, OrgRole.OWNER]
            : orgMinRole === OrgRole.ADMIN
            ? [OrgRole.ADMIN, OrgRole.OWNER]
            : [OrgRole.OWNER],
      },
    },
    select: { id: true },
  });

  if (qualifying.length > 0) {
    await db.vaultMember.createMany({
      data: qualifying.map((u) => ({
        vaultId: vault.id,
        userId: u.id,
        role: VaultRole.VIEWER,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/dashboard/org");
}
```

- [ ] **Step 2: Crear página /dashboard/org**

Crear `src/app/dashboard/org/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrgRole } from "@prisma/client";
import { changeMemberRole, createOrgVault } from "./actions";

export const metadata = { title: "Mi organización" };

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Dueño",
  ADMIN: "Admin",
  MEMBER: "Miembro",
};

export default async function OrgDashboardPage() {
  const session = await auth();
  const orgRole = session?.user?.orgRole as OrgRole | null;

  if (!session?.user?.id || (orgRole !== OrgRole.OWNER && orgRole !== OrgRole.ADMIN)) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) redirect("/dashboard");

  const [org, members, orgVaults] = await Promise.all([
    db.organization.findUnique({ where: { id: user.organizationId } }),
    db.user.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, email: true, name: true, orgRole: true },
      orderBy: { createdAt: "asc" },
    }),
    db.vault.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true, orgMinRole: true, _count: { select: { credentials: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!org) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">{org.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {org.domain} · SSO {org.ssoEnabled ? "activo" : "inactivo"}
      </p>

      {/* Miembros */}
      <section className="mt-8">
        <h2 className="font-semibold text-ink">Miembros ({members.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-paper px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{m.name || m.email}</p>
                {m.name && <p className="text-xs text-ink-soft">{m.email}</p>}
              </div>
              <form action={async (fd: FormData) => {
                "use server";
                const newRole = fd.get("role") as OrgRole;
                await changeMemberRole(m.id, newRole);
              }} className="flex items-center gap-2">
                <select name="role" defaultValue={m.orgRole ?? OrgRole.MEMBER}
                  className="rounded-lg border border-border-soft bg-paper px-2 py-1 text-xs text-ink focus:outline-none">
                  {Object.values(OrgRole).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button type="submit"
                  className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-ink hover:bg-gray/20">
                  Guardar
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Bóvedas de org */}
      <section className="mt-8">
        <h2 className="font-semibold text-ink">Bóvedas de organización ({orgVaults.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {orgVaults.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-paper px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{v.name}</p>
                <p className="text-xs text-ink-soft">
                  Acceso mínimo: {ROLE_LABELS[v.orgMinRole ?? OrgRole.MEMBER]} · {v._count.credentials} credenciales
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crear nueva bóveda de org */}
        <form action={createOrgVault} className="mt-4 flex gap-2">
          <input name="name" required placeholder="Nombre de la bóveda"
            className="flex-1 rounded-xl border border-border-soft bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-blue focus:outline-none" />
          <select name="orgMinRole"
            className="rounded-xl border border-border-soft bg-paper px-3 py-2 text-sm text-ink focus:outline-none">
            <option value={OrgRole.MEMBER}>Todos</option>
            <option value={OrgRole.ADMIN}>Admin+</option>
            <option value={OrgRole.OWNER}>Solo dueño</option>
          </select>
          <button type="submit"
            className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            + Crear
          </button>
        </form>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Agregar link a /dashboard/org en el nav del dashboard**

En el componente de navegación del dashboard (buscar con `grep -r "dashboard" src/components/ --include="*.tsx" -l`), agregar:
```tsx
// Solo si session.user.orgRole === "OWNER" || "ADMIN"
<Link href="/dashboard/org">Mi organización</Link>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/org/
git commit -m "feat(dashboard): /dashboard/org — member roles, org vaults, auto-provisioning"
```

---

## Task 10: PR y verificación final

- [ ] **Step 1: Build de producción limpio**

```bash
npm run build 2>&1 | tail -20
```

Esperado: sin errores de TypeScript ni de build.

- [ ] **Step 2: Push y PR feature → develop**

```bash
git push origin feature/enterprise-sso
gh pr create --base develop --head feature/enterprise-sso \
  --title "feat: enterprise SSO via WorkOS — orgs, roles, org vaults" \
  --body "$(cat docs/superpowers/specs/2026-09-12-enterprise-sso-design.md | head -30)"
```

- [ ] **Step 3: Configurar variables de entorno en Netlify**

En el dashboard de Netlify, agregar:
- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_REDIRECT_URI=https://kf1.kitifica.com/api/auth/sso/callback`

- [ ] **Step 4: PR develop → main**

```bash
gh pr create --base main --head develop \
  --title "release: enterprise SSO" \
  --body "Merge develop → main con enterprise SSO completo."
```
