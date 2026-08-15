# PLAN CORRECTIVO Y DE RECUPERACIÓN DEL MÓDULO PROYECTOS — FUERZA UPT

## 1. Diagnóstico actual

La implementación no terminó correctamente.

La pantalla actual demuestra que se ejecutó primero la parte destructiva de la migración:

```text
Se retiró el registro anterior.
Se mantuvo el formulario genérico.
No se creó el formulario específico.
No se migró Ruta Fuerza UPT.
No se muestran los campos completos.
La API administrativa no está entregando registros.
```

El mensaje:

```text
No se pudo cargar el módulo.
```

indica además que existe un error de integración entre:

```text
Frontend administrativo
API administrativa
Backend
Base de datos
```

El resultado actual no corresponde al plan esperado.

---

# 2. Error principal de implementación

El plan anterior debía ejecutarse en este orden:

```text
1. Crear nueva estructura.
2. Migrar datos existentes.
3. Implementar backend específico.
4. Implementar frontend específico.
5. Validar.
6. Recién después retirar CRUD y mocks antiguos.
```

Sin embargo, la ejecución aparentemente siguió este orden:

```text
1. Retirar el mock o registro anterior.
2. Dejar el CRUD genérico.
3. Crear parcialmente la nueva estructura.
4. No conectar los campos específicos.
5. No verificar la carga del módulo.
```

Esto provocó:

- Pérdida visual de Ruta Fuerza UPT.
- Conteo de cero registros.
- Formulario incorrecto.
- Campos incompletos.
- Error de carga.
- Falta de migración de los datos existentes.

---

# 3. Objetivo del plan correctivo

Recuperar el proyecto existente y completar el módulo sin volver a borrar información antes de tiempo.

Al finalizar, el administrador deberá poder crear, editar y publicar un proyecto con:

```text
Portada
Nombre del proyecto
Resumen
Categoría
Problema que atiende
Objetivo
Beneficiarios
Fecha de inicio
Fecha de finalización
Estado operativo
Responsables
Aliados
Eventos vinculados
Resultados
Galería opcional
Estado editorial
Destacado
Orden
```

Además, debe recuperarse:

```text
Ruta Fuerza UPT
```

con toda la información que anteriormente aparecía en la página pública.

---

# 4. Regla de seguridad

No eliminar ningún archivo, componente, endpoint, tabla o dato adicional hasta completar estas verificaciones:

```text
Backend compila.
Migraciones ejecutan.
API administrativa responde.
Ruta Fuerza UPT aparece en Administración.
Formulario específico funciona.
API pública devuelve el proyecto.
Página /proyectos lo muestra.
Edición persiste después de recargar.
```

El CRUD genérico solo podrá eliminarse cuando todo lo anterior esté confirmado.

---

# 5. Fase 0 — Congelar y respaldar

## Tareas

1. Detener cambios automáticos.
2. Crear una rama o copia:

```text
fix/projects-module-recovery
```

3. Crear respaldo de PostgreSQL.
4. Copiar la versión actual del frontend y backend.
5. Guardar logs actuales.
6. No ejecutar nuevas migraciones destructivas.

## Entregables

```text
backup_database.sql
backup_frontend/
backup_backend/
logs/projects-module-error.log
```

---

# 6. Fase 1 — Identificar el error de carga

El mensaje:

```text
No se pudo cargar el módulo.
```

debe investigarse antes de cambiar la interfaz.

## Verificaciones

### Frontend

Revisar en DevTools:

```text
Network
Console
Request URL
Status code
Response body
```

Confirmar qué endpoint llama la página.

Debe ser uno solo:

```http
GET /api/admin/proyectos
```

No debe seguir usando:

```text
/api/admin/content/projects
/api/admin/content/proyectos
/api/admin/projects
```

salvo que ese sea el contrato oficial elegido.

### Backend

Verificar:

```text
Controlador existente
Ruta exacta
Método GET
Rol ADMIN
CSRF
Cookies
CORS
Logs
```

