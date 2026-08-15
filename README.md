# Fuerza UPT

Monolito modular para la plataforma Fuerza UPT. El frontend y el backend viven en el mismo contenedor de proyecto, pero mantienen dependencias y ciclos de construccion independientes.

## Arquitectura

- `frontend/`: Next.js 16, React 19, TypeScript e ISR por etiquetas.
- `backend/`: Spring Boot, Spring Security, Flyway, Caffeine y PostgreSQL/Supabase.
- `load-tests/`: escenarios k6 para las rutas publicas.
- `start-local.ps1`: inicia ambos servicios sin abrir ventanas adicionales.
- `pack-project.ps1`: crea un ZIP liviano y valida que no contenga secretos.

PostgreSQL es la unica fuente de verdad. El frontend no contiene fallbacks de contenido. Las lecturas publicas usan ISR en Next.js, cache Caffeine, ETag, Cache-Control y consultas SQL paginadas sin N+1.

## Configuracion local

1. Copiar `frontend/.env.example` a `frontend/.env.local`.
2. Copiar `backend/.env.example` a `backend/.env`.
3. Completar las variables privadas solamente en esos archivos locales.
4. Usar el mismo valor aleatorio para `REVALIDATION_SECRET` en frontend y backend.
5. Ejecutar `./start-local.ps1` desde PowerShell.

El frontend usa `http://localhost:3000`. El backend usa `SERVER_PORT`; si no se configura, usa `8080`. Las llamadas del navegador pasan por `/api` y Next.js las reenvia al valor privado `BACKEND_URL`.

## Contenido y cache

- `GET /api/public/home` agrega el contenido de Inicio en una sola llamada HTTP.
- Los catalogos publicos aceptan filtros, cursor y limite desde PostgreSQL.
- Las escrituras administrativas auditan el cambio, limpian Caffeine y notifican `/api/revalidate`.
- `cache_invalidation_events` distribuye la invalidacion entre varias instancias backend.
- Las sesiones administrativas se comparten mediante Spring Session JDBC.
- El panel administra representacion, proyectos, eventos, oportunidades, noticias, equipo y estadisticas con estados `DRAFT`, `PUBLISHED` y `ARCHIVED`.
- La configuracion institucional se obtiene de `site_settings`; el sitio no muestra enlaces sociales genericos.

## Encuestas y formularios

- `/administracion/encuestas` permite crear, editar, programar, abrir, cerrar, archivar y exportar encuestas.
- `/encuestas` publica solamente consultas activas y admite opcion unica, opcion multiple, escala 1-5 y texto corto con consentimiento.
- Los votos repetidos se limitan mediante cookie firmada, fingerprint acotado, HMAC de IP y rate limiting compartido.
- `/administracion/formularios` centraliza contactos, propuestas, postulaciones, suscripciones e inscripciones sin alterar la respuesta original.
- Las inscripciones internas bloquean la fila del evento, controlan vigencia/capacidad y rechazan duplicados.

## Seguridad

- `/api/admin/**` y `/actuator/prometheus` requieren una sesion con rol `ADMIN`.
- CSRF protege las operaciones de escritura y la cookie de sesion es `HttpOnly`.
- Login y formularios publicos usan limites compartidos en PostgreSQL.
- IP y user-agent sensibles se protegen con HMAC-SHA256 antes de persistirse.
- Solo se acepta `X-Forwarded-For` desde proxies configurados como confiables.
- Swagger esta desactivado por defecto y siempre desactivado en produccion.
- La clave `service_role` de Supabase solo pertenece al backend.

Las credenciales reales nunca deben entrar al repositorio, al frontend ni a un ZIP. Si una credencial fue compartida fuera del entorno privado, debe rotarse antes de desplegar.

## Validacion

```powershell
cd backend
.\mvnw.cmd clean verify

# Mantener el backend disponible para el prerender de contenido PostgreSQL.
cd ..\frontend
npm ci
npm run lint
npx tsc --noEmit
npm audit
npm run build
```

El build de Next.js necesita acceso al backend configurado porque prerenderiza el contenido real de PostgreSQL y, deliberadamente, no utiliza datos locales de respaldo.

La implementacion del Plan 2 y su matriz de validacion estan documentadas en `PLAN_2_RESULTADO_IMPLEMENTACION.md`.

Prueba de carga rapida, si k6 esta instalado:

```powershell
$env:SMOKE="true"
k6 run .\load-tests\public-read.js
```

La prueba completa debe ejecutarse contra un ambiente aislado y con limites de proveedor revisados. Los objetivos estan documentados en `load-tests/README.md`.

## Base de datos

Flyway crea y actualiza el esquema al iniciar el backend. Las migraciones de `backend/src/main/resources/db/migration` son la fuente de verdad del esquema y los datos iniciales. JPA solo valida el esquema con `ddl-auto=validate`.

## Observabilidad

- `/actuator/health/liveness`: estado del proceso.
- `/actuator/health/readiness`: disponibilidad para recibir trafico.
- `/actuator/prometheus`: metricas protegidas para recoleccion interna.
- `X-Request-ID`: correlacion de solicitudes en respuestas y logs.
- El perfil `production` emite logs estructurados y usa apagado graceful.

## Empaquetado

```powershell
.\pack-project.ps1
```

El resultado se crea como `D:\FuerzaUPT-seguro.zip`. Se excluyen dependencias, builds, logs, repositorios internos y archivos de entorno privados. El script inspecciona el ZIP y lo elimina si detecta alguno de esos elementos.

## Despliegue

El archivo `backend/Dockerfile` genera la imagen del API. En cada proveedor se deben definir las variables descritas en los archivos `.env.example`; no se deben publicar los archivos locales. Para habilitar carga de medios tambien se requiere `SUPABASE_SERVICE_ROLE_KEY` y los buckets configurados.
