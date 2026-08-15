# PLAN DE NORMALIZACIÓN E IMPLEMENTACIÓN DEL MÓDULO PROYECTOS — FUERZA UPT

## 1. Objetivo

Reemplazar el CRUD genérico actual de **Proyectos** por un módulo específico que permita al administrador recrear completamente la tarjeta pública mostrada en `/proyectos`.

El administrador debe poder gestionar desde el panel:

- Imagen principal.
- Nombre del proyecto.
- Resumen.
- Problema que atiende.
- Objetivo.
- Periodo.
- Estado operativo.
- Responsables.
- Aliados.
- Beneficiarios.
- Eventos vinculados.
- Resultados.
- Estado editorial.
- Orden de aparición.
- Publicación, edición, archivo y eliminación.

La página pública debe mostrar exclusivamente datos persistidos en PostgreSQL y archivos almacenados en Supabase Storage.

---

# 2. Problema actual

La tarjeta pública de Proyectos muestra mucha más información que la disponible en el panel administrativo.

## 2.1. Información visible en la página pública

La tarjeta actual muestra:

```text
Imagen principal
Estado del proyecto
Nombre
Resumen
Problema que atiende
Objetivo
Periodo
Responsables
Aliados
Beneficiarios
Eventos vinculados
Resultados
Botón “Ver eventos del proyecto”
```

## 2.2. Campos disponibles actualmente en Administración

El formulario actual permite principalmente:

```text
Slug
Título
Resumen
Categoría
Estado editorial
Orden
Destacado
```

## 2.3. Consecuencia

El administrador no puede reconstruir ni editar completamente la tarjeta pública.

Ejemplo:

```text
El landing muestra “Problema que atiende”
pero el panel no permite editar ese campo.

El landing muestra “Responsables”
pero el panel no permite agregar ni retirar responsables.

El landing muestra eventos vinculados
pero el panel no permite elegirlos.

El landing muestra una imagen
pero el panel no permite cargarla desde la computadora.
```

Este desfase confirma que el módulo todavía usa un CRUD genérico. Debe reemplazarse por un formulario específico de Proyecto. La auditoría anterior ya identificó que el CRUD administrativo solo cubre campos generales y omite problema, objetivo, responsables, aliados, beneficiarios, resultados, galería y eventos vinculados. fileciteturn1file0

---

# 3. Regla funcional del módulo

Un **Proyecto** es una iniciativa de mediano o largo alcance que contiene:

```text
Objetivo
Periodo
Responsables
Beneficiarios
Actividades o eventos vinculados
Resultados
```

No debe confundirse con un Evento.

Ejemplo:

```text
Proyecto:
Ruta Fuerza UPT

Eventos vinculados:
IA jurídica en el derecho de familia
Conversatorio jurídico sobre la Ley N.° 32535
Oratoria, redacción y argumentación jurídica
```

Los eventos mantienen su propio registro. El proyecto solo los relaciona.

---

# 4. Información definitiva de un proyecto

## 4.1. Campos obligatorios para publicar

```text
Imagen principal
Nombre del proyecto
Resumen
Problema que atiende
Objetivo
Fecha de inicio
Estado operativo
Al menos un responsable
Beneficiarios
```

## 4.2. Campos opcionales

```text
Fecha de finalización
Aliados
Eventos vinculados
Resultados
Galería
Categoría
```

## 4.3. Campos administrativos

```text
Estado editorial
Orden de aparición
Destacado
Fecha de creación
Fecha de actualización
Versión
```

## 4.4. Campos que no deben ser escritos manualmente

```text
ID
Slug
Fecha de creación
Fecha de actualización
Versión
```

El slug debe generarse automáticamente desde el nombre.

Ejemplo:

```text
Ruta Fuerza UPT
→ ruta-fuerza-upt
```

---

# 5. Estados separados

No mezclar el estado editorial con el estado real del proyecto.

## 5.1. Estado editorial

Controla si el contenido aparece públicamente:

