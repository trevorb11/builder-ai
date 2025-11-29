"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Play, Square, Loader2, User, Bot, Lightbulb } from "lucide-react";

interface SalesRoleplayProps {
  userId: string;
  organizationId: string;
  builderName: string;
}

interface Message {
  id: string;
  role: "agent" | "buyer" | "coach";
  content: string;
  feedback?: string;
}

const scenarios = [
  { id: "objection_handling", name: "Objection Handling" },
  { id: "product_knowledge", name: "Product Knowledge" },
  { id: "closing", name: "Closing Techniques" },
  { id: "discovery", name: "Discovery Questions" },
];

const difficulties = [
  { id: "easy", name: "Easy", color: "bg-green-100 text-green-800" },
  { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { id: "hard", name: "Hard", color: "bg-red-100 text-red-800" },
];

export function SalesRoleplay({
  userId,
  organizationId,
  builderName,
}: SalesRoleplayProps) {
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function startSession() {
    if (!scenario) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/sales-training/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          organizationId,
          scenario,
          difficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages([
          {
            id: "1",
            role: "buyer",
            content: data.initialMessage,
          },
        ]);
        setIsActive(true);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/sales-training/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: input.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add buyer response
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-buyer",
            role: "buyer",
            content: data.buyerResponse,
          },
        ]);

        // Add coach feedback if provided
        if (data.coachFeedback) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-coach",
              role: "coach",
              content: data.coachFeedback,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/sales-training/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: "final",
            role: "coach",
            content: `Session Complete!\n\nScore: ${data.score}/100\n\n${data.feedback}`,
          },
        ]);
        setIsActive(false);
      }
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isActive) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Training Scenario</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger>
                <SelectValue placeholder="Select scenario..." />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${d.color}`}
                      >
                        {d.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="font-medium text-blue-900">How It Works</h4>
          <ul className="mt-2 space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              The AI acts as a potential homebuyer with specific needs and objections
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              Respond as you would in a real sales conversation
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Get real-time coaching feedback on your responses
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              End the session to receive a final score and detailed feedback
            </li>
          </ul>
        </div>

        <Button
          onClick={startSession}
          disabled={!scenario || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Training Session
            </>
          )}
        </Button>

        {messages.length > 0 && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">Last Session Results</h4>
            <p className="text-sm text-gray-600">
              {messages[messages.length - 1]?.content}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {scenarios.find((s) => s.id === scenario)?.name}
          </Badge>
          <Badge
            className={
              difficulties.find((d) => d.id === difficulty)?.color || ""
            }
          >
            {difficulties.find((d) => d.id === difficulty)?.name}
          </Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={endSession}>
          <Square className="mr-2 h-4 w-4" />
          End Session
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "agent" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  message.role === "agent"
                    ? "bg-blue-500"
                    : message.role === "buyer"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
                }`}
              >
                {message.role === "agent" ? (
                  <User className="h-4 w-4 text-white" />
                ) : message.role === "buyer" ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.role === "agent"
                    ? "bg-blue-500 text-white"
                    : message.role === "buyer"
                    ? "bg-gray-100 text-gray-900"
                    : "border border-yellow-200 bg-yellow-50 text-yellow-900"
                }`}
              >
                {message.role === "coach" && (
                  <p className="mb-1 text-xs font-medium">Coach Feedback</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response as the sales agent..."
            className="min-h-[60px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
