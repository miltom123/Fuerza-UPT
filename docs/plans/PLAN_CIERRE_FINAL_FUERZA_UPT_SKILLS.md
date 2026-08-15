# Plan final de cierre arquitectónico — Backend Fuerza UPT
## Ejecución obligatoria usando las Skills y Rules instaladas en Antigravity

**Proyecto:** Fuerza UPT Backend  
**Fecha:** 12 de agosto de 2026  
**Base:** auditoría del artefacto `backend-fuerza-upt(4).zip`  
**Objetivo:** cerrar los hallazgos restantes antes de declarar la arquitectura estable para desarrollo normal.

---

# 0. Regla principal de ejecución

Antigravity debe respetar permanentemente:

```text
.agents/rules/fuerza-upt-architecture.md
```

Esta Rule debe considerarse **Always On**.

Las reglas no negociables durante este plan son:

```text
NO JdbcTemplate.
NO java.sql directo.
NO Flyway.
NO Liquibase.
NO ddl-auto=update.
NO microservicios.
NO arquitectura paralela.
NO tests automáticos.
NO creación de tests.
NO ejecución de tests.
NO reintroducir noticias.
```

Sí debe realizar:

```text
JPA/Hibernate.
JpaRepository.
JPQL / derived queries.
locking JPA.
schema-final.sql.
DDL manual.
compilación con tests omitidos.
verificación estática.
refactor modular por feature.
```

---

# 1. Skills que deben utilizarse

Este plan debe ejecutarse utilizando explícitamente las Skills instaladas:

```text
fuerza-jpa-persistence
fuerza-schema-contract
fuerza-security
fuerza-admin-module
fuerza-refactor
fuerza-static-verification
fuerza-feature-development
fuerza-media-supabase
```

No todas se usan en todas las fases.

Cada sección indica las Skills obligatorias.

---

# 2. Workflows disponibles

Cuando corresponda utilizar:

```text
/database-change
/refactor-backend-module
```

No utilizar `/new-backend-feature` para corregir deuda arquitectónica.

Este plan no es desarrollo de funcionalidades nuevas.

---

# 3. Orden obligatorio

No ejecutar todo en un cambio gigante.

Orden:

```text
FASE 1  -> detener script de BD peligroso
FASE 2  -> reconciliar schema-final.sql
FASE 3  -> corregir concurrencia rate limit
FASE 4  -> consolidar Project como módulo único
FASE 5  -> corregir bugs funcionales de Project
FASE 6  -> corregir Team y Representation
FASE 7  -> corregir newsletter / async AFTER_COMMIT
FASE 8  -> eliminar legacy restante
FASE 9  -> fortalecer packaging y verification skill
FASE 10 -> upgrade Spring Boot separado
```

Hasta terminar las fases 1–4:

> no agregar nuevas entidades, nuevas tablas ni nuevas features que modifiquen el modelo persistente.

---

# FASE 1 — BLOQUEAR EL SCRIPT SUPABASE PELIGROSO

## Skills

```text
fuerza-schema-contract
fuerza-media-supabase
fuerza-security
```

Workflow:

```text
/database-change
```

---

# 4. Problema

Existe:

```text
database/migration-script-supabase.sql
```

con una operación equivalente a:

```sql
ALTER TABLE media_assets
RENAME COLUMN is_public TO is_private;
```

Esto cambia el nombre pero no invierte el valor.

Semánticamente:

```text
is_public=true
```

no es equivalente a:

```text
is_private=true
```

Son opuestos.

---

# 5. Acción inmediata

Antigravity debe:

1. marcar el script actual como **NO EJECUTABLE**;
2. inspeccionar toda su lógica;
3. generar un DDL manual correcto;
4. no ejecutar automáticamente nada en Supabase;
5. entregar el DDL al usuario.

---

# 6. Conversión correcta de privacidad

Si la BD real conserva:

```text
is_public
```

y se desea pasar a:

```text
is_private
```

el valor final debe cumplir:

```text
is_private = NOT is_public
```

No basta con rename.

Una estrategia conceptual segura es:

```sql
ALTER TABLE media_assets
ADD COLUMN is_private BOOLEAN;

UPDATE media_assets
SET is_private = NOT is_public;

ALTER TABLE media_assets
ALTER COLUMN is_private SET NOT NULL;
```

y solo posteriormente:

```text
eliminar is_public
```

después de verificar datos.

Antigravity debe adaptar el DDL a la estructura real.

---

# 7. `file_path` vs `url`

También revisar cualquier operación:

```text
file_path -> url
```

No asumir que:

```text
storage path == public URL
```

Si `file_path` guarda:

```text
bucket/folder/file.png
```

y `url` espera:

```text
https://...
```

no deben renombrarse sin transformación.

---

# 8. Script temporal

Después de completar manualmente la reconciliación de Supabase:

```text
database/migration-script-supabase.sql
```

debe eliminarse.

La arquitectura final no debe conservar scripts temporales de migración.

