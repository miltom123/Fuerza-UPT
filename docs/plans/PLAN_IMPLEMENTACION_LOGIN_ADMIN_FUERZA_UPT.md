# PLAN PRECISO DE IMPLEMENTACIÓN — ACCESO ADMINISTRATIVO FUERZA UPT

**Proyecto revisado:** `FuerzaUPT-proyecto-2026-07-14(1).zip`  
**Frontend actual:** Next.js 16.2.10, React 19, TypeScript, Tailwind CSS v4, shadcn/ui y Radix  
**Backend previsto:** Spring Boot  
**Objetivo:** incorporar un acceso administrativo visible, ordenado y seguro, sin mezclarlo con el menú público ni implementar credenciales falsas.

---

# 1. Estado actual relevante

El proyecto ya contiene:

```text
src/components/layout/header.tsx
src/components/layout/mobile-menu.tsx
src/data/navigation.ts
src/services/api-client.ts
src/lib/constants.ts
src/app/layout.tsx
```

El encabezado actual muestra:

```text
Logo
Navegación pública
Redes sociales
Botón “Únete ahora”
Menú móvil
```

Todavía no existen:

```text
Página de login
Estado de sesión
Servicio de autenticación
Protección de rutas administrativas
Panel administrativo
Botón de cerrar sesión
Contrato de autenticación con Spring Boot
```

---

# 2. Decisión de interfaz

Se agregará un botón independiente llamado:

```text
Administración
```

Su texto accesible y su propósito será:

```text
Ingresar como administrador
```

## Ubicación en escritorio

Debe colocarse en el encabezado, entre las redes sociales y el botón **Únete ahora**:

```text
[Redes] [Administración] [Únete ahora]
```

## Estilo

El botón debe ser secundario para no competir con el llamado principal “Únete ahora”:

```text
Icono: ShieldCheck o LogIn
Fondo: blanco
Borde: azul institucional
Texto: azul oscuro
Forma: redondeada
Hover: fondo azul muy claro
```

## Comportamiento responsive

### Pantallas grandes

```text
[Icono] Administración
```

### Pantallas medianas

Mostrar un botón compacto:

```text
[Icono de escudo]
```

Con:

```text
aria-label="Ingresar como administrador"
title="Ingresar como administrador"
```

### Menú móvil

Agregar al final de la navegación pública un bloque separado:

```text
Acceso administrativo
[Ingresar como administrador]
```

No debe aparecer mezclado como una sección pública normal.

---

# 3. Comportamiento según la sesión

## Usuario no autenticado

El botón mostrará:

```text
Administración
```

Destino:

```text
/administracion/login
```

## Administrador autenticado

El mismo espacio cambiará a:

```text
Panel administrativo
```

Destino:

```text
/administracion
```

Opcionalmente puede mostrar:

```text
[Avatar o icono] Panel
```

## Sesión vencida

Redirigir a:

```text
/administracion/login?reason=expired
```

Mostrar un aviso:

```text
Tu sesión terminó. Vuelve a ingresar para continuar.
```

---

# 4. Rutas definitivas

```text
/administracion/login       Login de administrador
/administracion             Inicio del panel
/administracion/contenidos  Gestión general de contenidos
/administracion/representacion
/administracion/proyectos
/administracion/eventos
/administracion/oportunidades
/administracion/equipo
/administracion/configuracion
```

Para esta primera implementación solo son obligatorias:

```text
/administracion/login
/administracion
```

Las demás pueden quedar preparadas como navegación futura.

---

# 5. Separación de layouts

Actualmente `src/app/layout.tsx` coloca Header y Footer en todas las rutas. Esto haría que el panel administrativo también muestre la navegación pública.

Se recomienda reorganizar con grupos de rutas sin cambiar las URL visibles.

## Estructura objetivo

```text
src/app/
├── layout.tsx
│
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── representacion-estudiantil/
│   ├── proyectos/
│   ├── eventos/
│   ├── becas/
│   ├── equipo/
│   ├── unete/
│   └── contacto/
│
├── (auth)/
│   └── administracion/
│       └── login/
│           └── page.tsx
│
└── administracion/
    ├── layout.tsx
    └── page.tsx
```

## Responsabilidad de cada layout

### `src/app/layout.tsx`

Solo debe contener:

```text
<html>
<body>
Fuentes
Estilos globales
Providers globales
```

### `src/app/(public)/layout.tsx`

Debe contener:

```text
Header público
main
Footer público
```

### `src/app/(auth)/layout.tsx`

Debe contener una vista limpia:

```text
Fondo institucional suave
Logo
Contenido centrado
Sin navegación pública
Sin footer completo
```

### `src/app/administracion/layout.tsx`

Debe contener:

```text
Barra lateral administrativa
Barra superior
Nombre o correo del administrador
Botón cerrar sesión
Contenido del panel
```

---

# 6. Diseño de la página de login

## Composición visual

```text
Fondo claro con detalles azul institucional
Tarjeta centrada
Logo Fuerza UPT
Etiqueta: ACCESO RESTRINGIDO
Título: Ingresar como administrador
Texto de apoyo
Formulario
Enlace para volver al sitio
```

## Texto recomendado

```text
ACCESO RESTRINGIDO

Ingresar como administrador

Accede al panel para gestionar la representación estudiantil,
los proyectos, eventos, oportunidades y miembros del equipo.
```

## Campos

```text
Correo electrónico
Contraseña
```

## Controles

```text
Mostrar / ocultar contraseña
Botón “Ingresar al panel”
Enlace “Volver al sitio público”
```

No implementar todavía:

```text
Registro público de administradores
Ingresar con Google
Crear cuenta
Recuperar contraseña sin servicio de correo
Credenciales escritas dentro del frontend
```

## Mensajes de error

Usar mensajes genéricos:

```text
Correo o contraseña incorrectos.
No se pudo conectar con el servidor.
Tu cuenta no tiene permisos de administración.
Tu sesión terminó. Vuelve a ingresar.
```

No informar si un correo específico existe o no.

---

# 7. Validación del formulario

Usar las dependencias ya instaladas:

```text
react-hook-form
zod
@hookform/resolvers
```

No se requiere instalar otra librería.

## Esquema sugerido

```typescript
import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
```

## Estados visuales

```text
Vacío
Campo inválido
Enviando
Error de credenciales
Error de conexión
Ingreso correcto
```

Mientras se envía:

```text
Deshabilitar campos
Deshabilitar botón
Mostrar “Ingresando...”
Evitar doble envío
```

---

# 8. Archivos nuevos del frontend

```text
src/components/auth/admin-login-form.tsx
src/components/auth/password-field.tsx
src/components/auth/auth-card.tsx
src/components/admin/admin-sidebar.tsx
src/components/admin/admin-topbar.tsx
src/components/admin/admin-shell.tsx
src/services/auth-service.ts
src/types/auth.ts
src/validations/auth.ts
src/providers/auth-provider.tsx
src/hooks/use-auth.ts
```

Para una primera versión mínima son indispensables:

```text
src/components/auth/admin-login-form.tsx
src/services/auth-service.ts
src/types/auth.ts
src/validations/auth.ts
```

---

# 9. Archivos que deben modificarse

## `src/components/layout/header.tsx`

Agregar:

```text
Botón Administración
Estado autenticado / no autenticado
Enlace al login o al panel
```

La zona de acciones debe dejar de depender completamente de `xl:flex`.

Propuesta:

```text
Acciones visibles desde lg
Redes sociales visibles solo en xl o 2xl
Botón Administración visible desde lg
Botón Únete visible desde lg
```

Esto evita que el acceso desaparezca en laptops.

## `src/components/layout/mobile-menu.tsx`

Agregar un separador y el botón:

```text
Ingresar como administrador
```

Si hay sesión:

```text
Ir al panel administrativo
```

## `src/data/navigation.ts`

No agregar Administración dentro de `navigationItems`.

Debe permanecer separado porque no es contenido público.

Opcionalmente crear:

```typescript
export const adminNavigationEntry = {
  label: "Administración",
  href: "/administracion/login",
};
```

## `src/services/api-client.ts`

Agregar soporte para enviar cookies:

```typescript
credentials: "include"
```

No debe agregarse un token manual desde `localStorage`.

## `.env.example`

Mantener:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Agregar solo si el diseño final lo requiere:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

# 10. Tipos de autenticación

## `src/types/auth.ts`

```typescript
export type UserRole = "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: UserRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

export interface AuthErrorResponse {
  message: string;
  code?: string;
}
```

La estructura puede permitir después:

```text
EDITOR
COMMUNICATIONS
REPRESENTATIVE
```

Pero en la primera versión solo se autoriza:

```text
ADMIN
```

---

# 11. Servicio de autenticación frontend

