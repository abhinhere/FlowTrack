"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ExternalLink } from "lucide-react";

type WakaTimeData = {
  data: [
    {
      grand_total: { text: string };
      languages: { name: string; text: string; percent: number }[];
    }
  ];
};

export function CodingTime({ apiKey }: { apiKey: string }) {
  const [data, setData] = useState<WakaTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!apiKey) return;
    
    setLoading(true);
    fetch("/api/wakatime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(json => {
        if (json.data) {
          setData(json);
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiKey]);

  if (!apiKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/10 bg-surface-900/50 p-6 shadow-card backdrop-blur-sm lg:col-span-2"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Today's Coding Time</h3>
            <p className="text-xs text-slate-400">Powered by WakaTime</p>
          </div>
        </div>
        <a
          href="https://wakatime.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Dashboard
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center text-sm text-rose-400">
          Failed to load WakaTime data. Check your API key.
        </div>
      ) : data && data.data && data.data.length > 0 ? (
        <div>
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
            <p className="text-sm font-medium text-blue-200">Total Time Logged</p>
            <p className="mt-1 text-3xl font-bold text-white">{data.data[0].grand_total.text}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400">Top Languages</h4>
            {data.data[0].languages.slice(0, 5).map((lang) => (
              <div key={lang.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-white">{lang.name}</span>
                  <span className="text-slate-400">{lang.text}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-950 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lang.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
