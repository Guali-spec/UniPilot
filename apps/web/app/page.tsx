'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from '@/components/unipilot/Sidebar'
import { ChatWindow } from '@/components/unipilot/ChatWindow'
import { ProjectDialog, type ProjectFormData } from '@/components/unipilot/ProjectDialog'
import { SessionDialog } from '@/components/unipilot/SessionDialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Project, Session, ChatMessage, ChatMode, ChatMeta, AntiCheatResult, UiLanguage } from '@/types/unipilot'

interface MessageWithMeta extends ChatMessage {
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

export default function UniPilotPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<UiLanguage>('fr')
  const autoCreatedProjectIdRef = useRef<string | null>(null)
  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<MessageWithMeta[]>([])

  // Loading states
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)

  // Derived state
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null

  useEffect(() => {
    const storedTheme = localStorage.getItem('unipilot_theme')
    const storedLang = localStorage.getItem('unipilot_lang')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
    }
    if (storedLang === 'fr' || storedLang === 'en') {
      setLang(storedLang)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('unipilot_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('unipilot_lang', lang)
  }, [lang])

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects()
        setProjects(data)

        // ✅ auto-select first project if none selected
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0].id)
        }

        if (data.length === 0) {
          const defaultTitle =
            lang === 'fr' ? 'Mon premier projet' : 'My first project'
          const defaultProject = await api.createProject({ title: defaultTitle })
          autoCreatedProjectIdRef.current = defaultProject.id
          setProjects([defaultProject])
          setSelectedProjectId(defaultProject.id)
        }
      } catch (error) {
        toast.error('Failed to load projects', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsLoadingProjects(false)
      }
    }
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, selectedProjectId])

  const loadSessions = useCallback(async (projectId: string) => {
  setIsLoadingSessions(true)
  try {
    const data = await api.getSessions(projectId)
    setSessions(data)
    return data
  } finally {
    setIsLoadingSessions(false)
  }
}, [])


  // Fetch sessions when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setSessions([])
      setCurrentSession(null)
      setMessages([])
      return
    }

    const fetchSessions = async () => {
      setIsLoadingSessions(true)
      try {
        const data = await api.getSessions(selectedProjectId)
        setSessions(data)

        // ✅ auto-select first session if available
        if (data.length > 0) {
          setCurrentSession(data[0])
        } else {
          setCurrentSession(null)
          setMessages([])
          if (autoCreatedProjectIdRef.current === selectedProjectId) {
            const defaultName =
              lang === 'fr' ? 'Session 1' : 'Session 1'
            const newSession = await api.createSession({
              projectId: selectedProjectId,
              name: defaultName,
            })
            setSessions([newSession])
            setCurrentSession(newSession)
          } else {
            setSessionDialogOpen(true) // ✅ prompt create session
          }
        }

      } catch (error) {
        toast.error('Failed to load sessions', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsLoadingSessions(false)
      }
    }
    fetchSessions()
  }, [selectedProjectId, lang])

  // Fetch messages when session changes
  useEffect(() => {
    if (!currentSession) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const historyData = await api.getChatHistory(currentSession.id)
        // anti-cheat events endpoint exists, but merging is optional for now
        // await api.getAntiCheat(currentSession.id, 50).catch(() => [])

        const messagesWithMeta: MessageWithMeta[] = historyData.map((msg) => ({
          ...msg,
        }))

        setMessages(messagesWithMeta)
      } catch (error) {
        toast.error('Failed to load chat history', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [currentSession])

  // Handlers
  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
  }, [])

  const handleCreateProject = useCallback(async (data: ProjectFormData) => {
    try {
      const newProject = await api.createProject(data)
      setProjects((prev) => [newProject, ...prev])
      setSelectedProjectId(newProject.id)

      toast.success('Project created', {
        description: `"${newProject.title}" is ready to use.`,
      })
    } catch (error) {
      toast.error('Failed to create project', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }, [])

  const handleSelectSession = useCallback((session: Session) => {
    setCurrentSession(session)
  }, [])

  const handleCreateSession = useCallback(
    async (name: string) => {
      if (!selectedProjectId) return

      try {
        const newSession = await api.createSession({
          projectId: selectedProjectId,
          name,
        })
        setSessions((prev) => [newSession, ...prev])
        setCurrentSession(newSession)
        setMessages([])

        toast.success('Session created', {
          description: `"${name}" session is ready.`,
        })
      } catch (error) {
        toast.error('Failed to create session', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
        throw error
      }
    },
    [selectedProjectId],
  )

  const handleExportChat = useCallback(async () => {
    if (!currentSession || !selectedProject) {
      toast.error('No active session to export')
      return
    }
    if (messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    try {
      const markdown = await api.exportChatMarkdown(currentSession.id)
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const safeProject = selectedProject.title.replace(/[^a-z0-9-_]+/gi, '_')
      const safeSession =
        currentSession.name?.replace(/[^a-z0-9-_]+/gi, '_') || 'session'
      link.href = url
      link.download = `unipilot_${safeProject}_${safeSession}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Failed to export chat', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [currentSession, selectedProject, messages])

  const handleSendMessage = useCallback(
    async (message: string, mode: ChatMode) => {
      if (!currentSession) return

      const userMessage = (message ?? '').trim()
      if (!userMessage) return

      // Optimistic update - add user message
      const tempUserMessage: MessageWithMeta = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      }

        setMessages((prev) => [...prev, tempUserMessage])
        setIsSending(true)

        const formatSendError = (error: unknown) => {
          const raw =
            error instanceof Error ? error.message : 'Unexpected error occurred'
          if (raw.startsWith('LLM_TIMEOUT:')) {
            return 'Le modèle est trop lent à répondre. Réessaie dans quelques secondes.'
          }
          if (raw.startsWith('LLM_UPSTREAM:')) {
            return 'Le modèle est indisponible pour le moment. Réessaie bientôt.'
          }
          if (raw.startsWith('LLM_ERROR:')) {
            return 'Erreur inattendue du modèle. Réessaie dans un instant.'
          }
          return raw
        }

try {
  // ✅ backend returns { assistant: { id, content, ... }, antiCheat, meta }
  const response = await api.sendMessage({
    sessionId: currentSession.id,
    mode,
    message: userMessage,
    lang,
  })

  console.log('API Response:', response) // ← Vérifier la structure ici

  const assistantMessage: MessageWithMeta = {
    id: response.assistant.id,
    role: 'assistant',
    content: response.assistant.content,
    createdAt: response.assistant.createdAt,
    meta: response.meta,
    antiCheat: response.antiCheat,
  }

  setMessages((prev) => [...prev, assistantMessage])
 } catch (error) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
        toast.error('Failed to send message', {
            description: formatSendError(error),
          })
      } finally {
        setIsSending(false)
      }
    },
    [currentSession, lang],
  )

  const ui = lang === 'fr'
    ? {
        export: 'Exporter',
        createProject: 'Créer un projet',
        documents: 'Documents',
      }
    : {
        export: 'Export',
        createProject: 'Create project',
        documents: 'Documents',
      }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={() => setProjectDialogOpen(true)}
        isLoading={isLoadingProjects}
        theme={theme}
        onThemeChange={setTheme}
        lang={lang}
        onLangChange={setLang}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        <ChatWindow
          project={selectedProject}
          sessions={sessions}
          currentSession={currentSession}
          messages={messages}
          selectedProjectId={selectedProjectId}
          onSelectSession={handleSelectSession}
          onNewSession={() => setSessionDialogOpen(true)}
          onSendMessage={handleSendMessage}
          onExportChat={handleExportChat}
          onCreateProject={() => setProjectDialogOpen(true)}
          ui={ui}
          lang={lang}
          isLoadingMessages={isLoadingMessages || isLoadingSessions}
          isSending={isSending}
        />
      </main>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={handleCreateProject}
        lang={lang}
      />

      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onSubmit={handleCreateSession}
        projectTitle={selectedProject?.title}
        lang={lang}
      />

      <Toaster position="bottom-right" />
      {process.env.NODE_ENV !== 'production' && (
        <div className="pointer-events-none fixed bottom-4 left-4 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
          API: {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}
        </div>
      )}
      <div className="pointer-events-none fixed bottom-4 right-4 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
        GUISSOU Ali | AI Engineer
      </div>
    </div>
  )
}
