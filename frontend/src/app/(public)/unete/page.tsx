import type { Metadata } from "next";
import { JoinPageContent } from "@/components/content/join-page";

export const metadata: Metadata = { title: "Únete | Fuerza UPT", description: "Conoce cómo participar en Fuerza UPT." };

export default function JoinPage() { return <JoinPageContent />; }
