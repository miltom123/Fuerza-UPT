# Plan de remediación técnica — Backend Fuerza UPT

**Proyecto:** Fuerza UPT Backend  
**Fecha:** 11 de agosto de 2026  
**Origen:** auditoría estática de `backend-fuerza-upt.zip`  
**Objetivo:** subsanar los hallazgos de arquitectura, seguridad, integridad, configuración y SDLC detectados durante la auditoría.

> Este documento está pensado como guía de implementación. Los cambios deben hacerse en una rama dedicada, con revisión de código y pruebas antes de desplegar a producción.

---

# 1. Orden recomendado de ejecución

No conviene corregir todo al mismo tiempo. El orden recomendado es:

## P0 — Antes del siguiente despliegue

- [ ] H-01 — Corregir autenticación de encuestas privadas.
- [ ] H-02 — Actualizar Spring Boot / Spring Security a una línea soportada.
- [ ] H-03 — Mapear y persistir correctamente `registration_mode`.
- [ ] H-04 — Hacer seguro el bootstrap del administrador.
- [ ] M-01 — Rotar el identificador de sesión después del login.
- [ ] Ejecutar pruebas de regresión de seguridad.

## P1 — Próximo sprint

- [ ] M-02 — Eliminar fallback inseguro de Supabase en producción.
- [ ] M-03 — Endurecer validación de Flyway.
- [ ] M-05 — Corregir validación de estado `LOGRADO`.
- [ ] M-09 — Canonicalizar aliases de módulos y caché.
- [ ] M-07 — Configurar límites multipart.
- [ ] Añadir timeouts HTTP a Supabase/revalidación.
- [ ] M-06/M-10 — Mejorar rate limiting y privacidad.
- [ ] Añadir limpieza de tablas de rate limiting.
- [ ] Reducir duración de sesión administrativa.
- [ ] Añadir tests de seguridad y dominio.

## P2 — Endurecimiento

- [ ] M-04 — Dividir `AdminContentService`.
- [ ] Extraer casos de uso de `PublicSubmissionController`.
- [ ] M-08 — Migrar a logging JSON estructurado real.
- [ ] L-01 — Fijar imágenes Docker por digest.
- [ ] L-02 — Eliminar rutas/código legacy.
- [ ] L-03 — Evitar cookie de logout hardcodeada.
- [ ] L-04 — Añadir CI, SAST, SCA, SBOM y secret scanning.
- [ ] Revisar configuración de proxies confiables.
- [ ] Diseñar MFA para cuentas administrativas.

---

# 2. Preparación antes de modificar código

Crear una rama exclusiva:

```bash
git checkout -b security/remediation-2026-08
```

Crear un baseline antes de tocar el proyecto:

```bash
./mvnw test
./mvnw dependency:tree > dependency-tree-before.txt
```

Si el entorno dispone de Docker/Testcontainers, ejecutar también todos los tests de integración.

Registrar el estado de la base de datos de staging:

```sql
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

No modificar migraciones Flyway ya desplegadas. Toda corrección de esquema debe agregarse mediante una **nueva migración**.

---

# 3. H-01 — Encuestas privadas pueden aceptar autenticación anónima

## Problema

Archivo:

```text
src/main/java/pe/edu/upt/fuerzaupt/poll/service/PollService.java
```

Actualmente:

```java
if (!poll.getAllowAnonymous() && (authentication == null || !authentication.isAuthenticated())) {
    throw new BusinessException("Esta encuesta requiere una sesion identificada.");
}
```

El problema es que Spring Security puede representar al visitante anónimo mediante un `AnonymousAuthenticationToken` cuyo `isAuthenticated()` puede devolver `true`.

Por tanto:

```text
isAuthenticated() == true
```

no implica necesariamente:

```text
usuario real autenticado
```

## Solución recomendada

Como el backend ya utiliza `CustomUserDetails`, la validación más robusta y sencilla es exigir dicho principal.

Crear una función privada:

```java
private boolean hasAuthenticatedUser(Authentication authentication) {
    return authentication != null
            && authentication.isAuthenticated()
            && authentication.getPrincipal() instanceof CustomUserDetails;
}
```

Cambiar la validación por:

```java
if (!poll.getAllowAnonymous() && !hasAuthenticatedUser(authentication)) {
    throw new AccessDeniedException("Esta encuesta requiere una sesion identificada.");
}
```

Imports:

```java
import org.springframework.security.access.AccessDeniedException;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;
```

Alternativamente puede utilizarse `AuthenticationTrustResolver`.

## Por qué usar `AccessDeniedException`

La restricción es de autorización, no de validación de datos.

Esto permite que el manejo global de Spring Security produzca una respuesta coherente de acceso denegado.

## Pruebas obligatorias

Crear:

```text
src/test/java/pe/edu/upt/fuerzaupt/poll/PollSecurityIntegrationTest.java
```

Casos mínimos:

```text
allowAnonymous=true  + sin sesión      -> permitido
allowAnonymous=false + sin sesión      -> rechazado
allowAnonymous=false + AnonymousToken  -> rechazado
allowAnonymous=false + usuario real    -> permitido
```

## Criterio de aceptación

- [ ] Una encuesta privada nunca acepta principal anónimo.
- [ ] Una encuesta pública sigue aceptando visitantes.
- [ ] Existe test de regresión.
- [ ] El endpoint continúa soportando encuestas públicas y privadas dinámicamente.

---

# 4. H-02 — Spring Boot 3.3.0 / Spring Security antiguos

## Problema

Archivo:

```text
pom.xml
```

Actualmente:

```xml
<version>3.3.0</version>
```

La rama utilizada está obsoleta y fue identificada durante la auditoría como afectada por una vulnerabilidad conocida de Spring Security relacionada con BCrypt.

## Objetivo

Salir completamente de Spring Boot 3.3.x y usar una versión soportada del framework.

No fijar aquí una versión futura concreta sin revisar las release notes del día de la migración.

## Estrategia recomendada

Hacer la actualización en una rama independiente:

```bash
git checkout -b upgrade/spring-supported
```

Cambiar el parent de Spring Boot a una versión soportada y compatible con el resto del proyecto.

Después:

```bash
./mvnw clean test
./mvnw dependency:tree
```

Revisar especialmente:

```text
spring-security-core
spring-security-web
spring-security-crypto
spring-session-jdbc
springdoc-openapi
flyway-core
flyway-database-postgresql
postgresql
testcontainers
```

## BCrypt

Actualmente:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

Se puede conservar BCrypt con coste 12 si la versión de Spring Security utilizada ya incluye el fix correspondiente.

Además, limitar la contraseña de entrada a una longitud compatible con la política utilizada.

Archivo:

```text
auth/dto/LoginRequest.java
```

No permitir una longitud arbitrariamente grande si el sistema continúa usando BCrypt.

Ejemplo:

```java
@NotBlank
@Size(max = 72)
String password
```

Si se decide permitir passphrases de más de 72 bytes, migrar de forma planificada a un esquema apropiado y versionado mediante `DelegatingPasswordEncoder`.

## No hacer

No sobrescribir manualmente versiones internas aisladas de Spring Security durante meses como solución permanente.

La solución correcta es utilizar una línea de Spring Boot soportada y dejar que su BOM gestione versiones compatibles.

## Criterio de aceptación

- [ ] El parent ya no es Spring Boot 3.3.x.
- [ ] `./mvnw clean test` pasa.
- [ ] Se revisó el árbol de dependencias.
- [ ] El login funciona.
- [ ] CSRF funciona.
- [ ] Sesiones JDBC funcionan.
- [ ] Swagger permanece desactivado en producción.
- [ ] Actuator mantiene sus restricciones.
- [ ] Se ejecutó un escáner SCA después del upgrade.

---

# 5. H-03 — `registration_mode` no está mapeado en `Event`

## Problema

La migración:

```text
V20__complete_admin_workflows.sql
```

agrega:

```sql
registration_mode VARCHAR(20) NOT NULL DEFAULT 'NONE'
```

y restricciones de integridad.

Sin embargo:

```text
src/main/java/pe/edu/upt/fuerzaupt/event/entity/Event.java
```

no contiene dicha propiedad.

Esto provoca divergencia entre:

```text
Servicio Java
        ↓
