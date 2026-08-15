import {
  HandHeart,
  Lightbulb,
  Megaphone,
  Rocket,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface ValueItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const values: ValueItem[] = [
  {
    title: "Liderazgo que inspira",
    description: "Impulsamos estudiantes que toman acción con criterio y empatía.",
    icon: Sparkles,
  },
  {
    title: "Trabajo en equipo",
    description: "Creemos en sumar talentos para lograr resultados sostenibles.",
    icon: UsersRound,
  },
  {
    title: "Compromiso social",
    description: "Conectamos la vida universitaria con necesidades reales de la comunidad.",
    icon: HandHeart,
  },
  {
    title: "Crecimiento personal",
    description: "Abrimos espacios para aprender, liderar y descubrir nuevas habilidades.",
    icon: Rocket,
  },
  {
    title: "Impacto positivo",
    description: "Convertimos ideas en proyectos con valor para estudiantes y sociedad.",
    icon: Lightbulb,
  },
  {
    title: "Voz estudiantil que transforma",
    description: "Representamos propuestas claras para mejorar la experiencia universitaria.",
    icon: Megaphone,
  },
];
