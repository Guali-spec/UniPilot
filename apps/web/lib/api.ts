const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Projects
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: CreateProjectData) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sessions
  getSessions: (projectId: string) =>
    request<Session[]>(`/sessions?projectId=${projectId}`),
  createSession: (data: { projectId: string; name: string }) =>
    request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chat
  sendMessage: (data: { sessionId: string; mode?: ChatMode; message: string }) =>
    request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChatHistory: (sessionId: string) =>
    request<ChatMessage[]>(`/chat/history?sessionId=${sessionId}`),
  getAntiCheat: (sessionId: string, take = 10) =>
    request<AntiCheatResult[]>(`/sessions/${sessionId}/anti-cheat?take=${take}`),
}

// Types
export interface Project {
  id: string
  title: string
  level?: string
  domain?: string
  stack?: string
  constraints?: string
  createdAt: string
}

export interface CreateProjectData {
  title: string
  level?: string
  domain?: string
  stack?: string
  constraints?: string
}

export interface Session {
  id: string
  projectId: string
  name: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AntiCheatResult {
  label: 'allowed' | 'borderline' | 'cheating'
  reason: string
}

export interface ChatMeta {
  mode: ChatMode
  model: string
  latencyMs: number
}

export interface ChatResponse {
  sessionId: string
  assistant: string
  antiCheat: AntiCheatResult
  meta: ChatMeta
}

export type ChatMode = 'coach' | 'planning' | 'debug'
