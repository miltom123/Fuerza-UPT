package pe.edu.upt.fuerzaupt.submission.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.PrivacyHashService;
import pe.edu.upt.fuerzaupt.submission.service.EmailNotificationService;
import pe.edu.upt.fuerzaupt.submission.service.NewsletterPersistenceService;
import pe.edu.upt.fuerzaupt.submission.service.SharedRateLimitService;

import pe.edu.upt.fuerzaupt.submission.entity.ContactMessage;
import pe.edu.upt.fuerzaupt.submission.entity.StudentProposal;
import pe.edu.upt.fuerzaupt.submission.entity.TeamApplication;
import pe.edu.upt.fuerzaupt.submission.entity.NewsletterSubscription;
import pe.edu.upt.fuerzaupt.submission.repository.ContactMessageRepository;
import pe.edu.upt.fuerzaupt.submission.repository.StudentProposalRepository;
import pe.edu.upt.fuerzaupt.submission.repository.TeamApplicationRepository;
import pe.edu.upt.fuerzaupt.submission.repository.NewsletterSubscriptionRepository;
import pe.edu.upt.fuerzaupt.event.entity.Event;
import pe.edu.upt.fuerzaupt.event.entity.EventRegistration;
import pe.edu.upt.fuerzaupt.event.model.RegistrationMode;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;
import pe.edu.upt.fuerzaupt.event.repository.EventRegistrationRepository;

import org.springframework.context.ApplicationEventPublisher;
import pe.edu.upt.fuerzaupt.submission.event.TeamApplicationSubmittedEvent;

