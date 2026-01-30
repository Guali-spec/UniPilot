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
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  return isInline ? (
                    <code
                      className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs"
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
                  return <p className="mb-2 last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="mb-2 list-disc pl-4">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="mb-2 list-decimal pl-4">{children}</ol>
                },
                h1({ children }) {
                  return <h1 className="mb-2 text-lg font-bold">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="mb-2 text-base font-bold">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="mb-2 text-sm font-bold">{children}</h3>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Meta info for assistant messages */}
        {!isUser && (meta || antiCheat) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
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
