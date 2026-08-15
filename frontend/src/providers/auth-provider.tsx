"use client";

import { createContext, useEffect, useState } from "react";
import { authService, AuthServiceError } from "@/services/auth-service";
import type { AuthSession, AuthUser, LoginRequest } from "@/types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    authService
      .getCurrentUser()
      .then((currentSession) => {
        if (isActive) {
          const isAdmin = currentSession.user.roles.includes("ADMIN");
          setSession(isAdmin ? currentSession : null);
        }
      })
      .catch((error: unknown) => {
        if (
          error instanceof AuthServiceError &&
          !["unauthorized", "connection"].includes(error.kind)
        ) {
          console.error("No se pudo sincronizar la sesión administrativa.", error);
        }

        if (isActive) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function login(input: LoginRequest) {
    await authService.login(input);
    const currentSession = await authService.getCurrentUser();

    if (!currentSession.user.roles.includes("ADMIN")) {
      setSession(null);
      throw new AuthServiceError(
        "La cuenta no tiene permisos administrativos.",
        "forbidden",
        403,
      );
    }

    setSession(currentSession);
    return currentSession;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setSession(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
