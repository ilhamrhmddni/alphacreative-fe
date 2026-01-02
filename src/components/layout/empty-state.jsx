"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ 
  icon: Icon = AlertCircle, 
  title = "Tidak ada data", 
  description = "Belum ada item yang tersedia",
  action,
  className 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center", className)}>
      <Icon className="mb-4 h-12 w-12 text-muted-foreground opacity-40" />
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
