'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/unipilot/Sidebar'
import { ChatWindow } from '@/components/unipilot/ChatWindow'
import { ProjectDialog, type ProjectFormData } from '@/components/unipilot/ProjectDialog'
import { SessionDialog } from '@/components/unipilot/SessionDialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Project, Session, ChatMessage, ChatMode, ChatMeta, AntiCheatResult } from '@/types/unipilot'

interface MessageWithMeta extends ChatMessage {
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

export default function UniPilotPage() {
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
  }, [selectedProjectId])

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

      try {
        const response = await api.sendMessage({
          sessionId: currentSession.id,
          mode,
          message: userMessage,
        })

        // ✅ backend returns { assistant: { id, content, ... }, antiCheat, meta }
        const assistantRecord = response.assistant
        const assistantText =
          typeof assistantRecord === 'string' ? assistantRecord : assistantRecord?.content ?? ''

        const assistantMessage: MessageWithMeta = {
          id: assistantRecord?.id ?? `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
          createdAt: assistantRecord?.createdAt ?? new Date().toISOString(),
          meta: response.meta,
          antiCheat: response.antiCheat,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
        toast.error('Failed to send message', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsSending(false)
      }
    },
    [currentSession],
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={() => setProjectDialogOpen(true)}
        isLoading={isLoadingProjects}
      />

      <main className="flex-1">
        <ChatWindow
          project={selectedProject}
          sessions={sessions}
          currentSession={currentSession}
          messages={messages}
          onSelectSession={handleSelectSession}
          onNewSession={() => setSessionDialogOpen(true)}
          onSendMessage={handleSendMessage}
          onCreateProject={() => setProjectDialogOpen(true)}
          isLoadingMessages={isLoadingMessages || isLoadingSessions}
          isSending={isSending}
        />
      </main>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={handleCreateProject}
      />

      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onSubmit={handleCreateSession}
        projectTitle={selectedProject?.title}
      />

      <Toaster position="bottom-right" />
    </div>
  )
}
