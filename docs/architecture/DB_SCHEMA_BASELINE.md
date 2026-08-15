# Documentación de Línea Base del Esquema de Base de Datos (DB Schema Baseline)

**Proyecto:** Fuerza UPT  
**Versión:** 3.0 (Fase 3 Completada)  
**Fecha:** 2026-08-01  

---

## 1. Estado de Reconciliación de Esquema Vacío (V1 -> V26)

- **Estado:** `RECONCILIADO Y CONSOLIDADO`
- **Ubicación de Migraciones:** `backend/src/main/resources/db/migration/`
- **Última migración:** `V26__reconcile_project_satellite_tables.sql`
- **Resumen de Cambios en V26:**
  1. `project_gallery`: Adición de columnas `media_asset_id` (FK a `media_assets`) y `alternative_text`. Conservación de `image_url` heredada para compatibilidad. Adición del constraint `chk_project_gallery_order CHECK (display_order >= 0)` y del índice `idx_project_gallery_project_id`.
  2. `project_results`: Conservación del tipo `TEXT` en la columna `description` (de V15) para evitar riesgo de truncamiento de datos. Adición del constraint `chk_project_results_order CHECK (display_order >= 0)` e índice `idx_project_results_project_id`.
  3. `project_responsibles`: Adición del constraint `chk_project_responsibles_order CHECK (display_order >= 0)` e índice `idx_project_responsibles_project_id`.
  4. `project_partners`: Adición del constraint `chk_project_partners_order CHECK (display_order >= 0)` e índice `idx_project_partners_project_id`.

---

## 2. Estado de Validación con Testcontainers / Docker Local

- **Estado:** `BLOCKED (Docker environment not available)`
- **Evidencia:** La suite de pruebas de integración `FlywayMigrationIntegrationTest.java` fue incorporada con las dependencias `org.testcontainers:postgresql` y `org.testcontainers:junit-jupiter`. En el entorno local actual no hay un servicio Docker en ejecución, por lo que la ejecución automatizada en contenedor real queda registrada formalmente como **BLOCKED** (no simulada como PASSED, en cumplimiento estricto de la Regla 6 del proyecto).

---

## 3. Estado de Validación con Datos Representativos de Producción

- **Estado:** `BLOQUEADO (A la espera de fuente de datos no productiva autorizada)`
- **Justificación:** Se mantiene la restricción estricta de no conectarse a la base de datos de producción ni a instancias Supabase reales. La validación de migraciones sobre volúmenes de datos reales queda pendiente hasta contar con un entorno de staging/sandbox autorizado.
