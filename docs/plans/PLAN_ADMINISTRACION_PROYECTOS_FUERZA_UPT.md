# Plan de Administración y Edición Dinámica — Proyectos Fuerza UPT

Este documento detalla todos los requisitos técnicos, modelo de datos, API endpoints e interfaz de usuario necesarios para habilitar la **gestión 100% dinámica** de la sección de Proyectos desde el Panel de Administración de Fuerza UPT (`/administracion/proyectos`).

---

## 🎯 Objetivo

Permitir que los administradores puedan crear, editar, publicar, reordenar y archivar proyectos desde el panel administrativo, modificando libremente todos los campos de texto, imágenes de galería, evidencias fotográficas, etapas metodológicas, resultados clave e información institucional sin requerir cambios de código.

---

## 📋 1. Inventario de Campos Modificables

Cada proyecto debe contar con opciones de edición para las siguientes áreas:

### 1.1 Información General y Estado Editorial
- **Título del proyecto** (`title`): Texto libre, obligatorio (ej. *The strokes*).
- **Subtítulo / Leyenda corta** (`subtitle`): Texto libre opcional (ej. *Iniciativa institucional Fuerza UPT*).
- **Slug URL personalizado** (`slug`): Generado automáticamente o editable (ej. `the-strokes`).
- **Categoría** (`category`): Selección o texto libre (ej. *Medio Ambiente*, *Educación*, *Tecnología*).
- **Estado editorial** (`contentStatus`): `DRAFT` (Borrador), `PUBLISHED` (Publicado), `ARCHIVED` (Archivado).
- **Estado de ejecución** (`projectStatus`): `UPCOMING` (Próximo), `ACTIVE` (En Ejecución), `PAUSED` (Pausado), `FINISHED` (Finalizado).
- **Destacado** (`featured`): Booleano (`true`/`false`) para mostrar en la página de inicio.
- **Orden de despliegue** (`displayOrder`): Número entero para ordenación personalizada.

### 1.2 Metadatos y Equipo de Trabajo
- **Fecha de inicio** (`startDate`): Campo fecha (`YYYY-MM-DD`).
- **Fecha de cierre** (`endDate`): Campo fecha opcional o indicador de *"Sin cierre definido"*.
- **Responsables** (`responsibleNames`): Lista dinámica de nombres editable (agregar/eliminar/reordenar).
- **Aliados y Organizaciones** (`partnerNames`): Lista dinámica de aliados institucionales (ej. *REU*, *Muni Tacna*).
- **Beneficiarios** (`beneficiaries`): Texto explicativo o métrica (ej. *450 personas*, *Comunidad universitaria*).

### 1.3 Galería y Evidencias Fotográficas
- **Imagen de Portada Principal** (`coverImage`): Carga de archivo de imagen con previsualización + texto alternativo (`coverAltText`).
- **Galería de Carrusel** (`gallery[]`): Carga múltiple de fotografías para el carrusel lateral.
- **Evidencias Fotográficas** (`evidences[]`): Subida de imágenes precargadas con título/leyenda opcional (`caption`).

### 1.4 Resumen, Propósito e Impacto
- **Resumen corto** (`summary`): Descripción breve para las tarjetas del catálogo.
- **Descripción completa** (`description`): Texto enriquecido o párrafos explicativos de *"¿De qué trata este proyecto?"*.
- **Impacto principal** (`objective`): Texto que alimenta la caja azul destacada `ⓘ Impacto principal`.
- **Problemática atendida** (`problem`): Descripción del problema que el proyecto resuelve.

### 1.5 Etapas Metodológicas ("¿Cómo se trabajó el proyecto?")
- **Etapas dinámicas** (`methodology[]`): Lista editable de etapas que contiene:
  1. `stepNumber`: Número de la etapa (1, 2, 3, 4...).
  2. `title`: Título de la etapa (ej. *1. Diagnóstico inicial*).
  3. `description`: Explicación de la etapa.
- **Nota de Trabajo Colaborativo** (`collaborativeNote`): Texto personalizable para la tarjeta amarilla `⭐ Trabajo colaborativo`.

### 1.6 Resultados e Impacto Alcanzado
- **Resultados Clave** (`results[]`): Lista dinámica de ítems con checkmark de éxito (ej. *Concientización completado*, *Capacitaciones al 100%*).

---

## 🛠️ 2. Persistencia y Backend (Spring Boot / PostgreSQL)

### 2.1 Tablas en Base de Datos (PostgreSQL)

```sql
-- Tabla principal de proyectos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    subtitle VARCHAR(255),
    summary VARCHAR(600),
    description TEXT,
    problem TEXT,
    objective TEXT,
    category VARCHAR(100),
    cover_image_url TEXT,
    cover_alt_text VARCHAR(255),
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    project_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    beneficiaries VARCHAR(255),
    collaborative_note TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- Etapas metodológicas
CREATE TABLE IF NOT EXISTS project_methodology_steps (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- Evidencias fotográficas
CREATE TABLE IF NOT EXISTS project_evidences (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0
);
```

