package pe.edu.upt.fuerzaupt.email.sender;

import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Slf4j
@Component
public class GmailApiNotificationEmailSender implements NotificationEmailSender {

    private static final String APPLICATION_NAME = "Fuerza UPT API";
    private static final String SENDER_USER = "me";

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;

    private Gmail gmailService;

    public GmailApiNotificationEmailSender(
            @Value("${app.gmail-mail.client-id:}") String clientId,
            @Value("${app.gmail-mail.client-secret:}") String clientSecret,
            @Value("${app.gmail-mail.refresh-token:}") String refreshToken
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
    }

    @PostConstruct
    public void init() {
        if (isBlank(clientId) || isBlank(clientSecret) || isBlank(refreshToken)) {
            log.warn("Gmail API credentials not configured (app.gmail-mail.*). Gmail email sender will be unavailable.");
            return;
        }

        try {
            NetHttpTransport transport = new NetHttpTransport();
            GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                    .setTransport(transport)
                    .setJsonFactory(jsonFactory)
                    .setTokenServerUrl(new GenericUrl("https://oauth2.googleapis.com/token"))
                    .setClientAuthentication(new ClientParametersAuthentication(clientId, clientSecret))
                    .build()
                    .setRefreshToken(refreshToken);

            this.gmailService = new Gmail.Builder(transport, jsonFactory, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

            log.info("Gmail API email sender initialized (provider=GMAIL_API, sender=somos.fuerzaupt@gmail.com)");
        } catch (Exception e) {
            log.error("Failed to initialize Gmail API service: {}", e.getMessage(), e);
        }
    }

    @Override
    public void send(MimeMessage message) {
        if (gmailService == null) {
            throw new IllegalStateException("Gmail API service not initialized. Check app.gmail-mail.* configuration.");
        }

        try {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            message.writeTo(buffer);
            byte[] rawBytes = buffer.toByteArray();

            String encodedEmail = java.util.Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(rawBytes);

            Message gmailMessage = new Message();
            gmailMessage.setRaw(encodedEmail);

            Message sent = gmailService.users().messages().send(SENDER_USER, gmailMessage).execute();

            log.info("Email sent via Gmail API: provider=GMAIL_API, gmailMessageId={}, status=SENT",
                    sent.getId());

        } catch (Exception e) {
            log.error("Gmail API send failed: errorCode={}, description={}",
                    e.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Gmail API send failed: " + e.getMessage(), e);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
