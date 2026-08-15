# Plan de implementación — Fuerza UPT Backend
## Objetivo: JPA como única capa de persistencia relacional explícita, cero JDBC directo y retiro definitivo de Flyway del runtime

**Fecha:** 12 de agosto de 2026  
**Artefacto analizado:** `backend-fuerza-upt(2).zip`

---

# 1. Objetivo técnico

El backend debe quedar con estas reglas:

1. Todo acceso a PostgreSQL desde código de negocio debe realizarse mediante:
   - entidades JPA;
   - `JpaRepository`;
   - JPQL/derived queries;
   - mecanismos de locking de JPA cuando sea necesario.

2. Deben desaparecer del código propio:
   - `JdbcTemplate`;
   - `RowMapper`;
   - `java.sql.*`;
   - `DriverManager`;
   - `Connection`;
   - `ResultSet`;
   - SQL ejecutado manualmente desde servicios;
   - `spring-session-jdbc`;
   - configuración `spring.session.store-type: jdbc`.

3. `User`, `Role` y `UserIdentity` se mantienen con JPA. **Ya están migrados correctamente y no deben reescribirse.**

4. Las sesiones HTTP no deben persistirse mediante JDBC.
   - Recomendación para producción: Spring Session + Redis.
   - Alternativa solo para despliegue de una única instancia: sesión nativa del contenedor.

5. Flyway debe ser retirado del runtime una vez creado y validado un esquema final.

6. No se utilizará `hibernate.ddl-auto=update` en producción.
   - Mantener `ddl-auto=validate`.

---

# 2. Estado real encontrado en el ZIP

## Correctamente en JPA

Ya utilizan Spring Data JPA:

```text
auth/entity/User.java
auth/entity/Role.java
auth/entity/UserIdentity.java

auth/repository/UserRepository.java
auth/repository/RoleRepository.java
auth/repository/UserIdentityRepository.java

security/CustomUserDetailsService.java
security/service/OAuthUserManagementService.java
```

Por tanto, **usuarios reales ya están persistidos mediante JPA**.

No hay que crear otra capa paralela.

---

# 3. JDBC explícito que todavía existe

## Producción

### `LoginAttemptService`

Archivo:

```text
src/main/java/pe/edu/upt/fuerzaupt/auth/service/LoginAttemptService.java
```

Usa:

```java
JdbcTemplate
java.sql.Timestamp
SELECT ...
FOR UPDATE
INSERT ... ON CONFLICT
DELETE ...
```

Debe convertirse a JPA.

---

### `SharedRateLimitService`

Archivo:

```text
src/main/java/pe/edu/upt/fuerzaupt/submission/service/SharedRateLimitService.java
```

Usa:

```java
JdbcTemplate
INSERT ... ON CONFLICT
RETURNING
```

Debe convertirse a JPA.

---

### `SecurityCleanupJob`

Archivo:

```text
src/main/java/pe/edu/upt/fuerzaupt/security/job/SecurityCleanupJob.java
```

Usa:

```java
JdbcTemplate
DELETE FROM login_attempts
DELETE FROM request_rate_limits
```

Debe usar repositorios JPA.

---

### `SiteSettingsService`

Archivo:

```text
src/main/java/pe/edu/upt/fuerzaupt/settings/service/SiteSettingsService.java
```

La implementación activa ya utiliza JPA.

Sin embargo conserva un bloque comentado:

```text
LEGACY JDBC METHODS
```

con:

```java
java.sql.Timestamp
ResultSet
```

Ese bloque debe eliminarse completamente.

No debe quedar código JDBC comentado.

---

# 4. JDBC en pruebas

Eliminar JDBC de:

```text
src/test/java/pe/edu/upt/fuerzaupt/ApplicationContextTest.java
src/test/java/pe/edu/upt/fuerzaupt/auth/service/LoginAttemptServiceTest.java
src/test/java/pe/edu/upt/fuerzaupt/submission/service/SharedRateLimitServiceTest.java
src/test/java/pe/edu/upt/fuerzaupt/migration/FlywayMigrationIntegrationTest.java
```

`ApplicationContextTest` ya no debe contener:

