# Pruebas de carga

Las pruebas usan k6 y apuntan al frontend para incluir la caché de Next.js y el recorrido completo hacia Spring Boot.

Prueba rápida local:

```powershell
$env:SMOKE="true"
k6 run .\load-tests\public-read.js
```

Prueba completa en un ambiente aislado:

```powershell
$env:BASE_URL="https://staging.fuerzaupt.pe"
k6 run .\load-tests\public-read.js
```

No ejecutar el escenario completo contra producción sin revisar antes los límites del proveedor y Supabase.
