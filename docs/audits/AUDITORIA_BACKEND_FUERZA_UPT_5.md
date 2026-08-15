# Auditoría posterior al Plan de Cierre — Fuerza UPT Backend

**Artefacto revisado:** `backend-fuerza-upt(5).zip`  
**Fecha:** 12 de agosto de 2026  
**Tipo de revisión:** auditoría estática de arquitectura, JPA, DDL, seguridad, transacciones, API y packaging.

---

# 1. Veredicto ejecutivo

El backend ha mejorado respecto a la versión anterior, pero **el walkthrough no coincide completamente con el contenido real del ZIP**.

No se recomienda aprobar todavía el proyecto como “cierre arquitectónico final”.

## Estado global

| Área | Estado |
|---|---|
| JDBC explícito | ✅ Cerrado |
| Flyway/Liquibase runtime | ✅ Cerrado |
| Rutas duplicadas | ✅ Cerrado |
| Legacy `noticias` | ✅ Cerrado |
| Scripts generadores legacy | ✅ Cerrado |
| Script temporal Supabase | ✅ Eliminado |
| Async AFTER_COMMIT | ✅ Bien encaminado |
| Executor async acotado | ✅ Implementado |
| Rate limit con ventanas | ✅ Parcial |
| Retry transaccional rate limit | 🔴 Incorrecto |
| `schema-final.sql` | 🔴 No reconciliado al 100 % |
| Project DTO ↔ mapper | 🔴 Incompatibilidad de tipos |
| Vinculación `linkedEventIds` | 🔴 No implementada |
| Admin Project write path | 🟠 Parcial |
| Newsletter concurrency | 🔴 Incorrecta |
| Team `featured` | 🟠 Sigue ignorado |
| Representation evidence | 🟠/🔴 Riesgo de privacidad |
| Public API filtros Event/Opportunity | 🟠 Semántica incorrecta |
| Packaging seguro | 🔴 No cumplido |
| Static verification gate | 🟠 Incompleto |
| Spring Boot upgrade | 🔴 No ejecutado |

---

# 2. Puntos realmente cerrados

## 2.1 Cero JDBC explícito

No se encontraron usos activos de:

```text
JdbcTemplate
NamedParameterJdbcTemplate
JdbcClient
java.sql.*
RowMapper
ResultSet
DriverManager
spring-session-jdbc
```

en `src/main`.

La persistencia relacional propia permanece sobre:

```text
JpaRepository
Hibernate / JPA
PostgreSQL
```

Esto cumple la decisión arquitectónica del proyecto.

---

# 3. Flyway/Liquibase fuera del runtime

No se encontraron dependencias runtime de:

```text
flyway-core
flyway-database-postgresql
liquibase
```

Esto está alineado con la arquitectura definida.

---

# 4. Rutas duplicadas

La extracción estática de mappings no encontró duplicados obvios por combinación:

```text
HTTP METHOD + PATH
```

La duplicación pública anterior de:

```text
GET /api/proyectos
GET /api/proyectos/{slug}
```

ya no está presente.

---

# 5. Legacy

No se encontraron referencias activas en `src/main` a:

```text
noticias
migrationStatus
originalSource
```

Los scripts:

```text
generate_backend.ps1
generate_service.ps1
migration-script-supabase.sql
```

también dejaron de estar presentes.

---

# 6. CRÍTICO — `schema-final.sql` todavía no está 100 % sincronizado

El walkthrough afirma:

```text
Reconciliación 100 % de schema-final.sql
```

pero el ZIP no lo demuestra.

Se detectaron incompatibilidades concretas.

---

# 7. `user_identities.updated_at`

Entidad:

```java
@Column(name = "updated_at", nullable = false)
private Instant updatedAt;
```

El `schema-final.sql` crea `user_identities` con:

```text
id
user_id
provider
provider_subject
created_at
```

pero no:

```text
updated_at
```

## Impacto

Hibernate `ddl-auto=validate` puede rechazar el esquema.

Además, la Entity intenta persistir `updated_at`.

## Acción

Añadir:

