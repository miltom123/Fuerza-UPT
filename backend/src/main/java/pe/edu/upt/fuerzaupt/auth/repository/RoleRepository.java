package pe.edu.upt.fuerzaupt.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.auth.entity.Role;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);
}
