# CONTINUACIÓN DE EJECUCIÓN — PROYECTO FUERZA UPT
**Objetivo de esta sesión:** Continuar la migración de módulos backend de JdbcTemplate a JPA/Hibernate.

---

## 1. WORKSPACE Y REGLAS DE TRABAJO

```
REGLA IMPERATIVA DE WORKSPACE:
Ruta única autorizada: D:\ProyectoWebFuerzaUPT
Backend: D:\ProyectoWebFuerzaUPT\backend
Frontend: D:\ProyectoWebFuerzaUPT\frontend
Si el agente está posicionado en otra ruta, debe cambiar inmediatamente a la ruta correcta.
```

**Reglas de ejecución para esta fase:**
- NO generar ni ejecutar scripts SQL. Las tablas ya existen; solo se mapean con anotaciones JPA sobre el esquema actual.
- NO hacer `git init`, commits ni backups. Prioridad: velocidad de avance.
- Objetivo final: eliminar todo uso de `JdbcTemplate` en el proyecto y dejar el backend 100% sobre JPA/Hibernate.

---

## 2. ESTADO ACTUAL DE LA MIGRACIÓN JDBC → JPA

### Completado
- **SiteSettingsService**: migrado por completo a JPA.
  - Se eliminó el uso de `JdbcTemplate`.
  - Se creó `SiteSettingsRepository` (`JpaRepository`).
  - Se creó la entidad `@Entity SiteSettings`.
  - Verificado en runtime: al guardar en `/admin/settings`, Hibernate genera el `UPDATE` correspondiente.

### Pendiente (usan JdbcTemplate con SQL nativo)
1. **team**
2. **poll**
3. **content**
4. **submission**

> Nota: `AdminModuleController` ya excluye `opportunities` y `projects` de la gestión genérica por reflexión (Fase 2 Sub-fase A), así que esos dos módulos no forman parte de este bloque de migración JDBC→JPA por ahora.

---

## 3. PLAN DE EJECUCIÓN INMEDIATO

### Paso 1 — Migrar módulo `team`
Se elige como primer módulo por tener menor complejidad relacional, para fijar el patrón a repetir en los siguientes tres.

Para ejecutar la migración se necesita, del código actual:
- Service actual con `JdbcTemplate` (ej. `TeamService.java`)
- Repository/DAO actual, si existe como clase separada
- Controller que lo consume (para no romper contratos de API)
- Estructura real de la(s) tabla(s) involucradas (columnas y tipos), sin generar SQL nuevo — solo como referencia de mapeo

Entregable esperado:
- `@Entity` correspondiente (o entidades, si hay relaciones)
- `TeamRepository extends JpaRepository<...>`
- `TeamService` reescrito usando el repository JPA, sin `JdbcTemplate`
- Ajustes mínimos necesarios en el controller (solo si el contrato de datos expuesto cambia)

### Paso 2 — Migrar `poll`
Mismo patrón que `team`. Prestar atención especial a las relaciones (opciones de encuesta, votos) para mapear correctamente `@OneToMany` / `@ManyToOne`.

### Paso 3 — Migrar `content`
Mismo patrón. Revisar si hay campos de tipo JSON/rich text que requieran `@Column(columnDefinition = "...")` o convertidores JPA.

### Paso 4 — Migrar `submission`
Mismo patrón. Último módulo del bloque; al cerrarlo, el backend queda completamente sobre JPA (sin `JdbcTemplate` remanente).

---

## 4. PROMPT COPIABLE PARA RETOMAR EN ANTIGRAVITY / CLAUDE

```markdown
Hola Claude. Continuamos la migración de JdbcTemplate a JPA en el proyecto Fuerza UPT.

WORKSPACE: D:\ProyectoWebFuerzaUPT (backend en \backend, frontend en \frontend)

ESTADO:
- SiteSettingsService ya migrado a JPA (referencia de patrón a seguir).
- Pendientes en orden: team -> poll -> content -> submission.

REGLAS:
- No generar scripts SQL, las tablas ya existen.
- No hacer git init, commits ni backups.
- Prioridad: velocidad. Ir módulo por módulo sin reescrituras masivas fuera de alcance.

TAREA INMEDIATA:
Migrar el módulo "team" a JPA. Te paso el código actual (Service, Repository/DAO y Controller) para que generes la entidad @Entity, el JpaRepository y el Service reescrito.
```

---

## 5. SIGUIENTE ACCIÓN REQUERIDA

Pegar o subir el código actual del módulo `team` (Service + Repository/DAO + Controller) para comenzar la migración inmediatamente.
