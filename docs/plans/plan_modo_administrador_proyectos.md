# Plan de implementación --- Modo Administrador del proyecto

## 1. Objetivo general

Completar el **modo administrador** para que cada proyecto pueda
editarse de forma integral desde un panel de administración y que todos
los cambios se reflejen automáticamente en la vista pública del
proyecto.

La regla principal será:

> **Todo dato visible en la página pública debe poder ser creado,
> editado, reemplazado, ordenado o eliminado desde el modo
> administrador, incluyendo todas las fotografías.**

La interfaz pública mostrada en la referencia contiene información
distribuida en tres zonas:

-   **Columna izquierda:** información general del proyecto y
    evidencias.
-   **Columna central:** descripción, impacto, problemática, etapas de
    trabajo, colaboración y resultados.
-   **Columna derecha:** galería vertical de fotografías.

------------------------------------------------------------------------

# 2. Mapa de elementos que deben ser administrables

## 2.1. Información general del proyecto

El administrador debe poder modificar:

-   Estado del proyecto:
    -   EN EJECUCIÓN
    -   FINALIZADO
    -   PENDIENTE
    -   PAUSADO
-   Nombre del proyecto.
-   Subtítulo o tipo de iniciativa.
-   Texto corto adicional.
-   Fecha de inicio.
-   Fecha de cierre.
-   Responsable(s).
-   Aliado(s).
-   Número de beneficiarios.
-   Resultado clave.
-   Imagen principal.
-   Fotografías de la galería principal.
-   Orden de las fotografías.

### Ejemplo

La tarjeta izquierda actualmente muestra:

``` text
EN EJECUCIÓN

Gato con acceso a internet

Iniciativa institucional Fuerza UPT

xd

PERIODO
2026-08-04

RESPONSABLES
Miltom, Mondongo

ALIADOS
UNJBG

BENEFICIARIOS
450

RESULTADO CLAVE
Responsabilidad
```

Todos estos valores deben provenir de la base de datos y no estar
escritos directamente en el código de la interfaz.

------------------------------------------------------------------------

# 3. Gestión de fotografías

Esta debe ser una de las partes prioritarias.

## 3.1. El administrador debe poder

Para cada proyecto:

-   Subir una fotografía.
-   Reemplazar una fotografía.
-   Eliminar una fotografía.
-   Ver una previsualización.
-   Cambiar el orden.
-   Seleccionar la fotografía principal.
-   Seleccionar fotografías para la galería.
-   Agregar varias fotografías.
-   Identificar qué fotografía aparece en cada sección.

## 3.2. Tipos de fotografías

Se recomienda manejar un campo `tipo` o equivalente.

Ejemplo:

``` text
PORTADA
GALERIA_PRINCIPAL
EVIDENCIA
GALERIA_LATERAL
```

Sin embargo, si una misma fotografía puede aparecer en varias
ubicaciones, es mejor manejar relaciones entre proyecto y fotografías en
lugar de duplicar archivos.

## 3.3. Información mínima de una fotografía

Cada fotografía debería almacenar:

``` text
id
proyecto_id
url / ruta
nombre_original
titulo
descripcion
tipo
orden
es_principal
fecha_creacion
```

Opcionalmente:

``` text
alt_text
ancho
alto
tamaño
```

------------------------------------------------------------------------

# 4. Galería principal

La tarjeta izquierda contiene una galería con:

-   Imagen grande.
-   Botones anterior/siguiente.
-   Miniaturas.
-   Indicador `2 / 3`.
-   Botón para ampliar.

El administrador debe poder configurar:

``` text
Fotografía 1
Fotografía 2
Fotografía 3
Fotografía 4
...
```

El orden guardado debe ser exactamente el orden mostrado públicamente.

### Funcionalidad recomendada

En administración:

``` text
[ + Agregar fotografía ]

┌──────────────────────────┐
│        FOTO 1            │
│                          │
└──────────────────────────┘
Orden: 1
[Principal] [Editar] [Eliminar]

┌──────────────────────────┐
│        FOTO 2            │
│                          │
└──────────────────────────┘
Orden: 2
[Editar] [Eliminar]
```

