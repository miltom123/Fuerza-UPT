---
name: fuerza-feature-development
description: Implementa nuevas funcionalidades backend de Fuerza UPT siguiendo el monolito modular por feature, JPA, seguridad existente, schema-final y la política de desarrollo sin tests. Úsala al agregar endpoints, casos de uso o módulos funcionales.
---

# Fuerza UPT — Feature Development

## Propósito

Crear funcionalidades nuevas sin introducir una arquitectura paralela ni ampliar deuda técnica legacy.

## Antes de modificar

1. Identifica el dominio real de la tarea.
2. Inspecciona el paquete del feature y sus entidades, repositorios, servicios, DTOs y controladores.
3. Busca endpoints/mappings existentes para el mismo recurso.
4. Busca servicios genéricos antiguos que ya implementen parcialmente la funcionalidad.
5. Decide cuál es el módulo canónico. Para nuevas features, prefiere un feature específico sobre `content/` o `AdminContentService`.
6. Lee `database/schema-final.sql` si habrá persistencia nueva.

## Estructura objetivo

```text
<feature>/
  controller/
  dto/
  service/
  entity/
  repository/
  model/       # solo si aporta valor
```

No crear carpetas vacías ni capas sin responsabilidad real.

## Orden de implementación

1. Define el contrato DTO.
2. Ajusta/crea Entity únicamente si existe persistencia real.
3. Crea o extiende `JpaRepository`.
4. Implementa el caso de uso en Service.
5. Define frontera `@Transactional` en Service, no en Controller.
6. Crea/ajusta Controller delgado.
7. Revisa `SecurityConfig` solo si la ruta realmente necesita una regla nueva.
8. Si es mutación administrativa, conserva auditoría e invalidación de caché.
9. Si cambia la BD, usa la skill `fuerza-schema-contract`.
10. Ejecuta la skill `fuerza-static-verification` al terminar.

## Reglas de Controller

Debe hacer principalmente:

- binding/validación de request;
- obtención del principal cuando corresponda;
- delegación al Service;
- construcción de respuesta HTTP.

No debe:

- manipular repositorios directamente salvo un caso excepcional ya establecido;
- contener reglas complejas;
- abrir transacciones;
- construir SQL;
- duplicar lógica del Service.

## Reglas de Service

- Expresa casos de uso, no CRUD genérico sin dominio.
- Normaliza inputs en un único lugar.
- Centraliza invariantes relacionadas.
- Usa excepciones de negocio existentes.
- Usa repositorios JPA.
- Conserva locking cuando haya concurrencia.
- Evita métodos gigantes; extrae helpers de dominio o servicios específicos.

## Decisión rápida

**¿Existe ya módulo específico?** Úsalo.

**¿Solo existe implementación en `AdminContentService`?** Para funcionalidad pequeña compatible, puedes tocarlo con mínima extensión; para nueva lógica relevante, crea servicio específico y comienza a retirar esa responsabilidad del genérico.

**¿La tarea requiere una nueva tabla/columna?** No crees migración. Activa `fuerza-schema-contract`.

**¿La ruta es pública y escribe datos?** Activa `fuerza-security` para revisar rate limit, privacidad y abuso.

## Política de pruebas

No crear ni ejecutar tests salvo solicitud explícita del usuario. La verificación por defecto es compilación sin tests + inspección estática.
