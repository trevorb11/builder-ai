"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Users,
  Home,
  DollarSign,
  Link2,
  Globe,
  Target,
  GraduationCap,
  MessageSquare,
  FileEdit,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Company Basics", icon: Building2, description: "Tell us about your company" },
  { id: 2, title: "Brand & Voice", icon: Sparkles, description: "Define your brand identity" },
  { id: 3, title: "Communities", icon: Home, description: "Your active communities" },
  { id: 4, title: "Floorplans & Pricing", icon: DollarSign, description: "Products and pricing strategy" },
  { id: 5, title: "CRM & Systems", icon: Link2, description: "Connect your tools" },
  { id: 6, title: "Website & Tech", icon: Globe, description: "Technical access details" },
  { id: 7, title: "Competitors", icon: Target, description: "Competitive landscape" },
  { id: 8, title: "Sales Training", icon: GraduationCap, description: "Sales team configuration" },
  { id: 9, title: "Content & Marketing", icon: FileEdit, description: "Marketing preferences" },
  { id: 10, title: "Launch", icon: Rocket, description: "Final setup and launch" },
];

interface OnboardingData {
  // Company
  name: string;
  tagline: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Brand
  missionStatement: string;
  yearEstablished: string;
  targetBuyers: string[];
  markets: string[];
  differentiators: string;
  valueProposition: string;
  brandVoice: string;
  certifications: string[];
  // Sales
  teamSize: string;
  commonObjections: string[];
  uniqueSellingPoints: string[];
  pricingStrategy: string;
  salesProcess: string;
  // Tech
  websitePlatform: string;
  googleAnalyticsId: string;
  gtmContainerId: string;
  currentChatWidget: string;
  // Content
  facebookHandle: string;
  instagramHandle: string;
  linkedinHandle: string;
  youtubeChannel: string;
  contentTone: string;
  emailPlatform: string;
  // Competitors
  competitors: Array<{ name: string; website: string }>;
  // Launch
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  targetLaunchDate: string;
  launchPriorities: string[];
}

const defaultData: OnboardingData = {
  name: "",
  tagline: "",
  description: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  missionStatement: "",
  yearEstablished: "",
  targetBuyers: [],
  markets: [],
  differentiators: "",
  valueProposition: "",
  brandVoice: "professional",
  certifications: [],
  teamSize: "",
  commonObjections: [],
  uniqueSellingPoints: [],
  pricingStrategy: "",
  salesProcess: "",
  websitePlatform: "",
  googleAnalyticsId: "",
  gtmContainerId: "",
  currentChatWidget: "",
  facebookHandle: "",
  instagramHandle: "",
  linkedinHandle: "",
  youtubeChannel: "",
  contentTone: "professional",
  emailPlatform: "",
  competitors: [{ name: "", website: "" }],
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  targetLaunchDate: "",
  launchPriorities: [],
};

const targetBuyerOptions = [
  "First-time buyers",
  "Move-up buyers",
  "Luxury buyers",
  "Active adults (55+)",
  "Investors",
  "Downsizers",
  "Military/Veterans",
  "Multi-generational families",
];

const certificationOptions = [
  "Energy Star",
  "LEED",
  "NAHB Green",
  "HERS Rated",
  "Fortified Home",
  "Indoor airPLUS",
  "WaterSense",
];

