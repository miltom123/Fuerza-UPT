import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ProjectDetailView } from "@/components/proyectos/ProjectDetailView";
import { getEvents } from "@/services/event-service";
import { getProjectById } from "@/services/project-service";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return {
      title: "Proyecto no encontrado | Fuerza UPT",
    };
  }

  return {
    title: `${project.title} | Fuerza UPT`,
    description: project.summary || project.description || `Detalles del proyecto ${project.title}`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const [project, events] = await Promise.all([getProjectById(id), getEvents()]);

  if (!project) {
    return (
      <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "40px 28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
            Proyecto no encontrado
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}>
            El proyecto que buscas no existe, ha sido deshabilitado o la dirección introducida es incorrecta.
          </p>
          <Link
            href="/proyectos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#155eef",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              padding: "10px 20px",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} /> Volver a proyectos
          </Link>
        </div>
      </main>
    );
  }

  return <ProjectDetailView project={project} events={events} />;
}
