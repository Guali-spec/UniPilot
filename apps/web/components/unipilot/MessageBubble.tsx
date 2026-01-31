'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage, ChatMeta, AntiCheatResult } from '@/types/unipilot'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageBubbleProps {
  message: ChatMessage
  meta?: ChatMeta
  antiCheat?: AntiCheatResult
}

export function MessageBubble({ message, meta, antiCheat }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[82%] rounded-3xl px-5 py-4 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-border/70 bg-card text-foreground'
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className={cn(isUser ? 'text-primary-foreground/70' : '')}>
            {isUser ? 'You' : 'UniPilot'}
          </span>
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  return isInline ? (
                    <code
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="!my-2 !rounded-lg !text-xs"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  )
                },
                p({ children }) {
                  return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="mb-3 list-disc pl-5">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="mb-3 list-decimal pl-5">{children}</ol>
                },
                h1({ children }) {
                  return <h1 className="mb-3 text-lg font-semibold">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="mb-3 text-base font-semibold">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="mb-3 text-sm font-semibold">{children}</h3>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Meta info for assistant messages */}
        {!isUser && (meta || antiCheat) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {meta && (
              <>
                <span className="font-mono">{meta.model}</span>
                <span className="opacity-50">|</span>
                <span>{meta.latencyMs}ms</span>
              </>
            )}
            {antiCheat && (
              <>
                {meta && <span className="opacity-50">|</span>}
                <Badge
                  variant={
                    antiCheat.label === 'allowed'
                      ? 'default'
                      : antiCheat.label === 'borderline'
                        ? 'secondary'
                        : 'destructive'
                  }
                  className={cn(
                    'text-xs',
                    antiCheat.label === 'allowed' && 'bg-emerald-600 text-white hover:bg-emerald-700',
                    antiCheat.label === 'borderline' && 'bg-amber-600 text-white hover:bg-amber-700'
                  )}
                >
                  {antiCheat.label}
                </Badge>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
