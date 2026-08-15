package pe.edu.upt.fuerzaupt.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upt.fuerzaupt.auth.entity.UserIdentity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserIdentityRepository extends JpaRepository<UserIdentity, UUID> {
    Optional<UserIdentity> findByProviderAndProviderSubject(String provider, String providerSubject);
    Optional<UserIdentity> findByUserIdAndProvider(UUID userId, String provider);
}
