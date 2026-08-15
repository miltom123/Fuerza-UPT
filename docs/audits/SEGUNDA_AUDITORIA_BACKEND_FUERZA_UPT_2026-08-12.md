# Segunda auditoría de remediación — Backend Fuerza UPT

**Proyecto:** Fuerza UPT API  
**Fecha de revisión:** 12 de agosto de 2026  
**Artefacto revisado:** `backend-fuerza-upt(1).zip`  
**Tipo de revisión:** auditoría estática comparativa + revisión de configuración, seguridad, arquitectura y pruebas.

> **Conclusión ejecutiva:** gran parte de los P0/P1 originales sí fue implementada, pero este artefacto **no debe desplegarse todavía**. Existen regresiones nuevas que requieren corrección inmediata.

---

# 1. Estado global

## Resultado

| Área | Estado |
|---|---|
| Encuestas privadas | ✅ Corregido |
| `registration_mode` eventos | ✅ Corregido |
| Bootstrap administrador | ✅ Corregido |
| Session fixation | ✅ Implementado / 🟡 test insuficiente |
| Supabase fail-closed | ✅ Lógica implementada / 🔴 duplicada |
| Flyway validation | ✅ Config corregida / 🟡 gate débil |
| LOGRADO | ✅ Corregido |
| Alias canónicos | ✅ Corregido |
| Multipart | ✅ Corregido |
| Timeouts RestClient | ✅ Corregido |
| Timeout de sesión | ✅ Corregido |
| Logout cookie configurable | ✅ Corregido |
| Rate limit login | 🟡 Parcial |
| Spring Boot soportado | 🔴 Pendiente |
| Duplicación de beans | 🔴 Regresión nueva |
| Gestión de secretos | 🔴 Regresión nueva |
| Notificaciones de postulaciones | 🔴 Requiere endurecimiento |
| Structured logging | 🟡 Pendiente |
| CI/SAST/SCA/SBOM | 🟡 Pendiente |
| Refactor arquitectura P2 | 🟡 Pendiente |

---

# 2. Hallazgos bloqueantes

## CR-01 — Beans Spring duplicados con el mismo nombre por defecto

### Severidad

**CRÍTICA — Bloqueante de despliegue**

### Archivos

Existen dos clases activas llamadas:

```text
SupabaseConfigurationValidator
```

en:

```text
src/main/java/pe/edu/upt/fuerzaupt/media/config/SupabaseConfigurationValidator.java
src/main/java/pe/edu/upt/fuerzaupt/media/service/SupabaseConfigurationValidator.java
```

Ambas contienen:

```java
@Component
public class SupabaseConfigurationValidator
```

También existen dos:

```text
SecurityCleanupJob
```

en:

```text
src/main/java/pe/edu/upt/fuerzaupt/security/SecurityCleanupJob.java
src/main/java/pe/edu/upt/fuerzaupt/security/job/SecurityCleanupJob.java
```

Ambas contienen:

```java
@Component
public class SecurityCleanupJob
```

`FuerzaUptApiApplication` usa:

```java
@SpringBootApplication
```

por lo que escanea todos los paquetes debajo de:

```text
pe.edu.upt.fuerzaupt
```

Spring genera por defecto el bean name usando el nombre simple de la clase:

```text
supabaseConfigurationValidator
securityCleanupJob
```

Por tanto, los componentes chocan entre sí.

### Impacto

El `ApplicationContext` puede fallar durante component scanning por conflicto de nombres.

Los 42 tests actuales no detectan esto porque no existe un test de arranque completo con:

```java
@SpringBootTest
```

### Remediación inmediata

Mantener solo una implementación de cada componente.

Recomendación:

```text
MANTENER:
media/config/SupabaseConfigurationValidator.java

ELIMINAR:
media/service/SupabaseConfigurationValidator.java
```

y:

```text
MANTENER:
security/job/SecurityCleanupJob.java

ELIMINAR:
security/SecurityCleanupJob.java
```

Luego ajustar el test del validator al paquete definitivo.

### Test obligatorio

Crear:

```java
@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest {

    @Test
    void contextLoads() {
    }
}
```

Este test debe ser parte obligatoria del build.

### Criterio de aceptación

- [ ] Existe un solo `SupabaseConfigurationValidator`.
- [ ] Existe un solo `SecurityCleanupJob`.
- [ ] `ApplicationContextTest` inicia Spring.
- [ ] El backend arranca con perfil local/test.
- [ ] El backend arranca con configuración válida de production.

