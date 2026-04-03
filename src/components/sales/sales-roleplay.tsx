"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Send,
  Play,
  Square,
  Loader2,
  User,
  Bot,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

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

function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        setTranscript((prev) => prev + finalTranscript + interimTranscript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already started
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening, resetTranscript };
}

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to pick a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Natural")
    ) || voices.find(
      (v) => v.lang.startsWith("en-US") && !v.name.includes("Google")
    ) || voices.find(
      (v) => v.lang.startsWith("en")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { isSpeaking, isSupported, speak, stop };
}

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
  const [voiceMode, setVoiceMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: ttsSupported,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  const voiceSupported = sttSupported && ttsSupported;

  // Sync transcript to input when in voice mode
  useEffect(() => {
    if (voiceMode && transcript) {
      setInput(transcript);
    }
  }, [voiceMode, transcript]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-speak buyer messages in voice mode
  const lastMessageRef = useRef<string | null>(null);
  useEffect(() => {
    if (!voiceMode || !ttsSupported) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "buyer" && lastMsg.id !== lastMessageRef.current) {
      lastMessageRef.current = lastMsg.id;
      speak(lastMsg.content);
    }
  }, [messages, voiceMode, ttsSupported, speak]);

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
        const initialMsg: Message = {
          id: "1",
          role: "buyer",
          content: data.initialMessage,
        };
        setMessages([initialMsg]);
        setIsActive(true);

        if (voiceMode && ttsSupported) {
          speak(data.initialMessage);
        }
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    const messageText = input.trim();
    if (!messageText || !sessionId || isLoading) return;

    // Stop listening if we were recording
    if (isListening) {
      stopListening();
    }
    resetTranscript();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: messageText,
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
          message: messageText,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-buyer",
            role: "buyer",
            content: data.buyerResponse,
          },
        ]);

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
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();

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

  function handleVoiceToggle() {
    if (isListening) {
      stopListening();
      // Send the accumulated transcript
      if (input.trim()) {
        sendMessage();
      }
    } else {
      resetTranscript();
      setInput("");
      startListening();
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

        {/* Voice Mode Toggle */}
        {voiceSupported && (
          <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                <Mic className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Voice Mode</p>
                <p className="text-xs text-purple-600">
                  Speak your responses and hear the buyer talk back
                </p>
              </div>
            </div>
            <Switch
              checked={voiceMode}
              onCheckedChange={setVoiceMode}
            />
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="font-medium text-blue-900">How It Works</h4>
          <ul className="mt-2 space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              The AI acts as a potential homebuyer with specific needs and objections
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              {voiceMode
                ? "Press the microphone button and speak your response naturally"
                : "Respond as you would in a real sales conversation"}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              {voiceMode
                ? "The buyer will speak their response back to you"
                : "Get real-time coaching feedback on your responses"}
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
              {voiceMode && " (Voice)"}
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
        <div className="flex items-center gap-2">
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
          {voiceMode && (
            <Badge className="bg-purple-100 text-purple-700 border-0 gap-1">
              <Mic className="h-3 w-3" />
              Voice
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {voiceMode && ttsSupported && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isSpeaking ? stopSpeaking : () => {
                const lastBuyer = [...messages].reverse().find(m => m.role === "buyer");
                if (lastBuyer) speak(lastBuyer.content);
              }}
              className="h-8 w-8 p-0"
              title={isSpeaking ? "Stop speaking" : "Replay last response"}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4 text-purple-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={endSession}>
            <Square className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
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
                className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
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
        {voiceMode ? (
          <div className="flex items-center gap-3">
            {/* Voice Input Area */}
            <div className="flex-1 min-h-[60px] rounded-lg border bg-gray-50 px-4 py-3 flex items-center">
              {isListening ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex gap-1 items-center">
                    <span className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-purple-500 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-3 bg-purple-500 rounded-full animate-pulse [animation-delay:300ms]" />
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {input || <span className="text-gray-400">Listening...</span>}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {input || "Press the mic button and start speaking..."}
                </p>
              )}
            </div>

            {/* Mic Button */}
            <Button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`h-12 w-12 rounded-full p-0 flex-shrink-0 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </Button>

            {/* Send (for sending partial transcript manually) */}
            {input.trim() && !isListening && (
              <Button
                type="button"
                onClick={sendMessage}
                disabled={isLoading}
                className="h-12 w-12 rounded-full p-0 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
