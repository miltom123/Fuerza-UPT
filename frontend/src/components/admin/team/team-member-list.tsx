"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { LoaderCircle, Plus, Search, UsersRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teamAdminService } from "@/services/admin/team-admin-service";
import type { TeamMember, TeamMemberAdmin, TeamMemberStatus } from "@/types/team-member";
import { TeamMemberDeleteDialog } from "./team-member-delete-dialog";
import { TeamMemberForm } from "./team-member-form";
import { TeamMemberPreview } from "./team-member-preview";
import { TeamMemberRow } from "./team-member-row";

type StatusFilter = TeamMemberStatus | "ALL";

export function TeamMemberList() {
  const [members, setMembers] = useState<TeamMemberAdmin[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("es"));
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [refresh, setRefresh] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMemberAdmin>();
  const [preview, setPreview] = useState<TeamMemberAdmin>();
  const [deleting, setDeleting] = useState<{ member: TeamMemberAdmin; permanent: boolean }>();

  useEffect(() => {
    let active = true;
    teamAdminService.list()
      .then((page) => { if (active) setMembers(page.content); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el equipo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  const visible = members.filter((member) => {
    const matchesStatus = status === "ALL" || member.status === status;
    const haystack = `${member.name} ${member.role} ${member.career}`.toLocaleLowerCase("es");
    return matchesStatus && (!deferredSearch || haystack.includes(deferredSearch));
  });
  const orderEnabled = status === "ALL" && !deferredSearch;

  function reload() {
    setLoading(true);
    setRefresh((value) => value + 1);
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
    setError(undefined);
  }

  async function changeStatus(member: TeamMemberAdmin, nextStatus: TeamMemberStatus) {
    setBusy(true);
    setError(undefined);
    try {
      await teamAdminService.changeStatus(member.id, nextStatus, member.version);
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado editorial.");
    } finally {
      setBusy(false);
    }
  }

  async function move(member: TeamMemberAdmin, direction: -1 | 1) {
    const index = members.findIndex(({ id }) => id === member.id);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= members.length) return;
    const reordered = [...members];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setBusy(true);
    setError(undefined);
    try {
      await teamAdminService.reorder(reordered);
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el orden.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    setError(undefined);
    try {
      if (deleting.permanent) await teamAdminService.removePermanently(deleting.member.id);
      else await teamAdminService.archive(deleting.member.id);
      setDeleting(undefined);
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar la accion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_85%_0%,#2c75ff_0,transparent_34%),linear-gradient(135deg,#061b4d,#092c72)] p-7 text-white shadow-[0_20px_55px_rgba(6,27,77,0.2)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Gestion de contenido</p>
            <h1 className="mt-2 text-3xl font-bold">Equipo Fuerza UPT</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">Administra perfiles, fotografias, visibilidad y orden desde un flujo unico.</p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-fuerza-navy shadow-lg transition hover:-translate-y-0.5">
            <Plus className="size-4" />Nuevo integrante
          </button>
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-200" />
            <span className="sr-only">Buscar integrante</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, cargo o carrera" className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white outline-none placeholder:text-blue-100/60 focus:border-white/50" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} aria-label="Filtrar por estado" className="h-11 rounded-xl border border-white/15 bg-[#0a2c70] px-3 text-sm font-bold text-white outline-none">
            <option value="ALL">Todos los estados</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Borradores</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>
      </header>

      {error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {!orderEnabled ? <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-800">Limpia la busqueda y selecciona todos los estados para cambiar el orden global.</p> : null}

      <div className="mt-6 space-y-3" aria-busy={loading || busy}>
        {loading ? <div className="grid min-h-48 place-items-center rounded-2xl border border-fuerza-border bg-white"><LoaderCircle className="size-7 animate-spin text-fuerza-blue" /></div> : null}
        {!loading && !visible.length ? (
          <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-fuerza-border bg-white p-8 text-center">
            <div><UsersRound className="mx-auto size-9 text-slate-300" /><h2 className="mt-3 font-bold text-fuerza-navy">No encontramos integrantes</h2><p className="mt-1 text-sm text-fuerza-muted">Prueba otro filtro o crea un perfil nuevo.</p></div>
          </div>
        ) : null}
        {!loading ? visible.map((member, index) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            index={orderEnabled ? members.findIndex(({ id }) => id === member.id) : index}
            count={orderEnabled ? members.length : visible.length}
            busy={busy}
            orderEnabled={orderEnabled && !busy}
            onPreview={() => setPreview(member)}
            onEdit={() => { setEditing(member); setFormOpen(true); setError(undefined); }}
            onStatus={(next) => changeStatus(member, next)}
            onMove={(direction) => move(member, direction)}
            onArchive={() => setDeleting({ member, permanent: false })}
            onDelete={() => setDeleting({ member, permanent: true })}
          />
        )) : null}
      </div>

      {formOpen ? (
        <TeamMemberForm
          key={editing?.id ?? "new"}
          open
          member={editing}
          onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(undefined); }}
          onSaved={reload}
        />
      ) : null}

      <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(undefined); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Vista previa publica</DialogTitle><DialogDescription>Esta vista no cambia el estado editorial.</DialogDescription></DialogHeader>
          {preview ? <TeamMemberPreview member={toPublicMember(preview)} /> : null}
        </DialogContent>
      </Dialog>

      <TeamMemberDeleteDialog
        member={deleting?.member ?? null}
        permanent={deleting?.permanent ?? false}
        busy={busy}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function toPublicMember(member: TeamMemberAdmin): TeamMember {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    career: member.career,
    description: member.description,
    location: member.location,
    email: member.email,
    imageUrl: member.image?.url ?? "",
    socialLinks: member.socialLinks,
  };
}
