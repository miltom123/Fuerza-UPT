# Auditoría post-consolidación

## Paso 1 — Ruta de trabajo confirmada
```text
Path                   
----                   
D:\ProyectoWebFuerzaUPT
True
False
```

## Paso 2 — Estado real de cada fase

### Fase 1
```text
Path                   
----                   
D:\ProyectoWebFuerzaUPT
```
(No se encontraron archivos con `setTimeout` simulado).

### Fase 2
```text
Path                   
----                   
D:\ProyectoWebFuerzaUPT
True
True
True

IgnoreCase : True
LineNumber : 34
Line       : @RequestMapping("/api/admin/{module:representacion|eventos|oportunidades|noticias|estadisticas}")
Filename   : AdminModuleController.java
Path       : D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt\admin\controller\AdminModuleController.java
Pattern    : oportunidades
Context    : 
Matches    : {0}
```

### Fase 3 (V26)
Migraciones presentes en Flyway:
```text
... (salida acortada por claridad, mostrando los relevantes)
LastWriteTime : 17/07/2026 0:29:22
Length        : 3327
Name          : V24__normalize_projects_module.sql

LastWriteTime : 01/08/2026 0:26:40
Length        : 2133
Name          : V26__reconcile_project_satellite_tables.sql
```

Contenido de `V26__reconcile_project_satellite_tables.sql`:
```sql
-- V26__reconcile_project_satellite_tables.sql
-- Reconcile schema drift for project satellite tables between V15 and V24
-- V24 used CREATE TABLE IF NOT EXISTS which resulted in no-ops over tables created in V15.

-- 1. Reconcile project_gallery table
-- Add missing media_asset_id and alternative_text columns from V24 schema intent.
-- Keep legacy image_url column to preserve existing data.
ALTER TABLE project_gallery
    ADD COLUMN IF NOT EXISTS media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS alternative_text VARCHAR(255);

ALTER TABLE project_gallery DROP CONSTRAINT IF EXISTS chk_project_gallery_order;
ALTER TABLE project_gallery ADD CONSTRAINT chk_project_gallery_order CHECK (display_order >= 0);

CREATE INDEX IF NOT EXISTS idx_project_gallery_project_id ON project_gallery(project_id, display_order);

-- 2. Reconcile project_results table
-- Ensure display_order check constraint and index exist.
-- Retain description as TEXT (from V15) to prevent truncation of existing content.
ALTER TABLE project_results DROP CONSTRAINT IF EXISTS chk_project_results_order;
ALTER TABLE project_results ADD CONSTRAINT chk_project_results_order CHECK (display_order >= 0);

CREATE INDEX IF NOT EXISTS idx_project_results_project_id ON project_results(project_id, display_order);

-- 3. Reconcile project_responsibles table
-- Ensure display_order check constraint and index exist.
ALTER TABLE project_responsibles DROP CONSTRAINT IF EXISTS chk_project_responsibles_order;
ALTER TABLE project_responsibles ADD CONSTRAINT chk_project_responsibles_order CHECK (display_order >= 0);

CREATE INDEX IF NOT EXISTS idx_project_responsibles_project_id ON project_responsibles(project_id, display_order);

-- 4. Reconcile project_partners table
-- Ensure display_order check constraint and index exist.
ALTER TABLE project_partners DROP CONSTRAINT IF EXISTS chk_project_partners_order;
ALTER TABLE project_partners ADD CONSTRAINT chk_project_partners_order CHECK (display_order >= 0);

CREATE INDEX IF NOT EXISTS idx_project_partners_project_id ON project_partners(project_id, display_order);
```

Log completo de la sección de Flyway al arranque:
```text
2026-08-03T17:55:12.113-05:00  INFO 10148 --- [fuerza-upt-api] [  restartedMain] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres (PostgreSQL 17.6)
2026-08-03T17:55:13.322-05:00  WARN 10148 --- [fuerza-upt-api] [  restartedMain] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.6 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 16.
2026-08-03T17:55:14.233-05:00  INFO 10148 --- [fuerza-upt-api] [  restartedMain] o.f.core.internal.command.DbValidate     : Successfully validated 26 migrations (execution time 00:00.727s)
2026-08-03T17:55:16.293-05:00  INFO 10148 --- [fuerza-upt-api] [  restartedMain] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 26
2026-08-03T17:55:16.466-05:00  INFO 10148 --- [fuerza-upt-api] [  restartedMain] o.f.core.internal.command.DbMigrate      : Schema "public" is up to date. No migration necessary.
```

### Sub-fase A (settings)
Archivos presentes:
```text
LastWriteTime : 03/08/2026 16:30:52
Length        : 1411
Name          : SiteSettings.java

LastWriteTime : 03/08/2026 16:30:56
Length        : 261
Name          : SiteSettingsRepository.java
```

