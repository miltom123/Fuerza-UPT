import { values } from "@/data/values";
import { SectionHeading } from "@/components/shared/section-heading";

export function ValuesSection() {
  return (
    <section id="valores" className="section-spacing bg-white">
      <div className="container-fuerza">
        <SectionHeading
          align="center"
          eyebrow="Nuestros valores"
          title="Una comunidad que aprende, lidera y actua"
          description="Fuerza UPT nace para conectar talento estudiantil con oportunidades reales de impacto."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article key={value.title} className="card-fuerza p-5 hover:-translate-y-1">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-fuerza-blue/10 text-fuerza-blue">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-black text-fuerza-navy">{value.title}</h3>
                <p className="mt-3 text-sm leading-6 text-fuerza-muted">{value.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
