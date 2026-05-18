"use client";

import { useMemo, useEffect, useState } from "react";
import { Activity, Plus, Sun, Target, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useTasks } from "@/hooks/useTasks";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { Task } from "@/lib/tasks";

/** Returns today's short weekday name, e.g. "Mon" */
function getTodayShort() {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date());
}

/** Returns today as YYYY-MM-DD */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const { tasks, isHydrated, updateTask, setTaskStatus, addTask } = useTasks();
  const { incrementStreak } = useStreak();
  const { notify } = useToast();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Schedule background notifications for daily tasks
  useNotifications(tasks);

  const todayDay = getTodayShort();
  const today = todayStr();

  // ── Daily tasks ────────────────────────────────────────────────────────────
  const dailyTasks = useMemo(
    () => tasks.filter(t => t.category === "Daily" && t.status !== "Completed"),
    [tasks]
  );

  // ── Deadline tasks ─────────────────────────────────────────────────────────
  // Incomplete + completed-today (shown as green cards until tomorrow)
  const deadlineTasks = useMemo(
    () =>
      tasks.filter(t => {
        if (t.category !== "Deadline") return false;
        if (t.status !== "Completed") return true;
        // Keep visible if completed today
        return t.completedAt?.slice(0, 10) === today;
      }),
    [tasks, today]
  );

  // ── Weekly tasks (only if today is a scheduled day) ────────────────────────
  const weeklyTasks = useMemo(
    () =>
      tasks.filter(
        t =>
          t.category === "Weekly" &&
          t.daysOfWeek?.includes(todayDay as any) &&
          t.status !== "Completed"
      ),
    [tasks, todayDay]
  );

  // ── Overall progress (all 3 sections combined) ─────────────────────────────
  const allTodaysTasks = useMemo(
    () => [...dailyTasks, ...deadlineTasks, ...weeklyTasks],
    [dailyTasks, deadlineTasks, weeklyTasks]
  );

  const overallProgress = useMemo(() => {
    // Count from the raw tasks that are in today's scope
    const scopedTasks = tasks.filter(t => {
      if (t.category === "Daily") return true;
      if (t.category === "Weekly") return t.daysOfWeek?.includes(todayDay as any);
      if (t.category === "Deadline") return t.status !== "Completed" || t.completedAt?.slice(0, 10) === today;
      return false;
    });
    if (scopedTasks.length === 0) return 0;
    let completedWeight = 0;
    scopedTasks.forEach(task => {
      if (task.status === "Completed") {
        completedWeight += 1;
      } else if (task.subtasks && task.subtasks.length > 0) {
        completedWeight += task.subtasks.filter(st => st.completed).length / task.subtasks.length;
      }
    });
    return Math.round((completedWeight / scopedTasks.length) * 100);
  }, [tasks, todayDay, today]);

  // Increment streak at 100%
  useEffect(() => {
    if (overallProgress === 100 && tasks.length > 0) {
      incrementStreak();
    }
  }, [overallProgress, tasks.length, incrementStreak]);

  function handleComplete(id: string) {
    setTaskStatus(id, "Completed");
    notify({ title: "Task completed!", description: "Great job keeping your flow going 🔥" });
  }

  const noop = () => {};

  function handleAddTask(input: Parameters<typeof addTask>[0]) {
    addTask(input);
    notify({ title: "Task added" });
    setIsModalOpen(false);
    setEditingTask(null);
  }

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const hasAnyTask = dailyTasks.length > 0 || deadlineTasks.length > 0 || weeklyTasks.length > 0;

  return (
    <AppShell title="Home" eyebrow={user ? `Hi, ${firstName}` : "Today's Flow"}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">

          {/* ── Progress card ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/20 text-pink-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Daily Progress</h3>
                  <p className="text-xs text-slate-400">Your overall completion for today</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{overallProgress}%</div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-900 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
              />
            </div>
          </div>

          {/* ── Empty state ── */}
          {!hasAnyTask && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-300">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-white">No tasks for today</p>
                <p className="mt-1 text-sm text-slate-500">Add a task to start building your flow</p>
              </div>
              <button
                onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          )}

          {/* ── Daily Tasks section ── */}
          <AnimatePresence>
            {dailyTasks.length > 0 && (
              <motion.section
                key="daily-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-300">
                    <Sun className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Daily Tasks</h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {dailyTasks.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dailyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Deadline Tasks section ── */}
          <AnimatePresence>
            {deadlineTasks.length > 0 && (
              <motion.section
                key="deadline-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Deadline Tasks</h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {deadlineTasks.filter(t => t.status !== "Completed").length} remaining
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deadlineTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Weekly Checklist section ── */}
          <AnimatePresence>
            {weeklyTasks.length > 0 && (
              <motion.section
                key="weekly-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    Today's Weekly Checklist
                    <span className="ml-2 text-xs font-normal text-slate-500">({todayDay})</span>
                  </h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {weeklyTasks.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {weeklyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </AppShell>
  );
}