import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PublicSubmissionController {

    private final ContactMessageRepository contactMessageRepository;
    private final StudentProposalRepository studentProposalRepository;
    private final TeamApplicationRepository teamApplicationRepository;
    private final NewsletterSubscriptionRepository newsletterSubscriptionRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    private final SharedRateLimitService rateLimitService;
    private final ClientIpResolver clientIpResolver;
    private final PrivacyHashService privacyHashService;
    private final ApplicationEventPublisher eventPublisher;
    private final NewsletterPersistenceService newsletterPersistenceService;

    private final EmailNotificationService emailNotificationService;

    @PostMapping("/api/contactos")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SubmissionAcceptedResponse contact(
            @Valid @RequestBody ContactRequest input,
            HttpServletRequest request
    ) {
        consume(request, "contact", 5, Duration.ofHours(1));

        ContactMessage msg = new ContactMessage();
        msg.setId(UUID.randomUUID());
        msg.setFullName(input.fullName().trim());
        msg.setEmail(input.email().trim().toLowerCase());
        msg.setSubject(input.subject());
        msg.setMessage(input.message().trim());
        msg.setIpHash(ipHash(request, "contact"));
        msg.setUserAgent(userAgent(request));

        contactMessageRepository.save(msg);
        return new SubmissionAcceptedResponse(msg.getId());
    }

    @PostMapping("/api/propuestas-estudiantiles")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SubmissionAcceptedResponse proposal(
            @Valid @RequestBody ProposalRequest input,
            HttpServletRequest request
    ) {
        consume(request, "proposal", 3, Duration.ofHours(1));

        StudentProposal proposal = new StudentProposal();
        proposal.setId(UUID.randomUUID());
        proposal.setStudentName(input.studentName().trim());
        proposal.setStudentCode(input.studentCode());
        proposal.setCareer(input.career());
        proposal.setProposalText(input.proposalText().trim());
        proposal.setIpHash(ipHash(request, "proposal"));
        proposal.setUserAgent(userAgent(request));

        studentProposalRepository.save(proposal);
        return new SubmissionAcceptedResponse(proposal.getId());
    }

    @PostMapping("/api/postulaciones-equipo")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SubmissionAcceptedResponse teamApplication(
            @Valid @RequestBody TeamApplicationRequest input,
            HttpServletRequest request
    ) {
        consume(request, "team-application", 20, Duration.ofHours(1));


        TeamApplication application = new TeamApplication();
        application.setId(UUID.randomUUID());
        application.setFullName(input.fullName().trim());
        application.setEmail(input.email().trim().toLowerCase());
        application.setMotivation(input.motivation());
        application.setIpHash(ipHash(request, "team-application"));
        application.setUserAgent(userAgent(request));

        teamApplicationRepository.save(application);

        // Publish event for AFTER_COMMIT async notification
        eventPublisher.publishEvent(new TeamApplicationSubmittedEvent(
                application.getId(),
                application.getFullName(),
                application.getEmail(),
                application.getMotivation()
        ));

        return new SubmissionAcceptedResponse(application.getId());
    }


    @PostMapping("/api/suscripciones")
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionAcceptedResponse subscription(
            @Valid @RequestBody SubscriptionRequest input,
            HttpServletRequest request
    ) {
        consume(request, "subscription", 5, Duration.ofHours(1));

        NewsletterSubscription sub = newsletterPersistenceService.subscribeWithRetry(
                input.email(),
                ipHash(request, "subscription"),
                userAgent(request)
        );

        return new SubscriptionAcceptedResponse(sub.getId().toString());
    }

    @PostMapping("/api/eventos/{eventId}/inscripciones")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SubmissionAcceptedResponse eventRegistration(
            @PathVariable UUID eventId,
            @Valid @RequestBody EventRegistrationRequest input,
            HttpServletRequest request
    ) {
        consume(request, "event-registration", 10, Duration.ofHours(1));

        Event event = eventRepository.findPublishedByIdForUpdate(eventId)
                .orElseThrow(() -> new BusinessException("La inscripcion para este evento no esta disponible."));

        if (event.getRegistrationMode() != RegistrationMode.INTERNAL
                || !Boolean.TRUE.equals(event.getRegistrationEnabled())
                || !"REGISTRATION_OPEN".equals(event.getEventStatus())) {
             throw new BusinessException("La inscripcion para este evento no esta disponible.");
        }

        LocalDate eventEnd = event.getEndDate() == null ? event.getStartDate() : event.getEndDate();
        if (eventEnd != null && eventEnd.isBefore(LocalDate.now())) {
            throw new BusinessException("El periodo de inscripcion para este evento ya termino.");
        }

        int registrations = eventRegistrationRepository.countByEventIdAndRegistrationStatusNot(eventId, "CANCELLED");

        if (event.getCapacity() != null && registrations >= event.getCapacity()) {
            throw new BusinessException("El evento alcanzo su capacidad maxima.");
        }

        String email = input.email().trim().toLowerCase();
        String code = input.studentCode() != null && !input.studentCode().isBlank() ? input.studentCode().trim() : null;

        if (eventRegistrationRepository.existsByEventIdAndEmailIgnoreCaseOrEventIdAndStudentCodeIgnoreCase(
                eventId, email, eventId, code)) {
            throw new BusinessException("Ya existe una inscripcion para este correo o codigo en el evento.");
        }

        EventRegistration reg = new EventRegistration();
        reg.setId(UUID.randomUUID());
        reg.setEvent(event);
        reg.setFullName(input.fullName().trim());
        reg.setEmail(email);
        reg.setPhone(input.phone());
        reg.setCareer(input.career());
        reg.setStudentCode(code);
        reg.setIpHash(ipHash(request, "event-registration"));
        reg.setUserAgent(userAgent(request));

        eventRegistrationRepository.save(reg);

        if (event.getCapacity() != null && (registrations + 1) >= event.getCapacity()) {
            event.setEventStatus("FULL");
            event.setRegistrationEnabled(false);
            eventRepository.save(event);
        }

        return new SubmissionAcceptedResponse(reg.getId());
    }

    private void consume(HttpServletRequest request, String operation, int limit, Duration duration) {
        String protectedClient = privacyHashService.hash(clientIpResolver.resolve(request), "rate:" + operation);
        rateLimitService.consume(operation, protectedClient, limit, duration);
    }

    private String ipHash(HttpServletRequest request, String scope) {
        return privacyHashService.hash(clientIpResolver.resolve(request), scope);
    }

    private String userAgent(HttpServletRequest request) {
        String value = request.getHeader("User-Agent");
        return value == null || value.length() <= 512 ? value : value.substring(0, 512);
    }

    public record SubmissionAcceptedResponse(UUID id) {
    }

    public record SubscriptionAcceptedResponse(String email) {
    }

    public record ContactRequest(
            @NotBlank @Size(max = 255) String fullName,
            @NotBlank @Email @Size(max = 255) String email,
            @Size(max = 255) String subject,
            @NotBlank @Size(max = 5000) String message
    ) {
    }

    public record ProposalRequest(
            @NotBlank @Size(max = 255) String studentName,
            @Size(max = 50) String studentCode,
            @Size(max = 255) String career,
            @NotBlank @Size(max = 5000) String proposalText
    ) {
    }

    public record TeamApplicationRequest(
            @NotBlank @Size(max = 255) String fullName,
            @NotBlank @Email @Size(max = 255) String email,
            @Size(max = 5000) String motivation
    ) {
    }

    public record SubscriptionRequest(
            @NotBlank @Email @Size(max = 255) String email
    ) {
    }

    public record EventRegistrationRequest(
            @NotBlank @Size(max = 255) String fullName,
            @NotBlank @Email @Size(max = 255) String email,
            @Size(max = 50) String phone,
            @Size(max = 255) String career,
            @Size(max = 50) String studentCode
    ) {
    }
}
