# PLAN DE LIMPIEZA Y ALINEACIÓN DEL PANEL ADMINISTRATIVO — FUERZA UPT

**Objetivo:** hacer que el panel administrativo coincida con la estructura real del sitio público, eliminar opciones redundantes, retirar rutas y código antiguo, y evitar que existan módulos sin una función visible en el landing.

**Menú público oficial:**

```text
Inicio
Representación estudiantil
Proyectos
Eventos
Becas y oportunidades
Equipo
Únete
Contacto
```

**Principio obligatorio:**

> Cada opción administrativa debe controlar una sección real del sitio público o cumplir una función interna claramente necesaria. No deben existir opciones “por si acaso”, módulos duplicados ni CRUD genéricos desconectados del landing.

---

# 1. Problema actual

El panel administrativo contiene más opciones que el sitio público:

```text
Resumen
Representación
Proyectos
Eventos
Oportunidades
Noticias
Equipo
Estadísticas
Encuestas
Formularios
Archivos
Configuración
```

Esto genera varios problemas:

- El administrador no sabe qué sección pública modifica cada opción.
- Existen módulos que no aparecen en el menú público.
- Algunas funciones se encuentran separadas aunque pertenecen a una misma sección.
- Hay rutas administrativas duplicadas.
- Existen CRUD genéricos y servicios antiguos.
- Algunos campos no se reflejan en el landing.
- Se mantiene código preparado para funciones que todavía no se usan.
- Puede terminar existiendo más de una fuente o flujo para el mismo contenido.

---

# 2. Estructura administrativa definitiva

El menú lateral del panel debe quedar así:

```text
Resumen
Inicio
Representación estudiantil
Proyectos
Eventos
Becas y oportunidades
Equipo
Únete
Contacto
```

En la parte inferior, fuera del bloque principal:

```text
Configuración
Cerrar sesión
```

No deben aparecer como opciones principales:

```text
Noticias
Estadísticas
Encuestas
Formularios
Archivos
```

Estas funciones se eliminarán, moverán o integrarán según lo definido en este plan.

---

# 3. Correspondencia exacta entre sitio público y panel

| Sitio público | Panel administrativo | Función |
|---|---|---|
| Inicio | Inicio | Hero, textos principales, estadísticas verificadas, destacados y bloques visibles |
| Representación estudiantil | Representación estudiantil | Gestiones, propuestas, logros y seguimientos |
| Proyectos | Proyectos | Programas e iniciativas |
| Eventos | Eventos | Actividades con fecha, modalidad e inscripción |
| Becas y oportunidades | Becas y oportunidades | Becas, convocatorias, intercambios y programas |
| Equipo | Equipo | Integrantes visibles |
| Únete | Únete | Configuración del formulario y revisión de postulaciones |
| Contacto | Contacto | Datos institucionales y mensajes recibidos |

`Resumen` no corresponde a una página pública. Es únicamente el dashboard administrativo.

---

# 4. Tratamiento de las opciones sobrantes

# 4.1. Noticias

## Decisión

Retirar del menú y del sistema público actual.

No existe una opción “Noticias” en el menú público oficial.

## Acciones

1. Revisar si alguna sección del Inicio consume noticias.
2. Si no se muestran públicamente:
   - archivar los registros;
   - retirar la ruta administrativa;
   - retirar el enlace del sidebar;
   - retirar servicios y componentes;
   - retirar endpoints;
   - eliminar tablas solo mediante una migración posterior.
3. Si Inicio muestra novedades:
   - renombrar el bloque como `Novedades`;
   - administrarlo dentro de `Inicio`;
   - no conservar un módulo principal independiente.

## Resultado

```text
Noticias independientes: eliminadas
Novedades del Inicio: opcionales y administradas desde Inicio
```

---

# 4.2. Estadísticas

## Decisión

Mover a:

```text
Administración → Inicio → Estadísticas
```

No debe existir una opción independiente en el sidebar.

## Razón

Las estadísticas se muestran como parte del landing y no constituyen una página pública separada.

## Acciones

1. Mantener la tabla y lógica necesaria.
2. Retirar `/administracion/estadisticas` del menú.
3. Integrar un bloque editable dentro de `/administracion/inicio`.
4. Mostrar únicamente estadísticas verificadas.
5. Conservar:
   ```text
   valor
   etiqueta
   fuente
   verificado
   orden
   visible
   ```
6. Retirar estadísticas de ejemplo y no verificadas.

---

# 4.3. Encuestas

## Decisión

