import { API_BASE_URL } from "@/lib/constants";

interface ApiClientOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

interface ApiErrorBody {
  code?: string;
  message?: string;
  requestId?: string;
  fieldErrors?: { field: string; message: string }[];
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly requestId?: string,
    public readonly fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function resolveApiUrl(path: string): string {
  if (/^https?:\/\//.test(API_BASE_URL)) {
    return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
  }

  if (typeof window !== "undefined") {
    return `${API_BASE_URL}${path}`;
  }

  const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
  return `${backendUrl}/api${path}`;
}

export async function getCsrfHeaders(): Promise<Record<string, string>> {
  const response = await fetch(resolveApiUrl("/auth/csrf"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiClientError("No se pudo inicializar la protección de la solicitud (CSRF).", response.status);
  }

  const csrf = (await response.json()) as { token: string; headerName: string };
  return { [csrf.headerName]: csrf.token };
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  try {
    const csrfHeaders = isMutation ? await getCsrfHeaders() : {};
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const response = await fetch(resolveApiUrl(path), {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...csrfHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      let userFriendlyMessage = body?.message;

      if (!userFriendlyMessage || userFriendlyMessage === "Ocurrió un error inesperado.") {
        if (response.status === 400) {
          userFriendlyMessage = body?.fieldErrors && body.fieldErrors.length > 0
            ? `Datos inválidos: ${body.fieldErrors.map(f => `${f.field}: ${f.message}`).join(", ")}`
            : "Los datos enviados no son válidos. Por favor revise los campos.";
        } else if (response.status === 401) {
          userFriendlyMessage = "Su sesión ha expirado o no está autenticado. Por favor inicie sesión nuevamente.";
        } else if (response.status === 403) {
          userFriendlyMessage = "Acceso denegado o token de seguridad CSRF inválido. Recargue la página e intente de nuevo.";
        } else if (response.status === 404) {
          userFriendlyMessage = "El registro o recurso solicitado no fue encontrado en el servidor.";
        } else if (response.status === 409) {
          userFriendlyMessage = "Conflicto de concurrencia: el registro fue modificado por otro usuario. Recargue la página.";
        } else if (response.status >= 500) {
          userFriendlyMessage = body?.requestId
            ? `Error interno del servidor (Ref: ${body.requestId}). Por favor intente más tarde.`
            : "Error interno del servidor. Por favor intente más tarde.";
        } else {
          userFriendlyMessage = `Error en el servidor (HTTP ${response.status}).`;
        }
      } else if (response.status >= 500 && body?.requestId) {
        userFriendlyMessage = `${userFriendlyMessage} (Ref: ${body.requestId})`;
      }

      throw new ApiClientError(
        userFriendlyMessage,
        response.status,
        body?.code,
        body?.requestId,
        body?.fieldErrors,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError("No se pudo conectar con el servidor API.");
  }
}
