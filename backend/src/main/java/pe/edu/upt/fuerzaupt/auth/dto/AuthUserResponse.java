package pe.edu.upt.fuerzaupt.auth.dto;

import java.util.List;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String displayName,
        List<String> roles
) {
}
