package pe.edu.upt.fuerzaupt.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.admin.dto.AdminDashboardResponse;
import pe.edu.upt.fuerzaupt.admin.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public AdminDashboardResponse dashboard() {
        return dashboardService.dashboard();
    }
}
