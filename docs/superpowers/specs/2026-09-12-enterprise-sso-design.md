# Enterprise SSO — Design Spec
**Fecha:** 2026-09-12  
**Branch:** `feature/enterprise-sso`  
**Provider:** WorkOS (`@workos-inc/node` v10.13.0)  
**Approach:** Flujo SSO paralelo + nonce bridge (NextAuth intacto)

---

## Contexto

KF-1 necesita autenticación corporativa (SSO/SAML) para vender a empresas. El objetivo de v1 es: una empresa configura su IdP (Okta, Azure AD, Google Workspace) una sola vez, y desde ese momento sus empleados entran con su cuenta corporativa. El acceso a credenciales se controla automáticamente por rol dentro de la organización.

El auth stack existente (Credentials + Passkey + TOTP) no se modifica.

---

## Modelo de datos

### Nuevos modelos

```prisma
enum OrgRole { OWNER ADMIN MEMBER }

model Organization {
  id          String   @id @default(cuid())
  name        String
  workosOrgId String?  @unique   // ID de org en WorkOS dashboard
  domain      String?  @unique   // "acme.com" — detecta SSO por email
  ssoEnabled  Boolean  @default(false)
  firstOwnerEmail String?        // email designado como primer OWNER
  createdAt   DateTime @default(now())
  members     User[]
  vaults      Vault[]
}

// Nonce de vida corta (60s): bridge entre callback WorkOS y NextAuth session
model SsoNonce {
  id        String   @id @default(cuid())
  nonce     String   @unique @default(cuid())
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### Cambios en modelos existentes

**User** (campos nuevos, resto intacto):
```prisma
organizationId  String?
organization    Organization? @relation(fields: [organizationId], references: [id])
orgRole         OrgRole?
workosUserId    String?  @unique   // presente solo en usuarios SSO
```

**Vault** (campos nuevos, resto intacto):
```prisma
organizationId  String?
organization    Organization? @relation(fields: [organizationId], references: [id])
orgMinRole      OrgRole?      // null = bóveda personal (acceso manual)
                              // MEMBER | ADMIN | OWNER = bóveda de org
```

### Regla de acceso a bóvedas de org

| `vault.orgMinRole` | Quién accede |
|--------------------|--------------|
| `MEMBER` | todos los miembros de la org |
| `ADMIN` | ADMIN y OWNER |
| `OWNER` | solo OWNER |

Bóvedas con `organizationId = null` son personales — comportamiento actual sin cambios.

---

## Flujo SSO (happy path)

```
1. /login/sso  →  usuario escribe email corporativo

2. POST /api/auth/sso/initiate { email }
   ├── Extraer dominio del email
   ├── Buscar Organization donde domain = dominio AND ssoEnabled = true
   ├── Si no existe: error "SSO no configurado para este dominio"
   ├── Generar state = crypto.randomUUID() → guardar en cookie httpOnly (60s)
   └── workos.sso.getAuthorizationUrl({ organizationId: org.workosOrgId,
                                         redirectUri, state })
       → responder { url } → cliente redirige

3. Usuario se autentica en su IdP (Okta / Azure AD / Google Workspace)

4. GET /api/auth/sso/callback?code=xxx&state=yyy
   ├── Validar state vs cookie (CSRF protection) → limpiar cookie
   ├── workos.sso.getProfileAndToken({ code })
   │   → Profile { id, email, firstName, lastName, organizationId }
   ├── [Ver sección Auto-provisioning]
   ├── Crear SsoNonce { userId, expiresAt: now + 60s }
   └── Redirect 302 → /login?sso_nonce=<nonce>

5. /login detecta ?sso_nonce en URL
   └── Auto-llama signIn("sso-nonce", { nonce })
       → Credentials provider valida nonce (no expirado, lo borra)
       → Retorna user → NextAuth crea JWT session normal
       → Redirect → /dashboard
```

---

## Auto-provisioning (primer login SSO)

```
profile recibido de WorkOS:

CASO A — usuario nuevo (no existe por workosUserId ni email):
  1. Determinar orgRole:
     - si profile.email === org.firstOwnerEmail → OWNER
     - si no → MEMBER
  2. Crear User {
       email, name: `${firstName} ${lastName}`,
       workosUserId: profile.id,
       organizationId: org.id,
       orgRole,
       passwordHash: "",  passwordSalt: ""  ← SSO user, nunca usa contraseña
     }
  3. provisionOrgVaults(userId, org.id, orgRole)

CASO B — usuario existe por email (cuenta Credentials preexistente):
  1. Auto-link: actualizar { workosUserId, organizationId, orgRole }
  2. provisionOrgVaults(userId, org.id, orgRole)

