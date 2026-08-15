import { EventForm } from '@/components/admin/eventos/event-form';

export const metadata = {
  title: 'Nuevo Evento | Admin Fuerza UPT',
  description: 'Crear un nuevo evento',
};

export default function NuevoEventoPage() {
  return (
    <div className="max-w-[1920px] w-full mx-auto px-2">
      <EventForm />
    </div>
  );
}
