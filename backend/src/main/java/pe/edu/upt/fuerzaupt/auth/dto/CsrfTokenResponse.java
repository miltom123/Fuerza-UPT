package pe.edu.upt.fuerzaupt.auth.dto;

public record CsrfTokenResponse(
        String token,
        String headerName,
        String parameterName
) {}