Idealmente permitir **arrastrar y soltar** para modificar el orden.

------------------------------------------------------------------------

# 5. Información: ¿De qué trata este proyecto?

Debe existir un formulario administrativo para editar:

### Título

``` text
¿De qué trata este proyecto?
```

El título debería ser editable aunque inicialmente tenga ese valor.

### Descripción

Ejemplo:

``` text
El proyecto busca fomentar la conciencia ambiental mediante
la educación, el trabajo comunitario y campañas de sensibilización...
```

Debe ser un campo de texto multilínea.

### Impacto principal

Debe poder modificarse:

``` text
Título: Impacto principal

Descripción:
un gato en la computadora se ve bacano
```

No colocar este contenido directamente en el frontend.

------------------------------------------------------------------------

# 6. Problemática atendida

Crear un apartado administrativo:

``` text
Problemática atendida

[ textarea ]

[Guardar]
```

Debe permitir editar:

-   Título.
-   Descripción.

Si en el futuro se quiere permitir varias problemáticas, se puede
convertir en una lista:

``` text
+ Agregar problemática
```

Pero para la primera versión basta con una problemática principal.

------------------------------------------------------------------------

# 7. ¿Cómo se trabajó el proyecto?

Este bloque debe ser completamente configurable.

Actualmente contiene cuatro etapas:

1.  Diagnóstico inicial.
2.  Planificación.
3.  Ejecución.
4.  Evaluación de impacto.

El administrador debe poder modificar cada una.

## 7.1. Campos por etapa

Cada etapa debe tener:

``` text
Número
Título
Descripción
Orden
Estado
```

Ejemplo:

``` text
ETAPA 1

Título:
Diagnóstico inicial

Descripción:
Identificamos las principales problemáticas ambientales...
```

## 7.2. Administración de etapas

Crear:

``` text
[ + Nueva etapa ]
```

Cada etapa debería tener:

``` text
[Editar]
[Eliminar]
[↑]
[↓]
```

De esta forma no se limita el sistema a cuatro etapas.

------------------------------------------------------------------------

# 8. Trabajo colaborativo

El bloque amarillo también debe ser administrable.

Campos:

``` text
Título
Descripción
```

Ejemplo:

``` text
Título:
Trabajo colaborativo

Descripción:
Este proyecto fue posible gracias al compromiso de la comunidad,
aliados y voluntarios.
```

Opcionalmente permitir activar/desactivar este bloque:

``` text
[✓] Mostrar trabajo colaborativo
```

------------------------------------------------------------------------

# 9. Resultados e impacto alcanzado

Esta sección debe ser editable desde administración.

Actualmente existen cuatro indicadores:

``` text
450
Personas beneficiadas

12
Actividades realizadas

2.5
Toneladas de impacto

98%
Meta de impacto
```

Cada indicador debería ser independiente.

## 9.1. Campos por indicador

``` text
Icono
Valor
Título
Descripción
Porcentaje de variación
Texto de variación
Orden
Activo
```

Ejemplo:

``` text
Valor:
450

Título:
Personas beneficiadas

Variación:
+35%

Texto:
vs meta
```

## 9.2. Indicadores dinámicos

No asumir que siempre existirán cuatro indicadores.

El administrador debería poder:

``` text
+ Agregar indicador
```

y tener:

``` text
[Editar] [Eliminar]
```

Esto permitirá reutilizar el sistema para otros proyectos.

------------------------------------------------------------------------

# 10. Progreso general del proyecto

La barra inferior:

``` text
Progreso general del proyecto

████████████████████ 98%
```

también debe ser administrable.

Campo:

``` text
progreso: 0 - 100
```

Validación:

``` text
mínimo = 0
máximo = 100
```

La interfaz pública debe calcular automáticamente el ancho de la barra a
partir de ese valor.

------------------------------------------------------------------------

# 11. Evidencias del proyecto

