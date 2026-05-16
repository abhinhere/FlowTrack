"use client";

import { BarChart3, BrainCircuit, CalendarClock, CheckCircle2, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageSection } from "@/components/layout/PageSection";
import { CompletionAreaChart, ProductivityChart } from "@/components/analytics/ProductivityChart";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import { ProgressBars } from "@/components/dashboard/ProgressBars";
import { LoadingState } from "@/components/ui/LoadingState";
import { useTasks } from "@/hooks/useTasks";

export default function AnalyticsPage() {
  const { tasks, stats, isHydrated, clearAllTasks } = useTasks();
  const highPriorityOpen = tasks.filter((task) => task.priority === "High" && task.status !== "Completed").length;
  const dueSoon = tasks.filter((task) => {
    if (!task.deadline || task.status === "Completed") return false;
    const deadline = new Date(`${task.deadline}T00:00:00`).getTime();
    const diff = deadline - Date.now();
    return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 3;
  }).length;

  return (
    <AppShell
      title="Analytics"
      eyebrow="Insights"
      action={
        <button
          onClick={clearAllTasks}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Reset Data</span>
        </button>
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Completion rate", value: `${stats.completion}%`, icon: Target, hint: "All tracked work" },
              { label: "In progress", value: stats.inProgress, icon: BrainCircuit, hint: "Currently moving" },
              { label: "Due soon", value: dueSoon, icon: CalendarClock, hint: "Next 3 days" },
              { label: "High priority open", value: highPriorityOpen, icon: CheckCircle2, hint: "Needs attention" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-blue-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <BarChart3 className="h-4 w-4 text-slate-600" />
                </div>
                <p className="mt-5 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-xs text-slate-500">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageSection>
              <h2 className="text-lg font-semibold text-white">Weekly productivity chart</h2>
              <p className="mt-1 text-sm text-slate-400">Compares created tasks, completions, and focus velocity.</p>
              <div className="mt-4">
                <ProductivityChart tasks={tasks} />
              </div>
            </PageSection>

            <PageSection>
              <h2 className="text-lg font-semibold text-white">Task completion progress</h2>
              <div className="mt-6 flex justify-center">
                <CircularProgress value={stats.completion} size={188} />
              </div>
              <div className="mt-8">
                <ProgressBars tasks={tasks} />
              </div>
            </PageSection>
          </div>

          <PageSection>
            <h2 className="text-lg font-semibold text-white">Completion visualization</h2>
            <p className="mt-1 text-sm text-slate-400">Animated trend line for week-over-week delivery energy.</p>
            <div className="mt-4">
              <CompletionAreaChart tasks={tasks} />
            </div>
          </PageSection>
        </div>
      )}
    </AppShell>
  );
}