---

## CR-02 — El ZIP contiene `.env` con secretos configurados

### Severidad

**ALTA**  
**CRÍTICA si el ZIP fue enviado a terceros, subido a almacenamiento público o distribuido fuera del equipo.**

### Evidencia

El artefacto contiene:

```text
.env
```

y en él hay valores no vacíos para credenciales/secretos sensibles, entre ellos:

```text
DB_USERNAME
DB_PASSWORD
APP_ADMIN_PASSWORD
REVALIDATION_SECRET
PRIVACY_HMAC_SECRET
GOOGLE_CLIENT_SECRET
```

No se reproducen valores en este reporte.

Puntos positivos:

```text
.gitignore -> excluye .env
.dockerignore -> excluye .env
```

Sin embargo, la rutina utilizada para crear el ZIP no respetó esas exclusiones.

### Riesgo

Quien recibe el ZIP puede obtener credenciales de:

- PostgreSQL;
- administrador;
- OAuth Google;
- HMAC de privacidad;
- endpoint de revalidación.

### Acción inmediata

Rotar:

```text
DB_PASSWORD
APP_ADMIN_PASSWORD
REVALIDATION_SECRET
PRIVACY_HMAC_SECRET
GOOGLE_CLIENT_SECRET
```

Si cualquier otro token real fue incorporado después, rotarlo también.

### Packaging seguro

Nunca hacer:

```text
zip -r backend.zip .
```

sin exclusiones.

Crear un script de release que incluya solo:

```text
pom.xml
mvnw
mvnw.cmd
.mvn/
src/
Dockerfile
.env.example
README / documentación requerida
```

y excluya:

```text
.env
*.log
boot_*.txt
backend-*.log
target/
.idea/
.git/
```

### Criterio de aceptación

- [ ] Los secretos expuestos fueron rotados.
- [ ] `.env` no aparece en próximos ZIPs.
- [ ] CI ejecuta secret scanning.
- [ ] El artefacto de release se genera mediante allowlist.

---

# 3. Hallazgos de seguridad altos

## H-01 — Spring Boot 3.3.12 continúa pendiente

### Estado

**ABIERTO**

### Evidencia

`pom.xml`:

```xml
<version>3.3.12</version>
```

La actualización desde `3.3.0` a `3.3.12` fue un avance, pero no resuelve el problema de ciclo de soporte.

La rama 3.3 ya no es una línea OSS vigente.

Además, CVE-2026-40973 afecta:

```text
Spring Boot 3.3.0 – 3.3.18
```

por lo que `3.3.12` pertenece explícitamente al rango afectado.

### Recomendación

No seguir parchando sobre 3.3.x como estrategia permanente.

Preferencia:

```text
Spring Boot 4.1.x
```

con pruebas completas.

Si se necesita un salto intermedio:

```text
3.5.16
```

puede utilizarse únicamente como puente de migración, teniendo en cuenta que fue la última release OSS de 3.5.x.

### Criterio de aceptación

- [ ] `pom.xml` deja 3.3.x.
- [ ] Se ejecuta `mvn dependency:tree`.
- [ ] Se ejecuta SCA.
- [ ] Spring Security queda en una versión corregida.
- [ ] OAuth2, Session JDBC, Flyway y springdoc pasan regresión.
- [ ] Tests de integración pasan.

---

## H-02 — Rate limiting de login sigue siendo unidimensional

### Estado

**PARCIAL**

### Implementado correctamente

`AuthController` ya protege la clave mediante HMAC:

```java
String attemptKey =
    privacyHashService.hash(
        clientIp + "|" + normalizedEmail,
        "login-attempt"
    );
```

Esto corrige la exposición de:

```text
IP + email
```

en claro.

### Pendiente

Se utiliza únicamente:

```text
IP + cuenta
```

No existen límites independientes por:

```text
IP
cuenta
IP + cuenta
```

### Riesgo

Un atacante distribuido puede probar la misma cuenta desde distintas IPs.

Cada IP obtiene su propia ventana de 5 intentos.

Esto permite ampliar considerablemente el número de intentos contra una cuenta administrativa.

### Solución

Calcular tres claves:

