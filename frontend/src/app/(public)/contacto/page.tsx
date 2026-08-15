import type { Metadata } from "next";
import { ContactPageContent } from "@/components/content/contact-page";

export const metadata: Metadata = { title: "Contacto | Fuerza UPT", description: "Canales para consultas, propuestas, alianzas y soporte." };

export default function ContactPage() { return <ContactPageContent />; }
