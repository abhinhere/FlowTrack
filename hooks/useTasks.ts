"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  calculateStats,
  createTaskId,
  seedTasks
} from "@/lib/tasks";
import { useAuth } from "@/components/auth/AuthProvider";
import { ref, onValue, set, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "flowtrack.tasks";

/** Returns today's date as YYYY-MM-DD in local time */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Resets Daily tasks that haven't been reset today back to Todo */
function applyDailyReset(tasks: Task[]): { tasks: Task[]; changed: boolean } {
  const today = todayStr();
  let changed = false;
  const updated = tasks.map(task => {
    if (task.category === "Daily" && task.lastResetDate !== today) {
      changed = true;
      return { ...task, status: "Todo" as TaskStatus, completedAt: undefined, lastResetDate: today };
    }
    return task;
  });
  return { tasks: updated, changed };
}

type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  daysOfWeek?: import("@/lib/tasks").DayOfWeek[];
  subtasks?: import("@/lib/tasks").Subtask[];
  deadline: string;
  status: TaskStatus;
  reminderTime?: string;
};

export function sanitizeTask(obj: any): any {
  const sanitized = { ...obj };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  return sanitized;
}

export function getLocalAnonUid(): string {
  if (typeof window === "undefined") return "anon_default";
  let uid = window.localStorage.getItem("flowtrack_anon_uid");
  if (!uid) {
    uid = "anon_" + Math.random().toString(36).slice(2);
    window.localStorage.setItem("flowtrack_anon_uid", uid);
  }
  return uid;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // 1. Immediately hydrate from local storage on mount (prevents slow initial load)
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Task[];
        const { tasks: resetTasks } = applyDailyReset(parsed);
        setTasks(resetTasks);
      } catch {
        setTasks(seedTasks);
      }
    } else {
      setTasks(seedTasks);
    }
    setIsHydrated(true);
  }, []);

  // 2. Sync with Realtime Database once auth is resolved
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // User is logged in, sync with RTDB
      const tasksRef = ref(db, `users/${user.uid}/tasks`);
      
      const unsubscribe = onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        const rtdbTasks = data ? (Object.values(data) as Task[]) : [];
        
        // Data Migration: Check if local storage has tasks that aren't in RTDB yet
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const hasMigrated = window.localStorage.getItem("flowtrack_migrated");
        if (saved && rtdbTasks.length === 0 && !hasMigrated) {
          try {
            const localTasks = JSON.parse(saved) as Task[];
            if (localTasks.length > 0) {
              const updates: Record<string, any> = {};
              localTasks.forEach(task => {
                updates[`users/${user.uid}/tasks/${task.id}`] = task;
              });
              
              update(ref(db), updates).then(() => {
                window.localStorage.setItem("flowtrack_migrated", "true");
                const anonUid = window.localStorage.getItem("flowtrack_anon_uid");
                if (anonUid) {
                  remove(ref(db, `users/${anonUid}`)).catch(() => {});
                  remove(ref(db, `pushSubscriptions/${anonUid}`)).catch(() => {});
                  window.localStorage.removeItem("flowtrack_anon_uid");
                }
              });
              
              // Sort locally for immediate feedback
              localTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setTasks(localTasks);
              return;
            }
          } catch (e) {
            console.error("Migration error", e);
          }
        }

        // Apply daily reset to Firebase tasks
        const { tasks: resetTasks, changed } = applyDailyReset(rtdbTasks);
        if (changed) {
          const updates: Record<string, any> = {};
          resetTasks.forEach(t => {
            if (t.category === "Daily") updates[`users/${user.uid}/tasks/${t.id}`] = sanitizeTask(t);
          });
          update(ref(db), updates);
        }
        resetTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTasks(resetTasks);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading]);

  // Sync back to local storage (always) and RTDB guest node (if not logged in)
  useEffect(() => {
    if (isHydrated && !authLoading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      if (!user) {
        const anonUid = getLocalAnonUid();
        const updates: Record<string, any> = {};
        tasks.forEach(t => {
          updates[`users/${anonUid}/tasks/${t.id}`] = sanitizeTask(t);
        });
        set(ref(db, `users/${anonUid}/tasks`), updates).catch(() => {});
      }
    }
  }, [isHydrated, tasks, user, authLoading]);

  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  async function addTask(input: TaskInput) {
    const now = new Date().toISOString();
    const task: Task = {
      id: createTaskId(),
      ...input,
      createdAt: now,
      completedAt: input.status === "Completed" ? now : undefined
    };

    if (user) {
      try {
        const docRef = ref(db, `users/${user.uid}/tasks/${task.id}`);
        await set(docRef, sanitizeTask(task));
      } catch (error) {
        console.error("Error adding task to RTDB:", error);
        window.alert("Failed to save task to cloud. Please check your Database Rules!");
      }
    } else {
      setTasks((current) => [task, ...current]);
    }
    
    return task;
  }

  async function updateTask(id: string, input: Partial<Task>) {
    if (user) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const becameCompleted = input.status !== undefined && task.status !== "Completed" && input.status === "Completed";
      const leftCompleted = input.status !== undefined && task.status === "Completed" && input.status !== "Completed";

      const updatedTask = {
        ...task,
        ...input,
        completedAt: becameCompleted
          ? new Date().toISOString()
          : leftCompleted
            ? undefined
            : task.completedAt
      };
      
      const docRef = ref(db, `users/${user.uid}/tasks/${id}`);
      await set(docRef, sanitizeTask(updatedTask));
    } else {
      setTasks((current) =>
        current.map((task) => {
          if (task.id !== id) return task;

          const becameCompleted = input.status !== undefined && task.status !== "Completed" && input.status === "Completed";
          const leftCompleted = input.status !== undefined && task.status === "Completed" && input.status !== "Completed";

          return {
            ...task,
            ...input,
            completedAt: becameCompleted
              ? new Date().toISOString()
              : leftCompleted
                ? undefined
                : task.completedAt
          };
        })
      );
    }
  }

  async function deleteTask(id: string) {
    if (user) {
      const docRef = ref(db, `users/${user.uid}/tasks/${id}`);
      await remove(docRef);
    } else {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  }

  async function setTaskStatus(id: string, status: TaskStatus) {
    if (user) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const isNowCompleted = status === "Completed";
      const updatedTask = {
        ...task,
        status,
        completedAt: isNowCompleted ? task.completedAt ?? new Date().toISOString() : undefined
      };
      
      const docRef = ref(db, `users/${user.uid}/tasks/${id}`);
      await set(docRef, sanitizeTask(updatedTask));
    } else {
      setTasks((current) =>
        current.map((task) => {
          if (task.id !== id) return task;
          const isNowCompleted = status === "Completed";

          return {
            ...task,
            status,
            completedAt: isNowCompleted ? task.completedAt ?? new Date().toISOString() : undefined
          };
        })
      );
    }
  }

  async function clearAllTasks() {
    if (window.confirm("Are you sure you want to delete all tasks? This cannot be undone.")) {
      if (user) {
        // Delete all from RTDB
        const updates: Record<string, null> = {};
        tasks.forEach(task => {
          updates[`users/${user.uid}/tasks/${task.id}`] = null;
        });
        await update(ref(db), updates);
      } else {
        setTasks([]);
      }
    }
  }

  return {
    tasks,
    stats,
    isHydrated,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    clearAllTasks
  };
}