```java
@MockBean
JdbcTemplate
```

---

# 5. JDBC residual en scripts de desarrollo

Los siguientes scripts contienen código generador basado en JDBC:

```text
generate_repo.ps1
update_admin_get.ps1
```

Incluyen referencias como:

```java
JdbcTemplate
RowMapper
ResultSet
java.sql.Array
java.sql.Timestamp
```

Aunque no compilen dentro del backend, son peligrosos porque pueden volver a introducir JDBC al ejecutar el script.

## Acción

Eliminar ambos scripts si ya no son necesarios:

```text
DELETE generate_repo.ps1
DELETE update_admin_get.ps1
```

Si todavía se necesitan generadores, reescribirlos para generar:

```text
@Entity
JpaRepository
@Service
DTO mapper
```

y nunca `JdbcTemplate`.

---

# 6. Spring Session JDBC también debe desaparecer

Actualmente `pom.xml` contiene:

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-jdbc</artifactId>
</dependency>
```

y `application.yml` contiene:

```yaml
spring:
  session:
    store-type: jdbc
    jdbc:
      initialize-schema: never
```

Esto significa que aunque usuarios estén con JPA, las sesiones siguen siendo JDBC.

## Acción

Eliminar:

```xml
spring-session-jdbc
```

Eliminar:

```yaml
spring.session.store-type: jdbc
spring.session.jdbc.initialize-schema
```

---

# 7. Estrategia recomendada para las sesiones

## Opción recomendada — Redis

Producción:

```text
HTTP Session
    ↓
Spring Session
    ↓
Redis
```

Ventajas:

- no usa Spring Session JDBC;
- funciona con múltiples instancias;
- la sesión sobrevive al balanceo entre nodos;
- TTL natural;
- separación entre datos relacionales y estado efímero.

Dependencias objetivo:

```xml
spring-session-data-redis
spring-boot-starter-data-redis
```

La autenticación seguirá usando:

```text
HttpSessionSecurityContextRepository
ChangeSessionIdAuthenticationStrategy
```

No es necesario convertir autenticación a JWT.

---

## Alternativa — sesión del contenedor

Puede usarse si el backend siempre tendrá:

```text
1 única instancia
```

En ese caso se elimina Spring Session por completo.

La sesión permanece en memoria de Tomcat.

No recomiendo esta opción si existe:

```text
autoscaling
múltiples réplicas
reinicios frecuentes
load balancer sin sticky sessions
```

---

# 8. Fase 1 — Crear persistencia JPA para login attempts

## Nueva entidad

Crear:

```text
auth/entity/LoginAttempt.java
```

Modelo:

```java
@Entity
@Table(name = "login_attempts")
@Getter
@Setter
@NoArgsConstructor
public class LoginAttempt {

    @Id
    @Column(name = "attempt_key", length = 320)
    private String attemptKey;

    @Column(nullable = false)
    private int failures;

