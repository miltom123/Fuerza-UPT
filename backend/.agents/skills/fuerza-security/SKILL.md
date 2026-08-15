---
name: fuerza-security
description: Implementa o revisa seguridad backend de Fuerza UPT: Spring Security, sesiones, OAuth, roles, CSRF, CORS, rate limiting, privacidad, logs y endpoints públicos/admin. Úsala ante cambios de autenticación, autorización o entradas públicas.
---

# Fuerza UPT — Security

## Filosofía

Conservar las defensas existentes. Una feature nueva no debe debilitar seguridad global por conveniencia.

## Checklist por endpoint

### Público de lectura

- `permitAll` solo si el contenido es realmente público.
- No filtrar información administrativa o borradores.
- Revisar caché/ETag si corresponde.

### Público de escritura

Revisar siempre:

- DTO validation;
- rate limiting;
- tamaño máximo de payload;
- duplicados/abuso;
- HMAC si se persisten identificadores derivados de IP/email;
- PII en logs;
- CSRF según el modelo actual y la naturaleza del endpoint;
- mensajes de error sin enumeración innecesaria.

### Administrativo

- exigir `ADMIN` mediante las reglas existentes;
- respetar CSRF;
- auditoría para cambios relevantes;
- no exponer secrets/configuración interna.

## Autenticación

- Mantener `ChangeSessionIdAuthenticationStrategy` o la protección vigente contra session fixation.
- No sustituir sesiones por JWT sin petición explícita y análisis arquitectónico.
- No reactivar bootstrap de admin por defecto.
- No resetear automáticamente contraseña/roles de usuarios existentes al arrancar.
- Passwords nunca se loguean ni se almacenan en claro.

## OAuth

- No loguear Google `sub`, tokens ni email completo sin necesidad.
- Vincular identidades usando las entidades/repositorios actuales.
- No crear un segundo usuario si la política existente vincula por email/identity.

## Rate limiting

Login debe conservar las dimensiones independientes existentes:

```text
IP
cuenta
IP + cuenta
```

Todas las claves persistidas deben seguir protegidas por HMAC.

Usar JPA, nunca JDBC.

## CORS / CSRF

- No introducir `*` con credentials.
- No ampliar origins sin solicitud explícita.
- No desactivar CSRF globalmente.
- Cualquier excepción debe ser específica y justificada.

## Uploads

- tamaño limitado;
- MIME/firma real;
- nombres aleatorios/seguros;
- no confiar en filename original;
- archivos privados fallan cerrado;
- no fallback público para privados.

## Logs y errores

No registrar:

```text
password
Authorization
cookies
CSRF token
OAuth tokens
service role key
HMAC secret
emails completos innecesarios
OAuth subject
```

Errores públicos deben ser seguros y correlacionables mediante `requestId` cuando la infraestructura lo soporte.

## Dependencias/configuración

Si modificas seguridad, revisa que la versión del framework no obligue a cambios incompatibles. No actualices una gran versión de Spring dentro de una feature de negocio salvo solicitud explícita.

## Política de pruebas

No crear ni ejecutar tests salvo solicitud. Verificar estáticamente SecurityConfig, mappings, roles y flujo afectado; compilar sin tests.
