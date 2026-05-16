"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  calculateStats,
  createTaskId,
  seedTasks
} from "@/lib/tasks";

const STORAGE_KEY = "flowtrack.tasks";

type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [isHydrated, tasks]);

  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  function addTask(input: TaskInput) {
    const now = new Date().toISOString();
    const task: Task = {
      id: createTaskId(),
      ...input,
      createdAt: now,
      completedAt: input.status === "Completed" ? now : undefined
    };

    setTasks((current) => [task, ...current]);
    return task;
  }

  function updateTask(id: string, input: TaskInput) {
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

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function setTaskStatus(id: string, status: TaskStatus) {
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

  return {
    tasks,
    stats,
    isHydrated,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus
  };
}
