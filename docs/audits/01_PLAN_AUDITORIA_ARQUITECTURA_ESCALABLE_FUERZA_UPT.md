# PLAN 1 DE 3 — AUDITORÍA Y ARQUITECTURA ESCALABLE DE FUERZA UPT

**Proyecto auditado:** `FuerzaUPT-liviano.zip`  
**Fecha de auditoría:** 14 de julio de 2026  
**Alcance:** frontend Next.js, backend Spring Boot, seguridad, Supabase/PostgreSQL, rendimiento y despliegue.

---

## 1. Objetivo

Convertir la solución actual en una plataforma **read-heavy** preparada para:

- Un solo administrador o un grupo muy pequeño de administradores.
- Gran cantidad de visitantes consultando información pública.
- Crecimiento progresivo de eventos, proyectos, oportunidades, noticias y representación.
- Despliegue horizontal sin saturar Supabase.
- Publicaciones administradas desde la interfaz y almacenadas únicamente en la base de datos.
- Futuras encuestas pequeñas sin afectar el núcleo de contenidos.

La solución debe continuar como **monolito modular**, no microservicios.

---

# 2. Resumen de la auditoría

## 2.1. Fortalezas actuales

1. **Separación clara entre frontend y backend**
   - `frontend/`: Next.js 16, React 19 y TypeScript.
   - `backend/`: Spring Boot, Security, Flyway y PostgreSQL.

2. **Autenticación administrativa razonablemente bien planteada**
   - Cookie de sesión `HttpOnly`.
   - Spring Session JDBC.
   - CSRF.
   - CORS con origen específico.
   - Contraseñas con BCrypt.
   - `/api/admin/**` restringido a `ROLE_ADMIN`.
   - No se usa JWT en `localStorage`.

3. **Base de datos versionada**
   - Flyway administra las migraciones.
   - JPA usa `ddl-auto=validate`.
   - Se utilizan UUID, auditoría temporal y `@Version`.

4. **Separación conceptual de contenidos**
   - Representación.
   - Proyectos.
   - Eventos.
   - Oportunidades.
   - Noticias.
   - Equipo.
   - Estadísticas.

5. **Frontend tipado**
   - Los contratos TypeScript están separados por dominio.
   - La navegación pública y administrativa están separadas.
   - Las páginas públicas ya consumen servicios.

6. **Borradores y publicación**
   - Existe `DRAFT`, `PUBLISHED` y `ARCHIVED`.
   - Los borradores no se entregan desde los endpoints públicos del backend.

7. **Supabase preparado**
   - PostgreSQL ya está configurado.
   - Existen variables para Supabase Storage.
   - El backend puede utilizar pool de conexiones.

---

## 2.2. Debilidades críticas

### CRÍTICO 1 — Secretos incluidos en el archivo entregado

El ZIP contiene:

```text
backend/.env
frontend/.env.local
```

El archivo del backend puede contener:

- Contraseña de PostgreSQL.
- Clave `service_role` de Supabase.
- Contraseña del administrador.
- URL privada de conexión.

### Acción inmediata

1. Rotar:
   - Contraseña de la base de datos.
   - `SUPABASE_SERVICE_ROLE_KEY`.
   - Contraseña administrativa.
2. Eliminar `.env` y `.env.local` de cualquier ZIP futuro.
3. Crear un script de empaquetado que excluya secretos.
4. Verificar que nunca hayan sido incluidos en un repositorio remoto.

No continuar con un despliegue público usando las credenciales entregadas en este ZIP.

---

### CRÍTICO 2 — El panel administrativo todavía no administra contenidos

Actualmente solo existe:

```text
GET /api/admin/status
```

No existen CRUD administrativos para:

- Representación.
- Proyectos.
- Eventos.
- Oportunidades.
- Noticias.
- Equipo.
- Estadísticas.
- Archivos.
- Formularios recibidos.

La página `/administracion` cuenta registros desde `src/data`, no desde PostgreSQL.

---

### CRÍTICO 3 — El frontend todavía puede usar datos locales

Los servicios importan:

```text
src/data/events.ts
src/data/projects.ts
src/data/opportunities.ts
src/data/representation.ts
src/data/news.ts
src/data/team.ts
```

