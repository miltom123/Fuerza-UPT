package pe.edu.upt.fuerzaupt.admin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.entity.AuditLog;
import pe.edu.upt.fuerzaupt.admin.repository.AuditLogRepository;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final ClientIpResolver clientIpResolver;

    @Transactional
    public void record(
            Authentication authentication,
            String action,
            String entityType,
            UUID entityId,
            Object before,
            Object after,
            HttpServletRequest request
    ) {
        UUID userId = authentication != null && authentication.getPrincipal() instanceof CustomUserDetails principal
                ? principal.getId()
                : null;

        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID());
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setBeforeData(json(before));
        log.setAfterData(json(after));
        log.setIpAddress(request != null ? clientIpResolver.resolve(request) : null);
        log.setRequestId(MDC.get("requestId"));
        log.setUserAgent(request != null ? truncate(request.getHeader("User-Agent"), 512) : null);

        auditLogRepository.save(log);
    }

    private String json(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo registrar la auditoría.", exception);
        }
    }

    private String truncate(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
