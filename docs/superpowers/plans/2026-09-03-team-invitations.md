# Team Invitations (Editor / Viewer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a vault owner invite teammates by email with an EDITOR or VIEWER role; invitees accept via an emailed link, then the shared vault appears in their dashboard with role-appropriate permissions.

**Architecture:** Two new Prisma models — `VaultMember` (accepted membership + role) and `VaultInvite` (pending email invite + token). `AuditLog` gains `actorEmail` for per-person accountability. A new `requireVaultAccess(vaultId, minRole)` helper replaces the owner-only `requireVaultOwnership` gate across every vault server action. Dashboard vault loading becomes membership-aware. Member management UI is OWNER-only. Invite email reuses the existing Resend `shell()` template. Invite tokens live in `VaultInvite.token` (not the shared `VerificationToken` table).

**Tech Stack:** Next.js 16 App Router (server components + server actions), Prisma 6 / PostgreSQL (Supabase), NextAuth v5 (JWT sessions), Zod 4, Resend REST (already wired in `src/lib/email.ts`), Tailwind v4.

**Spec:** This plan implements the design agreed in conversation on 2026-09-03 (data model, roles matrix, invite/accept flow, deferred scope). Summary reproduced under "Design" below; there is no separate spec file.

## Global Constraints

- **No test runner exists.** The project has zero tests and none are configured (`package.json` scripts: `dev`, `build`, `start`, `lint`). Per-task verification is: `npm run build` (runs `tsc` — must be clean), `npm run lint` (must be clean), and an assert-based `node -e` / `node --input-type=module` self-check for any non-trivial pure function. Do **not** add a test framework.
- **Prisma workflow is `db push`, not migrations** (`prisma/migrations/` does not exist). Schema changes require `npx prisma generate` locally and `npx prisma db push` against the database. Netlify build runs `prisma generate` via `postinstall` but **never** `db push` — the operator must run `db push` (or the equivalent SQL) before the deploy that ships schema-dependent code, or registration/dashboard 500s.
- **Style:** caveman/ponytail (`CLAUDE.md`). Terse Spanish (`rioplatense` "vos") in UI copy, matching existing strings. No new dependencies. Match existing file patterns.
- **Commit + push each task** to the feature branch. Do not merge to `main` until the whole plan is done and verified — a partial deploy breaks prod (schema/code skew).
- **Copy rules (verbatim):** roles surface to users as `Editor` and `Lector` (not "Viewer"). Owner surfaces as `Dueño`.
- **Email `from`:** `process.env.EMAIL_FROM ?? "Bóveda KF-1 <no-reply@kitifica.com>"` (already the default in `src/lib/email.ts` — reuse `sendEmail`).
- **App URL:** `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` (existing pattern).

---

## Design (reference)

**Roles** (`VaultRole` enum): `OWNER`, `EDITOR`, `VIEWER`. Order for `>=` checks: `VIEWER(0) < EDITOR(1) < OWNER(2)`.

| Capability | VIEWER | EDITOR | OWNER |
|---|---|---|---|
| List credentials, reveal secret, see audit log | ✅ | ✅ | ✅ |
| Add / edit / delete credential | ❌ | ✅ | ✅ |
| Create / revoke share links | ❌ | ✅ | ✅ |
| Invite / change role / remove members, revoke invites | ❌ | ❌ | ✅ |

Every reveal by any member is written to `AuditLog` as `credential_viewed` with `actorEmail`. Share-link create/revoke audit rows also get `actorEmail`.

**Invite flow:**
1. OWNER submits email + role → `VaultInvite` row (token, 7-day expiry) → email with `/invite/<token>`.
2. Recipient opens link:
   - No session → prompt to log in / register with the invited email (`?next=/invite/<token>` carried through).
   - Session email ≠ invite email → "esta invitación es para otra dirección".
   - Session email = invite email → accept card (vault name + role) → `acceptInviteAction` → `VaultMember` upsert + `invite.acceptedAt` set → redirect to `/dashboard/<vaultId>`.
3. Registering with a pending invite for that email auto-accepts all such invites.

**Deferred (not in this plan):** multiple owned vaults + vault switcher, transfer ownership, per-credential permissions, invite resend UI, SSO/SCIM.

---

## File Structure

**Create:**
- `src/lib/vault-access.ts` — `VaultRole`, role ordering, `requireVaultAccess(vaultId, minRole)`, `roleAtLeast()`.
- `src/lib/team-validation.ts` — Zod schemas for invite/role forms (kept out of `src/lib/validation.ts` to avoid churn there; import site is only team code).
- `src/app/invite/[token]/page.tsx` — server component: load invite, branch on session/email, render accept card or error/sign-in prompt.
- `src/app/invite/[token]/accept-form.tsx` — `"use client"` accept button → `acceptInviteAction`.
- `src/components/vault-members.tsx` — `"use client"` OWNER-only panel: member list + role change + remove, pending invite list + revoke, invite form.

