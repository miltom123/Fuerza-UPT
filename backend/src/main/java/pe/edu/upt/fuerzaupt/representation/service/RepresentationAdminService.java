package pe.edu.upt.fuerzaupt.representation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminRequest;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminResponse;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationAction;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationEvidence;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationItem;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RepresentationAdminService {

    private final RepresentationRepository representationRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<RepresentationAdminResponse> searchItems(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("createdAt").descending()));
        String safeSearch = (search == null || search.isBlank()) ? null : search.trim();
        String safeStatus = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) ? null : status.trim();

        Page<RepresentationItem> p = representationRepository.searchAdminContent(safeSearch, safeStatus, pageable);
        List<RepresentationAdminResponse> items = p.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResponse<>(items, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public RepresentationAdminResponse getItemById(UUID id) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem del Legado Fuerza UPT no encontrado: " + id));
        return mapToResponse(item);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse createItem(RepresentationAdminRequest request) {
        String slug = generateSlug(request.slug(), request.title());

        RepresentationItem item = new RepresentationItem();
        item.setId(UUID.randomUUID());
        item.setTitle(request.title());
        item.setSlug(slug);
        item.setSummary(request.summary());
        item.setCoverImageUrl(request.coverImageUrl());
        item.setContentStatus(request.contentStatus() != null ? request.contentStatus() : "DRAFT");
        item.setFeatured(Boolean.TRUE.equals(request.featured()));
        item.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        item.setKind(request.kind() != null ? request.kind() : "LOGRO");
        item.setProgress(request.progress() != null ? request.progress() : "PRESENTADO");
        item.setProgressPercentage(request.progressPercentage() != null ? request.progressPercentage() : 0);
        item.setImpactLevel(request.impactLevel() != null ? request.impactLevel() : "MEDIO");
        item.setBeneficiaryArea(request.beneficiaryArea());
        item.setIdentifiedProblem(request.identifiedProblem());
        item.setProposalOrManagement(request.proposalOrManagement());
        item.setResult(request.result());

        if ("PUBLISHED".equalsIgnoreCase(item.getContentStatus())) {
            item.setPublishedAt(Instant.now());
        }

        updateActionsAndEvidence(item, request.actions(), request.evidence());

        RepresentationItem saved = representationRepository.save(item);
        auditLogService.record(null, "CREATE", "REPRESENTATION", saved.getId(), null, saved.getTitle(), null);

        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse updateItem(UUID id, RepresentationAdminRequest request) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        item.setTitle(request.title());

        if (request.slug() != null && !request.slug().isBlank()) {
            item.setSlug(generateSlug(request.slug(), request.title()));
        }

        item.setSummary(request.summary());
        item.setCoverImageUrl(request.coverImageUrl());

        if (request.contentStatus() != null) {
            if ("PUBLISHED".equalsIgnoreCase(request.contentStatus()) && item.getPublishedAt() == null) {
                item.setPublishedAt(Instant.now());
            }
            item.setContentStatus(request.contentStatus());
        }

        if (request.featured() != null) item.setFeatured(request.featured());
        if (request.displayOrder() != null) item.setDisplayOrder(request.displayOrder());
        if (request.kind() != null) item.setKind(request.kind());
        if (request.progress() != null) item.setProgress(request.progress());
        if (request.progressPercentage() != null) item.setProgressPercentage(request.progressPercentage());
        if (request.impactLevel() != null) item.setImpactLevel(request.impactLevel());
        if (request.beneficiaryArea() != null) item.setBeneficiaryArea(request.beneficiaryArea());
        if (request.identifiedProblem() != null) item.setIdentifiedProblem(request.identifiedProblem());
        if (request.proposalOrManagement() != null) item.setProposalOrManagement(request.proposalOrManagement());
        if (request.result() != null) item.setResult(request.result());

        updateActionsAndEvidence(item, request.actions(), request.evidence());

        RepresentationItem updated = representationRepository.save(item);
        auditLogService.record(null, "UPDATE", "REPRESENTATION", updated.getId(), null, updated.getTitle(), null);

        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse updateStatus(UUID id, String newStatus, Long version) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        if (version != null && !version.equals(item.getVersion())) {
            throw new BusinessException("El registro ha sido modificado por otro usuario. Por favor recargue la página.");
        }

        item.setContentStatus(newStatus);
        if ("PUBLISHED".equalsIgnoreCase(newStatus) && item.getPublishedAt() == null) {
            item.setPublishedAt(Instant.now());
        }

        RepresentationItem updated = representationRepository.save(item);
        auditLogService.record(null, "UPDATE_STATUS", "REPRESENTATION", updated.getId(), null, newStatus, null);

        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse archiveItem(UUID id) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        item.setContentStatus("ARCHIVED");
        RepresentationItem saved = representationRepository.save(item);
        auditLogService.record(null, "ARCHIVE", "REPRESENTATION", id, null, "ARCHIVED", null);
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse deleteItem(UUID id, boolean confirm) {
        if (!confirm) {
            throw new BusinessException("Debe confirmar la eliminación permanente.");
        }
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        RepresentationAdminResponse response = mapToResponse(item);
        representationRepository.delete(item);
        auditLogService.record(null, "DELETE_PERMANENT", "REPRESENTATION", id, null, "DELETED", null);
        return response;
    }

    private void updateActionsAndEvidence(RepresentationItem item, List<String> actions, List<String> evidence) {
        if (actions != null) {
            item.getActions().clear();
            for (int i = 0; i < actions.size(); i++) {
                String actText = actions.get(i);
                if (actText != null && !actText.isBlank()) {
                    RepresentationAction act = new RepresentationAction();
                    act.setRepresentation(item);
                    act.setDisplayOrder(i + 1);
                    act.setDescription(actText.trim());
                    item.getActions().add(act);
                }
            }
        }

        if (evidence != null) {
            item.getEvidence().clear();
            for (int i = 0; i < evidence.size(); i++) {
                String evIdStr = evidence.get(i);
                if (evIdStr != null && !evIdStr.isBlank()) {
                    try {
                        UUID assetId = UUID.fromString(evIdStr.trim());
                        RepresentationEvidence ev = new RepresentationEvidence();
                        ev.setRepresentation(item);
                        ev.setDisplayOrder(i + 1);
                        ev.setMediaAssetId(assetId);
                        item.getEvidence().add(ev);
                    } catch (IllegalArgumentException ignored) {
                    }
                }
            }
        }
    }

    private String generateSlug(String rawSlug, String title) {
        String base = (rawSlug != null && !rawSlug.isBlank()) ? rawSlug : title;
        if (base == null || base.isBlank()) base = "legado-upt-" + System.currentTimeMillis();
        return base.toLowerCase()
                .replaceAll("[áàäâã]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöôõ]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private RepresentationAdminResponse mapToResponse(RepresentationItem r) {
        List<String> actionsList = (r.getActions() != null)
                ? r.getActions().stream().map(RepresentationAction::getDescription).toList()
                : List.of();

        List<String> evidenceList = (r.getEvidence() != null)
                ? r.getEvidence().stream().map(ev -> ev.getMediaAssetId().toString()).toList()
                : List.of();

        return new RepresentationAdminResponse(
                r.getId(),
                r.getSlug(),
                r.getTitle(),
                r.getSummary(),
                r.getCoverImageUrl(),
                r.getContentStatus(),
                r.getFeatured(),
                r.getDisplayOrder(),
                r.getKind(),
                r.getProgress(),
                r.getProgressPercentage(),
                r.getImpactLevel(),
                r.getBeneficiaryArea(),
                r.getIdentifiedProblem(),
                r.getProposalOrManagement(),
                r.getResult(),
                r.getPublishedAt(),
                r.getCreatedAt(),
                r.getUpdatedAt(),
                r.getVersion(),
                actionsList,
                evidenceList
        );
    }
}
