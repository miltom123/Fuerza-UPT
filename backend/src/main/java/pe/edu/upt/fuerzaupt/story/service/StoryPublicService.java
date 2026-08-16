package pe.edu.upt.fuerzaupt.story.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.story.dto.StoryPublicResponse;
import pe.edu.upt.fuerzaupt.story.entity.Story;
import pe.edu.upt.fuerzaupt.story.repository.StoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryPublicService {

    private final StoryRepository storyRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "public-representation", key = "'stories:' + (#category == null ? 'all' : #category) + ':' + (#limit == null ? 20 : #limit)")
    public List<StoryPublicResponse> getPublicStories(String category, Integer limit) {
        int max = (limit != null && limit > 0 && limit <= 100) ? limit : 20;
        String safeCategory = (category == null || category.isBlank() || "Todas las categorías".equalsIgnoreCase(category)) ? null : category.trim();

        return storyRepository.findPublicStories(safeCategory, PageRequest.of(0, max)).stream()
                .map(this::mapToPublicResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-representation", key = "'stories:hero'")
    public List<StoryPublicResponse> getHeroStories() {
        return storyRepository.findHeroStories().stream()
                .map(this::mapToPublicResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-representation", key = "'story:' + #slug")
    public StoryPublicResponse getStoryBySlug(String slug) {
        Story story = storyRepository.findBySlugAndPublished(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Historia no encontrada con slug: " + slug));
        return mapToPublicResponse(story);
    }

    private StoryPublicResponse mapToPublicResponse(Story s) {
        return new StoryPublicResponse(
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
                s.getDisplayOrder(),
                s.getPublishedAt()
        );
    }
}
