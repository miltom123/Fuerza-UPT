# Documentación del Proyecto Fuerza UPT

Índice maestro de especificaciones, auditorías, arquitectura y planes de implementación del proyecto **Fuerza UPT**.

---

## 📂 Carpetas de Documentación

### 🛡️ 1. Auditorías (`docs/audits/`)
- [`01_PLAN_AUDITORIA_ARQUITECTURA_ESCALABLE_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/01_PLAN_AUDITORIA_ARQUITECTURA_ESCALABLE_FUERZA_UPT.md) — Plan de auditoría de arquitectura escalable.
- [`AUDITORIA_BACKEND_FUERZA_UPT_5.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/AUDITORIA_BACKEND_FUERZA_UPT_5.md) — Quinta auditoría integral del backend Spring Boot.
- [`AUDITORIA_COMPLETA_POST_CONSOLIDACION.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/AUDITORIA_COMPLETA_POST_CONSOLIDACION.md) — Auditoría completa post consolidación de servicios.
- [`SEGUNDA_AUDITORIA_BACKEND_FUERZA_UPT_2026-08-12.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/SEGUNDA_AUDITORIA_BACKEND_FUERZA_UPT_2026-08-12.md) — Segunda auditoría backend del 12 de agosto de 2026.
- [`fuerza-upt-google-oauth-audit.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/fuerza-upt-google-oauth-audit.md) — Auditoría de autenticación Google OAuth2.
- [`AUDITORIA_POST_CONSOLIDACION_REPORT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/audits/AUDITORIA_POST_CONSOLIDACION_REPORT.md) — Reporte final de validación post consolidación.

### 📐 2. Arquitectura y Persistencia (`docs/architecture/`)
- [`PLAN_IMPLEMENTACION_CERO_JDBC_JPA_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/PLAN_IMPLEMENTACION_CERO_JDBC_JPA_FUERZA_UPT.md) — Estándar innegociable de cero JDBC y migración 100% JPA/Hibernate.
- [`PLAN_MIGRACION_JDBC_A_JPA.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/PLAN_MIGRACION_JDBC_A_JPA.md) — Plan maestro de eliminación de `JdbcTemplate` y DAOs manuales.
- [`CONTINUACION_MIGRACION_JPA_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/CONTINUACION_MIGRACION_JPA_FUERZA_UPT.md) — Continuación de la refactorización JPA en repositorios.
- [`FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md) — Definición y estandarización de contratos REST API.
- [`FASE_3_PERSISTENCIA_MIGRACIONES_PROMPT_ANTIGRAVITY.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/FASE_3_PERSISTENCIA_MIGRACIONES_PROMPT_ANTIGRAVITY.md) — Guía de persistencia, locking JPA y esquema PostgreSQL.
- [`MATRIZ_CONTRATOS_API.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/MATRIZ_CONTRATOS_API.md) — Matriz de mapeo de DTOs y endpoints públicos/administrativos.
- [`CLEANUP_DEPENDENCY_MATRIX.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/CLEANUP_DEPENDENCY_MATRIX.md) — Matriz de dependencias y limpieza de módulos legados.
- [`ARCHITECTURE.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/ARCHITECTURE.md) — Reglas arquitectónicas del backend Fuerza UPT.
- [`DB_SCHEMA_BASELINE.md`](file:///d:/ProyectoWebFuerzaUPT/docs/architecture/DB_SCHEMA_BASELINE.md) — Línea base del esquema PostgreSQL.

### 🚀 3. Planes de Implementación (`docs/plans/`)
- [`PLAN_SUBSANACION_ARQUITECTURA_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_SUBSANACION_ARQUITECTURA_FUERZA_UPT.md) — Plan de subsanación de arquitectura Fuerza UPT.
- [`PLAN_CIERRE_FINAL_FUERZA_UPT_SKILLS.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_CIERRE_FINAL_FUERZA_UPT_SKILLS.md) — Plan de cierre e instalación de habilidades en Antigravity.
- [`PLAN_NORMALIZACION_MODULO_PROYECTOS_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_NORMALIZACION_MODULO_PROYECTOS_FUERZA_UPT.md) — Normalización del módulo de Proyectos.
- [`PLAN_ADMINISTRACION_PROYECTOS_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_ADMINISTRACION_PROYECTOS_FUERZA_UPT.md) — Especificación del panel de administración de proyectos.
- [`PLAN_CORRECTIVO_RECUPERACION_PROYECTOS_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_CORRECTIVO_RECUPERACION_PROYECTOS_FUERZA_UPT.md) — Plan correctivo para el dominio de proyectos.
- [`PLAN_LIMPIEZA_ALINEACION_PANEL_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_LIMPIEZA_ALINEACION_PANEL_FUERZA_UPT.md) — Plan de alineación de páneles administrativos.
- [`PLAN_IMPLEMENTACION_CORREOS_EQUIPO_POSTULACIONES_UNETE.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_IMPLEMENTACION_CORREOS_EQUIPO_POSTULACIONES_UNETE.md) — Notificaciones SMTP de convocatorias "Únete".
- [`PLAN_IMPLEMENTACION_EMAIL_HTML_POSTULACIONES_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_IMPLEMENTACION_EMAIL_HTML_POSTULACIONES_FUERZA_UPT.md) — Plantillas HTML responsivas para correos salientes.
- [`PLAN_REMEDIACION_BACKEND_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_REMEDIACION_BACKEND_FUERZA_UPT.md) — Plan remediación integral del backend.
- [`PLAN_IMPLEMENTACION_INICIAL_FUERZA_UPT_CODEX.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_IMPLEMENTACION_INICIAL_FUERZA_UPT_CODEX.md) — Plan inicial de prototipado frontend.
- [`PLAN_IMPLEMENTACION_LOGIN_ADMIN_FUERZA_UPT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_IMPLEMENTACION_LOGIN_ADMIN_FUERZA_UPT.md) — Especificación del flujo de Login y autenticación admin.
- [`plan-implementacion-frontend-proyectos-fuerza-upt.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/plan-implementacion-frontend-proyectos-fuerza-upt.md) — Plan de vistas del frontend para proyectos.
- [`plan_modo_administrador_proyectos.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/plan_modo_administrador_proyectos.md) — Funcionalidades avanzadas del modo administrador de proyectos.
- [`rediseño_frontend_fuerza_upt_unete.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/redise%C3%B1o_frontend_fuerza_upt_unete.md) — Rediseño visual de la sección "Únete".
- [`PLAN_2_RESULTADO_IMPLEMENTACION.md`](file:///d:/ProyectoWebFuerzaUPT/docs/plans/PLAN_2_RESULTADO_IMPLEMENTACION.md) — Resumen de resultados de la fase 2.

### 📊 4. Reportes de Fases (`docs/reports/`)
- [`CONTENT_MIGRATION_REPORT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/reports/CONTENT_MIGRATION_REPORT.md) — Reporte de migración de contenidos dinámicos.
- [`JPA_MIGRATION_SUBPHASE_A_SETTINGS_REPORT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/reports/JPA_MIGRATION_SUBPHASE_A_SETTINGS_REPORT.md) — Reporte de migración de la subfase A (Settings).
- [`PHASE_2_REPORT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/reports/PHASE_2_REPORT.md) — Reporte de la Fase 2.
- [`PHASE_3_REPORT.md`](file:///d:/ProyectoWebFuerzaUPT/docs/reports/PHASE_3_REPORT.md) — Reporte de la Fase 3.
