# Plan de subsanación integral — Backend Fuerza UPT
## Estado posterior a la auditoría arquitectónica

**Proyecto:** Fuerza UPT Backend  
**Fecha:** 12 de agosto de 2026  
**Objetivo:** corregir todos los puntos débiles detectados en la última auditoría antes de continuar con desarrollo funcional normal.

---

# 0. Regla de trabajo para Antigravity

Durante esta remediación:

```text
NO crear tests.
NO modificar tests salvo que sea estrictamente para eliminar residuos obsoletos.
NO ejecutar tests automáticamente.
NO introducir JDBC.
NO introducir Flyway.
NO introducir Liquibase.
NO usar ddl-auto=update.
NO crear microservicios.
NO crear arquitectura paralela.
NO reintroducir noticias.
```

Sí debe:

```text
analizar
modificar código
compilar con tests omitidos
hacer validación estática
actualizar schema-final.sql
entregar DDL manual cuando cambie PostgreSQL
respetar las Skills y Rules instaladas
```

Comando de compilación permitido:

```bash
mvnw.cmd -DskipTests compile
```

o:

```bash
./mvnw -DskipTests compile
```

---

# 1. Orden obligatorio de implementación

No implementar todo en un único cambio.

El orden recomendado es:

## FASE A — BLOQUEANTES

1. [ ] Eliminar endpoints públicos duplicados de proyectos.
2. [ ] Definir `project/` como implementación canónica.
3. [ ] Reconstruir `database/schema-final.sql`.
4. [ ] Alinear completamente esquema PostgreSQL ↔ entidades JPA.
5. [ ] Añadir seeds operativos necesarios al schema final.
6. [ ] Corregir race condition de creación en rate limiters JPA.

## FASE B — LIMPIEZA ARQUITECTÓNICA

7. [ ] Eliminar residuos de Flyway/migraciones.
8. [ ] Eliminar campos `migrationStatus`, `originalSource` y similares.
9. [ ] Eliminar referencias al módulo `noticias`.
10. [ ] Eliminar scripts generadores antiguos.
11. [ ] Eliminar logs del artefacto del proyecto.
12. [ ] Unificar concepto `AdminModule`.
13. [ ] Reducir progresivamente `AdminContentService`.

## FASE C — SEGURIDAD Y OPERACIÓN

14. [ ] Limpiar PII innecesaria en logs OAuth.
15. [ ] Documentar que las sesiones actuales son in-memory.
16. [ ] Definir condición futura para introducir Redis.
17. [ ] Revisar packaging seguro.
18. [ ] Mantener gate “cero JDBC explícito”.

## FASE D — FRAMEWORK

19. [ ] Actualizar Spring Boot en un PR independiente.
20. [ ] Volver a compilar y hacer validación manual.

---

# 2. P0 — Eliminar endpoints públicos duplicados de proyectos

## Problema

Actualmente existen dos implementaciones públicas para las mismas rutas:

```text
GET /api/proyectos
GET /api/proyectos/{slug}
```

Una implementación está en:

```text
content/controller/PublicContentController.java
```

y otra en:

```text
project/controller/PublicProjectController.java
```

Esto puede provocar:

```text
Ambiguous mapping
```

durante el arranque de Spring.

Además, demuestra que conviven dos arquitecturas para el mismo dominio.

---

# 3. Decisión arquitectónica

La implementación canónica debe ser:

```text
project/
```

Por tanto:

```text
PublicProjectController
ProjectAdminService
ProjectRepository
Project
Project DTOs
```

son la fuente de verdad del módulo proyectos.

La lógica genérica antigua en:

```text
content/
admin/
```

debe dejar de administrar proyectos.

---

# 4. Acción exacta

En:

```text
PublicContentController.java
```

eliminar exclusivamente los mappings relacionados con proyectos.

Eliminar:

```text
GET /api/proyectos
GET /api/proyectos/{slug}
```

y cualquier método privado utilizado únicamente por esos endpoints.

No eliminar todavía el controller completo si sigue sirviendo:

```text
events
opportunities
representation
statistics
```

u otros módulos todavía no extraídos.

---