No mostrar en el panel principal mientras no exista una encuesta visible en el sitio.

## Opciones permitidas

### Opción A — No usar encuestas todavía

- Deshabilitar la función mediante feature flag.
- Retirar la ruta del sidebar.
- Conservar temporalmente el backend si ya está implementado y probado.
- No cargar sus servicios ni componentes en producción.
- Eliminarlo definitivamente en una fase posterior si se decide no usarlo.

### Opción B — Usar encuestas en el Inicio

Mover a:

```text
Administración → Inicio → Encuesta activa
```

Solo permitir:

```text
Crear encuesta
Publicar encuesta
Cerrar encuesta
Ver resultados
```

No debe aparecer como una página principal si el visitante solo la verá como un bloque del landing.

## Recomendación actual

Usar la Opción A hasta definir una encuesta real.

---

# 4.4. Formularios

## Decisión

Dividir el módulo y mover cada bandeja al lugar correspondiente.

### Postulaciones

Mover a:

```text
Administración → Únete → Postulaciones recibidas
```

### Mensajes

Mover a:

```text
Administración → Contacto → Mensajes recibidos
```

### Propuestas estudiantiles

Mover a:

```text
Administración → Representación estudiantil → Propuestas recibidas
```

### Inscripciones a eventos

Mover a:

```text
Administración → Eventos → Inscripciones
```

### Suscripciones

Si se mantiene el newsletter:

```text
Administración → Inicio → Suscripciones
```

Si no se mantiene:

- eliminar el formulario público;
- retirar la tabla y endpoints en la fase de limpieza.

## Resultado

No debe existir un menú genérico llamado `Formularios`.

---

# 4.5. Archivos

## Decisión

Retirar del menú principal.

El gestor de archivos debe funcionar como una herramienta interna dentro de cada formulario:

```text
Subir imagen
Seleccionar imagen existente
Reemplazar
Eliminar
```

## Acciones

1. Mantener:
   - `media_assets`;
   - servicio de Supabase Storage;
   - endpoints internos de carga;
   - selector reutilizable.
2. Retirar:
   - opción `Archivos` del sidebar;
   - página pública o administrativa aislada, salvo que realmente se necesite una biblioteca multimedia.
3. Usar `MediaPicker` dentro de:
   - Inicio;
   - Representación;
   - Proyectos;
   - Eventos;
   - Oportunidades;
   - Equipo.

---

# 4.6. Configuración

## Decisión

Mantener, pero separada al final del sidebar.

Debe contener únicamente configuraciones globales:

```text
Logo
Correo institucional
WhatsApp
Facebook
Instagram
TikTok
YouTube
Dirección
Nombre del sitio
SEO básico
```

No debe contener contenidos de módulos.

---

# 5. Diseño final del sidebar

```text
Fuerza UPT
ADMIN

CONTENIDO
- Resumen
- Inicio
- Representación estudiantil
- Proyectos
- Eventos
- Becas y oportunidades
- Equipo
- Únete
- Contacto

SISTEMA
- Configuración
- Cerrar sesión
```

No usar nombres diferentes entre panel, frontend y backend.

Ejemplos incorrectos:

```text
Representación
Oportunidades
Formularios
Content
Inbox
```

Ejemplos correctos:

```text
Representación estudiantil
Becas y oportunidades
Únete
Contacto
```

---

# 6. Rutas administrativas oficiales

Mantener únicamente:

```text
/administracion
/administracion/inicio
/administracion/representacion-estudiantil
/administracion/proyectos
/administracion/eventos
/administracion/becas-y-oportunidades
/administracion/equipo
/administracion/unete
/administracion/contacto
/administracion/configuracion
```

## Rutas que deben redirigirse temporalmente

```text
/administracion/representacion
→ /administracion/representacion-estudiantil

/administracion/oportunidades
→ /administracion/becas-y-oportunidades

/administracion/estadisticas
→ /administracion/inicio#estadisticas

/administracion/formularios
→ /administracion

/administracion/archivos
→ /administracion
```

## Rutas candidatas a eliminar

```text
/administracion/noticias
/administracion/encuestas
```

Solo eliminar después de verificar que no tienen referencias activas.

---

# 7. Endpoints administrativos oficiales

## Dashboard

```http
GET /api/admin/dashboard
```

## Inicio

```http
GET /api/admin/inicio
PUT /api/admin/inicio
GET /api/admin/inicio/estadisticas
PUT /api/admin/inicio/estadisticas
```

## Representación estudiantil

