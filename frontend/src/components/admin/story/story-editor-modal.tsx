"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Check,
  GraduationCap,
  HeartHandshake,
  Image as ImageIcon,
  MessageSquareQuote,
  Play,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoryAdminRequest, StoryAdminResponse } from "@/types/story";

interface StoryEditorModalProps {
  story?: StoryAdminResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: StoryAdminRequest) => Promise<void>;
}

export function StoryEditorModal({
  story,
  isOpen,
  onClose,
  onSave,
}: StoryEditorModalProps) {
  const [formData, setFormData] = useState<StoryAdminRequest>({
    authorName: "",
    authorCareer: "",
    category: "Experiencia",
    quote: "",
    fullStory: "",
    imageUrl: "",
    featuredInHero: false,
    contentStatus: "DRAFT",
    displayOrder: 0,
  });

  const [activeTab, setActiveTab] = useState<"EDIT" | "PREVIEW">("EDIT");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (story) {
      setFormData({
        authorName: story.authorName || "",
        authorCareer: story.authorCareer || "",
        slug: story.slug || "",
        category: story.category || "Experiencia",
        quote: story.quote || "",
        fullStory: story.fullStory || "",
        imageUrl: story.imageUrl || "",
        videoUrl: story.videoUrl || "",
        featuredInHero: story.featuredInHero || false,
        contentStatus: story.contentStatus || "DRAFT",
        displayOrder: story.displayOrder || 0,
      });
    } else {
      setFormData({
        authorName: "",
        authorCareer: "",
        category: "Experiencia",
        quote: "",
        fullStory: "",
        imageUrl: "/images/valeria-sanchez.png",
        featuredInHero: false,
        contentStatus: "DRAFT",
        displayOrder: 0,
      });
    }
  }, [story, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.authorCareer.trim() || !formData.quote.trim()) {
      return;
    }
    try {
      setIsSaving(true);
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-fuerza-blue text-white shadow-md shadow-blue-500/20">
              <MessageSquareQuote className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {story ? "Editar Historia / Testimonio" : "Nueva Historia / Testimonio"}
              </h2>
              <p className="text-xs text-slate-500">
                Edita los datos con sincronización y vista previa visual en tiempo real.
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
              className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar ventana"
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
            className={`flex-1 overflow-y-auto p-6 space-y-5 ${
              activeTab === "PREVIEW" ? "hidden sm:block" : "block"
            } sm:w-1/2 border-r border-slate-100`}
          >
            {/* Author Name & Career */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del estudiante <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Ej. Valeria Sánchez"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Carrera / Rol <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorCareer}
                  onChange={(e) => setFormData({ ...formData, authorCareer: e.target.value })}
                  placeholder="Ej. Estudiante de Psicología"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue"
                >
                  <option value="Experiencia">Experiencia</option>
                  <option value="Liderazgo">Liderazgo</option>
                  <option value="Comunidad">Comunidad</option>
                  <option value="Intercambio estudiantil">Intercambio estudiantil</option>
                  <option value="Beca">Beca</option>
                  <option value="Proyecto">Proyecto</option>
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

            {/* Image URL / Avatar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Foto / Avatar (Ruta o URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/valeria-sanchez.png o URL pública"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-fuerza-blue"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Puedes usar imágenes predeterminadas: /images/valeria-sanchez.png, /images/jose-rojas.png, /images/andrea-flores.png, etc.
              </p>
            </div>

            {/* Quote (Main testimonial text) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cita destacada (Testimonio) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder='"Gracias al seguimiento de Fuerza UPT, se logró..."'
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none focus:border-fuerza-blue focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Full Story (Detailed) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Historia completa y contexto (Opcional)
              </label>
              <textarea
                rows={4}
                value={formData.fullStory}
                onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                placeholder="Describe el contexto, la experiencia detallada y el impacto obtenido..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none focus:border-fuerza-blue"
              />
            </div>

            {/* Featured in Hero toggle */}
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50/60 p-3.5 border border-blue-100">
              <input
                type="checkbox"
                id="featuredHeroCheck"
                checked={formData.featuredInHero}
                onChange={(e) => setFormData({ ...formData, featuredInHero: e.target.checked })}
                className="size-4 rounded-md border-slate-300 text-fuerza-blue accent-fuerza-blue"
              />
              <label htmlFor="featuredHeroCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <Star className="size-3.5 text-amber-500 fill-amber-500" />
                  Destacar en el carrusel flotante del Hero principal
                </span>
                <span className="block font-normal text-[11px] text-slate-500 mt-0.5">
                  Aparecerá en la tarjeta flotante junto a la foto principal de Legado UPT.
                </span>
              </label>
            </div>
          </form>

          {/* RIGHT PANE: REAL-TIME LIVE PREVIEW */}
          <div
            className={`flex-1 overflow-y-auto bg-slate-100/70 p-6 ${
              activeTab === "EDIT" ? "hidden sm:block" : "block"
            } sm:w-1/2 space-y-6`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>VISTA PREVIA EN TIEMPO REAL</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Live Card Sync</span>
            </div>

            {/* 1. VOCES QUE CONSTRUYEN CARD REPLICA */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                1. Tarjeta en "Voces que construyen universidad"
              </span>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md space-y-4">
                {/* Badge */}
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(
                      formData.category || "Experiencia"
                    )}`}
                  >
                    {formData.category || "Experiencia"}
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-100 shrink-0">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt={formData.authorName || "Estudiante"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700">
                        <User className="size-6" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {formData.authorName || "Nombre del estudiante"}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {formData.authorCareer || "Carrera / Rol estudiantil"}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{formData.quote || "Escribe la cita testimonial del estudiante..."}"
                </p>

                {/* Action Link */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-fuerza-blue">
                    <Play className="size-3.5 fill-blue-600 text-blue-600" />
                    Ver detalle completo
                  </span>
                </div>
              </div>
            </div>

            {/* 2. HERO FLOATING CARD REPLICA (IF FEATURED) */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                2. Tarjeta flotante en Hero (Home Legado UPT)
              </span>

              <div
                className={`rounded-3xl p-6 shadow-xl border transition-all ${
                  formData.featuredInHero
                    ? "bg-white border-blue-200/80 ring-2 ring-blue-100"
                    : "bg-slate-50/80 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-fuerza-blue">“</span>
                  {formData.featuredInHero && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Sparkles className="size-3" /> Activo en Hero
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {formData.quote || "Cita destacada en el hero principal..."}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-black text-slate-900">
                      — {formData.authorName || "Nombre del estudiante"}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {formData.authorCareer || "Carrera"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-fuerza-blue" />
                    <span className="size-2 rounded-full bg-slate-200" />
                    <span className="size-2 rounded-full bg-slate-200" />
                  </div>
                </div>
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
            disabled={isSaving || !formData.authorName.trim() || !formData.quote.trim()}
            className="bg-fuerza-blue hover:bg-blue-700 text-white font-bold px-6"
          >
            {isSaving ? "Guardando..." : "Guardar historia"}
          </Button>
        </div>
      </div>
    </div>
  );
}
