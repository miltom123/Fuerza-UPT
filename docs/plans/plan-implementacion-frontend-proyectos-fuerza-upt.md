# Plan de implementación Frontend — Proyectos Fuerza UPT

## Objetivo

Implementar el rediseño de la sección **Proyectos Fuerza UPT** tomando como referencia visual la imagen/mockup proporcionada.

La solución debe mantener la identidad visual actual de Fuerza UPT y construir una experiencia clara, institucional y moderna.

### Decisión principal de UX

Al pulsar **“Ver detalles”**, el usuario debe acceder a una **vista completa del proyecto** mediante una ruta propia:

```text
/proyectos/[id]
```

No implementar el detalle como:

- modal pequeño
- drawer lateral
- popup
- preview flotante
- redirección al listado general de Eventos

La vista de detalle debe ocupar prácticamente todo el viewport y sentirse como una página propia del proyecto.

El stack existente es:

- Next.js
- App Router
- TypeScript

Reutilizar la arquitectura, componentes, servicios, tipos y APIs existentes siempre que sea posible.

---

# 1. Alcance

La implementación frontend comprende:

1. Mejora de las tarjetas del listado `/proyectos`.
2. Cambio del botón a **“Ver detalles”**.
3. Creación de `/proyectos/[id]`.
4. Header completo del proyecto.
5. Carrusel de imágenes.
6. Información general.
7. Resumen.
8. Sección “Cómo se trabajó”.
9. Hitos.
10. Evidencias.
11. Eventos vinculados exclusivamente al proyecto.
12. Resultados.
13. Estados de loading, error y contenido vacío.
14. Responsive.
15. Accesibilidad.
16. Animaciones discretas.
17. Optimización de imágenes.

---

# 2. Listado `/proyectos`

## 2.1 Tarjeta de proyecto

La tarjeta debe ser informativa y fácil de escanear.

**No convertirla en una línea de tiempo.**

Debe responder rápidamente:

- ¿Qué proyecto es?
- ¿De qué trata?
- ¿Cuál es su estado?
- ¿Cuál es su periodo?
- ¿Quiénes son responsables?
- ¿Quiénes son los aliados?
- ¿Cuántos beneficiarios tiene?
- ¿Qué resultados presenta?

### Estructura visual

```text
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│ ┌─────────────────┐                                           │
│ │                 │  ESTADO                                   │
│ │                 │  TÍTULO                                   │
│ │     IMAGEN      │  Descripción breve                        │
│ │                 │                                           │
│ │                 │  ┌────────┐ ┌────────┐ ┌────────┐        │
│ │                 │  │Periodo │ │Equipo  │ │Aliados │        │
│ │                 │  └────────┘ └────────┘ └────────┘        │
│ │                 │                                           │
│ │                 │  Beneficiarios                             │
│ └─────────────────┘                                           │
│                                                               │
│ Resultados clave                                               │
│ ● Resultado 1   ● Resultado 2   ● Resultado 3                 │
│                                                               │
│                              [ Ver detalles → ]                │
└───────────────────────────────────────────────────────────────┘
```

## 2.2 Información de la tarjeta

Mostrar:

- portada
- badge de estado
- título
- subtítulo
- descripción breve
- periodo
- responsables
- aliados
- beneficiarios
- resultados clave
- botón “Ver detalles”

Los datos deben mostrarse mediante pequeñas cards/chips con iconos para facilitar la lectura.

---

# 3. Botón “Ver detalles”

Reemplazar definitivamente:

```text
Ver eventos del proyecto
```

por:

```text
Ver detalles →
```

Debe navegar a:

```text
/proyectos/[id]
```

Ejemplo:

```text
/proyectos/15
```

No debe navegar a:

```text
/eventos
```

Los eventos mostrados en el detalle deben corresponder exclusivamente al proyecto seleccionado.

---

# 4. Vista completa `/proyectos/[id]`

La vista debe ocupar prácticamente toda la pantalla.

No debe parecer un modal.

## Estructura general

```text
┌──────────────────────────────────────────────────────────────┐
│ NAVBAR FUERZA UPT                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ← Volver a proyectos                                         │
│                                                              │
│ ESTADO                                                       │
│ TÍTULO DEL PROYECTO                                          │
│ Descripción general                                          │
│                                                              │
│ Periodo | Responsables | Aliados | Beneficiarios             │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │                 CARRUSEL PRINCIPAL                       │ │
│ │                                                          │ │
│ │             ←      IMAGEN      →                         │ │
│ │                                                          │ │
│ │                                  1 / 6                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Resumen] [Cómo se trabajó] [Hitos] [Evidencias]             │
│ [Eventos vinculados] [Resultados]                            │
│                                                              │
│                     CONTENIDO                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 5. Header del proyecto

Incluir:

### Breadcrumb

```text
Proyectos / Nombre del proyecto
```

### Acción

```text
← Volver a proyectos
```

### Estado

Ejemplos:

```text
FINALIZADO
EN EJECUCIÓN
PRÓXIMO
```

### Título

```text
The strokes
```

### Subtítulo

```text
xd
```

### Descripción general

Texto breve explicativo.

### Metadata

Mostrar cuatro bloques:

```text
Periodo
2026-08-04
Sin cierre definido

