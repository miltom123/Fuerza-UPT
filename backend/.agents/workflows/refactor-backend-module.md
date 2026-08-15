# Refactor Backend Module — Fuerza UPT

## Descripción

Flujo para limpiar o extraer un módulo sin cambiar funcionalidad ni crear una segunda arquitectura.

## Pasos

1. Activa `fuerza-refactor`.
2. Inventaría controllers, services, repositories, entities, DTOs y referencias del módulo.
3. Identifica implementaciones duplicadas entre capa genérica y módulo específico.
4. Define explícitamente cuál será la implementación canónica.
5. Conserva contrato HTTP salvo que el usuario pida cambiarlo.
6. Mueve reglas de negocio al Service específico.
7. Mantén JPA; nunca uses JDBC para simplificar el refactor.
8. Conserva seguridad, auditoría, cache invalidation y locking.
9. Si cambia schema, activa `fuerza-schema-contract`.
10. Elimina código muerto una vez que no haya consumidores; no mantengas dos fuentes de verdad.
11. No crees ni ejecutes tests.
12. Ejecuta `fuerza-static-verification`.
13. Informa qué legacy fue eliminado y qué deuda queda.
