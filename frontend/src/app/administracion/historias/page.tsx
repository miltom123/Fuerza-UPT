"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  Edit,
  Eye,
  HeartHandshake,
  Megaphone,
  MessageSquareQuote,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryEditorModal } from "@/components/admin/story/story-editor-modal";
import { storyAdminService } from "@/services/admin/story-admin-service";
import type { StoryAdminRequest, StoryAdminResponse } from "@/types/story";

export default function HistoriasAdminPage() {
  const [stories, setStories] = useState<StoryAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryAdminResponse | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<StoryAdminResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await storyAdminService.getStories(0, 100);
      setStories(res.content || []);
    } catch {
      setError("No se pudieron cargar las historias y testimonios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      // Tab filter
      if (activeTab !== "ALL" && s.contentStatus !== activeTab) {
        return false;
      }
      if (activeTab === "ALL" && s.contentStatus === "ARCHIVED") {
        return false; // don't show trash in 'ALL' by default
      }

      // Category filter
      if (categoryFilter !== "ALL" && s.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.authorName?.toLowerCase().includes(q);
        const matchCareer = s.authorCareer?.toLowerCase().includes(q);
        const matchQuote = s.quote?.toLowerCase().includes(q);
        if (!matchName && !matchCareer && !matchQuote) return false;
      }

      return true;
    });
  }, [stories, activeTab, categoryFilter, searchQuery]);

  // Stats calculation
  const totalCount = stories.filter((s) => s.contentStatus !== "ARCHIVED").length;
  const publishedCount = stories.filter((s) => s.contentStatus === "PUBLISHED").length;
  const heroCount = stories.filter((s) => s.featuredInHero && s.contentStatus === "PUBLISHED").length;
  const archivedCount = stories.filter((s) => s.contentStatus === "ARCHIVED").length;

  const handleSave = async (req: StoryAdminRequest) => {
    try {
      if (editingStory) {
        await storyAdminService.updateStory(editingStory.id, req);
        showNotification(`Historia de "${req.authorName}" actualizada correctamente.`);
      } else {
        await storyAdminService.createStory(req);
        showNotification(`Nueva historia de "${req.authorName}" creada exitosamente.`);
      }
      await fetchStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar la historia";
      showNotification(msg, "error");
      throw err;
    }
  };

  const handleArchive = async (item: StoryAdminResponse) => {
    try {
      setIsProcessing(true);
      await storyAdminService.archiveStory(item.id);
      showNotification(`"${item.authorName}" movido a la papelera.`);
      await fetchStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al archivar la historia";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (item: StoryAdminResponse) => {
    try {
      setIsProcessing(true);
      await storyAdminService.changeStatus(item.id, "DRAFT");
      showNotification(`"${item.authorName}" restaurado como Borrador.`);
      await fetchStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al restaurar la historia";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalItem || isProcessing) return;
    try {
      setIsProcessing(true);
      await storyAdminService.deleteStory(deleteModalItem.id, true);
      showNotification(`"${deleteModalItem.authorName}" eliminado definitivamente.`);
      setDeleteModalItem(null);
      await fetchStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar de PostgreSQL";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getBadgeStyle = (cat: string) => {
    switch (cat) {
      case "Experiencia":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Liderazgo":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "Comunidad":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "Intercambio estudiantil":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Beca":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Proyecto":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* NOTIFICATION TOAST */}
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
              MÓDULO VOCES Y HERO
            </span>
            <Link
              href="/administracion/representacion-estudiantil"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-fuerza-blue transition"
            >
              <Megaphone className="size-3.5" />
              <span>Ir a Gestiones y Logros</span>
            </Link>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Historias y Testimonios de Estudiantes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Administra las historias, frases y testimonios que se visualizan en el carrusel rotativo del Hero y en la sección *"Voces que construyen universidad"*.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/representacion-estudiantil"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Eye className="size-4 text-slate-500" />
            <span>Ver landing</span>
          </Link>

          <Button
            onClick={() => {
              setEditingStory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-fuerza-blue hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 px-5 py-2.5"
          >
            <Plus className="size-4" />
            <span>Nueva historia</span>
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Historias</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageSquareQuote className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] font-semibold text-slate-400">Registradas en BD</span>
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
            <span className="text-xs font-bold text-slate-500">En Hero Principal</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-amber-700">{heroCount}</p>
          <span className="text-[11px] font-semibold text-amber-600">Carrusel superior</span>
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
              Todos ({totalCount})
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
              Borradores ({stories.filter((s) => s.contentStatus === "DRAFT").length})
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

          {/* Search & Category filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por estudiante, carrera o frase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-fuerza-blue focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-fuerza-blue"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="Experiencia">Experiencia</option>
              <option value="Liderazgo">Liderazgo</option>
              <option value="Comunidad">Comunidad</option>
              <option value="Intercambio estudiantil">Intercambio</option>
              <option value="Beca">Beca</option>
              <option value="Proyecto">Proyecto</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE / LIST OF STORIES */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Cargando historias y testimonios...
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-fuerza-blue">
              <MessageSquareQuote className="size-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              No se encontraron testimonios en este filtro.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Crea tu primera historia estudiantil con foto, carrera y cita para verla en la landing de Legado Fuerza UPT.
            </p>
            <Button
              onClick={() => {
                setEditingStory(null);
                setIsModalOpen(true);
              }}
              className="bg-fuerza-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="size-3.5 mr-1" />
              Crear primera historia
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Estudiante</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Cita / Testimonio</th>
                  <th className="px-4 py-3.5 text-center">Hero</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="transition hover:bg-slate-50/60">
                    {/* Author */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                          {story.imageUrl ? (
                            <img
                              src={story.imageUrl}
                              alt={story.authorName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 font-bold">
                              {story.authorName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">
                            {story.authorName}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-medium">
                            {story.authorCareer}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getBadgeStyle(
                          story.category
                        )}`}
                      >
                        {story.category}
                      </span>
                    </td>

                    {/* Quote */}
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-slate-600 line-clamp-2 italic">
                        "{story.quote}"
                      </p>
                    </td>

                    {/* Hero toggle */}
                    <td className="px-4 py-4 text-center">
                      {story.featuredInHero ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">
                          <Star className="size-3 fill-amber-500 text-amber-500" /> Hero
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      {story.contentStatus === "PUBLISHED" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Publicado
                        </span>
                      ) : story.contentStatus === "ARCHIVED" ? (
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
                        {story.contentStatus === "ARCHIVED" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(story)}
                              disabled={isProcessing}
                              className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 cursor-pointer"
                              title="Restaurar historia"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModalItem(story)}
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
                                setEditingStory(story);
                                setIsModalOpen(true);
                              }}
                              className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 cursor-pointer"
                              title="Editar con vista previa en tiempo real"
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchive(story)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STORY LIVE PREVIEW MODAL */}
      <StoryEditorModal
        isOpen={isModalOpen}
        story={editingStory}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PERMANENTE */}
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
                  Esta acción eliminará el registro de PostgreSQL de forma irreversible.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
              <p className="text-xs font-bold text-slate-800">{deleteModalItem.authorName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 italic">
                "{deleteModalItem.quote}"
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
