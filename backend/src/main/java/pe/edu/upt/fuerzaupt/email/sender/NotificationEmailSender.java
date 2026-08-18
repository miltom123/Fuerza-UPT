package pe.edu.upt.fuerzaupt.email.sender;

import jakarta.mail.internet.MimeMessage;

public interface NotificationEmailSender {

    void send(MimeMessage message);
}