```text
DRAFT
PUBLISHED
ARCHIVED
```

En la interfaz:

```text
Borrador
Publicado
Archivado
```

## 5.2. Estado operativo

Describe la situación del proyecto:

```text
UPCOMING
ACTIVE
PAUSED
FINISHED
```

En la interfaz:

```text
Próximo
Activo
Pausado
Finalizado
```

Ejemplo:

```text
Estado editorial: Publicado
Estado operativo: Activo
```

---

# 6. Formulario administrativo definitivo

## 6.1. Comportamiento

Al presionar:

```text
Nuevo proyecto
```

abrir una página dedicada o modal amplio.

No utilizar el pequeño formulario inline actual.

Ruta recomendada:

```text
/administracion/proyectos/nuevo
```

Edición:

```text
/administracion/proyectos/{id}/editar
```

## 6.2. Estructura visual

En escritorio:

```text
Columna izquierda:
Formulario

Columna derecha:
Vista previa pública en tiempo real
```

En móvil:

```text
Formulario
Vista previa debajo
```

---

# 7. Secciones del formulario

# 7.1. Portada

Campos y acciones:

```text
Imagen principal *
Seleccionar desde la computadora
Vista previa
Reemplazar
Quitar
Texto alternativo
```

Validaciones:

```text
JPEG
PNG
WEBP
Máximo 5 MB
Resolución mínima recomendada: 1200 × 900
Relación recomendada: 4:5 o formato compatible con la tarjeta
```

---

# 7.2. Información principal

```text
Nombre del proyecto *
Resumen *
Categoría
Estado operativo *
```

Límites recomendados:

```text
Nombre: 3–120 caracteres
Resumen: 20–300 caracteres
Categoría: 2–80 caracteres
```

---

# 7.3. Propósito

```text
Problema que atiende *
Objetivo *
Beneficiarios *
```

Límites:

```text
Problema: 20–600 caracteres
Objetivo: 20–600 caracteres
Beneficiarios: 5–300 caracteres
```

---

# 7.4. Periodo

```text
Fecha de inicio *
Fecha de finalización
```

Regla:

```text
fechaFinal >= fechaInicio
```

Si el proyecto no tiene fecha final definida:

```text
Proyecto continuo
```

Puede representarse mediante:

```text
endDate = null
```

---

# 7.5. Responsables

Permitir una lista dinámica:

```text
Responsable 1
Responsable 2
Responsable 3
```

Acciones:

```text
Agregar responsable
Editar
Quitar
Reordenar
```

Debe existir al menos uno para publicar.

Ejemplo:

```text
Fuerza UPT
Coordinación de Formación
```

---

# 7.6. Aliados

Lista dinámica opcional:

```text
IUS ADVANCE
FACEM
Universidad Privada de Tacna
```

Acciones:

```text
Agregar aliado
Editar
Quitar
Reordenar
```

En una etapa posterior puede vincularse con un catálogo de aliados.

Primera versión:

```text
nombre como texto
```

---

# 7.7. Eventos vinculados

El administrador debe seleccionar eventos existentes.

Interfaz:

```text
Buscar evento
[ ] IA jurídica en el derecho de familia
[ ] Conversatorio jurídico
[ ] Oratoria y argumentación jurídica
```

Solo deben aparecer eventos:

```text
no archivados
```

Acciones:

```text
Vincular
Desvincular
Reordenar
Abrir evento
```

Regla recomendada:

```text
Un evento pertenece como máximo a un proyecto principal.
```

La relación se guarda en:

```text
events.project_id
```

El panel no debe duplicar el contenido del evento.

---

# 7.8. Resultados

Lista dinámica opcional.

Ejemplos:

```text
120 estudiantes participaron.
Se realizaron cinco sesiones.
Se entregaron constancias.
```

Acciones:

```text
Agregar resultado
Editar
Quitar
Reordenar
```

Si todavía no existen resultados:

```text
No mostrar el bloque públicamente
```

No debe mostrarse el texto automático:

