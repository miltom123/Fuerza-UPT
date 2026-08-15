import { Handshake } from "lucide-react";
import { alliances } from "@/data/alliances";
import { SectionHeading } from "@/components/shared/section-heading";

export function AlliancesSection() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-fuerza grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow="Alianzas estrategicas"
          title="Conectamos estudiantes con oportunidades"
          description="Estas alianzas son datos temporales para representar la estructura futura de integracion institucional."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {alliances.map((alliance) => (
            <article key={alliance.name} className="card-fuerza p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-fuerza-blue/10 text-fuerza-blue">
                <Handshake className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-fuerza-navy">{alliance.name}</h3>
              <p className="mt-3 text-sm leading-6 text-fuerza-muted">{alliance.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
