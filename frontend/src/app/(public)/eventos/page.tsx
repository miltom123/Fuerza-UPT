import type { Metadata } from "next";
import { EventsCatalog } from "@/components/content/events-catalog";
import { getEvents } from "@/services/event-service";

export const metadata: Metadata = {
  title: "Eventos | Fuerza UPT",
  description: "Agenda de talleres, conversatorios, campeonatos y actividades de Fuerza UPT.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return <EventsCatalog events={events.filter((event) => event.status === "PUBLISHED")} />;
}
