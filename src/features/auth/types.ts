/**
 * features/auth/types.ts
 * Field names/casing exactly as the backend sends/expects them (snake_case),
 * per 01-backend-reference.md "Database Schema / Entity Models" and
 * 02-api-reference.md "Identity & Auth".
 */

export interface User {
  id: string; // UUID
  email: string;
  display_name: string | null;
  email_verified: boolean; // NOT "email_verified_at"
  created_at: string; // ISO 8601
}

export interface SignupRequest {
  email: string;
  password: string; // min 10 chars, enforced server-side
}

export interface SignupResponse {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string; // issued but currently unusable - no /auth/refresh endpoint exists
  expires_in: number; // seconds, 900 (15 min)
}

export interface UpdateProfileRequest {
  display_name: string;
}
