# Plan de implementación — Email HTML institucional de nuevas postulaciones
## Fuerza UPT — Diseño basado en la imagen de referencia aprobada

**Proyecto:** Fuerza UPT  
**Objetivo:** reemplazar el correo genérico actual de postulaciones por un **correo HTML institucional, moderno, minimalista y compatible con Gmail/Outlook**, utilizando como referencia visual principal **la imagen de diseño que ya fue proporcionada a Antigravity**.

> **IMPORTANTE:** Antigravity debe utilizar **la imagen adjunta/de referencia que ya tiene en la conversación** como guía visual obligatoria. No debe inventar otro estilo ni reinterpretar el diseño desde cero.

---

# 1. Resultado esperado

La notificación de una nueva postulación debe dejar de verse como el correo genérico de FormSubmit:

```text
Someone just submitted your form...
Name | Value
...
```

y pasar a un diseño institucional de Fuerza UPT similar a **la imagen de referencia aprobada**, que contiene:

```text
Logo real de Fuerza UPT
Nueva postulación recibida
Nombre destacado del postulante
Resumen del postulante
Datos organizados en bloques
Detalles de la postulación
Botón Ver postulación
Botón Responder al postulante
Pie institucional Fuerza UPT
```

El correo debe verse profesional, limpio y coherente con:

```text
azul marino
azul principal Fuerza UPT
blanco
grises muy claros
bordes suaves
espaciado amplio
tipografía limpia
```

---

# 2. Imagen de referencia obligatoria

Antigravity ya dispone de **la imagen visual de referencia del correo** que fue generada previamente.

Debe utilizarla como guía para:

```text
jerarquía visual
distribución
proporciones
espaciados
uso del logo
colores
tarjetas
botones
bloques de información
footer
```

No debe:

```text
crear un diseño nuevo sin relación con la imagen
usar una tabla genérica tipo FormSubmit
usar colores distintos a Fuerza UPT
colocar el logo incorrecto
sustituir la imagen aprobada por otro concepto visual
```

La referencia visual debe considerarse el diseño aprobado por el usuario.

---

# 3. Arquitectura objetivo

El flujo debe quedar:

```text
Formulario Únete
      ↓
Backend Spring Boot
      ↓
TeamApplication
      ↓
COMMIT
      ↓
TeamApplicationSubmittedEvent
      ↓
@TransactionalEventListener(AFTER_COMMIT)
      ↓
EmailNotificationService
      ↓
JavaMailSender / SMTP
      ↓
HTML institucional Fuerza UPT
```

No utilizar FormSubmit como canal principal.

---

# 4. FormSubmit

Actualmente el correo genérico visto por el usuario proviene del estilo de:

```text
FormSubmit
```

El diseño institucional no debe depender de ese servicio.

## Acción

Mantener FormSubmit:

```text
deshabilitado por defecto
```

o retirarlo completamente si el backend SMTP ya funciona correctamente.

La configuración debe continuar:

```yaml
app:
  notification:
    formsubmit-enabled: false
```

No activar FormSubmit para resolver problemas visuales del email.

---

# 5. Fuente de envío

El email institucional debe enviarse mediante:

```text
JavaMailSender
MimeMessage
MimeMessageHelper
```

Arquitectura recomendada:

```java
MimeMessage message = javaMailSender.createMimeMessage();

MimeMessageHelper helper =
        new MimeMessageHelper(message, true, "UTF-8");

helper.setTo(...);
helper.setSubject(...);
helper.setReplyTo(...);
helper.setText(htmlContent, true);

javaMailSender.send(message);
```

El segundo parámetro:

```java
true
```

de:

```java
helper.setText(htmlContent, true)
```

es obligatorio para interpretar el cuerpo como HTML.

---

# 6. Compatibilidad de email

No diseñar el correo como si fuera una página Next.js.

Los clientes como Gmail y Outlook tienen restricciones importantes.

Evitar:

```text
Tailwind
CSS externo
JavaScript
React en runtime
display:grid complejo
flexbox avanzado
position:absolute
animaciones
pseudo-elementos
background CSS sofisticado
```

Utilizar principalmente:

```text
<table>
<tr>
<td>
inline styles
```

para máxima compatibilidad.

---

# 7. Estructura HTML recomendada

La estructura principal debe ser aproximadamente:

```html
<body>
  <table class="email-root">
    <tr>
      <td>
        <table class="email-card">

          <!-- Barra superior -->
          <!-- Logo Fuerza UPT -->

          <!-- Icono / encabezado -->
          <!-- Nueva postulación recibida -->

          <!-- Nombre destacado -->

          <!-- Resumen postulante -->

          <!-- Detalles -->

          <!-- Acciones -->

          <!-- Footer -->

        </table>
      </td>
    </tr>
  </table>
</body>
```

