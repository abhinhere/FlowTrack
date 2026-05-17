"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, ExternalLink } from "lucide-react";

type LeetCodeData = {
  allQuestionsCount: { difficulty: string; count: number }[];
  matchedUser: {
    submitStats: {
      acSubmissionNum: { difficulty: string; count: number }[];
    };
  };
};

export function LeetCodeStats({ username }: { username: string }) {
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    
    setLoading(true);
    fetch("/api/leetcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(json => {
        if (json.data) {
          setData(json.data);
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (!username) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-white/10 bg-surface-900/50 p-6 shadow-card backdrop-blur-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/20 text-orange-400">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">LeetCode Stats</h3>
            <p className="text-xs text-slate-400">@{username}</p>
          </div>
        </div>
        <a
          href={`https://leetcode.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          View Profile
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center text-sm text-rose-400">
          Failed to load LeetCode data. Make sure the username is correct.
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-4">
          {data.matchedUser.submitStats.acSubmissionNum.filter(d => d.difficulty !== "All").map(stat => {
            const colors: Record<string, string> = {
              Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
              Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
              Hard: "text-rose-400 bg-rose-400/10 border-rose-400/20"
            };
            const theme = colors[stat.difficulty] || "text-slate-400 bg-slate-400/10 border-slate-400/20";
            
            return (
              <div key={stat.difficulty} className={`rounded-xl border p-4 text-center ${theme}`}>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80">{stat.difficulty}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}
