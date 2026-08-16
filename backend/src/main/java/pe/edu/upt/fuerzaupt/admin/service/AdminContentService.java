package pe.edu.upt.fuerzaupt.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentRowResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentUpdateRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminModuleSummaryResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminOrderItemRequest;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.event.entity.Event;
import pe.edu.upt.fuerzaupt.event.model.RegistrationMode;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;
import pe.edu.upt.fuerzaupt.opportunity.entity.Opportunity;
import pe.edu.upt.fuerzaupt.opportunity.entity.OpportunityBenefit;
import pe.edu.upt.fuerzaupt.opportunity.entity.OpportunityRequirement;
import pe.edu.upt.fuerzaupt.opportunity.repository.OpportunityRepository;
import pe.edu.upt.fuerzaupt.project.entity.Project;
import pe.edu.upt.fuerzaupt.project.repository.ProjectRepository;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationItem;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;
import pe.edu.upt.fuerzaupt.statistic.entity.Statistic;
import pe.edu.upt.fuerzaupt.statistic.repository.StatisticRepository;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminContentService {

    private final RepresentationRepository representationRepository;
    private final ProjectRepository projectRepository;
    private final EventRepository eventRepository;
    private final OpportunityRepository opportunityRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final StatisticRepository statisticRepository;

    @Transactional(readOnly = true)
    public List<AdminModuleSummaryResponse> summaries() {
        List<AdminModuleSummaryResponse> list = new ArrayList<>();
        list.add(new AdminModuleSummaryResponse("representation", representationRepository.count(),
                representationRepository.countByContentStatus("PUBLISHED"),
                representationRepository.countByContentStatus("DRAFT"),
                representationRepository.countByContentStatus("ARCHIVED")));
        list.add(new AdminModuleSummaryResponse("projects", projectRepository.count(),
                projectRepository.countByContentStatus("PUBLISHED"),
                projectRepository.countByContentStatus("DRAFT"),
                projectRepository.countByContentStatus("ARCHIVED")));
        list.add(new AdminModuleSummaryResponse("events", eventRepository.countByContentStatusIn(List.of("DRAFT", "PUBLISHED")),
                eventRepository.countByContentStatus("PUBLISHED"),
                eventRepository.countByContentStatus("DRAFT"),
                eventRepository.countByContentStatus("ARCHIVED")));
        list.add(new AdminModuleSummaryResponse("opportunities", opportunityRepository.count(),
                opportunityRepository.countByContentStatus("PUBLISHED"),
                opportunityRepository.countByContentStatus("DRAFT"),
                opportunityRepository.countByContentStatus("ARCHIVED")));
        list.add(new AdminModuleSummaryResponse("team", teamMemberRepository.count(),
                teamMemberRepository.countByContentStatus("PUBLISHED"),
                teamMemberRepository.countByContentStatus("DRAFT"),
                teamMemberRepository.countByContentStatus("ARCHIVED")));
        list.add(new AdminModuleSummaryResponse("statistics", statisticRepository.count(),
                statisticRepository.countByContentStatus("PUBLISHED"),
                statisticRepository.countByContentStatus("DRAFT"),
                statisticRepository.countByContentStatus("ARCHIVED")));
        return list;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminContentRowResponse> list(String moduleName, int page, int size) {
        return list(moduleName, page, size, null, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminContentRowResponse> list(
            String moduleName,
            int page,
            int size,
            String search,
            String status
    ) {
        Module module = Module.from(moduleName);
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage, safeSize,
                Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.DESC, "updatedAt")));

        String safeSearch = (search == null || search.isBlank()) ? null : search.trim();
        String safeStatus = (status == null || status.isBlank()) ? null : normalizedStatus(status);

        return switch (module) {
            case REPRESENTATION -> {
                Page<RepresentationItem> p = representationRepository.searchAdminContent(safeSearch, safeStatus, pageable);
                yield new PageResponse<>(p.getContent().stream().map(this::mapRepresentation).toList(),
                        safePage, safeSize, p.getTotalElements(), p.getTotalPages());
            }
            case PROJECTS -> {
                Page<Project> p = projectRepository.searchAdminContent(safeSearch, safeStatus, pageable);
                yield new PageResponse<>(p.getContent().stream().map(this::mapProject).toList(),
                        safePage, safeSize, p.getTotalElements(), p.getTotalPages());
            }
            case EVENTS -> {
                Page<Event> p = eventRepository.searchAdminContent(safeSearch, safeStatus, pageable);
                yield new PageResponse<>(p.getContent().stream().map(this::mapEvent).toList(),
                        safePage, safeSize, p.getTotalElements(), p.getTotalPages());
            }
            case OPPORTUNITIES -> {
                Page<Opportunity> p = opportunityRepository.searchAdminContent(safeSearch, safeStatus, pageable);
                yield new PageResponse<>(p.getContent().stream().map(this::mapOpportunity).toList(),
                        safePage, safeSize, p.getTotalElements(), p.getTotalPages());
            }
            case STATISTICS -> {
                Page<Statistic> p = statisticRepository.searchAdminContent(safeSearch, safeStatus, pageable);
                yield new PageResponse<>(p.getContent().stream().map(this::mapStatistic).toList(),
                        safePage, safeSize, p.getTotalElements(), p.getTotalPages());
            }
        };
    }

    @Transactional(readOnly = true)
    public AdminContentRowResponse find(String moduleName, UUID id) {
        Module module = Module.from(moduleName);
        return switch (module) {
            case REPRESENTATION -> representationRepository.findById(id).map(this::mapRepresentation)
                    .orElseThrow(() -> new ResourceNotFoundException("Contenido administrativo no encontrado."));
            case PROJECTS -> projectRepository.findById(id).map(this::mapProject)
                    .orElseThrow(() -> new ResourceNotFoundException("Contenido administrativo no encontrado."));
            case EVENTS -> eventRepository.findById(id).map(this::mapEvent)
                    .orElseThrow(() -> new ResourceNotFoundException("Contenido administrativo no encontrado."));
            case OPPORTUNITIES -> opportunityRepository.findById(id).map(this::mapOpportunity)
                    .orElseThrow(() -> new ResourceNotFoundException("Contenido administrativo no encontrado."));
            case STATISTICS -> statisticRepository.findById(id).map(this::mapStatistic)
                    .orElseThrow(() -> new ResourceNotFoundException("Contenido administrativo no encontrado."));
        };
    }

    @Transactional
    public AdminContentRowResponse create(String moduleName, AdminContentRequest input) {
        Module module = Module.from(moduleName);
        UUID id = UUID.randomUUID();
        String status = normalizedStatus(input.status());
        boolean featured = Boolean.TRUE.equals(input.featured());
        int displayOrder = input.displayOrder() == null ? 0 : input.displayOrder();
        validateCreate(module, input);

        Instant publishedAt = "PUBLISHED".equals(status) ? Instant.now() : null;

        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = new RepresentationItem();
                item.setId(id);
                item.setSlug(input.slug());
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(featured);
                item.setDisplayOrder(displayOrder);
                item.setPublishedAt(publishedAt);
                item.setKind("GESTION");
                item.setProgress(parseProgress(input.progress()));
                item.setBeneficiaryArea(input.beneficiaryArea());
                item.setProposalOrManagement(input.proposalOrManagement());
                item.setResult(input.result());
                representationRepository.save(item);
            }
            case PROJECTS -> throw new UnsupportedOperationException("La creación de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
            case EVENTS -> {
                Event item = new Event();
                item.setId(id);
                item.setSlug(input.slug());
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(featured);
                item.setDisplayOrder(displayOrder);
                item.setPublishedAt(publishedAt);
                item.setCategory(defaultCategory(input.category()));
                item.setDescription(input.description());
                item.setStartDate(input.startDate() == null ? LocalDate.now() : input.startDate());
                item.setEndDate(input.endDate());
                item.setModality(defaultValue(input.modality(), "IN_PERSON"));
                item.setOrganizer(defaultPlainValue(input.organizer(), "Fuerza UPT"));
                applyRegistrationMode(item, input.registrationMode(), input.registrationUrl());
                item.setCapacity(input.capacity());
                item.setEventStatus(defaultValue(input.domainStatus(), "UPCOMING"));
                eventRepository.save(item);
            }
            case OPPORTUNITIES -> {
                Opportunity item = new Opportunity();
                item.setId(id);
                item.setSlug(input.slug());
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(featured);
                item.setDisplayOrder(displayOrder);
                item.setPublishedAt(publishedAt);
                item.setOpportunityType(defaultValue(input.category(), "SCHOLARSHIP"));
                item.setInstitution(input.institution());
                item.setDescription(input.description());
                item.setDeadline(input.endDate());
                item.setCountryOrModality(defaultValue(input.modality(), "Presencial"));
                item.setOfficialUrl(input.officialUrl());
                item.setApplicationUrl(input.applicationUrl());
                item.setOpportunityStatus(defaultValue(input.domainStatus(), "OPEN"));

                if (input.proposalOrManagement() != null) {
                    String[] bArr = input.proposalOrManagement().split("\\r?\\n");
                    int o = 0;
                    for (String b : bArr) {
                        String t = b.trim();
                        if (!t.isEmpty()) {
                            OpportunityBenefit ben = new OpportunityBenefit();
                            ben.setId(UUID.randomUUID());
                            ben.setOpportunity(item);
                            ben.setDescription(t);
                            ben.setDisplayOrder(o++);
                            item.getBenefits().add(ben);
                        }
                    }
                }
                if (input.result() != null) {
                    String[] rArr = input.result().split("\\r?\\n");
                    int o = 0;
                    for (String r : rArr) {
                        String t = r.trim();
                        if (!t.isEmpty()) {
                            OpportunityRequirement req = new OpportunityRequirement();
                            req.setId(UUID.randomUUID());
                            req.setOpportunity(item);
                            req.setDescription(t);
                            req.setDisplayOrder(o++);
                            item.getRequirements().add(req);
                        }
                    }
                }

                opportunityRepository.save(item);
            }
            case STATISTICS -> {
                Statistic item = new Statistic();
                item.setId(id);
                item.setStatKey(input.slug());
                item.setValue(defaultPlainValue(input.value(), "0"));
                item.setLabel(input.title());
                item.setSource(input.summary());
                item.setDisplayOrder(displayOrder);
                item.setContentStatus(status);
                item.setFeatured(featured);
                item.setPublishedAt(publishedAt);
                statisticRepository.save(item);
            }
        }

        return find(moduleName, id);
    }

    @Transactional
    public AdminContentRowResponse update(String moduleName, UUID id, AdminContentUpdateRequest input) {
        Module module = Module.from(moduleName);
        AdminContentRowResponse before = find(moduleName, id);
        String status = normalizedStatus(input.status());
        validateTransition(before.status(), status);
        checkVersion(before.version(), input.version());

        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = representationRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(input.featured());
                item.setDisplayOrder(input.displayOrder());
                item.setPublishedAt(publishedAt);
                if (input.beneficiaryArea() != null) item.setBeneficiaryArea(input.beneficiaryArea());
                if (input.proposalOrManagement() != null) item.setProposalOrManagement(input.proposalOrManagement());
                if (input.result() != null) item.setResult(input.result());
                if (input.progress() != null) item.setProgress(parseProgress(input.progress()));
                representationRepository.save(item);
            }
            case PROJECTS -> throw new UnsupportedOperationException("La actualización de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
            case EVENTS -> {
                Event item = eventRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(input.featured());
                item.setDisplayOrder(input.displayOrder());
                item.setPublishedAt(publishedAt);
                if (input.category() != null) item.setCategory(input.category());
                if (input.description() != null) item.setDescription(input.description());
                if (input.startDate() != null) item.setStartDate(input.startDate());
                if (input.endDate() != null) item.setEndDate(input.endDate());
                if (input.modality() != null) item.setModality(normalizeOptional(input.modality()));
                if (input.organizer() != null) item.setOrganizer(input.organizer());
                if (input.domainStatus() != null) item.setEventStatus(normalizeOptional(input.domainStatus()));
                if (input.capacity() != null) item.setCapacity(input.capacity());
                if (input.registrationMode() != null) {
                    applyRegistrationMode(item, input.registrationMode(), input.registrationUrl());
                }
                eventRepository.save(item);
            }
            case OPPORTUNITIES -> {
                Opportunity item = opportunityRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setTitle(input.title());
                item.setSummary(input.summary());
                item.setCoverImageUrl(input.coverImage());
                item.setContentStatus(status);
                item.setFeatured(input.featured());
                item.setDisplayOrder(input.displayOrder());
                item.setPublishedAt(publishedAt);
                if (input.category() != null) item.setOpportunityType(input.category());
                if (input.institution() != null) item.setInstitution(input.institution());
                if (input.description() != null) item.setDescription(input.description());
                if (input.endDate() != null) item.setDeadline(input.endDate());
                if (input.modality() != null) item.setCountryOrModality(input.modality());
                if (input.domainStatus() != null) item.setOpportunityStatus(normalizeOptional(input.domainStatus()));
                if (input.officialUrl() != null) item.setOfficialUrl(input.officialUrl());
                if (input.applicationUrl() != null) item.setApplicationUrl(input.applicationUrl());

                if (input.proposalOrManagement() != null) {
                    item.getBenefits().clear();
                    String[] bArr = input.proposalOrManagement().split("\\r?\\n");
                    int o = 0;
                    for (String b : bArr) {
                        String t = b.trim();
                        if (!t.isEmpty()) {
                            OpportunityBenefit ben = new OpportunityBenefit();
                            ben.setId(UUID.randomUUID());
                            ben.setOpportunity(item);
                            ben.setDescription(t);
                            ben.setDisplayOrder(o++);
                            item.getBenefits().add(ben);
                        }
                    }
                }
                if (input.result() != null) {
                    item.getRequirements().clear();
                    String[] rArr = input.result().split("\\r?\\n");
                    int o = 0;
                    for (String r : rArr) {
                        String t = r.trim();
                        if (!t.isEmpty()) {
                            OpportunityRequirement req = new OpportunityRequirement();
                            req.setId(UUID.randomUUID());
                            req.setOpportunity(item);
                            req.setDescription(t);
                            req.setDisplayOrder(o++);
                            item.getRequirements().add(req);
                        }
                    }
                }
                opportunityRepository.save(item);
            }
            case STATISTICS -> {
                Statistic item = statisticRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setLabel(input.title());
                item.setSource(input.summary());
                if (input.value() != null) item.setValue(input.value());
                item.setContentStatus(status);
                item.setFeatured(input.featured());
                item.setDisplayOrder(input.displayOrder());
                item.setPublishedAt(publishedAt);
                statisticRepository.save(item);
            }
        }

        if ("PUBLISHED".equals(status)) validatePublication(module, id);
        return find(moduleName, id);
    }

    @Transactional
    public AdminContentRowResponse archive(String moduleName, UUID id) {
        Module module = Module.from(moduleName);
        AdminContentRowResponse before = find(moduleName, id);

        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = representationRepository.findById(id).orElseThrow();
                item.setContentStatus("ARCHIVED");
                representationRepository.save(item);
            }
            case PROJECTS -> throw new UnsupportedOperationException("El archivado de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
            case EVENTS -> {
                Event item = eventRepository.findById(id).orElseThrow();
                item.setContentStatus("ARCHIVED");
                eventRepository.save(item);
            }
            case OPPORTUNITIES -> {
                Opportunity item = opportunityRepository.findById(id).orElseThrow();
                item.setContentStatus("ARCHIVED");
                opportunityRepository.save(item);
            }
            case STATISTICS -> {
                Statistic item = statisticRepository.findById(id).orElseThrow();
                item.setContentStatus("ARCHIVED");
                statisticRepository.save(item);
            }
        }
        return before;
    }

    @Transactional
    public void deletePermanent(String moduleName, UUID id) {
        Module module = Module.from(moduleName);
        switch (module) {
            case REPRESENTATION -> representationRepository.deleteById(id);
            case EVENTS -> eventRepository.deleteById(id);
            case OPPORTUNITIES -> opportunityRepository.deleteById(id);
            case STATISTICS -> statisticRepository.deleteById(id);
            case PROJECTS -> throw new UnsupportedOperationException("El borrado de proyectos debe realizarse a través de /api/admin/proyectos.");
        }
    }

    @Transactional
    public AdminContentRowResponse changeStatus(String moduleName, UUID id, String requestedStatus, long version) {
        Module module = Module.from(moduleName);
        AdminContentRowResponse before = find(moduleName, id);
        checkVersion(before.version(), version);

        String status = normalizedStatus(requestedStatus);
        validateTransition(before.status(), status);
        if ("PUBLISHED".equals(status)) validatePublication(module, id);

        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = representationRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setContentStatus(status);
                item.setPublishedAt(publishedAt);
                representationRepository.save(item);
            }
            case PROJECTS -> throw new UnsupportedOperationException("El cambio de estado de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
            case EVENTS -> {
                Event item = eventRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setContentStatus(status);
                item.setPublishedAt(publishedAt);
                eventRepository.save(item);
            }
            case OPPORTUNITIES -> {
                Opportunity item = opportunityRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setContentStatus(status);
                item.setPublishedAt(publishedAt);
                opportunityRepository.save(item);
            }
            case STATISTICS -> {
                Statistic item = statisticRepository.findById(id).orElseThrow();
                Instant publishedAt = "PUBLISHED".equals(status) && item.getPublishedAt() == null ? Instant.now() : item.getPublishedAt();
                item.setContentStatus(status);
                item.setPublishedAt(publishedAt);
                statisticRepository.save(item);
            }
        }
        return find(moduleName, id);
    }

    @Transactional
    public AdminContentRowResponse changeFeatured(String moduleName, UUID id, boolean featured, long version) {
        Module module = Module.from(moduleName);
        AdminContentRowResponse before = find(moduleName, id);
        checkVersion(before.version(), version);

        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = representationRepository.findById(id).orElseThrow();
                item.setFeatured(featured);
                representationRepository.save(item);
            }
            case PROJECTS -> throw new UnsupportedOperationException("El cambio de destacado de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
            case EVENTS -> {
                Event item = eventRepository.findById(id).orElseThrow();
                item.setFeatured(featured);
                eventRepository.save(item);
            }
            case OPPORTUNITIES -> {
                Opportunity item = opportunityRepository.findById(id).orElseThrow();
                item.setFeatured(featured);
                opportunityRepository.save(item);
            }
            case STATISTICS -> {
                Statistic item = statisticRepository.findById(id).orElseThrow();
                item.setFeatured(featured);
                statisticRepository.save(item);
            }
        }
        return find(moduleName, id);
    }

    @Transactional
    public List<AdminContentRowResponse> reorder(String moduleName, List<AdminOrderItemRequest> items) {
        Module module = Module.from(moduleName);
        for (AdminOrderItemRequest item : items) {
            AdminContentRowResponse before = find(moduleName, item.id());
            checkVersion(before.version(), item.version());

            switch (module) {
                case REPRESENTATION -> {
                    RepresentationItem entity = representationRepository.findById(item.id()).orElseThrow();
                    entity.setDisplayOrder(item.displayOrder());
                    representationRepository.save(entity);
                }
                case PROJECTS -> throw new UnsupportedOperationException("El reordenamiento de proyectos debe realizarse a través de /api/admin/proyectos (ProjectAdminService).");
                case EVENTS -> {
                    Event entity = eventRepository.findById(item.id()).orElseThrow();
                    entity.setDisplayOrder(item.displayOrder());
                    eventRepository.save(entity);
                }
                case OPPORTUNITIES -> {
                    Opportunity entity = opportunityRepository.findById(item.id()).orElseThrow();
                    entity.setDisplayOrder(item.displayOrder());
                    opportunityRepository.save(entity);
                }
                case STATISTICS -> {
                    Statistic entity = statisticRepository.findById(item.id()).orElseThrow();
                    entity.setDisplayOrder(item.displayOrder());
                    statisticRepository.save(entity);
                }
            }
        }
        return items.stream().map(item -> find(moduleName, item.id())).toList();
    }

    public String canonicalModule(String moduleName) {
        return Module.from(moduleName).path;
    }

    private String parseProgress(String value) {
        return defaultValue(value, "PRESENTADO");
    }

    private void checkVersion(Long currentVersion, Long expectedVersion) {
        if (expectedVersion != null && currentVersion != null && !Objects.equals(currentVersion, expectedVersion)) {
            throw new OptimisticLockConflictException();
        }
    }

    private void validateCreate(Module module, AdminContentRequest input) {
        if (module == Module.REPRESENTATION) {
            requireText(input.beneficiaryArea(), "El area beneficiaria es obligatoria.");
            requireText(input.proposalOrManagement(), "La propuesta o gestion es obligatoria.");
            if ("LOGRADO".equals(defaultValue(input.progress(), "PRESENTADO"))) {
                requireText(input.result(), "El resultado es obligatorio para un logro.");
            }
        }
        if (module == Module.PROJECTS && input.endDate() != null && input.startDate() != null
                && input.endDate().isBefore(input.startDate())) {
            throw new BusinessException("La fecha final no puede ser anterior a la fecha inicial.");
        }
        if (module == Module.EVENTS) {
            if (input.endDate() != null && input.startDate() != null && input.endDate().isBefore(input.startDate())) {
                throw new BusinessException("La fecha final no puede ser anterior a la fecha inicial.");
            }
            validateRegistrationConfiguration(registrationMode(input.registrationMode()), input.registrationUrl());
        }
        if (module == Module.OPPORTUNITIES) {
            String opportunityStatus = defaultValue(input.domainStatus(), "COMING_SOON");
            if (List.of("OPEN", "CLOSING_SOON").contains(opportunityStatus) && input.endDate() == null) {
                throw new BusinessException("La fecha limite es obligatoria para una oportunidad abierta.");
            }
            validateUrl(input.officialUrl(), "La URL oficial no es valida.");
            validateUrl(input.applicationUrl(), "La URL de postulacion no es valida.");
        }
    }

    private void validatePublication(Module module, UUID id) {
        switch (module) {
            case REPRESENTATION -> {
                RepresentationItem item = representationRepository.findById(id).orElse(null);
                if (item == null || item.getBeneficiaryArea() == null || item.getBeneficiaryArea().isBlank()
                        || item.getProposalOrManagement() == null || item.getProposalOrManagement().isBlank()
                        || ("LOGRADO".equals(item.getProgress()) && (item.getResult() == null || item.getResult().isBlank()))) {
                    throw new BusinessException("El registro no cumple los campos obligatorios para publicarse.");
                }
            }
            case EVENTS -> {
                Event item = eventRepository.findById(id).orElse(null);
                if (item == null || item.getStartDate() == null
                        || (item.getEndDate() != null && item.getEndDate().isBefore(item.getStartDate()))
                        || (item.getCapacity() != null && item.getCapacity() < 0)) {
                    throw new BusinessException("El registro no cumple los campos obligatorios para publicarse.");
                }
            }
            case OPPORTUNITIES -> {
                Opportunity item = opportunityRepository.findById(id).orElse(null);
                if (item == null || (List.of("OPEN", "CLOSING_SOON").contains(item.getOpportunityStatus()) && item.getDeadline() == null)) {
                    throw new BusinessException("El registro no cumple los campos obligatorios para publicarse.");
                }
            }
            default -> {
            }
        }
    }

    private void validateTransition(String current, String requested) {
        String safeCurrent = current == null ? "DRAFT" : current;
        if (safeCurrent.equals(requested)) return;
        boolean valid = switch (safeCurrent) {
            case "DRAFT" -> List.of("PUBLISHED", "ARCHIVED").contains(requested);
            case "PUBLISHED" -> List.of("DRAFT", "ARCHIVED").contains(requested);
            case "ARCHIVED" -> "DRAFT".equals(requested);
            default -> false;
        };
        if (!valid) throw new BusinessException("La transicion editorial solicitada no esta permitida.");
    }

    private AdminContentRowResponse mapRepresentation(RepresentationItem item) {
        return new AdminContentRowResponse(
                item.getId(), item.getSlug(), item.getTitle(), item.getSummary(),
                item.getCoverImageUrl(), item.getContentStatus(), item.getFeatured(),
                item.getDisplayOrder(), item.getUpdatedAt(), item.getVersion()
        );
    }

    private AdminContentRowResponse mapProject(Project item) {
        String coverUrl = item.getCoverMedia() != null ? item.getCoverMedia().getUrl() : null;
        return new AdminContentRowResponse(
                item.getId(), item.getSlug(), item.getTitle(), item.getSummary(),
                coverUrl, item.getContentStatus(), item.getFeatured(),
                item.getDisplayOrder(), item.getUpdatedAt(), item.getVersion()
        );
    }

    private AdminContentRowResponse mapEvent(Event item) {
        return new AdminContentRowResponse(
                item.getId(), item.getSlug(), item.getTitle(), item.getSummary(),
                item.getCoverImageUrl(), item.getContentStatus(), item.getFeatured(),
                item.getDisplayOrder(), item.getUpdatedAt(), item.getVersion()
        );
    }

    private AdminContentRowResponse mapOpportunity(Opportunity item) {
        return new AdminContentRowResponse(
                item.getId(), item.getSlug(), item.getTitle(), item.getSummary(),
                item.getCoverImageUrl(), item.getContentStatus(), item.getFeatured(),
                item.getDisplayOrder(), item.getUpdatedAt(), item.getVersion()
        );
    }

    private AdminContentRowResponse mapStatistic(Statistic item) {
        return new AdminContentRowResponse(
                item.getId(), item.getStatKey(), item.getLabel(), item.getSource(),
                null, item.getContentStatus(), item.getFeatured(),
                item.getDisplayOrder(), item.getUpdatedAt(), item.getVersion()
        );
    }

    private String normalizedStatus(String status) {
        String normalized = status == null ? "DRAFT" : status.trim().toUpperCase(Locale.ROOT);
        if (!List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(normalized)) {
            throw new BusinessException("El estado editorial no es valido.");
        }
        return normalized;
    }

    private String registrationMode(String value) {
        String normalized = defaultValue(value, "NONE");
        if (!List.of("NONE", "INTERNAL", "EXTERNAL").contains(normalized)) {
            throw new BusinessException("El modo de inscripcion no es valido.");
        }
        return normalized;
    }

    private void validateRegistrationConfiguration(String mode, String url) {
        if ("EXTERNAL".equals(mode)) {
            requireText(url, "La URL de registro es obligatoria en modo externo.");
            validateUrl(url, "La URL de registro externo no es valida.");
        } else if (url != null && !url.isBlank()) {
            throw new BusinessException("La URL externa solo se permite en el modo EXTERNAL.");
        }
    }

    private void applyRegistrationMode(Event event, String modeInput, String registrationUrl) {
        String modeStr = registrationMode(modeInput);
        validateRegistrationConfiguration(modeStr, registrationUrl);
        RegistrationMode mode = RegistrationMode.valueOf(modeStr);
        event.setRegistrationMode(mode);
        switch (mode) {
            case NONE -> {
                event.setRegistrationEnabled(false);
                event.setRegistrationUrl(null);
            }
            case INTERNAL -> {
                event.setRegistrationEnabled(true);
                event.setRegistrationUrl(null);
            }
            case EXTERNAL -> {
                event.setRegistrationEnabled(false);
                event.setRegistrationUrl(registrationUrl.trim());
            }
        }
    }

    private void validateUrl(String value, String message) {
        if (value == null || value.isBlank()) return;
        try {
            URI uri = URI.create(value.trim());
            if (!List.of("http", "https").contains(uri.getScheme()) || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(message);
        }
    }

    private void requireText(String value, String message) {
        if (value == null || value.isBlank()) throw new BusinessException(message);
    }

    private String defaultCategory(String value) {
        return defaultValue(value, "GENERAL");
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
    }

    private String defaultPlainValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private enum Module {
        REPRESENTATION("representation"),
        PROJECTS("projects"),
        EVENTS("events"),
        OPPORTUNITIES("opportunities"),
        STATISTICS("statistics");

        private final String path;

        Module(String path) {
            this.path = path;
        }

        private static Module from(String value) {
            if (value == null) throw new ResourceNotFoundException("Modulo administrativo no encontrado.");
            return switch (value.toLowerCase(Locale.ROOT)) {
                case "representation", "representacion" -> REPRESENTATION;
                case "projects", "proyectos" -> PROJECTS;
                case "events", "eventos" -> EVENTS;
                case "opportunities", "oportunidades" -> OPPORTUNITIES;
                case "statistics", "estadisticas" -> STATISTICS;
                default -> throw new ResourceNotFoundException("Modulo administrativo no encontrado.");
            };
        }
    }
}
