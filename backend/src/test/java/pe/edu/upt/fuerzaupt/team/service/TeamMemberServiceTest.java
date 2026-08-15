package pe.edu.upt.fuerzaupt.team.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.media.service.SupabaseStorageService;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberCategory;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberCreateRequest;
import pe.edu.upt.fuerzaupt.team.exception.TeamMemberIncompleteException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class TeamMemberServiceTest {

    private pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository repository;
    private SupabaseStorageService storageService;
    private Authentication authentication;
    private TeamMemberService service;

    @BeforeEach
    void setUp() {
        repository = mock(pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository.class);
        storageService = mock(SupabaseStorageService.class);
        authentication = mock(Authentication.class);
        service = new TeamMemberService(repository, storageService);
    }

    @Test
    void rejectsCreationWithoutAnImage() {
        MockMultipartFile empty = new MockMultipartFile("image", "member.jpg", "image/jpeg", new byte[0]);

        assertThrows(TeamMemberIncompleteException.class,
                () -> service.create(validRequest(null), empty, authentication));

        verifyNoInteractions(storageService, repository);
    }

    @Test
    void rejectsInvalidSocialUrlsBeforeUploading() {
        MockMultipartFile image = image();

        assertThrows(BusinessException.class,
                () -> service.create(validRequest("instagram-sin-protocolo"), image, authentication));

        verifyNoInteractions(storageService, repository);
    }

    @Test
    void propagatesStorageFailuresWithoutWritingToTheDatabase() {
        MockMultipartFile image = image();
        BusinessException failure = new BusinessException("Storage no disponible.");
        when(storageService.uploadTeamMemberImage(any(UUID.class), any(), any())).thenThrow(failure);

        RuntimeException actual = assertThrows(RuntimeException.class,
                () -> service.create(validRequest(null), image, authentication));

        assertSame(failure, actual);
        verifyNoInteractions(repository);
    }

    private TeamMemberCreateRequest validRequest(String instagramUrl) {
        return new TeamMemberCreateRequest(
                "Integrante de prueba",
                "Coordinacion",
                "Derecho",
                "Descripcion publica suficientemente completa.",
                TeamMemberCategory.COORDINACION,
                "Tacna",
                "integrante@example.com",
                instagramUrl,
                "https://www.linkedin.com/in/integrante",
                null, // facebookUrl
                null, // twitterUrl
                false
        );
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("image", "member.jpg", "image/jpeg", new byte[]{1, 2, 3});
    }
}
