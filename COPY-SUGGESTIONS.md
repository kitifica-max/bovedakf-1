# Copy Analysis & Suggestions: SecureVault Landing
**Date:** 2026-08-26
**Page Type:** Landing Page (SaaS, single conversion action: crear bóveda)
**Copy Score:** 52/100

## Executive Summary

La página actual es un hero solo — headline, subhead, dos CTAs, dos tarjetas de stats. Comunica el concepto en 5 segundos, pero se lee como un teaser, no como una landing page: no hay agitación del problema, no hay explicación de cómo funciona, no hay features desglosadas, no hay manejo de objeciones (¿ustedes ven mi contraseña?, ¿qué pasa si pierdo el link?), y solo hay un CTA — no hay repetición ni cierre. Para un gestor de TI evaluando si confiarle credenciales de la empresa a una herramienta nueva, "confía en nosotros" con una sola insignia no alcanza.

El fix no es reescribir el hero — el hero está bien. Es agregar el cuerpo que le falta: Problema → Cómo funciona → Features → Por qué es seguro (prueba por mecanismo, no testimonios falsos — el producto no tiene usuarios reales todavía) → FAQ → CTA final.

## Voice & Tone Profile

- Formalidad: 3/5 (directo, sin jerga corporativa — mantener)
- Emoción: 2/5 (subutilizada — "sin dejar rastro" insinúa ansiedad pero no la desarrolla)
- Complejidad: 2/5 (accesible, correcto para el público)
- Humor: 1/5 (serio — correcto para una herramienta de seguridad)
- Autoridad: 2/5 (débil — no hay prueba técnica específica más allá de "encriptado")

## Score Breakdown

| Dimensión | Score | Por qué |
|---|---|---|
| Clarity | 7/10 | El headline es claro una vez leído, pero la página no *se ve* como un producto completo — un visitante escéptico rebota antes de leer. |
| Persuasion | 4/10 | Cero manejo de objeciones, cero explicación del mecanismo, un solo CTA sin repetición. |
| Specificity | 6/10 | Hay números (20 credenciales, 1h–7d) pero ninguno sobre seguridad (AES-256, la clave nunca toca el servidor). |
| Emotion | 4/10 | El miedo real (filtración, contraseña reenviada por Slack para siempre) nunca se nombra. |
| Action | 5/10 | CTA above the fold bien, pero no hay CTA de cierre ni urgencia. |

**Total: 26/50 → 52/100**

## Value Proposition Canvas

```
TARGET CUSTOMER: Gestor de TI / líder técnico, equipos de 5–50 personas
PROBLEM: Credenciales dispersas en email/Slack/spreadsheets, sin auditoría, en texto plano
SOLUTION: Bóveda encriptada + links compartibles que expiran solos + auditoría completa
UNIQUE MECHANISM: La clave de descifrado del link vive solo en el fragmento de la URL —
  el servidor nunca la ve, nunca la guarda, nunca puede descifrar el link por su cuenta
KEY BENEFIT: Compartir una credencial de forma segura toma 30 segundos, y queda un rastro
  de quién entró, cuándo, y desde dónde
PROOF: Mecanismo técnico verificable (no hay testimonios reales — producto nuevo, no fabricar)
```

**Gap identificado:** el "unique mechanism" (clave nunca toca el servidor) es la ventaja más fuerte del producto y no aparece en la página en absoluto.

## Headline Recommendations

Headline actual: **"Comparte credenciales sin dejar rastro en el chat"** — se mantiene, funciona bien (Before-After-Bridge implícito). Alternativas evaluadas y descartadas por ser más genéricas:

1. ~~"El 1Password de tu equipo, sin la curva de aprendizaje"~~ — compara con marca ajena, débil
2. ~~"Nunca más reenvíes una contraseña por Slack"~~ — PAS, buena pero más agresiva que el tono actual
3. ~~"20 credenciales, cero spreadsheets, un solo lugar"~~ — 4U, demasiado orientado a feature

Se mantiene el headline actual; el fix real es el cuerpo de la página, no el hero.

## Section-by-Section Copy Suggestions

Ver implementación en [src/app/page.tsx](src/app/page.tsx) — se agregaron 4 secciones nuevas:

1. **Problema** — nombra el dolor real (contraseña en 4 lugares distintos, nadie sabe quién tiene acceso a qué)
2. **Cómo funciona** — 3 pasos (Guarda → Comparte → Audita), con la mecánica de la clave-en-el-fragmento explicada en lenguaje simple
3. **Features** — 4 tarjetas beneficio-primero (no "AES-256-GCM" como titular, sino lo que eso significa para el usuario)
4. **FAQ** — objeciones reales: ¿ustedes ven la contraseña?, ¿qué pasa si pierdo el link?, ¿necesito instalar algo?, ¿qué pasa si alguien reenvía el link?

## CTA Optimization

| CTA actual | Problema | CTA recomendado |
|---|---|---|
| "Crear mi bóveda →" (único, solo above the fold) | No se repite, sin reducción de fricción | Se mantiene arriba + se agrega CTA de cierre: "Crear mi bóveda gratis →" con nota "Sin tarjeta, hasta 20 credenciales" |
| "Ya tengo cuenta" | Correcto, bajo perfil | Se mantiene igual |

## Before/After

**Meta description**
- Antes: "Gestor de credenciales compartidas seguro para equipos"
- Después: "Guarda credenciales de equipo encriptadas y compártelas con links que expiran solos. Auditoría completa de accesos, sin spreadsheets ni contraseñas por chat." *(ya implementado en `layout.tsx`)*

**Prueba de seguridad**
- Antes: badge "Encriptado extremo a extremo en cada link" (afirmación sin mecanismo)
- Después: sección "Cómo funciona" que explica que la clave de descifrado vive solo en la URL, nunca en la base de datos — verificable, no solo prometido

## Implementation Priority

1. ✅ Agregar sección Problema (agitación real, sin exagerar)
2. ✅ Agregar sección Cómo funciona con el mecanismo técnico como prueba
3. ✅ Agregar grid de Features beneficio-primero
4. ✅ Agregar FAQ con objeciones reales
5. ✅ CTA de cierre al final de la página