```text
“Aún no hay resultados confirmados para publicación.”
```

salvo que se decida expresamente mantener ese mensaje.

Recomendación:

```text
bloque vacío = bloque oculto
```

---

# 7.9. Galería opcional

Permitir imágenes adicionales:

```text
Agregar imagen
Reordenar
Editar texto alternativo
Eliminar
```

La galería no es obligatoria para la primera versión del landing, pero el modelo puede quedar preparado.

---

# 7.10. Publicación

Controles:

```text
Guardar borrador
Publicar
Vista previa
Archivar
```

Campos administrativos:

```text
Orden de aparición
Proyecto destacado
```

El orden puede asignarse automáticamente al crear.

`Destacado` se conserva porque Inicio puede mostrar un proyecto principal.

---

# 8. Vista previa administrativa

La vista previa debe reutilizar el mismo componente visual de `/proyectos`.

Crear un componente compartido:

```text
ProjectCard
```

Debe utilizarse en:

```text
Página pública
Vista previa administrativa
```

La vista previa debe actualizarse mientras el administrador escribe:

```text
Imagen
Título
Resumen
Problema
Objetivo
Periodo
Responsables
Aliados
Beneficiarios
Eventos
Resultados
Estado
```

Así se evita que el panel y el landing interpreten los datos de forma diferente.

---

# 9. Diseño del listado administrativo

La pantalla principal de Proyectos debe mostrar una lista resumida, no todos los inputs abiertos.

Columnas:

```text
Imagen
Nombre
Estado operativo
Estado editorial
Periodo
Eventos vinculados
Orden
Acciones
```

Acciones:

```text
Vista previa
Editar
Publicar / Ocultar
Duplicar
Mover arriba
Mover abajo
Archivar
Eliminar definitivamente
```

El formulario inline actual debe eliminarse después de migrar.

---

# 10. Modelo de base de datos

## 10.1. Tabla `projects`

Campos recomendados:

```text
id UUID PK
slug VARCHAR UNIQUE
title VARCHAR
summary VARCHAR
category VARCHAR NULL
cover_media_id UUID NULL
cover_alt_text VARCHAR NULL

problem TEXT
objective TEXT
beneficiaries TEXT

start_date DATE
end_date DATE NULL
project_status VARCHAR

content_status VARCHAR
featured BOOLEAN
display_order INTEGER

published_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
version BIGINT
```

---

# 10.2. Tabla `project_responsibles`

```text
id UUID PK
project_id UUID FK
name VARCHAR
display_order INTEGER
```

---

# 10.3. Tabla `project_partners`

```text
id UUID PK
project_id UUID FK
name VARCHAR
display_order INTEGER
```

---

# 10.4. Tabla `project_results`

```text
id UUID PK
project_id UUID FK
description VARCHAR
display_order INTEGER
```

---

# 10.5. Tabla `project_gallery`

```text
id UUID PK
project_id UUID FK
media_asset_id UUID FK
alternative_text VARCHAR
display_order INTEGER
```

---

# 10.6. Relación con eventos

En `events`:

```text
project_id UUID NULL FK projects(id)
```

No crear copias de eventos dentro del proyecto.

---

# 11. Restricciones de base de datos

Agregar:

```sql
CHECK (display_order >= 0)
CHECK (end_date IS NULL OR end_date >= start_date)
CHECK (project_status IN ('UPCOMING','ACTIVE','PAUSED','FINISHED'))
CHECK (content_status IN ('DRAFT','PUBLISHED','ARCHIVED'))
```

Índices:

```text
projects(content_status, display_order)
projects(project_status, content_status)
events(project_id, start_date)
project_responsibles(project_id, display_order)
project_partners(project_id, display_order)
project_results(project_id, display_order)
```

---

# 12. Migración Flyway

No modificar migraciones ya ejecutadas.

Crear una migración nueva, por ejemplo:

```text
VXX__normalize_projects_module.sql
```

La migración debe:

1. Agregar columnas faltantes.
2. Crear tablas relacionadas.
3. Conservar el proyecto `Ruta Fuerza UPT`.
4. Migrar responsables actuales.
5. Migrar aliados actuales.
6. Migrar resultados actuales.
7. Vincular eventos existentes mediante `project_id`.
8. Convertir la imagen actual a `media_assets`.
9. Mantener el estado y orden.
10. No borrar columnas antiguas todavía.

Después de validar frontend y backend:

```text
VXX__remove_obsolete_project_columns.sql
```

---

# 13. Carga permanente de imagen

## 13.1. Flujo

```text
Administrador selecciona imagen local
→ navegador muestra preview temporal
→ frontend envía multipart/form-data
→ Spring Boot valida
→ Spring Boot sube a Supabase Storage
→ se crea media_assets
→ projects.cover_media_id guarda la referencia
→ API pública entrega la URL
→ Next.js muestra la imagen
```

No guardar:

```text
ruta local
base64 en PostgreSQL
URL escrita manualmente
```

---

# 13.2. Bucket

Usar:

```text
public-content
```

Ruta sugerida:

```text
projects/{projectId}/cover/{uuid}.webp
projects/{projectId}/gallery/{uuid}.webp
```

---

# 13.3. Consistencia

Al reemplazar portada:

```text
1. Subir nueva imagen.
2. Crear nuevo media_asset.
3. Actualizar proyecto.
4. Confirmar transacción.
5. Eliminar imagen anterior después del commit.
```

Si falla la base:

```text
eliminar la nueva imagen para evitar archivos huérfanos
```

---

# 14. DTO específicos del backend

No utilizar DTO genéricos.

## 14.1. Crear proyecto

```java
CreateProjectRequest {
    String title;
    String summary;
    String category;
    String problem;
    String objective;
    String beneficiaries;
    LocalDate startDate;
    LocalDate endDate;
    ProjectStatus projectStatus;
    List<OrderedTextRequest> responsibles;
    List<OrderedTextRequest> partners;
    List<OrderedTextRequest> results;
    List<UUID> linkedEventIds;
    boolean publishNow;
    boolean featured;
}
```

---

# 14.2. Actualizar proyecto

```java
UpdateProjectRequest {
    String title;
    String summary;
    String category;
    String problem;
    String objective;
    String beneficiaries;
    LocalDate startDate;
    LocalDate endDate;
    ProjectStatus projectStatus;
    ContentStatus contentStatus;
    List<OrderedTextRequest> responsibles;
    List<OrderedTextRequest> partners;
    List<OrderedTextRequest> results;
    List<UUID> linkedEventIds;
    boolean featured;
    int displayOrder;
    long version;
}
```

---

# 14.3. Respuesta administrativa

```java
ProjectAdminResponse {
    UUID id;
    String slug;
    String title;
    String summary;
    String category;
    MediaAssetResponse coverImage;
    String coverAltText;
    String problem;
    String objective;
    String beneficiaries;
    LocalDate startDate;
    LocalDate endDate;
    ProjectStatus projectStatus;
    ContentStatus contentStatus;
    List<OrderedTextResponse> responsibles;
    List<OrderedTextResponse> partners;
    List<OrderedTextResponse> results;
    List<EventReferenceResponse> linkedEvents;
    List<MediaAssetResponse> gallery;
    boolean featured;
    int displayOrder;
    Instant publishedAt;
    Instant createdAt;
    Instant updatedAt;
    long version;
}
```

---

# 14.4. Respuesta pública

Debe coincidir exactamente con lo consumido por la tarjeta:

```typescript
interface ProjectPublicResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category?: string;
  coverImageUrl: string;
  coverAltText: string;

  problem: string;
  objective: string;
  beneficiaries: string;

  startDate: string;
  endDate?: string;
  projectStatus: "UPCOMING" | "ACTIVE" | "PAUSED" | "FINISHED";

  responsibles: string[];
  partners: string[];
  results: string[];
  linkedEvents: ProjectEventReference[];

  featured: boolean;
  displayOrder: number;
}
```

