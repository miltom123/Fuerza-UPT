package pe.edu.upt.fuerzaupt.story.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoryAdminRequest(
        @NotBlank(message = "El nombre del autor o estudiante es obligatorio")
        @Size(max = 180, message = "El nombre no puede exceder los 180 caracteres")
        String authorName,

        @NotBlank(message = "La carrera o rol del estudiante es obligatorio")
        @Size(max = 180, message = "La carrera no puede exceder los 180 caracteres")
        String authorCareer,

        String slug,

        String category,

        @NotBlank(message = "La cita destacada es obligatoria")
        String quote,

        String fullStory,

        String imageUrl,

        String videoUrl,

        Boolean featuredInHero,

        String contentStatus,

        Integer displayOrder
) {
}
