"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  RepresentationAdminRequest,
  RepresentationAdminResponse,
} from "@/services/admin/representation-admin-service";

interface RepresentationEditorModalProps {
  item: RepresentationAdminResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: RepresentationAdminRequest) => Promise<void>;
}

export function RepresentationEditorModal({
  item,
  isOpen,
  onClose,
  onSave,
}: RepresentationEditorModalProps) {
  const [formData, setFormData] = useState<RepresentationAdminRequest>({
    title: "",
    slug: "",
    summary: "",
    coverImageUrl: "",
    contentStatus: "DRAFT",
    featured: false,
    displayOrder: 0,
    kind: "LOGRO",
    progress: "PRESENTADO",
    progressPercentage: 50,
    impactLevel: "MEDIO",
    beneficiaryArea: "Comunidad UPT",
    identifiedProblem: "",
    proposalOrManagement: "",
    result: "",
    actions: [""],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"EDIT" | "PREVIEW">("EDIT");

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        slug: item.slug || "",
        summary: item.summary || "",
        coverImageUrl: item.coverImageUrl || "",
        contentStatus: item.contentStatus || "DRAFT",
        featured: item.featured ?? false,
        displayOrder: item.displayOrder ?? 0,
        kind: item.kind || "LOGRO",
        progress: item.progress || "PRESENTADO",
        progressPercentage: item.progressPercentage ?? 50,
        impactLevel: item.impactLevel || "MEDIO",
        beneficiaryArea: item.beneficiaryArea || "Comunidad UPT",
        identifiedProblem: item.identifiedProblem || "",
        proposalOrManagement: item.proposalOrManagement || "",
        result: item.result || "",
        actions: item.actions && item.actions.length ? [...item.actions] : [""],
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        summary: "",
        coverImageUrl: "",
        contentStatus: "DRAFT",
        featured: false,
        displayOrder: 0,
        kind: "LOGRO",
        progress: "PRESENTADO",
        progressPercentage: 50,
        impactLevel: "MEDIO",
        beneficiaryArea: "Comunidad UPT",
        identifiedProblem: "",
        proposalOrManagement: "",
        result: "",
        actions: [""],
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        ...formData,
        actions: formData.actions?.filter((a) => a.trim().length > 0),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionChange = (index: number, value: string) => {
    const next = [...(formData.actions || [])];
    next[index] = value;
    setFormData({ ...formData, actions: next });
  };

  const addActionRow = () => {
    setFormData({ ...formData, actions: [...(formData.actions || []), ""] });
  };

  const removeActionRow = (index: number) => {
    const next = (formData.actions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, actions: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-fuerza-blue">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-fuerza-navy">
                {item ? "Editar Legado Fuerza UPT" : "Nuevo registro en Legado Fuerza UPT"}
              </h2>
              <p className="text-xs text-slate-400">
                Edita los datos y visualiza la vista previa pública en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Tab Toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 sm:hidden">
              <button
                type="button"
                onClick={() => setActiveTab("EDIT")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === "EDIT" ? "bg-fuerza-blue text-white" : "text-slate-600"
                }`}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PREVIEW")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === "PREVIEW" ? "bg-fuerza-blue text-white" : "text-slate-600"
                }`}
              >
                Vista previa
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* MODAL SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANE: FORM EDITING */}
          <form
            onSubmit={handleSubmit}
            className={`flex-1 overflow-y-auto p-6 space-y-6 ${
              activeTab === "PREVIEW" ? "hidden sm:block" : "block"
            } sm:w-1/2 border-r border-slate-100`}
          >
            {/* Title & Slug */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título de la propuesta o logro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Ampliación del horario de biblioteca universitaria"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo / Clase
                  </label>
                  <select
                    value={formData.kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue"
                  >
                    <option value="LOGRO">LOGRO</option>
                    <option value="PROPUESTA">PROPUESTA</option>
                    <option value="GESTION">GESTIÓN</option>
                    <option value="ACUERDO">ACUERDO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Editorial
                  </label>
                  <select
                    value={formData.contentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentStatus: e.target.value as "PUBLISHED" | "DRAFT",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue"
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Progress Percentage & Status */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Porcentaje de Avance</span>
                <span className="text-xs font-extrabold text-fuerza-blue">
                  {formData.progressPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progressPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, progressPercentage: parseInt(e.target.value, 10) })
                }
                className="w-full accent-fuerza-blue cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Etapa de Avance
                  </label>
                  <select
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="PRESENTADO">PRESENTADO</option>
                    <option value="EN_DIALOGO">EN DIÁLOGO</option>
                    <option value="APROBADO">APROBADO</option>
                    <option value="EN_EJECUCION">EN EJECUCIÓN</option>
                    <option value="CUMPLIDO">CUMPLIDO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Nivel de Impacto
                  </label>
                  <select
                    value={formData.impactLevel}
                    onChange={(e) => setFormData({ ...formData, impactLevel: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="ALTO">ALTO</option>
                    <option value="MEDIO">MEDIO</option>
                    <option value="GLOBAL">GLOBAL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resumen / Breve descripción
              </label>
              <textarea
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Breve resumen visible en las tarjetas públicas..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-fuerza-blue"
              />
            </div>

            {/* Problem & Proposal */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Problema Identificado
                </label>
                <textarea
                  rows={2}
                  value={formData.identifiedProblem}
                  onChange={(e) => setFormData({ ...formData, identifiedProblem: e.target.value })}
                  placeholder="Describa la necesidad o problemática reportada por los estudiantes..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Propuesta / Gestión realizada
                </label>
                <textarea
                  rows={2}
                  value={formData.proposalOrManagement}
                  onChange={(e) =>
                    setFormData({ ...formData, proposalOrManagement: e.target.value })
                  }
                  placeholder="Detalle la solución o gestión ante las autoridades UPT..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resultado alcanzado
                </label>
                <textarea
                  rows={2}
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="Resultado u homologación obtenida..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                />
              </div>
            </div>

            {/* Actions List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Acciones realizadas</label>
                <button
                  type="button"
                  onClick={addActionRow}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-fuerza-blue hover:underline"
                >
                  <Plus className="size-3" /> Añadir acción
                </button>
              </div>

              <div className="space-y-2">
                {(formData.actions || []).map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={act}
                      onChange={(e) => handleActionChange(idx, e.target.value)}
                      placeholder={`Acción ${idx + 1}...`}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                    />
                    {(formData.actions || []).length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeActionRow(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="size-4 rounded-md border-slate-300 text-fuerza-blue accent-fuerza-blue"
              />
              <label htmlFor="featuredCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                Destacar en la página principal (Home Legado UPT)
              </label>
            </div>
          </form>

          {/* RIGHT PANE: REAL-TIME LIVE PREVIEW */}
          <div
            className={`flex-1 overflow-y-auto bg-slate-100/70 p-6 ${
              activeTab === "EDIT" ? "hidden sm:block" : "block"
            } sm:w-1/2`}
          >
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>VISTA PREVIA EN TIEMPO REAL</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Public View Sync</span>
            </div>

            {/* Public Card Replica */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md space-y-5">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-fuerza-blue">
                  {formData.kind || "LOGRO"}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <TrendingUp className="size-3.5" />
                  <span>{formData.progress || "PRESENTADO"} ({formData.progressPercentage}%)</span>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-lg font-extrabold text-fuerza-navy">
                  {formData.title || "Título de la propuesta..."}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {formData.summary || "Resumen explicativo del logro o propuesta..."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Progreso de implementación</span>
                  <span>{formData.progressPercentage}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-fuerza-blue transition-all duration-300"
                    style={{ width: `${formData.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Problem / Management Breakdown */}
              {formData.identifiedProblem || formData.proposalOrManagement ? (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3 text-xs">
                  {formData.identifiedProblem ? (
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <HelpCircle className="size-3.5 text-amber-500" /> Problema reportado:
                      </span>
                      <p className="mt-1 text-slate-600 font-normal">{formData.identifiedProblem}</p>
                    </div>
                  ) : null}

                  {formData.proposalOrManagement ? (
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Target className="size-3.5 text-fuerza-blue" /> Gestión realizada:
                      </span>
                      <p className="mt-1 text-slate-600 font-normal">{formData.proposalOrManagement}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Actions List */}
              {formData.actions && formData.actions.filter((a) => a.trim()).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800">Acciones concretas:</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {formData.actions
                      .filter((a) => a.trim())
                      .map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              <div className="pt-2 border-t border-slate-100 text-right">
                <span className="text-[11px] font-bold text-fuerza-blue flex items-center justify-end gap-1">
                  Ver detalle completo <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !formData.title.trim()}
            className="bg-fuerza-blue hover:bg-blue-700 text-white font-bold px-6"
          >
            <Save className="mr-2 size-4" />
            {isSaving ? "Guardando..." : "Guardar y publicar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
