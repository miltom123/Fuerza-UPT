package pe.edu.upt.fuerzaupt.media.dto;

import java.time.Instant;

public record SignedMediaUrlResponse(
        String url,
        Instant expiresAt
) {
}
