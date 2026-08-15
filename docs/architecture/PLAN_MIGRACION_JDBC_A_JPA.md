# PLAN MAESTRO — Migración completa de JDBC a JPA/Hibernate
# Fuerza UPT — Backend
# Documento de continuación de implementación para Antigravity

**Raíz de trabajo:** `D:\ProyectoWebFuerzaUPT\backend`
**Skills instaladas:** `D:\ProyectoWebFuerzaUPT\.opencode\skill-archives`
**Precondición:** Fase 3 (Persistencia y migraciones) confirmada de verdad — archivo `V26__reconcile_project_satellite_tables.sql` verificado en disco por ti mismo, backend arrancado con log de Flyway en `v26`, sin excepciones. **No empieces esto si eso todavía no está confirmado.**
**Decisión del usuario:** migrar el 100% del backend a JPA/Hibernate, aceptando que es un esfuerzo de alto riesgo y múltiples fases.

---

## 0. Por qué este documento existe y cómo se diferencia de las fases anteriores

Las Fases 1, 2 y 3 fueron acotadas: un archivo, un contrato, una migración. Esto es distinto: son **~14 archivos, más de 100 puntos de acceso a datos, en casi todos los módulos del backend**. Tratarlo como una sola fase de un salto es exactamente el tipo de cosa que ya salió mal una vez en este proyecto (la Fase 3 se reportó como completada sin que el archivo existiera). Por eso este documento no es una fase — es un **plan maestro con sub-fases**, una por módulo, cada una con su propio reporte y su propio gate de verificación humano antes de pasar a la siguiente.

**Regla de oro de todo este plan:** ningún módulo se da por migrado porque el reporte lo diga. Se da por migrado cuando tú, el usuario, verificaste en disco que las clases `@Entity` existen, que el backend arrancó sin excepciones de Hibernate, y que probaste manualmente el módulo en la app.

---

## 1. Inventario real del problema

Confirmado por inspección directa del código (no por la documentación):

| Archivo | Módulo | Llamadas JDBC directas |
|---|---|---|
| `admin/service/AdminContentService.java` | admin (motor genérico multi-módulo) | 25 |
| `poll/service/PollService.java` | encuestas | 28 |
| `team/service/TeamMemberService.java` | equipo | 13 |
| `content/service/PublicContentService.java` | contenido público agregado | 8 |
| `submission/controller/PublicSubmissionController.java` | formularios públicos | 8 |
| `admin/service/AdminOperationsService.java` | operaciones admin | 7 |
| `admin/service/AdminDashboardService.java` | dashboard admin | 3 |
| `settings/service/SiteSettingsService.java` | configuración del sitio | 2 |
| `admin/service/AuditLogService.java` | auditoría | 1 |
| `project/repository/ProjectRepository.java` | proyectos | varias (ya con V26 aplicado encima) |
| `opportunity/service/OpportunityAdminService.java` | oportunidades | JDBC en clases relacionadas |
| `auth/service/LoginAttemptService.java` | intentos de login | JDBC |
| `media/service/SupabaseStorageService.java` | media | JDBC (parcial, fuera de alcance de esta migración — ver sección 3) |

**Único código ya en JPA real:** `auth/repository/UserRepository.java` y `auth/repository/RoleRepository.java`, con las entidades `auth/entity/User.java` y `auth/entity/Role.java`, que además ya siguen un patrón reutilizable (`AuditableEntity` con `@CreatedDate`/`@LastModifiedDate` vía `AuditingEntityListener`). **Ese patrón es la base a replicar**, no hay que inventar uno nuevo.

**Tablas por módulo** (de las migraciones reales, para que cada sub-fase sepa exactamente qué entidades construir):

