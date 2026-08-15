package pe.edu.upt.fuerzaupt.admin.model;

import lombok.Getter;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;

@Getter
public enum AdminModule {

    REPRESENTATION("representation", "public-representation", Set.of("representation", "representacion")),
    PROJECTS("projects", "public-projects", Set.of("projects", "proyectos")),
    EVENTS("events", "public-events", Set.of("events", "eventos")),
    OPPORTUNITIES("opportunities", "public-opportunities", Set.of("opportunities", "oportunidades")),
    TEAM("team", "public-team", Set.of("team", "equipo")),
    STATISTICS("statistics", "public-statistics", Set.of("statistics", "estadisticas")),
    POLLS("polls", "public-polls", Set.of("polls", "encuestas")),
    SETTINGS("settings", "public-settings", Set.of("settings", "configuracion", "site-settings"));

    private final String canonicalName;
    private final String cacheName;
    private final Set<String> aliases;

    AdminModule(String canonicalName, String cacheName, Set<String> aliases) {
        this.canonicalName = canonicalName;
        this.cacheName = cacheName;
        this.aliases = aliases;
    }

    public static AdminModule from(String value) {
        if (value == null || value.isBlank()) {
            throw new ResourceNotFoundException("Modulo administrativo no especificado.");
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);

        return Arrays.stream(values())
                .filter(module -> module.aliases.contains(normalized))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Modulo administrativo no encontrado: " + value));
    }
}
