# FASE 3 — Persistencia y migraciones
# Documento de continuación de implementación para Antigravity
# Proyecto: Fuerza UPT

**Raíz de trabajo:** `D:\ProyectoWebFuerzaUPT`
**Backend:** `D:\ProyectoWebFuerzaUPT\backend`
**Skills instaladas:** `D:\ProyectoWebFuerzaUPT\.opencode\skill-archives`
**Fase anterior:** Fase 2 — Contratos API canónicos — completada y verificada al 100%, decisión `GO_PHASE_3` (ver `docs/execution/PHASE_2_REPORT.md`)
**Esta fase:** Fase 3 según `PLAN_CORRECCION_PRIORIZADO.md` y `PLAN_MAESTRO_PULIDO_TOTAL_FUERZA_UPT.md` (ambos coinciden: Fase 3 = Persistencia/migraciones)
**Fuente de la evidencia:** inspección directa de `backend/src/main/resources/db/migration/*.sql`, `backend/src/main/resources/application.yml`, `backend/pom.xml`, `backend/src/test/**` y `backend/src/main/java/.../project/repository/ProjectRepository.java` reales.

---

## 0. Cómo usar este documento

Este documento reemplaza a la sección genérica de Fase 3 del plan maestro. La auditoría original marcaba el drift V15/V24 como "posible" (FUPT-006). Al abrir las migraciones reales se confirmó que **sí existe drift real y localizado**, con la causa exacta identificada. Este documento parte de esa evidencia, no de la sospecha original.

---

## 1. Precondición ya satisfecha

- Fase 2 cerrada en verde: Maven test 16/16 PASSED, Maven verify BUILD SUCCESS, TypeScript 0 errores, ESLint 0 errores/0 advertencias, Next build 28/28 páginas.
- Contratos administrativos de oportunidades y proyectos consolidados; `AdminStatusResponse` y `CsrfTokenResponse` tipados; módulo de noticias con página admin.
- No repetir Fase 0/1/2.

---

## 2. Skills a cargar para esta fase

Desde `D:\ProyectoWebFuerzaUPT\.opencode\skill-archives`, en este orden:

1. `jpa-postgres-flyway` — skill principal de esta fase.
2. `testing-quality-gate` — para incorporar y ejecutar la validación con Testcontainers.

No cargar `spring-security-admin`, `media-storage-manager`, `next-api-integration` ni `spring-module-builder`: no hay trabajo de seguridad, storage, frontend ni límites modulares en el alcance de Fase 3.

---

## 3. Alcance de esta fase

### Sí incluye

- Corregir el drift real confirmado entre `V15__complete_content_schema.sql` y `V24__normalize_projects_module.sql` (sección 4, hallazgo H1) mediante una **migración nueva**, nunca modificando las ya aplicadas.
- Incorporar Testcontainers al backend para poder validar migraciones contra una PostgreSQL real y desechable, sin depender de credenciales de Supabase ni de un entorno no productivo externo.
- Crear al menos una prueba de integración que ejecute Flyway desde `V1` hasta la migración nueva sobre una base vacía y verifique el esquema final de las tablas afectadas.
- Actualizar `docs/baseline/DB_SCHEMA_BASELINE.md` reflejando lo que sí quedó validado (esquema vacío vía Testcontainers) y lo que sigue pendiente (base representativa real).
- Generar el reporte de fase.

### No incluye

- Conectarse a PostgreSQL de producción ni a Supabase real.
- Modificar `V1` a `V25`: son migraciones ya aplicadas y son inmutables por regla del proyecto.
- Implementar la funcionalidad de galería de proyectos en frontend/backend (eso depende de la Fase 5, ver hallazgo H4). Esta fase solo deja el esquema de `project_gallery` correcto y consistente para cuando esa funcionalidad se construya.
- Tocar `SupabaseStorageService`, media o storage — eso es Fase 5/6.
- Añadir `ddl-auto=update` bajo ninguna circunstancia; `ddl-auto=validate` se mantiene.

---

## 4. Hallazgos confirmados en el código real

### H1 — Drift real confirmado entre V15 y V24 (no solo "posible" como decía la auditoría original)

`V24__normalize_projects_module.sql` usa `CREATE TABLE IF NOT EXISTS` para cuatro tablas que **`V15__complete_content_schema.sql` ya había creado antes, con un esquema distinto**. Como Flyway aplica las migraciones en orden y V15 se ejecuta antes que V24, las sentencias `CREATE TABLE IF NOT EXISTS` de V24 se convierten en **no-op silenciosos** sobre cualquier base que haya corrido ambas migraciones en secuencia normal. El resultado es que ninguna base real que siguió el camino V1→V25 tiene realmente el esquema que V24 pretendía dejar.

