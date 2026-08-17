package pe.edu.upt.fuerzaupt.submission.dto;

import java.util.UUID;

public record TeamApplicationEmailModel(
    UUID id,
    String fullName,
    String email,
    String career,
    String faculty,
    String cycle,
    String interest,
    String phone,
    String details,
    String formattedDate,
    String footerDate,
    String adminUrl,
    String replySubject,
    String logoUrl
) {}

