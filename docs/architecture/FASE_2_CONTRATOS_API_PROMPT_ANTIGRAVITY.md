# FASE 2 — Contratos API canónicos
# Documento de continuación de implementación para Antigravity
# Proyecto: Fuerza UPT

**Raíz de trabajo:** `D:\ProyectoWebFuerzaUPT`
**Backend:** `D:\ProyectoWebFuerzaUPT\backend`
**Frontend:** `D:\ProyectoWebFuerzaUPT\frontend`
**Skills instaladas:** `D:\ProyectoWebFuerzaUPT\.opencode\skill-archives`
**Fase anterior:** Fase 1 Limitada — completada, decisión `GO_PHASE_2` (ver `docs/execution/PHASE_1_REPORT.md`)
**Esta fase:** Fase 2 según `PLAN_CORRECCION_PRIORIZADO.md` y `PLAN_MAESTRO_PULIDO_TOTAL_FUERZA_UPT.md` (ambos coinciden en que la Fase 2 = Contratos API)
**Fuente de la evidencia:** inspección directa del código real entregado en `FUERZA_UPT_BACKEND_FRONTEND_COMPACT_20260731-235436.zip`, no solo de la documentación previa.

---

## 0. Cómo usar este documento

Este documento reemplaza a la sección genérica de Fase 2 del plan maestro. No inventa alcance nuevo: concreta esa fase con archivos, clases y rutas reales encontradas en el código, para que Antigravity no tenga que redescubrirlas.

Sigue aplicando todo lo ya establecido en `AGENTS.md` y en la sección "Reglas no negociables" del plan maestro. Este documento no las repite todas, solo las que son críticas para esta fase.

---

## 1. Precondición ya satisfecha

- `frontend\.git` sigue siendo el único repositorio Git (raíz y `backend` sin Git independiente).
- Backup verificado en `D:\Backups\FuerzaUPT\20260726-231005`.
- Fase 1 Limitada cerrada en verde: Maven test/verify, ESLint, TypeScript y build de Next PASSED.
- Newsletter y oportunidades públicas ya no simulan éxito ni ocultan errores.

No repetir Fase 0/0.1/1. Empezar directamente en el alcance de abajo.

---

## 2. Skills a cargar para esta fase

Cargar únicamente estas, en este orden, desde `D:\ProyectoWebFuerzaUPT\.opencode\skill-archives`:

1. `rest-api-contract-designer` — skill principal de esta fase.
2. `spring-module-builder` — solo como apoyo, sin tocar límites modulares todavía (eso es Fase 4).
3. `testing-quality-gate` — para ejecutar y registrar verificaciones al cierre.

No cargar `jpa-postgres-flyway`, `media-storage-manager` ni `spring-security-admin` en esta fase: no hay trabajo de migraciones, storage ni seguridad de sesión en el alcance de Fase 2.

---

## 3. Alcance de esta fase

### Sí incluye

- Resolver la convivencia de contratos administrativos genéricos vs. específicos.
- Tipar `AdminStatusController` (elimina `Map<String,Object>`).
- Tipar la respuesta de `GET /api/auth/csrf` (elimina `Map<String,String>`).
- Decidir y documentar el estado canónico del módulo de proyectos en el admin genérico.
- Cerrar el vacío funcional detectado en el módulo de noticias del admin (ver hallazgo H4).
- Actualizar `MATRIZ_CONTRATOS_API.md` con el estado real después de los cambios.
- Generar el reporte de fase.

### No incluye (aunque aparezca tentador tocarlo)

- Romper la dependencia circular de módulos (`admin, auth, common, content, media, security, team`) — eso es Fase 4.
- Tocar Flyway, PostgreSQL real o Supabase Storage — eso es Fase 3 y Fase 5/6.
- Construir el formulario completo de creación/edición de proyectos — el propio código ya lo marca como diferido a "Fase 5 del plan" (ver `frontend/src/app/administracion/proyectos/nuevo/page.tsx` y `.../[id]/editar/page.tsx`). **No adelantar ese trabajo aquí**, solo dejar el contrato backend correcto para cuando llegue esa fase.
- Agregar infraestructura de pruebas automatizadas (Vitest/Jest/Playwright) — eso corresponde a la fase de pruebas.

---

## 4. Hallazgos confirmados en el código real (no solo en la auditoría)

### H1 — Duplicación de contrato admin genérico vs. específico

Existen tres controladores administrativos que pueden gestionar contenido con superficie solapada:

| Controlador | Ruta | Alcance |
|---|---|---|
| `AdminContentController` (`admin/controller/AdminContentController.java`) | `/api/admin/content/{module}/...` | Genérico "legacy": `summaries`, `list`, `create`, `update`, `archive`. |
| `AdminModuleController` (`admin/controller/AdminModuleController.java`) | `/api/admin/{module:representacion\|eventos\|oportunidades\|noticias\|estadisticas}/...` | Genérico "nuevo": `list`, `create`, `find`, `update`, `estado-editorial`, `destacado`, `orden`, `archive`. Incluye literalmente `oportunidades` en su patrón de ruta. |
| `OpportunityAdminController` (`opportunity/controller/OpportunityAdminController.java`) | `/api/admin/becas-y-oportunidades/...` | Específico y completo: CRUD, `estado`, `destacada`, `orden`, `archive`, `restaurar`, `permanente`, portada (subida/reemplazo/borrado). |

Verificado en frontend:

- `frontend/src/services/admin/opportunity-admin-service.ts` usa exclusivamente `/admin/becas-y-oportunidades` — correcto, no consume el genérico.
- `frontend/src/services/admin/content-admin-service.ts` define `GenericAdminModule` incluyendo `"opportunities": "oportunidades"` y `"projects": "proyectos"`, pero `AdminContentManager` (el componente que usa ese servicio) **solo está montado** en `frontend/src/app/administracion/inicio/page.tsx` (`statistics`), `.../representacion-estudiantil/page.tsx` (`representation`) y `.../eventos/page.tsx` (`events`). No hay ninguna página que monte `AdminContentManager` con `module="opportunities"` ni `module="projects"`.

**Conclusión:** hoy no hay colisión activa en runtime (nadie llama al genérico para oportunidades o proyectos desde la UI), pero el contrato permite hacerlo, lo cual es exactamente el riesgo que señala FUPT-005. Es deuda de contrato, no un bug en producción todavía.

**Acción de esta fase:**
1. Declarar `oportunidades` y `proyectos` como módulos **no soportados** por `AdminModuleController` y `AdminContentController`/`content-admin-service.ts` — no solo de facto, sino explícitamente:
   - Backend: retirar `oportunidades` del patrón de ruta de `AdminModuleController` (`@RequestMapping("/api/admin/{module:representacion|eventos|noticias|estadisticas}")`, sin `oportunidades`).
   - Backend: si `AdminContentService.canonicalModule(...)` o equivalente acepta `"oportunidades"`/`"proyectos"`, hacer que rechace esos valores con un error 404/400 explícito en vez de aceptarlos silenciosamente.
   - Frontend: reducir `GenericAdminModule` en `frontend/src/types/admin.ts` para excluir `"opportunities"` y `"projects"` (ambos ya tienen contrato propio), dejando `GenericAdminModule` solo con los módulos realmente servidos por el genérico: `representation | events | news | statistics`.
2. No eliminar `OpportunityAdminController` ni sus rutas: es el contrato canónico y ya está correctamente consumido.
3. Actualizar `MATRIZ_CONTRATOS_API.md`: la fila de `/api/admin/{module}` debe decir "COMPATIBLE — genérico limitado a representación/eventos/noticias/estadísticas; oportunidades y proyectos excluidos explícitamente" en vez de "contrato solapa el anterior".

### H2 — `AdminStatusController` sin tipar (FUPT-009)

`admin/controller/AdminStatusController.java`, método `status(...)`, devuelve `Map<String, Object>` con las claves `status`, `authenticatedAs`, `serverTime`, `cacheEventCursor`.

**Acción:** crear `AdminStatusResponse` (record Java) con esos cuatro campos tipados (`String status`, `String authenticatedAs`, `Instant serverTime`, `Long cacheEventCursor` o el tipo real de `cacheInvalidationPoller.lastSeenId()`), y hacer que el controlador devuelva ese record. No hay consumidor frontend identificado hoy (`MATRIZ_CONTRATOS_API.md` lo marca "SIN CONSUMIDOR"); confirmar eso sigue siendo cierto antes de tipar, para no romper nada oculto.

### H3 — CSRF sin DTO tipado

`auth/controller/AuthController.java`, método `getCsrfToken(...)` en `GET /api/auth/csrf`, devuelve `ResponseEntity<Map<String, String>>` con `token`, `headerName`, `parameterName`.

**Acción:** crear `CsrfTokenResponse` (record con esos tres `String`) y usarlo como tipo de retorno. Verificar que `frontend/src/services/auth-service.ts` (o el cliente que llama a este endpoint) siga funcionando igual, ya que el shape JSON no cambia, solo se tipa formalmente en el backend y se puede reflejar con Zod en frontend si aún no existe validación ahí.

### H4 — Módulo de noticias sin página de administración (gap funcional, no solo de contrato)

El backend expone `noticias` como módulo administrable vía `AdminModuleController` (está en el patrón de ruta), y `frontend/src/types/admin.ts` incluye `"news"` en `AdminModule` y en `GenericAdminModule`. Sin embargo, no existe ninguna carpeta `frontend/src/app/administracion/noticias/` ni ninguna página que monte `AdminContentManager` con `module="news"`.