y los entregan como `fallback`.

Aunque la variable local está actualmente en `false`, esta arquitectura:

- Mantiene dos fuentes de verdad.
- Puede ocultar una caída del backend.
- Permite que Inicio y Administración muestren información distinta de la base de datos.
- Complica la eliminación de mocks.

La fuente única debe ser PostgreSQL.

---

### CRÍTICO 4 — API pública con N+1 y carga completa de tablas

`PublicContentService`:

- Consulta todos los registros publicados.
- Ejecuta varias consultas adicionales por cada fila.
- Devuelve `Map<String, Object>`.
- Aplica filtros y límites en memoria.

Ejemplos:

```text
Representación: consulta principal + 2 consultas por registro.
Proyectos: consulta principal + 4 consultas por registro.
Eventos: consulta principal + 1 consulta por registro.
Oportunidades: consulta principal + 2 consultas por registro.
Equipo: consulta principal + 1 consulta por registro.
```

Con tráfico alto esto puede generar muchas consultas por solicitud.

---

### CRÍTICO 5 — No existe estrategia de caché

El flujo actual puede terminar siendo:

```text
Cada visitante
→ Next.js
→ Spring Boot
→ varias consultas a PostgreSQL
```

Como casi todas las escrituras provienen del administrador, el contenido público es ideal para caché e invalidación explícita.

---

## 2.3. Debilidades altas

1. **Solo existe una prueba backend**
   - `LoginAttemptServiceTest`.
   - No existen pruebas frontend propias.
   - No hay pruebas de integración de API ni base de datos.

2. **Rate limiting de login no escalable**
   - Usa `ConcurrentHashMap`.
   - Se pierde al reiniciar.
   - No se comparte entre instancias.
   - Puede crecer sin límite.
   - Confía directamente en `X-Forwarded-For`.

3. **Inscripciones con riesgo de sobrecupo**
   - No se valida `capacity`.
   - No existe bloqueo transaccional.
   - No existe restricción de duplicado por evento y correo/código.

4. **Formularios públicos sin protección anti-spam**
   - Contacto.
   - Propuestas.
   - Postulaciones.
   - Suscripciones.
   - Inscripciones.
   - Futuras encuestas.

5. **Storage no implementado**
   - Existen configuración y tabla.
   - No existe servicio real de subida a Supabase Storage.
   - Las filas actuales apuntan a imágenes locales del frontend.

6. **Auditoría no implementada**
   - Existe `audit_logs`.
   - No existe código que registre cambios.

7. **Construcción frontend dependiente de Google Fonts**
   - ESLint y TypeScript pasaron.
   - El build falló en el entorno de auditoría por intentar descargar `Inter`.
   - Se debe usar fuente local para builds reproducibles.

8. **Dependencias con alertas**
   - `npm audit` reportó 2 vulnerabilidades moderadas asociadas a Next/PostCSS.
   - No aplicar `npm audit fix --force` sin revisar versiones.
   - Actualizar a una versión corregida compatible.

9. **Swagger público**
   - Está permitido por Spring Security.
   - En producción debe desactivarse o protegerse.

10. **Bootstrap administrativo peligroso a futuro**
    - Recorre todos los usuarios.
    - Retira el rol ADMIN a cualquier cuenta distinta a la configurada.
    - Hace imposible crecer a varios administradores sin cambiar código.

---

# 3. Arquitectura objetivo

```text
Usuarios públicos
        │
        ▼
CDN / Vercel Edge
        │
        ▼
Next.js público con ISR y caché por etiquetas
        │  solo cuando la caché expira
        ▼
Spring Boot API pública
        │
        ├── Caché L1 Caffeine
        ├── ETag / Cache-Control
        └── Consultas optimizadas
                │
                ▼
Supabase PostgreSQL
```

Flujo administrativo:

```text
Administrador
      │
      ▼
Next.js /administracion
      │
      ▼
Spring Boot /api/admin/**
      │
      ├── valida
      ├── persiste
      ├── audita
      └── invalida caché
              │
              ├── limpia Caffeine
              └── llama webhook de revalidación de Next.js
```

