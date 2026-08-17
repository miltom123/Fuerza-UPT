package pe.edu.upt.fuerzaupt.representation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RepresentationAdminService {

    private static final Set<String> VALID_PROGRESS_VALUES = Set.of(
            "PRESENTADO", "EN_EVALUACION", "APROBADO", "EN_SEGUIMIENTO", "LOGRADO", "CERRADO"
    );

    private static final Set<String> VALID_CONTENT_STATUS_VALUES = Set.of(
            "DRAFT", "PUBLISHED", "ARCHIVED"
    );

    private final RepresentationRepository representationRepository;

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
        validateRequiredFields(
                request.title(),
                request.summary(),
                request.beneficiaryArea(),
                request.proposalOrManagement()
        );

        String slug = generateSlug(request.slug(), request.title());
        String status = validateAndNormalizeContentStatus(request.contentStatus());
        String progress = validateAndNormalizeProgress(request.progress());

        RepresentationItem item = new RepresentationItem();
        item.setId(UUID.randomUUID());
        item.setTitle(request.title().trim());
        item.setSlug(slug);
        item.setSummary(request.summary().trim());
        item.setCoverImageUrl(request.coverImageUrl());
        item.setContentStatus(status);
        item.setFeatured(Boolean.TRUE.equals(request.featured()));
        item.setDisplayOrder(request.displayOrder() != null ? Math.max(0, request.displayOrder()) : 0);
        item.setKind(request.kind() != null && !request.kind().isBlank() ? request.kind().trim() : "LOGRO");
        item.setProgress(progress);
        item.setProgressPercentage(request.progressPercentage() != null ? Math.min(100, Math.max(0, request.progressPercentage())) : 0);
        item.setImpactLevel(request.impactLevel() != null ? request.impactLevel().trim() : "MEDIO");
        item.setBeneficiaryArea(request.beneficiaryArea().trim());
        item.setIdentifiedProblem(request.identifiedProblem());
        item.setProposalOrManagement(request.proposalOrManagement().trim());
        item.setResult(request.result());

        if ("PUBLISHED".equalsIgnoreCase(item.getContentStatus())) {
            item.setPublishedAt(Instant.now());
        }

        updateActionsAndEvidence(item, request.actions(), request.evidence());

        RepresentationItem saved = representationRepository.save(item);
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse updateItem(UUID id, RepresentationAdminRequest request) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new BusinessException("El título del registro no puede estar vacío.");
            }
            item.setTitle(request.title().trim());
        }

        if (request.slug() != null && !request.slug().isBlank()) {
            item.setSlug(generateSlug(request.slug(), item.getTitle()));
        }

        if (request.summary() != null) {
            if (request.summary().isBlank()) {
                throw new BusinessException("El resumen del registro no puede estar vacío.");
            }
            item.setSummary(request.summary().trim());
        }

        if (request.beneficiaryArea() != null) {
            if (request.beneficiaryArea().isBlank()) {
                throw new BusinessException("El área beneficiaria no puede estar vacía.");
            }
            item.setBeneficiaryArea(request.beneficiaryArea().trim());
        }

        if (request.proposalOrManagement() != null) {
            if (request.proposalOrManagement().isBlank()) {
                throw new BusinessException("El detalle de la propuesta o gestión no puede estar vacío.");
            }
            item.setProposalOrManagement(request.proposalOrManagement().trim());
        }

        item.setCoverImageUrl(request.coverImageUrl());

        if (request.contentStatus() != null) {
            String status = validateAndNormalizeContentStatus(request.contentStatus());
            if ("PUBLISHED".equalsIgnoreCase(status) && item.getPublishedAt() == null) {
                item.setPublishedAt(Instant.now());
            }
            item.setContentStatus(status);
        }

        if (request.featured() != null) item.setFeatured(request.featured());
        if (request.displayOrder() != null) item.setDisplayOrder(Math.max(0, request.displayOrder()));
        if (request.kind() != null && !request.kind().isBlank()) item.setKind(request.kind().trim());
        if (request.progress() != null) item.setProgress(validateAndNormalizeProgress(request.progress()));
        if (request.progressPercentage() != null) item.setProgressPercentage(Math.min(100, Math.max(0, request.progressPercentage())));
        if (request.impactLevel() != null) item.setImpactLevel(request.impactLevel().trim());
        if (request.identifiedProblem() != null) item.setIdentifiedProblem(request.identifiedProblem());
        if (request.result() != null) item.setResult(request.result());

        updateActionsAndEvidence(item, request.actions(), request.evidence());

        RepresentationItem updated = representationRepository.save(item);
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

        String status = validateAndNormalizeContentStatus(newStatus);
        item.setContentStatus(status);
        if ("PUBLISHED".equalsIgnoreCase(status) && item.getPublishedAt() == null) {
            item.setPublishedAt(Instant.now());
        }

        RepresentationItem updated = representationRepository.save(item);
        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = "home", allEntries = true)
    public RepresentationAdminResponse archiveItem(UUID id) {
        RepresentationItem item = representationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado: " + id));

        item.setContentStatus("ARCHIVED");
        RepresentationItem saved = representationRepository.save(item);
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

    private String validateAndNormalizeProgress(String raw) {
        if (raw == null || raw.isBlank()) {
            return "PRESENTADO";
        }
        String normalized = raw.trim().toUpperCase();
        if (!VALID_PROGRESS_VALUES.contains(normalized)) {
            throw new BusinessException("El estado de avance '" + raw + "' no es válido. Valores admitidos: PRESENTADO, EN_EVALUACION, APROBADO, EN_SEGUIMIENTO, LOGRADO, CERRADO.");
        }
        return normalized;
    }

    private String validateAndNormalizeContentStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return "DRAFT";
        }
        String normalized = raw.trim().toUpperCase();
        if (!VALID_CONTENT_STATUS_VALUES.contains(normalized)) {
            throw new BusinessException("El estado editorial '" + raw + "' no es válido. Valores admitidos: DRAFT, PUBLISHED, ARCHIVED.");
        }
        return normalized;
    }

    private void validateRequiredFields(String title, String summary, String beneficiaryArea, String proposalOrManagement) {
        if (title == null || title.isBlank()) {
            throw new BusinessException("El título del registro es obligatorio.");
        }
        if (summary == null || summary.isBlank()) {
            throw new BusinessException("El resumen del registro es obligatorio.");
        }
        if (beneficiaryArea == null || beneficiaryArea.isBlank()) {
            throw new BusinessException("El área beneficiaria es obligatoria.");
        }
        if (proposalOrManagement == null || proposalOrManagement.isBlank()) {
            throw new BusinessException("El detalle de la propuesta o gestión es obligatorio.");
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