# 5. Verificación estática de rutas

Después del cambio buscar:

```bash
grep -Rni 'api/proyectos' src/main/java
```

Debe existir una sola implementación pública canónica.

También buscar:

```bash
grep -Rni '@RequestMapping\|@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping' src/main/java
```

y revisar mappings duplicados.

---

# 6. Criterio de terminado — proyectos

- [ ] Existe un solo handler para `GET /api/proyectos`.
- [ ] Existe un solo handler para `GET /api/proyectos/{slug}`.
- [ ] `PublicProjectController` es canónico.
- [ ] `PublicContentController` ya no administra proyectos.
- [ ] No se introdujo arquitectura paralela.

---

# 7. P0 — Reconstruir `database/schema-final.sql`

## Problema

El esquema actual no representa fielmente las entidades JPA.

El proyecto utiliza:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

Esto debe mantenerse.

Sin embargo, `schema-final.sql` contiene nombres y tipos de una versión anterior.

---

# 8. Ejemplo crítico — User

JPA espera columnas como:

```text
display_name
enabled
last_login_at
```

pero el schema actual contiene conceptos como:

```text
full_name
is_active
```

y faltan propiedades nuevas.

El schema debe alinearse a:

```text
auth/entity/User.java
```

sin adaptar la entidad al SQL viejo.

La entidad actual es la fuente de verdad del modelo Java.

---

# 9. Ejemplo crítico — CacheInvalidationEvent

Se detectó una incompatibilidad entre:

```text
JPA:
Long id
created_at
```

y:

```text
schema:
UUID id
invalidated_at
```

No se debe mantener esta diferencia.

El schema final debe reflejar exactamente:

```text
tipo de PK
nombre de columna
nullable
foreign keys
índices
```

de la entidad vigente.

---

# 10. Ejemplo crítico — Event

Revisar particularmente:

```text
category
start_date
end_date
event_time
modality
organizer
event_status
project_id
registration_mode
registration_enabled
registration_url
capacity
```

No conservar columnas antiguas solo porque existieron previamente.

---

# 11. Ejemplo crítico — MediaAsset

Alinear nombres actuales como:

```text
file_name
original_name
content_type
size_bytes
url
is_private
uploaded_by
```

con la entidad real.

No mantener simultáneamente:

```text
file_path
public_url
mime_type
file_size_bytes
original_filename
is_public
```

si ya no son parte del modelo actual.

---

# 12. Módulos que deben auditarse uno por uno contra el schema

Comparar todas las entidades JPA de:

```text
auth
project
event
opportunity
representation
team
poll
submission
media
settings
cache
audit
statistics
```

con:

```text
database/schema-final.sql
```

---

# 13. Procedimiento de reconciliación del schema

Para cada `@Entity`:

1. Identificar:
   - `@Table`
   - `@Id`
   - `@Column`
   - `@JoinColumn`
   - `@Enumerated`
   - `@Version`
   - relaciones
   - nullability.

2. Comparar con PostgreSQL.

3. Corregir `schema-final.sql`.

4. No modificar la entidad para hacerla coincidir artificialmente con SQL legacy.

5. No usar `ddl-auto=update`.

---

# 14. PostgreSQL como objetivo

El schema debe ser PostgreSQL real.

Evitar tipos genéricos pensados para H2.

Usar según corresponda:

```text
UUID
BIGINT
BIGSERIAL
BOOLEAN
VARCHAR
TEXT
DATE
TIME
TIMESTAMPTZ
INTEGER
JSONB
```

según el mapping real.

---

# 15. Constraints que deben recuperarse

El schema final actual está flojo en integridad.

