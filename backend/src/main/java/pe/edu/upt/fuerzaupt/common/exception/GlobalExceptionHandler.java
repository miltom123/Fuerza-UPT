package pe.edu.upt.fuerzaupt.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import lombok.extern.slf4j.Slf4j;
import pe.edu.upt.fuerzaupt.auth.exception.InvalidCredentialsException;
import pe.edu.upt.fuerzaupt.auth.exception.TooManyLoginAttemptsException;
import pe.edu.upt.fuerzaupt.team.exception.TeamMemberIncompleteException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "RESOURCE_NOT_FOUND",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResourceFoundException(
            NoResourceFoundException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "RESOURCE_NOT_FOUND",
                "El recurso solicitado no existe.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "BUSINESS_ERROR",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TeamMemberIncompleteException.class)
    public ResponseEntity<ApiErrorResponse> handleTeamMemberIncomplete(
            TeamMemberIncompleteException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "TEAM_MEMBER_INCOMPLETE",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<FieldValidationError> fieldErrors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> new FieldValidationError(((FieldError) error).getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                "Existen campos inválidos.",
                request.getRequestURI(),
                fieldErrors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "MALFORMED_REQUEST",
                "El cuerpo de la solicitud no contiene JSON válido.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "INVALID_CREDENTIALS",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(TooManyLoginAttemptsException.class)
    public ResponseEntity<ApiErrorResponse> handleTooManyAttempts(
            TooManyLoginAttemptsException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "TOO_MANY_LOGIN_ATTEMPTS",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleRateLimit(
            RateLimitExceededException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "RATE_LIMIT_EXCEEDED",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(OptimisticLockConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleOptimisticLockConflict(
            OptimisticLockConflictException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                "OPTIMISTIC_LOCK_CONFLICT",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex,
            HttpServletRequest request
    ) {
        log.warn("Data integrity violation on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());

        Throwable cause = ex.getCause();
        if (cause instanceof org.hibernate.exception.ConstraintViolationException cve) {
            String sqlState = cve.getSQLState();
            // SQLState 23505: unique_violation (ej. clave única o slug duplicado provocado por datos)
            if ("23505".equals(sqlState)) {
                ApiErrorResponse response = new ApiErrorResponse(
                        HttpStatus.CONFLICT.value(),
                        "RESOURCE_CONFLICT",
                        "El registro o identificador ingresado ya existe.",
                        request.getRequestURI()
                );
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
            // SQLState 23514: check_violation, 23502: not_null_violation, 23503: foreign_key_violation
            if ("23514".equals(sqlState) || "23502".equals(sqlState) || "23503".equals(sqlState)) {
                ApiErrorResponse response = new ApiErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "DATA_INTEGRITY_VIOLATION",
                        "Los datos enviados no cumplen con las restricciones de validación del sistema.",
                        request.getRequestURI()
                );
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        }

        // Violaciones no reconocidas o internas conservan respuesta 500 segura
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Ocurrió un error inesperado al procesar la integridad de los datos.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled API error on {} {}", request.getMethod(), request.getRequestURI(), ex);
        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Ocurrió un error inesperado.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
