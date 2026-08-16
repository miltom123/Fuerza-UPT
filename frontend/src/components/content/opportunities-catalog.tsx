"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Coins,
  ExternalLink,
  GraduationCap,
  Info,
  Laptop,
  Megaphone,
  Plane,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { parseApiDate } from "@/lib/date";
import type { Opportunity, OpportunityType } from "@/types";
import {
  FadeIn,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import styles from "./opportunities-catalog.module.css";

interface OpportunitiesCatalogProps {
  opportunities: Opportunity[];
}

const typeConfig: Record<
  OpportunityType,
  { label: string; badgeClass: string; iconClass: string; icon: any }
> = {
  SCHOLARSHIP: {
    label: "Becas académicas",
    badgeClass: styles.badgePurple,
    iconClass: styles.iconPurple,
    icon: GraduationCap,
  },
  EXCHANGE: {
    label: "Intercambio",
    badgeClass: styles.badgeBlue,
    iconClass: styles.iconBlue,
    icon: Plane,
  },
  INTERNATIONAL_PROGRAM: {
    label: "Movilidad",
    badgeClass: styles.badgeTeal,
    iconClass: styles.iconTeal,
    icon: Building2,
  },
  CALL: {
    label: "Convocatorias",
    badgeClass: styles.badgeOrange,
    iconClass: styles.iconOrange,
    icon: Megaphone,
  },
  VOLUNTEERING: {
    label: "Apoyo económico",
    badgeClass: styles.badgeGreen,
    iconClass: styles.iconGreen,
    icon: Coins,
  },
  CONTEST: {
    label: "Concurso",
    badgeClass: styles.badgeOrange,
    iconClass: styles.iconOrange,
    icon: Award,
  },
  INTERNSHIP: {
    label: "Práctica",
    badgeClass: styles.badgeTeal,
    iconClass: styles.iconTeal,
    icon: Users,
  },
  EXTERNAL_COURSE: {
    label: "Curso externo",
    badgeClass: styles.badgeBlue,
    iconClass: styles.iconBlue,
    icon: Laptop,
  },
};

const sampleOpportunities: Opportunity[] = [
  {
    id: "sample-1",
    slug: "beca-excelencia-2026",
    title: "Beca Excelencia Académica 2026",
    summary: "Reconocimiento al rendimiento académico sobresaliente y compromiso institucional.",
    description: "Reconocimiento al rendimiento académico sobresaliente y compromiso institucional.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 1,
    opportunityType: "SCHOLARSHIP",
    opportunityStatus: "OPEN",
    institution: "Universidad Privada de Tacna",
    deadline: "2026-06-30",
    countryOrModality: "Presencial",
    benefits: ["Exoneración del 100% de la pensión", "Acceso prioritario a biblioteca y laboratorios"],
    requirements: ["Promedio ponderado mayor a 16.5", "Pertenecer al tercio superior", "Sin sanciones disciplinarias"],
    status: "PUBLISHED",
    featured: true,
  },
  {
    id: "sample-2",
    slug: "intercambio-internacional-2026",
    title: "Intercambio Internacional 2026",
    summary: "Vive una experiencia académica en universidades aliadas alrededor del mundo.",
    description: "Vive una experiencia académica en universidades aliadas alrededor del mundo.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 2,
    opportunityType: "EXCHANGE",
    opportunityStatus: "OPEN",
    institution: "Red Internacional UPT",
    deadline: "2026-04-15",
    countryOrModality: "Presencial",
    benefits: ["Convalidación de asignaturas", "Beca de manutención parcial"],
    requirements: ["Haber aprobado el 50% de créditos", "Dominio del idioma según destino"],
    status: "PUBLISHED",
    featured: true,
  },
  {
    id: "sample-3",
    slug: "movilidad-academica-nacional",
    title: "Movilidad Académica Nacional",
    summary: "Fortalece tu formación en universidades nacionales con convenio.",
    description: "Fortalece tu formación en universidades nacionales con convenio.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 3,
    opportunityType: "INTERNATIONAL_PROGRAM",
    opportunityStatus: "OPEN",
    institution: "Red Peruana de Universidades",
    deadline: "2026-05-19",
    countryOrModality: "Mixta",
    benefits: ["Matrícula costo cero en universidad de destino", "Seguro médico estudiantil"],
    requirements: ["Estudiante regular a partir del 5to ciclo", "Pertenecer al quinto superior"],
    status: "PUBLISHED",
    featured: false,
  },
  {
    id: "sample-4",
    slug: "convocatoria-lideres-upt",
    title: "Convocatoria Líderes UPT",
    summary: "Desarrolla tu liderazgo y genera impacto en la comunidad universitaria.",
    description: "Desarrolla tu liderazgo y genera impacto en la comunidad universitaria.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 4,
    opportunityType: "CALL",
    opportunityStatus: "OPEN",
    institution: "Vicerrectorado Académico",
    deadline: "2026-05-01",
    countryOrModality: "Virtual",
    benefits: ["Certificación internacional en Liderazgo", "Mentoría personalizada"],
    requirements: ["Carta de motivación", "Disponibilidad de 4 horas semanales"],
    status: "PUBLISHED",
    featured: true,
  },
  {
    id: "sample-5",
    slug: "apoyo-economico-upt-2026",
    title: "Apoyo Económico UPT 2026",
    summary: "Programas de apoyo para facilitar tu continuidad académica.",
    description: "Programas de apoyo para facilitar tu continuidad académica.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 5,
    opportunityType: "VOLUNTEERING",
    opportunityStatus: "OPEN",
    institution: "Bienestar Universitario",
    deadline: "2026-05-30",
    countryOrModality: "Presencial",
    benefits: ["Descuento porcentual según evaluación socioeconómica"],
    requirements: ["Evaluación socioeconómica aprobada", "Constancia de matrícula activa"],
    status: "PUBLISHED",
    featured: false,
  },
  {
    id: "sample-6",
    slug: "programa-investigacion-upt",
    title: "Programa de Investigación UPT",
    summary: "Participa en proyectos de investigación con docentes y publicaciones en revistas indexadas.",
    description: "Participa en proyectos de investigación con docentes y publicaciones en revistas indexadas.",
    coverImage: "/images/hero-equipo.png",
    displayOrder: 6,
    opportunityType: "CONTEST",
    opportunityStatus: "OPEN",
    institution: "Instituto de Investigación UPT",
    deadline: "2026-07-20",
    countryOrModality: "Híbrida",
    benefits: ["Financiamiento para insumos y laboratorios", "Coautoría en publicaciones scientifics"],
    requirements: ["Propuesta preliminar de proyecto", "Respaldo de docente asesor"],
    status: "PUBLISHED",
    featured: true,
  },
];

function formatDate(value?: string) {
  if (!value) return "Por confirmar";
  const date = parseApiDate(value);
  if (!date) return "Por confirmar";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function OpportunitiesCatalog({
  opportunities,
}: OpportunitiesCatalogProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const displayList =
    opportunities.length > 0 ? opportunities : sampleOpportunities;

  const featuredList = displayList.filter((o) => o.featured || o.opportunityType === "CALL");

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Header Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <FadeIn delay={0.05} direction="up" distance={12}>
              <span className={styles.eyebrow}>OPORTUNIDADES PARA EL ESTUDIANTE</span>
            </FadeIn>
            <FadeIn delay={0.12} direction="up" distance={16}>
              <h1>Becas y oportunidades</h1>
            </FadeIn>
            <FadeIn delay={0.2} direction="up" distance={16}>
              <p>
                Impulsamos tu desarrollo académico y profesional conectándote con becas,
                programas de intercambio, pasantías y convocatorias oficiales.
              </p>
            </FadeIn>
          </div>
          <div className={`${styles.heroRight} overflow-hidden rounded-3xl`}>
            <Image
              src="/images/hero-equipo.png"
              alt="Estudiantes en el campus de la UPT"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 900px) 100vw, 50vw"
              priority
            />
          </div>
        </header>

        {/* Section 1: Explora oportunidades */}
        <section>
          <Reveal delay={0.05} distance={16}>
            <div className={styles.sectionHeader} style={{ marginBottom: "20px" }}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon}>
                  <Sparkles size={22} />
                </div>
                <div className={styles.sectionText}>
                  <h2>Explora oportunidades para tu crecimiento</h2>
                  <p>Becas, intercambios, programas y convocatorias actualizadas para la comunidad universitaria.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <StaggerContainer className={styles.grid} staggerDelay={0.07}>
            {displayList.map((opportunity) => {
              const config = typeConfig[opportunity.opportunityType] || typeConfig.SCHOLARSHIP;
              const IconComponent = config.icon;

              return (
                <StaggerItem key={opportunity.id}>
                  <article className={`${styles.card} group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                    <div className={`${styles.cardCover} overflow-hidden`}>
                      <Image
                        src={opportunity.coverImage ?? "/images/hero-equipo.png"}
                        alt={opportunity.title}
                        fill
                        className="transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                      />
                      <span className={`${styles.typeBadge} ${config.badgeClass}`}>{config.label}</span>
                      <div className={`${styles.floatingIcon} ${config.iconClass} transition-transform duration-200 group-hover:scale-110`}>
                        <IconComponent size={20} />
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{opportunity.title}</h3>
                      <p>{opportunity.description}</p>

                      <div className={styles.metaList}>
                        <div className={styles.metaItem}>
                          <CalendarDays />
                          <span>Cierre: {formatDate(opportunity.deadline)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Laptop />
                          <span>Modalidad: {opportunity.countryOrModality ?? "Presencial"}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <User />
                          <span>Dirigido a: Estudiantes UPT</span>
                        </div>
                      </div>

                      <button
                        className={`${styles.detailsBtn} group/btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        Ver detalles <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* Section 2: Convocatorias destacadas */}
        {featuredList.length > 0 && (
          <section style={{ marginTop: "20px" }}>
            <div className={styles.sectionHeader} style={{ marginBottom: "20px" }}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon} style={{ background: "#0033cc", color: "#ffffff" }}>
                  <Award size={22} />
                </div>
                <div className={styles.sectionText}>
                  <h2>Convocatorias destacadas</h2>
                  <p>Nuevas oportunidades y programas relevantes para tu desarrollo académico y profesional.</p>
                </div>
              </div>
              <Link href="#" className={styles.viewAll}>
                Ver todas <ChevronRight size={16} />
              </Link>
            </div>

            <div className={styles.grid}>
              {featuredList.map((opportunity) => {
                const config = typeConfig[opportunity.opportunityType] || typeConfig.SCHOLARSHIP;
                const IconComponent = config.icon;

                return (
                  <article className={styles.card} key={`featured-${opportunity.id}`}>
                    <div className={styles.cardCover}>
                      <Image
                        src={opportunity.coverImage ?? "/images/hero-equipo.png"}
                        alt={opportunity.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                      />
                      <span className={`${styles.typeBadge} ${config.badgeClass}`}>{config.label}</span>
                      <div className={`${styles.floatingIcon} ${config.iconClass}`}>
                        <IconComponent size={20} />
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{opportunity.title}</h3>
                      <p>{opportunity.description}</p>

                      <div className={styles.metaList}>
                        <div className={styles.metaItem}>
                          <CalendarDays />
                          <span>Cierre: {formatDate(opportunity.deadline)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Laptop />
                          <span>Modalidad: {opportunity.countryOrModality ?? "Híbrida"}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <User />
                          <span>Dirigido a: Estudiantes UPT</span>
                        </div>
                      </div>

                      <button
                        className={styles.detailsBtn}
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        Ver detalles <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Info Banner */}
        <div className={styles.infoBanner}>
          <div className={styles.infoIcon}>
            <Info size={22} />
          </div>
          <p>
            La información se actualiza periódicamente según convocatorias y oportunidades confirmadas. Te recomendamos revisar los detalles de cada programa para conocer requisitos y fechas importantes.
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOpportunity && (
        <div className={styles.backdrop} onClick={() => setSelectedOpportunity(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Image
                src={selectedOpportunity.coverImage ?? "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"}
                alt={selectedOpportunity.title}
                fill
              />
              <button className={styles.closeBtn} onClick={() => setSelectedOpportunity(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <h2>{selectedOpportunity.title}</h2>
              <p>{selectedOpportunity.description}</p>

              {selectedOpportunity.benefits && selectedOpportunity.benefits.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h4>Beneficios</h4>
                  <ul>
                    {selectedOpportunity.benefits.map((b, i) => (
                      <li key={i}>
                        <CheckCircle2 /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedOpportunity.requirements && selectedOpportunity.requirements.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h4>Requisitos</h4>
                  <ul>
                    {selectedOpportunity.requirements.map((r, i) => (
                      <li key={i}>
                        <CheckCircle2 /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.modalActions}>
                {selectedOpportunity.officialUrl && (
                  <Link
                    href={selectedOpportunity.officialUrl}
                    target="_blank"
                    className={styles.actionPrimary}
                  >
                    Ver convocatoria oficial <ExternalLink size={14} />
                  </Link>
                )}
                <button
                  className={styles.actionPrimary}
                  style={{ background: "#10b981", border: "none", cursor: "pointer" }}
                  onClick={() => alert("Formulario de postulación enviado correctamente.")}
                >
                  Postular <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