Revisar y agregar cuando corresponda:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
CHECK
NOT NULL
ON DELETE
```

Ejemplos:

```text
email único
role name único
OAuth provider + subject único
slug único donde aplique
registration_mode válido
poll status válido
project status válido
```

No depender solo de validaciones Java.

---

# 16. Índices

Recrear índices necesarios para consultas frecuentes.

Priorizar:

```text
email
slug
status
published
created_at
project_id
event_id
user_id
provider + subject
rate limit keys
poll slug
```

No crear índices indiscriminadamente.

Cada índice debe corresponder a una consulta real del repository/service.

---

# 17. Seeds operativos

El schema final debe permitir que una BD nueva sea utilizable.

Añadir como mínimo los datos que el código presupone que existen.

Por ejemplo:

```text
ROLE ADMIN
ROLE USER
```

si `RoleRepository.findByName("ADMIN")` depende de ello.

También revisar:

```text
site_settings
```

si el servicio espera un singleton inicial.

---

# 18. No crear seeds de usuarios administrativos

No insertar passwords ni usuarios admin en `schema-final.sql`.

El usuario administrativo debe seguir creándose por:

```text
AdminBootstrapRunner
```

cuando esté explícitamente habilitado.

---

# 19. DDL operativo

Cuando Antigravity modifique una entidad durante esta subsanación debe entregar también:

```text
DDL exacto que el usuario aplicará manualmente
```

Ejemplo:

```sql
ALTER TABLE users
    ADD COLUMN last_login_at TIMESTAMPTZ;
```

Pero no crear:

```text
V30__
migration.sql
Flyway
Liquibase
```

---

# 20. Fuente de verdad del schema

Orden recomendado de confianza:

```text
1. entidades JPA actuales
2. estructura real de PostgreSQL/Supabase productiva
3. repositories y consultas actuales
4. schema-final.sql
```

`schema-final.sql` debe ser corregido para representar los tres primeros.

---

# 21. Criterio de terminado — schema

- [ ] Cada entidad tiene su tabla correcta.
- [ ] Cada columna JPA existe.
- [ ] Los tipos coinciden.
- [ ] Los enums se almacenan correctamente.
- [ ] Las PK coinciden.
- [ ] Las FK coinciden.
- [ ] Los nullable coinciden.
- [ ] Los `@Version` existen donde corresponda.
- [ ] Los uniques importantes existen.
- [ ] Los CHECK importantes existen.
- [ ] Los índices importantes existen.
- [ ] Roles base existen.
- [ ] Configuración singleton existe si es necesaria.
- [ ] No existen objetos eliminados.
- [ ] No existen tablas `SPRING_SESSION*` si ya no se usan.
- [ ] No existe `flyway_schema_history` dentro del schema final.

---

# 22. P0/P1 — Corregir race condition en LoginAttempt JPA

## Problema

El repository utiliza:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
```

lo cual protege correctamente filas existentes.

Pero una fila nueva no se puede bloquear.

Carrera:

```text
TX A -> find -> vacío
TX B -> find -> vacío

TX A -> INSERT
TX B -> INSERT misma PK
```

Una transacción puede fallar con conflicto de clave.

---

# 23. Solución sin JDBC

No volver a:

```text
INSERT ON CONFLICT
JdbcTemplate
native Connection
```

Mantener JPA.

Crear un componente de persistencia transaccional separado.

Arquitectura:

```text
LoginAttemptService
        ↓
LoginAttemptPersistenceService
        ↓
JpaRepository
```

---

# 24. LoginAttemptPersistenceService

Debe usar:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

para cada intento de consumo/actualización.

La lógica:

```text
buscar con lock
si existe -> actualizar
si no existe -> crear
guardar
flush
```

---

# 25. Retry limitado

En `LoginAttemptService`, si la creación falla únicamente por conflicto concurrente esperado:

```text
retry máximo 2 o 3 veces
```

Nunca retry infinito.

No capturar todas las excepciones.

Capturar únicamente las de persistencia/concurrencia que correspondan.

---

# 26. Rate limiter compartido

Aplicar exactamente la misma estrategia a:

```text
SharedRateLimitService
RequestRateLimit
```

porque tiene la misma carrera al crear una nueva clave.

---

# 27. Criterio de terminado — rate limit

- [ ] No hay JDBC.
- [ ] Filas existentes usan locking JPA.
- [ ] Filas nuevas manejan carrera.
- [ ] Retry es limitado.
- [ ] Retry abre una nueva transacción.
- [ ] No se producen errores 500 por carrera esperada.
- [ ] Las tres dimensiones de login siguen activas:
  - IP
  - cuenta
  - combinación.

