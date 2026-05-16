"use client";

import { useEffect, useState } from "react";

const STREAK_KEY = "flowtrack.streak";

type StreakData = {
  count: number;
  lastUpdate: string;
};

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastUpdate: "" });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STREAK_KEY);
    if (saved) {
      try {
        setStreak(JSON.parse(saved) as StreakData);
      } catch {}
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    }
  }, [streak, isHydrated]);

  function incrementStreak() {
    const today = new Date().toISOString().slice(0, 10);
    setStreak((current) => {
      // Already incremented today
      if (current.lastUpdate === today) return current;
      
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      
      // Kept the streak going
      if (current.lastUpdate === yesterday) {
        return { count: current.count + 1, lastUpdate: today };
      }
      
      // Started a new streak
      return { count: 1, lastUpdate: today };
    });
  }

  function resetStreak() {
    if (window.confirm("Are you sure you want to reset your focus streak to 0?")) {
      setStreak({ count: 0, lastUpdate: "" });
    }
  }

  return { streak, incrementStreak, resetStreak, isHydrated };
}
