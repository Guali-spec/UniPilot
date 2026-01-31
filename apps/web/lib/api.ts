import type {
  Project,
  Session,
  ChatMessage,
  ChatResponse,
  Document,
} from '@/types/unipilot';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.message === 'string') {
        message = data.message;
      } else if (Array.isArray(data?.message) && data.message.length > 0) {
        message = data.message.join(', ');
      } else if (typeof data?.error === 'string') {
        message = data.error;
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: any) => request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  getSessions: (projectId: string) => request<Session[]>(`/sessions?projectId=${encodeURIComponent(projectId)}`),
  createSession: (data: any) => request<Session>('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  getChatHistory: (sessionId: string) =>
    request<ChatMessage[]>(`/chat/history?sessionId=${encodeURIComponent(sessionId)}`),

  sendMessage: (data: { sessionId: string; mode?: string; message: string; lang?: 'fr' | 'en' }) =>
    request<ChatResponse>('/chat', { method: 'POST', body: JSON.stringify(data) }),

  exportChatMarkdown: async (sessionId: string) => {
    const res = await fetch(
      `${baseUrl}/chat/export?sessionId=${encodeURIComponent(sessionId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (typeof data?.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data?.message) && data.message.length > 0) {
          message = data.message.join(', ');
        } else if (typeof data?.error === 'string') {
          message = data.error;
        }
      } catch {
        const text = await res.text();
        if (text) message = text;
      }
      throw new Error(message);
    }
    return res.text();
  },

  exportChatJson: (sessionId: string) =>
    request<any>(`/chat/export?sessionId=${encodeURIComponent(sessionId)}&format=json`),

  getDocuments: (projectId: string) =>
    request<Document[]>(`/documents?projectId=${encodeURIComponent(projectId)}`),
  uploadDocument: async (projectId: string, file: File) => {
    const form = new FormData();
    form.append('projectId', projectId);
    form.append('file', file);

    const res = await fetch(`${baseUrl}/documents/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (typeof data?.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data?.message) && data.message.length > 0) {
          message = data.message.join(', ');
        } else if (typeof data?.error === 'string') {
          message = data.error;
        }
      } catch {
        const text = await res.text();
        if (text) message = text;
      }
      throw new Error(message);
    }
    return res.json();
  },
  deleteDocument: (documentId: string) =>
    request<{ deleted: boolean }>(`/documents/${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
    }),

  getAntiCheat: (sessionId: string, take = 50) =>
    request<any[]>(`/sessions/${encodeURIComponent(sessionId)}/anti-cheat?take=${take}`),
};