---

# 28. Limpieza de `LoginAttemptService`

Eliminar parámetros y estructuras confusas.

Si existe:

```java
ensureAllowedWithLimit(String key, int maxAttempts)
```

y `maxAttempts` no se utiliza, corregir la firma.

No mantener parámetros muertos.

---

# 29. Eliminar clase privada `Collection`

Si existe una clase interna como:

```java
private static class Collection
```

utilizada para imitar:

```java
Collection.of(...)
```

eliminarla.

Usar:

```java
List.of(...)
```

directamente.

Esto evita conflicto conceptual con:

```java
java.util.Collection
```

---

# 30. P1 — Eliminar todos los residuos de Flyway

Flyway ya no forma parte de la arquitectura.

Por tanto el proyecto no debe continuar hablando de Flyway.

Buscar:

```bash
grep -Rni 'flyway' .
```

---

# 31. AdminBootstrapRunner

Si existe un mensaje como:

```text
Ensure Flyway migrations have run
```

cambiarlo.

Ejemplo:

```text
ADMIN role not found. Verify database/schema-final.sql and initial role seed.
```

---

# 32. Configuración

Eliminar configuraciones residuales como:

```yaml
spring:
  flyway:
    enabled: false
```

si Flyway ya no existe en dependencias.

No hace falta desactivar algo que ya no está instalado.

---

# 33. Código de migración residual

Eliminar cualquier:

```text
migration
migrated
migrationStatus
legacy migration helper
reconcile migration
```

que ya no tenga función activa.

---

# 34. `SchemaCompatibilityIntegrationTest`

Si este test existe únicamente para simular compatibilidad usando H2 y:

```text
ddl-auto=create-drop
```

no representa el `schema-final.sql`.

Dado que el proyecto ahora trabaja con validación manual y el usuario no desea desarrollo automático de tests:

```text
eliminar este test si quedó exclusivamente como residuo de la migración
```

No reemplazarlo por otro test.

---

# 35. Criterio de terminado — Flyway

```bash
grep -Rni 'flyway' src pom.xml
```

Resultado esperado:

```text
0 referencias activas
```

Excepciones permitidas:

```text
documentación histórica fuera del runtime
```

solo si el usuario decide conservarla.

---

# 36. P1 — Eliminar campos DTO de migración

Se detectaron campos como:

```text
originalSource
migrationStatus
```

en respuestas públicas.

Si siempre se responden:

```java
null
```

ya no tienen propósito.

---

# 37. Acción

Buscar:

```bash
grep -Rni 'migrationStatus\|originalSource' src/main/java
```

Eliminar de:

```text
DTOs
records
mappers
services
controllers
```

cuando no tengan uso real actual.

No mantener compatibilidad fantasma indefinidamente.

---

# 38. Compatibilidad frontend

Antes de eliminar un campo de una respuesta pública:

```text
buscar si el frontend actual lo consume
```

Si no existe consumo:

```text
eliminar
```

Si existe consumo:

```text
actualizar frontend y backend en el mismo cambio funcional
```

---

# 39. P1 — Eliminar módulo `noticias` definitivamente

El producto actual ya no usa ese módulo.

Buscar:

```bash
grep -Rni 'noticias\|news' src/main/java src/main/resources
```

---

# 40. Lugares detectados previamente

Revisar especialmente:

```text
SecurityConfig
PublicEtagFilter
PublicCacheHeadersFilter
AdminModuleController
```

Eliminar mappings como:

```text
/api/noticias/**
```

y aliases:

```text
noticias
news
```

---

# 41. No confundir librerías con dominio

No eliminar palabras como:

```text
newsletter
```

solo porque contienen `news`.

Revisar resultados manualmente.

El objetivo es eliminar el dominio:

```text
noticias / news articles
```

no funcionalidades distintas.

---

# 42. Criterio de terminado — noticias

- [ ] No hay controller.
- [ ] No hay service.
- [ ] No hay repository.
- [ ] No hay security mapping.
- [ ] No hay cache mapping.
- [ ] No hay alias admin.
- [ ] No hay tabla en schema-final.
- [ ] No hay DTO legacy.

---

