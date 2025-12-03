"use client";

import * as React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconClassName?: string;
  variant?: "help" | "info";
}

export function InfoTooltip({
  content,
  side = "top",
  className,
  iconClassName,
  variant = "help",
}: InfoTooltipProps) {
  const Icon = variant === "help" ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 p-0.5",
              className
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 text-gray-400 hover:text-gray-600",
                iconClassName
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

export function LabelWithTooltip({
  label,
  tooltip,
  required,
  className,
  htmlFor,
}: LabelWithTooltipProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

interface FeatureTooltipProps {
  feature: string;
  description: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function FeatureTooltip({
  feature,
  description,
  children,
  side = "top",
}: FeatureTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm p-3">
          <div className="space-y-1">
            <p className="font-medium text-white">{feature}</p>
            <p className="text-gray-300 text-xs">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
