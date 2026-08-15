# Fuerza UPT Backend — Architecture Rules

> Configurar esta regla como **Always On** en Antigravity.

## Objetivo

Mantener Fuerza UPT como un monolito modular Spring Boot, seguro, mantenible y consistente. Estas reglas son obligatorias para cualquier cambio backend.

## Stack canónico

- Java 17.
- Spring Boot / Spring MVC.
- Spring Security.
- Spring Data JPA + Hibernate.
- PostgreSQL.
- Caffeine para caché local cuando aplique.
- Supabase Storage para multimedia cuando aplique.
- Arquitectura monolítica modular por feature.

## Persistencia — reglas innegociables

- Todo acceso relacional propio debe realizarse con JPA/Hibernate.
- Usar `JpaRepository`, consultas derivadas, JPQL y locking JPA.
- Está prohibido introducir `JdbcTemplate`, `NamedParameterJdbcTemplate`, `JdbcClient`, `RowMapper`, `ResultSet`, `Connection`, `DriverManager` o `java.sql.*` en código propio.
- No crear DAOs JDBC.
- El driver PostgreSQL puede permanecer porque Hibernate lo necesita internamente.
- No introducir Flyway ni Liquibase.
- No crear clases o scripts versionados de migración.
- Nunca usar `spring.jpa.hibernate.ddl-auto=update` o `create` en producción.
- Mantener `ddl-auto=validate`.
- Si cambia una entidad o constraint, actualizar `database/schema-final.sql` y entregar el DDL manual necesario para la BD existente.

## Arquitectura modular

- Organizar por feature: `auth`, `project`, `event`, `opportunity`, `representation`, `team`, `poll`, `submission`, `media`, `settings`, etc.
- Dentro del feature preferir `controller`, `dto`, `service`, `entity`, `repository`, `model` según necesidad.
- Controller delgado: HTTP, validación de entrada, autorización declarativa y delegación.
- Service: casos de uso, reglas de negocio y transacciones.
- Repository: persistencia JPA.
- Entity: modelo persistente e invariantes simples.
- DTO: contrato API; nunca exponer entidades directamente.
- No crear nuevos servicios CRUD genéricos que mezclen múltiples dominios.
- No agregar nueva lógica de dominio a `AdminContentService` cuando exista o pueda existir un módulo específico.
- Tratar `content/` y `AdminContentService` como legado en proceso de retiro, no como patrón para nuevas features.
- No introducir microservicios sin una decisión arquitectónica explícita del usuario.

## Endpoints

- Antes de crear cualquier endpoint, buscar mappings existentes.
- Nunca crear dos controladores para la misma combinación método HTTP + path.
- Conservar convenciones actuales de rutas públicas y administrativas.
- Todo endpoint administrativo debe exigir `ADMIN` según la configuración de seguridad vigente.
- No reintroducir `/api/noticias/**` ni el módulo `noticias` salvo solicitud explícita.

## Seguridad

- No debilitar CSRF, CORS, autorización, cookies, session fixation ni rate limiting.
- No cambiar `permitAll`, roles o exclusions de CSRF sin justificarlo en el resumen final.
- No registrar passwords, tokens, cookies, secretos, OAuth subject, service keys ni emails completos.
- Minimizar PII en logs y auditoría.
- Todo endpoint público de escritura debe revisar si necesita rate limiting.
- Mantener HMAC para identificadores privados usados en rate limiting o fingerprints.
- Uploads: validar tamaño, MIME real/firma, nombre seguro y privacidad.
- No añadir fallbacks externos para datos personales sin opt-in explícito.

## Datos y concurrencia

- Mantener `@Version` donde ya exista optimistic locking.
- Para contadores o límites concurrentes usar mecanismos JPA (`@Lock`, `@Version`) y transacciones explícitas.
- Si una fila puede ser creada concurrentemente, manejar también la carrera de creación; no asumir que `PESSIMISTIC_WRITE` puede bloquear una fila inexistente.
- Nunca resolver concurrencia regresando a JDBC.

## Mutaciones administrativas

Cuando una mutación administrativa afecte contenido público:

1. aplicar la regla de negocio;
2. persistir transaccionalmente;
3. registrar auditoría si el módulo ya la utiliza;
4. invalidar caché usando el nombre canónico del módulo;
5. conservar locking/versionado existente.

## Base de datos

- `database/schema-final.sql` debe representar el modelo JPA actual, no una versión histórica.
- Si una feature cambia BD, entregar siempre:
  - cambios de Entity;
  - cambios de Repository si aplica;
  - cambios en `schema-final.sql`;
  - DDL manual para aplicar a la base existente;
  - impacto de datos o backfill si existe.
- No borrar columnas/tablas en el mismo cambio sin analizar compatibilidad y datos existentes.
- No crear seeds ocultos desde servicios. Si el sistema necesita datos base, declararlos explícitamente en el esquema/provisionamiento o en un bootstrap controlado.

## Desarrollo — política del usuario

- NO crear pruebas unitarias, integración, mocks o Testcontainers salvo solicitud explícita.
- NO modificar `src/test` salvo solicitud explícita.
- NO ejecutar tests automáticamente.
- Sí verificar compilación sin tests cuando sea posible: `mvnw.cmd -DskipTests compile` en Windows o `./mvnw -DskipTests compile` en Unix.
- Sí ejecutar verificaciones estáticas y búsquedas en código.
- No cambiar archivos no relacionados con la tarea.
- Antes de editar, inspeccionar implementación actual y referencias para evitar arquitectura paralela.

## Limpieza

- No conservar código JDBC comentado, bridges temporales o bloques `legacy` después de reemplazarlos.
- No conservar campos `migrationStatus`, `originalSource` u otros residuos de migración salvo necesidad funcional actual demostrable.
- No usar scripts generadores antiguos como fuente de verdad arquitectónica.
- No incluir `.env`, logs, `target/`, backups o secretos en artefactos del proyecto.

## Final de cada tarea

Entregar un resumen conciso con:

- archivos creados/modificados/eliminados;
- decisiones arquitectónicas;
- cambio de schema y DDL manual si aplica;
- seguridad afectada;
- compatibilidad/riesgos pendientes;
- resultado de compilación/verificación estática;
- indicar explícitamente que no se crearon ni ejecutaron tests.
