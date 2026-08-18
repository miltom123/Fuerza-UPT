package pe.edu.upt.fuerzaupt.email.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GmailMailerConfig {

    public static final String PROVIDER_PROPERTY = "app.gmail-mail.provider";
    public static final String PROVIDER_GMAIL_API = "gmail-api";
}