Entidad JPA
        ↓
PostgreSQL
```

## Solución recomendada

### Paso 1 — Crear enum

Crear:

```text
src/main/java/pe/edu/upt/fuerzaupt/event/model/RegistrationMode.java
```

```java
package pe.edu.upt.fuerzaupt.event.model;

public enum RegistrationMode {
    NONE,
    INTERNAL,
    EXTERNAL
}
```

### Paso 2 — Mapearlo en `Event`

Añadir:

```java
@Enumerated(EnumType.STRING)
@Column(name = "registration_mode", nullable = false, length = 20)
private RegistrationMode registrationMode = RegistrationMode.NONE;
```

Import:

```java
import pe.edu.upt.fuerzaupt.event.model.RegistrationMode;
```

### Paso 3 — Centralizar las invariantes

No modificar por separado:

```text
registrationMode
registrationEnabled
registrationUrl
```

Crear una única función de dominio.

Ejemplo dentro de un servicio de eventos:

```java
private void applyRegistrationMode(
        Event event,
        RegistrationMode mode,
        String registrationUrl
) {
    event.setRegistrationMode(mode);

    switch (mode) {
        case NONE -> {
            event.setRegistrationEnabled(false);
            event.setRegistrationUrl(null);
        }
        case INTERNAL -> {
            event.setRegistrationEnabled(true);
            event.setRegistrationUrl(null);
        }
        case EXTERNAL -> {
            if (registrationUrl == null || registrationUrl.isBlank()) {
                throw new BusinessException(
                        "La URL de inscripción es obligatoria para el modo EXTERNAL."
                );
            }
            event.setRegistrationEnabled(false);
            event.setRegistrationUrl(registrationUrl.trim());
        }
    }
}
```

### Paso 4 — Usarlo durante creación

En:

```text
AdminContentService.java
```

reemplazar la lógica actual:

```java
item.setRegistrationEnabled("INTERNAL".equals(mode));
item.setRegistrationUrl("EXTERNAL".equals(mode) ? input.registrationUrl() : null);
```

por una llamada única al helper.

### Paso 5 — Usarlo durante actualización

Lo mismo en el flujo de `update`.

No actualizar solo dos de las tres columnas.

### Paso 6 — Corregir `PublicSubmissionController`

Eliminar el bridge:

```java
private String getRegistrationMode(Event event)
```

y los comentarios temporales.

Validación recomendada:

```java
if (event.getRegistrationMode() != RegistrationMode.INTERNAL
        || !Boolean.TRUE.equals(event.getRegistrationEnabled())
        || !"REGISTRATION_OPEN".equals(event.getEventStatus())) {
    throw new BusinessException(
            "La inscripcion para este evento no esta disponible."
    );
}
```

Cuando el evento se llena puede mantenerse:

```java
event.setRegistrationEnabled(false);
event.setEventStatus("FULL");
```

El modo puede seguir siendo `INTERNAL`, indicando el mecanismo configurado aunque temporalmente no acepte registros.

## Pruebas con PostgreSQL real

Usar Testcontainers.

Casos:

### NONE

Esperado:

```text
registration_mode = NONE
registration_enabled = false
registration_url = null
```

### INTERNAL

Esperado:

```text
registration_mode = INTERNAL
registration_enabled = true
registration_url = null
```

### EXTERNAL

Esperado:

```text
registration_mode = EXTERNAL
registration_enabled = false
registration_url != null
```

Agregar también:

```text
EXTERNAL sin URL -> rechazo
```

## Criterio de aceptación

- [ ] `Event` mapea `registration_mode`.
- [ ] No existe bridge temporal.
- [ ] Las tres propiedades se actualizan juntas.
- [ ] Los tres modos pasan restricciones PostgreSQL.
- [ ] Hay tests Testcontainers.

---

# 6. H-04 — Bootstrap administrativo inseguro

## Problema

Archivo:

```text
auth/bootstrap/AdminBootstrapRunner.java
```

Un usuario existente actualmente es modificado en cada arranque:

```java
adminUser.setEnabled(true);
adminUser.setDisplayName(adminName);
adminUser.getRoles().add(adminRole);

if (!passwordEncoder.matches(adminPassword, adminUser.getPasswordHash())) {
    adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
}
```

Esto implica que reiniciar la aplicación puede:

- reactivar una cuenta deshabilitada;
- restaurar permisos;
- resetear contraseña;
- deshacer una acción de respuesta a incidentes.

## Solución recomendada

El bootstrap debe ser **create-only**.

Si la cuenta existe, no tocarla.

Ejemplo:

```java
if (existingUser.isPresent()) {
    log.info("Configured bootstrap admin already exists; no changes applied.");
    return;
}
```

Eliminar por completo del flujo normal:

```java
setEnabled(true)
setPasswordHash(...)
getRoles().add(...)
```

para usuarios existentes.

## Añadir interruptor explícito

En `application.yml`:

```yaml
app:
  admin:
    bootstrap-enabled: ${APP_ADMIN_BOOTSTRAP_ENABLED:false}