```java
String ipKey =
    privacyHashService.hash(clientIp, "login-ip");

String accountKey =
    privacyHashService.hash(normalizedEmail, "login-account");

String combinationKey =
    privacyHashService.hash(
        clientIp + "|" + normalizedEmail,
        "login-combination"
    );
```

Aplicar límites independientes.

Ejemplo inicial:

```text
IP + cuenta: 5 / 15 minutos
cuenta:      10 / 30 minutos
IP:          30 / 15 minutos
```

### Criterio de aceptación

- [ ] Existe límite por IP.
- [ ] Existe límite por cuenta.
- [ ] Existe límite por combinación.
- [ ] Todos los identificadores persistidos están protegidos con HMAC.
- [ ] Hay test de ataque distribuido contra una cuenta.

---

## H-03 — Notificaciones de postulaciones: PII, fallback externo y configuración insegura

### Archivos

```text
submission/service/EmailNotificationService.java
application.yml
```

### Problema 1 — Correo personal como default

Actualmente:

```yaml
spring:
  mail:
    username: ${SPRING_MAIL_USERNAME:miltomh22@gmail.com}
```

y:

```yaml
app:
  notification:
    team-emails: ${TEAM_NOTIFICATION_EMAILS:miltomh22@gmail.com}
```

Si producción olvida configurar las variables, datos de postulantes pueden enviarse a un correo personal por defecto.

### Problema 2 — Envío automático a tercero

Si SMTP falla, el servicio envía datos de postulantes a:

```text
formsubmit.co
```

La información enviada incluye:

```text
nombre
correo
motivación/datos de postulación
```

Este fallback debe ser una decisión explícita de arquitectura y privacidad, no un comportamiento automático.

### Problema 3 — `@Async` no está habilitado

El método tiene:

```java
@Async
```

pero no existe:

```java
@EnableAsync
```

en el proyecto.

Por tanto, el envío puede ejecutarse de forma síncrona durante el request público.

Esto mantiene abierta la transacción mientras ocurren llamadas de red.

### Problema 4 — SMTP sin timeouts explícitos

Los timeouts añadidos mediante `RestClientCustomizer` no configuran JavaMail.

Configurar:

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          connectiontimeout: 5000
          timeout: 10000
          writetimeout: 10000
