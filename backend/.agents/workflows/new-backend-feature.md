# New Backend Feature — Fuerza UPT

## Descripción

Flujo para implementar una nueva funcionalidad backend respetando arquitectura modular, JPA, schema final y política sin tests.

## Pasos

1. Lee la regla Always On de Fuerza UPT y resume internamente las restricciones que afectan la tarea.
2. Identifica el feature dueño del cambio; no uses `content/` o `AdminContentService` como destino por defecto.
3. Busca implementaciones, endpoints y DTOs existentes para evitar duplicados.
4. Activa `fuerza-feature-development`.
5. Si hay persistencia, activa `fuerza-jpa-persistence`.
6. Si cambia Entity/tabla/constraint, activa `fuerza-schema-contract` y prepara DDL manual; no crees migraciones.
7. Si hay auth, endpoint público de escritura, upload o datos personales, activa `fuerza-security`.
8. Si es una mutación administrativa, activa `fuerza-admin-module`.
9. Implementa únicamente archivos necesarios para la feature.
10. No crees ni modifiques tests.
11. No ejecutes tests.
12. Ejecuta `fuerza-static-verification`: compilación con `-DskipTests` + análisis estático.
13. Entrega resumen de archivos, arquitectura, seguridad, cambio de schema/DDL y pendientes.