---

# 9. Gate de fase 1

Debe quedar documentado:

```text
script antiguo: eliminado
DDL manual correcto: entregado
datos existentes: preservados
privacidad: semánticamente correcta
```

No continuar si existe duda sobre:

```text
is_public / is_private
```

---

# FASE 2 — RECONCILIAR COMPLETAMENTE `schema-final.sql`

## Skills

Obligatorias:

```text
fuerza-jpa-persistence
fuerza-schema-contract
fuerza-static-verification
```

Workflow:

```text
/database-change
```

---

# 10. Objetivo

El archivo:

```text
database/schema-final.sql
```

debe representar **exactamente** el modelo actual de las entidades JPA.

No debe representar:

```text
una versión histórica
las antiguas migraciones
H2
el modelo frontend
```

---

# 11. Estado detectado

La auditoría encontró aproximadamente:

```text
35 entidades JPA analizadas
17 entidades con incompatibilidades de tabla/columnas
```

Por tanto el schema todavía no puede declararse reconciliado.

---

# 12. Regla

Para cada entidad JPA inspeccionar:

```text
@Table
@Id
@GeneratedValue
@Column
@JoinColumn
@EmbeddedId
@Enumerated
@Version
@ManyToOne
@OneToMany
@OneToOne
```

y reflejarlo en PostgreSQL.

---

# 13. User

Revisar como mínimo:

```text
display_name
enabled
last_login_at
password_hash
created_at
updated_at
```

No conservar nombres antiguos:

```text
full_name
is_active
```

si ya no existen en la Entity.

---

# 14. CacheInvalidationEvent

Verificar especialmente:

```text
tipo real de id
nombre created_at
module/tag
payload o campos equivalentes
```

No permitir diferencia:

```text
Java Long
SQL UUID
```

ni:

```text
created_at
invalidated_at
```

si Entity y tabla deben representar el mismo campo.

---

# 15. Project

Alinear:

```text
title
slug
summary
description
problem
objective
beneficiaries
project_status
content_status
display_order
cover_media_id
cover_alt_text
published_at
created_at
updated_at
version
```

según la entidad real.

Eliminar columnas históricas que ya no corresponden.

---

# 16. ProjectResult

La auditoría detectó que SQL exige campos como:

```text
metric_name NOT NULL
metric_value NOT NULL
```

mientras la Entity actual utiliza otro modelo.

La tabla debe alinearse a la Entity actual.

No dejar constraints NOT NULL de columnas que JPA nunca escribe.

---

# 17. ProjectResponsible

Misma regla.

Si Java solo utiliza:

```text
name
display_order
```

no puede existir una columna legacy:

```text
role NOT NULL
```

sin mapping Java.

---

# 18. TeamMember

Alinear campos actuales como:

```text
name
role
career
description
category
location
email
image_media_id
content_status
display_order
published_at
version
```

No conservar columnas antiguas:

```text
full_name
faculty
cycle
bio
photo_url
featured
```

si ya no forman parte del dominio.

---

# 19. ContactMessage

La Entity espera:

```text
contact_messages
```

El schema no debe crear:

```text
contact_submissions
```

si ese ya no es el nombre actual.

---

# 20. StudentProposal

Alinear todos los campos reales:

```text
student_name
student_code
career
proposal_text
status
notes
assigned_to
reviewed_at
ip_hash
user_agent
created_at
updated_at
```

No conservar el modelo histórico.

---

# 21. NewsletterSubscription

Comparar Entity completa contra SQL.

Revisar:

```text
email
status/active si aplica
ip_hash
user_agent
created_at
updated_at
```

según implementación real.

---

# 22. TeamApplication

Alinear completamente.

Revisar también datos que luego se usan para notificaciones.

---

# 23. PollQuestion

Revisar diferencias como:

```text
required
```

vs:

```text
is_required
```

El schema debe seguir `@Column`.

---

# 24. PollOption

Revisar:

```text
label
```

vs:

```text
option_text
```

---

# 25. PollAnswer

Revisar:

```text
rating_value
text_value
```

y cualquier FK.

No conservar `text_answer` si la Entity actual no lo usa.

---

# 26. PollResponse

Revisar:

```text
respondent_fingerprint
ip_hash
user_agent_hash
submitted_at
```

según Entity.

Eliminar modelo histórico:

```text
voter_key
voter_type
student_code
```

si ya no existe funcionalmente.

---

# 27. AuditLog

Alinear:

```text
before_data JSONB
after_data JSONB
request_id
action
module
entity_id
actor
ip
user_agent
created_at
```

según Entity.

No sustituir por:

```text
changes_summary
```

si JPA ya no utiliza ese contrato.

---

# 28. RepresentationItem

Alinear campos detectados:

```text
kind
progress_percentage
impact_level
identified_problem
last_update
related_project_id
related_event_id
related_opportunity_id
```

y todos los demás de la entidad real.

---

# 29. RepresentationEvidence

