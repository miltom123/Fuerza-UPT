package pe.edu.upt.fuerzaupt.admin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.dto.AdminAuditResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminSubmissionResponse;
import pe.edu.upt.fuerzaupt.admin.entity.AuditLog;
import pe.edu.upt.fuerzaupt.admin.repository.AuditLogRepository;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.event.entity.EventRegistration;
import pe.edu.upt.fuerzaupt.event.repository.EventRegistrationRepository;
import pe.edu.upt.fuerzaupt.submission.entity.ContactMessage;
import pe.edu.upt.fuerzaupt.submission.entity.NewsletterSubscription;
import pe.edu.upt.fuerzaupt.submission.entity.StudentProposal;
import pe.edu.upt.fuerzaupt.submission.entity.TeamApplication;
import pe.edu.upt.fuerzaupt.submission.repository.ContactMessageRepository;
import pe.edu.upt.fuerzaupt.submission.repository.NewsletterSubscriptionRepository;
import pe.edu.upt.fuerzaupt.submission.repository.StudentProposalRepository;
import pe.edu.upt.fuerzaupt.submission.repository.TeamApplicationRepository;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOperationsService {

    private final ContactMessageRepository contactMessageRepository;
    private final StudentProposalRepository studentProposalRepository;
    private final TeamApplicationRepository teamApplicationRepository;
    private final NewsletterSubscriptionRepository newsletterSubscriptionRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PageResponse<AdminSubmissionResponse> submissions(String typeName, int page, int size) {
        return submissions(typeName, page, size, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminSubmissionResponse> submissions(
            String typeName,
            int page,
            int size,
            String status
    ) {
        SubmissionType type = SubmissionType.from(typeName);
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        String targetStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);

        return switch (type) {
            case CONTACTS -> fetchContacts(safePage, safeSize, targetStatus);
            case PROPOSALS -> fetchProposals(safePage, safeSize, targetStatus);
            case APPLICATIONS -> fetchApplications(safePage, safeSize, targetStatus);
            case SUBSCRIPTIONS -> fetchSubscriptions(safePage, safeSize, targetStatus);
            case REGISTRATIONS -> fetchRegistrations(safePage, safeSize, targetStatus);
        };
    }

    @Transactional(readOnly = true)
    public AdminSubmissionResponse findSubmission(String typeName, UUID id) {
        SubmissionType type = SubmissionType.from(typeName);
        return switch (type) {
            case CONTACTS -> contactMessageRepository.findById(id).map(this::mapContact)
                    .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
            case PROPOSALS -> studentProposalRepository.findById(id).map(this::mapProposal)
                    .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
            case APPLICATIONS -> teamApplicationRepository.findById(id).map(this::mapApplication)
                    .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
            case SUBSCRIPTIONS -> newsletterSubscriptionRepository.findById(id).map(this::mapSubscription)
                    .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
            case REGISTRATIONS -> eventRegistrationRepository.findById(id).map(this::mapRegistration)
                    .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
        };
    }

    @Transactional
    public AdminSubmissionResponse updateStatus(String typeName, UUID id, String status, UUID assignedTo) {
        SubmissionType type = SubmissionType.from(typeName);
        Instant now = Instant.now();
        boolean isFinal = List.of("RESOLVED", "REJECTED", "SPAM").contains(status);

        switch (type) {
            case CONTACTS -> {
                ContactMessage item = contactMessageRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setStatus(status);
                item.setAssignedTo(assignedTo);
                if (isFinal) item.setReviewedAt(now);
                contactMessageRepository.save(item);
            }
            case PROPOSALS -> {
                StudentProposal item = studentProposalRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setStatus(status);
                item.setAssignedTo(assignedTo);
                if (isFinal) item.setReviewedAt(now);
                studentProposalRepository.save(item);
            }
            case APPLICATIONS -> {
                TeamApplication item = teamApplicationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setStatus(status);
                item.setAssignedTo(assignedTo);
                if (isFinal) item.setReviewedAt(now);
                teamApplicationRepository.save(item);
            }
            case SUBSCRIPTIONS -> {
                NewsletterSubscription item = newsletterSubscriptionRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setStatus(status);
                item.setAssignedTo(assignedTo);
                if (isFinal) item.setReviewedAt(now);
                newsletterSubscriptionRepository.save(item);
            }
            case REGISTRATIONS -> {
                EventRegistration item = eventRegistrationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setStatus(status);
                item.setAssignedTo(assignedTo);
                if (isFinal) item.setReviewedAt(now);
                eventRegistrationRepository.save(item);
            }
        }

        return findSubmission(typeName, id);
    }

    @Transactional
    public AdminSubmissionResponse updateNotes(String typeName, UUID id, String notes, UUID assignedTo) {
        SubmissionType type = SubmissionType.from(typeName);
        switch (type) {
            case CONTACTS -> {
                ContactMessage item = contactMessageRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setNotes(notes);
                item.setAssignedTo(assignedTo);
                contactMessageRepository.save(item);
            }
            case PROPOSALS -> {
                StudentProposal item = studentProposalRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setNotes(notes);
                item.setAssignedTo(assignedTo);
                studentProposalRepository.save(item);
            }
            case APPLICATIONS -> {
                TeamApplication item = teamApplicationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setNotes(notes);
                item.setAssignedTo(assignedTo);
                teamApplicationRepository.save(item);
            }
            case SUBSCRIPTIONS -> {
                NewsletterSubscription item = newsletterSubscriptionRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setNotes(notes);
                item.setAssignedTo(assignedTo);
                newsletterSubscriptionRepository.save(item);
            }
            case REGISTRATIONS -> {
                EventRegistration item = eventRegistrationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Formulario recibido no encontrado."));
                item.setNotes(notes);
                item.setAssignedTo(assignedTo);
                eventRegistrationRepository.save(item);
            }
        }

        return findSubmission(typeName, id);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminAuditResponse> audit(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<AuditLog> auditPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<AdminAuditResponse> rows = auditPage.getContent().stream()
                .map(log -> new AdminAuditResponse(
                        log.getId(), log.getUserId(), log.getAction(), log.getEntityType(),
                        log.getEntityId(), json(log.getBeforeData()), json(log.getAfterData()),
                        log.getCreatedAt(), log.getIpAddress(), log.getRequestId()
                ))
                .collect(Collectors.toList());

        return new PageResponse<>(rows, safePage, safeSize, auditPage.getTotalElements(), auditPage.getTotalPages());
    }

    private PageResponse<AdminSubmissionResponse> fetchContacts(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ContactMessage> resultPage = status == null
                ? contactMessageRepository.findAll(pageable)
                : contactMessageRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);

        List<AdminSubmissionResponse> content = resultPage.getContent().stream().map(this::mapContact).toList();
        return new PageResponse<>(content, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    private PageResponse<AdminSubmissionResponse> fetchProposals(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<StudentProposal> resultPage = status == null
                ? studentProposalRepository.findAll(pageable)
                : studentProposalRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);

        List<AdminSubmissionResponse> content = resultPage.getContent().stream().map(this::mapProposal).toList();
        return new PageResponse<>(content, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    private PageResponse<AdminSubmissionResponse> fetchApplications(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TeamApplication> resultPage = status == null
                ? teamApplicationRepository.findAll(pageable)
                : teamApplicationRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);

        List<AdminSubmissionResponse> content = resultPage.getContent().stream().map(this::mapApplication).toList();
        return new PageResponse<>(content, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    private PageResponse<AdminSubmissionResponse> fetchSubscriptions(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NewsletterSubscription> resultPage = status == null
                ? newsletterSubscriptionRepository.findAll(pageable)
                : newsletterSubscriptionRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);

        List<AdminSubmissionResponse> content = resultPage.getContent().stream().map(this::mapSubscription).toList();
        return new PageResponse<>(content, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    private PageResponse<AdminSubmissionResponse> fetchRegistrations(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "registeredAt"));
        Page<EventRegistration> resultPage = status == null
                ? eventRegistrationRepository.findAll(pageable)
                : eventRegistrationRepository.findAllByStatusOrderByRegisteredAtDesc(status, pageable);

        List<AdminSubmissionResponse> content = resultPage.getContent().stream().map(this::mapRegistration).toList();
        return new PageResponse<>(content, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    private AdminSubmissionResponse mapContact(ContactMessage item) {
        return new AdminSubmissionResponse(
                item.getId(), "contacts", item.getFullName(), item.getEmail(),
                item.getSubject(), item.getMessage(), item.getStatus(), item.getNotes(),
                item.getAssignedTo(), item.getReviewedAt(), item.getCreatedAt(), item.getUpdatedAt()
        );
    }

    private AdminSubmissionResponse mapProposal(StudentProposal item) {
        String context = joinWithDash(item.getStudentCode(), item.getCareer());
        return new AdminSubmissionResponse(
                item.getId(), "proposals", item.getStudentName(), null,
                context, item.getProposalText(), item.getStatus(), item.getNotes(),
                item.getAssignedTo(), item.getReviewedAt(), item.getCreatedAt(), item.getUpdatedAt()
        );
    }

    private AdminSubmissionResponse mapApplication(TeamApplication item) {
        return new AdminSubmissionResponse(
                item.getId(), "applications", item.getFullName(), item.getEmail(),
                "Postulacion al equipo", item.getMotivation(), item.getStatus(), item.getNotes(),
                item.getAssignedTo(), item.getReviewedAt(), item.getCreatedAt(), item.getUpdatedAt()
        );
    }

    private AdminSubmissionResponse mapSubscription(NewsletterSubscription item) {
        String context = Boolean.TRUE.equals(item.getIsActive()) ? "Activa" : "Inactiva";
        return new AdminSubmissionResponse(
                item.getId(), "subscriptions", item.getEmail(), item.getEmail(),
                context, null, item.getStatus(), item.getNotes(),
                item.getAssignedTo(), item.getReviewedAt(), item.getCreatedAt(), item.getUpdatedAt()
        );
    }

    private AdminSubmissionResponse mapRegistration(EventRegistration item) {
        String eventTitle = item.getEvent() != null ? item.getEvent().getTitle() : null;
        String body = joinWithDash(item.getCareer(), item.getStudentCode(), item.getRegistrationStatus());
        return new AdminSubmissionResponse(
                item.getId(), "registrations", item.getFullName(), item.getEmail(),
                eventTitle, body, item.getStatus(), item.getNotes(),
                item.getAssignedTo(), item.getReviewedAt(), item.getRegisteredAt(), item.getUpdatedAt()
        );
    }

    private String joinWithDash(String... values) {
        StringBuilder sb = new StringBuilder();
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                if (!sb.isEmpty()) sb.append(" - ");
                sb.append(v.trim());
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    private JsonNode json(String value) {
        if (value == null) return null;
        try {
            return objectMapper.readTree(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer el registro de auditoria.", exception);
        }
    }

    private enum SubmissionType {
        CONTACTS("contacts"),
        PROPOSALS("proposals"),
        APPLICATIONS("applications"),
        SUBSCRIPTIONS("subscriptions"),
        REGISTRATIONS("registrations");

        private final String path;

        SubmissionType(String path) {
            this.path = path;
        }

        private static SubmissionType from(String value) {
            if (value == null) throw new ResourceNotFoundException("Bandeja administrativa no encontrada.");
            return switch (value.toLowerCase(Locale.ROOT)) {
                case "contacts", "contactos" -> CONTACTS;
                case "proposals", "propuestas" -> PROPOSALS;
                case "applications", "postulaciones" -> APPLICATIONS;
                case "subscriptions", "suscripciones" -> SUBSCRIPTIONS;
                case "registrations", "inscripciones" -> REGISTRATIONS;
                default -> throw new ResourceNotFoundException("Bandeja administrativa no encontrada.");
            };
        }
    }
}