Contenido:
```java
package pe.edu.upt.fuerzaupt.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "site_settings")
@EntityListeners(AuditingEntityListener.class)
public class SiteSettings {

    @Id
    @Column(name = "id")
    private Boolean id = true;

    @Column(name = "email")
    private String email;

    @Column(name = "whatsapp")
    private String whatsapp;

    @Column(name = "instagram")
    private String instagram;

    @Column(name = "facebook")
    private String facebook;

    @Column(name = "tiktok")
    private String tiktok;

    @Column(name = "youtube")
    private String youtube;

    @Column(name = "address")
    private String address;

    @Column(name = "main_message")
    private String mainMessage;

    @Column(name = "contact_text")
    private String contactText;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
```

```java
package pe.edu.upt.fuerzaupt.settings.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.settings.entity.SiteSettings;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Boolean> {
}
```

## Paso 3 — Inventario JDBC actualizado
Lista de archivos en el backend que aún mencionan `JdbcTemplate` (con sus conteos):

| Archivo (Nombre) | Conteo (usos/importaciones de JdbcTemplate) |
| --- | --- |
| `pe\edu\upt\fuerzaupt\admin\service\AdminContentService.java` | 1 |
| `pe\edu\upt\fuerzaupt\admin\service\AdminDashboardService.java` | 1 |
| `pe\edu\upt\fuerzaupt\admin\service\AdminOperationsService.java` | 1 |
| `pe\edu\upt\fuerzaupt\admin\service\AuditLogService.java` | 1 |
| `pe\edu\upt\fuerzaupt\admin\service\CacheInvalidationPoller.java` | 1 |
| `pe\edu\upt\fuerzaupt\admin\service\CacheInvalidationService.java` | 1 |
| `pe\edu\upt\fuerzaupt\auth\service\LoginAttemptService.java` | 1 |
| `pe\edu\upt\fuerzaupt\content\service\PublicContentService.java` | 1 |
| `pe\edu\upt\fuerzaupt\media\service\SupabaseStorageService.java` | 1 |
| `pe\edu\upt\fuerzaupt\poll\service\PollService.java` | 1 |
| `pe\edu\upt\fuerzaupt\project\repository\ProjectRepository.java` | 1 |
| `pe\edu\upt\fuerzaupt\settings\service\SiteSettingsService.java` | 1 |
| `pe\edu\upt\fuerzaupt\submission\controller\PublicSubmissionController.java` | 1 |
| `pe\edu\upt\fuerzaupt\submission\service\SharedRateLimitService.java` | 1 |
| `pe\edu\upt\fuerzaupt\team\service\TeamMemberService.java` | 1 |

*Nota comparativa: Se observa que `SiteSettingsService.java` sigue listado, indicando que Sub-fase A no completó la migración del servicio.*

## Paso 4 — Estado de Git
```text
(Frontend)
a0ae719 Consolidacion: estado real tras Fases 1-3 y Sub-fase A settings (JDBC a JPA)
2ec4598 Initial commit from Create Next App
On branch master
nothing to commit, working tree clean

(Backend)
fatal: not a git repository (or any of the parent directories): .git
```

## Discrepancias encontradas entre lo reportado antes y la realidad actual
1. **Fase 2 (Contratos API):** El controlador `AdminModuleController.java` aún incluye la ruta `oportunidades` en su anotación `@RequestMapping` (línea 34). Esto indica que la refactorización para quitar las dependencias de oportunidades del controlador genérico no se aplicó o fue revertida.
2. **Sub-fase A (Migración settings):** A pesar de que la entidad `SiteSettings` y su repositorio JPA se crearon satisfactoriamente y coinciden con lo reportado, el servicio `SiteSettingsService.java` aún conserva referencias a `JdbcTemplate`, revelado por el comando de inventario JDBC. Esto significa que la migración del servicio para que use JPA no ha finalizado del todo.
3. **Backend sin control de versiones:** La ejecución de Git en el backend arroja un error que indica que no es un repositorio de Git activo en este momento.

## Estado real desde el cual se debe continuar
- La **Fase 1** parece correcta, sin presencia de la anomalía de simulación original.
- La **Fase 3** es estable; la base de datos se migró exitosamente con `V26` verificada por el Spring Boot Flyway.
- **Requiere finalización:** La **Fase 2** debe rematar el controlador `AdminModuleController` removiendo `oportunidades`.
- **Requiere finalización:** La **Sub-fase A** debe concluir modificando completamente `SiteSettingsService.java` para sustituir toda lógica de `JdbcTemplate` por las operaciones mediante `SiteSettingsRepository`.

## Decisión: HAY_QUE_REHACER_SUBFASE_A (y resolver pendiente Fase 2)
Se debe solucionar la presencia de `oportunidades` en el controlador de Admin y culminar la migración de `SiteSettingsService` (quitar toda referencia a JDBC) antes de comenzar oficialmente la **Sub-fase B**. También convendría inicializar un repositorio de control de versiones `.git` en el backend para salvaguardar progreso de aquí en adelante.