# 43. P1 — Eliminar scripts generadores antiguos

Se detectaron scripts como:

```text
generate_backend.ps1
generate_service.ps1
```

que pueden volver a generar código con patrones antiguos.

Esto es especialmente peligroso con Antigravity.

---

# 44. Acción

Si ya no forman parte del proceso oficial:

```text
DELETE generate_backend.ps1
DELETE generate_service.ps1
```

y cualquier generador antiguo equivalente.

---

# 45. Motivo

Un agente puede interpretar esos archivos como:

```text
patrón de referencia válido
```

y reconstruir:

```text
controllers duplicados
services genéricos
arquitectura vieja
```

---

# 46. Si se necesita generación futura

Crear un generador nuevo únicamente si realmente aporta valor.

Debe generar:

```text
feature/
controller/
dto/
entity/
repository/
service/
```

y respetar las Skills instaladas.

No generar tests.

---

# 47. P1 — Limpiar logs del repositorio y ZIP

El ZIP auditado contiene:

```text
logs/backend.out.log
logs/backend.err.log
```

Esto no debe estar en una entrega de código.

---

# 48. Acción

Eliminar:

```text
logs/
*.log
backend.out.log
backend.err.log
```

del paquete distribuible.

No necesariamente hay que impedir logs en runtime; solo no deben formar parte del código fuente/ZIP.

---

# 49. `.gitignore`

Asegurar:

```gitignore
logs/
*.log
```

---

# 50. Packaging seguro

Crear o corregir:

```text
package-backend.ps1
```

con allowlist.

Incluir:

```text
pom.xml
mvnw
mvnw.cmd
.mvn/
src/
database/
Dockerfile
.gitignore
.dockerignore
.agents/
README
```

Excluir:

```text
.env
logs/
*.log
target/
.git/
.idea/
*.zip
scripts temporales
backups
```

---

# 51. Verificación del ZIP

El script debe comprobar automáticamente que no contiene:

```text
.env
*.log
target/
.git/
```

antes de darlo por válido.

---

# 52. P1 — PII en logs OAuth

Se detectaron logs que incluyen:

```text
email
Google subject/sub
```

para usuarios OAuth.

No hace falta almacenar esos datos en logs operacionales.

---

# 53. Acción

Cambiar:

```text
email=...
sub=...
```

por:

```text
userId
provider
operation
```

Ejemplo:

```java
log.info(
    "OAuth user provisioned: userId={}, provider={}",
    user.getId(),
    "google"
);
```

---

# 54. Prohibiciones de logging

Nunca registrar:

```text
password
cookie
session id completo
CSRF token
OAuth token
refresh token
Google subject
email completo salvo razón auditada
service role key
HMAC secret
DB credentials
```

---

# 55. P1/P2 — Unificar `AdminModule`

Actualmente existen conceptos duplicados de módulo.

Por un lado:

```text
AdminModule
```

y dentro de un servicio genérico puede existir:

```text
private enum Module
```

Esto debe converger.

---

# 56. Fuente de verdad

Mantener:

```text
AdminModule
```

como enum/objeto canónico.

Eliminar enums privados duplicados.

Todos los servicios genéricos restantes deben resolver mediante:

```text
AdminModule
```

hasta que sean retirados.

---

# 57. Alias

La resolución:

```text
projects / proyectos
events / eventos
opportunities / oportunidades
```

debe existir en un único lugar.

No duplicar maps de alias en:

```text
controller
service
cache
audit
```

---

# 58. P2 — Reducir `AdminContentService`

El servicio sigue siendo demasiado grande.

Aproximadamente:

```text
700+ líneas
```

y administra múltiples dominios.

No debe crecer más.

---

# 59. Regla inmediata

Desde este momento:

> No agregar funcionalidades nuevas dentro de `AdminContentService` cuando exista un módulo específico.

---

# 60. Orden de extracción

Extraer gradualmente:

```text
Project -> ya específico
Event
Opportunity
Representation
Statistics
```

---

# 61. Arquitectura objetivo

```text
event/
    controller/
    dto/
    entity/
    repository/
    service/EventAdminService.java

opportunity/
    controller/
    dto/
    entity/
    repository/
    service/OpportunityAdminService.java

representation/
    ...
```

