import { ProjectForm } from '@/components/admin/proyectos/project-form';

export const metadata = {
  title: 'Nuevo Proyecto | Admin Fuerza UPT',
  description: 'Crear un nuevo proyecto',
};

export default function NuevoProyectoPage() {
  return (
    <div className="max-w-[1920px] w-full mx-auto px-2">
      <ProjectForm />
    </div>
  );
}
