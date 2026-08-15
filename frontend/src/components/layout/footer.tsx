import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { SocialLinks } from "@/components/shared/social-links";
import { navigationItems } from "@/data/navigation";
import type { SiteSettings } from "@/types/admin-workflows";

export function Footer({ settings }: { settings: SiteSettings }) {
  const whatsappHref = getWhatsappHref(settings.whatsapp);

  return (
    <footer className="bg-fuerza-navy-dark text-white">
      <div className="container-fuerza grid gap-8 py-9 md:grid-cols-[0.9fr_1fr_1.3fr_0.9fr]">
        <div>
          <Link href="/" className="inline-flex"><BrandMark inverse /></Link>
          <p className="mt-4 max-w-[230px] text-xs leading-5 text-white/70">
            {settings.mainMessage || "No somos espectadores del cambio, somos quienes lo lideran."}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white">Enlaces rápidos</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-white/72 transition hover:text-white">{item.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white">Contáctanos</h2>
          <div className="mt-4 space-y-3 text-xs text-white/72">
            {settings.address ? (
              <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{settings.address}</p>
            ) : null}
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="flex gap-2 transition hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0" />{settings.email}
              </a>
            ) : null}
            {settings.whatsapp && whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex gap-2 transition hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0" />{settings.whatsapp}
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white">Síguenos</h2>
          <SocialLinks settings={settings} className="mt-4 [&_a]:border-white/20 [&_a]:bg-transparent [&_a]:text-white" />
          <p className="mt-4 text-xs leading-5 text-white/65">
            {settings.contactText || "Sé parte de nuestra comunidad y entérate de todo lo que hacemos."}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[10px] text-white/55">
        © 2026 Fuerza UPT. Todos los derechos reservados.
      </div>
    </footer>
  );
}

function getWhatsappHref(value?: string): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
