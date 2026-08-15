"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  Flame,
  Handshake,
  Image as ImageIcon,
  Info,
  Leaf,
  Maximize2,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { Event, Project, ProjectStatus } from "@/types";
import { ProjectCarousel } from "./ProjectCarousel";
import { ProjectLightbox } from "./ProjectLightbox";
import { VerticalPhotoMarquee } from "./VerticalPhotoMarquee";
import styles from "./project-detail.module.css";

interface ProjectDetailViewProps {
  project: Project;
  events?: Event[];
}

const statusLabels: Record<ProjectStatus, { label: string; styleClass: string }> = {
  UPCOMING: { label: "PRÓXIMO", styleClass: styles.upcoming },
  ACTIVE: { label: "EN EJECUCIÓN", styleClass: styles.active },
  PAUSED: { label: "PAUSADO", styleClass: styles.paused },
  FINISHED: { label: "FINALIZADO", styleClass: styles.finished },
};

const defaultMethodologySteps = [
  {
    stepNumber: 1,
    title: "Diagnóstico inicial",
    description: "Identificamos las principales problemáticas ambientales tierra y comunitarias del entorno.",
  },
  {
    stepNumber: 2,
    title: "Planificación",
    description: "Diseñamos el plan de actividades con aliados estratégicos y definimos metas claras.",
  },
  {
    stepNumber: 3,
    title: "Ejecución",
    description: "Realizamos talleres, campañas y actividades comunitarias con participación activa.",
  },
  {
    stepNumber: 4,
    title: "Evaluación de impacto",
    description: "Medimos resultados y aprendizajes obtenidos para mejorar futuras acciones.",
  },
];

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Gallery images calculation
  const galleryImages =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : project.coverImage
      ? [project.coverImage, "/images/hero-equipo.png", "/images/fuerza-upt-equipo.jpg"]
      : ["/images/hero-equipo.png", "/images/fuerza-upt-equipo.jpg"];

  // Evidence list (combines evidences array or gallery images)
  const evidenceList =
    project.evidences && project.evidences.length > 0
      ? project.evidences.map((e) => e.imageUrl)
      : galleryImages;

  const statusConfig = statusLabels[project.projectStatus] ?? {
    label: "FINALIZADO",
    styleClass: styles.finished,
  };

  const resultsList =
    project.results && project.results.length > 0
      ? project.results
      : ["Responsabilidad"];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.summary ?? project.title,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace del proyecto copiado al portapapeles.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.shell}>
        {/* Top Header Navigation Bar */}
        <header className={styles.topNav}>
          <div className={styles.breadcrumbs}>
            <Link href="/proyectos" className={styles.backBtn}>
              <ArrowLeft size={16} /> Volver a proyectos
            </Link>
            <span style={{ color: "#cbd5e1" }}>/</span>
            <span className={styles.pageTitleHeading}>{project.title}</span>
          </div>
          <Link href="/proyectos" className={styles.closeBtn} title="Cerrar detalle">
            <X size={18} />
          </Link>
        </header>

        {/* Main 3-Column Grid Layout */}
        <div className={styles.detailGrid3Col}>
          {/* COLUMN 1: Left White Sidebar Card */}
          <aside className={styles.leftSidebarCard}>
            <div className={styles.statusRow}>
              <span className={`${styles.statusPill} ${statusConfig.styleClass}`}>
                {statusConfig.label} ✓
              </span>
            </div>

            {/* Main Interactive Carousel */}
            <ProjectCarousel
              images={galleryImages}
              title={project.title}
              onExpand={(idx) => setLightboxIndex(idx)}
            />

            {/* Title & Intro */}
            <div className={styles.sidebarHeader}>
              <h1>{project.title}</h1>
              <p className={styles.subtitle}>{project.subtitle ?? "Iniciativa institucional Fuerza UPT"}</p>
              <p className={styles.descriptionText}>{project.summary || project.description}</p>
            </div>

            {/* 2x2 Metadata Cards */}
            <div className={styles.metaGrid}>
              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Calendar size={13} /> PERIODO
                </div>
                <div className={styles.metaCardValue}>{project.startDate ?? "2026-08-04"}</div>
                <div className={styles.metaCardSub}>{project.endDate ?? "Sin cierre definido"}</div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Users size={13} /> RESPONSABLES
                </div>
                <div className={styles.metaCardValue}>
                  {project.responsibleNames?.length ? project.responsibleNames.join(", ") : "Milton, miguel"}
                </div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <Handshake size={13} /> ALIADOS
                </div>
                <div className={styles.metaCardValue}>
                  {project.partnerNames?.length ? project.partnerNames.join(", ") : "FEU"}
                </div>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaCardHeader}>
                  <UserCheck size={13} /> BENEFICIARIOS
                </div>
                <div className={styles.metaCardValue}>{project.beneficiaries ?? "450"}</div>
              </div>
            </div>

            {/* Key Results Sidebar Section */}
            <div className={styles.resultsSection}>
              <h3>RESULTADO CLAVE</h3>
              <ul className={styles.resultsList}>
                {resultsList.map((res, idx) => (
                  <li key={`${res}-${idx}`} className={styles.resultItem}>
                    <CheckCircle2 size={15} /> {res}
                  </li>
                ))}
              </ul>
            </div>

            {/* Share & Bookmark Action Buttons */}
            <div className={styles.sidebarActions}>
              <button className={styles.actionBtn} onClick={handleShare}>
                <Share2 size={14} /> Compartir proyecto
              </button>
              <button className={styles.actionBtn}>
                <Bookmark size={14} /> Guardar
              </button>
            </div>

            {/* Bottom Evidencias Card */}
            <div className={styles.sidebarEvidencesCard}>
              <div className={styles.evidencesCardHeader}>
                <h3>
                  <ImageIcon size={14} style={{ color: "#2563eb" }} /> Evidencias del proyecto
                </h3>
                <span className={styles.counterBadge} style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                  {evidenceList.length} foto(s)
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                Fotografías y registro visual de las actividades ejecutadas en este proyecto. Haz clic en cualquier imagen para abrir la galería.
              </p>
              <div className={styles.evidencesThumbGrid}>
                {evidenceList.slice(0, 3).map((img, idx) => (
                  <div
                    key={`ev-thumb-${idx}`}
                    className={styles.evidenceMiniThumb}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <Image src={img} alt={`Evidencia ${idx + 1}`} fill sizes="60px" style={{ objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* COLUMN 2: Center Main Content Flow */}
          <main className={styles.centerContentFlow}>
            {/* CARD 1: ¿DE QUÉ TRATA ESTE PROYECTO? */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBadge}>
                  <FileText size={18} />
                </div>
                <h2>¿De qué trata este proyecto?</h2>
              </div>
              <p className={styles.sectionSubtext}>
                {project.description ||
                  "El proyecto busca fomentar la conciencia ambiental mediante la educación, el trabajo comunitario y campañas de sensibilización, promoviendo a su vez prácticas responsables con el entorno."}
              </p>

              <div className={styles.impactBox}>
                <div className={styles.impactBoxHeader}>
                  <Info size={16} /> Impacto principal
                </div>
                <p>
                  {project.objective ||
                    "un gato en la computadora se ve bacano"}
                </p>
              </div>

              <div className={styles.problemSubCard}>
                <h3>Problemática atendida</h3>
                <p className={styles.sectionSubtext}>
                  {project.problem || "necesitamos resolver la problematica ambiental"}
                </p>
              </div>
            </section>

            {/* CARD 2: ¿CÓMO SE TRABAJÓ EL PROYECTO? (4-NODE STEPPER) */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBadge}>
                  <Compass size={18} />
                </div>
                <h2>¿Cómo se trabajó el proyecto?</h2>
              </div>
              <p className={styles.sectionSubtext}>
                Desarrollamos el proyecto en 4 etapas fundamentales que permitieron alcanzar los objetivos propuestos.
              </p>

              {/* Horizontal 4-Node Stepper */}
              <div className={styles.stepperContainer}>
                <div className={styles.stepperNodesLine}>
                  <div className={styles.stepperTrack} />
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`${styles.stepperNode} ${stepNum === 1 ? styles.activeNode : ""}`}
                    >
                      {stepNum}
                    </div>
                  ))}
                </div>

                <div className={styles.stepperGrid}>
                  {(project.methodology && project.methodology.length > 0 ? project.methodology : defaultMethodologySteps).map((step, idx) => (
                    <div key={step.stepNumber || idx} className={styles.stepBlockCard}>
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.collabBox}>
                <Star size={16} className={styles.collabIcon} />
                <div>
                  <h4>Trabajo colaborativo</h4>
                  <p>{project.collaborativeNote || "Este proyecto fue posible gracias al compromiso de la comunidad, aliados y voluntarios."}</p>
                </div>
              </div>
            </section>

            {/* CARD 3: RESULTADOS E IMPACTO ALCANZADO */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBadge} style={{ background: "#f0fdf4", color: "#166534" }}>
                  <Flame size={18} />
                </div>
                <h2>Resultados e impacto alcanzado</h2>
              </div>
              <p className={styles.sectionSubtext}>
                Indicadores y metas cumplidas durante la ejecución de la iniciativa:
              </p>

              {/* Stat Metric Cards */}
              <div className={styles.statMetricsGrid}>
                {project.statMetrics && project.statMetrics.length > 0 ? (
                  project.statMetrics.map((metric, idx) => (
                    <div key={metric.id || idx} className={styles.statMetricCard}>
                      <div className={styles.statMetricTop}>
                        <div className={styles.statIconBadge}>
                          {metric.icon === "leaf" ? <Leaf size={16} /> :
                           metric.icon === "sparkles" ? <Sparkles size={16} /> :
                           metric.icon === "trophy" ? <Trophy size={16} /> :
                           <Users size={16} />}
                        </div>
                        <div>
                          <div className={styles.statNumber}>{metric.number}</div>
                          <div className={styles.statLabel}>{metric.label}</div>
                        </div>
                      </div>
                      {metric.tag && <span className={styles.statTag}>{metric.tag}</span>}
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.statMetricCard}>
                      <div className={styles.statMetricTop}>
                        <div className={styles.statIconBadge}>
                          <Users size={16} />
                        </div>
                        <div>
                          <div className={styles.statNumber}>{project.beneficiaries || "450"}</div>
                          <div className={styles.statLabel}>Personas beneficiadas</div>
                        </div>
                      </div>
                      <span className={styles.statTag}>+25% vs meta</span>
                    </div>

                    <div className={styles.statMetricCard}>
                      <div className={styles.statMetricTop}>
                        <div className={styles.statIconBadge} style={{ background: "#f0fdf4", color: "#166534" }}>
                          <Leaf size={16} />
                        </div>
                        <div>
                          <div className={styles.statNumber}>12</div>
                          <div className={styles.statLabel}>Actividades realizadas</div>
                        </div>
                      </div>
                      <span className={styles.statTag}>+20% vs meta</span>
                    </div>

                    <div className={styles.statMetricCard}>
                      <div className={styles.statMetricTop}>
                        <div className={styles.statIconBadge} style={{ background: "#eff6ff", color: "#2563eb" }}>
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <div className={styles.statNumber}>2.5</div>
                          <div className={styles.statLabel}>Toneladas de impacto</div>
                        </div>
                      </div>
                      <span className={styles.statTag}>+40% vs meta</span>
                    </div>

                    <div className={styles.statMetricCard}>
                      <div className={styles.statMetricTop}>
                        <div className={styles.statIconBadge} style={{ background: "#fefce8", color: "#ca8a04" }}>
                          <Trophy size={16} />
                        </div>
                        <div>
                          <div className={styles.statNumber}>98%</div>
                          <div className={styles.statLabel}>Meta de impacto</div>
                        </div>
                      </div>
                      <span className={styles.statTag} style={{ color: "#2563eb" }}>Objetivo superado</span>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Progress Bar */}
              <div className={styles.progressBarContainer}>
                <div className={styles.progressHeader}>
                  <span>Progreso general del proyecto</span>
                  <span className={styles.progressPercentage}>{project.overallProgress ?? 98}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${project.overallProgress ?? 98}%` }} />
                </div>
              </div>
            </section>
          </main>

          {/* COLUMN 3: Right Vertical Photo Marquee (Infinite Auto-Scrolling Carousel) */}
          <aside className={styles.rightMarqueeColumn}>
            <VerticalPhotoMarquee
              images={evidenceList}
              onImageClick={(idx) => setLightboxIndex(idx)}
            />
          </aside>
        </div>
      </div>

      {/* High-Resolution Interactive Lightbox Modal */}
      {lightboxIndex !== null && (
        <ProjectLightbox
          images={evidenceList}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
