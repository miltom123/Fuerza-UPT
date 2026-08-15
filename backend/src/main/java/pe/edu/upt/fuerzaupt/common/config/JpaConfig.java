package pe.edu.upt.fuerzaupt.common.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EntityScan(basePackages = "pe.edu.upt.fuerzaupt")
@EnableJpaRepositories(basePackages = "pe.edu.upt.fuerzaupt")
public class JpaConfig {
}
