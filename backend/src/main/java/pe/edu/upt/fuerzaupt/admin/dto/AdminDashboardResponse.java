package pe.edu.upt.fuerzaupt.admin.dto;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        Map<String, Long> content,
        long drafts,
        long published,
        long archived,
        long pendingSubmissions,
        List<AdminAuditResponse> recentActivity
) {
}
