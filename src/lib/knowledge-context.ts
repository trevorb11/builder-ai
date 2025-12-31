import { prisma } from "@/lib/db";

// Feature types for context filtering
export type FeatureType = "chatbot" | "sales_training" | "marketing" | "research" | "all";

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
  documents: Array<{
    name: string;
    category: string;
    summary?: string;
    keyPoints?: string[];
  }>;
}

/**
 * Fetches and aggregates all builder knowledge for AI context
 */
export async function getBuilderContext(
  organizationId: string,
  options?: { feature?: FeatureType; includeDocuments?: boolean }
): Promise<BuilderContext> {
  const feature = options?.feature || "all";
  const includeDocuments = options?.includeDocuments !== false;

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
      documents: includeDocuments
        ? {
            where: {
              isActive: true,
              status: "ready",
            },
            orderBy: { priority: "desc" },
          }
        : undefined,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const profile = organization.onboarding?.companyProfile;
  const salesConfig = organization.onboarding?.salesConfig;
  const contentPrefs = organization.onboarding?.contentPrefs;

  // Filter documents by target feature
  let filteredDocs = organization.documents || [];
  if (feature !== "all" && includeDocuments) {
    filteredDocs = filteredDocs.filter((doc) => {
      if (!doc.targetFeatures) return true;
      const targets = JSON.parse(doc.targetFeatures);
      return targets.includes("all") || targets.includes(feature);
    });
  }

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
    documents: filteredDocs.map((d) => ({
      name: d.name,
      category: d.category,
      summary: d.summary || undefined,
      keyPoints: d.keyPoints ? JSON.parse(d.keyPoints) : undefined,
    })),
  };

  return context;
}

/**
 * Generates a formatted context string for AI prompts
 */
