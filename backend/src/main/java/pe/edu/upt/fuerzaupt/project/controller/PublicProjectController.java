package pe.edu.upt.fuerzaupt.project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse;
import pe.edu.upt.fuerzaupt.project.service.ProjectAdminService;

import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
@RequiredArgsConstructor
public class PublicProjectController {
    private final ProjectAdminService service;

    @GetMapping
    public ResponseEntity<List<ProjectPublicResponse>> getAllProjects() {
        return ResponseEntity.ok(service.findAllPublic());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProjectPublicResponse> getProjectBySlug(@PathVariable String slug) {
        return service.findBySlugPublic(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