    @Column(name = "blocked_until")
    private Instant blockedUntil;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
```

## Nota sobre `@Version`

Para usar optimistic locking se necesitaría una columna:

```text
version
```

en la tabla.

Como el objetivo también es consolidar el esquema final, dicha columna debe incorporarse al esquema final.

Alternativamente puede utilizarse locking pesimista sin `@Version`.

---

# 9. Repository de LoginAttempt

Crear:

```text
auth/repository/LoginAttemptRepository.java
```

Diseño recomendado:

```java
public interface LoginAttemptRepository
        extends JpaRepository<LoginAttempt, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select l
        from LoginAttempt l
        where l.attemptKey = :key
    """)
    Optional<LoginAttempt> findForUpdate(@Param("key") String key);

    @Modifying
    @Query("""
        delete from LoginAttempt l
        where l.attemptKey in :keys
    """)
    int deleteAllByKeys(@Param("keys") Collection<String> keys);

    @Modifying
    @Query("""
        delete from LoginAttempt l
        where l.updatedAt < :cutoff
    """)
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
```

No utilizar:

```text
JdbcTemplate
native Connection
ResultSet
```

---

# 10. Refactor de LoginAttemptService

Dependencia actual:

```java
private final JdbcTemplate jdbcTemplate;
```

Reemplazar por:

```java
private final LoginAttemptRepository loginAttemptRepository;
```

## `ensureAllowed`

Flujo:

```text
repository.findById(key)
        ↓
blockedUntil
        ↓
comparar contra Instant.now()
```

## `recordFailure`

Flujo:

```text
findForUpdate(key)
        ↓
si existe:
    incrementar failures
si no existe:
    crear LoginAttempt
        ↓
calcular blockedUntil
        ↓
saveAndFlush
```

Mantener las tres dimensiones actuales:

```text
login-ip
login-account
login-combination
```

## `recordSuccessMulti`

Cambiar tres deletes JDBC por:

```java
loginAttemptRepository.deleteAllByKeys(
    Set.of(ipKey, accountKey, combinationKey)
);
```

---

# 11. Concurrencia del LoginAttemptService

Este punto es obligatorio.

El `FOR UPDATE` JDBC actual evita ciertas carreras.

Al migrar a JPA no debe perderse esa protección.

Utilizar:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
```

para registros existentes.

Además debe probarse la carrera de creación de un `attempt_key` inexistente.

La PK:

```text
attempt_key
```

debe continuar siendo UNIQUE/PRIMARY KEY.

Casos concurrentes deben terminar en un valor de contador correcto y no permitir intentos extra por una race condition.

---

# 12. Fase 2 — Convertir SharedRateLimitService a JPA

## Nueva clave compuesta

Crear:

```text
submission/entity/RequestRateLimitId.java
```

Ejemplo:

```java
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RequestRateLimitId implements Serializable {

    @Column(name = "operation", length = 50)
    private String operation;

    @Column(name = "client_key", length = 255)
    private String clientKey;
}
```

---

# 13. Nueva entidad RequestRateLimit

Crear:

```text
submission/entity/RequestRateLimit.java
```

```java
@Entity
@Table(name = "request_rate_limits")
@Getter
@Setter
@NoArgsConstructor
public class RequestRateLimit {

    @EmbeddedId
    private RequestRateLimitId id;

    @Column(name = "window_started_at", nullable = false)
    private Instant windowStartedAt;

    @Column(name = "request_count", nullable = false)
    private int requestCount;
}
```

---

# 14. Repository RequestRateLimit

Crear:

```text
submission/repository/RequestRateLimitRepository.java
```

```java
public interface RequestRateLimitRepository
        extends JpaRepository<RequestRateLimit, RequestRateLimitId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select r
        from RequestRateLimit r
        where r.id = :id
    """)
    Optional<RequestRateLimit> findForUpdate(
        @Param("id") RequestRateLimitId id
    );

    @Modifying
    @Query("""
        delete from RequestRateLimit r
        where r.windowStartedAt < :cutoff
    """)
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
```

---

# 15. Refactor SharedRateLimitService

Eliminar:

```java
JdbcTemplate
INSERT ... ON CONFLICT
INTERVAL
RETURNING
```

Nuevo flujo:

```text
RequestRateLimitId(operation, clientKey)
        ↓
findForUpdate
        ↓
si no existe:
    count = 1
    windowStartedAt = now

si existe y ventana expiró:
    count = 1
    windowStartedAt = now

si existe y ventana sigue activa:
    count++
        ↓
saveAndFlush
        ↓
si count > limit:
    RateLimitExceededException
```

Debe conservarse:

```java
Propagation.REQUIRES_NEW
```

o una frontera transaccional equivalente que impida que un rollback del formulario revierta el consumo del rate limit.

---

# 16. Carrera al crear una nueva clave de rate limit

Dos requests concurrentes pueden intentar crear la misma clave.

El plan debe incluir uno de estos mecanismos:

## Recomendado

Servicio de persistencia separado con transacción nueva + retry limitado ante conflicto de PK.

Ejemplo conceptual:

```text
SharedRateLimitService
      ↓ retry máximo 3
RateLimitPersistenceService.consumeInNewTransaction(...)
      ↓