Este punto es crítico.

Si Entity usa:

```text
@Table(name = "representation_evidence")
```

el schema debe usar exactamente ese nombre.

No:

```text
representation_evidences
```

si no existe mapping para ello.

---

# 30. PK de RepresentationEvidence

Si Java utiliza PK compuesta:

```text
representation_id
media_asset_id
```

SQL debe usar esa PK o UNIQUE equivalente según mapping.

No mantener:

```text
id UUID PRIMARY KEY
```

si la Entity no tiene ese id.

---

# 31. Event

Alinear:

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

y el resto de la entidad real.

---

# 32. MediaAsset

Alinear:

```text
file_name
original_name
content_type
size_bytes
url
is_private
uploaded_by
created_at
```

según Entity.

No mantener simultáneamente un modelo antiguo:

```text
file_path
public_url
mime_type
file_size_bytes
original_filename
is_public
```

---

# 33. Constraints

Después de alinear columnas revisar:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
CHECK
ON DELETE
```

---

# 34. RegistrationMode

Mantener constraint de dominio para:

```text
NONE
INTERNAL
EXTERNAL
```

y coherencia entre:

```text
registration_mode
registration_enabled
registration_url
```

si la regla de dominio lo exige.

---

# 35. Índices

El schema actual tiene pocos índices explícitos.

Agregar únicamente según consultas reales.

Revisar repositories y añadir índices candidatos sobre:

```text
slug
content_status
display_order
published_at
project_id
event_id
created_at
updated_at
email
provider + subject
attempt_key
window_started_at
```

---

# 36. Seeds

Mantener datos base necesarios:

```text
ADMIN role
USER role
```

si el código presupone su existencia.

Revisar también:

```text
site_settings singleton
```

---

# 37. No seed admin

No insertar usuario administrador ni password en schema.

Mantener bootstrap controlado.

---

# 38. Encabezado del schema

Eliminar afirmaciones como:

```text
100% JPA validated
```

hasta terminar la reconciliación.

Después puede utilizarse un encabezado objetivo como:

```text
Baseline PostgreSQL aligned with current JPA model
```

---

# 39. DDL manual

Antigravity debe entregar por separado:

```text
database/manual-ddl-reconcile.sql
```

solo si el usuario quiere conservarlo temporalmente.

Preferiblemente entregar el contenido en resumen y permitir aplicación manual.

No convertirlo en migración automática.

---

# 40. Gate Fase 2

Usar `fuerza-static-verification`.

Resultado esperado:

```text
Schema sincronizado: SÍ
JDBC explícito: 0
Migraciones runtime: 0
```

---

# FASE 3 — CORREGIR CONCURRENCIA DE RATE LIMIT

## Skills

```text
fuerza-jpa-persistence
fuerza-security
fuerza-static-verification
```

---

# 41. Problema

El retry actual se encuentra dentro de un mismo método:

```java
@Transactional(propagation = REQUIRES_NEW)
```

con un loop interno.

Esto significa:

```text
una transacción
varios intentos
```

no:

```text
una transacción nueva por retry
```

---

# 42. Arquitectura correcta

Crear/usar:

```text
LoginAttemptService
        ↓ retry coordinator
LoginAttemptPersistenceService
        ↓
tryOnce(...)
@Transactional(REQUIRES_NEW)
```

---

# 43. Regla de retry

Cada llamada:

```text
tryOnce
```

debe pasar por el proxy Spring.

No hacer self-invocation del método transaccional.

---

# 44. Flujo

```text
try #1
  -> TX1
  -> conflicto PK
  -> rollback TX1

try #2
  -> TX2
  -> find existing row
  -> lock
  -> update
  -> commit
```

---

# 45. Excepciones

Retry solo ante conflictos esperados como:

```text
DataIntegrityViolationException
OptimisticLockingFailureException
PessimisticLockingFailureException
```

según caso real.

No capturar:

```text
Exception
RuntimeException
```

genéricamente para retry.

---

# 46. Límite

Máximo recomendado:

```text
2 o 3 retries
```

---

# 47. SharedRateLimit

Aplicar misma arquitectura:

```text
SharedRateLimitService
        ↓
RateLimitPersistenceService.tryOnce()
        ↓
