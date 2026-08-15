"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { useAuth } from "@/hooks/use-auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname);
      router.replace(`/administracion/login?reason=expired&next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
        <div className="flex items-center gap-3 rounded-2xl border border-fuerza-border bg-white px-5 py-4 text-sm font-semibold text-fuerza-muted shadow-sm">
          <LoaderCircle className="size-5 animate-spin text-fuerza-blue" aria-hidden="true" />
          Verificando sesión administrativa...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminTopbar />
        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
