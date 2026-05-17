"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useDevSettings } from "@/hooks/useDevSettings";
import { GitHubStats } from "@/components/dev/GitHubStats";
import { LeetCodeStats } from "@/components/dev/LeetCodeStats";
import { CodingTime } from "@/components/dev/CodingTime";
import { Settings, Save, AlertCircle } from "lucide-react";

export default function DevCornerPage() {
  const { settings, saveSettings, isLoaded } = useDevSettings();
  const [showSettings, setShowSettings] = useState(false);

  // Local state for the form
  const [form, setForm] = useState(settings);

  // Sync form when settings load
  if (isLoaded && form.githubUser === "" && settings.githubUser !== "") {
    if (!showSettings) setForm(settings);
  }

  const handleSave = () => {
    saveSettings(form);
    setShowSettings(false);
  };

  const isConfigured = settings.githubUser || settings.leetcodeUser || settings.wakatimeApiKey;

  return (
    <AppShell
      title="Dev Corner"
      eyebrow="Developer Analytics"
      action={
        <button
          onClick={() => {
            setForm(settings);
            setShowSettings(true);
          }}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </button>
      }
    >
      {!isLoaded ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : showSettings || !isConfigured ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-surface-900/50 p-6 shadow-card backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Configure Integrations</h2>
            <p className="mt-1 text-sm text-slate-400">Connect your developer accounts to see your analytics.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">GitHub Username</label>
              <input
                type="text"
                value={form.githubUser}
                onChange={e => setForm({ ...form, githubUser: e.target.value })}
                placeholder="e.g. octocat"
                className="w-full rounded-xl border border-white/10 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">LeetCode Username</label>
              <input
                type="text"
                value={form.leetcodeUser}
                onChange={e => setForm({ ...form, leetcodeUser: e.target.value })}
                placeholder="e.g. leetcode_user"
                className="w-full rounded-xl border border-white/10 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">WakaTime API Key (Base64 or Plain)</label>
              <input
                type="password"
                value={form.wakatimeApiKey}
                onChange={e => setForm({ ...form, wakatimeApiKey: e.target.value })}
                placeholder="waka_..."
                className="w-full rounded-xl border border-white/10 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <p className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                Your API key is stored securely in your browser's local storage and is never sent anywhere except directly to WakaTime.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {isConfigured && (
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-blue-400"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {settings.githubUser && <GitHubStats username={settings.githubUser} />}
          {settings.leetcodeUser && <LeetCodeStats username={settings.leetcodeUser} />}
          {settings.wakatimeApiKey && <CodingTime apiKey={settings.wakatimeApiKey} />}
        </div>
      )}
    </AppShell>
  );
}
