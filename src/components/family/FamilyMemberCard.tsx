"use client";

import {
  Baby,
  CircleUserRound,
  Crown,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemoFamilyMember, FamilyRelationship } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

const RELATIONSHIP_ICON: Partial<Record<FamilyRelationship, React.ElementType>> = {
  "mother-in-law": Crown,
  husband: HeartHandshake,
  brother: GraduationCap,
  daughter: Baby,
  son: Baby,
};

const RELATIONSHIP_HINDI: Partial<Record<FamilyRelationship, string>> = {
  "mother-in-law": "सासू माँ",
  husband: "पति",
  brother: "भाई",
  daughter: "बेटी",
  son: "बेटा",
};

const VISIBILITY_LABEL: Record<string, string> = {
  everything: "Sab kuch dekhti hain",
  aggregate_goal_progress: "Goal progress (numbers)",
  protection_alerts: "Sirf scam protection",
  college_fee_transfers_only: "College fee transfers",
  self_savings_only: "Apni savings",
};

export function FamilyMemberCard({
  member,
  className,
}: {
  member: DemoFamilyMember;
  className?: string;
}) {
  const Icon = RELATIONSHIP_ICON[member.relationship] ?? CircleUserRound;
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <Card tone="paper" padding="md" className={cn("space-y-3", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green text-body font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-body font-semibold text-saathi-ink truncate">
              {member.name}
            </div>
            <div className="flex items-center gap-1.5 text-caption text-saathi-ink-quiet">
              <Icon className="h-3.5 w-3.5" />
              <span lang="hi" className="font-deva">
                {RELATIONSHIP_HINDI[member.relationship] ?? member.relationship}
              </span>
              <span>·</span>
              <span>{member.ageBand}</span>
            </div>
          </div>
        </div>
        <Badge tone="muted">{member.language.split("-")[0]}</Badge>
      </CardHeader>

      <CardContent className="!mt-0 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {member.visibility.sees.map((v) => (
            <Badge key={v} tone="green">
              {VISIBILITY_LABEL[v] ?? v}
            </Badge>
          ))}
        </div>
        {member.notes ? (
          <p className="text-caption text-saathi-ink-soft">{member.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
