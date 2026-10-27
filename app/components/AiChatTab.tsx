"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { sound } from "../audio";
import {
  Bot,
  Send,
  User,
  Trash2,
  Copy,
  Check,
  Plus,
  ChevronDown,
  Code2,
  Lightbulb,
  BookOpen,
  Cpu,
  Globe,
  Database,
  Menu,
  X,
  Square,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Bug,
  GraduationCap,
  RotateCcw,
  Compass,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  isStreaming?: boolean;
  isError?: boolean;
}

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface AiChatTabProps {
  onExit?: () => void;
}

// ─── Beginner Prompt Categories ──────────────────────────────────────────────
interface PromptItem {
  category: string;
  categoryLabel: string;
  badgeClass: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  query: string;
}

const PROMPT_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "basics", label: "Python & Coding" },
  { id: "concepts", label: "Explain Simply" },
  { id: "dsa", label: "Data Structures" },
  { id: "database", label: "SQL & Databases" },
  { id: "hardware", label: "CpE & Hardware" },
  { id: "debug", label: "Debug Help" },
];

const SUGGESTED_PROMPTS: PromptItem[] = [
  {
    category: "basics",
    categoryLabel: "Python & Coding",
    badgeClass: "badge-blue",
    icon: <Code2 className="w-4 h-4" />,
    label: "How do loops work in Python?",
    description: "Learn for-loops, while-loops, and range() with step-by-step beginner code",
    query: "Explain how loops work in Python for a beginner student. Compare 'for' loops and 'while' loops with clear examples, and explain when to use each.",
  },
  {
    category: "concepts",
    categoryLabel: "Explain Simply (ELI5)",
    badgeClass: "badge-purple",
    icon: <Lightbulb className="w-4 h-4" />,
    label: "What is Object-Oriented Programming?",
    description: "Classes, objects, and the 4 pillars (Inheritance, Polymorphism...) in plain English",
    query: "Explain Object-Oriented Programming (OOP) in simple, beginner-friendly terms using everyday analogies. Walk through Encapsulation, Abstraction, Inheritance, and Polymorphism with easy code snippets.",
  },
  {
    category: "dsa",
    categoryLabel: "Data Structures",
    badgeClass: "badge-emerald",
    icon: <BookOpen className="w-4 h-4" />,
    label: "Stack vs Queue — made easy",
    description: "LIFO vs FIFO explained with real-life analogies (cafeteria line vs plates)",
    query: "Explain the difference between a Stack and a Queue in simple terms. Include real-life analogies (like a stack of cafeteria trays vs a checkout line) and practical use cases in software.",
  },
  {
    category: "database",
    categoryLabel: "SQL & Databases",
    badgeClass: "badge-rose",
    icon: <Database className="w-4 h-4" />,
    label: "SQL JOIN types with simple diagrams",
    description: "Understand INNER, LEFT, RIGHT, and FULL joins without memorizing formulas",
    query: "Explain SQL JOIN types (INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN) with simple ASCII table diagrams and real-world student database examples.",
  },
  {
    category: "hardware",
    categoryLabel: "CpE & Architecture",
    badgeClass: "badge-amber",
    icon: <Cpu className="w-4 h-4" />,
    label: "How does a CPU execute code?",
    description: "The Fetch-Decode-Execute cycle and how RAM, Cache, and CPU work together",
    query: "Explain how a computer processor (CPU) runs instructions from RAM. Break down the Fetch-Decode-Execute cycle in easy-to-understand terms for Computer Engineering students.",
  },
  {
    category: "debug",
    categoryLabel: "Debug Help",
    badgeClass: "badge-cyan",
    icon: <Bug className="w-4 h-4" />,
    label: "Fix 'Index Out of Bounds' errors",
    description: "Why list index out of range occurs and the exact checklist to solve it",
    query: "Why does the error 'IndexOutOfBoundsException' or 'list index out of range' happen in programming? Give clear examples in Python and Java showing how to fix and prevent it.",
  },
  {
    category: "basics",
    categoryLabel: "Web Development",
    badgeClass: "badge-blue",
    icon: <Globe className="w-4 h-4" />,
    label: "HTML, CSS & JavaScript together",
    description: "How the structure, styling, and logic interact in a web page",
    query: "Explain how HTML, CSS, and JavaScript collaborate to build a website using the analogy of a house (structure, paint, electricity). Show a tiny working example.",
  },
  {
    category: "concepts",
    categoryLabel: "Algorithms",
    badgeClass: "badge-purple",
    icon: <Sparkles className="w-4 h-4" />,
    label: "What is Big-O Notation?",
    description: "O(1), O(n), O(n²) explained simply without scary mathematics",
    query: "Explain Big-O Notation in simple English for beginner CS students. Explain O(1), O(log n), O(n), and O(n²) with intuitive everyday examples like looking up a phone book.",
  },
];

