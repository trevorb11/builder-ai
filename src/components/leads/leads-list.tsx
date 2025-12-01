"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Edit,
  Eye,
  Home,
  MapPin,
  Star,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  source: string | null;
  status: string;
  budget: string | null;
  timeline: string | null;
  notes: string | null;
  score: number;
  createdAt: Date;
  community: { id: string; name: string } | null;
  floorplan: { id: string; name: string } | null;
  conversations: {
    id: string;
    status: string;
    summary: string | null;
    sentiment: string | null;
    intentScore: number | null;
    createdAt: Date;
    messages: { id: string }[];
  }[];
}

interface LeadsListProps {
  leads: Lead[];
  organizationId: string;
}

const statusOptions = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-800" },
  { value: "nurturing", label: "Nurturing", color: "bg-orange-100 text-orange-800" },
  { value: "closed_won", label: "Won", color: "bg-green-100 text-green-800" },
  { value: "closed_lost", label: "Lost", color: "bg-gray-100 text-gray-800" },
];

export function LeadsList({ leads, organizationId }: LeadsListProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editLead) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/leads/${editLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          status: formData.get("status"),
          budget: formData.get("budget"),
          timeline: formData.get("timeline"),
          notes: formData.get("notes"),
        }),
      });

      if (response.ok) {
        setEditLead(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update lead:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No leads yet</h3>
        <p className="mt-2 text-gray-500">
          Leads will appear here when visitors interact with your AI chatbot.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 mt-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold truncate">
                    {lead.firstName || lead.lastName
                      ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                      : lead.email || "Anonymous"}
                  </h3>
                  <Badge className={getStatusStyle(lead.status)}>
                    {statusOptions.find((s) => s.value === lead.status)?.label || lead.status}
                  </Badge>
                  {lead.score >= 70 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Hot Lead
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="capitalize">{lead.source.replace("_", " ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {(lead.community || lead.floorplan) && (
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {lead.community && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.community.name}</span>
                      </div>
                    )}
                    {lead.floorplan && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Home className="h-4 w-4" />
                        <span>{lead.floorplan.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {lead.conversations[0] && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className={getSentimentColor(lead.conversations[0].sentiment)}>
                      {lead.conversations[0].messages.length} messages
                    </span>
                    {lead.conversations[0].summary && (
                      <span className="ml-2 text-gray-500">
                        • {lead.conversations[0].summary.slice(0, 100)}...
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-center mr-2">
                  <div className="text-2xl font-bold text-gray-900">{lead.score}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLead(lead)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditLead(lead)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Lead Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View lead information and conversation history
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">
                    {selectedLead.firstName || selectedLead.lastName
                      ? `${selectedLead.firstName || ""} ${selectedLead.lastName || ""}`.trim()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <p>
                    <Badge className={getStatusStyle(selectedLead.status)}>
                      {statusOptions.find((s) => s.value === selectedLead.status)?.label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedLead.email || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedLead.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Budget</Label>
                  <p className="font-medium">{selectedLead.budget || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Timeline</Label>
                  <p className="font-medium">{selectedLead.timeline || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Source</Label>
                  <p className="font-medium capitalize">
                    {selectedLead.source?.replace("_", " ") || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Lead Score</Label>
                  <p className="font-bold text-2xl">{selectedLead.score}/100</p>
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <Label className="text-gray-500">Notes</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedLead.notes}</p>
                </div>
              )}

              {selectedLead.community && (
                <div>
                  <Label className="text-gray-500">Interested Community</Label>
                  <p className="font-medium">{selectedLead.community.name}</p>
                </div>
              )}

              {selectedLead.floorplan && (
                <div>
                  <Label className="text-gray-500">Interested Floorplan</Label>
                  <p className="font-medium">{selectedLead.floorplan.name}</p>
                </div>
              )}

              {selectedLead.conversations[0] && (
                <div>
                  <Label className="text-gray-500">Last Conversation</Label>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {selectedLead.conversations[0].messages.length} messages
                      </span>
                      <span className={getSentimentColor(selectedLead.conversations[0].sentiment)}>
                        {selectedLead.conversations[0].sentiment || "neutral"} sentiment
                      </span>
                    </div>
                    {selectedLead.conversations[0].summary && (
                      <p className="mt-2 text-sm">{selectedLead.conversations[0].summary}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(selectedLead.conversations[0].createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information and status
            </DialogDescription>
          </DialogHeader>
          {editLead && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={editLead.firstName || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={editLead.lastName || ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editLead.email || ""}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editLead.phone || ""}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editLead.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    defaultValue={editLead.budget || ""}
                    placeholder="e.g., $400K-$500K"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    name="timeline"
                    defaultValue={editLead.timeline || ""}
                    placeholder="e.g., 3-6 months"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editLead.notes || ""}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditLead(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
