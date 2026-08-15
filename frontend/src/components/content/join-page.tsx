"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authService } from "@/services/auth-service";
import { apiClient } from "@/services/api-client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  Globe2,
  Lock,
  Megaphone,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Target,
  User,
  Users,
} from "lucide-react";
import styles from "./join-page.module.css";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Dytnwv6wd9TAIbxQQcOIMd?s=cl&p=a&ilr=1";

function WhatsappLogo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        fill="#25D366"
        d="M24 4C12.95 4 4 12.95 4 24c0 3.84 1.08 7.42 2.96 10.48L4.05 44l9.74-2.86C16.77 42.97 20.27 44 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4z"
      />
      <path
        fill="#FFFFFF"
        d="M34.7 28.5c-.5-.25-2.9-1.43-3.35-1.6-.45-.16-.78-.25-1.1.25-.33.5-1.28 1.6-1.57 1.93-.29.33-.58.37-1.08.12-.5-.25-2.11-.78-4.02-2.48-1.49-1.33-2.49-2.97-2.79-3.47-.29-.5-.03-.77.22-1.02.22-.22.5-.58.74-.87.25-.29.33-.5.5-.83.17-.33.08-.62-.04-.87-.12-.25-1.1-2.66-1.52-3.64-.4-.96-.82-.83-1.1-.85-.29-.02-.62-.02-.96-.02-.33 0-.87.12-1.32.62-.45.5-1.74 1.7-1.74 4.15 0 2.45 1.78 4.82 2.03 5.15.25.33 3.5 5.34 8.48 7.49 1.18.51 2.11.82 2.83 1.05 1.19.38 2.27.32 3.13.2 1-.15 2.9-1.18 3.31-2.33.41-1.15.41-2.13.29-2.34-.13-.21-.46-.33-.96-.58z"
      />
    </svg>
  );
}

const facultiesWithCareers: Record<string, string[]> = {
  "Facultad de Ingeniería": [
    "Ingeniería de Sistemas",
    "Ingeniería Civil",
    "Ingeniería Industrial",
    "Ingeniería Ambiental",
    "Ingeniería Electrónica",
  ],
  "Facultad de Derecho": ["Derecho"],
  "Facultad de Arquitectura y Urbanismo": ["Arquitectura"],
  "Facultad de Ciencias Empresariales": [
    "Ingeniería Comercial",
    "Administración de Empresas",
    "Ciencias Contables y Financieras",
    "Economía",
  ],
  "Facultad de Ciencias de la Salud": [
    "Medicina Humana",
    "Odontología",
    "Terapia Física y Rehabilitación",
  ],
};

const semesters = [
  "1er Ciclo",
  "2do Ciclo",
  "3er Ciclo",
  "4to Ciclo",
  "5to Ciclo",
  "6to Ciclo",
  "7mo Ciclo",
  "8vo Ciclo",
  "9no Ciclo",
  "10mo Ciclo",
];

const interestsOptions = [
  "Legado Fuerza UPT",
  "Proyectos",
  "Eventos y logística",
  "Comunicación",
  "Voluntariado",
  "Intercambios y oportunidades",
  "Me gustaría conocer todas las áreas",
];

type SubmissionStatus = "IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR";

