# Database Change — Fuerza UPT

## Descripción

Flujo para modificar el modelo PostgreSQL/JPA sin Flyway, Liquibase ni JDBC explícito.

## Pasos

1. Activa `fuerza-jpa-persistence` y `fuerza-schema-contract`.
2. Inspecciona Entity actual, Repository y tabla correspondiente en `database/schema-final.sql`.
3. Define el estado final deseado del modelo.
4. Implementa cambios JPA.
5. Actualiza `schema-final.sql` para una base nueva.
6. Genera DDL manual separado para la base existente.
7. Si existen datos, define backfill y orden seguro; no ejecutes cambios destructivos automáticamente.
8. Revisa FK, UNIQUE, CHECK, índices, nullability y tipos.
9. No crees archivos Vxx, migraciones Java ni dependencias Flyway/Liquibase.
10. No uses `ddl-auto=update`.
11. No crees ni ejecutes tests.
12. Ejecuta compilación con tests omitidos y revisión estática Entity ↔ schema.
13. Entrega el DDL al usuario para aplicación manual.
