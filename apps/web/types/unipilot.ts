export interface Project {
  id: string
  title: string
  level?: string
  domain?: string
  stack?: string
  constraints?: string
  createdAt: string
  updatedAt?: string;
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
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

export interface AntiCheatResult {
  label: 'allowed' | 'borderline' | 'cheating'
  reason: string
  score?: number;
  category?: string;
  severity?: string;
}

export interface ChatMeta {
  mode: ChatMode
  model: string
  latencyMs: number
}

export type ChatMode = 'coach' | 'planning' | 'debug'
export type ChatResponse = {
  sessionId: string;
  assistant: {
    id: string;
    sessionId: string;
    role: 'assistant';
    content: string;
    createdAt: string;
  };
  antiCheat: AntiCheatResult;
  meta: ChatMeta;
};
