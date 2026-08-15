package pe.edu.upt.fuerzaupt.common.exception;

public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException() {
        super("Se alcanzó el límite temporal de solicitudes. Intenta nuevamente más tarde.");
    }
}
