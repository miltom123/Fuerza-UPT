"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Check,
  Edit,
  Eye,
  Megaphone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  representationAdminService,
  type RepresentationAdminRequest,
  type RepresentationAdminResponse,
} from "@/services/admin/representation-admin-service";
import { RepresentationEditorModal } from "@/components/admin/representation/representation-editor-modal";
import { SubmissionInbox } from "@/components/admin/submission-inbox";

type TabType = "ALL" | "PUBLISHED" | "DRAFT" | "TRASH";

export default function RepresentationAdminPage() {
  const [items, setItems] = useState<RepresentationAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("ALL");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal State for Editing / Creating with Real-time Live Preview
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RepresentationAdminResponse | null>(null);

  // State for permanent deletion modal
  const [deleteModalItem, setDeleteModalItem] = useState<RepresentationAdminResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await representationAdminService.getItems(0, 100);
      setItems(res.content ?? []);
    } catch {
      setError("No se pudo cargar la lista de ítems de Legado Fuerza UPT.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveItem = async (req: RepresentationAdminRequest) => {
    try {
      if (editingItem) {
        await representationAdminService.updateItem(editingItem.id, req);
        showNotification(`Registro "${req.title}" actualizado con éxito.`);
      } else {
        await representationAdminService.createItem(req);
        showNotification(`Nuevo registro "${req.title}" creado con éxito.`);
      }
      await fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar el registro en el servidor.";
      showNotification(msg, "error");
    }
  };

  const handleSendToTrash = async (item: RepresentationAdminResponse) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await representationAdminService.archiveItem(item.id);
      showNotification(`"${item.title}" enviado a la papelera.`);
      await fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar el registro a la papelera.";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (item: RepresentationAdminResponse) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await representationAdminService.changeStatus(item.id, "DRAFT", item.version);
      showNotification(`"${item.title}" restaurado como Borrador.`);
      await fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al restaurar el registro.";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalItem || isProcessing) return;
    try {
      setIsProcessing(true);
      await representationAdminService.deleteItem(deleteModalItem.id, true);
      showNotification(`"${deleteModalItem.title}" eliminado definitivamente.`);
      setDeleteModalItem(null);
      await fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar el registro de PostgreSQL.";
      showNotification(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const openNewEditor = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const openEditEditor = (item: RepresentationAdminResponse) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  // Filtered lists
  const archivedItems = items.filter((i) => i.contentStatus === "ARCHIVED");
  const activeItemsList = items.filter((i) => i.contentStatus !== "ARCHIVED");
  const publishedItems = activeItemsList.filter((i) => i.contentStatus === "PUBLISHED");
  const draftItems = activeItemsList.filter((i) => i.contentStatus === "DRAFT");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedKind !== "ALL" && item.kind !== selectedKind) return false;

    if (activeTab === "TRASH") return item.contentStatus === "ARCHIVED";
    if (activeTab === "PUBLISHED") return item.contentStatus === "PUBLISHED";
    if (activeTab === "DRAFT") return item.contentStatus === "DRAFT";
    return item.contentStatus !== "ARCHIVED";
  });

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Legado Fuerza UPT
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra las propuestas, logros, acuerdos y gestiones estudiantiles con vista previa en tiempo real.
          </p>
        </div>

        <Button
          onClick={openNewEditor}
          className="bg-fuerza-blue hover:bg-blue-700 text-white font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo registro
        </Button>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm border transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            {notification.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            {notification.message}
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-fuerza-blue text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos ({activeItemsList.length})
          </button>

          <button
            onClick={() => setActiveTab("PUBLISHED")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "PUBLISHED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Publicados ({publishedItems.length})
          </button>

          <button
            onClick={() => setActiveTab("DRAFT")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "DRAFT"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Borradores ({draftItems.length})
          </button>

          <button
            onClick={() => setActiveTab("TRASH")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "TRASH"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Papelera ({archivedItems.length})
          </button>
        </div>

        {/* Filter by Kind + Search Field */}
        <div className="flex items-center gap-2">
          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todas las clases</option>
            <option value="LOGRO">LOGRO</option>
            <option value="PROPUESTA">PROPUESTA</option>
            <option value="GESTION">GESTIÓN</option>
            <option value="ACUERDO">ACUERDO</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin h-8 w-8 border-4 border-fuerza-blue border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Título / Registro</th>
                  <th className="px-4 py-3.5 font-bold">Clase</th>
                  <th className="px-4 py-3.5 font-bold">Avance</th>
                  <th className="px-4 py-3.5 font-bold">Estado Editorial</th>
                  <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      {activeTab === "TRASH" ? (
                        <div className="flex flex-col items-center gap-2">
                          <Trash2 className="h-8 w-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">La papelera está vacía</p>
                        </div>
                      ) : (
                        <p>No se encontraron registros en esta vista.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                            {item.featured && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <Sparkles className="h-3 w-3" /> Destacado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {item.summary || "Sin descripción corta"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-fuerza-blue border border-blue-100">
                          {item.kind || "LOGRO"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{item.progress}</span>
                            <span>{item.progressPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-fuerza-blue"
                              style={{ width: `${item.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            item.contentStatus === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.contentStatus === "DRAFT"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.contentStatus === "PUBLISHED"
                            ? "Publicado"
                            : item.contentStatus === "DRAFT"
                            ? "Borrador"
                            : "Papelera"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.contentStatus === "ARCHIVED" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                onClick={() => handleRestore(item)}
                                disabled={isProcessing}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                                onClick={() => setDeleteModalItem(item)}
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs font-bold text-fuerza-blue hover:bg-blue-50"
                                onClick={() => openEditEditor(item)}
                                title="Editar y ver vista previa en tiempo real"
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Editar / Live Preview
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => handleSendToTrash(item)}
                                disabled={isProcessing}
                                title="Mover a la papelera"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMISSIONS INBOX SECTION FOR STUDENT PROPOSALS */}
      <div className="pt-4 border-t border-slate-200">
        <SubmissionInbox
          type="propuestas"
          title="Propuestas recibidas de estudiantes"
          description="Revisa y clasifica las propuestas y solicitudes enviadas por la comunidad UPT."
        />
      </div>

      {/* REAL-TIME LIVE PREVIEW EDITOR MODAL */}
      <RepresentationEditorModal
        item={editingItem}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveItem}
      />

      {/* CONFIRMATION MODAL FOR PERMANENT DELETION */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">¿Eliminar definitivamente?</h3>
                <p className="text-xs text-slate-500">Esta acción borra el registro de PostgreSQL.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Estás a punto de borrar permanentemente el registro <strong>"{deleteModalItem.title}"</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteModalItem(null)} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handlePermanentDelete}
                disabled={isProcessing}
              >
                {isProcessing ? "Eliminando..." : "Sí, eliminar definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
