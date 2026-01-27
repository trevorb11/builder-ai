"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Building2, Globe, Phone, Mail, MapPin, Target, Users, Sparkles, DollarSign } from "lucide-react";

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
  tagline: string | null;
  buyerPersonas: string | null;
  differentiators: string | null;
  marketsServed: string | null;
  preferredLender: string | null;
  pricingContacts: string | null;
  brandVoice: string | null;
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
    tagline: organization?.tagline || "",
    buyerPersonas: organization?.buyerPersonas || "",
    differentiators: organization?.differentiators || "",
    marketsServed: organization?.marketsServed || "",
    preferredLender: organization?.preferredLender || "",
    pricingContacts: organization?.pricingContacts || "",
    brandVoice: organization?.brandVoice || "",
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
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-purple-500" />
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
              placeholder="e.g., 'Building Dreams, One Home at a Time'"
            />
            <p className="text-sm text-gray-500">Your brand&apos;s memorable catchphrase</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerPersonas">Target Buyer Personas</Label>
            <Textarea
              id="buyerPersonas"
              name="buyerPersonas"
              value={formData.buyerPersonas}
              onChange={handleChange}
              placeholder="Describe your ideal home buyers. e.g., 'Young professionals aged 28-40 looking for their first home, growing families seeking more space, empty nesters downsizing to low-maintenance living...'"
              rows={3}
            />
            <p className="text-sm text-gray-500">Who are your ideal customers?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="differentiators">Key Differentiators</Label>
            <Textarea
              id="differentiators"
              name="differentiators"
              value={formData.differentiators}
              onChange={handleChange}
              placeholder="What makes you different from competitors? e.g., 'Award-winning designs, energy-efficient construction, 10-year structural warranty, in-house design studio...'"
              rows={3}
            />
            <p className="text-sm text-gray-500">What sets you apart from other builders?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketsServed">Geographic Markets Served</Label>
            <Textarea
              id="marketsServed"
              name="marketsServed"
              value={formData.marketsServed}
              onChange={handleChange}
              placeholder="e.g., 'Greater Austin area including Round Rock, Cedar Park, Georgetown, and Pflugerville. Also building in San Antonio suburbs.'"
              rows={2}
            />
            <p className="text-sm text-gray-500">Cities and regions where you build</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Financing & Pricing</CardTitle>
              <CardDescription>Preferred lender and pricing contacts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferredLender">Preferred Lender Information</Label>
            <Textarea
              id="preferredLender"
              name="preferredLender"
              value={formData.preferredLender}
              onChange={handleChange}
              placeholder="e.g., 'ABC Mortgage - John Smith, NMLS #123456, (512) 555-0100, john@abcmortgage.com. Offers $5,000 closing cost credit for buyers using our preferred lender.'"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricingContacts">Pricing Update Contacts</Label>
            <Textarea
              id="pricingContacts"
              name="pricingContacts"
              value={formData.pricingContacts}
              onChange={handleChange}
              placeholder="Who should be contacted for pricing changes? e.g., 'Jane Doe, VP of Sales, jane@company.com, (512) 555-0200'"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>Guide how AI generates content for your brand</CardDescription>
            </div>
          </div>
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
              This helps the AI generate marketing content that matches your brand&apos;s personality.
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