**Modify:**
- `prisma/schema.prisma` — add `VaultRole` enum, `VaultMember`, `VaultInvite` models; add `actorEmail String?` to `AuditLog`; add back-relations on `User` and `Vault`.
- `src/lib/email.ts` — add `inviteEmail(link, vaultName, inviterName, roleLabel)`.
- `src/app/dashboard/actions.ts` — swap `requireVaultOwnership` → `requireVaultAccess`; thread `actorEmail`; add `credential_viewed` audit; add `inviteMemberAction`, `revokeInviteAction`, `changeMemberRoleAction`, `removeMemberAction`, `acceptInviteAction`.
- `src/app/dashboard/page.tsx` — pick a vault the user owns **or** is a member of.
- `src/app/dashboard/[vaultId]/page.tsx` — allow members; compute `role`; pass `role` + `members` + `invites` to `VaultView`.
- `src/app/dashboard/[vaultId]/vault-view.tsx` — accept `role`; hide mutating controls for `VIEWER`; render `<VaultMembers>` for `OWNER`.
- `src/app/(auth)/actions.ts` — after `registerAction` creates the user, auto-accept pending `VaultInvite`s for that email.
- `src/app/(auth)/login/login-form.tsx` — honor `?next=` after successful sign-in.
- `src/app/(auth)/register/register-form.tsx` — honor `?next=` after successful sign-in; pre-fill email from `?email=`.

---

## Task 1: Schema — VaultMember, VaultInvite, AuditLog.actorEmail

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma models `VaultMember { id, vaultId, userId, role: VaultRole, createdAt }` (`@@unique([vaultId, userId])`), `VaultInvite { id, vaultId, email, role: VaultRole, token @unique, invitedById, expiresAt, acceptedAt, createdAt }`, enum `VaultRole { OWNER EDITOR VIEWER }`, and `AuditLog.actorEmail String?`. Relations: `Vault.members VaultMember[]`, `Vault.invites VaultInvite[]`, `User.memberships VaultMember[]`, `User.sentInvites VaultInvite[]`.

- [ ] **Step 1: Add the enum and models**

In `prisma/schema.prisma`, immediately after the `enum LinkPermission { ... }` block, add:

```prisma
enum VaultRole {
  OWNER
  EDITOR
  VIEWER
}

// Accepted membership. The vault owner also gets an OWNER row here (created
// alongside the vault) so "which vaults can I open" is a single query.
model VaultMember {
  id        String    @id @default(cuid())
  vaultId   String
  vault     Vault     @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      VaultRole @default(VIEWER)
  createdAt DateTime  @default(now())

  @@unique([vaultId, userId])
}

// Pending invite. `token` goes in the /invite/<token> URL. Deleted-by-cascade
// with the vault; kept after acceptance (acceptedAt set) for the audit trail.
model VaultInvite {
  id          String    @id @default(cuid())
  vaultId     String
  vault       Vault     @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  email       String
  role        VaultRole @default(VIEWER)
  token       String    @unique
  invitedById String
  invitedBy   User      @relation(fields: [invitedById], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([email])
}
```

- [ ] **Step 2: Add back-relations on `Vault`**

In `model Vault`, add two lines after `credentials Credential[]`:

```prisma
  members     VaultMember[]
  invites     VaultInvite[]
```

- [ ] **Step 3: Add back-relations on `User`**

In `model User`, after `vaults       Vault[]`, add:

```prisma
  memberships  VaultMember[]
  sentInvites  VaultInvite[]
```

- [ ] **Step 4: Add `actorEmail` to `AuditLog`**

In `model AuditLog`, after the `action      String` line, add:

```prisma
  // Email of the signed-in team member who caused the event (create/revoke
  // share link, view credential). Null for anonymous share-link recipients.
  actorEmail  String?
```

- [ ] **Step 5: Regenerate the client and verify it compiles**

```bash
npx prisma generate
npm run build
```

Expected: `prisma generate` succeeds; `npm run build` compiles (no type errors — nothing consumes the new models yet).

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(team): schema for VaultMember, VaultInvite, AuditLog.actorEmail"
```

- [ ] **Step 7: Apply to the database (operator step — record it, do not skip)**

Run against the same database the app uses:

```bash
npx prisma db push
```

If `DATABASE_URL` in the environment points at the local dev DB and it is down, run this SQL on the production database instead (Supabase SQL editor):

```sql
CREATE TYPE "VaultRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

CREATE TABLE "VaultMember" (
  "id" TEXT PRIMARY KEY,
  "vaultId" TEXT NOT NULL REFERENCES "Vault"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "VaultRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("vaultId", "userId")
);

CREATE TABLE "VaultInvite" (
  "id" TEXT PRIMARY KEY,
  "vaultId" TEXT NOT NULL REFERENCES "Vault"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" "VaultRole" NOT NULL DEFAULT 'VIEWER',
  "token" TEXT NOT NULL UNIQUE,
  "invitedById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "VaultInvite_email_idx" ON "VaultInvite"("email");

ALTER TABLE "AuditLog" ADD COLUMN "actorEmail" TEXT;

-- Backfill: every existing vault owner becomes an OWNER member.
INSERT INTO "VaultMember" ("id", "vaultId", "userId", "role", "createdAt")
SELECT gen_random_uuid()::text, "id", "ownerId", 'OWNER', CURRENT_TIMESTAMP
FROM "Vault"
ON CONFLICT ("vaultId", "userId") DO NOTHING;
```

If `db push` was used instead of the SQL, still run the backfill:

```bash
node --input-type=module -e "import {PrismaClient} from '@prisma/client'; const db=new PrismaClient(); const vs=await db.vault.findMany(); for (const v of vs) await db.vaultMember.upsert({where:{vaultId_userId:{vaultId:v.id,userId:v.ownerId}},create:{vaultId:v.id,userId:v.ownerId,role:'OWNER'},update:{role:'OWNER'}}); console.log('backfilled', vs.length); await db.\$disconnect();"
```

---

## Task 2: `requireVaultAccess` helper

**Files:**
- Create: `src/lib/vault-access.ts`
- Test: `src/lib/vault-access.selfcheck.mjs` (throwaway, deleted in Step 5)

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `auth` from `@/lib/auth`, `VaultRole` type from `@prisma/client`.
- Produces:
  - `type Role = "OWNER" | "EDITOR" | "VIEWER"`
  - `roleAtLeast(role: Role, min: Role): boolean`
  - `requireVaultAccess(vaultId: string, minRole: Role): Promise<{ userId: string; email: string; role: Role }>` — throws `Error("No autenticado")` or `Error("Sin acceso a esta bóveda")`.
  - `getVaultRole(vaultId: string, userId: string): Promise<Role | null>` — no session lookup, no throw.

- [ ] **Step 1: Write the helper**

Create `src/lib/vault-access.ts`:

```ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type Role = "OWNER" | "EDITOR" | "VIEWER";

const RANK: Record<Role, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export function roleAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

// Membership role for a user in a vault, or null. Falls back to the vault's
// ownerId so vaults created before the VaultMember backfill still work.
export async function getVaultRole(vaultId: string, userId: string): Promise<Role | null> {
  const member = await db.vaultMember.findUnique({
    where: { vaultId_userId: { vaultId, userId } },
    select: { role: true },
  });
  if (member) return member.role;
  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { ownerId: true } });
  return vault && vault.ownerId === userId ? "OWNER" : null;
}

