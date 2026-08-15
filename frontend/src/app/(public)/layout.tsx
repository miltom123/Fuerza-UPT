import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getPublicSettings } from "@/services/settings-service";
import type { SiteSettings } from "@/types/admin-workflows";

const fallbackSettings: SiteSettings = { updatedAt: "", version: 0 };

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings().catch(() => fallbackSettings);

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
