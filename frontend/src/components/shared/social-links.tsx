import { Camera, Music2, Play, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/admin-workflows";

const socialDefinitions = [
  { key: "instagram", label: "Instagram", Icon: Camera },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "facebook", label: "Facebook", Icon: UsersRound },
  { key: "youtube", label: "YouTube", Icon: Play },
] as const;

export function SocialLinks({ settings, className }: { settings: SiteSettings; className?: string }) {
  const links = socialDefinitions.flatMap(({ key, label, Icon }) => {
    const href = safeSocialUrl(settings[key]);
    return href ? [{ href, label, Icon }] : [];
  });

  if (!links.length) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-8 items-center justify-center rounded-full border border-fuerza-border bg-fuerza-surface text-fuerza-navy transition hover:border-fuerza-blue hover:bg-white hover:text-fuerza-blue focus-visible:ring-4 focus-visible:ring-fuerza-blue/20"
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

function safeSocialUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