Todo el estilo importante debe ir inline.

---

# 8. Diseño general

Tomar de la imagen de referencia:

```text
contenedor central blanco
máximo aproximado 620–720 px
fondo exterior gris muy claro
barra superior azul marino
bordes redondeados moderados
sombras muy suaves
mucho espacio en blanco
```

No utilizar sombras excesivas.

No hacer que parezca una landing page.

Debe seguir viéndose como un email real.

---

# 9. Logo oficial Fuerza UPT

Usar exactamente el **logotipo correcto de Fuerza UPT** que aparece en la imagen de referencia proporcionada.

No utilizar:

```text
logo inventado
icono F genérico
texto FUERZA UPT sin logotipo
otra versión del logo
```

El logo debe aparecer:

```text
1 vez en el encabezado principal
```

y opcionalmente en tamaño pequeño en el footer, siguiendo la imagen de referencia.

---

# 10. Estrategia recomendada para el logo

Preferencia:

```text
CID inline
```

para no depender de la carga remota de imágenes.

Ejemplo conceptual:

```java
ClassPathResource logo =
        new ClassPathResource("mail/fuerza-upt-logo.png");

helper.addInline(
        "fuerzaUptLogo",
        logo,
        "image/png"
);
```

HTML:

```html
<img
  src="cid:fuerzaUptLogo"
  alt="Fuerza UPT"
  width="120"
/>
```

---

# 11. Ubicación del logo

Crear un recurso institucional, por ejemplo:

```text
src/main/resources/mail/fuerza-upt-logo.png
```

No usar:

```text
URL temporal
localhost
ruta absoluta del equipo
base64 gigante dentro del HTML
```

---

# 12. Encabezado

Seguir la imagen de referencia.

Debe mostrar:

```text
Nueva postulación recibida
```

Subtexto:

```text
Se registró una nueva postulación desde el apartado Únete.
```

Debajo mostrar el nombre del postulante como elemento destacado:

```text
Milton H Flores Chino
```

pero generado dinámicamente.

---

# 13. Datos dinámicos del postulante

Utilizar los datos reales disponibles en `TeamApplication`.

Mostrar como mínimo:

```text
Nombre completo
Correo
Carrera
Facultad
Ciclo
Interés
Celular
Fecha
```

Solo mostrar campos realmente existentes en backend.

Si algún campo no existe:

```text
NO inventarlo
NO mostrar valor ficticio
```

---

# 14. Campos opcionales

Para un campo opcional vacío:

preferencia:

```text
no renderizar esa fila/bloque
```

en lugar de mostrar:

```text
null
N/A
undefined
```

Si el diseño requiere consistencia, usar:

```text
No registrado
```

únicamente cuando tenga sentido.

---

# 15. Tarjeta “Resumen del postulante”

Seguir la imagen de referencia.

Organizar en dos columnas en clientes de escritorio:

```text
Nombre completo     Ciclo
Correo              Interés
Carrera             Celular
Facultad            Fecha
```

Para móviles, la tabla debe degradar de forma legible.

No perseguir responsive web complejo.

Priorizar legibilidad.

---

# 16. Colores

Utilizar aproximadamente:

```text
Azul marino:      #061B4F
Azul Fuerza UPT:  #1F66F2
Azul secundario:  #0D47B5
Fondo:            #F5F8FD
Borde:            #DDE6F2
Texto principal:  #071C48
Texto secundario: #5D6B82
Blanco:           #FFFFFF
```

Antigravity puede adaptar ligeramente los tonos para coincidir con el branding real del frontend.

---

# 17. Tipografía

Utilizar fuentes seguras:

```text
Arial
Helvetica
sans-serif
```

No depender de:

```text
Google Fonts
fuentes externas
fuentes del frontend
```

El correo debe renderizar correctamente aun cuando recursos externos estén bloqueados.

---

# 18. Iconos

La imagen de referencia utiliza pequeños iconos azules para cada dato.

En email real:

preferir:

```text
iconos simples mediante imágenes inline/CID
```

o:

```text
caracteres/símbolos compatibles
```

No depender de librerías:

```text
Lucide
Heroicons
React Icons
```

en runtime del email.

Si los iconos agregan mucha complejidad, mantener el diseño mediante pequeñas cajas azules sin depender de assets externos.

---

# 19. Bloque “Detalles de la postulación”