// Gate for server actions / loaders. Returns the caller's identity + role.
export async function requireVaultAccess(
  vaultId: string,
  minRole: Role
): Promise<{ userId: string; email: string; role: Role }> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) throw new Error("No autenticado");

  const role = await getVaultRole(vaultId, userId);
  if (!role || !roleAtLeast(role, minRole)) throw new Error("Sin acceso a esta bóveda");
  return { userId, email, role };
}
```

- [ ] **Step 2: Write and run the pure-logic self-check**

Create `src/lib/vault-access.selfcheck.mjs`:

```js
const RANK = { VIEWER: 0, EDITOR: 1, OWNER: 2 };
const roleAtLeast = (role, min) => RANK[role] >= RANK[min];
const c = (a, b) => { if (a !== b) { console.error("FAIL", a, "!==", b); process.exit(1); } };
c(roleAtLeast("OWNER", "EDITOR"), true);
c(roleAtLeast("EDITOR", "EDITOR"), true);
c(roleAtLeast("VIEWER", "EDITOR"), false);
c(roleAtLeast("EDITOR", "OWNER"), false);
c(roleAtLeast("VIEWER", "VIEWER"), true);
console.log("roleAtLeast OK");
```

Run:

```bash
node src/lib/vault-access.selfcheck.mjs
```

Expected: `roleAtLeast OK`.

- [ ] **Step 3: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean.

- [ ] **Step 4: Delete the throwaway self-check**

```bash
rm src/lib/vault-access.selfcheck.mjs
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/vault-access.ts
git commit -m "feat(team): requireVaultAccess role gate helper"
```

---

## Task 3: Gate existing vault actions + audit actorEmail

**Files:**
- Modify: `src/app/dashboard/actions.ts:31-37` (remove `requireVaultOwnership`), and its call sites at lines ~91, ~103, ~113, ~126, ~161.

**Interfaces:**
- Consumes: `requireVaultAccess` from `@/lib/vault-access` (Task 2).
- Produces: no new exports. Behavior change: `createCredentialAction`, `deleteCredentialAction`, `createShareLinkAction`, `revokeShareLinkAction` now require role ≥ `EDITOR`; `revealCredentialAction` requires role ≥ `VIEWER` and writes a `credential_viewed` audit row; share-link audit rows carry `actorEmail`.

- [ ] **Step 1: Replace the import and remove the old helper**

In `src/app/dashboard/actions.ts`, replace the `updateCompanyNameSchema` import block's neighbours — specifically, after the existing `import { ... } from "@/lib/validation";` line add:

```ts
import { requireVaultAccess } from "@/lib/vault-access";
```

Then delete the whole `requireVaultOwnership` function (lines 31-37):

```ts
async function requireVaultOwnership(vaultId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const vault = await db.vault.findUnique({ where: { id: vaultId } });
  if (!vault || vault.ownerId !== session.user.id) throw new Error("Bóveda no encontrada");
  return session.user.id;
}
```

- [ ] **Step 2: Gate `createCredentialAction`**

Replace `await requireVaultOwnership(vaultId);` (line ~91) with:

```ts
  await requireVaultAccess(vaultId, "EDITOR");
```

- [ ] **Step 3: Gate `revealCredentialAction` + add the view audit**

Replace the body of `revealCredentialAction` (lines ~102-110) with:

```ts
export async function revealCredentialAction(vaultId: string, credentialId: string) {
  const { email } = await requireVaultAccess(vaultId, "VIEWER");
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) throw new Error("Credencial no encontrada");
  await db.auditLog.create({
    data: {
      vaultId,
      action: "credential_viewed",
      credentialService: credential.service,
      actorEmail: email,
    },
  });
  return JSON.parse(decryptAtRest(credential.encryptedData)) as { secret: string; notes: string };
}
```

- [ ] **Step 4: Gate `deleteCredentialAction`**

Replace `await requireVaultOwnership(vaultId);` (line ~113) with:

```ts
  await requireVaultAccess(vaultId, "EDITOR");