```sql
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

al baseline y entregar DDL manual para la BD existente.

---

# 8. `representation_items.last_update`

Entidad:

```java
@Column(name = "last_update")
private Instant lastUpdate;
```

La columna no existe en `representation_items` del baseline.

## Acción

Añadir:

```sql
last_update TIMESTAMPTZ
```

---

# 9. `representation_actions` no coincide con JPA

Entidad:

```java
@JoinColumn(name = "representation_id", nullable = false)
private RepresentationItem representation;

@Column(name = "description", nullable = false)
private String description;

@Column(name = "display_order", nullable = false)
private Integer displayOrder;
```

El SQL actual usa:

```text
representation_item_id
title NOT NULL
description
action_date
display_order
```

## Problemas

### Nombre FK incorrecto

JPA:

```text
representation_id
```

SQL:

```text
representation_item_id
```

### Columna obligatoria inexistente en Entity

SQL exige:

```text
title NOT NULL
```

pero `RepresentationAction` no tiene `title`.

Una inserción desde JPA no podría satisfacer esa columna.

## Acción

Recrear/reconciliar la tabla para que represente la Entity actual o modificar explícitamente el dominio si se desea conservar `title`.

No dejar ambos contratos divergentes.

---

# 10. `team_social_links.display_order`

Entidad:

```java
@Column(name = "display_order", nullable = false)
private Integer displayOrder;
```

El SQL actual crea:

```text
id
team_member_id
platform
url
```

pero no:

```text
display_order
```

## Acción

Agregar:

```sql
display_order INT NOT NULL DEFAULT 0
```

---

# 11. `polls.show_results`

Entidad:

```java
@Column(name = "show_results", nullable = false)
private Boolean showResults = false;
```

No existe en el baseline.

Debe añadirse.

---

# 12. `polls.featured`

Entidad:

```java
@Column(name = "featured", nullable = false)
private Boolean featured = false;
```

No existe en el baseline.

Debe añadirse.

---

# 13. Columnas históricas de `polls`

El SQL mantiene:

```text
require_student_code
max_responses_per_user
```

pero la Entity `Poll` actual no las mapea.

Una columna extra nullable/default no necesariamente rompe Hibernate validate, pero representa deuda de modelo.

Debe decidirse:

```text
se conservan deliberadamente
```

o:

```text
se eliminan del baseline
```

No deben quedar por accidente.

---

# 14. Resultado del schema

Por tanto:

```text
Schema sincronizado: NO
```

La afirmación del walkthrough:

```text
Schema sincronizado: SÍ
```

es incorrecta para el ZIP revisado.

---

# 15. CRÍTICO — `ProjectAdminService` no coincide con sus DTO

Este es uno de los hallazgos más importantes.

## ProjectPublicResponse

El DTO declara:

```java
List<String> eventIds
```

pero `ProjectAdminService` construye:

```java
List<UUID> eventIds = eventRepository.findByProjectId(...)
```

y lo pasa directamente al constructor.

Conceptualmente:

```text
List<UUID> -> List<String>
```

no es compatible.

Esto es un error de tipos de compilación.

---

# 16. `ProjectAdminResponse` también está desalineado

El record declara:

```java
List<ProjectEventReferenceResponse> linkedEvents,
List<MediaAssetResponse> gallery,
```

pero el mapper hace:

```java
List.of(), eventIds
```

donde `eventIds` es:

```java
List<UUID>
```

Por tanto se intenta colocar:

```text
List<UUID>
```

en el parámetro:

```text
List<MediaAssetResponse>
```

Esto también es incompatible.

---

# 17. El `BUILD SUCCESS` del walkthrough no es reproducible

Se intentó ejecutar:

```bash
./mvnw -DskipTests compile
```

sin tests.

El wrapper no pudo descargar Maven por restricción de red en el entorno de auditoría.

Por ello no se pudo reproducir Maven.

Sin embargo, las incompatibilidades genéricas anteriores son visibles directamente en código fuente y deben corregirse antes de aceptar el supuesto `BUILD SUCCESS`.

---

# 18. `linkedEventIds` sigue sin persistirse

Los DTO reciben:

```java
List<UUID> linkedEventIds
```

en:

```text
CreateProjectRequest
UpdateProjectRequest
```

pero `ProjectAdminService.create()` y `update()` no utilizan:

```text
input.linkedEventIds()
```

No existe lógica para:

```text
asignar event.project_id
desvincular eventos
validar IDs
persistir relaciones
```

## Lo que sí existe

El mapper consulta:

```java
eventRepository.findByProjectId(project.getId())
```

Eso solo **lee relaciones existentes**.

No implementa la vinculación solicitada por el request.

## Estado

```text
FASE 5 - linkedEventIds: NO CERRADA
```

---

# 19. `UpdateProjectRequest` sigue conteniendo inputs ignorados

Continúan:

```text
contentStatus
displayOrder
linkedEventIds
```

pero el `update()` principal no los aplica.

Si existen endpoints dedicados para estado y reordenamiento, eliminar:

```text
contentStatus
displayOrder
```

del request general.

Para `linkedEventIds`, implementar realmente o eliminar.

---

# 20. Slug de Project sí mejoró

Se conserva el título anterior antes de modificar:

```java
String previousTitle = project.getTitle();
```

y el slug se regenera mientras no esté publicado.

Este punto está bien corregido conceptualmente.

---

# 21. Admin Project write path — cierre parcial

`AdminContentService` ya lanza:

```java
UnsupportedOperationException
```

para mutaciones de `PROJECTS`.

Eso evita que el servicio genérico escriba directamente.

Sin embargo la ruta genérica continúa existiendo:

```text
POST /api/admin/content/projects
PUT /api/admin/content/projects/{id}
DELETE /api/admin/content/projects/{id}
```

El `GlobalExceptionHandler` no tiene handler específico para `UnsupportedOperationException`.

Resultado esperado:

```text
500 INTERNAL_ERROR
```

si algún cliente llama la ruta legacy.

## Recomendación

No dejar rutas deliberadamente rotas.

Elegir:

### Preferido

Eliminar `projects` del controller/routing genérico.

### Temporal

Responder:

```text
404
410
400
```

controlado, o delegar al `ProjectAdminService`.

No usar `UnsupportedOperationException` como contrato HTTP.

---

# 22. Rate limit — ventanas reales sí fueron añadidas

`LoginAttempt` contiene ahora:

```text
window_started_at
```

y la lógica considera duración de ventana.

Eso es una mejora correcta.

---

# 23. CRÍTICO — Retry del LoginAttempt sigue dentro de una sola transacción

Actualmente:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void recordFailureInNewTransaction(...) {
    for (...) {
        try {
            ...
        } catch (...) {
            // retry
        }
    }
}
```

