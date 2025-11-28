"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/formatters";

function calcDiff(target) {
  const now = new Date();
  const t = new Date(target);
  const diff = t.getTime() - now.getTime();
  if (Number.isNaN(t.getTime())) return { expired: true };
  if (diff <= 0) return { expired: true };
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / (3600 * 24));
  const hours = Math.floor((sec % (3600 * 24)) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { expired: false, days, hours, minutes, seconds };
}

export default function Countdown({ target }) {
  const [state, setState] = useState({ expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(calcDiff(target));
    setMounted(true);
    const id = setInterval(() => {
      setState(calcDiff(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target || !mounted) return null;
  if (state.expired) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Telah dimulai — {formatDate(target)}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex flex-col items-center">
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
          <span className="block text-2xl sm:text-3xl font-bold text-primary">{state.days}</span>
        </div>
        <span className="mt-1 text-xs font-semibold text-muted-foreground">Hari</span>
      </div>
      <div className="text-lg sm:text-2xl font-light text-muted-foreground">:</div>
      <div className="flex flex-col items-center">
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
          <span className="block text-2xl sm:text-3xl font-bold text-primary">{String(state.hours).padStart(2, "0")}</span>
        </div>
        <span className="mt-1 text-xs font-semibold text-muted-foreground">Jam</span>
      </div>
      <div className="text-lg sm:text-2xl font-light text-muted-foreground">:</div>
      <div className="flex flex-col items-center">
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
          <span className="block text-2xl sm:text-3xl font-bold text-primary">{String(state.minutes).padStart(2, "0")}</span>
        </div>
        <span className="mt-1 text-xs font-semibold text-muted-foreground">Menit</span>
      </div>
      <div className="text-lg sm:text-2xl font-light text-muted-foreground">:</div>
      <div className="flex flex-col items-center">
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
          <span className="block text-2xl sm:text-3xl font-bold text-primary">{String(state.seconds).padStart(2, "0")}</span>
        </div>
        <span className="mt-1 text-xs font-semibold text-muted-foreground">Detik</span>
      </div>
    </div>
  );
}