Repository JPA
```

Capturar únicamente conflictos esperados de concurrencia.

No usar retry infinito.

---

# 17. Fase 3 — SecurityCleanupJob con JPA

Actualmente:

```java
JdbcTemplate.update(DELETE ...)
```

Cambiar dependencias por:

```java
private final LoginAttemptRepository loginAttemptRepository;
private final RequestRateLimitRepository requestRateLimitRepository;
```

Implementación:

```java
@Scheduled(...)
@Transactional
public void cleanup() {
    Instant cutoff = Instant.now().minus(Duration.ofHours(24));

    int attempts =
        loginAttemptRepository.deleteExpired(cutoff);

    int rateLimits =
        requestRateLimitRepository.deleteExpired(cutoff);

    ...
}
```

Esto utiliza JPQL mediante JPA.

---

# 18. Fase 4 — Eliminar restos JDBC

Eliminar por completo el bloque comentado de:

```text
SiteSettingsService.java
```

que comienza con:

```text
LEGACY JDBC METHODS
```

No dejarlo comentado.

---

Eliminar:

```text
generate_repo.ps1
update_admin_get.ps1
```

o reemplazarlos por generadores JPA.

---

Actualizar:

```text
ApplicationContextTest
```

eliminando:

```java
@MockBean
private JdbcTemplate jdbcTemplate;
```

---

# 19. Fase 5 — Reescribir pruebas de LoginAttemptService

Eliminar mocks de:

```java
JdbcTemplate
ResultSetExtractor
```

Los unit tests deben mockear:

```text
LoginAttemptRepository
```

Casos mínimos:

```text
sin bloqueo -> permitido
bloqueo expirado -> permitido
bloqueo activo -> rechazado
primer fallo -> failures=1
quinto fallo combinación -> blockedUntil
login exitoso -> borra las tres claves
límite por IP -> se aplica
límite por cuenta -> se aplica
límite por combinación -> se aplica
```

---

# 20. Fase 6 — Reescribir pruebas de SharedRateLimitService

Eliminar `JdbcTemplate`.

Testear:

```text
primera petición
petición dentro de límite
petición exacta en límite
petición por encima de límite
ventana expirada
ventana renovada
dos operaciones diferentes
dos clientKey diferentes
```

---

# 21. Tests JPA reales

Además de mocks deben existir tests contra PostgreSQL real mediante Testcontainers para comprobar:

```text
mapping de LoginAttempt
mapping de RequestRateLimit
composite PK
pessimistic locking
bulk delete JPQL
concurrencia
transacciones REQUIRES_NEW
```

No usar `java.sql.Connection` para validar.

Las verificaciones deben hacerse mediante:

```text
JpaRepository
EntityManager
```

---

# 22. Fase 7 — Retirar Spring Session JDBC

Eliminar de `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-jdbc</artifactId>
</dependency>
```

Eliminar de configuración:

```yaml
spring:
  session:
    store-type: jdbc
    jdbc:
      initialize-schema: never
