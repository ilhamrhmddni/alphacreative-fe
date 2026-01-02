"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

export function DarkModeSettings() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first, then check DOM
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark" || 
      (savedTheme === null && document.documentElement.classList.contains("dark"));
    setIsDark(isDarkMode);
    setIsLoading(false);

    // Listen for changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        const newTheme = e.newValue;
        const isDarkTheme = newTheme === "dark";
        setIsDark(isDarkTheme);
        
        if (isDarkTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleToggle = async (newValue) => {
    try {
      setIsDark(newValue);
      
      // Update DOM class
      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Save preference
      localStorage.setItem("theme", newValue ? "dark" : "light");

      toastSuccess({
        title: "Sukses",
        description: `Mode ${newValue ? "gelap" : "terang"} diaktifkan`,
      });
    } catch (error) {
      console.error("Error toggling dark mode:", error);
      toastError({
        title: "Error",
        description: "Gagal mengubah tema",
      });
    }
  };

  if (isLoading) {
    return <div className="h-20 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mode Gelap</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktifkan mode gelap untuk mengurangi kelelahan mata
          </p>
        </div>

        <button
          onClick={() => handleToggle(!isDark)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isDark ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-card shadow-lg transition-transform ${
              isDark ? "translate-x-7" : "translate-x-1"
            }`}
          >
            {isDark ? (
              <Moon className="h-3 w-3 text-primary" />
            ) : (
              <Sun className="h-3 w-3 text-yellow-500" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