```http
GET    /api/admin/representacion-estudiantil
POST   /api/admin/representacion-estudiantil
GET    /api/admin/representacion-estudiantil/{id}
PUT    /api/admin/representacion-estudiantil/{id}
PATCH  /api/admin/representacion-estudiantil/{id}/estado
DELETE /api/admin/representacion-estudiantil/{id}

GET   /api/admin/representacion-estudiantil/propuestas
PATCH /api/admin/representacion-estudiantil/propuestas/{id}/estado
```

## Proyectos

```http
GET    /api/admin/proyectos
POST   /api/admin/proyectos
GET    /api/admin/proyectos/{id}
PUT    /api/admin/proyectos/{id}
PATCH  /api/admin/proyectos/{id}/estado
DELETE /api/admin/proyectos/{id}
```

## Eventos

```http
GET    /api/admin/eventos
POST   /api/admin/eventos
GET    /api/admin/eventos/{id}
PUT    /api/admin/eventos/{id}
PATCH  /api/admin/eventos/{id}/estado
DELETE /api/admin/eventos/{id}

GET /api/admin/eventos/{id}/inscripciones
```

## Becas y oportunidades

```http
GET    /api/admin/becas-y-oportunidades
POST   /api/admin/becas-y-oportunidades
GET    /api/admin/becas-y-oportunidades/{id}
PUT    /api/admin/becas-y-oportunidades/{id}
PATCH  /api/admin/becas-y-oportunidades/{id}/estado
DELETE /api/admin/becas-y-oportunidades/{id}
```

## Equipo

```http
GET    /api/admin/equipo
POST   /api/admin/equipo
GET    /api/admin/equipo/{id}
PUT    /api/admin/equipo/{id}
PATCH  /api/admin/equipo/{id}/estado
PATCH  /api/admin/equipo/orden
DELETE /api/admin/equipo/{id}
```

## Únete

```http
GET   /api/admin/unete/configuracion
PUT   /api/admin/unete/configuracion
GET   /api/admin/unete/postulaciones
GET   /api/admin/unete/postulaciones/{id}
PATCH /api/admin/unete/postulaciones/{id}/estado
```

## Contacto

```http
GET   /api/admin/contacto/configuracion
PUT   /api/admin/contacto/configuracion
GET   /api/admin/contacto/mensajes
GET   /api/admin/contacto/mensajes/{id}
PATCH /api/admin/contacto/mensajes/{id}/estado
```

## Configuración

```http
GET /api/admin/configuracion
PUT /api/admin/configuracion
```

---

# 8. Endpoints que deben retirarse

Candidatos detectados en auditorías anteriores:

```text
/api/admin/content/**
/api/admin/inbox/**
/api/admin/status
/api/admin/noticias/**
/api/admin/estadisticas/**
/api/admin/formularios/**
```

## Procedimiento obligatorio

No eliminarlos de inmediato.

1. Buscar todos los consumidores.
2. Migrar el frontend al endpoint oficial.
3. Marcar el endpoint antiguo como `@Deprecated`.
4. Registrar en logs si todavía recibe solicitudes.
5. Probar durante una versión.
6. Eliminar controlador, servicio y DTO.
7. Ejecutar pruebas.
8. Retirar tablas únicamente si dejan de utilizarse.

---

# 9. Limpieza del frontend

# 9.1. Navegación

Crear una única fuente:

```text
src/config/admin-navigation.ts
```

Debe contener solamente las nueve opciones oficiales.

No duplicar listas del sidebar en diferentes componentes.

---

# 9.2. Servicios

Mantener:

```text
dashboard-admin-service.ts
home-admin-service.ts
representation-admin-service.ts
project-admin-service.ts
event-admin-service.ts
opportunity-admin-service.ts
team-admin-service.ts
join-admin-service.ts
contact-admin-service.ts
settings-admin-service.ts
media-admin-service.ts
```

Eliminar después de migrar:

```text
admin-service.ts
content-admin-service.ts
news-admin-service.ts
statistic-admin-service.ts
poll-admin-service.ts
submission-admin-service.ts
```

Excepción:

- `statistic-admin-service` puede integrarse en `home-admin-service`.
- `media-admin-service` se conserva como servicio interno sin página propia.
- Los servicios de encuestas se conservan solo si se activa la función.

---

# 9.3. Componentes

Cada módulo debe tener componentes propios.

```text
components/admin/home
components/admin/representation
components/admin/projects
components/admin/events
components/admin/opportunities
components/admin/team
components/admin/join
components/admin/contact
components/admin/settings
components/admin/shared
```

Eliminar CRUD genérico cuando todos los módulos hayan migrado.

