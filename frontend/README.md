# Fuerza UPT Web

Frontend responsive de Fuerza UPT construido con Next.js 16.2.10, React 19, TypeScript, Tailwind CSS v4, shadcn/ui y Radix.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run lint
npm run build
npm run dev
```

## Arquitectura de contenidos

Cada publicación tiene un único módulo principal y las relaciones se guardan mediante identificadores:

- `src/data/representation.ts`: gestiones, propuestas, acuerdos, logros y seguimientos.
- `src/data/projects.ts`: programas con duración y actividades relacionadas.
- `src/data/events.ts`: talleres, conversatorios, sesiones y encuentros con fecha.
- `src/data/opportunities.ts`: becas, intercambios y convocatorias.
- `src/data/news.ts`: noticias, resúmenes y agradecimientos.
- `src/data/team.ts`: integrantes confirmados.
- `src/data/statistics.ts`: cifras con estado de verificación.
- `src/data/categories.ts`: categorías que no representan contenidos concretos.

Los componentes visuales reciben datos por propiedades. Las páginas obtienen los registros mediante servicios en `src/services`, preparados para usar una API Spring Boot y mantener los datos locales como fallback.

## Endpoints previstos

```text
GET /api/representacion
GET /api/proyectos
GET /api/eventos
GET /api/oportunidades
GET /api/noticias
GET /api/equipo
```

Configurar el backend con:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Acceso administrativo

El frontend incluye las rutas `/administracion/login` y `/administracion`, separadas del layout público. La sesión se consulta mediante cookies y nunca se almacena un token en `localStorage` ni `sessionStorage`.

Contrato esperado de Spring Boot:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/refresh
```

`POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/refresh` deben devolver una sesión con esta forma:

```json
{
  "user": {
    "id": 1,
    "email": "administrador@fuerzaupt.pe",
    "displayName": "Administrador Fuerza UPT",
    "roles": ["ADMIN"]
  },
  "expiresAt": "2026-07-15T04:00:00Z"
}
```

La protección de rutas de Next usa `src/proxy.ts` y revalida `/auth/me` reenviando la cookie. Para que funcione entre Next y Spring Boot, la cookie debe ser `HttpOnly`, usar `Secure` en producción, tener un `SameSite` compatible y estar disponible para la ruta `/administracion` mediante `Path=/` o una arquitectura de mismo origen equivalente.

La protección de Next es solo una barrera optimista de interfaz. Spring Boot todavía debe implementar Spring Security, almacenar contraseñas con `PasswordEncoder`, restringir CORS al frontend autorizado, limitar intentos, crear el administrador inicial mediante un proceso controlado y exigir `ROLE_ADMIN` en cada endpoint `/api/admin/**`.

## Reglas de publicación

- Los registros sin confirmar usan `status: "DRAFT"`.
- Las estadísticas solo aparecen en Inicio cuando `isVerified` es `true`.
- El equipo público filtra `isComplete && isPublished`.
- Los eventos muestran `Inscribirme` únicamente con `registrationEnabled: true` y `registrationUrl`.
- Las oportunidades muestran `Postular` únicamente cuando existe `applicationUrl`.
- `/logros` redirige permanentemente a `/representacion-estudiantil#logros`.

## Estado actual

- Representación organizada en seguimiento, resultados e historial.
- Eventos migrados desde Representación.
- Ruta Fuerza UPT creada como proyecto y vinculada mediante IDs a sus eventos.
- Programa APEC 2026 registrado como oportunidad en borrador hasta confirmar su enlace oficial.
- Solo Yenny Luz Chambilla Vargas aparece como integrante pública confirmada.
- Inicio consume las mismas fuentes centrales que las páginas internas.

El detalle de la migración y los pendientes de confirmación está en `CONTENT_MIGRATION_REPORT.md`.
