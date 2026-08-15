# PLAN DE IMPLEMENTACIÓN INICIAL — FUERZA UPT WEB

## 1. Objetivo del plan

Construir la primera versión funcional del frontend de **Fuerza UPT** tomando como referencia el diseño moderno previamente definido.

Esta primera etapa debe enfocarse únicamente en:

- Estructura visual de la landing page.
- Componentes reutilizables.
- Diseño responsive.
- Datos temporales locales.
- Preparación para futura conexión con Spring Boot.
- Código ordenado, escalable y fácil de mantener.

No se debe implementar todavía:

- Backend.
- Base de datos.
- Login real.
- Panel administrativo funcional.
- Integración con Spring Boot.
- Subida de imágenes.
- Envío real de formularios.
- Microservicios.

---

# 2. Contexto técnico actual

El proyecto ya fue creado con:

```text
Next.js 16
React
TypeScript
Tailwind CSS v4
shadcn/ui
Radix
Preset Luma
```

Ruta recomendada del proyecto:

```text
C:\Proyectos\fuerza-upt-web
```

Comando de ejecución:

```powershell
npm run dev
```

URL local:

```text
http://localhost:3000
```

---

# 3. Tecnologías que se utilizarán

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide React
Motion
React Hook Form
Zod
```

## Futuro backend

```text
Java 17
Spring Boot
Spring Web
Spring Data JPA
Spring Security
JWT
PostgreSQL
```

En esta primera fase solo se debe preparar el frontend para consumir posteriormente una API REST.

---

# 4. Resultado esperado de la primera implementación

Al finalizar esta etapa debe existir una landing page completa con las siguientes secciones:

1. Header.
2. Hero principal.
3. Valores de Fuerza UPT.
4. Evento destacado.
5. Becas y oportunidades.
6. Proyectos destacados.
7. Alianzas estratégicas.
8. Estadísticas de impacto.
9. Equipo.
10. Próximos eventos.
11. Suscripción a novedades.
12. Footer.

La página debe funcionar correctamente en:

- Escritorio.
- Laptop.
- Tablet.
- Celular.

---

# 5. Reglas generales para Codex

Codex debe respetar las siguientes reglas durante toda la implementación:

1. No eliminar archivos existentes sin justificación.
2. No modificar componentes de `src/components/ui` innecesariamente.
3. No instalar dependencias adicionales sin necesidad.
4. No implementar backend en esta fase.
5. No crear microservicios.
6. No usar datos reales sensibles.
7. No escribir toda la página en un solo archivo.
8. Crear componentes reutilizables.
9. Mantener TypeScript estricto.
10. No usar `any` salvo que sea estrictamente necesario.
11. Usar `next/image` para imágenes.
12. Usar `next/link` para navegación.
13. Mantener un diseño responsive.
14. Evitar código duplicado.
15. No colocar estilos complejos directamente en JSX si pueden reutilizarse.
16. Separar datos temporales de la interfaz.
17. Mantener nombres de archivos y componentes en inglés.
18. Mantener textos visibles de la web en español.
19. Verificar que `npm run dev` y `npm run build` funcionen.
20. Documentar cualquier decisión importante.

---

# 6. Identidad visual

## Colores principales

```css
--fuerza-navy: #061b4d;
--fuerza-navy-dark: #031234;
--fuerza-blue: #155eef;
--fuerza-blue-light: #397dff;
--fuerza-red: #ef3340;
--fuerza-text: #071a3d;
--fuerza-muted: #61708a;
--fuerza-background: #ffffff;
--fuerza-surface: #f5f7fb;
--fuerza-border: #e4e9f2;
```

## Estilo general

La web debe verse:

- Moderna.
- Juvenil.
- Universitaria.
- Profesional.
- Limpia.
- Dinámica.
- Visualmente coherente con las redes sociales de Fuerza UPT.

## Elementos visuales

- Fondos blancos.
- Bloques en azul oscuro.
- Botones azul eléctrico.
- Detalles rojos.
- Bordes redondeados.
- Sombras suaves.
- Iconos lineales.
- Fotografías grandes.
- Espaciado amplio.
- Tipografía clara y fuerte.

---

# 7. Estructura de carpetas objetivo

Codex debe organizar el proyecto de la siguiente manera:

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── eventos/
│   │   └── page.tsx
│   ├── becas/
│   │   └── page.tsx
│   ├── proyectos/
│   │   └── page.tsx
│   ├── equipo/
│   │   └── page.tsx
│   ├── unete/
│   │   └── page.tsx
│   └── contacto/
│       └── page.tsx
│
├── components/
│   ├── home/
│   │   ├── hero-section.tsx
│   │   ├── values-section.tsx
│   │   ├── featured-event.tsx
│   │   ├── scholarships-section.tsx
│   │   ├── projects-section.tsx
│   │   ├── alliances-section.tsx
│   │   ├── statistics-section.tsx
│   │   ├── team-section.tsx
│   │   ├── upcoming-events.tsx
│   │   └── newsletter-section.tsx
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── mobile-menu.tsx
│   │   └── footer.tsx
│   │
│   ├── shared/
│   │   ├── section-heading.tsx
│   │   ├── social-links.tsx
│   │   ├── empty-state.tsx
│   │   └── page-container.tsx
│   │
│   └── ui/
│
├── data/
│   ├── navigation.ts
│   ├── values.ts
│   ├── events.ts
│   ├── scholarships.ts
│   ├── projects.ts
│   ├── alliances.ts
│   ├── statistics.ts
│   └── team.ts
│
├── lib/
│   ├── utils.ts
│   └── constants.ts
│
├── services/
│   ├── api-client.ts
│   ├── event-service.ts
│   ├── scholarship-service.ts
│   └── project-service.ts
│
└── types/
    ├── event.ts
    ├── scholarship.ts
    ├── project.ts
    ├── team-member.ts
    └── index.ts

public/
├── images/
│   ├── logo-fuerza-upt.png
│   ├── hero-equipo.webp
│   ├── campeonato.webp
│   ├── equipo-completo.webp
│   ├── proyecto-social.webp
│   ├── proyecto-innovacion.webp
│   ├── proyecto-deporte.webp
│   └── proyecto-educacion.webp
│
└── logos/
    ├── upt.svg
    ├── facem.svg
    └── us-advance.svg
```

