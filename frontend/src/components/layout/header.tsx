"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/brand-mark";
import { SocialLinks } from "@/components/shared/social-links";
import { navigationItems } from "@/data/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { SiteSettings } from "@/types/admin-workflows";
import { MobileMenu } from "./mobile-menu";

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const adminHref = isAuthenticated ? "/administracion" : "/administracion/login";
  const adminLabel = isAuthenticated ? "Panel administrativo" : "Administración";

  return (
    <header className="sticky top-0 z-40 border-b border-fuerza-border/80 bg-white/95 backdrop-blur">
      <div className="container-fuerza flex h-[84px] items-center justify-between gap-3">
        <Link href="/" className="flex items-center" aria-label="Fuerza UPT inicio">
          <BrandMark />
        </Link>

        <nav className="hidden h-full items-center gap-0.5 xl:flex" aria-label="Navegación principal">
          {navigationItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex h-full items-center px-3 text-[13px] font-bold text-fuerza-navy transition hover:text-fuerza-blue focus-visible:ring-4 focus-visible:ring-fuerza-blue/20 ${
                  isActive
                    ? "text-fuerza-blue after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-fuerza-blue"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SocialLinks settings={settings} className="hidden 2xl:flex" />
          <Button
            asChild
            variant="outline"
            size="icon-lg"
            className="rounded-full border-fuerza-border bg-white text-fuerza-navy hover:border-fuerza-blue hover:bg-blue-50 hover:text-fuerza-blue 2xl:h-11 2xl:w-auto 2xl:px-4"
          >
            <Link href={adminHref} aria-label={adminLabel} title={adminLabel}>
              <ShieldCheck className="size-4" />
              <span className="hidden 2xl:inline">{adminLabel}</span>
            </Link>
          </Button>
          <Button asChild className="h-11 rounded-full bg-fuerza-blue px-5 text-sm font-bold text-white hover:bg-fuerza-blue-light">
            <Link href="/unete">
              Únete ahora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <MobileMenu settings={settings} />
      </div>
    </header>
  );
}
