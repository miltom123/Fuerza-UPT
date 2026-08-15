export type UserRole = "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

export interface AuthErrorResponse {
  message: string;
  code?: string;
}
