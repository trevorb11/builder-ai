-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "emailVerified" DATETIME,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "brandVoice" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "amenities" TEXT,
    "schools" TEXT,
    "hoa" TEXT,
    "hoaFee" REAL,
    "startingPrice" REAL,
    "priceRange" TEXT,
    "estimatedMoveIn" TEXT,
    "images" TEXT,
    "virtualTourUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Community_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Floorplan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" REAL NOT NULL,
    "halfBaths" INTEGER NOT NULL DEFAULT 0,
    "squareFeet" INTEGER NOT NULL,
    "stories" INTEGER NOT NULL DEFAULT 1,
    "garageSpaces" INTEGER NOT NULL DEFAULT 2,
    "basePrice" REAL NOT NULL,
    "features" TEXT,
    "images" TEXT,
    "floorplanPdf" TEXT,
    "virtualTourUrl" TEXT,
    "elevations" TEXT,
    "structuralOptions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "communityId" TEXT,
    CONSTRAINT "Floorplan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Floorplan_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryHome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lot" TEXT,
    "block" TEXT,
    "address" TEXT,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "moveInDate" TEXT,
    "completionDate" TEXT,
    "features" TEXT,
    "images" TEXT,
    "mlsNumber" TEXT,
    "virtualTourUrl" TEXT,
    "specialNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "communityId" TEXT NOT NULL,
    "floorplanId" TEXT NOT NULL,
    CONSTRAINT "InventoryHome_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryHome_floorplanId_fkey" FOREIGN KEY ("floorplanId") REFERENCES "Floorplan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incentive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "terms" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "communityId" TEXT NOT NULL,
    CONSTRAINT "Incentive_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "budget" TEXT,
    "timeline" TEXT,
    "notes" TEXT,
    "interestedIn" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "crmSynced" BOOLEAN NOT NULL DEFAULT false,
    "crmId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "communityId" TEXT,
    "floorplanId" TEXT,
    CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lead_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_floorplanId_fkey" FOREIGN KEY ("floorplanId") REFERENCES "Floorplan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'active',
    "summary" TEXT,
    "sentiment" TEXT,
    "intentScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatbotConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Website Assistant',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hi! I''m here to help you find your perfect new home. How can I assist you today?',
    "personality" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "accentColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "position" TEXT NOT NULL DEFAULT 'bottom-right',
    "collectEmail" BOOLEAN NOT NULL DEFAULT true,
    "collectPhone" BOOLEAN NOT NULL DEFAULT true,
    "collectName" BOOLEAN NOT NULL DEFAULT true,
    "autoOpen" BOOLEAN NOT NULL DEFAULT false,
    "autoOpenDelay" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "embedCode" TEXT,
    "customCss" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "ChatbotConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" DATETIME,
    "apiKey" TEXT,
    "instanceUrl" TEXT,
    "portalId" TEXT,
    "settings" TEXT,
    "lastSyncAt" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "CRMIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMWebhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,
    CONSTRAINT "CRMWebhook_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CRMIntegration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMSyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "request" TEXT,
    "response" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,
    CONSTRAINT "CRMSyncLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CRMIntegration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketingContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledFor" DATETIME,
    "publishedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "MarketingContent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketingContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FAQSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "communityId" TEXT,
    CONSTRAINT "FAQSection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FAQSection_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AISearchMonitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "mentions" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" TEXT,
    "competitors" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "AISearchMonitor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "markets" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Competitor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorCommunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "priceRange" TEXT,
    "startingPrice" REAL,
    "amenities" TEXT,
    "schoolInfo" TEXT,
    "hoaFee" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "competitorId" TEXT NOT NULL,
    CONSTRAINT "CompetitorCommunity_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorFloorplan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" REAL,
    "squareFeet" INTEGER,
    "price" REAL,
    "features" TEXT,
    "notes" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "communityId" TEXT NOT NULL,
    CONSTRAINT "CompetitorFloorplan_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "CompetitorCommunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitiveReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "insights" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "competitorId" TEXT,
    CONSTRAINT "CompetitiveReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompetitiveReport_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesTrainingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenario" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "buyerPersona" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "score" INTEGER,
    "feedback" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SalesTrainingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesTrainingMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "feedback" TEXT,
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "SalesTrainingMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SalesTrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesTrainingMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectionHandling" INTEGER,
    "productKnowledge" INTEGER,
    "rapport" INTEGER,
    "closingSkills" INTEGER,
    "listeningSkills" INTEGER,
    "overallScore" INTEGER,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "SalesTrainingMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SalesTrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealtorPortalConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "portalUrl" TEXT,
    "welcomeMessage" TEXT,
    "showPricing" BOOLEAN NOT NULL DEFAULT true,
    "showIncentives" BOOLEAN NOT NULL DEFAULT true,
    "showInventory" BOOLEAN NOT NULL DEFAULT true,
    "showFloorplans" BOOLEAN NOT NULL DEFAULT true,
    "requireLogin" BOOLEAN NOT NULL DEFAULT false,
    "coopCommission" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "customBranding" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "RealtorPortalConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealtorAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "licenseNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "portalId" TEXT NOT NULL,
    CONSTRAINT "RealtorAccess_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "RealtorPortalConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Community_organizationId_idx" ON "Community"("organizationId");