---

# 8. Fase 1 — Revisión y preparación

## Objetivo

Revisar el proyecto actual y confirmar que la instalación base está correcta.

## Tareas

1. Revisar `package.json`.
2. Confirmar que existen:
   - Next.js.
   - React.
   - TypeScript.
   - Tailwind CSS.
   - shadcn/ui.
   - Radix UI.
   - Lucide React.
3. Instalar solamente si faltan:

```powershell
npm install motion react-hook-form zod @hookform/resolvers
```

4. Revisar:
   - `src/app/layout.tsx`
   - `src/app/page.tsx`
   - `src/app/globals.css`
   - `components.json`
   - `next.config.ts`
5. Confirmar que el proyecto ejecuta con:

```powershell
npm run dev
```

6. Confirmar que compila con:

```powershell
npm run build
```

## Criterio de aceptación

```text
El proyecto debe iniciar sin errores y compilar correctamente.
```

---

# 9. Fase 2 — Configuración visual global

## Objetivo

Definir la base visual del proyecto.

## Tareas

1. Configurar colores de marca.
2. Configurar fondo general.
3. Configurar estilos de textos.
4. Crear clases reutilizables.
5. Crear un contenedor general.
6. Configurar scroll suave.
7. Definir radios y sombras.
8. Evitar estilos repetidos.

## Clases sugeridas

```css
.container-fuerza
.section-spacing
.card-fuerza
.button-primary
.button-secondary
.section-title
.section-subtitle
```

## Criterio de aceptación

La aplicación debe tener una identidad visual uniforme en todas las secciones.

---

# 10. Fase 3 — Layout principal

## Objetivo

Crear la estructura base de navegación y pie de página.

## Componentes

```text
Header
MobileMenu
Footer
PageContainer
SocialLinks
```

## Header

Debe incluir:

- Logo.
- Inicio.
- Eventos.
- Únete.
- Becas.
- Proyectos.
- Equipo.
- Logros.
- Blog.
- Botón principal “Únete”.
- Enlaces sociales.
- Menú móvil.

## Footer

Debe incluir:

- Logo.
- Descripción corta.
- Enlaces rápidos.
- Datos de contacto.
- Redes sociales.
- Derechos reservados.

## Criterio de aceptación

El header y footer deben aparecer correctamente en escritorio y celular.

---

# 11. Fase 4 — Hero principal

