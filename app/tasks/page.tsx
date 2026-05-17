"use client";

import { useMemo, useState } from "react";
import { Filter, KanbanSquare, List, Plus, Search, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { TaskList } from "@/components/tasks/TaskList";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskPriority, TaskStatus, TaskCategory, priorityList, statusList, categoryList } from "@/lib/tasks";

type ViewMode = "board" | "list";

export default function TasksPage() {
  const { tasks, isHydrated, addTask, updateTask, deleteTask, setTaskStatus } = useTasks();
  const { notify } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus | "All">("All");
  const [priority, setPriority] = useState<TaskPriority | "All">("All");
  const [category, setCategory] = useState<TaskCategory | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All" || task.status === status;
      const matchesPriority = priority === "All" || task.priority === priority;
      const taskCategory = task.category || "Deadline";
      const matchesCategory = category === "All" || taskCategory === category;

      return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [priority, query, status, category, tasks]);

  const overallProgress = useMemo(() => {
    if (filteredTasks.length === 0) return 0;
    
    const completed = filteredTasks.filter(t => t.status === "Completed").length;
    return Math.round((completed / filteredTasks.length) * 100);
  }, [filteredTasks]);

  function openCreate() {
    setEditingTask(null);
    setIsModalOpen(true);
  }

  function handleSubmit(input: Parameters<typeof addTask>[0]) {
    if (editingTask) {
      updateTask(editingTask.id, input);
      notify({ title: "Task updated" });
    } else {
      addTask(input);
      notify({ title: "Task added" });
    }

    setIsModalOpen(false);
    setEditingTask(null);
  }

  function handleDelete(id: string) {
    deleteTask(id);
    notify({ title: "Task deleted" });
  }

  function handleComplete(id: string) {
    setTaskStatus(id, "Completed");
    notify({ title: "Task completed", description: "Progress saved in your browser." });
  }

  return (
    <AppShell
      title="Tasks"
      eyebrow="Kanban"
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
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/20 text-pink-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Daily Progress</h3>
                  <p className="text-xs text-slate-400">Based on active filters</p>
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-card">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-surface-900 px-3 sm:col-span-2 lg:col-span-1">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tasks"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </label>

              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-surface-900 px-3 text-sm text-slate-400">
                <Filter className="h-4 w-4" />
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus | "All")}
                  className="bg-transparent text-white outline-none"
                >
                  <option>All Status</option>
                  {statusList.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TaskCategory | "All")}
                className="min-h-11 rounded-xl border border-white/10 bg-surface-900 px-3 text-sm text-white outline-none"
              >
                <option>All Types</option>
                {categoryList.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority | "All")}
                className="min-h-11 rounded-xl border border-white/10 bg-surface-900 px-3 text-sm text-white outline-none"
              >
                <option>All Priorities</option>
                {priorityList.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-surface-900 p-1 sm:col-span-2 lg:col-span-1">
                <button
                  aria-label="Board view"
                  onClick={() => setViewMode("board")}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    viewMode === "board" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"
                  }`}
                >
                  <KanbanSquare className="mx-auto h-4 w-4" />
                </button>
                <button
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"
                  }`}
                >
                  <List className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "board" ? (
            <KanbanBoard
              tasks={filteredTasks}
              onEdit={(task) => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onUpdateTask={updateTask}
              onStatusChange={(id, nextStatus) => {
                setTaskStatus(id, nextStatus);
                notify({ title: "Task moved", description: `Status changed to ${nextStatus}.` });
              }}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={(task) => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onUpdateTask={updateTask}
            />
          )}
        </div>
      )}

      <TaskFormModal isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
    </AppShell>
  );
}
