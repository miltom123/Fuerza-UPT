# Antigravity — Fuerza UPT Backend

Este paquete contiene customizaciones de workspace para orientar a Antigravity al desarrollo del backend Fuerza UPT.

## Contenido

```text
.agents/
  rules/
    fuerza-upt-architecture.md
  skills/
    fuerza-feature-development/
    fuerza-jpa-persistence/
    fuerza-schema-contract/
    fuerza-security/
    fuerza-admin-module/
    fuerza-media-supabase/
    fuerza-refactor/
    fuerza-static-verification/
  workflows/
    new-backend-feature.md
    refactor-backend-module.md
    database-change.md
```

## Instalación

Copia la carpeta `.agents` a la raíz del repositorio backend.

Los Skills de workspace son detectados desde `.agents/skills/<skill>/SKILL.md`.

### Rule

En Antigravity abre **Customizations → Rules** y confirma/crea la rule de workspace `fuerza-upt-architecture.md`. Configúrala como **Always On**.

La rule contiene las restricciones innegociables: JPA-only, sin JDBC explícito, sin migraciones runtime, monolito modular, no tests automáticos, seguridad y schema-final.

### Skills

Antigravity decide automáticamente cuándo cargar cada skill según su `description`. También puedes mencionarla por nombre en el prompt.

Ejemplos:

```text
Usa fuerza-feature-development para agregar...
Usa fuerza-schema-contract para este cambio de entidad...
Usa fuerza-refactor para separar este módulo...
```

### Workflows

Los archivos incluidos son plantillas de workflows de workspace. Si tu versión de Antigravity no los registra automáticamente desde el directorio del proyecto, créalos desde **Customizations → Workflows → + Workspace** pegando el contenido del archivo correspondiente.

Una vez registrados se usan como slash commands, por ejemplo:

```text
/new-backend-feature
/refactor-backend-module
/database-change
```

## Política de pruebas

Estas customizaciones respetan la decisión del proyecto:

```text
NO crear tests automáticamente
NO modificar src/test
NO ejecutar tests
SÍ compilar con -DskipTests
SÍ hacer verificaciones estáticas
```

Si en una tarea puntual quieres tests, debes pedirlos explícitamente.

## Recomendación de uso

Para desarrollo cotidiano usa `/new-backend-feature` o pide la feature normalmente. La rule Always On mantiene las restricciones permanentes y los skills se activan según la tarea.
