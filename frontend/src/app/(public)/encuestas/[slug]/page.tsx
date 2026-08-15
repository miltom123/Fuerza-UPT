import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MessageSquareText } from "lucide-react";
import { PublicPollForm } from "@/components/polls/public-poll-form";
import { ApiClientError } from "@/services/api-client";
import { getPoll } from "@/services/poll-service";

interface PollPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { poll } = await getPoll(slug);
    return { title: `${poll.title} | Fuerza UPT`, description: poll.description };
  } catch {
    return { title: "Encuesta | Fuerza UPT" };
  }
}

export default async function PollPage({ params }: PollPageProps) {
  const { slug } = await params;
  let detail;
  try {
    detail = await getPoll(slug);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(21,94,239,0.15),transparent_30%),linear-gradient(180deg,#f5f8ff_0%,#ffffff_48%)]">
      <section className="container-fuerza max-w-4xl py-10 sm:py-16">
        <Link href="/encuestas" className="inline-flex items-center gap-2 text-sm font-bold text-fuerza-blue hover:underline">
          <ArrowLeft className="size-4" />Volver a encuestas
        </Link>
        <header className="mt-7 overflow-hidden rounded-[2rem] bg-fuerza-navy p-7 text-white shadow-[0_22px_70px_rgba(6,27,77,0.2)] sm:p-10">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
            <MessageSquareText className="size-4" />Consulta estudiantil informativa
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{detail.poll.title}</h1>
          {detail.poll.description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">{detail.poll.description}</p> : null}
          {detail.poll.endAt ? (
            <p className="mt-6 flex items-center gap-2 text-xs font-medium text-blue-100/75">
              <CalendarClock className="size-4" />Cierra el {new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(new Date(detail.poll.endAt))}
            </p>
          ) : null}
        </header>
        <div className="mt-7"><PublicPollForm detail={detail} /></div>
      </section>
    </div>
  );
}
