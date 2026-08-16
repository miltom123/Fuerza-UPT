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

import { motion } from "motion/react";

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const adminHref = isAuthenticated ? "/administracion" : "/administracion/login";
  const adminLabel = isAuthenticated ? "Panel administrativo" : "Administración";

  return (
    <header className="sticky top-0 z-40 border-b border-fuerza-border/80 bg-white/95 backdrop-blur-md transition-shadow duration-300">
      <div className="container-fuerza flex h-[84px] items-center justify-between gap-3">
        <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-[1.02]" aria-label="Fuerza UPT inicio">
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
                className={`relative inline-flex h-full items-center px-3.5 text-[13px] font-bold transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-fuerza-blue/20 ${
                  isActive
                    ? "text-fuerza-blue"
                    : "text-fuerza-navy hover:text-fuerza-blue"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-fuerza-blue rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
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
            className="rounded-full border-fuerza-border bg-white text-fuerza-navy transition-all duration-200 hover:border-fuerza-blue hover:bg-blue-50 hover:text-fuerza-blue hover:scale-105 active:scale-95 2xl:h-11 2xl:w-auto 2xl:px-4"
          >
            <Link href={adminHref} aria-label={adminLabel} title={adminLabel}>
              <ShieldCheck className="size-4" />
              <span className="hidden 2xl:inline">{adminLabel}</span>
            </Link>
          </Button>
          <Button asChild className="h-11 rounded-full bg-fuerza-blue px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-fuerza-blue-light hover:shadow-md hover:scale-[1.03] active:scale-[0.98]">
            <Link href="/unete">
              Únete ahora
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <MobileMenu settings={settings} />
      </div>
    </header>
  );
}
