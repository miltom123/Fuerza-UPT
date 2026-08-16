package pe.edu.upt.fuerzaupt.analytics.dto;

public record DailyVisitStat(
        String date,
        String label,
        long visits,
        long uniqueVisitors
) {
}
