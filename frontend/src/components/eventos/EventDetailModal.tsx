"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  Link as LinkIcon,
  Lock,
  Mic,
  Monitor,
  User,
  Users,
  X,
} from "lucide-react";
import { parseApiDate } from "@/lib/date";
import type { Event, EventStatus } from "@/types";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
}

const statusLabels: Record<EventStatus, string> = {
  UPCOMING: "Próximo",
  REGISTRATION_OPEN: "Inscripciones abiertas",
  FULL: "Cupos agotados",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

const modalityLabels = {
  ONLINE: "Online",
  IN_PERSON: "Presencial",
  HYBRID: "Híbrido",
} as const;

function formatDateShort(dateStr?: string) {
  if (!dateStr) return "Por confirmar";
  const parsed = parseApiDate(dateStr);
  if (!parsed) return "Por confirmar";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  const statusLabel = statusLabels[event.eventStatus] || "Próximo";
  const isFinished = event.eventStatus === "FINISHED";
  const isRegistrationOpen = event.registrationEnabled && event.eventStatus !== "FINISHED";

  const speakerText =
    event.speakerNames && event.speakerNames.length > 0
      ? event.speakerNames.join(", ")
      : "Dr. René Escarcena Q.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all"
      >
        {/* 1. TOP HERO COVER BANNER */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-950 sm:h-72">
          <Image
            src={event.coverImage || "/images/hero-equipo.png"}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle de evento"
            className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>

          {/* Banner content */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <span className="inline-block rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
              {event.category || "FORMACIÓN JURÍDICA"}
            </span>
            <h2
              id="event-modal-title"
              className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl leading-tight drop-shadow-sm"
            >
              {event.title}
            </h2>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>{statusLabel.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE 2-COLUMN SECTION */}
        <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 lg:grid-cols-12">
          {/* Left Column: Sobre la actividad, Dirigido a, Ponente */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 lg:col-span-7">
            {/* Sobre la actividad */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-fuerza-navy">
                <FileText className="size-4 text-fuerza-blue" />
                <span>Sobre la actividad</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed">
                {event.description || event.summary || "Sesión de reforzamiento legal con enfoque práctico para estudiantes interesados en derecho de familia y nuevas tecnologías."}
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Dirigido a */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-fuerza-navy">
                <Users className="size-4 text-fuerza-blue" />
                <span>Dirigido a</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-normal text-slate-600">
                Estudiantes y comunidad universitaria interesada en formación jurídica.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Ponente */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-fuerza-navy">
                <Mic className="size-4 text-fuerza-blue" />
                <span>Ponente</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                {speakerText}
              </p>
            </div>
          </div>

          {/* Right Column: Status Summary Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 lg:col-span-5">
            {/* Mini status cards row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estado */}
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100/80 bg-emerald-50/60 p-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</span>
                  <p className="text-xs font-bold text-slate-900">{statusLabel}</p>
                </div>
              </div>

              {/* Inscripción */}
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100/80 bg-emerald-50/60 p-3">
                <Lock className="size-5 shrink-0 text-emerald-600" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inscripción</span>
                  <p className="text-xs font-bold text-slate-900">
                    {isFinished ? "Cerrada" : isRegistrationOpen ? "Abierta" : "Cerrada"}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Cupos */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Users className="size-4 text-fuerza-blue" />
                <span>Cupos</span>
              </div>
              <span className="font-bold text-slate-900">
                {event.capacity ? `${event.capacity} vacantes` : "Sin límite publicado"}
              </span>
            </div>

            <hr className="border-slate-100" />

            {/* Proyecto relacionado */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <User className="size-4 text-fuerza-blue" />
                <span>Proyecto relacionado</span>
              </div>
              <span className="font-bold text-fuerza-navy">Ruta Fuerza UPT</span>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM 8 SPECIFICATION METRIC CARDS */}
        <div className="grid grid-cols-2 gap-3 px-6 sm:px-8 pb-4 sm:grid-cols-4">
          {/* 1. Fecha de inicio */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <Calendar className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha de inicio</span>
              <p className="text-xs font-bold text-slate-900">{formatDateShort(event.startDate)}</p>
            </div>
          </div>

          {/* 2. Fecha de fin */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <Calendar className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha de fin</span>
              <p className="text-xs font-bold text-slate-900">{formatDateShort(event.endDate || event.startDate)}</p>
            </div>
          </div>

          {/* 3. Hora */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <Clock className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Hora</span>
              <p className="text-xs font-bold text-slate-900">{event.time || "Por confirmar"}</p>
            </div>
          </div>

          {/* 4. Modalidad */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <Monitor className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Modalidad</span>
              <p className="text-xs font-bold text-slate-900">{modalityLabels[event.modality] || "Online"}</p>
            </div>
          </div>

          {/* 5. Lugar o enlace */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <LinkIcon className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Lugar o enlace</span>
              <p className="truncate text-xs font-bold text-slate-900">{event.location || "Enlace por confirmar"}</p>
            </div>
          </div>

          {/* 6. Organizador */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <User className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizador</span>
              <p className="text-xs font-bold text-slate-900">{event.organizer || "Fuerza UPT"}</p>
            </div>
          </div>

          {/* 7. Inscripción */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <ClipboardList className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Inscripción</span>
              <p className="text-xs font-bold text-slate-900">
                {isFinished ? "Cerrada" : isRegistrationOpen ? "Habilitada" : "Cerrada"}
              </p>
            </div>
          </div>

          {/* 8. Estado */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <Flag className="size-5 shrink-0 text-fuerza-blue" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</span>
              <p className="text-xs font-bold text-slate-900">{statusLabel}</p>
            </div>
          </div>
        </div>

        {/* 4. ACTION BUTTONS FOOTER */}
        <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-slate-100 bg-white p-6 sm:flex-row sm:px-8">
          <Link
            href="/proyectos"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuerza-blue px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 sm:w-auto"
          >
            <ExternalLink className="size-4" />
            <span>Ver proyecto</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </article>
    </div>
  );
}
