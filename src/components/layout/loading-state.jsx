"use client";

import { cn } from "@/lib/utils";

export function LoadingState({ 
  rows = 5, 
  className 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
