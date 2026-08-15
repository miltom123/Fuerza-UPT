import { SubmissionInbox } from "@/components/admin/submission-inbox";

export default function ContactoPage() {
  return (
    <div className="p-8">
      <SubmissionInbox
        type="contactos"
        title="Mensajes recibidos"
        description="Revisa y clasifica los mensajes recibidos desde el formulario de contacto público."
      />
    </div>
  );
}
