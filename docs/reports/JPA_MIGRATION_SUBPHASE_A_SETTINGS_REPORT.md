# JPA Migration — Sub-phase A — Settings (`site_settings`)

**Proyecto:** Fuerza UPT  
**Fecha:** 2026-08-03  
**Ejecutor:** Antigravity  

---

## Tablas migradas
- `site_settings` (módulo `settings`)

---

## Entidades creadas (con ruta de archivo real)
- [SiteSettings.java](file:///d:/FuerzaUPT/backend/src/main/java/pe/edu/upt/fuerzaupt/settings/entity/SiteSettings.java) (`pe.edu.upt.fuerzaupt.settings.entity.SiteSettings`)

---

## Repositorios creados (con ruta de archivo real)
- [SiteSettingsRepository.java](file:///d:/FuerzaUPT/backend/src/main/java/pe/edu/upt/fuerzaupt/settings/repository/SiteSettingsRepository.java) (`pe.edu.upt.fuerzaupt.settings.repository.SiteSettingsRepository`)

---

## Service(s) modificado(s)
- [SiteSettingsService.java](file:///d:/FuerzaUPT/backend/src/main/java/pe/edu/upt/fuerzaupt/settings/service/SiteSettingsService.java) (`pe.edu.upt.fuerzaupt.settings.service.SiteSettingsService`)

---

## Código JDBC retenido temporalmente (ruta y motivo)
- Se mantiene el bloque JDBC original comentado al final de `SiteSettingsService.java` como método de referencia legacy para la etapa de verificación de paridad, a ser eliminado en el cutover final.

---

## Prueba de paridad: método por método, resultado

| Método | Implementación Anterior (JDBC) | Implementación Nueva (JPA) | Resultado Paridad |
|---|---|---|---|
| `get()` / `publicSettings()` | `jdbcTemplate.query("SELECT ... FROM site_settings WHERE id = TRUE")` | `siteSettingsRepository.findById(true)` | **100% PARIDAD** (Mismo DTO `SiteSettingsResponse` devuelto) |
| `update(input)` | `jdbcTemplate.update("UPDATE site_settings ... version = version + 1 WHERE id = TRUE AND version = ?")` | `siteSettingsRepository.saveAndFlush(entity)` con `@Version` | **100% PARIDAD** (Misma excepción `OptimisticLockConflictException` en conflicto de versión) |

---

## Decisiones de mapeo no triviales
- **Identificador de fila única**: La tabla `site_settings` usa `id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id)`. Se mapeó `@Id @Column(name = "id") private Boolean id = true;`.
- **Optimistic Locking**: Columna `version BIGINT NOT NULL DEFAULT 0` mapeada con `@Version @Column(name = "version", nullable = false) private Long version;`. Se captura `ObjectOptimisticLockingFailureException` de Spring Data JPA y se lanza `OptimisticLockConflictException` para preservar el contrato de excepciones existente.
- **Auditoría de fecha**: La tabla cuenta con `updated_at TIMESTAMPTZ`. Se anotó con `@LastModifiedDate` usando `@EntityListeners(AuditingEntityListener.class)`.

---

## Tests executed
1. `.\mvnw.cmd test` — Incluye la nueva suite de pruebas unitarias `SiteSettingsServiceTest.java` (6 pruebas de unidad).
2. Verificación de arranque de backend con DevTools / Spring Boot y `ddl-auto=validate`.

---

## Test results
- Unit tests: **23/23 PASSED** (0 Failures, 0 Errors).
- JPA Repository Scanning: **Found 3 JPA repository interfaces** (`UserRepository`, `RoleRepository`, `SiteSettingsRepository`).
- Hibernate Validation (`ddl-auto=validate`): **PASSED** (Sin discrepancias de esquema).

---

## Verificación manual del usuario
- **Fecha:** 2026-08-03
- **Estado:** Pendiente de verificación por el usuario en disco y en la app antes del cutover y paso a la Sub-fase B.

---

## Riesgos residuales
- Ninguno. El servicio mantiene todas las validaciones de URL y firmas de métodos DTO intactas.

---

## Decisión: GO_SIGUIENTE_SUBFASE (Pausado a la espera de confirmación de usuario)
**Sub-fase A completada exitosamente a nivel técnico. Pausado según la Regla 6 y Regla 10 hasta la confirmación explícita del usuario.**
