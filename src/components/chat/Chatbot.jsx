import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Star,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import { SUGGESTED_QUESTIONS, getKnowledgeBaseAnswer } from '../../data/chatbotKnowledge'
import { personalInfo } from '../../data/personal'
import { cvLinks } from '../../data/cv'
import { useNavigation } from '../../context/NavigationContext'

function renderMarkdown(text, navigateTo) {
  // Simple, safe Markdown parser for links, bold, and line breaks
  const parts = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    parts.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) })
  }

  return parts.map((part, index) => {
    if (part.type === 'link') {
      const isInternal = part.href.startsWith('#')
      if (isInternal) {
        return (
          <button
            key={index}
            onClick={() => {
              if (navigateTo) {
                navigateTo(part.href.substring(1))
              }
            }}
            className="font-semibold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {part.label}
          </button>
        )
      }
      return (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {part.label}
          <ExternalLink size={11} className="inline" />
        </a>
      )
    }

    // Process bold text
    const boldParts = part.content.split(/\*\*([^*]+)\*\*/g)
    return (
      <span key={index}>
        {boldParts.map((bPart, bIdx) =>
          bIdx % 2 === 1 ? <strong key={bIdx} className="font-semibold">{bPart}</strong> : bPart
        )}
      </span>
    )
  })
}

export default function Chatbot() {
  const { navigateTo } = useNavigation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I'm **Urooj Khadim's Portfolio AI Assistant**. I can answer any questions about her projects, skills, full-stack experience, Flutter applications, or how to contact her.\n\nHow can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, messages])

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call backend /api/chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const text = await response.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch {
        data = {}
      }
      const botReply = data.reply || getKnowledgeBaseAnswer(query, messages)

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      console.warn('Backend API request fell back to verified client-side knowledge engine:', err)
      // Instant intelligent knowledge-base fallback (guarantees 100% uptime)
      const fallbackReply = getKnowledgeBaseAnswer(query, messages)
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackReply,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat reset. Ask me anything about Urooj's Flutter projects, web applications, technical skills, or background!`,
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/35 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              aria-label="Open personal AI assistant chat"
            >
              <Bot size={26} className="transition-transform group-hover:rotate-6" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </span>
            </button>
            <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-xl bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm sm:block dark:bg-white/90 dark:text-slate-900">
              Chat with Urooj&apos;s AI Assistant
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="glass-card flex h-[min(650px,84vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/80 shadow-2xl dark:border-slate-700/80"
            role="dialog"
            aria-modal="true"
            aria-label="AI Portfolio Assistant Chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 py-3.5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                  <Bot size={20} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Urooj&apos;s AI Assistant
                  </h3>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Online · Verified Knowledge Base
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  title="Clear conversation"
                  aria-label="Clear chat history"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                        : 'border border-slate-200/80 bg-white/90 text-slate-800 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {renderMarkdown(msg.text, navigateTo)}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                    <Bot size={14} />
                  </div>
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="border-t border-slate-200/60 bg-slate-50/60 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Star size={11} className="text-indigo-500" /> Suggested queries:
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading}
                    className="shrink-0 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="border-t border-slate-200/70 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about Urooj..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-900 sm:text-sm"
                  aria-label="Ask a question about Urooj"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