### Base de datos

Ejecutar:

```sql
SELECT *
FROM projects
ORDER BY display_order;
```

Confirmar si:

- La fila de Ruta Fuerza UPT sigue existiendo.
- Está en `DRAFT`, `PUBLISHED` o `ARCHIVED`.
- La migración movió o eliminó datos.
- La nueva tabla está vacía.

## Resultado esperado

Debe documentarse una de estas causas:

```text
Endpoint incorrecto
DTO incompatible
Error 401
Error 403
Error 404
Error 500
Migración incompleta
Tabla vacía
Mapper roto
Campo faltante
Enum incompatible
```

No continuar hasta conocer la causa exacta.

---

# 7. Fase 2 — Recuperar Ruta Fuerza UPT

## Escenario A — La fila sigue en `projects`

No volver a insertar.

Corregir:

```text
Repositorio
Mapper
DTO
Endpoint
Estado editorial
```

## Escenario B — La fila fue archivada

Restaurar:

```sql
UPDATE projects
SET content_status = 'PUBLISHED'
WHERE slug = 'ruta-fuerza-upt';
```

Solo ejecutar después de confirmar que el registro corresponde al proyecto correcto.

## Escenario C — La fila fue eliminada

Recuperarla desde:

```text
Backup de la base
Migración anterior
Datos seed
Git
Código local anterior
```

No crear un proyecto nuevo manualmente sin revisar la información original.

## Datos que deben conservarse

```text
Nombre: Ruta Fuerza UPT
Resumen
Problema que atiende
Objetivo
Fecha de inicio
Fecha final
Estado operativo
Responsables
Aliados
Beneficiarios
Eventos vinculados
Resultados
Portada
Estado editorial
Destacado
Orden
```

---

# 8. Fase 3 — Verificar y completar Flyway

El plan menciona:

```text
V24__normalize_projects_module.sql
```

Debe comprobarse si realmente existe y si Flyway la ejecutó.

## Verificaciones

```sql
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

## La migración debe crear o verificar

```text
projects.cover_media_id
projects.cover_alt_text
projects.problem
projects.objective
projects.beneficiaries
projects.start_date
projects.end_date
projects.project_status

project_responsibles
project_partners
project_results
project_gallery

events.project_id
```

## La migración debe incluir

- Claves foráneas.
- Restricciones.
- Índices.
- Migración de datos.
- Conservación del proyecto existente.

## Regla

Si V24 ya fue aplicada:

```text
No modificar V24.
```

Crear una nueva migración correctiva:

```text
V25__repair_projects_module.sql
```

Nunca cambiar una migración que ya fue ejecutada en Supabase.

---

# 9. Fase 4 — Implementar backend específico

No utilizar para Proyectos:

```text
AdminContentRequest
AdminContentUpdateRequest
AdminContentRowResponse
CRUD genérico
Map<String, Object>
```

## Paquete esperado

```text
project/
├── controller/
│   ├── AdminProjectController.java
│   └── PublicProjectController.java
├── dto/
│   ├── CreateProjectRequest.java
│   ├── UpdateProjectRequest.java
│   ├── ProjectAdminListResponse.java
│   ├── ProjectAdminDetailResponse.java
│   ├── ProjectPublicResponse.java
│   ├── OrderedTextRequest.java
│   └── EventReferenceResponse.java
├── entity/
├── repository/
├── service/
├── mapper/
└── validation/
```

## Endpoint administrativo mínimo

```http
GET /api/admin/proyectos
```

Debe devolver lista administrativa.

```http
GET /api/admin/proyectos/{id}
```

Debe devolver todos los campos para edición.

```http
POST /api/admin/proyectos
```

Debe crear un borrador.

```http
PUT /api/admin/proyectos/{id}
```

Debe actualizar todos los campos.

```http
PATCH /api/admin/proyectos/{id}/estado-editorial
```

Debe publicar, despublicar o archivar.

## Endpoint público

```http
GET /api/proyectos
GET /api/proyectos/{slug}
```

Debe devolver únicamente publicados.

---

# 10. Fase 5 — Implementar formulario administrativo real

Eliminar de la vista nueva:

```text
Slug manual
Formulario inline
Título y resumen como únicos campos
Categoría aislada
Botón Crear dentro de la tabla
```

## Nueva interfaz

La pantalla principal debe mostrar:

```text
Proyectos
[Nuevo proyecto]

