---
name: fuerza-jpa-persistence
description: Diseña y modifica persistencia PostgreSQL de Fuerza UPT exclusivamente con Spring Data JPA/Hibernate, incluyendo entidades, repositorios, JPQL, locking y transacciones. Úsala para cambios de datos, consultas o concurrencia.
---

# Fuerza UPT — JPA Persistence

## Principio central

Todo acceso relacional propio pasa por JPA/Hibernate.

Prohibido:

```text
JdbcTemplate
NamedParameterJdbcTemplate
JdbcClient
org.springframework.jdbc
java.sql.*
Connection
ResultSet
RowMapper
DriverManager
SQL ejecutado desde servicios
```

El driver PostgreSQL permanece como infraestructura interna de Hibernate.

## Entity

- Mapea explícitamente nombres que no coincidan con la convención.
- Usa tipos Java adecuados (`Instant`, `LocalDate`, `UUID`, enums con `EnumType.STRING`).
- Define `nullable`, `length` y relaciones de forma coherente con el schema.
- Evita `EAGER` por defecto en colecciones.
- Evita `CascadeType.ALL` si el ciclo de vida no es realmente dependiente.
- Mantén `@Version` cuando el recurso sea editable concurrentemente.
- No pongas lógica de infraestructura en la Entity.

## Repository

Preferir en este orden:

1. derived query;
2. JPQL con `@Query`;
3. `@EntityGraph` cuando resuelva N+1 de forma clara;
4. native query solo si JPA no puede expresar razonablemente la operación y el usuario acepta la excepción arquitectónica.

No usar JDBC como atajo.

## Transacciones

- `@Transactional` en Service/caso de uso.
- Lecturas complejas pueden usar `@Transactional(readOnly = true)`.
- No abrir transacciones en Controller.
- Evitar llamadas HTTP externas dentro de una transacción larga.
- Si un evento externo ocurre después de persistir, preferir ejecución AFTER_COMMIT cuando el patrón existente lo permita.

## Locking

### Recurso existente

Para serializar cambios sobre una fila existente:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("select x from Entity x where x.id = :id")
Optional<Entity> findForUpdate(...);
```

### Creación concurrente

`PESSIMISTIC_WRITE` no bloquea una fila que todavía no existe.

Si dos transacciones pueden crear la misma PK/unique:

1. conserva UNIQUE/PK en PostgreSQL;
2. usa una transacción corta de persistencia;
3. captura exclusivamente conflicto concurrente esperado;
4. reintenta con límite pequeño (normalmente 2–3);
5. cada retry debe abrir una transacción nueva;
6. nunca hacer retry infinito.

## Rate limiting

Para `LoginAttempt` y `RequestRateLimit`:

- conservar claves HMAC;
- conservar PK/unique que evita duplicados;
- locking JPA para actualización;
- manejar explícitamente carrera de primera inserción;
- cleanup mediante métodos `@Modifying` JPQL/repository;
- no volver a `INSERT ... ON CONFLICT` mediante JDBC.

## DTO y consultas

- No devolver Entities desde APIs.
- Evita cargar grafos enormes para convertirlos luego a DTO.
- Para listados, usar paginación cuando el volumen pueda crecer.
- Cuidado con N+1: revisar relaciones usadas por cada mapper.

## Cambio de modelo

Cada cambio de Entity que afecte DDL obliga a usar `fuerza-schema-contract`.

## Verificación

No crear tests. Al finalizar:

- compilar sin tests;
- buscar imports JDBC prohibidos;
- revisar Entity ↔ `schema-final.sql`;
- explicar locking/transacción elegidos.
