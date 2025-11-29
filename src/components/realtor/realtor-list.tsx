"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import { UserCheck, UserX, Search, Mail, Phone, Building2 } from "lucide-react";

interface Realtor {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  licenseNumber: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface RealtorListProps {
  realtors: Realtor[];
  portalId: string | null;
}

export function RealtorList({ realtors, portalId }: RealtorListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRealtors = realtors.filter(
    (r) =>
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function toggleStatus(realtorId: string, field: "isVerified" | "isActive") {
    const realtor = realtors.find((r) => r.id === realtorId);
    if (!realtor) return;

    try {
      await fetch(`/api/realtor-portal/realtors/${realtorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: !realtor[field],
        }),
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating realtor:", error);
    }
  }

  if (!portalId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Portal Not Configured
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Configure your portal settings first to manage registered agents.
        </p>
      </div>
    );
  }

  if (realtors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserCheck className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No Registered Agents
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Agents will appear here when they register on your portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredRealtors.map((realtor) => (
          <div
            key={realtor.id}
            className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {realtor.name || "Unnamed Agent"}
                  </h4>
                  {realtor.isVerified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {!realtor.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                {realtor.company && (
                  <p className="text-sm text-gray-600">{realtor.company}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {realtor.email}
                  </span>
                  {realtor.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {realtor.phone}
                    </span>
                  )}
                </div>
                {realtor.licenseNumber && (
                  <p className="text-xs text-gray-400">
                    License: {realtor.licenseNumber}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Registered: {formatDateTime(realtor.createdAt)}
                  {realtor.lastLoginAt && (
                    <> | Last login: {formatDateTime(realtor.lastLoginAt)}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(realtor.id, "isVerified")}
                >
                  {realtor.isVerified ? (
                    <>
                      <UserX className="mr-1 h-4 w-4" />
                      Unverify
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-1 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
                <Button
                  variant={realtor.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleStatus(realtor.id, "isActive")}
                >
                  {realtor.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
