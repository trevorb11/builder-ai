"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Brain,
  Search,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface AIMetric {
  name: string;
  value: string | number;
  benchmark?: string | number;
  trend?: "up" | "down" | "stable";
  interpretation?: string;
}

interface DataPoint {
  label: string;
  value: string;
  source?: string;
  date?: string;
}

interface AIReadinessData {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    status: "good" | "needs-work" | "critical";
    metrics: AIMetric[];
    dataPoints?: DataPoint[];
    recommendations: string[];
  }[];
  futureProofing: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    impact: string;
  }[];
}

interface AIReadinessScoreProps {
  data: AIReadinessData;
}

export function AIReadinessScore({ data }: AIReadinessScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-orange-500";
  };

  const getStatusIcon = (status: "good" | "needs-work" | "critical") => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "needs-work":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall AI Readiness Score */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            AI Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.overallScore / 100) * 352} 352`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={data.overallScore >= 60 ? "#22c55e" : "#ef4444"} />
                    <stop offset="100%" stopColor={data.overallScore >= 80 ? "#10b981" : data.overallScore >= 60 ? "#f59e0b" : "#f97316"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}
                </span>
                <span className="text-xs text-gray-500">out of 100</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="flex-1 space-y-3">
              <p className="text-sm text-gray-600">
                {data.overallScore >= 80
                  ? "Your website is well-optimized for AI search engines and assistants."
                  : data.overallScore >= 60
                  ? "Your website has moderate AI visibility but needs improvements."
                  : "Your website needs significant work to be AI-ready."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {data.categories.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    {getStatusIcon(cat.status)}
                    <span className="text-gray-700">{cat.name}</span>
                    <span className={`font-semibold ${getScoreColor(cat.score)}`}>
                      {cat.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.categories.map((category) => (
          <Card key={category.name} className="overflow-hidden">
            <CardHeader className="pb-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getCategoryIcon(category.name)}
                  {category.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(category.status)}
                  <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                    {category.score}%
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(category.score)} transition-all duration-500`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Metrics */}
              {category.metrics.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Key Metrics
                  </h5>
                  <div className="space-y-2">
                    {category.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm text-gray-700">{metric.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{metric.value}</span>
                          {metric.benchmark && (
                            <span className="text-xs text-gray-500 ml-1">
                              / {metric.benchmark} benchmark
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Points */}
              {category.dataPoints && category.dataPoints.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Research Data
                  </h5>
                  <div className="space-y-1">
                    {category.dataPoints.slice(0, 3).map((dp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500">{dp.label}:</span>
                        <span className="text-gray-900 font-medium">{dp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Recommendations */}
              {category.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quick Fixes
                  </h5>
                  <ul className="space-y-1">
                    {category.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <ArrowRight className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Future-Proofing Recommendations */}
      {data.futureProofing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              Future-Proofing Your Website for AI
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Strategic recommendations to ensure your website stays visible as AI search evolves
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.futureProofing.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{item.title}</h5>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">{item.description}</p>
                      <p className="text-xs mt-2 opacity-75">
                        <strong>Impact:</strong> {item.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("content") || lower.includes("structured")) {
    return <Brain className="h-4 w-4 text-purple-500" />;
  }
  if (lower.includes("seo") || lower.includes("search")) {
    return <Search className="h-4 w-4 text-blue-500" />;
  }
  if (lower.includes("chat") || lower.includes("conversational")) {
    return <MessageSquare className="h-4 w-4 text-green-500" />;
  }
  return <Sparkles className="h-4 w-4 text-indigo-500" />;
}

// Helper function to extract AI readiness data from findings
export function extractAIReadinessData(findings: any[]): AIReadinessData | null {
  // Find AI-related findings
  const aiFindings = findings.filter(
    (f) =>
      f.category?.toLowerCase().includes("ai") ||
      f.title?.toLowerCase().includes("ai") ||
      f.category?.toLowerCase().includes("search visibility") ||
      f.category?.toLowerCase().includes("future")
  );

  if (aiFindings.length === 0) {
    // Generate default structure from all findings
    return generateDefaultAIReadiness(findings);
  }

  // Calculate overall score from metrics
  let totalScore = 0;
  let scoreCount = 0;

  const categories = [
    {
      name: "Structured Data & Schema",
      keywords: ["schema", "structured", "markup", "json-ld"],
      score: 0,
      status: "needs-work" as const,
      metrics: [] as AIMetric[],
      dataPoints: [] as DataPoint[],
      recommendations: [] as string[],
    },
    {
      name: "Content Quality for AI",
      keywords: ["content", "quality", "readability", "clarity"],
      score: 0,
      status: "needs-work" as const,
      metrics: [] as AIMetric[],
      dataPoints: [] as DataPoint[],
      recommendations: [] as string[],
    },
    {
      name: "AI Search Visibility",
      keywords: ["chatgpt", "gemini", "perplexity", "ai search", "visibility"],
      score: 0,
      status: "needs-work" as const,
      metrics: [] as AIMetric[],
      dataPoints: [] as DataPoint[],
      recommendations: [] as string[],
    },
    {
      name: "Conversational SEO",
      keywords: ["conversational", "question", "faq", "voice", "natural language"],
      score: 0,
      status: "needs-work" as const,
      metrics: [] as AIMetric[],
      dataPoints: [] as DataPoint[],
      recommendations: [] as string[],
    },
  ];

  // Map findings to categories
  findings.forEach((finding) => {
    const text = `${finding.category} ${finding.title} ${finding.description}`.toLowerCase();

    categories.forEach((cat) => {
      if (cat.keywords.some((kw) => text.includes(kw))) {
        if (finding.metrics) {
          cat.metrics.push(...finding.metrics);
        }
        if (finding.dataPoints) {
          cat.dataPoints?.push(...finding.dataPoints);
        }
        if (finding.actionItems) {
          cat.recommendations.push(...finding.actionItems);
        } else if (finding.description) {
          cat.recommendations.push(finding.description);
        }
      }
    });
  });

  // Calculate scores for each category
  categories.forEach((cat) => {
    // Base score from number of positive indicators
    let score = 50;

    cat.metrics.forEach((m) => {
      const val = typeof m.value === "number" ? m.value : parseFloat(String(m.value)) || 0;
      const bench = typeof m.benchmark === "number" ? m.benchmark : parseFloat(String(m.benchmark)) || 100;
      if (bench > 0) {
        score = Math.min(100, score + (val / bench) * 20);
      }
    });

    // Adjust based on recommendations (more recommendations = lower current score)
    if (cat.recommendations.length > 5) {
      score = Math.max(20, score - 20);
    }

    cat.score = Math.round(score);
    cat.status = cat.score >= 70 ? "good" : cat.score >= 50 ? "needs-work" : "critical";

    totalScore += cat.score;
    scoreCount++;
  });

  // Extract future-proofing recommendations
  const futureProofing = findings
    .filter(
      (f) =>
        f.importance === "high" &&
        (f.category?.toLowerCase().includes("ai") ||
          f.title?.toLowerCase().includes("future") ||
          f.title?.toLowerCase().includes("recommendation"))
    )
    .map((f) => ({
      title: f.title,
      description: f.description,
      priority: f.importance as "high" | "medium" | "low",
      impact: f.details || "Improves AI search visibility and future-proofs your digital presence",
    }));

  return {
    overallScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 50,
    categories: categories.filter((c) => c.metrics.length > 0 || c.recommendations.length > 0),
    futureProofing:
      futureProofing.length > 0
        ? futureProofing
        : [
            {
              title: "Implement Schema.org Markup",
              description:
                "Add comprehensive structured data for LocalBusiness, Product, and FAQ schemas to help AI assistants understand your content.",
              priority: "high" as const,
              impact: "AI assistants can accurately cite your business information",
            },
            {
              title: "Create Conversational Content",
              description:
                "Write content that answers common questions naturally, as users phrase them to AI assistants.",
              priority: "high" as const,
              impact: "Increases chances of being featured in AI-generated responses",
            },
            {
              title: "Optimize for AI Crawlers",
              description:
                "Ensure your robots.txt allows AI crawlers (GPTBot, Google-Extended) and your content is easily parseable.",
              priority: "medium" as const,
              impact: "Ensures AI systems can access and index your content",
            },
          ],
  };
}

function generateDefaultAIReadiness(findings: any[]): AIReadinessData {
  // Generate a default structure when specific AI findings aren't available
  const hasStructuredData = findings.some((f) =>
    f.description?.toLowerCase().includes("schema") ||
    f.description?.toLowerCase().includes("structured data")
  );

  const hasGoodContent = findings.some((f) =>
    f.importance === "low" &&
    (f.category?.toLowerCase().includes("content") ||
      f.category?.toLowerCase().includes("seo"))
  );

  return {
    overallScore: hasStructuredData && hasGoodContent ? 65 : hasStructuredData || hasGoodContent ? 45 : 30,
    categories: [
      {
        name: "Structured Data & Schema",
        score: hasStructuredData ? 70 : 30,
        status: hasStructuredData ? "good" : "critical",
        metrics: [
          { name: "Schema Types Detected", value: hasStructuredData ? "2-3" : "0", benchmark: "5+" },
        ],
        recommendations: hasStructuredData
          ? ["Add FAQ schema for common questions"]
          : ["Implement LocalBusiness schema", "Add Product schema for homes/floorplans"],
      },
      {
        name: "Content Quality for AI",
        score: hasGoodContent ? 60 : 40,
        status: hasGoodContent ? "needs-work" : "critical",
        metrics: [
          { name: "Content Clarity Score", value: hasGoodContent ? "Good" : "Needs Work" },
        ],
        recommendations: [
          "Add clear, factual statements AI can cite",
          "Structure content with clear headings",
        ],
      },
      {
        name: "AI Search Visibility",
        score: 35,
        status: "critical",
        metrics: [
          { name: "ChatGPT Mentions", value: "Unknown", benchmark: "Monitoring recommended" },
        ],
        recommendations: [
          "Monitor AI search mentions",
          "Create authoritative content worth citing",
        ],
      },
      {
        name: "Conversational SEO",
        score: 40,
        status: "needs-work",
        metrics: [
          { name: "FAQ Coverage", value: "Limited" },
        ],
        recommendations: [
          "Add FAQ sections with natural language questions",
          "Create content answering 'how much', 'where', 'what' queries",
        ],
      },
    ],
    futureProofing: [
      {
        title: "Implement Comprehensive Schema Markup",
        description:
          "Add LocalBusiness, Product, FAQ, and Review schemas to help AI assistants accurately represent your business.",
        priority: "high",
        impact: "Critical for AI search visibility - enables accurate citations",
      },
      {
        title: "Create AI-Optimized Content Hub",
        description:
          "Build a knowledge base with clear, factual content about your communities, pricing, and process that AI can confidently cite.",
        priority: "high",
        impact: "Positions you as an authoritative source for AI-generated responses",
      },
      {
        title: "Enable AI Crawler Access",
        description:
          "Review and update robots.txt to allow GPTBot, ClaudeBot, and other AI crawlers to index your content.",
        priority: "medium",
        impact: "Ensures your content is included in AI training and retrieval",
      },
    ],
  };
}
