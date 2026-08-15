# Matriz Canónica de Contratos API — Fuerza UPT

**Versión:** 2.0 (Fase 2 Completada)  
**Fecha de actualización:** 2026-08-01  
**Estado:** Canónico y Normalizado  

---

## 1. Módulos y Endpoints Administrativos (`/api/admin`)

| Endpoint | Método | Controlador | DTO Entrante | DTO Saliente | Estado / Compatibilidad |
|---|---|---|---|---|---|
| `/api/admin/status` | GET | `AdminStatusController` | N/A | `AdminStatusResponse` | CANÓNICO — Tipado formalmente (H2) |
| `/api/admin/content` | GET | `AdminContentController` | N/A | `List<AdminModuleSummaryResponse>` | CANÓNICO (Resumen dashboard) |
| `/api/admin/content/{module}` | GET | `AdminContentController` | Query params | `PageResponse<AdminContentRowResponse>` | LEGACY (Compatibilidad mantenida) |
| `/api/admin/{module}` | GET, POST | `AdminModuleController` | `AdminContentRequest` | `PageResponse<AdminContentRowResponse>`, `AdminContentRowResponse` | CANÓNICO — Módulos genéricos: `representacion`, `eventos`, `noticias`, `estadisticas`, `oportunidades`. (Proyectos excluido) |
| `/api/admin/{module}/{id}` | GET, PUT, DELETE | `AdminModuleController` | `AdminContentUpdateRequest` | `AdminContentRowResponse` | CANÓNICO — Edición / Archivado editorial |
| `/api/admin/{module}/{id}/estado-editorial` | PATCH | `AdminModuleController` | `AdminEditorialStatusRequest` | `AdminContentRowResponse` | CANÓNICO — Cambio de estado editorial |
| `/api/admin/{module}/{id}/destacado` | PATCH | `AdminModuleController` | `AdminFeaturedRequest` | `AdminContentRowResponse` | CANÓNICO — Toggle destacado |
| `/api/admin/{module}/orden` | PATCH | `AdminModuleController` | `AdminOrderRequest` | `List<AdminContentRowResponse>` | CANÓNICO — Reordenamiento |
| `/api/admin/proyectos` | GET | `AdminProjectController` | N/A | `PageResponse<ProjectAdminResponse>` | CANÓNICO ESPECÍFICO — Exclusivo para gestión de proyectos |
| `/api/admin/proyectos/{id}` | GET | `AdminProjectController` | N/A | `ProjectAdminResponse` | CANÓNICO ESPECÍFICO — Detalle administrativo de proyecto |
| `/api/admin/equipo` | GET, POST, PUT, DELETE | `AdminTeamMemberController` | `TeamMemberMutation` | `TeamMemberAdminResponse` | CANÓNICO ESPECÍFICO — Miembros del equipo |
| `/api/admin/encuestas` | GET, POST, PUT, DELETE | `AdminPollController` | Dynamic DTO | `AdminPollResponse` | CANÓNICO ESPECÍFICO — Encuestas y votaciones |
| `/api/admin/media` | GET, POST | `AdminMediaController` | Multipart | `MediaAssetResponse` | CANÓNICO ESPECÍFICO — Gestión multimedia |
| `/api/admin/formularios` | GET, PATCH | `AdminFormsController` | N/A | `AdminSubmissionResponse` | CANÓNICO ESPECÍFICO — Bandejas de inscripción / propuestas |

---

## 2. Autenticación y Seguridad (`/api/auth`)

| Endpoint | Método | Controlador | DTO Entrante | DTO Saliente | Estado / Compatibilidad |
|---|---|---|---|---|---|
| `/api/auth/csrf` | GET | `AuthController` | N/A | `CsrfTokenResponse` | CANÓNICO — Tipado formalmente (H3) |
| `/api/auth/login` | POST | `AuthController` | `LoginRequest` | `AuthSessionResponse` | CANÓNICO — Inicio de sesión con cookies HTTP-Only |
| `/api/auth/me` | GET | `AuthController` | N/A | `AuthSessionResponse` | CANÓNICO — Obtención de usuario en sesión |
| `/api/auth/logout` | POST | `AuthController` | N/A | `240 No Content` | CANÓNICO — Cierre de sesión y descarte de cookie |

---

## 3. Endpoints Públicos Canónicos

| Endpoint | Método | Controlador | DTO Saliente | Notas |
|---|---|---|---|---|
| `/api/home` | GET | `PublicHomeController` | `HomePublicResponse` | Portal de inicio agregado |
| `/api/representacion` | GET | `PublicContentController` | `List<RepresentationPublicResponse>` | Listado de representación |
| `/api/eventos` | GET | `PublicContentController` | `List<EventPublicResponse>` | Listado de eventos públicos |
| `/api/oportunidades` | GET | `PublicContentController` | `List<OpportunityPublicResponse>` | Listado de oportunidades |
| `/api/noticias` | GET | `PublicContentController` | `List<NewsPublicResponse>` | Listado de noticias públicas |
| `/api/proyectos` | GET | `PublicProjectController` | `List<ProjectPublicResponse>` | Listado de proyectos públicos |
| `/api/equipo` | GET | `PublicTeamController` | `List<TeamMemberPublicResponse>` | Directorio de equipo |