-- CreateIndex
CREATE INDEX "Community_status_idx" ON "Community"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Community_organizationId_slug_key" ON "Community"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "Floorplan_organizationId_idx" ON "Floorplan"("organizationId");

-- CreateIndex
CREATE INDEX "Floorplan_communityId_idx" ON "Floorplan"("communityId");

-- CreateIndex
CREATE INDEX "Floorplan_bedrooms_bathrooms_idx" ON "Floorplan"("bedrooms", "bathrooms");

-- CreateIndex
CREATE INDEX "Floorplan_squareFeet_idx" ON "Floorplan"("squareFeet");

-- CreateIndex
CREATE INDEX "Floorplan_basePrice_idx" ON "Floorplan"("basePrice");

-- CreateIndex
CREATE UNIQUE INDEX "Floorplan_organizationId_slug_key" ON "Floorplan"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "InventoryHome_communityId_idx" ON "InventoryHome"("communityId");

-- CreateIndex
CREATE INDEX "InventoryHome_floorplanId_idx" ON "InventoryHome"("floorplanId");

-- CreateIndex
CREATE INDEX "InventoryHome_status_idx" ON "InventoryHome"("status");

-- CreateIndex
CREATE INDEX "Incentive_communityId_idx" ON "Incentive"("communityId");

-- CreateIndex
CREATE INDEX "Incentive_isActive_idx" ON "Incentive"("isActive");

-- CreateIndex
CREATE INDEX "Lead_organizationId_idx" ON "Lead"("organizationId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_leadId_idx" ON "Conversation"("leadId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_sessionId_idx" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConfig_organizationId_key" ON "ChatbotConfig"("organizationId");

-- CreateIndex
CREATE INDEX "CRMIntegration_organizationId_idx" ON "CRMIntegration"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMIntegration_organizationId_provider_key" ON "CRMIntegration"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "CRMWebhook_integrationId_idx" ON "CRMWebhook"("integrationId");

-- CreateIndex
CREATE INDEX "CRMSyncLog_integrationId_idx" ON "CRMSyncLog"("integrationId");

-- CreateIndex
CREATE INDEX "CRMSyncLog_createdAt_idx" ON "CRMSyncLog"("createdAt");

-- CreateIndex
CREATE INDEX "MarketingContent_organizationId_idx" ON "MarketingContent"("organizationId");

-- CreateIndex
CREATE INDEX "MarketingContent_type_idx" ON "MarketingContent"("type");

-- CreateIndex
CREATE INDEX "MarketingContent_status_idx" ON "MarketingContent"("status");

-- CreateIndex
CREATE INDEX "MarketingContent_createdAt_idx" ON "MarketingContent"("createdAt");

-- CreateIndex
CREATE INDEX "FAQSection_organizationId_idx" ON "FAQSection"("organizationId");

-- CreateIndex
CREATE INDEX "FAQSection_communityId_idx" ON "FAQSection"("communityId");

-- CreateIndex
CREATE INDEX "FAQSection_category_idx" ON "FAQSection"("category");

-- CreateIndex
CREATE INDEX "AISearchMonitor_organizationId_idx" ON "AISearchMonitor"("organizationId");

-- CreateIndex
CREATE INDEX "AISearchMonitor_platform_idx" ON "AISearchMonitor"("platform");

-- CreateIndex
CREATE INDEX "AISearchMonitor_checkedAt_idx" ON "AISearchMonitor"("checkedAt");

-- CreateIndex
CREATE INDEX "Competitor_organizationId_idx" ON "Competitor"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_organizationId_name_key" ON "Competitor"("organizationId", "name");

-- CreateIndex
CREATE INDEX "CompetitorCommunity_competitorId_idx" ON "CompetitorCommunity"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorFloorplan_communityId_idx" ON "CompetitorFloorplan"("communityId");

-- CreateIndex
CREATE INDEX "CompetitiveReport_organizationId_idx" ON "CompetitiveReport"("organizationId");

-- CreateIndex
CREATE INDEX "CompetitiveReport_competitorId_idx" ON "CompetitiveReport"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitiveReport_reportType_idx" ON "CompetitiveReport"("reportType");

-- CreateIndex
CREATE INDEX "SalesTrainingSession_userId_idx" ON "SalesTrainingSession"("userId");

-- CreateIndex
CREATE INDEX "SalesTrainingSession_scenario_idx" ON "SalesTrainingSession"("scenario");

-- CreateIndex
CREATE INDEX "SalesTrainingSession_createdAt_idx" ON "SalesTrainingSession"("createdAt");

-- CreateIndex
CREATE INDEX "SalesTrainingMessage_sessionId_idx" ON "SalesTrainingMessage"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesTrainingMetrics_sessionId_key" ON "SalesTrainingMetrics"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RealtorPortalConfig_organizationId_key" ON "RealtorPortalConfig"("organizationId");

-- CreateIndex
CREATE INDEX "RealtorAccess_portalId_idx" ON "RealtorAccess"("portalId");

-- CreateIndex
CREATE INDEX "RealtorAccess_email_idx" ON "RealtorAccess"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RealtorAccess_portalId_email_key" ON "RealtorAccess"("portalId", "email");
