# AUDITORÍA COMPLETA POST-CONSOLIDACIÓN
# Fuerza UPT — Backend y Frontend
# Documento de re-verificación para Antigravity, previo a continuar la migración JPA

**Ruta única de trabajo confirmada:** `D:\ProyectoWebFuerzaUPT`
**Ruta descartada (NO TOCAR, solo respaldo):** `D:\ProyectoWebFuerzaUPT_DESCARTAR`
**Fecha de esta auditoría:** 03/08/2026
**Motivo:** ver sección 0.

---

## 0. Por qué existe este documento — léelo completo antes de tocar nada

Este proyecto tuvo un incidente serio que este documento existe para cerrar de una vez:

1. **Se reportó la Fase 3 (migración de persistencia) como "completada y verificada al 100%"**, con `mvn test` en verde y `BUILD SUCCESS`, sin que el archivo de migración (`V25`/`V26__reconcile_project_satellite_tables.sql`) existiera realmente en disco.
2. **Se reportó la Sub-fase A de la migración JPA (módulo `settings`) como completada**, con "23/23 PASSED" y "3 repositorios JPA detectados", cuando en realidad las clases se habían creado en una carpeta distinta (`D:\FuerzaUPT`) a la que el usuario estaba verificando (`D:\ProyectoWebFuerzaUPT`).
3. Se descubrió que **existían dos copias del proyecto en el disco D:**, ambas con `.git`, ambas con el mismo commit único inicial de `create-next-app` y **sin ningún commit real de progreso** desde entonces — es decir, el control de versiones nunca se usó de verdad como red de seguridad durante las Fases 1, 2, 3 ni la Sub-fase A.
4. Ya se resolvió la confusión de carpetas: se hizo backup, se renombró `D:\FuerzaUPT` → `D:\ProyectoWebFuerzaUPT` (la vieja pasó a `_DESCARTAR`), se limpió `.gitignore` (logs, `public/uploads/`), y se hizo **el primer commit real del proyecto**.

**Lo que esto significa: ningún reporte de fase anterior a este documento debe darse por válido sin volver a verificarlo aquí, con evidencia cruda.** No se trata de desconfiar por desconfiar — se trata de que ya ocurrió dos veces que un reporte de éxito no correspondía a la realidad del disco, y ambas veces habría sido invisible sin que el usuario mismo abriera el explorador de archivos.

---

## 1. Regla fundamental para este documento y todo lo que sigue

**Ninguna afirmación de este documento, ni de ningún reporte futuro, se acepta sin evidencia cruda adjunta.** Evidencia cruda significa:

- La salida literal de `dir`, `ls`, `Get-ChildItem`, o `Test-Path` — no un resumen en prosa de lo que "debería" mostrar.
- La salida literal del log de arranque del backend — no "arrancó sin problemas".
- La salida literal de `mvn test` / `mvn verify` — no solo el número final de tests.
- La ruta absoluta completa (`pwd` / `Get-Location`) al inicio de cualquier bloque de comandos, para que quede claro sobre qué carpeta se ejecutó.

Si Antigravity no puede producir esa evidencia cruda para una afirmación, debe decir explícitamente "no verificado" en vez de inferir o asumir un resultado.

---

## 2. Paso 1 — Confirmar la ruta de trabajo (obligatorio, primero que todo)

Antes de auditar nada, ejecutar y mostrar la salida completa de:

```powershell
Get-Location
Test-Path D:\ProyectoWebFuerzaUPT
Test-Path D:\FuerzaUPT
```

Se espera: la ruta activa sea `D:\ProyectoWebFuerzaUPT` (o una subcarpeta de ella), el primer `Test-Path` sea `True`, y el segundo sea `False` (esa carpeta ya no debería existir con ese nombre). Si algo de esto no coincide, **detenerse aquí** y reportarlo antes de continuar — no seguir auditando sobre una ruta incierta.

---

## 3. Paso 2 — Re-auditoría de cada fase previamente declarada como completada

Para cada fase, ejecutar los comandos de verificación y reportar el resultado real, sin asumir nada de reportes anteriores.

### Fase 1 — Newsletter y oportunidades públicas

