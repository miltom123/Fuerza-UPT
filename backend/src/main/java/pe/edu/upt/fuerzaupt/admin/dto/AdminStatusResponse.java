package pe.edu.upt.fuerzaupt.admin.dto;

import java.time.Instant;

public record AdminStatusResponse(
        String status,
        String authenticatedAs,
        Instant serverTime,
        long cacheEventCursor
) {}
