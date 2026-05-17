"use client";

import { useMemo, useEffect } from "react";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TaskList } from "@/components/tasks/TaskList";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useTasks } from "@/hooks/useTasks";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/components/auth/AuthProvider";
import { Task } from "@/lib/tasks";

export default function HomePage() {
  const { tasks, isHydrated, updateTask, setTaskStatus } = useTasks();
  const { incrementStreak } = useStreak();
  const { notify } = useToast();
  const { user } = useAuth();

  const todaysTasks = useMemo(() => {
    const todayStr = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date());

    return tasks.filter((task) => {
      // Show routine tasks
      if (task.category === "Routine") return true;
      
      // Show progress tasks
      if (task.category === "Progress") return true;

      // Show weekly tasks only if today is one of the scheduled days
      if (task.category === "Weekly" && task.daysOfWeek) {
        return task.daysOfWeek.includes(todayStr as any);
      }

      // Show general tasks if they are not completed
      if (task.category === "General" && task.status !== "Completed") return true;

      return false;
    });
  }, [tasks]);

  const overallProgress = useMemo(() => {
    if (todaysTasks.length === 0) return 0;
    
    const totalScore = todaysTasks.reduce((acc, task) => {
      if (task.category === "Progress") {
        return acc + (task.progressValue ?? 0);
      }
      return acc + (task.status === "Completed" ? 100 : 0);
    }, 0);
    
    return Math.round(totalScore / todaysTasks.length);
  }, [todaysTasks]);

  // Increment streak if 100% is reached
  useEffect(() => {
    if (overallProgress === 100 && todaysTasks.length > 0) {
      incrementStreak();
    }
  }, [overallProgress, todaysTasks.length, incrementStreak]);

  function handleComplete(id: string) {
    setTaskStatus(id, "Completed");
    notify({ title: "Task completed", description: "Great job maintaining your streak!" });
  }

  // We provide a dummy edit/delete function since readOnly hides these buttons anyway
  const noop = () => {};
  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <AppShell title="Home" eyebrow={user ? `Hi, ${firstName}` : "Today's Flow"}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
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

          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Today's Checklist</h2>
            <TaskList
              tasks={todaysTasks}
              onEdit={noop}
              onDelete={noop}
              onComplete={handleComplete}
              readOnly={true}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
