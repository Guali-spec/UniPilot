'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, MessageSquarePlus, Plus } from 'lucide-react'
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
import type { Project, Session, ChatMessage, ChatMode, ChatMeta, AntiCheatResult } from '@/types/unipilot'

interface MessageWithMeta extends ChatMessage {
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

interface ChatWindowProps {
  project: Project | null
  sessions: Session[]
  currentSession: Session | null
  messages: MessageWithMeta[]
  onSelectSession: (session: Session) => void
  onNewSession: () => void
  onSendMessage: (message: string, mode: ChatMode) => Promise<void>
  onCreateProject: () => void
  isLoadingMessages?: boolean
  isSending?: boolean
}

export function ChatWindow({
  project,
  sessions,
  currentSession,
  messages,
  onSelectSession,
  onNewSession,
  onSendMessage,
  onCreateProject,
  isLoadingMessages,
  isSending,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<ChatMode>('coach')

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Empty state - no project selected
  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-8">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquarePlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to UniPilot</CardTitle>
            <CardDescription className="text-base">
              Your AI-powered academic assistant. Create your first project to get started with intelligent tutoring.
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button onClick={onCreateProject} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          </div>
        </Card>
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
            <p className="text-sm text-muted-foreground">No active session</p>
          </div>
        </header>

        {/* Empty session state */}
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="max-w-sm text-center">
            <CardHeader>
              <CardTitle className="text-lg">Start a Chat Session</CardTitle>
              <CardDescription>
                Create a session to begin chatting about your project.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button onClick={onNewSession} className="w-full gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                New Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-semibold text-foreground">{project.title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
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
        </div>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Chat
        </Button>
      </header>

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-4 p-6">
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
              <p>Start a conversation by typing a message below.</p>
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
      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <GlowingInput
            mode={mode}
            onModeChange={setMode}
            onSend={onSendMessage}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  )
}
