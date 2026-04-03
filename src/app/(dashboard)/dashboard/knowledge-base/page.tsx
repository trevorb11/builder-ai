import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KnowledgeBaseManager } from "@/components/knowledge-base/knowledge-base-manager";
import { BookOpen, Sparkles, FileText, Globe, PenLine } from "lucide-react";

async function getKnowledgeBaseData(organizationId: string) {
  const entries = await prisma.knowledgeBaseEntry.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return { entries };
}

export default async function KnowledgeBasePage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let data = null;
  if (organizationId) {
    data = await getKnowledgeBaseData(organizationId);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Knowledge Base
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  AI Powered
                </span>
              </div>
              <p className="mt-1 text-sm sm:text-base text-gray-500">
                Add content that powers your chatbot, marketing writer, and sales coach
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PenLine className="h-4 w-4 text-emerald-500" />
              <span>Text Content</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4 text-teal-500" />
              <span>Document Uploads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 text-cyan-500" />
              <span>Website Connections</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <KnowledgeBaseManager entries={data?.entries || []} />
      </div>
    </div>
  );
}
