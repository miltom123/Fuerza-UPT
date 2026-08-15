# Plan de implementación — Correos internos por integrante para postulaciones “Únete”
## Fuerza UPT Backend + Frontend Administrativo

**Objetivo:** permitir que cada integrante del equipo tenga un correo interno de notificaciones y definir manualmente qué integrantes recibirán las postulaciones enviadas desde el apartado **“Únete”**, sin confundir ese correo con el correo público mostrado en la web.

---

# 1. Decisión arquitectónica

Se deben separar dos conceptos distintos:

```text
TeamMember.email
        ↓
correo público del integrante
        ↓
visible en la web pública

TeamMember.notificationEmail
        ↓
correo interno de notificaciones
        ↓
NO visible públicamente
```

Además, cada integrante tendrá una bandera:

```text
receiveApplications
```

que determinará si debe recibir las nuevas postulaciones de “Únete”.

---

# 2. Modelo objetivo

Cada integrante debe manejar:

```text
TeamMember
├── name
├── role
├── career
├── email                  ← correo público opcional
├── notificationEmail      ← correo interno privado
├── receiveApplications    ← true / false
├── instagram
├── linkedin
├── facebook
├── x
└── ...
```

---

# 3. Flujo esperado

```text
POST /api/postulaciones-equipo
        ↓
TeamApplication
        ↓
COMMIT
        ↓
TeamApplicationSubmittedEvent
        ↓
AFTER_COMMIT
        ↓
TeamApplicationEventListener
        ↓
TeamMemberRepository
        ↓
miembros con receiveApplications=true
        ↓
notificationEmail
        ↓
EmailNotificationService
        ↓
envío a destinatarios configurados manualmente
```

---

# 4. Backend — ampliar TeamMember

Agregar a `TeamMember.java`:

```java
@Column(name = "notification_email", length = 255)
private String notificationEmail;

@Column(name = "receive_applications", nullable = false)
private Boolean receiveApplications = false;
```

No reutilizar automáticamente `email` como correo interno.

---

# 5. DTOs administrativos

Agregar a los DTO de creación y edición:

```java
@Email
@Size(max = 255)
String notificationEmail,

Boolean receiveApplications
```

Validación recomendada:

```text
receiveApplications = true
        ↓
notificationEmail obligatorio
```

Si está marcado y falta correo:

```text
400 BusinessException
"Debe registrar un correo de notificaciones."
```

---

# 6. API pública

No exponer:

```text
notificationEmail
receiveApplications
```

en:

```text
/api/equipo
/api/public/**
TeamMemberPublicResponse
```

Solo el correo público `email` puede salir hacia la web.

---

# 7. Repository para destinatarios

Agregar en `TeamMemberRepository` una consulta equivalente a:

```java
@Query("""
    select t
    from TeamMember t
    where t.receiveApplications = true
      and t.notificationEmail is not null
      and t.notificationEmail <> ''
""")
List<TeamMember> findApplicationNotificationRecipients();
```

No vincular obligatoriamente la recepción de correos a que el perfil esté publicado.

Un responsable administrativo puede recibir postulaciones aunque su perfil no sea público.

---

# 8. Listener AFTER_COMMIT

Mantener la arquitectura actual:

```text
TeamApplicationSubmittedEvent
        ↓
TeamApplicationEventListener
        ↓
@TransactionalEventListener(AFTER_COMMIT)
```

Resolver los destinatarios desde `TeamMemberRepository`.

Ejemplo:

```java
List<String> recipients = teamMemberRepository
        .findApplicationNotificationRecipients()
        .stream()
        .map(TeamMember::getNotificationEmail)
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(email -> !email.isBlank())
        .distinct()
        .toList();
```

Después:

```java
emailNotificationService.sendTeamApplicationNotification(
    application,
    recipients
);
```

---

# 9. EmailNotificationService

Modificar para recibir:

```java
List<String> recipients
```

Ejemplo conceptual:

```java
public void sendTeamApplicationNotification(
        TeamApplication application,
        List<String> recipients
) {
    if (recipients.isEmpty()) {
        log.warn(
            "Team application notification skipped: no configured recipients"
        );
        return;
    }

    helper.setTo(recipients.toArray(String[]::new));
}
```

---

# 10. TEAM_NOTIFICATION_EMAILS

No eliminarlo inmediatamente.

Convertirlo en fallback opcional.

```text
destinatarios configurados en TeamMember
            ↓
      ¿existe alguno?
       /          \
      Sí          No
      ↓            ↓
enviar        fallback opcional
              TEAM_NOTIFICATION_EMAILS
```

Agregar configuración:

```yaml
app:
  notification:
    team-fallback-enabled: false
```

Una vez validado el nuevo modelo, se puede retirar `TEAM_NOTIFICATION_EMAILS`.

---

# 11. Frontend administrativo

En:

```text
Administración
→ Equipo
→ Editar integrante
```

mantener:

```text
CORREO PÚBLICO
```

y agregar una sección separada:

```text
┌─────────────────────────────────────────────┐
│ NOTIFICACIONES INTERNAS                     │
│                                             │
│ Correo para postulaciones                   │
│ [ coordinacion@fuerzaupt.pe              ] │
│                                             │
│ [✓] Recibir postulaciones de “Únete”        │
│                                             │
│ Este correo es privado y no se mostrará     │
│ públicamente.                               │
└─────────────────────────────────────────────┘
```

---

# 12. Listado administrativo

Agregar una columna o indicador:

```text
Notificaciones
```

Ejemplo:

```text
Milton H.     Gerente de TI       ✓ Recibe postulaciones
Andrea F.     Coordinación         ✓ Recibe postulaciones
Carlos R.     Voluntariado         —
```

No es necesario mostrar el correo completo en la tabla.

---

# 13. Base de datos

Actualizar:

```text
database/schema-final.sql
```

Agregar en `team_members`:

```sql
notification_email VARCHAR(255),
receive_applications BOOLEAN NOT NULL DEFAULT FALSE
```

---

# 14. DDL manual

Como el proyecto trabaja sin Flyway/Liquibase, entregar al usuario:

```sql
ALTER TABLE team_members
    ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);

ALTER TABLE team_members
    ADD COLUMN IF NOT EXISTS receive_applications BOOLEAN NOT NULL DEFAULT FALSE;
```

Antigravity no debe ejecutar automáticamente este DDL contra producción/Supabase.

---

# 15. Constraint PostgreSQL recomendado

```sql
ALTER TABLE team_members
ADD CONSTRAINT chk_team_notification_email
CHECK (
    receive_applications = FALSE
    OR (
        notification_email IS NOT NULL
        AND btrim(notification_email) <> ''
    )
);
```

Así PostgreSQL evita:

```text
receive_applications = true
notification_email = null
```

---

# 16. Duplicados

Antes de enviar:

```java
.distinct()
```

para evitar destinatarios repetidos.

---

# 17. Privacidad

`notificationEmail` no debe aparecer en:

```text
/api/equipo
/api/public/**
HTML público
metadata pública
analytics
logs
```

No registrar direcciones completas en logs.

Preferir:

```text
Team application notification dispatched to 3 recipient(s)
```

---

# 18. Cuando no hay destinatarios

La postulación NO debe fallar.

```text
TeamApplication se guarda ✅
correo no se envía ⚠️
```

Log seguro:

```text
No team application notification recipients configured
```

La postulación debe continuar visible en el panel administrativo.

---

# 19. Reply-To

Mantener:

```text
From:
no-reply@fuerzaupt.pe

To:
destinatarios internos configurados

Reply-To:
correo del postulante
```

---

# 20. Skills obligatorias para Antigravity

Utilizar:

```text
fuerza-feature-development
fuerza-jpa-persistence
fuerza-schema-contract
fuerza-security
fuerza-admin-module
fuerza-static-verification
```

Respetar permanentemente:

```text
.agents/rules/fuerza-upt-architecture.md
```

---

# 21. Prohibiciones

Durante esta implementación:

```text
NO JdbcTemplate.
NO java.sql directo.
NO Flyway.
NO Liquibase.
NO ddl-auto=update.
NO microservicios.
NO tests automáticos.
NO crear tests.
NO ejecutar tests.
```

---

# 22. Orden de implementación

```text
1. ampliar TeamMember
2. actualizar schema-final.sql
3. entregar DDL manual
4. ampliar DTOs admin
5. actualizar TeamMemberService
6. agregar repository de destinatarios
7. adaptar TeamApplicationEventListener
8. adaptar EmailNotificationService
9. mantener fallback opcional
10. modificar modal administrativo
11. agregar indicador en listado
12. compilar backend sin tests
13. compilar frontend sin tests
14. ejecutar fuerza-static-verification
```

---

# 23. Compilación

Backend:

```powershell
mvnw.cmd -DskipTests compile
```

Frontend:

```text
ejecutar build/compile normal del proyecto
sin tests
```

---

# 24. Verificación estática

Ejecutar:

```text
fuerza-static-verification
```

Confirmar:

```text
JDBC explícito: 0
Flyway: 0
Liquibase: 0
Schema sincronizado: SÍ
Rutas duplicadas: 0
Legacy: 0
Tests creados/ejecutados: NO
```

---

# 25. Verificación manual sugerida

Antigravity no ejecuta estas pruebas.

El usuario debe verificar manualmente:

```text
1. crear integrante sin correo interno
2. crear integrante con correo interno y receiveApplications=false
3. crear integrante con correo interno y receiveApplications=true
4. intentar receiveApplications=true sin correo
5. enviar formulario Únete
6. confirmar que reciben correo solo los seleccionados
7. confirmar que los no seleccionados no reciben
8. confirmar que destinatarios duplicados reciben un solo correo
9. confirmar Reply-To hacia el postulante
10. confirmar que el correo interno no aparece públicamente
```

---

# 26. Resultado arquitectónico final

```text
                   EQUIPO
                     │
        ┌────────────┴────────────┐
        │                         │
 correo público          correo notificaciones
     email               notificationEmail
        │                         │
     web pública           panel interno
                                  │
                         receiveApplications
                                  │
                                  ▼
                             ÚNETE FORM
                                  │
                                  ▼
                           TeamApplication
                                  │
                                COMMIT
                                  │
                                  ▼
                     TeamApplicationSubmittedEvent
                                  │
                            AFTER_COMMIT
                                  │
                                  ▼
                  miembros configurados manualmente
                                  │
                                  ▼
                               EMAIL
```

---

# 27. Definición de terminado

La funcionalidad se considera terminada cuando:

- [ ] cada integrante puede registrar correo público;
- [ ] cada integrante puede registrar correo interno;
- [ ] puede marcarse manualmente quién recibe postulaciones;
- [ ] el correo interno no se expone públicamente;
- [ ] `TeamMemberRepository` obtiene solo destinatarios habilitados;
- [ ] se eliminan destinatarios duplicados;
- [ ] las postulaciones se guardan aunque no haya destinatarios;
- [ ] las notificaciones se envían AFTER_COMMIT;
- [ ] Reply-To apunta al postulante;
- [ ] `schema-final.sql` está actualizado;
- [ ] DDL manual fue entregado;
- [ ] no se introdujo JDBC;
- [ ] no se introdujo Flyway/Liquibase;
- [ ] backend compila sin tests;
- [ ] frontend compila sin tests;
- [ ] static verification pasa;
- [ ] pruebas manuales fueron realizadas por el usuario.

---

# 28. Resultado esperado en UX

En **Editar integrante** deben existir claramente dos campos diferentes:

```text
Correo público
[ usuario@correo.com ]

Notificaciones internas
Correo para postulaciones
[ coordinacion@fuerzaupt.pe ]

[✓] Recibir postulaciones de “Únete”
```

Texto de ayuda:

```text
Este correo es privado y se utilizará únicamente para notificaciones internas.
```

Esto mantiene separados:

```text
identidad pública
```

y:

```text
responsabilidad administrativa
```

que es la solución más coherente con la arquitectura actual de Fuerza UPT.
