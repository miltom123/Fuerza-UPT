import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedHero } from "./animated-hero";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)]">
      <div className="container-fuerza grid min-h-[calc(100svh-80px)] items-center gap-12 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:py-18">
        <AnimatedHero>
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-fuerza-border bg-white px-4 py-2 text-sm font-bold text-fuerza-blue shadow-sm">
              Comunidad estudiantil UPT
            </p>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-fuerza-navy sm:text-6xl lg:text-7xl">
              Somos UPT,
              <span className="block text-fuerza-blue">somos FUERZA</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-fuerza-muted">
              Liderazgo, proyectos, becas, comunidad y participacion estudiantil para transformar nuestra universidad y nuestra sociedad.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-fuerza-blue px-6 text-white hover:bg-fuerza-blue-light">
                <Link href="/unete">
                  Unete a la comunidad
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-fuerza-border px-6 text-fuerza-navy">
                <Link href="#valores">
                  <PlayCircle className="size-4" />
                  Conoce mas
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedHero>

        <div className="relative">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-fuerza-red/12" />
          <div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-full bg-fuerza-blue/12" />
          <div className="relative overflow-hidden rounded-[2rem] border-[10px] border-white bg-fuerza-surface shadow-[0_28px_80px_rgba(6,27,77,0.18)]">
            <Image
              src="/images/hero-equipo.png"
              alt="Grupo de estudiantes de Fuerza UPT colaborando en el campus"
              width={1792}
              height={1024}
              priority
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-[1.08/1]"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-3xl bg-fuerza-navy/88 p-5 text-white backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">Fuerza UPT</p>
              <p className="mt-1 text-2xl font-black">Juntos hacemos la diferencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