---

# 62. Qué debe quedar en `admin/`

Solo preocupaciones transversales:

```text
dashboard
audit
cache invalidation
administración global
```

No CRUD de todos los dominios.

---

# 63. No refactor masivo

No borrar `AdminContentService` entero en un solo cambio.

Patrón:

```text
extraer feature
mover endpoints
actualizar llamadas
eliminar bloque viejo
compilar
continuar con siguiente feature
```

---

# 64. P2 — PublicSubmissionController

El controller sigue teniendo demasiadas responsabilidades.

Contiene combinaciones de:

```text
HTTP
rate limiting
persistencia
reglas
capacidad
notificaciones
transacciones
```

---

# 65. Refactor futuro

Extraer por caso de uso:

```text
ContactSubmissionService
StudentProposalSubmissionService
TeamApplicationSubmissionService
NewsletterSubscriptionService
EventRegistrationService
```

---

# 66. Regla

Controller:

```text
validar request HTTP
resolver datos básicos
delegar
construir response
```

Service:

```text
reglas de negocio
transacciones
repositories
rate limiting
notificación
```

---

# 67. Sesiones actuales

Al retirar Spring Session JDBC, el backend quedó usando sesiones del contenedor.

Esto es válido si existe:

```text
una sola instancia
```

---

# 68. Documentar restricción

Agregar documentación técnica:

```text
CURRENT_SESSION_MODE=SERVLET_IN_MEMORY
SUPPORTED_REPLICAS=1
```

No hace falta una variable real con esos nombres; el objetivo es documentarlo.

---

# 69. Cuándo introducir Redis

Redis solo será obligatorio cuando aparezca cualquiera de:

```text
2+ instancias backend
load balancer sin sticky sessions
autoscaling
necesidad de sobrevivir reinicios
sesión distribuida
```

---

# 70. No introducir Redis preventivamente

Mientras:

```text
1 instancia
carga moderada
operación simple
```

la sesión del contenedor es aceptable y reduce complejidad.

---

# 71. P2 — Actualizar Spring Boot

El proyecto sigue en una línea antigua del framework.

No hacer este cambio mezclado con:

```text
schema
rate limiter
refactor admin
```

---

# 72. PR independiente

Después de estabilizar arquitectura:

```text
1. elegir una línea de Spring Boot actualmente soportada
2. actualizar parent
3. revisar dependencias administradas
4. revisar Spring Security
5. revisar Spring Data JPA
6. revisar OAuth
7. revisar configuración de sesión
8. compilar
9. validación manual
```

---

# 73. Mantener Java 17 inicialmente

No mezclar necesariamente:

```text
upgrade Spring Boot
+
upgrade Java
```

en el mismo cambio.

Si la versión objetivo de Spring Boot soporta Java 17, mantenerlo durante el primer salto reduce variables.

---

# 74. Cero JDBC explícito — gate permanente

Este objetivo sí se alcanzó y debe protegerse.

Buscar:

```bash
grep -RniE 'JdbcTemplate|NamedParameterJdbcTemplate|JdbcClient|org\.springframework\.jdbc|java\.sql\.|RowMapper|ResultSet|DriverManager' src/main/java
```

Resultado esperado:

```text
0
```

---

# 75. Dependencia PostgreSQL permitida

No eliminar:

```xml
org.postgresql:postgresql
```

Hibernate/JPA necesita ese driver.

La regla es:

```text
cero JDBC explícito en código propio
```

no:

```text
cero infraestructura JDBC interna
```

---

# 76. Gate Flyway

Buscar:

```bash
grep -RniE 'Flyway|flyway|Liquibase|liquibase' src/main pom.xml
```

Resultado esperado:

```text
0
```

---

# 77. Gate legacy

Buscar:

```bash
grep -RniE 'migrationStatus|originalSource|noticias|legacy jdbc' src/main
```

Cada resultado debe ser revisado.

Objetivo final:

```text
sin residuos de migración
sin noticias
sin JDBC legacy
```

---

# 78. Gate rutas duplicadas

