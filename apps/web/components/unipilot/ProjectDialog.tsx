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
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectFormData) => Promise<void>
  lang?: 'fr' | 'en'
}

export interface ProjectFormData {
  title: string
  level?: string
  domain?: string
  stack?: string
  constraints?: string
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  lang = 'fr',
}: ProjectDialogProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    level: '',
    domain: '',
    stack: '',
    constraints: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ title: '', level: '', domain: '', stack: '', constraints: '' })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {lang === 'fr' ? 'Nouveau projet' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {lang === 'fr'
              ? 'Ajoute un projet et son contexte pour de meilleures réponses.'
              : 'Set up a new project with its context for better AI assistance.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {lang === 'fr' ? 'Titre du projet *' : 'Project Title *'}
            </Label>
            <Input
              id="title"
              placeholder={
                lang === 'fr'
                  ? 'ex: Projet systèmes embarqués'
                  : 'e.g., CS101 Data Structures'
              }
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">{lang === 'fr' ? 'Niveau' : 'Level'}</Label>
              <Input
                id="level"
                placeholder={
                  lang === 'fr' ? 'ex: Licence 2' : 'e.g., Undergraduate'
                }
                value={formData.level}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, level: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">{lang === 'fr' ? 'Domaine' : 'Domain'}</Label>
              <Input
                id="domain"
                placeholder={
                  lang === 'fr' ? 'ex: Informatique' : 'e.g., Computer Science'
                }
                value={formData.domain}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, domain: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stack">{lang === 'fr' ? 'Stack' : 'Tech Stack'}</Label>
            <Input
              id="stack"
              placeholder={
                lang === 'fr'
                  ? 'ex: Python, React, PostgreSQL'
                  : 'e.g., Python, React, PostgreSQL'
              }
              value={formData.stack}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stack: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">
              {lang === 'fr' ? 'Contraintes / Notes' : 'Constraints / Notes'}
            </Label>
            <Textarea
              id="constraints"
              placeholder={
                lang === 'fr'
                  ? "ex: Utiliser la récursivité, pas de libs externes"
                  : 'e.g., Must use recursion, no external libraries'
              }
              value={formData.constraints}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, constraints: e.target.value }))
              }
              rows={3}
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
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {lang === 'fr' ? 'Créer' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
