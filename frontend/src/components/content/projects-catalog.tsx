"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Wifi,
} from "lucide-react";
import type { Event, Project, ProjectStatus } from "@/types";
import styles from "./projects-catalog.module.css";

interface ProjectsCatalogProps {
  projects: Project[];
  events?: Event[];
}

const statusLabels: Record<ProjectStatus, string> = {
  UPCOMING: "Próximo",
  ACTIVE: "En Ejecución",
  PAUSED: "Pausado",
  FINISHED: "Finalizado",
};

const sampleProjects: Project[] = [
  {
    id: "proj-1",
    slug: "gato-con-acceso-a-internet",
    title: "Gato con acceso a internet",
    category: "xd",
    summary: "xd",
    description: "Buscamos reducir la brecha digital brindando acceso a internet gratuito en espacios comunes del campus universitario.",
    coverImage: "/images/hero-equipo.png",
    status: "PUBLISHED",
    projectStatus: "ACTIVE",
    featured: true,
    displayOrder: 1,
    startDate: "2026-08-04",
    endDate: "Sin cierre definido",
    responsibleNames: ["Milton", "Mondongo"],
    partnerNames: ["UNI", "BG"],
    beneficiaries: "450 estudiantes",
    results: ["Responsabilidad"],
    problem: "Falta de acceso a conectividad en campus",
    objective: "Brindar internet gratuito en zonas comunes",
    eventIds: [],
  },
  {
    id: "proj-2",
    slug: "abrigando-corazones",
    title: "Abrigando corazones",
    category: "Campaña para las zonas altoandinas de tacna",
    summary: "Campaña para las zonas altoandinas de tacna",
    description: "Recolectamos y distribuimos donaciones para apoyar a comunidades altoandinas con abrigo, alimentos y materiales educativos.",
    coverImage: "/images/hero-equipo.png",
    status: "PUBLISHED",
    projectStatus: "ACTIVE",
    featured: true,
    displayOrder: 2,
    startDate: "2026-08-10",
    endDate: "Sin cierre definido",
    responsibleNames: ["Abril"],
    partnerNames: ["CAPSUR"],
    beneficiaries: "2500 personas",
    results: [],
    problem: "Bajas temperaturas en zonas altoandinas de Tacna",
    objective: "Recolectar y distribuir abrigo y víveres",
    eventIds: [],
  },
];

