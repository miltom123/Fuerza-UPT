package pe.edu.upt.fuerzaupt.admin.dto;

public record AdminModuleSummaryResponse(
        String module,
        long total,
        long published,
        long drafts,
        long archived
) {
}
