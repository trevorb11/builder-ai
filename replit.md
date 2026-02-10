# Builder AI Platform

## Overview

Builder AI is a comprehensive SaaS platform designed specifically for new home builders, providing AI-powered tools across multiple business functions. The platform integrates website chatbots, marketing content generation, sales training, competitive intelligence, CRM synchronization, realtor portals, SEO optimization, and deep research capabilities. Built on Next.js 16 with React 19, it uses a modern full-stack architecture with server-side rendering, server actions, and real-time AI interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- Added Knowledge Base feature for building AI knowledge across all tools
  - New KnowledgeBaseEntry model in database for storing text, files, and website content
  - Knowledge Base page at `/dashboard/knowledge-base` with manager component
  - API endpoints for CRUD operations with organization-based isolation
  - Text content entry with title, content, and category
  - File uploads for .txt and .md files with automatic content extraction
  - Website connections with automatic content fetching and extraction
  - Toggle to enable/disable entries for AI context
- Split "Online Presence" and "AI Readiness" into separate navigation items and pages
- Added comprehensive competitor Battle Card feature with AI-powered head-to-head comparisons showing strengths, price/value/size advantages, winning points, and sales talking points
- Created Deep Dive analysis feature with executive summary, market positioning, pricing analysis, product comparison, community analysis, sales strategy with objection handling, marketing recommendations, and prioritized action items
- Added download functionality for full competitor analysis reports
- Fixed critical IDOR security vulnerability by enforcing competitor ownership verification in battle-card API
- Fixed runtime crash when organization has no floorplans by adding guards for empty arrays
- Added user-facing error handling to battle card generation with clear error messages
- Extended Organization model with new fields: tagline, buyerPersonas, differentiators, marketsServed, preferredLender, pricingContacts
- Added Brand Identity section to Organization Settings form with fields for tagline, buyer personas, key differentiators, and geographic markets
- Added Financing & Pricing section to Organization Settings form with fields for preferred lender and pricing contacts
- Created reusable Breadcrumb component (`src/components/ui/breadcrumb.tsx`) for improved navigation
- Updated onboarding API to auto-detect when new brand identity and financing fields are filled
- Fixed security vulnerabilities: upgraded Next.js to 16.1.1, updated Hono dependencies
- Resolved React hydration errors on competitor research page using mounted state pattern

## System Architecture

### Frontend Architecture

**Framework & Rendering Strategy**
- Next.js 16 with App Router for file-based routing and layouts
- React 19 for the UI layer with React Server Components by default
- Server-side rendering (SSR) for authenticated pages with auth checks
- Client components ("use client") for interactive UI elements and forms
- TypeScript for type safety across the entire codebase

**UI Component System**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, accordions, etc.)
- Tailwind CSS v4 for utility-first styling with custom design tokens
- Custom design system defined in globals.css with consistent color palette, shadows, and module-specific accent colors
- shadcn/ui patterns for reusable, composable UI components
- Class Variance Authority (CVA) for component variant management

**State Management & Forms**
- React Hook Form for form state management and validation
- Zod for runtime schema validation
- Client-side state managed through React hooks (useState, useEffect, useRef)
- Server state accessed through Prisma queries in server components
- No global state management library (Redux, Zustand) used

### Backend Architecture

**API Layer**
- Next.js API Routes (Route Handlers) in `/api/*` directories
- RESTful endpoints for CRUD operations (POST, PUT, PATCH, DELETE)
- Server Actions enabled for form submissions and mutations
- JSON request/response format
- Error handling with appropriate HTTP status codes

**Authentication & Authorization**
- NextAuth v5 (beta) for authentication with Credentials provider
- Session-based authentication stored in database
- Email/password authentication (plain text comparison in demo - noted for bcrypt in production)
- Role-based access control (admin, manager, user roles)
- Organization-based data isolation through organizationId filtering
- Protected routes using auth middleware in dashboard layout

