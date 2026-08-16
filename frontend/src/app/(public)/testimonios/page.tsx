"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, MessageSquareQuote, Play, Plus, User, X } from "lucide-react";
import { getPublicStories } from "@/services/story-service";
import type { StoryPublicResponse } from "@/types/story";
import { FadeIn, Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { motion, AnimatePresence } from "motion/react";

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

export default function TestimoniosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas las categorías");
  const [sortOrder, setSortOrder] = useState<string>("Más recientes");
  const [activeModalItem, setActiveModalItem] = useState<Testimonial | null>(null);
  const [backendStories, setBackendStories] = useState<StoryPublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    getPublicStories(undefined, 100)
      .then((data) => {
        setBackendStories(data || []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const testimonialsData = useMemo(() => {
    return backendStories.map((s) => ({
      id: s.id,
      name: s.authorName,
      career: s.authorCareer,
      category: s.category || "Experiencia",
      date: s.publishedAt
        ? new Date(s.publishedAt).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Reciente",
      quote: s.quote,
      fullStory: s.fullStory || s.quote,
      image: s.imageUrl || "/images/valeria-sanchez.png",
    }));
  }, [backendStories]);

  // Filter items by category
  const filteredTestimonials = useMemo(() => {
    const list = testimonialsData.filter((item) => {
      if (
        selectedCategory === "Todas las categorías" ||
        selectedCategory === "Todas las categorias" ||
        selectedCategory === "ALL"
      ) {
        return true;
      }
      return (
        item.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    });

    if (sortOrder === "Más antiguos") {
      return [...list].reverse();
    }
    return list;
  }, [testimonialsData, selectedCategory, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <FadeIn delay={0.05} direction="up" distance={12}>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                TESTIMONIOS & VOCES
              </span>
            </FadeIn>
            <FadeIn delay={0.12} direction="up" distance={16}>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fuerza-navy sm:text-4xl">
                Todas las experiencias que nos inspiran
              </h1>
            </FadeIn>
            <FadeIn delay={0.2} direction="up" distance={16}>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-500">
                Conoce las historias y experiencias de estudiantes que han sido parte del cambio en Fuerza UPT.
              </p>
            </FadeIn>
          </div>

          {/* FILTER CONTROLS */}
          <FadeIn delay={0.25} direction="up" distance={12} className="flex flex-wrap items-center gap-3">
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
          </FadeIn>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 animate-spin rounded-full border-3 border-fuerza-blue border-t-transparent" />
            <p className="mt-4 text-xs font-bold text-slate-500">Cargando testimonios de la comunidad...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          /* EMPTY STATE */
          <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-fuerza-blue">
              <MessageSquareQuote className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">
              No hay testimonios disponibles en esta categoría
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              {selectedCategory !== "Todas las categorías"
                ? `Actualmente no hay testimonios publicados en la categoría "${selectedCategory}".`
                : "Aún no se han publicado testimonios en la plataforma."}
            </p>
            {selectedCategory !== "Todas las categorías" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("Todas las categorías")}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-fuerza-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Ver todos los testimonios
              </button>
            )}
          </div>
        ) : (
          /* TESTIMONIAL CARDS GRID */
          <StaggerContainer className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
            {filteredTestimonials.map((item) => {
              const cat = item.category?.toLowerCase() || "";
              const isBlue = cat.includes("experiencia");
              const isGreen = cat.includes("intercambio") || cat.includes("comunidad");
              const isSky = cat.includes("beca");
              const isPurple = cat.includes("liderazgo") || cat.includes("proyecto");

              const badgeStyle = isBlue
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : isGreen
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : isSky
                ? "bg-sky-50 text-sky-700 border-sky-100"
                : "bg-purple-50 text-purple-700 border-purple-100";

              return (
                <StaggerItem key={item.id}>
                  <article
                    className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
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
                        <div className="relative size-11 overflow-hidden rounded-full border border-slate-100 shadow-xs shrink-0 bg-slate-100 transition-transform duration-200 group-hover:scale-105">
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
                        "{item.quote}"
                      </p>
                    </div>

                    {/* Footer Date & Trigger Link */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                      <span className="font-medium text-slate-400">{item.date}</span>
                      <button
                        type="button"
                        onClick={() => setActiveModalItem(item)}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 transition hover:text-blue-700 group-hover:translate-x-1 cursor-pointer"
                      >
                        <span>Ver más</span>
                        <Play className="size-2.5 fill-blue-600 text-blue-600" />
                      </button>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

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
