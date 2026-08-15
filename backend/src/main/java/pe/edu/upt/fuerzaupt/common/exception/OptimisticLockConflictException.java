package pe.edu.upt.fuerzaupt.common.exception;

public class OptimisticLockConflictException extends RuntimeException {

    public OptimisticLockConflictException() {
        super("El registro cambio en otra sesion. Recarga la pagina antes de continuar.");
    }
}
