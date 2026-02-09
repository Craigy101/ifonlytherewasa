"use client";

import { Badge } from "@/components/ui/Badge";

interface SolvedBadgeProps {
  solvedBy?: "author" | "community" | null;
  className?: string;
}

export function SolvedBadge({ solvedBy, className }: SolvedBadgeProps) {
  return (
    <Badge color="#22c55e" className={className}>
      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {solvedBy === "author" ? "Solved" : "Community Solved"}
    </Badge>
  );
}