REQUIRES_NEW
```

---

# 48. Ventanas de LoginAttempt

Actualmente el comportamiento puede acumular fallos durante periodos demasiado largos.

Debe implementarse una ventana real.

Opciones:

## Opción recomendada

Agregar:

```text
window_started_at
```

a `login_attempts`.

---

# 49. Modelo propuesto

Por clave:

```text
attempt_key
failures
window_started_at
blocked_until
updated_at
```

---

# 50. Lógica

Si:

```text
now - window_started_at >= configured_window
```

reiniciar:

```text
failures = 0
window_started_at = now
blocked_until = null
```

antes de incrementar.

---

# 51. Tres dimensiones

Mantener:

```text
login-ip        30 / 15 min
login-account   10 / 30 min
login-combo      5 / 15 min
```

Cada clave debe llevar su ventana correspondiente.

---

# 52. Schema

Al agregar `window_started_at`:

usar:

```text
fuerza-schema-contract
/database-change
```

Actualizar:

```text
LoginAttempt entity
schema-final.sql
DDL manual
```

---

# 53. Limpieza

Eliminar:

```text
maxAttempts
```

de firmas donde no se utilice.

Eliminar clase privada falsa:

```text
Collection
```

si continúa presente.

Usar:

```java
List.of(...)
```

---

# 54. Gate fase 3

Debe cumplirse:

```text
retry fuera de transacción fallida
cada intento = nueva TX
ventanas reales implementadas
3 dimensiones conservadas
cero JDBC
```

---

# FASE 4 — PROJECT COMO ÚNICO WRITE PATH

## Skills

```text
fuerza-admin-module
fuerza-refactor
fuerza-jpa-persistence
fuerza-static-verification
```

Workflow:

```text
/refactor-backend-module
```

---

# 55. Estado correcto

Endpoints públicos duplicados ya fueron eliminados.

Debe mantenerse:

```text
project/controller/PublicProjectController
```

como implementación pública canónica.

---

# 56. Problema administrativo restante

Todavía existen dos caminos para escribir `Project`.

Canónico:

```text
/api/admin/proyectos
        ↓
ProjectAdminService
```

Legacy:

```text
/api/admin/content/projects
        ↓
AdminContentService
```

---

# 57. Acción

Eliminar `PROJECTS` del write path de:

```text
AdminContentService
```

para:

```text
create
update
publish
unpublish
archive
restore
reorder
```

cuando esas operaciones ya existen en `ProjectAdminService`.

---

# 58. No mantener compatibilidad fantasma

No conservar ambos caminos “por si acaso”.

Eso provoca:

```text
dos reglas de negocio
dos contratos
dos lugares de validación
dos fuentes de bugs
```

---

# 59. Routing

Si alguna ruta legacy debe sobrevivir temporalmente por frontend:

hacer que delegue explícitamente a:

```text
ProjectAdminService
```

sin mantener una implementación alternativa.

Pero preferencia:

```text
retirar ruta legacy
```

si frontend ya no la usa.

---

# 60. Gate fase 4

Buscar:

```text
PROJECTS
projects
proyectos
```

dentro de:

```text
AdminContentService
```

y confirmar que no existe write logic propia.

---

# FASE 5 — BUGS FUNCIONALES DE PROJECT

## Skills

```text
fuerza-feature-development
fuerza-admin-module
fuerza-jpa-persistence
fuerza-static-verification
```

---

# 61. Bug del slug

Problema:

```java
project.setTitle(input.title());

if (!project.getTitle().equals(input.title())) {
    ...
}
```

La condición nunca puede cumplirse.

---

# 62. Corrección

Guardar valor anterior:

```java
String previousTitle = project.getTitle();

if (!Objects.equals(previousTitle, input.title())) {
    project.setTitle(input.title());
    project.setSlug(generateSlug(input.title()));
}
```

Ajustar según política real de slug.

---

# 63. Decisión sobre estabilidad de slug

Antes de aplicar decidir:

```text
slug cambia con título
```

o:

```text
slug es estable después de publicar
```

Mi recomendación para URLs públicas estables:

```text
regenerar slug solo antes de publicación
```

o mantener redirect si cambia.

Pero Antigravity debe respetar la decisión funcional vigente.

---

# 64. linkedEventIds

Actualmente DTO recibe:

```text
linkedEventIds
```

pero no se persiste.

Debe elegirse una estrategia.

---

# 65. Estrategia recomendada

Si `Event` ya posee:

```text
project_id
```

no crear tabla many-to-many innecesaria.

Interpretar:

```text
linkedEventIds
```

como eventos que deben apuntar a:

```text
project_id = project.id
```

---

# 66. Persistencia

Al crear/editar proyecto:

1. resolver los Event IDs;
2. verificar que existen;
3. vincularlos mediante relación actual;
4. desvincular los eliminados cuando aplique;
5. persistir transaccionalmente.

---

# 67. Si no se necesita funcionalidad

Si aún no se desea implementar:

eliminar:

```text
linkedEventIds
eventIds
```

de DTOs/responses.

No mantener campos ficticios.

---

# 68. contentStatus / displayOrder en UpdateProjectRequest

Si existen endpoints separados para:

```text
publication/status
reorder
```

eliminar estos campos del request genérico.

No aceptar inputs que serán ignorados.

---

# 69. Response

`ProjectPublicResponse` no debe responder siempre:

```java
List.of()
```

si promete eventos relacionados.

Debe:

```text
devolver relación real
```

o eliminar el campo.

---

# 70. Gate fase 5

No deben quedar:

```text
campos request ignorados
response ficticio
slug update imposible
linkedEventIds no funcional
```

---

# FASE 6 — TEAM Y REPRESENTATION

## Skills

```text
fuerza-feature-development
fuerza-refactor
fuerza-media-supabase
fuerza-static-verification
```

---

# 71. Team `featured`

Actualmente el API recibe:

```text
featured
```

pero no lo utiliza.

Además la Entity actual no tiene ese campo.

---

# 72. Decisión recomendada

Si `featured` ya no es parte del modelo:

eliminarlo de:

```text
controller
service
OpenAPI/docs si aplica
frontend calls
```

No volver a agregarlo solo para mantener deuda histórica.

---

# 73. Team imageUrl

El mapper público devuelve:

```text
imageUrl = null
```

aunque existe:

```text
imageMediaId
```

---

# 74. Corrección

Resolver el MediaAsset correspondiente.

Preferir un servicio reutilizable:

```text
MediaUrlResolver
```

o el mecanismo ya existente en `media`.

No hacer acceso HTTP externo por cada fila.

---

# 75. N+1

Si listado del equipo carga muchos `MediaAsset`:

evitar:

```text
una query por miembro
```

Usar solución coherente con JPA:

```text
batch lookup por IDs
```

o relación bien diseñada.

---

# 76. Representation evidence

`evidenceUrls` no debe ser siempre:

```text
List.of()
```

si la Entity tiene evidencias.

Mapear:

```text
RepresentationEvidence
        ↓