```

- [ ] **Step 5: Gate `createShareLinkAction` + audit actor**

Replace `await requireVaultOwnership(vaultId);` (line ~126) with:

```ts
  const { email: actorEmail } = await requireVaultAccess(vaultId, "EDITOR");
```

Then in the same function, change the audit create (lines ~151-153) to:

```ts
  await db.auditLog.create({
    data: {
      vaultId,
      action: "link_created",
      shareLinkId: created.id,
      credentialService: credential.service,
      actorEmail,
    },
  });
```

- [ ] **Step 6: Gate `revokeShareLinkAction` + audit actor**

Replace `await requireVaultOwnership(vaultId);` (line ~161) with:

```ts
  const { email: actorEmail } = await requireVaultAccess(vaultId, "EDITOR");
```

Then change the audit create (lines ~173-175) to:

```ts
  await db.auditLog.create({
    data: { vaultId, shareLinkId, action: "link_revoked", credentialService: link?.credential.service, actorEmail },
  });
```

- [ ] **Step 7: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean. (`auth` is still imported and used by other actions — no unused-import error.)

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/actions.ts
git commit -m "feat(team): role-gate vault actions, attribute audit to actorEmail"
```

---

## Task 4: Invite email template

**Files:**
- Modify: `src/lib/email.ts` — add `inviteEmail` next to the other `export function *Email(...)` builders.

**Interfaces:**
- Consumes: the module-private `shell({ preview, heading, bodyHtml, cta?, footnote? })` and `esc()` already in `src/lib/email.ts`.
- Produces: `inviteEmail(link: string, vaultName: string, inviterName: string, roleLabel: string): { subject: string; html: string }`.

- [ ] **Step 1: Add the builder**

At the end of `src/lib/email.ts` (after `linkOpenedEmail`), add:

```ts
export function inviteEmail(link: string, vaultName: string, inviterName: string, roleLabel: string) {
  return {
    subject: `${inviterName} te invitó a una bóveda en KF-1`,
    html: shell({
      preview: `Te sumaron a "${vaultName}" como ${roleLabel}.`,
      heading: "Te invitaron a una bóveda",
      bodyHtml: `<p style='margin:0 0 12px;'><strong>${esc(inviterName)}</strong> te sumó a la bóveda <strong>${esc(
        vaultName
      )}</strong> como <strong>${esc(roleLabel)}</strong>. Aceptá para ver las credenciales compartidas del equipo.</p>`,
      cta: { label: "Aceptar invitación", href: link },
      footnote: "Si no esperabas esto, ignorá el mensaje. El enlace vence en 7 días.",
    }),
  };
}
```

- [ ] **Step 2: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat(team): invite email template"
```

---

## Task 5: Invite / member server actions

**Files:**
- Create: `src/lib/team-validation.ts`
- Modify: `src/app/dashboard/actions.ts` — append a "Team" section with five actions.

**Interfaces:**
- Consumes: `requireVaultAccess` (Task 2), `inviteEmail` + `sendEmail` (Task 4 + existing), `db`, `auth`, `randomBytes` from `node:crypto`, `revalidatePath`.
- Produces:
  - `inviteMemberAction(vaultId: string, formData: FormData): Promise<string | null>` — form fields `email`, `role` (`"EDITOR" | "VIEWER"`).
  - `revokeInviteAction(vaultId: string, inviteId: string): Promise<void>`
  - `changeMemberRoleAction(vaultId: string, memberId: string, role: "EDITOR" | "VIEWER"): Promise<string | null>`
  - `removeMemberAction(vaultId: string, memberId: string): Promise<void>`
  - `acceptInviteAction(token: string): Promise<{ ok: true; vaultId: string } | { ok: false; error: string }>`
  - `ROLE_LABEL: Record<"OWNER" | "EDITOR" | "VIEWER", string>` exported for UI reuse.

- [ ] **Step 1: Validation schemas**

Create `src/lib/team-validation.ts`:

```ts
import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().email("Correo inválido").toLowerCase(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const memberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});
```

- [ ] **Step 2: Append the Team actions**

At the end of `src/app/dashboard/actions.ts`, add:

```ts
// ── Team: invites & members ────────────────────────────────────────────

import { randomBytes } from "node:crypto";
import { inviteEmail, sendEmail } from "@/lib/email";
import { inviteSchema } from "@/lib/team-validation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ROLE_LABEL: Record<"OWNER" | "EDITOR" | "VIEWER", string> = {
  OWNER: "Dueño",
  EDITOR: "Editor",
  VIEWER: "Lector",
};

