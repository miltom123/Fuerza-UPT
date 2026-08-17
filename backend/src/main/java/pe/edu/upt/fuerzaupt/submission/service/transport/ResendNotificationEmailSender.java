package pe.edu.upt.fuerzaupt.submission.service.transport;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
public class ResendNotificationEmailSender implements NotificationEmailSender {

    private final String mailFrom;
    private final Resend resendClient;

    public ResendNotificationEmailSender(String apiKey, String mailFrom) {
        String cleanApiKey = apiKey != null ? apiKey.trim() : "";
        String cleanMailFrom = mailFrom != null ? mailFrom.trim() : "";

        if (cleanApiKey.isBlank()) {
            log.error("Configuración inválida: APP_MAIL_PROVIDER=resend pero RESEND_API_KEY no está definida o está vacía");
            throw new IllegalStateException("RESEND_API_KEY es obligatoria cuando APP_MAIL_PROVIDER=resend");
        }
        if (cleanMailFrom.isBlank()) {
            log.error("Configuración inválida: APP_MAIL_PROVIDER=resend pero APP_MAIL_FROM no está definida o está vacía");
            throw new IllegalStateException("APP_MAIL_FROM es obligatoria cuando APP_MAIL_PROVIDER=resend");
        }

        this.mailFrom = cleanMailFrom;
        this.resendClient = new Resend(cleanApiKey);
        log.info("ResendNotificationEmailSender inicializado correctamente con remitente configurado.");
    }

    @Override
    public void sendTeamApplicationNotification(
            UUID applicationId,
            String subject,
            String applicantEmail,
            String htmlContent,
            List<String> recipients
    ) {
        if (recipients == null || recipients.isEmpty()) {
            log.warn("Notificación Resend omitida: no hay destinatarios válidos para applicationId={}", applicationId);
            return;
        }

        int successCount = 0;
        int recipientIndex = 0;

        for (String recipient : recipients) {
            recipientIndex++;
            String entityRefId = String.format("team-app-%s-%d", applicationId, recipientIndex);

            try {
                Map<String, String> headers = new HashMap<>();
                headers.put("X-Entity-Ref-ID", entityRefId);
                headers.put("Idempotency-Key", entityRefId);

                CreateEmailOptions.Builder optionsBuilder = CreateEmailOptions.builder()
                        .from(this.mailFrom)
                        .to(recipient)
                        .subject(subject)
                        .html(htmlContent)
                        .headers(headers);

                if (applicantEmail != null && !applicantEmail.isBlank()) {
                    optionsBuilder.replyTo(applicantEmail.trim());
                }

                CreateEmailOptions params = optionsBuilder.build();
                CreateEmailResponse response = this.resendClient.emails().send(params);

                String messageId = response != null ? response.getId() : null;
                successCount++;

                log.info("Team application notification sent via Resend: applicationId={}, provider=RESEND, recipientIndex={}/{}, providerMessageId={}, status=SENT",
                        applicationId, recipientIndex, recipients.size(), messageId);

            } catch (Exception ex) {
                String errorCode = ex.getClass().getSimpleName();
                log.error("Fallo el envío de notificación por Resend: applicationId={}, provider=RESEND, recipientIndex={}/{}, status=FAILED, errorCode={}, error={}",
                        applicationId, recipientIndex, recipients.size(), errorCode, ex.getMessage());
            }
        }

        log.info("Resend notification batch finalizado: applicationId={}, provider=RESEND, totalRecipients={}, sentSuccessfully={}",
                applicationId, recipients.size(), successCount);
    }
}
