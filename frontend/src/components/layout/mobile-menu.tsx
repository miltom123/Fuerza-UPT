"use client";

import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigationItems } from "@/data/navigation";
import { SocialLinks } from "@/components/shared/social-links";
import { useAuth } from "@/hooks/use-auth";
import type { SiteSettings } from "@/types/admin-workflows";

export function MobileMenu({ settings }: { settings: SiteSettings }) {
  const { isAuthenticated } = useAuth();
  const adminHref = isAuthenticated ? "/administracion" : "/administracion/login";
  const adminLabel = isAuthenticated ? "Ir al panel administrativo" : "Ingresar como administrador";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Abrir menú móvil" className="xl:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[86vw] bg-white">
        <SheetHeader>
          <SheetTitle className="text-fuerza-navy">Fuerza UPT</SheetTitle>
          <SheetDescription>Menú principal de navegación</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-6">
          {navigationItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-fuerza-navy transition hover:bg-fuerza-surface hover:text-fuerza-blue focus-visible:ring-4 focus-visible:ring-fuerza-blue/20"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mx-6 mt-5 border-t border-fuerza-border pt-5">
          <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.16em] text-fuerza-muted">
            Acceso administrativo
          </p>
          <SheetClose asChild>
            <Link
              href={adminHref}
              className="flex items-center gap-3 rounded-2xl border border-fuerza-border bg-fuerza-surface px-4 py-3.5 text-sm font-bold text-fuerza-navy transition hover:border-fuerza-blue hover:bg-blue-50 hover:text-fuerza-blue focus-visible:ring-4 focus-visible:ring-fuerza-blue/20"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-fuerza-blue shadow-sm">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              {adminLabel}
            </Link>
          </SheetClose>
        </div>
        <div className="mt-auto p-6">
          <Button asChild className="w-full rounded-full bg-fuerza-blue text-white hover:bg-fuerza-blue-light">
            <Link href="/unete">Únete</Link>
          </Button>
          <SocialLinks settings={settings} className="mt-5 justify-center" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
