'use client';

import { eventAdminService, EventAdminResponse } from '@/services/admin/event-admin-service';
import { use, useState, useEffect } from 'react';
import { EventForm } from '@/components/admin/eventos/event-form';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [data, setData] = useState<EventAdminResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventAdminService.getEvent(id)
      .then(setData)
      .catch((err) => setError(err.message || 'Error al cargar el evento'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
        {error || 'No se encontró el evento'}
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] w-full mx-auto px-2">
      <EventForm initialData={data} />
    </div>
  );
}