MediaAsset
        ↓
public URL / signed URL según privacidad
```

---

# 77. Privacidad

No devolver URL pública para assets privados.

Usar `fuerza-media-supabase`.

---

# 78. Gate fase 6

Debe quedar:

```text
featured eliminado o implementado realmente
team imageUrl funcional
representation evidenceUrls funcional
sin N+1 obvio
privacidad respetada
```

---

# FASE 7 — NEWSLETTER Y NOTIFICACIONES AFTER_COMMIT

## Skills

```text
fuerza-jpa-persistence
fuerza-security
fuerza-refactor
fuerza-static-verification
```

---

# 79. Newsletter race

Actualmente puede atraparse:

```text
DataIntegrityViolationException
```

dentro de una transacción ya fallida.

Eso no es seguro.

---

# 80. Solución

Crear persistencia corta en componente separado:

```text
NewsletterSubscriptionService
        ↓
NewsletterPersistenceService
        ↓
REQUIRES_NEW
```

Capturar conflicto fuera de la transacción fallida.

---

# 81. Idempotencia

Si email ya existe:

la operación pública puede responder de forma genérica:

```text
suscripción procesada
```

sin revelar si el email estaba registrado.

---

# 82. Notificación antes de commit

Actualmente:

```text
save
@Async email
commit
```

puede producir email antes de commit.

---

# 83. Arquitectura correcta

```text
transacción
  -> save TeamApplication
  -> publicar evento interno
commit

AFTER_COMMIT
  -> async email
```

---

# 84. Implementación

Preferir:

```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
```

y:

```java
@Async
```

en el listener.

---

# 85. Evento

Ejemplo conceptual:

```text
TeamApplicationSubmittedEvent
```

Debe contener únicamente la información mínima necesaria.

No incluir secretos.

---

# 86. Executor async

Configurar executor específico.

Ejemplo conceptual:

```text
notificationTaskExecutor
corePoolSize
maxPoolSize
queueCapacity
threadNamePrefix
```

---

# 87. Saturación

Definir política razonable.

No permitir creación ilimitada de threads.

---

# 88. Gate fase 7

```text
email solo AFTER_COMMIT
executor acotado
newsletter race segura
sin PII excesiva en logs
```

---

# FASE 8 — ELIMINAR LEGACY RESTANTE

## Skills

```text
fuerza-refactor
fuerza-static-verification
```

Workflow:

```text
/refactor-backend-module
```

---

# 89. migrationStatus

Buscar:

```text
migrationStatus
```

Eliminar de DTOs si solo se devuelve:

```text
null
```

---

# 90. originalSource

Misma regla.

No mantener residuos del proceso de migración.

---

# 91. Scripts generadores

Eliminar si continúan:

```text
generate_backend.ps1
generate_service.ps1
```

y generadores antiguos similares.

---

# 92. Motivo

Las Skills ahora son la fuente de arquitectura.

Los generadores antiguos no deben competir con:

```text
.agents/rules
.agents/skills
```

---

# 93. Logs

Eliminar del proyecto/ZIP:

```text
logs/backend.out.log
logs/backend.err.log
*.log
```

---

# 94. `.gitignore`

Confirmar:

```gitignore
logs/
*.log
```

---

# 95. Flyway residual

Buscar:

```text
Flyway
flyway
migration Vxx
```

en runtime/config.

Resultado objetivo:

```text
0
```

No es necesario eliminar referencias históricas dentro de este plan si están en documentación deliberadamente archivada, pero no deben influir a Antigravity.

---

# 96. Noticias

Buscar:

```text
noticias
/api/noticias
news
```

Revisar manualmente `newsletter`.

No confundir:

```text
newsletter
```

con módulo noticias.

---

# 97. Gate fase 8

Resultado esperado:

```text
migrationStatus = 0
originalSource = 0
scripts legacy = 0
logs empaquetados = 0
noticias legacy = 0
```

---

# FASE 9 — FORTALECER PACKAGING Y SKILL DE VERIFICACIÓN

## Skills

```text
fuerza-static-verification
fuerza-refactor
```

---

# 98. Packaging

Crear/recuperar:

```text
package-backend.ps1
```

si el proyecto necesita empaquetado manual.

---

# 99. Allowlist

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
ARCHITECTURE.md
README necesarios
```

