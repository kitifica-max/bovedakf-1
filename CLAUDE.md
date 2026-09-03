# SecureVault — v1 (Estado Actual + Recomendaciones)

## La objeción a resolver
Los equipos pequeños (5-20 personas) comparten credenciales por WhatsApp, email o Excel — herramientas que no son seguras ni profesionales. Quieren su propia herramienta interna, no depender de soluciones genéricas como 1Password o Google Docs que no están diseñadas para sharing temporal con clientes externos. SecureVault demuestra que existe una alternativa segura, simple y con estilo propio.

## Perfil de público objetivo
- Rol y nivel de decisión: **Influenciador** — el que propone la herramienta al equipo o gerencia, generalmente un dev o manager técnico
- Objetivo o dolor específico: Compartir credenciales de servicios (AWS, GitHub, etc.) con clientes o contractors sin exponer contraseñas por email/WhatsApp
- Objeción principal: **Confianza** — no confían en herramientas nuevas para datos sensibles, quieren ver que es seguro antes de adoptar
- Qué necesita ver o sentir para decir que sí: Ver que la encriptación es real (zero-knowledge), que no pueden perder el control (revocación), y que tiene audit trail
- Etapa del proceso de compra: **Comparando** — ya probó o conoce 1Password, LastPass, o soluciones caseras
- Canal de consumo: **Link por correo** — le envían el link para que lo pruebe

## Lineamientos de marca
Elaniin es una empresa de servicios tecnológicos con 12+ años, 200+ ingenieros, presencia en USA, México, El Salvador y Guatemala. Tono profesional y corporativo, enfocado en confianza ("Trusted Partner", "Expertise You Can Trust"). Paleta dominante: azul como color de acento, fondos blancos, tipografía sans-serif moderna. SecureVault hereda el tono de seguridad y profesionalismo de Elaniin, con un diseño cálido (cream/paper) que lo hace sentir accesible pero serio.

## Recorrido del cliente (happy path)
1. Recibe link de SecureVault por correo o lo encuentra en la web
2. Ve la landing page que explica el problema y la solución
3. Se registra (email + contraseña, 10+ caracteres)
4. Se le crea una bóveda por defecto ("Mi bóveda")
5. Agrega credenciales (servicio, usuario, contraseña encriptada)
6. Genera un share link con permiso (READ/DOWNLOAD) y expiración
7. El destinatario recibe el link, abre, ve la credencial descifrada client-side
8. El owner puede revocar el link en cualquier momento
9. Ve el audit log de quién accedió y cuándo

## Criterio de éxito de v1
Al terminar de ver/usar SecureVault, el equipo técnico **confirma que es una solución viable para compartir credenciales de forma segura** — validando que la encriptación funciona, el flujo es simple, y es preferible a las soluciones caseras actuales.

## Complejidad del proyecto
**Media** — 2-3 flujos (auth, CRUD credenciales, share links), 1 integración (Supabase), datos con relaciones, encriptación client-side. Sin pagos reales ni tiempo real.

- 🟢 Baja: un flujo principal, sin integraciones externas, datos simples, sin auth compleja
- 🟡 Media: 2-3 flujos, 1-2 integraciones (auth, una API), datos relacionales moderados
- 🔴 Alta: múltiples flujos, pagos reales, tiempo real, múltiples roles o integraciones complejas

## Restricciones
- Plataforma: **web** (responsive, con PWA básica)
- Stack: **Next.js 16 (App Router) + Prisma + Supabase (PostgreSQL) + NextAuth v5**
- Integraciones: Supabase (database + auth potencial), Netlify (deploy)

## Alcance v1 — incluye (actual)
- Landing page completa con SEO
- Auth (registro + login) con NextAuth Credentials
- Dashboard protegido con guard de autenticación
- CRUD de credenciales con encriptación AES-256-GCM at-rest
- Generación de share links con permisos (READ/DOWNLOAD) y expiración
- Share link viewer con descifrado client-side (zero-knowledge: key nunca toca el server)
- Revocación de links
- Audit logging (creación, visualización, denegación, revocación)
- Rate limiting en endpoint público (in-memory, 20 req/min)
- SEO (sitemap, robots.txt, OG image, JSON-LD)
- PWA básica (manifest + service worker)
- Páginas legales (privacidad, términos, contacto)

## Alcance v1 — excluye (construir después)
- **Team management** — invitar miembros, roles, permisos por bóveda
- **Email verificación** en registro
- **Password reset** flow
- **2FA/MFA** — autenticación de dos factores
- **Múltiples bóvedas** por usuario (schema lo soporta, UI no)
- **Rate limiter persistente** — migrar de in-memory a Upstash Redis
- **Tests** — unitarios, integración, e2e
- **CI/CD** — GitHub Actions o similar
- **Account deletion** — mencionado en privacidad pero no implementado

## Stack actual
- **Framework:** Next.js 16.3.3 (App Router, Turbopack)
- **React:** 19.2.8
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **ORM:** Prisma 6.19.3
- **Database:** PostgreSQL (Supabase en producción, local dev en Docker)
- **Auth:** NextAuth.js v5 beta.32 (Credentials provider, JWT)
- **Encryption:** Node crypto (scrypt + AES-256-GCM)
- **Validation:** Zod 4.4.3
- **Deploy:** Netlify (con @netlify/plugin-nextjs)
- **Fonts:** Geist Sans, Geist Mono, Fraunces (display)

## Diseño
Paleta cálida (cream/paper) con acentos azules. Tipografía display: Fraunces (serif). Bordes redondeados (32px cards, 20px inputs, full-pill buttons). Estilo minimalista con sombras sutiles. Diseño consistente con la identidad de Elaniin.

## SEO y visibilidad
- Meta title/description configurados
- OpenGraph image generada (1200x630)
- Sitemap dinámico
- Robots.txt bloquea /dashboard, /s/, /api/
- JSON-LD schema configurado
- Share links marcados noindex + nocache

## Backend y base de datos
**Supabase** (PostgreSQL gestionado). Schema Prisma con 4 modelos: User, Vault, Credential, ShareLink, AuditLog. Encriptación AES-256-GCM at-rest con key de 32 bytes. Share links usan re-encryption con one-time key (zero-knowledge).

## Deploy
**Netlify** — ya configurado con @netlify/plugin-nextjs. Deploy automático desde Git. Functions serverless para API routes.

## Estado del repositorio
⚠️ **Crítico:** Solo 1 commit ("Initial commit from Create Next App"). Todo el código de la aplicación está sin trackear. Necesita commit inicial del código completo antes de cualquier otro paso.

## v2+ — visión de escalamiento (bloqueada — no ejecutar ahora)
- Team management con roles (admin, member, viewer) y permisos por bóveda
- Integración con LDAP/SSO para empresas
- Dashboard de analytics de uso (quién compartió qué, cuándo)
- Planes de pago (free tier + premium)
- Integración con password managers existentes
- API pública para integraciones

## Primeros 3 pasos
1. **Commit inicial** — hacer `git add . && git commit` con todo el código actual para tener un baseline limpio
2. **Operational readiness** — configurar variables de producción en Netlify (DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY), migrar rate limiter a Upstash Redis
3. **Team features básicas** — agregar invite por email + rol viewer (solo lectura) para cerrar la brecha entre el posicionamiento "para equipos" y la funcionalidad actual

---
*Generado por CC Brew · No ejecutar v2+ hasta validar v1*