# Rediseño Frontend — Registro para formar parte de Fuerza UPT

## Objetivo

Modificar la sección actual de **Únete / Postulación** para que deje de percibirse como un formulario de admisión o postulación formal.

El objetivo real del flujo es:

1. Identificar al estudiante mediante su correo institucional UPT.
2. Obtener automáticamente sus datos disponibles.
3. Permitirle completar o confirmar información académica y de contacto.
4. Registrar su interés en Fuerza UPT.
5. Enviar los datos registrados al equipo de Fuerza UPT mediante correo.
6. Después de confirmar que el envío fue exitoso, habilitar el botón para ingresar al grupo oficial de WhatsApp.

La interfaz debe mantener el lenguaje visual general del sitio:
- Blanco y azul como colores principales.
- Bordes redondeados.
- Sombras suaves.
- Tipografía limpia y moderna.
- Mucho espacio visual, pero sin perder densidad de información.
- Botones claros y jerarquía visual marcada.
- Diseño coherente con las secciones de Proyectos, Legado, Eventos y demás páginas.

---

# 1. Cambio conceptual

## Actualmente

La sección comunica:

> "Postula para ingresar a Fuerza UPT."

Esto es incorrecto porque el usuario todavía no está realizando una postulación formal.

## Nuevo concepto

La página debe comunicar:

> **"Conoce lo que hacemos y súmate a Fuerza UPT."**

El estudiante está dejando sus datos para mostrar interés, conocer los proyectos y posteriormente incorporarse a la comunidad.

La experiencia debe sentirse sencilla y de baja fricción.

### Flujo conceptual

```text
Correo institucional
        ↓
Identificación del estudiante
        ↓
Confirmación / completar datos
        ↓
Seleccionar intereses
        ↓
"Quiero ser parte"
        ↓
Envío de información al equipo
        ↓
Confirmación exitosa
        ↓
Se habilita WhatsApp
        ↓
El estudiante se une al grupo oficial
```

---

# 2. Hero principal

## Etiqueta superior

Cambiar:

> SÉ PARTE DEL CAMBIO

Por:

> **SÉ PARTE DE FUERZA UPT**

## Título principal recomendado

> **Conoce lo que hacemos. Súmate a Fuerza UPT.**

Alternativa:

> **Sé parte de una comunidad que transforma la universidad.**

## Descripción

> Conoce nuestros proyectos, participa en nuestras iniciativas y forma parte de una comunidad de estudiantes que busca transformar la universidad.

Otra alternativa más relacionada con la convocatoria presencial:

> Estamos recorriendo los salones para compartir nuestros proyectos e invitarte a ser parte de esta comunidad.

## CTA del hero

Si se conserva un CTA:

> **Quiero ser parte →**

Debe llevar visualmente hacia el formulario.

---

# 3. Formulario principal

El formulario debe convertirse en el **elemento protagonista de la página**.

Debe estar ubicado inmediatamente después del hero, ocupando gran parte del ancho disponible.

Debe ser una tarjeta grande, blanca, con:
- borde sutil;
- sombra suave;
- bordes redondeados;
- encabezado destacado;
- iconografía azul;
- buena separación entre campos.

---

# 4. Encabezado del formulario

## Título

Cambiar:

> Formulario de postulación

Por:

> **Déjanos tus datos**

## Subtítulo

> Completa tus datos para conocer nuestras iniciativas y mantenerte informado sobre las próximas actividades de Fuerza UPT.

Alternativa:

> Registra tu interés y descubre cómo puedes participar en Fuerza UPT.

## Indicador de privacidad

En la esquina superior derecha:

> 🔒 Tus datos están seguros

Texto secundario opcional:

> Usaremos esta información únicamente para comunicarnos contigo sobre Fuerza UPT.

---

# 5. Identificación mediante correo institucional

Este es un punto importante del nuevo flujo.

## Botón inicial

Cambiar:

> Iniciar sesión con Google (@virtual.upt.pe)

Por:

> **Continuar con mi correo institucional**

Puede mantenerse el icono de Google.

Texto secundario:

> Usa tu correo institucional UPT para completar rápidamente tus datos.

### Objetivo funcional

El correo institucional debe servir para:
- identificar al estudiante;
- obtener su nombre cuando esté disponible;
- autocompletar correo;
- reducir la cantidad de información que el estudiante debe escribir manualmente.

El formulario no debe hacer sentir al usuario que está creando una cuenta nueva.

---

# 6. Campos

Usar los siguientes labels.

## Campo 1

**Nombre completo**

Placeholder:

> Se autocompletará con tu cuenta institucional

## Campo 2

**Correo institucional**

Placeholder:

> Se autocompletará con Google

Este campo debe quedar bloqueado si el correo ya fue identificado correctamente.

---

## Campo 3

**Número de celular / WhatsApp**

Placeholder:

> Ej.: 952 123 456

---

## Campo 4

**Ciclo actual**

Placeholder:

> Selecciona tu ciclo

---

## Campo 5

**Facultad**

Placeholder:

> Selecciona tu facultad

