import type { TeamMemberStatus } from "@/types/team-member";

const statusStyles: Record<TeamMemberStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-800",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ARCHIVED: "border-slate-200 bg-slate-100 text-slate-600",
};

const statusLabels: Record<TeamMemberStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export function TeamMemberStatusBadge({ status }: { status: TeamMemberStatus }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}
