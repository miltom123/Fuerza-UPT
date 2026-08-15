package pe.edu.upt.fuerzaupt.project.dto;

import java.util.UUID;

public record OrderedTextResponse(
    UUID id,
    String text,
    int displayOrder
) {}