```

---

# 23. Spring Session con Redis

Si se utiliza Redis:

Agregar las dependencias correspondientes de Spring Session Redis.

Configurar mediante variables de entorno:

```text
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
REDIS_SSL
```

Mantener timeout:

```text
30m
```

Mantener cookie:

```text
FUERZA_UPT_SESSION
HttpOnly
Secure en production
SameSite=Lax
```

Mantener:

```text
ChangeSessionIdAuthenticationStrategy
```

---

# 24. Tablas SPRING_SESSION

Actualmente fueron creadas por:

```text
V2__create_session_tables.sql
```

Después de mover las sesiones a Redis y verificar que ninguna instancia utiliza JDBC:

```text
SPRING_SESSION
SPRING_SESSION_ATTRIBUTES
```

pueden eliminarse de la base de datos.

No hacerlo en el mismo instante en que se cambia el runtime.

Orden seguro:

```text
1. desplegar Redis
2. verificar login/logout/OAuth
3. comprobar que SPRING_SESSION deja de recibir writes
4. esperar al menos una ventana completa de sesión
5. backup
6. eliminar tablas antiguas
```

---

# 25. Sobre “no quiero nada de JDBC”

Hay que distinguir:

## Debe desaparecer

```text
JdbcTemplate
spring-session-jdbc
org.springframework.jdbc usado por nuestro código
java.sql usado por nuestro código
SQL manual desde servicios
RowMapper
DriverManager
Connection
ResultSet
```

## No puede desaparecer si PostgreSQL + JPA continúan

El driver:

```xml
org.postgresql:postgresql
```

debe permanecer.

JPA/Hibernate necesita internamente una conexión relacional con PostgreSQL.

Por tanto, el criterio correcto es:

> **cero JDBC explícito en el código del proyecto; toda persistencia relacional propia pasa por JPA/Hibernate.**

Intentar eliminar también el driver PostgreSQL impediría a JPA conectarse a PostgreSQL.

---

# 26. Fase 8 — Retirar Flyway del runtime

Actualmente existen:

```text
29 scripts SQL
V1 ... V29
```

en:

```text
src/main/resources/db/migration/
```

y el test:

```text
src/test/java/pe/edu/upt/fuerzaupt/migration/FlywayMigrationIntegrationTest.java
```

No existen clases Java de migración de producción.

El test sí es una clase Java de migración y puede retirarse cuando Flyway deje de existir.

---

# 27. No borrar Flyway antes de congelar el esquema

Antes de eliminar migraciones:

```text
1. aplicar y verificar el estado actual de la BD
2. hacer backup
3. generar un esquema final
4. probar ese esquema final en una BD vacía
5. arrancar el backend con ddl-auto=validate
6. recién entonces retirar Flyway
```

Borrar las migraciones antes de esto dejaría el proyecto sin una definición reproducible de la base de datos.

---

# 28. Crear un único esquema final

Crear fuera del classpath runtime:

```text
database/schema-final.sql
```

No colocarlo en:

```text
src/main/resources/db/migration
```

Debe representar el estado final real del esquema después de V29 y después de las modificaciones JPA de esta remediación.

No debe ser una concatenación ciega de V1–V29.

Debe representar el estado final, por ejemplo:

```text
users
roles
user_roles
user_identities
login_attempts
request_rate_limits
media
representation
projects
events
opportunities
team
statistics
submissions
audit
polls
settings
cache invalidation
```

No debe volver a crear objetos posteriormente eliminados como el módulo `news`.

Tampoco debe incluir `SPRING_SESSION` si Redis ya reemplazó Spring Session JDBC.

---

# 29. Fuente recomendada del esquema final

La fuente de verdad debe ser una base de datos validada de staging/producción.

Generar:

```text
schema-only
constraints
indexes
sequences
foreign keys
check constraints
```

Después revisar manualmente.

El esquema final debe formar parte del repositorio como artefacto de infraestructura, no como migración automática.

---

# 30. Verificación del schema-final

Crear un nuevo test:

```text
SchemaCompatibilityIntegrationTest
```

Objetivo:

```text
PostgreSQL vacío
    ↓
aplicar database/schema-final.sql
    ↓
arrancar EntityManagerFactory
    ↓
Hibernate ddl-auto=validate
    ↓
PASS
```

Este test reemplaza conceptualmente al test de Flyway.

No debe usar JDBC directo desde el código del test.

Puede inicializar el contenedor mediante mecanismos de infraestructura/Testcontainers y después validar todo mediante Spring/JPA.

---

# 31. Eliminar Flyway

Después de validar `schema-final.sql`:

Eliminar de `pom.xml`:

```xml
org.flywaydb:flyway-core
org.flywaydb:flyway-database-postgresql
```

Eliminar de:

```text
application.yml
```

todo:

```yaml
spring:
  flyway:
    ...