---

## Campo 6

**Carrera profesional**

Placeholder:

> Selecciona tu carrera

---

# 7. Campo de intereses

Cambiar:

> Área de interés

Por:

> **¿En qué te gustaría participar?**

Opciones recomendadas:

```text
Legado Fuerza UPT
Proyectos
Eventos y logística
Comunicación
Voluntariado
Intercambios y oportunidades
Me gustaría conocer todas las áreas
```

La opción:

> Me gustaría conocer todas las áreas

es importante porque el estudiante puede no conocer todavía las áreas de trabajo.

---

# 8. Botón principal

## ELIMINAR

> Enviar postulación

También evitar:

> Postularme

> Enviar candidatura

> Confirmar postulación

Porque no existe una postulación formal en esta etapa.

## Texto recomendado

> **Quiero ser parte →**

Alternativas:

> Registrar mi interés →

> Quiero conocer Fuerza UPT →

La opción preferida es:

> **Quiero ser parte →**

Debe ser el botón azul principal de toda la sección.

---

# 9. Texto debajo del botón

Eliminar:

> Al hacer clic en enviar, confirmas tu postulación oficial a la convocatoria Fuerza UPT.

Reemplazar por:

> 🔒 Al enviar tus datos, autorizas a Fuerza UPT a utilizarlos únicamente para comunicarse contigo sobre sus actividades, proyectos y oportunidades de participación.

Debe ser texto pequeño y discreto.

---

# 10. Estado inicial del botón de WhatsApp

El botón de WhatsApp NO debe estar habilitado desde el inicio.

Debe aparecer bloqueado.

## Texto

> 🔒 Completa el registro para habilitar el grupo de WhatsApp

Visualmente:
- gris claro;
- menor contraste;
- cursor no permitido;
- sin enlace funcional.

No debe parecer un segundo CTA principal.

---

# 11. Estado posterior al envío

Cuando el correo al equipo haya sido enviado correctamente, cambiar la tarjeta a un estado de confirmación.

## Título

> **¡Registro completado! 🎉**

## Texto

> Hemos recibido tus datos correctamente.

Segundo párrafo:

> Gracias por tu interés en Fuerza UPT. Ahora puedes unirte a nuestro grupo oficial para conocer nuestras próximas actividades, proyectos y oportunidades.

## Botón WhatsApp

Ahora sí debe habilitarse.

Texto:

> **Unirme al grupo oficial de WhatsApp →**

Color:

- Verde asociado a WhatsApp.
- Mantener el mismo estilo de bordes redondeados del resto del sitio.

---

# 12. Flujo visual del formulario

El usuario debe experimentar esta secuencia:

## Estado 1 — Sin identificación

```text
Déjanos tus datos

[ Continuar con mi correo institucional ]

Campos deshabilitados o esperando autenticación
```

## Estado 2 — Identificado

```text
✓ Cuenta institucional identificada

Nombre
Correo

WhatsApp
Ciclo

Facultad
Carrera

¿En qué te gustaría participar?

[ QUIERO SER PARTE → ]

🔒 Tus datos están seguros
```

## Estado 3 — Enviando

El botón debe cambiar temporalmente a:

> **Enviando información...**

Debe impedir múltiples envíos.

## Estado 4 — Envío exitoso

```text
✓ ¡Registro completado!

Hemos recibido tus datos correctamente.

Ahora puedes unirte a nuestra comunidad.

[ 🟢 UNIRME AL GRUPO OFICIAL DE WHATSAPP → ]
```

## Estado 5 — Error

Mostrar un mensaje claro:

> **No pudimos registrar tus datos**

> Revisa tu conexión e inténtalo nuevamente.

Botón:

> **Intentar nuevamente**

No mostrar mensajes técnicos al usuario.

---

# 13. Proceso inferior

La sección que actualmente dice:

> Proceso de ingreso

debe cambiar.

## Nuevo título

> **¿Cómo empezamos?**

## Subtítulo

> Te acompañamos desde el primer contacto hasta tu incorporación a nuestra comunidad.

Usar cuatro tarjetas.

### 01 — Identifícate

> Continúa con tu correo institucional UPT.

### 02 — Cuéntanos sobre ti

> Completa tus datos académicos, de contacto e intereses.

### 03 — Conoce Fuerza UPT

> Descubre nuestros proyectos, actividades y oportunidades.

### 04 — Súmate

> Únete a nuestra comunidad y participa en las próximas iniciativas.

No utilizar la palabra "ingreso" como si fuera un proceso de admisión.

---

# 14. FAQ

Mantener la sección de preguntas frecuentes, pero cambiar las preguntas para alinearlas con el nuevo proceso.

Preguntas sugeridas:

### ¿Necesito postular para formar parte de Fuerza UPT?

Respuesta:

> No. Este registro nos permite conocer tu interés y mantenerte informado sobre nuestras actividades y oportunidades de participación.

### ¿Qué sucede después de registrar mis datos?

> Tus datos serán enviados al equipo de Fuerza UPT. Después podrás unirte al grupo oficial de WhatsApp para recibir información de nuestras próximas actividades.

