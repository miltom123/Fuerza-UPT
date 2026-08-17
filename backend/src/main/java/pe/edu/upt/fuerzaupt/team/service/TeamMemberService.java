package pe.edu.upt.fuerzaupt.team.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.content.dto.TeamSocialLinkResponse;
import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;
import pe.edu.upt.fuerzaupt.media.service.SupabaseStorageService;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberAdminResponse;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberCreateRequest;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberOrderRequest;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberUpdateRequest;
import pe.edu.upt.fuerzaupt.team.entity.TeamMember;
import pe.edu.upt.fuerzaupt.team.entity.TeamSocialLink;
import pe.edu.upt.fuerzaupt.team.exception.TeamMemberIncompleteException;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final SupabaseStorageService storageService;

    @Transactional(readOnly = true)
    public PageResponse<TeamMemberAdminResponse> list(int page, int size, String search, String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));

        String cleanSearch = search == null || search.isBlank() ? null : search.trim();
        String safeStatus = status == null || status.isBlank() ? null : normalizeStatus(status);

        PageRequest pageRequest = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.ASC, "createdAt")));
        Page<TeamMember> members = teamMemberRepository.searchMembers(cleanSearch, safeStatus, pageRequest);

        List<TeamMemberAdminResponse> content = members.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(content, safePage, safeSize, members.getTotalElements(), members.getTotalPages());
    }

    @Transactional(readOnly = true)
    public TeamMemberAdminResponse get(UUID id) {
        return mapToResponse(findOrThrow(id));
    }

    private TeamMember findOrThrow(UUID id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Integrante no encontrado."));
    }

    @Transactional
    public TeamMemberAdminResponse create(
            TeamMemberCreateRequest input,
            MultipartFile image,
            Authentication authentication
    ) {
        if (image == null || image.isEmpty()) throw new TeamMemberIncompleteException();
        validateUrls(input.instagramUrl(), input.linkedinUrl(), input.facebookUrl(), input.twitterUrl());
        UUID id = UUID.randomUUID();
        MediaAssetResponse uploaded = null;
        try {
            uploaded = storageService.uploadTeamMemberImage(id, image, authentication);

            TeamMember member = new TeamMember();
            member.setId(id);
            member.setName(clean(input.name()));
            member.setRole(clean(input.role()));
            member.setCareer(clean(input.career()));
            member.setDescription(clean(input.description()));
            member.setCategory(input.category());
            member.setLocation(optional(input.location()));
            member.setEmail(optional(input.email()));
            Boolean receiveApps = Boolean.TRUE.equals(input.receiveApplications());
            String notifEmail = optional(input.notificationEmail());
            if (receiveApps && notifEmail == null) {
                throw new BusinessException("Debe registrar un correo de notificaciones.");
            }
            member.setNotificationEmail(notifEmail);
            member.setReceiveApplications(receiveApps);
            member.setImageMediaId(uploaded.id());

            String status = Boolean.TRUE.equals(input.publishNow()) ? "PUBLISHED" : "DRAFT";
            member.setContentStatus(status);
            member.setPublishedAt("PUBLISHED".equals(status) ? Instant.now() : null);

            long count = teamMemberRepository.count();
            member.setDisplayOrder((int) count);

            replaceSocialLinks(member, input.instagramUrl(), input.linkedinUrl(), input.facebookUrl(), input.twitterUrl());

            teamMemberRepository.saveAndFlush(member);
            return mapToResponse(member);
        } catch (RuntimeException exception) {
            if (uploaded != null) storageService.discard(uploaded);
            throw exception;
        }
    }

    @Transactional
    public TeamMemberAdminResponse update(
            UUID id,
            TeamMemberUpdateRequest input,
            MultipartFile image,
            boolean removeImage,
            Authentication authentication
    ) {
        TeamMember member = findOrThrow(id);
        if (!Objects.equals(member.getVersion(), input.version())) {
            throw new OptimisticLockConflictException();
        }

        if (image != null && !image.isEmpty() && removeImage) {
            throw new BusinessException("No se puede reemplazar y quitar la fotografía en la misma solicitud.");
        }

        validateTransition(member.getContentStatus(), input.status());
        validateUrls(input.instagramUrl(), input.linkedinUrl(), input.facebookUrl(), input.twitterUrl());

        MediaAssetResponse uploaded = null;
        try {
            if (image != null && !image.isEmpty()) {
                uploaded = storageService.uploadTeamMemberImage(id, image, authentication);
            }

            UUID oldImageId = member.getImageMediaId();
            UUID newImageId = uploaded != null ? uploaded.id() : (removeImage ? null : oldImageId);

            if ("PUBLISHED".equals(input.status()) && newImageId == null) {
                throw new TeamMemberIncompleteException();
            }

            member.setName(clean(input.name()));
            member.setRole(clean(input.role()));
            member.setCareer(clean(input.career()));
            member.setDescription(clean(input.description()));
            member.setCategory(input.category());
            member.setLocation(optional(input.location()));
            member.setEmail(optional(input.email()));
            Boolean receiveApps = Boolean.TRUE.equals(input.receiveApplications());
            String notifEmail = optional(input.notificationEmail());
            if (receiveApps && notifEmail == null) {
                throw new BusinessException("Debe registrar un correo de notificaciones.");
            }
            member.setNotificationEmail(notifEmail);
            member.setReceiveApplications(receiveApps);
            member.setImageMediaId(newImageId);

            if ("PUBLISHED".equals(input.status()) && member.getPublishedAt() == null) {
                member.setPublishedAt(Instant.now());
            }
            member.setContentStatus(input.status());

            replaceSocialLinks(member, input.instagramUrl(), input.linkedinUrl(), input.facebookUrl(), input.twitterUrl());

            try {
                teamMemberRepository.saveAndFlush(member);
            } catch (ObjectOptimisticLockingFailureException ex) {
                throw new OptimisticLockConflictException();
            }

            TeamMemberAdminResponse result = mapToResponse(member);
            validateCompleteIfPublished(result);

            if (oldImageId != null && !oldImageId.equals(newImageId)) {
                deleteMediaAfterCommit(oldImageId);
            }

            return result;
        } catch (RuntimeException exception) {
            if (uploaded != null) storageService.discard(uploaded);
            throw exception;
        }
    }

    @Transactional
    public TeamMemberAdminResponse changeStatus(UUID id, String requestedStatus, long version) {
        TeamMember member = findOrThrow(id);
        if (!Objects.equals(member.getVersion(), version)) {
            throw new OptimisticLockConflictException();
        }

        String status = normalizeStatus(requestedStatus);
        validateTransition(member.getContentStatus(), status);

        TeamMemberAdminResponse mappedBefore = mapToResponse(member);
        if ("PUBLISHED".equals(status)) {
            validateComplete(mappedBefore);
        }

        member.setContentStatus(status);
        if ("PUBLISHED".equals(status) && member.getPublishedAt() == null) {
            member.setPublishedAt(Instant.now());
        }

        try {
            teamMemberRepository.saveAndFlush(member);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new OptimisticLockConflictException();
        }
        return mapToResponse(member);
    }

    @Transactional
    public List<TeamMemberAdminResponse> reorder(TeamMemberOrderRequest input) {
        Set<UUID> ids = new HashSet<>();
        for (TeamMemberOrderRequest.Item item : input.items()) {
            if (!ids.add(item.id())) throw new BusinessException("El orden contiene integrantes duplicados.");
        }
        long total = teamMemberRepository.count();
        if (total != input.items().size()) {
            throw new BusinessException("El orden debe incluir a todos los integrantes.");
        }

        for (int index = 0; index < input.items().size(); index++) {
            TeamMemberOrderRequest.Item item = input.items().get(index);
            TeamMember member = findOrThrow(item.id());
            if (!Objects.equals(member.getVersion(), item.version())) {
                throw new OptimisticLockConflictException();
            }
            member.setDisplayOrder(index);
            try {
                teamMemberRepository.saveAndFlush(member);
            } catch (ObjectOptimisticLockingFailureException ex) {
                throw new OptimisticLockConflictException();
            }
        }

        return list(0, 100, null, null).getContent();
    }

    @Transactional
    public TeamMemberAdminResponse archive(UUID id) {
        TeamMember member = findOrThrow(id);
        if ("ARCHIVED".equals(member.getContentStatus())) {
            return mapToResponse(member);
        }
        member.setContentStatus("ARCHIVED");
        teamMemberRepository.saveAndFlush(member);
        return mapToResponse(member);
    }

    @Transactional
    public TeamMemberAdminResponse permanentlyDelete(UUID id) {
        TeamMember member = findOrThrow(id);
        if (!"ARCHIVED".equals(member.getContentStatus())) {
            throw new BusinessException("Solo se puede eliminar definitivamente un integrante archivado.");
        }

        TeamMemberAdminResponse result = mapToResponse(member);
        teamMemberRepository.delete(member);

        if (member.getImageMediaId() != null) {
            storageService.delete(member.getImageMediaId());
        }
        return result;
    }

    private TeamMemberAdminResponse mapToResponse(TeamMember member) {
        MediaAssetResponse image = member.getImageMediaId() == null ? null :
                storageService.get(member.getImageMediaId());

        List<TeamSocialLinkResponse> links = member.getSocialLinks().stream()
                .map(link -> new TeamSocialLinkResponse(link.getPlatform(), link.getUrl()))
                .collect(Collectors.toList());

        return new TeamMemberAdminResponse(
                member.getId(),
                member.getName(),
                member.getRole(),
                member.getCareer(),
                member.getDescription(),
                member.getCategory(),
                member.getLocation(),
                member.getEmail(),
                member.getNotificationEmail(),
                member.getReceiveApplications() != null ? member.getReceiveApplications() : false,
                image,
                links,
                member.getContentStatus(),
                member.getDisplayOrder(),
                member.getCreatedAt(),
                member.getUpdatedAt(),
                member.getVersion()
        );
    }

    private void replaceSocialLinks(TeamMember member, String instagramUrl, String linkedinUrl, String facebookUrl, String twitterUrl) {
        Map<String, String> targetLinks = new LinkedHashMap<>();
        if (optional(instagramUrl) != null) targetLinks.put("INSTAGRAM", optional(instagramUrl));
        if (optional(linkedinUrl) != null) targetLinks.put("LINKEDIN", optional(linkedinUrl));
        if (optional(facebookUrl) != null) targetLinks.put("FACEBOOK", optional(facebookUrl));
        if (optional(twitterUrl) != null) targetLinks.put("TWITTER", optional(twitterUrl));

        if (member.getSocialLinks() == null) {
            member.setSocialLinks(new ArrayList<>());
        }

        // 1. Eliminar enlaces que ya no estan presentes en la solicitud
        member.getSocialLinks().removeIf(link -> !targetLinks.containsKey(link.getPlatform()));

        // 2. Actualizar existentes o insertar nuevos sin provocar duplicados
        int order = 0;
        for (Map.Entry<String, String> entry : targetLinks.entrySet()) {
            String platform = entry.getKey();
            String url = entry.getValue();
            int currentOrder = order++;

            TeamSocialLink existing = member.getSocialLinks().stream()
                    .filter(link -> link.getPlatform().equalsIgnoreCase(platform))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setUrl(url);
                existing.setDisplayOrder(currentOrder);
            } else {
                TeamSocialLink link = new TeamSocialLink();
                link.setId(UUID.randomUUID());
                link.setPlatform(platform);
                link.setUrl(url);
                link.setDisplayOrder(currentOrder);
                member.addSocialLink(link);
            }
        }
    }

    private void validateCompleteIfPublished(TeamMemberAdminResponse member) {
        if ("PUBLISHED".equals(member.status())) validateComplete(member);
    }

    private void validateComplete(TeamMemberAdminResponse member) {
        if (member.image() == null || blank(member.name()) || blank(member.role()) || blank(member.career())
                || blank(member.description()) || member.category() == null) {
            throw new TeamMemberIncompleteException();
        }
    }

    private void validateTransition(String current, String requested) {
        if (current.equals(requested)) return;
        boolean valid = switch (current) {
            case "DRAFT" -> List.of("PUBLISHED", "ARCHIVED").contains(requested);
            case "PUBLISHED" -> List.of("DRAFT", "ARCHIVED").contains(requested);
            case "ARCHIVED" -> "DRAFT".equals(requested);
            default -> false;
        };
        if (!valid) throw new BusinessException("La transición editorial solicitada no está permitida.");
    }

    private void validateUrls(String instagramUrl, String linkedinUrl, String facebookUrl, String twitterUrl) {
        validateUrl(instagramUrl, "Instagram");
        validateUrl(linkedinUrl, "LinkedIn");
        validateUrl(facebookUrl, "Facebook");
        validateUrl(twitterUrl, "Twitter");
    }

    private void validateUrl(String value, String field) {
        if (blank(value)) return;
        try {
            URI uri = URI.create(value.trim());
            String scheme = uri.getScheme();
            if (scheme == null
                    || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                    || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new BusinessException("La URL de " + field + " no es válida.");
        }
    }

    private String normalizeStatus(String value) {
        String status = value == null ? "DRAFT" : value.trim().toUpperCase(Locale.ROOT);
        if (!List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(status)) {
            throw new BusinessException("El estado editorial no es válido.");
        }
        return status;
    }

    private void deleteMediaAfterCommit(UUID mediaId) {
        Runnable deletion = () -> {
            try {
                storageService.delete(mediaId);
            } catch (RuntimeException exception) {
                log.error("Could not delete replaced team image {} after commit", mediaId, exception);
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deletion.run();
                }
            });
        } else {
            deletion.run();
        }
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private String optional(String value) {
        return blank(value) ? null : value.trim();
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
