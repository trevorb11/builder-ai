import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChatbotConfigForm } from "@/components/chat/chatbot-config-form";
import { ChatPreview } from "@/components/chat/chat-preview";
import { ConversationsList } from "@/components/chat/conversations-list";
import { EmbedCodeSection } from "@/components/chat/embed-code-section";
import { MessageSquare, Settings, Code, History } from "lucide-react";

async function getChatbotConfig(organizationId: string) {
  const config = await prisma.chatbotConfig.findUnique({
    where: { organizationId },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      lead: { organizationId },
      source: "website",
    },
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = {
    totalConversations: await prisma.conversation.count({
      where: { lead: { organizationId }, source: "website" },
    }),
    leadsCaptures: await prisma.lead.count({
      where: { organizationId, source: "website_chat" },
    }),
    avgMessages: 0,
  };

  return { config, conversations, stats };
}

export default async function AssistantPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access the AI Assistant.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { config, conversations, stats } = await getChatbotConfig(organizationId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500 p-2">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Website AI Assistant</h1>
            <p className="text-gray-600">
              Configure your AI chatbot to answer buyer questions and capture leads
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Leads Captured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsCaptures}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={config?.isActive ? "success" : "secondary"}>
              {config?.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2">
            <History className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code className="h-4 w-4" />
            Embed Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
              <CardDescription>
                Customize how your AI assistant looks and behaves on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatbotConfigForm config={config} organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                Test your chatbot before deploying it to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatPreview config={config} organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                View and analyze chat sessions with potential buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationsList conversations={conversations} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed on Your Website</CardTitle>
              <CardDescription>
                Copy this code and paste it before the closing &lt;/body&gt; tag on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbedCodeSection organizationId={organizationId} config={config} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
