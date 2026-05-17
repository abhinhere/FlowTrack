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

type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  daysOfWeek?: import("@/lib/tasks").DayOfWeek[];
  subtasks?: import("@/lib/tasks").Subtask[];
  deadline: string;
  status: TaskStatus;
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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // 1. Immediately hydrate from local storage on mount (prevents slow initial load)
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved) as Task[]);
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
        if (saved && rtdbTasks.length === 0) {
          try {
            const localTasks = JSON.parse(saved) as Task[];
            if (localTasks.length > 0) {
              const updates: Record<string, any> = {};
              localTasks.forEach(task => {
                updates[`users/${user.uid}/tasks/${task.id}`] = task;
              });
              
              update(ref(db), updates).then(() => {
                window.localStorage.removeItem(STORAGE_KEY);
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

        rtdbTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTasks(rtdbTasks);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading]);

  // Sync back to local storage ONLY if NOT logged in
  useEffect(() => {
    if (isHydrated && !user && !authLoading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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

  async function updateTask(id: string, input: TaskInput) {
    if (user) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const becameCompleted = task.status !== "Completed" && input.status === "Completed";
      const leftCompleted = task.status === "Completed" && input.status !== "Completed";

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

          const becameCompleted = task.status !== "Completed" && input.status === "Completed";
          const leftCompleted = task.status === "Completed" && input.status !== "Completed";

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