Seguir la imagen de referencia.

Debe contener:

```text
Detalles de la postulación
```

y el contenido relevante del formulario.

Si existe:

```text
motivación
experiencia
interés
mensaje
detalles adicionales
```

mostrarlo aquí.

No concatenar todos los campos en una tabla genérica.

---

# 20. Botón “Ver postulación”

Agregar:

```text
Ver postulación
```

Este botón debe apuntar al panel administrativo.

Ejemplo conceptual:

```text
https://fuerzaupt.pe/administracion/unete/{id}
```

La URL exacta debe basarse en las rutas reales del frontend.

No inventar una ruta que no exista.

Si todavía no existe página detalle:

```text
apuntar al listado administrativo de postulaciones
```

y dejar preparada la ruta futura.

---

# 21. URL configurable

No hardcodear:

```text
localhost:3000
```

ni dominio productivo dentro del servicio Java.

Agregar/reutilizar configuración:

```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
```

o la propiedad ya existente equivalente.

Construir:

```text
frontendUrl + ruta
```

---

# 22. Botón “Responder al postulante”

La imagen de referencia muestra:

```text
Responder al postulante
```

En email no es necesario crear necesariamente un `mailto:` si `Reply-To` ya está configurado.

Pero puede añadirse:

```html
<a href="mailto:correo-postulante">
```

para ofrecer la acción visible.

Mantener también:

```java
helper.setReplyTo(applicantEmail);
```

---

# 23. Reply-To

Arquitectura:

```text
From:
correo SMTP institucional

To:
destinatarios configurados manualmente

Reply-To:
correo del postulante
```

Esto debe mantenerse.

---

# 24. Destinatarios

Utilizar el nuevo modelo administrativo:

```text
TeamMember.notificationEmail
TeamMember.receiveApplications
```

Los destinatarios se obtienen desde:

```text
TeamMemberRepository
```

y deben ser:

```text
distinct
```

---

# 25. No mostrar destinatarios entre sí

Preferencia:

usar BCC si la privacidad interna lo requiere.

Si todos los responsables pertenecen al mismo equipo y es aceptable que vean sus correos:

```text
To múltiple
```

puede utilizarse.

La decisión debe documentarse.

---

# 26. Subject

Utilizar un subject claro:

```text
🚀 Nueva postulación recibida: {nombre}
```

Ejemplo:

```text
🚀 Nueva postulación recibida: Milton H Flores Chino
```

No depender de emojis si se detecta algún problema de encoding.

UTF-8 debe estar configurado.

---

# 27. Footer

Seguir la imagen de referencia:

```text
Mensaje generado automáticamente desde Fuerza UPT.
14 de agosto de 2026, 02:13 a. m.
```

No incluir:

```text
Sponsor
publicidad
branding FormSubmit
URLs externas innecesarias
```

---

# 28. Fecha

Utilizar zona horaria del proyecto:

```text
America/Lima
```

Formato amigable:

```text
14 de agosto de 2026, 02:13 a. m.
```

No mostrar UTC al usuario final salvo que exista razón operativa.

---

# 29. HTML escaping

Todo valor del postulante debe escapar HTML.

Ejemplo:

```java
HtmlUtils.htmlEscape(value)
```

Aplicar a:

```text
nombre
correo
carrera
facultad
ciclo
interés
celular
motivación
otros campos libres
```

---

# 30. No concatenar HTML inseguro

Está prohibido:

```java
"<div>" + applicant.getMotivation() + "</div>"
```

sin escape.

Toda entrada de usuario debe sanitizarse/escaparse.

---

# 31. Template

Preferencia arquitectónica:

separar el HTML del servicio.

Crear por ejemplo:

```text
src/main/resources/mail/team-application-notification.html
```

No mantener 300 líneas de HTML dentro de:

```text
EmailNotificationService.java
```

---

# 32. Template engine

No agregar Thymeleaf solo para esto si el proyecto no lo utiliza.

Puede implementarse un template sencillo mediante:

```text
archivo HTML
placeholders
servicio de renderizado controlado
```

o utilizar una herramienta ya presente en el proyecto.

Evitar nueva dependencia innecesaria.

---

# 33. Servicio recomendado

Separar:

```text
EmailNotificationService
```

de:

```text
TeamApplicationEmailTemplateRenderer
```

Ejemplo:

```text
TeamApplicationEventListener
        ↓
EmailNotificationService
        ↓
TeamApplicationEmailTemplateRenderer
        ↓
HTML
```

---

# 34. Responsabilidad del renderer

