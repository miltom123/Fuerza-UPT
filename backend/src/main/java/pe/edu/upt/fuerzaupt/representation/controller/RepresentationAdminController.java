package pe.edu.upt.fuerzaupt.representation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminRequest;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminResponse;
import pe.edu.upt.fuerzaupt.representation.service.RepresentationAdminService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/representacion-estudiantil")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class RepresentationAdminController {

    private final RepresentationAdminService representationAdminService;

    @GetMapping
    public PageResponse<RepresentationAdminResponse> getItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return representationAdminService.searchItems(page, size, search, status);
    }

    @GetMapping("/{id}")
    public RepresentationAdminResponse getItemById(@PathVariable UUID id) {
        return representationAdminService.getItemById(id);
    }

    @PostMapping
    public ResponseEntity<RepresentationAdminResponse> createItem(@Valid @RequestBody RepresentationAdminRequest request) {
        RepresentationAdminResponse created = representationAdminService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public RepresentationAdminResponse updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody RepresentationAdminRequest request
    ) {
        return representationAdminService.updateItem(id, request);
    }

    @PatchMapping("/{id}/estado")
    public RepresentationAdminResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Long version
    ) {
        return representationAdminService.updateStatus(id, status, version);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveItem(@PathVariable UUID id) {
        representationAdminService.archiveItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<Void> deleteItem(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean confirm
    ) {
        representationAdminService.deleteItem(id, confirm);
        return ResponseEntity.noContent().build();
    }
}