```

En el runner:

```java
@Value("${app.admin.bootstrap-enabled:false}")
private boolean bootstrapEnabled;
```

Al inicio:

```java
if (!bootstrapEnabled) {
    return;
}
```

En producción el valor normal debe ser:

```text
APP_ADMIN_BOOTSTRAP_ENABLED=false
```

Solo debe activarse durante una provisión controlada.

## Mejor opción

Una vez creada la primera cuenta administrativa, administrar usuarios mediante:

- un caso de uso explícito;
- CLI interna;
- operación de soporte auditada;
- IAM/OIDC externo.

## Validar secretos

No aceptar valores placeholder como:

```text
CAMBIAR_EN_ENTORNO
password
admin
123456
```

El backend debe fallar o rechazar el bootstrap.

## Criterio de aceptación

- [ ] Reiniciar la app no reactiva administradores.
- [ ] Reiniciar la app no cambia contraseñas.
- [ ] Bootstrap está desactivado por defecto.
- [ ] Una cuenta existente no se modifica.
- [ ] Existe test del runner.

---

# 7. M-01 — Proteger contra fijación de sesión

## Problema

El login es manual:

```text
AuthController.login()
```

Después de autenticar se crea el `SecurityContext`, pero no se ejecuta explícitamente una estrategia de rotación de sesión.

## Solución

Declarar un bean:

```java
@Bean
public SessionAuthenticationStrategy sessionAuthenticationStrategy() {
    return new ChangeSessionIdAuthenticationStrategy();
}
```

Imports:

```java
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
```

Inyectar en `AuthController`:

```java
private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
```

Después de:

```java
authentication = authenticationManager.authenticate(...);
```

y antes de persistir el `SecurityContext`:

```java
sessionAuthenticationStrategy.onAuthentication(
        authentication,
        request,
        response
);
```

Después:

```java
SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
SecurityContextHolder.setContext(context);
securityContextRepository.saveContext(context, request, response);
```

## Prueba obligatoria

1. Crear una sesión anónima.
2. Guardar su session id.
3. Ejecutar login.
4. Obtener el nuevo session id.
5. Verificar:

```text
oldSessionId != newSessionId
```

y que:

```text
GET /api/auth/me
```

siga funcionando.

## Criterio de aceptación

- [ ] El session id cambia durante login.
- [ ] El usuario queda autenticado.
- [ ] `SecurityContext` persiste.
- [ ] Test de regresión presente.

---

# 8. M-02 — Supabase debe fallar cerrado en producción

## Problema

`SupabaseStorageService` cambia a almacenamiento local si no existe:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Esto es aceptable para desarrollo, pero no para producción.

## Objetivo

En producción:

```text
configuración incompleta
        ↓
fallo de arranque
```

y nunca:

```text
configuración incompleta
        ↓
fallback silencioso
```

## Configuración recomendada

Agregar:

```yaml
app:
  supabase:
    local-fallback-enabled: ${SUPABASE_LOCAL_FALLBACK_ENABLED:false}
```

En `application-local.yml`:

```yaml
app:
  supabase:
    local-fallback-enabled: true
```

En `application-production.yml`:

```yaml
app:
  supabase:
    local-fallback-enabled: false
```

## Validación al arranque

Crear una clase:

```text
SupabaseConfigurationValidator
```

Ejemplo conceptual:

```java
@Component
@RequiredArgsConstructor
public class SupabaseConfigurationValidator {

    private final Environment environment;

    @Value("${app.supabase.url:}")
    private String url;

    @Value("${app.supabase.service-role-key:}")
    private String serviceRoleKey;

    @PostConstruct
    void validate() {
        boolean production =
                environment.acceptsProfiles(Profiles.of("production"));

        if (production && (url.isBlank() || serviceRoleKey.isBlank())) {
            throw new IllegalStateException(
                    "Supabase Storage es obligatorio en production."
            );
        }
    }
}
```

## Archivos privados

Para un archivo privado no debe existir ningún fallback hacia una URL pública local.

Si:

```text
privateAsset == true
```

y Supabase no está disponible/configurado:

```text
rechazar operación
```

## Criterio de aceptación

- [ ] Producción no arranca sin credenciales Supabase.
- [ ] Assets privados nunca se sirven mediante fallback local.
- [ ] Fallback local solo funciona en perfil local/dev.
- [ ] Hay test de configuración.

---

# 9. M-03 — Flyway no debe ignorar migraciones missing en producción

## Problema

Actualmente:

```yaml
spring:
  flyway:
    validate-on-migrate: true
    ignore-migration-patterns: "*:missing"
```

Esto debilita la detección de drift.

## Solución

Eliminar del `application.yml` compartido:

```yaml
ignore-migration-patterns: "*:missing"
```

Configuración esperada:

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: false
    validate-on-migrate: true
```

Si por razones históricas se necesita temporalmente en local, colocarlo únicamente en un perfil local, nunca en production.

## Política de migraciones

Después de desplegar una migración:

```text
NO modificar
NO renombrar
NO eliminar
```

Para cualquier corrección:

```text
crear Vxx__descripcion.sql nueva
```

## Criterio de aceptación

- [ ] Production rechaza historial Flyway inconsistente.
- [ ] No se modifican migraciones ya aplicadas.
- [ ] Existe prueba de arranque desde base vacía.

---

# 10. M-05 — Bug de validación `LOGRADO`

## Problema

Archivo:

```text
AdminContentService.java
```

Actualmente:

```java
Integer.valueOf(100).equals(item.getProgress())
```

pero:

```text
progress = String
```

Por lo tanto la comparación siempre será falsa.

## Corrección

Cambiar por:

```java
"LOGRADO".equals(item.getProgress())
```

Validación completa:

```java
if (item == null
        || item.getBeneficiaryArea() == null
        || item.getBeneficiaryArea().isBlank()
        || item.getProposalOrManagement() == null
        || item.getProposalOrManagement().isBlank()
        || ("LOGRADO".equals(item.getProgress())
            && (item.getResult() == null || item.getResult().isBlank()))) {

    throw new BusinessException(
            "El registro no cumple los campos obligatorios para publicarse."
    );
}
```

## Tests

```text
PRESENTADO sin result -> permitido si result no es obligatorio
LOGRADO con result     -> permitido
LOGRADO sin result     -> rechazado
```

## Criterio de aceptación

- [ ] `Integer.valueOf(100)` desaparece.
- [ ] El estado textual es validado correctamente.
- [ ] Existe test de publicación.

---

# 11. M-09 — Alias de módulos y caché

## Problema

El backend tiene aliases como:

```text
opportunities
oportunidades
```

pero la canonicalización no se aplica de manera uniforme.

En `CacheInvalidationService` falta:

```text
oportunidades
```

mientras algunos controladores pasan el path crudo.

## Parche mínimo

Añadir:

```java
Map.entry("oportunidades", "opportunities")
```

en `TAGS` y:

```java
Map.entry("oportunidades", "public-opportunities")
```

en `CACHE_NAMES`.

Pero este es solo el parche inmediato.

## Solución definitiva

La canonicalización debe hacerse una sola vez.

Crear un enum público:

```java
public enum AdminModule {
    REPRESENTATION("representation", Set.of("representation", "representacion")),
    PROJECTS("projects", Set.of("projects", "proyectos")),
    EVENTS("events", Set.of("events", "eventos")),
    OPPORTUNITIES("opportunities", Set.of("opportunities", "oportunidades")),
    STATISTICS("statistics", Set.of("statistics", "estadisticas"));

    ...
}
```

Todos los componentes deben trabajar internamente con el canonical:

```text
representation
projects
events
opportunities
statistics
```

Nunca con el path enviado directamente por cliente.

## Bug adicional

Actualmente `Module` contiene:

```java
PROJECTS("projects")
```

pero `Module.from()` no acepta:

```text
projects
proyectos
```

Añadir:

```java
case "projects", "proyectos" -> PROJECTS;
```

## Controladores

Cambiar `AdminContentController` para seguir el mismo patrón de `AdminModuleController`:

```java
String canonical = contentService.canonicalModule(module);
```

y usar:

```java
auditLogService.record(... canonical ...);
cacheInvalidationService.invalidate(canonical);
```

## Criterio de aceptación

- [ ] `projects` y `proyectos` resuelven al mismo módulo.
- [ ] `opportunities` y `oportunidades` invalidan la misma caché.
- [ ] Auditoría guarda nombres canonicalizados.
- [ ] Existe una sola fuente de verdad para aliases.

---

# 12. M-07 — Configurar límites multipart

## Problema

El servicio permite archivos de hasta:

```text
10 MB
```

y ciertas imágenes:

```text
5 MB
```

pero Spring puede rechazar el request antes de llegar al servicio.

## Solución

En `application.yml`:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 12MB
```

Si existen endpoints multiarchivo, dimensionar `max-request-size` según el máximo número de archivos permitido.

No poner un valor excesivamente alto.

## Mantener validación de dominio

La configuración multipart solo evita rechazo prematuro.

`SupabaseStorageService` debe seguir verificando:

- tamaño;
- MIME;
- firma mágica;
- extensión normalizada;
- nombre aleatorio UUID.

## Tests

```text
archivo 4 MB válido -> aceptado
archivo 9 MB válido -> aceptado si aplica
archivo >10 MB      -> rechazado
MIME falso           -> rechazado
firma inválida       -> rechazado
```

## Criterio de aceptación

- [ ] Límites HTTP y de servicio son coherentes.
- [ ] El servidor no acepta archivos arbitrariamente grandes.
- [ ] Tests de upload presentes.

---

# 13. Añadir timeouts a clientes HTTP

## Problema

Los clientes utilizados para:

```text
Supabase
Next.js revalidation
```

no deben depender indefinidamente de defaults.

## Objetivo

Toda llamada externa debe tener al menos:

```text
connect timeout
read/response timeout
```

y opcionalmente retry controlado para operaciones idempotentes.

## Recomendación

Crear una configuración central:

```text
HttpClientConfig
```

y construir el `RestClient.Builder` con un request factory que tenga timeouts explícitos.

Valores iniciales razonables para este proyecto:

```text
connect timeout: 3–5 s
read timeout:    10–15 s
```

No hacer retries automáticos ilimitados en uploads.

Para revalidación de caché, si falla:

```text
log + métrica
```

sin romper el write principal si ese es el comportamiento de negocio deseado.

## Criterio de aceptación

- [ ] Ningún HTTP externo puede quedar esperando indefinidamente.
- [ ] Existen logs/métricas de fallo.
- [ ] Timeouts son configurables por entorno.

---

# 14. M-06 / M-10 — Mejorar rate limiting de login

## Problema actual

La clave se construye como:

```java
IP + ":" + email
```

Problemas:

- almacena IP y correo en claro;
- permite repartir intentos entre IPs;
- permite ataques desde una IP contra muchas cuentas;
- solo existe una dimensión de bloqueo.

## Objetivo

Aplicar límites independientes:

```text
por IP
por cuenta
por combinación IP + cuenta
```

y almacenar solo claves HMAC.

## Construcción recomendada

En `AuthController`:

```java
String ip = clientIpResolver.resolve(request);
String email = loginRequest.email().trim().toLowerCase(Locale.ROOT);

String ipKey =
        privacyHashService.hash(ip, "login-ip");

String accountKey =
        privacyHashService.hash(email, "login-account");

String combinationKey =
        privacyHashService.hash(ip + "|" + email, "login-combination");
