package pe.edu.upt.fuerzaupt.submission.service.transport;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
public class NoopNotificationEmailSender implements NotificationEmailSender {

    @Override
    public void sendTeamApplicationNotification(
            UUID applicationId,
            String subject,
            String applicantEmail,
            String htmlContent,
            List<String> recipients
    ) {
        log.info("Notificación por correo desactivada (provider=DISABLED): applicationId={}, recipientCount={}",
                applicationId, recipients != null ? recipients.size() : 0);
    }
}