Buscador
Filtro por estado
Listado de proyectos
```

Cada fila:

```text
Portada
Nombre
Estado operativo
Estado editorial
Periodo
Eventos
Orden
Editar
Archivar
```

## Nuevo proyecto

Al presionar:

```text
Nuevo proyecto
```

ir a:

```text
/administracion/proyectos/nuevo
```

## Edición

```text
/administracion/proyectos/{id}/editar
```

---

# 11. Campos obligatorios del formulario

## Portada

```text
Seleccionar archivo
Vista previa
Reemplazar
Quitar
Texto alternativo
```

## Información principal

```text
Nombre
Resumen
Categoría
Estado operativo
```

## Propósito

```text
Problema que atiende
Objetivo
Beneficiarios
```

## Periodo

```text
Fecha de inicio
Fecha final
Proyecto continuo
```

## Responsables

```text
Agregar
Editar
Quitar
Reordenar
```

## Aliados

```text
Agregar
Editar
Quitar
Reordenar
```

## Eventos vinculados

```text
Buscar
Seleccionar
Desvincular
Reordenar
```

## Resultados

```text
Agregar
Editar
Quitar
Reordenar
```

## Publicación

```text
Guardar borrador
Publicar
Destacado
Orden
Vista previa
```

---

# 12. Fase 6 — Carga de imagen

El archivo debe quedar almacenado en Supabase Storage.

## Flujo

```text
Archivo local
→ Preview
→ Multipart Spring Boot
→ Validación
→ Supabase Storage
→ media_assets
→ projects.cover_media_id
```

## No permitir

```text
URL manual
Ruta local
Base64 en PostgreSQL
```

## Endpoint recomendado

```http
POST /api/admin/proyectos/{id}/portada
```

o creación multipart unificada.

---

# 13. Fase 7 — Vista previa idéntica al landing

Crear:

```text
ProjectCard
```

Usarlo en:

```text
/proyectos
Administración / Vista previa
```

Debe renderizar:

```text
Portada
Estado
Nombre
Resumen
Problema
Objetivo
Periodo
Responsables
Aliados
Beneficiarios
Eventos
Resultados
```

Reglas:

```text
Sin aliados → ocultar bloque
Sin eventos → ocultar bloque
Sin resultados → ocultar bloque
```

---

# 14. Fase 8 — Sincronización y caché

Después de guardar:

```text
Commit PostgreSQL
Auditoría
Invalidar caché projects
Invalidar caché home
Revalidar tag projects
Revalidar tag home
```

La revalidación externa debe ocurrir después del commit.

---

# 15. Fase 9 — Recién entonces retirar residuos

Solo cuando el nuevo módulo funcione:

## Frontend

Eliminar:

```text
CRUD genérico de Proyectos
Formulario inline
Servicios genéricos
Tipos genéricos usados por Proyectos
Mock anterior
Fallback local
```

## Backend

Eliminar:

```text
Rutas genéricas de content para projects
DTO genérico de proyectos
Mapper genérico
Código duplicado
```

## Base de datos

Eliminar columnas obsoletas mediante una migración posterior.

No borrar registros.

---

# 16. Puertas de control

Codex no debe avanzar a la siguiente fase sin comprobar:

## Puerta 1

```text
GET /api/admin/proyectos devuelve Ruta Fuerza UPT.
```

## Puerta 2

```text
GET /api/admin/proyectos/{id} devuelve todos los campos.
```

## Puerta 3

```text
El formulario muestra todos los campos.
```

## Puerta 4

```text
Guardar borrador funciona.
```

## Puerta 5

```text
Publicar muestra el proyecto en /proyectos.
```

## Puerta 6

```text
Editar y recargar conserva cambios.
```

## Puerta 7

```text
La portada permanece después de reiniciar.
```

## Puerta 8

```text
Solo después se elimina el CRUD antiguo.
```

---

# 17. Pruebas de recuperación

## Backend

```text
Flyway ejecuta
Ruta Fuerza UPT existe
Listado admin responde
Detalle admin responde
Crear borrador
Editar
Publicar
API pública
Relaciones
Portada
Conflicto de versión
```

## Frontend

```text
Listado carga
No aparece “No se pudo cargar el módulo”
Nuevo proyecto abre formulario completo
Preview funciona
Carga de portada
Listas dinámicas
Edición
Publicación
```

## E2E

```text
Login
Abrir Proyectos
Ver Ruta Fuerza UPT
Editar objetivo
Guardar
Recargar
Ver cambio
Crear borrador
Publicar
Ver en landing
Archivar
Restaurar
```

---

# 18. Criterios de aceptación

La corrección estará completa cuando:

- Ruta Fuerza UPT haya sido recuperada.
- El módulo cargue sin errores.
- No aparezca el formulario genérico.
- Nuevo proyecto abra un formulario completo.
- Todos los campos del landing sean editables.
- La portada se cargue localmente y quede persistente.
- Los responsables sean editables.
- Los aliados sean editables.
- Los eventos puedan vincularse.
- Los resultados sean editables.
- La vista previa coincida con el landing.
- Publicar actualice la página pública.
- Recargar no pierda cambios.
- El CRUD antiguo se elimine al final, no al inicio.

---

# 19. Prompt correctivo para Codex

```text
La implementación anterior del módulo Proyectos quedó incompleta.

