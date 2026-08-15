"use client";

import Image from "next/image";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  PencilLine,
  RotateCcw,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import type { TeamMemberAdmin, TeamMemberStatus } from "@/types/team-member";
import { TeamMemberStatusBadge } from "./team-member-status-badge";

const categoryLabels = {
  DIRECTIVA: "Directiva",
  REPRESENTANTE: "Representante",
  COORDINACION: "Coordinacion",
  VOLUNTARIADO: "Voluntariado",
  ALIADO: "Aliado",
} as const;

interface TeamMemberRowProps {
  member: TeamMemberAdmin;
  index: number;
  count: number;
  busy: boolean;
  orderEnabled: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onStatus: (status: TeamMemberStatus) => void;
  onMove: (direction: -1 | 1) => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function TeamMemberRow({
  member,
  index,
  count,
  busy,
  orderEnabled,
  onPreview,
  onEdit,
  onStatus,
  onMove,
  onArchive,
  onDelete,
}: TeamMemberRowProps) {
  const nextStatus = member.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  return (
    <article className="grid gap-4 rounded-2xl border border-fuerza-border bg-white p-4 shadow-[0_8px_24px_rgba(6,27,77,0.04)] lg:grid-cols-[64px_minmax(0,1fr)_auto] lg:items-center">
      <div className="relative grid size-16 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
        {member.image?.url ? <Image src={member.image.url} alt="" fill sizes="64px" className="object-cover object-top" unoptimized /> : <UserRound className="size-8" />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <TeamMemberStatusBadge status={member.status} />
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-fuerza-blue">{categoryLabels[member.category]}</span>
          {member.receiveApplications ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              ✓ Recibe postulaciones
            </span>
          ) : null}
          <span className="text-xs font-bold text-fuerza-muted">Orden {member.displayOrder + 1}</span>
          <span className="text-xs text-fuerza-muted">v{member.version}</span>
        </div>
        <h2 className="mt-2 truncate text-base font-bold text-fuerza-navy">{member.name}</h2>
        <p className="mt-1 truncate text-sm text-fuerza-muted">{member.role} · {member.career}</p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <IconButton label="Vista previa" onClick={onPreview}><Eye /></IconButton>
        <IconButton label="Editar" onClick={onEdit}><PencilLine /></IconButton>
        {member.status === "ARCHIVED" ? (
          <IconButton label="Restaurar como borrador" onClick={() => onStatus("DRAFT")}><RotateCcw /></IconButton>
        ) : (
          <IconButton label={nextStatus === "PUBLISHED" ? "Publicar" : "Ocultar"} onClick={() => onStatus(nextStatus)}>
            {nextStatus === "PUBLISHED" ? <Upload /> : <EyeOff />}
          </IconButton>
        )}
        <IconButton label="Subir" disabled={!orderEnabled || index === 0} onClick={() => onMove(-1)}><ArrowUp /></IconButton>
        <IconButton label="Bajar" disabled={!orderEnabled || index === count - 1} onClick={() => onMove(1)}><ArrowDown /></IconButton>
        {member.status !== "ARCHIVED" ? (
          <IconButton label="Archivar" danger onClick={onArchive}><Archive /></IconButton>
        ) : (
          <IconButton label="Eliminar definitivamente" danger onClick={onDelete}><Trash2 /></IconButton>
        )}
      </div>
      {busy ? <span className="sr-only" aria-live="polite">Procesando cambios</span> : null}
    </article>
  );
}

function IconButton({ label, danger = false, disabled = false, onClick, children }: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-fuerza-border text-fuerza-navy hover:border-blue-200 hover:bg-blue-50 hover:text-fuerza-blue"} [&_svg]:size-4`}
    >
      {children}
    </button>
  );
}