## `src/services/auth-service.ts`

Debe exponer:

```typescript
login(input)
getCurrentUser()
logout()
refreshSession()
```

Contrato esperado:

```typescript
export const authService = {
  login,
  getCurrentUser,
  logout,
  refreshSession,
};
```

Todas las solicitudes deben usar:

```typescript
credentials: "include"
```

## Flujo de login

```text
1. Validar formulario.
2. Enviar POST /auth/login.
3. Spring Boot valida credenciales.
4. Spring Boot crea la sesión segura.
5. Frontend solicita /auth/me.
6. Verificar que el usuario tenga ADMIN.
7. Redirigir a /administracion.
```

---

# 12. Contrato de API para Spring Boot

Base actual:

```text
http://localhost:8080/api
```

## Endpoints obligatorios

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/refresh
```

## Login

### Solicitud

```json
{
  "email": "administrador@fuerzaupt.pe",
  "password": "contraseña"
}
```

### Respuesta correcta

```json
{
  "user": {
    "id": 1,
    "email": "administrador@fuerzaupt.pe",
    "displayName": "Administrador Fuerza UPT",
    "roles": ["ADMIN"]
  },
  "expiresAt": "2026-07-15T04:00:00Z"
}
```

### Respuesta incorrecta

```json
{
  "message": "Credenciales incorrectas",
  "code": "INVALID_CREDENTIALS"
}
```

Código HTTP:

```text
401 Unauthorized
```

## Usuario actual

```http
GET /api/auth/me
```

Debe devolver el usuario cuando la sesión sea válida.

## Cerrar sesión

```http
POST /api/auth/logout
```

Debe invalidar la sesión y eliminar las cookies.

---

# 13. Manejo seguro de sesión

## Decisión recomendada

Usar cookies:

```text
HttpOnly
Secure en producción
SameSite=Lax o configuración equivalente validada
Path restringido cuando corresponda
```

No guardar JWT en:

```text
localStorage
sessionStorage
variables globales persistentes
```

Motivo práctico:

```text
El JavaScript del navegador no debe poder leer el token de sesión.
```

## Desarrollo local

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8080
```

Spring Boot debe permitir únicamente el origen configurado y solicitudes con credenciales.

No usar:

```text
Access-Control-Allow-Origin: *
```

cuando se permiten cookies.

---

# 14. Protección de rutas administrativas

Toda ruta que empiece por:

```text
/administracion
```

excepto:

```text
/administracion/login
```

debe requerir una sesión con rol `ADMIN`.

## Comportamiento

### Sin sesión

```text
Redirigir a /administracion/login?next=/administracion
```

### Sesión sin rol ADMIN

```text
Mostrar acceso denegado o redirigir al inicio.
```

### Sesión válida

```text
Permitir cargar el panel.
```

## Importante para Codex

El proyecto incluye `AGENTS.md`, que exige revisar la documentación incluida con Next.js 16 antes de implementar interceptores o protección de rutas.

Codex debe usar el mecanismo vigente en esta versión de Next.js y no copiar una solución antigua sin comprobarla.

Además de la protección del frontend, Spring Boot debe validar el rol en cada endpoint administrativo.

La protección visual del frontend no reemplaza la seguridad del backend.

---

# 15. Panel administrativo inicial

La primera versión de `/administracion` puede ser sencilla.

## Encabezado

```text
Panel administrativo
Bienvenido, {displayName}
```

## Tarjetas de acceso

```text
Representación estudiantil
Proyectos
Eventos
Becas y oportunidades
Equipo
Noticias
```

Cada tarjeta puede mostrar:

```text
Cantidad de registros
Borradores
Publicados
Botón “Gestionar”
```

## Barra superior

```text
Ver sitio público
Nombre del administrador
Cerrar sesión
```

## Barra lateral

```text
Resumen
Representación
Proyectos
Eventos
Oportunidades
Equipo
Configuración
```

No es necesario implementar los CRUD completos en esta fase.

---

# 16. Botón cerrar sesión

Debe estar disponible en:

```text
Barra superior administrativa
Menú de usuario
```

Flujo:

```text
1. POST /api/auth/logout.
2. Limpiar estado de usuario en frontend.
3. Redirigir a /administracion/login.
4. Impedir volver al panel con datos privados en caché.
```

Texto:

```text
Cerrar sesión
```

---

# 17. Accesibilidad

El acceso debe cumplir:

```text
Labels visibles en campos
Autocompletado correcto
Mensajes de error asociados
Navegación por teclado
Focus visible
Botón mostrar contraseña con aria-label
Estado de carga anunciado
Contraste suficiente
```

Atributos recomendados:

```text
autoComplete="email"
autoComplete="current-password"
```

---

# 18. Seguridad mínima obligatoria en Spring Boot

```text
Contraseñas cifradas con BCrypt o PasswordEncoder equivalente
Usuario administrador almacenado en base de datos
Roles persistidos
Bloqueo o limitación de intentos repetidos
Errores genéricos de credenciales
Cookies seguras
CORS restringido
Validación de rol en todos los endpoints /api/admin/**
Registro de inicio y cierre de sesión
No devolver contraseñas ni hashes
No escribir credenciales en el repositorio
```

No crear un endpoint público para registrar administradores.

El primer administrador debe generarse mediante:

```text
Migración de base de datos
Comando de inicialización
Variable de entorno de bootstrap
Proceso manual controlado
```

Después de crear el primer administrador, no debe conservarse una contraseña visible en código.

---

# 19. Fases exactas de implementación

## Fase 1 — Botón y ruta visual

1. Agregar botón Administración al Header.
2. Agregar acceso al MobileMenu.
3. Crear `/administracion/login`.
4. Construir formulario visual.
5. Implementar validación local.
6. Mostrar respuesta simulada solo como estado visual, sin credenciales falsas.

**Resultado:** la interfaz está lista, pero todavía no autentica.

## Fase 2 — Reorganización de layouts

1. Dejar el layout raíz sin Header y Footer.
2. Crear layout público.
3. Crear layout de autenticación.
4. Crear layout administrativo.
5. Confirmar que las URL públicas no cambien.

**Resultado:** el panel queda separado del sitio público.

## Fase 3 — Estado de autenticación frontend

1. Crear tipos.
2. Crear `auth-service.ts`.
3. Crear AuthProvider y hook.
4. Consultar `/auth/me` al iniciar.
5. Cambiar el botón según la sesión.
6. Implementar logout.

**Resultado:** el frontend entiende si existe un administrador autenticado.

## Fase 4 — Spring Boot

1. Crear entidad Usuario.
2. Crear entidad Rol o enum.
3. Crear repositorio.
4. Configurar Spring Security.
5. Crear login, me, refresh y logout.
6. Emitir cookies seguras.
7. Configurar CORS.
8. Crear administrador inicial.

**Resultado:** login real y seguro.

## Fase 5 — Protección

1. Proteger `/administracion/**` en Next.js.
2. Proteger `/api/admin/**` en Spring Boot.
3. Validar expiración.
4. Validar rol.
5. Redirigir sesiones vencidas.

**Resultado:** usuarios públicos no pueden entrar al panel.

## Fase 6 — Panel inicial

1. Crear dashboard.
2. Añadir navegación administrativa.
3. Crear resumen de contenidos.
4. Preparar enlaces hacia futuros CRUD.

**Resultado:** acceso administrativo útil y extensible.

## Fase 7 — Pruebas

1. Login correcto.
2. Contraseña incorrecta.
3. Correo inválido.
4. Backend apagado.
5. Sesión vencida.
6. Acceso directo a ruta protegida.
7. Usuario sin ADMIN.
8. Logout.
9. Menú móvil.
10. Teclado y focus.

Ejecutar:

```powershell
npm run lint
npm run build
npm run dev
```

---

# 20. Archivos mínimos de la primera entrega

## Crear

```text
src/app/(auth)/administracion/login/page.tsx
src/components/auth/admin-login-form.tsx
src/components/auth/password-field.tsx
src/types/auth.ts
src/validations/auth.ts
src/services/auth-service.ts
```

## Modificar

```text
src/components/layout/header.tsx
src/components/layout/mobile-menu.tsx
src/services/api-client.ts
src/app/layout.tsx
.env.example
README.md
```

## En la segunda entrega

```text
src/app/administracion/layout.tsx
src/app/administracion/page.tsx
src/components/admin/admin-shell.tsx
src/components/admin/admin-sidebar.tsx
src/components/admin/admin-topbar.tsx
src/providers/auth-provider.tsx
src/hooks/use-auth.ts
```

---

# 21. Criterios de aceptación

La implementación se considerará correcta cuando:

- El Header muestre un acceso administrativo separado.
- El acceso también exista en móvil.
- El botón no forme parte del menú de contenido público.
- `/administracion/login` tenga diseño coherente con Fuerza UPT.
- El formulario valide correo y contraseña.
- No existan credenciales hardcodeadas.
- El JWT no se almacene en localStorage.
- El panel no use el Header y Footer públicos.
- Una ruta administrativa sin sesión redirija al login.
- Spring Boot valide el rol ADMIN.
- Cerrar sesión invalide realmente la sesión.
- El botón cambie a “Panel administrativo” al iniciar sesión.
- `npm run lint` y `npm run build` terminen sin errores.

---

# 22. Lo que no debe hacerse

```text
No poner usuario y contraseña dentro del frontend.
No crear un login que solo compare strings en React.
No guardar tokens en localStorage.
No permitir registro libre de administradores.
No proteger únicamente ocultando botones.
No dejar endpoints administrativos sin roles.
No mezclar el panel con el menú público.
No instalar una librería de autenticación innecesaria antes de definir Spring Boot.
No crear todavía todos los CRUD en la misma tarea.
```

---

# 23. Prompt preciso para Codex — primera etapa

```text
Analiza el proyecto actual Fuerza UPT y ejecuta únicamente la primera etapa del plan contenido en PLAN_IMPLEMENTACION_LOGIN_ADMIN_FUERZA_UPT.md.

Objetivo:
Agregar un acceso administrativo visible y construir la interfaz de login preparada para conectarse posteriormente con Spring Boot.

Cambios obligatorios:
1. Agregar en el Header un botón secundario “Administración” con icono ShieldCheck o LogIn.
2. Ubicarlo antes del botón “Únete ahora”.
3. No agregarlo dentro de navigationItems como una sección pública.
4. Agregar en MobileMenu un bloque separado “Acceso administrativo” con el botón “Ingresar como administrador”.
5. Crear la ruta /administracion/login.
6. Crear una tarjeta de login centrada y coherente con la identidad Fuerza UPT.
7. Incluir correo, contraseña, mostrar/ocultar contraseña, botón “Ingresar al panel” y enlace “Volver al sitio público”.
8. Usar React Hook Form, Zod y @hookform/resolvers, que ya están instalados.
9. Crear src/types/auth.ts, src/validations/auth.ts y src/services/auth-service.ts.
10. No implementar credenciales falsas ni comparar contraseñas en el frontend.
11. Dejar auth-service preparado para POST /auth/login, GET /auth/me y POST /auth/logout.
12. Usar credentials: "include" en las solicitudes de autenticación.
13. No guardar tokens en localStorage ni sessionStorage.
14. Mostrar estados de carga, error de validación y error de conexión.
15. Mantener responsive design y accesibilidad.
16. No construir todavía los CRUD administrativos.
17. No modificar el contenido de Representación, Proyectos, Eventos u Oportunidades.
18. Leer AGENTS.md y la documentación local de Next.js 16 antes de cambiar layouts o protección de rutas.
19. Ejecutar npm run lint y npm run build.
20. Corregir todos los errores antes de terminar.

Antes de modificar:
- Inspecciona Header, MobileMenu, layout.tsx, api-client.ts y globals.css.
- Explica brevemente qué archivos vas a crear y modificar.

Al terminar:
- Lista los archivos creados y modificados.
- Indica qué parte queda pendiente de Spring Boot.
- Reporta el resultado de lint y build.
```

---

# 24. Prompt para Codex — integración posterior con Spring Boot

```text
Continúa con la segunda etapa del plan PLAN_IMPLEMENTACION_LOGIN_ADMIN_FUERZA_UPT.md.

Objetivo:
Conectar el login administrativo con Spring Boot, manejar sesión segura y proteger el panel.

Requisitos:
- Implementar POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout y POST /api/auth/refresh.
- Usar Spring Security.
- Guardar contraseñas con PasswordEncoder.
- Usar cookies HttpOnly y Secure en producción.
- Configurar CORS para el frontend autorizado y permitir credenciales.
- Autorizar solo ROLE_ADMIN en /api/admin/**.
- No exponer registro público de administradores.
- Crear un administrador inicial de forma controlada.
- Proteger /administracion/** en Next.js usando el mecanismo vigente de Next.js 16 documentado localmente.
- Cambiar el botón Administración por Panel administrativo cuando exista sesión.
- Implementar Cerrar sesión.
- Redirigir sesiones vencidas al login.
- Probar acceso permitido y denegado.
```
