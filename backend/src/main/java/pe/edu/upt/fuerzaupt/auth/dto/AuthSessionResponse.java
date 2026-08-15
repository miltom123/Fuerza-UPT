package pe.edu.upt.fuerzaupt.auth.dto;

import java.time.Instant;

public record AuthSessionResponse(AuthUserResponse user, Instant expiresAt) {
}
