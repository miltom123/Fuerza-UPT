package pe.edu.upt.fuerzaupt.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI fuerzaUptOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Fuerza UPT API")
                        .description("API Backend para el portal de Fuerza UPT")
                        .version("v1.0.0"));
    }
}
