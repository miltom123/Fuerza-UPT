import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Panel administrativo | Fuerza UPT",
  description: "Gestión interna de los contenidos de Fuerza UPT.",
  robots: { index: false, follow: false },
};

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