```

### Problema 5 — HTML generado con input sin escapar

El template reemplaza directamente:

```java
fullName
email
motivation
```

dentro de HTML.

Un usuario podría introducir markup HTML dentro de una postulación.

Aunque muchos clientes de correo aplican sanitización, esto permite manipular visualmente el contenido del email.

Usar:

```java
HtmlUtils.htmlEscape(...)
```

antes de interpolar texto.

### Recomendación

- Quitar defaults personales.
- Hacer obligatoria la configuración en production.
- Eliminar FormSubmit o hacerlo opt-in:
  ```text
  APP_NOTIFICATION_FORMSUBMIT_ENABLED=false
  ```
- Añadir `@EnableAsync` o, preferiblemente, un patrón outbox/queue.
- Añadir timeouts SMTP.
- Escapar HTML.
- No loguear datos personales completos.

### Criterio de aceptación

- [ ] Ningún email personal está hardcodeado como fallback operativo.
- [ ] FormSubmit está eliminado o desactivado por defecto.
- [ ] Las notificaciones no bloquean la transacción HTTP.
- [ ] JavaMail tiene timeouts.
- [ ] Inputs se escapan en HTML.
- [ ] Logs no incluyen PII innecesaria.

---

# 4. P0/P1 originales — Validación punto por punto

## Encuestas privadas

### Estado

✅ **CERRADO**

`PollService` contiene:

```java
if (!poll.getAllowAnonymous() && !hasAuthenticatedUser(authentication)) {
    throw new AccessDeniedException(...);
}
```

y:

```java
authentication.getPrincipal() instanceof CustomUserDetails
```

Esto corrige el bypass original basado únicamente en:

```java
isAuthenticated()
```

### Mejora menor

El walkthrough decía que se comprobaba también:

```text
ID de usuario no nulo
```

pero el helper actual no verifica:

```java
principal.getId() != null
```

Se recomienda:

```java
private boolean hasAuthenticatedUser(Authentication authentication) {
    return authentication != null
            && authentication.isAuthenticated()
            && authentication.getPrincipal() instanceof CustomUserDetails principal
            && principal.getId() != null;
}
```

No considero esto un bypass actual si los principals productivos siempre se construyen desde usuarios persistidos, pero alinea código y requisito.

---

## RegistrationMode de eventos

### Estado

✅ **CERRADO**

`Event` contiene:

```java
@Enumerated(EnumType.STRING)
@Column(name = "registration_mode", nullable = false)
private RegistrationMode registrationMode = RegistrationMode.NONE;
```

y:

```java
enum RegistrationMode {
    NONE,
    INTERNAL,
    EXTERNAL
}
```

`AdminContentService` centraliza:

```java
applyRegistrationMode(...)
```

y `PublicSubmissionController` exige:

```java
RegistrationMode.INTERNAL
registrationEnabled == true
eventStatus == REGISTRATION_OPEN
```

La corrección es consistente con las restricciones PostgreSQL.

---

## Bootstrap administrador

### Estado

✅ **CERRADO**

Se verificó:

```java
app.admin.bootstrap-enabled=false
```

por defecto.

Usuario existente:

```java
if (existingUser.isPresent()) {
    return;
}
```

No se reactiva ni se cambia contraseña.

Existe control básico de passwords placeholder.

---

## Session fixation

### Implementación

✅ **CERRADA EN CÓDIGO**

Existe:

```java
ChangeSessionIdAuthenticationStrategy
```

y el login llama:

```java
sessionAuthenticationStrategy.onAuthentication(...)
```

OAuth también ejecuta:

```java
request.changeSessionId();
```

### Cobertura

🟡 **PARCIAL**

El test actual mockea:

```java
SessionAuthenticationStrategy
```

y solo verifica que el método fue llamado.

No demuestra realmente:

```text
sessionId anterior != sessionId posterior
```

Crear un test con estrategia real o integración MockMvc.

---

## Supabase fail-closed

### Estado lógico

✅ **CORREGIDO**

El validator falla en `production` si:

```text
url vacío
service-role-key vacío
```

### Estado estructural

🔴 **NO CERRADO**

Existe duplicado del mismo componente.

Corregir CR-01.

---

## Flyway

### Configuración

✅ **CORREGIDA**

Ya no existe:

```yaml
ignore-migration-patterns: "*:missing"
```

y permanece:

```yaml
validate-on-migrate: true
baseline-on-migrate: false
```

### Test

🟡 **DÉBIL**

`FlywayMigrationIntegrationTest` hace:

```java
if (!dockerAvailable) {
    return;
}
```

Por tanto el test figura como aprobado incluso cuando nunca ejecutó una migración.

Además, el nombre dice:

```text
V1 to V26
```

aunque ya existen migraciones hasta:

```text
V29
```

### Corrección

En CI:

```text
Docker/Testcontainers obligatorio
```

Si Docker no existe, marcar el gate como:

```text
FAILED
```

o separar:

```text
unit-test
integration-test
```

y exigir ambos jobs antes de merge.

---

## LOGRADO

✅ **CERRADO**

Se corrigió la comparación de tipos.

Actualmente:

```java
"LOGRADO".equals(item.getProgress())
```

y obliga `result`.

---

## Alias de módulos

✅ **CERRADO**

Existe:

```text
AdminModule
```

con alias:

```text
projects / proyectos
opportunities / oportunidades
events / eventos
```

`CacheInvalidationService` canonicaliza antes de invalidar.

---

## Multipart

✅ **CERRADO**

Configurado:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 12MB
```

---

## Timeouts RestClient

✅ **CERRADO**

Existe:

```text
HttpClientConfig
```

con:

```text
connect: 5 s
read: 15 s
```

Esto aplica a los `RestClient.Builder` gestionados por Spring.

No cubre JavaMail; ver H-03.

---

## Security cleanup

### Lógica

✅ **IMPLEMENTADA**

Existe purga de:

```text
login_attempts
request_rate_limits
```

### Estado

🔴 **DUPLICADA**

Existen dos `SecurityCleanupJob`.

Resolver CR-01.

---

## Timeout de sesión

✅ **CERRADO**

Ahora:

```yaml
server:
  servlet:
    session:
      timeout: 30m
```

---

## Logout cookie

✅ **CERRADO**

`AuthController` lee:

```java
@Value("${server.servlet.session.cookie.name:FUERZA_UPT_SESSION}")
```

y ya no depende únicamente de una constante hardcodeada.

---

# 5. Calidad de las 42 pruebas