### ¿Necesito pertenecer a una carrera específica?

> No. Buscamos estudiantes interesados en participar y aportar desde diferentes carreras y áreas.

### ¿Puedo participar en más de un área?

> Sí. Puedes indicarnos todos los temas que te interesen y conocer las diferentes áreas de trabajo.

### ¿Para qué utilizarán mis datos?

> Únicamente para comunicarnos contigo sobre actividades, proyectos y oportunidades relacionadas con Fuerza UPT.

---

# 15. Áreas referenciales

La sección puede mantenerse, pero debe tener menor protagonismo que el formulario.

Título:

> **¿Qué hacemos?**

Elementos:

- Legado Fuerza UPT
- Proyectos
- Eventos y logística
- Comunicación
- Voluntariado
- Intercambios y oportunidades

Texto:

> Conoce nuestras áreas y descubre dónde puedes aportar.

No debe competir visualmente con el formulario.

---

# 16. Jerarquía final de la página

La página debe quedar aproximadamente así:

```text
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│                                             │
│ HERO                                        │
│                                             │
│ SÉ PARTE DE FUERZA UPT                     │
│ Conoce lo que hacemos.                      │
│ Súmate a Fuerza UPT.                        │
│                                             │
│              Imagen estudiantes             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│        FORMULARIO PROTAGONISTA              │
│                                             │
│        Déjanos tus datos                    │
│                                             │
│        [ Correo institucional ]             │
│                                             │
│        [ Campos ]                            │
│                                             │
│        [ QUIERO SER PARTE → ]               │
│                                             │
│        [ WhatsApp bloqueado ]               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ¿CÓMO EMPEZAMOS?                            │
│                                             │
│ 01       02       03       04               │
│ Ident.   Datos    Conoce   Súmate           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ PREGUNTAS FRECUENTES                        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ¿QUÉ HACEMOS?                               │
│                                             │
│ Áreas referenciales                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 17. Criterios de diseño

## Mantener

- Navbar existente.
- Azul institucional.
- Fondo claro.
- Tarjetas blancas.
- Bordes redondeados.
- Sombras suaves.
- Iconografía sencilla.
- Tipografía moderna.
- Estilo visual utilizado en Proyectos y Legado.

## Evitar

- Formularios excesivamente pequeños.
- Demasiados elementos secundarios alrededor del formulario.
- Apariencia de portal administrativo.
- Lenguaje de admisión.
- Lenguaje de postulación formal.
- Métricas innecesarias en esta página.
- Demasiados botones compitiendo con el CTA principal.
- Mostrar WhatsApp como acción disponible antes del registro.

---

# 18. Microcopy recomendado

### Identificación

> Continúa con tu correo institucional

### Autocompletado

> Hemos encontrado tus datos institucionales.

### Registro

> Cuéntanos un poco sobre ti.

### Intereses

> Elige los temas que más te interesan.

### Envío

> Estamos registrando tu interés...

### Éxito

> ¡Listo! Ya formas parte de nuestra comunidad de interesados.

### WhatsApp

> Ahora puedes unirte al grupo oficial para recibir novedades.

---

# 19. Información que debe recibir el equipo

Aunque esto corresponde a la integración backend, el frontend debe prepararse para enviar como mínimo:

```text
Nombre completo
Correo institucional
Número de WhatsApp
Ciclo
Facultad
Carrera profesional
Área(s) de interés
Fecha y hora del registro
```

El correo interno debería visualizarse aproximadamente así:

```text
NUEVO REGISTRO — FUERZA UPT

Nombre:
Juan Pérez

Correo institucional:
juan.perez@virtual.upt.pe

WhatsApp:
952 XXX XXX

Ciclo:
5.º ciclo

Facultad:
Facultad de Ingeniería

Carrera:
Ingeniería de Sistemas

Intereses:
Proyectos
Intercambios y oportunidades

Fecha:
11/08/2026
```

Esto es referencia para la integración posterior; **no implementar todavía la lógica de envío en esta etapa del rediseño frontend**.

---

# 20. Regla funcional fundamental

El enlace de WhatsApp nunca debe depender simplemente de que el usuario haya presionado el botón.

Debe habilitarse solamente cuando el frontend reciba una confirmación positiva del envío de los datos.

Conceptualmente:

```text
Formulario válido
      ↓
Enviar datos
      ↓
¿Servidor confirmó envío?
      ↓
   SÍ ─────────────→ habilitar WhatsApp
   │
   NO
   ↓
mostrar error
```

Nunca:

```text
click botón
   ↓
habilitar WhatsApp
```

La habilitación debe depender del resultado real de la operación.

---

# 21. Resultado esperado

El usuario debe sentir:

> "Encontré una organización estudiantil, entiendo qué hacen, dejo mis datos rápidamente y puedo entrar a su comunidad."

No debe sentir:

> "Estoy llenando una solicitud para que me acepten."

Ese cambio conceptual debe reflejarse tanto en los textos como en la jerarquía visual de toda la página.
