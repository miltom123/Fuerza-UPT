"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { RepresentationItem } from "@/types";
import styles from "./representation-hub.module.css";

interface RepresentationHubProps {
  items?: RepresentationItem[];
}

export function RepresentationHub({ items }: RepresentationHubProps) {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

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
              <Link href="#seguimiento" className={styles.btnPrimary}>
                <Activity size={18} />
                Ver gestiones activas
              </Link>
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
                <Link href="/representacion-estudiantil" className={styles.testimonialLink}>
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver testimonio
                </Link>
              </article>

              {/* Card 2 */}
              <article className={styles.testimonialCard}>
                <span className={styles.badgePillGreen}>Intercambio estudiantil</span>
                <div className={styles.authorRow}>
                  <Image
                    src="/images/jose-rojas.png"
                    alt="Retrato de José Miguel Rojas"
                    width={48}
                    height={48}
                    className={styles.avatarImage}
                  />
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>José Miguel Rojas</span>
                    <span className={styles.authorStudy}>Estudiante de Ingeniería de Sistemas</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>
                  "Mi intercambio en México fue posible gracias a la información y acompañamiento de Fuerza UPT. Una experiencia que cambió mi visión del mundo."
                </p>
                <Link href="/becas" className={styles.testimonialLink}>
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver testimonio
                </Link>
              </article>

              {/* Card 3 */}
              <article className={styles.testimonialCard}>
                <span className={styles.badgePillBlue}>Experiencia</span>
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
                    <span className={styles.authorStudy}>Estudiante de Arquitectura</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>
                  "Participar en las decisiones de la universidad me hizo sentir que mi voz importa. Fuerza UPT nos representa y trabaja por nosotros."
                </p>
                <Link href="/representacion-estudiantil" className={styles.testimonialLink}>
                  <Play size={14} fill="#1d4ed8" color="#1d4ed8" />
                  Ver testimonio
                </Link>
              </article>
            </div>

            <button className={`${styles.carouselArrow} ${styles.arrowRight}`} aria-label="Siguiente testimonio">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.centerAction}>
            <Link href="/testimonios" className={styles.btnRoundedOutline}>
              Ver todos los testimonios
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ==========================================
            3. INTERCAMBIOS QUE ABREN FRONTERAS
           ========================================== */}
        <section className={styles.exchangeCardContainer}>
          <div className={styles.exchangeLeft}>
            <div className={styles.exchangeBadgeIcon}>
              <Globe2 size={24} />
            </div>
            <h2>Intercambios que abren fronteras</h2>
            <p>
              Promovemos oportunidades internacionales que enriquecen tu formación académica y personal.
            </p>

            <div className={styles.exchangeFeatureList}>
              <div className={styles.exchangeFeatureItem}>
                <div className={styles.featureIconBox}>
                  <GraduationCap size={18} />
                </div>
                <p className={styles.featureText}>
                  <strong>+25 convenios internacionales</strong> con universidades aliadas.
                </p>
              </div>

              <div className={styles.exchangeFeatureItem}>
                <div className={styles.featureIconBox}>
                  <HeartHandshake size={18} />
                </div>
                <p className={styles.featureText}>
                  <strong>Apoyo en todo el proceso</strong> desde la postulación hasta tu regreso.
                </p>
              </div>

              <div className={styles.exchangeFeatureItem}>
                <div className={styles.featureIconBox}>
                  <Sparkles size={18} />
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
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <ClipboardList size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>128</span>
                <span className={styles.statLabel}>Gestiones realizadas</span>
                <span className={styles.statBadgeGreen}>+18 este semestre</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FileText size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>47</span>
                <span className={styles.statLabel}>Propuestas presentadas</span>
                <span className={styles.statBadgeGreen}>+9 este semestre</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Trophy size={26} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>36</span>
                <span className={styles.statLabel}>Logros alcanzados</span>
                <span className={styles.statBadgeGreen}>+7 este semestre</span>
              </div>
            </div>

            <div className={styles.statCard}>
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
                <Link href="/representacion-estudiantil" className={styles.columnHeaderLink}>Ver todas</Link>
              </div>

              <div className={styles.itemList}>
                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Transporte nocturno seguro</span>
                      <span className={styles.itemDate}>28 may, 2026</span>
                    </div>
                    <p className={styles.itemSummary}>
                      Solicitud de rutas y horarios extendidos para estudiantes de turnos nocturnos.
                    </p>
                    <div className={styles.progressBarTrack}>
                      <div className={styles.progressBarFill} style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>

                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Más puntos de recarga eléctrica</span>
                      <span className={styles.itemDate}>17 may, 2026</span>
                    </div>
                    <p className={styles.itemSummary}>
                      Instalación de estaciones de recarga en biblioteca y edificio de laboratorios.
                    </p>
                    <div className={styles.progressBarTrack}>
                      <div className={styles.progressBarFill} style={{ width: "45%" }} />
                    </div>
                  </div>
                </div>

                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Mejoras en conectividad Wi-Fi</span>
                      <span className={styles.itemDate}>09 may, 2026</span>
                    </div>
                    <p className={styles.itemSummary}>
                      Ampliación de cobertura y estabilidad en salones y zonas comunes.
                    </p>
                    <div className={styles.progressBarTrack}>
                      <div className={styles.progressBarFill} style={{ width: "30%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Resultados y logros recientes */}
            <div className={styles.columnPanel}>
              <div className={styles.columnHeader}>
                <h3>Resultados y logros recientes</h3>
                <Link href="/logros" className={styles.columnHeaderLink}>Ver todos</Link>
              </div>

              <div className={styles.itemList}>
                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox} style={{ background: "#dcfce7", color: "#16a34a" }}>
                    <Trophy size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Ampliación de horarios en biblioteca</span>
                      <span className={styles.resultBadgeGreen}>ALTO</span>
                    </div>
                    <span className={styles.itemDate}>20 may, 2026</span>
                    <p className={styles.itemSummary}>
                      Se logró la extensión hasta las 9:00 p.m. en días de semana y 5:00 p.m. los sábados.
                    </p>
                  </div>
                </div>

                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox} style={{ background: "#dcfce7", color: "#16a34a" }}>
                    <Trophy size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Becas apoyo conectividad</span>
                      <span className={styles.resultBadgeGreen}>ALTO</span>
                    </div>
                    <span className={styles.itemDate}>12 may, 2026</span>
                    <p className={styles.itemSummary}>
                      10 becas de datos aprobadas para estudiantes con dificultades de acceso a internet.
                    </p>
                  </div>
                </div>

                <div className={styles.trackingItem}>
                  <div className={styles.itemIconBox} style={{ background: "#dcfce7", color: "#16a34a" }}>
                    <Trophy size={16} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>Mejora en iluminación del campus</span>
                      <span className={styles.resultBadgeGreen}>MEDIO</span>
                    </div>
                    <span className={styles.itemDate}>26 abr, 2026</span>
                    <p className={styles.itemSummary}>
                      Instalación de 25 luminarias LED en senderos peatonales y zonas de alto tránsito.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 3: Documentos y acuerdos */}
            <div className={styles.columnPanel}>
              <div className={styles.columnHeader}>
                <h3>Documentos y acuerdos</h3>
              </div>

              <div className={styles.itemList}>
                <div className={styles.docItem}>
                  <FileText size={24} className={styles.docPdfIcon} />
                  <div className={styles.docInfo}>
                    <span className={styles.docTitle}>Acta de sesión 12</span>
                    <span className={styles.docFormat}>PDF</span>
                  </div>
                </div>

                <div className={styles.docItem}>
                  <FileText size={24} className={styles.docPdfIcon} />
                  <div className={styles.docInfo}>
                    <span className={styles.docTitle}>Acuerdo 08-2025</span>
                    <span className={styles.docFormat}>PDF</span>
                  </div>
                </div>

                <div className={styles.docItem}>
                  <FileText size={24} className={styles.docPdfIcon} />
                  <div className={styles.docInfo}>
                    <span className={styles.docTitle}>Pronunciamiento 05</span>
                    <span className={styles.docFormat}>PDF</span>
                  </div>
                </div>
              </div>

              <Link href="/representacion-estudiantil" className={styles.btnRoundedOutline} style={{ justifyContent: "center" }}>
                Ver todos los documentos
                <ArrowRight size={16} />
              </Link>
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
    </div>
  );
}