export async function inviteMemberAction(vaultId: string, formData: FormData): Promise<string | null> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const parsed = inviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { email, role } = parsed.data;

  if (email === actorEmail.toLowerCase()) return "Ese sos vos.";

  const already = await db.vaultMember.findFirst({
    where: { vaultId, user: { email } },
    select: { id: true },
  });
  if (already) return "Esa persona ya es parte de la bóveda.";

  const token = randomBytes(32).toString("hex");
  // One live invite per (vault, email): replace any prior unaccepted one.
  await db.vaultInvite.deleteMany({ where: { vaultId, email, acceptedAt: null } });
  const invite = await db.vaultInvite.create({
    data: {
      vaultId,
      email,
      role,
      token,
      invitedById: (await auth())!.user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { name: true } });
  const link = `${APP_URL}/invite/${token}`;
  const { subject, html } = inviteEmail(link, vault?.name ?? "una bóveda", actorEmail, ROLE_LABEL[role]);
  await sendEmail(email, subject, html);

  await db.auditLog.create({
    data: { vaultId, action: "member_invited", actorEmail, credentialService: email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;

  // (invite var kept for clarity; not otherwise used)
  void invite;
}

export async function revokeInviteAction(vaultId: string, inviteId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const { count } = await db.vaultInvite.deleteMany({ where: { id: inviteId, vaultId, acceptedAt: null } });
  if (count) {
    await db.auditLog.create({ data: { vaultId, action: "invite_revoked", actorEmail } });
    revalidatePath(`/dashboard/${vaultId}`);
  }
}

export async function changeMemberRoleAction(
  vaultId: string,
  memberId: string,
  role: "EDITOR" | "VIEWER"
): Promise<string | null> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const member = await db.vaultMember.findFirst({ where: { id: memberId, vaultId } });
  if (!member) return "Miembro no encontrado.";
  if (member.role === "OWNER") return "No podés cambiar el rol del dueño.";
  await db.vaultMember.update({ where: { id: memberId }, data: { role } });
  await db.auditLog.create({ data: { vaultId, action: "member_role_changed", actorEmail } });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function removeMemberAction(vaultId: string, memberId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const { count } = await db.vaultMember.deleteMany({
    where: { id: memberId, vaultId, role: { not: "OWNER" } },
  });
  if (count) {
    await db.auditLog.create({ data: { vaultId, action: "member_removed", actorEmail } });
    revalidatePath(`/dashboard/${vaultId}`);
  }
}

export async function acceptInviteAction(
  token: string
): Promise<{ ok: true; vaultId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { ok: false, error: "No autenticado" };

  const invite = await db.vaultInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt) return { ok: false, error: "Invitación inválida o ya usada." };
  if (invite.expiresAt < new Date()) return { ok: false, error: "La invitación venció." };
  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return { ok: false, error: `Esta invitación es para ${invite.email}.` };
  }

  await db.vaultMember.upsert({
    where: { vaultId_userId: { vaultId: invite.vaultId, userId: session.user.id } },
    create: { vaultId: invite.vaultId, userId: session.user.id, role: invite.role },
    update: { role: invite.role },
  });
  await db.vaultInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  await db.auditLog.create({
    data: { vaultId: invite.vaultId, action: "member_joined", actorEmail: session.user.email },
  });
  revalidatePath(`/dashboard/${invite.vaultId}`);
  return { ok: true, vaultId: invite.vaultId };
}
```

> Note: the `import` statements above sit mid-file. That is valid in an ES module and keeps this task's diff self-contained, but if the executor prefers, hoist the three new `import` lines to the top with the others — functionally identical.

- [ ] **Step 3: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: clean. If lint flags `void invite;` / unused `invite`, simplify Step 2 by removing `const invite =` (just `await db.vaultInvite.create({...})`) and delete the `void invite;` line.

- [ ] **Step 4: Commit**

```bash
git add src/lib/team-validation.ts src/app/dashboard/actions.ts
git commit -m "feat(team): invite/accept/member server actions"
```

---

## Task 6: Accept route `/invite/[token]`

**Files:**
- Create: `src/app/invite/[token]/page.tsx`
- Create: `src/app/invite/[token]/accept-form.tsx`

**Interfaces:**
- Consumes: `acceptInviteAction` + `ROLE_LABEL` from `@/app/dashboard/actions` (Task 5), `auth` from `@/lib/auth`, `db` from `@/lib/db`.
- Produces: route `GET /invite/<token>`.

- [ ] **Step 1: Server component**

Create `src/app/invite/[token]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/app/dashboard/actions";
import { AcceptForm } from "./accept-form";

export const metadata: Metadata = {
  title: "Invitación a una bóveda",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8 text-sm">{children}</div>
    </main>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.vaultInvite.findUnique({
    where: { token },
    include: { vault: { select: { name: true } } },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Invitación no válida</h1>
        <p className="mt-2 text-ink-soft">El enlace venció o ya se usó. Pedile a quien te invitó que te mande uno nuevo.</p>
        <Link href="/login" className="mt-5 block text-center underline">Ir a entrar</Link>
      </Shell>
    );
  }

  const session = await auth();
  const roleLabel = ROLE_LABEL[invite.role];

  if (!session?.user?.email) {
    const next = encodeURIComponent(`/invite/${token}`);
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Te invitaron a “{invite.vault.name}”</h1>
        <p className="mt-2 text-ink-soft">
          Rol: <strong className="text-ink">{roleLabel}</strong>. Entrá o creá una cuenta con{" "}
          <strong className="text-ink">{invite.email}</strong> para aceptar.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={`/login?next=${next}`} className="rounded-full bg-ink px-4 py-3 text-center font-medium text-gray">
            Entrar
          </Link>
          <Link
            href={`/register?email=${encodeURIComponent(invite.email)}&next=${next}`}
            className="rounded-full border border-border-soft px-4 py-3 text-center font-medium text-ink"
          >
            Crear cuenta
          </Link>
        </div>
      </Shell>
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Invitación para otra cuenta</h1>
        <p className="mt-2 text-ink-soft">
          Esta invitación es para <strong className="text-ink">{invite.email}</strong>, pero estás con{" "}
          <strong className="text-ink">{session.user.email}</strong>. Salí y entrá con la cuenta correcta.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold text-ink">Unirte a “{invite.vault.name}”</h1>
      <p className="mt-2 text-ink-soft">
        Vas a entrar como <strong className="text-ink">{roleLabel}</strong>. Vas a ver las credenciales
        compartidas del equipo.
      </p>
      <AcceptForm token={token} />
    </Shell>
  );
}
```

- [ ] **Step 2: Client accept form**

Create `src/app/invite/[token]/accept-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/app/dashboard/actions";

export function AcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setPending(true);
    setError(null);
    const result = await acceptInviteAction(token);
    if (result.ok) {
      router.push(`/dashboard/${result.vaultId}`);
      return;
    }
    setPending(false);
    setError(result.error);
  }

  return (
    <div className="mt-5">
      {error && <p role="alert" className="mb-2 rounded-xl bg-danger/10 px-3 py-2 text-danger">{error}</p>}
      <button
        onClick={accept}
        disabled={pending}
        className="w-full cursor-pointer rounded-full bg-ink px-4 py-3 font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Uniéndote..." : "Aceptar y entrar"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build + lint, confirm the route exists**

```bash
npm run build && npm run lint
```

Expected: `npm run build` route list includes `ƒ /invite/[token]`.

- [ ] **Step 4: Add `/invite` to robots disallow**

In `src/app/robots.ts`, add `"/invite"` to the `disallow` array (alongside `/dashboard`, `/admin`, `/s/`, `/api/`).

- [ ] **Step 5: Commit**

```bash
git add "src/app/invite/[token]/page.tsx" "src/app/invite/[token]/accept-form.tsx" src/app/robots.ts
git commit -m "feat(team): /invite/[token] accept route"
```

---

## Task 7: `next` param + auto-accept on register

**Files:**
- Modify: `src/app/(auth)/login/login-form.tsx` — post-sign-in redirect target.
- Modify: `src/app/(auth)/register/register-form.tsx` — pre-fill email, post-sign-in redirect target.
- Modify: `src/app/(auth)/actions.ts` — auto-accept pending invites in `registerAction`.

**Interfaces:**
- Consumes: `db` (existing import in `(auth)/actions.ts`).
- Produces: no new exports. Behavior: `/login?next=/x` and `/register?next=/x&email=y` land on `/x` after auth; registering with a pending `VaultInvite` for the new email creates the `VaultMember` rows immediately.

- [ ] **Step 1: login-form redirect**

In `src/app/(auth)/login/login-form.tsx`, add near the top of the component body (after `const router = useRouter();`):

```tsx
  const nextUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("next")
    : null;
  const dest = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
```

Then replace every `router.push("/dashboard")` in this file (there are three: after password sign-in, after TOTP sign-in, after passkey sign-in) with `router.push(dest)`.

- [ ] **Step 2: register-form email prefill + redirect**

In `src/app/(auth)/register/register-form.tsx`:

Add after `const router = useRouter();`:

```tsx
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const nextUrl = params?.get("next");
  const dest = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
  const prefillEmail = params?.get("email") ?? "";
```

On the email `<input>` (the one with `name="email"`), add `defaultValue={prefillEmail}`.

Replace `router.push("/dashboard")` with `router.push(dest)`.

- [ ] **Step 3: auto-accept in `registerAction`**

In `src/app/(auth)/actions.ts`, in `registerAction`, immediately after the line `await db.vault.create({ data: { name: "Mi bóveda", ownerId: user.id } });` and before `await sendVerification(email);`, insert:

```ts
  // Accept any invites already waiting for this address.
  const pending = await db.vaultInvite.findMany({
    where: { email: email.toLowerCase(), acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  for (const inv of pending) {
    await db.vaultMember.upsert({
      where: { vaultId_userId: { vaultId: inv.vaultId, userId: user.id } },
      create: { vaultId: inv.vaultId, userId: user.id, role: inv.role },
      update: { role: inv.role },
    });
    await db.vaultInvite.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
  }
```

> `registerSchema.email` is not lowercased today; `email.toLowerCase()` here matches how invites are stored (Task 5 lowercases on create).

- [ ] **Step 4: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/login/login-form.tsx" "src/app/(auth)/register/register-form.tsx" "src/app/(auth)/actions.ts"
git commit -m "feat(team): carry ?next= through auth, auto-accept invites on register"
```

---

## Task 8: Membership-aware dashboard loading

**Files:**
- Modify: `src/app/dashboard/page.tsx` (whole file)
- Modify: `src/app/dashboard/[vaultId]/page.tsx` (the access check + the `VaultView` props)

**Interfaces:**
- Consumes: `getVaultRole` from `@/lib/vault-access` (Task 2).
- Produces: `VaultView` receives two new props — `role: "OWNER" | "EDITOR" | "VIEWER"` and `members: Array<{ id: string; email: string; role: "OWNER" | "EDITOR" | "VIEWER" }>` and `invites: Array<{ id: string; email: string; role: "EDITOR" | "VIEWER" }>` (Task 9 consumes these).

- [ ] **Step 1: Dashboard index picks any accessible vault**

Replace the whole body of `src/app/dashboard/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardIndexPage() {
  const session = await auth();
  const userId = session!.user.id;

  const owned = await db.vault.findFirst({ where: { ownerId: userId }, select: { id: true } });
  if (owned) redirect(`/dashboard/${owned.id}`);

  const membership = await db.vaultMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { vaultId: true },
  });
  if (membership) redirect(`/dashboard/${membership.vaultId}`);

  redirect("/login");
}
```

- [ ] **Step 2: Vault page allows members, computes role, loads team**

In `src/app/dashboard/[vaultId]/page.tsx`:

Add import:

```tsx
import { getVaultRole } from "@/lib/vault-access";
```

Replace the line `if (!vault || vault.ownerId !== session?.user.id) notFound();` with:

```tsx
  const role = session?.user?.id ? await getVaultRole(vaultId, session.user.id) : null;
  if (!vault || !role) notFound();
