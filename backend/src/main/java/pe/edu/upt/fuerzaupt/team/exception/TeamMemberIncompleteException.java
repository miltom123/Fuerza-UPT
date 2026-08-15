package pe.edu.upt.fuerzaupt.team.exception;

import pe.edu.upt.fuerzaupt.common.exception.BusinessException;

public class TeamMemberIncompleteException extends BusinessException {
    public TeamMemberIncompleteException() {
        super("El integrante necesita fotografía, nombre, cargo, carrera, descripción y categoría para publicarse.");
    }
}