No mantener:

```text
AdminContentCrud genérico
formularios con title/summary para todos los módulos
campos que no coinciden con el landing
```

---

# 9.4. Tipos

Mantener tipos específicos:

```text
HomeSettings
RepresentationItem
Project
Event
Opportunity
TeamMember
JoinApplication
ContactMessage
SiteSettings
```

Eliminar tipos genéricos cuando ya no tengan consumidores:

```text
AdminContentRequest
AdminContentUpdateRequest
AdminContentRowResponse
GenericContent
```

---

# 10. Limpieza del backend

# 10.1. Paquetes definitivos

```text
dashboard
home
representation
project
event
opportunity
team
join
contact
settings
media
auth
security
common
```

## Paquetes candidatos a retirar

```text
content
news
statistic
poll
submission
inbox
```

No eliminarlos hasta completar la matriz de dependencias.

---

# 10.2. CRUD específico

Cada módulo debe tener:

```text
Controller
Service
Repository
Mapper
CreateRequest
UpdateRequest
AdminResponse
PublicResponse
```

No usar un controlador genérico que trate igual a Equipo, Eventos y Proyectos.

---

# 10.3. Repositorios

Retirar repositorios sin consumidores.

Para cada repositorio:

1. Buscar inyección.
2. Buscar llamadas.
3. Buscar consultas nativas.
4. Confirmar tabla asociada.
5. Retirar solo si no existe uso.

---

# 11. Limpieza de base de datos

## 11.1. Tablas que se mantienen

```text
users
roles
user_roles
spring_session
spring_session_attributes

representation_items
representation_actions
representation_evidence

projects
project_responsibles
project_partners
project_results
project_gallery

events
event_speakers
event_registrations

opportunities
opportunity_benefits
opportunity_requirements

team_members
team_social_links

statistics
media_assets

contact_messages
student_proposals
team_applications
newsletter_subscriptions

site_settings
audit_logs
cache_invalidation_events
request_rate_limits
login_attempts
```

## 11.2. Tablas condicionales

```text
news_items
polls
poll_questions
poll_options
poll_responses
poll_answers
```

Decisión:

- Si no se usan Noticias ni Encuestas: archivar datos y eliminarlas mediante Flyway.
- Si se usarán dentro de Inicio: conservar tablas, pero retirar rutas principales.

## 11.3. Migraciones

No modificar migraciones aplicadas.

Crear:

```text
VXX__align_admin_modules.sql
VXX__archive_unused_content.sql
VXX__drop_unused_tables.sql
VXX__remove_obsolete_columns.sql
```

Separar la eliminación de datos de la eliminación de tablas.

---

# 12. Matriz obligatoria antes de borrar

Crear un archivo:

```text
docs/CLEANUP_DEPENDENCY_MATRIX.md
```

Formato:

| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `/api/admin/content/**` | Endpoint | `admin-service.ts` | Migrar y eliminar | Pendiente |
| `AdminContentCrud` | Componente | Equipo, Eventos | Reemplazar | Pendiente |
| `news_items` | Tabla | Inicio | Confirmar | Pendiente |
| `/administracion/archivos` | Ruta | Sidebar | Retirar | Pendiente |

Acciones posibles:

```text
KEEP
MOVE
MERGE
DEPRECATE
DELETE
```

No borrar nada marcado como `CONFIRM`.

---

# 13. Orden seguro de ejecución

## Fase 1 — Congelar estructura

1. Crear rama de limpieza.
2. Respaldar base de datos.
3. Ejecutar pruebas.
4. Generar matriz de dependencias.
5. Definir feature flags.

## Fase 2 — Alinear navegación

1. Crear menú administrativo definitivo.
2. Crear rutas oficiales.
3. Agregar redirecciones.
4. Retirar opciones sobrantes del sidebar.
5. No borrar todavía componentes ni endpoints.

## Fase 3 — Migrar funciones

1. Estadísticas → Inicio.
2. Postulaciones → Únete.
3. Mensajes → Contacto.
4. Propuestas → Representación estudiantil.
5. Inscripciones → Eventos.
6. Archivos → selectores internos.
7. Encuestas → feature flag.
8. Noticias → Inicio o eliminación.

## Fase 4 — Migrar contratos

1. Cambiar servicios frontend.
2. Cambiar endpoints backend.
3. Crear DTO específicos.
4. Retirar CRUD genérico.
5. Ejecutar pruebas por módulo.

## Fase 5 — Deprecar

