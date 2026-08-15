import Link from "next/link";
import { Send, UsersRound } from "lucide-react";
import type { TeamMember } from "@/types";
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
          <p className={styles.eyebrow}>Nuestro equipo</p>
          <h1>Equipo Fuerza UPT</h1>
          <p className={styles.heroLead}>Personas que impulsan nuestra comunidad con liderazgo, servicio y compromiso.</p>
        </header>

        <p className="sr-only" aria-live="polite">{members.length} integrantes publicados.</p>
        {members.length ? (
          <div className={`${styles.grid} ${members.length === 1 ? styles.singleGrid : ""}`}>
            {members.map((member) => <TeamMemberCard key={member.id} member={member} />)}
          </div>
        ) : (
          <div className={styles.empty}><p>Aun no hay integrantes publicados.</p></div>
        )}

        <section className={styles.cta} aria-labelledby="team-cta-title">
          <span className={styles.ctaIcon}><UsersRound aria-hidden="true" /></span>
          <div><h2 id="team-cta-title">¿Quieres formar parte del equipo?</h2><p>Conoce las areas disponibles y el proceso para participar.</p></div>
          <Link href="/unete" className={styles.ctaAction}><Send aria-hidden="true" />Quiero unirme</Link>
        </section>
      </div>
    </section>
  );
}