- `security`/`auth`: `roles`, `users`, `user_roles` — YA MIGRADO.
- `session`: tablas de sesión (Spring Session JDBC — **no migrar**, ver sección 3).
- `media`: `media_assets`.
- `representation`: `representation_items`, `representation_actions`, `representation_evidence`.
- `project`: `projects`, `project_responsibles`, `project_partners`, `project_results`, `project_gallery`.
- `event`: `events`, `event_speakers`, `event_registrations`.
- `opportunity`: `opportunities`, `opportunity_benefits`, `opportunity_requirements`.
- `news`: `news_items`.
- `team`: `team_members`, `team_social_links`.
- `statistics`: `statistics`.
- `forms públicos`: `contact_messages`, `student_proposals`, `team_applications`, `newsletter_subscriptions`.
- `audit`: `audit_logs`.
- `rate limiting`: `login_attempts`, `request_rate_limits` — **no migrar**, ver sección 3.
- `cache`: `cache_invalidation_events` — **no migrar**, ver sección 3.
- `settings`: `site_settings`.
- `polls`: `polls`, `poll_questions`, `poll_options`, `poll_responses`, `poll_answers`.

---

## 2. Estrategia: strangler fig módulo por módulo, nunca un big-bang

Aunque la decisión fue migrar todo, "todo" no significa "de una sola vez". Cada módulo se migra siguiendo siempre esta secuencia de 6 pasos, y no se avanza al siguiente módulo sin cerrar el anterior:

1. **Crear las entidades `@Entity`** para las tablas del módulo, extendiendo `AuditableEntity` donde corresponda, respetando exactamente los nombres de columna reales (usar `@Column(name = "...")`, nunca asumir el mapeo automático).
2. **Crear el/los `JpaRepository`** correspondientes.
3. **Reescribir el service para usar el repositorio JPA**, pero **sin borrar el código JDBC todavía** — dejarlo comentado o en un método privado no usado, solo por si hay que comparar rápido en caso de discrepancia.
4. **Prueba de paridad**: para cada método migrado, una prueba (idealmente con Testcontainers cuando haya Docker disponible; si no, contra la base local de desarrollo) que compara la salida de la versión JDBC vs. la versión JPA con los mismos datos de entrada. Si no coinciden campo por campo, no se continúa.
5. **Cutover**: una vez que la paridad está confirmada y tú verificaste manualmente el módulo en la app, recién ahí se borra el código JDBC viejo.
6. **Reporte de sub-fase** con el mismo rigor que las fases anteriores (sección 8).

Esto significa que el checklist de "no declarar algo hecho sin verificarlo" aplica siempre, no una vez al final del proyecto entero.

---

## 3. Qué queda explícitamente fuera de esta migración

No todo lo que usa `JdbcTemplate` debe convertirse a JPA. Excluir:

- **Spring Session JDBC** (tablas de sesión, `V2__create_session_tables.sql`): es infraestructura de Spring Session, no del dominio de la aplicación. Se gestiona sola; no se debe modelar como entidad de negocio.
- **`login_attempts` y `request_rate_limits`** (`SharedRateLimitService`, `LoginAttemptService`): son mecanismos de alta frecuencia de escritura pensados para ser rápidos y simples (incrementos atómicos, ventanas de tiempo). Convertirlos a JPA no aporta nada y puede introducir overhead de first-level cache/dirty checking innecesario en un camino crítico de seguridad. Se quedan en JDBC deliberadamente.
- **`cache_invalidation_events`** (`CacheInvalidationService`, `CacheInvalidationPoller`): mismo argumento — es un mecanismo de polling de bajo nivel, no una entidad de dominio.
- **`SupabaseStorageService`**: su uso de JDBC (si existe más allá de referencias a `media_assets`) se evalúa en la migración del módulo `media`, no aquí; y de todas formas su lógica de storage no es de persistencia relacional.

Documentar esta exclusión explícitamente en el `AGENTS.md` al cerrar el plan completo, para que una futura auditoría no vuelva a marcarlo como hallazgo.

---

## 4. Orden de migración por módulo, de menor a mayor riesgo

No migrar en el orden en que aparecen en la tabla del inventario. Migrar en este orden, de menor a mayor riesgo, para construir el patrón con casos simples antes de enfrentar los complejos:

### Sub-fase A — `settings` (2 llamadas)
Tabla `site_settings`. Caso trivial, probablemente una sola fila o pocas filas clave-valor. Sirve para validar el patrón end-to-end con el menor riesgo posible.

### Sub-fase B — `audit` (1 llamada)
Tabla `audit_logs`. Solo inserciones probablemente, sin lecturas complejas. Segundo caso trivial.