## Objetivo

Construir la sección principal del landing.

## Contenido

Título:

```text
Somos UPT,
somos FUERZA
```

Texto:

```text
Liderazgo, proyectos, becas, comunidad y participación estudiantil para transformar nuestra universidad y nuestra sociedad.
```

Botones:

```text
Únete a la comunidad
Conoce más
```

Imagen:

```text
Grupo de estudiantes de Fuerza UPT
```

Texto sobre imagen:

```text
Juntos hacemos la diferencia
```

## Requisitos

- Diseño de dos columnas en escritorio.
- Diseño vertical en celular.
- Imagen con bordes personalizados.
- Animación suave de entrada.
- Botones accesibles.
- Uso de `next/image`.
- Uso de `motion`.

## Criterio de aceptación

El hero debe ser visualmente fuerte y similar al diseño de referencia.

---

# 12. Fase 5 — Valores institucionales

## Objetivo

Mostrar los valores de Fuerza UPT en tarjetas con iconos.

## Valores

```text
Liderazgo que inspira
Trabajo en equipo
Compromiso social
Crecimiento personal
Impacto positivo
Voz estudiantil que transforma
```

## Requisitos

- Utilizar Lucide React.
- Evitar imágenes para iconos.
- Mostrar seis elementos en escritorio.
- Mostrar dos columnas o una columna en móvil.
- Mantener bordes y separación uniforme.

## Criterio de aceptación

Los valores deben verse claros, alineados y legibles en cualquier pantalla.

---

# 13. Fase 6 — Evento destacado

## Objetivo

Crear un banner visual para el próximo evento.

## Información temporal

```text
Evento:
1er Campeonato Interuniversitario

Participantes:
UPT – UNJBG – UTP

Fecha:
15 y 16 de junio

Hora:
8:00 a. m.

Lugar:
Tacna
```

## Requisitos

- Fondo azul oscuro.
- Imagen deportiva.
- Gradiente.
- Botón de detalles.
- Texto legible.
- Diseño responsive.

## Opcional

Agregar contador visual no funcional:

```text
27 días
14 horas
36 minutos
```

No implementar todavía lógica real de cuenta regresiva.

---

# 14. Fase 7 — Becas y oportunidades

## Objetivo

Mostrar categorías de becas.

## Categorías

```text
Becas académicas
Becas por convenio
Becas internacionales
Becas sociales
```

## Requisitos

- Cuatro tarjetas en escritorio.
- Una o dos columnas en móvil.
- Iconos.
- Texto breve.
- Botón “Ver todas”.
- Datos definidos en `src/data/scholarships.ts`.

## Criterio de aceptación

Las tarjetas deben renderizarse desde datos y no estar repetidas manualmente.

---

# 15. Fase 8 — Proyectos destacados

## Objetivo

Mostrar proyectos de la organización.

## Proyectos temporales

```text
Impacto Social
Innovación
Deportes y Bienestar
Educación y Cultura
```

## Cada tarjeta debe contener

- Imagen.
- Título.
- Categoría.
- Descripción.
- Icono.
- Enlace.

## Requisitos

- Datos en `src/data/projects.ts`.
- Tipo en `src/types/project.ts`.
- Cuatro tarjetas en escritorio.
- Una columna en móvil.
- Hover suave.
- Uso de `next/image`.

---

# 16. Fase 9 — Alianzas y estadísticas

## Alianzas

Mostrar temporalmente:

```text
US Advance
FACEM
Universidad Privada de Tacna
```

## Estadísticas

```text
+30 proyectos realizados
+2,300 estudiantes impactados
+25 alianzas estratégicas
+12 eventos organizados
```

## Requisitos

- No usar cifras conectadas a base de datos.
- Mostrar datos temporales.
- Separar datos en archivos TypeScript.
- No crear gráficos complejos en esta fase.

---

# 17. Fase 10 — Equipo

## Objetivo

Mostrar una vista previa del equipo.

## Requisitos

- Fotografía grupal.
- Título.
- Texto corto.
- Botón “Ver al equipo”.
- Carrusel visual opcional, sin dependencia adicional.
- Si no hay imágenes reales, utilizar placeholders claramente identificados.

## Criterio de aceptación

La sección debe poder reemplazar fácilmente las imágenes temporales por fotografías reales.

---

# 18. Fase 11 — Próximos eventos