Antes de crear cualquier endpoint nuevo:

```text
buscar la ruta completa en src/main/java
```

No permitir:

```text
dos controllers con el mismo method + path
```

---

# 79. Gate schema

Cada vez que cambie:

```text
@Entity
@Column
@JoinColumn
@Table
@Enumerated
@Version
```

Antigravity debe:

```text
actualizar schema-final.sql
entregar DDL manual
```

---

# 80. Gate arquitectura

Toda funcionalidad nueva debe decidir primero su feature.

Ejemplo:

```text
event
project
opportunity
representation
team
poll
submission
media
settings
auth
```

Nunca crear:

```text
misc
common-business
generic-service
new-content
```

para lógica de dominio.

---

# 81. Gate controllers

No permitir controllers de cientos de líneas.

Si aparece lógica como:

```text
repository.save
capacity calculation
state transition
rate limit
notification
locking
```

moverla a service.

---

# 82. Gate services

Un service no debe administrar múltiples dominios independientes.

Si un service requiere:

```text
ProjectRepository
EventRepository
OpportunityRepository
RepresentationRepository
```

es una señal de que debe dividirse.

---

# 83. Gate repositories

Persistencia relacional:

```text
JpaRepository
Spring Data JPA
EntityManager solo con justificación
```

No crear DAO manual.

---

# 84. Gate seguridad

Al crear endpoint:

## Público lectura

Revisar:

```text
cache
ETag
CORS
```

## Público escritura

Revisar:

```text
rate limit
validation
PII
abuso
```

## Administrativo

Revisar:

```text
ROLE_ADMIN
CSRF
audit
cache invalidation
```

---

# 85. Gate de publicación

Si una mutación administrativa cambia contenido público:

```text
persistir
auditar
invalidar cache
revalidar frontend cuando corresponda
```

---

# 86. Gate optimista

Mantener:

```java
@Version
```

en entidades administrativas donde ya se usa.

No eliminarlo para “simplificar”.

---

# 87. Gate de secretos

Nunca incluir en:

```text
ZIP
logs
Git
README
scripts
```

valores reales de:

```text
DB password
OAuth secret
HMAC secret
Supabase service key
admin password
revalidation secret
```

---

# 88. Archivos que probablemente deben eliminarse

Después de verificar que no son usados:

```text
generate_backend.ps1
generate_service.ps1
logs/backend.out.log
logs/backend.err.log
SchemaCompatibilityIntegrationTest.java
```

y cualquier:

```text
migration helper
legacy generator
old scaffold
```

---

# 89. Archivos a modificar prioritariamente

```text
PublicContentController.java
database/schema-final.sql

LoginAttemptService.java
LoginAttemptRepository.java
SharedRateLimitService.java
RequestRateLimitRepository.java

AdminBootstrapRunner.java
SecurityConfig.java
PublicEtagFilter.java
PublicCacheHeadersFilter.java
AdminModuleController.java

OAuthUserManagementService.java
AdminContentService.java
```

---

# 90. Archivos nuevos opcionales

Para concurrencia JPA:

```text
LoginAttemptPersistenceService.java
RateLimitPersistenceService.java
```

Para documentación:

```text
ARCHITECTURE.md
```

Para packaging:

```text
package-backend.ps1
```

---

# 91. ARCHITECTURE.md recomendado

Crear una documentación corta con:

```text
arquitectura monolito modular
lista de features
JPA como persistencia
schema-final.sql
sin Flyway
sin JDBC explícito
sesiones in-memory actualmente
regla para Redis futuro
seguridad
cache
audit
DDL manual
```

Esto servirá también a Antigravity como contexto estable.

---

# 92. Arquitectura final objetivo

```text
                    ┌──────────────────────┐
                    │   REST Controllers   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Application/Domain  │
                    │       Services       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    JpaRepository     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Hibernate / JPA    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    └──────────────────────┘
```

---

# 93. Arquitectura modular objetivo

```text
auth/
project/
event/
opportunity/
representation/
team/
poll/
submission/
media/
settings/
statistics/
admin/
security/
cache/
```

`admin/` no reemplaza a los módulos.

---