Se encontraron exactamente:

```text
42 métodos @Test
16 archivos de test
```

Esto coincide con el walkthrough.

Sin embargo, en esta auditoría **no fue posible volver a ejecutar Maven**, porque Maven Wrapper intentó descargar Maven desde Maven Central y el entorno de revisión no tuvo acceso de red al artefacto.

Por tanto:

```text
42 @Test encontrados = verificado
BUILD SUCCESS actual = no reproducido en este entorno
```

## Problemas de cobertura detectados

### 1. No hay `@SpringBootTest`

Esto permitió que los componentes duplicados no fueran detectados.

Añadir inmediatamente:

```text
ApplicationContextTest
```

### 2. Session fixation es un test de interacción

Verifica:

```text
onAuthentication() fue llamado
```

pero no:

```text
session ID realmente cambió
```

### 3. Flyway puede pasar sin ejecutar

El test hace `return` cuando Docker no existe.

Esto produce un falso verde.

### 4. Encuestas

Existen tests para:

```text
sin authentication
AnonymousAuthenticationToken
```

Falta al menos:

```text
CustomUserDetails válido -> continúa
CustomUserDetails con ID null -> rechazo
```

### 5. Falta matriz completa de SecurityConfig

Crear tests de:

```text
/api/admin/**
/api/media/**
/actuator/prometheus
/api/auth/me
/api/auth/logout
CSRF
CORS
```

---

# 6. Pendientes P2 de arquitectura

## AdminContentService

Sigue teniendo aproximadamente:

```text
745 líneas
```

Todavía concentra múltiples dominios.

Estado:

🟡 **ABIERTO**

Refactor recomendado:

```text
EventAdminService
RepresentationAdminService
OpportunityAdminService
StatisticAdminService
AdminContentCoordinator
```

---

## PublicSubmissionController

Sigue teniendo aproximadamente:

```text
280 líneas
```

y contiene:

```text
reglas de negocio
repositorios
rate limiting
transacciones
notificaciones
validación de capacidad
```

Estado:

🟡 **ABIERTO**

Extraer:

```text
ContactSubmissionService
StudentProposalSubmissionService
TeamApplicationSubmissionService
NewsletterSubscriptionService
EventRegistrationService
```

---

## Structured logging

`logback-spring.xml` todavía genera JSON manual mediante:

```xml
<pattern>{...}</pattern>
```

Estado:

🟡 **ABIERTO**

El escape actual no cubre de forma robusta todos los caracteres JSON.

Migrar a structured logging nativo en la versión nueva de Spring Boot o encoder JSON mantenido.

---

## Docker reproducible

Docker sigue usando tags:

```dockerfile
eclipse-temurin:17-jdk-alpine
eclipse-temurin:17-jre-alpine
```

sin digest.

Estado:

🟡 **ABIERTO**

Fijar:

```text
@sha256:<digest>
```

y automatizar actualizaciones.

---

## CI / supply-chain security

No se encontró:

```text
.github/workflows
Dependabot
Renovate
SAST
SCA
SBOM
Gitleaks
CodeQL
```

Estado:

🟡 **ABIERTO**

Pipeline mínimo:

```text
mvn verify
integration tests
dependency scan
secret scan
SAST
SBOM
container scan
```

---

## Código legacy `noticias`

Persisten referencias:

```text
/api/noticias/**
```

en SecurityConfig y filtros de caché aunque V28 elimina el módulo.

Estado:

🟡 **ABIERTO**

Eliminar referencias o documentar compatibilidad temporal.

---

# 7. Otros endurecimientos recomendados

## PrivacyHashService fail-fast

Actualmente el secreto mínimo se valida en:

```java
hash(...)
```

no al arrancar.

Si falta:

```text
PRIVACY_HMAC_SECRET
```

la aplicación puede iniciar y fallar en el primer request que necesite HMAC.

Validar en constructor/PostConstruct:

```java
if (secret.length() < 32) {
    throw new IllegalStateException(...);
}
```

especialmente en production.

---

## Error responses

`RequestIdFilter` devuelve:

```text
X-Request-ID
```

pero `ApiErrorResponse` no contiene `requestId`.

No es vulnerabilidad, pero dificulta soporte y correlación.

Añadirlo al cuerpo de error.

---

## Auditoría y PII

`AuditLogService` guarda:

