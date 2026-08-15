package pe.edu.upt.fuerzaupt.submission.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.util.HtmlUtils;
import pe.edu.upt.fuerzaupt.submission.dto.TeamApplicationEmailModel;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class TeamApplicationEmailTemplateRenderer {

    private static final String TEMPLATE_PATH = "mail/team-application-notification.html";
    private String cachedTemplate;

    public String render(TeamApplicationEmailModel model) {
        String template = getTemplate();

        String safeFullName = escape(model.fullName());
        String safeEmail = escape(model.email());
        String safeCareer = escape(model.career());
        String safeFaculty = escape(model.faculty());
        String safeCycle = escape(model.cycle());
        String safeInterest = escape(model.interest());
        String safePhone = escape(model.phone());
        String safeFormattedDate = escape(model.formattedDate());
        String safeFooterDate = escape(model.footerDate());
        String safeAdminUrl = escape(model.adminUrl());
        String safeReplySubject = escape(model.replySubject());

        return template
                .replace("{{FULL_NAME}}", safeFullName)
                .replace("{{EMAIL}}", safeEmail)
                .replace("{{CAREER}}", safeCareer)
                .replace("{{FACULTY}}", safeFaculty)
                .replace("{{SEMESTER}}", safeCycle)
                .replace("{{INTEREST}}", safeInterest)
                .replace("{{PHONE}}", safePhone)
                .replace("{{DATE}}", safeFormattedDate)
                .replace("{{FOOTER_DATE}}", safeFooterDate)
                .replace("{{ADMIN_URL}}", safeAdminUrl)
                .replace("{{REPLY_SUBJECT}}", safeReplySubject);
    }

    private synchronized String getTemplate() {
        if (cachedTemplate != null) {
            return cachedTemplate;
        }
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            try (InputStream is = resource.getInputStream()) {
                cachedTemplate = StreamUtils.copyToString(is, StandardCharsets.UTF_8);
                return cachedTemplate;
            }
        } catch (IOException e) {
            log.error("No se pudo cargar la plantilla de correo desde {}: {}", TEMPLATE_PATH, e.getMessage());
            throw new IllegalStateException("Plantilla de correo no disponible", e);
        }
    }

    private String escape(String input) {
        if (input == null) {
            return "";
        }
        return HtmlUtils.htmlEscape(input.trim());
    }
}
