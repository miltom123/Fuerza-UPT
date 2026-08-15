package pe.edu.upt.fuerzaupt.settings.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.settings.entity.SiteSettings;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Boolean> {
}
