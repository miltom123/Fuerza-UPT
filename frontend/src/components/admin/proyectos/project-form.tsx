'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ProjectAdminResponse, 
  ProjectCreateRequest, 
  ProjectUpdateRequest,
  projectAdminService 
} from '@/services/admin/project-admin-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ImagePlus, Plus, Trash2, ArrowLeft, Eye, Sparkles, Layers, BarChart3, Users, FileText, CheckCircle2, Columns, ArrowUp, ArrowDown, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProjectDetailView } from '@/components/proyectos/ProjectDetailView';
import type { Project, ProjectStatus } from '@/types';

const projectFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(180, 'El título es muy largo'),
  subtitle: z.string().max(255).optional(),
  summary: z.string().max(600, 'El resumen no puede exceder 600 caracteres').optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  problem: z.string().min(3, 'Describe la problemática'),
  objective: z.string().min(3, 'Describe el objetivo / impacto principal'),
  collaborativeNote: z.string().optional(),
  beneficiaries: z.string().optional(),
  overallProgress: z.coerce.number().min(0).max(100).default(98),
  startDate: z.date({
    message: "La fecha de inicio es requerida.",
  }),
  endDate: z.date().optional().nullable(),
  isContinuous: z.boolean(),
  projectStatus: z.string().min(1, 'Selecciona un estado operativo'),
  publishNow: z.boolean(),
  featured: z.boolean(),
  responsibles: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(2, 'El nombre es requerido'),
    displayOrder: z.number()
  })),
  partners: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(2, 'El nombre es requerido'),
    displayOrder: z.number()
  })),
  results: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(2, 'El resultado es requerido'),
    displayOrder: z.number()
  })),
  methodology: z.array(z.object({
    stepNumber: z.number(),
    title: z.string().min(2, 'El título de la etapa es requerido'),
    description: z.string().min(5, 'La descripción de la etapa es requerida')
  })),
  statMetrics: z.array(z.object({
    number: z.string().min(1, 'El valor es requerido'),
    label: z.string().min(2, 'La etiqueta es requerida'),
    tag: z.string().optional(),
    icon: z.string().optional()
  }))
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: ProjectAdminResponse;
}