Archivos:

```text
Administrador
→ Spring Boot
→ Supabase Storage
→ CDN de Supabase
```

---

# 4. Estrategia de escalabilidad

## 4.1. Frontend público

Usar ISR o caché de servidor para contenido público.

Ejemplo conceptual:

```typescript
fetch(url, {
  next: {
    revalidate: 300,
    tags: ["events"]
  }
})
```

Etiquetas:

```text
representation
projects
events
opportunities
news
team
statistics
site-settings
polls
```

Cuando el administrador publique o edite:

```text
Spring Boot → webhook seguro de Next.js → revalidateTag("events")
```

### Frecuencia inicial

```text
Inicio: 5 minutos
Catálogos: 5 minutos
Detalle: 10 minutos
Equipo: 30 minutos
Configuración institucional: 1 hora
```

La invalidación administrativa permite reflejar cambios inmediatamente.

---

## 4.2. API pública

Agregar:

```text
Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
ETag
Last-Modified
Compresión HTTP
```

No aplicar caché a:

```text
/api/admin/**
/api/auth/**
formularios públicos
inscripciones
votos
```

---

## 4.3. Caché backend

Primera etapa:

```text
Caffeine
```

Cachés:

```text
public-representation
public-projects
public-events
public-opportunities
public-news
public-team
public-statistics
public-home
```

TTL inicial:

```text
5 minutos
```

Si se despliegan varias instancias y la carga lo requiere:

```text
Redis
```

No agregar Redis desde el primer día si Caffeine + ISR es suficiente.

---

## 4.4. Endpoint agregado para Inicio

Crear:

```http
GET /api/public/home
```

Respuesta:

```json
{
  "featuredRepresentation": null,
  "featuredProject": {},
  "upcomingEvents": [],
  "openOpportunities": [],
  "teamMembers": [],
  "news": [],
  "statistics": []
}
```

Esto reemplaza seis consultas HTTP realizadas en paralelo por la página de Inicio.

La consulta backend debe usar proyecciones y límites.

---

## 4.5. Consultas y DTO

Reemplazar:

```text
List<Map<String, Object>>
```

por DTO explícitos:

```text
RepresentationPublicResponse
ProjectPublicResponse
EventPublicResponse
OpportunityPublicResponse
NewsPublicResponse
TeamMemberPublicResponse
StatisticPublicResponse
HomePublicResponse
```

Mover filtros a SQL:

```text
status
featured
limit
cursor/page
category
startDate
```

No consultar todos los registros para luego filtrarlos en Java.

---

## 4.6. Eliminación del N+1

Opciones válidas:

1. Consultas SQL con `json_agg`.
2. Consultas por lote:
   - consulta principal;
   - una consulta para todas las relaciones usando `WHERE id IN (...)`.
3. Proyecciones JPA específicas.
4. `@EntityGraph` en casos sencillos.

No ejecutar consultas de relaciones dentro del `RowMapper` de cada fila.

---

## 4.7. Paginación

Endpoints de catálogo:

```http
GET /api/eventos?cursor=...&limit=20
GET /api/proyectos?cursor=...&limit=20
GET /api/oportunidades?cursor=...&limit=20
GET /api/noticias?cursor=...&limit=20
```

Para el panel administrativo puede mantenerse paginación por página:

```http
GET /api/admin/eventos?page=0&size=20
```

El público puede usar cursor para estabilidad y rendimiento.

---

## 4.8. Base de datos

Agregar restricciones:

```text
CHECK display_order >= 0
CHECK capacity IS NULL OR capacity >= 0
CHECK end_date IS NULL OR end_date >= start_date
CHECK content_status IN (...)
CHECK event_status IN (...)
CHECK project_status IN (...)
CHECK opportunity_status IN (...)
CHECK modality IN (...)
```

Agregar índices orientados a consultas:

```text
(content_status, featured, display_order, published_at DESC)
(content_status, event_status, start_date)
(content_status, project_status, display_order)
(content_status, opportunity_status, deadline)
(is_published, is_complete, display_order)
(event_id, lower(email)) UNIQUE
```

Eliminar índices redundantes cuando `slug` ya es `UNIQUE`.

---

