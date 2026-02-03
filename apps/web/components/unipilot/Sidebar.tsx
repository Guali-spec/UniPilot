'use client'

import { FolderKanban, Globe, Moon, Plus, Sparkles, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Project, UiLanguage } from '@/types/unipilot'

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (projectId: string) => void
  onNewProject: () => void
  isLoading?: boolean
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  lang: UiLanguage
  onLangChange: (lang: UiLanguage) => void
  className?: string
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  isLoading,
  theme,
  onThemeChange,
  lang,
  onLangChange,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-72 flex-col border-r border-border/70 bg-sidebar/80 backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">UniPilot</p>
            <p className="text-xs text-muted-foreground">Academic copilot</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={theme === 'light' ? 'default' : 'outline'}
            className="h-8 w-8 rounded-full"
            onClick={() => onThemeChange('light')}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="h-8 w-8 rounded-full"
            onClick={() => onThemeChange('dark')}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <Button
          onClick={onNewProject}
          className="w-full justify-start gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" />
          {lang === 'fr' ? 'Nouveau projet' : 'New project'}
        </Button>
      </div>

      <div className="px-5 pb-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {lang === 'fr' ? 'Projets' : 'Projects'}
        </span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {lang === 'fr' ? 'Aucun projet' : 'No projects yet'}
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition-colors',
                  selectedProjectId === project.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                )}
              >
                <FolderKanban className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{project.title}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t border-border/60 px-4 py-4">
        <div className="flex items-center justify-between rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
          <span className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            {lang === 'fr' ? 'Langue' : 'Language'}
          </span>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px]',
                lang === 'fr'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onLangChange('fr')}
            >
              FR
            </button>
            <button
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px]',
                lang === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onLangChange('en')}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
