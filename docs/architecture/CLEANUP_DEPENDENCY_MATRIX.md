# Matriz de Dependencias y Limpieza - Panel Fuerza UPT

## Rutas Frontend (src/app/administracion)
| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `/administracion/inicio` | Ruta | Sidebar | KEEP | Pendiente |
| `/administracion/representacion` | Ruta | Sidebar | MOVE (a `/administracion/representacion-estudiantil`) | Pendiente |
| `/administracion/proyectos` | Ruta | Sidebar | KEEP | Pendiente |
| `/administracion/eventos` | Ruta | Sidebar | KEEP | Pendiente |
| `/administracion/oportunidades` | Ruta | Sidebar | MOVE (a `/administracion/becas-y-oportunidades`) | Pendiente |
| `/administracion/equipo` | Ruta | Sidebar | KEEP | Pendiente |
| `/administracion/unete` | Ruta | Sidebar | KEEP (Crear si no existe) | Pendiente |
| `/administracion/contacto` | Ruta | Sidebar | KEEP (Crear si no existe) | Pendiente |
| `/administracion/configuracion` | Ruta | Sidebar | KEEP | Pendiente |
| `/administracion/estadisticas` | Ruta | Sidebar | MERGE (dentro de `/administracion/inicio`) | Pendiente |
| `/administracion/formularios` | Ruta | Sidebar | DELETE (Dividir a módulos correspondientes) | Pendiente |
| `/administracion/archivos` | Ruta | Sidebar | DELETE (Usar MediaPicker en formularios) | Pendiente |
| `/administracion/noticias` | Ruta | Sidebar | DELETE | Pendiente |
| `/administracion/encuestas` | Ruta | Sidebar | DEPRECATE (Deshabilitar con feature flag) | Pendiente |
| `/administracion/contenidos` | Ruta | Sidebar | DELETE (No oficial) | Pendiente |

## Servicios Frontend (src/services/admin)
| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `dashboard-service.ts` | Servicio | Dashboard | KEEP (como `dashboard-admin-service.ts`) | Pendiente |
| `team-admin-service.ts` | Servicio | Equipo | KEEP | Pendiente |
| `media-admin-service.ts` | Servicio | Formularios | KEEP | Pendiente |
| `settings-admin-service.ts` | Servicio | Configuración | KEEP | Pendiente |
| `content-admin-service.ts` | Servicio | Varios (CRUD genérico) | DEPRECATE / DELETE | Pendiente |
| `submission-admin-service.ts` | Servicio | Formularios | DEPRECATE (Reemplazar por módulos) | Pendiente |
| `poll-admin-service.ts` | Servicio | Encuestas | DEPRECATE | Pendiente |
| `news-admin-service.ts` | Servicio | Noticias | DELETE | Pendiente |
| `statistic-admin-service.ts` | Servicio | Estadísticas | MERGE (dentro de `home-admin-service`) | Pendiente |
| `admin-service.ts` | Servicio | Varios | DELETE | Pendiente |

## Endpoints Backend (/api/admin)
| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `/api/admin/content/**` | Endpoint | `content-admin-service` | DEPRECATE (Migrar a endpoints específicos) | Pendiente |
| `/api/admin/inbox/**` | Endpoint | Formularios | DEPRECATE (Mover a `contacto` / `unete`) | Pendiente |
| `/api/admin/status` | Endpoint | Sidebar / App | DEPRECATE | Pendiente |
| `/api/admin/noticias/**` | Endpoint | `news-admin-service` | DEPRECATE | Pendiente |
| `/api/admin/estadisticas/**` | Endpoint | `statistic-admin-service` | DEPRECATE (Integrar a `/api/admin/inicio/estadisticas`) | Pendiente |
| `/api/admin/formularios/**` | Endpoint | `submission-admin-service` | DEPRECATE | Pendiente |

## Componentes Compartidos (CRUD Genérico)
| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `AdminContentCrud` | Componente | Varios | DELETE (Reemplazar por componentes específicos) | Pendiente |
| `AdminContentRequest` | DTO genérico | Backend | DELETE | Pendiente |

## Tablas Base de Datos
| Elemento | Tipo | Consumidores | Acción | Estado |
|---|---|---|---|---|
| `news_items` | Tabla | Inicio / Noticias | CONFIRM (Eliminar solo tras revisión) | Pendiente |
| `polls`, `poll_*` | Tabla | Encuestas | CONFIRM (Conservar pero inhabilitar visualmente) | Pendiente |
