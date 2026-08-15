package pe.edu.upt.fuerzaupt.team.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.team.entity.TeamMember;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    @Query("SELECT tm FROM TeamMember tm WHERE tm.contentStatus = 'PUBLISHED' ORDER BY tm.displayOrder ASC")
    List<TeamMember> findPublicTeam();

    @Query("SELECT tm FROM TeamMember tm WHERE tm.contentStatus = 'PUBLISHED' AND (:cursor IS NULL OR tm.displayOrder > :cursor) ORDER BY tm.displayOrder ASC")
    List<TeamMember> findPublicTeam(@Param("cursor") Integer cursor, Pageable pageable);

    @Query("SELECT tm FROM TeamMember tm WHERE tm.id = :id AND tm.contentStatus = 'PUBLISHED'")
    Optional<TeamMember> findPublicById(@Param("id") UUID id);

    @Query("SELECT tm FROM TeamMember tm WHERE (:status IS NULL OR tm.contentStatus = :status) AND (:search IS NULL OR LOWER(tm.name) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(tm.role) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<TeamMember> searchMembers(@Param("search") String search, @Param("status") String status, Pageable pageable);

    @Query("SELECT tm FROM TeamMember tm WHERE tm.receiveApplications = true AND tm.notificationEmail IS NOT NULL AND TRIM(tm.notificationEmail) <> ''")
    List<TeamMember> findApplicationNotificationRecipients();

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);
}
