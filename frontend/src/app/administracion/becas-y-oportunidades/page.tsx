"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  Check,
  Coins,
  Edit,
  Eye,
  ExternalLink,
  GraduationCap,
  Laptop,
  Megaphone,
  Plane,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  opportunityAdminService,
  type OpportunityAdminItem,
  type OpportunityAdminRequest,
} from "@/services/admin/opportunity-admin-service";
import { OpportunityEditorModal } from "@/components/admin/opportunity/opportunity-editor-modal";
import type { OpportunityType } from "@/types/opportunity";

export default function BecasAdminPage() {
  const [items, setItems] = useState<OpportunityAdminItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OpportunityAdminItem | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [deleteModalItem, setDeleteModalItem] = useState<OpportunityAdminItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await opportunityAdminService.getAll();
      setItems(data || []);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Error al cargar las oportunidades.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSave = async (data: OpportunityAdminRequest) => {
    try {
      if (editingItem?.id) {
        await opportunityAdminService.update(editingItem.id, data);
        setNotification({
          type: "success",
          message: "Beca u oportunidad actualizada correctamente con Live Preview.",
        });
      } else {
        await opportunityAdminService.create(data);
        setNotification({
          type: "success",
          message: "Nueva beca u oportunidad creada exitosamente.",
        });
      }
      setIsModalOpen(false);
      await fetchOpportunities();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Error al guardar la oportunidad.",
      });
    }
  };

  const handleArchive = async (item: OpportunityAdminItem) => {
    try {
      setIsProcessing(true);
      await opportunityAdminService.archive(item.id);
      setNotification({
        type: "success",
        message: `"${item.title}" se movió a la papelera.`,
      });
      await fetchOpportunities();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Error al archivar la oportunidad.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (item: OpportunityAdminItem) => {
    try {
      setIsProcessing(true);
      await opportunityAdminService.restore(item.id, item.version || 0);
      setNotification({
        type: "success",
        message: `"${item.title}" fue restaurada correctamente.`,
      });
      await fetchOpportunities();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Error al restaurar la oportunidad.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalItem) return;
    try {
      setIsProcessing(true);
      await opportunityAdminService.deletePermanent(deleteModalItem.id);
      setNotification({
        type: "success",
        message: `"${deleteModalItem.title}" ha sido eliminada definitivamente.`,
      });
      setDeleteModalItem(null);
      await fetchOpportunities();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Error al eliminar definitivamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.status === "PUBLISHED").length;
  const openCount = items.filter((i) => i.opportunityStatus === "OPEN" && i.status === "PUBLISHED").length;
  const archivedCount = items.filter((i) => i.status === "ARCHIVED").length;

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === "PUBLISHED" && item.status !== "PUBLISHED") return false;
      if (activeTab === "DRAFT" && item.status !== "DRAFT") return false;
      if (activeTab === "ARCHIVED" && item.status !== "ARCHIVED") return false;
      if (activeTab === "ALL" && item.status === "ARCHIVED") return false;

      if (typeFilter !== "ALL" && item.opportunityType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesInst = item.institution?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesInst && !matchesDesc) return false;
      }

      return true;
    });
  }, [items, activeTab, typeFilter, searchQuery]);

  const getTypeBadge = (type?: OpportunityType | string) => {
    switch (type) {
      case "SCHOLARSHIP":
        return { label: "Beca académica", style: "bg-purple-50 text-purple-700 border-purple-200" };
      case "EXCHANGE":
        return { label: "Intercambio", style: "bg-blue-50 text-blue-700 border-blue-200" };
      case "INTERNATIONAL_PROGRAM":
        return { label: "Movilidad", style: "bg-teal-50 text-teal-700 border-teal-200" };
      case "CALL":
        return { label: "Convocatoria", style: "bg-orange-50 text-orange-700 border-orange-200" };
      case "VOLUNTEERING":
        return { label: "Apoyo económico", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CONTEST":
        return { label: "Concurso", style: "bg-rose-50 text-rose-700 border-rose-200" };
      case "INTERNSHIP":
        return { label: "Práctica", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "EXTERNAL_COURSE":
        return { label: "Curso externo", style: "bg-sky-50 text-sky-700 border-sky-200" };
      default:
        return { label: "Oportunidad", style: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            {notification.type === "success" ? (
              <Check className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuerza-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              MÓDULO DE BECAS & OPORTUNIDADES
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestión de Becas y Oportunidades
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Edita convocatorias, programas de becas, requisitos, beneficios y configura de forma opcional el botón de postulación con vista previa en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/becas"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Eye className="size-4 text-slate-500" />
            <span>Ver catálogo</span>
          </Link>

          <Button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-fuerza-blue hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 px-5 py-2.5"
          >
            <Plus className="size-4" />
            <span>Nueva beca u oportunidad</span>
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Registros</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] font-semibold text-slate-400">En base de datos</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Publicadas</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Eye className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-700">{publishedCount}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Visibles al público</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Convocatorias Abiertas</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-blue-700">{openCount}</p>
          <span className="text-[11px] font-semibold text-blue-600">Postulación activa</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">En Papelera</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Archive className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-rose-600">{archivedCount}</p>
          <span className="text-[11px] font-semibold text-rose-500">Archivadas</span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "ALL"
                  ? "bg-fuerza-blue text-white shadow-sm shadow-blue-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Todos ({totalCount - archivedCount})
            </button>
            <button
              onClick={() => setActiveTab("PUBLISHED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "PUBLISHED"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Publicados ({publishedCount})
            </button>
            <button
              onClick={() => setActiveTab("DRAFT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "DRAFT"
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Borradores ({items.filter((i) => i.status === "DRAFT").length})
            </button>
            <button
              onClick={() => setActiveTab("ARCHIVED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === "ARCHIVED"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Archive className="size-3" />
              <span>Papelera ({archivedCount})</span>
            </button>
          </div>

          {/* Search & Type filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar beca, institución o palabra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-fuerza-blue focus:bg-white"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-fuerza-blue"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="SCHOLARSHIP">Becas académicas</option>
              <option value="EXCHANGE">Intercambio</option>
              <option value="INTERNATIONAL_PROGRAM">Movilidad</option>
              <option value="CALL">Convocatorias</option>
              <option value="VOLUNTEERING">Apoyo económico</option>
              <option value="CONTEST">Concursos</option>
              <option value="INTERNSHIP">Prácticas</option>
              <option value="EXTERNAL_COURSE">Cursos externos</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE / LIST */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Cargando becas y oportunidades...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <GraduationCap className="size-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              No se encontraron oportunidades en este filtro.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Crea tu primera convocatoria o programa de becas para que los estudiantes de la UPT puedan postular.
            </p>
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="bg-fuerza-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="size-3.5 mr-1" />
              Crear primera oportunidad
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Oportunidad / Beca</th>
                  <th className="px-4 py-3.5">Tipo</th>
                  <th className="px-4 py-3.5">Institución</th>
                  <th className="px-4 py-3.5">Fecha límite</th>
                  <th className="px-4 py-3.5 text-center">Postulación</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const typeBadge = getTypeBadge(item.opportunityType);
                  const hasApplyButton = Boolean(item.applicationUrl && item.applicationUrl.trim().length > 0);

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/60">
                      {/* Title & Cover */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shrink-0">
                            {item.coverImage ? (
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-purple-100 text-purple-700 font-bold">
                                <GraduationCap className="size-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 max-w-xs truncate">
                              {item.title}
                            </span>
                            <span className="block text-[11px] text-slate-500 max-w-xs truncate font-medium">
                              {item.summary || item.description || "Sin descripción"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${typeBadge.style}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-slate-700">
                          {item.institution || "UPT"}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-600 font-medium">
                          {item.deadline || "Vigente"}
                        </span>
                      </td>

                      {/* Apply button status */}
                      <td className="px-4 py-4 text-center">
                        {hasApplyButton ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                            <Check className="size-3" /> Con botón
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            Informativo
                          </span>
                        )}
                      </td>

                      {/* Editorial Status */}
                      <td className="px-4 py-4 text-center">
                        {item.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Publicado
                          </span>
                        ) : item.status === "ARCHIVED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            En papelera
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Borrador
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "ARCHIVED" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(item)}
                                disabled={isProcessing}
                                className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 cursor-pointer"
                                title="Restaurar oportunidad"
                              >
                                <RotateCcw className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModalItem(item)}
                                disabled={isProcessing}
                                className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                                title="Eliminar definitivamente"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsModalOpen(true);
                                }}
                                className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 cursor-pointer"
                                title="Editar con Live Preview"
                              >
                                <Edit className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchive(item)}
                                disabled={isProcessing}
                                className="flex size-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                title="Mover a papelera"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LIVE PREVIEW EDITOR MODAL */}
      <OpportunityEditorModal
        isOpen={isModalOpen}
        opportunity={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* CONFIRMATION MODAL FOR PERMANENT DELETION */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  ¿Eliminar definitivamente?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta acción eliminará el registro de Becas de forma permanente e irreversible.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
              <p className="text-xs font-bold text-slate-800">{deleteModalItem.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {deleteModalItem.institution || "UPT"} — {deleteModalItem.opportunityType}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalItem(null)}
                disabled={isProcessing}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handlePermanentDelete}
                disabled={isProcessing}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isProcessing ? "Eliminando..." : "Sí, eliminar para siempre"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
