export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export function getAuthHeaders(): HeadersInit {
  const access = localStorage.getItem('access');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (access) headers['Authorization'] = `Bearer ${access}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 