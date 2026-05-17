"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitBranch, ExternalLink, GitCommit, Users, BookOpen, Calendar, TrendingUp } from "lucide-react";

type GitHubProfile = {
  public_repos: number;
  followers: number;
  following: number;
};

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    size?: number;
    commits?: { message: string; sha: string }[];
  };
};

type CommitStats = {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
};

// Use local date (not UTC) so today's boundary matches the user's timezone
function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function GitHubStats({ username }: { username: string }) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [recentCommits, setRecentCommits] = useState<{ message: string; repo: string; date: string }[]>([]);
  const [commitStats, setCommitStats] = useState<CommitStats>({ today: 0, weekly: 0, monthly: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    setLoading(true);

    const now = new Date();
    const todayStr = toLocalDateStr(now);
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

    // Fetch up to 3 pages of events (90 events) to maximise coverage for recent counts
    const eventPages = [1, 2, 3].map(page =>
      fetch(`https://api.github.com/users/${username}/events?per_page=30&page=${page}`)
        .then(res => res.ok ? res.json() as Promise<GitHubEvent[]> : [] as GitHubEvent[])
        .catch(() => [] as GitHubEvent[])
    );

    // Our proxy reads GitHub's contribution graph — far more accurate than the Search API
    const totalCountFetch = fetch("/api/github-contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    }).then(res => res.ok ? res.json() : null).catch(() => null);

    Promise.all([
      fetch(`https://api.github.com/users/${username}`).then(res => res.ok ? res.json() : null),
      ...eventPages,
      totalCountFetch
    ]).then(([profileData, page1, page2, page3, contributionData]) => {
      if (profileData) setProfile(profileData);

      const allEvents: GitHubEvent[] = [...(page1 as GitHubEvent[]), ...(page2 as GitHubEvent[]), ...(page3 as GitHubEvent[])];
      const pushEvents = allEvents.filter(e => e.type === "PushEvent");

      // Count commits per period using payload.size (actual commit count in the push)
      let todayCount = 0, weeklyCount = 0, monthlyCount = 0;
      const flatCommits: { message: string; repo: string; date: string }[] = [];

      pushEvents.forEach(e => {
        const eventDate = new Date(e.created_at);
        const eventDateStr = toLocalDateStr(eventDate);
        const commitCount = e.payload.size ?? e.payload.commits?.length ?? 0;

        if (eventDateStr === todayStr) todayCount += commitCount;
        if (eventDate >= weekAgo) weeklyCount += commitCount;
        if (eventDate >= monthAgo) monthlyCount += commitCount;

        // Collect individual commit messages for recent feed
        if (e.payload.commits) {
          e.payload.commits.forEach(c => {
            flatCommits.push({ message: c.message, repo: e.repo.name, date: e.created_at });
          });
        }
      });

      // Sum all years from the contribution graph total
      const totalCount = contributionData?.total
        ? Object.values(contributionData.total as Record<string, number>).reduce((a, b) => a + b, 0)
        : 0;

      setCommitStats({ today: todayCount, weekly: weeklyCount, monthly: monthlyCount, total: totalCount });
      setRecentCommits(flatCommits.slice(0, 3));
    }).finally(() => setLoading(false));
  }, [username]);

  if (!username) return null;

  const statBadges = [
    { label: "Today", value: commitStats.today, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    { label: "This Week", value: commitStats.weekly, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    { label: "This Month", value: commitStats.monthly, color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
    { label: "Total", value: commitStats.total.toLocaleString(), color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface-900/50 p-6 shadow-card backdrop-blur-sm"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-200">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">GitHub Activity</h3>
            <p className="text-xs text-slate-400">@{username}</p>
          </div>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          View Profile
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Contribution Graph */}
      <div className="mb-6 overflow-hidden rounded-xl bg-surface-950 p-4 border border-white/[0.05]">
        <img
          src={`https://ghchart.rshah.org/8b5cf6/${username}`}
          alt={`${username}'s GitHub Activity`}
          className="w-full opacity-90 transition hover:opacity-100"
          style={{ filter: "hue-rotate(320deg) brightness(1.2)" }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Commit Stats */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" /> Commit Activity
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statBadges.map(({ label, value, color }) => (
                <div key={label} className={`flex flex-col items-center rounded-xl border p-3 text-center ${color}`}>
                  <span className="text-2xl font-bold">{value}</span>
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Stats */}
          {profile && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Calendar className="h-3.5 w-3.5" /> Profile
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center rounded-lg bg-white/[0.02] p-3 border border-white/[0.05]">
                  <BookOpen className="mb-1 h-4 w-4 text-slate-400" />
                  <span className="text-lg font-bold text-white">{profile.public_repos}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Repos</span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-white/[0.02] p-3 border border-white/[0.05]">
                  <Users className="mb-1 h-4 w-4 text-slate-400" />
                  <span className="text-lg font-bold text-white">{profile.followers}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Followers</span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-white/[0.02] p-3 border border-white/[0.05]">
                  <Users className="mb-1 h-4 w-4 text-slate-400" />
                  <span className="text-lg font-bold text-white">{profile.following}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Following</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Commits Feed */}
          {recentCommits.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <GitCommit className="h-3.5 w-3.5" /> Recent Commits
              </h4>
              <div className="space-y-3">
                {recentCommits.map((commit, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-slate-800 p-1">
                      <GitCommit className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-slate-300">{commit.message}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="truncate">{commit.repo}</span>
                        <span>•</span>
                        <span>{new Date(commit.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
