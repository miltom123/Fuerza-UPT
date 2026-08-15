"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Monitor,
  Share2,
  Ticket,
  UserCheck,
  UserRound,
  Users,
  FileText,
  Sparkles
} from "lucide-react";
import type { Event, EventStatus } from "@/types";
import { parseApiDate } from "@/lib/date";
import { VerticalPhotoMarquee } from "@/components/proyectos/VerticalPhotoMarquee";
import styles from "./event-detail.module.css";

interface EventDetailViewProps {
  event: Event;
}

const statusLabels: Record<EventStatus, { label: string; bg: string; color: string }> = {
  UPCOMING: { label: "PRÓXIMO", bg: "#e0f2fe", color: "#0369a1" },
  REGISTRATION_OPEN: { label: "INSCRIPCIONES ABIERTAS", bg: "#dcfce7", color: "#15803d" },
  FULL: { label: "CUPOS AGOTADOS", bg: "#fef3c7", color: "#b45309" },
  IN_PROGRESS: { label: "EN CURSO", bg: "#dcfce7", color: "#15803d" },
  FINISHED: { label: "FINALIZADO", bg: "#f1f5f9", color: "#475569" },
  CANCELLED: { label: "CANCELADO", bg: "#fee2e2", color: "#b91c1c" },
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

export function EventDetailView({ event }: EventDetailViewProps) {
  const statusConfig = statusLabels[event.eventStatus] || { label: "PRÓXIMO", bg: "#e0f2fe", color: "#0369a1" };

  const galleryImages = [
    event.coverImage || "/images/hero-equipo.png",
    "/images/fuerza-upt-equipo.jpg",
    "/images/hero-equipo.png"
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace del evento copiado al portapapeles.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.shell}>
        {/* Top Header Navigation Bar */}
        <header className={styles.topNav}>
          <div className={styles.breadcrumbs}>
            <Link href="/eventos" className={styles.backBtn}>
              <ArrowLeft size={16} /> Volver a eventos
            </Link>
            <span style={{ color: "#cbd5e1" }}>/</span>
            <span className={styles.pageTitleHeading}>{event.title}</span>
          </div>
        </header>

        {/* Main 3-Column Grid Layout */}
        <div className={styles.detailGrid3Col}>
          {/* COLUMN 1: Left White Sidebar Card */}
          <aside className={styles.leftSidebarCard}>
            <div>
              <span
                className={styles.statusPill}
                style={{ background: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label} ✓
              </span>
            </div>

            {/* Cover Frame */}
            <div className={styles.coverFrame}>
              <Image
                src={event.coverImage || "/images/hero-equipo.png"}
                alt={event.title}
                fill
                className={styles.coverImage}
              />
            </div>

            {/* Title & Header */}
            <div className={styles.sidebarHeader}>
              <h1>{event.title}</h1>
              <p className={styles.subtitle}>{event.category} · {modalityLabels[event.modality] || "Presencial"}</p>
              <p style={{ fontSize: "12px", color: "#475569", marginTop: "6px", lineHeight: "1.5" }}>
                {event.summary}
              </p>
            </div>

            {/* 2x2 Metadata Cards */}
            <div className={styles.metaGrid}>
              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Calendar size={13} /> FECHA
                </div>
                <div className={styles.metaCardValue}>{formatDate(event.startDate, event.endDate)}</div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Clock size={13} /> HORA
                </div>
                <div className={styles.metaCardValue}>{event.time || "Por confirmar"}</div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <UserRound size={13} /> ORGANIZADOR
                </div>
                <div className={styles.metaCardValue}>{event.organizer || "Fuerza UPT"}</div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Users size={13} /> CUPOS
                </div>
                <div className={styles.metaCardValue}>{event.capacity ? `${event.capacity} pers.` : "Sin límite"}</div>
              </div>
            </div>

            {/* Registration Action Box */}
            {event.registrationEnabled && (
              <div className={styles.registrationBox}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e40af", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Ticket size={16} /> Inscripciones Abiertas
                </div>
                {event.registrationUrl ? (
                  <Link href={event.registrationUrl} target="_blank" rel="noreferrer" className={styles.registerBtn}>
                    Inscribirme ahora <ExternalLink size={14} />
                  </Link>
                ) : (
                  <p style={{ fontSize: "11px", color: "#1e40af", margin: 0 }}>Inscripción requerida antes del evento.</p>
                )}
              </div>
            )}

            <button
              onClick={handleShare}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <Share2 size={14} /> Compartir evento
            </button>
          </aside>

          {/* COLUMN 2: Center Main Content Flow */}
          <main className={styles.centerContentFlow}>
            {/* CARD 1: ¿De qué trata este evento? */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBadge}>
                  <FileText size={18} />
                </div>
                <h2>¿De qué trata este evento?</h2>
              </div>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#475569", margin: 0 }}>
                {event.description || event.summary || "Detalles del evento por confirmar."}
              </p>
            </section>

            {/* CARD 2: Ubicación y Modalidad */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBadge}>
                  {event.modality === "ONLINE" ? <Monitor size={18} /> : <MapPin size={18} />}
                </div>
                <h2>Lugar y Modalidad</h2>
              </div>
              <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "700" }}>
                Modalidad: <span style={{ color: "#2563eb" }}>{modalityLabels[event.modality] || "Presencial"}</span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {event.location ? `Ubicación: ${event.location}` : "Lugar o enlace por confirmar."}
              </p>
            </section>

            {/* CARD 3: Ponentes y Facilitadores */}
            {event.speakerNames && event.speakerNames.length > 0 && (
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIconBadge} style={{ background: "#f0fdf4", color: "#166534" }}>
                    <UserCheck size={18} />
                  </div>
                  <h2>Ponentes y Facilitadores</h2>
                </div>
                <div className={styles.speakerGrid}>
                  {event.speakerNames.map((speaker, idx) => (
                    <div key={idx} className={styles.speakerCard}>
                      <Sparkles size={14} style={{ color: "#2563eb" }} /> {speaker}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* COLUMN 3: Right Vertical Marquee Gallery */}
          <aside className={styles.rightMarqueeColumn}>
            <VerticalPhotoMarquee images={galleryImages} onImageClick={() => {}} />
          </aside>
        </div>
      </div>
    </div>
  );
}