```text
IP en claro
user agent
email en before/after de algunas operaciones
```

Definir política de retención.

Si el objetivo de privacidad es minimizar identificadores, considerar HMAC también para IP de auditoría o justificar explícitamente su conservación.

---

# 8. Orden de corrección recomendado

## Bloqueante — antes de cualquier nuevo deploy

1. [ ] Eliminar beans duplicados.
2. [ ] Añadir `ApplicationContextTest`.
3. [ ] Rotar secretos del `.env` incluido en el ZIP.
4. [ ] Generar un nuevo artefacto sin `.env`.
5. [ ] Migrar fuera de Spring Boot 3.3.x.
6. [ ] Reejecutar test + arranque real.

## Inmediatamente después

7. [ ] Rate limit por IP + cuenta + combinación.
8. [ ] Eliminar defaults personales de email.
9. [ ] Desactivar/eliminar fallback FormSubmit.
10. [ ] Habilitar async real o outbox.
11. [ ] Añadir timeouts SMTP.
12. [ ] Escapar HTML de postulaciones.
13. [ ] Hacer Testcontainers obligatorio en CI.

## Próximo sprint

14. [ ] Structured logging.
15. [ ] CI/SAST/SCA/SBOM/secret scan.
16. [ ] Docker por digest.
17. [ ] Refactor `AdminContentService`.
18. [ ] Refactor `PublicSubmissionController`.
19. [ ] Eliminar `noticias` legacy.
20. [ ] Mejorar requestId y retención de auditoría.

---

# 9. Comandos de verificación recomendados

Después de las correcciones:

```bash
./mvnw clean verify
```

Después:

```bash
./mvnw dependency:tree
```

Buscar duplicados:

```bash
find src/main/java -name '*.java' -printf '%f\n' \
  | sort \
  | uniq -d
```

Buscar `.env` en artefactos:

```bash
zipinfo backend-release.zip | grep -E '(^|/)\.env$'
```

El resultado debe ser vacío.

Buscar secrets accidentalmente incluidos:

```bash
gitleaks detect
```

Arranque de contexto:

```bash
./mvnw -Dtest=ApplicationContextTest test
```

Migraciones:

```bash
./mvnw -Dtest=FlywayMigrationIntegrationTest test
```

En CI Docker debe estar disponible.

---

# 10. Veredicto final

## ¿Los P0/P1 originales mejoraron?

**Sí.**

La implementación corregida demuestra mejoras reales en:

```text
autorización de encuestas
integridad de eventos
bootstrap admin
session fixation
Supabase production validation
Flyway
LOGRADO
canonicalización
multipart
timeouts
sesiones
logout
privacidad HMAC
```

## ¿La remediación puede darse por cerrada?

**No todavía.**

Los motivos principales son:

```text
1. beans @Component duplicados
2. secretos reales incluidos en el ZIP
3. Spring Boot 3.3.12 sigue fuera del objetivo de seguridad
4. rate limiting de login solo IP+cuenta
5. notificaciones públicas con defaults personales/fallback tercero
6. tests que permiten falsos verdes
```

## Clasificación actual

```text
P0/P1 original: aproximadamente 75–80 % cerrado técnicamente
Seguridad de despliegue actual: NO APROBADA
Arquitectura: PARCIAL
Calidad de pruebas: MEJORADA, pero aún insuficiente como gate de release
```

---

# 11. Gate para aprobar producción

El backend puede pasar a estado:

```text
APROBADO PARA STAGING
```

cuando:

- [ ] no existan beans duplicados;
- [ ] el contexto Spring inicie;
- [ ] el ZIP no contenga secretos;
- [ ] los secretos expuestos estén rotados;
- [ ] Spring Boot ya no sea 3.3.x;
- [ ] `mvn clean verify` pase;
- [ ] Testcontainers ejecute realmente todas las migraciones;
- [ ] rate limiting proteja cuenta e IP;
- [ ] notificaciones no tengan fallback inseguro.

Y puede pasar a:

```text
APROBADO PARA PRODUCCIÓN
```

después de:

- [ ] smoke tests en staging;
- [ ] SCA sin vulnerabilidades altas no aceptadas;
- [ ] secret scan limpio;
- [ ] prueba real de login/logout/OAuth;
- [ ] prueba real de eventos y encuestas;
- [ ] revisión final de variables de producción;
- [ ] backup y rollback preparados.

