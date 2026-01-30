
import type { Project, Session, ChatMessage, ChatResponse } from '@/types/unipilot';


const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  createProject: async (data: unknown) =>
    request('/projects', { method: 'POST', body: JSON.stringify(data) }),

  getProjects: async () => request('/projects', { method: 'GET' }),

  getSessions: async (projectId: string) =>
    request(`/projects/${projectId}/sessions`, { method: 'GET' }),

  createSession: async (data: unknown) =>
    request('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  getChatHistory: async (sessionId: string) =>
    request(`/sessions/${sessionId}/chat`, { method: 'GET' }),

  sendMessage: async (data: unknown) =>
    request('/chat/send', { method: 'POST', body: JSON.stringify(data) }),

  getAntiCheat: async (sessionId: string, limit: number) =>
    request(`/sessions/${sessionId}/anti-cheat?limit=${limit}`, { method: 'GET' }),

  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