No exponer públicamente:

```text
version
contentStatus
createdAt
campos internos de Storage
```

---

# 15. Endpoints definitivos

## Públicos

```http
GET /api/proyectos
GET /api/proyectos/{slug}
GET /api/proyectos/{slug}/eventos
```

Solo devolver:

```text
contentStatus = PUBLISHED
```

---

## Administrativos

```http
GET    /api/admin/proyectos
POST   /api/admin/proyectos
GET    /api/admin/proyectos/{id}
PUT    /api/admin/proyectos/{id}
PATCH  /api/admin/proyectos/{id}/estado-editorial
PATCH  /api/admin/proyectos/{id}/estado-operativo
PATCH  /api/admin/proyectos/{id}/destacado
PATCH  /api/admin/proyectos/orden
DELETE /api/admin/proyectos/{id}
POST   /api/admin/proyectos/{id}/restaurar
DELETE /api/admin/proyectos/{id}/permanente
```

Imagen:

```http
POST   /api/admin/proyectos/{id}/portada
PUT    /api/admin/proyectos/{id}/portada
DELETE /api/admin/proyectos/{id}/portada
```

Galería:

```http
POST   /api/admin/proyectos/{id}/galeria
PATCH  /api/admin/proyectos/{id}/galeria/orden
DELETE /api/admin/proyectos/{id}/galeria/{mediaId}
```

---

# 16. Validaciones de publicación

Un proyecto no puede pasar a `PUBLISHED` si falta:

```text
Portada
Título
Resumen
Problema
Objetivo
Beneficiarios
Fecha de inicio
Estado operativo
Responsable
```

Respuesta:

```http
400 PROJECT_INCOMPLETE
```

Con errores por campo:

```json
{
  "code": "PROJECT_INCOMPLETE",
  "message": "El proyecto no tiene todos los datos necesarios para publicarse.",
  "fieldErrors": [
    {
      "field": "coverImage",
      "message": "La portada es obligatoria."
    }
  ]
}
```

---

# 17. Frontend administrativo

Crear:

```text
src/components/admin/projects/
├── project-form.tsx
├── project-form-general.tsx
├── project-form-purpose.tsx
├── project-form-period.tsx
├── project-responsibles-editor.tsx
├── project-partners-editor.tsx
├── project-results-editor.tsx
├── project-events-picker.tsx
├── project-cover-picker.tsx
├── project-gallery-editor.tsx
├── project-preview.tsx
├── project-list.tsx
├── project-row.tsx
├── project-status-badge.tsx
└── project-delete-dialog.tsx
```

Servicios:

```text
src/services/admin/project-admin-service.ts
```

Validación:

```text
src/validations/project.ts
```

Tipos:

```text
src/types/project.ts
src/types/admin/project-admin.ts
```

---

# 18. Frontend público

Crear o normalizar:

```text
src/components/projects/project-card.tsx
src/components/projects/project-detail.tsx
src/components/projects/project-events-list.tsx
```

Reglas:

- Usar un único componente para tarjeta pública y preview.
- No mostrar bloques vacíos.
- Si no hay aliados, ocultar Aliados.
- Si no hay eventos, ocultar Eventos vinculados.
- Si no hay resultados, ocultar Resultados.
- Mostrar el periodo con formato humano.
- Mostrar estado operativo con etiqueta.
- Mantener responsive.

Ejemplo:

```text
10 de junio de 2026 – 15 de diciembre de 2026
```

No mostrar directamente:

```text
2026-06-10 - 2026-12-15
```

---

# 19. Flujo completo de creación

```text
1. Administrador pulsa Nuevo proyecto.
2. Completa campos principales.
3. Selecciona portada local.
4. Agrega responsables y aliados.
5. Selecciona eventos existentes.
6. Guarda como borrador.
7. Backend crea el proyecto.
8. Backend asigna slug y orden.
9. Se sube la portada a Storage.
10. Se guarda media_asset.
11. Se vinculan eventos.
12. Administrador revisa preview.
13. Pulsa Publicar.
14. Backend valida integridad.
15. Se guarda auditoría.
16. Se invalida caché.
17. Next.js revalida `projects` y `home`.
18. El proyecto aparece en el landing.
```

