'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bug, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ChatMode } from '@/types/unipilot'

interface GlowingInputProps {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
  onSend: (message: string, mode: ChatMode) => Promise<void>
  disabled?: boolean
}

const modeConfig: Record<ChatMode, { label: string; icon: typeof Sparkles; description: string }> = {
  coach: {
    label: 'Coach',
    icon: Sparkles,
    description: 'Guided learning with hints',
  },
  planning: {
    label: 'Planning',
    icon: Target,
    description: 'Help structure your approach',
  },
  debug: {
    label: 'Debug',
    icon: Bug,
    description: 'Find and fix issues',
  },
}

export function GlowingInput({
  mode,
  onModeChange,
  onSend,
  disabled,
}: GlowingInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentMode = modeConfig[mode]
  const ModeIcon = currentMode.icon

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = async () => {
    if (!message.trim() || isSending || disabled) return

    const currentMessage = message.trim()
    setMessage('')
    setIsSending(true)

    try {
      await onSend(currentMessage, mode)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="glow-container relative">
      {/* Animated glow border */}
      <div className="glow-border" />
      
      {/* Inner content */}
      <div className="relative flex flex-col gap-3 rounded-xl bg-card p-3">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or describe your problem..."
          className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          disabled={disabled || isSending}
          rows={1}
        />

        <div className="flex items-center justify-between">
          {/* Mode selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 text-muted-foreground hover:text-foreground',
                  disabled && 'pointer-events-none opacity-50'
                )}
              >
                <ModeIcon className="h-4 w-4" />
                {currentMode.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {Object.entries(modeConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onModeChange(key as ChatMode)}
                    className={cn(
                      'flex flex-col items-start gap-0.5',
                      mode === key && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{config.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled || isSending}
            size="sm"
            className="gap-2"
          >
            {isSending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
