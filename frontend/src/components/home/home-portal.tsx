"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import { values } from "@/data/values";
import { parseApiDate } from "@/lib/date";
import type { Event, Opportunity, Project, RepresentationItem, Statistic, TeamMember } from "@/types";
import {
  FadeIn,
  Reveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from "@/components/motion";
import styles from "./home-portal.module.css";

interface HomePortalProps {
  representationItems: RepresentationItem[];
  projects: Project[];
  events: Event[];
  opportunities: Opportunity[];
  teamMembers: TeamMember[];
  statistics: Statistic[];
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <Link href={href} className={`${styles.sectionLink} group transition-all duration-200 hover:gap-1.5`}>
        {linkLabel}
        <ChevronRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function getDateParts(value: string) {
  const date = parseApiDate(value);
  if (!date) return { day: "--", month: "PEND" };
  return {
    day: new Intl.DateTimeFormat("es-PE", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-PE", { month: "short" }).format(date).replace(".", "").toUpperCase(),
  };
}

export function HomePortal({ representationItems, projects, events, opportunities, teamMembers, statistics }: HomePortalProps) {
  const principles = values.slice(0, 5);
  const featuredRepresentation =
    representationItems.find((item) => (item.status === "PUBLISHED" || (item as any).contentStatus === "PUBLISHED") && item.featured) ??
    representationItems.find((item) => item.status === "PUBLISHED" || (item as any).contentStatus === "PUBLISHED") ??
    representationItems[0];
  const featuredProject =
    projects.find((item) => (item.status === "PUBLISHED" || (item as any).contentStatus === "PUBLISHED") && item.featured) ??
    projects.find((item) => item.status === "PUBLISHED" || (item as any).contentStatus === "PUBLISHED") ??
    projects[0];
  const nextEvents = events
    .filter((item) => item.status === "PUBLISHED" && ["UPCOMING", "REGISTRATION_OPEN", "IN_PROGRESS"].includes(item.eventStatus))
    .sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 3);
  const openOpportunities = opportunities
    .filter((item) => item.status === "PUBLISHED" && ["OPEN", "CLOSING_SOON"].includes(item.opportunityStatus))
    .slice(0, 3);
  const publicMembers = teamMembers.slice(0, 4);
  const verifiedStats = statistics.filter((item) => item.isVerified);

  return (
    <div className={styles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero} id="inicio">
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <FadeIn delay={0.05} direction="up" distance={16}>
              <h1 className={styles.heroTitle}>
                No somos espectadores del cambio,
                <span>somos quienes lo lideran</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.15} direction="up" distance={16}>
              <p className={styles.heroText}>
                Somos una organización juvenil conformada por estudiantes de la Universidad Privada de Tacna, comprometidos con generar impacto y transformar nuestra comunidad.
              </p>
            </FadeIn>

            <FadeIn delay={0.25} direction="up" distance={14}>
              <div className={styles.heroActions}>
                <Link href="/unete" className={`${styles.primaryButton} transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]`}>
                  Únete ahora
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link href="/proyectos" className={`${styles.secondaryButton} transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]`}>
                  Ver proyectos
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.35} direction="up" distance={12}>
              <div className={styles.heroPrinciples} aria-label="Principios Fuerza UPT">
                {principles.map((principle) => {
                  const Icon = principle.icon;
                  return (
                    <div className={`${styles.heroPrinciple} transition-transform duration-200 hover:scale-105`} key={principle.title}>
                      <Icon aria-hidden="true" />
                      <span>{principle.title}</span>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={styles.heroMedia}
        >
          <Image
            src="/images/fuerza-upt-equipo.jpg"
            alt="Integrantes de Fuerza UPT reunidos en el campus"
            fill
            priority
            className="transition-transform duration-700 ease-out hover:scale-105"
            sizes="(min-width: 861px) 57vw, 100vw"
          />
          <p className={styles.heroMotto}>Somos UPT, somos FUERZA</p>
        </motion.div>
      </section>

      {/* 2. VALUES BAND */}
      <section className={styles.valuesBand} id="nosotros">
        <div className={styles.container}>
          <StaggerContainer className={styles.valuesGrid} staggerDelay={0.06}>
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <StaggerItem key={principle.title}>
                  <article className={`${styles.valueItem} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}>
                    <span className={styles.valueIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    <h3>{principle.title}</h3>
                    <p>{principle.description}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 3. CONTENT BAND */}
      <section className={styles.contentBand}>
        <div className={styles.container}>
          <div className={styles.mainGrid}>
            <Reveal className={styles.sectionBlock} delay={0.05}>
              <SectionHeader title="Gestión y proyecto destacados" href="/proyectos" linkLabel="Explorar módulos" />
              <div className={styles.projectsGrid}>
                {featuredRepresentation ? (
                  <Link href="/representacion-estudiantil" className={`${styles.projectCard} group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}>
                    <div className={`${styles.projectCover} ${styles.posterRed} overflow-hidden`}>
                      <Image
                        src={featuredRepresentation.coverImage ?? "/images/hero-equipo.png"}
                        alt=""
                        fill
                        className="transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="40vw"
                      />
                      <p className={styles.coverLabel}>{featuredRepresentation.title}</p>
                    </div>
                    <div className={styles.projectBody}>
                      <h3>{featuredRepresentation.title}</h3>
                      <p>{featuredRepresentation.summary}</p>
                      <span className={styles.tag}>Representación</span>
                    </div>
                  </Link>
                ) : null}

                {featuredProject ? (
                  <Link href="/proyectos" className={`${styles.projectCard} group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}>
                    <div className={`${styles.projectCover} ${styles.posterBlue} overflow-hidden`}>
                      <Image
                        src={featuredProject.coverImage ?? "/images/hero-equipo.png"}
                        alt=""
                        fill
                        className="transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="40vw"
                      />
                      <p className={styles.coverLabel}>{featuredProject.title}</p>
                    </div>
                    <div className={styles.projectBody}>
                      <h3>{featuredProject.title}</h3>
                      <p>{featuredProject.summary}</p>
                      <span className={styles.tag}>{featuredProject.category}</span>
                    </div>
                  </Link>
                ) : null}
              </div>
              {!featuredRepresentation ? <p className={styles.emptyCopy}>No hay una gestión confirmada y destacada para publicar todavía.</p> : null}
            </Reveal>

            <aside className={styles.sideStack} aria-label="Agenda y oportunidades">
              <Reveal className={styles.sideCard} delay={0.1}>
                <SectionHeader title="Próximos eventos" href="/eventos" linkLabel="Ver calendario" />
                {nextEvents.length ? (
                  <div className={styles.eventList}>
                    {nextEvents.map((event) => {
                      const date = getDateParts(event.startDate);
                      return (
                        <article className={`${styles.eventItem} transition-transform duration-200 hover:translate-x-1`} key={event.id}>
                          <div className={styles.dateBox}>
                            <strong>{date.day}</strong>
                            <span>{date.month}</span>
                          </div>
                          <div className={styles.eventInfo}>
                            <h4>{event.title}</h4>
                            <div className={styles.eventMeta}>
                              <span>
                                <Clock className="size-2.5" aria-hidden="true" />
                                {event.time ?? "Por confirmar"}
                              </span>
                              <span>
                                <MapPin className="size-2.5" aria-hidden="true" />
                                {event.location ?? "Por confirmar"}
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyCopy}>No hay próximos eventos publicados.</p>
                )}
                <Link href="/eventos" className={`${styles.sideAction} group`}>
                  Ver todos los eventos
                  <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Reveal>

              <Reveal className={styles.sideCard} delay={0.15}>
                <SectionHeader title="Becas y oportunidades" href="/becas" linkLabel="Ver todas" />
                {openOpportunities.length ? (
                  <div className={styles.opportunityList}>
                    {openOpportunities.map((opportunity) => (
                      <article className={`${styles.opportunityItem} transition-transform duration-200 hover:translate-x-1`} key={opportunity.id}>
                        <GraduationCap aria-hidden="true" />
                        <div>
                          <h4>{opportunity.title}</h4>
                          <p>{opportunity.summary}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyCopy}>No hay oportunidades abiertas con enlace oficial verificado.</p>
                )}
              </Reveal>
            </aside>
          </div>

          {/* 4. STATS WITH ANIMATED COUNTER */}
          {verifiedStats.length ? (
            <Reveal className={styles.stats} aria-labelledby="impacto-title" delay={0.1}>
              <h2 className={styles.statsTitle} id="impacto-title">Nuestro impacto verificado</h2>
              <div className={styles.statsGrid}>
                {verifiedStats.map((stat) => {
                  const Icon = stat.id === "projects" ? Lightbulb : stat.id === "students" ? UsersRound : stat.id === "events" ? CalendarDays : Trophy;
                  const numValue = parseInt(stat.value.replace(/[^0-9]/g, ""), 10);
                  const isNumber = !isNaN(numValue) && numValue > 0;
                  const suffix = stat.value.includes("+") ? "+" : stat.value.includes("%") ? "%" : "";

                  return (
                    <div className={`${styles.statItem} transition-transform duration-200 hover:scale-105`} key={stat.id}>
                      <Icon aria-hidden="true" />
                      <div>
                        <strong>
                          {isNumber ? (
                            <AnimatedCounter value={numValue} suffix={suffix} />
                          ) : (
                            stat.value
                          )}
                        </strong>
                        <span>{stat.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          ) : null}

          {/* 5. LOWER PANELS */}
          <div className={styles.lowerGrid}>
            <Reveal className={styles.lowerPanel} delay={0.1}>
              <SectionHeader title="Conoce a nuestro equipo" href="/equipo" linkLabel="Ver equipo" />
              {publicMembers.length ? (
                <div className={styles.teamList}>
                  {publicMembers.map((member) => (
                    <article className={`${styles.teamMember} transition-transform duration-200 hover:scale-105`} key={member.id}>
                      <div className={`${styles.avatar} overflow-hidden`}>
                        <Image src={member.imageUrl} alt={`Retrato de ${member.name}`} fill sizes="58px" unoptimized className="transition-transform duration-300 hover:scale-110" />
                      </div>
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyCopy}>No hay integrantes confirmados para mostrar.</p>
              )}
              <p className={styles.teamQuote}>Un equipo publicado con información confirmada.</p>
            </Reveal>

            <Reveal className={styles.lowerPanel} delay={0.15}>
              <SectionHeader title="Legado Fuerza UPT" href="/representacion-estudiantil" linkLabel="Ver seguimiento" />
              <div className={`${styles.representationPreview} transition-all duration-300 hover:shadow-md hover:border-blue-200`}>
                <ShieldCheck aria-hidden="true" />
                <h3>Publicación responsable</h3>
                <p>Las gestiones se publican solo cuando existe información confirmada sobre su avance y resultado.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. CTA BAND */}
      <section className={styles.ctaBand}>
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <div>
            <h2>¿Listo para ser parte del cambio?</h2>
            <p>Únete a Fuerza UPT y construyamos juntos una universidad con más oportunidades.</p>
          </div>
          <Link href="/unete" className={`${styles.ctaButton} transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg`}>
            Únete ahora
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

