'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  EventAdminResponse, 
  EventCreateRequest, 
  EventUpdateRequest,
  eventAdminService 
} from '@/services/admin/event-admin-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ImagePlus, Plus, Trash2, ArrowLeft, Eye, Sparkles, Layers, Users, FileText, Columns, RefreshCw, MapPin, Ticket, Clock, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { EventDetailView } from '@/components/eventos/EventDetailView';
import type { Event, EventStatus } from '@/types';

const eventFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(180, 'El título es muy largo'),
  summary: z.string().max(600, 'El resumen no puede exceder 600 caracteres').optional(),
  description: z.string().optional(),
  category: z.string().min(2, 'Ingresa una categoría'),
  startDate: z.date({
    message: "La fecha de inicio es requerida.",
  }),
  endDate: z.date().optional().nullable(),
  time: z.string().optional(),
  modality: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
  location: z.string().optional(),
  organizer: z.string().min(2, 'Ingresa el organizador'),
  capacity: z.coerce.number().optional().nullable(),
  eventStatus: z.string().min(1, 'Selecciona un estado operativo'),
  registrationEnabled: z.boolean(),
  registrationUrl: z.string().optional(),
  publishNow: z.boolean(),
  featured: z.boolean(),
  speakerNames: z.array(z.object({
    text: z.string().min(2, 'Nombre del ponente')
  }))
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: EventAdminResponse;
}

