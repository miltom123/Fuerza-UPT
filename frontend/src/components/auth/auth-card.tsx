import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_90px_rgba(6,27,77,0.18)] lg:grid-cols-[0.82fr_1.18fr]">
      <div className="relative hidden min-h-[650px] overflow-hidden bg-fuerza-navy p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(57,125,255,0.75),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(0,179,190,0.34),transparent_32%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-36 size-72 rounded-full border-[46px] border-white/5"
        />

        <div className="relative">
          <BrandMark inverse className="h-[90px] w-[112px]" />
        </div>

        <div className="relative max-w-sm">
          <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-200">
            Gestión institucional
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
            El contenido de Fuerza UPT, en un solo lugar.
          </h2>
          <p className="mt-5 text-base leading-7 text-blue-100/80">
            Acceso exclusivo para responsables autorizados de la plataforma.
          </p>
        </div>

        <p className="relative text-xs leading-5 text-blue-100/60">
          La actividad administrativa debe realizarse con una cuenta personal autorizada.
        </p>
      </div>

      <div className="flex min-h-[620px] flex-col p-6 sm:p-10 lg:min-h-[650px] lg:p-12">
        <Link
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-fuerza-muted transition hover:text-fuerza-blue focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-fuerza-blue/20"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al sitio público
        </Link>

        <div className="mb-7 lg:hidden">
          <BrandMark className="h-[74px] w-[96px]" />
        </div>

        <div className="my-auto">{children}</div>

        <p className="mt-9 text-center text-xs leading-5 text-fuerza-muted">
          Acceso protegido. Si necesitas una cuenta, comunícate con la coordinación de Fuerza UPT.
        </p>
      </div>
    </section>
  );
}
