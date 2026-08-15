package pe.edu.upt.fuerzaupt.media.dto;

import java.time.Instant;
import java.util.UUID;

public record MediaAssetResponse(
        UUID id,
        String fileName,
        String originalName,
        String contentType,
        long sizeBytes,
        String bucketName,
        String url,
        boolean privateAsset,
        Instant createdAt
) {
}