Esto es un vacío funcional real: el contrato existe en ambos lados (tipos + ruta backend), pero no hay UI que lo use. No estaba en la Matriz de Contratos original porque esa matriz describe compatibilidad de contratos, no cobertura de páginas.

**Acción de esta fase:** decidir y documentar una de las dos opciones (no ejecutar ambas):

- **Opción A (recomendada para esta fase):** crear `frontend/src/app/administracion/noticias/page.tsx` reutilizando `AdminContentManager` con `module="news"`, igual que `eventos` y `representacion-estudiantil`. Es de bajo riesgo porque el componente y el contrato ya existen y ya están probados en otros módulos.
- **Opción B:** si se decide que noticias no se gestiona todavía por decisión de producto, dejar constancia explícita en `docs/execution/PHASE_2_REPORT.md` de que es una omisión conocida y no un contrato roto, para que no se reporte de nuevo como hallazgo nuevo en la próxima auditoría.

No dejar este punto sin decisión explícita: es la clase de cosa que genera falsos hallazgos repetidos en auditorías futuras.

### H5 — Confirmación: proyectos con CRUD intencionalmente incompleto, no roto

`project/controller/AdminProjectController.java` solo expone `GET` (list, get by id) — no tiene `POST`, `PUT` ni `DELETE`. `frontend/src/services/admin/project-admin-service.ts` refleja exactamente eso: solo `getProjects` y `getProject`.

Las páginas `frontend/src/app/administracion/proyectos/nuevo/page.tsx` y `.../[id]/editar/page.tsx` muestran explícitamente el texto "El formulario de \[creación/edición\] completo será implementado en la Fase 5 del plan" y, en el caso de edición, confirman que la carga de datos reales ya funciona ("Puerta 2 validada").

**Esto no es una incongruencia: es un stub deliberado y coherente con el plan.** No implementar create/update/delete de proyectos en esta fase. Único cambio permitido aquí: si al tipar contratos administrativos se detecta que el DTO `ProjectAdminResponse` necesita ajustes para ser consistente con el resto de respuestas admin tipadas (por ejemplo, mismo patrón de `version` para optimistic locking que ya usa `OpportunityAdminResponse`), documentarlo como nota para Fase 5, no ejecutarlo ahora.

### H6 — OpenAPI sigue deshabilitado por defecto

`backend/src/main/resources/application.yml` línea ~76-80: `springdoc.api-docs.enabled` y `springdoc.swagger-ui.enabled` dependen de `OPENAPI_ENABLED:false`. Sigue en `false` por defecto, tal como reportó la auditoría.

**Acción:** no cambiar el default en esta fase (evita exponer documentación involuntariamente en producción). Si se necesita comparar rutas/DTOs reales contra la matriz, habilitarlo solo en local (`OPENAPI_ENABLED=true` en `.env` local, nunca commiteado) y usarlo como apoyo de verificación, no como cambio de configuración de despliegue.

---

## 5. Tareas concretas de la fase, en orden

1. Backend: crear `AdminStatusResponse` y actualizar `AdminStatusController` (H2).
2. Backend: crear `CsrfTokenResponse` y actualizar `AuthController#getCsrfToken` (H3).
3. Backend: restringir el patrón de ruta de `AdminModuleController` para excluir `oportunidades` (H1).
4. Backend: hacer que `AdminContentService` rechace explícitamente `oportunidades` y `proyectos` como módulo válido si hoy los acepta (H1).
5. Frontend: reducir `GenericAdminModule` en `frontend/src/types/admin.ts` (H1).
6. Frontend/decisión de producto: resolver H4 (opción A o B) y dejar evidencia en el reporte.
7. Ejecutar los gates de calidad (sección 7).
8. Actualizar `MATRIZ_CONTRATOS_API.md` con el estado posterior a los cambios.
9. Redactar `docs/execution/PHASE_2_REPORT.md` con el formato de la sección 9.

---

## 6. Reglas no negociables aplicables a esta fase

- No exponer entidades JPA directamente como respuesta.
- No usar `Map<String,Object>` como contrato público o administrativo (esto es literalmente lo que corrige H2 y H3).
- No introducir un segundo endpoint canónico para la misma capacidad — H1 corrige el riesgo de que eso ocurra con oportunidades/proyectos vía el genérico.
- No modificar migraciones Flyway ni tocar `ddl-auto`.
- No modificar `SupabaseStorageService`, sesión, cookies, CORS o CSRF más allá de tipar la respuesta del endpoint `/csrf` (el mecanismo de CSRF en sí no cambia).
- No declarar una prueba como aprobada si no fue ejecutada.
- No eliminar `AdminContentController` ni `AdminModuleController` en esta fase, solo acotar su alcance — la limpieza final de legacy es Fase 8/9.
- Cambios pequeños y reversibles; commit o snapshot antes de empezar si hay autorización para ello.

