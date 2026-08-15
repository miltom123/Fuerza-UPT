import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="section-spacing">
      <div className="container-fuerza">
        <div className="card-fuerza mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-fuerza-red">Proximamente</p>
          <h1 className="mt-4 text-3xl font-bold text-fuerza-navy sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-fuerza-muted">{description}</p>
          <Button asChild className="mt-8 rounded-full bg-fuerza-blue text-white hover:bg-fuerza-blue-light">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