El `REQUIRES_NEW` se aplica al método completo.

Por tanto:

```text
retry 1
retry 2
retry 3
```

ocurren dentro de la misma transacción.

Después de un conflicto de integridad, esa transacción puede quedar marcada como rollback-only.

Capturar la excepción no crea una nueva transacción.

## Arquitectura correcta

```text
LoginAttemptService
      ↓
retry loop
      ↓
LoginAttemptPersistenceService.tryOnce()
      ↓
@Transactional(REQUIRES_NEW)
```

Cada retry debe invocar nuevamente el bean Spring.

---

# 24. SharedRateLimit tiene el mismo problema

`RateLimitPersistenceService.consumeInNewTransaction()` también contiene el loop dentro del método transaccional.

Debe aplicar la misma corrección.

---

# 25. Newsletter — el aislamiento todavía es incorrecto

`NewsletterPersistenceService` hace:

```java
@Transactional(REQUIRES_NEW)
public NewsletterSubscription subscribeInNewTransaction(...) {
    try {
        saveAndFlush(...)
    } catch (DataIntegrityViolationException ex) {
        return repository.findByEmail(...)
    }
}
```

El `catch` ocurre dentro de la misma transacción que sufrió la excepción.

Eso puede terminar con:

```text
UnexpectedRollbackException
```

o una transacción marcada rollback-only.

---

# 26. Newsletter tiene además un fallback no persistido

Si después del conflicto no encuentra el registro:

```java
return repository.findByEmail(cleanEmail).orElseGet(() -> {
    NewsletterSubscription fallback = new NewsletterSubscription();
    fallback.setId(UUID.randomUUID());
    ...
    return fallback;
});
```