```powershell
Select-String -Path "D:\ProyectoWebFuerzaUPT\frontend\src\**\*.ts*" -Pattern "setTimeout" -List | Select-Object Path
```
Confirmar que el newsletter no vuelve a simular éxito con `setTimeout` sin llamar al backend (era el hallazgo original de Fase 1). Si aparece, investigar si es una regresión.

### Fase 2 — Contratos API canónicos

```powershell
Test-Path "D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt\admin\dto\AdminStatusResponse.java"
Test-Path "D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt\auth\dto\CsrfTokenResponse.java"
Test-Path "D:\ProyectoWebFuerzaUPT\frontend\src\app\administracion\noticias\page.tsx"
Select-String -Path "D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt\admin\controller\AdminModuleController.java" -Pattern "oportunidades"
```
El último comando debe devolver **vacío** — confirma que `oportunidades` ya no está en el patrón de ruta del controlador genérico (hallazgo H1 de la Fase 2). Si devuelve algo, la corrección no se aplicó o se revirtió.

### Fase 3 — Migración V26 y persistencia

```powershell
Get-ChildItem "D:\ProyectoWebFuerzaUPT\backend\src\main\resources\db\migration\" | Sort-Object Name | Select-Object -Last 5
```
Confirmar visualmente: ¿existe `V26__reconcile_project_satellite_tables.sql`? ¿O sigue siendo `V25__normalize_informational_opportunities.sql` la última, como se descubrió la primera vez que se auditó esto? **Reportar el nombre exacto del último archivo, tal cual aparece.**

Si `V26` existe:
```powershell
Get-Content "D:\ProyectoWebFuerzaUPT\backend\src\main\resources\db\migration\V26__reconcile_project_satellite_tables.sql"
```
Confirmar que el contenido coincide con lo acordado (columnas `media_asset_id`/`alternative_text` en `project_gallery`, constraints `CHECK (display_order >= 0)` en las 4 tablas satélite, `image_url` conservada, `description` conservada como `TEXT`).

Luego, arrancar el backend real (no solo `mvn test`) y pegar el log completo de la sección de Flyway al arranque.

### Sub-fase A de migración JPA — `settings`

```powershell
Get-ChildItem "D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt\settings\" -Recurse
```
Confirmar que aparecen `entity\SiteSettings.java` y `repository\SiteSettingsRepository.java` **en esta ruta, en esta carpeta, ahora**, después de la consolidación. Si no aparecen, la Sub-fase A no sobrevivió al renombrado y hay que rehacerla desde cero (revisando primero si el trabajo se perdió o si quedó en algún backup).

Si existen, mostrar su contenido completo con `Get-Content` para confirmar que coincide con lo reportado anteriormente (clave primaria `Boolean`, `@Version Long version`, sin extender `AuditableEntity` dado que `site_settings` no tiene columna `created_at`).

---

## 4. Paso 3 — Inventario actualizado de JDBC restante

El plan de migración (`PLAN_MIGRACION_JDBC_A_JPA.md`) se basó en un inventario tomado antes de todo este incidente. Antes de continuar con la Sub-fase B, regenerar el inventario para confirmar que sigue siendo válido:

```powershell
cd D:\ProyectoWebFuerzaUPT\backend\src\main\java\pe\edu\upt\fuerzaupt
Get-ChildItem -Recurse -Filter *.java | Select-String -Pattern "JdbcTemplate" -List | Group-Object Path | Select-Object Name, Count
```

Comparar el resultado contra la tabla de la Sección 1 de `PLAN_MIGRACION_JDBC_A_JPA.md`. Si `settings/service/SiteSettingsService.java` ya no aparece en esta lista (porque se migró), eso es una señal positiva adicional de que la Sub-fase A sí se completó de verdad. Si aparecen archivos nuevos que no estaban en el inventario original, o si alguno desapareció sin explicación, reportarlo.

---

## 5. Paso 4 — Estado de Git

```powershell
cd D:\ProyectoWebFuerzaUPT\frontend
git log --oneline -10
git status
```

