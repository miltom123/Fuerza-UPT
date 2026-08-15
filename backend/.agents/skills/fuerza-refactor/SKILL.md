---
name: fuerza-refactor
description: Refactoriza Fuerza UPT sin cambiar contratos funcionales, eliminando duplicados, servicios genéricos legacy, rutas paralelas y residuos de migración/JDBC. Úsala para limpieza arquitectónica y extracción gradual por módulos.
---

# Fuerza UPT — Refactor

## Objetivo

Reducir deuda sin hacer reescrituras masivas.

El destino es un monolito modular por feature.

## Antes de mover código

1. Busca todas las referencias del componente.
2. Identifica endpoints y contratos DTO que deben conservarse.
3. Identifica caché, auditoría, seguridad y transacciones asociadas.
4. Comprueba si existen dos implementaciones del mismo caso de uso.
5. Elige una implementación canónica antes de borrar.

## Prioridades actuales

Cuando sean relevantes:

- retirar endpoints duplicados entre `content/` y módulos específicos;
- extraer responsabilidades de `AdminContentService`;
- eliminar `noticias` y aliases muertos;
- eliminar campos/residuos de migración sin uso;
- eliminar scripts generadores obsoletos;
- eliminar logs/artefactos temporales del repositorio;
- mantener cero JDBC explícito.

## Estrategia Strangler dentro del monolito

Para sacar una feature de un servicio genérico:

1. crea/usa servicio específico;
2. redirige Controller al servicio específico;
3. conserva contrato HTTP;
4. mueve reglas e invariantes;
5. mueve caché/auditoría correspondiente;
6. elimina la rama genérica cuando ya no tenga consumidores;
7. elimina imports, DTOs/helpers muertos.

No mantener dos fuentes de verdad “por seguridad”.

## No hacer

- no reescribir todo el backend;
- no crear microservicios;
- no cambiar schema si no es necesario;
- no cambiar endpoints públicos sin necesidad;
- no introducir abstracciones genéricas solo para reducir líneas;
- no convertir cada Service en interfaz si no existe necesidad real.

## Duplicación de rutas

Antes y después del refactor buscar:

```text
@GetMapping
@PostMapping
@PutMapping
@PatchMapping
@DeleteMapping
@RequestMapping
```

y comprobar paths efectivos.

Un mismo método+path debe tener un único handler.

## Persistencia

No regresar a JDBC durante refactor. Si hay cambio de Entity, usar `fuerza-schema-contract`.

## Política de pruebas

No crear ni ejecutar tests. Preservar código de `src/test` salvo solicitud. Compilar sin tests y ejecutar verificaciones estáticas.
