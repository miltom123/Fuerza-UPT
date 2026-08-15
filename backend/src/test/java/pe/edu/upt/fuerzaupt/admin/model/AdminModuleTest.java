package pe.edu.upt.fuerzaupt.admin.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AdminModuleTest {

    @Test
    @DisplayName("M-09: Resolucion de alias espanol e ingles apuntan al mismo AdminModule")
    void aliasesResolveToCanonicalName() {
        assertEquals(AdminModule.PROJECTS, AdminModule.from("projects"));
        assertEquals(AdminModule.PROJECTS, AdminModule.from("proyectos"));
        assertEquals("projects", AdminModule.from("proyectos").getCanonicalName());

        assertEquals(AdminModule.OPPORTUNITIES, AdminModule.from("opportunities"));
        assertEquals(AdminModule.OPPORTUNITIES, AdminModule.from("oportunidades"));
        assertEquals("opportunities", AdminModule.from("oportunidades").getCanonicalName());

        assertEquals(AdminModule.REPRESENTATION, AdminModule.from("representacion"));
        assertEquals(AdminModule.EVENTS, AdminModule.from("eventos"));
    }

    @Test
    @DisplayName("M-09: Modulo inexistente lanza ResourceNotFoundException")
    void unknownModuleThrowsException() {
        assertThrows(ResourceNotFoundException.class, () -> AdminModule.from("modulo_invalido"));
    }
}
