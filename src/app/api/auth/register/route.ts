import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url().nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Create organization slug from company name
    const slug = validatedData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingOrg) {
      // Add a random suffix if slug exists
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.companyName,
          slug: finalSlug,
          website: validatedData.companyWebsite || null,
          phone: validatedData.phone || null,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: "builder_admin",
          organizationId: organization.id,
        },
      });

      // Create default chatbot config
      await tx.chatbotConfig.create({
        data: {
          name: `${validatedData.companyName} Assistant`,
          welcomeMessage: `Hi! I'm here to help you find your perfect new home with ${validatedData.companyName}. How can I assist you today?`,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
