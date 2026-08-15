package pe.edu.upt.fuerzaupt.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;
import pe.edu.upt.fuerzaupt.media.entity.MediaAsset;
import pe.edu.upt.fuerzaupt.media.service.SupabaseStorageService;
import pe.edu.upt.fuerzaupt.project.dto.CreateProjectRequest;
import pe.edu.upt.fuerzaupt.project.dto.OrderedTextRequest;
import pe.edu.upt.fuerzaupt.project.dto.OrderedTextResponse;
import pe.edu.upt.fuerzaupt.project.dto.ProjectAdminResponse;
import pe.edu.upt.fuerzaupt.project.dto.ProjectOrderRequest;
import pe.edu.upt.fuerzaupt.project.dto.UpdateProjectRequest;
import pe.edu.upt.fuerzaupt.project.entity.Project;
import pe.edu.upt.fuerzaupt.project.entity.ProjectPartner;
import pe.edu.upt.fuerzaupt.project.entity.ProjectResponsible;
import pe.edu.upt.fuerzaupt.project.entity.ProjectResult;
import pe.edu.upt.fuerzaupt.project.repository.ProjectRepository;
import pe.edu.upt.fuerzaupt.media.repository.MediaAssetRepository;

import pe.edu.upt.fuerzaupt.event.entity.Event;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectAdminService {

    private final ProjectRepository repository;
    private final SupabaseStorageService storageService;
    private final MediaAssetRepository mediaAssetRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse> findAllPublic() {
        return repository.findPublishedProjects().stream()
                .map(this::mapToPublicResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse> findBySlugPublic(String slug) {
        return repository.findBySlugAndPublished(slug)
                .map(this::mapToPublicResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectAdminResponse> findAllAdmin(int page, int size, String search, String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));

        String cleanSearch = search == null || search.isBlank() ? null : search.trim();
        String safeStatus = status == null || status.isBlank() ? null : normalizeStatus(status);

        PageRequest pageRequest = PageRequest.of(safePage, safeSize, 
                Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.DESC, "createdAt")));
        
        Page<Project> projectPage = repository.searchAdminContent(cleanSearch, safeStatus, pageRequest);

        List<ProjectAdminResponse> content = projectPage.getContent().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(content, safePage, safeSize, projectPage.getTotalElements(), projectPage.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ProjectAdminResponse findByIdAdmin(UUID id) {
        return repository.findById(id)
                .map(this::mapToAdminResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));
    }

    @Transactional
    public ProjectAdminResponse create(CreateProjectRequest input, MultipartFile image, Authentication auth) {
        MediaAssetResponse uploaded = null;
        try {
            if (image != null && !image.isEmpty()) {
                uploaded = storageService.upload(image, false, auth);
            }

            Project project = new Project();
            project.setId(UUID.randomUUID());
            project.setTitle(input.title());
            project.setSlug(generateSlug(input.title()));
            project.setSummary(input.summary());
            project.setCategory(input.category());
            project.setProblem(input.problem());
            project.setObjective(input.objective());
            project.setBeneficiaries(input.beneficiaries());
            project.setStartDate(input.startDate());
            project.setEndDate(input.endDate());
            project.setProjectStatus(input.projectStatus());
            if (uploaded != null) {
                project.setCoverMedia(mediaAssetRepository.getReferenceById(uploaded.id()));
            }
            project.setFeatured(input.featured());

            String status = input.publishNow() ? "PUBLISHED" : "DRAFT";
            project.setContentStatus(status);
            project.setPublishedAt("PUBLISHED".equals(status) ? Instant.now() : null);

            long count = repository.count();
            project.setDisplayOrder((int) count);

            replaceResponsibles(project, input.responsibles());
            replacePartners(project, input.partners());
            replaceResults(project, input.results());

            repository.saveAndFlush(project);
            updateLinkedEvents(project, input.linkedEventIds());
            return mapToAdminResponse(project);
        } catch (RuntimeException e) {
            if (uploaded != null) storageService.discard(uploaded);
            throw e;
        }
    }

    @Transactional
    public ProjectAdminResponse update(UUID id, UpdateProjectRequest input, MultipartFile image, boolean removeImage, Authentication auth) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));

        if (!project.getVersion().equals(input.version())) {
            throw new OptimisticLockConflictException();
        }

        MediaAsset oldMedia = project.getCoverMedia();
        MediaAssetResponse newMedia = null;

        try {
            if (image != null && !image.isEmpty()) {
                newMedia = storageService.upload(image, false, auth);
                project.setCoverMedia(mediaAssetRepository.getReferenceById(newMedia.id()));
            } else if (removeImage) {
                project.setCoverMedia(null);
            }

            String previousTitle = project.getTitle();
            if (!java.util.Objects.equals(previousTitle, input.title())) {
                project.setTitle(input.title());
                if (!"PUBLISHED".equals(project.getContentStatus())) {
                    project.setSlug(generateSlug(input.title()));
                }
            }
            project.setSummary(input.summary());
            project.setCategory(input.category());
            project.setProblem(input.problem());
            project.setObjective(input.objective());
            project.setBeneficiaries(input.beneficiaries());
            project.setStartDate(input.startDate());
            project.setEndDate(input.endDate());
            project.setProjectStatus(input.projectStatus());
            project.setFeatured(input.featured());

            replaceResponsibles(project, input.responsibles());
            replacePartners(project, input.partners());
            replaceResults(project, input.results());

            repository.saveAndFlush(project);
            updateLinkedEvents(project, input.linkedEventIds());

            if ((image != null && !image.isEmpty()) || removeImage) {
                if (oldMedia != null) storageService.discard(toMediaAssetResponse(oldMedia));
            }

            return mapToAdminResponse(project);
        } catch (RuntimeException e) {
            if (newMedia != null) storageService.discard(newMedia);
            throw e;
        }
    }

    private void updateLinkedEvents(Project project, List<UUID> linkedEventIds) {
        List<Event> currentLinked = eventRepository.findByProjectId(project.getId());
        List<UUID> targetIds = linkedEventIds != null ? linkedEventIds : List.of();

        for (Event event : currentLinked) {
            if (!targetIds.contains(event.getId())) {
                event.setProjectId(null);
                eventRepository.save(event);
            }
        }
        for (UUID eventId : targetIds) {
            eventRepository.findById(eventId).ifPresent(event -> {
                event.setProjectId(project.getId());
                eventRepository.save(event);
            });
        }
    }

    @Transactional
    public ProjectAdminResponse changeStatus(UUID id, String status, Long version) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));

        if (!project.getVersion().equals(version)) {
            throw new OptimisticLockConflictException();
        }

        project.setContentStatus(status);
        if ("PUBLISHED".equals(status) && project.getPublishedAt() == null) {
            project.setPublishedAt(Instant.now());
        }

        repository.save(project);
        return mapToAdminResponse(project);
    }

    @Transactional
    public ProjectAdminResponse changeFeatured(UUID id, boolean featured, Long version) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));

        project.setFeatured(featured);
        repository.save(project);
        return mapToAdminResponse(project);
    }

    @Transactional
    public ProjectAdminResponse archive(UUID id) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));
        project.setContentStatus("ARCHIVED");
        repository.save(project);
        return mapToAdminResponse(project);
    }

    @Transactional
    public ProjectAdminResponse permanentlyDelete(UUID id) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado"));
        MediaAsset cover = project.getCoverMedia();
        ProjectAdminResponse response = mapToAdminResponse(project);
        repository.delete(project);
        if (cover != null) {
            storageService.discard(toMediaAssetResponse(cover));
        }
        return response;
    }

    @Transactional
    public List<ProjectAdminResponse> reorder(ProjectOrderRequest request) {
        List<Project> projects = repository.findAll();
        Map<UUID, Project> projectMap = projects.stream().collect(Collectors.toMap(Project::getId, p -> p));

        if (request != null && request.orders() != null) {
            for (ProjectOrderRequest.ProjectOrderEntry entry : request.orders()) {
                Project project = projectMap.get(entry.id());
                if (project != null) {
                    project.setDisplayOrder(entry.order());
                    repository.save(project);
                }
            }
        }
        return repository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder")).stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    private void replaceResponsibles(Project project, List<OrderedTextRequest> requests) {
        project.getResponsibles().clear();
        if (requests != null) {
            for (OrderedTextRequest req : requests) {
                ProjectResponsible resp = new ProjectResponsible();
                resp.setId(UUID.randomUUID());
                resp.setProject(project);
                resp.setName(req.text());
                resp.setDisplayOrder(req.displayOrder());
                project.getResponsibles().add(resp);
            }
        }
    }

    private void replacePartners(Project project, List<OrderedTextRequest> requests) {
        project.getPartners().clear();
        if (requests != null) {
            for (OrderedTextRequest req : requests) {
                ProjectPartner partner = new ProjectPartner();
                partner.setId(UUID.randomUUID());
                partner.setProject(project);
                partner.setName(req.text());
                partner.setDisplayOrder(req.displayOrder());
                project.getPartners().add(partner);
            }
        }
    }

    private void replaceResults(Project project, List<OrderedTextRequest> requests) {
        project.getResults().clear();
        if (requests != null) {
            for (OrderedTextRequest req : requests) {
                ProjectResult res = new ProjectResult();
                res.setId(UUID.randomUUID());
                res.setProject(project);
                res.setDescription(req.text());
                res.setDisplayOrder(req.displayOrder());
                project.getResults().add(res);
            }
        }
    }

    private String normalizeStatus(String status) {
        String upper = status.toUpperCase();
        if (upper.equals("PUBLISHED") || upper.equals("DRAFT") || upper.equals("ARCHIVED")) return upper;
        return null;
    }

    private MediaAssetResponse toMediaAssetResponse(MediaAsset cover) {
        if (cover == null) return null;
        return new MediaAssetResponse(
                cover.getId(), cover.getFileName(), cover.getOriginalName(), cover.getContentType(),
                cover.getSizeBytes(), cover.getBucketName(), cover.getUrl(), cover.getPrivateAsset(), cover.getCreatedAt()
        );
    }

    private String generateSlug(String title) {
        if (title == null || title.isBlank()) return UUID.randomUUID().toString();
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    private pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse mapToPublicResponse(Project project) {
        List<String> galleryUrls = project.getGallery() != null ? project.getGallery().stream()
                .map(g -> g.getMediaAssetId() != null ? mediaAssetRepository.findById(g.getMediaAssetId()).map(MediaAsset::getUrl).orElse(null) : null)
                .filter(url -> url != null && !url.isBlank())
                .collect(Collectors.toList()) : List.of();

        List<String> eventIds = eventRepository.findByProjectId(project.getId()).stream()
                .map(e -> e.getId().toString())
                .collect(Collectors.toList());

        return new pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse(
                project.getId(),
                project.getSlug(),
                project.getTitle(),
                project.getSummary(),
                project.getCategory(),
                project.getCoverMedia() != null ? project.getCoverMedia().getUrl() : project.getCoverImageUrl(),
                project.getCoverAltText(),
                project.getProblem(),
                project.getObjective(),
                project.getBeneficiaries(),
                project.getStartDate(),
                project.getEndDate(),
                project.getProjectStatus(),
                project.getContentStatus(),
                project.getResponsibles().stream().map(ProjectResponsible::getName).collect(Collectors.toList()),
                project.getPartners().stream().map(ProjectPartner::getName).collect(Collectors.toList()),
                project.getResults().stream().map(ProjectResult::getDescription).collect(Collectors.toList()),
                galleryUrls,
                eventIds,
                project.getFeatured(),
                project.getDisplayOrder()
        );
    }

    private ProjectAdminResponse mapToAdminResponse(Project project) {
        MediaAssetResponse coverImage = toMediaAssetResponse(project.getCoverMedia());
        List<pe.edu.upt.fuerzaupt.project.dto.ProjectEventReferenceResponse> linkedEvents = eventRepository.findByProjectId(project.getId()).stream()
                .map(e -> new pe.edu.upt.fuerzaupt.project.dto.ProjectEventReferenceResponse(
                        e.getId(), e.getSlug(), e.getTitle(), e.getStartDate(), e.getEventStatus(), e.getModality()
                ))
                .collect(Collectors.toList());

        List<MediaAssetResponse> gallery = project.getGallery() != null ? project.getGallery().stream()
                .map(g -> g.getMediaAssetId() != null ? mediaAssetRepository.findById(g.getMediaAssetId()).map(this::toMediaAssetResponse).orElse(null) : null)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList()) : List.of();

        return new ProjectAdminResponse(
                project.getId(), project.getSlug(), project.getTitle(), project.getSummary(), project.getCategory(),
                coverImage, project.getCoverAltText(), project.getProblem(), project.getObjective(), project.getBeneficiaries(),
                project.getStartDate(), project.getEndDate(), project.getProjectStatus(), project.getContentStatus(),
                project.getResponsibles().stream().map(r -> new OrderedTextResponse(r.getId(), r.getName(), r.getDisplayOrder())).collect(Collectors.toList()),
                project.getPartners().stream().map(p -> new OrderedTextResponse(p.getId(), p.getName(), p.getDisplayOrder())).collect(Collectors.toList()),
                project.getResults().stream().map(r -> new OrderedTextResponse(r.getId(), r.getDescription(), r.getDisplayOrder())).collect(Collectors.toList()),
                linkedEvents, gallery, project.getFeatured(), project.getDisplayOrder(), project.getPublishedAt(),
                project.getCreatedAt(), project.getUpdatedAt(), project.getVersion()
        );
    }
}