Diferencias verificadas tabla por tabla:

| Tabla | Esquema real aplicado (de V15, gana por ser no-op en V24) | Esquema que V24 intentaba dejar (nunca se aplicó) |
|---|---|---|
| `project_gallery` | `id, project_id, image_url TEXT NOT NULL, display_order` | `id, project_id, media_asset_id UUID NOT NULL REFERENCES media_assets(id), alternative_text VARCHAR(255), display_order`, más `CHECK (display_order >= 0)` |
| `project_results` | `id, project_id, description TEXT NOT NULL, display_order` | `description VARCHAR(500) NOT NULL`, más `CHECK (display_order >= 0)` |
| `project_responsibles` | `id, project_id, name VARCHAR(255), display_order` (sin CHECK) | mismo esquema de columnas, pero con `CHECK (display_order >= 0)` |
| `project_partners` | `id, project_id, name VARCHAR(255), display_order` (sin CHECK) | mismo esquema de columnas, pero con `CHECK (display_order >= 0)` |

Importante — lo que **sí** se aplicó correctamente de V24, porque son `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` sobre una tabla existente (no `CREATE TABLE IF NOT EXISTS`), y por tanto no sufren este problema:

- `projects.cover_media_id` y `projects.cover_alt_text`: confirmado que se aplicaron y que `ProjectRepository.java` ya los usa activamente (`LEFT JOIN media_assets m ON m.id = p.cover_media_id`, líneas 68/83/146/163).
- Los `CHECK` sobre la propia tabla `projects` (`chk_projects_display_order`, `chk_projects_dates`, `chk_projects_status`, `chk_projects_content_status`): usan `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT`, patrón que sí es idempotente y correcto, y sí se aplicó.

**El problema está acotado exclusivamente a las 4 tablas satélite creadas con `CREATE TABLE IF NOT EXISTS` en V24.**

Impacto actual: `ProjectRepository.java` consulta `project_results.description` (funciona en ambos esquemas, es compatible) pero **no consulta todavía `project_gallery.media_asset_id`** en ningún punto — la galería de proyectos no está conectada a media todavía. Esto no ha causado una falla visible porque nadie ejerce esa ruta aún, pero es una bomba de tiempo para cuando se construya la funcionalidad de galería (Fase 5): el código se escribiría contra el esquema de V24 (`media_asset_id`) mientras la base real tiene el esquema de V15 (`image_url`).

**Acción de esta fase:** crear `V26__reconcile_project_satellite_tables.sql` (roll-forward, no tocar V15 ni V24) que:
1. Para `project_gallery`: agregar `media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE` y `alternative_text VARCHAR(255)` con `ADD COLUMN IF NOT EXISTS`. Decidir y documentar explícitamente qué pasa con la columna heredada `image_url` (mantenerla para no perder datos existentes, o migrarla a un `media_asset` y luego marcarla deprecada — no eliminarla en esta fase sin inventario de datos reales, que sigue bloqueado).
2. Para `project_results`: evaluar si ampliar `description` de `TEXT` a `VARCHAR(500)` es seguro (puede truncar datos existentes más largos que 500 caracteres). Si no se puede verificar por falta de acceso a datos reales, **no reducir el tipo**; documentar la decisión y dejar `TEXT`.
3. Para las cuatro tablas: agregar los `CHECK (display_order >= 0)` faltantes usando el patrón idempotente ya usado en V24 (`DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT`), que si es seguro y correcto.
4. No usar `CREATE TABLE IF NOT EXISTS` para nada en esta migración nueva — todas las tablas ya existen; usar siempre `ALTER TABLE` explícito para que un fallo sea visible en vez de silencioso.

### H2 — Cero cobertura de integración de persistencia

`backend/pom.xml` no declara ninguna dependencia de Testcontainers ni de H2. Los 16 tests que pasan en Fase 2 (`LoginAttemptServiceTest`, `GlobalExceptionHandlerTest`, `SupabaseStorageServiceTest`, `ClientIpResolverTest`, `PrivacyHashServiceTest`, `SharedRateLimitServiceTest`, `TeamMemberServiceTest`) son **pruebas unitarias puras**, ninguna levanta un contexto Spring con base de datos real ni ejecuta Flyway. Es decir: **hoy no existe ninguna prueba automatizada que ejecute las migraciones**, ni siquiera contra una base vacía. El `BUILD SUCCESS` de Maven no implica que las migraciones sean correctas, solo que el código compila y las pruebas unitarias existentes pasan.