```

Eliminar:

```text
src/main/resources/db/migration/
```

Eliminar:

```text
src/test/java/pe/edu/upt/fuerzaupt/migration/FlywayMigrationIntegrationTest.java
```

---

# 32. Tabla `flyway_schema_history`

No es necesario eliminarla inmediatamente.

Una vez que:

```text
Flyway ya no esté en dependencias
la app ya no lo invoque
schema-final esté validado
backup exista
```

la tabla puede eliminarse manualmente si se desea limpiar completamente la BD.

Recomiendo hacerlo en un cambio posterior.

---

# 33. `V25__reconcile_migration_sequence.sql`

Actualmente existe y contiene únicamente:

```sql
SELECT 1;
```

Con el retiro total de Flyway esta migración desaparece junto con el resto.

No tiene sentido mantenerla en la arquitectura final.

---

# 34. Cómo manejar futuros cambios de esquema sin Flyway

Si Flyway se elimina, debe existir un proceso explícito.

Para cada cambio futuro que modifique entidades:

```text
1. cambiar entidad JPA
2. modificar database/schema-final.sql
3. preparar DDL operativo manual
4. aplicar DDL en staging
5. ejecutar ddl-auto=validate
6. aplicar DDL en producción
7. desplegar aplicación
```

No usar:

```yaml
ddl-auto: update
```

en producción.

Si el sistema empieza a evolucionar frecuentemente, debe reconsiderarse un gestor de migraciones.

---

# 35. Fase 9 — Limpiar el artefacto de distribución

El ZIP actual ya no contiene `.env`, lo cual es correcto.

Sin embargo contiene:

```text
logs/backend.out.log
logs/backend.err.log
```

`backend.out.log` revela información operativa histórica, incluyendo el host JDBC de PostgreSQL/Supabase.

Debe eliminarse del ZIP.

El walkthrough anterior mencionaba:

```text
package-backend.ps1
```

pero ese script **no aparece en el ZIP analizado**.

Hay que revisar el proceso real de empaquetado.

---

# 36. Regla de packaging

El artefacto debe construirse con allowlist.

Incluir únicamente:

```text
pom.xml
mvnw
mvnw.cmd
.mvn/
src/
Dockerfile
.dockerignore
.gitignore
database/schema-final.sql
README / documentación necesaria
```

Excluir:

```text
.env
logs/
*.log
target/
.git/
.idea/
scripts temporales
planes antiguos
backups
```

---

# 37. Fase 10 — Spring Boot

El ZIP todavía utiliza:

```text
Spring Boot 3.4.3
```

Este cambio debe realizarse en un commit/PR separado del refactor JDBC → JPA para evitar mezclar dos fuentes grandes de regresión.

Orden recomendado:

```text
PR 1: JDBC directo → JPA
PR 2: Spring Session JDBC → Redis
PR 3: retiro Flyway + schema-final
PR 4: upgrade Spring Boot
```

No desplegar el backend final a producción manteniendo indefinidamente la línea actual.

---

# 38. Arquitectura final esperada

## Persistencia relacional

```text
Controller
    ↓
Application/Domain Service
    ↓
JpaRepository
    ↓
Hibernate/JPA
    ↓
PostgreSQL
```

---

## Usuarios

```text
CustomUserDetailsService
        ↓
UserRepository
        ↓
User
   ↙         ↘
Role      UserIdentity
```

Sin `JdbcTemplate`.

---

## Login rate limit

```text
AuthController
    ↓
LoginAttemptService
    ↓
LoginAttemptRepository
    ↓
LoginAttempt @Entity
```

---

## Shared rate limit

```text
PublicSubmissionController
       ↓
SharedRateLimitService
       ↓
RequestRateLimitRepository
       ↓
RequestRateLimit @Entity
```

---

## Sesión

```text
Spring Security
       ↓
HttpSession
       ↓
Spring Session Redis
       ↓
Redis
```

---

## Esquema

```text
database/schema-final.sql
        ↓
provisionamiento de DB
        ↓
Hibernate ddl-auto=validate
```

Sin Flyway en runtime.

---

# 39. Archivos a CREAR

```text
src/main/java/pe/edu/upt/fuerzaupt/auth/entity/LoginAttempt.java
src/main/java/pe/edu/upt/fuerzaupt/auth/repository/LoginAttemptRepository.java

src/main/java/pe/edu/upt/fuerzaupt/submission/entity/RequestRateLimit.java
src/main/java/pe/edu/upt/fuerzaupt/submission/entity/RequestRateLimitId.java
src/main/java/pe/edu/upt/fuerzaupt/submission/repository/RequestRateLimitRepository.java

opcional:
src/main/java/.../submission/service/RateLimitPersistenceService.java

database/schema-final.sql

