import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeDigitalFootprintDeep } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      websiteUrl,
      socialProfiles,
      tiktokUrl,
      pinterestUrl,
      yelpUrl,
      bbbUrl,
      houzzUrl,
      competitorUrls,
    } = await req.json();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Save/update the digital footprint config with all URLs
    await prisma.digitalFootprintConfig.upsert({
      where: { organizationId: session.user.organizationId },
      update: {
        websiteUrl,
        facebookUrl: socialProfiles?.find((u: string) => u.includes("facebook")) || null,
        instagramUrl: socialProfiles?.find((u: string) => u.includes("instagram")) || null,
        linkedinUrl: socialProfiles?.find((u: string) => u.includes("linkedin")) || null,
        youtubeUrl: socialProfiles?.find((u: string) => u.includes("youtube")) || null,
        tiktokUrl: tiktokUrl || null,
        pinterestUrl: pinterestUrl || null,
        yelpUrl: yelpUrl || null,
        bbbUrl: bbbUrl || null,
        houzzUrl: houzzUrl || null,
      },
      create: {
        organizationId: session.user.organizationId,
        websiteUrl,
        facebookUrl: socialProfiles?.find((u: string) => u.includes("facebook")) || null,
        instagramUrl: socialProfiles?.find((u: string) => u.includes("instagram")) || null,
        linkedinUrl: socialProfiles?.find((u: string) => u.includes("linkedin")) || null,
        youtubeUrl: socialProfiles?.find((u: string) => u.includes("youtube")) || null,
        tiktokUrl: tiktokUrl || null,
        pinterestUrl: pinterestUrl || null,
        yelpUrl: yelpUrl || null,
        bbbUrl: bbbUrl || null,
        houzzUrl: houzzUrl || null,
      },
    });

    // Create a pending report
    const report = await prisma.deepResearchReport.create({
      data: {
        type: "digital_footprint",
        title: `Digital Presence Deep Dive - ${new Date().toLocaleDateString()}`,
        status: "in_progress",
        metadata: JSON.stringify({
          websiteUrl,
          socialProfiles,
          tiktokUrl,
          pinterestUrl,
          yelpUrl,
          bbbUrl,
          houzzUrl,
          competitorUrls,
          analysisType: "multi_pass",
        }),
        startedAt: new Date(),
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Run multi-pass deep research with progress updates
    try {
      const result = await analyzeDigitalFootprintDeep(
        organization.name,
        websiteUrl,
        session.user.organizationId,
        socialProfiles,
        {
          tiktokUrl,
          pinterestUrl,
          yelpUrl,
          bbbUrl,
          houzzUrl,
          competitorUrls,
        },
        async (section, step, totalSteps) => {
          // Update the report metadata with progress
          await prisma.deepResearchReport.update({
            where: { id: report.id },
            data: {
              metadata: JSON.stringify({
                websiteUrl,
                socialProfiles,
                tiktokUrl,
                pinterestUrl,
                yelpUrl,
                bbbUrl,
                houzzUrl,
                competitorUrls,
                analysisType: "multi_pass",
                progress: { section, step, totalSteps },
              }),
            },
          });
        }
      );

      // Store section scores and overall score in metadata
      const updatedReport = await prisma.deepResearchReport.update({
        where: { id: report.id },
        data: {
          status: "completed",
          summary: result.summary,
          findings: JSON.stringify(result.findings),
          sources: JSON.stringify(result.sources),
          recommendations: JSON.stringify(result.recommendations),
          rawResponse: JSON.stringify({
            sectionScores: result.sectionScores,
            overallScore: result.overallScore,
            overallGrade: result.overallGrade,
          }),
          metadata: JSON.stringify({
            websiteUrl,
            socialProfiles,
            tiktokUrl,
            pinterestUrl,
            yelpUrl,
            bbbUrl,
            houzzUrl,
            competitorUrls,
            analysisType: "multi_pass",
            sectionScores: result.sectionScores,
            overallScore: result.overallScore,
            overallGrade: result.overallGrade,
          }),
          completedAt: new Date(),
        },
      });

      return NextResponse.json(updatedReport);
    } catch (error) {
      await prisma.deepResearchReport.update({
        where: { id: report.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  } catch (error) {
    console.error("Digital footprint analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze digital footprint" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.deepResearchReport.findMany({
      where: {
        organizationId: session.user.organizationId,
        type: "digital_footprint",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const config = await prisma.digitalFootprintConfig.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json({ reports, config });
  } catch (error) {
    console.error("Error fetching digital footprint reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
