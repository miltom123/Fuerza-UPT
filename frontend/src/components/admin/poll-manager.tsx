"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, BarChart3, Download, ExternalLink, LoaderCircle, PencilLine, Plus, Save, Trash2, X } from "lucide-react";
import { pollAdminService } from "@/services/admin/poll-admin-service";
import type { PollMutation, PollQuestionType, PollResults, PollStatus, PollSummary } from "@/types/poll";

const statusLabels: Record<PollStatus, string> = {
  DRAFT: "Borrador",
  SCHEDULED: "Programada",
  OPEN: "Abierta",
  CLOSED: "Cerrada",
  ARCHIVED: "Archivada",
};

const allowedTransitions: Record<PollStatus, PollStatus[]> = {
  DRAFT: ["DRAFT", "SCHEDULED", "OPEN", "ARCHIVED"],
  SCHEDULED: ["SCHEDULED", "DRAFT", "OPEN", "CLOSED", "ARCHIVED"],
  OPEN: ["OPEN", "CLOSED", "ARCHIVED"],
  CLOSED: ["CLOSED", "ARCHIVED"],
  ARCHIVED: ["ARCHIVED", "DRAFT"],
};

function newDraft(): PollMutation {
  return {
    slug: "",
    title: "",
    description: "",
    status: "DRAFT",
    allowAnonymous: true,
    showResults: false,
    featured: false,
    questions: [newQuestion("SINGLE_CHOICE", 0)],
  };
}

function newQuestion(type: PollQuestionType, displayOrder: number): PollMutation["questions"][number] {
  const choice = type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
  return {
    questionText: "",
    questionType: type,
    required: true,
    displayOrder,
    options: choice ? [{ label: "", displayOrder: 0 }, { label: "", displayOrder: 1 }] : [],
  };
}

