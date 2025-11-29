"use client";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, Clock, Trophy, Target } from "lucide-react";

interface TrainingMessage {
  id: string;
  role: string;
  content: string;
}

interface TrainingSession {
  id: string;
  scenario: string;
  difficulty: string;
  status: string;
  score: number | null;
  feedback: string | null;
  duration: number | null;
  createdAt: Date;
  completedAt: Date | null;
  messages: TrainingMessage[];
}

interface TrainingHistoryProps {
  sessions: TrainingSession[];
}

const scenarioLabels: Record<string, string> = {
  objection_handling: "Objection Handling",
  product_knowledge: "Product Knowledge",
  closing: "Closing Techniques",
  discovery: "Discovery Questions",
};

export function TrainingHistory({ sessions }: TrainingHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No training sessions yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Start a practice session to begin tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-pink-100 p-2">
                <Target className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {scenarioLabels[session.scenario] || session.scenario}
                  </h4>
                  <Badge
                    variant={
                      session.difficulty === "easy"
                        ? "success"
                        : session.difficulty === "hard"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {session.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDateTime(session.createdAt)}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {session.messages.length} messages
                  </span>
                  {session.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(session.duration / 60)}m
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={session.status === "completed" ? "success" : "outline"}
              >
                {session.status}
              </Badge>
              {session.score !== null && (
                <div className="mt-2 flex items-center justify-end gap-1">
                  <Trophy
                    className={`h-4 w-4 ${
                      session.score >= 80
                        ? "text-yellow-500"
                        : session.score >= 60
                        ? "text-gray-400"
                        : "text-gray-300"
                    }`}
                  />
                  <span className="font-bold text-gray-900">
                    {session.score}%
                  </span>
                </div>
              )}
            </div>
          </div>
          {session.feedback && (
            <div className="mt-3 rounded-md bg-gray-100 p-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {session.feedback}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
