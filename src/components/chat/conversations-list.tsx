"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, User } from "lucide-react";

interface Conversation {
  id: string;
  sessionId: string;
  status: string;
  sentiment: string | null;
  intentScore: number | null;
  createdAt: Date;
  lead: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  messages: {
    id: string;
    content: string;
    role: string;
    createdAt: Date;
  }[];
}

interface ConversationsListProps {
  conversations: Conversation[];
}

export function ConversationsList({ conversations }: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No conversations yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Conversations will appear here once visitors start chatting with your AI Assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {conversation.lead?.firstName?.[0] ||
                    conversation.lead?.email?.[0]?.toUpperCase() || (
                      <User className="h-4 w-4" />
                    )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {conversation.lead?.firstName && conversation.lead?.lastName
                    ? `${conversation.lead.firstName} ${conversation.lead.lastName}`
                    : conversation.lead?.email || "Anonymous Visitor"}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(conversation.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {conversation.sentiment && (
                <Badge
                  variant={
                    conversation.sentiment === "positive"
                      ? "success"
                      : conversation.sentiment === "negative"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {conversation.sentiment}
                </Badge>
              )}
              {conversation.intentScore !== null && conversation.intentScore > 70 && (
                <Badge variant="default">High Intent</Badge>
              )}
              <Badge variant={conversation.status === "active" ? "outline" : "secondary"}>
                {conversation.status}
              </Badge>
            </div>
          </div>
          {conversation.messages[0] && (
            <div className="mt-3 rounded-md bg-gray-100 p-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {conversation.messages[0].content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