### Sub-fase C — `media` (`media_assets`)
Base para `cover_media_id` que ya usan `project` y `opportunity`. Migrar esto antes que esos dos módulos porque ambos dependen de la entidad `MediaAsset`.

### Sub-fase D — `admin/service/AdminDashboardService.java` (3 llamadas)
Probablemente consultas de agregación (conteos). Bajo riesgo, útil para practicar `@Query` con funciones de agregación antes de los módulos grandes.

### Sub-fase E — `admin/service/AuditLogService.java` ya cubierto en B si es el mismo dominio; si es un servicio distinto de lectura de auditoría, tratarlo aquí.

### Sub-fase F — `team` (13 llamadas)
Tablas `team_members`, `team_social_links`. **Riesgo real detectado:** la consulta pública arma `social_links` con `jsonb_agg(jsonb_build_object(...))` convertido a texto. Decidir explícitamente cómo mapear esto en JPA: opción recomendada es modelar `TeamSocialLink` como entidad `@OneToMany` real desde `TeamMember`, y construir el DTO de respuesta (con el array de links) en el service a partir de la colección de entidades — no intentar replicar el `jsonb_agg` con JPQL, es más simple y más mantenible construirlo en Java.

### Sub-fase G — `submission` (formularios públicos, 8 llamadas)
Tablas `contact_messages`, `student_proposals`, `team_applications`, `newsletter_subscriptions`. Son básicamente inserciones simples desde formularios públicos — bajo riesgo funcional, pero es una ruta pública de alto tráfico potencial (newsletter), así que la prueba de paridad aquí importa especialmente para no introducir una regresión como la que se corrigió en la Fase 1 (el newsletter que simulaba éxito).

### Sub-fase H — `opportunity` (JDBC en `OpportunityAdminService` y relacionados)
Tablas `opportunities`, `opportunity_benefits`, `opportunity_requirements`. Depende de `media_assets` (Sub-fase C) por `cover_media_id`. Modelar `OpportunityBenefit` y `OpportunityRequirement` como `@OneToMany` ordenados por `display_order`.

### Sub-fase I — `project` (consolidar sobre lo que dejó la Fase 3/V26)
Tablas `projects`, `project_responsibles`, `project_partners`, `project_results`, `project_gallery`. Esta es la continuación natural de la Fase 3: ahora que el esquema está reconciliado (V26), migrar `ProjectRepository.java` completo a `JpaRepository` + entidades `Project`, `ProjectResponsible`, `ProjectPartner`, `ProjectResult`, `ProjectGallery`. Mantener `image_url` como campo heredado en `ProjectGallery` junto a `mediaAsset` (relación a `MediaAsset` de la Sub-fase C) hasta que exista una decisión de datos sobre migrarlo.

### Sub-fase J — `representation`, `event`, `news`, `statistics`
Módulos de contenido restantes, sin llamadas JDBC contadas explícitamente en el inventario inicial pero que son consumidos por `PublicContentService` (Sub-fase K) — migrarlos antes de esa sub-fase para que el modelo agregado ya tenga entidades de las que depender.

### Sub-fase K — `content/service/PublicContentService.java` (8 llamadas, el de mayor riesgo real)
**Este es el archivo más delicado de todo el plan**, no por número de líneas sino por naturaleza: es un **modelo de lectura agregado que cruza varios dominios en una sola consulta SQL** (representación con nombres de proyecto/evento/oportunidad relacionados vía `ARRAY(SELECT ...)`, evidencia, acciones). No existe una forma limpia de expresar esto como un único grafo de entidades JPA sin sobre-fetching o N+1.

**Decisión requerida explícitamente en esta sub-fase, documentada en su reporte:** elegir entre
- (a) mantener esta consulta específica como `@Query` nativo con proyección a DTO (JPA lo permite; no es "usar JDBC", es una consulta nativa gestionada por Hibernate), o
- (b) componer el DTO en el service combinando llamadas a los repositorios de cada módulo ya migrado (más líneas de código, pero sin SQL nativo).

