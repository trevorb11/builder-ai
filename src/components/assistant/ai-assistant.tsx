"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Users,
  Home,
  Target,
  Mail,
  Share2,
  BarChart3,
  Loader2,
  MessageSquare,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  label: string;
  icon: string;
  description: string;
  category?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  "bar-chart": <BarChart3 className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  "trending-up": <TrendingUp className="h-4 w-4" />,
  "file-text": <FileText className="h-4 w-4" />,
  dollar: <DollarSign className="h-4 w-4" />,
};

// Demo-ready quick prompts for showcasing at builder shows
const DEMO_SUGGESTIONS: Suggestion[] = [
  {
    id: "leads",
    label: "How are my leads doing?",
    icon: "users",
    description: "Get lead pipeline insights",
    category: "Business",
  },
  {
    id: "social",
    label: "Write a Facebook post for my new community",
    icon: "share",
    description: "Generate social content",
    category: "Marketing",
  },
  {
    id: "hot-leads",
    label: "Who should I follow up with today?",
    icon: "zap",
    description: "Priority lead actions",
    category: "Sales",
  },
  {
    id: "inventory",
    label: "What Quick Move-In homes do I have?",
    icon: "home",
    description: "Check available inventory",
    category: "Inventory",
  },
  {
    id: "email",
    label: "Draft a follow-up email for interested buyers",
    icon: "mail",
    description: "Create email templates",
    category: "Marketing",
  },
  {
    id: "competitor",
    label: "How do my prices compare to competitors?",
    icon: "bar-chart",
    description: "Competitive analysis",
    category: "Strategy",
  },
  {
    id: "listing",
    label: "Write a listing description for my model home",
    icon: "file-text",
    description: "Generate listing copy",
    category: "Marketing",
  },
  {
    id: "focus",
    label: "What should I focus on this week?",
    icon: "target",
    description: "Get prioritized tasks",
    category: "Strategy",
  },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/assistant");
      if (res.ok) {
        const data = await res.json();
        // Merge API suggestions with demo suggestions for a richer experience
        const apiSuggestions = data.suggestions || [];
        // Use API suggestions if available, otherwise use demo suggestions
        setSuggestions(apiSuggestions.length > 0 ? apiSuggestions : DEMO_SUGGESTIONS);
      } else {
        // Fallback to demo suggestions if API fails
        setSuggestions(DEMO_SUGGESTIONS);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      // Fallback to demo suggestions
      setSuggestions(DEMO_SUGGESTIONS);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  "Sorry, I encountered an error. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 z-50"
        size="icon"
      >
        <div className="relative">
          <Bot className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </Button>
    );
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl border-0 overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 md:left-auto md:top-auto md:bottom-6 md:right-6 md:w-[600px] md:h-[700px]"
          : "bottom-6 right-6 w-[400px] h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Builder AI Assistant
              <Badge className="bg-white/20 text-white text-[10px] hover:bg-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </h3>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
              title="Clear chat"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-[calc(100%-140px)]" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse"></div>
                  <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Hi! I'm your AI Assistant
                </h4>
                <p className="text-sm text-gray-500 mt-1 max-w-[300px] mx-auto">
                  Ask me about your leads, inventory, competitors, or have me write marketing content instantly.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Lead Insights
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <FileText className="h-3 w-3 mr-1" />
                  Content Writing
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Competitor Intel
                </Badge>
              </div>

              {/* Quick Actions - Improved Grid */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Try asking me...
                </p>
                <div className="space-y-2">
                  {suggestions.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all text-left group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-purple-100 group-hover:to-indigo-100 text-gray-600 group-hover:text-purple-600 transition-colors flex-shrink-0 shadow-sm">
                        {ICON_MAP[suggestion.icon] || (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-900">
                          {suggestion.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send className="h-4 w-4 text-purple-500" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* More options hint */}
                <p className="text-[11px] text-gray-400 text-center mt-4">
                  Or type any question below to get started
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2"
                      : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="relative group">
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-strong:text-gray-900">
                        <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                      </div>
                      {message.content && (
                        <button
                          onClick={() =>
                            copyToClipboard(message.content, message.id)
                          }
                          className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md border"
                          title="Copy response"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[48px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex-shrink-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI-powered assistant for home builders
        </p>
      </div>
    </Card>
  );
}
