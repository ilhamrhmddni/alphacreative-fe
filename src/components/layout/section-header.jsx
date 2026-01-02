"use client";

import { cn } from "@/lib/utils";

export function SectionHeader({ 
  title, 
  description, 
  subtitle = false,
  actions,
  className 
}) {
  return (
    <div className={cn("mb-8 space-y-3 md:flex md:items-center md:justify-between md:space-y-0", className)}>
      <div>
        <h2 className={cn(
          "font-bold tracking-tight",
          subtitle ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl md:text-4xl"
        )}>
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
