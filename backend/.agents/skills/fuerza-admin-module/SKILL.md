---
name: fuerza-admin-module
description: Implementa operaciones administrativas de Fuerza UPT con servicios de dominio específicos, autorización ADMIN, auditoría, publicación, optimistic locking e invalidación de caché. Úsala para CRUD/admin de proyectos, eventos, equipo, representación u otros módulos.
---

# Fuerza UPT — Admin Module

## Dirección arquitectónica

Las nuevas operaciones administrativas deben vivir en el módulo específico del dominio, no ampliar indefinidamente `AdminContentService`.

Preferir:

```text
project/controller/AdminProjectController
project/service/ProjectAdminService
```

sobre nuevas ramas genéricas en:

```text
admin/service/AdminContentService
```

## Flujo de mutación

```text
Admin Controller
   ↓
Domain Admin Service
   ↓
validación de transición/invariantes
   ↓
JpaRepository
   ↓
auditoría
   ↓
cache invalidation / revalidation
```

## Controller

- rutas administrativas coherentes;
- DTO validado;
- no repository directo;
- no reglas de publicación;
- delegar usuario actor al service/audit cuando el patrón existente lo requiera.

## Service

- define transiciones válidas;
- evita publicar datos incompletos;
- usa `@Version`/locking ya definido;
- conserva campos de auditoría;
- no mezcla lógica de otros módulos.

## Publicación

Antes de permitir publish, validar todos los campos requeridos por el dominio.

Ejemplos ya existentes que deben inspirar la consistencia, no copiarse ciegamente:

- eventos: modo de inscripción coherente;
- representación: `LOGRADO` exige resultado;
- proyectos: estados y contenido público coherentes.

## Auditoría

Para cambios relevantes conservar registro de:

```text
CREATE
UPDATE
PUBLISH
UNPUBLISH
ARCHIVE
RESTORE
DELETE lógico si existe
```

No colocar secretos o PII innecesaria en `before/after`.

## Caché

- canonicalizar módulo antes de invalidar;
- no inventar nuevos aliases sin registrarlos en la fuente canónica;
- mutación pública visible debe invalidar caché correspondiente;
- no reintroducir `noticias`.

## Legacy

Si una operación ya fue extraída a servicio específico, elimina o deja de usar la rama equivalente del servicio genérico para evitar dos fuentes de verdad.

Antes de crear un nuevo admin endpoint, busca mapping duplicado.

## Datos

Si el admin introduce campos nuevos, activa `fuerza-schema-contract`.

## Política de pruebas

No crear ni ejecutar tests. Compilar sin tests y usar `fuerza-static-verification`.
