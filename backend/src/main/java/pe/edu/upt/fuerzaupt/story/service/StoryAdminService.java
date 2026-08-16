package pe.edu.upt.fuerzaupt.story.service;

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
import pe.edu.upt.fuerzaupt.story.dto.StoryAdminRequest;
import pe.edu.upt.fuerzaupt.story.dto.StoryAdminResponse;
import pe.edu.upt.fuerzaupt.story.entity.Story;
import pe.edu.upt.fuerzaupt.story.repository.StoryRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoryAdminService {

    private final StoryRepository storyRepository;

    @Transactional(readOnly = true)
    public PageResponse<StoryAdminResponse> searchStories(int page, int size, String search, String status, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("createdAt").descending()));
        String safeSearch = (search == null || search.isBlank()) ? null : search.trim();
        String safeStatus = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) ? null : status.trim();
        String safeCategory = (category == null || category.isBlank() || "ALL".equalsIgnoreCase(category)) ? null : category.trim();

        Page<Story> p = storyRepository.searchAdminStories(safeSearch, safeStatus, safeCategory, pageable);
        List<StoryAdminResponse> items = p.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResponse<>(items, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public StoryAdminResponse getStoryById(UUID id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Historia / Testimonio no encontrado: " + id));
        return mapToResponse(story);
    }

    @Transactional
    @CacheEvict(value = {"public-representation", "public-home"}, allEntries = true)
    public StoryAdminResponse createStory(StoryAdminRequest request) {
        String slug = generateSlug(request.slug(), request.authorName());

        Story story = new Story();
        story.setId(UUID.randomUUID());
        story.setAuthorName(request.authorName().trim());
        story.setAuthorCareer(request.authorCareer().trim());
        story.setSlug(slug);
        story.setCategory(request.category() != null && !request.category().isBlank() ? request.category().trim() : "Experiencia");
        story.setQuote(request.quote().trim());
        story.setFullStory(request.fullStory() != null ? request.fullStory().trim() : null);
        story.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);
        story.setVideoUrl(request.videoUrl() != null ? request.videoUrl().trim() : null);
        story.setFeaturedInHero(Boolean.TRUE.equals(request.featuredInHero()));
        story.setContentStatus(request.contentStatus() != null ? request.contentStatus() : "DRAFT");
        story.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);

        if ("PUBLISHED".equalsIgnoreCase(story.getContentStatus())) {
            story.setPublishedAt(Instant.now());
        }

        Story saved = storyRepository.save(story);
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = {"public-representation", "public-home"}, allEntries = true)
    public StoryAdminResponse updateStory(UUID id, StoryAdminRequest request) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Historia / Testimonio no encontrado: " + id));

        story.setAuthorName(request.authorName().trim());
        story.setAuthorCareer(request.authorCareer().trim());

        if (request.slug() != null && !request.slug().isBlank()) {
            story.setSlug(generateSlug(request.slug(), request.authorName()));
        }

        if (request.category() != null && !request.category().isBlank()) {
            story.setCategory(request.category().trim());
        }

        story.setQuote(request.quote().trim());
        story.setFullStory(request.fullStory() != null ? request.fullStory().trim() : null);
        story.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);
        story.setVideoUrl(request.videoUrl() != null ? request.videoUrl().trim() : null);

        if (request.featuredInHero() != null) {
            story.setFeaturedInHero(request.featuredInHero());
        }

        if (request.contentStatus() != null) {
            if ("PUBLISHED".equalsIgnoreCase(request.contentStatus()) && story.getPublishedAt() == null) {
                story.setPublishedAt(Instant.now());
            }
            story.setContentStatus(request.contentStatus());
        }

        if (request.displayOrder() != null) {
            story.setDisplayOrder(request.displayOrder());
        }

        Story updated = storyRepository.save(story);
        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = {"public-representation", "public-home"}, allEntries = true)
    public StoryAdminResponse updateStatus(UUID id, String newStatus, Long version) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Historia no encontrada: " + id));

        if (version != null && !version.equals(story.getVersion())) {
            throw new BusinessException("El registro ha sido modificado por otro usuario. Por favor recargue la página.");
        }

        story.setContentStatus(newStatus);
        if ("PUBLISHED".equalsIgnoreCase(newStatus) && story.getPublishedAt() == null) {
            story.setPublishedAt(Instant.now());
        }

        Story updated = storyRepository.save(story);
        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = {"public-representation", "public-home"}, allEntries = true)
    public StoryAdminResponse archiveStory(UUID id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Historia no encontrada: " + id));

        story.setContentStatus("ARCHIVED");
        Story saved = storyRepository.save(story);
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = {"public-representation", "public-home"}, allEntries = true)
    public StoryAdminResponse deleteStory(UUID id, boolean confirm) {
        if (!confirm) {
            throw new BusinessException("Debe confirmar la eliminación permanente.");
        }
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Historia no encontrada: " + id));

        StoryAdminResponse response = mapToResponse(story);
        storyRepository.delete(story);
        return response;
    }

    private String generateSlug(String rawSlug, String title) {
        String base = (rawSlug != null && !rawSlug.isBlank()) ? rawSlug : title;
        if (base == null || base.isBlank()) base = "historia-" + System.currentTimeMillis();
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

    private StoryAdminResponse mapToResponse(Story s) {
        return new StoryAdminResponse(
                s.getId(),
                s.getSlug(),
                s.getAuthorName(),
                s.getAuthorCareer(),
                s.getCategory(),
                s.getQuote(),
                s.getFullStory(),
                s.getImageUrl(),
                s.getVideoUrl(),
                Boolean.TRUE.equals(s.getFeaturedInHero()),
                s.getContentStatus(),
                s.getDisplayOrder(),
                s.getPublishedAt(),
                s.getCreatedAt(),
                s.getUpdatedAt(),
                s.getVersion()
        );
    }
}