---

## 7. Pruebas obligatorias antes de cerrar la fase

Backend:
- `.\mvnw.cmd -q test`
- `.\mvnw.cmd -q verify`
- Prueba manual o MockMvc de que `GET /api/admin/oportunidades` (vía `AdminModuleController`) ya no resuelve, o responde 404/400 explícito, después del cambio.
- Prueba manual o MockMvc de `GET /api/admin/status` y `GET /api/auth/csrf` devolviendo los nuevos DTOs con el mismo shape JSON que antes (para no romper consumidores existentes).

Frontend:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Verificación manual de que `/administracion/becas-y-oportunidades` y `/administracion/proyectos` siguen funcionando igual (no deben usar el genérico, así que no deberían verse afectados, pero hay que confirmarlo tras achicar `GenericAdminModule`).
- Si se ejecuta la opción A de H4: verificación manual de que `/administracion/noticias` carga, lista, crea, edita y archiva contenido igual que `/administracion/eventos`.

No hay infraestructura de pruebas automatizadas frontend todavía — seguir declarando ese punto como `BLOCKED` en el reporte, no simularlo.

---

## 8. Definition of Done de la Fase 2

```text
[ ] AdminStatusController devuelve AdminStatusResponse tipado
[ ] GET /api/auth/csrf devuelve CsrfTokenResponse tipado
[ ] AdminModuleController ya no acepta "oportunidades" como módulo
[ ] AdminContentService rechaza explícitamente "oportunidades" y "proyectos"
[ ] GenericAdminModule en frontend excluye "opportunities" y "projects"
[ ] Decisión H4 (noticias) tomada y documentada, con página creada o con nota de omisión conocida
[ ] MATRIZ_CONTRATOS_API.md actualizada
[ ] Maven test/verify PASSED
[ ] ESLint, TypeScript y build de Next PASSED
[ ] docs/execution/PHASE_2_REPORT.md creado
[ ] Decisión final: GO_PHASE_3 | CONDITIONAL_GO | NO_GO
```

No avanzar a Fase 3 (Flyway/persistencia) si el resultado es `NO_GO`.

---

## 9. Formato de reporte obligatorio

Crear `docs/execution/PHASE_2_REPORT.md` con esta estructura, igual que las fases anteriores:

```md
# Phase 2 Report

## Scope
## Skills loaded
## Baseline
## Files created
## Files modified
## Files deleted
## Endpoints affected
## Contracts changed
## H1–H6: resolución de cada hallazgo
## Tests executed
## Test results
## Risks
## Rollback
## Residual debt
## Decision: GO_PHASE_3 | CONDITIONAL_GO | NO_GO
```

---

## 10. Rollback

- Los cambios de contrato son aditivos/restrictivos, no destructivos: no hay migraciones ni datos involucrados.
- Para revertir, restaurar los archivos modificados desde `D:\Backups\FuerzaUPT\20260726-231005\project\...` o desde el commit/snapshot previo a esta fase.
- Si se crea `frontend/src/app/administracion/noticias/page.tsx` (opción A de H4), su rollback es simplemente eliminar ese archivo.

---

## 11. Prompt copiable para Antigravity

```text
Trabaja en D:\ProyectoWebFuerzaUPT.

Especificación principal de esta sesión:
FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md

Contexto adicional obligatorio:
PLAN_MAESTRO_PULIDO_TOTAL_FUERZA_UPT.md
PLAN_CORRECCION_PRIORIZADO.md
MATRIZ_CONTRATOS_API.md
AGENTS.md
docs/execution/PHASE_1_REPORT.md

Skills a cargar desde D:\ProyectoWebFuerzaUPT\.opencode\skill-archives:
1. rest-api-contract-designer
2. spring-module-builder (solo apoyo, sin tocar límites modulares)
3. testing-quality-gate

REGLAS
1. Ejecutar solo el alcance de la sección 3 de FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md.
2. No tocar Flyway, PostgreSQL real, Supabase Storage ni el formulario completo de proyectos.
3. Resolver los hallazgos H1 a H6 en el orden de la sección 5.
4. No declarar pruebas aprobadas sin ejecutarlas.
5. No continuar si algún gate de calidad falla.
6. Actualizar MATRIZ_CONTRATOS_API.md al cierre.
7. Crear docs/execution/PHASE_2_REPORT.md con el formato de la sección 9.
8. Terminar con una decisión explícita: GO_PHASE_3, CONDITIONAL_GO o NO_GO.
9. No avanzar a Fase 3 sin autorización explícita del usuario.

COMIENZA inspeccionando los archivos reales mencionados en la sección 4
antes de modificar nada, y confirma que los hallazgos H1–H6 siguen
vigentes en el estado actual del código antes de aplicar cambios.
```
