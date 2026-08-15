# Fuerza UPT — Integración Google OAuth 2.0/OIDC + Auditoría y corrección del backend

## Objetivo

Implementar correctamente el inicio de sesión con Google en el backend de Fuerza UPT y, antes de dar la tarea por terminada, realizar una auditoría técnica completa del backend existente, corregir los errores encontrados y dejar pruebas suficientes para validar el flujo.

**Importante:** no hagas una implementación superficial ni agregues un segundo sistema de autenticación innecesario. El backend ya utiliza **Spring Security + sesión HTTP persistida en PostgreSQL mediante Spring Session JDBC + cookie `FUERZA_UPT_SESSION` + CSRF**. Google debe integrarse respetando esa arquitectura.

La solución final debe permitir:

1. Login tradicional existente con email/contraseña.
2. Login con Google mediante OAuth 2.0 / OpenID Connect.
3. Crear o vincular correctamente un usuario local cuando Google autentica un email válido.
4. Mantener la sesión del backend como fuente de autenticación para el frontend.
5. No entregar tokens de Google al frontend.
6. No almacenar access tokens de Google si no son necesarios.
7. Mantener roles y permisos existentes.
8. Registrar login/logout mediante el sistema de auditoría existente.
9. Evitar account takeover por vinculación insegura de cuentas.
10. Mantener CSRF, CORS, rate limiting y controles de seguridad existentes.
11. Corregir cualquier error real descubierto durante la auditoría, sin romper funcionalidades existentes.

---

# 1. Contexto real del backend actual

Backend:

- Spring Boot 3.3.x
- Java 17
- Spring Security
- Spring Session JDBC
- PostgreSQL
- Flyway
- JPA/Hibernate
- CORS
- CSRF mediante cookie
- Sesión HTTP
- Roles (`ROLE_ADMIN`, etc.)
- Auditoría
- Supabase para almacenamiento
- Frontend configurado actualmente mediante `FRONTEND_ORIGIN`

Archivos relevantes actuales:

- `src/main/java/pe/edu/upt/fuerzaupt/security/SecurityConfig.java`
- `src/main/java/pe/edu/upt/fuerzaupt/auth/controller/AuthController.java`
- `src/main/java/pe/edu/upt/fuerzaupt/auth/entity/User.java`
- `src/main/java/pe/edu/upt/fuerzaupt/auth/repository/UserRepository.java`
- `src/main/java/pe/edu/upt/fuerzaupt/security/CustomUserDetails.java`
- `src/main/java/pe/edu/upt/fuerzaupt/security/CustomUserDetailsService.java`
- `src/main/java/pe/edu/upt/fuerzaupt/common/config/CorsConfig.java`
- `src/main/java/pe/edu/upt/fuerzaupt/admin/service/AuditLogService.java`
- `src/main/resources/application.yml`
- `src/main/resources/application-local.yml`
- `src/main/resources/db/migration/V1__create_security_tables.sql`

Actualmente **NO existe una integración Google OAuth/OIDC en el backend**. No asumir que existe alguna clase o configuración OAuth previa.

---

# 2. Arquitectura deseada

## Flujo

El flujo recomendado es:

```text
Frontend
   |
   | GET /oauth2/authorization/google
   v
Backend Spring Security
   |
   | redirect
   v
Google OAuth 2.0 / OIDC
   |
   | authorization code
   v
Backend callback
   |
   | valida issuer, firma, nonce/state, etc.
   v
OAuth2 success handler
   |
   +--> busca usuario por identidad Google
   |
   +--> si no existe, crea usuario
   |
   +--> si existe por email, vincula de forma segura
   |
   +--> carga roles
   |
   +--> crea/rota sesión backend
   |
   +--> registra auditoría
   v
Frontend
   |
   | GET /api/auth/me
   v
Usuario autenticado por sesión
```

### Regla importante

**El frontend NO debe recibir ni almacenar el access token o ID token de Google.**

El backend debe ser el OAuth client y la sesión de Fuerza UPT debe ser la sesión utilizada por la aplicación.

