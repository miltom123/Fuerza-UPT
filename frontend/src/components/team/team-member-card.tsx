import Image from "next/image";
import Link from "next/link";
import { AtSign, BriefcaseBusiness, Mail, MapPin, UserRound, UsersRound, Bird } from "lucide-react";
import type { TeamMember } from "@/types";
import styles from "./team-directory.module.css";

interface TeamMemberCardProps {
  member: TeamMember;
  preview?: boolean;
}

export function TeamMemberCard({ member, preview = false }: TeamMemberCardProps) {
  return (
    <article className={styles.memberCard}>
      <div className={styles.memberMain}>
        <div className={styles.avatar}>
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt={`Retrato de ${member.name}`}
              fill
              sizes="112px"
              className={styles.avatarImage}
              unoptimized
            />
          ) : <UserRound aria-hidden="true" />}
        </div>
        <div className={styles.memberInfo}>
          <h2>{member.name}</h2>
          <strong>{member.role}</strong>
          <p className={styles.career}>{member.career}</p>
          <p className={styles.description}>{member.description}</p>
          {member.location ? <span className={styles.location}><MapPin aria-hidden="true" />{member.location}</span> : null}
        </div>
      </div>
      <footer className={styles.cardFooter}>
        <div className={styles.socials} aria-label={`Redes de ${member.name}`}>
          {member.socialLinks.map((social) => (
            <Link
              key={social.platform}
              href={preview ? "#" : social.url}
              onClick={preview ? (event) => event.preventDefault() : undefined}
              target={preview ? undefined : "_blank"}
              rel={preview ? undefined : "noreferrer"}
              aria-label={`${social.platform === "INSTAGRAM" ? "Instagram" : social.platform === "LINKEDIN" ? "LinkedIn" : social.platform === "FACEBOOK" ? "Facebook" : "Twitter"} de ${member.name}`}
            >
              {social.platform === "INSTAGRAM" ? <AtSign aria-hidden="true" /> : social.platform === "LINKEDIN" ? <BriefcaseBusiness aria-hidden="true" /> : social.platform === "FACEBOOK" ? <UsersRound aria-hidden="true" /> : <Bird aria-hidden="true" />}
            </Link>
          ))}
        </div>
        {member.email ? (
          <Link
            href={preview ? "#" : `mailto:${member.email}`}
            onClick={preview ? (event) => event.preventDefault() : undefined}
            className={styles.profileAction}
          >
            <Mail aria-hidden="true" /><span className="truncate">{member.email}</span>
          </Link>
        ) : <span className={styles.noContact}>Sin contacto publico</span>}
      </footer>
    </article>
  );
}
