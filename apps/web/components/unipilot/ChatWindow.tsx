'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileText, MessageSquarePlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { GlowingInput } from './GlowingInput'
import { DocumentsPanel } from './DocumentsPanel'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Project, Session, ChatMessage, ChatMode, ChatMeta, AntiCheatResult, UiLanguage } from '@/types/unipilot'

interface MessageWithMeta extends ChatMessage {
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

interface ChatWindowProps {
  project: Project | null
  sessions: Session[]
  currentSession: Session | null
  messages: MessageWithMeta[]
  selectedProjectId: string | null
  onSelectSession: (session: Session) => void
  onNewSession: () => void
  onSendMessage: (message: string, mode: ChatMode) => Promise<void>
  onExportChat: () => void
  onCreateProject: () => void
  ui: {
    export: string
    createProject: string
    documents: string
  }
  lang: UiLanguage
  isLoadingMessages?: boolean
  isSending?: boolean
}

export function ChatWindow({
  project,
  sessions,
  currentSession,
  messages,
  selectedProjectId,
  onSelectSession,
  onNewSession,
  onSendMessage,
  onExportChat,
  onCreateProject,
  ui,
  lang,
  isLoadingMessages,
  isSending,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<ChatMode>('coach')

  // Auto-scroll to bottom when messages change
 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}, [messages, isSending])


  // Empty state - no project selected
  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-8">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquarePlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>
              {lang === 'fr' ? 'Bienvenue sur UniPilot' : 'Welcome to UniPilot'}
            </CardTitle>
            <CardDescription className="text-base">
              {lang === 'fr'
                ? 'Ton assistant académique IA. Crée un premier projet pour commencer.'
                : 'Your AI-powered academic assistant. Create your first project to get started with intelligent tutoring.'}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button onClick={onCreateProject} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              {lang === 'fr' ? 'Créer un premier projet' : 'Create Your First Project'}
            </Button>
          </div>
        </Card>
        <div ref={bottomRef} />

      </div>
    )
  }

  // No sessions for the project
  if (sessions.length === 0 || !currentSession) {
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="font-semibold text-foreground">{project.title}</h1>
            <p className="text-sm text-muted-foreground">
              {lang === 'fr' ? 'Aucune session active' : 'No active session'}
            </p>
          </div>
        </header>

        {/* Empty session state */}
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="max-w-sm text-center">
            <CardHeader>
              <CardTitle className="text-lg">
                {lang === 'fr' ? 'Démarrer une session' : 'Start a Chat Session'}
              </CardTitle>
              <CardDescription>
                {lang === 'fr'
                  ? 'Crée une session pour discuter de ton projet.'
                  : 'Create a session to begin chatting about your project.'}
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button onClick={onNewSession} className="w-full gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                {lang === 'fr' ? 'Nouvelle session' : 'New Session'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {lang === 'fr' ? 'Projet actif' : 'Active project'}
            </p>
            <h1 className="text-lg font-semibold text-foreground">{project.title}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                {currentSession.name}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {sessions.map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={session.id === currentSession.id ? 'bg-accent' : ''}
                >
                  {session.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={onNewSession} className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <FileText className="h-4 w-4" />
                {ui.documents}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="border-b border-border/60">
                <SheetTitle>{lang === 'fr' ? 'Documents du projet' : 'Project documents'}</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <DocumentsPanel projectId={selectedProjectId} lang={lang} />
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={onExportChat}
          >
            <Download className="h-4 w-4" />
            {ui.export}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Messages area */}
        <ScrollArea className="h-full flex-1 min-h-0">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
          {isLoadingMessages ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`h-16 w-64 animate-pulse rounded-2xl ${
                      i % 2 === 0 ? 'bg-primary/20' : 'bg-muted'
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>
                {lang === 'fr'
                  ? 'Commencez une conversation en écrivant un message.'
                  : 'Start a conversation by typing a message below.'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                meta={message.meta}
                antiCheat={message.antiCheat}
              />
            ))
          )}

          {/* Typing indicator while sending */}
          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="sticky bottom-0 z-20 border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div className="mx-auto max-w-3xl">
            <GlowingInput
              mode={mode}
              onModeChange={setMode}
              onSend={onSendMessage}
              lang={lang}
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
