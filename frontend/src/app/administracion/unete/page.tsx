import { SubmissionInbox } from "@/components/admin/submission-inbox";

export default function UnetePage() {
  return (
    <div className="p-8">
      <SubmissionInbox
        type="postulaciones"
        title="Postulaciones recibidas"
        description="Revisa y clasifica las postulaciones de voluntarios para unirse a Fuerza UPT."
      />
    </div>
  );
}