No hay una respuesta "correcta" universal aquí — pero sí hay una respuesta incorrecta: reescribirlo ingenuamente con `@OneToMany` intentando que Hibernate resuelva todo automáticamente, porque eso es lo que casi seguro va a producir N+1 real en una ruta pública de alto tráfico.

### Sub-fase L — `admin` (25 + 7 = 32 llamadas, el motor genérico)
`AdminContentService.java` y `AdminOperationsService.java`. Se deja para el final a propósito: es el motor que ya administra `representación`, `eventos`, `noticias`, `estadísticas` (ver el hallazgo H1 de la Fase 2 — el contrato genérico). Migrarlo antes que los módulos de contenido específicos sería migrar el consumidor antes que lo consumido. Al llegar aquí, todas las entidades de los módulos que administra ya deberían existir de las sub-fases J y K.

### Sub-fase M — `poll` (28 llamadas, la más grande)
Tablas `polls`, `poll_questions`, `poll_options`, `poll_responses`, `poll_answers` — un modelo con dos niveles de jerarquía (encuesta → pregunta → opción, y por separado respuesta → respuesta-a-pregunta). Se deja al final porque es el módulo más grande y más aislado del resto (no lo consume `PublicContentService` ni `AdminContentService`), así que no bloquea a nadie mientras se hace con calma.

---

## 5. Reglas no negociables para todo el plan (heredadas y ampliadas)

- Nunca modificar una migración Flyway ya aplicada; si una entidad JPA necesita un ajuste de esquema, es una migración nueva con el siguiente número disponible — **confirmar el número real en disco antes de nombrarla**, como debió hacerse en la Fase 3.
- `ddl-auto` se mantiene en `validate`, nunca `update` ni `create`. Las entidades se adaptan al esquema existente, el esquema no se adapta a las entidades.
- No declarar una sub-fase cerrada sin que tú hayas verificado en disco que las clases nuevas existen y sin que el backend haya arrancado limpio.
- No borrar el código JDBC de un módulo hasta que su prueba de paridad haya pasado y tú hayas probado manualmente esa parte de la app.
- Cada sub-fase es un cambio pequeño y reversible por sí sola — si algo sale mal en la Sub-fase F, las Sub-fases A-E siguen siendo válidas y no hay que revertir todo el esfuerzo.
- Los módulos excluidos en la sección 3 no se tocan bajo ninguna circunstancia dentro de este plan.
- Si en cualquier sub-fase se descubre que el reporte de una sub-fase anterior no es fiel a lo que hay en disco, se detiene todo el plan hasta resolverlo — igual que ocurrió con la Fase 3.

---

## 6. Pruebas obligatorias por sub-fase

- `.\mvnw.cmd -q test`
- `.\mvnw.cmd -q verify`
- Prueba de paridad JDBC-vs-JPA para cada método migrado en esa sub-fase (sección 2, paso 4).
- Arranque real del backend (no solo `mvn test`) con revisión del log completo — sin excepciones de Hibernate, sin `SchemaManagementException`.
- Prueba manual en la app del módulo migrado, según la lista de verificación de esa sub-fase (se define al momento de ejecutar cada una, siguiendo el mismo formato que las checklists usadas en la Fase 3).

---

## 7. Definition of Done por sub-fase (plantilla a repetir en cada una)

```text
[ ] Entidades @Entity creadas y verificadas en disco por el usuario
[ ] JpaRepository(s) creado(s)
[ ] Service reescrito para usar JPA
[ ] Código JDBC anterior conservado sin borrar hasta cutover
[ ] Prueba de paridad JDBC vs JPA ejecutada y documentada
[ ] Backend arrancado limpio, log revisado por el usuario
[ ] Prueba manual en la app confirmada por el usuario
[ ] Código JDBC anterior eliminado (solo después de todo lo anterior)
[ ] Maven test/verify PASSED
[ ] Reporte de sub-fase creado
[ ] Decisión: GO_SIGUIENTE_SUBFASE | CONDITIONAL_GO | NO_GO
```

---

## 8. Formato de reporte por sub-fase

Crear `docs/execution/JPA_MIGRATION_SUBPHASE_<letra>_<modulo>_REPORT.md`:

```md
# JPA Migration — Sub-phase <letra> — <módulo>

## Tablas migradas
## Entidades creadas (con ruta de archivo real)
## Repositorios creados (con ruta de archivo real)
## Service(s) modificado(s)
## Código JDBC retenido temporalmente (ruta y motivo)
## Prueba de paridad: método por método, resultado
## Decisiones de mapeo no triviales (ej. jsonb_agg, ARRAY(SELECT), version/optimistic locking)
## Tests executed
## Test results
## Verificación manual del usuario (fecha y resultado)
## Riesgos residuales
## Decisión: GO_SIGUIENTE_SUBFASE | CONDITIONAL_GO | NO_GO
```

---

## 9. Rollback

- Como el código JDBC se conserva hasta el cutover de cada sub-fase, el rollback de una sub-fase en progreso es simplemente no hacer el cutover y seguir usando la rama JDBC.
- Una vez hecho el cutover (JDBC borrado), el rollback es restaurar desde el backup/commit previo a esa sub-fase específica — nunca hace falta revertir sub-fases anteriores ya cerradas.

---

## 10. Prompt copiable para Antigravity — plantilla reutilizable por sub-fase

Usar este mismo prompt para cada sub-fase, cambiando solo `<LETRA>` y `<MÓDULO>` según la sección 4:

```text
Trabaja en D:\ProyectoWebFuerzaUPT\backend.

Especificación principal de esta sesión:
PLAN_MIGRACION_JDBC_A_JPA.md — Sub-fase <LETRA>: <MÓDULO>

Contexto adicional obligatorio:
AGENTS.md
auth/entity/User.java y auth/entity/Role.java (patrón de entidad a replicar)
common/model/AuditableEntity.java (base a extender)
El/los archivos con JDBC de este módulo, listados en la sección 1 del plan

Skills a cargar desde D:\ProyectoWebFuerzaUPT\.opencode\skill-archives:
1. jpa-postgres-flyway
2. spring-module-builder
3. testing-quality-gate

REGLAS
1. Ejecutar solo la Sub-fase <LETRA> descrita en la sección 4 del plan. No adelantar otras sub-fases.
2. Seguir la secuencia de 6 pasos de la sección 2: crear entidades, crear repositorio,
   reescribir service SIN borrar el JDBC todavía, prueba de paridad, cutover solo tras
   confirmación del usuario, reporte.
3. No modificar ninguna migración Flyway ya aplicada. Si hace falta una migración nueva,
   confirmar primero en disco cuál es el siguiente número de versión libre.
4. ddl-auto se mantiene en validate. Las entidades se adaptan al esquema, no al revés.
5. No borrar código JDBC de este módulo hasta que la prueba de paridad haya pasado
   Y el usuario haya confirmado la verificación manual.
6. No declarar la sub-fase cerrada sin que el usuario haya verificado en disco que
   las clases nuevas existen y que el backend arrancó limpio.
7. Documentar explícitamente cualquier decisión de mapeo no trivial (jsonb_agg,
   ARRAY(SELECT), optimistic locking con columna version, relaciones ordenadas
   por display_order).
8. Crear docs/execution/JPA_MIGRATION_SUBPHASE_<LETRA>_<MODULO>_REPORT.md con el
   formato de la sección 8 del plan.
9. Terminar con una decisión explícita: GO_SIGUIENTE_SUBFASE, CONDITIONAL_GO o NO_GO.
10. No avanzar a la siguiente sub-fase sin autorización explícita del usuario.

COMIENZA listando en pantalla los archivos reales de este módulo que contienen
JDBC directo, confirmando que coinciden con el inventario de la sección 1 del
plan, antes de crear ninguna entidad.
```

---

## 11. Nota final

Este plan tiene 13 sub-fases (A a M). Es razonable esperar que tome semanas, no días, si se respeta el gate de verificación humana en cada una — y esa lentitud es intencional, no un defecto del plan. La alternativa (migrar todo de un salto) es exactamente el tipo de decisión que ya produjo un reporte de "éxito" sobre un archivo que no existía. Ir módulo por módulo, con el código JDBC conservado hasta confirmar paridad, es lo que hace que este plan sea ejecutable sin apostar la aplicación completa a que un agente no se equivoque en un cambio de 14 archivos de una sola vez.