const BEGINNER_FOLLOW_UPS = [
  { label: "Explain simpler", prompt: "Could you please explain that in even simpler, beginner terms with an everyday analogy?" },
  { label: "Show code example", prompt: "Can you provide a clear, beginner-friendly code example with comments illustrating this?" },
  { label: "Quiz me on this", prompt: "Can you ask me 1 beginner-friendly multiple-choice quiz question to test my understanding of what you just explained?" },
  { label: "Key takeaways", prompt: "Please summarize the top 3 most important key takeaways from this in concise bullet points." },
];

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chat-code-block" role="region" aria-label={`Code snippet in ${language || "plain text"}`}>
      <div className="chat-code-header">
        <span className="chat-code-lang">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="chat-code-copy"
          aria-label={copied ? "Code copied to clipboard" : "Copy code snippet"}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy code"}</span>
        </button>
      </div>
      <pre className="chat-code-pre"><code>{code}</code></pre>
    </div>
  );
}

// ─── Inline Markdown ──────────────────────────────────────────────────────────
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|~~(.+?)~~/g;
  let last = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={idx++} className="chat-inline-bold">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<em key={idx++} className="chat-inline-em">{match[2]}</em>);
    } else if (match[3] !== undefined) {
      parts.push(<code key={idx++} className="chat-inline-code">{match[3]}</code>);
    } else if (match[4] !== undefined) {
      parts.push(<s key={idx++} className="chat-inline-strike">{match[4]}</s>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ─── Full Markdown Renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string, isStreaming?: boolean): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let k = 0;
  const key = () => k++;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const codeMatch = line.match(/^```(\w*)$/);
    if (codeMatch) {
      const lang = codeMatch[1] || "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={key()} code={codeLines.join("\n")} language={lang} />);
      i++;
      continue;
    }

    // H2 / H3 / H1
    if (/^###\s/.test(line)) {
      elements.push(<h3 key={key()} className="chat-h3">{renderInlineMarkdown(line.replace(/^###\s/, ""))}</h3>);
      i++; continue;
    }
    if (/^##\s/.test(line)) {
      elements.push(<h2 key={key()} className="chat-h2">{renderInlineMarkdown(line.replace(/^##\s/, ""))}</h2>);
      i++; continue;
    }
    if (/^#\s/.test(line)) {
      elements.push(<h1 key={key()} className="chat-h1">{renderInlineMarkdown(line.replace(/^#\s/, ""))}</h1>);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key()} className="chat-hr" />);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(<blockquote key={key()} className="chat-blockquote">{renderInlineMarkdown(line.slice(2))}</blockquote>);
      i++; continue;
    }

    // Table
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!/^\|[-|\s:]+\|$/.test(lines[i])) tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length > 0) {
        const headers = tableLines[0].split("|").filter(Boolean).map((h) => h.trim());
        const rows = tableLines.slice(1).map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));
        elements.push(
          <div key={key()} className="chat-table-wrap">
            <table className="chat-table">
              <thead>
                <tr>{headers.map((h, hi) => <th key={hi} className="chat-th">{renderInlineMarkdown(h)}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="chat-tr">
                    {row.map((cell, ci) => <td key={ci} className="chat-td">{renderInlineMarkdown(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Unordered list
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={key()} className="chat-ul">
          {items.map((item, ii) => (
            <li key={ii} className="chat-li">
              <span className="chat-li-dot" aria-hidden="true">•</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      const startNum = parseInt(line.match(/^(\d+)/)![1], 10);
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key()} className="chat-ol" start={startNum}>
          {items.map((item, ii) => (
            <li key={ii} className="chat-li">
              <span className="chat-li-num" aria-hidden="true">{startNum + ii}.</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") { elements.push(<div key={key()} className="chat-spacer" />); i++; continue; }

    // Paragraph
    elements.push(<p key={key()} className="chat-p">{renderInlineMarkdown(line)}</p>);
    i++;
  }

  return elements;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
interface MessageBubbleProps {
  msg: Message;
  isLastAi?: boolean;
  onQuickPrompt?: (prompt: string) => void;
}

function MessageBubble({ msg, isLastAi, onQuickPrompt }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.sender === "user") {
    return (
      <div className="chat-user-row" role="article" aria-label="Your message">
        <div className="chat-user-content">
          <div className="chat-user-bubble">{msg.text}</div>
          <div className="chat-msg-meta chat-meta-right">
            <span>{msg.time}</span>
          </div>
        </div>
        <div className="chat-avatar chat-avatar-user" aria-hidden="true">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-ai-row group" role="article" aria-label="ScholarBot AI response">
      <div className="chat-avatar chat-avatar-ai" aria-hidden="true">
        <Bot className="w-4 h-4" />
        {msg.isStreaming && <span className="chat-streaming-dot" />}
      </div>
      <div className="chat-ai-content">
        <div className={`chat-ai-bubble ${msg.isError ? "error" : ""}`}>
          {msg.text === "" && msg.isStreaming ? (
            <div className="chat-thinking" aria-label="ScholarBot is thinking">
              <span className="chat-dot" style={{ animationDelay: "0ms" }} />
              <span className="chat-dot" style={{ animationDelay: "150ms" }} />
              <span className="chat-dot" style={{ animationDelay: "300ms" }} />
              <span className="chat-thinking-text">Formulating answer…</span>
            </div>
          ) : (
            <div className="chat-md-body">
              {renderMarkdown(msg.text, msg.isStreaming)}
              {msg.isStreaming && msg.text !== "" && <span className="chat-cursor" aria-hidden="true" />}
            </div>
          )}
        </div>

        {/* Message meta actions */}
        <div className="chat-msg-meta flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{msg.time}</span>
            {!msg.isStreaming && !msg.isError && msg.text && (
              <button
                type="button"
                onClick={handleCopy}
                className="chat-copy-btn"
                aria-label="Copy AI response"
                title="Copy entire response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Beginner follow-up suggestion chips */}
        {isLastAi && !msg.isStreaming && !msg.isError && msg.text && onQuickPrompt && (
          <div className="chat-followups-container" role="region" aria-label="Suggested follow-up questions">
            <span className="chat-followups-title">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Beginner Next Steps:</span>
            </span>
            <div className="chat-followups-chips">
              {BEGINNER_FOLLOW_UPS.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chat-followup-chip"
                  onClick={() => onQuickPrompt(f.prompt)}
                  title={f.prompt}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conversation Storage ─────────────────────────────────────────────────────
const STORAGE_KEY = "scholarsync_chat_v2";

function loadConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveConversations(c: Conversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c.slice(-25))); }
  catch { }
}
function generateTitle(msgs: Message[]): string {
  const first = msgs.find((m) => m.sender === "user");
  if (!first) return "New Chat";
  const t = first.text.trim();
  return t.length > 36 ? t.slice(0, 36) + "…" : t;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiChatTab({ onExit }: AiChatTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-open sidebar on wide screens (desktop) and keep closed on mobile/tablet
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Load saved history
  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  // Global ESC key listener to exit chat or close mobile sidebar
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sidebarOpen && window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else if (onExit) {
          e.preventDefault();
          onExit();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onExit, sidebarOpen]);

  // Auto-save conversations
  useEffect(() => {
    if (!activeConvId || messages.length === 0) return;
    const clean = messages.filter((m) => !m.isStreaming || m.text !== "");
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: clean, title: generateTitle(clean) } : c
      );
      saveConversations(updated);
      return updated;
    });
  }, [messages, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150);
  };

  const buildHistory = useCallback((msgs: Message[]): GeminiMessage[] =>
    msgs
      .filter((m) => !m.isError && !(m.isStreaming && m.text === ""))
      .map((m) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] })),
    []
  );

  const startNewChat = () => {
    const id = `conv-${Date.now()}`;
    const conv: Conversation = { id, title: "New Chat", messages: [], createdAt: Date.now() };
    setConversations((prev) => { const u = [...prev, conv]; saveConversations(u); return u; });
    setActiveConvId(id);
    setMessages([]);
    sound.playClick();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const loadConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setActiveConvId(id);
    setMessages(conv.messages);
    sound.playClick();
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setConversations((prev) => { const u = prev.filter((c) => c.id !== id); saveConversations(u); return u; });
    if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMsg).trim();
    if (!query || isStreaming) return;
    sound.playClick();
    if (!textToSend) setInputMsg("");

    // Ensure active conversation
    let convId = activeConvId;
    if (!convId) {
      convId = `conv-${Date.now()}`;
      const conv: Conversation = { id: convId, title: query.slice(0, 36), messages: [], createdAt: Date.now() };
      setConversations((prev) => { const u = [...prev, conv]; saveConversations(u); return u; });
      setActiveConvId(convId);
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `u-${Date.now()}`;
    const aiMsgId = `ai-${Date.now() + 1}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: query, time: now },
      { id: aiMsgId, sender: "ai", text: "", time: now, isStreaming: true },
    ]);
    setIsStreaming(true);

    const history: GeminiMessage[] = [
      ...buildHistory(messages),
      { role: "user", parts: [{ text: query }] },
    ];

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        let errMsg = "Something went wrong. Please try again.";
        try { const e = await res.json(); errMsg = e.error || errMsg; } catch { }
        setMessages((prev) =>
          prev.map((m) => m.id === aiMsgId ? { ...m, text: `❌ ${errMsg}`, isStreaming: false, isError: true } : m)
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, text: accumulated, isStreaming: true } : m));
      }

      sound.playSuccess();
      setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, text: accumulated, isStreaming: false } : m));
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, text: "❌ Connection error. Check your network and try again.", isStreaming: false, isError: true } : m)
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => m.isStreaming ? { ...m, isStreaming: false } : m));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMsg(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const isEmpty = messages.length === 0;

  const filteredPrompts = selectedCategory === "all"
    ? SUGGESTED_PROMPTS
    : SUGGESTED_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <>
      {/* ── Scoped CSS using theme variables ── */}
      <style>{`
        /* ── Layout ── */
        .chat-root {
          display: flex;
          height: calc(100vh - var(--topbar-h));
          background: var(--bg);
          overflow: hidden;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        /* ── Sidebar ── */
        .chat-sidebar {
          width: 270px;
          min-width: 270px;
          max-width: 270px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease, min-width 0.25s ease, opacity 0.2s ease;
          overflow: hidden;
          z-index: 15;
        }
        .chat-sidebar.closed {
          width: 0;
          min-width: 0;
          opacity: 0;
          pointer-events: none;
        }
        .chat-sidebar-inner {
          width: 270px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 14px 12px;
          gap: 10px;
        }
        .chat-sidebar-head-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .chat-sidebar-close-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .chat-sidebar-close-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text);
        }
        .chat-sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 45;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chat-new-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--accent);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
        }
        .chat-new-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .chat-new-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        .chat-conv-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
          padding-right: 2px;
        }
        .chat-conv-list::-webkit-scrollbar { width: 4px; }
        .chat-conv-list::-webkit-scrollbar-track { background: transparent; }
        .chat-conv-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .chat-conv-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, border-color 0.15s;
        }
        .chat-conv-item:hover { background: var(--bg-card-hover); }
        .chat-conv-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
        .chat-conv-item.active {
          background: var(--bg-card);
          border-color: var(--border-focus);
        }
        .chat-conv-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .chat-conv-item.active .chat-conv-icon {
          color: var(--accent);
        }
        .chat-conv-title {
          font-size: 12px;
          color: var(--text-muted);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-conv-item.active .chat-conv-title { color: var(--text); font-weight: 600; }
        .chat-conv-delete {
          opacity: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-subtle);
          padding: 3px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s, color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .chat-conv-item:hover .chat-conv-delete,
        .chat-conv-item:focus-within .chat-conv-delete { opacity: 1; }
        .chat-conv-delete:hover { color: var(--rose); background: rgba(244, 63, 94, 0.1); }
        .chat-conv-delete:focus-visible { opacity: 1; outline: 2px solid var(--rose); }

        .chat-sidebar-footer {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          font-size: 11px;
          color: var(--text-subtle);
          line-height: 1.5;
        }
        .chat-sidebar-footer code {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: "JetBrains Mono", monospace;
          color: var(--text-muted);
        }
        .chat-empty-sidebar {
          font-size: 12px;
          color: var(--text-subtle);
          text-align: center;
          padding: 24px 8px;
          line-height: 1.6;
        }

        /* ── Main area ── */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          position: relative;
        }

        /* ── Top bar ── */
        .chat-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-header);
          backdrop-filter: blur(14px);
          flex-shrink: 0;
          z-index: 10;
        }
        .chat-topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .chat-topbar-toggle {
          background: var(--bg-card);
          border: 1px solid var(--border);
          cursor: pointer;
          color: var(--text-muted);
          padding: 7px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .chat-topbar-toggle:hover {
          background: var(--bg-card-hover);
          color: var(--text);
          border-color: var(--border-focus);
        }
        .chat-topbar-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        .chat-bot-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .chat-bot-avatar {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .chat-bot-name-wrap {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .chat-bot-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chat-tutor-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent);
          border: 1px solid rgba(99, 102, 241, 0.3);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .chat-bot-status {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 1px;
        }
        .chat-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--emerald);
          flex-shrink: 0;
        }
        .chat-status-dot.streaming { animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .chat-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .chat-topbar-newbtn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 9px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .chat-topbar-newbtn:hover {
          background: var(--bg-card-hover);
          color: var(--text);
          border-color: var(--border-focus);
        }
        .chat-topbar-newbtn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* EXIT BUTTON: High visibility, accessible, beginner friendly */
        .chat-topbar-exitbtn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .chat-topbar-exitbtn:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .chat-topbar-exitbtn:active { transform: translateY(0); }
        .chat-topbar-exitbtn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .chat-exit-kbd {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border);
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .chat-topbar-exitbtn:hover .chat-exit-kbd {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.3);
          color: #ffffff;
        }

        /* ── Messages scroll area ── */
        .chat-scroll {
          flex: 1;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .chat-messages {
          max-width: 820px;
          margin: 0 auto;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Empty / Welcome state ── */
        .chat-welcome {
          max-width: 780px;
          margin: 0 auto;
          padding: 36px 18px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .chat-welcome-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .chat-welcome-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .chat-welcome-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .chat-welcome-sub {
          font-size: 14.5px;
          color: var(--text-muted);
          max-width: 580px;
          line-height: 1.65;
          margin-bottom: 24px;
        }
        .chat-welcome-sub strong {
          color: var(--text);
          font-weight: 600;
        }
        .chat-welcome-sub span {
          color: var(--accent);
          font-weight: 600;
        }

        /* Category Filter Chips */
        .chat-categories-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
          max-width: 720px;
        }
        .chat-category-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chat-category-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text);
          border-color: var(--border-focus);
        }
        .chat-category-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
        }
        .chat-category-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* Suggested Prompts Grid */
        .chat-prompts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        @media (max-width: 680px) {
          .chat-prompts-grid { grid-template-columns: 1fr; }
        }
        .chat-prompt-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .chat-prompt-card:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-focus);
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }
        .chat-prompt-card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .chat-prompt-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-prompt-content {
          flex: 1;
          min-width: 0;
        }
        .chat-prompt-cat-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }
        .chat-prompt-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 6px;
          letter-spacing: 0.02em;
        }
        .chat-prompt-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.35;
          margin-bottom: 3px;
        }
        .chat-prompt-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        /* Badge color styles for categories */
        .badge-blue { background: rgba(59, 130, 246, 0.12); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25); }
        .badge-purple { background: rgba(168, 85, 247, 0.12); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.25); }
        .badge-emerald { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
        .badge-rose { background: rgba(244, 63, 94, 0.12); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.25); }
        .badge-amber { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); }
        .badge-cyan { background: rgba(6, 182, 212, 0.12); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.25); }

        /* Beginner Help Tips Box */
        .chat-beginner-tips {
          margin-top: 24px;
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.05);
          border: 1px dashed rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          text-align: left;
        }
        .chat-tips-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 3px;
        }
        .chat-tips-text {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .chat-tips-text strong {
          color: var(--text);
        }

        /* ── Message rows ── */
        .chat-user-row {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 10px;
        }
        .chat-ai-row {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 12px;
        }
        .chat-avatar {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          position: relative;
        }
        .chat-avatar-user {
          background: var(--bg-card);
          color: var(--accent);
        }
        .chat-avatar-ai {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          color: var(--accent);
        }
        .chat-streaming-dot {
          position: absolute;
          bottom: -3px;
          right: -3px;
          width: 8px;
          height: 8px;
          background: var(--emerald);
          border-radius: 50%;
          border: 1.5px solid var(--bg);
          animation: pulse 1s infinite;
        }
        .chat-user-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          max-width: 75%;
        }
        .chat-ai-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .chat-user-bubble {
          padding: 12px 18px;
          border-radius: 18px;
          border-bottom-right-radius: 4px;
          background: var(--accent);
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
        }
        .chat-ai-bubble {
          padding: 16px 20px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 14px;
          line-height: 1.7;
          color: var(--text);
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .chat-ai-bubble.error {
          background: rgba(244, 63, 94, 0.08);
          border-color: rgba(244, 63, 94, 0.4);
          color: var(--rose);
        }
        .chat-msg-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          font-size: 11px;
          color: var(--text-subtle);
        }
        .chat-meta-right { justify-content: flex-end; }
        .chat-copy-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-subtle);
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 5px;
          transition: color 0.15s, background 0.15s;
        }
        .chat-copy-btn:hover { color: var(--text); background: var(--bg-card-hover); }
        .chat-copy-btn:focus-visible { outline: 2px solid var(--accent); }

        /* Beginner follow-up container */
        .chat-followups-container {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .chat-followups-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .chat-followups-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .chat-followup-chip {
          padding: 5px 12px;
          border-radius: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
        }
        .chat-followup-chip:hover {
          background: var(--bg-card-hover);
          color: var(--text);
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .chat-followup-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

        /* ── Thinking dots ── */
        .chat-thinking {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }
        .chat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          animation: bounce 1.2s infinite;
          opacity: 0.8;
        }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .chat-thinking-text {
          font-size: 12px;
          color: var(--text-muted);
          margin-left: 6px;
          font-style: italic;
        }
        .chat-cursor {
          display: inline-block;
          width: 2px;
          height: 15px;
          background: var(--accent);
          margin-left: 3px;
          vertical-align: middle;
          border-radius: 1px;
          animation: blink 0.9s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Markdown body ── */
        .chat-md-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chat-p {
          font-size: 14px;
          color: var(--text);
          line-height: 1.7;
        }
        .chat-h1 {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          margin-top: 10px;
          margin-bottom: 4px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border);
        }
        .chat-h2 {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--text);
          margin-top: 8px;
          margin-bottom: 4px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
        }
        .chat-h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          margin-top: 6px;
          margin-bottom: 2px;
        }
        .chat-hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 6px 0;
        }
        .chat-blockquote {
          border-left: 3.5px solid var(--accent);
          padding: 6px 14px;
          border-radius: 0 8px 8px 0;
          background: var(--bg-secondary);
          color: var(--text-muted);
          font-size: 13px;
          font-style: italic;
          line-height: 1.6;
        }
        .chat-spacer { height: 6px; }
        .chat-ul, .chat-ol {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 4px 0;
        }
        .chat-li {
          display: flex;
          gap: 8px;
          font-size: 14px;
          color: var(--text);
          line-height: 1.65;
        }
        .chat-li-dot {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 1px;
          font-weight: 800;
        }
        .chat-li-num {
          color: var(--accent);
          flex-shrink: 0;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          min-width: 18px;
          text-align: right;
        }
        .chat-inline-bold {
          font-weight: 700;
          color: var(--text);
        }
        .chat-inline-em {
          font-style: italic;
          color: var(--text-muted);
        }
        .chat-inline-code {
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--cyan);
        }
        .chat-inline-strike {
          text-decoration: line-through;
          color: var(--text-subtle);
        }

        /* ── Table ── */
        .chat-table-wrap {
          overflow-x: auto;
          border-radius: 10px;
          border: 1px solid var(--border);
          margin: 6px 0;
        }
        .chat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .chat-th {
          padding: 9px 14px;
          background: var(--bg-secondary);
          color: var(--accent);
          font-weight: 700;
          text-align: left;
          border-bottom: 1.5px solid var(--border);
          white-space: nowrap;
        }
        .chat-tr { border-top: 1px solid var(--border); }
        .chat-tr:hover { background: var(--bg-card-hover); }
        .chat-td {
          padding: 8px 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* ── Code blocks ── */
        .chat-code-block {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .chat-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }
        .chat-code-lang {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .chat-code-copy {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-subtle);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .chat-code-copy:hover { color: var(--text); background: var(--bg-secondary); }
        .chat-code-copy:focus-visible { outline: 2px solid var(--accent); }
        .chat-code-pre {
          padding: 16px 18px;
          overflow-x: auto;
          font-family: "JetBrains Mono", monospace;
          font-size: 12.5px;
          line-height: 1.7;
          color: var(--text);
          margin: 0;
          white-space: pre;
        }
        .chat-code-pre::-webkit-scrollbar { height: 5px; }
        .chat-code-pre::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        /* ── Scroll-to-bottom button ── */
        .chat-scroll-btn {
          position: absolute;
          bottom: 115px;
          right: 24px;
          background: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
          transition: opacity 0.2s, transform 0.2s;
          z-index: 10;
        }
        .chat-scroll-btn:hover { transform: scale(1.1); }
        .chat-scroll-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* ── Input area ── */
        .chat-input-area {
          flex-shrink: 0;
          border-top: 1px solid var(--border);
          background: var(--bg);
          padding: 12px 18px 14px;
          z-index: 10;
        }
        .chat-input-wrap {
          max-width: 820px;
          margin: 0 auto;
        }
        .chat-input-box {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 10px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .chat-input-box:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .chat-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          line-height: 1.55;
          resize: none;
          min-height: 24px;
          max-height: 160px;
          overflow-y: auto;
        }
        .chat-textarea::placeholder {
          color: var(--text-subtle);
          font-size: 13.5px;
        }
        .chat-textarea::-webkit-scrollbar { width: 4px; }
        .chat-textarea::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .chat-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          background: var(--accent);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        .chat-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }
        .chat-send-btn:not(:disabled):hover {
          opacity: 0.92;
          transform: scale(1.05);
        }
        .chat-send-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        .chat-stop-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--rose);
          color: #ffffff;
          transition: opacity 0.15s;
        }
        .chat-stop-btn:hover { opacity: 0.9; }
        .chat-stop-btn:focus-visible { outline: 2px solid var(--rose); outline-offset: 2px; }

        .chat-input-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          text-align: center;
          font-size: 11px;
          color: var(--text-subtle);
          margin-top: 8px;
        }
        .chat-input-hint kbd {
          padding: 1px 6px;
          border-radius: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          color: var(--text-muted);
        }

        /* ── Tablet & Mobile responsive (<= 1024px) ── */
        @media (max-width: 1024px) {
          .chat-sidebar {
            position: fixed;
            left: 0;
            top: var(--topbar-h);
            bottom: 0;
            height: calc(100vh - var(--topbar-h));
            width: 280px;
            max-width: 85vw;
            z-index: 50;
            box-shadow: 8px 0 32px rgba(0, 0, 0, 0.45);
            transform: translateX(0);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
          }
          .chat-sidebar.closed {
            transform: translateX(-100%);
            width: 280px;
            min-width: 280px;
            opacity: 0;
            pointer-events: none;
            display: flex;
          }
          .chat-sidebar.open {
            transform: translateX(0);
            width: 280px;
            min-width: 280px;
            opacity: 1;
            pointer-events: auto;
          }
          .chat-sidebar-inner {
            width: 100%;
          }
          .chat-sidebar-close-btn {
            display: flex;
          }
          .chat-topbar {
            padding: 8px 12px;
          }
          .chat-messages {
            padding: 20px 14px;
            gap: 20px;
          }
        }

        /* ── Mobile specific (<= 640px) ── */
        @media (max-width: 640px) {
          .chat-topbar {
            padding: 8px 10px;
            gap: 8px;
          }
          .chat-topbar-left {
            gap: 8px;
          }
          .chat-bot-avatar {
            width: 32px;
            height: 32px;
            border-radius: 9px;
          }
          .chat-bot-name {
            font-size: 13px;
          }
          .chat-tutor-badge {
            display: none;
          }
          .chat-bot-status {
            font-size: 10px;
          }
          .chat-topbar-exit-text {
            display: none;
          }
          .chat-topbar-newbtn span {
            display: none;
          }
          .chat-topbar-newbtn {
            padding: 7px 9px;
          }
          .chat-topbar-exitbtn {
            padding: 6px 10px;
          }
          .chat-messages {
            padding: 14px 10px;
            gap: 16px;
          }
          .chat-user-content, .chat-ai-content {
            max-width: 95%;
          }
          .chat-user-bubble {
            padding: 10px 14px;
            font-size: 13.5px;
          }
          .chat-ai-bubble {
            padding: 12px 14px;
            font-size: 13.5px;
          }
          .chat-welcome {
            padding: 20px 10px;
          }
          .chat-welcome-title {
            font-size: 20px;
            line-height: 1.25;
          }
          .chat-welcome-sub {
            font-size: 12.5px;
            margin-bottom: 16px;
          }
          .chat-categories-bar {
            gap: 5px;
            margin-bottom: 14px;
          }
          .chat-category-btn {
            font-size: 11px;
            padding: 5px 10px;
          }
          .chat-input-area {
            padding: 8px 10px 10px;
          }
          .chat-input-box {
            padding: 8px 10px;
            gap: 8px;
            border-radius: 12px;
          }
          .chat-textarea {
            font-size: 13.5px;
          }
          .chat-send-btn, .chat-stop-btn {
            width: 34px;
            height: 34px;
          }
          .chat-input-hint {
            display: none;
          }
          .chat-beginner-tips {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="chat-root" role="region" aria-label="ScholarBot AI Workspace">
        {/* ── Mobile/Tablet Backdrop Overlay ─────── */}
        {sidebarOpen && (
          <div
            className="chat-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar (Conversations) ──────────────── */}
        <div
          id="chat-history-sidebar"
          className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`}
          aria-hidden={!sidebarOpen}
        >
          <div className="chat-sidebar-inner">
            <div className="chat-sidebar-head-row">
              <button
                type="button"
                className="chat-new-btn"
                onClick={() => {
                  startNewChat();
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                aria-label="Start a new chat conversation"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>
              <button
                type="button"
                className="chat-sidebar-close-btn"
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar"
                aria-label="Close conversation sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="chat-conv-list" role="list" aria-label="Past conversations">
              {conversations.length === 0 ? (
                <p className="chat-empty-sidebar">
                  No saved conversations yet.<br />Click <strong>New Conversation</strong> or pick a suggested topic to begin.
                </p>
              ) : (
                [...conversations].reverse().map((conv) => (
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    className={`chat-conv-item ${activeConvId === conv.id ? "active" : ""}`}
                    onClick={() => {
                      loadConversation(conv.id);
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        loadConversation(conv.id);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }
                    }}
                    aria-label={`Open conversation: ${conv.title}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 chat-conv-icon" aria-hidden="true" />
                    <span className="chat-conv-title">{conv.title}</span>
                    <button
                      type="button"
                      className="chat-conv-delete"
                      onClick={(e) => deleteConversation(conv.id, e)}
                      title="Delete conversation"
                      aria-label={`Delete conversation ${conv.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="chat-sidebar-footer">
              <p>
                Add <code>GEMINI_API_KEY</code> to <code>.env.local</code> for full cloud AI. Standard responses run locally without key.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ────────────────────────── */}
        <div className="chat-main" role="main">
          {/* Top bar with prominent Exit Button */}
          <header className="chat-topbar" role="banner">
            <div className="chat-topbar-left">
              <button
                type="button"
                className="chat-topbar-toggle"
                onClick={() => setSidebarOpen((v) => !v)}
                title={sidebarOpen ? "Hide history sidebar" : "Show history sidebar"}
                aria-label={sidebarOpen ? "Hide conversation history sidebar" : "Show conversation history sidebar"}
                aria-expanded={sidebarOpen}
                aria-controls="chat-history-sidebar"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <div className="chat-bot-info">
                <div className="chat-bot-avatar" aria-hidden="true">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="chat-bot-name-wrap">
                  <div className="chat-bot-name">
                    ScholarBot AI
                    <span className="chat-tutor-badge">24/7 Academic Copilot</span>
                  </div>
                  <div className="chat-bot-status">
                    <span className={`chat-status-dot ${isStreaming ? "streaming" : ""}`} aria-hidden="true" />
                    <span>{isStreaming ? "ScholarBot is writing…" : "CS · IT · CpE Student Tutor"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: New Chat & Exit to Dashboard */}
            <div className="chat-topbar-actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chat-topbar-newbtn"
                  onClick={startNewChat}
                  aria-label="Start a new chat conversation"
                  title="Start a fresh chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              )}

              {onExit && (
                <button
                  type="button"
                  className="chat-topbar-exitbtn"
                  onClick={() => {
                    sound.playClick();
                    onExit();
                  }}
                  title="Exit ScholarBot AI and return to Dashboard (or press Esc)"
                  aria-label="Exit ScholarBot AI and return to dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="chat-topbar-exit-text">Exit to Dashboard</span>
                  <kbd className="chat-exit-kbd" aria-hidden="true">Esc</kbd>
                </button>
              )}
            </div>
          </header>

          {/* Messages scroll area */}
          <div
            className="chat-scroll"
            ref={scrollRef}
            onScroll={handleScroll}
            tabIndex={0}
            role="region"
            aria-label="Conversation messages"
          >
            {isEmpty ? (
              <div className="chat-welcome">
                <div className="chat-welcome-pill">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Beginner-Friendly Academic AI Tutor</span>
                </div>

                <div className="chat-welcome-icon" aria-hidden="true">
                  <Bot className="w-8 h-8" />
                </div>

                <h1 className="chat-welcome-title">ScholarBot AI</h1>
                <p className="chat-welcome-sub">
                  Your dedicated academic tutor for <strong>BSIT</strong>, <strong>BSCS</strong>, and <strong>Computer Engineering</strong>.
                  Ask questions in plain English, get step-by-step code breakdowns, or get help debugging errors.
                </p>

                {/* Beginner Category Filter Chips */}
                <div className="chat-categories-bar" role="tablist" aria-label="Question topics">
                  {PROMPT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === cat.id}
                      className={`chat-category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCategory(cat.id);
                      }}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Suggested Starter Prompts */}
                <div className="chat-prompts-grid" role="list" aria-label="Suggested questions">
                  {filteredPrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      role="listitem"
                      className="chat-prompt-card"
                      onClick={() => handleSend(p.query)}
                      aria-label={`${p.categoryLabel}: ${p.label}`}
                    >
                      <div className={`chat-prompt-icon ${p.badgeClass}`} aria-hidden="true">
                        {p.icon}
                      </div>
                      <div className="chat-prompt-content">
                        <div className="chat-prompt-cat-row">
                          <span className={`chat-prompt-badge ${p.badgeClass}`}>{p.categoryLabel}</span>
                        </div>
                        <div className="chat-prompt-label">{p.label}</div>
                        <div className="chat-prompt-desc">{p.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Beginner Tips Card */}
                <div className="chat-beginner-tips">
                  <div>
                    <div className="chat-tips-title">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Tips for Beginners</span>
                    </div>
                    <div className="chat-tips-text">
                      Type <strong>&quot;Explain like I&apos;m 5&quot;</strong> for simple everyday analogies, or paste any compiler error message directly to get an instant step-by-step fix.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-messages" aria-live="polite">
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isLastAi={msg.sender === "ai" && idx === messages.length - 1}
                    onQuickPrompt={(prompt) => handleSend(prompt)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Scroll-to-bottom Floating Button */}
          {showScrollBtn && (
            <button
              type="button"
              className="chat-scroll-btn"
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
              title="Scroll to bottom"
              aria-label="Scroll to bottom of conversation"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <div className="chat-input-box">
                <textarea
                  ref={inputRef}
                  className="chat-textarea"
                  value={inputMsg}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ScholarBot any question, paste code to debug, or request an explanation…"
                  disabled={isStreaming}
                  rows={1}
                  aria-label="Message input for ScholarBot AI"
                />
                {isStreaming ? (
                  <button
                    type="button"
                    className="chat-stop-btn"
                    onClick={handleStop}
                    title="Stop generating response"
                    aria-label="Stop generating response"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chat-send-btn"
                    onClick={() => handleSend()}
                    disabled={!inputMsg.trim()}
                    title="Send message (Enter)"
                    aria-label="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="chat-input-hint">
                <span>Press <kbd>Enter</kbd> to send</span>
                <span>·</span>
                <span><kbd>Shift + Enter</kbd> for new line</span>
                <span>·</span>
                <span>Press <kbd>Esc</kbd> to return to Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
