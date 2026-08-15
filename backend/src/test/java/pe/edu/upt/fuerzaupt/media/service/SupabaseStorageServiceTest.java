package pe.edu.upt.fuerzaupt.media.service;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import pe.edu.upt.fuerzaupt.media.entity.MediaAsset;
import pe.edu.upt.fuerzaupt.media.repository.MediaAssetRepository;

import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseStorageServiceTest {

    @Test
    void deletesTheUploadedObjectWhenTheDatabaseInsertFails() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        MediaAssetRepository failingDatabase = mock(MediaAssetRepository.class);
        when(failingDatabase.save(any(MediaAsset.class))).thenThrow(new DataIntegrityViolationException("simulated media insert failure"));

        SupabaseStorageService service = new SupabaseStorageService(
                failingDatabase,
                builder,
                "https://supabase.test",
                "service-role-test",
                "public-content",
                "private-content",
                "team-members"
        );
        String objectPattern = "https://supabase\\.test/storage/v1/object/team-members/.+\\.png";
        server.expect(requestTo(matchesPattern(objectPattern)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess());
        server.expect(requestTo(matchesPattern(objectPattern)))
                .andExpect(method(HttpMethod.DELETE))
                .andRespond(withSuccess());

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "member.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );

        assertThrows(DataIntegrityViolationException.class,
                () -> service.uploadTeamMemberImage(java.util.UUID.randomUUID(), image, null));
        server.verify();
    }
}
