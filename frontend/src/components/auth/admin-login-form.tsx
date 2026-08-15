"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { AuthServiceError } from "@/services/auth-service";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/validations/auth";

interface AdminLoginFormProps {
  reason?: string;
  nextPath?: string;
}

function getSafeNextPath(nextPath?: string) {
  return nextPath?.startsWith("/administracion") && !nextPath.startsWith("//")
    ? nextPath
    : "/administracion";
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof AuthServiceError)) {
    return "No fue posible iniciar sesión. Inténtalo nuevamente.";
  }

  if (["invalid_credentials", "unauthorized"].includes(error.kind)) {
    return "Correo o contraseña incorrectos.";
  }

  if (error.kind === "forbidden") {
    return "Esta cuenta no tiene acceso al panel administrativo.";
  }

  if (error.kind === "connection") {
    return "No se pudo conectar con el servidor. Verifica que el servicio esté disponible.";
  }

  return "No fue posible iniciar sesión. Inténtalo nuevamente.";
}

export function AdminLoginForm({ reason, nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getSafeNextPath(nextPath));
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  async function onSubmit(input: AdminLoginInput) {
    setSubmitError(null);

    try {
      await login(input);
      router.replace(getSafeNextPath(nextPath));
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  const sessionNotice =
    reason === "expired"
      ? "Tu sesión venció. Ingresa nuevamente para continuar."
      : reason === "forbidden"
        ? "Tu cuenta no tiene permisos para acceder a esta sección."
        : null;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-fuerza-blue">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Acceso restringido
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fuerza-navy sm:text-4xl">
          Ingresar como administrador
        </h1>
        <p className="mt-3 text-base leading-7 text-fuerza-muted">
          Utiliza las credenciales asignadas por la organización.
        </p>
      </div>

      {sessionNotice ? (
        <div
          role="status"
          className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>{sessionNotice}</span>
        </div>
      ) : null}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-fuerza-navy">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-fuerza-muted"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nombre@fuerzaupt.pe"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-13 rounded-xl border-fuerza-border bg-white pl-12 text-base shadow-sm focus-visible:border-fuerza-blue"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p id="email-error" role="alert" className="mt-2 text-sm font-medium text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-fuerza-navy">
            Contraseña
          </label>
          <PasswordField
            id="password"
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {submitError ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-13 w-full rounded-xl bg-fuerza-blue text-base font-bold text-white shadow-[0_14px_28px_rgba(21,94,239,0.24)] hover:bg-fuerza-blue-light"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              Verificando acceso...
            </>
          ) : (
            "Ingresar al panel"
          )}
        </Button>
      </form>
    </div>
  );
}
