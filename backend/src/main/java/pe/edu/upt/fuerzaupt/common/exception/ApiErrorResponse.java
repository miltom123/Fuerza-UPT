package pe.edu.upt.fuerzaupt.common.exception;

import lombok.Getter;
import org.slf4j.MDC;

import java.time.Instant;
import java.util.List;

@Getter
public class ApiErrorResponse {
    private final Instant timestamp;
    private final int status;
    private final String code;
    private final String message;
    private final String path;
    private final String requestId;
    private List<FieldValidationError> fieldErrors;

    public ApiErrorResponse(int status, String code, String message, String path) {
        this.timestamp = Instant.now();
        this.status = status;
        this.code = code;
        this.message = message;
        this.path = path;
        this.requestId = MDC.get("requestId");
    }

    public ApiErrorResponse(int status, String code, String message, String path, List<FieldValidationError> fieldErrors) {
        this(status, code, message, path);
        this.fieldErrors = fieldErrors;
    }
}
