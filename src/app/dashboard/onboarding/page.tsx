import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [organization, progress, communities, floorplans, competitors, crmIntegrations] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
    }),
    prisma.onboardingProgress.findUnique({
      where: { organizationId },
    }),
    prisma.community.count({ where: { organizationId } }),
    prisma.floorplan.count({ where: { organizationId } }),
    prisma.competitor.count({ where: { organizationId } }),
    prisma.cRMIntegration.count({ where: { organizationId } }),
  ]);

  const initialProgress = progress || {
    companyName: !!organization?.name,
    contacts: !!(organization?.email || organization?.phone),
    websiteUrl: !!organization?.website,
    tagline: false,
    buyerPersonas: false,
    marketsServed: !!(organization?.city || organization?.state),
    differentiators: false,
    brandAssets: !!organization?.logo,
    communitiesAdded: communities > 0,
    floorplansAdded: floorplans > 0,
    incentivesAdded: false,
    coopCommission: false,
    preferredLender: false,
    pricingContacts: false,
    inventoryAdded: false,
    crmConnected: crmIntegrations > 0,
    leadFlowSetup: false,
    salesTeamAdded: false,
    websiteAccess: false,
    analyticsAccess: false,
    chatbotPlacement: false,
    competitorsAdded: competitors > 0,
    salesAgentsAdded: false,
    trainingAssets: false,
    realtorDatabase: false,
    realtorAssets: false,
    socialHandles: false,
    emailPlatform: false,
    contentPrefs: false,
    approvalContacts: false,
    launchDate: false,
    overallProgress: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Checklist</h1>
        <p className="mt-1 text-gray-600">
          Complete these steps to get the most out of Builder AI. The more information you provide, the better your AI tools will perform.
        </p>
      </div>

      <OnboardingChecklist 
        organizationId={organizationId}
        organizationName={organization?.name || ""}
        initialProgress={initialProgress}
      />
    </div>
  );
}
