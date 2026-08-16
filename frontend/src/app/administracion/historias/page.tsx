"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Archive,
  BookOpen,
  Edit,
  Eye,
  HeartHandshake,
  MessageSquareQuote,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryEditorModal } from "@/components/admin/story/story-editor-modal";
import { storyAdminService } from "@/services/admin/story-admin-service";
import type { StoryAdminRequest, StoryAdminResponse } from "@/types/story";

export default function HistoriasAdminPage() {
  const [stories, setStories] = useState<StoryAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryAdminResponse | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await storyAdminService.getStories(0, 100);
      setStories(res.content || []);
    } catch (err: any) {
      console.error(err);
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
      } else {
        await storyAdminService.createStory(req);
      }
      await fetchStories();
    } catch (err: any) {
      alert("Error al guardar la historia: " + (err.message || "Error desconocido"));
      throw err;
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("¿Deseas mover esta historia a la papelera?")) return;
    try {
      await storyAdminService.archiveStory(id);
      await fetchStories();
    } catch (err: any) {
      alert("Error al archivar la historia: " + (err.message || "Error desconocido"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await storyAdminService.changeStatus(id, "PUBLISHED");
      await fetchStories();
    } catch (err: any) {
      alert("Error al restaurar: " + (err.message || "Error desconocido"));
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!confirm("¿Estás completamente seguro de eliminar esta historia permanentemente? Esta acción no se puede deshacer.")) return;
    try {
      await storyAdminService.deleteStory(id, true);
      await fetchStories();
    } catch (err: any) {
      alert("Error al eliminar permanentemente: " + (err.message || "Error desconocido"));
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
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Historias y Testimonios de Estudiantes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra las voces y relatos estudiantiles que se visualizan en el Legado UPT y la página de testimonios.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingStory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-fuerza-blue hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20"
        >
          <Plus className="size-4" />
          Nueva historia
        </Button>
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
          <span className="text-[11px] font-semibold text-slate-400">Registradas</span>
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
                  ? "bg-slate-800 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Borradores ({stories.filter((s) => s.contentStatus === "DRAFT").length})
            </button>
            <button
              onClick={() => setActiveTab("ARCHIVED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === "ARCHIVED"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Trash2 className="size-3" /> Papelera ({archivedCount})
            </button>
          </div>

          {/* Search & Category dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-fuerza-blue"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="Experiencia">Experiencia</option>
              <option value="Liderazgo">Liderazgo</option>
              <option value="Comunidad">Comunidad</option>
              <option value="Intercambio estudiantil">Intercambio estudiantil</option>
              <option value="Beca">Beca</option>
              <option value="Proyecto">Proyecto</option>
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por estudiante o cita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchStories}
              className="rounded-xl size-8 p-0"
              title="Refrescar datos"
            >
              <RefreshCw className="size-3.5 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE / LIST */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-fuerza-blue" />
            <p className="text-xs font-semibold">Cargando historias y testimonios...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <MessageSquareQuote className="size-10 mx-auto opacity-30 text-slate-400" />
            <p className="text-sm font-bold text-slate-600">No se encontraron historias</p>
            <p className="text-xs">
              {activeTab === "ARCHIVED"
                ? "La papelera está vacía."
                : "Crea una nueva historia para comenzar a publicar testimonios."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Estudiante</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Cita Testimonial</th>
                  <th className="px-4 py-3.5 text-center">Hero</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/60 transition">
                    {/* Student Info */}
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
                            <div className="flex size-full items-center justify-center bg-blue-50 text-blue-600">
                              <User className="size-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{story.authorName}</p>
                          <p className="text-[11px] text-slate-500">{story.authorCareer}</p>
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
                              onClick={() => handleRestore(story.id)}
                              className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                              title="Restaurar historia"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePermanent(story.id)}
                              className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
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
                              className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                              title="Editar con vista previa en tiempo real"
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchive(story.id)}
                              className="flex size-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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
    </div>
  );
}