export function PollManager() {
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [draft, setDraft] = useState<PollMutation>(newDraft);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionsLocked, setQuestionsLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [results, setResults] = useState<PollResults | null>(null);

  useEffect(() => {
    let active = true;
    pollAdminService.list()
      .then((page) => { if (active) setPolls(page.content); })
      .catch(() => { if (active) setError("No se pudieron cargar las encuestas."); });
    return () => { active = false; };
  }, [refresh]);

  function openCreate() {
    setDraft(newDraft());
    setEditingId(null);
    setQuestionsLocked(false);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setQuestionsLocked(false);
    setDraft(newDraft());
  }

  async function openEdit(id: string) {
    setBusy(true);
    setError(null);
    try {
      const admin = await pollAdminService.detail(id);
      const { poll, questions } = admin.detail;
      setDraft({
        slug: poll.slug,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        startAt: poll.startAt,
        endAt: poll.endAt,
        allowAnonymous: poll.allowAnonymous,
        showResults: poll.showResults,
        featured: poll.featured,
        version: poll.version,
        questions: questions.map((question) => ({
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          displayOrder: question.displayOrder,
          options: question.options.map((option) => ({ label: option.label, displayOrder: option.displayOrder })),
        })),
      });
      setQuestionsLocked(admin.responseCount > 0);
      setEditingId(id);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo abrir la encuesta.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        await pollAdminService.update(editingId, {
          ...draft,
          questions: questionsLocked ? [] : draft.questions,
        });
      } else {
        await pollAdminService.create(draft);
      }
      closeForm();
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la encuesta.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(poll: PollSummary, status: PollStatus) {
    setBusy(true);
    setError(null);
    try {
      await pollAdminService.changeStatus(poll.id, status, poll.version);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado.");
    } finally {
      setBusy(false);
    }
  }

  async function archive(poll: PollSummary) {
    if (!window.confirm(`Archivar "${poll.title}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      await pollAdminService.archive(poll.id);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo archivar.");
    } finally {
      setBusy(false);
    }
  }

  async function loadResults(id: string) {
    setError(null);
    try {
      setResults(await pollAdminService.results(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los resultados.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-5 rounded-[2rem] bg-fuerza-navy p-7 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Consultas informativas</p>
          <h1 className="mt-2 text-3xl font-bold">Encuestas</h1>
          <p className="mt-2 text-sm text-blue-100/75">Crea, programa, abre, cierra y analiza consultas pequeñas.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-fuerza-navy">
          <Plus className="size-4" />Nueva encuesta
        </button>
      </header>

      {error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {showForm ? (
        <PollEditor
          draft={draft}
          setDraft={setDraft}
          editing={Boolean(editingId)}
          questionsLocked={questionsLocked}
          busy={busy}
          onSubmit={save}
          onCancel={closeForm}
        />
      ) : null}

      <div className="mt-6 grid gap-4">
        {polls.map((poll) => (
          <article key={poll.id} className="rounded-2xl border border-fuerza-border bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-fuerza-blue">{statusLabels[poll.status]}</span>
                  {poll.featured ? <span className="text-xs font-bold text-amber-700">Destacada</span> : null}
                  <span className="text-xs text-fuerza-muted">v{poll.version}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-fuerza-navy">{poll.title}</h2>
                {poll.description ? <p className="mt-1 text-sm text-fuerza-muted">{poll.description}</p> : null}
              </div>
              <select disabled={busy} value={poll.status} onChange={(event) => changeStatus(poll, event.target.value as PollStatus)} className="rounded-xl border border-fuerza-border bg-white px-3 py-2 text-sm font-bold">
                {allowedTransitions[poll.status].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(poll.id)} disabled={busy} title="Editar" className="inline-flex size-10 items-center justify-center rounded-xl border"><PencilLine className="size-4" /></button>
                {poll.status === "OPEN" ? <Link href={`/encuestas/${poll.slug}`} target="_blank" title="Vista pública" className="inline-flex size-10 items-center justify-center rounded-xl border"><ExternalLink className="size-4" /></Link> : null}
                <button type="button" onClick={() => loadResults(poll.id)} title="Resultados" className="inline-flex size-10 items-center justify-center rounded-xl border"><BarChart3 className="size-4" /></button>
                <a href={`/api/admin/encuestas/${poll.id}/exportar`} title="Exportar CSV" className="inline-flex size-10 items-center justify-center rounded-xl border"><Download className="size-4" /></a>
                <button type="button" disabled={poll.status === "ARCHIVED" || busy} onClick={() => archive(poll)} title="Archivar" className="inline-flex size-10 items-center justify-center rounded-xl border text-red-600 disabled:opacity-40"><Archive className="size-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {results ? <ResultsPanel results={results} onClose={() => setResults(null)} /> : null}
    </div>
  );
}

function PollEditor({
  draft,
  setDraft,
  editing,
  questionsLocked,
  busy,
  onSubmit,
  onCancel,
}: {
  draft: PollMutation;
  setDraft: React.Dispatch<React.SetStateAction<PollMutation>>;
  editing: boolean;
  questionsLocked: boolean;
  busy: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  function updateQuestion(index: number, patch: Partial<PollMutation["questions"][number]>) {
    const questions = [...draft.questions];
    questions[index] = { ...questions[index], ...patch };
    setDraft({ ...draft, questions });
  }

  function changeQuestionType(index: number, type: PollQuestionType) {
    const current = draft.questions[index];
    const choice = type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
    updateQuestion(index, {
      questionType: type,
      options: choice ? (current.options.length >= 2 ? current.options : newQuestion(type, index).options) : [],
    });
  }

  function updateOption(questionIndex: number, optionIndex: number, label: string) {
    const options = [...draft.questions[questionIndex].options];
    options[optionIndex] = { ...options[optionIndex], label };
    updateQuestion(questionIndex, { options });
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-5 rounded-2xl border border-blue-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase text-fuerza-blue">{editing ? "Editar encuesta" : "Nueva encuesta"}</p><h2 className="mt-1 text-xl font-bold text-fuerza-navy">Datos y preguntas</h2></div>
        <button type="button" onClick={onCancel} aria-label="Cerrar editor" className="inline-flex size-9 items-center justify-center rounded-xl border"><X className="size-4" /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" required value={draft.title} onChange={(title) => setDraft({ ...draft, title, slug: draft.slug || slugify(title) })} />
        <Field label="Slug" required value={draft.slug} onChange={(slug) => setDraft({ ...draft, slug: slugify(slug) })} />
        <Field label="Descripción" value={draft.description ?? ""} onChange={(description) => setDraft({ ...draft, description })} />
        <Field label="Inicio" type="datetime-local" value={localDate(draft.startAt)} onChange={(value) => setDraft({ ...draft, startAt: value ? new Date(value).toISOString() : undefined })} />
        <Field label="Cierre" type="datetime-local" value={localDate(draft.endAt)} onChange={(value) => setDraft({ ...draft, endAt: value ? new Date(value).toISOString() : undefined })} />
      </div>
      <div className="flex flex-wrap gap-4 rounded-xl bg-[#f7f9fd] p-4 text-sm font-semibold text-fuerza-navy">
        <CheckField label="Permitir respuestas anónimas" checked={draft.allowAnonymous} onChange={(allowAnonymous) => setDraft({ ...draft, allowAnonymous })} />
        <CheckField label="Mostrar resultados al público" checked={draft.showResults} onChange={(showResults) => setDraft({ ...draft, showResults })} />
        <CheckField label="Destacar" checked={draft.featured} onChange={(featured) => setDraft({ ...draft, featured })} />
      </div>
      {questionsLocked ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">La estructura está bloqueada porque la encuesta ya tiene respuestas. Puedes editar título, fechas y configuración sin alterar las preguntas.</p> : null}
      <div className="space-y-4">
        {draft.questions.map((question, index) => (
          <div key={index} className="rounded-xl border border-fuerza-border bg-[#f7f9fd] p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
              <input required disabled={questionsLocked} placeholder={`Pregunta ${index + 1}`} value={question.questionText} onChange={(event) => updateQuestion(index, { questionText: event.target.value })} className="rounded-lg border border-fuerza-border px-3 py-2 text-sm disabled:bg-slate-100" />
              <select disabled={questionsLocked} value={question.questionType} onChange={(event) => changeQuestionType(index, event.target.value as PollQuestionType)} className="rounded-lg border border-fuerza-border bg-white px-3 py-2 text-sm disabled:bg-slate-100">
                <option value="SINGLE_CHOICE">Opción única</option><option value="MULTIPLE_CHOICE">Opción múltiple</option><option value="RATING">Escala 1-5</option><option value="SHORT_TEXT">Texto corto</option>
              </select>
              <button type="button" disabled={questionsLocked || draft.questions.length === 1} onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, questionIndex) => questionIndex !== index).map((item, order) => ({ ...item, displayOrder: order })) })} className="inline-flex size-10 items-center justify-center rounded-lg text-red-600 disabled:opacity-30"><Trash2 className="size-4" /></button>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-fuerza-muted"><input type="checkbox" disabled={questionsLocked} checked={question.required} onChange={(event) => updateQuestion(index, { required: event.target.checked })} />Obligatoria</label>
            {question.options.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <input required disabled={questionsLocked} placeholder={`Opción ${optionIndex + 1}`} value={option.label} onChange={(event) => updateOption(index, optionIndex, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-fuerza-border px-3 py-2 text-sm disabled:bg-slate-100" />
                    <button type="button" disabled={questionsLocked || question.options.length <= 2} onClick={() => updateQuestion(index, { options: question.options.filter((_, current) => current !== optionIndex).map((item, order) => ({ ...item, displayOrder: order })) })} className="text-red-600 disabled:opacity-30"><X className="size-4" /></button>
                  </div>
                ))}
                <button type="button" disabled={questionsLocked || question.options.length >= 20} onClick={() => updateQuestion(index, { options: [...question.options, { label: "", displayOrder: question.options.length }] })} className="rounded-lg border border-dashed border-blue-300 px-3 py-2 text-xs font-bold text-fuerza-blue disabled:opacity-40">Agregar opción</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {!questionsLocked ? (
        <div className="flex flex-wrap gap-2">
          {(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "SHORT_TEXT"] as PollQuestionType[]).map((type) => (
            <button key={type} type="button" onClick={() => setDraft({ ...draft, questions: [...draft.questions, newQuestion(type, draft.questions.length)] })} className="rounded-lg border px-3 py-2 text-xs font-bold">+ {questionTypeLabel(type)}</button>
          ))}
        </div>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-fuerza-border pt-5">
        <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2.5 text-sm font-bold text-fuerza-navy">Cancelar</button>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-fuerza-blue px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{editing ? "Guardar cambios" : "Guardar borrador"}</button>
      </div>
    </form>
  );
}

function ResultsPanel({ results, onClose }: { results: PollResults; onClose: () => void }) {
  return (
    <section className="mt-6 rounded-2xl border border-fuerza-border bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase text-fuerza-blue">Resultados internos</p><h2 className="mt-2 text-2xl font-bold text-fuerza-navy">{results.title}</h2></div>
        <div className="flex items-center gap-4"><strong className="text-3xl text-fuerza-blue">{results.totalResponses}</strong><button type="button" onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-xl border"><X className="size-4" /></button></div>
      </div>
      <div className="mt-5 space-y-4">
        {results.questions.map((question) => (
          <div key={question.questionId} className="rounded-xl bg-[#f7f9fd] p-4">
            <h3 className="font-bold text-fuerza-navy">{question.questionText}</h3>
            {question.averageRating !== undefined && question.averageRating !== null ? <p className="mt-2 text-sm">Promedio: {question.averageRating.toFixed(2)} / 5</p> : null}
            {question.options.map((option) => <div key={option.optionId} className="mt-2 flex justify-between gap-3 text-sm"><span>{option.label}</span><strong>{option.votes} ({option.percentage.toFixed(1)}%)</strong></div>)}
            {question.textAnswers.length ? <div className="mt-3 space-y-2">{question.textAnswers.map((answer, index) => <p key={index} className="rounded-lg bg-white p-3 text-sm text-fuerza-muted">{answer}</p>)}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-fuerza-muted">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-fuerza-border px-3 py-2.5 text-sm font-normal normal-case" /></label>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-fuerza-blue" />{label}</label>;
}

function questionTypeLabel(type: PollQuestionType) {
  return ({ SINGLE_CHOICE: "Opción única", MULTIPLE_CHOICE: "Opción múltiple", RATING: "Escala 1-5", SHORT_TEXT: "Texto corto" } as const)[type];
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function localDate(value?: string) {
  return value ? value.slice(0, 16) : "";
}
