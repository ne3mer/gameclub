export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5050';
export const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '912A3060859n';

export const adminHeaders = (includeContentType: boolean = true, additional?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (ADMIN_API_KEY) {
    headers['x-admin-key'] = ADMIN_API_KEY;
  }

  return { ...headers, ...(additional ?? {}) };
};

export const persistAuthSession = (token?: string, user?: unknown) => {
  if (typeof window === 'undefined' || !token || !user) return;
  localStorage.setItem('gc_token', token);
  localStorage.setItem('gc_user', JSON.stringify(user));
  window.dispatchEvent(new Event('gc-auth-change'));
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gc_token');
  localStorage.removeItem('gc_user');
  window.dispatchEvent(new Event('gc-auth-change'));
};
