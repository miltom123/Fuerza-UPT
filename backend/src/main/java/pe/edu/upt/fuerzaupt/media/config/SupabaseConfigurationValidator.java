package pe.edu.upt.fuerzaupt.media.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseConfigurationValidator {

    private final Environment environment;

    @Value("${app.supabase.url:}")
    private String url;

    @Value("${app.supabase.service-role-key:}")
    private String serviceRoleKey;

    @PostConstruct
    public void validate() {
        boolean isProduction = environment.acceptsProfiles(Profiles.of("production"));
        if (isProduction && (url == null || url.isBlank() || serviceRoleKey == null || serviceRoleKey.isBlank())) {
            log.error("Supabase Storage configuration is mandatory in production environment.");
            throw new IllegalStateException("Supabase Storage es obligatorio en perfil production.");
        }
    }
}