**AI Integration**
- OpenAI GPT-4o as primary LLM provider via direct API key (`OPENAI_API_KEY` secret)
- OpenAI Agents SDK (`@openai/agents`) for research workflows with real web search capability
- Centralized OpenAI client in `src/lib/ai.ts` used across all API routes
- Custom system prompts for different AI agents (website assistant, marketing, sales training)
- Context building from structured data (floorplans, communities, incentives)
- Agent-based deep research with web search tool for real-time competitive intelligence
- All API calls use `max_completion_tokens` parameter for token control

### Data Storage

**Database**
- Prisma 7 ORM for type-safe database access
- PostgreSQL database via Replit's built-in database service
- Uses `@prisma/adapter-pg` driver adapter with `pg` connection pool
- Generated Prisma client in `/src/generated/prisma/`
- Database schema managed through Prisma migrations
- Seeding script for development data (`prisma/seed.ts`)
- Configuration in `prisma.config.ts` for Prisma 7 compatibility

**Data Models**
The schema includes 30+ models organized into functional domains:
- **User & Auth**: User, Account, Session, VerificationToken, Organization
- **Product Data**: Community, Floorplan, InventoryHome, Incentive
- **Lead Management**: Lead, Conversation, Message
- **AI Features**: ChatbotConfig, MarketingContent, FAQSection, AISearchMonitor
- **Competitive Intelligence**: Competitor, CompetitorCommunity, CompetitorFloorplan, CompetitiveReport
- **Sales Training**: SalesTrainingSession, SalesTrainingMessage, SalesTrainingMetrics
- **Integrations**: CRMIntegration, CRMWebhook, CRMSyncLog
- **Realtor Portal**: RealtorPortalConfig, RealtorAccess
- **Research**: DeepResearchReport, DigitalFootprintConfig, ContentStrategyConfig, ContentTopic

**Data Relationships**
- Organizations have many users, communities, floorplans, leads
- Communities belong to organizations, have many floorplans and inventory
- Leads have conversations with many messages
- All major entities are scoped to organizations for multi-tenancy

### External Dependencies

**AI & Machine Learning**
- OpenAI API (GPT-4, GPT-4o) for chat completions, content generation, and analysis
- OpenAI Responses API with web search tool for deep research features
- Custom prompt engineering for domain-specific AI behaviors

**UI Component Libraries**
- Radix UI (accordion, avatar, checkbox, dialog, dropdown, label, popover, scroll-area, select, separator, slot, switch, tabs, tooltip)
- Lucide React for consistent iconography
- date-fns for date formatting and manipulation

**CRM Integrations** (Referenced but not fully implemented)
- HubSpot integration support
- Salesforce integration support
- GoHighLevel integration support
- Webhook-based sync architecture

**Form & Validation**
- React Hook Form for form state
- Hookform Resolvers for Zod integration
- Zod v4 for schema validation

**Utilities**
- clsx and tailwind-merge for conditional class names
- uuid for unique identifier generation
- dotenv for environment variable management

**Development & Database**
- Prisma CLI for migrations and schema management
- Prisma Studio for database GUI
- TypeScript compiler for type checking
- Next.js dev server with fast refresh

### Design Patterns

**Module-Based Organization**
- Features grouped by domain (chat, communities, floorplans, competitive, crm, leads, marketing, realtor, research, sales, seo)
- Each module has dedicated UI components in `/components/{module}/`
- Shared UI primitives in `/components/ui/`
- Consistent file naming: kebab-case for files, PascalCase for components

**Server-First Architecture**
- Data fetching in React Server Components
- Client components only when interactivity required
- Form actions use server actions when possible
- Minimal client-side JavaScript bundle

**Type Safety**
- Generated Prisma types imported from `/generated/prisma/`
- TypeScript strict mode enabled
- Props interfaces for all components
- Zod schemas for runtime validation

**Styling Approach**
- Utility-first with Tailwind CSS
- CSS custom properties for theming in globals.css
- Component variants using CVA
- No CSS modules or styled-components

**Code Organization**
- Path aliases configured (`@/*` maps to `src/*`)
- Barrel exports for models and types
- Separation of concerns (UI, logic, data access)
- Reusable utility functions in `/lib/utils.ts`