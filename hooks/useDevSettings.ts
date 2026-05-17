"use client";

import { useState, useEffect } from "react";

export type DevSettings = {
  githubUser: string;
  leetcodeUser: string;
  wakatimeApiKey: string;
};

const defaultSettings: DevSettings = {
  githubUser: "",
  leetcodeUser: "",
  wakatimeApiKey: ""
};

const STORAGE_KEY = "flowtrack.devSettings";

export function useDevSettings() {
  const [settings, setSettings] = useState<DevSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse dev settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: DevSettings) => {
    setSettings(newSettings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  return { settings, saveSettings, isLoaded };
}
