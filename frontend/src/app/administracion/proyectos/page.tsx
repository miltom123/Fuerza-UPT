'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectAdminService, ProjectAdminResponse } from '@/services/admin/project-admin-service';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, RotateCcw, Search, AlertTriangle, X, Check, Archive, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type TabType = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH';

export default function ProjectsAdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State for permanent deletion confirmation modal
  const [deleteModalProject, setDeleteModalProject] = useState<ProjectAdminResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all projects (including drafts, published and archived)
      const res = await projectAdminService.getProjects(0, 100);
      setProjects(res.content ?? []);
    } catch {
      setError('No se pudo cargar la lista de proyectos. Verifica la conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Move project to Trash (Archive)
  const handleSendToTrash = async (project: ProjectAdminResponse) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await projectAdminService.archiveProject(project.id);
      showNotification(`El proyecto "${project.title}" ha sido enviado a la papelera.`);
      await fetchProjects();
    } catch {
      showNotification('Error al enviar el proyecto a la papelera.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore project from Trash
  const handleRestore = async (project: ProjectAdminResponse) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await projectAdminService.changeStatus(project.id, 'DRAFT', project.version);
      showNotification(`El proyecto "${project.title}" ha sido restaurado como Borrador.`);
      await fetchProjects();
    } catch {
      showNotification('Error al restaurar el proyecto.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Permanently delete project from database
  const handlePermanentDelete = async () => {
    if (!deleteModalProject || isProcessing) return;
    try {
      setIsProcessing(true);
      await projectAdminService.deleteProject(deleteModalProject.id, true);
      showNotification(`El proyecto "${deleteModalProject.title}" fue eliminado permanentemente.`);
      setDeleteModalProject(null);
      await fetchProjects();
    } catch {
      showNotification('Error al eliminar el proyecto de la base de datos.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered projects according to tab & search
  const archivedProjects = projects.filter((p) => p.contentStatus === 'ARCHIVED');
  const activeProjectsList = projects.filter((p) => p.contentStatus !== 'ARCHIVED');
  const publishedProjects = activeProjectsList.filter((p) => p.contentStatus === 'PUBLISHED');
  const draftProjects = activeProjectsList.filter((p) => p.contentStatus === 'DRAFT');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.summary && project.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'TRASH') return project.contentStatus === 'ARCHIVED';
    if (activeTab === 'PUBLISHED') return project.contentStatus === 'PUBLISHED';
    if (activeTab === 'DRAFT') return project.contentStatus === 'DRAFT';
    return project.contentStatus !== 'ARCHIVED'; // 'ALL' tab excludes archived items
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Proyectos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gestiona los programas, actividades y postulaciones de Fuerza UPT.
          </p>
        </div>
        <Button onClick={() => router.push('/administracion/proyectos/nuevo')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            {notification.type === 'success' ? <Check className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
            {notification.message}
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Todos ({activeProjectsList.length})
          </button>

          <button
            onClick={() => setActiveTab('PUBLISHED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Publicados ({publishedProjects.length})
          </button>

          <button
            onClick={() => setActiveTab('DRAFT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'DRAFT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Borradores ({draftProjects.length})
          </button>

          <button
            onClick={() => setActiveTab('TRASH')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'TRASH'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Papelera ({archivedProjects.length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Proyecto</th>
                  <th className="px-4 py-3.5 font-bold">Estado Editorial</th>
                  <th className="px-4 py-3.5 font-bold">Estado Operativo</th>
                  <th className="px-4 py-3.5 font-bold">Periodo</th>
                  <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      {activeTab === 'TRASH' ? (
                        <div className="flex flex-col items-center gap-2">
                          <Trash2 className="h-8 w-8 text-slate-300" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">La papelera está vacía</p>
                          <p className="text-xs text-slate-400">Los proyectos que envíes a la papelera aparecerán aquí.</p>
                        </div>
                      ) : (
                        <p>No se encontraron proyectos en esta vista.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {project.coverImage ? (
                            <div className="relative h-10 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                              <Image src={project.coverImage.url} alt={project.title} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0 text-[11px]">
                              Sin Imagen
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{project.title}</p>
                              {project.featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                  <Sparkles className="h-3 w-3" /> Destacado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{project.summary || 'Sin descripción corta'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            project.contentStatus === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : project.contentStatus === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {project.contentStatus === 'PUBLISHED' ? 'Publicado' : project.contentStatus === 'DRAFT' ? 'Borrador' : 'Papelera'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {project.projectStatus || 'ACTIVE'}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} -{' '}
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Continuo'}
                      </td>

                      {/* Action Buttons Column */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {project.contentStatus === 'ARCHIVED' ? (
                            /* Actions for trashed items */
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                onClick={() => handleRestore(project)}
                                title="Restaurar proyecto"
                                disabled={isProcessing}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Restaurar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                                onClick={() => setDeleteModalProject(project)}
                                title="Eliminar permanentemente"
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Eliminar
                              </Button>
                            </>
                          ) : (
                            /* Actions for active items */
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => router.push(`/administracion/proyectos/${project.id}/editar`)}
                                title="Editar proyecto"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => handleSendToTrash(project)}
                                title="Mover a la papelera"
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Mover a la papelera</span>
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

      {/* Confirmation Modal for Permanent Deletion */}
      {deleteModalProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">¿Eliminar definitivamente?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estás a punto de borrar permanentemente el proyecto <strong>"{deleteModalProject.title}"</strong> y toda su información de la base de datos.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModalProject(null)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handlePermanentDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
