'use client';

import { projectAdminService, ProjectAdminResponse } from '@/services/admin/project-admin-service';
import { use, useState, useEffect } from 'react';
import { ProjectForm } from '@/components/admin/proyectos/project-form';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [data, setData] = useState<ProjectAdminResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectAdminService.getProject(id)
      .then(setData)
      .catch((err) => setError(err.message || 'Error al cargar el proyecto'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
        {error || 'No se encontró el proyecto'}
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] w-full mx-auto px-2">
      <ProjectForm initialData={data} />
    </div>
  );
}
