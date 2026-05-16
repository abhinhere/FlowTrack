"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageSection } from "@/components/layout/PageSection";
import { CompletionAreaChart, ProductivityChart } from "@/components/analytics/ProductivityChart";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import { ProgressBars } from "@/components/dashboard/ProgressBars";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { TaskList } from "@/components/tasks/TaskList";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/tasks";

export default function DashboardPage() {
  const { tasks, stats, isHydrated, addTask, updateTask, deleteTask, setTaskStatus } = useTasks();
  const { notify } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function openCreate() {
    setEditingTask(null);
    setIsModalOpen(true);
  }

  function handleSubmit(input: Parameters<typeof addTask>[0]) {
    if (editingTask) {
      updateTask(editingTask.id, input);
      notify({ title: "Task updated", description: "Your progress board is synced locally." });
    } else {
      addTask(input);
      notify({ title: "Task added", description: "A new task is ready to move through your flow." });
    }

    setIsModalOpen(false);
    setEditingTask(null);
  }

  const recentTasks = tasks.slice(0, 6);

  return (
    <AppShell
      title="Dashboard"
      eyebrow="Overview"
      action={
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <StatsCards stats={stats} />

          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <PageSection>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Completion</h2>
                  <p className="mt-1 text-sm text-slate-400">Overall progress across active work.</p>
                </div>
                <Target className="h-5 w-5 text-blue-300" />
              </div>
              <div className="mt-8 flex justify-center">
                <CircularProgress value={stats.completion} />
              </div>
              <div className="mt-8">
                <ProgressBars tasks={tasks} />
              </div>
            </PageSection>

            <PageSection>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Weekly productivity</h2>
                  <p className="mt-1 text-sm text-slate-400">Created work, completed work, and focus velocity.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Momentum rising
                </div>
              </div>
              <div className="mt-4">
                <ProductivityChart tasks={tasks} compact />
              </div>
            </PageSection>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageSection>
              <h2 className="text-lg font-semibold text-white">Recent tasks</h2>
              <div className="mt-4">
                <TaskList
                  tasks={recentTasks}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={(id) => {
                    deleteTask(id);
                    notify({ title: "Task deleted" });
                  }}
                  onComplete={(id) => {
                    setTaskStatus(id, "Completed");
                    notify({ title: "Task completed", description: "That one is off your plate." });
                  }}
                />
              </div>
            </PageSection>

            <PageSection>
              <h2 className="text-lg font-semibold text-white">Completion trend</h2>
              <div className="mt-3">
                <CompletionAreaChart tasks={tasks} />
              </div>
            </PageSection>
          </div>
        </div>
      )}

      <TaskFormModal isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
    </AppShell>
  );
}
