package pe.edu.upt.fuerzaupt.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import pe.edu.upt.fuerzaupt.submission.service.transport.NoopNotificationEmailSender;
import pe.edu.upt.fuerzaupt.submission.service.transport.NotificationEmailSender;
import pe.edu.upt.fuerzaupt.submission.service.transport.ResendNotificationEmailSender;
import pe.edu.upt.fuerzaupt.submission.service.transport.SmtpNotificationEmailSender;

@Slf4j
@Configuration
public class MailConfig {

    @Bean
    public NotificationEmailSender notificationEmailSender(
            @Value("${app.mail.provider:smtp}") String provider,
            @Value("${app.mail.from:}") String appMailFrom,
            @Value("${spring.mail.username:}") String springMailUsername,
            @Value("${app.mail.resend.api-key:}") String resendApiKey,
            ObjectProvider<JavaMailSender> javaMailSenderProvider
    ) {
        String cleanProvider = provider != null ? provider.trim().toLowerCase() : "smtp";
        String resolvedFrom = (appMailFrom != null && !appMailFrom.isBlank()) ? appMailFrom.trim() : springMailUsername;

        log.info("Configurando transporte de correo: provider={}", cleanProvider);

        if ("resend".equalsIgnoreCase(cleanProvider)) {
            return new ResendNotificationEmailSender(resendApiKey, resolvedFrom);
        } else if ("disabled".equalsIgnoreCase(cleanProvider) || "none".equalsIgnoreCase(cleanProvider) || "noop".equalsIgnoreCase(cleanProvider)) {
            return new NoopNotificationEmailSender();
        } else {
            JavaMailSender mailSender = javaMailSenderProvider.getIfAvailable();
            return new SmtpNotificationEmailSender(mailSender, resolvedFrom);
        }
    }
}