Debe recibir un DTO específico:

```text
TeamApplicationEmailModel
```

con solo datos ya preparados.

Ejemplo conceptual:

```java
record TeamApplicationEmailModel(
    UUID id,
    String fullName,
    String email,
    String career,
    String faculty,
    String cycle,
    String interest,
    String phone,
    String details,
    String formattedDate,
    String adminUrl
) {}
```

---

# 35. No enviar Entity directamente al template

Preferir no hacer:

```text
HTML renderer -> TeamApplication Entity
```

para evitar acoplar diseño y persistencia.

Usar modelo de email.

---

# 36. Multipart HTML

Configurar:

```java
new MimeMessageHelper(message, true, "UTF-8")
```

para soportar:

```text
HTML
logo inline
otros assets CID
```

---

# 37. Texto alternativo

Idealmente el email puede incluir:

```text
plain text alternative
```

si la implementación actual lo permite.

Ejemplo:

```text
Nueva postulación recibida
Nombre: ...
Correo: ...
```

No es obligatorio para la primera versión, pero es una buena práctica.

---

# 38. Outlook

Evitar:

```text
border-radius excesivo
background gradients complejos
CSS variables
```

porque Outlook puede ignorarlos.

La imagen de referencia sirve como guía visual, pero Antigravity debe convertirla a **HTML email compatible**, no copiar CSS web literalmente.

---

# 39. Gmail móvil

El diseño debe ser legible a aproximadamente:

```text
320–430 px
```

No usar texto diminuto.

Mínimos recomendados:

```text
body: 14–16 px
labels: 12–13 px
heading: 28–34 px desktop
```

---

# 40. CTA

Los botones deben usar tablas o enlaces inline compatibles.

Ejemplo:

```html
<a
  href="..."
  style="
    background:#1F66F2;
    color:#FFFFFF;
    padding:14px 24px;
    text-decoration:none;
    border-radius:8px;
    display:inline-block;
    font-weight:700;
  "
>
  Ver postulación
</a>
```

---

# 41. Flujo de notificación

Mantener:

```text
TeamApplication save
        ↓
COMMIT
        ↓
TeamApplicationSubmittedEvent
        ↓
@TransactionalEventListener(AFTER_COMMIT)
        ↓
@Async("notificationExecutor")
        ↓
JavaMailSender
```

No volver a enviar antes del commit.

---

# 42. Async

Debe existir un solo salto async controlado.

Preferencia:

```text
@Async("notificationExecutor")
```

en el listener.

Eliminar `@Async` adicional del método de `EmailNotificationService` si todavía existe.

---

# 43. Fallos de envío

Si SMTP falla:

```text
NO revertir la postulación
```

La aplicación ya fue guardada.

Registrar:

```text
notification delivery failed
applicationId
recipientCount
```

sin PII innecesaria.

---

# 44. Reintento

No implementar retry infinito.

Si se agrega retry:

```text
máximo 2–3 intentos
backoff
solo para errores temporales
```

No retrasar la respuesta HTTP.

---

# 45. Logs

No registrar:

```text
email completo del postulante
lista completa de destinatarios
motivación
teléfono
```

Preferir:

```text
applicationId
recipientCount
status
```

---

# 46. SMTP TLS

Mantener configuración segura:

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          starttls:
            enable: true
          ssl:
            checkserveridentity: true