const brandVoiceOptions = [
  { value: "professional", label: "Professional & Polished" },
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "luxury", label: "Luxury & Sophisticated" },
  { value: "casual", label: "Casual & Conversational" },
  { value: "modern", label: "Modern & Innovative" },
  { value: "traditional", label: "Traditional & Trustworthy" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  async function fetchOnboardingData() {
    try {
      const res = await fetch("/api/onboarding");
      if (res.ok) {
        const onboarding = await res.json();
        if (onboarding) {
          setCurrentStep(onboarding.currentStep || 1);
          setCompletedSteps(
            onboarding.completedSteps ? JSON.parse(onboarding.completedSteps) : []
          );
          // Merge existing data
          if (onboarding.organization) {
            setData((prev) => ({
              ...prev,
              name: onboarding.organization.name || "",
              description: onboarding.organization.description || "",
              website: onboarding.organization.website || "",
              phone: onboarding.organization.phone || "",
              email: onboarding.organization.email || "",
              address: onboarding.organization.address || "",
              city: onboarding.organization.city || "",
              state: onboarding.organization.state || "",
              zipCode: onboarding.organization.zipCode || "",
            }));
          }
          if (onboarding.companyProfile) {
            const profile = onboarding.companyProfile;
            setData((prev) => ({
              ...prev,
              tagline: profile.tagline || "",
              missionStatement: profile.missionStatement || "",
              yearEstablished: profile.yearEstablished?.toString() || "",
              targetBuyers: profile.targetBuyers ? JSON.parse(profile.targetBuyers) : [],
              markets: profile.markets ? JSON.parse(profile.markets) : [],
              differentiators: profile.differentiators || "",
              valueProposition: profile.valueProposition || "",
              brandVoice: profile.brandVoice || "professional",
              certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
            }));
          }
          if (onboarding.salesConfig) {
            const sales = onboarding.salesConfig;
            setData((prev) => ({
              ...prev,
              teamSize: sales.teamSize?.toString() || "",
              commonObjections: sales.commonObjections ? JSON.parse(sales.commonObjections) : [],
              uniqueSellingPoints: sales.uniqueSellingPoints ? JSON.parse(sales.uniqueSellingPoints) : [],
              pricingStrategy: sales.pricingStrategy || "",
              salesProcess: sales.salesProcess || "",
            }));
          }
          if (onboarding.techAccess) {
            const tech = onboarding.techAccess;
            setData((prev) => ({
              ...prev,
              websitePlatform: tech.websitePlatform || "",
              googleAnalyticsId: tech.googleAnalyticsId || "",
              gtmContainerId: tech.gtmContainerId || "",
              currentChatWidget: tech.currentChatWidget || "",
            }));
          }
          if (onboarding.contentPrefs) {
            const content = onboarding.contentPrefs;
            setData((prev) => ({
              ...prev,
              facebookHandle: content.facebookHandle || "",
              instagramHandle: content.instagramHandle || "",
              linkedinHandle: content.linkedinHandle || "",
              youtubeChannel: content.youtubeChannel || "",
              contentTone: content.contentTone || "professional",
              emailPlatform: content.emailPlatform || "",
            }));
          }
          if (onboarding.launchConfig) {
            const launch = onboarding.launchConfig;
            setData((prev) => ({
              ...prev,
              primaryContactName: launch.primaryContactName || "",
              primaryContactEmail: launch.primaryContactEmail || "",
              primaryContactPhone: launch.primaryContactPhone || "",
              targetLaunchDate: launch.targetLaunchDate
                ? new Date(launch.targetLaunchDate).toISOString().split("T")[0]
                : "",
              launchPriorities: launch.launchPriorities ? JSON.parse(launch.launchPriorities) : [],
            }));
          }
          // Load competitors
          if (onboarding.organization?.competitors?.length > 0) {
            setData((prev) => ({
              ...prev,
              competitors: onboarding.organization.competitors.map((c: { name: string; website: string }) => ({
                name: c.name,
                website: c.website || "",
              })),
            }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch onboarding data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveStep() {
    setSaving(true);
    try {
      // Save based on current step
      switch (currentStep) {
        case 1:
        case 2:
          await fetch("/api/onboarding/company", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              description: data.description,
              website: data.website,
              phone: data.phone,
              email: data.email,
              address: data.address,
              city: data.city,
              state: data.state,
              zipCode: data.zipCode,
              tagline: data.tagline,
              missionStatement: data.missionStatement,
              yearEstablished: data.yearEstablished ? parseInt(data.yearEstablished) : undefined,
              targetBuyers: data.targetBuyers,
              markets: data.markets,
              differentiators: data.differentiators,
              valueProposition: data.valueProposition,
              brandVoice: data.brandVoice,
              certifications: data.certifications,
            }),
          });
          break;

        case 7:
          // Save competitors
          for (const comp of data.competitors.filter((c) => c.name)) {
            await fetch("/api/competitors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: comp.name, website: comp.website }),
            });
          }
          break;

        case 8:
          await fetch("/api/onboarding/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              teamSize: data.teamSize ? parseInt(data.teamSize) : undefined,
              commonObjections: data.commonObjections,
              uniqueSellingPoints: data.uniqueSellingPoints,
              pricingStrategy: data.pricingStrategy,
              salesProcess: data.salesProcess,
            }),
          });
          break;

        case 6:
          await fetch("/api/onboarding/tech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              websitePlatform: data.websitePlatform,
              googleAnalyticsId: data.googleAnalyticsId,
              gtmContainerId: data.gtmContainerId,
              currentChatWidget: data.currentChatWidget,
              websiteUrl: data.website,
            }),
          });
          break;

        case 9:
          await fetch("/api/onboarding/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              facebookHandle: data.facebookHandle,
              instagramHandle: data.instagramHandle,
              linkedinHandle: data.linkedinHandle,
              youtubeChannel: data.youtubeChannel,
              contentTone: data.contentTone,
              emailPlatform: data.emailPlatform,
            }),
          });
          break;

        case 10:
          await fetch("/api/onboarding/launch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              primaryContactName: data.primaryContactName,
              primaryContactEmail: data.primaryContactEmail,
              primaryContactPhone: data.primaryContactPhone,
              targetLaunchDate: data.targetLaunchDate,
              launchPriorities: data.launchPriorities,
            }),
          });
          break;
      }

      // Update progress
      const newCompleted = [...new Set([...completedSteps, currentStep])];
      setCompletedSteps(newCompleted);

      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: currentStep < 10 ? currentStep + 1 : currentStep,
          completedSteps: newCompleted,
          status: currentStep === 10 ? "completed" : "in_progress",
        }),
      });
    } catch (error) {
      console.error("Failed to save step:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    await saveStep();
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function updateData<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: keyof OnboardingData, item: string) {
    const arr = data[key] as string[];
    if (arr.includes(item)) {
      updateData(key, arr.filter((i) => i !== item) as OnboardingData[typeof key]);
    } else {
      updateData(key, [...arr, item] as OnboardingData[typeof key]);
    }
  }

  function addListItem(key: keyof OnboardingData, value: string) {
    if (value.trim()) {
      const arr = data[key] as string[];
      updateData(key, [...arr, value.trim()] as OnboardingData[typeof key]);
    }
  }

  function removeListItem(key: keyof OnboardingData, index: number) {
    const arr = data[key] as string[];
    updateData(
      key,
      arr.filter((_, i) => i !== index) as OnboardingData[typeof key]
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentStepData = STEPS[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Setup</h1>
              <p className="text-gray-500 mt-1">
                Complete your profile to unlock all AI features
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-blue-600">
                {completedSteps.length}/{STEPS.length}
              </span>{" "}
              steps completed
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      completedSteps.includes(step.id)
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 w-8 lg:w-12 ${
                        completedSteps.includes(step.id) ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <StepIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Step {currentStep}: {currentStepData.title}
                  </CardTitle>
                  <CardDescription>{currentStepData.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Step 1: Company Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => updateData("name", e.target.value)}
                        placeholder="ABC Homes"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline / Slogan</Label>
                      <Input
                        id="tagline"
                        value={data.tagline}
                        onChange={(e) => updateData("tagline", e.target.value)}
                        placeholder="Building Dreams, One Home at a Time"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => updateData("description", e.target.value)}
                      placeholder="Tell us about your company, what makes you unique, and your mission..."
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        value={data.website}
                        onChange={(e) => updateData("website", e.target.value)}
                        placeholder="https://www.abchomes.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => updateData("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData("email", e.target.value)}
                      placeholder="info@abchomes.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={data.address}
                      onChange={(e) => updateData("address", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={data.city}
                        onChange={(e) => updateData("city", e.target.value)}
                        placeholder="Austin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={data.state}
                        onChange={(e) => updateData("state", e.target.value)}
                        placeholder="TX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={data.zipCode}
                        onChange={(e) => updateData("zipCode", e.target.value)}
                        placeholder="78701"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Brand & Voice */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="missionStatement">Mission Statement</Label>
                    <Textarea
                      id="missionStatement"
                      value={data.missionStatement}
                      onChange={(e) => updateData("missionStatement", e.target.value)}
                      placeholder="Our mission is to..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valueProposition">Value Proposition</Label>
                    <Textarea
                      id="valueProposition"
                      value={data.valueProposition}
                      onChange={(e) => updateData("valueProposition", e.target.value)}
                      placeholder="Why should buyers choose you over competitors?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="differentiators">What Makes You Different?</Label>
                    <Textarea
                      id="differentiators"
                      value={data.differentiators}
                      onChange={(e) => updateData("differentiators", e.target.value)}
                      placeholder="Describe your unique advantages, construction quality, customer service, etc."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        value={data.yearEstablished}
                        onChange={(e) => updateData("yearEstablished", e.target.value)}
                        placeholder="1995"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand Voice</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {brandVoiceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateData("brandVoice", option.value)}
                            className={`p-3 text-left rounded-lg border transition-all ${
                              data.brandVoice === option.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Target Buyer Types</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {targetBuyerOptions.map((buyer) => (
                        <div key={buyer} className="flex items-center space-x-2">
                          <Checkbox
                            id={buyer}
                            checked={data.targetBuyers.includes(buyer)}
                            onCheckedChange={() => toggleArrayItem("targetBuyers", buyer)}
                          />
                          <label htmlFor={buyer} className="text-sm cursor-pointer">
                            {buyer}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Certifications & Awards</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {certificationOptions.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={data.certifications.includes(cert)}
                            onCheckedChange={() => toggleArrayItem("certifications", cert)}
                          />
                          <label htmlFor={cert} className="text-sm cursor-pointer">
                            {cert}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Markets / Regions You Serve</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {data.markets.map((market, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {market}
                          <button type="button" onClick={() => removeListItem("markets", i)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add market (e.g., Austin, TX)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addListItem("markets", e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addListItem("markets", input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Communities - Link to communities page */}
              {currentStep === 3 && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Set Up Your Communities
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Add the communities where you build homes. Include details like location,
                    amenities, schools, HOA fees, and available lots.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/communities")}
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Manage Communities
                  </Button>
                  <p className="text-sm text-gray-400 mt-4">
                    You can come back to complete other steps after adding communities
                  </p>
                </div>
              )}

              {/* Step 4: Floorplans & Pricing - Link to floorplans page */}
              {currentStep === 4 && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configure Floorplans & Pricing
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Add your floorplan catalog with specifications, pricing, features,
                    and available incentives.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => router.push("/dashboard/floorplans")}
                      className="gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Manage Floorplans
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard/incentives")}
                      variant="outline"
                      className="gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Manage Incentives
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: CRM & Systems */}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="h-8 w-8 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Connect Your CRM
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Integrate with your existing CRM to automatically sync leads captured
                    by the AI assistant.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/crm")}
                    className="gap-2"
                  >
                    <Link2 className="h-4 w-4" />
                    Configure CRM Integration
                  </Button>
                </div>
              )}

              {/* Step 6: Website & Tech */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="websitePlatform">Website Platform</Label>
                      <Input
                        id="websitePlatform"
                        value={data.websitePlatform}
                        onChange={(e) => updateData("websitePlatform", e.target.value)}
                        placeholder="WordPress, Squarespace, Custom, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentChatWidget">Current Chat Widget (if any)</Label>
                      <Input
                        id="currentChatWidget"
                        value={data.currentChatWidget}
                        onChange={(e) => updateData("currentChatWidget", e.target.value)}
                        placeholder="LiveChat, Intercom, None, etc."
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={data.googleAnalyticsId}
                        onChange={(e) => updateData("googleAnalyticsId", e.target.value)}
                        placeholder="UA-XXXXXXXXX or G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gtmContainerId">Google Tag Manager ID</Label>
                      <Input
                        id="gtmContainerId"
                        value={data.gtmContainerId}
                        onChange={(e) => updateData("gtmContainerId", e.target.value)}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Competitors */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <p className="text-gray-500">
                    Add your main competitors so we can help you track them and differentiate
                    your messaging.
                  </p>

                  {data.competitors.map((comp, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Competitor Name</Label>
                          <Input
                            value={comp.name}
                            onChange={(e) => {
                              const newComps = [...data.competitors];
                              newComps[index].name = e.target.value;
                              updateData("competitors", newComps);
                            }}
                            placeholder="Competitor Builder Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input
                            value={comp.website}
                            onChange={(e) => {
                              const newComps = [...data.competitors];
                              newComps[index].website = e.target.value;
                              updateData("competitors", newComps);
                            }}
                            placeholder="https://www.competitor.com"
                          />
                        </div>
                      </div>
                      {data.competitors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newComps = data.competitors.filter((_, i) => i !== index);
                            updateData("competitors", newComps);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      updateData("competitors", [...data.competitors, { name: "", website: "" }])
                    }
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Competitor
                  </Button>
                </div>
              )}

              {/* Step 8: Sales Training */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Sales Team Size</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        value={data.teamSize}
                        onChange={(e) => updateData("teamSize", e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Common Objections Your Team Faces</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {data.commonObjections.map((obj, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {obj}
                          <button type="button" onClick={() => removeListItem("commonObjections", i)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g., "Price is too high"'
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addListItem("commonObjections", e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addListItem("commonObjections", input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Unique Selling Points</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {data.uniqueSellingPoints.map((usp, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {usp}
                          <button type="button" onClick={() => removeListItem("uniqueSellingPoints", i)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g., "10-year structural warranty"'
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addListItem("uniqueSellingPoints", e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addListItem("uniqueSellingPoints", input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricingStrategy">Pricing Discussion Strategy</Label>
                    <Textarea
                      id="pricingStrategy"
                      value={data.pricingStrategy}
                      onChange={(e) => updateData("pricingStrategy", e.target.value)}
                      placeholder="How should your sales team discuss pricing? Any specific approaches or guidelines..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesProcess">Sales Process Overview</Label>
                    <Textarea
                      id="salesProcess"
                      value={data.salesProcess}
                      onChange={(e) => updateData("salesProcess", e.target.value)}
                      placeholder="Describe your typical sales process from first contact to closing..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 9: Content & Marketing */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Content Tone & Style</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {brandVoiceOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateData("contentTone", option.value)}
                          className={`p-3 text-left rounded-lg border transition-all ${
                            data.contentTone === option.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="facebookHandle">Facebook Handle</Label>
                      <Input
                        id="facebookHandle"
                        value={data.facebookHandle}
                        onChange={(e) => updateData("facebookHandle", e.target.value)}
                        placeholder="YourCompanyPage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagramHandle">Instagram Handle</Label>
                      <Input
                        id="instagramHandle"
                        value={data.instagramHandle}
                        onChange={(e) => updateData("instagramHandle", e.target.value)}
                        placeholder="@yourcompany"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinHandle">LinkedIn Company Page</Label>
                      <Input
                        id="linkedinHandle"
                        value={data.linkedinHandle}
                        onChange={(e) => updateData("linkedinHandle", e.target.value)}
                        placeholder="your-company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeChannel">YouTube Channel URL</Label>
                      <Input
                        id="youtubeChannel"
                        value={data.youtubeChannel}
                        onChange={(e) => updateData("youtubeChannel", e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPlatform">Email Marketing Platform</Label>
                    <Input
                      id="emailPlatform"
                      value={data.emailPlatform}
                      onChange={(e) => updateData("emailPlatform", e.target.value)}
                      placeholder="Mailchimp, Constant Contact, HubSpot, etc."
                    />
                  </div>
                </div>
              )}

              {/* Step 10: Launch */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Almost Done!</h4>
                    <p className="text-sm text-green-700">
                      Complete this final step to finish your platform setup. Your AI tools
                      will use all the information you&apos;ve provided to deliver personalized results.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactName">Primary Contact Name</Label>
                      <Input
                        id="primaryContactName"
                        value={data.primaryContactName}
                        onChange={(e) => updateData("primaryContactName", e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
                      <Input
                        id="primaryContactEmail"
                        type="email"
                        value={data.primaryContactEmail}
                        onChange={(e) => updateData("primaryContactEmail", e.target.value)}
                        placeholder="john@yourcompany.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
                      <Input
                        id="primaryContactPhone"
                        value={data.primaryContactPhone}
                        onChange={(e) => updateData("primaryContactPhone", e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetLaunchDate">Target Go-Live Date</Label>
                      <Input
                        id="targetLaunchDate"
                        type="date"
                        value={data.targetLaunchDate}
                        onChange={(e) => updateData("targetLaunchDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Launch Priorities (What&apos;s most important to get live first?)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {data.launchPriorities.map((priority, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {priority}
                          <button type="button" onClick={() => removeListItem("launchPriorities", i)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g., "AI Chatbot on website"'
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addListItem("launchPriorities", e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addListItem("launchPriorities", input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Navigation Footer */}
            <div className="border-t px-8 py-4 flex items-center justify-between bg-gray-50">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                Step {currentStep} of {STEPS.length}
              </div>

              <Button onClick={handleNext} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentStep === 10 ? (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
