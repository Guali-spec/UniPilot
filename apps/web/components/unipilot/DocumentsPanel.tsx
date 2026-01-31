'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Document } from '@/types/unipilot'
import { api } from '@/lib/api'

interface DocumentsPanelProps {
  projectId: string | null
  lang?: 'fr' | 'en'
}

const MAX_FILE_MB = 20

export function DocumentsPanel({ projectId, lang = 'fr' }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocuments = useCallback(async () => {
    if (!projectId) {
      setDocuments([])
      return
    }
    setIsLoading(true)
    try {
      const data = await api.getDocuments(projectId)
      setDocuments(data)
    } catch (error) {
      toast.error('Failed to load documents', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  const onPickFile = useCallback(() => {
    if (!projectId) {
      toast.error(lang === 'fr' ? 'Sélectionne un projet' : 'Select a project first')
      return
    }
    fileInputRef.current?.click()
  }, [projectId])

  const uploadFile = useCallback(
    async (file: File) => {
      if (!projectId) return
      if (file.type !== 'application/pdf') {
        toast.error(lang === 'fr' ? 'PDF uniquement' : 'Only PDF files are supported')
        return
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(
          lang === 'fr'
            ? `Fichier trop volumineux (max ${MAX_FILE_MB}MB)`
            : `File too large (max ${MAX_FILE_MB}MB)`,
        )
        return
      }

      setIsUploading(true)
      try {
        await api.uploadDocument(projectId, file)
        toast.success(lang === 'fr' ? 'Document envoyé' : 'Document uploaded')
        await loadDocuments()
      } catch (error) {
        toast.error(lang === 'fr' ? 'Upload échoué' : 'Upload failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsUploading(false)
      }
    },
    [projectId, loadDocuments],
  )

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      await uploadFile(file)
      event.target.value = ''
    },
    [uploadFile],
  )

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      const file = event.dataTransfer.files?.[0]
      if (!file) return
      await uploadFile(file)
    },
    [uploadFile],
  )

  const uploadLabel = useMemo(() => {
    if (!projectId) return lang === 'fr' ? 'Sélectionne un projet' : 'Select a project'
    if (isUploading) return lang === 'fr' ? 'Envoi…' : 'Uploading...'
    return lang === 'fr' ? 'Clique ou dépose un PDF ici' : 'Click or drop a PDF here'
  }, [projectId, isUploading, lang])

  return (
    <Card className="h-full border-border/60 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle>{lang === 'fr' ? 'Documents du projet' : 'Project Documents'}</CardTitle>
        <CardDescription>
          {lang === 'fr'
            ? 'Ajoute des PDFs pour enrichir les réponses avec des citations.'
            : 'Upload PDFs to enrich the assistant with citations.'}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        <div
          className={cn(
            'flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center text-sm',
            isDragOver ? 'border-primary bg-primary/5' : 'border-border/70',
          )}
          onClick={onPickFile}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onPickFile()
            }
          }}
        >
          <p className="font-medium">{uploadLabel}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {lang === 'fr'
              ? `Max ${MAX_FILE_MB}MB • PDF uniquement`
              : `Max ${MAX_FILE_MB}MB • PDF only`}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'fr' ? 'Chargement des documents…' : 'Loading documents...'}
            </p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Aucun document. Ajoute un PDF pour activer le RAG.'
                : 'No documents yet. Upload a PDF to start using RAG.'}
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(doc.size / 1024)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'rounded-full text-xs',
                        doc.status === 'ready' && 'bg-emerald-100 text-emerald-700',
                        doc.status === 'failed' && 'bg-rose-100 text-rose-700',
                      )}
                    >
                      {doc.status}
                    </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await api.deleteDocument(doc.id)
                        setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                      } catch (error) {
                        toast.error(lang === 'fr' ? 'Suppression échouée' : 'Failed to delete document', {
                          description:
                            error instanceof Error ? error.message : 'Unknown error',
                        })
                      }
                    }}
                  >
                    {lang === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
