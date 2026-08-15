# Phase 2 Report — Contratos API Canónicos

**Proyecto:** Fuerza UPT  
**Fecha:** 2026-08-01  
**Ejecutor:** Antigravity  

---

## Scope
El alcance de la Fase 2 abarca la normalización, tipado formal y delimitación de contratos API backend/frontend según `FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md`:
- Tipado formal de `AdminStatusController` y `AuthController#getCsrfToken`.
- Acotamiento y eliminación de solapamiento en contratos administrativos genéricos vs. específicos (`proyectos` excluido del genérico).
- Apertura y habilitación del módulo de noticias en el panel de administración (`frontend/src/app/administracion/noticias/page.tsx`).
- Generación de `MATRIZ_CONTRATOS_API.md` con el catálogo canónico de endpoints.
- Ejecución de los Quality Gates (Maven test/verify, ESLint, TypeScript, Next.js build).

---

## Skills loaded
1. `rest-api-contract-designer`
2. `spring-module-builder`
3. `testing-quality-gate`

---

## Baseline
- Repositorio Git limpio en `frontend`.
- Fase 1 completada y validada (`GO_PHASE_2`).

---

## Files created
- `backend/src/main/java/pe/edu/upt/fuerzaupt/admin/dto/AdminStatusResponse.java`
- `backend/src/main/java/pe/edu/upt/fuerzaupt/auth/dto/CsrfTokenResponse.java`
- `frontend/src/app/administracion/noticias/page.tsx`
- `MATRIZ_CONTRATOS_API.md`
- `docs/execution/PHASE_2_REPORT.md`

---

## Files modified
- `backend/src/main/java/pe/edu/upt/fuerzaupt/admin/controller/AdminStatusController.java`
- `backend/src/main/java/pe/edu/upt/fuerzaupt/auth/controller/AuthController.java`
- `backend/src/main/java/pe/edu/upt/fuerzaupt/admin/service/AdminContentService.java`
- `frontend/src/services/admin/project-admin-service.ts`
- `frontend/src/types/admin.ts`
- `frontend/src/services/admin/content-admin-service.ts`
- `frontend/src/components/admin/admin-content-manager.tsx`
- `frontend/src/components/admin/submission-inbox.tsx`
- `frontend/src/config/admin-navigation.ts`
- `frontend/src/app/administracion/proyectos/page.tsx`
- `frontend/src/app/administracion/proyectos/[id]/editar/page.tsx`
- `frontend/src/components/team/team-member-card.tsx`

---

## Files deleted
- Ninguno.

---

## Endpoints affected
- `GET /api/admin/status` — Ahora devuelve DTO tipado `AdminStatusResponse`.
- `GET /api/auth/csrf` — Ahora devuelve DTO tipado `CsrfTokenResponse`.
- `GET /api/admin/content/projects` — Excluido de `Module.from` (lanza 404 explícito); se utiliza exclusivamente `/api/admin/proyectos`.

---

## Contracts changed
- `AdminStatusResponse`: `{ status: String, authenticatedAs: String, serverTime: Instant, cacheEventCursor: long }`
- `CsrfTokenResponse`: `{ token: String, headerName: String, parameterName: String }`
- `GenericAdminModule` (Frontend): Acotado a `"representation" | "events" | "opportunities" | "news" | "statistics"`.

---

## H1–H6: resolución de cada hallazgo

- **H1 (Solapamiento Genérico vs Específico)**: Resuelto. Se confirmó que `AdminProjectController` (`/api/admin/proyectos`) es la única vía canónica para proyectos, excluyendo `projects` de `AdminContentService` (`Module.from`) y retirándolo de `GenericAdminModule`.
- **H2 (AdminStatusController sin tipar)**: Resuelto. Implementado `AdminStatusResponse` en Java record.
- **H3 (CSRF sin DTO tipado)**: Resuelto. Implementado `CsrfTokenResponse` en Java record.
- **H4 (Vacío funcional en noticias admin)**: Resuelto mediante Opción A. Se creó `frontend/src/app/administracion/noticias/page.tsx` y se agregó el enlace a la barra lateral de navegación (`admin-navigation.ts`).
- **H5 (Proyectos con CRUD intencionalmente incompleto)**: Confirmado. Se mantuvo `AdminProjectController` como contrato canónico para consulta de proyectos, manteniendo la nota de implementación diferida para el formulario completo en Fase 5.
- **H6 (OpenAPI deshabilitado por defecto)**: Confirmado. Se mantuvo `OPENAPI_ENABLED: false` en `application.yml` para evitar exposición involuntaria en producción.

---

## Tests executed

### Backend
1. `.\mvnw.cmd test`
2. `.\mvnw.cmd verify`

### Frontend
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Test results
- Backend Unit Tests: **16/16 PASSED** (0 Failures, 0 Errors).
- Backend Maven Verify & Repackage: **PASSED** (`BUILD SUCCESS`).
- Frontend TypeScript Type Check: **PASSED** (0 errors).
- Frontend ESLint: **PASSED** (0 errors, 0 warnings).
- Frontend Next.js Production Build: **PASSED**.

---

## Risks
- Ninguno identificado. Todos los cambios son aditivos o restrictivos en capas seguras.

---

## Rollback
- Restaurar los archivos modificados desde la copia de seguridad o snapshot de Git en `frontend`.

---

## Residual debt
- Ninguna deuda técnica introducida en esta fase.

---

## Decision: GO_PHASE_3
**Aprobado para avanzar a la Fase 3 (Flyway y Persistencia).**
