import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SalesRoleplay } from "@/components/sales/sales-roleplay";
import { TrainingHistory } from "@/components/sales/training-history";
import { PerformanceMetrics } from "@/components/sales/performance-metrics";
import {
  GraduationCap,
  MessageSquare,
  History,
  BarChart3,
  Trophy,
} from "lucide-react";

async function getTrainingData(userId: string, organizationId: string) {
  const [sessions, metrics, organization] = await Promise.all([
    prisma.salesTrainingSession.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        metrics: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.salesTrainingMetrics.findMany({
      where: { session: { userId } },
      orderBy: { session: { createdAt: "desc" } },
      take: 10,
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        floorplans: { where: { status: "active" }, take: 10 },
        communities: { where: { status: "active" }, take: 10 },
      },
    }),
  ]);

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) /
            completedSessions.length
        )
      : 0;

  return { sessions, metrics, organization, completedSessions, averageScore };
}

export default async function TrainingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const organizationId = session?.user?.organizationId;

  if (!userId || !organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please sign in to access Sales Training.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sessions, metrics, organization, completedSessions, averageScore } =
    await getTrainingData(userId, organizationId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-lg bg-pink-500 p-2 flex-shrink-0">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Trainer AI</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Practice objection handling with AI-powered roleplay
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Training Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{averageScore}%</div>
              {averageScore >= 80 && <Trophy className="h-5 w-5 text-yellow-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSessions.length > 0
                ? Math.max(...completedSessions.map((s) => s.score || 0))
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="practice" className="space-y-6">
        <TabsList>
          <TabsTrigger value="practice" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Sales Roleplay Practice</CardTitle>
              <CardDescription>
                Practice handling buyer objections with an AI that knows your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesRoleplay
                userId={userId}
                organizationId={organizationId}
                builderName={organization?.name || "Your Builder"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
              <CardDescription>
                Review your past training sessions and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrainingHistory sessions={sessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Track your improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics metrics={metrics} sessions={sessions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