```

No almacenar el correo ni la IP crudos.

## Límites sugeridos como punto de partida

Ajustarlos con métricas reales.

Ejemplo conceptual:

```text
combinación: 5 fallos / 15 min
cuenta:      10 fallos / 30 min
IP:          30 fallos / 15 min
```

No implementar bloqueos permanentes.

## Servicio

Refactorizar `LoginAttemptService` para poder evaluar una colección de claves.

Ejemplo conceptual:

```java
loginAttemptService.ensureAllowed(List.of(
    new LimitKey("ip", ipKey, ...),
    new LimitKey("account", accountKey, ...),
    new LimitKey("combo", combinationKey, ...)
));
```

## Respuesta

No informar al atacante si:

```text
la cuenta existe
la cuenta no existe
la contraseña es incorrecta
```

Usar una respuesta genérica.

## Criterio de aceptación

- [ ] IP no se persiste en claro.
- [ ] Email no se persiste en claro.
- [ ] Existe límite por cuenta.
- [ ] Existe límite por IP.
- [ ] Existe límite combinado.
- [ ] Se generan métricas de bloqueos.

---

# 15. Limpieza de tablas de rate limiting

## Problema

Existen índices:

```text
idx_login_attempts_cleanup
idx_request_rate_limits_cleanup
```

pero no se encontró job que borre datos antiguos.

## Solución

Crear un job periódico.

Ejemplo:

```java
@Component
@RequiredArgsConstructor
public class SecurityCleanupJob {

    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "${app.security.cleanup-cron:0 15 * * * *}")
    @Transactional
    public void cleanup() {
        jdbcTemplate.update("""
            DELETE FROM login_attempts
            WHERE updated_at < NOW() - INTERVAL '24 hours'
        """);

        jdbcTemplate.update("""
            DELETE FROM request_rate_limits
            WHERE window_started_at < NOW() - INTERVAL '24 hours'
        """);
    }
}
```

Habilitar scheduling en una configuración:

```java
@EnableScheduling
```

La retención debe ser mayor que la ventana máxima utilizada por el rate limiter.

También puede implementarse mediante un job externo de PostgreSQL si la infraestructura lo prefiere.

## Criterio de aceptación

- [ ] Las tablas no crecen indefinidamente.
- [ ] La retención es documentada.
- [ ] El job tiene métricas/logs.
- [ ] El job es seguro al ejecutarse en múltiples instancias.

---

# 16. M-08 — Logging JSON estructurado

## Problema

Actualmente `logback-spring.xml` construye JSON mediante un pattern manual.

Esto puede generar JSON inválido cuando el mensaje contiene:

```text
"
\
saltos de línea
caracteres especiales
```

## Solución

Después del upgrade de Spring Boot, usar preferentemente soporte nativo de structured logging si está disponible en la versión elegida.

Si no está disponible, utilizar un encoder JSON mantenido.

No construir JSON manualmente con:

```xml
<pattern>{ ... }</pattern>
```

## Campos mínimos

Los logs de producción deberían contener:

```text
timestamp
level
logger
message
requestId
traceId (si existe)
userId (solo cuando sea seguro)
operation
exception
```

Nunca registrar:

```text
contraseña
service_role_key
cookies
CSRF token
Authorization
datos personales completos innecesarios
```

## Log injection

No concatenar headers o inputs del usuario directamente en logs estructurados sin serialización.

## Criterio de aceptación

- [ ] Cada línea de producción es JSON válido.
- [ ] Mensajes con comillas no rompen el JSON.
- [ ] No se registran secretos.
- [ ] `requestId` permanece presente.

---

# 17. Duración de sesión administrativa

## Problema

Actualmente:

```yaml
server:
  servlet:
    session:
      timeout: 8h
```

Para un panel administrativo, ocho horas de inactividad es una ventana amplia.

## Solución

En producción reducir inicialmente a:

```yaml
server:
  servlet:
    session:
      timeout: 30m
```

o como máximo un valor decidido conscientemente según la operación real.

Separar si fuera necesario:

```text
sesión pública
sesión administrativa
```

## Defensa adicional recomendada

Planificar:

```text
MFA TOTP
passkeys/WebAuthn
OIDC corporativo
```

para administradores.

## Criterio de aceptación

- [ ] Timeout productivo explícito.
- [ ] La UI maneja sesión expirada correctamente.
- [ ] Logout invalida servidor y cookie.
- [ ] Se planificó MFA.

---

# 18. L-03 — Cookie de logout hardcodeada

## Problema

Actualmente:

```java
new Cookie("FUERZA_UPT_SESSION", "")
```

El nombre también existe en configuración:

```yaml
server.servlet.session.cookie.name
```

Si cambia la configuración, el controller puede quedar desalineado.

## Solución preferida

Dejar que:

```java
SecurityContextLogoutHandler
```

invalide la sesión y centralizar la eliminación de cookie mediante configuración de Spring Security.

Si se requiere explícitamente una cookie, leer el nombre desde properties:

```java
@Value("${server.servlet.session.cookie.name:FUERZA_UPT_SESSION}")
private String sessionCookieName;
```

y utilizar:

```java
new Cookie(sessionCookieName, "");
```

No duplicar configuración innecesariamente.

## Criterio de aceptación

- [ ] Cambiar el nombre de cookie en configuración no rompe logout.
- [ ] La sesión queda inválida en servidor.
- [ ] Cookie queda eliminada en cliente.

---

# 19. M-04 — Dividir `AdminContentService`

## Problema

`AdminContentService` tiene aproximadamente 700+ líneas y múltiples `switch`.

Contiene lógica para:

```text
representation
projects
events
opportunities
statistics
```

Esto genera alto acoplamiento.

Ya aparecieron inconsistencias en:

```text
projects
registration_mode
aliases
publication validation
cache invalidation
```

## Arquitectura objetivo

Mantener organización por feature.

Ejemplo:

```text
admin/
  content/
    AdminModule.java
    AdminContentCoordinator.java

representation/
  service/
    RepresentationAdminService.java

event/
  service/
    EventAdminService.java

opportunity/
  service/
    OpportunityAdminService.java

statistic/
  service/
    StatisticAdminService.java

project/
  service/
    ProjectAdminService.java
```

`ProjectAdminService` ya apunta hacia una arquitectura más sana.

## Interfaz opcional

Solo si realmente comparten comportamiento:

```java
public interface AdminContentHandler {

    AdminModule module();

    AdminContentRowResponse create(AdminContentRequest request);

    AdminContentRowResponse update(
            UUID id,
            AdminContentUpdateRequest request
    );

    AdminContentRowResponse find(UUID id);

