import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { PageTracker } from "@/components/analytics/page-tracker";

export const metadata: Metadata = {
  title: "Fuerza UPT | Comunidad estudiantil",
  description:
    "Liderazgo, proyectos, becas, comunidad y participacion estudiantil para transformar la UPT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased font-sans">
      <body className="min-h-full">
        <PageTracker />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
