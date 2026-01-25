"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Building2, Globe, Phone, Mail, MapPin, Sparkles, Users, Target, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  brandVoice: string | null;
  tagline: string | null;
  buyerPersonas: string | null;
  differentiators: string | null;
}

interface OrganizationSettingsFormProps {
  organization: Organization | null;
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
    website: organization?.website || "",
    phone: organization?.phone || "",
    email: organization?.email || "",
    address: organization?.address || "",
    city: organization?.city || "",
    state: organization?.state || "",
    zipCode: organization?.zipCode || "",
    brandVoice: organization?.brandVoice || "",
    tagline: organization?.tagline || "",
    buyerPersonas: organization?.buyerPersonas || "",
    differentiators: organization?.differentiators || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating organization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back to Onboarding Link */}
      <Link
        href="/dashboard/onboarding"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Setup Checklist
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic details about your builder company</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sunrise Homes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourbuilder.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief description of your home building company..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <div>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Define your brand positioning and target audience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline / Slogan</Label>
            <Input
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Building Dreams, Creating Homes"
            />
            <p className="text-sm text-gray-500">
              Your company's tagline or slogan used in marketing materials
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <Label htmlFor="buyerPersonas">Target Buyer Personas</Label>
            </div>
            <Textarea
              id="buyerPersonas"
              name="buyerPersonas"
              value={formData.buyerPersonas}
              onChange={handleChange}
              placeholder="Describe your ideal home buyers. For example: 'First-time buyers ages 28-40, growing families looking for 3-4 bedrooms, empty nesters downsizing from larger homes, relocating professionals seeking turnkey solutions.'"
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Who are your ideal home buyers? This helps AI tailor content to your target audience.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <Label htmlFor="differentiators">Key Differentiators</Label>
            </div>
            <Textarea
              id="differentiators"
              name="differentiators"
              value={formData.differentiators}
              onChange={handleChange}
              placeholder="What makes you different from competitors? For example: 'Energy-efficient construction with 30% lower utility bills, 10-year structural warranty, in-house design team, 90-day guaranteed move-in dates, award-winning customer service.'"
              rows={4}
            />
            <p className="text-sm text-gray-500">
              What sets your company apart from competitors? The AI uses this to highlight your strengths.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(512) 555-0123"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@yourbuilder.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle>Location</CardTitle>
              <CardDescription>Your office or headquarters address</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Builder Lane"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Austin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="TX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="78701"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Voice</CardTitle>
          <CardDescription>Guide how AI generates content for your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="brandVoice">Brand Voice Guidelines</Label>
            <Textarea
              id="brandVoice"
              name="brandVoice"
              value={formData.brandVoice}
              onChange={handleChange}
              placeholder="Describe your brand's tone and style. For example: 'Professional yet warm, focusing on family values and quality craftsmanship. Use inclusive language and emphasize our commitment to customer satisfaction.'"
              rows={4}
            />
            <p className="text-sm text-gray-500">
              This helps the AI generate marketing content that matches your brand's personality.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        {success && (
          <span className="text-sm text-green-600">Changes saved successfully!</span>
        )}
      </div>
    </form>
  );
}