## Datos temporales

```text
26 MAY — Taller: Liderazgo y Comunicación
15 JUN — 1er Campeonato Interuniversitario
30 JUN — Conversatorio: Becas y Oportunidades
```

## Requisitos

- Mostrar fecha.
- Título.
- Hora.
- Lugar.
- Enlace.
- Calendario visual opcional.
- Datos separados en `src/data/events.ts`.

---

# 19. Fase 12 — Suscripción

## Objetivo

Crear un formulario visual de suscripción.

## Campos

```text
Correo institucional
```

## Requisitos

- React Hook Form.
- Zod.
- Validación de correo.
- Mensaje visual de éxito.
- No enviar datos a ningún backend todavía.
- Simular envío localmente.
- Preparar función para futura integración.

## Criterio de aceptación

El formulario debe validar correctamente sin recargar la página.

---

# 20. Fase 13 — Páginas secundarias iniciales

Crear páginas mínimas para evitar enlaces rotos:

```text
/eventos
/becas
/proyectos
/equipo
/unete
/contacto
/logros
/blog
```

Cada página debe contener:

- Header.
- Título.
- Texto temporal.
- Botón para volver al inicio.
- Footer.

No implementar contenido completo todavía.

---

# 21. Fase 14 — Preparación para Spring Boot

## Objetivo

Dejar lista la estructura para consumir la futura API REST.

## Crear

```text
src/services/api-client.ts
src/services/event-service.ts
src/services/scholarship-service.ts
src/services/project-service.ts
```

## Variable de entorno

Crear:

```text
.env.example
```

Contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Crear localmente:

```text
.env.local
```

Contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Reglas

- No realizar llamadas reales todavía.
- No romper el render con una API inexistente.
- Mantener datos locales como fallback.
- No exponer credenciales.
- No subir `.env.local` al repositorio.

---

# 22. Tipos TypeScript sugeridos

## Evento

```typescript
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  status: "UPCOMING" | "IN_PROGRESS" | "FINISHED";
}
```

## Beca

```typescript
export interface Scholarship {
  id: number;
  title: string;
  description: string;
  category: string;
  deadline?: string;
  link?: string;
}
```

## Proyecto

```typescript
export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  href: string;
}
```

## Miembro

```typescript
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  career?: string;
  image: string;
  linkedin?: string;
}
```

---

# 23. Contenido temporal permitido

Mientras no existan imágenes oficiales, Codex puede usar:

- Gradientes.
- Placeholders locales.
- Imágenes temporales claramente nombradas.
- Fondos abstractos.
- Imágenes libres ya disponibles en el proyecto.

No debe:

- Descargar imágenes automáticamente.
- Usar URLs externas sin autorización.
- Copiar imágenes desde Facebook o Instagram.
- Incluir contenido con derechos no confirmados.

---

# 24. Responsive design

## Escritorio

```text
Ancho máximo: 1240 px
Hero: dos columnas
Becas: cuatro columnas
Proyectos: cuatro columnas
Valores: seis columnas
Alianzas y equipo: dos columnas
Agenda y suscripción: dos columnas
```

## Tablet

```text
Hero: dos columnas reducidas o una columna
Becas: dos columnas
Proyectos: dos columnas
Valores: tres columnas
```

## Celular

```text
Hero: una columna
Becas: una columna
Proyectos: una columna
Valores: dos columnas o una columna
Header: menú lateral
Botones: ancho completo cuando sea necesario
```

---

# 25. Accesibilidad mínima

Codex debe cumplir:

- `alt` descriptivo en imágenes.
- `aria-label` en iconos interactivos.
- Contraste suficiente.
- Navegación con teclado.
- Botones semánticos.
- Enlaces semánticos.
- Inputs con etiquetas.
- Estados `hover`, `focus` y `disabled`.
- No usar texto demasiado pequeño.

---

# 26. Rendimiento

Codex debe:

1. Usar `next/image`.
2. Marcar la imagen principal con `priority`.
3. Evitar imágenes de tamaño excesivo.
4. Evitar dependencias pesadas.
5. No incluir librerías de carrusel si no son necesarias.
6. Evitar renders innecesarios.
7. Mantener componentes de servidor cuando sea posible.
8. Usar `"use client"` solamente donde sea necesario.

---

# 27. Validaciones técnicas al finalizar

Ejecutar:

```powershell
npm run lint
```

