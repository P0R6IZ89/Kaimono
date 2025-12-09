"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Play,
  Users,
  Target,
  Zap,
} from "lucide-react";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  isCompleted?: boolean;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

export function StepCard({
  step,
  title,
  description,
  isCompleted,
  actionText,
  actionLink,
  icon,
}: StepCardProps) {
  const t = useTranslations("UserGuide");

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t("stepLabel", { step })}
              </Badge>
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {actionText && actionLink && (
        <CardContent className="pt-0">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={actionLink}>
              {actionText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

interface FeatureHighlightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  example?: string;
  isPro?: boolean;
}

export function FeatureHighlight({
  title,
  description,
  icon,
}: FeatureHighlightProps) {
  return (
    <Card className={`h-full `}>
      <CardHeader className="pb-3">
        <div className="flex justify-center items-center gap-2">
          <div>{icon}</div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "outline";
}

export function QuickAction({
  title,
  description,
  icon,
  href,
  variant = "default",
}: QuickActionProps) {
  return (
    <Button asChild variant={variant} className="h-auto p-4 justify-start">
      <Link href={href} className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="text-left">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </Link>
    </Button>
  );
}

// Predefined icon combinations for common features
export const GuideIcons = {
  play: <Play className="h-5 w-5 text-blue-500" />,
  users: <Users className="h-5 w-5 text-green-500" />,
  target: <Target className="h-5 w-5 text-orange-500" />,
  zap: <Zap className="h-5 w-5 text-purple-500" />,
};
