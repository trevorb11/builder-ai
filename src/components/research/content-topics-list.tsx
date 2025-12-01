"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Lightbulb,
  TrendingUp,
  MapPin,
  GraduationCap,
  Search,
  Share2,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentTopic {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  keywords?: string | null;
  priority: string;
  status: string;
  searchVolume?: number | null;
  competition?: string | null;
  createdAt: Date;
}

interface ContentTopicsListProps {
  topics: ContentTopic[];
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  trending: { icon: TrendingUp, color: "text-red-500 bg-red-50", label: "Trending" },
  local: { icon: MapPin, color: "text-blue-500 bg-blue-50", label: "Local Market" },
  education: { icon: GraduationCap, color: "text-green-500 bg-green-50", label: "Education" },
  seo: { icon: Search, color: "text-orange-500 bg-orange-50", label: "SEO" },
  social: { icon: Share2, color: "text-pink-500 bg-pink-50", label: "Social" },
  ai_search: { icon: Sparkles, color: "text-purple-500 bg-purple-50", label: "AI Search" },
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  suggested: { color: "bg-gray-100 text-gray-700", icon: Lightbulb },
  planned: { color: "bg-blue-100 text-blue-700", icon: Calendar },
  in_progress: { color: "bg-amber-100 text-amber-700", icon: Clock },
  published: { color: "bg-green-100 text-green-700", icon: CheckCircle },
};

export function ContentTopicsList({ topics }: ContentTopicsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Group topics by category
  const topicsByCategory = topics.reduce((acc, topic) => {
    const cat = topic.category || "trending";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(topic);
    return acc;
  }, {} as Record<string, ContentTopic[]>);

  const filteredTopics =
    selectedCategory === "all"
      ? topics
      : topics.filter((t) => t.category === selectedCategory);

  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-gray-400" />
            Content Topics
          </CardTitle>
          <CardDescription>
            AI-generated content topic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Lightbulb className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No topics yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              Run a content strategy research to generate topic recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              Content Topics
            </CardTitle>
            <CardDescription>
              {topics.length} topic recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All ({topics.length})
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = topicsByCategory[key]?.length || 0;
            if (count === 0) return null;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="gap-1"
              >
                <config.icon className="h-3 w-3" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Topics List */}
        <ScrollArea className="h-[550px] pr-4">
          <div className="space-y-3">
            {filteredTopics.map((topic) => {
              const category = categoryConfig[topic.category] || categoryConfig.trending;
              const status = statusConfig[topic.status] || statusConfig.suggested;
              const keywords = topic.keywords ? JSON.parse(topic.keywords) : [];

              return (
                <div
                  key={topic.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Category & Priority */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${category.color}`}
                        >
                          <category.icon className="h-3 w-3" />
                          {category.label}
                        </span>
                        <Badge className={`text-[10px] ${priorityColors[topic.priority]}`}>
                          {topic.priority}
                        </Badge>
                        <Badge className={`text-[10px] ${status.color}`}>
                          <status.icon className="h-2.5 w-2.5 mr-1" />
                          {topic.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-gray-900">{topic.title}</h4>

                      {/* Description */}
                      {topic.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      )}

                      {/* Keywords */}
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {keywords.slice(0, 4).map((keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {keyword}
                            </span>
                          ))}
                          {keywords.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{keywords.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metrics */}
                      {(topic.searchVolume || topic.competition) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {topic.searchVolume && (
                            <span>Search Vol: {topic.searchVolume.toLocaleString()}/mo</span>
                          )}
                          {topic.competition && (
                            <span>Competition: {topic.competition}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as Planned</DropdownMenuItem>
                        <DropdownMenuItem>Start Writing</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Published</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