export function ProjectsCatalog({ projects, events }: ProjectsCatalogProps) {
  const [filterSort, setFilterSort] = useState("recent");

  const displayList = projects.length >= 2 ? projects : [...projects, ...sampleProjects];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ==========================================
            1. HERO BANNER
           ========================================== */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>INICIATIVAS DE LARGO ALCANCE</span>
            <h1>Proyectos Fuerza UPT</h1>
            <p className={styles.heroLead}>
              Diseñamos e implementamos programas con propósito, que generan impacto real en nuestra comunidad universitaria y su entorno.
            </p>

            <div className={styles.heroBadgesRow}>
              <div className={styles.heroBadgeCard}>
                <div className={styles.heroBadgeIcon}>
                  <Target size={18} />
                </div>
                <div className={styles.heroBadgeText}>
                  <span className={styles.heroBadgeTitle}>Impacto sostenible</span>
                  <span className={styles.heroBadgeDesc}>Proyectos que dejan huella a mediano y largo plazo.</span>
                </div>
              </div>

              <div className={styles.heroBadgeCard}>
                <div className={styles.heroBadgeIcon}>
                  <Users size={18} />
                </div>
                <div className={styles.heroBadgeText}>
                  <span className={styles.heroBadgeTitle}>Trabajo colaborativo</span>
                  <span className={styles.heroBadgeDesc}>Alianzas estratégicas dentro y fuera de la universidad.</span>
                </div>
              </div>

              <div className={styles.heroBadgeCard}>
                <div className={styles.heroBadgeIcon}>
                  <TrendingUp size={18} />
                </div>
                <div className={styles.heroBadgeText}>
                  <span className={styles.heroBadgeTitle}>Transparencia y gestión</span>
                  <span className={styles.heroBadgeDesc}>Seguimiento constante y rendición de cuentas.</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <Image
              src="/images/hero-projects-illustration.png"
              alt="Ilustración de equipo de proyectos Fuerza UPT"
              fill
              priority
              className={styles.heroIllustration}
              sizes="340px"
            />
          </div>
        </section>

        {/* ==========================================
            2. 4 FEATURE CARDS ROW
           ========================================== */}
        <section className={styles.featureCardsGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <Users size={22} />
            </div>
            <div className={styles.featureContent}>
              <span className={styles.featureTitle}>Iniciativas reales</span>
              <p className={styles.featureDesc}>
                Proyectos en marcha que responden a necesidades reales de nuestra comunidad.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <GraduationCap size={22} />
            </div>
            <div className={styles.featureContent}>
              <span className={styles.featureTitle}>Formación integral</span>
              <p className={styles.featureDesc}>
                Promueven el desarrollo académico, social y personal de los estudiantes.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <Globe2 size={22} />
            </div>
            <div className={styles.featureContent}>
              <span className={styles.featureTitle}>Compromiso territorial</span>
              <p className={styles.featureDesc}>
                Trabajamos en y para nuestras comunidades aliadas.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <ShieldCheck size={22} />
            </div>
            <div className={styles.featureContent}>
              <span className={styles.featureTitle}>Gestión responsable</span>
              <p className={styles.featureDesc}>
                Cada proyecto cuenta con objetivos claros y procesos de evaluación.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            3. CONTROLS BAR (COUNT + FILTER)
           ========================================== */}
        <div className={styles.controlsBar}>
          <span className={styles.projectCount}>
            <strong>{displayList.length}</strong> proyecto(s) publicado(s)
          </span>

          <select
            className={styles.filterSelect}
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="active">En ejecución primero</option>
            <option value="name">Por nombre</option>
          </select>
        </div>

        {/* ==========================================
            4. PROJECT CARDS LIST
           ========================================== */}
        <section className={styles.projectList}>
          {displayList.map((project) => {
            const targetUrl = `/proyectos/${project.slug ?? project.id}`;
            const isSecond = project.id === "proj-2" || project.title.toLowerCase().includes("abrigando");

            return (
              <article className={styles.projectCard} key={project.id}>
                {/* Left Column: Image Poster */}
                <div className={styles.posterColumn}>
                  <Image
                    src={project.coverImage ?? "/images/hero-equipo.png"}
                    alt={project.title}
                    fill
                    className={styles.posterImage}
                    sizes="(max-width: 1024px) 100vw, 450px"
                  />
                  <div className={styles.posterGradientOverlay}>
                    <span className={styles.statusBadgeGreen}>
                      {statusLabels[project.projectStatus] ?? "EN EJECUCIÓN"}
                    </span>

                    <div className={styles.posterTextGroup}>
                      <h2 className={styles.posterTitle}>{project.title}</h2>
                      <span className={styles.posterSummary}>
                        {project.category || project.summary || "Proyecto institucional"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Details & Metadata */}
                <div className={styles.detailsColumn}>
                  {/* 4 Metadata Cards */}
                  <div className={styles.factsGrid}>
                    <div className={styles.factCard}>
                      <div className={styles.factHeader}>
                        <CalendarDays size={14} />
                        <span className={styles.factLabel}>PERIODO</span>
                      </div>
                      <span className={styles.factValue}>
                        {project.startDate ?? "2026-08-04"} - {project.endDate ?? "Sin cierre definido"}
                      </span>
                    </div>

                    <div className={styles.factCard}>
                      <div className={styles.factHeader}>
                        <Users size={14} />
                        <span className={styles.factLabel}>RESPONSABLES</span>
                      </div>
                      <span className={styles.factValue}>
                        {project.responsibleNames?.length ? project.responsibleNames.join(", ") : "Milton, Mondongo"}
                      </span>
                    </div>

                    <div className={styles.factCard}>
                      <div className={styles.factHeader}>
                        <Handshake size={14} />
                        <span className={styles.factLabel}>ALIADOS</span>
                      </div>
                      <span className={styles.factValue}>
                        {project.partnerNames?.length ? project.partnerNames.join(", ") : "UNI, BG"}
                      </span>
                    </div>

                    <div className={styles.factCard}>
                      <div className={styles.factHeader}>
                        <UserCheck size={14} />
                        <span className={styles.factLabel}>BENEFICIARIOS</span>
                      </div>
                      <span className={styles.factValue}>
                        {project.beneficiaries ?? "450 estudiantes"}
                      </span>
                    </div>
                  </div>

                  {/* ¿De qué trata este proyecto? */}
                  <div className={styles.aboutSection}>
                    <h3>¿De qué trata este proyecto?</h3>
                    <p>
                      {project.description ||
                        (isSecond
                          ? "Recolectamos y distribuimos donaciones para apoyar a comunidades altoandinas con abrigo, alimentos y materiales educativos."
                          : "Buscamos reducir la brecha digital brindando acceso a internet gratuito en espacios comunes del campus universitario.")}
                    </p>

                    <div className={styles.pillarsRow}>
                      {!isSecond ? (
                        <>
                          <div className={styles.pillarCard}>
                            <BookOpen size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Mejora del acceso a la información y recursos</span>
                          </div>
                          <div className={styles.pillarCard}>
                            <Mail size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Fomenta la inclusión digital y académica</span>
                          </div>
                          <div className={styles.pillarCard}>
                            <Wifi size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Espacios conectados para una comunidad más unida</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.pillarCard}>
                            <HeartHandshake size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Apoyo directo a comunidades vulnerables</span>
                          </div>
                          <div className={styles.pillarCard}>
                            <Users size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Fomenta la solidaridad y el voluntariado</span>
                          </div>
                          <div className={styles.pillarCard}>
                            <Globe2 size={16} className={styles.pillarIcon} />
                            <span className={styles.pillarText}>Fortalece la conexión entre la universidad y su entorno</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resultados clave */}
                  <div className={styles.resultsSection}>
                    <h4>Resultados clave</h4>
                    {project.results && project.results.length ? (
                      <p className={styles.resultsText}>
                        <CheckCircle2 size={14} style={{ display: "inline", color: "#16a34a", marginRight: 4 }} />
                        {project.results.join(", ")}
                      </p>
                    ) : (
                      <p className={styles.resultsText}>
                        Aún no hay resultados confirmados para publicación.
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <Link href={targetUrl} className={styles.btnFullPrimary}>
                    Ver detalles
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* ==========================================
            5. CTA BANNER
           ========================================== */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaLeft}>
            <div className={styles.ctaIllustrationWrapper}>
              <Image
                src="/images/puzzle-idea-illustration.png"
                alt="Ilustración de propuesta de proyecto"
                fill
                className={styles.ctaIllustration}
                sizes="140px"
              />
            </div>
            <div className={styles.ctaTextGroup}>
              <h3>¿Tienes una idea de proyecto?</h3>
              <p>
                Súmate al cambio. Presenta tu propuesta y construyamos juntos un impacto que trascienda.
              </p>
            </div>
          </div>

          <Link href="/contacto" className={styles.ctaBtnOutline}>
            Enviar propuesta
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