# 94. Qué NO debe volver a existir

```text
JdbcTemplate
java.sql directo
Flyway
Liquibase
ddl-auto=update

Project endpoints duplicados

AdminContentService creciendo indefinidamente

módulo noticias

migrationStatus
originalSource sin uso

scripts generando arquitectura vieja

logs incluidos en ZIP
```

---

# 95. Estrategia de commits

## Commit 1

```text
fix(project): remove duplicate public project mappings
```

## Commit 2

```text
fix(database): reconcile final schema with current jpa model
```

## Commit 3

```text
fix(rate-limit): handle concurrent jpa key creation
```

## Commit 4

```text
chore(legacy): remove migration and noticias residues
```

## Commit 5

```text
chore(tooling): remove obsolete generators and packaged logs
```

## Commit 6

```text
refactor(admin): unify module resolution
```

## Commits posteriores

```text
refactor(event): extract event admin service
refactor(opportunity): extract opportunity admin service
refactor(representation): extract representation admin service
```

## Último bloque

```text
chore(deps): upgrade spring boot supported line
```

---

# 96. Qué puede hacerse en paralelo

Después de corregir:

```text
rutas duplicadas
schema-final
```

pueden continuar features independientes siempre que:

```text
usen módulos específicos
actualicen schema correctamente
no toquen AdminContentService salvo transición
```

---

# 97. Qué NO debe desarrollarse todavía

Antes de corregir esos dos bloqueantes evitar:

```text
nuevas entidades
nuevas tablas
nuevos endpoints de project
refactors masivos
```

porque aumentarían la divergencia.

---

# 98. Verificación manual recomendada

El usuario realiza pruebas manuales.

Antigravity solo debe entregar una lista de escenarios a probar.

Ejemplo después de arreglar proyectos:

```text
GET /api/proyectos
GET /api/proyectos/{slug}
admin project list
admin project create
admin project update
publicación
cache
```

No crear clases de test.

---

# 99. Compilación mínima

Al final de cada bloque:

```bash
mvnw.cmd -DskipTests compile
```

Si falla:

```text
corregir compilación antes de continuar
```

No ocultar errores de compilación.

---

# 100. Resultado esperado

Una vez completado este plan, Fuerza UPT debe quedar como:

```text
monolito modular
JPA-first
PostgreSQL
sin JDBC explícito
sin Flyway
sin duplicados
sin legacy de noticias/migraciones
schema reproducible
controllers delgados
servicios por dominio
rate limiting concurrente seguro
logs sin PII innecesaria
packaging limpio
```

---

# 101. Gate final para reabrir desarrollo normal

Se puede declarar:

```text
ARQUITECTURA ESTABLE PARA DESARROLLO
```

cuando:

- [ ] no existen mappings duplicados;
- [ ] `schema-final.sql` corresponde al modelo JPA;
- [ ] la BD nueva puede construirse con el schema final;
- [ ] roles/configuración base están presentes;
- [ ] rate limit JPA maneja creación concurrente;
- [ ] no existe JDBC explícito;
- [ ] no existe Flyway/Liquibase;
- [ ] no existe `noticias`;
- [ ] no existen campos de migración muertos;
- [ ] no existen generadores legacy;
- [ ] logs no se empaquetan;
- [ ] OAuth no registra PII innecesaria;
- [ ] `AdminModule` está unificado;
- [ ] `AdminContentService` no recibe funcionalidades nuevas;
- [ ] compilación sin tests pasa;
- [ ] las Skills/Rules de Antigravity están activas.

---

# 102. Instrucción final para Antigravity

Al ejecutar este plan:

> Prioriza estabilidad arquitectónica sobre velocidad.  
> No crees pruebas automatizadas.  
> No introduzcas nuevas abstracciones si no son necesarias.  
> No conviertas el proyecto en microservicios.  
> No vuelvas a JDBC.  
> No vuelvas a Flyway.  
> Cada cambio de entidad debe reflejarse en `schema-final.sql` y en un DDL manual.  
> Cada feature debe vivir en su módulo correspondiente.  
> Elimina primero las duplicaciones y residuos antes de seguir agregando funcionalidad.