1. Marcar endpoints antiguos.
2. Registrar usos.
3. Mantener redirecciones.
4. Ejecutar E2E.

## Fase 6 — Eliminar código

1. Eliminar servicios antiguos.
2. Eliminar componentes muertos.
3. Eliminar tipos genéricos.
4. Eliminar controladores duplicados.
5. Eliminar rutas antiguas.
6. Ejecutar TypeScript y Maven.

## Fase 7 — Limpiar base de datos

1. Archivar contenido no usado.
2. Verificar respaldos.
3. Ejecutar migraciones de eliminación.
4. Verificar Flyway desde cero.
5. Ejecutar pruebas de integración.

---

# 14. Pruebas obligatorias

## Navegación

```text
Cada opción del panel abre su módulo correcto.
No existen enlaces a rutas eliminadas.
Las redirecciones antiguas funcionan durante la transición.
```

## Integración landing-panel

Para cada campo:

```text
Editar en panel
Guardar en PostgreSQL
Consultar API pública
Revalidar caché
Ver cambio en landing
Recargar
Confirmar persistencia
```

## Endpoints

```text
No hay dos endpoints para la misma acción.
Los endpoints retirados devuelven 404 después de la migración.
Swagger solo muestra contratos oficiales.
```

## Base de datos

```text
Flyway ejecuta desde cero.
No hay tablas huérfanas.
No hay columnas sin uso.
No se pierden datos válidos.
```

## Build

```powershell
cd frontend
npm ci
npm run lint
npx tsc --noEmit
npm run build

cd ../backend
.\mvnw.cmd clean verify
```

---

# 15. Criterios de aceptación

La limpieza estará completa cuando:

- El sidebar administrativo coincida con las ocho secciones públicas.
- Solo `Resumen` y `Configuración` sean opciones administrativas adicionales.
- No existan Noticias, Estadísticas, Encuestas, Formularios ni Archivos como opciones principales.
- Cada formulario modifique exactamente lo que muestra el landing.
- No exista CRUD genérico para todos los módulos.
- No existan servicios duplicados.
- No existan endpoints duplicados.
- No existan rutas administrativas sin enlace.
- No existan tablas sin consumidores.
- No existan mocks ni fallback de datos.
- PostgreSQL sea la única fuente de verdad.
- La caché se invalide después de cada publicación.
- El frontend y backend compilen sin errores.
- Las pruebas E2E confirmen cada flujo administrativo.

---

# 16. Prompt para Codex

```text
Ejecuta el plan PLAN_LIMPIEZA_ALINEACION_PANEL_FUERZA_UPT.md.

Objetivo:
Alinear el panel administrativo con el menú público oficial:

Inicio
Representación estudiantil
Proyectos
Eventos
Becas y oportunidades
Equipo
Únete
Contacto

El panel debe contener además:
Resumen
Configuración
Cerrar sesión

Reglas:
- No borrar código sin crear primero una matriz de dependencias.
- No modificar migraciones Flyway ya aplicadas.
- Crear redirecciones temporales para rutas antiguas.
- Mover Estadísticas dentro de Inicio.
- Mover Postulaciones dentro de Únete.
- Mover Mensajes dentro de Contacto.
- Mover Propuestas dentro de Representación estudiantil.
- Mover Inscripciones dentro de Eventos.
- Retirar Archivos del menú y usar MediaPicker dentro de formularios.
- Deshabilitar Encuestas mediante feature flag hasta que exista uso real.
- Eliminar Noticias o mover Novedades dentro de Inicio, según uso real.
- Eliminar CRUD y DTO genéricos cuando todos los módulos tengan formularios específicos.
- Declarar endpoints oficiales y retirar duplicados.
- PostgreSQL debe ser la única fuente de verdad.
- No conservar mocks ni fallback.
- Ejecutar ESLint, TypeScript, Next build y Maven verify.
- Crear pruebas E2E para comprobar panel → base de datos → API pública → landing.

Antes de modificar:
1. Audita rutas, componentes, servicios, endpoints, tablas y migraciones.
2. Crea docs/CLEANUP_DEPENDENCY_MATRIX.md.
3. Marca cada elemento como KEEP, MOVE, MERGE, DEPRECATE o DELETE.
4. Presenta el orden de cambios.
5. No elimines datos.

Después:
1. Entrega una tabla de archivos creados, modificados y eliminados.
2. Entrega una tabla de endpoints finales.
3. Entrega una tabla de tablas conservadas y eliminadas.
4. Reporta redirecciones temporales.
5. Reporta todas las pruebas ejecutadas.
```
