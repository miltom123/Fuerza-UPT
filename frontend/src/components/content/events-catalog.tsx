"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Monitor, UserRound, X } from "lucide-react";
import { parseApiDate } from "@/lib/date";
import type { Event, EventStatus } from "@/types";
import { EventDetailModal } from "@/components/eventos/EventDetailModal";
import styles from "./content-catalog.module.css";

interface EventsCatalogProps { events: Event[]; }

const statusLabels: Record<EventStatus, string> = {
  UPCOMING: "Próximo",
  REGISTRATION_OPEN: "Inscripciones abiertas",
  FULL: "Cupos agotados",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

const modalityLabels = { ONLINE: "Online", IN_PERSON: "Presencial", HYBRID: "Híbrido" } as const;

function formatDate(startDate: string, endDate?: string) {
  const formatter = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  const parsedStart = parseApiDate(startDate);
  const parsedEnd = endDate ? parseApiDate(endDate) : null;
  if (!parsedStart) return "Fecha por confirmar";
  const start = formatter.format(parsedStart);
  return parsedEnd ? `${start} - ${formatter.format(parsedEnd)}` : start;
}

import {
  FadeIn,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

export function EventsCatalog({ events }: EventsCatalogProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedEvent) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedEvent(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [selectedEvent]);

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <FadeIn delay={0.05} direction="up" distance={12}>
            <p className={styles.eyebrow}>Agenda Fuerza UPT</p>
          </FadeIn>
          <FadeIn delay={0.12} direction="up" distance={16}>
            <h1>Eventos y actividades</h1>
          </FadeIn>
          <FadeIn delay={0.2} direction="up" distance={16}>
            <p>Talleres, conversatorios, encuentros deportivos y sesiones con fecha definida.</p>
          </FadeIn>
        </header>

        <FadeIn delay={0.25} direction="up" distance={10}>
          <div className={styles.summaryBar}>
            <span><strong>{events.length}</strong> eventos publicados</span>
            <span><strong>{events.filter((event) => event.registrationEnabled).length}</strong> con inscripción activa</span>
          </div>
        </FadeIn>

        <StaggerContainer className={styles.grid} staggerDelay={0.07}>
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <article className={`${styles.card} group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                <div className={`${styles.cover} overflow-hidden`}>
                  <Image
                    src={event.coverImage ?? "/images/hero-equipo.png"}
                    alt=""
                    fill
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                  <div className={styles.coverLabel}>
                    <span className={styles.categoryBadge}>{event.category}</span>
                    <span className={styles.statusBadge}>{statusLabels[event.eventStatus]}</span>
                  </div>
                </div>
                <div className={styles.body}>
                  <h2>{event.title}</h2>
                  <p>{event.summary}</p>
                  <div className={styles.meta}>
                    <span><CalendarDays aria-hidden="true" />{formatDate(event.startDate, event.endDate)}</span>
                    <span>{event.modality === "ONLINE" ? <Monitor aria-hidden="true" /> : <MapPin aria-hidden="true" />}{modalityLabels[event.modality]}{event.location ? ` · ${event.location}` : ""}</span>
                    <span><UserRound aria-hidden="true" />{event.organizer}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.primary} group/btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      Ver detalles
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true" />
                    </button>
                    {event.registrationEnabled && event.registrationUrl ? (
                      <Link className={`${styles.secondary} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`} href={event.registrationUrl} target="_blank" rel="noreferrer">
                        Inscribirme
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}
