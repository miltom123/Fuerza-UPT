"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AdminTopbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      router.replace("/administracion/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-fuerza-border bg-white/92 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuerza-blue">
            Panel administrativo
          </p>
          <p className="mt-1 truncate text-sm text-fuerza-muted">
            Bienvenido, {user?.displayName ?? "administrador"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden rounded-full border-fuerza-border sm:inline-flex">
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              Ver sitio público
            </Link>
          </Button>
          <span
            className="hidden size-10 items-center justify-center rounded-full bg-blue-50 text-fuerza-blue md:inline-flex"
            aria-hidden="true"
          >
            <UserRound className="size-5" />
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Cerrar sesión"
            className="rounded-full border-fuerza-border text-fuerza-navy hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {isLoggingOut ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            <span className="hidden md:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
