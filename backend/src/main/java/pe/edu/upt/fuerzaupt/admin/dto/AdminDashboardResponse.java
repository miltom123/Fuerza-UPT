package pe.edu.upt.fuerzaupt.admin.dto;

import pe.edu.upt.fuerzaupt.analytics.dto.DailyVisitStat;
import pe.edu.upt.fuerzaupt.analytics.dto.SubmissionsSummary;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        long visits,
        long uniqueVisitors,
        long pageViews,
        long interactions,
        long published,
        long drafts,
        long archived,
        long pendingSubmissions,
        List<DailyVisitStat> dailyVisits,
        SubmissionsSummary submissionsSummary,
        Map<String, Long> content,
        List<AdminAuditResponse> recentActivity
) {
}
