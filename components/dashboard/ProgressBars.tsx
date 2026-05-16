"use client";

import { motion } from "framer-motion";
import { Task } from "@/lib/tasks";

export function ProgressBars({ tasks }: { tasks: Task[] }) {
  const total = Math.max(tasks.length, 1);
  const rows = [
    {
      label: "Todo",
      value: tasks.filter((task) => task.status === "Todo").length,
      color: "from-slate-300 to-slate-500"
    },
    {
      label: "In Progress",
      value: tasks.filter((task) => task.status === "In Progress").length,
      color: "from-blue-400 to-cyan-300"
    },
    {
      label: "Completed",
      value: tasks.filter((task) => task.status === "Completed").length,
      color: "from-emerald-400 to-blue-400"
    }
  ];

  return (
    <div className="space-y-5">
      {rows.map((row) => {
        const percentage = Math.round((row.value / total) * 100);

        return (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">{row.label}</span>
              <span className="text-slate-500">{percentage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