type ViewMode = 'SPLIT' | 'FORM' | 'PREVIEW';

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('SPLIT');
  const [zoomScale, setZoomScale] = useState<number>(0.58);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.coverImage || null);

  const defaultValues: EventFormValues = initialData ? {
    title: initialData.title,
    summary: initialData.summary || '',
    description: initialData.description || initialData.summary || '',
    category: initialData.category || 'Taller',
    startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
    endDate: initialData.endDate ? new Date(initialData.endDate) : null,
    time: initialData.time || '16:00 - 18:00 hrs',
    modality: initialData.modality || 'IN_PERSON',
    location: initialData.location || 'Auditorio Principal UPT',
    organizer: initialData.organizer || 'Fuerza UPT',
    capacity: initialData.capacity || 150,
    eventStatus: initialData.eventStatus || 'REGISTRATION_OPEN',
    registrationEnabled: initialData.registrationEnabled ?? true,
    registrationUrl: initialData.registrationUrl || 'https://forms.gle/fuerzaupt',
    publishNow: initialData.contentStatus === 'PUBLISHED',
    featured: initialData.featured || false,
    speakerNames: initialData.speakerNames?.map(name => ({ text: name })) || [{ text: 'Dr. Milton Flores' }]
  } : {
    title: 'Taller de Liderazgo Estudiantil',
    summary: 'Sesión intensiva sobre comunicación efectiva y gestión de equipos universitarios.',
    description: 'En este taller abordaremos las principales herramientas de liderazgo y trabajo colaborativo para fortalecer la representación en nuestra comunidad universitaria.',
    category: 'Capacitación',
    startDate: new Date(),
    endDate: null,
    time: '16:00 - 18:00 hrs',
    modality: 'IN_PERSON',
    location: 'Auditorio Principal UPT',
    organizer: 'Fuerza UPT & FEU',
    capacity: 150,
    eventStatus: 'REGISTRATION_OPEN',
    registrationEnabled: true,
    registrationUrl: 'https://forms.gle/fuerzaupt',
    publishNow: true,
    featured: true,
    speakerNames: [{ text: 'Lic. Milton Flores' }, { text: 'Mg. Miguel Santos' }]
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues,
  });

  const watchAllFields = form.watch();

  const { fields: speakersFields, append: appendSpeaker, remove: removeSpeaker } = useFieldArray({
    name: "speakerNames",
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

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const speakerList = data.speakerNames.map(s => s.text).filter(Boolean);

      if (initialData) {
        const updateData: EventUpdateRequest = {
          title: data.title,
          summary: data.summary || '',
          category: data.category,
          description: data.description || '',
          startDate: data.startDate.toISOString().split('T')[0],
          endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
          time: data.time || '',
          modality: data.modality,
          location: data.location || '',
          organizer: data.organizer,
          speakerNames: speakerList,
          capacity: data.capacity || null,
          eventStatus: data.eventStatus,
          registrationEnabled: data.registrationEnabled,
          registrationUrl: data.registrationUrl || '',
          relatedProjectId: null,
          contentStatus: data.publishNow ? 'PUBLISHED' : 'DRAFT',
          featured: data.featured,
          displayOrder: initialData.displayOrder,
          version: initialData.version
        };
        await eventAdminService.updateEvent(initialData.id, updateData, coverImage || undefined);
      } else {
        const createData: EventCreateRequest = {
          title: data.title,
          summary: data.summary || '',
          category: data.category,
          description: data.description || '',
          startDate: data.startDate.toISOString().split('T')[0],
          endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
          time: data.time || '',
          modality: data.modality,
          location: data.location || '',
          organizer: data.organizer,
          speakerNames: speakerList,
          capacity: data.capacity || null,
          eventStatus: data.eventStatus,
          registrationEnabled: data.registrationEnabled,
          registrationUrl: data.registrationUrl || '',
          relatedProjectId: null,
          publishNow: data.publishNow,
          featured: data.featured
        };
        await eventAdminService.createEvent(createData, coverImage || undefined);
      }
      
      router.push('/administracion/eventos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Reactive Preview Event Object
  const previewEvent: Event = {
    id: initialData?.id || 'preview-event-id',
    slug: 'preview-event-slug',
    title: watchAllFields.title || 'Título del Evento',
    summary: watchAllFields.summary || 'Resumen corto del evento...',
    description: watchAllFields.description || watchAllFields.summary || 'Descripción detallada del evento...',
    category: watchAllFields.category || 'Taller',
    coverImage: coverImagePreview || '/images/hero-equipo.png',
    startDate: watchAllFields.startDate ? watchAllFields.startDate.toISOString().split('T')[0] : '2026-08-15',
    endDate: watchAllFields.endDate ? watchAllFields.endDate.toISOString().split('T')[0] : undefined,
    time: watchAllFields.time || '16:00 hrs',
    modality: watchAllFields.modality || 'IN_PERSON',
    location: watchAllFields.location || 'Auditorio UPT',
    organizer: watchAllFields.organizer || 'Fuerza UPT',
    speakerNames: watchAllFields.speakerNames?.map(s => s.text).filter(Boolean) || ['Ponente Principal'],
    capacity: watchAllFields.capacity || undefined,
    eventStatus: (watchAllFields.eventStatus as EventStatus) || 'REGISTRATION_OPEN',
    registrationEnabled: watchAllFields.registrationEnabled ?? true,
    registrationUrl: watchAllFields.registrationUrl || '',
    status: watchAllFields.publishNow ? 'PUBLISHED' : 'DRAFT',
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
            <Button type="button" variant="outline" size="icon" onClick={() => router.push('/administracion/eventos')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {initialData ? 'Editar Evento' : 'Nuevo Evento'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" /> Editor en Vivo
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Construye y visualiza en tiempo real todos los cambios de tu evento antes de publicar.
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
                <EventFormTabs form={form} coverImagePreview={coverImagePreview} handleImageChange={handleImageChange} speakersFields={speakersFields} appendSpeaker={appendSpeaker} removeSpeaker={removeSpeaker} />
              </div>

              {/* RIGHT SIDE: SCALED PIXEL-PERFECT CANVAS (8 COLS) */}
              <div className="xl:col-span-8 sticky top-20 z-10">
                <div className="border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        VISTA PREVIA DE EVENTO EN TIEMPO REAL
                      </span>
                    </div>

                    {/* Scale Controls */}
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                      <span className="text-[11px] text-slate-400 mr-1">Zoom:</span>
                      <button type="button" onClick={() => setZoomScale(0.45)} className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.45 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>45%</button>
                      <button type="button" onClick={() => setZoomScale(0.58)} className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.58 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>58%</button>
                      <button type="button" onClick={() => setZoomScale(0.70)} className={`px-2 py-0.5 rounded text-[11px] font-bold ${zoomScale === 0.70 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>70%</button>
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
                      <EventDetailView event={previewEvent} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'FORM' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <EventFormTabs form={form} coverImagePreview={coverImagePreview} handleImageChange={handleImageChange} speakersFields={speakersFields} appendSpeaker={appendSpeaker} removeSpeaker={removeSpeaker} />
            </div>
          )}

          {viewMode === 'PREVIEW' && (
            <Card className="border-2 border-blue-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-slate-900 text-white border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" /> Vista Previa Completa del Evento
                  </CardTitle>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Guardar y Publicar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-100">
                <EventDetailView event={previewEvent} />
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </Form>
  );
}

// Reusable Form Tabs Component for Events
function EventFormTabs({
  form,
  coverImagePreview,
  handleImageChange,
  speakersFields,
  appendSpeaker,
  removeSpeaker
}: any) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
        <TabsTrigger value="general" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><FileText className="h-3.5 w-3.5 mr-1.5" /> General</TabsTrigger>
        <TabsTrigger value="details" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Clock className="h-3.5 w-3.5 mr-1.5" /> Detalles & Hora</TabsTrigger>
        <TabsTrigger value="speakers" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Users className="h-3.5 w-3.5 mr-1.5" /> Ponentes</TabsTrigger>
        <TabsTrigger value="registration" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><Ticket className="h-3.5 w-3.5 mr-1.5" /> Inscripción</TabsTrigger>
        <TabsTrigger value="photos" className="text-xs font-bold shrink-0 px-3.5 py-1.5 rounded-lg border-0 shadow-none"><ImagePlus className="h-3.5 w-3.5 mr-1.5" /> Portada</TabsTrigger>
      </TabsList>

      {/* TAB 1: INFORMACIÓN GENERAL */}
      <TabsContent value="general" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Identificación del Evento</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Título del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Taller de Liderazgo Estudiantil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Taller, Conversatorio, Deportivo" {...field} />
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
                    <Textarea placeholder="Breve resumen del evento..." className="resize-none text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Estado Operativo del Evento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="REGISTRATION_OPEN">INSCRIPCIONES ABIERTAS (Verde)</SelectItem>
                      <SelectItem value="UPCOMING">PRÓXIMO (Azul)</SelectItem>
                      <SelectItem value="IN_PROGRESS">EN CURSO (Verde)</SelectItem>
                      <SelectItem value="FULL">CUPOS AGOTADOS (Ámbar)</SelectItem>
                      <SelectItem value="FINISHED">FINALIZADO (Gris)</SelectItem>
                      <SelectItem value="CANCELLED">CANCELADO (Rojo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

      {/* TAB 2: DETALLES & HORA */}
      <TabsContent value="details" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Fecha, Hora y Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Descripción Completa (*¿De qué trata este evento?*)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles de la agenda y contenidos..." className="min-h-[90px] text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold">Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal text-xs", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Hora</FormLabel>
                    <FormControl>
                      <Input className="text-xs" placeholder="Ej. 16:00 - 18:00 hrs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <FormField
                control={form.control}
                name="modality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Modalidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN_PERSON">Presencial</SelectItem>
                        <SelectItem value="ONLINE">Online / Virtual</SelectItem>
                        <SelectItem value="HYBRID">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Lugar o Enlace</FormLabel>
                    <FormControl>
                      <Input className="text-xs" placeholder="Auditorio Principal UPT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 3: PONENTES & ORGANIZADOR */}
      <TabsContent value="speakers" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Organización y Ponentes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Organizador</FormLabel>
                    <FormControl>
                      <Input className="text-xs" placeholder="Ej. Fuerza UPT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Capacidad / Cupos</FormLabel>
                    <FormControl>
                      <Input type="number" className="text-xs" placeholder="Ej. 150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold">Ponentes y Facilitadores</FormLabel>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => appendSpeaker({ text: '' })}>
                  <Plus className="mr-1 h-3 w-3" /> Agregar Ponente
                </Button>
              </div>
              {speakersFields.map((field: any, index: number) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`speakerNames.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input className="text-xs" placeholder="Nombre del ponente o facilitador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => removeSpeaker(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 4: INSCRIPCIÓN */}
      <TabsContent value="registration" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Ajustes de Inscripción</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <FormField
              control={form.control}
              name="registrationEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <FormLabel className="text-xs font-bold cursor-pointer block">Habilitar Formulario de Inscripción</FormLabel>
                    <FormDescription className="text-[11px]">Muestra el botón "Inscribirme" en la web</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Enlace de Inscripción (Google Forms / WhatsApp / Web)</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="https://forms.gle/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 5: FOTOGRAFÍAS */}
      <TabsContent value="photos" className="space-y-4">
        <Card className="rounded-2xl border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">Imagen de Portada del Evento</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors hover:bg-slate-50 relative overflow-hidden",
                coverImagePreview ? "p-0 border-none aspect-video" : "min-h-[160px]"
              )}
              onClick={() => document.getElementById('event-cover-upload')?.click()}
            >
              {coverImagePreview ? (
                <Image src={coverImagePreview} alt="Vista previa" fill className="object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Subir Portada del Evento</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG o WebP (Max 5MB)</p>
                </>
              )}
            </div>
            <input id="event-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
