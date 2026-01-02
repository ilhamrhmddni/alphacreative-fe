"use client";

import { useEffect, useState } from "react";

export function DarkModeDebug() {
  const [isDark, setIsDark] = useState(false);
  const [stored, setStored] = useState("");

  useEffect(() => {
    // Check current state
    const theme = localStorage.getItem("theme");
    const isDarkClass = document.documentElement.classList.contains("dark");
    
    setStored(theme || "not set");
    setIsDark(isDarkClass);
  }, []);

  const handleTest = () => {
    const theme = localStorage.getItem("theme");
    const isDarkClass = document.documentElement.classList.contains("dark");
    const htmlClass = document.documentElement.className;
    
    console.log("=== DARK MODE DEBUG ===");
    console.log("localStorage theme:", theme);
    console.log("Has 'dark' class:", isDarkClass);
    console.log("HTML classNames:", htmlClass);
    console.log("window.matchMedia dark:", window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border p-4 rounded-lg text-sm max-w-xs z-50">
      <div className="space-y-2">
        <p>
          <strong>Storage:</strong> <code className="bg-muted px-1 rounded text-xs">{stored}</code>
        </p>
        <p>
          <strong>DOM:</strong> <code className="bg-muted px-1 rounded text-xs">{isDark ? "dark" : "light"}</code>
        </p>
        <button
          onClick={handleTest}
          className="w-full mt-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
        >
          Log Debug Info
        </button>
      </div>
    </div>
  );
}