Responsables
Milton, Miguel

Aliados
REU

Beneficiarios
450 personas
```

Usar iconos lineales y cards pequeñas.

---

# 6. Carrusel de imágenes

Debe ser uno de los elementos visuales principales.

El modelo de datos debe soportar:

```text
images: [
  portada,
  imagen2,
  imagen3,
  imagen4,
  ...
]
```

## Desktop

```text
┌──────────────────────────────────────────────┐
│                                              │
│                  IMAGEN                      │
│                                              │
│       ←                              →       │
│                                              │
│                                  1 / 6       │
└──────────────────────────────────────────────┘

[img] [img] [img] [img] [img] [img]
```

## Funcionalidades

- anterior
- siguiente
- selección mediante thumbnails
- imagen activa
- contador
- transición suave
- soporte de teclado
- estados de carga
- fallback

## Animación

Usar una transición discreta:

```text
fade + slight slide
```

Duración aproximada:

```text
200–300 ms
```

No utilizar animaciones exageradas.

---

# 7. Navegación interna

Debajo del encabezado/carrusel:

```text
Resumen
Cómo se trabajó
Hitos
Evidencias
Eventos vinculados
Resultados
```

Debe funcionar como navegación interna de la página.

En desktop puede mantenerse horizontal.

En móvil debe permitir scroll horizontal.

No debe romper el layout.

---

# 8. Resumen

La sección debe responder:

> ¿De qué trata este proyecto?

Incluir:

- descripción
- propósito
- impacto principal

Ejemplo:

```text
┌───────────────────────────────────────────────┐
│ ⓘ IMPACTO PRINCIPAL                           │
│                                               │
│ Promoción de hábitos sostenibles en la        │
│ comunidad, reduciendo el impacto ambiental    │
│ y fortaleciendo el compromiso ciudadano.      │
└───────────────────────────────────────────────┘
```

---

# 9. Cómo se trabajó

**No utilizar una línea de tiempo.**

No utilizar:

```text
2026 ───●────●────●────●
```

Ni una línea vertical cronológica.

En su lugar utilizar tarjetas informativas.

```text
┌──────────────────┐ ┌──────────────────┐
│ 01               │ │ 02               │
│ Diagnóstico      │ │ Planificación    │
│                  │ │                  │
│ Descripción...   │ │ Descripción...   │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ 03               │ │ 04               │
│ Ejecución        │ │ Evaluación       │
│                  │ │                  │
│ Descripción...   │ │ Descripción...   │
└──────────────────┘ └──────────────────┘
```

Cada bloque puede contener:

- número
- icono
- título
- descripción
- imagen opcional

El objetivo es que sea informativo, no cronológico.

---

# 10. Hitos

Mostrar los hitos como tarjetas.

```text
Hitos principales

┌───────────────────────┐
│ ✓ Diagnóstico inicial │
│ Problema identificado │
└───────────────────────┘

┌───────────────────────┐
│ ✓ Primera actividad   │
│ Actividad realizada   │
└───────────────────────┘

┌───────────────────────┐
│ ✓ Campaña principal   │
│ Participación...      │
└───────────────────────┘
```

En desktop:

```text
[ Hito 1 ] [ Hito 2 ] [ Hito 3 ] [ Hito 4 ]
```

No utilizar una timeline.

---

# 11. Evidencias

Crear una galería visual.

```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│ FOTO     │ │ FOTO     │ │ FOTO     │
└──────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│ FOTO     │ │ FOTO     │ │ FOTO     │
└──────────┘ └──────────┘ └──────────┘
```

Al hacer click en una evidencia:

- abrir lightbox
- mostrar imagen grande
- permitir siguiente/anterior
- permitir cerrar
- soportar teclado

No navegar a otra página.

---

# 12. Eventos vinculados

Esta sección debe mostrar **solo eventos asociados al proyecto actual**.

Ejemplo:

```text
Eventos vinculados a este proyecto