```

Extend the `Promise.all([...])` to also load members and invites. Add these two entries to the array:

```tsx
    db.vaultMember.findMany({
      where: { vaultId },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, user: { select: { email: true } } },
    }),
    db.vaultInvite.findMany({
      where: { vaultId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true },
    }),
```

Update the destructuring to include them, e.g.:

```tsx
  const [auditLogs, owner, passkeys, memberRows, invites] = await Promise.all([ /* ...existing... */ ]);
  const members = memberRows.map((m) => ({ id: m.id, email: m.user.email, role: m.role }));
```

Pass the new props to `<VaultView>`:

```tsx
      role={role}
      members={members}
      invites={invites}
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: `npm run build` fails type-check in `vault-view.tsx` because `VaultView` does not yet accept `role`/`members`/`invites`. That is expected — Task 9 fixes it. If you are running tasks strictly independently, temporarily add `role`, `members`, `invites` to `VaultView`'s props as `unknown` to get a green build, but the intended sequencing is Task 8 → Task 9 back-to-back with a single commit boundary after Task 9. **Commit Task 8 only after confirming the only build error is the missing `VaultView` props.**

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx "src/app/dashboard/[vaultId]/page.tsx"
git commit -m "feat(team): membership-aware dashboard loading + role/members props"
```

---

## Task 9: VaultView role gating + members panel

**Files:**
- Create: `src/components/vault-members.tsx`
- Modify: `src/app/dashboard/[vaultId]/vault-view.tsx` — props, conditional rendering.

**Interfaces:**
- Consumes: `role`, `members`, `invites` props from Task 8; `inviteMemberAction`, `revokeInviteAction`, `changeMemberRoleAction`, `removeMemberAction`, `ROLE_LABEL` from `@/app/dashboard/actions` (Task 5).
- Produces: none.

- [ ] **Step 1: Members panel component**

Create `src/components/vault-members.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  changeMemberRoleAction,
  inviteMemberAction,
  removeMemberAction,
  revokeInviteAction,
  ROLE_LABEL,
} from "@/app/dashboard/actions";
import { Trash2Icon, XCircleIcon } from "@/components/icons";