---

# 20. Edición

El administrador debe poder modificar posteriormente:

```text
Portada
Nombre
Resumen
Problema
Objetivo
Beneficiarios
Periodo
Estado operativo
Responsables
Aliados
Eventos
Resultados
Galería
Destacado
Orden
Estado editorial
```

No limitar la edición a:

```text
Título
Resumen
Estado
Orden
```

---

# 21. Archivo y eliminación

## Archivar

```text
DELETE /api/admin/proyectos/{id}
→ contentStatus = ARCHIVED
```

El proyecto desaparece de la web, pero conserva relaciones.

## Restaurar

```text
POST /api/admin/proyectos/{id}/restaurar
```

## Eliminar definitivamente

Solo desde Papelera y con confirmación.

Antes de borrar:

1. Desvincular eventos.
2. Verificar otras referencias.
3. Eliminar galería.
4. Eliminar portada.
5. Eliminar filas relacionadas.
6. Eliminar proyecto.
7. Registrar auditoría.

---

# 22. Caché e invalidación

Después de crear, actualizar, publicar, archivar o eliminar:

```text
Invalidar Caffeine: projects
Invalidar Caffeine: public-home
Registrar evento distribuido
Revalidar tag Next.js: projects
Revalidar tag Next.js: home
```

La revalidación externa debe ejecutarse después del commit.

---

# 23. Auditoría

Registrar:

```text
PROJECT_CREATED
PROJECT_UPDATED
PROJECT_PUBLISHED
PROJECT_UNPUBLISHED
PROJECT_STATUS_CHANGED
PROJECT_FEATURED_CHANGED
PROJECT_EVENTS_CHANGED
PROJECT_COVER_CHANGED
PROJECT_ARCHIVED
PROJECT_RESTORED
PROJECT_PERMANENTLY_DELETED
```

---

# 24. Limpieza de residuos

Después de validar el módulo específico:

## Frontend

Eliminar:

```text
Formulario genérico inline de Proyectos
Campos slug manual
Campos category aislados sin uso
AdminContentCrud aplicado a Proyectos
Servicios genéricos usados por Proyectos
Tipos genéricos usados por Proyectos
```

## Backend

Eliminar o dejar de usar para Proyectos:

```text
AdminContentRequest
AdminContentUpdateRequest
AdminContentRowResponse
Controlador genérico de content para projects
Mapper basado en Map<String,Object>
```

## Base de datos

Retirar columnas obsoletas únicamente mediante nueva migración y después de verificar que no tienen consumidores.

---

# 25. Pruebas obligatorias

## Backend

```text
Crear borrador completo
Crear con campos mínimos
Intentar publicar incompleto
Publicar completo
Editar todos los campos
Conflicto de versión
Agregar y quitar responsables
Agregar y quitar aliados
Vincular y desvincular eventos
Cambiar estado operativo
Reemplazar portada
Fallo de Storage
Fallo de DB después de subir
Archivar
Restaurar
Eliminar definitivamente
API pública solo devuelve publicados
```

## Frontend

```text
Formulario
Validación
Preview
Carga de portada
Listas dinámicas
Selector de eventos
Estados
Errores
Edición
Responsive
```

## E2E

```text
Login
Crear proyecto
Subir portada
Agregar responsable
Vincular eventos
Guardar borrador
Publicar
Ver en /proyectos
Editar objetivo
Recargar y confirmar cambio
Archivar
Confirmar que desaparece
Restaurar
```

---

# 26. Criterios de aceptación

El módulo estará completo cuando:

