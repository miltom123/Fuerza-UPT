package pe.edu.upt.fuerzaupt.story.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.story.dto.StoryPublicResponse;
import pe.edu.upt.fuerzaupt.story.service.StoryPublicService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StoryPublicController {

    private final StoryPublicService storyPublicService;

    @GetMapping("/api/historias")
    public List<StoryPublicResponse> getStories(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer limit
    ) {
        return storyPublicService.getPublicStories(category, limit);
    }

    @GetMapping("/api/historias/hero")
    public List<StoryPublicResponse> getHeroStories() {
        return storyPublicService.getHeroStories();
    }

    @GetMapping("/api/historias/{slug}")
    public StoryPublicResponse getStoryBySlug(@PathVariable String slug) {
        return storyPublicService.getStoryBySlug(slug);
    }
}
