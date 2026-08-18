package pe.edu.upt.fuerzaupt.submission.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import pe.edu.upt.fuerzaupt.email.sender.NotificationEmailSender;
import pe.edu.upt.fuerzaupt.submission.dto.TeamApplicationEmailModel;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class EmailNotificationService {

    private final NotificationEmailSender gmailSender;
    private final JavaMailSender mailSender;
    private final TeamApplicationEmailTemplateRenderer templateRenderer;

    @Value("${app.notification.team-emails:equipo@fuerzaupt.pe}")
    private String teamEmailsConfig;

    @Value("${app.notification.team-fallback-enabled:false}")
    private boolean teamFallbackEnabled;

    @Value("${app.gmail-mail.sender:somos.fuerzaupt@gmail.com}")
    private String mailFrom;

    @Value("${app.frontend.origin:http://localhost:3000}")
    private String frontendOrigin;

    public EmailNotificationService(
            NotificationEmailSender gmailSender,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            TeamApplicationEmailTemplateRenderer templateRenderer
    ) {
        this.gmailSender = gmailSender;
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.templateRenderer = templateRenderer;
    }

    public void sendTeamApplicationNotification(
            UUID applicationId,
            String fullName,
            String applicantEmail,
            String motivation,
            List<String> configuredRecipients
    ) {
        List<String> recipients = configuredRecipients != null && !configuredRecipients.isEmpty()
                ? configuredRecipients.stream().filter(r -> r != null && !r.isBlank()).map(String::trim).distinct().toList()
                : List.of();

        if (recipients.isEmpty() && teamFallbackEnabled && teamEmailsConfig != null && !teamEmailsConfig.isBlank()) {
            recipients = Arrays.stream(teamEmailsConfig.split(","))
                    .map(String::trim)
                    .filter(e -> !e.isEmpty())
                    .distinct()
                    .toList();
        }

        if (recipients.isEmpty()) {
            log.warn("No se encontraron destinatarios configurados para la notificación de postulación: applicationId={}", applicationId);
            return;
        }

        ZoneId peruZone = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(peruZone);
        String formattedDate = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mma").format(now).toLowerCase();
        String footerDate = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy, hh:mm a", new Locale("es", "PE")).format(now);

        ParsedMotivation parsed = parseMotivation(motivation);
        String adminUrl = frontendOrigin + "/administracion/unete";
        String replySubject = "Respuesta a tu postulación en Fuerza UPT";
        String subject = "\uD83D\uDE80 Nueva postulación recibida: " + (fullName != null ? fullName.trim() : "Postulante");

        TeamApplicationEmailModel model = new TeamApplicationEmailModel(
                applicationId,
                fullName,
                applicantEmail,
                parsed.career,
                parsed.faculty,
                parsed.cycle,
                parsed.interest,
                parsed.phone,
                motivation,
                formattedDate,
                footerDate,
                adminUrl,
                replySubject
        );

        String htmlContent = templateRenderer.render(model);

        int sentCount = 0;
        for (String recipient : recipients) {
            try {
                MimeMessage message = buildMimeMessage(recipient, subject, htmlContent, applicantEmail);

                gmailSender.send(message);
                sentCount++;
            } catch (Exception ex) {
                log.error("Fallo el envío de notificación para applicationId={}, recipient={}: {}",
                        applicationId, recipient, ex.getMessage());
            }
        }

        log.info("Team application notification sent via GMAIL_API: applicationId={}, recipientCount={}", applicationId, sentCount);
    }

    private MimeMessage buildMimeMessage(String recipient, String subject, String htmlContent, String replyTo) throws Exception {
        jakarta.mail.Session session = jakarta.mail.Session.getInstance(new java.util.Properties());
        MimeMessage message = new MimeMessage(session);

        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(mailFrom);

        if (replyTo != null && !replyTo.isBlank()) {
            helper.setReplyTo(replyTo.trim());
        }

        ClassPathResource logoRes = new ClassPathResource("mail/fuerza-upt-logo.png");
        if (logoRes.exists()) {
            helper.addInline("fuerzaUptLogo", logoRes, "image/png");
        }

        return message;
    }

    private ParsedMotivation parseMotivation(String motivation) {
        if (motivation == null || motivation.isBlank()) {
            return new ParsedMotivation("No especificada", "Ingeniería", "No especificado", "No especificado", "No especificado");
        }

        String career = extractRegex(motivation, "Carrera:\\s*([^,(]+)");
        String faculty = extractRegex(motivation, "\\((?:Facultad de\\s*)?([^)]+)\\)");
        String cycle = extractRegex(motivation, "Ciclo:\\s*([^,]+)");
        String interest = extractRegex(motivation, "Inter[ée]s:\\s*([^,]+)");
        String phone = extractRegex(motivation, "Celular:\\s*([^,\\n]+)");

        if (career == null) career = "No especificada";
        if (faculty == null) faculty = "Ingeniería";
        if (cycle == null) cycle = "No especificado";
        if (interest == null) interest = "Proyectos y Liderazgo";
        if (phone == null) phone = "No especificado";

        return new ParsedMotivation(career.trim(), faculty.trim(), cycle.trim(), interest.trim(), phone.trim());
    }

    private String extractRegex(String source, String regex) {
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(source);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private record ParsedMotivation(String career, String faculty, String cycle, String interest, String phone) {}
}
