package pe.edu.upt.fuerzaupt.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.admin.dto.AdminAuditResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminSubmissionResponse;
import pe.edu.upt.fuerzaupt.admin.service.AdminOperationsService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOperationsController {

    private final AdminOperationsService operationsService;

    @GetMapping("/inbox/{type}")
    public PageResponse<AdminSubmissionResponse> submissions(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return operationsService.submissions(type, page, size);
    }

    @GetMapping("/audit")
    public PageResponse<AdminAuditResponse> audit(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return operationsService.audit(page, size);
    }
}