src/test/java/.../SchemaCompatibilityIntegrationTest.java
```

---

# 40. Archivos a MODIFICAR

```text
pom.xml

src/main/resources/application.yml
src/main/resources/application-production.yml
src/main/resources/application-test.yml

auth/service/LoginAttemptService.java
submission/service/SharedRateLimitService.java
security/job/SecurityCleanupJob.java
settings/service/SiteSettingsService.java

ApplicationContextTest.java
LoginAttemptServiceTest.java
SharedRateLimitServiceTest.java
```

---

# 41. Archivos a ELIMINAR

Cuando la transición esté verificada:

```text
generate_repo.ps1
update_admin_get.ps1

src/test/java/pe/edu/upt/fuerzaupt/migration/FlywayMigrationIntegrationTest.java

src/main/resources/db/migration/V1__create_security_tables.sql
...
src/main/resources/db/migration/V29__add_google_oauth_identity.sql
```

Y por dependencias:

```text
spring-session-jdbc
flyway-core
flyway-database-postgresql
```

---

# 42. Tablas a conservar

Si los rate limits se implementan con JPA:

```text
login_attempts
request_rate_limits
```

se conservan.

Solo cambia la forma de acceder a ellas.

---

# 43. Tablas candidatas a eliminar

Después de la transición de sesiones:

```text
SPRING_SESSION
SPRING_SESSION_ATTRIBUTES
```

Después de retirar Flyway y completar la ventana de seguridad:

```text
flyway_schema_history
```

Opcionalmente.

---

# 44. Tests obligatorios antes de aprobar

## Autenticación

```text
login correcto
password incorrecta
IP rate limit
account rate limit
combination rate limit
session fixation
logout
/auth/me
Google OAuth
```

## JPA

```text
UserRepository
UserIdentityRepository
LoginAttemptRepository
RequestRateLimitRepository
locking
concurrencia
bulk cleanup
```

## Sesiones

```text
crear sesión
rotar ID tras login
recuperar sesión
expirar sesión
logout elimina sesión
dos instancias pueden leer misma sesión
```

si Redis es utilizado.

## Base de datos

```text
schema-final.sql crea BD vacía
Hibernate validate pasa
constraints pasan
indexes existen
OAuth user permite password_hash null
registration_mode funciona
```

---

# 45. Gate automático “NO JDBC DIRECTO”

Añadir al CI una validación que falle si aparece cualquiera de:

```text
JdbcTemplate
NamedParameterJdbcTemplate
JdbcClient
org.springframework.jdbc
java.sql.
RowMapper
ResultSet
DriverManager
spring-session-jdbc
store-type: jdbc
```

en:

```text
src/main/java
src/test/java
pom.xml
src/main/resources
scripts activos
```

---

# 46. Excepción del driver PostgreSQL

No considerar como incumplimiento:

```xml
org.postgresql:postgresql
```

El driver es infraestructura de Hibernate/JPA.

La aplicación no debe usarlo directamente.

---

# 47. Gate de repositorios

Todo acceso relacional debe terminar en uno de:

```text
JpaRepository
Repository de Spring Data JPA
EntityManager cuando exista una razón justificada
```

No crear DAOs manuales basados en conexiones.

---

# 48. Orden exacto de implementación

## PR 1 — JPA auth/rate limit

```text
1. LoginAttempt entity
2. LoginAttemptRepository
3. LoginAttemptService JPA
4. RequestRateLimitId
5. RequestRateLimit
6. RequestRateLimitRepository
7. SharedRateLimitService JPA
8. SecurityCleanupJob JPA
9. eliminar legacy JDBC comentado
10. reescribir tests
```

Gate:

```text
cero JdbcTemplate en src/main/java
```

---

## PR 2 — Retirar JDBC de sesiones

```text
1. agregar Redis Session
2. configurar Redis
3. eliminar spring-session-jdbc
4. eliminar spring.session.store-type=jdbc
5. actualizar ApplicationContextTest
6. probar login/logout/OAuth
```

Gate:

```text
cero spring-session-jdbc
```

---

## PR 3 — Retirar residuos

```text
1. eliminar generate_repo.ps1
2. eliminar update_admin_get.ps1
3. eliminar logs del artefacto
4. corregir package script
```

Gate:

```text
grep JDBC = 0 en código propio
```

---

## PR 4 — Consolidar base

```text
1. backup DB
2. generar schema-final.sql
3. revisar constraints/indexes
4. probar PostgreSQL vacío
5. Hibernate validate
6. eliminar Flyway dependencies
7. eliminar configuración Flyway
8. eliminar db/migration
9. eliminar FlywayMigrationIntegrationTest
```

Gate:

```text
aplicación inicia sin Flyway
BD nueva creada desde schema-final valida con JPA
```

---

## PR 5 — Limpiar BD

Después de validar producción:

```text
1. eliminar SPRING_SESSION
2. eliminar SPRING_SESSION_ATTRIBUTES
3. opcionalmente eliminar flyway_schema_history
```

Este PR/operación debe ocurrir separado del cambio de aplicación.

---

## PR 6 — Upgrade framework

Actualizar Spring Boot en cambio aislado.

Ejecutar nuevamente toda la suite.

---

# 49. Commits sugeridos

```text
feat(auth): persist login attempts with spring data jpa
feat(rate-limit): replace jdbc shared limiter with jpa persistence
refactor(security): cleanup rate limit state through jpa repositories
refactor(settings): remove legacy jdbc implementation
test(persistence): replace jdbc mocks with jpa repository tests

