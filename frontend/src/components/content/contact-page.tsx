import { Building2, Handshake, Headphones, Mail, MapPin, MessageSquareText, Send, UsersRound } from "lucide-react";
import styles from "./community-pages.module.css";

export function ContactPageContent() {
  return <section className={styles.page}><div className={styles.shell}>
    <header className={styles.hero}><div><p className={styles.eyebrow}>Canales de atención</p><h1>Contacto</h1><p>Elige el motivo de tu mensaje para orientar consultas, propuestas, alianzas o soporte.</p></div><span className={styles.heroIcon}><MessageSquareText aria-hidden="true" /></span></header>
    <section className={styles.section}><h2>¿Cómo podemos ayudarte?</h2><div className={styles.grid}>
      <article className={styles.item}><MessageSquareText aria-hidden="true" /><h3>Consultas generales</h3><p>Información sobre actividades y contenidos publicados.</p></article>
      <article className={styles.item}><UsersRound aria-hidden="true" /><h3>Propuestas estudiantiles</h3><p>Problemas, ideas o solicitudes para representación.</p></article>
      <article className={styles.item}><Handshake aria-hidden="true" /><h3>Alianzas institucionales</h3><p>Coordinaciones con organizaciones y aliados.</p></article>
      <article className={styles.item}><Headphones aria-hidden="true" /><h3>Soporte para inscripciones</h3><p>Ayuda relacionada con eventos que tengan registro activo.</p></article>
    </div></section>
    <div className={styles.split}>
      <section className={styles.panel}><h2>Canales publicados</h2><div className={styles.contactCards}>
        <article className={styles.contactCard}><Mail aria-hidden="true" /><div><h3>Correo</h3><a href="mailto:somos.fuerzaupt@gmail.com">somos.fuerzaupt@gmail.com</a></div></article>
        <article className={styles.contactCard}><MapPin aria-hidden="true" /><div><h3>Ubicación</h3><p>Universidad Privada de Tacna, Campus Capanique, Tacna</p></div></article>
        <article className={styles.contactCard}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path fill="#25D366" d="M24 4C12.95 4 4 12.95 4 24c0 3.84 1.08 7.42 2.96 10.48L4.05 44l9.74-2.86C16.77 42.97 20.27 44 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4z"/>
            <path fill="#FFFFFF" d="M34.7 28.5c-.5-.25-2.9-1.43-3.35-1.6-.45-.16-.78-.25-1.1.25-.33.5-1.28 1.6-1.57 1.93-.29.33-.58.37-1.08.12-.5-.25-2.11-.78-4.02-2.48-1.49-1.33-2.49-2.97-2.79-3.47-.29-.5-.03-.77.22-1.02.22-.22.5-.58.74-.87.25-.29.33-.5.5-.83.17-.33.08-.62-.04-.87-.12-.25-1.1-2.66-1.52-3.64-.4-.96-.82-.83-1.1-.85-.29-.02-.62-.02-.96-.02-.33 0-.87.12-1.32.62-.45.5-1.74 1.7-1.74 4.15 0 2.45 1.78 4.82 2.03 5.15.25.33 3.5 5.34 8.48 7.49 1.18.51 2.11.82 2.83 1.05 1.19.38 2.27.32 3.13.2 1-.15 2.9-1.18 3.31-2.33.41-1.15.41-2.13.29-2.34-.13-.21-.46-.33-.96-.58z"/>
          </svg>
          <div>
            <h3>WhatsApp Oficial</h3>
            <a href="https://chat.whatsapp.com/Dytnwv6wd9TAIbxQQcOIMd?s=cl&p=a&ilr=1" target="_blank" rel="noopener noreferrer">
              Unirse al grupo de WhatsApp
            </a>
          </div>
        </article>
      </div></section>
      <section className={styles.panel}><h2>Envíanos un mensaje</h2><form className={styles.form} action="mailto:somos.fuerzaupt@gmail.com" method="post" encType="text/plain">
        <div className={styles.field}><label htmlFor="contact-name">Nombre</label><input id="contact-name" name="Nombre" required /></div>
        <div className={styles.field}><label htmlFor="contact-email">Correo</label><input id="contact-email" name="Correo" type="email" required /></div>
        <div className={`${styles.field} ${styles.wide}`}><label htmlFor="contact-topic">Motivo</label><select id="contact-topic" name="Motivo"><option>Consulta general</option><option>Propuesta estudiantil</option><option>Alianza institucional</option><option>Soporte para inscripciones</option></select></div>
        <div className={`${styles.field} ${styles.wide}`}><label htmlFor="contact-message">Mensaje</label><textarea id="contact-message" name="Mensaje" required /></div>
        <p className={styles.formNote}>El formulario abrirá tu aplicación de correo. No almacenamos estos datos en la web.</p>
        <button className={styles.submit} type="submit"><Send aria-hidden="true" />Enviar por correo</button>
      </form></section>
    </div>
  </div></section>;
}
