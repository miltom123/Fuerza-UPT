"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  Play,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { RepresentationItem } from "@/types";
import type { StoryPublicResponse } from "@/types/story";
import {
  AnimatedCounter,
  FadeIn,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import { motion, AnimatePresence } from "motion/react";
import { RepresentationDetailModal } from "./RepresentationDetailModal";
import styles from "./representation-hub.module.css";

interface RepresentationHubProps {
  items?: RepresentationItem[];
  stories?: StoryPublicResponse[];
}

const DEFAULT_ITEMS: RepresentationItem[] = [
  {
    id: "legado-1",
    title: "Ampliación del horario de biblioteca universitaria",
    slug: "ampliacion-horario-biblioteca",
    summary: "Se gestionó y aprobó la extensión del horario hasta las 9:00 p.m. de lunes a viernes y 5:00 p.m. los sábados.",
    status: "PUBLISHED",
    featured: true,
    displayOrder: 1,
    kind: "LOGRO",
    progress: "LOGRADO",
    progressPercentage: 100,
    impactLevel: "ALTO",
    beneficiaryArea: "Comunidad estudiantil UPT",
    identifiedProblem: "Los estudiantes de ciclos superiores y turnos de tarde no contaban con espacios de estudio abiertos después de las 6:00 p.m. para realizar trabajos grupales e investigaciones.",
    proposalOrManagement: "Presentación de informe técnico al Consejo Universitario solicitando la ampliación de turnos del personal y refuerzo de seguridad en el pabellón de biblioteca.",
    result: "Aprobación unánime en Consejo Universitario. Implementación exitosa con más de 1,200 visitas semanales en el nuevo turno extendido.",
    actionsTaken: [
      "Levantamiento de encuestas a 850 estudiantes sobre demanda horaria",
      "Reunión de coordinación con la Dirección de Biblioteca y Bienestar",
      "Emisión de resolución rectoral con nuevo cronograma de atención",
    ],
    evidenceUrls: ["https://fuerzaupt.edu.pe/docs/resolucion-horario-biblioteca.pdf"],
    updatedAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "legado-2",
    title: "Transporte nocturno seguro para campus central",
    slug: "transporte-nocturno-seguro",
    summary: "Solicitud de rutas y horarios extendidos de transporte para estudiantes de turnos nocturnos.",
    status: "PUBLISHED",
    featured: true,
    displayOrder: 2,
    kind: "GESTION",
    progress: "EN_SEGUIMIENTO",
    progressPercentage: 70,
    impactLevel: "ALTO",
    beneficiaryArea: "Estudiantes de carreras nocturnas",
    identifiedProblem: "Escasez de transporte público seguro a partir de las 9:30 p.m. en las salidas del campus hacia los conos de la ciudad.",
    proposalOrManagement: "Gestión de convenio con empresas de transporte autorizadas y solicitud de resguardo municipal en paraderos principales.",
    result: "En fase final de firma de convenio con la Municipalidad y dos líneas de transporte prioritarias.",
    actionsTaken: [
      "Mapeo de rutas con mayor afluencia de estudiantes",
      "Mesa de trabajo con la Subgerencia de Transportes de Tacna",
      "Piloto de paradero seguro en puerta principal",
    ],
    evidenceUrls: [],
    updatedAt: "2026-05-28T10:00:00Z",
  },
  {
    id: "legado-3",
    title: "Más puntos de recarga eléctrica y conectividad",
    slug: "puntos-recarga-electrica",
    summary: "Instalación de estaciones de recarga en biblioteca y edificio de laboratorios.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 3,
    kind: "PROPUESTA",
    progress: "EN_EVALUACION",
    progressPercentage: 45,
    impactLevel: "MEDIO",
    beneficiaryArea: "Edificios A, B y Biblioteca",
    identifiedProblem: "Alta saturación de tomacorrientes en áreas comunes y necesidad de estaciones de carga rápida para laptops y tablets.",
    proposalOrManagement: "Expediente de equipamiento eléctrico modular en bancas y mesas de estudio exteriores.",
    result: "Expediente técnico derivado al área de Infraestructura para cotización.",
    actionsTaken: [
      "Inspección de carga eléctrica con la oficina de Mantenimiento",
      "Cotización de torres de energía protegidas contra sobretensión",
    ],
    evidenceUrls: [],
    updatedAt: "2026-05-17T10:00:00Z",
  },
  {
    id: "legado-4",
    title: "Mejoras en conectividad Wi-Fi institucional",
    slug: "mejoras-conectividad-wifi",
    summary: "Ampliación de cobertura y estabilidad en salones y zonas comunes de los campus.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 4,
    kind: "GESTION",
    progress: "PRESENTADO",
    progressPercentage: 30,
    impactLevel: "MEDIO",
    beneficiaryArea: "Todos los pabellones",
    identifiedProblem: "Zonas con baja señal de red Wi-Fi en pabellones periféricos.",
    proposalOrManagement: "Informe de puntos ciegos presentado a la Oficina de Tecnologías de la Información (OTI).",
    result: "OTI inició la prueba de 8 nuevos Access Points en pabellón D.",
    actionsTaken: [
      "Pruebas de velocidad en 15 puntos del campus",
      "Reunión con jefatura de OTI",
    ],
    evidenceUrls: [],
    updatedAt: "2026-05-09T10:00:00Z",
  },
  {
    id: "legado-5",
    title: "Becas de apoyo en conectividad y materiales",
    slug: "becas-apoyo-conectividad",
    summary: "10 becas y subsidios aprobados para estudiantes con dificultades de acceso a internet.",
    status: "PUBLISHED",
    featured: true,
    displayOrder: 5,
    kind: "LOGRO",
    progress: "LOGRADO",
    progressPercentage: 100,
    impactLevel: "ALTO",
    beneficiaryArea: "Estudiantes en vulnerabilidad socioeconómica",
    identifiedProblem: "Estudiantes en condición de vulnerabilidad con riesgo de deserción por falta de conectividad.",
    proposalOrManagement: "Creación de fondo solidario de conectividad canalizado por Bienestar Universitario.",
    result: "Entrega efectiva de módems y chips con internet ilimitado a 10 beneficiarios calificados.",
    actionsTaken: [
      "Filtro socioeconómico con trabajadoras sociales",
      "Aprobación presupuestal por Vicerrectorado Académico",
    ],
    evidenceUrls: ["https://fuerzaupt.edu.pe/docs/acta-becas-conectividad.pdf"],
    updatedAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "legado-6",
    title: "Mejora en iluminación y seguridad del campus",
    slug: "mejora-iluminacion-campus",
    summary: "Instalación de 25 luminarias LED en senderos peatonales y zonas de alto tránsito.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 6,
    kind: "LOGRO",
    progress: "LOGRADO",
    progressPercentage: 100,
    impactLevel: "MEDIO",
    beneficiaryArea: "Senderos peatonales y estacionamientos",
    identifiedProblem: "Zonas oscuras en los accesos peatonales entre facultades durante la noche.",
    proposalOrManagement: "Plan de reforzamiento lumínico con luminarias LED de bajo consumo.",
    result: "25 luminarias instaladas y funcionando al 100%.",
    actionsTaken: [
      "Recorrido nocturno de inspección con seguridad interna",
      "Instalación por cuadrilla de mantenimiento",
    ],
    evidenceUrls: [],
    updatedAt: "2026-04-26T10:00:00Z",
  },
  {
    id: "legado-7",
    title: "Acta de sesión 12: Acuerdos de Consejo Universitario",
    slug: "acta-sesion-12",
    summary: "Acta oficial con los acuerdos tomados sobre calendario académico y matrículas extraordinarias.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 7,
    kind: "ACUERDO",
    progress: "CERRADO",
    progressPercentage: 100,
    impactLevel: "ALTO",
    beneficiaryArea: "Comunidad Universitaria UPT",
    identifiedProblem: "Claridad en las fechas límite de convalidaciones y rectificación de matrículas.",
    proposalOrManagement: "Publicación abierta y transparente de los acuerdos para todos los delegados.",
    result: "Acta formalizada y publicada para consulta libre de estudiantes.",
    actionsTaken: ["Suscripción de acta por representantes estudiantiles"],
    evidenceUrls: ["https://fuerzaupt.edu.pe/docs/acta-sesion-12.pdf"],
    updatedAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "legado-8",
    title: "Acuerdo 08-2025: Fraccionamiento de pensiones",
    slug: "acuerdo-08-2025-fraccionamiento",
    summary: "Reglamento especial para facilidades de pago sin mora para estudiantes.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 8,
    kind: "ACUERDO",
    progress: "CERRADO",
    progressPercentage: 100,
    impactLevel: "ALTO",
    beneficiaryArea: "Todas las facultades",
    identifiedProblem: "Recargos por mora en situaciones de emergencia económica familiar.",
    proposalOrManagement: "Gestión de fraccionamiento extraordinario en Tesorería.",
    result: "Aprobado para el semestre 2026-I y 2026-II.",
    actionsTaken: ["Presentación de proyecto de resolución"],
    evidenceUrls: ["https://fuerzaupt.edu.pe/docs/acuerdo-08-2025.pdf"],
    updatedAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "legado-9",
    title: "Pronunciamiento 05: Libertad y secreto del voto estudiantil",
    slug: "pronunciamiento-05-voto-estudiantil",
    summary: "Postura oficial de Fuerza UPT garantizando elecciones transparentes y democráticas.",
    status: "PUBLISHED",
    featured: false,
    displayOrder: 9,
    kind: "PRONUNCIAMIENTO",
    progress: "CERRADO",
    progressPercentage: 100,
    impactLevel: "ALTO",
    beneficiaryArea: "Comunidad Universitaria UPT",
    identifiedProblem: "Garantías en los procesos electorales y fiscalización independiente.",
    proposalOrManagement: "Comunicado oficial respaldado por los centros federados.",
    result: "Compromiso firmado ante el Comité Electoral Universitario.",
    actionsTaken: ["Publicación y difusión en redes oficiales"],
    evidenceUrls: ["https://fuerzaupt.edu.pe/docs/pronunciamiento-05.pdf"],
    updatedAt: "2026-02-10T10:00:00Z",
  },
];

export function RepresentationHub({ items, stories }: RepresentationHubProps) {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [activeTestimonialPage, setActiveTestimonialPage] = useState(0);

  // Modal State for Expanded Full Detail and Catalog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<RepresentationItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<"ALL" | "SEGUIMIENTO" | "LOGROS" | "DOCUMENTOS">("ALL");

  // All unified items
  const allItems = useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }
    return DEFAULT_ITEMS;
  }, [items]);

  // Classified lists for the 3 main columns
  const trackingItems = useMemo(() => {
    return allItems
      .filter(
        (i) =>
          i.progress === "EN_SEGUIMIENTO" ||
          i.progress === "EN_EVALUACION" ||
          i.progress === "PRESENTADO" ||
          i.kind === "GESTION" ||
          i.kind === "PROPUESTA"
      )
      .slice(0, 3);
  }, [allItems]);

  const logroItems = useMemo(() => {
    return allItems
      .filter(
        (i) =>
          i.kind === "LOGRO" ||
          i.progress === "LOGRADO" ||
          i.progress === "APROBADO" ||
          i.progress === "CERRADO"
      )
      .slice(0, 3);
  }, [allItems]);

  const documentItems = useMemo(() => {
    return allItems
      .filter(
        (i) =>
          i.kind === "ACUERDO" ||
          i.kind === "PRONUNCIAMIENTO" ||
          i.kind === "ASAMBLEA" ||
          (i.evidenceUrls && i.evidenceUrls.length > 0)
      )
      .slice(0, 3);
  }, [allItems]);

  // Open modal handler
  const openExpandedView = (
    tab: "ALL" | "SEGUIMIENTO" | "LOGROS" | "DOCUMENTOS",
    item?: RepresentationItem
  ) => {
    setModalInitialTab(tab);
    setSelectedItemForModal(item || null);
    setIsModalOpen(true);
  };

  const defaultQuotes = [
    {
      text: "Fuerza UPT escuchó nuestra necesidad de mejores espacios de estudio y hoy es una realidad para todos.",
      author: "Diego Alvarado",
      role: "Estudiante de Ingeniería Civil",
    },
    {
      text: "Gracias a la gestión constante, el diálogo con las autoridades universitarias generó cambios reales en nuestro campus.",
      author: "Camila Mendoza",
      role: "Estudiante de Medicina Humana",
    },
    {
      text: "Sentir que las propuestas de los alumnos son escuchadas y ejecutadas nos da confianza en nuestra representación.",
      author: "Lucas Paredes",
      role: "Estudiante de Derecho",
    },
  ];

  // Dynamic Hero quotes
  const quotes = useMemo(() => {
    if (stories && stories.length > 0) {
      const heroStories = stories.filter((s) => s.featuredInHero);
      if (heroStories.length > 0) {
        return heroStories.map((s) => ({
          text: s.quote,
          author: s.authorName,
          role: s.authorCareer,
        }));
      }
      return stories.map((s) => ({
        text: s.quote,
        author: s.authorName,
        role: s.authorCareer,
      }));
    }
    return [
      {
        text: "La transparencia y la representación estudiantil activa transforman la universidad.",
        author: "Fuerza UPT",
        role: "Comunidad Estudiantil",
      },
    ];
  }, [stories]);

  // Display Testimonials
  const displayStories = useMemo(() => {
    if (stories && stories.length > 0) {
      return stories.map((s) => ({
        id: s.id,
        category: s.category || "Experiencia",
        authorName: s.authorName,
        authorCareer: s.authorCareer,
        imageUrl: s.imageUrl || "/images/valeria-sanchez.png",
        quote: s.quote,
      }));
    }
    return [];
  }, [stories]);

  // Automatic rotation every 10 seconds
  useEffect(() => {
    if (!quotes || quotes.length <= 1) return;
    const interval = setInterval(() => {
      setActiveQuoteIndex((prev) => {
        // pick random other quote or next in cycle
        let next = (prev + 1) % quotes.length;
        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [quotes]);

  // Automatic rotation for testimonial cards every 10 seconds
  useEffect(() => {
    if (!displayStories || displayStories.length <= 3) return;
    const interval = setInterval(() => {
      setActiveTestimonialPage((prev) => {
        const totalPages = Math.ceil(displayStories.length / 3);
        return (prev + 1) % totalPages;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [displayStories]);

  const safeQuoteIndex = activeQuoteIndex % (quotes.length || 1);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ==========================================
            1. HERO SECTION
           ========================================== */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <FadeIn delay={0.05} direction="up" distance={12}>
              <span className={styles.eyebrow}>LEGADO FUERZA UPT</span>
            </FadeIn>
            <FadeIn delay={0.12} direction="up" distance={16}>
              <h1 className={styles.heroTitle}>
                <span className={styles.titleDark}>HISTORIAS</span><br />
                <span className={styles.titleDark}>QUE INSPIRAN,</span><br />
                <span className={styles.titleRed}>ACCIONES QUE</span><br />
                <span className={styles.titleGreen}>TRANSFORMAN</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2} direction="up" distance={16}>
              <p className={styles.lead}>
                Somos una comunidad que impulsa el cambio a través del seguimiento, la transparencia y la participación estudiantil.
              </p>
            </FadeIn>
            <FadeIn delay={0.25} direction="up" distance={16}>
              <div className={styles.heroActions}>
                <button
                  type="button"
                  onClick={() => openExpandedView("ALL")}
                  className={`${styles.btnPrimary} transition-all duration-200 hover:scale-105 active:scale-95`}
                >
                  <Activity size={18} />
                  VER GESTIONES ACTIVAS
                </button>
                <Link href="/contacto" className={`${styles.btnOutline} transition-all duration-200 hover:scale-105 active:scale-95`}>
                  <FileText size={18} />
                  ENVIAR PROPUESTA
                </Link>
              </div>
            </FadeIn>
          </div>

          <div className={styles.heroRight}>
            {/* Decorative background grid and waves */}
            <div className={styles.dotGrid} />
            <div className={styles.waveLines} />

            <FadeIn delay={0.15} direction="none" className={styles.heroImageWrapper}>
              <div className={styles.heroRedCurve} />
              <Image
                src="/images/hero-student.png"
                alt="Estudiante universitario de Fuerza UPT"
                fill
                priority
                className={`${styles.heroImage} transition-transform duration-700 hover:scale-105`}
                sizes="(max-width: 1024px) 100vw, 550px"
              />
            </FadeIn>

            <div className={`${styles.quoteCard} transition-all duration-300 hover:shadow-xl`}>
              <span className={styles.quoteIcon}>“</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeQuoteIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <p className={styles.quoteText}>{quotes[safeQuoteIndex]?.text || defaultQuotes[0].text}</p>
                  <div className={styles.quoteMeta}>
                    <span className={styles.quoteAuthor}>— {quotes[safeQuoteIndex]?.author || defaultQuotes[0].author}</span>
                    <span className={styles.quoteRole}>{quotes[safeQuoteIndex]?.role || defaultQuotes[0].role}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className={styles.quoteDots}>
                {quotes.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${idx === safeQuoteIndex ? styles.dotActive : ""} transition-all duration-300`}
                    onClick={() => setActiveQuoteIndex(idx)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            2. VOCES QUE CONSTRUYEN UNIVERSIDAD
           ========================================== */}
        <section className={styles.testimonialsSection}>
          <Reveal delay={0.05} distance={16}>
            <div className={styles.sectionHeaderCenter}>
              <h2>Voces que construyen universidad</h2>
              <div className={styles.titleDivider}>
                <span className={styles.dividerRed} />
                <span className={styles.dividerGreen} />
              </div>
              <p>Conoce las experiencias de estudiantes que han sido parte del cambio.</p>
            </div>
          </Reveal>

          <div className={styles.carouselWrapper}>
            {displayStories.length > 3 && (
              <button
                className={`${styles.carouselArrow} ${styles.arrowLeft} transition-transform duration-200 hover:scale-110 active:scale-95`}
                aria-label="Testimonio anterior"
                onClick={() =>
                  setActiveTestimonialPage((prev) =>
                    prev > 0 ? prev - 1 : Math.max(0, Math.ceil(displayStories.length / 3) - 1)
                  )
                }
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {displayStories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white/80 rounded-3xl border border-slate-200 text-center w-full max-w-lg mx-auto shadow-sm">
                <Users className="size-8 text-fuerza-blue mb-2" />
                <p className="text-sm font-bold text-slate-800">Pronto más testimonios de la comunidad</p>
                <p className="text-xs text-slate-500 mt-1">Conoce las experiencias y aportes de estudiantes de todas las facultades.</p>
                <Link href="/contacto" className="mt-4 px-4 py-2 bg-fuerza-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-xs">
                  Participar o enviar propuesta
                </Link>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonialPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={styles.testimonialsGrid}
                >
                  {displayStories
                    .slice(activeTestimonialPage * 3, activeTestimonialPage * 3 + 3)
                    .map((t, idx) => {
                      const isExp = t.category === "Experiencia" || t.category === "Beca";
                      const isLid = t.category === "Liderazgo" || t.category === "Proyecto";

                      const iconClass = isExp ? styles.iconHeart : isLid ? styles.iconStar : styles.iconUsers;
                      const badgeClass = isExp ? styles.badgePillRed : isLid ? styles.badgePillBlue : styles.badgePillGreen;
                      const linkClass = isExp ? styles.linkRed : isLid ? styles.linkBlue : styles.linkGreen;

                      return (
                        <article
                          key={t.id || idx}
                          className={`${styles.testimonialCard} group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                        >
                          <div className={`${styles.cardTopIcon} ${iconClass} transition-transform duration-200 group-hover:scale-110`}>
                            {isExp ? (
                              <Heart className="size-5 fill-white stroke-none" />
                            ) : isLid ? (
                              <Star className="size-5 fill-white stroke-none" />
                            ) : (
                              <Users className="size-5" />
                            )}
                          </div>

                          <div className={styles.cardTopRow}>
                            <span className={badgeClass}>{t.category}</span>
                          </div>

                          <div className={styles.authorRow}>
                            <div className="relative size-12 overflow-hidden rounded-full border-2 border-white shadow-xs bg-slate-100 shrink-0 transition-transform duration-300 group-hover:scale-105">
                              {t.imageUrl ? (
                                <img
                                  src={t.imageUrl}
                                  alt={t.authorName}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 font-bold">
                                  {t.authorName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className={styles.authorInfo}>
                              <span className={styles.authorName}>{t.authorName}</span>
                              <span className={styles.authorStudy}>{t.authorCareer}</span>
                            </div>
                          </div>

                          <p className={styles.testimonialText}>"{t.quote}"</p>

                          <div className="pt-2 border-t border-slate-100/60">
                            <Link href="/testimonios" className={`${styles.testimonialLink} ${linkClass} group/link`}>
                              <span>Ver detalle completo</span>
                              <ArrowRight size={14} className="transition-transform duration-200 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                </motion.div>
              </AnimatePresence>
            )}

            {displayStories.length > 3 && (
              <button
                className={`${styles.carouselArrow} ${styles.arrowRight} transition-transform duration-200 hover:scale-110 active:scale-95`}
                aria-label="Testimonio siguiente"
                onClick={() =>
                  setActiveTestimonialPage((prev) =>
                    (prev + 1) * 3 < displayStories.length ? prev + 1 : 0
                  )
                }
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          <div className={styles.centerLinkWrap}>
            <Link href="/testimonios" className={`${styles.btnRoundedOutline} transition-all duration-200 hover:scale-105 active:scale-95`}>
              VER TODOS LOS TESTIMONIOS
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ==========================================
            3. NUESTRO IMPACTO EN CIFRAS
           ========================================== */}
        <section className={styles.statsSection} id="seguimiento">
          <Reveal delay={0.05} distance={16}>
            <div className={styles.sectionHeaderCenter}>
              <h2>Nuestro impacto en cifras</h2>
              <p>Resultados que reflejan nuestro compromiso con la comunidad estudiantil.</p>
            </div>
          </Reveal>

          {/* 4 Cards de Estadísticas con AnimatedCounter */}
          <StaggerContainer className={styles.statsGrid} staggerDelay={0.07}>
            <StaggerItem>
              <div
                className={`${styles.statCard} group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-300`}
                onClick={() => openExpandedView("ALL")}
              >
                <div className={`${styles.statIconBox} transition-transform duration-200 group-hover:scale-110`}>
                  <ClipboardList size={26} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    <AnimatedCounter value={128} />
                  </span>
                  <span className={styles.statLabel}>Gestiones realizadas</span>
                  <span className={styles.statBadgeGreen}>+18 este semestre</span>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div
                className={`${styles.statCard} group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-300`}
                onClick={() => openExpandedView("ALL")}
              >
                <div className={`${styles.statIconBox} transition-transform duration-200 group-hover:scale-110`}>
                  <FileText size={26} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    <AnimatedCounter value={47} />
                  </span>
                  <span className={styles.statLabel}>Propuestas presentadas</span>
                  <span className={styles.statBadgeGreen}>+9 este semestre</span>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div
                className={`${styles.statCard} group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-300`}
                onClick={() => openExpandedView("LOGROS")}
              >
                <div className={`${styles.statIconBox} transition-transform duration-200 group-hover:scale-110`}>
                  <Trophy size={26} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    <AnimatedCounter value={36} />
                  </span>
                  <span className={styles.statLabel}>Logros alcanzados</span>
                  <span className={styles.statBadgeGreen}>+7 este semestre</span>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div
                className={`${styles.statCard} group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-300`}
                onClick={() => openExpandedView("SEGUIMIENTO")}
              >
                <div className={`${styles.statIconBox} transition-transform duration-200 group-hover:scale-110`}>
                  <Target size={26} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    <AnimatedCounter value={22} />
                  </span>
                  <span className={styles.statLabel}>Casos en seguimiento</span>
                  <span className={styles.statBadgeBlue}>En curso</span>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Grid de 3 Columnas: En seguimiento | Resultados y logros | Documentos */}
          <div className={styles.bottomColumnsGrid}>
            
            {/* Columna 1: En seguimiento */}
            <Reveal className={styles.columnPanel} delay={0.08}>
              <div className={styles.columnHeader}>
                <h3>En seguimiento</h3>
                <button
                  type="button"
                  onClick={() => openExpandedView("SEGUIMIENTO")}
                  className={styles.columnHeaderLink}
                >
                  Ver todas
                </button>
              </div>

              <div className={styles.itemList}>
                {trackingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.trackingItem} group cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:translate-x-1`}
                    onClick={() => openExpandedView("SEGUIMIENTO", item)}
                    title="Haz clic para ver el detalle completo"
                  >
                    <div className={`${styles.itemIconBox} transition-transform duration-200 group-hover:scale-110`}>
                      <ShieldCheck size={16} />
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitleRow}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemDate}>
                          {item.progressPercentage ?? 50}%
                        </span>
                      </div>
                      <p className={styles.itemSummary}>
                        {item.summary || "En proceso de gestión estudiantil."}
                      </p>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={`${styles.progressBarFill} transition-all duration-500`}
                          style={{ width: `${item.progressPercentage ?? 50}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Columna 2: Resultados y logros recientes */}
            <Reveal className={styles.columnPanel} delay={0.14}>
              <div className={styles.columnHeader}>
                <h3>Resultados y logros recientes</h3>
                <button
                  type="button"
                  onClick={() => openExpandedView("LOGROS")}
                  className={styles.columnHeaderLink}
                >
                  Ver todos
                </button>
              </div>

              <div className={styles.itemList}>
                {logroItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.trackingItem} group cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:translate-x-1`}
                    onClick={() => openExpandedView("LOGROS", item)}
                    title="Haz clic para ver el detalle completo"
                  >
                    <div
                      className={`${styles.itemIconBox} transition-transform duration-200 group-hover:scale-110`}
                      style={{ background: "#dcfce7", color: "#16a34a" }}
                    >
                      <Trophy size={16} />
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitleRow}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.resultBadgeGreen}>
                          {item.impactLevel || "ALTO"}
                        </span>
                      </div>
                      <p className={styles.itemSummary}>
                        {item.summary || item.result || "Logro institucional concretado."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Columna 3: Documentos y acuerdos */}
            <Reveal className={styles.columnPanel} delay={0.2}>
              <div className={styles.columnHeader}>
                <h3>Documentos y acuerdos</h3>
              </div>

              <div className={styles.itemList}>
                {documentItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`${styles.docItem} group cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:translate-x-1`}
                    onClick={() => openExpandedView("DOCUMENTOS", item)}
                    title="Haz clic para consultar este documento"
                  >
                    <FileText size={24} className={`${styles.docPdfIcon} transition-transform duration-200 group-hover:scale-110`} />
                    <div className={styles.docInfo}>
                      <span className={styles.docTitle}>{item.title}</span>
                      <span className={styles.docFormat}>
                        {item.kind || "ACUERDO"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openExpandedView("DOCUMENTOS")}
                className={`${styles.btnRoundedOutline} transition-all duration-200 hover:scale-105 active:scale-95`}
                style={{ justifyContent: "center", width: "100%" }}
              >
                Ver todos los documentos
                <ArrowRight size={16} />
              </button>
            </Reveal>
          </div>
        </section>

        {/* ==========================================
            5. CTA BANNER
           ========================================== */}
        <Reveal delay={0.1} distance={20}>
          <section className={`${styles.ctaBanner} transition-all duration-300 hover:shadow-xl`}>
            <div className={styles.ctaLeft}>
              <div className={styles.ctaIconBox}>
                <Users size={28} />
              </div>
              <div className={styles.ctaText}>
                <h3>¿Tienes una idea o propuesta?</h3>
                <p>Tu participación impulsa el cambio.</p>
              </div>
            </div>

            <Link href="/contacto" className={`${styles.ctaButtonWhite} transition-all duration-200 hover:scale-105 active:scale-95`}>
              Enviar propuesta ahora
              <ArrowRight size={16} />
            </Link>
          </section>
        </Reveal>
      </div>

      {/* ==========================================
          MODAL EXPANDIDO DE DETALLE COMPLETO Y CATÁLOGO
         ========================================== */}
      <RepresentationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={allItems}
        initialItem={selectedItemForModal}
        initialTab={modalInitialTab}
      />
    </div>
  );
}
