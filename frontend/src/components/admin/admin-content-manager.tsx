"use client";

import { useEffect, useState } from "react";
import { Archive, Check, LoaderCircle, PencilLine, Plus, RotateCw, Search, X } from "lucide-react";
import { contentAdminService } from "@/services/admin/content-admin-service";
import type { AdminContentCreate, AdminContentRow, GenericAdminModule } from "@/types/admin";

const labels: Record<GenericAdminModule, string> = {
  representation: "Legado Fuerza UPT",
  events: "Eventos",
  opportunities: "Oportunidades",
  statistics: "Estadísticas",
};

const emptyCreate: AdminContentCreate = {
  slug: "",
  title: "",
  summary: "",
  status: "DRAFT",
  featured: false,
  displayOrder: 0,
};

export function AdminContentManager({ module }: { module: GenericAdminModule }) {
  const [rows, setRows] = useState<AdminContentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<AdminContentCreate>(emptyCreate);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let active = true;
    contentAdminService.list(module, 0, 20, search, statusFilter)
      .then((page) => {
        if (!active) return;
        setRows(page.content);
        setTotal(page.totalElements);
      })
      .catch(() => { if (active) setError("No se pudo cargar el módulo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [module, refresh, search, statusFilter]);

  async function createContent(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await contentAdminService.create(module, draft);
      setDraft(emptyCreate);
      setShowCreate(false);
      setLoading(true);
      setRefresh((value) => value + 1);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el contenido.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-5 rounded-[2rem] border border-fuerza-border bg-white p-6 shadow-[0_18px_50px_rgba(6,27,77,0.07)] sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-fuerza-blue">Gestión de contenidos</p><h1 className="mt-2 text-3xl font-bold text-fuerza-navy">{labels[module]}</h1><p className="mt-2 text-sm text-fuerza-muted">{total} registros almacenados en PostgreSQL.</p></div>
        <button type="button" onClick={() => setShowCreate((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuerza-blue px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(21,94,239,0.2)]"><Plus className="size-4" aria-hidden="true" />Nuevo registro</button>
      </header>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-fuerza-border bg-white p-4 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fuerza-muted" /><input value={search} onChange={(event) => { setLoading(true); setError(null); setSearch(event.target.value); }} placeholder="Buscar por titulo o slug" className="w-full rounded-xl border border-fuerza-border py-2.5 pl-10 pr-3 text-sm" /></label>
        <select value={statusFilter} onChange={(event) => { setLoading(true); setError(null); setStatusFilter(event.target.value); }} className="rounded-xl border border-fuerza-border bg-white px-4 py-2.5 text-sm font-semibold text-fuerza-navy"><option value="">Todos los estados</option><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="ARCHIVED">Archivado</option></select>
      </div>

      {showCreate ? (
        <form onSubmit={createContent} className="mt-5 grid gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_2fr_auto]">
          <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Slug<input required value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Título<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Resumen<input required minLength={10} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>
          <ModuleCreateFields module={module} draft={draft} setDraft={setDraft} />
          <div className="flex items-end gap-2"><button disabled={creating} className="inline-flex h-10 items-center gap-2 rounded-xl bg-fuerza-navy px-4 text-sm font-bold text-white disabled:opacity-60">{creating ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Crear</button><button type="button" onClick={() => setShowCreate(false)} className="inline-flex size-10 items-center justify-center rounded-xl border border-fuerza-border bg-white text-fuerza-muted"><X className="size-4" /></button></div>
        </form>
      ) : null}

      {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {loading ? <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-fuerza-border bg-white p-12 text-sm font-semibold text-fuerza-muted"><LoaderCircle className="size-5 animate-spin text-fuerza-blue" />Cargando contenido...</div> : null}
      {!loading && !rows.length ? <div className="mt-6 rounded-2xl border border-dashed border-fuerza-border bg-white p-12 text-center text-fuerza-muted">Todavía no existen registros en este módulo.</div> : null}
      <div className="mt-6 grid gap-4">
        {rows.map((row) => <EditableContentRow key={`${row.id}-${row.version}-${row.status}`} module={module} row={row} onChanged={() => { setLoading(true); setRefresh((value) => value + 1); }} onError={setError} />)}
      </div>
    </div>
  );
}

function EditableContentRow({ module, row, onChanged, onError }: { module: GenericAdminModule; row: AdminContentRow; onChanged: () => void; onError: (message: string) => void }) {
  const [title, setTitle] = useState(row.title);
  const [summary, setSummary] = useState(row.summary ?? "");
  const [status, setStatus] = useState(row.status);
  const [featured, setFeatured] = useState(row.featured);
  const [displayOrder, setDisplayOrder] = useState(row.displayOrder);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await contentAdminService.update(module, row.id, { title, summary, coverImage: row.coverImage, status, featured, displayOrder, version: row.version });
      onChanged();
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "No se pudo guardar el cambio.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!window.confirm(`¿Archivar "${row.title}"?`)) return;
    setSaving(true);
    try {
      await contentAdminService.archive(module, row.id);
      onChanged();
    } catch (archiveError) {
      onError(archiveError instanceof Error ? archiveError.message : "No se pudo archivar el contenido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-2xl border border-fuerza-border bg-white p-5 shadow-[0_10px_30px_rgba(6,27,77,0.04)]">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr_160px_90px_auto] lg:items-end">
        <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Título<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-fuerza-border px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-fuerza-navy" /></label>
        <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Resumen<input value={summary} onChange={(event) => setSummary(event.target.value)} className="mt-2 w-full rounded-xl border border-fuerza-border px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>
        <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Estado<select value={status} onChange={(event) => setStatus(event.target.value as AdminContentRow["status"])} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-fuerza-navy"><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="ARCHIVED">Archivado</option></select></label>
        <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Orden<input type="number" min={0} value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-fuerza-border px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>
        <div className="flex gap-2"><button type="button" onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-fuerza-blue px-4 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <PencilLine className="size-4" />}Guardar</button><button type="button" onClick={archive} disabled={saving || row.status === "ARCHIVED"} className="inline-flex size-10 items-center justify-center rounded-xl border border-fuerza-border text-fuerza-muted disabled:opacity-40" title="Archivar"><Archive className="size-4" /></button></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-fuerza-border pt-3 text-xs text-fuerza-muted"><code>{row.slug}</code><label className="inline-flex items-center gap-2 font-semibold"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />Destacado</label><span className="ml-auto inline-flex items-center gap-1"><RotateCw className="size-3" />versión {row.version}</span></div>
    </article>
  );
}

function ModuleCreateFields({ module, draft, setDraft }: { module: GenericAdminModule; draft: AdminContentCreate; setDraft: React.Dispatch<React.SetStateAction<AdminContentCreate>> }) {
  if (module === "representation") return <><Field label="Area beneficiaria" required value={draft.beneficiaryArea ?? ""} onChange={(value) => setDraft({ ...draft, beneficiaryArea: value })} /><Field label="Propuesta o gestion" required value={draft.proposalOrManagement ?? ""} onChange={(value) => setDraft({ ...draft, proposalOrManagement: value })} /></>;
  if (module === "events") return <><Field label="Fecha inicial" type="date" value={draft.startDate ?? ""} onChange={(value) => setDraft({ ...draft, startDate: value })} /><label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">Registro<select value={draft.registrationMode ?? "NONE"} onChange={(event) => setDraft({ ...draft, registrationMode: event.target.value })} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm normal-case"><option value="NONE">Sin registro</option><option value="INTERNAL">Interno</option><option value="EXTERNAL">Externo</option></select></label>{draft.registrationMode === "EXTERNAL" ? <Field label="URL externa" required value={draft.registrationUrl ?? ""} onChange={(value) => setDraft({ ...draft, registrationUrl: value })} /> : null}</>;
  if (module === "opportunities") return <><Field label="Institucion" value={draft.institution ?? ""} onChange={(value) => setDraft({ ...draft, institution: value })} /><Field label="Fecha limite" type="date" value={draft.endDate ?? ""} onChange={(value) => setDraft({ ...draft, endDate: value })} /><Field label="URL oficial" value={draft.officialUrl ?? ""} onChange={(value) => setDraft({ ...draft, officialUrl: value })} /></>;
  if (module === "statistics") return <Field label="Valor" value={draft.value ?? ""} onChange={(value) => setDraft({ ...draft, value })} />;
  return <Field label="Categoria" value={draft.category ?? ""} onChange={(value) => setDraft({ ...draft, category: value })} />;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-fuerza-border bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-fuerza-navy" /></label>;
}