```

No debilitar TLS para hacer que el diseño funcione.

---

# 47. FormSubmit fallback

Si se conserva:

```text
formsubmit-enabled=false
```

por defecto.

No utilizar FormSubmit para la apariencia principal.

Si SMTP falla:

preferencia:

```text
guardar fallo en log/observabilidad
```

antes que enviar automáticamente información personal a un tercero.

---

# 48. Assets

Crear carpeta:

```text
src/main/resources/mail/
```

Posible estructura:

```text
mail/
├── fuerza-upt-logo.png
├── team-application-notification.html
└── icons/
```

No duplicar assets innecesarios.

---

# 49. Frontend

Si el botón:

```text
Ver postulación
```

requiere una vista administrativa nueva:

Antigravity debe primero verificar si ya existe.

No crear nueva página si el listado actual permite abrir detalle.

Si existe modal:

```text
construir URL al módulo correspondiente
```

---

# 50. Diseño aprobado

El correo debe aproximarse visualmente a **la imagen de referencia que el usuario ya proporcionó a Antigravity**, especialmente:

```text
logo centrado
icono de postulación
título grande
nombre destacado
tarjeta de resumen en dos columnas
bloque de detalles
dos botones
footer institucional
```

No cambiar esta estructura salvo limitación real de cliente de email.

---

# 51. Diferencias permitidas respecto a la imagen

Se permiten ajustes necesarios por compatibilidad:

```text
menos sombras
menos border-radius
iconos simplificados
botones apilados en móvil
columnas convertidas a filas
```

No se permite cambiar:

```text
branding
jerarquía
contenido
paleta
estructura general
```

---

# 52. Skills de Antigravity

Utilizar:

```text
fuerza-feature-development
fuerza-security
fuerza-refactor
fuerza-static-verification
```

Si se modifica configuración de destinatarios:

```text
fuerza-admin-module
fuerza-jpa-persistence
fuerza-schema-contract
```

Respetar:

```text
.agents/rules/fuerza-upt-architecture.md
```

---

# 53. Prohibiciones

```text
NO JdbcTemplate
NO java.sql directo
NO Flyway
NO Liquibase
NO ddl-auto=update
NO tests automáticos
NO crear tests
NO ejecutar tests
NO reactivar FormSubmit como solución visual
```

---

# 54. Orden recomendado

```text
1. revisar EmailNotificationService actual
2. confirmar flujo JavaMailSender
3. confirmar FormSubmit deshabilitado
4. crear assets mail/
5. colocar logo oficial Fuerza UPT
6. crear template HTML compatible
7. crear EmailModel / renderer
8. adaptar EmailNotificationService
9. mantener Reply-To
10. construir adminUrl real
11. verificar destinatarios TeamMember
12. asegurar AFTER_COMMIT
13. asegurar notificationExecutor
14. asegurar HTML escaping
15. asegurar SMTP TLS
16. compilar backend sin tests
17. ejecutar static verification
18. enviar escenarios manuales al usuario
```

---

# 55. Compilación

Ejecutar:

```powershell
mvnw.cmd -DskipTests compile
```

No ejecutar tests.

---

# 56. Verificación manual

Antigravity no debe ejecutar pruebas automáticas.

El usuario comprobará manualmente al menos:

```text
Gmail móvil
Gmail web
Outlook si está disponible
```

---

# 57. Escenarios manuales

```text
1. enviar postulación completa
2. confirmar logo correcto
3. confirmar diseño similar a imagen aprobada
4. comprobar nombre dinámico
5. comprobar datos dinámicos
6. comprobar campos opcionales
7. comprobar Ver postulación
8. comprobar Responder al postulante
9. comprobar Reply-To
10. comprobar remitente
11. comprobar footer
12. comprobar móvil
13. confirmar que no aparece branding FormSubmit
14. confirmar que no aparece Sponsor/publicidad
```

---

# 58. Resultado esperado

El correo final debe percibirse como:

```text
una comunicación institucional propia de Fuerza UPT
```

y no como:

```text
un formulario procesado por un servicio externo
```

---

# 59. Definición de terminado

- [ ] correo enviado por JavaMailSender;
- [ ] FormSubmit no controla el diseño;
- [ ] logo oficial Fuerza UPT correcto;
- [ ] diseño sigue la imagen aprobada;
- [ ] HTML compatible con Gmail/Outlook;
- [ ] estilos inline;
- [ ] template separado del service;
- [ ] valores del usuario escapados;
- [ ] nombre del postulante dinámico;
- [ ] resumen dinámico;
- [ ] detalles dinámicos;
- [ ] botón Ver postulación funcional;
- [ ] botón Responder funcional;
- [ ] Reply-To configurado;
- [ ] destinatarios configurables;
- [ ] AFTER_COMMIT conservado;
- [ ] async controlado;
- [ ] SMTP TLS seguro;
- [ ] sin FormSubmit branding;
- [ ] sin publicidad;
- [ ] sin PII innecesaria en logs;
- [ ] backend compila sin tests;
- [ ] static verification pasa;
- [ ] usuario verifica manualmente el resultado.

---

# 60. Instrucción final para Antigravity

Antes de modificar el template, **observa la imagen de diseño que el usuario ya te proporcionó**.

Esa imagen es la referencia visual principal.

No quiero una reinterpretación.

Quiero que conviertas ese diseño en un **email HTML realista y compatible con Gmail/Outlook**, utilizando la arquitectura existente de Fuerza UPT:

```text
Spring Boot
JavaMailSender
AFTER_COMMIT
notificationExecutor
destinatarios configurables
Reply-To al postulante
```

No uses FormSubmit para reproducir el diseño.

El objetivo es que el destinatario reciba una notificación que visualmente se reconozca inmediatamente como **Fuerza UPT**.
