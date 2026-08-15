package pe.edu.upt.fuerzaupt.admin.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationItem;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminContentServiceTest {

    @Mock
    private RepresentationRepository representationRepository;

    @Mock
    private CacheInvalidationService cacheInvalidationService;

    @InjectMocks
    private AdminContentService adminContentService;

    @Test
    @DisplayName("M-05: LOGRADO sin resultado lanza BusinessException")
    void logradoWithoutResultThrowsException() {
        UUID id = UUID.randomUUID();
        RepresentationItem item = new RepresentationItem();
        item.setId(id);
        item.setBeneficiaryArea("FAING");
        item.setProposalOrManagement("Gestion de laboratorios");
        item.setProgress("LOGRADO");
        item.setResult(null);
        item.setContentStatus("DRAFT");

        when(representationRepository.findById(id)).thenReturn(Optional.of(item));

        assertThrows(BusinessException.class, () ->
                adminContentService.changeStatus("representation", id, "PUBLISHED", 0L)
        );
    }

    @Test
    @DisplayName("M-05: LOGRADO con resultado permite publicacion")
    void logradoWithResultAllowsPublication() {
        UUID id = UUID.randomUUID();
        RepresentationItem item = new RepresentationItem();
        item.setId(id);
        item.setBeneficiaryArea("FAING");
        item.setProposalOrManagement("Gestion de laboratorios");
        item.setProgress("LOGRADO");
        item.setResult("Se renovaron 40 equipos");
        item.setContentStatus("DRAFT");

        when(representationRepository.findById(id)).thenReturn(Optional.of(item));
        when(representationRepository.save(item)).thenReturn(item);

        assertDoesNotThrow(() ->
                adminContentService.changeStatus("representation", id, "PUBLISHED", 0L)
        );
    }
}