┌─────────────────────────────────────────────┐
│ [imagen]  Taller: Cuidado del medio ambiente│
│           10 ago. 2026             REALIZADO│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [imagen]  Campaña de reciclaje              │
│           25 ago. 2026             REALIZADO│
└─────────────────────────────────────────────┘
```

Botón:

```text
Ver todos los eventos del proyecto →
```

Debe seguir filtrado por el proyecto.

**Nunca mostrar aquí el listado general de eventos del sitio.**

---

# 13. Resultados

Mostrar resultados de forma visual.

Ejemplo:

```text
Resultados

✓ Concientización completada
✓ Capacitaciones completadas
✓ Actividades completadas
✓ Impacto medido
```

Si existen porcentajes:

```text
Concientización       100%
Capacitaciones         90%
Actividades           100%
Impacto                80%
```

Se pueden usar:

- indicadores circulares pequeños
- barras horizontales
- checks
- porcentajes

Evitar gráficos complejos innecesarios.

---

# 14. Componentización

No colocar toda la lógica dentro de `page.tsx`.

Una estructura recomendada:

```text
app/
└── proyectos/
    ├── page.tsx
    └── [id]/
        └── page.tsx

components/
└── proyectos/
    ├── ProjectCard.tsx
    ├── ProjectStatusBadge.tsx
    ├── ProjectMetadata.tsx
    ├── ProjectResults.tsx
    ├── ProjectDetail.tsx
    ├── ProjectGallery.tsx
    ├── ProjectGalleryThumbnail.tsx
    ├── ProjectNavigation.tsx
    ├── ProjectSummary.tsx
    ├── ProjectMethodology.tsx
    ├── ProjectMilestones.tsx
    ├── ProjectEvidence.tsx
    ├── ProjectEvents.tsx
    └── ProjectResultsDetail.tsx
```

Adaptar estos nombres a la arquitectura existente si ya existen componentes equivalentes.

No crear duplicados innecesarios.

---

# 15. Tipos TypeScript

Centralizar el modelo.

Conceptualmente:

```text
Project
 ├── id
 ├── title
 ├── subtitle
 ├── description
 ├── status
 ├── startDate
 ├── endDate
 ├── responsible
 ├── allies
 ├── beneficiaries
 ├── coverImage
 ├── images[]
 ├── methodology[]
 ├── milestones[]
 ├── evidences[]
 ├── events[]
 └── results[]
```

La tarjeta y la página de detalle deben consumir el mismo modelo.

No duplicar información manualmente.

---

# 16. Estados

Implementar:

## Loading

Skeletons para:

- header
- imagen
- metadata
- contenido

## Proyecto encontrado

Mostrar todo el contenido.

## Proyecto inexistente

```text
Proyecto no encontrado

El proyecto que buscas no existe o ya no está disponible.

[ Volver a proyectos ]
```

## Error

```text
No pudimos cargar la información del proyecto.

[ Intentar nuevamente ]
```

## Sin imágenes

Mostrar placeholder.

## Sin eventos

```text
Este proyecto todavía no tiene eventos vinculados.
```

## Sin evidencias

```text
Todavía no hay evidencias disponibles.
```

---

# 17. Responsive

## Desktop

Seguir la composición de la imagen de referencia.

Aprovechar correctamente pantallas grandes.

## Tablet

Reducir columnas.

Ejemplo:

```text
4 metadata
↓
2 + 2
```

## Móvil

Orden:

```text
← Volver

Estado

Título

Descripción

Periodo
Responsables
Aliados
Beneficiarios

Carrusel

Navegación horizontal

Resumen

Cómo se trabajó

Hitos

Evidencias

Eventos

Resultados
```

No mantener tres columnas en móvil.

---

# 18. Diseño visual

La imagen proporcionada debe utilizarse como referencia principal.

Mantener:

- azul institucional
- blanco
- bordes suaves
- cards redondeadas
- sombras ligeras
- tipografía limpia
- iconografía lineal
- espacios amplios
- jerarquía visual clara
- botones azules
- badges de estado

Evitar:

- gradientes excesivos
- glassmorphism
- animaciones llamativas
- cards gigantes sin información
- líneas de tiempo
- fondos demasiado coloridos
- texto diminuto
- exceso de bordes
- emojis como iconos

El resultado debe sentirse como un **portal institucional universitario moderno**, no como una landing page comercial.

---

# 19. Animaciones

Utilizar animaciones discretas.

### Entrada

```text
fade-in
200–300ms
```

### Carrusel

```text
fade / slight slide
200–300ms
```

### Hover

Movimiento mínimo:

```text
translateY(-1px)
```

No utilizar animaciones que distraigan de la información.

---

# 20. Accesibilidad

Implementar:

- `alt` descriptivo
- botones reales
- enlaces reales
- navegación mediante teclado
- focus visible
- contraste adecuado
- `aria-label` en controles del carrusel
- estados de carga accesibles

---

# 21. Performance

Utilizar `next/image` cuando corresponda.

Optimizar:

- lazy loading
- dimensiones
- aspect ratios
- thumbnails
- carga de imágenes

No descargar innecesariamente todas las evidencias si existen muchas.

---

# 22. Reutilización de datos

La arquitectura debe seguir:

```text
API
 ↓