En la columna izquierda aparece:

``` text
Evidencias del proyecto

Fotografías y registro visual de las actividades ejecutadas
en este proyecto.

3 foto(s)
```

Este apartado debe tener su propio administrador de imágenes.

El administrador debe poder:

-   Agregar evidencia.
-   Reemplazar evidencia.
-   Eliminar evidencia.
-   Ordenar evidencias.
-   Agregar descripción.
-   Agregar título.
-   Definir fotografía destacada.

Ejemplo:

``` text
EVIDENCIAS

[ + Agregar fotografía ]

┌────────────┐
│   FOTO     │
└────────────┘
Título: Campaña de limpieza
Descripción: Actividad realizada...
[Editar] [Eliminar]
```

------------------------------------------------------------------------

# 12. Galería lateral derecha

Este es un cambio importante respecto de la versión anterior.

La columna derecha debe contener **únicamente fotografías**, sin
noticias, textos ni tarjetas de proyectos relacionados.

La estructura será:

``` text
┌─────────────────────┐
│                     │
│      FOTO 1         │
│                     │
└─────────────────────┘

┌─────────────────────┐
│                     │
│      FOTO 2         │
│                     │
└─────────────────────┘

┌─────────────────────┐
│                     │
│      FOTO 3         │
│                     │
└─────────────────────┘
```

## Administración

Crear un bloque:

``` text
Galería lateral
```

Con:

``` text
[ + Agregar fotografía ]
```

Cada fotografía:

``` text
[Previsualización]

Orden: 1

[Editar]
[Reemplazar]
[Eliminar]
```

El administrador debe controlar completamente cuáles imágenes aparecen
ahí.

------------------------------------------------------------------------

# 13. Regla importante para las fotografías

No conviene guardar las fotografías directamente dentro de los
componentes de React/Vue/etc. ni escribir rutas manualmente en el
código.

Evitar:

``` javascript
const images = [
  "/images/foto1.jpg",
  "/images/foto2.jpg",
  "/images/foto3.jpg"
];
```

En su lugar:

``` javascript
const images = project.gallery;
```

La información debe llegar desde la base de datos/API.

------------------------------------------------------------------------

# 14. Estructura de datos recomendada

## Proyecto

``` text
Proyecto
├── id
├── titulo
├── subtitulo
├── texto_corto
├── estado
├── fecha_inicio
├── fecha_fin
├── descripcion
├── impacto_principal
├── problematica
├── resultado_clave
├── progreso
└── imagen_principal
```

## Responsables

``` text
ProyectoResponsable
├── id
├── proyecto_id
└── responsable_id
```

## Aliados

``` text
ProyectoAliado
├── id
├── proyecto_id
└── aliado_id
```

## Etapas

``` text
EtapaProyecto
├── id
├── proyecto_id
├── numero
├── titulo
├── descripcion
├── orden
└── activo
```

## Indicadores

``` text
IndicadorProyecto
├── id
├── proyecto_id
├── valor
├── titulo
├── descripcion
├── variacion
├── icono
├── orden
└── activo
```

## Fotografías

``` text
FotoProyecto
├── id
├── proyecto_id
├── archivo_url
├── titulo
├── descripcion
├── tipo
├── orden
├── es_principal
└── activo
```

------------------------------------------------------------------------

# 15. Panel administrativo recomendado

Crear una pantalla:

``` text
Administración
    └── Proyectos
          └── Editar proyecto
```

La edición puede organizarse por pestañas.

## Pestaña 1 --- Información general

``` text
Estado
Título
Subtítulo
Texto corto
Fecha de inicio
Fecha de cierre
Responsables
Aliados
Beneficiarios
Resultado clave
```

## Pestaña 2 --- Fotografías

``` text
Imagen principal
Galería principal
Galería lateral
Evidencias
```

## Pestaña 3 --- Contenido

``` text
Descripción
Impacto principal
Problemática
Trabajo colaborativo
```

## Pestaña 4 --- Etapas

``` text
Lista de etapas
```