CASO C — usuario SSO relogin (workosUserId ya conocido):
  1. No changes necesarios → continuar directo al nonce
```

### `provisionOrgVaults(userId, orgId, orgRole)`

Función reutilizable que inserta `VaultMember` (upsert, idempotente):

```
vaults = Vault.findMany donde organizationId = orgId
           AND orgMinRole IN roles que el user puede ver (según orgRole)

VaultMember.createMany (skipDuplicates: true) para cada vault
  con role = VIEWER (pueden ver y usar, no editar la config de la bóveda)
```

Tabla de qué vaults ve cada rol:
| OrgRole del user | Ve vaults con orgMinRole |
|------------------|--------------------------|
| MEMBER | MEMBER |
| ADMIN | MEMBER + ADMIN |
| OWNER | MEMBER + ADMIN + OWNER |

---

## Propagación de cambios en tiempo real

### Cambio de rol de un miembro
Cuando un OWNER/ADMIN cambia el `orgRole` de un miembro:
1. `UPDATE User SET orgRole = newRole`
2. Si el rol **subió** (MEMBER → ADMIN): llamar `provisionOrgVaults` con el nuevo rol → inserta los nuevos `VaultMember`
3. Si el rol **bajó** (ADMIN → MEMBER): eliminar `VaultMember` de las bóvedas que ya no le corresponden

### Nueva bóveda de org creada
Al crear una `Vault` con `organizationId` y `orgMinRole`:
1. Buscar todos los `User` de la org cuyo `orgRole >= vault.orgMinRole`
2. `VaultMember.createMany (skipDuplicates: true)` para todos ellos

---

## Componentes de WorkOS

### `src/lib/workos.ts`
Singleton del cliente WorkOS. Lee `WORKOS_API_KEY` del entorno.

### Variables de entorno nuevas
```env
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...         # para Admin Portal
WORKOS_REDIRECT_URI=https://kf1.kitifica.com/api/auth/sso/callback
```

---

## NextAuth — nuevo provider

En `src/lib/auth.ts`, agregar dentro de `providers: [...]`:

```ts
Credentials({
  id: "sso-nonce",
  credentials: { nonce: {} },
  authorize: async ({ nonce }) => {
    if (!nonce) return null;
    const record = await db.ssoNonce.findUnique({ where: { nonce } });
    if (!record || record.expiresAt < new Date()) return null;
    await db.ssoNonce.delete({ where: { nonce } });
    const user = await db.user.findUnique({ where: { id: record.userId } });
    return user ? { id: user.id, email: user.email, orgRole: user.orgRole } : null;
  },
})
```

JWT y session callbacks: agregar `orgRole` al token/session (igual que `companyName`).

---

## Interfaces de usuario

### `/login` — cambio mínimo
Agregar debajo del form existente:
```
─── o ───
[Login con SSO →]   (link a /login/sso)
```

### `/login/sso` — nueva página
Form simple: campo email + botón "Continuar". Llama a `/api/auth/sso/initiate`, redirige al usuario al URL de WorkOS.

Mensajes de error:
- "SSO no está configurado para este dominio."
- "Intentá de nuevo o contactá a tu administrador."

### `/admin/orgs` — super-admin (solo vos)
Ya existe `/admin/page.tsx`. Agregar tab/sección "Organizaciones":
- Crear org: nombre, dominio, workosOrgId, email del primer OWNER
- Activar/desactivar SSO por org
- Generar link de Admin Portal de WorkOS → copiás y mandás al IT admin del cliente

### `/dashboard/org` — org admin
Visible solo a OWNER y ADMIN de una org:
- Lista de miembros con rol + botones para cambiar rol
- Lista de bóvedas de org con `orgMinRole` + botón editar
- Botón "Nueva bóveda de org" (nombre + orgMinRole)

---

## Seguridad

| Punto | Medida |
|-------|--------|
| CSRF en callback | `state` param generado server-side, guardado en cookie httpOnly, validado en callback |
| Nonce | Single-use, 60s de vida, borrado al consumirse |
| SSO users sin contraseña | `passwordHash: ""` — el provider `sso-nonce` es el único path de autenticación para estos users |
| Rate limiting | Aplicar rate limit existente a `/api/auth/sso/initiate` (bucket por IP) |
| Admin Portal link | Generado on-demand, no guardado en DB (WorkOS lo gestiona) |

---

## Fuera de alcance (v2)

- SCIM provisioning (altas/bajas automáticas desde directorio corporativo)
- Offboarding automático cuando SSO se revoca en IdP
- Múltiples dominios por organización
- IdP-driven role mapping via atributos SAML
- Self-service setup de org (sin intervención del operador)
