import Link from "next/link";
import { Send, UsersRound } from "lucide-react";
import type { TeamMember } from "@/types";
import { FadeIn, Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { TeamMemberCard } from "./team-member-card";
import styles from "./team-directory.module.css";

interface TeamDirectoryProps {
  members: TeamMember[];
}

export function TeamDirectory({ members }: TeamDirectoryProps) {
  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <FadeIn delay={0.05} direction="up" distance={12}>
            <p className={styles.eyebrow}>Nuestro equipo</p>
          </FadeIn>
          <FadeIn delay={0.12} direction="up" distance={16}>
            <h1>Equipo Fuerza UPT</h1>
          </FadeIn>
          <FadeIn delay={0.2} direction="up" distance={16}>
            <p className={styles.heroLead}>Personas que impulsan nuestra comunidad con liderazgo, servicio y compromiso.</p>
          </FadeIn>
        </header>

        <p className="sr-only" aria-live="polite">{members.length} integrantes publicados.</p>
        {members.length ? (
          <StaggerContainer className={`${styles.grid} ${members.length === 1 ? styles.singleGrid : ""}`} staggerDelay={0.06}>
            {members.map((member) => (
              <StaggerItem key={member.id}>
                <TeamMemberCard member={member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className={styles.empty}><p>Aun no hay integrantes publicados.</p></div>
        )}

        <Reveal delay={0.1} distance={20}>
          <section className={`${styles.cta} transition-all duration-300 hover:shadow-lg`} aria-labelledby="team-cta-title">
            <span className={styles.ctaIcon}><UsersRound aria-hidden="true" /></span>
            <div><h2 id="team-cta-title">¿Quieres formar parte del equipo?</h2><p>Conoce las areas disponibles y el proceso para participar.</p></div>
            <Link href="/unete" className={`${styles.ctaAction} transition-all duration-200 hover:scale-105 active:scale-95`}><Send aria-hidden="true" />Quiero unirme</Link>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