**Acción de esta fase:** agregar a `pom.xml`, en `<dependencies>` con `<scope>test</scope>`:

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

Verificar la versión gestionada por el BOM de Spring Boot que ya usa el proyecto (Spring Boot 3.3) en vez de fijar una versión suelta.

### H3 — La línea base de esquema sigue bloqueada, pero no todo depende de eso

`docs/baseline/DB_SCHEMA_BASELINE.md` sigue en estado `BLOQUEADO`: no hay conexión disponible a una instancia PostgreSQL real ni no productiva, y el plan prohíbe conectarse a producción.

**Aclaración importante para esta fase:** Testcontainers no depende de Supabase ni de ningún entorno no productivo externo — levanta su propia instancia de PostgreSQL desechable en Docker, local a la máquina donde corre la build. Por tanto, **la validación de que las migraciones corren limpio de punta a punta (`V1` → `V26`) sí se puede hacer en esta fase**, sin esperar a que se resuelva el acceso a un entorno no productivo.

Lo que sigue bloqueado y **no** se resuelve en esta fase es la validación contra una base **representativa** (con volumen y forma de datos reales), que es distinta de una base vacía. Eso requiere seguir esperando una fuente no productiva autorizada.

**Acción:** actualizar `DB_SCHEMA_BASELINE.md` para separar ambos estados explícitamente: "Esquema vacío: VALIDADO vía Testcontainers en Fase 3" vs. "Esquema representativo con datos reales: sigue BLOQUEADO".

### H4 — Confirmación: la galería de proyectos no está conectada todavía (coherente con el stub de Fase 5)

Ya se había confirmado en Fase 2 que `frontend/src/app/administracion/proyectos/nuevo/page.tsx` y `.../[id]/editar/page.tsx` declaran explícitamente que el formulario completo (que incluiría galería) se implementa en la Fase 5. Ahora se confirma también en el backend: ninguna consulta en `ProjectRepository.java` referencia `project_gallery.media_asset_id`. Es consistente, no es una incongruencia nueva — solo confirma que el esquema debe quedar correcto ahora para que Fase 5 no herede el drift de H1.

---

## 5. Tareas concretas de la fase, en orden

1. Backend: crear `backend/src/main/resources/db/migration/V26__reconcile_project_satellite_tables.sql` con las correcciones de H1.
2. Backend: agregar Testcontainers (`postgresql`, `junit-jupiter`) a `pom.xml` en scope test (H2).
3. Backend: crear una clase de prueba de integración (por ejemplo `FlywayMigrationIntegrationTest`) que:
   - Levante un contenedor `postgres:16` (o la versión que se confirme en uso) vía Testcontainers.
   - Ejecute Flyway `migrate()` desde `V1` hasta `V26` contra ese contenedor vacío.
   - Verifique con una consulta simple que `project_gallery` tiene las columnas `media_asset_id` y `alternative_text`, que `project_results.description` mantiene el tipo decidido, y que los cuatro `CHECK (display_order >= 0)` existen.
   - Ejecute `flyway.validate()` al final y falle la prueba si no es válido.
4. Ejecutar los gates de calidad (sección 7).
5. Actualizar `docs/baseline/DB_SCHEMA_BASELINE.md` (H3).
6. Redactar `docs/execution/PHASE_3_REPORT.md`.

---

## 6. Reglas no negociables aplicables a esta fase

- No modificar `V1` a `V25`: son migraciones ya aplicadas, se tratan como inmutables.
- La corrección va exclusivamente en una migración nueva (`V26`), roll-forward.
- No usar `CREATE TABLE IF NOT EXISTS` en la migración nueva para tablas que ya existen — usar `ALTER TABLE` explícito.
- No reducir el tamaño de una columna (`TEXT` → `VARCHAR(n)`) sin poder verificar que ningún dato real la excede; ante la duda, no reducir.
- No usar `ddl-auto=update`.
- No conectarse a PostgreSQL de producción ni a Supabase real en ningún paso de esta fase.
- No declarar `flyway validate` como aprobado si no se ejecutó realmente contra un contenedor.
- No borrar `image_url` de `project_gallery` sin inventario de datos reales — mantenerla hasta que exista esa evidencia.
- Cada cambio de esquema debe quedar documentado en el propio archivo de migración con comentarios que expliquen el porqué (siguiendo el estilo ya usado en `V25`).

---

## 7. Pruebas obligatorias antes de cerrar la fase