Después:

```powershell
npm run build
```

Finalmente:

```powershell
npm run dev
```

Verificar manualmente:

```text
http://localhost:3000
```

## Debe comprobarse

- No hay errores en consola.
- No hay enlaces principales rotos.
- No hay componentes desbordados.
- No hay texto cortado.
- La web funciona en celular.
- El menú móvil abre y cierra.
- El formulario valida el correo.
- Todas las imágenes tienen `alt`.
- La compilación finaliza correctamente.

---

# 28. Entregables de esta primera etapa

Codex debe entregar:

1. Landing page completa.
2. Header responsive.
3. Menú móvil.
4. Footer.
5. Secciones implementadas.
6. Datos locales tipados.
7. Páginas secundarias mínimas.
8. Estructura de servicios preparada.
9. `.env.example`.
10. README actualizado.
11. Proyecto ejecutable.
12. Compilación sin errores.

---

# 29. Orden exacto de trabajo recomendado para Codex

Codex debe trabajar en este orden:

```text
1. Revisar el proyecto.
2. Revisar dependencias.
3. Ejecutar build inicial.
4. Crear estructura de carpetas.
5. Configurar globals.css.
6. Crear tipos.
7. Crear datos temporales.
8. Crear componentes compartidos.
9. Crear Header.
10. Crear MobileMenu.
11. Crear Footer.
12. Crear Hero.
13. Crear Values.
14. Crear FeaturedEvent.
15. Crear Scholarships.
16. Crear Projects.
17. Crear Alliances.
18. Crear Statistics.
19. Crear Team.
20. Crear UpcomingEvents.
21. Crear Newsletter.
22. Componer page.tsx.
23. Crear páginas secundarias.
24. Preparar services.
25. Crear .env.example.
26. Actualizar README.
27. Ejecutar lint.
28. Ejecutar build.
29. Corregir errores.
30. Entregar resumen de cambios.
```

---

# 30. Prompt principal recomendado para Codex

Copiar y pegar el siguiente texto en Codex:

```text
Analiza el proyecto Next.js actual de Fuerza UPT y ejecuta el plan contenido en PLAN_IMPLEMENTACION_INICIAL_FUERZA_UPT_CODEX.md.

Objetivo:
Construir la primera versión visual y responsive de la landing page de Fuerza UPT.

Restricciones:
- No crear backend.
- No crear base de datos.
- No implementar autenticación real.
- No crear microservicios.
- No eliminar archivos importantes.
- No modificar innecesariamente los componentes shadcn/ui.
- No instalar dependencias sin justificarlo.
- Usar TypeScript estricto.
- Separar componentes, tipos y datos.
- Usar Next.js App Router.
- Usar Tailwind CSS.
- Usar shadcn/ui y Radix.
- Usar Lucide React.
- Usar Motion solamente para animaciones suaves.
- Usar next/image y next/link.
- Mantener textos visibles en español.
- Mantener nombres técnicos en inglés.
- Implementar responsive design.
- Verificar npm run lint y npm run build.
- No detenerte después de crear archivos: valida y corrige errores.

Antes de modificar:
1. Inspecciona la estructura actual.
2. Revisa package.json.
3. Revisa components.json.
4. Revisa globals.css.
5. Revisa layout.tsx y page.tsx.
6. Explica brevemente el plan de ejecución.

Después:
1. Implementa por fases.
2. Ejecuta lint.
3. Ejecuta build.
4. Corrige errores.
5. Entrega un resumen de archivos creados y modificados.
```

---

# 31. Criterio final de aceptación

La primera implementación se considerará terminada cuando:

```text
La landing page de Fuerza UPT se vea moderna, fresca, juvenil, profesional, responsive y coherente con el diseño visual definido; el proyecto compile sin errores y quede preparado para integrarse posteriormente con un backend Spring Boot.
```

---

# 32. Próxima etapa

Una vez completada esta primera fase, el siguiente plan deberá cubrir:

```text
- Diseño de base de datos.
- API REST con Spring Boot.
- Entidades.
- DTO.
- Repositorios.
- Servicios.
- Controladores.
- Validaciones.
- Spring Security.
- JWT.
- Usuarios y roles.
- Gestión de eventos.
- Gestión de becas.
- Gestión de proyectos.
- Panel administrativo.
- Integración entre Next.js y Spring Boot.
```
