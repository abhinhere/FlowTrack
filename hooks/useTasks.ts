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
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "flowtrack.tasks";

type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  daysOfWeek?: import("@/lib/tasks").DayOfWeek[];
  progressValue?: number;
  deadline: string;
  status: TaskStatus;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // User is logged in, sync with Firestore
      const tasksRef = collection(db, "users", user.uid, "tasks");
      
      const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
        const firestoreTasks = snapshot.docs.map(doc => doc.data() as Task);
        
        // Data Migration: Check if local storage has tasks that aren't in Firestore yet
        // We only do this once after login if Firestore is empty
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && firestoreTasks.length === 0) {
          try {
            const localTasks = JSON.parse(saved) as Task[];
            if (localTasks.length > 0) {
              const batch = writeBatch(db);
              localTasks.forEach(task => {
                const docRef = doc(tasksRef, task.id);
                batch.set(docRef, task);
              });
              batch.commit().then(() => {
                window.localStorage.removeItem(STORAGE_KEY);
              });
              
              // Sort locally for immediate feedback
              localTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setTasks(localTasks);
              setIsHydrated(true);
              return;
            }
          } catch (e) {
            console.error("Migration error", e);
          }
        }

        firestoreTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTasks(firestoreTasks);
        setIsHydrated(true);
      });

      return () => unsubscribe();
    } else {
      // User not logged in, use local storage
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
      const docRef = doc(db, "users", user.uid, "tasks", task.id);
      await setDoc(docRef, task);
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
      
      const docRef = doc(db, "users", user.uid, "tasks", id);
      await setDoc(docRef, updatedTask);
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
      const docRef = doc(db, "users", user.uid, "tasks", id);
      await deleteDoc(docRef);
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
      
      const docRef = doc(db, "users", user.uid, "tasks", id);
      await setDoc(docRef, updatedTask);
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
        // Delete all from Firestore
        const batch = writeBatch(db);
        tasks.forEach(task => {
          const docRef = doc(db, "users", user.uid, "tasks", task.id);
          batch.delete(docRef);
        });
        await batch.commit();
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
