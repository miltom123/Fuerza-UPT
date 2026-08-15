import { z } from "zod";

const optionalEmail = z.union([
  z.literal(""),
  z.string().email("Ingresa un correo valido.").max(255),
]);

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Ingresa una URL completa con https://").max(2000),
]);

export const teamMemberSchema = z.object({
  name: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(255),
  role: z.string().trim().min(2, "Indica el cargo.").max(255),
  career: z.string().trim().min(2, "Indica la carrera.").max(255),
  description: z.string().trim().min(10, "Escribe al menos 10 caracteres.").max(2000),
  category: z.enum(["DIRECTIVA", "REPRESENTANTE", "COORDINACION", "VOLUNTARIADO", "ALIADO"]),
  location: z.string().trim().max(255),
  email: optionalEmail,
  notificationEmail: optionalEmail,
  receiveApplications: z.boolean(),
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  facebookUrl: optionalUrl,
  twitterUrl: optionalUrl,
}).superRefine((data, ctx) => {
  if (data.receiveApplications && (!data.notificationEmail || data.notificationEmail.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe registrar un correo de notificaciones.",
      path: ["notificationEmail"],
    });
  }
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
