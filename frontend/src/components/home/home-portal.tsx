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
import { values } from "@/data/values";
import { parseApiDate } from "@/lib/date";
import type { Event, Opportunity, Project, RepresentationItem, Statistic, TeamMember } from "@/types";
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
  return <div className={styles.sectionHeader}><h2>{title}</h2><Link href={href} className={styles.sectionLink}>{linkLabel}<ChevronRight className="size-3" aria-hidden="true" /></Link></div>;
}

function getDateParts(value: string) {
  const date = parseApiDate(value);
  if (!date) return { day: "--", month: "PEND" };
  return {
    day: new Intl.DateTimeFormat("es-PE", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-PE", { month: "short" }).format(date).replace(".", "").toUpperCase(),
  };
}

function formatDate(value?: string) {
  if (!value) return "Fecha por confirmar";
  const date = parseApiDate(value);
  if (!date) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "long", year: "numeric" }).format(date);
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
      <section className={styles.hero} id="inicio">
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>No somos espectadores del cambio,<span>somos quienes lo lideran</span></h1>
            <p className={styles.heroText}>Somos una organización juvenil conformada por estudiantes de la Universidad Privada de Tacna, comprometidos con generar impacto y transformar nuestra comunidad.</p>
            <div className={styles.heroActions}>
              <Link href="/unete" className={styles.primaryButton}>Únete ahora<ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/proyectos" className={styles.secondaryButton}>Ver proyectos<ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            <div className={styles.heroPrinciples} aria-label="Principios Fuerza UPT">
              {principles.map((principle) => { const Icon = principle.icon; return <div className={styles.heroPrinciple} key={principle.title}><Icon aria-hidden="true" /><span>{principle.title}</span></div>; })}
            </div>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/images/fuerza-upt-equipo.jpg" alt="Integrantes de Fuerza UPT reunidos en el campus" fill priority sizes="(min-width: 861px) 57vw, 100vw" />
          <p className={styles.heroMotto}>Somos UPT, somos FUERZA</p>
        </div>
      </section>

      <section className={styles.valuesBand} id="nosotros">
        <div className={styles.container}>
          <div className={styles.valuesGrid}>
            {principles.map((principle) => { const Icon = principle.icon; return <article className={styles.valueItem} key={principle.title}><span className={styles.valueIcon}><Icon aria-hidden="true" /></span><h3>{principle.title}</h3><p>{principle.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section className={styles.contentBand}>
        <div className={styles.container}>
          <div className={styles.mainGrid}>
            <div className={styles.sectionBlock}>
              <SectionHeader title="Gestión y proyecto destacados" href="/proyectos" linkLabel="Explorar módulos" />
              <div className={styles.projectsGrid}>
                {featuredRepresentation ? <Link href="/representacion-estudiantil" className={styles.projectCard}>
                  <div className={`${styles.projectCover} ${styles.posterRed}`}><Image src={featuredRepresentation.coverImage ?? "/images/hero-equipo.png"} alt="" fill sizes="40vw" /><p className={styles.coverLabel}>{featuredRepresentation.title}</p></div>
                  <div className={styles.projectBody}><h3>{featuredRepresentation.title}</h3><p>{featuredRepresentation.summary}</p><span className={styles.tag}>Representación</span></div>
                </Link> : null}
                {featuredProject ? <Link href="/proyectos" className={styles.projectCard}>
                  <div className={`${styles.projectCover} ${styles.posterBlue}`}><Image src={featuredProject.coverImage ?? "/images/hero-equipo.png"} alt="" fill sizes="40vw" /><p className={styles.coverLabel}>{featuredProject.title}</p></div>
                  <div className={styles.projectBody}><h3>{featuredProject.title}</h3><p>{featuredProject.summary}</p><span className={styles.tag}>{featuredProject.category}</span></div>
                </Link> : null}
              </div>
              {!featuredRepresentation ? <p className={styles.emptyCopy}>No hay una gestión confirmada y destacada para publicar todavía.</p> : null}
            </div>

            <aside className={styles.sideStack} aria-label="Agenda y oportunidades">
              <section className={styles.sideCard}>
                <SectionHeader title="Próximos eventos" href="/eventos" linkLabel="Ver calendario" />
                {nextEvents.length ? <div className={styles.eventList}>{nextEvents.map((event) => { const date = getDateParts(event.startDate); return <article className={styles.eventItem} key={event.id}><div className={styles.dateBox}><strong>{date.day}</strong><span>{date.month}</span></div><div className={styles.eventInfo}><h4>{event.title}</h4><div className={styles.eventMeta}><span><Clock className="size-2.5" aria-hidden="true" />{event.time ?? "Por confirmar"}</span><span><MapPin className="size-2.5" aria-hidden="true" />{event.location ?? "Por confirmar"}</span></div></div></article>; })}</div> : <p className={styles.emptyCopy}>No hay próximos eventos publicados.</p>}
                <Link href="/eventos" className={styles.sideAction}>Ver todos los eventos<ArrowRight className="size-3" aria-hidden="true" /></Link>
              </section>

              <section className={styles.sideCard}>
                <SectionHeader title="Becas y oportunidades" href="/becas" linkLabel="Ver todas" />
                {openOpportunities.length ? <div className={styles.opportunityList}>{openOpportunities.map((opportunity) => <article className={styles.opportunityItem} key={opportunity.id}><GraduationCap aria-hidden="true" /><div><h4>{opportunity.title}</h4><p>{opportunity.summary}</p></div></article>)}</div> : <p className={styles.emptyCopy}>No hay oportunidades abiertas con enlace oficial verificado.</p>}
              </section>
            </aside>
          </div>

          {verifiedStats.length ? <section className={styles.stats} aria-labelledby="impacto-title"><h2 className={styles.statsTitle} id="impacto-title">Nuestro impacto verificado</h2><div className={styles.statsGrid}>{verifiedStats.map((stat) => { const Icon = stat.id === "projects" ? Lightbulb : stat.id === "students" ? UsersRound : stat.id === "events" ? CalendarDays : Trophy; return <div className={styles.statItem} key={stat.id}><Icon aria-hidden="true" /><div><strong>{stat.value}</strong><span>{stat.label}</span></div></div>; })}</div></section> : null}

          <div className={styles.lowerGrid}>
            <section className={styles.lowerPanel}>
              <SectionHeader title="Conoce a nuestro equipo" href="/equipo" linkLabel="Ver equipo" />
              {publicMembers.length ? <div className={styles.teamList}>{publicMembers.map((member) => <article className={styles.teamMember} key={member.id}><div className={styles.avatar}><Image src={member.imageUrl} alt={`Retrato de ${member.name}`} fill sizes="58px" unoptimized /></div><strong>{member.name}</strong><span>{member.role}</span></article>)}</div> : <p className={styles.emptyCopy}>No hay integrantes confirmados para mostrar.</p>}
              <p className={styles.teamQuote}>Un equipo publicado con información confirmada.</p>
            </section>

            <section className={styles.lowerPanel}>
              <SectionHeader title="Legado Fuerza UPT" href="/representacion-estudiantil" linkLabel="Ver seguimiento" />
              <div className={styles.representationPreview}><ShieldCheck aria-hidden="true" /><h3>Publicación responsable</h3><p>Las gestiones se publican solo cuando existe información confirmada sobre su avance y resultado.</p></div>
            </section>
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}><div className={`${styles.container} ${styles.ctaInner}`}><div><h2>¿Listo para ser parte del cambio?</h2><p>Únete a Fuerza UPT y construyamos juntos una universidad con más oportunidades.</p></div><Link href="/unete" className={styles.ctaButton}>Únete ahora<ArrowRight className="size-4" aria-hidden="true" /></Link></div></section>
    </div>
  );
}
