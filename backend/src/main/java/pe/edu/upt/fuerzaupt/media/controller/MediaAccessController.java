package pe.edu.upt.fuerzaupt.media.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.media.dto.SignedMediaUrlResponse;
import pe.edu.upt.fuerzaupt.media.service.SupabaseStorageService;

import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaAccessController {

    private final SupabaseStorageService storageService;

    @GetMapping("/{id}/signed-url")
    public SignedMediaUrlResponse signedUrl(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "300") int expiresIn
    ) {
        return storageService.signedUrl(id, expiresIn);
    }
}
