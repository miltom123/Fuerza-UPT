package pe.edu.upt.fuerzaupt.poll;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import pe.edu.upt.fuerzaupt.poll.entity.Poll;
import pe.edu.upt.fuerzaupt.poll.repository.PollRepository;
import pe.edu.upt.fuerzaupt.poll.service.PollService;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;
import pe.edu.upt.fuerzaupt.security.PrivacyHashService;
import pe.edu.upt.fuerzaupt.submission.service.SharedRateLimitService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PollSecurityTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private ClientIpResolver clientIpResolver;

    @Mock
    private PrivacyHashService privacyHashService;

    @Mock
    private SharedRateLimitService rateLimitService;

    @InjectMocks
    private PollService pollService;

    @Test
    @DisplayName("H-01: Encuesta privada rechaza usuario sin sesion y lanza AccessDeniedException")
    void privatePollRejectsUnauthenticated() {
        UUID pollId = UUID.randomUUID();
        Poll poll = new Poll();
        poll.setId(pollId);
        poll.setStatus("OPEN");
        poll.setAllowAnonymous(false);

        when(pollRepository.findByIdForUpdate(pollId)).thenReturn(Optional.of(poll));

        assertThrows(AccessDeniedException.class, () ->
                pollService.submit(pollId, null, null, null, null)
        );
    }

    @Test
    @DisplayName("H-01: Encuesta privada rechaza AnonymousAuthenticationToken")
    void privatePollRejectsAnonymousToken() {
        UUID pollId = UUID.randomUUID();
        Poll poll = new Poll();
        poll.setId(pollId);
        poll.setStatus("OPEN");
        poll.setAllowAnonymous(false);

        when(pollRepository.findByIdForUpdate(pollId)).thenReturn(Optional.of(poll));

        Authentication anonymousAuth = new AnonymousAuthenticationToken(
                "key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")
        );

        assertThrows(AccessDeniedException.class, () ->
                pollService.submit(pollId, null, anonymousAuth, null, null)
        );
    }
}
