import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.inventoryHome.deleteMany();
  await prisma.incentive.deleteMany();
  await prisma.floorplan.deleteMany();
  await prisma.community.deleteMany();
  await prisma.fAQSection.deleteMany();
  await prisma.marketingContent.deleteMany();
  await prisma.competitorFloorplan.deleteMany();
  await prisma.competitorCommunity.deleteMany();
  await prisma.competitiveReport.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.salesTrainingMessage.deleteMany();
  await prisma.salesTrainingMetrics.deleteMany();
  await prisma.salesTrainingSession.deleteMany();
  await prisma.chatbotConfig.deleteMany();
  await prisma.cRMSyncLog.deleteMany();
  await prisma.cRMWebhook.deleteMany();
  await prisma.cRMIntegration.deleteMany();
  await prisma.contentTopic.deleteMany();
  await prisma.deepResearchReport.deleteMany();
  await prisma.digitalFootprintConfig.deleteMany();
  await prisma.contentStrategyConfig.deleteMany();
  await prisma.realtorAccess.deleteMany();
  await prisma.realtorPortalConfig.deleteMany();
  await prisma.aISearchMonitor.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Cleaned existing data...");

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: "Sunrise Homes",
      slug: "sunrise-homes",
      description: "Building quality homes in Texas since 1995. We specialize in energy-efficient new construction homes for growing families.",
      website: "https://sunrisehomes.example.com",
      phone: "(512) 555-0100",
      email: "info@sunrisehomes.example.com",
      address: "100 Builder Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      brandVoice: "Friendly, professional, and family-focused. We emphasize quality craftsmanship, energy efficiency, and creating homes where families can thrive. Use warm language that makes buyers feel welcome.",
    },
  });

  console.log("Created organization:", organization.name);

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@builder.ai",
      name: "Demo User",
      password: "demo123", // In production, use bcrypt
      role: "builder_admin",
      organizationId: organization.id,
    },
  });

  console.log("Created demo user:", user.email);

  // Create communities
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: "Sunset Ridge",
        slug: "sunset-ridge",
        description: "A master-planned community featuring stunning hill country views, resort-style amenities, and top-rated schools.",
        address: "1000 Sunset Ridge Blvd",
        city: "Austin",
        state: "TX",
        zipCode: "78732",
        latitude: 30.4515,
        longitude: -97.8632,
        status: "active",
        amenities: JSON.stringify([
          "Community Pool",
          "Fitness Center",
          "Playground",
          "Walking Trails",
          "Dog Park",
          "Clubhouse",
        ]),
        schools: JSON.stringify([
          { name: "Sunset Ridge Elementary", rating: "9/10", type: "elementary" },
          { name: "Hill Country Middle School", rating: "8/10", type: "middle" },
          { name: "Lake Travis High School", rating: "9/10", type: "high" },
        ]),
        hoaFee: 175,
        startingPrice: 425000,
        priceRange: "$425,000 - $650,000",
        estimatedMoveIn: "60-90 days",
        organizationId: organization.id,
      },
    }),
    prisma.community.create({
      data: {
        name: "The Preserve at Oak Hill",
        slug: "preserve-oak-hill",
        description: "Nestled among mature oak trees, this intimate community offers large homesites with a focus on nature and tranquility.",
        address: "500 Oak Hill Drive",
        city: "Dripping Springs",
        state: "TX",
        zipCode: "78620",
        latitude: 30.2112,
        longitude: -98.0867,
        status: "active",
        amenities: JSON.stringify([
          "Nature Trails",
          "Community Garden",
          "Pavilion",
          "Sports Courts",
        ]),
        schools: JSON.stringify([
          { name: "Dripping Springs Elementary", rating: "9/10", type: "elementary" },
          { name: "Dripping Springs Middle", rating: "8/10", type: "middle" },
          { name: "Dripping Springs High", rating: "9/10", type: "high" },
        ]),
        hoaFee: 125,
        startingPrice: 525000,
        priceRange: "$525,000 - $750,000",
        estimatedMoveIn: "90-120 days",
        organizationId: organization.id,
      },
    }),
    prisma.community.create({
      data: {
        name: "Brookside Crossing",
        slug: "brookside-crossing",
        description: "An affordable new home community with modern designs and convenient access to downtown Austin.",
        address: "2500 Brookside Way",
        city: "Pflugerville",
        state: "TX",
        zipCode: "78660",
        latitude: 30.4393,
        longitude: -97.6200,
        status: "active",
        amenities: JSON.stringify([
          "Community Pool",
          "Splash Pad",
          "Playground",
          "Soccer Field",
        ]),
        schools: JSON.stringify([
          { name: "Brookside Elementary", rating: "8/10", type: "elementary" },
          { name: "Pflugerville Middle", rating: "7/10", type: "middle" },
          { name: "Hendrickson High", rating: "8/10", type: "high" },
        ]),
        hoaFee: 150,
        startingPrice: 350000,
        priceRange: "$350,000 - $475,000",
        estimatedMoveIn: "45-60 days",
        organizationId: organization.id,
      },
    }),
  ]);

  console.log("Created", communities.length, "communities");

  // Create floorplans
  const floorplans = await Promise.all([
    // Sunset Ridge Floorplans
    prisma.floorplan.create({
      data: {
        name: "The Aspen",
        slug: "aspen",
        description: "A stunning open-concept design with a gourmet kitchen, spacious master suite, and covered patio. Perfect for entertaining.",
        bedrooms: 4,
        bathrooms: 3.5,
        halfBaths: 1,
        squareFeet: 2850,
        stories: 2,
        garageSpaces: 3,
        basePrice: 485000,
        features: JSON.stringify([
          "Open concept living",
          "Gourmet kitchen with island",
          "Primary suite downstairs",
          "Game room upstairs",
          "Covered patio",
          "Walk-in pantry",
        ]),
        elevations: JSON.stringify(["Modern", "Hill Country", "Traditional"]),
        structuralOptions: JSON.stringify([
          { name: "Extended covered patio", price: 8500 },
          { name: "Media room", price: 12000 },
          { name: "5th bedroom", price: 15000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[0].id,
      },
    }),
    prisma.floorplan.create({
      data: {
        name: "The Magnolia",
        slug: "magnolia",
        description: "A single-story gem featuring 3 bedrooms, an office, and a luxurious owner's retreat with spa-like bathroom.",
        bedrooms: 3,
        bathrooms: 2.5,
        halfBaths: 0,
        squareFeet: 2200,
        stories: 1,
        garageSpaces: 2,
        basePrice: 425000,
        features: JSON.stringify([
          "Single-story living",
          "Home office",
          "Spa-like master bath",
          "Open kitchen",
          "Covered porch",
          "Split bedroom layout",
        ]),
        elevations: JSON.stringify(["Farmhouse", "Traditional", "Modern"]),
        structuralOptions: JSON.stringify([
          { name: "Extended garage", price: 6000 },
          { name: "Sunroom", price: 18000 },
          { name: "4th bedroom", price: 12000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[0].id,
      },
    }),
    // Preserve at Oak Hill Floorplans
    prisma.floorplan.create({
      data: {
        name: "The Willow",
        slug: "willow",
        description: "Our most popular design featuring soaring ceilings, an expansive great room, and a chef's dream kitchen.",
        bedrooms: 5,
        bathrooms: 4.5,
        halfBaths: 1,
        squareFeet: 3600,
        stories: 2,
        garageSpaces: 3,
        basePrice: 625000,
        features: JSON.stringify([
          "Soaring 20ft ceilings",
          "Chef's kitchen with double islands",
          "Primary suite with sitting area",
          "Second primary suite option",
          "Home theater room",
          "3-car garage",
        ]),
        elevations: JSON.stringify(["Hill Country", "Contemporary", "Mediterranean"]),
        structuralOptions: JSON.stringify([
          { name: "Outdoor kitchen", price: 25000 },
          { name: "Wine room", price: 15000 },
          { name: "Mother-in-law suite", price: 45000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[1].id,
      },
    }),
    prisma.floorplan.create({
      data: {
        name: "The Cedar",
        slug: "cedar",
        description: "A thoughtfully designed home with flex spaces that adapt to your lifestyle needs.",
        bedrooms: 4,
        bathrooms: 3,
        halfBaths: 0,
        squareFeet: 2950,
        stories: 2,
        garageSpaces: 2,
        basePrice: 545000,
        features: JSON.stringify([
          "Flex room / office",
          "Open loft upstairs",
          "Large walk-in closets",
          "Mud room",
          "Covered patio",
          "Energy-efficient design",
        ]),
        elevations: JSON.stringify(["Craftsman", "Modern Farmhouse", "Traditional"]),
        structuralOptions: JSON.stringify([
          { name: "Fireplace", price: 4500 },
          { name: "Enlarged owner's closet", price: 3500 },
          { name: "Butler's pantry", price: 8000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[1].id,
      },
    }),
    // Brookside Crossing Floorplans
    prisma.floorplan.create({
      data: {
        name: "The Maple",
        slug: "maple",
        description: "An efficient and affordable design that doesn't sacrifice style. Perfect for first-time buyers.",
        bedrooms: 3,
        bathrooms: 2,
        halfBaths: 0,
        squareFeet: 1650,
        stories: 1,
        garageSpaces: 2,
        basePrice: 350000,
        features: JSON.stringify([
          "Open floor plan",
          "Kitchen island",
          "Covered porch",
          "Split bedrooms",
          "Walk-in pantry",
        ]),
        elevations: JSON.stringify(["Traditional", "Contemporary"]),
        structuralOptions: JSON.stringify([
          { name: "4th bedroom", price: 10000 },
          { name: "Extended patio", price: 5000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[2].id,
      },
    }),
    prisma.floorplan.create({
      data: {
        name: "The Birch",
        slug: "birch",
        description: "A spacious two-story home with room to grow and a fantastic backyard for family fun.",
        bedrooms: 4,
        bathrooms: 2.5,
        halfBaths: 1,
        squareFeet: 2150,
        stories: 2,
        garageSpaces: 2,
        basePrice: 425000,
        features: JSON.stringify([
          "Large backyard",
          "Game room upstairs",
          "Walk-in closets",
          "Kitchen with breakfast nook",
          "Covered patio",
        ]),
        elevations: JSON.stringify(["Traditional", "Modern", "Craftsman"]),
        structuralOptions: JSON.stringify([
          { name: "5th bedroom", price: 12000 },
          { name: "Media room", price: 10000 },
          { name: "Extended garage", price: 6000 },
        ]),
        status: "active",
        organizationId: organization.id,
        communityId: communities[2].id,
      },
    }),
  ]);

  console.log("Created", floorplans.length, "floorplans");

  // Create incentives
  const incentives = await Promise.all([
    prisma.incentive.create({
      data: {
        title: "Limited Time Closing Cost Credit",
        description: "Receive up to $15,000 toward closing costs when you use our preferred lender.",
        type: "closing_costs",
        value: "$15,000",
        terms: "Must use preferred lender. Subject to lender approval. Offer valid on contracts signed by end of month.",
        isActive: true,
        communityId: communities[0].id,
      },
    }),
    prisma.incentive.create({
      data: {
        title: "Free Premium Upgrade Package",
        description: "Get our $20,000 designer upgrade package FREE including quartz countertops, upgraded cabinets, and premium flooring.",
        type: "upgrade",
        value: "$20,000",
        terms: "Available on select move-in ready homes. Cannot be combined with other offers.",
        isActive: true,
        communityId: communities[0].id,
      },
    }),
    prisma.incentive.create({
      data: {
        title: "Rate Buy-Down Special",
        description: "We'll buy down your interest rate by 1% for the first 2 years of your mortgage.",
        type: "financing",
        value: "1% rate reduction",
        terms: "Must use preferred lender. Subject to credit approval.",
        isActive: true,
        communityId: communities[1].id,
      },
    }),
    prisma.incentive.create({
      data: {
        title: "Realtor Bonus",
        description: "Realtors receive a 4% commission on all sales through December.",
        type: "realtor_bonus",
        value: "4% commission",
        terms: "Buyer must be accompanied by realtor on first visit. Must register client.",
        isActive: true,
        communityId: communities[2].id,
      },
    }),
  ]);

  console.log("Created", incentives.length, "incentives");

  // Create inventory homes
  const inventoryHomes = await Promise.all([
    prisma.inventoryHome.create({
      data: {
        lot: "12",
        block: "A",
        address: "1012 Sunset Ridge Blvd",
        price: 515000,
        status: "available",
        moveInDate: "January 2025",
        features: JSON.stringify([
          "Premium quartz countertops",
          "Extended patio",
          "Upgraded flooring",
          "Smart home package",
        ]),
        communityId: communities[0].id,
        floorplanId: floorplans[0].id,
      },
    }),
    prisma.inventoryHome.create({
      data: {
        lot: "8",
        block: "B",
        address: "1008 Sunset Ridge Blvd",
        price: 445000,
        status: "available",
        moveInDate: "December 2024",
        features: JSON.stringify([
          "Corner lot",
          "Premium appliances",
          "Covered patio extension",
        ]),
        communityId: communities[0].id,
        floorplanId: floorplans[1].id,
      },
    }),
    prisma.inventoryHome.create({
      data: {
        lot: "5",
        block: "C",
        address: "505 Oak Hill Drive",
        price: 675000,
        status: "model",
        features: JSON.stringify([
          "Designer finishes throughout",
          "Outdoor kitchen",
          "Pool ready",
          "Fully landscaped",
        ]),
        communityId: communities[1].id,
        floorplanId: floorplans[2].id,
      },
    }),
    prisma.inventoryHome.create({
      data: {
        lot: "22",
        block: "D",
        address: "2522 Brookside Way",
        price: 365000,
        status: "available",
        moveInDate: "November 2024",
        features: JSON.stringify([
          "Upgraded cabinets",
          "Stainless appliances",
          "Covered patio",
        ]),
        communityId: communities[2].id,
        floorplanId: floorplans[4].id,
      },
    }),
  ]);

  console.log("Created", inventoryHomes.length, "inventory homes");

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        email: "john.smith@email.com",
        phone: "(512) 555-1234",
        firstName: "John",
        lastName: "Smith",
        source: "website_chat",
        status: "qualified",
        budget: "$450,000 - $550,000",
        timeline: "3-6 months",
        notes: "Looking for a single-story home. Has 2 kids. Works from home and needs a dedicated office.",
        interestedIn: JSON.stringify(["Sunset Ridge", "The Magnolia"]),
        score: 85,
        organizationId: organization.id,
        communityId: communities[0].id,
        floorplanId: floorplans[1].id,
      },
    }),
    prisma.lead.create({
      data: {
        email: "sarah.johnson@email.com",
        phone: "(512) 555-2345",
        firstName: "Sarah",
        lastName: "Johnson",
        source: "website_chat",
        status: "new",
        budget: "$600,000+",
        timeline: "6-12 months",
        notes: "Relocating from California. Wants large lot with privacy. Interested in acreage.",
        interestedIn: JSON.stringify(["The Preserve at Oak Hill", "The Willow"]),
        score: 72,
        organizationId: organization.id,
        communityId: communities[1].id,
      },
    }),
    prisma.lead.create({
      data: {
        email: "mike.davis@email.com",
        firstName: "Mike",
        lastName: "Davis",
        source: "website_chat",
        status: "contacted",
        budget: "$350,000 - $400,000",
        timeline: "Immediate",
        notes: "First-time homebuyer. Pre-approved with preferred lender. Very interested in Brookside Crossing.",
        interestedIn: JSON.stringify(["Brookside Crossing", "The Maple"]),
        score: 92,
        organizationId: organization.id,
        communityId: communities[2].id,
        floorplanId: floorplans[4].id,
      },
    }),
    prisma.lead.create({
      data: {
        email: "emily.wilson@email.com",
        phone: "(512) 555-4567",
        firstName: "Emily",
        lastName: "Wilson",
        source: "realtor_portal",
        status: "nurturing",
        budget: "$500,000 - $700,000",
        timeline: "12+ months",
        notes: "Just starting research. Has a home to sell first. Working with realtor Jane Doe.",
        interestedIn: JSON.stringify(["Sunset Ridge", "The Preserve at Oak Hill"]),
        score: 45,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log("Created", leads.length, "leads");

  // Create sample conversations
  const conversation = await prisma.conversation.create({
    data: {
      sessionId: "session_" + Date.now(),
      source: "website",
      status: "closed",
      summary: "User inquired about The Magnolia floorplan in Sunset Ridge. Interested in single-story living and working from home. Captured lead information.",
      sentiment: "positive",
      intentScore: 85,
      leadId: leads[0].id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        role: "assistant",
        content: "Hi! Welcome to Sunrise Homes. I'm here to help you find your perfect new home. What brings you here today?",
        conversationId: conversation.id,
      },
      {
        role: "user",
        content: "I'm looking for a single-story home around $450k. Something with a home office would be great since I work from home.",
        conversationId: conversation.id,
      },
      {
        role: "assistant",
        content: "That's wonderful! Working from home is so common now. I'd love to tell you about our Magnolia floorplan at Sunset Ridge. It's a beautiful single-story home with 3 bedrooms, 2.5 baths, and includes a dedicated home office. Starting at $425,000, it might be perfect for you! Would you like to learn more about the features?",
        conversationId: conversation.id,
      },
      {
        role: "user",
        content: "Yes that sounds great! Tell me more about the office and the community.",
        conversationId: conversation.id,
      },
      {
        role: "assistant",
        content: "The Magnolia's home office is located at the front of the home with a separate entrance - perfect for privacy during work calls. The Sunset Ridge community offers resort-style amenities including a pool, fitness center, and walking trails. It's zoned for top-rated Lake Travis schools. We currently have a $15,000 closing cost credit available! Would you like to schedule a tour?",
        conversationId: conversation.id,
      },
    ],
  });

  console.log("Created sample conversation with messages");

  // Create chatbot config
  await prisma.chatbotConfig.create({
    data: {
      name: "Sunrise Homes Assistant",
      welcomeMessage: "Hi! I'm your personal home finding assistant at Sunrise Homes. How can I help you find your dream home today?",
      personality: JSON.stringify({
        tone: "friendly",
        style: "helpful",
        traits: ["warm", "knowledgeable", "patient"],
      }),
      primaryColor: "#2563eb",
      accentColor: "#3b82f6",
      position: "bottom-right",
      collectEmail: true,
      collectPhone: true,
      collectName: true,
      autoOpen: false,
      autoOpenDelay: 30,
      isActive: true,
      organizationId: organization.id,
    },
  });

  console.log("Created chatbot config");

  // Create competitors
  const competitors = await Promise.all([
    prisma.competitor.create({
      data: {
        name: "Taylor Morrison",
        website: "https://taylormorrison.com",
        description: "National builder with strong presence in Austin market",
        markets: JSON.stringify(["Austin", "San Antonio", "Houston"]),
        organizationId: organization.id,
      },
    }),
    prisma.competitor.create({
      data: {
        name: "Meritage Homes",
        website: "https://meritagehomes.com",
        description: "Known for energy-efficient homes",
        markets: JSON.stringify(["Austin", "Dallas", "Phoenix"]),
        organizationId: organization.id,
      },
    }),
    prisma.competitor.create({
      data: {
        name: "KB Home",
        website: "https://kbhome.com",
        description: "Focus on personalization and design studios",
        markets: JSON.stringify(["Austin", "San Antonio"]),
        organizationId: organization.id,
      },
    }),
  ]);

  console.log("Created", competitors.length, "competitors");

  // Create competitor communities
  const competitorCommunity = await prisma.competitorCommunity.create({
    data: {
      name: "Rancho Sienna",
      city: "Georgetown",
      state: "TX",
      priceRange: "$400,000 - $600,000",
      startingPrice: 400000,
      amenities: JSON.stringify(["Pool", "Trails", "Parks"]),
      hoaFee: 165,
      competitorId: competitors[0].id,
    },
  });

  await prisma.competitorFloorplan.createMany({
    data: [
      {
        name: "The Bristol",
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2400,
        price: 450000,
        features: JSON.stringify(["Open concept", "2-car garage"]),
        communityId: competitorCommunity.id,
      },
      {
        name: "The Carlisle",
        bedrooms: 5,
        bathrooms: 4,
        squareFeet: 3200,
        price: 550000,
        features: JSON.stringify(["Game room", "3-car garage"]),
        communityId: competitorCommunity.id,
      },
    ],
  });

  console.log("Created competitor community and floorplans");

  // Create FAQs
  await prisma.fAQSection.createMany({
    data: [
      {
        category: "general",
        question: "How long does it take to build a new home with Sunrise Homes?",
        answer: "Our typical build time is 6-9 months from contract to closing, depending on the floorplan and customizations. Move-in ready inventory homes can close in as little as 30-45 days.",
        sortOrder: 1,
        isActive: true,
        organizationId: organization.id,
      },
      {
        category: "financing",
        question: "Do you offer financing assistance or preferred lender programs?",
        answer: "Yes! We work with several preferred lenders who offer competitive rates and special incentives for Sunrise Homes buyers. Our current promotion includes up to $15,000 in closing cost credits when using a preferred lender.",
        sortOrder: 2,
        isActive: true,
        organizationId: organization.id,
      },
      {
        category: "pricing",
        question: "What is included in the base price of a Sunrise home?",
        answer: "Our base prices include quality construction, standard features like granite countertops, stainless appliances, and energy-efficient systems. We also include a 2-10 Home Buyers Warranty. Lot premiums, structural options, and design upgrades are additional.",
        sortOrder: 3,
        isActive: true,
        organizationId: organization.id,
      },
      {
        category: "features",
        question: "Are Sunrise Homes energy efficient?",
        answer: "Absolutely! All our homes are built to exceed ENERGY STAR standards. We include spray foam insulation, low-E windows, high-efficiency HVAC systems, and LED lighting. Homeowners typically save 20-30% on utility bills compared to older homes.",
        sortOrder: 4,
        isActive: true,
        organizationId: organization.id,
      },
      {
        category: "timeline",
        question: "Can I make changes during the building process?",
        answer: "Yes, to a point. Structural options must be selected before construction begins. Design selections (flooring, cabinets, countertops) are made at our Design Center before drywall. Changes after these milestones may incur additional fees or delays.",
        sortOrder: 5,
        isActive: true,
        organizationId: organization.id,
      },
    ],
  });

  console.log("Created FAQs");

  // Create marketing content
  await prisma.marketingContent.createMany({
    data: [
      {
        title: "New Move-In Ready Homes at Sunset Ridge",
        type: "social_post",
        platform: "facebook",
        content: "Just released! Beautiful move-in ready homes at Sunset Ridge starting from the $420s. Premium upgrades included, top-rated Lake Travis schools, and amazing resort-style amenities. Schedule your tour today! #NewHomeAustin #SunriseHomes #LakeTravisLiving",
        status: "approved",
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: "Limited Time Closing Cost Special",
        type: "email",
        platform: "email",
        content: "Subject: Save Up to $15,000 on Your Dream Home\n\nDear Future Homeowner,\n\nFor a limited time, Sunrise Homes is offering up to $15,000 toward your closing costs when you purchase a new home and use our preferred lender.\n\nThis is a fantastic opportunity to:\n- Reduce your upfront costs\n- Get into your dream home sooner\n- Lock in today's prices\n\nOur communities feature stunning designs, resort-style amenities, and are located in top-rated school districts.\n\nSchedule your tour today to learn more!\n\nWarm regards,\nThe Sunrise Homes Team",
        status: "approved",
        organizationId: organization.id,
        createdById: user.id,
      },
    ],
  });

  console.log("Created marketing content");

  // Create realtor portal config
  const realtorPortal = await prisma.realtorPortalConfig.create({
    data: {
      isActive: true,
      welcomeMessage: "Welcome to the Sunrise Homes Realtor Portal. Access inventory, floorplans, and commission information.",
      showPricing: true,
      showIncentives: true,
      showInventory: true,
      showFloorplans: true,
      requireLogin: false,
      coopCommission: "3% standard co-op commission on all sales. 4% bonus commission through December!",
      contactEmail: "realtors@sunrisehomes.example.com",
      contactPhone: "(512) 555-0150",
      organizationId: organization.id,
    },
  });

  // Create realtor access
  await prisma.realtorAccess.createMany({
    data: [
      {
        email: "jane.doe@realty.com",
        name: "Jane Doe",
        company: "Austin Elite Realty",
        phone: "(512) 555-8888",
        licenseNumber: "TX-123456",
        isVerified: true,
        isActive: true,
        portalId: realtorPortal.id,
      },
      {
        email: "bob.realtor@homes.com",
        name: "Bob Anderson",
        company: "Central Texas Homes",
        phone: "(512) 555-9999",
        licenseNumber: "TX-789012",
        isVerified: true,
        isActive: true,
        portalId: realtorPortal.id,
      },
    ],
  });

  console.log("Created realtor portal config and agents");

  // Create content strategy config
  await prisma.contentStrategyConfig.create({
    data: {
      markets: JSON.stringify(["Austin, TX", "Dripping Springs, TX", "Pflugerville, TX"]),
      targetAudience: "First-time homebuyers and growing families looking for quality new construction homes in the Austin metro area",
      brandVoice: "Friendly, professional, and family-focused",
      contentGoals: JSON.stringify([
        "Increase website traffic",
        "Generate qualified leads",
        "Establish thought leadership",
        "Improve AI search visibility",
      ]),
      organizationId: organization.id,
    },
  });

  // Create digital footprint config
  await prisma.digitalFootprintConfig.create({
    data: {
      websiteUrl: "https://sunrisehomes.example.com",
      facebookUrl: "https://facebook.com/sunrisehomes",
      instagramUrl: "https://instagram.com/sunrisehomes",
      linkedinUrl: "https://linkedin.com/company/sunrise-homes",
      youtubeUrl: "https://youtube.com/@sunrisehomes",
      organizationId: organization.id,
    },
  });

  console.log("Created content strategy and digital footprint configs");

  // Create sample content topics
  await prisma.contentTopic.createMany({
    data: [
      {
        title: "First-Time Homebuyer Guide: What to Expect When Building New",
        category: "education",
        description: "Comprehensive guide covering the new home building process from lot selection to closing day.",
        keywords: JSON.stringify(["first time homebuyer", "new construction process", "building a home"]),
        priority: "high",
        status: "suggested",
        organizationId: organization.id,
      },
      {
        title: "Best Neighborhoods for Families in Austin 2024",
        category: "local",
        description: "Highlight top Austin-area communities with great schools, amenities, and family-friendly features.",
        keywords: JSON.stringify(["best neighborhoods Austin", "family communities", "top schools Austin"]),
        priority: "high",
        status: "planned",
        organizationId: organization.id,
      },
      {
        title: "Energy-Efficient Home Features That Save Money",
        category: "seo",
        description: "Detail the energy-saving features in new construction and calculate potential savings.",
        keywords: JSON.stringify(["energy efficient homes", "home energy savings", "green building"]),
        priority: "medium",
        status: "suggested",
        organizationId: organization.id,
      },
      {
        title: "Virtual Tour: Inside The Willow at The Preserve",
        category: "social",
        description: "Create engaging video content showcasing our most popular luxury floorplan.",
        keywords: JSON.stringify(["home tour", "luxury home Austin", "new home walkthrough"]),
        priority: "medium",
        status: "suggested",
        organizationId: organization.id,
      },
    ],
  });

  console.log("Created content topics");

  console.log("\n=================================");
  console.log("Seed completed successfully!");
  console.log("=================================");
  console.log("\nDemo login credentials:");
  console.log("Email: demo@builder.ai");
  console.log("Password: demo123");
  console.log("\nData created:");
  console.log("- 1 Organization (Sunrise Homes)");
  console.log("- 1 Demo User");
  console.log("- 3 Communities");
  console.log("- 6 Floorplans");
  console.log("- 4 Inventory Homes");
  console.log("- 4 Incentives");
  console.log("- 4 Leads with conversations");
  console.log("- 3 Competitors");
  console.log("- 5 FAQs");
  console.log("- Marketing content samples");
  console.log("- Realtor portal with 2 agents");
  console.log("- Content strategy config");
  console.log("=================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