export function JoinPageContent() {
  const [isIdentified, setIsIdentified] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("Facultad de Ingeniería");
  const [selectedCareer, setSelectedCareer] = useState("Ingeniería de Sistemas");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("IDLE");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((session) => {
        if (session?.user) {
          setIsIdentified(true);
          if (session.user.displayName) setFullName(session.user.displayName);
          if (session.user.email) setEmail(session.user.email);
        }
      })
      .catch(() => {
        // User is not logged in yet, inputs remain clean for user
      });
  }, []);

  function handleFacultyChange(faculty: string) {
    setSelectedFaculty(faculty);
    const careers = facultiesWithCareers[faculty] || [];
    setSelectedCareer(careers[0] || "");
  }

  function handleGoogleLogin() {
    // Clear preloaded mock data
    setFullName("");
    setEmail("");
    setIsIdentified(false);

    // Initiate real Google OAuth Authorization flow
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:8080";

    window.location.href = `${backendUrl}/oauth2/authorization/google`;

  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawVal = e.target.value;
    let digits = rawVal.replace(/\D/g, "");

    // Enforce starting with 9
    if (digits.length > 0 && !digits.startsWith("9")) {
      digits = digits.replace(/^[^9]+/, "");
    }

    // Maximum 9 digits
    digits = digits.slice(0, 9);

    // Format in 3 blocks of 3 digits: 9XX XXX XXX
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }

    setPhone(formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate phone has exactly 9 digits starting with 9
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 9 || !digitsOnly.startsWith("9")) {
      alert("El número de celular debe empezar con 9 y contener exactamente 9 dígitos.");
      return;
    }

    setSubmissionStatus("SUBMITTING");

    try {
      await apiClient("/postulaciones-equipo", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          motivation: `Carrera: ${selectedCareer} (${selectedFaculty}), Ciclo: ${selectedSemester}, Interés: ${selectedInterest}, Celular: ${phone}`,
        }),
      });

      setSubmissionStatus("SUCCESS");
    } catch {
      setSubmissionStatus("ERROR");
    }
  }




  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ==========================================
            1. HERO CONTAINER (SOFT BLUE GRADIENT)
           ========================================== */}
        <section className={styles.heroContainer}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>SÉ PARTE DE FUERZA UPT</span>
            <h1>Conoce lo que hacemos. Súmate a Fuerza UPT.</h1>
            <p className={styles.heroLead}>
              Conoce nuestros proyectos, participa en nuestras iniciativas y forma parte de una comunidad de estudiantes que busca transformar la universidad.
            </p>
          </div>

          <div className={styles.heroRight}>
            <Image
              src="/images/join-students-illustration.png"
              alt="Ilustración de estudiantes uniéndose a Fuerza UPT"
              fill
              priority
              className={styles.heroIllustration}
              sizes="350px"
            />
          </div>
        </section>

        {/* ==========================================
            2. MAIN REGISTRATION FORM CARD
           ========================================== */}
        <section className={styles.formCard} id="registro">
          {/* Card Header */}
          <div className={styles.formHeader}>
            <div className={styles.formHeaderLeft}>
              <div className={styles.formIconBox}>
                <FileText size={24} />
              </div>
              <div className={styles.formTitleGroup}>
                <h2>Déjanos tus datos</h2>
                <p>
                  Completa tus datos para conocer nuestras iniciativas y mantenerte informado sobre las próximas actividades de Fuerza UPT.
                </p>
              </div>
            </div>

            <div className={styles.securityNote}>
              <Lock size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                <strong>Tus datos están seguros.</strong> Usaremos esta información únicamente para comunicarnos contigo sobre Fuerza UPT.
              </span>
            </div>
          </div>

          {/* Conditional Views: FORM vs SUCCESS vs ERROR */}
          {submissionStatus === "SUCCESS" ? (
            <div className={styles.successCard}>
              <div className={styles.successIconBox}>
                <CheckCircle2 size={36} />
              </div>
              <h2 className={styles.successTitle}>¡Registro completado! 🎉</h2>
              <p className={styles.successLead}>
                Hemos recibido tus datos correctamente. Gracias por tu interés en Fuerza UPT. Ahora puedes unirte a nuestro grupo oficial para conocer nuestras próximas actividades, proyectos y oportunidades.
              </p>

              <div style={{ width: "100%", maxWidth: "480px", marginTop: "12px" }}>
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsappActive}
                >
                  <WhatsappLogo size={24} />
                  Unirme al grupo oficial de WhatsApp
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          ) : submissionStatus === "ERROR" ? (
            <div className={styles.errorCard}>
              <h3 className={styles.errorTitle}>No pudimos registrar tus datos</h3>
              <p className={styles.errorDesc}>
                Revisa tu conexión e inténtalo nuevamente.
              </p>
              <button
                type="button"
                className={styles.btnRetry}
                onClick={() => setSubmissionStatus("IDLE")}
              >
                Intentar nuevamente
              </button>
            </div>
          ) : (
            <>
              {/* Google Auth Institutional Login */}
              <button
                type="button"
                className={styles.btnGoogleLogin}
                onClick={handleGoogleLogin}
              >
                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {isIdentified
                  ? "✓ Identificado con " + email
                  : "Continuar con mi correo institucional"}
              </button>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Nombre completo</label>
                  <input
                    type="text"
                    className={`${styles.textInput} ${isIdentified ? styles.textInputLocked : ""}`}
                    placeholder="Se autocompletará con tu cuenta institucional"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly={isIdentified}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Correo institucional</label>
                  <input
                    type="email"
                    className={`${styles.textInput} ${isIdentified ? styles.textInputLocked : ""}`}
                    placeholder="Se autocompletará con Google"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={isIdentified}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Número de celular / WhatsApp</label>
                  <div className={styles.inputWrapper}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      maxLength={11}
                      className={`${styles.textInput} ${styles.textInputWithIcon}`}
                      placeholder="Ej.: 952 123 456"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>


                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Ciclo actual</label>
                  <select
                    className={styles.selectInput}
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    required
                  >
                    <option value="">Selecciona tu ciclo</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Facultad</label>
                  <select
                    className={styles.selectInput}
                    value={selectedFaculty}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                  >
                    {Object.keys(facultiesWithCareers).map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Carrera profesional</label>
                  <select
                    className={styles.selectInput}
                    value={selectedCareer}
                    onChange={(e) => setSelectedCareer(e.target.value)}
                  >
                    {(facultiesWithCareers[selectedFaculty] || []).map((car) => (
                      <option key={car} value={car}>
                        {car}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formFieldFull}>
                  <label className={styles.fieldLabel}>¿En qué te gustaría participar?</label>
                  <select
                    className={styles.selectInput}
                    value={selectedInterest}
                    onChange={(e) => setSelectedInterest(e.target.value)}
                    required
                  >
                    <option value="">Elige los temas que más te interesan</option>
                    {interestsOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit & Disabled WhatsApp Actions */}
                <div className={styles.formFieldFull} style={{ marginTop: 8 }}>
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.btnSubmitPrimary}
                      disabled={submissionStatus === "SUBMITTING"}
                    >
                      {submissionStatus === "SUBMITTING" ? (
                        "Enviando información..."
                      ) : (
                        <>
                          Quiero ser parte
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    {/* WhatsApp Button (Locked until form submission succeeds) */}
                    <div className={styles.btnWhatsappDisabled}>
                      <WhatsappLogo size={18} />
                      🔒 Completa el registro para habilitar el grupo de WhatsApp
                    </div>

                    <p className={styles.legalNote}>
                      <Lock size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                      Al enviar tus datos, autorizas a Fuerza UPT a utilizarlos únicamente para comunicarse contigo sobre sus actividades, proyectos y oportunidades de participación.
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </section>

        {/* ==========================================
            3. PROCESS STEPS SECTION
           ========================================== */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeaderCenter}>
            <h2>¿Cómo empezamos?</h2>
            <p>Te acompañamos desde el primer contacto hasta tu incorporación a nuestra comunidad.</p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>01</span>
              <div className={styles.stepIconBox}>
                <User size={22} />
              </div>
              <span className={styles.stepTitle}>Identifícate</span>
              <p className={styles.stepDesc}>
                Continúa con tu correo institucional UPT.
              </p>
            </div>

            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>02</span>
              <div className={styles.stepIconBox}>
                <FileText size={22} />
              </div>
              <span className={styles.stepTitle}>Cuéntanos sobre ti</span>
              <p className={styles.stepDesc}>
                Completa tus datos académicos, de contacto e intereses.
              </p>
            </div>

            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>03</span>
              <div className={styles.stepIconBox}>
                <Users size={22} />
              </div>
              <span className={styles.stepTitle}>Conoce Fuerza UPT</span>
              <p className={styles.stepDesc}>
                Descubre nuestros proyectos, actividades y oportunidades.
              </p>
            </div>

            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>04</span>
              <div className={styles.stepIconBox}>
                <CheckCircle2 size={22} />
              </div>
              <span className={styles.stepTitle}>Súmate</span>
              <p className={styles.stepDesc}>
                Únete a nuestra comunidad y participa en las próximas iniciativas.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. BOTTOM GRID (FAQ & AREAS)
           ========================================== */}
        <section className={styles.bottomGrid}>
          {/* Left Column: Preguntas frecuentes */}
          <div className={styles.panelCard}>
            <h3>Preguntas frecuentes</h3>

            <div className={styles.faqList}>
              {[
                {
                  q: "¿Necesito postular para formar parte de Fuerza UPT?",
                  a: "No. Este registro nos permite conocer tu interés y mantenerte informado sobre nuestras actividades y oportunidades de participación.",
                },
                {
                  q: "¿Qué sucede después de registrar mis datos?",
                  a: "Tus datos serán enviados al equipo de Fuerza UPT. Después podrás unirte al grupo oficial de WhatsApp para recibir información de nuestras próximas actividades.",
                },
                {
                  q: "¿Necesito pertenecer a una carrera específica?",
                  a: "No. Buscamos estudiantes interesados en participar y aportar desde diferentes carreras y áreas.",
                },
                {
                  q: "¿Puedo participar en más de un área?",
                  a: "Sí. Puedes indicarnos todos los temas que te interesen y conocer las diferentes áreas de trabajo.",
                },
                {
                  q: "¿Para qué utilizarán mis datos?",
                  a: "Únicamente para comunicarnos contigo sobre actividades, proyectos y oportunidades relacionadas con Fuerza UPT.",
                },
              ].map((faq, idx) => (
                <div key={idx} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqHeader}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      style={{
                        transform: openFaq === idx ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className={styles.faqAnswer}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>

            <Link href="/contacto" className={styles.panelLink}>
              Ver todas las preguntas
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right Column: Áreas referenciales */}
          <div className={styles.panelCard}>
            <h3>¿Qué hacemos?</h3>

            <div className={styles.areaList}>
              {[
                { name: "Legado Fuerza UPT", icon: User },
                { name: "Proyectos", icon: Target },
                { name: "Eventos y logística", icon: Calendar },
                { name: "Comunicación", icon: Megaphone },
                { name: "Voluntariado", icon: CheckCircle2 },
                { name: "Intercambios y oportunidades", icon: Globe2 },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className={styles.areaItem}>
                    <div className={styles.areaIconBox}>
                      <IconComponent size={16} />
                    </div>
                    <span className={styles.areaName}>{item.name}</span>
                  </div>
                );
              })}
            </div>

            <p className={styles.panelFooterNote}>
              Conoce nuestras áreas y descubre dónde puedes aportar.
            </p>

            <Link href="/contacto" className={styles.panelLink}>
              Conoce más sobre cada área
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