---

# 100. Excluir

```text
.env
logs/
*.log
target/
.git/
.idea/
*.zip
backups
scripts temporales de migración
```

---

# 101. Validación del ZIP

El script debe abrir/listar el ZIP después de crearlo y abortar si encuentra:

```text
.env
*.log
target/
.git/
```

---

# 102. Fortalecer `check-architecture.ps1`

Actualmente la Skill de verification debe volverse más estricta.

Agregar gates reales.

---

# 103. Gate JDBC

Fallar si aparece:

```text
JdbcTemplate
NamedParameterJdbcTemplate
JdbcClient
org.springframework.jdbc
java.sql.
RowMapper
ResultSet
DriverManager
spring-session-jdbc
store-type: jdbc
```

---

# 104. Gate Flyway

Fallar si aparece en runtime:

```text
flyway-core
flyway-database-postgresql
src/main/resources/db/migration
V[0-9]+__
```

---

# 105. Gate legacy

Fallar si aparece:

```text
migrationStatus
originalSource
/api/noticias
```

salvo allowlist explícita.

---

# 106. Gate artifacts

Fallar si existen dentro de raíz de release:

```text
.env
logs/
*.log
target/
```

---

# 107. Gate scripts

Fallar si existen:

```text
generate_backend.ps1
generate_service.ps1
migration-script-supabase.sql
```

una vez completado este plan.

---

# 108. Gate mappings duplicados

Agregar un análisis PowerShell razonable que liste:

```text
@RequestMapping de clase
+
@Get/Post/Put/Patch/DeleteMapping
```

No es necesario construir parser Java perfecto.

El objetivo es detectar duplicaciones obvias.

---

# 109. Gate schema

La verificación estática no puede garantizar automáticamente todo Entity ↔ SQL con regex.

Pero debe al menos:

```text
detectar @Entity modificadas
recordar comparar schema-final
```

y exigir en salida:

```text
Schema sincronizado: SÍ/NO
```

---

# 110. Resultado estándar

Al finalizar cada trabajo Antigravity debe mostrar:

```text
Compilación sin tests:
JDBC explícito:
Migraciones runtime:
Rutas duplicadas:
Schema sincronizado:
Seguridad revisada:
Legacy:
Artifacts:
Tests creados/ejecutados: NO
```

---

# FASE 10 — SPRING BOOT

## Skills

```text
fuerza-security
fuerza-jpa-persistence
fuerza-static-verification
```

---

# 111. Regla

No iniciar esta fase hasta cerrar:

```text
schema
script Supabase
rate limiter
Project write path
```

---

# 112. Estado

El proyecto usa:

```text
Spring Boot 3.4.3
```

Debe salir de la rama antigua.

---

# 113. Upgrade independiente

Crear un cambio exclusivo para dependencias/framework.

No mezclar:

```text
schema
features
refactors de dominio
```

---

# 114. Mantener Java 17 si es compatible

No actualizar Java simultáneamente salvo necesidad.

Menos variables = menor riesgo.

---

# 115. Revisar después del upgrade

Sin crear tests, revisar estáticamente:

```text
SecurityConfig
AuthController
OAuth
JPA mappings
CORS
CSRF
session fixation
RestClient
mail
Actuator
springdoc
```

---

# 116. Compilación

Ejecutar:

```bash
mvnw.cmd -DskipTests compile
```

Si wrapper requiere red y falla:

informar limitación.

No inventar éxito.

---

# 117. RESIDUOS ADMIN CONTENT — PLAN POSTERIOR

Después de estabilización:

usar:

```text
fuerza-admin-module
fuerza-refactor
/refactor-backend-module
```

para continuar retirando:

```text
AdminContentService
```

---

# 118. Orden recomendado

Después de Project:

```text
Event
Opportunity
Representation
Statistics
```

---

# 119. Patrón

Para cada dominio:

```text
service específico
controller específico
DTO específico
repository específico
```

Después:

```text
eliminar branch del generic service
```

---

# 120. No crear interfaces innecesarias

El objetivo es separar dominio.

No convertir todo a:

```text
interface + impl
```

sin necesidad real.

---

# 121. ESTADO DE SESIONES

El backend actualmente usa sesión del contenedor.

Esto es aceptable si:

