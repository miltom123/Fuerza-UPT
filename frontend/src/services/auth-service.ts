import { API_BASE_URL } from "@/lib/constants";
import { getCsrfHeaders } from "@/services/api-client";
import type { AuthErrorResponse, AuthSession, LoginRequest } from "@/types/auth";

export type AuthErrorKind =
  | "invalid_credentials"
  | "unauthorized"
  | "forbidden"
  | "connection"
  | "unexpected";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly kind: AuthErrorKind,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

async function readError(response: Response): Promise<AuthErrorResponse | null> {
  try {
    return (await response.json()) as AuthErrorResponse;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;

  try {
    const method = (init.method ?? "GET").toUpperCase();
    const csrfHeaders = !["GET", "HEAD", "OPTIONS"].includes(method)
      ? await getCsrfHeaders()
      : {};
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...csrfHeaders,
        ...init.headers,
      },
    });
  } catch {
    throw new AuthServiceError(
      "No se pudo conectar con el servicio de autenticación.",
      "connection",
    );
  }

  if (!response.ok) {
    const details = await readError(response);
    const kind: AuthErrorKind =
      response.status === 401
        ? details?.code === "INVALID_CREDENTIALS"
          ? "invalid_credentials"
          : "unauthorized"
        : response.status === 403
          ? "forbidden"
          : "unexpected";

    throw new AuthServiceError(
      details?.message ?? "El servicio de autenticación rechazó la solicitud.",
      kind,
      response.status,
      details?.code,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function login(input: LoginRequest) {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function getCurrentUser() {
  return request<AuthSession>("/auth/me", { method: "GET" });
}

async function logout() {
  return request<void>("/auth/logout", { method: "POST" });
}

export const authService = {
  login,
  getCurrentUser,
  logout,
};