Confirmar que existe el commit de consolidación reciente (no solo el commit único de `create-next-app` de antes), y que `git status` está limpio o con cambios esperados únicamente.

Repetir para el backend si en algún momento se inicializa Git ahí (actualmente el backend no tiene su propio repositorio independiente, según la línea base original — confirmar si eso sigue siendo así o si cambió):

```powershell
cd D:\ProyectoWebFuerzaUPT\backend
git status
```

---

## 6. Salida esperada de esta auditoría

Al terminar, generar `docs/execution/AUDITORIA_POST_CONSOLIDACION_REPORT.md` con esta estructura, **cada sección con la evidencia cruda pegada, no un resumen**:

```md
# Auditoría post-consolidación

## Paso 1 — Ruta de trabajo confirmada
(pegar salida real)

## Paso 2 — Estado real de cada fase
### Fase 1
### Fase 2
### Fase 3 (V26)
### Sub-fase A (settings)

## Paso 3 — Inventario JDBC actualizado
(tabla comparativa: inventario original vs. actual)

## Paso 4 — Estado de Git

## Discrepancias encontradas entre lo reportado antes y la realidad actual
(lista explícita, una por una, sin suavizarlas)

## Estado real desde el cual se debe continuar
(qué está genuinamente hecho, qué falta, qué hay que rehacer)

## Decisión: LISTO_PARA_SUBFASE_B | HAY_QUE_REHACER_SUBFASE_A | OTRO (especificar)
```

---

## 7. Reglas no negociables para esta auditoría y para todo lo que siga

- No declarar nada como "confirmado" sin la salida cruda del comando correspondiente pegada en el reporte.
- No inferir el contenido de un archivo a partir de lo que "debería" tener según un plan — leerlo y pegarlo.
- No continuar con la Sub-fase B de la migración JPA hasta que este documento esté resuelto y el usuario haya dado su visto bueno explícito sobre el reporte de auditoría.
- Si se encuentra que algo reportado antes como completado no lo está, **decirlo directamente, sin reformular la pregunta ni minimizarlo** — la sección "Discrepancias encontradas" existe exactamente para eso.
- Cualquier comando que se ejecute debe mostrar primero la ruta activa (`Get-Location` o `pwd`) para que quede trazable sobre qué carpeta se corrió.

---

## 8. Prompt copiable para Antigravity

```text
Trabaja en D:\ProyectoWebFuerzaUPT — confirma esta ruta con Get-Location
antes de cualquier otra acción.

Especificación principal de esta sesión:
AUDITORIA_COMPLETA_POST_CONSOLIDACION.md

Contexto adicional obligatorio:
PLAN_MIGRACION_JDBC_A_JPA.md
FASE_3_PERSISTENCIA_MIGRACIONES_PROMPT_ANTIGRAVITY.md
FASE_2_CONTRATOS_API_PROMPT_ANTIGRAVITY.md
AGENTS.md

REGLAS
1. No asumas que ninguna fase anterior está completa. Verifica cada una con los
   comandos exactos de la sección 3 de este documento y pega la salida cruda.
2. No resumas resultados de comandos en prosa — pega la salida literal.
3. Antes de cualquier bloque de comandos, muestra la ruta activa con Get-Location.
4. Si algo reportado como completado en el pasado no existe en disco ahora,
   dilo explícitamente en la sección "Discrepancias encontradas" del reporte,
   sin suavizarlo ni reformularlo como otra cosa.
5. No toques D:\ProyectoWebFuerzaUPT_DESCARTAR bajo ninguna circunstancia.
6. No inicies la Sub-fase B de la migración JPA (módulo audit) hasta que el
   usuario apruebe explícitamente el reporte de esta auditoría.
7. Genera docs/execution/AUDITORIA_POST_CONSOLIDACION_REPORT.md con el
   formato de la sección 6 de este documento.
8. Termina con una decisión explícita: LISTO_PARA_SUBFASE_B,
   HAY_QUE_REHACER_SUBFASE_A, u OTRO especificando qué.

COMIENZA con el Paso 1 (confirmar ruta de trabajo) antes de tocar
cualquier otro archivo o ejecutar cualquier otro comando.
```