type Member = { id: string; email: string; role: "OWNER" | "EDITOR" | "VIEWER" };
type Invite = { id: string; email: string; role: "EDITOR" | "VIEWER" };

export function VaultMembers({
  vaultId,
  members,
  invites,
}: {
  vaultId: string;
  members: Member[];
  invites: Invite[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await inviteMemberAction(vaultId, new FormData(e.currentTarget));
    setPending(false);
    if (result) setError(result);
    else e.currentTarget.reset();
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <p className="font-display text-lg font-semibold text-ink">Equipo</p>
      <p className="mt-1 text-sm text-ink-soft">
        Los miembros ven las credenciales descifradas. Cada vista queda en la auditoría.
      </p>

      <ul className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-4 text-sm">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2">
            <span className="text-ink-soft">{m.email}</span>
            {m.role === "OWNER" ? (
              <span className="text-xs text-ink-soft">{ROLE_LABEL.OWNER}</span>
            ) : (
              <span className="flex items-center gap-2">
                <select
                  defaultValue={m.role}
                  onChange={(e) =>
                    changeMemberRoleAction(vaultId, m.id, e.target.value as "EDITOR" | "VIEWER")
                  }
                  className="cursor-pointer rounded-xl border border-border-soft bg-gray/40 px-2 py-1 text-xs outline-none"
                >
                  <option value="EDITOR">{ROLE_LABEL.EDITOR}</option>
                  <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
                </select>
                <button
                  type="button"
                  aria-label={`Quitar a ${m.email}`}
                  onClick={() => removeMemberAction(vaultId, m.id)}
                  className="cursor-pointer text-danger transition hover:text-danger/80"
                >
                  <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </li>
        ))}
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-2 text-ink-soft">
            <span>{inv.email} · invitación pendiente ({ROLE_LABEL[inv.role]})</span>
            <button
              type="button"
              aria-label={`Cancelar invitación a ${inv.email}`}
              onClick={() => revokeInviteAction(vaultId, inv.id)}
              className="flex cursor-pointer items-center gap-1 text-danger transition hover:text-danger/80"
            >
              <XCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={invite} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4" noValidate>
        <input
          name="email"
          type="email"
          required
          placeholder="correo@empresa.com"
          className="min-w-0 flex-1 rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-base sm:text-sm outline-none transition focus:border-ink"
        />
        <select
          name="role"
          defaultValue="VIEWER"
          className="cursor-pointer rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-sm outline-none"
        >
          <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
          <option value="EDITOR">{ROLE_LABEL.EDITOR}</option>
        </select>
        <button
          disabled={pending}
          className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Invitando..." : "Invitar"}
        </button>
        {error && <p role="alert" className="w-full rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Wire into `VaultView` — props**

In `src/app/dashboard/[vaultId]/vault-view.tsx`, add the import:

```tsx
import { VaultMembers } from "@/components/vault-members";
```

Extend the `VaultView` props type and destructuring to add:

```tsx
  role,
  members,
  invites,
```

and in the type:

```tsx
  role: "OWNER" | "EDITOR" | "VIEWER";
  members: { id: string; email: string; role: "OWNER" | "EDITOR" | "VIEWER" }[];
  invites: { id: string; email: string; role: "EDITOR" | "VIEWER" }[];
```

- [ ] **Step 3: Wire into `VaultView` — conditional rendering**

Add `const canEdit = role === "OWNER" || role === "EDITOR";` at the top of the `VaultView` component body.

- Wrap the `<AddCredentialForm vaultId={vault.id} />` render so it only shows when `canEdit`: `{canEdit && <AddCredentialForm vaultId={vault.id} />}`.
- Pass `canEdit` down to `<CredentialRow>`: add a `canEdit` prop to the `CredentialRow` component signature (`function CredentialRow({ vaultId, credential, canEdit }: { vaultId: string; credential: CredentialWithLinks; canEdit: boolean })`) and pass it in the `.map`: `<CredentialRow key={c.id} vaultId={vault.id} credential={c} canEdit={canEdit} />`.
- Inside `CredentialRow`, gate the mutating controls (the `Compartir` toggle button, the `Eliminar` button, the share `<form>`, the per-link `Nuevo link` / `Revocar` buttons) behind `canEdit`. The `Ver` (reveal) button and the "Links generados" list stay visible for everyone. Concretely: wrap the `<button ... onClick={() => setSharing(...)}>Compartir</button>` and `<button ... onClick={() => deleteCredentialAction(...)}>Eliminar</button>` and the `{sharing && (<form ...>)}` and the `{status === "activo" && (<span>...Nuevo link...Revocar...</span>)}` blocks each in `{canEdit && ( ... )}`.
- After `<TwoFactorSettings .../>` (or wherever the settings cards end), add:

```tsx
      {role === "OWNER" && <VaultMembers vaultId={vault.id} members={members} invites={invites} />}
```

- [ ] **Step 4: Verify build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean. Route list unchanged.

- [ ] **Step 5: Manual smoke (best-effort, needs a working DB)**

If a dev DB is reachable: start `npm run dev`, log in as a vault owner, open the vault, confirm the "Equipo" panel renders, invite a second email, check the `VaultInvite` row and the Resend dashboard for the email. Log in as the invited user (or register), open `/invite/<token>` from the email, accept, confirm redirect to the vault and that VIEWER sees no add/edit/share controls. If no DB is reachable, note that in the task completion and rely on build/lint.

- [ ] **Step 6: Commit**

```bash
git add src/components/vault-members.tsx "src/app/dashboard/[vaultId]/vault-view.tsx"
git commit -m "feat(team): VaultView role gating + owner members panel"
```

---

## Task 10: Deploy checklist (operator)

**Files:** none (release step).

- [ ] **Step 1: DMARC on kitifica.com** — add the DNS TXT record so invite emails don't land in spam:
  `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:dmarc@kitifica.com`
- [ ] **Step 2: Confirm the DB schema is applied** (Task 1 Step 7) on the same database Netlify's `DATABASE_URL` points to.
- [ ] **Step 3: Merge the feature branch to `main`** and let Netlify deploy. Verify the build passes secret-scanning (no literal emails were added).
- [ ] **Step 4: Post-deploy smoke on prod** — invite a real second address, accept, confirm role gating.

---

## Self-Review

**1. Spec coverage:**
- Invite by email with EDITOR/VIEWER role → Task 5 `inviteMemberAction`, Task 4 email, Task 6 accept route. ✅
- Accept flow (no account / wrong email / right email) → Task 6 branches. ✅
- Auto-accept on register → Task 7 Step 3. ✅
- Role-gated actions → Task 3. ✅
- Per-person audit (`actorEmail`, `credential_viewed`) → Task 1 + Task 3. ✅
- Shared vault appears in invitee's dashboard → Task 8. ✅
- Role-appropriate UI (hide mutations for VIEWER, members panel for OWNER) → Task 9. ✅
- Owner-only member management → Task 5 gates + Task 9 render condition. ✅
- Deferred items (multi-vault switcher, transfer ownership, per-credential perms) → explicitly out, not planned. ✅
- DMARC dependency → Task 10 Step 1. ✅

**2. Placeholder scan:** No "TBD/TODO/add error handling" — every step has concrete code or an exact command. Task 9 Step 3 describes edits in prose rather than a full file rewrite because `vault-view.tsx` is large and the executor must read the current file; the specific elements to wrap are named exactly.

**3. Type consistency:**
- `Role` / `"OWNER" | "EDITOR" | "VIEWER"` string union used consistently (vault-access, actions, page props, component props).
- `requireVaultAccess` returns `{ userId, email, role }` — consumed as `{ email: actorEmail }` in Task 3/5. ✅
- `acceptInviteAction` returns `{ ok: true; vaultId } | { ok: false; error }` — matched in Task 6 accept-form. ✅
- `getVaultRole(vaultId, userId): Promise<Role | null>` — used in Task 8 Step 2. ✅
- `ROLE_LABEL` keys are the full 3-role union — used in Task 6, Task 9. ✅
- `inviteEmail(link, vaultName, inviterName, roleLabel)` signature — call site in Task 5 passes exactly those 4. ✅
- Prisma compound unique `vaultId_userId` — used in `getVaultRole`, `acceptInviteAction`, register auto-accept, backfill. Matches `@@unique([vaultId, userId])`. ✅

---

## Execution Handoff

Recommend a feature branch (`feat/team-invitations`) rather than committing to `main` — this is a 9-task change with a DB migration; a partial deploy breaks prod.