    void archive(UUID id);
}
```

El coordinador puede resolver:

```java
Map<AdminModule, AdminContentHandler>
```

en lugar de un `switch` gigante.

## No sobreabstraer

No forzar eventos y estadísticas a compartir lógica si sus invariantes son diferentes.

La interfaz común debe cubrir únicamente comportamiento realmente común.

## Criterio de aceptación

- [ ] Cada dominio controla sus invariantes.
- [ ] No existe un switch central de cientos de líneas.
- [ ] Eventos no dependen de lógica genérica para `registration_mode`.
- [ ] Tests pueden ejecutarse por módulo.

---

# 20. Extraer lógica de `PublicSubmissionController`

## Problema

El controller maneja:

```text
HTTP
rate limiting
validaciones
repositories
transacciones
reglas de capacidad
persistencia
```

Demasiadas responsabilidades.

## Arquitectura recomendada

Crear servicios de aplicación:

```text
ContactSubmissionService
StudentProposalSubmissionService
TeamApplicationSubmissionService
NewsletterSubscriptionService
EventRegistrationService
```

Controller:

```java
@PostMapping(...)
public ResponseEntity<?> register(...) {
    return eventRegistrationService.register(...);
}
```

Service:

```text
transacción
reglas de dominio
repositorios
rate limiting
auditoría
```

## Beneficio

Los casos de uso pueden probarse sin MockMvc y las reglas quedan reutilizables.

## Criterio de aceptación

- [ ] Controller no manipula entidades directamente.
- [ ] Controller no contiene reglas complejas.
- [ ] Cada caso de uso tiene tests unitarios/integración.

---

# 21. L-02 — Eliminar módulos y rutas legacy

## Problema

Todavía existen referencias a:

```text
/api/noticias/**
noticias
```

aunque la migración V28 elimina el módulo correspondiente.

## Solución

Buscar:

```bash
grep -Rni "noticias\|news" src
```

Clasificar cada resultado:

```text
vigente
compatibilidad temporal
legacy
muerto
```

Eliminar código muerto.

Si existe compatibilidad temporal de API, documentarla y definir fecha de retiro.

No dejar aliases indefinidamente sin tests ni ownership.

## Criterio de aceptación

- [ ] No hay rutas sin implementación de dominio.
- [ ] No hay enums legacy sin uso.
- [ ] Toda compatibilidad temporal tiene fecha de retiro.

---

# 22. Trusted proxies / `X-Forwarded-For`

## Estado actual

`ClientIpResolver` solo confía en `X-Forwarded-For` cuando:

```text
request.getRemoteAddr()
```

coincide con una dirección configurada como proxy confiable.

Esto es mejor que confiar ciegamente en el header.

## Riesgo operativo

La seguridad depende de que:

```text
TRUSTED_PROXY_ADDRESSES
```

represente exactamente la topología real.

## Acciones

- [ ] Documentar proxy/load balancer real.
- [ ] No usar `0.0.0.0/0` ni listas demasiado amplias.
- [ ] Evitar exponer directamente el backend si espera headers de proxy.
- [ ] Confirmar cómo la plataforma sobrescribe `X-Forwarded-For`.
- [ ] Probar múltiples proxies si existen.
- [ ] Definir una única estrategia entre `forward-headers-strategy` y resolver manualmente IP.

## Test importante

Request directo desde host no confiable con:

```http
X-Forwarded-For: 1.2.3.4
```

debe ignorar dicho valor.

Request proveniente del proxy real debe resolver correctamente al cliente.

## Criterio de aceptación

- [ ] No puede spoofearse IP desde Internet directamente.
- [ ] Rate limiting usa IP real bajo la topología de producción.
- [ ] La configuración está documentada.

---

# 23. L-01 — Fijar imágenes Docker por digest

## Problema

Actualmente:

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
FROM eclipse-temurin:17-jre-alpine
```

Los tags pueden cambiar con el tiempo.

## Solución

Después de verificar la imagen deseada, fijarla:

```dockerfile
FROM eclipse-temurin:17-jdk-alpine@sha256:<DIGEST> AS build
...
FROM eclipse-temurin:17-jre-alpine@sha256:<DIGEST>
```

No copiar un digest de documentación antigua.

Obtener el digest en el momento de hacer el cambio y almacenarlo en Git.

## Actualización

Automatizar PRs periódicos con:

```text
Renovate
Dependabot
herramienta equivalente
```

## Mantener

El usuario no-root actual es correcto:

```dockerfile
USER fuerza
```

No eliminarlo.

## Criterio de aceptación

- [ ] Imágenes productivas están fijadas por digest.
- [ ] Existe proceso de actualización.
- [ ] Contenedor continúa como non-root.

---

# 24. L-04 — Pipeline CI de seguridad y calidad

## Objetivo

Ningún cambio debería entrar a `main` sin:

```text
compilar
testear
validar dependencias
escanear secretos
analizar código
```

## Pipeline mínimo

### Etapa 1 — Build

```bash
./mvnw -B clean verify
```

### Etapa 2 — Tests

Debe incluir:

```text
unit tests
MockMvc
Testcontainers PostgreSQL
Flyway migration tests
```

### Etapa 3 — SCA

Usar una herramienta de análisis de dependencias.

Ejemplos posibles:

```text
OWASP Dependency-Check
Dependabot
Snyk
Trivy
Grype
```

Elegir una y mantenerla.

### Etapa 4 — SAST

Ejemplos:

```text
SpotBugs
Semgrep
Sonar
CodeQL
```

### Etapa 5 — Secret scanning

Ejemplos:

```text
Gitleaks
TruffleHog
GitHub secret scanning
```

Debe analizar historial Git además del working tree cuando sea posible.

### Etapa 6 — SBOM

Generar CycloneDX.

Guardar como artefacto de CI:

```text
bom.json
```

### Etapa 7 — Container scan

Después de construir:

```text
escanear imagen Docker
```

### Etapa 8 — Quality gate

Bloquear merge si:

```text
tests fallan
migraciones fallan
vulnerabilidad crítica/alta no aceptada
secret scanning encuentra secreto
```

## Criterio de aceptación

- [ ] CI se ejecuta en Pull Requests.
- [ ] `main` está protegido.
- [ ] Quality gates bloquean merge.
- [ ] SBOM queda almacenado.
- [ ] Imágenes se escanean.

---

# 25. Cobertura de pruebas obligatoria

No perseguir únicamente un porcentaje global.

Priorizar rutas críticas.

## Seguridad

Crear tests para:

```text
SecurityConfig
AuthController
login
logout
/api/auth/me
CSRF
ADMIN role
denyAll
session fixation
```

Matriz mínima:

| Endpoint | Anónimo | Usuario | ADMIN |
|---|---:|---:|---:|
| `/api/public/**` | 200 | 200 | 200 |
| `/api/auth/me` | rechazo | 200 | 200 |
| `/api/admin/**` | rechazo | rechazo | permitido |
| `/api/media/**` | rechazo | rechazo | permitido |
| `/actuator/prometheus` | rechazo | rechazo | permitido |

## CSRF

Para métodos mutadores:

```text
POST
PUT
PATCH
DELETE
```

verificar:

```text
sin token -> rechazo
token válido -> procesa
```

excepto donde exista una excepción explícitamente diseñada.

## Encuestas

Cubrir:

```text
anonymous allowed
anonymous forbidden
duplicate fingerprint
rate limit
question from another poll
duplicate answer
```

## Eventos

Cubrir:

```text
NONE
INTERNAL
EXTERNAL
capacity
FULL
registration closed
past event
duplicate email
duplicate student code
```

## AdminContent

Cubrir:

```text
aliases
publication transitions
LOGRADO
cache invalidation
archive/restore
optimistic locking
```

---

# 26. Seguridad de configuración y secretos

## Variables que deben ser obligatorias en producción

Como mínimo:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
FRONTEND_ORIGIN
PRIVACY_HMAC_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
REVALIDATION_SECRET
```

si las funcionalidades correspondientes están activas.

## No usar defaults peligrosos en production

Ejemplo actual:

```yaml
frontend-origin: ${FRONTEND_ORIGIN:http://localhost:3000}
```

El default es útil para local, pero production debe validar que no siga siendo localhost.

Crear validación al inicio.

## HMAC

Actualmente `PrivacyHashService` exige al menos 32 caracteres cuando se usa.

Mejorar haciendo fail-fast al arranque de production.

No esperar al primer request.

## `.env`

El archivo real:

```text
.env
```

nunca debe entrar al repositorio.

Confirmar `.gitignore`.

Escanear historial.

## Criterio de aceptación

- [ ] Producción falla al arrancar con secretos ausentes.
- [ ] No existen secretos reales en Git.
- [ ] Los placeholders no son aceptados en production.
- [ ] HMAC se valida al arranque.

---

# 27. CORS

La estrategia actual de origen explícito es correcta.

Mantener:

```text
origen explícito
credentials=true
sin wildcard
```

No cambiar a:

```text
allowedOrigins("*")
```

cuando:

```text
allowCredentials(true)
```

## Acción

Agregar tests de configuración para producción.

Validar que:

```text
FRONTEND_ORIGIN
```

sea HTTPS en producción.

Ejemplo:

```text
https://fuerzaupt.pe
```

## Criterio de aceptación

- [ ] Solo frontend autorizado recibe CORS.
- [ ] No existe wildcard productivo.
- [ ] Origin productivo usa HTTPS.

---

# 28. Headers HTTP de seguridad

La auditoría se concentró en seguridad de backend, pero conviene verificar explícitamente headers.

Revisar que el deployment emita, según aplique:

```text
Strict-Transport-Security
X-Content-Type-Options
Content-Security-Policy
Referrer-Policy
Permissions-Policy
```

La CSP normalmente corresponde principalmente al frontend/proxy.

No duplicar políticas incompatibles entre Spring y CDN.

## Criterio de aceptación

- [ ] HSTS activo sobre HTTPS productivo.
- [ ] No se sirve HTTP en producción salvo redirect.
- [ ] Headers se prueban desde el endpoint público real.

---

# 29. Manejo de errores

No devolver al cliente:

```text
stack traces
SQL
nombres internos de clases
secretos
rutas del filesystem
```

El cliente debería recibir una estructura estable:

```json
{
  "code": "BUSINESS_RULE_VIOLATION",
  "message": "Mensaje seguro",
  "requestId": "..."
}
```

Los detalles técnicos quedan solo en logs.

## Acción

Revisar global exception handler y asegurar que:

```text
production != debug
```

## Criterio de aceptación

- [ ] No existen stack traces en respuestas.
- [ ] Toda respuesta de error contiene requestId.
- [ ] Los mensajes no exponen internals.

---

# 30. Revalidación y caché

## Problema general

La caché local + eventos de invalidación + revalidación Next.js tiene varias piezas.

## Objetivo

Un write exitoso debe producir:

```text
DB commit
↓
invalidation event
↓
cache local invalidada
↓
frontend revalidado
```

## Mejora

La creación de `CacheInvalidationEvent` debería ocurrir dentro de la misma transacción del write cuando sea posible.

La llamada HTTP externa a Next.js debe ejecutarse:

```text
after commit
```

y no antes.

Considerar:

```text
@TransactionalEventListener(phase = AFTER_COMMIT)
```

para evitar revalidar frontend si después la transacción de base de datos hace rollback.

## Criterio de aceptación

- [ ] Rollback no genera revalidación falsa.
- [ ] Alias canonicalizado.
- [ ] Revalidación fallida no pierde el evento.
- [ ] Existe retry o mecanismo de recuperación razonable.

---

# 31. Auditoría administrativa

El proyecto ya tiene `AuditLogService`, lo cual es positivo.

Asegurar que operaciones críticas registren:

```text
login
logout
create
update
publish
unpublish
archive
restore
delete
cambio de permisos
cambio de contraseña
```

No registrar secretos.

Para seguridad:

```text
audit logs deben ser append-only desde la aplicación
```

Un administrador funcional no debería poder borrar su propio rastro mediante la API normal.

## Retención

Definir política explícita.

Por ejemplo:

```text
180–365 días
```

según obligaciones reales.

No retener datos personales eternamente sin motivo.

---

# 32. Transacciones y concurrencia

El uso de `@Version` en varias entidades es positivo.

Mantener optimistic locking para contenido administrativo.

Para registros con capacidad:

```text
event registration
```

la consulta `FOR UPDATE` es correcta para serializar la capacidad del evento.

Agregar prueba concurrente:

```text
capacity = 1
2 requests simultáneos
resultado esperado:
1 aceptado
1 rechazado
```

No depender únicamente de:

```text
count + save
```

sin lock.

---

# 33. Base de datos — restricciones como última defensa

Mantener las restricciones `CHECK`.

La lógica Java no debe reemplazarlas.

Modelo recomendado:

```text
DTO validation
        ↓
domain validation
        ↓
database constraints
```

Tres capas, no una sola.

Para `registration_mode`, mantener el CHECK existente incluso después de corregir JPA.

Para valores como status, considerar a futuro:

```text
PostgreSQL CHECK
+
Java enum
```

para reducir strings inválidos.

---

# 34. Migraciones nuevas recomendadas

No es obligatorio cambiar el esquema para mapear `registration_mode`, porque la columna ya existe.

Sí se recomienda crear una migración futura para cualquier ajuste de índices/retención necesario.

Ejemplo:

```text
V29__security_hardening.sql
```

Solo incluir cambios reales de esquema.

No crear una migración vacía innecesaria.

Posibles adiciones:

```sql
-- solo si son necesarias tras refactor
CREATE INDEX ...;
ALTER TABLE ...;
```

No eliminar registros de Flyway manualmente.

---

# 35. Refactor progresivo recomendado

No ejecutar una reescritura masiva.

Orden:

```text
1. corregir bugs P0
2. agregar tests
3. extraer EventAdminService
4. extraer RepresentationAdminService
5. extraer OpportunityAdminService
6. centralizar AdminModule
7. retirar AdminContentService gradualmente
```

Cada extracción debe preservar comportamiento y tener tests antes de borrar código anterior.

---

# 36. Checklist de despliegue seguro

Antes de desplegar la remediación:

## Código

- [ ] `./mvnw clean verify` pasa.
- [ ] No hay tests ignorados inesperadamente.
- [ ] No hay TODO/bridge temporal en eventos.
- [ ] No hay secretos hardcodeados.

## Seguridad

- [ ] Encuestas privadas rechazan anónimos.
- [ ] Session id rota en login.
- [ ] Bootstrap admin está desactivado.
- [ ] Admin existente no cambia al reiniciar.
- [ ] Rate limit usa HMAC.
- [ ] CSRF sigue activo.
- [ ] CORS sigue restringido.

## Base de datos

- [ ] Flyway valida.
- [ ] Migración desde cero pasa.
- [ ] Upgrade desde snapshot de staging pasa.
- [ ] `registration_mode` funciona en los tres modos.
- [ ] No se modificaron migraciones antiguas.

## Storage

- [ ] Production falla sin Supabase.
- [ ] Assets privados requieren Supabase.
- [ ] Uploads 5–10 MB funcionan según regla.
- [ ] Archivo mayor al límite es rechazado.
- [ ] Timeouts HTTP funcionan.

## Operación

- [ ] Logs son JSON válido.
- [ ] Healthcheck funciona.
- [ ] Prometheus continúa protegido.
- [ ] Docker corre non-root.
- [ ] Imagen fue escaneada.
- [ ] Rollback de versión está preparado.

---

# 37. Tests de smoke después del despliegue

Ejecutar contra staging primero.

## Público

```text
GET /actuator/health
GET /api/public/...
GET /api/eventos/...
GET /api/encuestas/...
```

## Auth

```text
GET  /api/auth/csrf
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Seguridad

Intentar:

```text
GET /api/admin/... sin sesión
POST /api/admin/... sin CSRF
GET /actuator/prometheus sin ADMIN
```

Todos deben ser rechazados.

## Encuesta privada

```text
POST respuesta sin sesión
```

debe ser rechazada.

## Evento INTERNAL

Crear evento, abrir registros y registrar una persona.

## Evento EXTERNAL

Verificar que no acepta inscripción interna.

## Evento NONE

Verificar que no acepta inscripción.

---

# 38. Estrategia de rollback

No desplegar cambios de seguridad sin rollback.

Antes de producción:

```text
imagen anterior identificada
migraciones revisadas
backup reciente
release tag
```

Si una nueva migración es no destructiva, rollback de aplicación suele ser más sencillo.

Evitar cambios destructivos de schema en el mismo release que un gran upgrade de Spring.

Aplicar patrón:

```text
expand
deploy
migrate behavior
contract
```

cuando exista cambio incompatible.

---

# 39. Priorización final

## Bloque 1 — Debe hacerse primero

```text
H-01 encuesta
H-02 Spring
H-03 registration_mode
H-04 admin bootstrap
M-01 session fixation
```

No avanzar a un despliegue normal sin estos cinco puntos.

## Bloque 2 — Seguridad operativa

```text
Supabase fail-closed
Flyway
rate limiting
multipart
timeouts
logging
session timeout
```

## Bloque 3 — Prevención de regresiones

```text
tests
CI
SAST
SCA
SBOM
secret scanning
```

## Bloque 4 — Arquitectura

```text
AdminContentService
PublicSubmissionController
aliases
legacy routes
```

---

# 40. Definición de “remediación completa”

La auditoría puede considerarse subsanada cuando:

- [ ] Todos los P0 están cerrados y probados.
- [ ] Todos los P1 están cerrados o tienen excepción de riesgo documentada.
- [ ] El framework está en una línea soportada.
- [ ] No existe bypass de encuesta privada.
- [ ] `registration_mode` está representado en Java y PostgreSQL.
- [ ] Reiniciar la aplicación no altera cuentas administrativas existentes.
- [ ] Login rota sesión.
- [ ] Storage productivo falla cerrado.
- [ ] Flyway detecta drift.
- [ ] Rate limiting protege cuenta e IP sin guardar identificadores crudos.
- [ ] Tablas temporales tienen limpieza.
- [ ] Logs son estructurados de forma segura.
- [ ] Caché utiliza módulos canonicalizados.
- [ ] El flujo `LOGRADO` tiene tests.
- [ ] Uploads tienen límites coherentes.
- [ ] Clientes HTTP externos tienen timeouts.
- [ ] CI bloquea fallos de seguridad/calidad.
- [ ] Existe cobertura automatizada de las rutas críticas.
- [ ] Código legacy identificado fue eliminado o documentado.
- [ ] El backend continúa ejecutándose como usuario non-root.
- [ ] Se realizó smoke test de staging.
- [ ] Se realizó revisión manual final antes de producción.

---

# 41. Commits recomendados

Para facilitar revisión y rollback, no hacer un único commit gigante.

Orden sugerido:

```text
fix(security): reject anonymous identities on protected polls
fix(event): map and enforce registration mode
fix(auth): make admin bootstrap create-only
fix(auth): rotate session id after login
chore(deps): upgrade spring boot supported line
fix(storage): fail closed in production
fix(flyway): enforce migration validation
fix(representation): enforce LOGRADO result
fix(cache): canonicalize admin module aliases
fix(upload): align multipart limits
fix(security): hash and split login rate limits
feat(maintenance): cleanup security rate limit records
fix(logging): use structured JSON encoder
refactor(admin): split content services by domain
refactor(submission): move use cases out of controller
ci(security): add SAST SCA SBOM and secret scanning
```

---

# 42. Resultado esperado después de aplicar el plan

La arquitectura debería quedar aproximadamente así:

```text
Controller
    ↓
Application Service / Use Case
    ↓
Domain rules
    ↓
Repository
    ↓
PostgreSQL constraints
```

Para autenticación:

```text
Client
  ↓ CSRF
Login endpoint
  ↓
AuthenticationManager
  ↓
SessionAuthenticationStrategy
  ↓
SecurityContextRepository
  ↓
Spring Session JDBC
```

Para eventos:

```text
EventAdminService
  ↓
RegistrationMode enum
  ↓
Event entity
  ↓
events.registration_mode
  ↓
PostgreSQL CHECK constraints
```

Para seguridad perimetral:

```text
Trusted proxy
  ↓
ClientIpResolver
  ↓
HMAC identifiers
  ↓
Rate limiter PostgreSQL
```

Para calidad:

```text
Pull Request
  ↓
Build
  ↓
Tests
  ↓
SAST
  ↓
SCA
  ↓
Secret scan
  ↓
SBOM
  ↓
Container scan
  ↓
Merge
```

---

# 43. Nota final

La prioridad no es “reescribir el backend”.

El proyecto ya posee varias bases correctas:

```text
CSRF habilitado
CORS restringido
denyAll por defecto
Flyway
JPA validation
Spring Session JDBC
HMAC para privacidad
validación de uploads
Docker non-root
Actuator restringido
optimistic locking
```

La remediación debe conservar esas defensas y corregir las inconsistencias existentes alrededor de ellas.

La regla principal durante el trabajo debe ser:

> cada vulnerabilidad corregida debe terminar convertida en una prueba automatizada para impedir su reaparición.
