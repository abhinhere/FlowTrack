"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, CircleDashed, Clock3, Layers3 } from "lucide-react";
import { calculateStats } from "@/lib/tasks";

const cards = [
  {
    key: "total",
    label: "Total tasks",
    icon: Layers3,
    tone: "from-blue-500/18 to-cyan-500/8"
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    tone: "from-emerald-500/16 to-cyan-500/8"
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock3,
    tone: "from-violet-500/18 to-blue-500/8"
  },
  {
    key: "completion",
    label: "Completion",
    icon: CircleDashed,
    suffix: "%",
    tone: "from-pink-500/16 to-violet-500/8"
  }
] as const;

export function StatsCards({ stats }: { stats: ReturnType<typeof calculateStats> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-card`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-blue-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {index === 0 ? "Live" : "+8%"}
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">
              {value}
              {"suffix" in card ? card.suffix : ""}
            </p>
            <p className="mt-1 text-sm text-slate-400">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