feat(session): move http sessions from jdbc to redis
chore(deps): remove spring-session-jdbc

chore(cleanup): remove obsolete jdbc code generators
chore(packaging): exclude logs and temporary artifacts

chore(database): add final schema baseline
chore(database): retire flyway runtime migrations

chore(database): remove obsolete jdbc session tables

chore(deps): upgrade spring boot supported line
```

---

# 50. Definición de terminado

La implementación se considera terminada cuando:

- [ ] `UserRepository`, `RoleRepository` y `UserIdentityRepository` siguen funcionando con JPA.
- [ ] `LoginAttemptService` no contiene JDBC.
- [ ] `SharedRateLimitService` no contiene JDBC.
- [ ] `SecurityCleanupJob` no contiene JDBC.
- [ ] `SiteSettingsService` no contiene código JDBC ni comentado.
- [ ] no existen scripts que generen `JdbcTemplate`.
- [ ] `ApplicationContextTest` no mockea JdbcTemplate.
- [ ] pruebas de rate limit no mockean JdbcTemplate.
- [ ] `spring-session-jdbc` fue eliminado.
- [ ] `spring.session.store-type=jdbc` fue eliminado.
- [ ] sesiones funcionan con Redis o con una estrategia explícita no JDBC.
- [ ] tablas de sesión JDBC dejaron de usarse.
- [ ] Flyway fue retirado del runtime.
- [ ] `db/migration` fue eliminado después de generar el schema final.
- [ ] `FlywayMigrationIntegrationTest` fue eliminado.
- [ ] `database/schema-final.sql` puede crear una BD limpia.
- [ ] Hibernate `ddl-auto=validate` pasa contra el schema final.
- [ ] no se usa `ddl-auto=update`.
- [ ] no hay `.env` en ZIP.
- [ ] no hay logs en ZIP.
- [ ] no hay JDBC explícito en código propio.
- [ ] PostgreSQL sigue siendo accesible exclusivamente mediante JPA/Hibernate.
- [ ] suite completa pasa.
- [ ] pruebas concurrentes de rate limit pasan.
- [ ] login/logout/OAuth pasan.
- [ ] staging pasa antes de producción.

---

# 51. Resultado arquitectónico esperado

Después de esta implementación, el backend tendrá una frontera clara:

```text
PostgreSQL = JPA/Hibernate
Redis      = sesiones efímeras
HTTP       = RestClient
Cache      = Caffeine
Security   = Spring Security
Schema     = schema-final.sql + validate
```

Sin:

```text
JdbcTemplate
Spring Session JDBC
DAOs JDBC
RowMapper
ResultSet
Flyway en runtime
migraciones versionadas ejecutándose al arrancar
código legacy JDBC
```

Esta es la arquitectura objetivo recomendada para cumplir el requisito planteado.