Estado actual:
- Se eliminó o dejó de mostrar Ruta Fuerza UPT.
- El panel muestra 0 registros.
- Aparece “No se pudo cargar el módulo”.
- Continúa el formulario genérico con slug, título, resumen y categoría.
- No aparecen los campos específicos del plan.
- No se debe eliminar nada más.

Ejecuta este plan correctivo:

1. Detén cualquier limpieza adicional.
2. Audita el endpoint exacto que consume /administracion/proyectos.
3. Revisa Network, logs backend y flyway_schema_history.
4. Confirma si Ruta Fuerza UPT sigue en PostgreSQL.
5. Recupera el registro sin duplicarlo.
6. Si V24 ya fue aplicada, no la edites; crea V25 correctiva.
7. Implementa GET /api/admin/proyectos y GET /api/admin/proyectos/{id}.
8. Implementa DTO específicos con todos los campos.
9. Reemplaza el formulario inline por:
   /administracion/proyectos/nuevo
   /administracion/proyectos/{id}/editar
10. Agrega portada, problema, objetivo, periodo, beneficiarios,
    responsables, aliados, eventos vinculados y resultados.
11. Implementa carga de portada a Supabase Storage.
12. Reutiliza ProjectCard como preview.
13. Guarda como borrador antes de publicar.
14. Verifica persistencia.
15. Invalida caché después del commit.
16. No elimines CRUD genérico hasta que el flujo nuevo esté validado.

Puertas obligatorias:
- Ruta Fuerza UPT aparece en el listado.
- El detalle devuelve todos los campos.
- El formulario completo aparece.
- Guardar funciona.
- Publicar funciona.
- /proyectos refleja el cambio.
- Recargar conserva la información.

Antes de modificar:
- Entrega causa exacta del error “No se pudo cargar el módulo”.
- Entrega resultado de SELECT sobre projects.
- Entrega estado de V24.
- Entrega lista de archivos que vas a modificar.

Después:
- Entrega datos recuperados.
- Entrega endpoints probados.
- Entrega archivos creados/modificados/eliminados.
- Entrega resultados de Maven, ESLint, TypeScript, Next build y E2E.
```
