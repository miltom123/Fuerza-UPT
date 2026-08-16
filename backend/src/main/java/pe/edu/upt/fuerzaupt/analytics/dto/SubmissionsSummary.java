package pe.edu.upt.fuerzaupt.analytics.dto;

public record SubmissionsSummary(
        long contactMessages,
        long teamApplications,
        long studentProposals,
        long newsletterSubscriptions,
        long eventRegistrations,
        long total
) {
}
