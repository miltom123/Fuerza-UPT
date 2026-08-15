import {
  CalendarDays,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  UserPlus,
  UsersRound,
} from "lucide-react";

export const adminNavigation = {
  content: [
    { label: "Inicio", href: "/administracion", icon: LayoutDashboard },
    { label: "Legado Fuerza UPT", href: "/administracion/representacion-estudiantil", icon: Megaphone },
    { label: "Proyectos", href: "/administracion/proyectos", icon: FolderKanban },
    { label: "Eventos", href: "/administracion/eventos", icon: CalendarDays },
    { label: "Becas y oportunidades", href: "/administracion/becas-y-oportunidades", icon: GraduationCap },
    { label: "Equipo", href: "/administracion/equipo", icon: UsersRound },
    { label: "Únete", href: "/administracion/unete", icon: UserPlus },
    { label: "Contacto", href: "/administracion/contacto", icon: Mail },
  ],
  system: [
    { label: "Configuración", href: "/administracion/configuracion", icon: Settings },
  ],
};