type ViewMode = 'SPLIT' | 'FORM' | 'PREVIEW';

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('SPLIT');
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.coverImage?.url || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.gallery?.map(g => g.url) || []);

  const defaultValues: ProjectFormValues = initialData ? {
    title: initialData.title,
    subtitle: (initialData as any).subtitle || 'Iniciativa institucional Fuerza UPT',
    summary: initialData.summary || '',
    description: (initialData as any).description || initialData.summary || '',
    category: initialData.category || '',
    problem: initialData.problem || '',
    objective: initialData.objective || '',
    collaborativeNote: (initialData as any).collaborativeNote || 'Este proyecto fue posible gracias al compromiso de la comunidad, aliados y voluntarios.',
    beneficiaries: initialData.beneficiaries || '',
    overallProgress: (initialData as any).overallProgress ?? 98,
    startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
    endDate: initialData.endDate ? new Date(initialData.endDate) : null,
    isContinuous: !initialData.endDate,
    projectStatus: initialData.projectStatus || 'ACTIVE',
    featured: initialData.featured || false,
    responsibles: initialData.responsibles || [],
    partners: initialData.partners || [],
    results: initialData.results || [],
    publishNow: initialData.contentStatus === 'PUBLISHED',
    methodology: (initialData as any).methodology || [
      { stepNumber: 1, title: 'Diagnóstico inicial', description: 'Identificamos las principales problemáticas ambientales tierra y comunitarias del entorno.' },
      { stepNumber: 2, title: 'Planificación', description: 'Diseñamos el plan de actividades con aliados estratégicos y definimos metas claras.' },
      { stepNumber: 3, title: 'Ejecución', description: 'Realizamos talleres, campañas y actividades comunitarias con participación activa.' },
      { stepNumber: 4, title: 'Evaluación de impacto', description: 'Medimos resultados y aprendizajes obtenidos para mejorar futuras acciones.' }
    ],
    statMetrics: (initialData as any).statMetrics || [
      { number: '450', label: 'Personas beneficiadas', tag: '+25% vs meta', icon: 'users' },
      { number: '12', label: 'Actividades realizadas', tag: '+20% vs meta', icon: 'leaf' },
      { number: '2.5', label: 'Toneladas de impacto', tag: '+40% vs meta', icon: 'sparkles' },
      { number: '98%', label: 'Meta de impacto', tag: 'Objetivo superado', icon: 'trophy' }
    ]
  } : {
    title: 'Abrigando Corazones',
    subtitle: 'Iniciativa institucional Fuerza UPT',
    summary: 'Campaña para las zonas altoandinas de Tacna',
    description: 'El proyecto busca fomentar la conciencia ambiental y social mediante la recolección de abrigo, talleres educativos y campañas de apoyo comunitario en las zonas altoandinas.',
    category: 'Acción Social',
    problem: 'Necesitamos atender el friaje en comunidades vulnerables de las zonas altoandinas',
    objective: 'Brindar abrigo e impacto positivo directo a familias de zonas altoandinas',
    collaborativeNote: 'Este proyecto fue posible gracias al compromiso de la comunidad, aliados y voluntarios.',
    beneficiaries: '450',
    overallProgress: 98,
    startDate: new Date(),
    endDate: null,
    isContinuous: false,
    projectStatus: 'ACTIVE',
    featured: true,
    responsibles: [{ text: 'Milton', displayOrder: 0 }, { text: 'Miguel', displayOrder: 1 }],
    partners: [{ text: 'FEU', displayOrder: 0 }],
    results: [{ text: 'Responsabilidad', displayOrder: 0 }],
    publishNow: true,
    methodology: [
      { stepNumber: 1, title: 'Diagnóstico inicial', description: 'Identificamos las principales problemáticas ambientales tierra y comunitarias del entorno.' },
      { stepNumber: 2, title: 'Planificación', description: 'Diseñamos el plan de actividades con aliados estratégicos y definimos metas claras.' },
      { stepNumber: 3, title: 'Ejecución', description: 'Realizamos talleres, campañas y actividades comunitarias con participación activa.' },
      { stepNumber: 4, title: 'Evaluación de impacto', description: 'Medimos resultados y aprendizajes obtenidos para mejorar futuras acciones.' }
    ],
    statMetrics: [
      { number: '450', label: 'Personas beneficiadas', tag: '+25% vs meta', icon: 'users' },
      { number: '12', label: 'Actividades realizadas', tag: '+20% vs meta', icon: 'leaf' },
      { number: '2.5', label: 'Toneladas de impacto', tag: '+40% vs meta', icon: 'sparkles' },
      { number: '98%', label: 'Meta de impacto', tag: 'Objetivo superado', icon: 'trophy' }
    ]
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues,
  });

  const watchAllFields = form.watch();

  const { fields: responsiblesFields, append: appendResponsible, remove: removeResponsible } = useFieldArray({
    name: "responsibles",
    control: form.control,
  });

  const { fields: partnersFields, append: appendPartner, remove: removePartner } = useFieldArray({
    name: "partners",
    control: form.control,
  });

  const { fields: resultsFields, append: appendResult, remove: removeResult } = useFieldArray({
    name: "results",
    control: form.control,
  });

  const { fields: methodologyFields, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray({
    name: "methodology",
    control: form.control,
  });

  const { fields: statMetricsFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    name: "statMetrics",
    control: form.control,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverImagePreview(url);
    }
  };

  const handleMultipleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUrls: string[] = [];
      Array.from(files).forEach((file) => {
        newUrls.push(URL.createObjectURL(file));
      });
      setGalleryPreviews(prev => [...prev, ...newUrls]);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      data.responsibles.forEach((r, i) => r.displayOrder = i);
      data.partners.forEach((p, i) => p.displayOrder = i);
      data.results.forEach((r, i) => r.displayOrder = i);

      if (initialData) {
        const updateData: ProjectUpdateRequest = {
          title: data.title,
          summary: data.summary || '',
          category: data.category || '',
          problem: data.problem,
          objective: data.objective,
          beneficiaries: data.beneficiaries || '',
          startDate: data.startDate.toISOString().split('T')[0],
          endDate: data.isContinuous || !data.endDate ? null : data.endDate.toISOString().split('T')[0],
          projectStatus: data.projectStatus,
          contentStatus: data.publishNow ? 'PUBLISHED' : 'DRAFT',
          responsibles: data.responsibles,
          partners: data.partners,
          results: data.results,
          linkedEventIds: [],
          featured: data.featured,
          displayOrder: initialData.displayOrder,
          version: initialData.version
        };
        await projectAdminService.updateProject(initialData.id, updateData, coverImage || undefined);
      } else {
        const createData: ProjectCreateRequest = {
          title: data.title,
          summary: data.summary || '',
          category: data.category || '',
          problem: data.problem,
          objective: data.objective,
          beneficiaries: data.beneficiaries || '',
          startDate: data.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          endDate: data.isContinuous || !data.endDate ? null : data.endDate.toISOString().split('T')[0],
          projectStatus: data.projectStatus,
          responsibles: data.responsibles,
          partners: data.partners,
          results: data.results,
          linkedEventIds: [],
          publishNow: data.publishNow,
          featured: data.featured
        };
        await projectAdminService.createProject(createData, coverImage || undefined);
      }
      
      router.push('/administracion/proyectos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el proyecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Reactive Preview Project Object
  const previewProject: Project = {
    id: initialData?.id || 'preview-id',
    slug: 'preview-slug',
    title: watchAllFields.title || 'Título del Proyecto',
    subtitle: watchAllFields.subtitle || 'Iniciativa institucional Fuerza UPT',
    summary: watchAllFields.summary || 'Resumen corto del proyecto...',
    description: watchAllFields.description || watchAllFields.summary || 'Descripción completa del proyecto...',
    category: watchAllFields.category || 'General',
    coverImage: coverImagePreview || '/images/hero-equipo.png',
    coverAltText: watchAllFields.title,
    problem: watchAllFields.problem || 'Problemática atendida',
    objective: watchAllFields.objective || 'Impacto principal del proyecto',
    collaborativeNote: watchAllFields.collaborativeNote,
    beneficiaries: watchAllFields.beneficiaries || '450',
    overallProgress: watchAllFields.overallProgress,
    startDate: watchAllFields.startDate ? watchAllFields.startDate.toISOString().split('T')[0] : '2026-08-04',
    endDate: watchAllFields.endDate ? watchAllFields.endDate.toISOString().split('T')[0] : undefined,
    projectStatus: (watchAllFields.projectStatus as ProjectStatus) || 'ACTIVE',
    status: watchAllFields.publishNow ? 'PUBLISHED' : 'DRAFT',
    responsibleNames: watchAllFields.responsibles?.map(r => r.text) || ['Milton', 'Miguel'],
    partnerNames: watchAllFields.partners?.map(p => p.text) || ['FEU'],
    results: watchAllFields.results?.map(r => r.text) || ['Responsabilidad'],
    methodology: watchAllFields.methodology || [],
    statMetrics: watchAllFields.statMetrics || [],
    gallery: galleryPreviews.length > 0 ? galleryPreviews : [coverImagePreview || '/images/hero-equipo.png', '/images/fuerza-upt-equipo.jpg'],
    evidences: galleryPreviews.map((url, i) => ({ id: `ev-${i}`, imageUrl: url, caption: `Evidencia ${i + 1}` })),
    eventIds: [],
    featured: watchAllFields.featured || false,
    displayOrder: 0,
    updatedAt: new Date().toISOString()
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (err) => setError("Revisa las pestañas, hay campos incompletos."))} className="space-y-6 pb-12">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => router.push('/administracion/proyectos')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" /> Editor en Vivo
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Construye y visualiza en tiempo real todos los cambios de tu proyecto antes de publicar.
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border">
              <button
                type="button"
                onClick={() => setViewMode('SPLIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  viewMode === 'SPLIT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <Columns className="h-3.5 w-3.5" /> Dividido (Tiempo Real)
              </button>

              <button
                type="button"
                onClick={() => setViewMode('FORM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  viewMode === 'FORM'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Solo Formulario
              </button>

              <button
                type="button"
                onClick={() => setViewMode('PREVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  viewMode === 'PREVIEW'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Solo Vista Previa
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5">
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* Dynamic Multi-Column Workspace according to viewMode */}
        <div className="w-full">
          {viewMode === 'SPLIT' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDE: FORM EDITOR (4 COLS) */}
              <div className="xl:col-span-4 space-y-6">
                <FormTabs form={form} watchAllFields={watchAllFields} coverImagePreview={coverImagePreview} setCoverImagePreview={setCoverImagePreview} handleImageChange={handleImageChange} galleryPreviews={galleryPreviews} setGalleryPreviews={setGalleryPreviews} handleMultipleGalleryImages={handleMultipleGalleryImages} responsiblesFields={responsiblesFields} appendResponsible={appendResponsible} removeResponsible={removeResponsible} partnersFields={partnersFields} appendPartner={appendPartner} removePartner={removePartner} resultsFields={resultsFields} appendResult={appendResult} removeResult={removeResult} methodologyFields={methodologyFields} appendStep={appendStep} removeStep={removeStep} moveStep={moveStep} statMetricsFields={statMetricsFields} appendMetric={appendMetric} removeMetric={removeMetric} />
              </div>

              {/* RIGHT SIDE: SCALED PIXEL-PERFECT DESKTOP CANVAS (8 COLS) */}
              <div className="xl:col-span-8 sticky top-20 z-10">
                <div className="border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        VISTA PREVIA DESKTOP EN TIEMPO REAL
                      </span>
                    </div>

                    {/* Scale Controls */}
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                      <span className="text-[11px] text-slate-400 mr-1">Zoom:</span>
                      <button
                        type="button"
                        onClick={() => setZoomScale(0.45)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.45 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        45%
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomScale(0.58)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.58 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        58%
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomScale(0.70)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.70 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        70%
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomScale(0.85)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.85 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        85%
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[85vh] overflow-y-auto overflow-x-auto bg-slate-100 p-2 flex justify-center">
                    <div 
                      className="origin-top transition-transform duration-200 ease-out"
                      style={{ 
                        width: '1240px', 
                        minWidth: '1240px',
                        transform: `scale(${zoomScale})`, 
                        marginBottom: `-${(1 - zoomScale) * 100}%` 
                      }}
                    >
                      <ProjectDetailView project={previewProject} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'FORM' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <FormTabs form={form} watchAllFields={watchAllFields} coverImagePreview={coverImagePreview} setCoverImagePreview={setCoverImagePreview} handleImageChange={handleImageChange} galleryPreviews={galleryPreviews} setGalleryPreviews={setGalleryPreviews} handleMultipleGalleryImages={handleMultipleGalleryImages} responsiblesFields={responsiblesFields} appendResponsible={appendResponsible} removeResponsible={removeResponsible} partnersFields={partnersFields} appendPartner={appendPartner} removePartner={removePartner} resultsFields={resultsFields} appendResult={appendResult} removeResult={removeResult} methodologyFields={methodologyFields} appendStep={appendStep} removeStep={removeStep} moveStep={moveStep} statMetricsFields={statMetricsFields} appendMetric={appendMetric} removeMetric={removeMetric} />
            </div>
          )}

          {viewMode === 'PREVIEW' && (
            <Card className="border-2 border-blue-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-slate-900 text-white border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" /> Vista Previa Completa del Proyecto
                  </CardTitle>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Guardar y Publicar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-100">
                <ProjectDetailView project={previewProject} />
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </Form>
  );
}

// Reusable Form Tabs Component with Horizontally Scrollable Pills
function FormTabs({
  form,
  coverImagePreview,
  setCoverImagePreview,
  handleImageChange,
  galleryPreviews,
  setGalleryPreviews,
  handleMultipleGalleryImages,
  responsiblesFields,
  appendResponsible,
  removeResponsible,
  partnersFields,
  appendPartner,
  removePartner,
  resultsFields,
  appendResult,
  removeResult,
  methodologyFields,
  appendStep,
  removeStep,
  moveStep,
  statMetricsFields,
  appendMetric,
  removeMetric
}: any) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
        <TabsTrigger value="general" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><FileText className="h-3.5 w-3.5 mr-1.5" /> General</TabsTrigger>
        <TabsTrigger value="content" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Contenido</TabsTrigger>
        <TabsTrigger value="steps" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Layers className="h-3.5 w-3.5 mr-1.5" /> Etapas</TabsTrigger>
        <TabsTrigger value="results" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Métricas</TabsTrigger>
        <TabsTrigger value="team" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Users className="h-3.5 w-3.5 mr-1.5" /> Equipo</TabsTrigger>
        <TabsTrigger value="photos" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><ImagePlus className="h-3.5 w-3.5 mr-1.5" /> Fotos</TabsTrigger>
      </TabsList>

      {/* TAB 1: INFORMACIÓN GENERAL */}
      <TabsContent value="general" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Identificación del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Título del Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Abrigando corazones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Subtítulo / Tipo de Iniciativa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Iniciativa institucional Fuerza UPT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Resumen Corto</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve resumen..." className="resize-none text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Acción Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Estado Operativo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">EN EJECUCIÓN (Verde)</SelectItem>
                        <SelectItem value="FINISHED">FINALIZADO (Verde)</SelectItem>
                        <SelectItem value="UPCOMING">PRÓXIMO (Azul)</SelectItem>
                        <SelectItem value="PAUSED">PAUSADO (Ámbar)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <FormField
                control={form.control}
                name="publishNow"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-3">
                    <FormLabel className="text-xs font-bold cursor-pointer">Publicado</FormLabel>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-3">
                    <FormLabel className="text-xs font-bold cursor-pointer">Destacado</FormLabel>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: CONTENIDO */}
      <TabsContent value="content" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Textos del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">¿De qué trata este proyecto? (Descripción)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="El proyecto busca..." className="min-h-[80px] text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Impacto Principal (Caja Azul ⓘ)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Impacto principal..." className="resize-none text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Problemática Atendida</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Problemática..." className="resize-none text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collaborativeNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Trabajo Colaborativo (Caja Amarilla ⭐)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nota sobre voluntarios y comunidad..." className="resize-none text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 3: ETAPAS */}
      <TabsContent value="steps" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Etapas Metodológicas (Línea de 4 Nodos)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => appendStep({ stepNumber: methodologyFields.length + 1, title: '', description: '' })}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Agregar Etapa
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {methodologyFields.map((field: any, idx: number) => (
              <div key={field.id} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-600">Etapa #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveStep(idx, idx - 1)}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    )}
                    {idx < methodologyFields.length - 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveStep(idx, idx + 1)}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-rose-600" onClick={() => removeStep(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`methodology.${idx}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold">Título de la Etapa</FormLabel>
                      <FormControl>
                        <Input className="text-xs" placeholder="Ej. Diagnóstico inicial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`methodology.${idx}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold">Descripción</FormLabel>
                      <FormControl>
                        <Input className="text-xs" placeholder="Identificamos..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 4: RESULTADOS & MÉTRICAS */}
      <TabsContent value="results" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">4 Tarjetas de Métricas</CardTitle>
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => appendMetric({ number: '100', label: 'Métrica', tag: '+10% vs meta', icon: 'users' })}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Agregar Métrica
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {statMetricsFields.map((field: any, idx: number) => (
              <div key={field.id} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Métrica #{idx + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-rose-600" onClick={() => removeMetric(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name={`statMetrics.${idx}.number`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold">Número / Valor</FormLabel>
                        <FormControl>
                          <Input className="text-xs" placeholder="450 o 98%" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`statMetrics.${idx}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold">Etiqueta</FormLabel>
                        <FormControl>
                          <Input className="text-xs" placeholder="Personas beneficiadas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`statMetrics.${idx}.tag`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold">Tag / Variación</FormLabel>
                        <FormControl>
                          <Input className="text-xs" placeholder="+25% vs meta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`statMetrics.${idx}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold">Icono</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'users'}>
                          <FormControl>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="users">👥 Personas</SelectItem>
                            <SelectItem value="leaf">🌱 Planta</SelectItem>
                            <SelectItem value="sparkles">✨ Destello</SelectItem>
                            <SelectItem value="trophy">🏆 Meta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2">
              <FormField
                control={form.control}
                name="overallProgress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Progreso General del Proyecto (%)</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input type="number" min={0} max={100} className="w-24 text-xs font-bold" {...field} />
                      </FormControl>
                      <span className="font-extrabold text-blue-600 text-sm">{field.value}%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 5: EQUIPO & ALIADOS */}
      <TabsContent value="team" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Equipo, Aliados & Fechas</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold">Responsables</FormLabel>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => appendResponsible({ text: '', displayOrder: 0 })}>
                  <Plus className="mr-1 h-3 w-3" /> Agregar
                </Button>
              </div>
              {responsiblesFields.map((field: any, index: number) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`responsibles.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input className="text-xs" placeholder="Milton, Miguel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => removeResponsible(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold">Aliados</FormLabel>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => appendPartner({ text: '', displayOrder: 0 })}>
                  <Plus className="mr-1 h-3 w-3" /> Agregar
                </Button>
              </div>
              {partnersFields.map((field: any, index: number) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`partners.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input className="text-xs" placeholder="FEU, UNJBG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => removePartner(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="beneficiaries"
              render={({ field }) => (
                <FormItem className="pt-2">
                  <FormLabel className="text-xs font-bold">Número de Beneficiarios</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 6: FOTOGRAFÍAS */}
      <TabsContent value="photos" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Gestor de Fotografías</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <FormLabel className="text-xs font-bold mb-2 block">Imagen de Portada Principal</FormLabel>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors hover:bg-slate-50 relative overflow-hidden",
                  coverImagePreview ? "p-0 border-none aspect-video" : "min-h-[140px]"
                )}
                onClick={() => document.getElementById('split-cover-upload')?.click()}
              >
                {coverImagePreview ? (
                  <Image src={coverImagePreview} alt="Vista previa" fill className="object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Subir Portada</p>
                  </>
                )}
              </div>
              <input id="split-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-xs font-bold">Galería Lateral (Auto-Scroll)</FormLabel>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => document.getElementById('split-gallery-upload')?.click()}>
                  <ImagePlus className="mr-1 h-3 w-3" /> Subir Fotos
                </Button>
              </div>
              <input id="split-gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleMultipleGalleryImages} />

              <div className="grid grid-cols-3 gap-2">
                {galleryPreviews.map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border group bg-slate-900">
                    <Image src={url} alt={`Galeria ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryPreviews((prev: string[]) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
