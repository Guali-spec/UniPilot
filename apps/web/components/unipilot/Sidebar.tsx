'use client'

import { FolderKanban, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/unipilot'

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (projectId: string) => void
  onNewProject: () => void
  isLoading?: boolean
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  isLoading,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FolderKanban className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">UniPilot</span>
        </div>
      </div>

      <div className="px-3 py-3">
        <Button
          onClick={onNewProject}
          variant="outline"
          className="w-full justify-start gap-2 border-dashed bg-transparent"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="px-3 pb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Projects
        </span>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No projects yet
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  selectedProjectId === project.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <FolderKanban className="h-4 w-4 shrink-0 opacity-60" />
                <span className="truncate">{project.title}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
