import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Acceso administrativo | Fuerza UPT",
  description: "Acceso restringido al panel de administración de Fuerza UPT.",
};

interface AdminLoginPageProps {
  searchParams: Promise<{
    next?: string;
    reason?: string;
  }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { next, reason } = await searchParams;

  return (
    <AuthCard>
      <AdminLoginForm reason={reason} nextPath={next} />
    </AuthCard>
  );
}
