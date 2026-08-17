package pe.edu.upt.fuerzaupt.submission.service.transport;

import java.util.List;
import java.util.UUID;

public interface NotificationEmailSender {

    void sendTeamApplicationNotification(
            UUID applicationId,
            String subject,
            String applicantEmail,
            String htmlContent,
            List<String> recipients
    );
}