Project
 ↓
 ├── ProjectCard
 │
 └── ProjectDetail
      ├── Gallery
      ├── Summary
      ├── Methodology
      ├── Milestones
      ├── Evidence
      ├── Events
      └── Results
```

Evitar duplicar llamadas y modelos cuando sea posible.

---

# 23. Orden de implementación

## Fase 1 — Análisis

1. Revisar estructura actual de `/proyectos`.
2. Revisar componentes existentes.
3. Revisar servicios/API.
4. Revisar tipos TypeScript.
5. Revisar cómo se obtienen actualmente los eventos.
6. Identificar qué puede reutilizarse.
7. No romper funcionalidad existente.

## Fase 2 — Listado

8. Rediseñar `ProjectCard`.
9. Mejorar jerarquía visual.
10. Mantener únicamente información importante.
11. Cambiar botón a `Ver detalles`.
12. Conectar con `/proyectos/[id]`.

## Fase 3 — Detalle

13. Crear `/proyectos/[id]`.
14. Crear header.
15. Crear metadata.
16. Crear carrusel.
17. Crear navegación interna.
18. Crear resumen.
19. Crear “Cómo se trabajó”.
20. Crear hitos.
21. Crear evidencias.
22. Crear eventos vinculados.
23. Crear resultados.

## Fase 4 — UX

24. Loading.
25. Error.
26. Not found.
27. Empty states.
28. Animaciones.
29. Accesibilidad.

## Fase 5 — Responsive

30. Desktop.
31. Tablet.
32. Mobile.

## Fase 6 — Revisión visual

33. Comparar con la imagen proporcionada.
34. Ajustar tamaños.
35. Ajustar espaciado.
36. Ajustar tipografía.
37. Ajustar proporciones.
38. Ajustar colores.
39. Ajustar imágenes.
40. Verificar que el detalle sea una página completa y no un modal.

---

# 24. Criterios de aceptación

La implementación se considera terminada únicamente si:

- [ ] `/proyectos` mantiene el funcionamiento actual.
- [ ] Las tarjetas tienen una jerarquía visual mejorada.
- [ ] El botón dice “Ver detalles”.
- [ ] “Ver detalles” abre `/proyectos/[id]`.
- [ ] No redirige al listado general de eventos.
- [ ] El detalle ocupa prácticamente toda la pantalla.
- [ ] Existe carrusel de imágenes.
- [ ] El carrusel permite thumbnails.
- [ ] Existe resumen.
- [ ] Existe “Cómo se trabajó”.
- [ ] “Cómo se trabajó” no es una timeline.
- [ ] Existen hitos.
- [ ] Existen evidencias.
- [ ] Las evidencias tienen lightbox.
- [ ] Existen eventos vinculados al proyecto.
- [ ] Los eventos están filtrados por proyecto.
- [ ] Existen resultados.
- [ ] Existen estados loading/error/not-found/empty.
- [ ] Funciona en desktop.
- [ ] Funciona en tablet.
- [ ] Funciona en móvil.
- [ ] Se respeta la identidad visual de Fuerza UPT.
- [ ] No se introducen animaciones excesivas.
- [ ] No se rompe la funcionalidad existente.
- [ ] La interfaz final es coherente con la imagen de referencia.

---

# 25. Instrucción final para Antigravity

**Implementa todo lo indicado en este documento.**

La imagen adjunta debe utilizarse como **referencia visual principal**, pero no debe copiarse literalmente como una imagen estática.

Construye la interfaz real con componentes Next.js/React y TypeScript.

Prioriza:

1. coherencia visual;
2. jerarquía de información;
3. reutilización de componentes;
4. responsive;
5. accesibilidad;
6. rendimiento;
7. integración con los datos existentes.

**No construyas un mockup. Construye la funcionalidad real.**

**No conviertas el detalle en un modal. Debe ser una página completa `/proyectos/[id]`.**

**No conviertas “Cómo se trabajó” ni “Hitos” en una línea de tiempo. Deben ser bloques/cards informativos.**

**No conectes los eventos al listado general `/eventos`. Deben ser exclusivamente los eventos asociados al proyecto actual.**

Antes de crear código nuevo, revisa la implementación existente y reutiliza lo que ya funcione.