Ese `fallback`:

```text
NO se guarda
```

pero el controller responde con:

```text
fallback.getId()
```

El cliente podría recibir un ID de suscripción que no existe en la base.

## Esto debe corregirse.

---

# 27. Async AFTER_COMMIT — bien implementado

El flujo:

```text
save TeamApplication
publish event
commit
@TransactionalEventListener(AFTER_COMMIT)
```

es una mejora correcta.

---

# 28. Executor acotado — implementado

Existe:

```text
notificationExecutor
core = 2
max = 5
queue = 100
```

Esto es mejor que un executor no limitado.

---

# 29. `EmailNotificationService` conserva `@Async`

El listener ya tiene:

```java
@Async("notificationExecutor")
```

pero el método llamado también tiene:

```java
@Async
public void sendTeamApplicationNotification(...)
```

Esto genera doble capa async innecesaria.

Arquitectura preferida:

```text
AFTER_COMMIT listener
    + @Async("notificationExecutor")
        ↓
EmailNotificationService síncrono internamente
```

Eliminar `@Async` del método del servicio.

Así el executor utilizado queda controlado explícitamente por el listener.

---

# 30. Team `featured` sigue ignorado

Controller:

```java
GET /api/equipo?featured=...
```

Service recibe:

```java
team(Boolean featured, ...)
```

pero repository call:

```java
findPublicTeam(cursor, pageable)
```

no utiliza `featured`.

La Entity actual tampoco tiene `featured`.

## Acción

Eliminar el parámetro si dejó de existir en el dominio.

No mantener un query parameter silenciosamente ignorado.

---

# 31. Team imageUrl sí fue implementado

El mapper ahora resuelve:

```text
imageMediaId -> MediaAsset.url
```

Este punto está implementado.

---

# 32. N+1 potencial en Team

Por cada miembro:

```java
mediaAssetRepository.findById(...)
```

puede generar una query adicional.

Para pocos integrantes puede tolerarse.

A futuro conviene resolver IDs en batch.

No es bloqueante.

---

# 33. Representation evidence — funcional pero con riesgo de privacidad

El mapper obtiene cada evidencia:

```text
media_asset_id
    ↓
MediaAsset.url
```

y la devuelve directamente en:

```text
evidenceUrls
```

Sin embargo el storage define un bucket privado:

```text
representation-evidence
```

y los assets privados requieren URL firmada a través de:

```text
/api/media/{id}/signed-url
```

que además es ADMIN-only.

## Problema

El response público:

```text
/api/representacion/**
```

no debería devolver sin criterio la URL raw de un asset privado.

Aunque la URL no sea públicamente descargable, expone la ruta de almacenamiento y el contrato queda inconsistente.

## Decisión necesaria

Si evidencia es privada:

```text
NO incluir evidenceUrls en API pública
```

o crear un mecanismo público autorizado/firmado según política.

Si evidencia debe ser pública:

almacenarla como asset público.

No mezclar ambos conceptos.

---

# 34. N+1 en Representation evidence

Cada evidencia ejecuta:

```java
mediaAssetRepository.findById(...)
```

También puede causar N+1.

No es el principal problema; primero resolver privacidad.

---

# 35. Bug de semántica en GET `/api/eventos`

El controller expone:

```text
?status=
```

pero `PublicContentService` pasa ese valor a:

```java
EventRepository.findPublicContent(...)
```

cuyo primer filtro es:

```java
e.modality = :modality
```

Por tanto:

```text
status
```

realmente filtra:

```text
modality
```

Esto es un bug de contrato API.

Elegir:

```text
?modality=
```

o cambiar repository para filtrar `eventStatus`.

---

# 36. Mismo problema en oportunidades

Controller:

```text
/api/oportunidades?status=
```

pero repository filtra:

```java
o.opportunityType = :opportunityType
```

Por tanto `status` realmente funciona como tipo.

Elegir:

```text
?type=
```

o filtrar `opportunityStatus`.

---

# 37. Packaging seguro NO está cerrado

El ZIP actual contiene:

```text
logs/backend.out.log
logs/backend.err.log
```

Esto contradice:

```text
Artifacts inseguros: 0 hallazgos
```

del walkthrough.

---

# 38. `package-backend.ps1` no está en el ZIP

El walkthrough afirma que fue fortalecido.

Sin embargo el artefacto revisado no contiene:

```text
package-backend.ps1
```

No puede verificarse su implementación.

Además, el hecho de que los logs estén dentro del ZIP indica que:

```text
el paquete entregado no pasó por un filtro efectivo
```

o el filtro no cubre el directorio `logs/`.

---

# 39. `.gitignore` y `.dockerignore`

Ambos excluyen:

```text
*.log
```

pero `.gitignore` no evita que un ZIP manual incluya archivos.

El packaging debe aplicar exclusiones propias.

---

# 40. Static gate incompleto

`check-architecture.ps1` verifica correctamente:

```text
JDBC
Flyway deps
scripts temporales
```

pero no verifica realmente:

```text
logs empaquetados
.env del ZIP
rutas duplicadas
schema ↔ JPA
compile status
Spring Boot version
```

Por tanto el resumen:

```text
Architecture Gate PASSED
```

no debe interpretarse como auditoría completa.

---

# 41. Spring Boot phase 10 no se ejecutó

`pom.xml` sigue usando:

```xml
<version>3.4.3</version>
```

Por tanto la fase:

```text
Upgrade Spring Boot
```

no fue realizada en el ZIP.

---

# 42. Hallazgos por severidad

## BLOQUEANTES

1. `schema-final.sql` sigue incompatible con JPA.
2. `ProjectAdminService` tiene incompatibilidades de tipos con DTO.
3. `linkedEventIds` no se persiste.
4. Retry JPA ocurre dentro de la misma transacción.
5. Newsletter maneja conflicto dentro de transacción fallida.
6. Newsletter puede devolver un ID no persistido.

## ALTOS

7. Representation evidence pública usa URLs raw de assets potencialmente privados.
8. Project write path genérico sigue accesible y termina en 500.
9. Packaging incluye logs.

## MEDIOS

10. Team `featured` ignorado.
11. Event `status` filtra `modality`.
12. Opportunity `status` filtra `opportunityType`.
13. Doble `@Async`.
14. N+1 de multimedia.
15. Static gate no valida todo lo que reporta.

## PENDIENTE ESTRUCTURAL

16. Spring Boot sigue en 3.4.3.
17. `AdminContentService` continúa como capa legacy para varios dominios.

---

# 43. Qué corregir primero

Orden recomendado:

```text
1. Project mapper/DTO para recuperar compilación real
2. schema-final.sql
3. retry transaccional rate limit
4. newsletter concurrency
5. linkedEventIds
6. retirar Project del generic controller
7. política de Representation evidence
8. Event/Opportunity public filters
9. team featured
10. packaging
11. static gate
12. Spring Boot
```

---

# 44. Estado arquitectónico

La arquitectura objetivo continúa siendo viable:

```text
Controller por feature
    ↓
Application/Domain Service
    ↓
JpaRepository
    ↓
Hibernate
    ↓
PostgreSQL
```

No se recomienda:

```text
volver a JDBC
volver a Flyway
usar ddl-auto=update
migrar a microservicios
```

---

# 45. ¿Se puede seguir desarrollando?

Sí, pero no conviene agregar nuevas entidades o cambios de esquema antes de corregir:

```text
Project compile contract
schema-final.sql
rate limit transaction retry
newsletter transaction handling
```

Una vez cerrados esos cuatro bloques, el backend vuelve a estar en una base razonable para desarrollo funcional.

---

# 46. Conclusión

El walkthrough refleja varias mejoras reales, pero el artefacto no cumple todavía el estado:

```text
PLAN DE CIERRE COMPLETADO
```

La clasificación más correcta es:

```text
CIERRE ARQUITECTÓNICO: PARCIAL
JPA: BIEN ORIENTADO
SCHEMA: NO APROBADO
CONCURRENCIA: NO APROBADA
PROJECT: REGRESIÓN DE TIPOS
PACKAGING: NO APROBADO
DESARROLLO FUTURO: VIABLE TRAS CORREGIR BLOQUEANTES
```
