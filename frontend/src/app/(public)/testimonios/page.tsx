"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Play, User, X } from "lucide-react";
import { getPublicStories } from "@/services/story-service";
import type { StoryPublicResponse } from "@/types/story";

interface Testimonial {
  id: string;
  name: string;
  career: string;
  category: string;
  date: string;
  quote: string;
  fullStory: string;
  image: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Valeria Sánchez",
    career: "Estudiante de Psicología",
    category: "Experiencia",
    date: "10 de mayo, 2026",
    quote:
      '"Gracias al seguimiento de Fuerza UPT, se logró implementar talleres gratuitos de salud mental. Hoy más estudiantes tienen acceso a apoyo profesional."',
    fullStory:
      "Gracias al seguimiento constante del equipo de Fuerza UPT, nuestra facultad logró implementar talleres gratuitos de salud mental y bienestar emocional. La iniciativa permitió que decenas de estudiantes tuvieran orientación psicológica accesible y acompañamiento profesional continuo en la universidad.",
    image: "/images/valeria-sanchez.png",
  },
  {
    id: "2",
    name: "José Miguel Rojas",
    career: "Estudiante de Ingeniería de Sistemas",
    category: "Intercambio estudiantil",
    date: "8 de mayo, 2026",
    quote:
      '"Mi intercambio en México fue posible gracias a la información y acompañamiento de Fuerza UPT. Una experiencia que cambió mi visión del mundo."',
    fullStory:
      "Mi experiencia de intercambio estudiantil en México fue posible gracias al acompañamiento, la difusión oportuna de convocatorias y la guía en trámites que me brindó Fuerza UPT. Vivir esta experiencia internacional potenció mis habilidades profesionales y transformó mi perspectiva sobre el desarrollo académico.",
    image: "/images/jose-rojas.png",
  },
  {
    id: "3",
    name: "Andrea Flores",
    career: "Estudiante de Arquitectura",
    category: "Experiencia",
    date: "5 de mayo, 2026",
    quote:
      '"Participar en las decisiones de la universidad me hizo sentir que mi voz importa. Fuerza UPT nos representa y trabaja por nosotros."',
    fullStory:
      "Representar los intereses estudiantiles y participar activamente en mesas de diálogo institucionales me enseñó el valor de la voz estudiantil. Fuerza UPT demostró ser un puente real y efectivo para escuchar las necesidades de los alumnos y canalizarlas hacia soluciones concretas.",
    image: "/images/andrea-flores.png",
  },
  {
    id: "4",
    name: "Luis Fernando Díaz",
    career: "Estudiante de Ingeniería Civil",
    category: "Beca",
    date: "3 de mayo, 2026",
    quote:
      '"La orientación sobre becas me permitió postular a una oportunidad que antes no conocía. Hoy puedo seguir creciendo académicamente."',
    fullStory:
      "Recibir información clara y asesoría personalizada sobre becas académicas de Fuerza UPT fue determinante para postular a una beca de apoyo estudiantil. Gracias a esta oportunidad, continúo mi formación universitaria enfocado plenamente en mi rendimiento académico.",
    image: "/images/hero-student.png",
  },
  {
    id: "5",
    name: "María Fernanda Soto",
    career: "Estudiante de Administración",
    category: "Proyecto",
    date: "1 de mayo, 2026",
    quote:
      '"Gracias al impulso de Fuerza UPT, nuestro proyecto estudiantil logró obtener financiamiento y generar un impacto real en la comunidad."',
    fullStory:
      "Con el respaldo y financiamiento gestionado a través de los concursos de proyectos estudiantiles impulsados por Fuerza UPT, pudimos ejecutar nuestro programa de voluntariado y apoyo comunitario, beneficiando directamente a familias de la región Tacna.",
    image: "/images/presidenta.jpg",
  },
  {
    id: "6",
    name: "Carlos Ramírez",
    career: "Estudiante de Derecho",
    category: "Experiencia",
    date: "28 de abril, 2026",
    quote:
      '"Fuerza UPT siempre está escuchando las necesidades reales de los estudiantes y buscando soluciones concretas."',
    fullStory:
      "La transparencia, disposición de escucha y proactividad de la lista estudiantil Fuerza UPT marcan una diferencia clara. Desde la mejora de infraestructura digital hasta el apoyo en eventos académicos, siempre están proponiendo medidas útiles para la comunidad.",
    image: "/images/fuerza-upt-equipo.jpg",
  },
];