```text
1 instancia
```

---

# 122. Redis futuro

No introducir Redis todavía salvo que aparezca:

```text
múltiples réplicas
autoscaling
load balancing
sesiones compartidas
```

---

# 123. DOCUMENTACIÓN

Actualizar:

```text
ARCHITECTURE.md
```

al terminar.

Debe declarar:

```text
monolito modular
JPA-first
PostgreSQL
schema-final.sql
sin Flyway
sin JDBC explícito
sesión in-memory actual
AdminContentService legacy en retiro
Skills/Rules como estándar de desarrollo
```

---

# 124. MATRIZ DE CIERRE

## Base de datos

- [ ] `migration-script-supabase.sql` eliminado.
- [ ] privacidad media reconciliada.
- [ ] `schema-final.sql` alineado con todas las entities.
- [ ] PK correctas.
- [ ] FK correctas.
- [ ] UNIQUE correctos.
- [ ] NOT NULL correctos.
- [ ] CHECK de dominio recuperados.
- [ ] índices necesarios agregados.
- [ ] ADMIN/USER seed presentes.
- [ ] site settings seed evaluado.
- [ ] no tablas legacy.

---

# 125. JPA

- [ ] cero JDBC explícito.
- [ ] rate limiter usa JPA.
- [ ] retry ocurre con nueva TX por intento.
- [ ] race de fila inexistente manejada.
- [ ] ventanas de login reales.
- [ ] newsletter race manejada.

---

# 126. Project

- [ ] un solo public controller.
- [ ] un solo admin write path.
- [ ] slug corregido.
- [ ] linkedEventIds implementado o eliminado.
- [ ] eventIds response real o eliminado.
- [ ] request no contiene campos ignorados.
- [ ] AdminContentService no muta Project.

---

# 127. Team

- [ ] `featured` implementado o eliminado.
- [ ] imageUrl se resuelve.
- [ ] sin N+1 evidente.

---

# 128. Representation

- [ ] evidenceUrls se resuelven.
- [ ] privacidad media respetada.
- [ ] schema Evidence coincide con JPA.

---

# 129. Submission / notifications

- [ ] newsletter concurrente segura.
- [ ] email se envía AFTER_COMMIT.
- [ ] executor async acotado.
- [ ] logs sin PII innecesaria.

---

# 130. Legacy

- [ ] `migrationStatus` eliminado.
- [ ] `originalSource` eliminado.
- [ ] scripts generadores antiguos eliminados.
- [ ] logs eliminados del ZIP.
- [ ] noticias = 0.
- [ ] Flyway = 0.
- [ ] Liquibase = 0.

---

# 131. Tooling Antigravity

- [ ] Rule arquitectura Always On.
- [ ] Skills instaladas.
- [ ] check-architecture fortalecido.
- [ ] packaging seguro.
- [ ] verification report estándar.
- [ ] no tests automáticos.

---

# 132. Framework

- [ ] Spring Boot actualizado en cambio independiente.
- [ ] compilación sin tests pasa.
- [ ] validación manual realizada por usuario.

---

# 133. Orden de commits recomendado

```text
fix(database): prevent unsafe media privacy migration
fix(database): reconcile final schema with jpa entities
fix(security): isolate rate limit retries in new transactions
fix(security): implement real login attempt windows

refactor(project): remove generic admin project write path
fix(project): correct slug update behavior
fix(project): implement or remove linked event contract

fix(team): align public filters and media response
fix(representation): expose persisted evidence safely

refactor(submission): isolate newsletter persistence conflicts
refactor(notification): dispatch emails after commit
chore(async): configure bounded notification executor

chore(legacy): remove migration response fields
chore(tooling): remove obsolete generators
chore(packaging): exclude logs and temporary database scripts
chore(antigravity): strengthen static architecture gate

docs(architecture): update current backend architecture

chore(deps): upgrade spring boot supported line
```

---

# 134. Qué puede ejecutar Antigravity automáticamente

Permitido:

```text
editar Java
editar YAML
editar SQL baseline
crear services/repositorios
eliminar legacy
actualizar Skills/scripts
compilar con -DskipTests
ejecutar grep / búsquedas
hacer revisión estática
```

---

# 135. Qué NO debe ejecutar automáticamente

```text
SQL contra Supabase producción
DROP TABLE en producción
ALTER destructivo sobre datos reales
tests
mvn test
Testcontainers
Flyway
Liquibase
ddl-auto=update
```

---

# 136. DDL manual

Todo cambio PostgreSQL debe entregarse claramente como:

```text
DDL MANUAL PARA APLICAR
```

Antigravity no lo ejecuta.

El usuario decide cuándo aplicarlo.

---

# 137. Verificación final con `fuerza-static-verification`

Al terminar cada fase:

```text
usar fuerza-static-verification
```

Informe obligatorio:

