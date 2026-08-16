import type { Metadata } from "next";
import { RepresentationHub } from "@/components/representation/representation-hub";
import { getRepresentationItems } from "@/services/representation-service";
import { getPublicStories } from "@/services/story-service";

export const metadata: Metadata = {
  title: "Legado Fuerza UPT | Fuerza UPT",
  description: "Gestiones, propuestas, acuerdos y seguimientos del Legado Fuerza UPT.",
};

export default async function StudentRepresentationPage() {
  const [items, stories] = await Promise.all([
    getRepresentationItems(),
    getPublicStories(),
  ]);

  return <RepresentationHub items={items} stories={stories} />;
}