- `.\mvnw.cmd -q test` — debe incluir ahora la nueva prueba de integración con Testcontainers, no solo las 16 unitarias previas.
- `.\mvnw.cmd -q verify`
- Confirmar en el log de la prueba de integración que Flyway aplicó exactamente `V1` a `V26` sin errores sobre el contenedor vacío.
- Confirmar que `flyway.validate()` no reporta discrepancias.
- Requiere Docker disponible en el entorno de build; si no está disponible, declarar el resultado como `BLOCKED` explícitamente (nunca simular el resultado como `PASSED`).

---

## 8. Definition of Done de la Fase 3

```text
[ ] V26__reconcile_project_satellite_tables.sql creada, sin tocar V1-V25
[ ] project_gallery tiene media_asset_id y alternative_text aplicados de verdad
[ ] project_results, project_responsibles, project_partners con CHECK (display_order >= 0)
[ ] Decisión documentada sobre image_url (se mantiene) y sobre el tipo de description
[ ] Testcontainers agregado a pom.xml en scope test
[ ] Prueba de integración ejecuta Flyway V1→V26 sobre base vacía y valida esquema
[ ] flyway.validate() PASSED contra el contenedor de prueba
[ ] DB_SCHEMA_BASELINE.md actualizado distinguiendo esquema vacío (validado) de esquema representativo (sigue bloqueado)
[ ] Maven test/verify PASSED
[ ] docs/execution/PHASE_3_REPORT.md creado
[ ] Decisión final: GO_PHASE_4 | CONDITIONAL_GO | NO_GO
```

No avanzar a Fase 4 (límites arquitectónicos / romper el ciclo modular) si el resultado es `NO_GO`.

---

## 9. Formato de reporte obligatorio

Crear `docs/execution/PHASE_3_REPORT.md`:

```md
# Phase 3 Report

## Scope
## Skills loaded
## Baseline
## Files created
## Files modified
## Files deleted
## Migrations created
## H1-H4: resolución de cada hallazgo
## Tests executed
## Test results
## Risks
## Rollback
## Residual debt
## Decision: GO_PHASE_4 | CONDITIONAL_GO | NO_GO
```

---

## 10. Rollback

- `V26` es aditiva (agrega columnas y constraints), no destructiva: no elimina ni renombra nada existente.
- Si algo falla antes de aplicarse en un entorno real, el rollback es simplemente no desplegar el archivo de migración (todavía no se conectó a ningún Postgres real en esta fase, todo se valida vía Testcontainers).
- No usar `DROP` como mecanismo de rollback automático, tal como exige la regla general del proyecto.
- Para revertir el resto de cambios (pom.xml, test nuevo), restaurar desde el backup o el commit/snapshot previo a esta fase.

---

## 11. Prompt copiable para Antigravity

```text
Trabaja en D:\ProyectoWebFuerzaUPT.

Especificación principal de esta sesión:
FASE_3_PERSISTENCIA_MIGRACIONES_PROMPT_ANTIGRAVITY.md

Contexto adicional obligatorio:
PLAN_MAESTRO_PULIDO_TOTAL_FUERZA_UPT.md
PLAN_CORRECCION_PRIORIZADO.md
docs/baseline/DB_SCHEMA_BASELINE.md
docs/execution/PHASE_2_REPORT.md
AGENTS.md

Skills a cargar desde D:\ProyectoWebFuerzaUPT\.opencode\skill-archives:
1. jpa-postgres-flyway
2. testing-quality-gate

REGLAS
1. Ejecutar solo el alcance de la sección 3 de FASE_3_PERSISTENCIA_MIGRACIONES_PROMPT_ANTIGRAVITY.md.
2. No modificar ninguna migración V1 a V25: son inmutables.
3. La corrección de drift va exclusivamente en una migración nueva V26, roll-forward.
4. No conectarse a PostgreSQL de producción ni a Supabase real.
5. No usar ddl-auto=update.
6. Agregar Testcontainers y crear una prueba de integración real que ejecute Flyway
   de punta a punta contra un contenedor Postgres vacío; si Docker no está
   disponible, declarar el resultado BLOCKED, nunca simular un PASSED.
7. Resolver los hallazgos H1 a H4 en el orden de la sección 5.
8. No continuar si algún gate de calidad falla.
9. Crear docs/execution/PHASE_3_REPORT.md con el formato de la sección 9.
10. Terminar con una decisión explícita: GO_PHASE_4, CONDITIONAL_GO o NO_GO.
11. No avanzar a Fase 4 sin autorización explícita del usuario.

COMIENZA inspeccionando V15__complete_content_schema.sql y
V24__normalize_projects_module.sql para confirmar tú mismo el drift descrito
en la sección 4 (hallazgo H1) antes de escribir la migración V26.
```
