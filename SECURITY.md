# Security Policy

## Reportar una vulnerabilidad

Si encontrás una vulnerabilidad de seguridad en Bóveda KF-1, **no abras un issue público**. Las vulnerabilidades públicas exponen a los usuarios antes de que haya un fix disponible.

### Cómo reportar

Enviá un correo a: **hola@kitifica.com**

Incluí en el reporte:

- Descripción clara de la vulnerabilidad
- Pasos para reproducirla (minimal proof of concept si aplica)
- Impacto potencial: qué datos o funcionalidades se ven afectados
- Versión o commit donde fue encontrada
- Si ya tenés una propuesta de fix, incluila

### Qué NO hacer

- No publiques la vulnerabilidad en issues, redes sociales ni foros antes de coordinar con el equipo
- No incluyas credenciales reales, datos de usuarios ni información sensible en el reporte
- No realices pruebas destructivas contra instancias de producción

### Respuesta esperada

- Confirmación de recepción: dentro de 72 horas hábiles
- Evaluación de severidad: dentro de 7 días
- Fix o mitigación para vulnerabilidades críticas: en función de la severidad

No hay programa de bug bounty en este momento. Si el reporte resulta en una corrección real, podemos mencionarte en el changelog si lo deseás.

### Alcance

En alcance:

- Endpoint de share links (`/s/[publicId]`) y la lógica de descifrado client-side
- Autenticación y manejo de sesiones
- Cifrado de credenciales en reposo
- CLI tokens y la Skill de Claude Code
- Rate limiting y protección contra brute force
- Audit log

Fuera de alcance:

- Ataques que requieren acceso físico al dispositivo del usuario
- Vulnerabilidades en dependencias de terceros que ya tienen CVE asignado (reportar directamente al maintainer)
- Ataques de ingeniería social

---

*Este documento está basado en las mejores prácticas de responsible disclosure. Fue creado junto al lanzamiento público del repositorio.*