## Pestaña 5 --- Resultados

``` text
Indicadores
Progreso general
```

## Pestaña 6 --- Vista previa

Mostrar exactamente cómo quedará el proyecto antes de publicar.

------------------------------------------------------------------------

# 16. Requisito clave: vista previa

Agregar:

``` text
[Guardar cambios]
[Guardar y publicar]
[Vista previa]
```

La vista previa debe utilizar los mismos componentes de la página
pública.

Esto evita que el administrador tenga que adivinar cómo quedará la
información.

------------------------------------------------------------------------

# 17. Flujo para modificar una fotografía

El flujo recomendado es:

``` text
Administrador
      ↓
Selecciona proyecto
      ↓
Fotografías
      ↓
Selecciona sección
      ↓
Selecciona fotografía
      ↓
Reemplazar
      ↓
Selecciona nuevo archivo
      ↓
Previsualización
      ↓
Guardar
      ↓
Actualizar base de datos
      ↓
Actualizar vista pública
```

------------------------------------------------------------------------

# 18. Validaciones

## Imágenes

Validar:

-   Formatos permitidos: JPG, JPEG, PNG, WEBP.
-   Tamaño máximo.
-   Que el archivo realmente sea una imagen.
-   Dimensiones mínimas.
-   Evitar archivos excesivamente pesados.

## Texto

Validar:

-   Campos obligatorios.
-   Longitud máxima.
-   Evitar contenido vacío.

## Fechas

Validar:

``` text
fecha_fin >= fecha_inicio
```

si existe fecha de cierre.

## Progreso

Validar:

``` text
0 <= progreso <= 100
```

------------------------------------------------------------------------

# 19. Eliminación de fotografías

No eliminar inmediatamente una fotografía sin confirmación.

Mostrar:

``` text
¿Deseas eliminar esta fotografía?

Esta acción quitará la imagen de este proyecto.

[Cancelar] [Eliminar]
```

Si existe almacenamiento de archivos separado, también debe eliminarse
el archivo que ya no se utiliza, siempre que ninguna otra entidad lo
esté utilizando.

------------------------------------------------------------------------

# 20. Reordenamiento de fotografías

Es recomendable implementar Drag & Drop.

Ejemplo:

``` text
1. FOTO A
2. FOTO B
3. FOTO C
4. FOTO D
```

El administrador mueve:

``` text
FOTO C
↓
FOTO A
↓
FOTO B
↓
FOTO D
```

Y el sistema actualiza:

``` text
orden = 1
orden = 2
orden = 3
orden = 4
```

La página pública debe respetar ese orden.

------------------------------------------------------------------------

# 21. API / Backend

Crear endpoints equivalentes a:

``` text
GET    /api/proyectos/:id
PUT    /api/proyectos/:id

POST   /api/proyectos/:id/fotos
PUT    /api/fotos/:id
DELETE /api/fotos/:id

POST   /api/proyectos/:id/etapas
PUT    /api/etapas/:id
DELETE /api/etapas/:id

POST   /api/proyectos/:id/indicadores
PUT    /api/indicadores/:id
DELETE /api/indicadores/:id
```

Para reordenamiento:

``` text
PUT /api/proyectos/:id/fotos/orden
```

------------------------------------------------------------------------

# 22. Permisos

Solo los usuarios con permisos administrativos deben poder modificar:

-   Información.
-   Fotografías.
-   Etapas.
-   Indicadores.
-   Evidencias.
-   Galería.

La página pública debe ser de solo lectura.

Ejemplo:

``` text
ADMIN
  ├── Crear
  ├── Editar
  ├── Eliminar
  ├── Subir fotos
  └── Ordenar fotos

USUARIO
  └── Ver
```

------------------------------------------------------------------------

# 23. Orden recomendado de desarrollo

No construir todo al mismo tiempo.

## Fase 1 --- Base del proyecto

Primero terminar:

-   Modelo de proyecto.
-   Edición de información general.
-   Guardado en base de datos.
-   Vista pública conectada a datos reales.

