# Fuerza UPT Backend — Documentación de Arquitectura

## 1. Visión General
Fuerza UPT API es un **monolito modular** desarrollado en **Java 17** y **Spring Boot 3.4.3**, diseñado para alta mantenibilidad, seguridad y rendimiento relacional.

## 2. Decisiones Arquitectónicas Canónicas

### 2.1 Persistencia Relacional (100% JPA)
- **Framework**: Spring Data JPA + Hibernate contra PostgreSQL.
- **Acceso a Datos**: Exclusivamente mediante interfaces `JpaRepository`, consultas derivadas y JPQL.
- **Regla Estricta**: Prohibición total de `JdbcTemplate`, `java.sql.*`, `RowMapper`, `ResultSet`, `Connection` manual, Flyway o Liquibase en runtime.
- **Esquema de Base de Datos**: El archivo `database/schema-final.sql` es la fuente de verdad del esquema relacional DDL baseline.
- **Validación DDL**: Entornos de ejecución deben mantener `spring.jpa.hibernate.ddl-auto=validate`.

### 2.2 Estrategia de Sesión HTTP
- **Modo Actual**: `SERVLET_IN_MEMORY` (Sesión en memoria del contenedor Tomcat para despliegues de **1 sola instancia**).
- **Escalabilidad Futura a Redis**: Si el despliegue escala a múltiples réplicas (cluster/multinodo/load balancer sin sticky sessions), las sesiones deben migrarse a Redis utilizando `spring-session-data-redis` sin reintroducir persistencia JDBC.

### 2.3 Estructura Modular por Feature
El backend se organiza en paquetes independientes por dominio funcional:
- `auth`: Autenticación local, OAuth2 Google, gestión de usuarios y roles.
- `project`: Gestión pública y administrativa de proyectos.
- `event`: Eventos, cronogramas y registros de asistentes.
- `opportunity`: Oportunidades académicas, convocatorias y becas.
- `representation`: Gestión de representación estudiantil e impacto.
- `team`: Miembros del equipo Fuerza UPT y redes.
- `poll`: Sistema de encuestas y consultas estudiantiles.
- `submission`: Postulaciones, propuestas, boletines y rate limiting compartido.
- `media`: Almacenamiento de archivos multimedia integrado con Supabase Storage.
- `settings`: Configuración institucional singleton.
- `statistic`: Estadísticas públicas e indicadores de impacto.
- `admin`: Operaciones transversales de auditoría, panel administrativo e invalidación de caché.
- `security`: Configuración de Spring Security, filtros y rate limiting.

### 2.4 Seguridad y Rate Limiting
- **Rate Limiting Multidimensional**: En `LoginAttemptService` y `SharedRateLimitService`, con reintentos transaccionales aislados (`REQUIRES_NEW`) e identificadores protegidos mediante HMAC (`PrivacyHashService`).
- **Control de Concurrencia**: Filas existentes se bloquean con `@Lock(LockModeType.PESSIMISTIC_WRITE)` o `@Version`.
- **Privacidad**: Registro anónimo en auditoría y logs operacionales sin PII (emails o credenciales expuestas).

## 3. Guía para Cambios de Esquema
1. Modificar o crear las clases `@Entity` JPA necesarias.
2. Actualizar el esquema baseline en `database/schema-final.sql`.
3. Proporcionar el script DDL manual (`ALTER TABLE ...`) para aplicar sobre bases de datos PostgreSQL existentes.
4. Compilar usando `mvnw.cmd -DskipTests compile` para validar.