- El administrador pueda recrear toda la tarjeta pública.
- El formulario coincida con todos los datos visibles.
- No exista slug manual.
- La portada se cargue desde un archivo local.
- La imagen quede almacenada permanentemente.
- Responsables, aliados y resultados sean listas editables.
- Los eventos puedan vincularse y desvincularse.
- La vista previa use el mismo componente público.
- Se puedan editar todos los campos.
- Se pueda publicar, ocultar, archivar y restaurar.
- Los bloques vacíos no aparezcan públicamente.
- PostgreSQL sea la única fuente de verdad.
- No quede CRUD genérico aplicado a Proyectos.
- La caché se invalide después de cada cambio.
- Las pruebas backend, frontend y E2E pasen.

---

# 27. Orden preciso de implementación

```text
1. Auditar tabla projects y sus relaciones.
2. Auditar componentes públicos actuales.
3. Auditar endpoints administrativos actuales.
4. Crear migración Flyway.
5. Crear DTO específicos.
6. Crear repositorios y consultas.
7. Crear servicio transaccional.
8. Crear endpoints administrativos.
9. Implementar portada con Storage.
10. Implementar responsables.
11. Implementar aliados.
12. Implementar resultados.
13. Implementar selector de eventos.
14. Crear formulario administrativo.
15. Crear preview compartido.
16. Actualizar API pública.
17. Actualizar tarjeta pública.
18. Migrar Ruta Fuerza UPT.
19. Validar landing.
20. Eliminar CRUD genérico.
21. Eliminar residuos.
22. Ejecutar pruebas.
23. Ejecutar build.
24. Entregar reporte.
```

---

# 28. Prompt para Codex

```text
Normaliza e implementa completamente el módulo Proyectos siguiendo
PLAN_NORMALIZACION_MODULO_PROYECTOS_FUERZA_UPT.md.

Objetivo:
El administrador debe poder crear y editar toda la información que aparece
en la tarjeta pública de /proyectos.

La tarjeta pública actual contiene:
- portada;
- estado operativo;
- nombre;
- resumen;
- problema;
- objetivo;
- periodo;
- responsables;
- aliados;
- beneficiarios;
- eventos vinculados;
- resultados.

Cambios obligatorios:
- Eliminar el pequeño formulario inline actual.
- Crear una página o modal completo para Nuevo proyecto.
- Crear formulario específico, no genérico.
- No solicitar slug manual.
- Subir portada desde archivo local mediante Spring Boot y Supabase Storage.
- Guardar la referencia en media_assets.
- Crear listas dinámicas de responsables, aliados y resultados.
- Crear selector de eventos existentes.
- Separar estado editorial y estado operativo.
- Crear preview usando el mismo ProjectCard del landing.
- Permitir editar todos los campos después de crear.
- Permitir publicar, ocultar, archivar, restaurar y eliminar definitivamente.
- Ocultar bloques vacíos en la página pública.
- Crear DTO, servicios y endpoints específicos.
- No usar AdminContentRequest genérico para Proyectos.
- Crear migraciones Flyway nuevas; no modificar migraciones aplicadas.
- Mantener los datos actuales de Ruta Fuerza UPT.
- Invalidar caché de projects y home después de cada cambio.
- Crear auditoría.
- Eliminar residuos solo después de validar la migración.
- Ejecutar Maven verify, ESLint, TypeScript, Next build y pruebas E2E.

Antes de modificar:
1. Identifica todos los componentes, servicios, endpoints, tablas y migraciones de Proyectos.
2. Crea una matriz de campos públicos versus campos administrativos.
3. Presenta la migración propuesta.
4. No elimines información existente.

Después:
1. Verifica que Ruta Fuerza UPT conserve portada, problema, objetivo, periodo,
   responsables, aliados, beneficiarios, eventos y resultados.
2. Crea un proyecto de prueba como borrador.
3. Publica y verifica en /proyectos.
4. Edita un campo y confirma persistencia después de recargar.
5. Entrega una lista de archivos creados, modificados y eliminados.
6. Entrega la tabla final de endpoints.
7. Reporta todas las pruebas ejecutadas.
```
