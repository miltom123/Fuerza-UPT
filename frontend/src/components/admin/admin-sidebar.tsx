"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { adminNavigation } from "@/config/admin-navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const renderNavGroup = (title: string, items: typeof adminNavigation.content) => (
    <div className="mb-6">
      <h3 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-blue-100/50">
        {title}
      </h3>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/administracion" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-fuerza-blue text-white shadow-[0_12px_24px_rgba(21,94,239,0.24)]" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="border-b border-white/10 bg-fuerza-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-22 items-center justify-between border-b border-white/10 px-5 lg:h-24 lg:px-7">
          <Link href="/administracion" aria-label="Resumen administrativo">
            <BrandMark inverse className="h-[70px] w-[90px]" />
          </Link>
          <span className="rounded-full border border-blue-300/25 bg-blue-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
            Admin
          </span>
        </div>
        <nav aria-label="Navegacion administrativa" className="flex-1 overflow-y-auto px-4 py-6">
          {renderNavGroup("Contenido", adminNavigation.content)}
          {renderNavGroup("Sistema", adminNavigation.system)}
          <div className="px-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100/80 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </nav>
        <div className="hidden border-t border-white/10 p-6 text-xs leading-5 text-blue-100/55 lg:block">
          Gestion interna de Fuerza UPT
        </div>
      </div>
    </aside>
  );
}
