package pe.edu.upt.fuerzaupt.submission.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pe.edu.upt.fuerzaupt.submission.event.TeamApplicationSubmittedEvent;
import pe.edu.upt.fuerzaupt.team.entity.TeamMember;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.util.List;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class TeamApplicationEventListener {

    private final EmailNotificationService emailNotificationService;
    private final TeamMemberRepository teamMemberRepository;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleTeamApplicationSubmitted(TeamApplicationSubmittedEvent event) {
        log.info("Procesando evento TeamApplicationSubmittedEvent para applicationId={}", event.id());
        try {
            List<String> recipients = teamMemberRepository
                    .findApplicationNotificationRecipients()
                    .stream()
                    .map(TeamMember::getNotificationEmail)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(email -> !email.isBlank())
                    .distinct()
                    .toList();

            emailNotificationService.sendTeamApplicationNotification(
                    event.id(),
                    event.fullName(),
                    event.email(),
                    event.motivation(),
                    recipients
            );
        } catch (Exception ex) {
            log.error("Fallo al enviar notificación por correo tras commit de TeamApplication: {}", ex.getMessage(), ex);
        }
    }
}
