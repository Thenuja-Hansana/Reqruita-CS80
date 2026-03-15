const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3003';

export interface AuthUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName?: string;
  industry?: string;
  country?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface ApiError {
  message: string;
}

// ── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  localStorage.setItem('reqruita_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('reqruita_token');
}

export function removeToken(): void {
  localStorage.removeItem('reqruita_token');
  localStorage.removeItem('reqruita_user');
}

export function saveUser(user: AuthUser): void {
  localStorage.setItem('reqruita_user', JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('reqruita_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Auth API calls ───────────────────────────────────────────────────────────

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  companyName?: string;
  industry?: string;
  country?: string;
  address?: string;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).message || 'Registration failed');
  }
  return data as AuthResponse;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export async function signin(payload: SigninPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).message || 'Login failed');
  }
  return data as AuthResponse;
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken();
  const res = await fetch(`${AUTH_API_BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).message || 'Failed to fetch user');
  }
  return (data as { user: AuthUser }).user;
}
