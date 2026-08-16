"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Play,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { RepresentationItem } from "@/types";
import { RepresentationDetailModal } from "./RepresentationDetailModal";
import styles from "./representation-hub.module.css";

interface RepresentationHubProps {
  items?: RepresentationItem[];
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

export function RepresentationHub({ items }: RepresentationHubProps) {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

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

  const quotes = [
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

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ==========================================
            1. HERO SECTION
           ========================================== */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>LEGADO FUERZA UPT</span>
            <h1 className={styles.heroTitle}>
              Historias que inspiran, acciones que transforman
            </h1>
            <p className={styles.lead}>
              Somos una comunidad que impulsa el cambio a través del seguimiento, la transparencia y la participación estudiantil.
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => openExpandedView("ALL")}
                className={styles.btnPrimary}
              >
                <Activity size={18} />
                Ver gestiones activas
              </button>
              <Link href="/contacto" className={styles.btnOutline}>
                <FileText size={18} />
                Enviar propuesta
              </Link>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroImageWrapper}>
              <Image
                src="/images/hero-student.png"
                alt="Estudiante universitario de Fuerza UPT"
                fill
                priority
                className={styles.heroImage}
                sizes="(max-width: 1024px) 100vw, 550px"
              />
            </div>

            <div className={styles.quoteCard}>
              <span className={styles.quoteIcon}>“</span>
              <p className={styles.quoteText}>{quotes[activeQuoteIndex].text}</p>
              <div className={styles.quoteMeta}>
                <span className={styles.quoteAuthor}>— {quotes[activeQuoteIndex].author}</span>
                <span className={styles.quoteRole}>{quotes[activeQuoteIndex].role}</span>
              </div>
              <div className={styles.quoteDots}>
                {quotes.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${idx === activeQuoteIndex ? styles.dotActive : ""}`}
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
          <div className={styles.sectionHeaderCenter}>
            <h2>Voces que construyen universidad</h2>
            <p>Conoce las experiencias de estudiantes que han sido parte del cambio.</p>
          </div>

          <div className={styles.carouselWrapper}>
            <button className={`${styles.carouselArrow} ${styles.arrowLeft}`} aria-label="Testimonio anterior">
              <ChevronLeft size={20} />
            </button>

            <div className={styles.testimonialsGrid}>
              {/* Card 1 */}
              <article className={styles.testimonialCard}>
                <span className={styles.badgePillBlue}>Experiencia</span>
                <div className={styles.authorRow}>
                  <Image
                    src="/images/valeria-sanchez.png"
                    alt="Retrato de Valeria Sánchez"
                    width={48}
                    height={48}
                    className={styles.avatarImage}
                  />
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>Valeria Sánchez</span>
                    <span className={styles.authorStudy}>Estudiante de Psicología</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>
                  "Gracias al seguimiento de Fuerza UPT, se logró implementar talleres gratuitos de salud mental. Hoy más estudiantes tienen acceso a apoyo profesional."
                </p>
                <button
                  type="button"
                  onClick={() => openExpandedView("LOGROS")}
                  className={styles.testimonialLink}
                >
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver detalle completo
                </button>
              </article>

              {/* Card 2 */}
              <article className={styles.testimonialCard}>
                <span className={styles.badgePillBlue}>Liderazgo</span>
                <div className={styles.authorRow}>
                  <Image
                    src="/images/jose-rojas.png"
                    alt="Retrato de José Rojas"
                    width={48}
                    height={48}
                    className={styles.avatarImage}
                  />
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>José Rojas</span>
                    <span className={styles.authorStudy}>Estudiante de Ing. Civil</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>
                  "Participar en las mesas de diálogo nos permitió plantear mejoras concretas para los laboratorios. La representación estudiantil realmente funciona."
                </p>
                <button
                  type="button"
                  onClick={() => openExpandedView("LOGROS")}
                  className={styles.testimonialLink}
                >
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver detalle completo
                </button>
              </article>

              {/* Card 3 */}
              <article className={styles.testimonialCard}>
                <span className={styles.badgePillBlue}>Comunidad</span>
                <div className={styles.authorRow}>
                  <Image
                    src="/images/andrea-flores.png"
                    alt="Retrato de Andrea Flores"
                    width={48}
                    height={48}
                    className={styles.avatarImage}
                  />
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>Andrea Flores</span>
                    <span className={styles.authorStudy}>Estudiante de Medicina</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>
                  "El apoyo durante el proceso de matrícula y becas fue clave para muchos compañeros. Saber que no estás solo marca la diferencia."
                </p>
                <button
                  type="button"
                  onClick={() => openExpandedView("LOGROS")}
                  className={styles.testimonialLink}
                >
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver detalle completo
                </button>
              </article>
            </div>

            <button className={`${styles.carouselArrow} ${styles.arrowRight}`} aria-label="Testimonio siguiente">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.centerLinkWrap}>
            <Link href="/testimonios" className={styles.btnRoundedOutline}>
              Ver todos los testimonios
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ==========================================
            3. INTERCAMBIOS Y EXPERIENCIAS GLOBALES
           ========================================== */}
        <section className={styles.exchangeSection}>
          <div className={styles.exchangeLeft}>
            <span className={styles.eyebrow}>INTERCAMBIOS Y EXPERIENCIAS</span>
            <h2>Cruzando fronteras, dejando huella</h2>
            <p className={styles.lead}>
              Nuestros estudiantes llevan el nombre de la UPT al mundo a través de programas de intercambio y estancias académicas internacionales.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconBadge}>
                  <span className={styles.featureIcon}>🌍</span>
                </div>
                <p className={styles.featureText}>
                  <strong>+15 convenios internacionales</strong> activos con universidades de América y Europa.
                </p>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconBadge}>
                  <span className={styles.featureIcon}>🎓</span>
                </div>
                <p className={styles.featureText}>
                  <strong>Apoyo y asesoramiento</strong> integral para postulación a becas de movilidad.
                </p>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconBadge}>
                  <span className={styles.featureIcon}>🤝</span>
                </div>
                <p className={styles.featureText}>
                  <strong>Experiencias que transforman</strong> tu futuro y amplían tu red global.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.exchangeRightCollage}>
            <div className={styles.collageLeftPhoto}>
              <Image
                src="/images/exchange-florence.png"
                alt="Estudiante en intercambio internacional"
                fill
                className={styles.heroImage}
                sizes="300px"
              />
            </div>
            <div className={styles.collageRightStack}>
              <div className={styles.collageRightPhoto}>
                <Image
                  src="/images/exchange-berlin.png"
                  alt="Grupo de estudiantes Fuerza UPT en Europa"
                  fill
                  className={styles.heroImage}
                  sizes="250px"
                />
              </div>
              <div className={styles.collageRightPhoto}>
                <Image
                  src="/images/exchange-mountains.png"
                  alt="Estudiante de intercambio en paisaje montañoso"
                  fill
                  className={styles.heroImage}
                  sizes="250px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. NUESTRO IMPACTO EN CIFRAS
           ========================================== */}
        <section className={styles.statsSection} id="seguimiento">
          <div className={styles.sectionHeaderCenter}>
            <h2>Nuestro impacto en cifras</h2>
            <p>Resultados que reflejan nuestro compromiso con la comunidad estudiantil.</p>
          </div>

          {/* 4 Cards de Estadísticas */}
          <div className={styles.statsGrid}>
            <div
              className={`${styles.statCard} cursor-pointer hover:border-blue-300 transition`}
              onClick={() => openExpandedView("ALL")}
            >
              <div className={styles.statIconBox}>
                <ClipboardList size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>128</span>
                <span className={styles.statLabel}>Gestiones realizadas</span>
                <span className={styles.statBadgeGreen}>+18 este semestre</span>
              </div>
            </div>

            <div
              className={`${styles.statCard} cursor-pointer hover:border-blue-300 transition`}
              onClick={() => openExpandedView("ALL")}
            >
              <div className={styles.statIconBox}>
                <FileText size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>47</span>
                <span className={styles.statLabel}>Propuestas presentadas</span>
                <span className={styles.statBadgeGreen}>+9 este semestre</span>
              </div>
            </div>

            <div
              className={`${styles.statCard} cursor-pointer hover:border-blue-300 transition`}
              onClick={() => openExpandedView("LOGROS")}
            >
              <div className={styles.statIconBox}>
                <Trophy size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>36</span>
                <span className={styles.statLabel}>Logros alcanzados</span>
                <span className={styles.statBadgeGreen}>+7 este semestre</span>
              </div>
            </div>

            <div
              className={`${styles.statCard} cursor-pointer hover:border-blue-300 transition`}
              onClick={() => openExpandedView("SEGUIMIENTO")}
            >
              <div className={styles.statIconBox}>
                <Target size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>22</span>
                <span className={styles.statLabel}>Casos en seguimiento</span>
                <span className={styles.statBadgeBlue}>En curso</span>
              </div>
            </div>
          </div>

          {/* Grid de 3 Columnas: En seguimiento | Resultados y logros | Documentos */}
          <div className={styles.bottomColumnsGrid}>
            
            {/* Columna 1: En seguimiento */}
            <div className={styles.columnPanel}>
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
                    className={`${styles.trackingItem} cursor-pointer hover:bg-slate-50 transition`}
                    onClick={() => openExpandedView("SEGUIMIENTO", item)}
                    title="Haz clic para ver el detalle completo"
                  >
                    <div className={styles.itemIconBox}>
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
                          className={styles.progressBarFill}
                          style={{ width: `${item.progressPercentage ?? 50}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: Resultados y logros recientes */}
            <div className={styles.columnPanel}>
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
                    className={`${styles.trackingItem} cursor-pointer hover:bg-slate-50 transition`}
                    onClick={() => openExpandedView("LOGROS", item)}
                    title="Haz clic para ver el detalle completo"
                  >
                    <div
                      className={styles.itemIconBox}
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
            </div>

            {/* Columna 3: Documentos y acuerdos */}
            <div className={styles.columnPanel}>
              <div className={styles.columnHeader}>
                <h3>Documentos y acuerdos</h3>
              </div>

              <div className={styles.itemList}>
                {documentItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`${styles.docItem} cursor-pointer hover:bg-slate-50 transition`}
                    onClick={() => openExpandedView("DOCUMENTOS", item)}
                    title="Haz clic para consultar este documento"
                  >
                    <FileText size={24} className={styles.docPdfIcon} />
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
                className={styles.btnRoundedOutline}
                style={{ justifyContent: "center", width: "100%" }}
              >
                Ver todos los documentos
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. CTA BANNER
           ========================================== */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaLeft}>
            <div className={styles.ctaIconBox}>
              <Users size={28} />
            </div>
            <div className={styles.ctaText}>
              <h3>¿Tienes una idea o propuesta?</h3>
              <p>Tu participación impulsa el cambio.</p>
            </div>
          </div>

          <Link href="/contacto" className={styles.ctaButtonWhite}>
            Enviar propuesta ahora
            <ArrowRight size={16} />
          </Link>
        </section>
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