## 4.9. Pool de conexiones

Configurar por ambiente:

```env
DB_POOL_MIN=1
DB_POOL_MAX=5
```

No dejar un valor fijo si se desplegarán múltiples instancias.

Regla:

```text
instancias × DB_POOL_MAX < límite seguro del pooler
```

El tráfico público debe resolverse principalmente por caché para evitar escalar conexiones al ritmo de visitantes.

---

# 5. Seguridad y disponibilidad

## 5.1. Sesiones

Spring Session JDBC permite varias instancias backend.

Mantenerlo porque:

- Solo el administrador inicia sesión.
- El costo de sesión es pequeño.
- No requiere Redis inicialmente.

Eliminar `/api/auth/refresh` si no aporta una operación real. La sesión se renueva por acceso.

---

## 5.2. Rate limiting

Aplicar por capas:

```text
CDN/WAF
Spring Boot
Captcha/Turnstile en formularios públicos
```

Primera implementación:

- Bucket4j con almacenamiento compartido o Redis si hay varias instancias.
- Límite por IP y operación.
- No confiar ciegamente en `X-Forwarded-For`.
- Configurar proxies de confianza.

Límites iniciales:

```text
Login: 5 intentos / 15 minutos
Contacto: 5 / hora
Propuesta: 3 / hora
Postulación: 3 / hora
Inscripción: 10 / hora
Encuesta: 20 / hora, además del control por encuesta
```

---

## 5.3. Disponibilidad

Agregar:

```text
Readiness
Liveness
Métricas
Request ID
Logs JSON
Alertas
```

Endpoints internos:

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/prometheus
```

Proteger métricas y detalles.

---

# 6. Implementación por etapas

## Etapa A — Correcciones críticas

1. Rotar secretos.
2. Eliminar `.env` del paquete.
3. Cambiar fuente Google por fuente local.
4. Desactivar Swagger en producción.
5. Eliminar `EDITOR` si no será usado.
6. Corregir bootstrap de administrador.
7. Añadir perfiles:
   ```text
   local
   test
   production
   ```

## Etapa B — Contratos y consultas

1. Crear DTO públicos.
2. Crear DTO administrativos.
3. Crear entidades/repositorios por módulo.
4. Eliminar `Map<String, Object>`.
5. Mover filtros a PostgreSQL.
6. Eliminar N+1.
7. Añadir paginación.

## Etapa C — Caché

1. Implementar endpoint `/api/public/home`.
2. Implementar Caffeine.
3. Añadir cabeceras HTTP.
4. Añadir ISR en Next.js.
5. Crear webhook de invalidación.
6. Verificar actualización después de publicar.

## Etapa D — Horizontalidad

1. Parametrizar pool.
2. Verificar Spring Session con dos instancias.
3. Verificar invalidez de caché.
4. Añadir rate limiter compartido si se despliega más de una instancia.
5. Ejecutar pruebas de carga.

---

# 7. Pruebas de carga requeridas

Escenarios:

```text
Inicio: 500 usuarios virtuales
Eventos: 500 usuarios virtuales
Oportunidades: 300 usuarios virtuales
Detalle: 500 usuarios virtuales
Login: 20 usuarios virtuales
Inscripción: 100 usuarios virtuales
Encuesta: 200 usuarios virtuales
```

Objetivos iniciales con caché caliente:

```text
p95 público < 300 ms
p99 público < 800 ms
Error rate < 1 %
Consultas DB por respuesta de catálogo: máximo 2–3
Inicio: máximo 1 endpoint backend
```

Herramientas:

```text
k6
Gatling
JMeter
```

---

# 8. Criterios de aceptación

- No hay secretos dentro del ZIP o repositorio.
- El contenido público proviene exclusivamente de PostgreSQL.
- Inicio usa un endpoint agregado.
- Los filtros se ejecutan en base de datos.
- No existe N+1 por registro.
- Existe caché frontend y backend.
- La publicación administrativa invalida la caché.
- El backend puede ejecutarse en dos instancias.
- Las sesiones continúan funcionando.
- Las métricas y logs permiten diagnosticar errores.
- Las pruebas de carga cumplen los objetivos definidos.
