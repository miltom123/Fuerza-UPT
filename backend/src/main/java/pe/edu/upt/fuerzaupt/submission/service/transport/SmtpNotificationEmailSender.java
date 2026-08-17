package pe.edu.upt.fuerzaupt.submission.service.transport;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.List;
import java.util.UUID;

@Slf4j
public class SmtpNotificationEmailSender implements NotificationEmailSender {

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public SmtpNotificationEmailSender(JavaMailSender mailSender, String mailFrom) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom != null ? mailFrom.trim() : "";
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
            log.warn("Notificación SMTP omitida: no hay destinatarios para applicationId={}", applicationId);
            return;
        }

        if (this.mailSender == null) {
            log.error("JavaMailSender no está disponible en este entorno. No se puede enviar notificación: applicationId={}", applicationId);
            return;
        }

        int successCount = 0;
        int recipientIndex = 0;

        for (String recipient : recipients) {
            recipientIndex++;
            try {
                MimeMessage message = this.mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                if (this.mailFrom != null && !this.mailFrom.isBlank()) {
                    helper.setFrom(this.mailFrom);
                }
                if (applicantEmail != null && !applicantEmail.isBlank()) {
                    helper.setReplyTo(applicantEmail.trim());
                }

                ClassPathResource logoRes = new ClassPathResource("mail/fuerza-upt-logo.png");
                if (logoRes.exists()) {
                    helper.addInline("fuerzaUptLogo", logoRes, "image/png");
                }

                this.mailSender.send(message);
                successCount++;

                log.info("Team application notification sent via SMTP: applicationId={}, provider=SMTP, recipientIndex={}/{}, status=SENT",
                        applicationId, recipientIndex, recipients.size());

            } catch (Exception ex) {
                String errorCode = ex.getClass().getSimpleName();
                log.error("Fallo el envío de notificación por SMTP: applicationId={}, provider=SMTP, recipientIndex={}/{}, status=FAILED, errorCode={}, error={}",
                        applicationId, recipientIndex, recipients.size(), errorCode, ex.getMessage());
            }
        }

        log.info("SMTP notification batch finalizado: applicationId={}, provider=SMTP, totalRecipients={}, sentSuccessfully={}",
                applicationId, recipients.size(), successCount);
    }
}
