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
  lang?: 'fr' | 'en'
}

const baseModeConfig: Record<ChatMode, { icon: typeof Sparkles }> = {
  coach: { icon: Sparkles },
  planning: { icon: Target },
  debug: { icon: Bug },
}

export function GlowingInput({
  mode,
  onModeChange,
  onSend,
  disabled,
  lang = 'fr',
}: GlowingInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const modeConfig: Record<ChatMode, { label: string; icon: typeof Sparkles; description: string }> =
    lang === 'fr'
      ? {
          coach: {
            label: 'Coach',
            icon: baseModeConfig.coach.icon,
            description: 'Guidage avec indices',
          },
          planning: {
            label: 'Plan',
            icon: baseModeConfig.planning.icon,
            description: 'Structurer ta demarche',
          },
          debug: {
            label: 'Debug',
            icon: baseModeConfig.debug.icon,
            description: 'Trouver et corriger les problemes',
          },
        }
      : {
          coach: {
            label: 'Coach',
            icon: baseModeConfig.coach.icon,
            description: 'Guided learning with hints',
          },
          planning: {
            label: 'Planning',
            icon: baseModeConfig.planning.icon,
            description: 'Help structure your approach',
          },
          debug: {
            label: 'Debug',
            icon: baseModeConfig.debug.icon,
            description: 'Find and fix issues',
          },
        }

  const currentMode = modeConfig[mode]
  const ModeIcon = currentMode.icon

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
      <div className="glow-border" />
      <div className="relative rounded-[28px] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            lang === 'fr'
              ? 'Pose une question, décris ton besoin ou demande un plan...'
              : 'Ask a question, drop a requirement, or request a plan...'
          }
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          disabled={disabled || isSending}
          rows={1}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2 rounded-full border-border/70 bg-background/70 text-xs uppercase tracking-[0.2em] text-muted-foreground',
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

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled || isSending}
            size="sm"
            className="gap-2 rounded-full px-5"
          >
            {isSending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {lang === 'fr' ? 'Envoyer' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
