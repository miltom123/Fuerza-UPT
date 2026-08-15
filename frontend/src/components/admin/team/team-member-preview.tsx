import type { TeamMember } from "@/types/team-member";
import { TeamMemberCard } from "@/components/team/team-member-card";

export function TeamMemberPreview({ member }: { member: TeamMember }) {
  return (
    <section aria-label="Vista previa publica" className="rounded-3xl bg-[radial-gradient(circle_at_top_left,#dbe8ff,transparent_52%),#f5f7fb] p-4 lg:sticky lg:top-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-fuerza-blue">Vista previa</p><p className="mt-1 text-xs text-fuerza-muted">Asi se vera en la pagina publica.</p></div>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-fuerza-muted shadow-sm">En vivo</span>
      </div>
      <TeamMemberCard member={member} preview />
    </section>
  );
}