export default function TestimoniosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas las categorías");
  const [sortOrder, setSortOrder] = useState<string>("Más recientes");
  const [activeModalItem, setActiveModalItem] = useState<Testimonial | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [backendStories, setBackendStories] = useState<StoryPublicResponse[]>([]);

  useEffect(() => {
    getPublicStories(undefined, 50).then((data) => {
      if (data && data.length > 0) {
        setBackendStories(data);
      }
    });
  }, []);

  const testimonialsData = useMemo(() => {
    if (backendStories.length > 0) {
      return backendStories.map((s) => ({
        id: s.id,
        name: s.authorName,
        career: s.authorCareer,
        category: s.category || "Experiencia",
        date: s.publishedAt ? new Date(s.publishedAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) : "Reciente",
        quote: s.quote,
        fullStory: s.fullStory || s.quote,
        image: s.imageUrl || "/images/valeria-sanchez.png",
      }));
    }
    return DEFAULT_TESTIMONIALS;
  }, [backendStories]);

  // Filter items by category
  const filteredTestimonials = useMemo(() => {
    return testimonialsData.filter((item) => {
      if (selectedCategory === "Todas las categorías") return true;
      return item.category === selectedCategory;
    });
  }, [testimonialsData, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              TESTIMONIOS
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fuerza-navy sm:text-4xl">
              Todas las experiencias que nos inspiran
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-500">
              Conoce las historias y experiencias de estudiantes que han sido parte del cambio en Fuerza UPT.
            </p>
          </div>

          {/* FILTER CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-xs font-semibold text-slate-700 shadow-xs outline-none transition focus:border-blue-400"
              >
                <option value="Todas las categorías">Todas las categorías</option>
                <option value="Experiencia">Experiencia</option>
                <option value="Liderazgo">Liderazgo</option>
                <option value="Comunidad">Comunidad</option>
                <option value="Intercambio estudiantil">Intercambio estudiantil</option>
                <option value="Beca">Beca</option>
                <option value="Proyecto">Proyecto</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Sort Order Select Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-xs font-semibold text-slate-700 shadow-xs outline-none transition focus:border-blue-400"
              >
                <option value="Más recientes">Más recientes</option>
                <option value="Más antiguos">Más antiguos</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* TESTIMONIAL CARDS GRID */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((item) => {
            const isBlue = item.category === "Experiencia";
            const isGreen = item.category === "Intercambio estudiantil";
            const isSky = item.category === "Beca";
            const isPurple = item.category === "Proyecto";

            const badgeStyle = isBlue
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : isGreen
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : isSky
              ? "bg-sky-50 text-sky-700 border-sky-100"
              : "bg-purple-50 text-purple-700 border-purple-100";

            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Author Header */}
                  <div className="mt-5 flex items-center gap-3.5">
                    <div className="relative size-11 overflow-hidden rounded-full border border-slate-100 shadow-xs shrink-0 bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-fuerza-blue transition-colors">
                        {item.name}
                      </h2>
                      <p className="text-xs text-slate-500">{item.career}</p>
                    </div>
                  </div>

                  {/* Quote Body */}
                  <p className="mt-4 text-xs font-normal leading-relaxed text-slate-600 sm:text-sm">
                    {item.quote}
                  </p>
                </div>

                {/* Footer Date & Trigger Link */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <span className="font-medium text-slate-400">{item.date}</span>
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(item)}
                    className="inline-flex items-center gap-1 font-bold text-blue-600 transition hover:text-blue-700 group-hover:translate-x-0.5 cursor-pointer"
                  >
                    <span>Ver más</span>
                    <Play className="size-2.5 fill-blue-600 text-blue-600" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* MODAL DETALLE DE TESTIMONIO */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="relative size-16 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm shrink-0 bg-slate-100">
                  {activeModalItem.image ? (
                    <img
                      src={activeModalItem.image}
                      alt={activeModalItem.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">
                      {activeModalItem.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {activeModalItem.category}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{activeModalItem.name}</h3>
                  <p className="text-xs text-slate-500">{activeModalItem.career}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-blue-50/50 p-4 border border-blue-100/60">
                <p className="text-sm font-medium italic text-slate-700">
                  "{activeModalItem.quote}"
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Historia completa
                </h4>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {activeModalItem.fullStory}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>Publicado el {activeModalItem.date}</span>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white transition hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
