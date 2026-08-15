"use client";

import { useEffect, useState, type BaseSyntheticEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { teamAdminService } from "@/services/admin/team-admin-service";
import type { TeamMember, TeamMemberAdmin, TeamMemberMutation } from "@/types/team-member";
import { teamMemberSchema, type TeamMemberFormValues } from "@/validations/team-member";
import {
  TEAM_IMAGE_MAX_SIZE,
  TEAM_IMAGE_TYPES,
  TeamMemberImagePicker,
} from "./team-member-image-picker";
import { TeamMemberPreview } from "./team-member-preview";

interface TeamMemberFormProps {
  open: boolean;
  member?: TeamMemberAdmin;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const fieldClass = "mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-normal normal-case text-fuerza-navy outline-none focus:border-fuerza-blue focus:ring-3 focus:ring-blue-100";
const labelClass = "text-xs font-bold uppercase tracking-[0.1em] text-fuerza-muted";

function formDefaults(member?: TeamMemberAdmin): TeamMemberFormValues {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "",
    career: member?.career ?? "",
    description: member?.description ?? "",
    category: member?.category ?? "VOLUNTARIADO",
    location: member?.location ?? "",
    email: member?.email ?? "",
    notificationEmail: member?.notificationEmail ?? "",
    receiveApplications: member?.receiveApplications ?? false,
    instagramUrl: member?.socialLinks.find(({ platform }) => platform === "INSTAGRAM")?.url ?? "",
    linkedinUrl: member?.socialLinks.find(({ platform }) => platform === "LINKEDIN")?.url ?? "",
    facebookUrl: member?.socialLinks.find(({ platform }) => platform === "FACEBOOK")?.url ?? "",
    twitterUrl: member?.socialLinks.find(({ platform }) => platform === "TWITTER")?.url ?? "",
  };
}

function optional(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || undefined;
}

export function TeamMemberForm({ open, member, onOpenChange, onSaved }: TeamMemberFormProps) {
  const [image, setImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState(member?.image?.url ?? "");
  const [removeStoredImage, setRemoveStoredImage] = useState(false);
  const [imageError, setImageError] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: formDefaults(member),
  });
  const values = useWatch({ control });

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseImage(file: File) {
    if (!TEAM_IMAGE_TYPES.includes(file.type)) {
      setImageError("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > TEAM_IMAGE_MAX_SIZE) {
      setImageError("La imagen supera el limite de 5 MB.");
      return;
    }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveStoredImage(false);
    setImageError(undefined);
  }

  function removeImage() {
    setImage(undefined);
    setPreviewUrl("");
    setRemoveStoredImage(Boolean(member?.image));
    setImageError(undefined);
  }

  async function submit(validated: TeamMemberFormValues, event?: BaseSyntheticEvent) {
    if (!member && !image) {
      setImageError("La fotografia es obligatoria para crear un integrante.");
      return;
    }
    setServerError(undefined);
    const data: TeamMemberMutation = {
      ...validated,
      name: validated.name.trim(),
      role: validated.role.trim(),
      career: validated.career.trim(),
      description: validated.description.trim(),
      location: optional(validated.location),
      email: optional(validated.email),
      notificationEmail: optional(validated.notificationEmail),
      receiveApplications: Boolean(validated.receiveApplications),
      instagramUrl: optional(validated.instagramUrl),
      linkedinUrl: optional(validated.linkedinUrl),
      facebookUrl: optional(validated.facebookUrl),
      twitterUrl: optional(validated.twitterUrl),
    };
    try {
      if (member) {
        await teamAdminService.update(member.id, {
          ...data,
          status: member.status,
          version: member.version,
        }, image, removeStoredImage);
      } else {
        const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter as HTMLButtonElement | undefined;
        await teamAdminService.create({ ...data, publishNow: submitter?.value === "publish" }, image!);
      }
      onSaved();
      onOpenChange(false);
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "No se pudo guardar el integrante.");
    }
  }

  const previewMember: TeamMember = {
    id: member?.id ?? "preview",
    name: values.name || "Nombre del integrante",
    role: values.role || "Cargo en Fuerza UPT",
    career: values.career || "Carrera profesional",
    description: values.description || "La descripcion del integrante aparecera en este espacio.",
    location: optional(values.location),
    email: optional(values.email),
    imageUrl: previewUrl,
    socialLinks: [
      ...(values.instagramUrl ? [{ platform: "INSTAGRAM" as const, url: values.instagramUrl }] : []),
      ...(values.linkedinUrl ? [{ platform: "LINKEDIN" as const, url: values.linkedinUrl }] : []),
      ...(values.facebookUrl ? [{ platform: "FACEBOOK" as const, url: values.facebookUrl }] : []),
      ...(values.twitterUrl ? [{ platform: "TWITTER" as const, url: values.twitterUrl }] : []),
    ],
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isSubmitting) onOpenChange(next); }}>
      <DialogContent className="max-h-[94vh] overflow-y-auto rounded-3xl sm:max-w-6xl">
        <DialogHeader>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuerza-blue">Modulo Equipo</p>
          <DialogTitle className="text-2xl font-bold text-fuerza-navy">{member ? "Editar integrante" : "Nuevo integrante"}</DialogTitle>
          <DialogDescription>Completa los datos publicos. La vista previa se actualiza mientras escribes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)}>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.82fr)]">
            <div className="space-y-5">
              <TeamMemberImagePicker
                previewUrl={previewUrl}
                hasStoredImage={Boolean(member?.image) && !removeStoredImage}
                error={imageError}
                onChange={chooseImage}
                onRemove={removeImage}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre completo" error={errors.name?.message}><input {...register("name")} className={fieldClass} /></Field>
                <Field label="Cargo" error={errors.role?.message}><input {...register("role")} className={fieldClass} /></Field>
                <Field label="Carrera" error={errors.career?.message}><input {...register("career")} className={fieldClass} /></Field>
                <Field label="Categoria" error={errors.category?.message}>
                  <select {...register("category")} className={fieldClass}>
                    <option value="DIRECTIVA">Directiva</option>
                    <option value="REPRESENTANTE">Representante</option>
                    <option value="COORDINACION">Coordinacion</option>
                    <option value="VOLUNTARIADO">Voluntariado</option>
                    <option value="ALIADO">Aliado</option>
                  </select>
                </Field>
              </div>
              <Field label="Descripcion" error={errors.description?.message}>
                <textarea {...register("description")} rows={5} className={`${fieldClass} resize-y`} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ubicacion" error={errors.location?.message}><input {...register("location")} className={fieldClass} /></Field>
                <Field label="Correo publico" error={errors.email?.message}><input type="email" placeholder="usuario@correo.com" {...register("email")} className={fieldClass} /></Field>
                <Field label="Instagram" error={errors.instagramUrl?.message}><input type="url" placeholder="https://instagram.com/..." {...register("instagramUrl")} className={fieldClass} /></Field>
                <Field label="LinkedIn" error={errors.linkedinUrl?.message}><input type="url" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} className={fieldClass} /></Field>
                <Field label="Facebook" error={errors.facebookUrl?.message}><input type="url" placeholder="https://facebook.com/..." {...register("facebookUrl")} className={fieldClass} /></Field>
                <Field label="Twitter / X" error={errors.twitterUrl?.message}><input type="url" placeholder="https://x.com/..." {...register("twitterUrl")} className={fieldClass} /></Field>
              </div>
              <div className="rounded-2xl border border-fuerza-border bg-slate-50/80 p-4 sm:p-5">
                <div className="mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-fuerza-navy">Notificaciones internas</h3>
                  <p className="mt-0.5 text-xs text-fuerza-muted">Configura el correo privado para notificaciones operativas de Fuerza UPT.</p>
                </div>
                <div className="space-y-3">
                  <Field label="Correo para postulaciones" error={errors.notificationEmail?.message}>
                    <input type="email" placeholder="coordinacion@fuerzaupt.pe" {...register("notificationEmail")} className={fieldClass} />
                  </Field>
                  <label className="flex items-start gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      {...register("receiveApplications")}
                      className="mt-0.5 size-4 rounded border-gray-300 text-fuerza-blue focus:ring-fuerza-blue"
                    />
                    <div>
                      <span className="text-sm font-bold text-fuerza-navy">Recibir postulaciones de “Únete”</span>
                      <p className="text-xs text-fuerza-muted mt-0.5">
                        Este correo es privado y no se mostrará públicamente en la web.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <TeamMemberPreview member={previewMember} />
          </div>
          {serverError ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{serverError}</p> : null}
          <DialogFooter className="mt-7 border-t border-fuerza-border pt-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            {!member ? (
              <Button type="submit" name="intent" value="draft" variant="secondary" disabled={isSubmitting}>
                <Save />Guardar borrador
              </Button>
            ) : null}
            <Button type="submit" name="intent" value="publish" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : member ? <Save /> : <Send />}
              {member ? "Guardar cambios" : "Publicar ahora"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
      {error ? <span className="mt-1.5 block text-xs font-semibold normal-case tracking-normal text-red-600">{error}</span> : null}
    </label>
  );
}
