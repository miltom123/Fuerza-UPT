"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Coins,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  Laptop,
  Link2,
  Megaphone,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaAdminService } from "@/services/admin/media-admin-service";
import type { OpportunityType, OpportunityStatus } from "@/types/opportunity";
import type { OpportunityAdminItem, OpportunityAdminRequest } from "@/services/admin/opportunity-admin-service";

interface OpportunityEditorModalProps {
  isOpen: boolean;
  opportunity: OpportunityAdminItem | null;
  onClose: () => void;
  onSave: (data: OpportunityAdminRequest) => Promise<void>;
}

const PRESET_COVERS = [
  { name: "Estudiantes en campus", url: "/images/hero-equipo.png" },
  { name: "Equipo Fuerza UPT", url: "/images/fuerza-upt-equipo.jpg" },
  { name: "Biblioteca y estudio", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80" },
  { name: "Campus y graduación", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80" },
  { name: "Intercambio internacional", url: "/images/exchange-berlin.png" },
  { name: "Arquitectura y diseño", url: "/images/exchange-florence.png" },
];

const OPPORTUNITY_TYPES: { type: OpportunityType; label: string; icon: any; color: string }[] = [
  { type: "SCHOLARSHIP", label: "Beca académica", icon: GraduationCap, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { type: "EXCHANGE", label: "Intercambio estudiantil", icon: Plane, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { type: "INTERNATIONAL_PROGRAM", label: "Movilidad académica", icon: Building2, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { type: "CALL", label: "Convocatoria institucional", icon: Megaphone, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { type: "VOLUNTEERING", label: "Apoyo económico / Voluntariado", icon: Coins, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { type: "CONTEST", label: "Concurso / Investigación", icon: Award, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { type: "INTERNSHIP", label: "Prácticas preprofesionales", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { type: "EXTERNAL_COURSE", label: "Curso / Certificación", icon: Laptop, color: "text-sky-600 bg-sky-50 border-sky-200" },
];

export function OpportunityEditorModal({
  isOpen,
  opportunity,
  onClose,
  onSave,
}: OpportunityEditorModalProps) {
  const [formData, setFormData] = useState<OpportunityAdminRequest>({
    slug: "",
    title: "",
    summary: "",
    description: "",
    coverImage: "/images/hero-equipo.png",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 0,
    category: "SCHOLARSHIP",
    institution: "Universidad Privada de Tacna",
    endDate: "",
    modality: "Presencial",
    domainStatus: "OPEN",
    officialUrl: "",
    applicationUrl: "",
    proposalOrManagement: "",
    result: "",
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [newRequirementInput, setNewRequirementInput] = useState("");

  const [enableApplyButton, setEnableApplyButton] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<"MODAL" | "CARD">("MODAL");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync form when opening
  useEffect(() => {
    if (opportunity) {
      setFormData({
        slug: opportunity.slug || "",
        title: opportunity.title || "",
        summary: opportunity.summary || "",
        description: opportunity.description || opportunity.summary || "",
        coverImage: opportunity.coverImage || "/images/hero-equipo.png",
        status: (opportunity.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
        featured: opportunity.featured || false,
        displayOrder: opportunity.displayOrder || 0,
        category: (opportunity.opportunityType as OpportunityType) || "SCHOLARSHIP",
        institution: opportunity.institution || "Universidad Privada de Tacna",
        endDate: opportunity.deadline || "",
        modality: opportunity.countryOrModality || "Presencial",
        domainStatus: opportunity.opportunityStatus || "OPEN",
        officialUrl: opportunity.officialUrl || "",
        applicationUrl: opportunity.applicationUrl || "",
        version: opportunity.version || 0,
      });

      setBenefitsList(opportunity.benefits || []);
      setRequirementsList(opportunity.requirements || []);
      setEnableApplyButton(Boolean(opportunity.applicationUrl && opportunity.applicationUrl.trim().length > 0));
    } else {
      setFormData({
        slug: "",
        title: "",
        summary: "",
        description: "",
        coverImage: "/images/hero-equipo.png",
        status: "PUBLISHED",
        featured: false,
        displayOrder: 0,
        category: "SCHOLARSHIP",
        institution: "Universidad Privada de Tacna",
        endDate: "",
        modality: "Presencial",
        domainStatus: "OPEN",
        officialUrl: "",
        applicationUrl: "",
        proposalOrManagement: "",
        result: "",
      });
      setBenefitsList([
        "Exoneración del 100% de la pensión académica",
        "Acceso prioritario a biblioteca y laboratorios",
      ]);
      setRequirementsList([
        "Promedio ponderado mayor a 16.5",
        "Pertenecer al tercio superior",
        "Sin sanciones disciplinarias",
      ]);
      setEnableApplyButton(true);
    }
  }, [opportunity, isOpen]);

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: !opportunity ? slug : prev.slug,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await mediaAdminService.upload(file, false);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.url }));
      }
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const addBenefit = () => {
    const trimmed = newBenefitInput.trim();
    if (!trimmed) return;
    setBenefitsList((prev) => [...prev, trimmed]);
    setNewBenefitInput("");
  };

  const removeBenefit = (index: number) => {
    setBenefitsList((prev) => prev.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    const trimmed = newRequirementInput.trim();
    if (!trimmed) return;
    setRequirementsList((prev) => [...prev, trimmed]);
    setNewRequirementInput("");
  };

  const removeRequirement = (index: number) => {
    setRequirementsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSubmitting(true);
      const payload: OpportunityAdminRequest = {
        ...formData,
        proposalOrManagement: benefitsList.join("\n"),
        result: requirementsList.join("\n"),
        applicationUrl: enableApplyButton ? (formData.applicationUrl || "https://fuerzaupt.edu.pe/postular") : "",
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col h-[94vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-fuerza-blue text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {opportunity ? "Editar Beca u Oportunidad" : "Nueva Beca u Oportunidad"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-200">
                  <Sparkles className="size-2.5" /> LIVE PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualiza los cambios en tiempo real en la tarjeta pública y el modal de detalle ampliado.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* MODAL BODY (SPLIT VIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* LEFT FORM (7 COLS) */}
          <div className="lg:col-span-6 overflow-y-auto p-6 space-y-6 border-r border-slate-100 bg-slate-50/40">
            <form id="opportunity-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Title & Slug */}
              <div className="space-y-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Información Principal
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la beca / oportunidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Beca Excelencia Académica 2026"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Oportunidad
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as OpportunityType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue"
                    >
                      {OPPORTUNITY_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institución Convocante
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Universidad Privada de Tacna"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, institution: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Modalidad / Lugar
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Presencial / Virtual / Tacna"
                      value={formData.modality}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, modality: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha Límite (Deadline)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción / Resumen de la convocatoria
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descripción clara y concisa de lo que ofrece esta oportunidad..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                        summary: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                  />
                </div>
              </div>

              {/* Cover Image Selection */}
              <div className="space-y-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Imagen de Cabecera / Portada
                </span>

                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-slate-400">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                      <Upload className="size-3.5" />
                      <span>{isUploading ? "Subiendo..." : "Subir foto desde PC"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {uploadError && <p className="text-[11px] text-red-500 font-bold">{uploadError}</p>}
                    <input
                      type="text"
                      placeholder="O pega una URL de imagen..."
                      value={formData.coverImage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                    />
                  </div>
                </div>

                {/* Preset covers */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    O selecciona una imagen predeterminada:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, coverImage: preset.url }))
                        }
                        className={`p-1.5 rounded-xl border text-left text-[10px] font-bold flex items-center gap-1.5 transition ${
                          formData.coverImage === preset.url
                            ? "border-fuerza-blue bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className="size-4 rounded-full overflow-hidden shrink-0 bg-slate-200">
                          <img src={preset.url} alt="" className="size-full object-cover" />
                        </div>
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beneficios dinámicos */}
              <div className="space-y-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Beneficios Ofrecidos ({benefitsList.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Exoneración del 100% de la pensión"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                  />
                  <Button
                    type="button"
                    onClick={addBenefit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-3 py-1.5"
                  >
                    <Plus className="size-3.5 mr-1" /> Agregar
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {benefitsList.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{b}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-emerald-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requisitos dinámicos */}
              <div className="space-y-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    4. Requisitos para Postular ({requirementsList.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Promedio ponderado mayor a 16.5"
                    value={newRequirementInput}
                    onChange={(e) => setNewRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-3 py-1.5"
                  >
                    <Plus className="size-3.5 mr-1" /> Agregar
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {requirementsList.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{r}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        className="text-blue-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Postular & Convocatoria Oficial */}
              <div className="space-y-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  5. Configuración de Postulación y Enlaces
                </span>

                {/* Toggle Botón de Postular */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <div>
                    <label
                      htmlFor="enable-apply-btn"
                      className="text-xs font-extrabold text-emerald-950 block cursor-pointer"
                    >
                      ¿Habilitar botón "Postular"?
                    </label>
                    <span className="text-[11px] text-emerald-700 block">
                      Si está desactivado, el botón no se mostrará en el modal ni en la tarjeta.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="enable-apply-btn"
                    checked={enableApplyButton}
                    onChange={(e) => setEnableApplyButton(e.target.checked)}
                    className="size-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  />
                </div>

                {enableApplyButton && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enlace de Postulación (Formulario / Portal)
                    </label>
                    <input
                      type="url"
                      placeholder="https://fuerzaupt.edu.pe/postular o enlace de Google Forms"
                      value={formData.applicationUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicationUrl: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enlace de Convocatoria Oficial / Bases PDF (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://fuerzaupt.edu.pe/docs/bases-beca.pdf"
                    value={formData.officialUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, officialUrl: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-fuerza-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado de Convocatoria
                    </label>
                    <select
                      value={formData.domainStatus}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          domainStatus: e.target.value as OpportunityStatus,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-fuerza-blue"
                    >
                      <option value="OPEN">Abierta / Vigente</option>
                      <option value="COMING_SOON">Próxima a abrir</option>
                      <option value="CLOSING_SOON">Por cerrar</option>
                      <option value="CLOSED">Cerrada</option>
                      <option value="RESULTS_PUBLISHED">Resultados publicados</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado Editorial
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as "DRAFT" | "PUBLISHED",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-fuerza-blue"
                    >
                      <option value="PUBLISHED">Publicado (Visible)</option>
                      <option value="DRAFT">Borrador</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT LIVE PREVIEW (6 COLS) */}
          <div className="lg:col-span-6 flex flex-col overflow-y-auto bg-slate-900/95 p-6 text-white border-l border-slate-800">
            {/* PREVIEW TABS HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("MODAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    previewTab === "MODAL"
                      ? "bg-fuerza-blue text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Modal Detalle Ampliado
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("CARD")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    previewTab === "CARD"
                      ? "bg-fuerza-blue text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tarjeta de Catálogo
                </button>
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Sincronización en vivo
              </span>
            </div>

            {/* LIVE PREVIEW CANVAS */}
            <div className="flex-1 flex items-center justify-center py-6">
              {previewTab === "MODAL" ? (
                /* 1. REPLICA EXACTA DEL MODAL DE DETALLE AMPLIADO */
                <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                  {/* Top Image & Close Button */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-blue-900 text-white font-bold">
                        Beca Fuerza UPT
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-950 leading-snug">
                        {formData.title || "Título de la beca o programa"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {formData.description || "Reconocimiento al rendimiento académico sobresaliente y compromiso institucional."}
                      </p>
                    </div>

                    {/* Beneficios */}
                    {benefitsList.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Beneficios
                        </h4>
                        <ul className="space-y-1.5">
                          {benefitsList.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requisitos */}
                    {requirementsList.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Requisitos
                        </h4>
                        <ul className="space-y-1.5">
                          {requirementsList.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      {formData.officialUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                          <span>Ver convocatoria</span>
                          <ExternalLink className="size-3" />
                        </span>
                      ) : <span />}

                      {enableApplyButton ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition"
                        >
                          <span>Postular</span>
                          <ArrowRight className="size-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          (Botón postular deshabilitado)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. REPLICA DE TARJETA DE CATÁLOGO */
                <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-slate-900 shadow-xl border border-slate-100">
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="" className="size-full object-cover" />
                    ) : null}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200">
                        {formData.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {formData.title || "Título de la beca"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {formData.description || "Descripción del programa..."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {formData.endDate ? `Cierre: ${formData.endDate}` : "Convocatoria abierta"}
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      Ver detalle <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="opportunity-form"
            disabled={isSubmitting}
            className="bg-fuerza-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-6 py-2 shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? "Guardando..." : opportunity ? "Guardar cambios" : "Publicar oportunidad"}
          </Button>
        </div>
      </div>
    </div>
  );
}
