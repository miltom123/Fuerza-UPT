---
name: fuerza-schema-contract
description: Mantiene sincronizado el contrato entre entidades JPA y database/schema-final.sql sin Flyway ni Liquibase, y produce DDL manual seguro para la base existente. Úsala ante cualquier cambio de tabla, columna, constraint, índice o seed.
---

# Fuerza UPT — Schema Contract

## Contexto

Fuerza UPT no usa migraciones runtime. `database/schema-final.sql` es el baseline reproducible y Hibernate debe mantenerse con `ddl-auto=validate`.

## Regla

Un cambio de persistencia no está terminado si solo cambia Java.

Debe contemplar simultáneamente:

```text
Entity JPA
Repository/consulta
schema-final.sql
DDL manual para BD existente
compatibilidad de datos
```

## Proceso obligatorio

1. Identifica tabla y entidades afectadas.
2. Compara todos los mappings relevantes:
   - tabla;
   - PK;
   - columnas;
   - tipo SQL;
   - nullable;
   - longitud;
   - enum/check;
   - FK;
   - unique;
   - índice;
   - default;
   - `@Version`.
3. Actualiza `database/schema-final.sql` para representar el estado FINAL, no una secuencia histórica.
4. Produce un bloque DDL manual separado para actualizar la base existente.
5. Si hay datos existentes, define backfill/orden seguro.
6. Si el cambio es destructivo, no lo ejecutes automáticamente; informa riesgo y propone estrategia expand/contract.

## Prohibiciones

- No crear `Vxx__*.sql`.
- No introducir Flyway/Liquibase.
- No usar `ddl-auto=update`.
- No generar schema únicamente desde H2.
- No asumir que un schema viejo coincide con las Entities.
- No borrar tabla/columna con datos sin análisis explícito.

## Tipos

Verifica especialmente:

- `UUID` ↔ `UUID`;
- `Long` ↔ `BIGINT`;
- `Instant` ↔ `TIMESTAMPTZ`;
- `LocalDate` ↔ `DATE`;
- `LocalTime` ↔ `TIME`;
- enum STRING ↔ `VARCHAR` + `CHECK` cuando sea útil;
- boolean ↔ `BOOLEAN`.

Nunca mezclar por accidente `LocalDate` con `TIMESTAMPTZ`.

## Integridad

El schema final debe preservar defensas de base:

- PK;
- FK;
- UNIQUE;
- NOT NULL;
- CHECK;
- índices relevantes.

La validación Java no sustituye constraints de PostgreSQL.

## Seeds necesarios

Revisa si una base vacía necesita datos mínimos como roles o singleton settings.

No escondas seeds en un Service genérico. Documenta claramente qué datos base necesita el sistema.

## Formato de salida al usuario

Cuando cambies schema, incluye al final:

```markdown
### Cambio de base de datos
- Tabla(s): ...
- Compatibilidad: ...

### DDL manual
```sql
ALTER TABLE ...;
```

### Actualización de schema-final
- ...

### Riesgo / backfill
- ...
```

## Verificación

Sin tests automáticos. Realiza inspección estática de Entity ↔ SQL y compilación sin tests cuando sea posible.