### 2.2 Endpoints del Controlador Administrativo (`AdminProjectController`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/admin/proyectos` | Lista paginada y filtrable de proyectos para el panel admin |
| `GET` | `/api/admin/proyectos/{id}` | Obtiene todos los campos editables de un proyecto específico |
| `POST` | `/api/admin/proyectos` | Crea un nuevo proyecto con imágenes y campos completos |
| `PUT` | `/api/admin/proyectos/{id}` | Actualiza campos, responsabilidades, aliados, resultados y etapas |
| `POST` | `/api/admin/proyectos/{id}/galeria` | Sube nuevas imágenes a la galería del proyecto (Supabase Storage) |
| `DELETE` | `/api/admin/proyectos/{id}/galeria/{imageId}` | Elimina una imagen de la galería |
| `PATCH` | `/api/admin/proyectos/{id}/estado` | Cambia el estado editorial (`PUBLISHED`, `DRAFT`, `ARCHIVED`) |
| `PUT` | `/api/admin/proyectos/orden` | Reordena el orden de despliegue (`displayOrder`) de los proyectos |

---

## 🎨 3. Interfaz del Formulario Administrativo (Frontend Next.js)

En las rutas `/administracion/proyectos/nuevo` y `/administracion/proyectos/[id]/editar`, el formulario se organizará en **secciones estructuradas**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ FORMULARIO DE PROYECTO — [ Crear / Editar ]                             │
├─────────────────────────────────────────────────────────────────────────┤
│ [ Secc. 1: Datos Básicos ]  [ Secc. 2: Metadatos ]  [ Secc. 3: Textos ] │
│ [ Secc. 4: Metodología   ]  [ Secc. 5: Galería & Evidencias ]            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TÍTULO DEL PROYECTO *                                                  │
│  [ The strokes                                                       ]  │
│                                                                         │
│  SUBTÍTULO / LEYENDA                                                    │
│  [ Iniciativa institucional Fuerza UPT                               ]  │
│                                                                         │
│  ESTADO EDITORIAL            ESTADO DE EJECUCIÓN                        │
│  (o) Publicado ( ) Borrador   [ Finalizado                        v ]   │
│                                                                         │
│  IMAGEN DE PORTADA                                                      │
│  [ Seleccionar archivo... ] -> Preview + Alt Text                       │
│                                                                         │
│  --- METADATOS Y EQUIPO ---                                             │
│  PERIODO INICIO              PERIODO CIERRE                             │
│  [ 2026-08-04 ]             [ Sin cierre definido                  ]  │
│                                                                         │
│  RESPONSABLES (Agregar +)    ALIADOS (Agregar +)                        │
│  [ Milton, miguel        ]   [ REU                                  ]  │
│                                                                         │
│  --- CONTENIDO Y TEXTOS ---                                             │
│  ¿DE QUÉ TRATA ESTE PROYECTO? (Descripción completa)                    │
│  [ Texto explicativo del proyecto...                                ]  │
│                                                                         │
│  IMPACTO PRINCIPAL (Caja azul)                                          │
│  [ Promoción de hábitos sostenibles en la comunidad...               ]  │
│                                                                         │
│  --- ETAPAS METODOLÓGICAS ("¿Cómo se trabajó?") ---                      │
│  [+ Agregar nueva etapa]                                                │
│  1. Título: [ 1. Diagnóstico inicial ]                                  │
│     Desc:   [ Identificamos las principales problemáticas...         ]  │
│                                                                         │
│  --- GALERÍA Y EVIDENCIAS FOTOGRÁFICAS ---                              │
│  [ Drag & Drop para subir múltiples fotografías de evidencias ]         │
│                                                                         │
│  --- RESULTADOS CLAVE ---                                               │
│  [+ Agregar resultado]                                                  │
│  [✓] [ Concientización completado                                   ]  │
│  [✓] [ Capacitaciones completado                                    ]  │
│                                                                         │
│  [ Guardar Cambios ]   [ Cancelar ]                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 4. Flujo de Datos y Sincronización

```text
Administrador edita en /administracion/proyectos/[id]/editar
        │
        ▼ (Envía Multipart Form / JSON Data)
API Endpoint: PUT /api/admin/proyectos/{id}
        │
        ▼ (Guarda en PostgreSQL & invalida caché)
cacheInvalidationService.invalidate("proyectos")
        │
        ▼ (ISR / Revalidation Tag)
Next.js Revalidate Tag: ["projects", "project-{id}"]
        │
        ▼ (Actualización inmediata)
Vista pública: /proyectos/[id] muestra los textos e imágenes fotográficas actualizadas
```

---

## ✅ Criterios de Aceptación para la Fase Administrador

1. **Todos los textos son editables**: Ningún texto de la vista pública debe estar harcodeado; todos provienen de la API/Base de datos.
2. **Carga y eliminación de evidencias fotográficas**: El administrador puede subir nuevas fotografías precargadas a las evidencias y borrar fotos obsoletas.
3. **Gestión de Etapas Metodológicas**: El administrador puede agregar, editar, reordenar y borrar etapas de *"¿Cómo se trabajó?"*.
4. **Gestión de Resultados**: El administrador puede agregar nuevos logros e indicadores clave.
5. **Previsualización y Estado**: El cambio a `DRAFT` oculta el proyecto de la vista pública inmediatamente.
