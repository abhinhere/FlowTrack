"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Task, getWeeklyProductivity } from "@/lib/tasks";

export function ProductivityChart({ tasks, compact = false }: { tasks: Task[]; compact?: boolean }) {
  const data = getWeeklyProductivity(tasks);

  return (
    <div className={compact ? "h-64" : "h-80"}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="focusFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "rgba(15, 18, 27, 0.94)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} fill="url(#focusFill)" />
          <Bar dataKey="created" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={34} />
          <Bar dataKey="completed" fill="#22d3ee" radius={[8, 8, 0, 0]} maxBarSize={34} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionAreaChart({ tasks }: { tasks: Task[] }) {
  const data = getWeeklyProductivity(tasks).map((item, index) => ({
    ...item,
    completion: Math.min(100, item.completed * 22 + index * 7 + 20)
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="completionFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 18, 27, 0.94)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="completion" stroke="#8b5cf6" strokeWidth={2} fill="url(#completionFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