export async function getBuilderContextPrompt(
  organizationId: string,
  options?: { feature?: FeatureType; maxLength?: number }
): Promise<string> {
  const feature = options?.feature || "all";
  const maxLength = options?.maxLength || 12000;

  const context = await getBuilderContext(organizationId, { feature });

  const sections: string[] = [];

  // Company overview (always include)
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

  // Communities (for chatbot, sales, marketing)
  if (["chatbot", "sales_training", "marketing", "all"].includes(feature) && context.communities.length > 0) {
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

  // Sales info (for sales training primarily)
  if (["sales_training", "chatbot", "all"].includes(feature)) {
    if (context.sales.uniqueSellingPoints || context.sales.commonObjections) {
      sections.push(`## Sales Information
${context.sales.uniqueSellingPoints?.length ? `**Unique Selling Points:**
${context.sales.uniqueSellingPoints.map((p) => `- ${p}`).join("\n")}` : ""}

${context.sales.commonObjections?.length ? `**Common Objections & How to Handle:**
${context.sales.commonObjections.map((o) => `- ${o}`).join("\n")}` : ""}

${context.sales.pricingStrategy ? `**Pricing Strategy:** ${context.sales.pricingStrategy}` : ""}

${context.sales.salesProcess ? `**Sales Process:** ${context.sales.salesProcess}` : ""}`);
    }

    // Buyer personas (for sales training)
    if (feature === "sales_training" && context.sales.buyerPersonas?.length) {
      sections.push(`## Buyer Personas
${context.sales.buyerPersonas.map((p) => `
### ${p.name}
${p.description}
${p.motivations?.length ? `- Motivations: ${p.motivations.join(", ")}` : ""}
${p.objections?.length ? `- Typical Objections: ${p.objections.join(", ")}` : ""}`).join("\n")}`);
    }
  }

  // Competitors (for research, sales training)
  if (["research", "sales_training", "all"].includes(feature) && context.competitors.length > 0) {
    sections.push(`## Competitors
${context.competitors.map((c) => `- ${c.name}${c.website ? ` (${c.website})` : ""}${c.markets?.length ? ` - Markets: ${c.markets.join(", ")}` : ""}`).join("\n")}`);
  }

  // Marketing preferences (for marketing feature)
  if (["marketing", "all"].includes(feature)) {
    if (context.marketing.contentTone || context.marketing.contentTopics?.length) {
      sections.push(`## Marketing Guidelines
${context.marketing.contentTone ? `- Content Tone: ${context.marketing.contentTone}` : ""}
${context.marketing.contentTopics?.length ? `- Focus Topics: ${context.marketing.contentTopics.join(", ")}` : ""}
${context.marketing.avoidTopics?.length ? `- Topics to Avoid: ${context.marketing.avoidTopics.join(", ")}` : ""}
${context.marketing.seoFocus?.length ? `- SEO Keywords: ${context.marketing.seoFocus.join(", ")}` : ""}`);
    }
  }

  // Additional knowledge
  if (context.knowledge.length > 0) {
    // Filter knowledge by feature
    let filteredKnowledge = context.knowledge;
    if (feature === "sales_training") {
      filteredKnowledge = context.knowledge.filter((k) =>
        ["sales", "company", "buyer_persona", "competitor_objection"].includes(k.category)
      );
    } else if (feature === "marketing") {
      filteredKnowledge = context.knowledge.filter((k) =>
        ["marketing", "company", "seo"].includes(k.category)
      );
    } else if (feature === "chatbot") {
      filteredKnowledge = context.knowledge.filter((k) =>
        ["company", "faq", "community", "floorplan", "pricing"].includes(k.category)
      );
    }

    if (filteredKnowledge.length > 0) {
      const groupedKnowledge: Record<string, typeof context.knowledge> = {};
      for (const k of filteredKnowledge) {
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
  }

  // Documents (summaries and key points)
  if (context.documents.length > 0) {
    sections.push(`## Reference Documents
${context.documents.map((doc) => `
### ${doc.name} (${doc.category.replace(/_/g, " ")})
${doc.summary ? `Summary: ${doc.summary}` : ""}
${doc.keyPoints?.length ? `Key Points:\n${doc.keyPoints.map((p) => `- ${p}`).join("\n")}` : ""}`).join("\n")}`);
  }

  let result = sections.join("\n\n");

  // Truncate if too long (preserve complete sections)
  if (result.length > maxLength) {
    const truncatedSections = [];
    let totalLength = 0;

    for (const section of sections) {
      if (totalLength + section.length < maxLength - 100) {
        truncatedSections.push(section);
        totalLength += section.length;
      } else {
        break;
      }
    }

    result = truncatedSections.join("\n\n");
    result += "\n\n[Context truncated due to length]";
  }

  return result;
}

/**
 * Get context specifically for the chatbot feature
 */
export async function getChatbotContext(organizationId: string): Promise<string> {
  return getBuilderContextPrompt(organizationId, { feature: "chatbot", maxLength: 10000 });
}

/**
 * Get context specifically for sales training
 */
export async function getSalesTrainingContext(organizationId: string): Promise<string> {
  return getBuilderContextPrompt(organizationId, { feature: "sales_training", maxLength: 8000 });
}

/**
 * Get context specifically for marketing content generation
 */
export async function getMarketingContext(organizationId: string): Promise<string> {
  return getBuilderContextPrompt(organizationId, { feature: "marketing", maxLength: 8000 });
}

/**
 * Get context for competitive research
 */
export async function getResearchContext(organizationId: string): Promise<string> {
  return getBuilderContextPrompt(organizationId, { feature: "research", maxLength: 6000 });
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

/**
 * Get document content for a specific feature
 */
export async function getDocumentContext(
  organizationId: string,
  feature: FeatureType,
  limit: number = 5
): Promise<string> {
  const documents = await prisma.knowledgeDocument.findMany({
    where: {
      organizationId,
      isActive: true,
      status: "ready",
    },
    orderBy: { priority: "desc" },
    take: limit * 2, // Fetch extra to filter
  });

  const filtered = documents.filter((doc) => {
    if (!doc.targetFeatures) return true;
    const targets = JSON.parse(doc.targetFeatures);
    return targets.includes("all") || targets.includes(feature);
  }).slice(0, limit);

  if (filtered.length === 0) {
    return "";
  }

  return `## Reference Documents\n${filtered.map((doc) => {
    const keyPoints = doc.keyPoints ? JSON.parse(doc.keyPoints) : [];
    return `### ${doc.name}
${doc.summary || ""}
${keyPoints.length > 0 ? `Key Points:\n${keyPoints.map((p: string) => `- ${p}`).join("\n")}` : ""}`;
  }).join("\n\n")}`;
}