```text
Compilación sin tests: PASS / FAIL / NO EJECUTADA
JDBC explícito: 0 / hallazgos
Migraciones runtime: 0 / hallazgos
Rutas duplicadas: 0 / hallazgos
Schema sincronizado: SÍ / NO / NO APLICA
Seguridad revisada: SÍ / NO APLICA
Legacy encontrado: 0 / hallazgos
Artifacts inseguros: 0 / hallazgos
Tests creados/ejecutados: NO
Pendientes: ...
```

---

# 138. Gate para retomar desarrollo normal

Puede declararse:

```text
ARQUITECTURA ESTABLE PARA DESARROLLO
```

cuando como mínimo estén cerrados:

```text
FASE 1
FASE 2
FASE 3
FASE 4
```

y además:

```text
compilación sin tests no tiene errores
schema final está alineado
no existe script BD peligroso
Project tiene una sola fuente de verdad
rate limit concurrente es seguro
```

---

# 139. Gate para producción

No aprobar producción hasta cerrar también:

```text
FASE 5
FASE 6
FASE 7
FASE 8
FASE 9
FASE 10
```

más las pruebas manuales del usuario.

---

# 140. Escenarios manuales que Antigravity debe entregar al usuario

Antigravity NO los ejecuta.

Debe listar escenarios para que el usuario pruebe.

Como mínimo:

## Auth

```text
login correcto
login incorrecto
bloqueo por IP
bloqueo por cuenta
bloqueo por combinación
logout
session fixation
OAuth
```

## Project

```text
crear
editar título
editar contenido
publicar
reordenar
archivar
eventos vinculados
endpoint público
```

## Team

```text
listar
imagen
filtros vigentes
```

## Representation

```text
publicar
evidencias
assets privados/públicos
```

## Submissions

```text
newsletter duplicado
team application
email after commit
rate limit
```

---

# 141. Resultado arquitectónico final esperado

```text
┌───────────────────────────────┐
│      Spring MVC Controller    │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Domain / Application Service  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│        JpaRepository          │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       Hibernate / JPA         │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│          PostgreSQL           │
└───────────────────────────────┘
```

---

# 142. Módulos

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
security/
admin/
cache/
```

---

# 143. Papel de `admin/`

Debe contener preocupaciones transversales:

```text
dashboard
audit
cache invalidation
administración global
```

No debe volver a ser:

```text
el CRUD central de todos los dominios
```

---

# 144. Papel de `content/`

Considerarlo:

```text
legacy en retiro
```

No utilizarlo como patrón de nuevas funcionalidades.

---

# 145. Regla final para Antigravity

Antes de modificar cualquier código durante este plan:

```text
1. leer fuerza-upt-architecture
2. activar Skill correspondiente
3. inspeccionar implementación actual
4. buscar duplicados
5. modificar la implementación canónica
6. actualizar schema si aplica
7. entregar DDL manual
8. compilar sin tests
9. ejecutar fuerza-static-verification
10. entregar resumen
```

---

# 146. Prohibición final

Si Antigravity detecta que una solución rápida requiere:

```text
JdbcTemplate
Flyway
Liquibase
ddl-auto=update
duplicar controller
crear generic CRUD service
ignorar schema-final.sql
```

debe detener esa solución y usar la arquitectura definida por las Skills.

---

# 147. Definición de “TERMINADO”

Este plan queda completamente cerrado cuando:

- [ ] no existe script Supabase peligroso;
- [ ] schema final refleja las entidades JPA actuales;
- [ ] BD puede provisionarse desde baseline sin contradicciones conocidas;
- [ ] constraints e índices importantes están consolidados;
- [ ] rate limit maneja concurrencia y ventanas reales;
- [ ] Project tiene una única fuente administrativa de verdad;
- [ ] bugs de slug y linked events están cerrados;
- [ ] Team no expone parámetros ignorados;
- [ ] multimedia pública funciona correctamente;
- [ ] Representation devuelve evidencias reales;
- [ ] newsletter maneja concurrencia;
- [ ] emails se disparan AFTER_COMMIT;
- [ ] async utiliza executor acotado;
- [ ] no quedan campos de migración muertos;
- [ ] no quedan generadores legacy;
- [ ] no se empaquetan logs;
- [ ] check-architecture bloquea regresiones;
- [ ] Spring Boot está en línea soportada;
- [ ] cero JDBC explícito;
- [ ] cero Flyway/Liquibase;
- [ ] cero rutas duplicadas;
- [ ] tests creados/ejecutados por Antigravity: **NO**;
- [ ] pruebas manuales finales realizadas por el usuario.

---

# 148. Instrucción ejecutiva

Antigravity debe completar este plan **por fases**, utilizando las Skills instaladas como autoridad arquitectónica.

Prioridades absolutas:

```text
1. integridad de datos
2. contrato JPA ↔ PostgreSQL
3. concurrencia
4. una sola fuente de verdad por dominio
5. seguridad
6. limpieza de legacy
7. mantenibilidad
8. framework
```

No sacrificar las primeras por velocidad de desarrollo.

