package pe.edu.upt.fuerzaupt.admin.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record AdminAuditResponse(
        UUID id,
        UUID userId,
        String action,
        String entityType,
        UUID entityId,
        JsonNode beforeData,
        JsonNode afterData,
        Instant createdAt,
        String ipAddress,
        String requestId
) {
}
