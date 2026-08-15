package pe.edu.upt.fuerzaupt.auth.exception;

public class TooManyLoginAttemptsException extends RuntimeException {
    public TooManyLoginAttemptsException() {
        super("Demasiados intentos. Espera unos minutos antes de volver a ingresar.");
    }
}
