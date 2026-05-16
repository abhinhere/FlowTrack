"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  LayoutDashboard,
  Layers3,
  Sparkles
} from "lucide-react";

const previewTasks = [
  { title: "Polish dashboard interactions", status: "In Progress", width: "72%" },
  { title: "Ship analytics overview", status: "Completed", width: "100%" },
  { title: "Triage weekly priorities", status: "Todo", width: "38%" }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface-950 text-white">
      <div className="absolute inset-0 subtle-grid opacity-55" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500 shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold">FlowTrack</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
          <Link href="/tasks" className="transition hover:text-white">Tasks</Link>
          <Link href="/analytics" className="transition hover:text-white">Analytics</Link>
        </nav>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Open app
          <ChevronRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-200">
            <CircleDashed className="h-4 w-4" />
            Personal progress command center
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            FlowTrack
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Track active work, move tasks through a calm Kanban flow, and see weekly momentum without accounts,
            clutter, or ceremony.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
            >
              Launch dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Manage tasks
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="glass-panel rounded-[2rem] p-3">
            <div className="rounded-[1.45rem] border border-white/10 bg-surface-900 p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300">Dashboard</p>
                  <p className="mt-1 text-lg font-semibold">Today&apos;s flow</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Total", "18", LayoutDashboard],
                  ["Done", "11", CheckCircle2],
                  ["Focus", "74%", BarChart3]
                ].map(([label, value, Icon]) => (
                  <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <Icon className="h-5 w-5 text-blue-300" />
                    <p className="mt-4 text-2xl font-semibold">{value as string}</p>
                    <p className="text-sm text-slate-500">{label as string}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">Active tasks</p>
                    <Layers3 className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3">
                    {previewTasks.map((task, index) => (
                      <div key={task.title} className="rounded-xl border border-white/10 bg-surface-850 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-medium">{task.title}</p>
                          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: task.width }}
                            transition={{ delay: 0.4 + index * 0.12, duration: 0.8 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-sm font-medium text-slate-200">Weekly pulse</p>
                  <div className="mt-5 flex h-44 items-end gap-2">
                    {[42, 58, 36, 76, 64, 88, 70].map((height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.25 + index * 0.07, duration: 0.7 }}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-300"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
