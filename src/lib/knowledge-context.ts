import { prisma } from "@/lib/db";

export interface BuilderContext {
  company: {
    name: string;
    tagline?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    brandVoice?: string;
    valueProposition?: string;
    differentiators?: string;
    targetBuyers?: string[];
    markets?: string[];
    certifications?: string[];
    awards?: string[];
  };
  communities: Array<{
    name: string;
    city?: string;
    state?: string;
    description?: string;
    amenities?: string[];
    priceRange?: string;
    startingPrice?: number;
    schools?: string[];
    hoaFee?: number;
    status: string;
    floorplans: Array<{
      name: string;
      bedrooms: number;
      bathrooms: number;
      squareFeet: number;
      basePrice: number;
      features?: string[];
    }>;
    incentives: Array<{
      title: string;
      description: string;
      value?: string;
    }>;
  }>;
  competitors: Array<{
    name: string;
    website?: string;
    markets?: string[];
  }>;
  sales: {
    uniqueSellingPoints?: string[];
    commonObjections?: string[];
    pricingStrategy?: string;
    salesProcess?: string;
    buyerPersonas?: Array<{
      name: string;
      description: string;
      motivations?: string[];
      objections?: string[];
    }>;
  };
  marketing: {
    contentTone?: string;
    contentTopics?: string[];
    avoidTopics?: string[];
    seoFocus?: string[];
    socialHandles?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  knowledge: Array<{
    category: string;
    key: string;
    value: string;
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * Fetches and aggregates all builder knowledge for AI context
 */
export async function getBuilderContext(organizationId: string): Promise<BuilderContext> {
  // Fetch organization with all related data
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      onboarding: {
        include: {
          companyProfile: true,
          salesConfig: true,
          contentPrefs: true,
        },
      },
      communities: {
        where: { status: { not: "sold_out" } },
        include: {
          floorplans: {
            where: { status: "active" },
          },
          incentives: {
            where: { isActive: true },
          },
        },
      },
      competitors: true,
      knowledge: {
        where: { isActive: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const profile = organization.onboarding?.companyProfile;
  const salesConfig = organization.onboarding?.salesConfig;
  const contentPrefs = organization.onboarding?.contentPrefs;

  // Build the context object
  const context: BuilderContext = {
    company: {
      name: organization.name,
      tagline: profile?.tagline || undefined,
      description: organization.description || undefined,
      website: organization.website || undefined,
      phone: organization.phone || undefined,
      email: organization.email || undefined,
      brandVoice: profile?.brandVoice || organization.brandVoice || undefined,
      valueProposition: profile?.valueProposition || undefined,
      differentiators: profile?.differentiators || undefined,
      targetBuyers: profile?.targetBuyers ? JSON.parse(profile.targetBuyers) : undefined,
      markets: profile?.markets ? JSON.parse(profile.markets) : undefined,
      certifications: profile?.certifications ? JSON.parse(profile.certifications) : undefined,
      awards: profile?.awards ? JSON.parse(profile.awards) : undefined,
    },
    communities: organization.communities.map((c) => ({
      name: c.name,
      city: c.city || undefined,
      state: c.state || undefined,
      description: c.description || undefined,
      amenities: c.amenities ? JSON.parse(c.amenities) : undefined,
      priceRange: c.priceRange || undefined,
      startingPrice: c.startingPrice || undefined,
      schools: c.schools ? JSON.parse(c.schools) : undefined,
      hoaFee: c.hoaFee || undefined,
      status: c.status,
      floorplans: c.floorplans.map((f) => ({
        name: f.name,
        bedrooms: f.bedrooms,
        bathrooms: f.bathrooms,
        squareFeet: f.squareFeet,
        basePrice: f.basePrice,
        features: f.features ? JSON.parse(f.features) : undefined,
      })),
      incentives: c.incentives.map((i) => ({
        title: i.title,
        description: i.description,
        value: i.value || undefined,
      })),
    })),
    competitors: organization.competitors.map((c) => ({
      name: c.name,
      website: c.website || undefined,
      markets: c.markets ? JSON.parse(c.markets) : undefined,
    })),
    sales: {
      uniqueSellingPoints: salesConfig?.uniqueSellingPoints
        ? JSON.parse(salesConfig.uniqueSellingPoints)
        : undefined,
      commonObjections: salesConfig?.commonObjections
        ? JSON.parse(salesConfig.commonObjections)
        : undefined,
      pricingStrategy: salesConfig?.pricingStrategy || undefined,
      salesProcess: salesConfig?.salesProcess || undefined,
      buyerPersonas: salesConfig?.buyerPersonas
        ? JSON.parse(salesConfig.buyerPersonas)
        : undefined,
    },
    marketing: {
      contentTone: contentPrefs?.contentTone || undefined,
      contentTopics: contentPrefs?.contentTopics
        ? JSON.parse(contentPrefs.contentTopics)
        : undefined,
      avoidTopics: contentPrefs?.avoidTopics
        ? JSON.parse(contentPrefs.avoidTopics)
        : undefined,
      seoFocus: contentPrefs?.seoFocus
        ? JSON.parse(contentPrefs.seoFocus)
        : undefined,
      socialHandles: {
        facebook: contentPrefs?.facebookHandle || undefined,
        instagram: contentPrefs?.instagramHandle || undefined,
        linkedin: contentPrefs?.linkedinHandle || undefined,
        youtube: contentPrefs?.youtubeChannel || undefined,
      },
    },
    knowledge: organization.knowledge.map((k) => ({
      category: k.category,
      key: k.key,
      value: k.value,
      metadata: k.metadata ? JSON.parse(k.metadata) : undefined,
    })),
  };

  return context;
}

/**
 * Generates a formatted context string for AI prompts
 */
export async function getBuilderContextPrompt(organizationId: string): Promise<string> {
  const context = await getBuilderContext(organizationId);

  const sections: string[] = [];

  // Company overview
  sections.push(`## Company Overview
- Name: ${context.company.name}
${context.company.tagline ? `- Tagline: ${context.company.tagline}` : ""}
${context.company.description ? `- About: ${context.company.description}` : ""}
${context.company.valueProposition ? `- Value Proposition: ${context.company.valueProposition}` : ""}
${context.company.differentiators ? `- What Makes Us Different: ${context.company.differentiators}` : ""}
${context.company.brandVoice ? `- Brand Voice: ${context.company.brandVoice}` : ""}
${context.company.targetBuyers?.length ? `- Target Buyers: ${context.company.targetBuyers.join(", ")}` : ""}
${context.company.markets?.length ? `- Markets: ${context.company.markets.join(", ")}` : ""}
${context.company.certifications?.length ? `- Certifications: ${context.company.certifications.join(", ")}` : ""}
${context.company.awards?.length ? `- Awards: ${context.company.awards.join(", ")}` : ""}
${context.company.website ? `- Website: ${context.company.website}` : ""}
${context.company.phone ? `- Phone: ${context.company.phone}` : ""}
${context.company.email ? `- Email: ${context.company.email}` : ""}`);

  // Communities
  if (context.communities.length > 0) {
    sections.push(`## Communities\n${context.communities.map((c) => `
### ${c.name}
- Location: ${c.city ? `${c.city}, ` : ""}${c.state || ""}
${c.description ? `- Description: ${c.description}` : ""}
${c.priceRange ? `- Price Range: ${c.priceRange}` : ""}
${c.startingPrice ? `- Starting From: $${c.startingPrice.toLocaleString()}` : ""}
${c.amenities?.length ? `- Amenities: ${c.amenities.join(", ")}` : ""}
${c.schools?.length ? `- Nearby Schools: ${c.schools.join(", ")}` : ""}
${c.hoaFee ? `- HOA Fee: $${c.hoaFee}/month` : ""}
${c.status ? `- Status: ${c.status}` : ""}

**Floorplans:**
${c.floorplans.map((f) => `- ${f.name}: ${f.bedrooms}BR/${f.bathrooms}BA, ${f.squareFeet.toLocaleString()} sq ft, from $${f.basePrice.toLocaleString()}${f.features?.length ? ` | Features: ${f.features.join(", ")}` : ""}`).join("\n")}

${c.incentives.length > 0 ? `**Current Incentives:**
${c.incentives.map((i) => `- ${i.title}: ${i.description}${i.value ? ` (${i.value})` : ""}`).join("\n")}` : ""}`).join("\n")}`);
  }

  // Sales info
  if (context.sales.uniqueSellingPoints || context.sales.commonObjections) {
    sections.push(`## Sales Information
${context.sales.uniqueSellingPoints?.length ? `**Unique Selling Points:**
${context.sales.uniqueSellingPoints.map((p) => `- ${p}`).join("\n")}` : ""}

${context.sales.commonObjections?.length ? `**Common Objections & How to Handle:**
${context.sales.commonObjections.map((o) => `- ${o}`).join("\n")}` : ""}

${context.sales.pricingStrategy ? `**Pricing Strategy:** ${context.sales.pricingStrategy}` : ""}

${context.sales.salesProcess ? `**Sales Process:** ${context.sales.salesProcess}` : ""}`);
  }

  // Buyer personas
  if (context.sales.buyerPersonas?.length) {
    sections.push(`## Buyer Personas
${context.sales.buyerPersonas.map((p) => `
### ${p.name}
${p.description}
${p.motivations?.length ? `- Motivations: ${p.motivations.join(", ")}` : ""}
${p.objections?.length ? `- Typical Objections: ${p.objections.join(", ")}` : ""}`).join("\n")}`);
  }

  // Competitors
  if (context.competitors.length > 0) {
    sections.push(`## Competitors
${context.competitors.map((c) => `- ${c.name}${c.website ? ` (${c.website})` : ""}${c.markets?.length ? ` - Markets: ${c.markets.join(", ")}` : ""}`).join("\n")}`);
  }

  // Marketing preferences
  if (context.marketing.contentTone || context.marketing.contentTopics?.length) {
    sections.push(`## Marketing Guidelines
${context.marketing.contentTone ? `- Content Tone: ${context.marketing.contentTone}` : ""}
${context.marketing.contentTopics?.length ? `- Focus Topics: ${context.marketing.contentTopics.join(", ")}` : ""}
${context.marketing.avoidTopics?.length ? `- Topics to Avoid: ${context.marketing.avoidTopics.join(", ")}` : ""}
${context.marketing.seoFocus?.length ? `- SEO Keywords: ${context.marketing.seoFocus.join(", ")}` : ""}`);
  }

  // Additional knowledge
  if (context.knowledge.length > 0) {
    const groupedKnowledge: Record<string, typeof context.knowledge> = {};
    for (const k of context.knowledge) {
      if (!groupedKnowledge[k.category]) {
        groupedKnowledge[k.category] = [];
      }
      groupedKnowledge[k.category].push(k);
    }

    sections.push(`## Additional Knowledge
${Object.entries(groupedKnowledge).map(([category, items]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, " ")}
${items.map((item) => `- ${item.key.replace(/_/g, " ")}: ${item.value}`).join("\n")}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

/**
 * Get a simplified context for quick AI responses
 */
export async function getQuickContext(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      onboarding: {
        include: {
          companyProfile: true,
        },
      },
      communities: {
        where: { status: "active" },
        take: 5,
      },
    },
  });

  if (!org) {
    return "No builder information available.";
  }

  const profile = org.onboarding?.companyProfile;

  return `You are representing ${org.name}${profile?.tagline ? `, "${profile.tagline}"` : ""}.
${org.description || profile?.valueProposition || ""}
${profile?.brandVoice ? `Speak in a ${profile.brandVoice} tone.` : ""}
${org.communities.length > 0 ? `We have ${org.communities.length} active communities.` : ""}`;
}
