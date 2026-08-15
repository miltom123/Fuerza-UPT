---
name: fuerza-media-supabase
description: Implementa almacenamiento y multimedia de Fuerza UPT con Supabase Storage, validación segura de uploads, assets públicos/privados y metadatos JPA. Úsala al modificar archivos, imágenes, buckets o endpoints media.
---

# Fuerza UPT — Media & Supabase

## Principios

- Metadatos relacionales: JPA/PostgreSQL.
- Binarios: Supabase Storage según la arquitectura vigente.
- Assets privados deben fallar cerrado.
- No introducir un fallback público silencioso para archivos privados.

## Upload seguro

Antes de aceptar:

1. validar que existe contenido;
2. validar límite de tamaño del endpoint;
3. validar content type permitido;
4. verificar firma real/magic bytes cuando el servicio actual lo soporte;
5. no confiar en extensión o nombre original;
6. generar nombre/key seguro y no predecible;
7. normalizar metadata persistida.

## Privacidad

- service role key solo backend;
- nunca retornarla ni loguearla;
- archivos privados requieren URL firmada/acceso controlado según implementación existente;
- production debe validar configuración obligatoria;
- no habilitar fallback local en producción sin solicitud explícita.

## Modelo JPA

Si modificas metadatos de `MediaAsset`:

- mantener nombres de columnas sincronizados con `schema-final.sql`;
- no reciclar nombres históricos (`file_path`, `public_url`, etc.) si la Entity canónica usa otros;
- activar `fuerza-schema-contract`.

## HTTP externo

- usar `RestClient`/cliente estándar del proyecto;
- mantener connect/read timeout explícitos;
- evitar llamadas largas dentro de transacciones JPA;
- distinguir claramente fallo de Storage de fallo de persistencia.

## Borrado/reemplazo

Analiza consistencia entre:

```text
DB metadata
Storage object
contenido que referencia el asset
```

No borrar un objeto compartido sin verificar referencias.

## Logs

No registrar:

- service role key;
- URLs firmadas completas si contienen credenciales/token;
- datos privados del archivo innecesariamente.

## Política de pruebas

No crear ni ejecutar tests. Compilar sin tests y realizar verificación estática de config, límites y schema.
