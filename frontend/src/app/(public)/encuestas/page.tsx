import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarClock, MessageSquareText } from "lucide-react";
import { getActivePolls } from "@/services/poll-service";

export const metadata: Metadata = {
  title: "Encuestas | Fuerza UPT",
  description: "Consultas informativas abiertas para la comunidad estudiantil de la UPT.",
};

export default async function PollsPage() {
  const polls = await getActivePolls();

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top_right,rgba(21,94,239,0.13),transparent_34%),linear-gradient(180deg,#f7faff_0%,#ffffff_55%)]">
      <section className="container-fuerza py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuerza-blue">Tu opinión cuenta</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-fuerza-navy sm:text-5xl">Encuestas abiertas</h1>
          <p className="mt-5 text-base leading-7 text-fuerza-muted sm:text-lg">
            Participa en consultas breves que nos ayudan a priorizar iniciativas y representar mejor las necesidades estudiantiles.
          </p>
        </div>

        {polls.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {polls.map((poll) => (
              <article key={poll.id} className="group relative overflow-hidden rounded-[2rem] border border-fuerza-border bg-white p-7 shadow-[0_18px_50px_rgba(6,27,77,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,27,77,0.12)]">
                <div className="absolute -right-14 -top-14 size-36 rounded-full bg-blue-50 transition group-hover:scale-125" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-fuerza-blue">
                      <MessageSquareText className="size-3.5" />Consulta abierta
                    </span>
                    {poll.featured ? <span className="text-xs font-bold text-amber-700">Destacada</span> : null}
                  </div>
                  <h2 className="mt-6 text-2xl font-bold leading-tight text-fuerza-navy">{poll.title}</h2>
                  {poll.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-fuerza-muted">{poll.description}</p> : null}
                  {poll.endAt ? (
                    <p className="mt-5 flex items-center gap-2 text-xs font-medium text-fuerza-muted">
                      <CalendarClock className="size-4 text-fuerza-blue" />
                      Disponible hasta el {new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(new Date(poll.endAt))}
                    </p>
                  ) : null}
                  <Link href={`/encuestas/${poll.slug}`} className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-fuerza-blue px-5 text-sm font-bold text-white transition hover:bg-fuerza-blue-light focus-visible:ring-4 focus-visible:ring-fuerza-blue/20">
                    Participar <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-blue-200 bg-white/80 p-10 text-center sm:p-16">
            <BarChart3 className="mx-auto size-10 text-blue-300" />
            <h2 className="mt-4 text-xl font-bold text-fuerza-navy">No hay encuestas abiertas por ahora</h2>
            <p className="mt-2 text-sm text-fuerza-muted">Vuelve pronto para participar en nuevas consultas.</p>
          </div>
        )}
      </section>
    </div>
  );
}
