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
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
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
    throw new ApiClientError("No se pudo inicializar la protección de la solicitud.", response.status);
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
      throw new ApiClientError(
        body?.message ?? `La API respondió con estado ${response.status}.`,
        response.status,
        body?.code,
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

    throw new ApiClientError("No se pudo conectar con la API configurada.");
  }
}
