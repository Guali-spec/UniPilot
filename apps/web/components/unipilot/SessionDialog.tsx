'use client'

import React from "react"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface SessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => Promise<void>
  projectTitle?: string
  lang?: 'fr' | 'en'
}

export function SessionDialog({
  open,
  onOpenChange,
  onSubmit,
  projectTitle,
  lang = 'fr',
}: SessionDialogProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(name.trim())
      setName('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {lang === 'fr' ? 'Nouvelle session' : 'New Chat Session'}
          </DialogTitle>
          <DialogDescription>
            {projectTitle
              ? lang === 'fr'
                ? `Nouvelle session pour "${projectTitle}"`
                : `Start a new session for "${projectTitle}"`
              : lang === 'fr'
                ? 'Crée une session pour organiser tes échanges.'
                : 'Create a named session to organize your conversations.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">
              {lang === 'fr' ? 'Nom de la session' : 'Session Name'}
            </Label>
            <Input
              id="session-name"
              placeholder={
                lang === 'fr'
                  ? 'ex: Devoir 3 - Arbres'
                  : 'e.g., Homework 3 - Binary Trees'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {lang === 'fr' ? 'Créer' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
