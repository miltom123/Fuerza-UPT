package pe.edu.upt.fuerzaupt.poll.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollAdminDetailResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollDetailResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollMutationRequest;
import pe.edu.upt.fuerzaupt.poll.dto.PollResultsResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollSubmissionRequest;
import pe.edu.upt.fuerzaupt.poll.dto.PollSubmissionResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollSummaryResponse;
import pe.edu.upt.fuerzaupt.poll.entity.*;
import pe.edu.upt.fuerzaupt.poll.repository.PollAnswerRepository;
import pe.edu.upt.fuerzaupt.poll.repository.PollRepository;
import pe.edu.upt.fuerzaupt.poll.repository.PollResponseRepository;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;
import pe.edu.upt.fuerzaupt.security.PrivacyHashService;
import pe.edu.upt.fuerzaupt.submission.service.SharedRateLimitService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {

    private static final String COOKIE_NAME = "FUPT_POLL_ID";

    private final PollRepository pollRepository;
    private final PollResponseRepository responseRepository;
    private final PollAnswerRepository answerRepository;
    private final SharedRateLimitService rateLimitService;
    private final ClientIpResolver clientIpResolver;
    private final PrivacyHashService privacyHashService;

    @Cacheable("public-polls")
    @Transactional(readOnly = true)
    public List<PollSummaryResponse> active() {
        return pollRepository.findActivePolls().stream()
                .map(this::mapSummary)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "public-polls", key = "'slug:' + #slug")
    @Transactional(readOnly = true)
    public PollDetailResponse publicDetail(String slug) {
        Poll poll = pollRepository.findActiveBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Encuesta abierta no encontrada."));
        return new PollDetailResponse(mapSummary(poll), loadQuestions(poll));
    }

    @Transactional(readOnly = true)
    public PageResponse<PollSummaryResponse> adminList(int page, int size, String search, String status) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));

        String cleanSearch = search == null || search.isBlank() ? null : search.trim();
        String safeStatus = status == null || status.isBlank() ? null : normalizeStatus(status);

        PageRequest pageRequest = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Poll> polls = pollRepository.searchPolls(cleanSearch, safeStatus, pageRequest);

        List<PollSummaryResponse> content = polls.stream()
                .map(this::mapSummary)
                .collect(Collectors.toList());

        return new PageResponse<>(content, safePage, safeSize, polls.getTotalElements(), polls.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PollAdminDetailResponse adminDetail(UUID id) {
        Poll poll = find(id);
        long responses = responseRepository.countByPollId(id);
        return new PollAdminDetailResponse(
                new PollDetailResponse(mapSummary(poll), loadQuestions(poll)),
                responses
        );
    }

    @Transactional
    public PollAdminDetailResponse create(PollMutationRequest input) {
        validateMutation(input, false);
        if (pollRepository.existsBySlug(input.slug())) {
            throw new BusinessException("Ya existe una encuesta con el mismo slug.");
        }

        Poll poll = new Poll();
        poll.setId(UUID.randomUUID());
        poll.setSlug(input.slug());
        poll.setTitle(input.title());
        poll.setDescription(input.description());
        
        String status = normalizeStatus(input.status());
        poll.setStatus(status);
        poll.setStartAt(input.startAt());
        poll.setEndAt(input.endAt());
        poll.setAllowAnonymous(input.allowAnonymous());
        poll.setShowResults(input.showResults());
        poll.setFeatured(input.featured());

        replaceQuestions(poll, input.questions());

        try {
            pollRepository.saveAndFlush(poll);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Ya existe una encuesta con el mismo slug.");
        }

        if ("OPEN".equals(status)) validateCanOpen(poll);
        
        return adminDetail(poll.getId());
    }

    @Transactional
    public PollAdminDetailResponse update(UUID id, PollMutationRequest input) {
        validateMutation(input, true);
        Poll poll = find(id);
        if (!Objects.equals(poll.getVersion(), input.version())) {
            throw new OptimisticLockConflictException();
        }
        
        String status = normalizeStatus(input.status());
        validateTransition(poll.getStatus(), status);

        poll.setSlug(input.slug());
        poll.setTitle(input.title());
        poll.setDescription(input.description());
        poll.setStatus(status);
        poll.setStartAt(input.startAt());
        poll.setEndAt(input.endAt());
        poll.setAllowAnonymous(input.allowAnonymous());
        poll.setShowResults(input.showResults());
        poll.setFeatured(input.featured());

        long responseCount = responseRepository.countByPollId(id);
        if (input.questions() != null && !input.questions().isEmpty()) {
            if (responseCount > 0) {
                throw new BusinessException("No se puede cambiar la estructura de una encuesta que ya tiene respuestas.");
            }
            replaceQuestions(poll, input.questions());
        }

        try {
            pollRepository.saveAndFlush(poll);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new OptimisticLockConflictException();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Ya existe una encuesta con el mismo slug.");
        }

        if ("OPEN".equals(status)) validateCanOpen(poll);
        return adminDetail(id);
    }

    @Transactional
    public PollAdminDetailResponse changeStatus(UUID id, String requestedStatus, long version) {
        Poll poll = find(id);
        if (!Objects.equals(poll.getVersion(), version)) {
            throw new OptimisticLockConflictException();
        }
        
        String status = normalizeStatus(requestedStatus);
        validateTransition(poll.getStatus(), status);
        
        poll.setStatus(status);
        try {
            pollRepository.saveAndFlush(poll);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new OptimisticLockConflictException();
        }

        if ("OPEN".equals(status)) validateCanOpen(poll);
        return adminDetail(id);
    }

    @Transactional
    public PollAdminDetailResponse archive(UUID id) {
        Poll poll = find(id);
        if ("ARCHIVED".equals(poll.getStatus())) return adminDetail(id);
        
        poll.setStatus("ARCHIVED");
        pollRepository.saveAndFlush(poll);
        return adminDetail(id);
    }

    @Transactional
    public PollSubmissionResponse submit(
            UUID pollId,
            PollSubmissionRequest input,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        Poll poll = pollRepository.findByIdForUpdate(pollId)
                .orElseThrow(() -> new BusinessException("La encuesta no esta abierta para recibir respuestas."));
        
        if (!isOpen(poll)) {
            throw new BusinessException("La encuesta no esta abierta para recibir respuestas.");
        }
        if (!poll.getAllowAnonymous() && !hasAuthenticatedUser(authentication)) {
            throw new AccessDeniedException("Esta encuesta requiere una sesion identificada.");
        }

        String clientIp = clientIpResolver.resolve(request);
        String rateKey = privacyHashService.hash(clientIp, "poll-rate:" + pollId);
        rateLimitService.consume("poll-vote", rateKey, 20, Duration.ofHours(1));
        
        String cookieId = resolveCookieId(request, response);
        String fingerprint = privacyHashService.hash(cookieId + "|" + clientIp, "poll:" + pollId);
        String ipHash = privacyHashService.hash(clientIp, "poll-ip:" + pollId);
        String userAgentHash = privacyHashService.hash(
                request.getHeader("User-Agent") == null ? "unknown" : request.getHeader("User-Agent"),
                "poll-agent:" + pollId
        );
        
        if (responseRepository.existsByPollIdAndRespondentFingerprint(pollId, fingerprint)) {
            throw new BusinessException("Ya se registro una respuesta para esta encuesta desde este navegador.");
        }

        List<PollDetailResponse.Question> questionsDto = loadQuestions(poll);
        Map<UUID, PollSubmissionRequest.Answer> answers = new HashMap<>();
        for (PollSubmissionRequest.Answer answer : input.answers()) {
            if (answers.put(answer.questionId(), answer) != null) {
                throw new BusinessException("Una pregunta no puede enviarse dos veces.");
            }
        }
        
        Set<UUID> questionIds = questionsDto.stream().map(PollDetailResponse.Question::id).collect(Collectors.toSet());
        if (!questionIds.containsAll(answers.keySet())) {
            throw new BusinessException("La respuesta contiene una pregunta ajena a la encuesta.");
        }
        validateAnswers(questionsDto, answers, input.consent());

        PollResponse pollResponse = new PollResponse();
        pollResponse.setId(UUID.randomUUID());
        pollResponse.setPoll(poll);
        pollResponse.setRespondentFingerprint(fingerprint);
        pollResponse.setIpHash(ipHash);
        pollResponse.setUserAgentHash(userAgentHash);
        
        try {
            responseRepository.saveAndFlush(pollResponse);
            persistAnswers(pollResponse, poll.getQuestions(), answers);
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException("Ya se registro una respuesta para esta encuesta.");
        }
        
        return new PollSubmissionResponse(pollResponse.getId(), Instant.now());
    }

    @Transactional(readOnly = true)
    public PollResultsResponse publicResults(UUID pollId) {
        Poll poll = find(pollId);
        if (!poll.getShowResults() || "ARCHIVED".equals(poll.getStatus())) {
            throw new ResourceNotFoundException("Los resultados de esta encuesta no son publicos.");
        }
        return results(poll, false);
    }

    @Transactional(readOnly = true)
    public PollResultsResponse adminResults(UUID pollId) {
        Poll poll = find(pollId);
        return results(poll, true);
    }

    @Transactional(readOnly = true)
    public byte[] aggregateCsv(UUID pollId) {
        PollResultsResponse results = adminResults(pollId);
        StringBuilder csv = new StringBuilder("pregunta,tipo,opcion,votos,porcentaje,promedio\r\n");
        for (PollResultsResponse.QuestionResult question : results.questions()) {
            if (!question.options().isEmpty()) {
                for (PollResultsResponse.OptionResult option : question.options()) {
                    csv.append(csv(question.questionText())).append(',')
                            .append(question.questionType()).append(',')
                            .append(csv(option.label())).append(',')
                            .append(option.votes()).append(',')
                            .append(String.format(Locale.ROOT, "%.2f", option.percentage())).append(',')
                            .append("\r\n");
                }
            } else {
                csv.append(csv(question.questionText())).append(',')
                        .append(question.questionType()).append(',')
                        .append(csv("Respuestas agregadas")).append(',')
                        .append(question.totalAnswers()).append(',').append(',')
                        .append(question.averageRating() == null ? "" : String.format(Locale.ROOT, "%.2f", question.averageRating()))
                        .append("\r\n");
            }
        }
        return ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
    }

    private PollResultsResponse results(Poll poll, boolean includeText) {
        UUID pollId = poll.getId();
        List<PollDetailResponse.Question> questionsDto = loadQuestions(poll);
        long totalResponses = responseRepository.countByPollId(pollId);

        Map<UUID, Long> totals = answerRepository.countAnswersByQuestion(pollId).stream()
                .collect(Collectors.toMap(
                        PollAnswerRepository.QuestionTotalProjection::getQuestionId,
                        PollAnswerRepository.QuestionTotalProjection::getTotal
                ));

        Map<UUID, Long> optionVotes = answerRepository.countVotesByOption(pollId).stream()
                .collect(Collectors.toMap(
                        PollAnswerRepository.OptionVotesProjection::getOptionId,
                        PollAnswerRepository.OptionVotesProjection::getVotes
                ));

        Map<UUID, Double> averages = answerRepository.averageRatingByQuestion(pollId).stream()
                .collect(Collectors.toMap(
                        PollAnswerRepository.QuestionAverageProjection::getQuestionId,
                        PollAnswerRepository.QuestionAverageProjection::getAverage
                ));

        Map<UUID, List<String>> texts = new HashMap<>();
        if (includeText) {
            List<PollAnswerRepository.QuestionTextProjection> rawTexts = answerRepository.textAnswersByQuestion(pollId);
            for (var proj : rawTexts) {
                texts.computeIfAbsent(proj.getQuestionId(), k -> new ArrayList<>()).add(proj.getTextValue());
            }
        }

        List<PollResultsResponse.QuestionResult> questionResults = questionsDto.stream().map(question -> {
            long total = totals.getOrDefault(question.id(), 0L);
            List<PollResultsResponse.OptionResult> options = question.options().stream().map(option -> {
                long votes = optionVotes.getOrDefault(option.id(), 0L);
                double percentage = total == 0 ? 0 : votes * 100.0 / total;
                return new PollResultsResponse.OptionResult(option.id(), option.label(), votes, percentage);
            }).toList();
            return new PollResultsResponse.QuestionResult(
                    question.id(), question.questionText(), question.questionType(), total,
                    averages.get(question.id()), options, texts.getOrDefault(question.id(), List.of())
            );
        }).toList();
        
        return new PollResultsResponse(pollId, poll.getTitle(), totalResponses, questionResults);
    }

    private void persistAnswers(
            PollResponse pollResponse,
            List<PollQuestion> pollQuestions,
            Map<UUID, PollSubmissionRequest.Answer> answersInput
    ) {
        Map<UUID, PollQuestion> questionMap = pollQuestions.stream().collect(Collectors.toMap(PollQuestion::getId, q -> q));
        
        for (PollQuestion question : pollQuestions) {
            PollSubmissionRequest.Answer answer = answersInput.get(question.getId());
            if (answer == null) continue;
            
            switch (question.getQuestionType()) {
                case "SINGLE_CHOICE", "MULTIPLE_CHOICE" -> {
                    if (answer.optionIds() == null) continue;
                    Map<UUID, PollOption> optionMap = question.getOptions().stream().collect(Collectors.toMap(PollOption::getId, o -> o));
                    for (UUID optionId : answer.optionIds()) {
                        PollOption selectedOption = optionMap.get(optionId);
                        if (selectedOption != null) {
                            PollAnswer ans = new PollAnswer();
                            ans.setId(UUID.randomUUID());
                            ans.setResponse(pollResponse);
                            ans.setQuestion(question);
                            ans.setOption(selectedOption);
                            answerRepository.save(ans);
                        }
                    }
                }
                case "RATING" -> {
                    PollAnswer ans = new PollAnswer();
                    ans.setId(UUID.randomUUID());
                    ans.setResponse(pollResponse);
                    ans.setQuestion(question);
                    ans.setRatingValue(answer.ratingValue());
                    answerRepository.save(ans);
                }
                case "SHORT_TEXT" -> {
                    if (answer.textValue() != null && !answer.textValue().isBlank()) {
                        PollAnswer ans = new PollAnswer();
                        ans.setId(UUID.randomUUID());
                        ans.setResponse(pollResponse);
                        ans.setQuestion(question);
                        ans.setTextValue(answer.textValue().trim());
                        answerRepository.save(ans);
                    }
                }
                default -> throw new BusinessException("Tipo de pregunta no soportado.");
            }
        }
        answerRepository.flush();
    }

    private void validateAnswers(
            List<PollDetailResponse.Question> questions,
            Map<UUID, PollSubmissionRequest.Answer> answers,
            Boolean consent
    ) {
        boolean containsText = false;
        for (PollDetailResponse.Question question : questions) {
            PollSubmissionRequest.Answer answer = answers.get(question.id());
            boolean empty = answer == null || isEmpty(question.questionType(), answer);
            if (question.required() && empty) {
                throw new BusinessException("Falta responder una pregunta obligatoria.");
            }
            if (empty) continue;
            Set<UUID> validOptions = question.options().stream()
                    .map(PollDetailResponse.Option::id).collect(Collectors.toSet());
            switch (question.questionType()) {
                case "SINGLE_CHOICE" -> {
                    if (answer.optionIds() == null || answer.optionIds().size() != 1
                            || !validOptions.contains(answer.optionIds().get(0))) {
                        throw new BusinessException("La respuesta de opcion unica no es valida.");
                    }
                }
                case "MULTIPLE_CHOICE" -> {
                    if (answer.optionIds() == null || answer.optionIds().isEmpty()
                            || !validOptions.containsAll(answer.optionIds())
                            || answer.optionIds().stream().distinct().count() != answer.optionIds().size()) {
                        throw new BusinessException("La respuesta de opcion multiple no es valida.");
                    }
                }
                case "RATING" -> {
                    if (answer.ratingValue() == null || answer.ratingValue() < 1 || answer.ratingValue() > 5) {
                        throw new BusinessException("La calificacion debe estar entre 1 y 5.");
                    }
                }
                case "SHORT_TEXT" -> containsText = true;
                default -> throw new BusinessException("Tipo de pregunta no soportado.");
            }
        }
        if (containsText && !Boolean.TRUE.equals(consent)) {
            throw new BusinessException("Debes aceptar el consentimiento para enviar respuestas de texto.");
        }
    }

    private boolean isEmpty(String type, PollSubmissionRequest.Answer answer) {
        return switch (type) {
            case "SINGLE_CHOICE", "MULTIPLE_CHOICE" -> answer.optionIds() == null || answer.optionIds().isEmpty();
            case "RATING" -> answer.ratingValue() == null;
            case "SHORT_TEXT" -> answer.textValue() == null || answer.textValue().isBlank();
            default -> true;
        };
    }

    private String resolveCookieId(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (!COOKIE_NAME.equals(cookie.getName())) continue;
                String[] parts = cookie.getValue().split("\\.", 2);
                if (parts.length == 2 && secureEquals(parts[1], privacyHashService.hash(parts[0], "poll-cookie"))) {
                    return parts[0];
                }
            }
        }
        String id = UUID.randomUUID().toString();
        Cookie cookie = new Cookie(COOKIE_NAME, id + "." + privacyHashService.hash(id, "poll-cookie"));
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) Duration.ofDays(365).toSeconds());
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
        return id;
    }

    private boolean secureEquals(String left, String right) {
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8)
        );
    }

    private List<PollDetailResponse.Question> loadQuestions(Poll poll) {
        return poll.getQuestions().stream().map(q -> new PollDetailResponse.Question(
                q.getId(), q.getQuestionText(), q.getQuestionType(), q.getRequired(), q.getDisplayOrder(),
                q.getOptions().stream().map(o -> new PollDetailResponse.Option(
                        o.getId(), o.getLabel(), o.getDisplayOrder()
                )).toList()
        )).toList();
    }

    private void replaceQuestions(Poll poll, List<PollMutationRequest.Question> questionsInput) {
        poll.getQuestions().clear();
        if (questionsInput == null) return;
        
        for (PollMutationRequest.Question questionInput : questionsInput) {
            validateQuestion(questionInput);
            PollQuestion question = new PollQuestion();
            question.setId(UUID.randomUUID());
            question.setQuestionText(questionInput.questionText().trim());
            question.setQuestionType(questionInput.questionType());
            question.setRequired(questionInput.required());
            question.setDisplayOrder(questionInput.displayOrder());
            
            if (questionInput.options() != null) {
                for (PollMutationRequest.Option optionInput : questionInput.options()) {
                    PollOption option = new PollOption();
                    option.setId(UUID.randomUUID());
                    option.setLabel(optionInput.label().trim());
                    option.setDisplayOrder(optionInput.displayOrder());
                    question.addOption(option);
                }
            }
            poll.addQuestion(question);
        }
    }

    private void validateMutation(PollMutationRequest input, boolean update) {
        if (input.endAt() != null && input.startAt() != null && input.endAt().isBefore(input.startAt())) {
            throw new BusinessException("La fecha de cierre no puede ser anterior al inicio.");
        }
        if ("SCHEDULED".equals(input.status()) && input.startAt() == null) {
            throw new BusinessException("Una encuesta programada requiere fecha de inicio.");
        }
        if (update && input.version() == null) throw new OptimisticLockConflictException();
        if (input.questions() != null) input.questions().forEach(this::validateQuestion);
        if ("OPEN".equals(input.status()) && (input.questions() == null || input.questions().isEmpty()) && !update) {
            throw new BusinessException("Una encuesta abierta necesita al menos una pregunta.");
        }
    }

    private void validateQuestion(PollMutationRequest.Question question) {
        boolean choice = List.of("SINGLE_CHOICE", "MULTIPLE_CHOICE").contains(question.questionType());
        int optionCount = question.options() == null ? 0 : question.options().size();
        if (choice && optionCount < 2) {
            throw new BusinessException("Las preguntas de opcion necesitan al menos dos alternativas.");
        }
        if (!choice && optionCount > 0) {
            throw new BusinessException("Las preguntas de escala o texto no deben incluir alternativas.");
        }
    }

    private void validateCanOpen(Poll poll) {
        if (poll.getEndAt() != null && poll.getEndAt().isBefore(Instant.now())) {
            throw new BusinessException("La encuesta no tiene preguntas o su fecha de cierre ya paso.");
        }
        if (poll.getQuestions().isEmpty()) {
            throw new BusinessException("La encuesta no tiene preguntas o su fecha de cierre ya paso.");
        }
    }

    private void validateTransition(String current, String requested) {
        if (current.equals(requested)) return;
        boolean valid = switch (current) {
            case "DRAFT" -> List.of("SCHEDULED", "OPEN", "ARCHIVED").contains(requested);
            case "SCHEDULED" -> List.of("DRAFT", "OPEN", "CLOSED", "ARCHIVED").contains(requested);
            case "OPEN" -> List.of("CLOSED", "ARCHIVED").contains(requested);
            case "CLOSED" -> "ARCHIVED".equals(requested);
            case "ARCHIVED" -> "DRAFT".equals(requested);
            default -> false;
        };
        if (!valid) throw new BusinessException("La transicion de encuesta solicitada no esta permitida.");
    }

    private Poll find(UUID id) {
        return pollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encuesta no encontrada."));
    }

    private PollSummaryResponse mapSummary(Poll poll) {
        return new PollSummaryResponse(
                poll.getId(), poll.getSlug(), poll.getTitle(), poll.getDescription(), poll.getStatus(),
                poll.getStartAt(), poll.getEndAt(), poll.getAllowAnonymous(), poll.getShowResults(),
                poll.getFeatured(), poll.getCreatedAt(), poll.getUpdatedAt(), poll.getVersion()
        );
    }

    private String normalizeStatus(String value) {
        String status = value == null ? "DRAFT" : value.trim().toUpperCase(Locale.ROOT);
        if (!List.of("DRAFT", "SCHEDULED", "OPEN", "CLOSED", "ARCHIVED").contains(status)) {
            throw new BusinessException("El estado de encuesta no es valido.");
        }
        return status;
    }

    private String csv(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private boolean isOpen(Poll poll) {
        Instant now = Instant.now();
        return "OPEN".equals(poll.getStatus())
                && (poll.getStartAt() == null || !poll.getStartAt().isAfter(now))
                && (poll.getEndAt() == null || !poll.getEndAt().isBefore(now));
    }

    private boolean hasAuthenticatedUser(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails principal
                && principal.getId() != null;
    }
}