---

# 3. Dependencia Maven

Agregar la dependencia apropiada para OAuth 2.0 Client de Spring Security.

Debe ser compatible con Spring Boot 3.3.x y no introducir versiones manuales innecesarias.

Esperado conceptualmente:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

No agregues librerías Google adicionales si Spring Security OIDC ya resuelve el caso.

---

# 4. Configuración Google

Agregar configuración por variables de entorno.

Ejemplo conceptual:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
```

Y producción debe utilizar HTTPS.

La configuración debe quedar fuera del código fuente.

No hardcodear:

- client ID
- client secret
- URLs privadas
- secretos
- tokens
- credenciales

Usar la configuración estándar de Spring Security OAuth2 Client:

```text
spring.security.oauth2.client.registration.google
spring.security.oauth2.client.provider.google
```

Preferir configuración por `issuer-uri`:

```text
https://accounts.google.com
```

para que Spring valide el proveedor OIDC correctamente.

---

# 5. Google debe identificarse por `sub`, no por email

Esta regla es crítica.

Google OIDC proporciona un identificador estable:

```text
sub
```

Ese valor debe almacenarse como la identidad externa de Google.

No utilizar únicamente:

```text
email
```

como identificador de la cuenta Google.

El email sirve para descubrir una cuenta existente y para mostrar/contactar al usuario, pero la identidad OAuth debe quedar vinculada a:

```text
provider = GOOGLE
provider_subject = <Google sub>
```

---

# 6. Cambios recomendados en la entidad User

La tabla actual es:

```text
users
- id
- email
- password_hash
- display_name
- enabled
- created_at
- updated_at
- last_login_at
```

Actualmente `password_hash` es obligatorio.

Para permitir usuarios Google sin contraseña local, debe evaluarse y aplicarse correctamente:

```text
password_hash -> nullable
```

Agregar, como mínimo, campos equivalentes a:

```text
auth_provider
oauth_provider_subject
```

Una implementación razonable sería:

```text
auth_provider VARCHAR(...)
oauth_provider_subject VARCHAR(...)
```

con valores controlados, por ejemplo:

```text
LOCAL
GOOGLE
```

### Restricción recomendada

Debe existir unicidad por proveedor + subject.

Por ejemplo:

```sql
UNIQUE (auth_provider, oauth_provider_subject)
```

Si el diseño permite varias identidades por usuario en el futuro, es mejor separar la identidad externa en una tabla:

```text
user_identities
- id
- user_id
- provider
- provider_subject
- created_at
- updated_at
```

con:

```text
UNIQUE(provider, provider_subject)
```

**Preferencia:** si la arquitectura no requiere otros proveedores todavía, mantener la solución simple. Si crear una tabla de identidades mejora claramente la extensibilidad, utilizarla. No sobrediseñar.

---

# 7. Vinculación segura por email

Este es uno de los puntos más importantes.

Cuando Google autentique:

```text
sub = X
email = usuario@ejemplo.com
email_verified = true
```

seguir estas reglas.

## Caso A — ya existe identidad Google

Buscar:

```text
provider = GOOGLE
provider_subject = X
```

Si existe:

- iniciar sesión con ese usuario
- no modificar su email arbitrariamente
- conservar roles existentes

## Caso B — no existe identidad Google, pero existe usuario local con el mismo email

Solo vincular automáticamente si:

```text
email_verified == true
```

Nunca vincular automáticamente basándose únicamente en un email no verificado.

No reemplazar silenciosamente la contraseña local.

No eliminar credenciales existentes.

Registrar el evento.

## Caso C — no existe usuario

Crear usuario:

- email verificado de Google
- display name de Google
- identidad Google
- `enabled = true`
- rol por defecto seguro

**Nunca otorgar `ADMIN` por OAuth.**

El rol inicial debe ser el rol normal de usuario que corresponda al sistema.

---

# 8. No permitir escalada de privilegios

Google login jamás debe:

- convertir usuario en ADMIN
- interpretar claims arbitrarios como roles administrativos
- aceptar `role=ADMIN` desde el frontend
- aceptar roles provenientes de parámetros URL
- copiar roles desde información no confiable

Los roles deben provenir exclusivamente de la base de datos/control interno.

---

# 9. Success Handler

Crear un success handler dedicado, por ejemplo:

```text
GoogleOAuth2AuthenticationSuccessHandler
```

o nombre equivalente.

Responsabilidades:

1. Obtener el usuario OIDC autenticado.
2. Validar que el email esté verificado.
3. Obtener `sub`.
4. Buscar/vincular/crear usuario.
5. Cargar los roles del usuario local.
6. Crear el `Authentication` local con `CustomUserDetails`.
7. Guardarlo usando el `SecurityContextRepository` existente.
8. Rotar el ID de sesión para evitar session fixation.
9. Registrar `LOGIN` en `AuditLogService`.
10. Redirigir al frontend a una ruta segura.

No poner toda esta lógica dentro de `SecurityConfig`.

---

# 10. Failure Handler

Crear un OAuth failure handler.

Debe:

- no mostrar stack traces al usuario
- registrar el fallo sin filtrar secretos
- registrar información útil para debugging
- redirigir a una URL frontend controlada
- no permitir open redirects

Nunca aceptar una URL arbitraria desde:

```text
?redirect_uri=https://...
```

sin validarla contra una allowlist.

---

# 11. Redirección al frontend

Definir explícitamente variables como:

```env
FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_OAUTH_SUCCESS_PATH=/admin
FRONTEND_OAUTH_ERROR_PATH=/login?oauthError=true
```

No concatenar rutas proporcionadas libremente por el usuario.

En producción:

```text
https://<dominio-real>
```

y no HTTP.

---

# 12. SecurityConfig

Modificar `SecurityConfig` para permitir únicamente los endpoints OAuth necesarios:

```text
/oauth2/authorization/**
/login/oauth2/code/**
```

No hacer:

```text
/** -> permitAll()
```

No relajar las reglas existentes de `/api/admin/**`.

Conservar:

```text
/api/admin/** -> ROLE_ADMIN
```

Conservar:

```text
/api/auth/me -> authenticated
/api/auth/logout -> authenticated
```

y las rutas públicas existentes.

---

# 13. CSRF

El backend ya usa:

```text
CookieCsrfTokenRepository
```

y una cookie de sesión.

No eliminar CSRF para "hacer funcionar Google".

No agregar:

```java
csrf.disable()
```

como solución.

El OAuth callback utiliza mecanismos propios de Spring Security para el flujo OAuth. El resto de operaciones mutantes del backend debe continuar protegido por CSRF.

---

# 14. CORS

El backend ya tiene:

```text
CorsConfig
```

con:

```text
FRONTEND_ORIGIN
```

Mantener `allowCredentials(true)` porque se utiliza sesión por cookie.

No cambiar a:

```text
allowedOrigins("*")
```

junto con credenciales.

Eso sería incorrecto.

Si se necesitan varios origins, utilizar una allowlist explícita.

---

# 15. Cookies y producción

La cookie:

```text
FUERZA_UPT_SESSION
```

debe mantenerse:

```text
HttpOnly = true
```

En producción:

```text
Secure = true
```

y revisar cuidadosamente:

```text
SameSite
```

según dónde se aloje el frontend y backend.

Para desarrollo local puede utilizarse:

```env
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAME_SITE=lax
```

pero **no copiar esa configuración ciegamente a producción**.

---

# 16. Problema detectado en el login actual: session fixation

En `AuthController.login()` actualmente se hace autenticación manual y posteriormente:

```java
securityContextRepository.saveContext(...)
```

Debe revisarse el ciclo de vida de la sesión.

Después de autenticar correctamente, garantizar rotación del identificador de sesión, por ejemplo mediante:

```java
request.changeSessionId();
```

o una estrategia equivalente de Spring Security.

No crear una sesión nueva innecesariamente si eso rompe Spring Session, pero sí garantizar protección contra session fixation.

Aplicar el mismo principio al login Google.

---

# 17. Auditoría de la autenticación actual

Revisar específicamente:

### Login

- rate limiting
- normalización de email
- respuesta ante credenciales inválidas
- enumeración de usuarios
- session fixation
- CSRF
- persistencia de SecurityContext
- auditoría

### Logout

- invalidación de sesión
- limpieza de cookie
- auditoría
- comportamiento cuando no hay sesión

### `/api/auth/me`

- respuesta correcta cuando no hay sesión
- no exponer password hash
- no exponer secretos
- roles únicamente internos

### Contraseñas

- BCrypt
- costo adecuado
- no almacenar contraseñas en texto plano
- no registrar contraseñas en logs

---

# 18. Auditoría general del backend

No limitar la auditoría a OAuth.

Revisar todos los controladores, servicios, repositorios, configuración y migraciones.

## Seguridad

Buscar:

- endpoints accidentalmente públicos
- `permitAll()` innecesarios
- `csrf.disable()`
- CORS permisivo
- secretos hardcodeados
- SQL injection
- JPQL/SQL construido con concatenación
- path traversal
- SSRF
- open redirects
- mass assignment
- IDOR
- exposición de datos privados
- archivos accesibles indebidamente
- falta de autorización por recurso
- logs con datos sensibles
- errores con stack traces
- excepciones filtradas al cliente

## Validación

Revisar:

- `@Valid`
- `@NotNull`
- `@NotBlank`
- tamaños máximos
- URLs
- emails
- enums
- fechas
- números negativos
- capacidades
- paginación
- cargas de archivos

## Base de datos

Revisar:

- constraints
- índices
- unique constraints
- foreign keys
- `ON DELETE`
- nullability
- migraciones Flyway
- problemas de concurrencia
- optimistic locking
- N+1
- queries sin límite
- transacciones

## API

Revisar:

- HTTP status codes
- respuestas consistentes
- errores
- validaciones
- endpoints duplicados
- endpoints sin autorización
- métodos HTTP
- idempotencia
- paginación

## Performance

Revisar:

- N+1
- `findAll()` sin necesidad
- consultas repetidas
- cache
- transacciones demasiado grandes
- conexiones DB
- carga de archivos
- llamadas externas a Supabase

## Observabilidad

Revisar:

- logs
- audit logs
- request IDs
- health checks
- métricas
- errores de producción

---

# 19. Hallazgos iniciales que ya deben revisarse

Durante una revisión estática previa del proyecto se encontraron estos puntos:

### Hallazgo 1 — No existe Google OAuth

No aparecen dependencias ni configuración/clases para:

```text
oauth2
oauth
openid
google
```

Por lo tanto, la integración debe implementarse desde cero.

### Hallazgo 2 — `password_hash` actualmente es NOT NULL

Migración:

```text
V1__create_security_tables.sql
```

define:

```sql
password_hash VARCHAR(255) NOT NULL
```

Esto debe adaptarse si se permitirán cuentas exclusivamente Google.

No romper las cuentas locales existentes.

### Hallazgo 3 — Login manual debe revisar session fixation

`AuthController` guarda manualmente el SecurityContext después de autenticar.

Debe garantizarse rotación de sesión.

### Hallazgo 4 — CORS depende de un solo origin

`CorsConfig` usa:

```text
FRONTEND_ORIGIN
```

Eso está bien para un solo frontend, pero debe conservarse estricto.

No reemplazarlo por `*`.

### Hallazgo 5 — Configuración de cookie de producción

Actualmente el default es:

```text
SESSION_COOKIE_SECURE=false
```

Eso es aceptable para desarrollo local, pero debe garantizarse:

```text
SESSION_COOKIE_SECURE=true
```

en producción.

### Hallazgo 6 — El build no pudo validarse en este entorno

El wrapper Maven no pudo descargar Maven desde:

```text
repo.maven.apache.org
```

por falta de acceso de red en el entorno de auditoría.

Por tanto, **Antigravity debe ejecutar el build/tests en un entorno con Maven/dependencias disponibles**.

No asumir que el proyecto compila simplemente porque el análisis estático no encontró errores de sintaxis.

---

# 20. Migración Flyway

Crear una migración nueva.

No modificar una migración ya aplicada.

Por ejemplo:

```text
V29__add_google_oauth_identity.sql
```

El número debe ajustarse al último migration real encontrado.

La migración debe:

1. Añadir la estructura necesaria.
2. Mantener compatibilidad con usuarios existentes.
3. Crear índices/unique constraints.
4. No destruir credenciales locales.
5. Ser reversible conceptualmente aunque Flyway no requiera down migration.
6. Ser compatible con PostgreSQL.

Antes de escribirla, comprobar cuál es realmente la última migración.

---

# 21. Estrategia recomendada de identidad

Preferida:

```text
users
   |
   +--- user_identities
           |
           +--- provider
           +--- provider_subject
```

Ejemplo:

```sql
CREATE TABLE user_identities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_identity_provider_subject
        UNIQUE (provider, provider_subject)
);
```

También se puede agregar:

```text
UNIQUE(user_id, provider)
```

si se quiere limitar una identidad por proveedor.

Si se decide modificar directamente `users`, documentar claramente la razón.

---

# 22. Email de Google

Aceptar automáticamente solamente:

```text
email_verified = true
```

No utilizar `email_verified` de forma incorrecta.

No confiar en un email enviado por el frontend.

El email utilizado para vincular debe provenir del objeto OIDC validado por Spring Security.

---

# 23. Restricción del dominio institucional

Si Fuerza UPT debe permitir solamente correos institucionales, implementar una allowlist configurable, por ejemplo:

```env
GOOGLE_ALLOWED_EMAIL_DOMAINS=upt.edu.pe
```

Pero **no inventar esta restricción si el producto no la exige actualmente**.

Si no está definida por negocio:

- permitir cuentas Google verificadas
- dejar el dominio configurable
- documentar cómo restringirlo posteriormente

No hardcodear `upt.edu.pe` como requisito si no está confirmado.

---

# 24. Registro de auditoría

Utilizar el sistema existente:

```text
AuditLogService
```

Registrar como mínimo:

### Login Google exitoso

```text
action = LOGIN
resource = users
```

con metadata segura:

```text
provider = GOOGLE
email = ...
```

No guardar:

- access token
- refresh token
- ID token completo
- client secret
- authorization code

### Fallo Google

Registrar un evento apropiado sin guardar secretos.

---

# 25. Rate limiting

No aplicar ciegamente el mismo rate limiter del login password al callback OAuth.

El flujo OAuth ya tiene mecanismos propios.

Pero sí proteger:

- endpoints de login
- creación de cuentas
- endpoints públicos abusables

y revisar el `LoginAttemptService`.

---

# 26. Redirecciones seguras

Nunca hacer:

```java
response.sendRedirect(request.getParameter("redirect"));
```

sin validación.

Usar exclusivamente una URL configurada:

```text
FRONTEND_ORIGIN
```

más una ruta fija.

---

# 27. Tests obligatorios

Agregar tests para:

## OAuth

- Google login exitoso con usuario existente.
- Google login exitoso con usuario nuevo.
- Google login con email no verificado -> rechazo.
- Google identity existente -> login.
- Mismo email local + Google verificado -> vinculación segura.
- No permitir vinculación con email no verificado.
- No permitir cambiar roles.
- No permitir asignar ADMIN automáticamente.
- Fallo OAuth -> redirect seguro.
- Open redirect -> imposible.

## Seguridad

- `/api/admin/**` requiere ADMIN.
- `/api/auth/me` requiere autenticación.
- endpoints públicos siguen públicos.
- CSRF sigue activo.
- CORS no permite origins arbitrarios.
- sesión se rota después de autenticación.

## Usuario

- usuario local existente sigue funcionando.
- password login sigue funcionando.
- usuario Google no necesita password.
- usuario deshabilitado no puede iniciar sesión.

## Base de datos

- migración Flyway arranca correctamente.
- constraints de identidad funcionan.
- no se pueden duplicar `(provider, provider_subject)`.

---

# 28. Pruebas de integración

Si el proyecto ya utiliza Testcontainers PostgreSQL, aprovecharlo.

Ejecutar:

```bash
./mvnw test
```

o:

```bash
mvn test
```

según el entorno.

También ejecutar:

```bash
./mvnw verify
```

si las pruebas lo permiten.

Si existe Docker:

- levantar PostgreSQL de prueba
- ejecutar Flyway
- arrancar Spring Boot
- probar endpoints

No marcar la tarea como terminada si existen tests fallando.

---

# 29. Revisión de configuración

Agregar al `.env.example` solamente nombres de variables, nunca secretos reales.

Ejemplo:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
GOOGLE_ALLOWED_EMAIL_DOMAINS=
FRONTEND_OAUTH_SUCCESS_PATH=/admin
FRONTEND_OAUTH_ERROR_PATH=/login?oauthError=true
```

En producción:

```env
GOOGLE_REDIRECT_URI=https://api.example.com/login/oauth2/code/google
SESSION_COOKIE_SECURE=true
```

El dominio real debe configurarse según el despliegue.

---

# 30. Google Cloud Console

La documentación del proyecto debe explicar que hay que configurar un OAuth Client ID de tipo:

```text
Web application
```

Authorized redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
```

para desarrollo.

Producción:

```text
https://API_DOMAIN/login/oauth2/code/google
```

No colocar:

```text
http://localhost:3000/...
```

si el backend es el OAuth client.

El frontend inicia el flujo apuntando al backend:

```text
http://localhost:8080/oauth2/authorization/google
```

---

# 31. No implementar el antipatrón de enviar el ID token desde frontend

Evitar una arquitectura como:

```text
Frontend -> Google
Frontend obtiene ID token
Frontend -> Backend con ID token
```

salvo que exista una razón arquitectónica explícita.

La implementación preferida en este proyecto es:

```text
Frontend -> Backend -> Google -> Backend -> sesión
```

Esto reduce exposición de credenciales y centraliza la autenticación.

---

# 32. Compatibilidad con `/api/auth/me`

Después de Google login, esta llamada:

```http
GET /api/auth/me
```

debe devolver el mismo formato existente:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "displayName": "...",
    "roles": ["..."]
  },
  "expiresAt": "..."
}
```

No crear un formato de usuario paralelo para Google.

---

# 33. No duplicar CustomUserDetails

Google no debe crear otro principal incompatible.

Después del proceso OAuth:

```text
Google OIDC principal
        |
        v
usuario local
        |
        v
CustomUserDetails
        |
        v
SecurityContext
```

Así todos los controladores existentes continúan funcionando.

---

# 34. Auditoría de errores backend adicionales

Mientras se implementa OAuth, revisar el proyecto completo y corregir errores reales encontrados.

Para cada cambio:

1. Identificar el archivo.
2. Explicar el problema.
3. Corregirlo.
4. Agregar test si aplica.
5. Verificar que no se rompa una funcionalidad existente.

No hacer refactors masivos solo por estilo.

No cambiar APIs públicas sin necesidad.

No cambiar nombres de endpoints existentes sin justificación.

---

# 35. Regla de no regresión

Antes de terminar:

- no romper login password
- no romper logout
- no romper `/api/auth/me`
- no romper sesiones JDBC
- no romper CSRF
- no romper CORS
- no romper roles
- no romper endpoints admin
- no romper Supabase
- no romper migraciones
- no eliminar auditoría

---

# 36. Entregables esperados de Antigravity

Al finalizar debes dejar:

### Código

- integración Google OAuth/OIDC completa
- configuración
- success handler
- failure handler
- servicio de vinculación/creación de usuario
- cambios en entidades/repositorios
- migración Flyway
- tests

### Documentación

Crear o actualizar documentación indicando:

- variables de entorno
- configuración Google Cloud
- redirect URI
- flujo de autenticación
- desarrollo local
- producción
- troubleshooting

### Auditoría

Entregar un resumen:

```text
AUDITORÍA BACKEND
-----------------
Errores encontrados:
1. ...
2. ...

Correcciones:
1. ...
2. ...

Riesgos pendientes:
1. ...
2. ...

Tests:
- PASS ...
- PASS ...
- FAIL ...
```

Si algo no pudo verificarse, decirlo explícitamente.

---

# 37. Criterios de aceptación

La tarea solamente está terminada cuando:

- [ ] Google OAuth funciona localmente.
- [ ] Google OAuth funciona conceptualmente para producción con HTTPS.
- [ ] `sub` de Google se utiliza como identidad estable.
- [ ] email no verificado no puede vincular cuentas.
- [ ] no se puede producir account takeover mediante email.
- [ ] usuario nuevo recibe rol seguro.
- [ ] Google nunca otorga ADMIN.
- [ ] login tradicional sigue funcionando.
- [ ] `/api/auth/me` funciona igual para ambos métodos.
- [ ] sesión backend sigue siendo la fuente de autenticación.
- [ ] no se exponen tokens de Google al frontend.
- [ ] CSRF continúa activo.
- [ ] CORS continúa restringido.
- [ ] session fixation está mitigado.
- [ ] logout funciona.
- [ ] auditoría registra login Google.
- [ ] Flyway ejecuta todas las migraciones.
- [ ] tests nuevos pasan.
- [ ] tests existentes pasan.
- [ ] no hay secretos en el repositorio.
- [ ] `.env.example` está actualizado.
- [ ] no quedan errores conocidos sin documentar.

---

# 38. Orden exacto de ejecución recomendado

Ejecutar en este orden:

```text
1. Auditar estructura actual.
2. Ejecutar tests existentes.
3. Revisar migraciones.
4. Revisar SecurityConfig.
5. Revisar AuthController.
6. Revisar sesión/CSRF/CORS.
7. Diseñar modelo de identidad Google.
8. Crear migración.
9. Agregar dependencia OAuth2.
10. Agregar configuración.
11. Implementar OAuth.
12. Integrar con CustomUserDetails.
13. Integrar auditoría.
14. Corregir session fixation.
15. Agregar tests.
16. Ejecutar tests.
17. Corregir fallos.
18. Ejecutar build completo.
19. Revisar diff final.
20. Generar resumen de cambios y riesgos pendientes.
```

---

# 39. Instrucción final para Antigravity

**Actúa como ingeniero backend senior y ejecuta esta tarea directamente sobre el repositorio.**

No te limites a explicar cómo hacerlo.

Debes:

1. inspeccionar el código existente;
2. implementar Google OAuth/OIDC siguiendo esta especificación;
3. auditar el backend completo;
4. corregir los errores reales que encuentres;
5. mantener compatibilidad con el sistema de autenticación actual;
6. escribir las migraciones necesarias;
7. agregar pruebas;
8. ejecutar las pruebas;
9. corregir los fallos;
10. revisar seguridad;
11. dejar el repositorio en un estado funcional y coherente.

**No inventes componentes que ya existan.**
**No elimines seguridad para simplificar OAuth.**
**No desactives CSRF.**
**No uses `allowedOrigins("*")` con credenciales.**
**No almacenes tokens de Google sin necesidad.**
**No entregues tokens de Google al frontend.**
**No otorgues ADMIN mediante Google.**
**No vincules cuentas por email no verificado.**
**No uses redirects arbitrarios.**
**No modifiques migraciones Flyway ya aplicadas: crea una nueva.**

Si detectas una decisión arquitectónica que requiere confirmación de negocio, elige la opción más segura y compatible, documenta la decisión y continúa.

Al final muestra:

```text
IMPLEMENTACIÓN GOOGLE OAUTH: PASS/FAIL
AUDITORÍA BACKEND: PASS/FAIL
TESTS: PASS/FAIL
BUILD: PASS/FAIL

CAMBIOS PRINCIPALES:
...

ERRORES CORREGIDOS:
...

RIESGOS PENDIENTES:
...

CONFIGURACIÓN NECESARIA:
...
```
