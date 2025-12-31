import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const contentPrefsSchema = z.object({
  // Social media
  facebookHandle: z.string().optional(),
  instagramHandle: z.string().optional(),
  linkedinHandle: z.string().optional(),
  youtubeChannel: z.string().optional(),
  tiktokHandle: z.string().optional(),
  pinterestHandle: z.string().optional(),
  // Email marketing
  emailPlatform: z.string().optional(),
  hasEmailIntegration: z.boolean().optional(),
  emailListSize: z.string().optional(),
  emailFrequency: z.string().optional(),
  // Content preferences
  contentTone: z.string().optional(),
  contentTopics: z.array(z.string()).optional(),
  avoidTopics: z.array(z.string()).optional(),
  existingContent: z.string().optional(),
  photoLibrary: z.boolean().optional(),
  videoAssets: z.boolean().optional(),
  virtualTours: z.boolean().optional(),
  // Blog/SEO
  hasBlog: z.boolean().optional(),
  blogUrl: z.string().optional(),
  seoFocus: z.array(z.string()).optional(),
  // Advertising
  runsPaidAds: z.boolean().optional(),
  adPlatforms: z.array(z.string()).optional(),
  monthlyAdBudget: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = contentPrefsSchema.parse(body);

    let onboarding = await prisma.builderOnboarding.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!onboarding) {
      onboarding = await prisma.builderOnboarding.create({
        data: {
          organizationId: session.user.organizationId,
          currentStep: 1,
          totalSteps: 10,
          completedSteps: JSON.stringify([]),
        },
      });
    }

    const configData = {
      facebookHandle: data.facebookHandle,
      instagramHandle: data.instagramHandle,
      linkedinHandle: data.linkedinHandle,
      youtubeChannel: data.youtubeChannel,
      tiktokHandle: data.tiktokHandle,
      pinterestHandle: data.pinterestHandle,
      emailPlatform: data.emailPlatform,
      hasEmailIntegration: data.hasEmailIntegration,
      emailListSize: data.emailListSize,
      emailFrequency: data.emailFrequency,
      contentTone: data.contentTone,
      contentTopics: data.contentTopics ? JSON.stringify(data.contentTopics) : undefined,
      avoidTopics: data.avoidTopics ? JSON.stringify(data.avoidTopics) : undefined,
      existingContent: data.existingContent,
      photoLibrary: data.photoLibrary,
      videoAssets: data.videoAssets,
      virtualTours: data.virtualTours,
      hasBlog: data.hasBlog,
      blogUrl: data.blogUrl,
      seoFocus: data.seoFocus ? JSON.stringify(data.seoFocus) : undefined,
      runsPaidAds: data.runsPaidAds,
      adPlatforms: data.adPlatforms ? JSON.stringify(data.adPlatforms) : undefined,
      monthlyAdBudget: data.monthlyAdBudget,
    };

    const cleanConfigData = Object.fromEntries(
      Object.entries(configData).filter(([, v]) => v !== undefined)
    );

    const contentPrefs = await prisma.onboardingContentPrefs.upsert({
      where: { onboardingId: onboarding.id },
      create: {
        onboardingId: onboarding.id,
        ...cleanConfigData,
      },
      update: cleanConfigData,
    });

    // Update digital footprint config as well
    await prisma.digitalFootprintConfig.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        facebookUrl: data.facebookHandle ? `https://facebook.com/${data.facebookHandle}` : undefined,
        instagramUrl: data.instagramHandle ? `https://instagram.com/${data.instagramHandle}` : undefined,
        linkedinUrl: data.linkedinHandle ? `https://linkedin.com/company/${data.linkedinHandle}` : undefined,
        youtubeUrl: data.youtubeChannel,
        tiktokUrl: data.tiktokHandle ? `https://tiktok.com/@${data.tiktokHandle}` : undefined,
        pinterestUrl: data.pinterestHandle ? `https://pinterest.com/${data.pinterestHandle}` : undefined,
      },
      update: {
        facebookUrl: data.facebookHandle ? `https://facebook.com/${data.facebookHandle}` : undefined,
        instagramUrl: data.instagramHandle ? `https://instagram.com/${data.instagramHandle}` : undefined,
        linkedinUrl: data.linkedinHandle ? `https://linkedin.com/company/${data.linkedinHandle}` : undefined,
        youtubeUrl: data.youtubeChannel,
        tiktokUrl: data.tiktokHandle ? `https://tiktok.com/@${data.tiktokHandle}` : undefined,
        pinterestUrl: data.pinterestHandle ? `https://pinterest.com/${data.pinterestHandle}` : undefined,
      },
    });

    // Store content knowledge for AI
    await storeContentKnowledge(session.user.organizationId, data);

    return NextResponse.json({
      success: true,
      contentPrefs,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving content prefs:", error);
    return NextResponse.json(
      { error: "Failed to save content preferences" },
      { status: 500 }
    );
  }
}

async function storeContentKnowledge(organizationId: string, data: z.infer<typeof contentPrefsSchema>) {
  const knowledgeEntries = [
    { key: "content_tone", value: data.contentTone, category: "marketing" },
    { key: "content_topics", value: data.contentTopics?.join(", "), category: "marketing" },
    { key: "avoid_topics", value: data.avoidTopics?.join(", "), category: "marketing" },
    { key: "seo_focus_keywords", value: data.seoFocus?.join(", "), category: "marketing" },
    { key: "email_platform", value: data.emailPlatform, category: "marketing" },
    { key: "ad_platforms", value: data.adPlatforms?.join(", "), category: "marketing" },
  ].filter(entry => entry.value);

  for (const entry of knowledgeEntries) {
    await prisma.builderKnowledge.upsert({
      where: {
        organizationId_category_key: {
          organizationId,
          category: entry.category,
          key: entry.key,
        },
      },
      create: {
        organizationId,
        category: entry.category,
        key: entry.key,
        value: entry.value!,
        priority: 6,
      },
      update: {
        value: entry.value!,
      },
    });
  }
}