## Fase 2 --- Sistema de fotografías

Después:

-   Subida.
-   Reemplazo.
-   Eliminación.
-   Previsualización.
-   Orden.
-   Imagen principal.
-   Galería principal.
-   Galería lateral.
-   Evidencias.

**Esta fase es prioritaria porque se desea cambiar todas las fotografías
desde administración.**

## Fase 3 --- Contenido

Implementar:

-   Descripción.
-   Impacto principal.
-   Problemática.
-   Trabajo colaborativo.

## Fase 4 --- Etapas

Implementar:

-   Crear etapa.
-   Editar.
-   Eliminar.
-   Ordenar.
-   Activar/desactivar.

## Fase 5 --- Resultados

Implementar:

-   Indicadores.
-   Valores.
-   Variaciones.
-   Iconos.
-   Progreso.

## Fase 6 --- Vista previa

Crear la previsualización administrativa.

## Fase 7 --- Validaciones y seguridad

Finalmente:

-   Permisos.
-   Validaciones.
-   Confirmaciones.
-   Manejo de errores.
-   Optimización de imágenes.

------------------------------------------------------------------------

# 24. Checklist final del administrador

Antes de considerar terminado el módulo, verificar que el administrador
pueda modificar **sin tocar código**:

### Información

-   [ ] Nombre
-   [ ] Estado
-   [ ] Subtítulo
-   [ ] Texto corto
-   [ ] Fecha de inicio
-   [ ] Fecha de cierre
-   [ ] Responsables
-   [ ] Aliados
-   [ ] Beneficiarios
-   [ ] Resultado clave

### Fotografías

-   [ ] Imagen principal
-   [ ] Galería principal
-   [ ] Miniaturas
-   [ ] Galería lateral
-   [ ] Evidencias
-   [ ] Subir fotografía
-   [ ] Reemplazar fotografía
-   [ ] Eliminar fotografía
-   [ ] Ordenar fotografía
-   [ ] Marcar fotografía principal

### Contenido

-   [ ] Descripción
-   [ ] Impacto principal
-   [ ] Problemática
-   [ ] Trabajo colaborativo

### Etapas

-   [ ] Crear
-   [ ] Editar
-   [ ] Eliminar
-   [ ] Ordenar
-   [ ] Activar/desactivar

### Resultados

-   [ ] Crear indicador
-   [ ] Editar indicador
-   [ ] Eliminar indicador
-   [ ] Cambiar valor
-   [ ] Cambiar título
-   [ ] Cambiar variación
-   [ ] Cambiar icono
-   [ ] Cambiar progreso

### Sistema

-   [ ] Guardar cambios
-   [ ] Cancelar cambios
-   [ ] Vista previa
-   [ ] Confirmación de eliminación
-   [ ] Mensajes de éxito/error
-   [ ] Control de permisos
-   [ ] Validación de imágenes
-   [ ] Diseño responsive

------------------------------------------------------------------------

# 25. Resultado esperado

Al finalizar, el administrador debe poder tomar un proyecto
completamente diferente y modificarlo desde el panel sin necesidad de
editar código.

Por ejemplo:

``` text
Proyecto A
↓
Cambiar título
↓
Cambiar portada
↓
Eliminar las 3 fotos actuales
↓
Subir 8 fotos nuevas
↓
Ordenarlas
↓
Cambiar descripción
↓
Cambiar problemática
↓
Cambiar las 4 etapas
↓
Agregar una quinta etapa
↓
Cambiar indicadores
↓
Cambiar progreso
↓
Guardar
↓
Vista pública actualizada
```

La **fuente de verdad debe ser la base de datos**, mientras que la
interfaz pública solamente debe encargarse de presentar la información.

## Criterio principal de finalización

> **Si un administrador encuentra un texto, número, estado, etapa o
> fotografía en la página pública, debe existir una opción
> correspondiente en el panel administrativo para modificarlo.**

Ese criterio debe utilizarse como prueba final antes de dar por
terminado el módulo.
