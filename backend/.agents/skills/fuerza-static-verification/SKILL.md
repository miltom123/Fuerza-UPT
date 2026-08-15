---
name: fuerza-static-verification
description: Verifica cambios backend de Fuerza UPT sin crear ni ejecutar pruebas: compila con tests omitidos y busca JDBC prohibido, Flyway, rutas duplicadas, residuos legacy, secretos y desalineación de schema. Úsala al finalizar cualquier implementación o refactor.
---

# Fuerza UPT — Static Verification (No Tests)

## Política

El usuario realiza las pruebas funcionales manualmente.

Esta skill NO debe:

- crear tests;
- modificar `src/test`;
- ejecutar `mvn test`, `verify` con tests, Testcontainers ni suites automáticas.

## 1. Compilación

Windows:

```powershell
.\mvnw.cmd -DskipTests compile
```

Unix:

```bash
./mvnw -DskipTests compile
```

Si Maven Wrapper necesita red y no puede descargar, informar la limitación; no inventar `BUILD SUCCESS`.

## 2. Gate cero JDBC explícito

Buscar en código propio y configuración:

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

Cualquier aparición activa debe considerarse regresión arquitectónica, excepto texto documental histórico que el usuario haya pedido conservar.

El driver `org.postgresql:postgresql` no es una infracción.

## 3. Gate sin migraciones runtime

Buscar:

```text
flyway
liquibase
V[0-9]+__
src/main/resources/db/migration
```

No introducir nuevas migraciones. Si cambia BD, `schema-final.sql` + DDL manual.

## 4. Rutas duplicadas

Inventariar Controllers modificados y buscar mappings equivalentes.

Prestar atención a convivencia entre:

```text
content/controller
project/controller
event/... específicos
admin/controller
```

No basta con comparar anotaciones individuales: combinar `@RequestMapping` de clase + mapping del método.

## 5. Legacy/residuos

Buscar cuando sea relevante:

```text
noticias
migrationStatus
originalSource
LEGACY JDBC
TODO migration
bridge temporal
```

No borrar automáticamente algo funcional; señalar y limpiar si es residuo confirmado.

## 6. Secrets y artefactos

Verificar que cambios/paquetes no agreguen:

```text
.env
*.log
target/
service keys
passwords
tokens
client secrets
```

No imprimir valores encontrados en el resumen; solo nombre de variable/archivo.

## 7. Schema

Si se tocó una Entity:

- comparar tabla/columnas/tipos/nullability con `database/schema-final.sql`;
- verificar PK, FK, UNIQUE, CHECK e índices relevantes;
- exigir DDL manual en el resumen.

## 8. Seguridad

Si se tocó Controller/Security/Auth:

- comprobar rol esperado;
- CSRF/CORS no debilitados;
- rate limiting en writes públicos;
- logs sin PII/secrets;
- session fixation/login no alterados accidentalmente.

## Informe final

Usar este formato:

```text
Compilación sin tests: PASS / FAIL / NO EJECUTADA
JDBC explícito: 0 / hallazgos
Migraciones runtime: 0 / hallazgos
Rutas duplicadas: 0 / hallazgos
Schema sincronizado: SÍ / NO / NO APLICA
Seguridad revisada: SÍ / NO APLICA
Tests creados/ejecutados: NO
Pendientes: ...
```
