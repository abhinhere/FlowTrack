"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, Pencil, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { Badge } from "@/components/ui/Badge";
import { Task, formatDeadline, statusAccent, Subtask } from "@/lib/tasks";

function format12Hour(timeStr?: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onUpdateTask,
  dragListeners,
  dragAttributes,
  style,
  isDragging = false,
  readOnly = false
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  style?: React.CSSProperties;
  isDragging?: boolean;
  readOnly?: boolean;
}) {
  const isCompleted = task.status === "Completed";
  const isDaily = task.category === "Daily";

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!onUpdateTask || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  return (
    <motion.article
      layout
      style={style}
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-4 shadow-sm transition ${
        isDragging ? "opacity-70 ring-2 ring-blue-400/50" : ""
      } ${
        isCompleted
          ? "border-emerald-500/25 bg-emerald-950/40"
          : "border-white/10 bg-surface-850/88"
      }`}
      {...dragAttributes}
      {...dragListeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`break-words text-sm font-semibold leading-6 ${
              isCompleted ? "line-through text-slate-400" : "text-white"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{task.description}</p>
          )}
        </div>
        {!readOnly && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              aria-label={`Edit ${task.title}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              aria-label={`Delete ${task.title}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onDelete(task.id)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Status badge only (priority removed) */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className={statusAccent[task.status]}>{task.status}</Badge>
        {task.reminderTime && isDaily && (
          <span className="flex items-center gap-1 rounded-full border border-pink-400/30 bg-pink-400/10 px-2 py-0.5 text-[11px] font-medium text-pink-200">
            <Clock className="h-3 w-3" />
            {format12Hour(task.reminderTime)}
          </span>
        )}
      </div>

      {/* Weekly scheduled days */}
      {task.category === "Weekly" && task.daysOfWeek && task.daysOfWeek.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {task.daysOfWeek.map((day) => (
            <span
              key={day}
              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-200"
            >
              {day}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks — hidden for Daily and Weekly tasks */}
      {!isDaily && task.category !== "Weekly" && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 space-y-2">
          {task.subtasks.map(st => (
            <button
              key={st.id}
              onClick={() => handleSubtaskToggle(st.id)}
              disabled={!onUpdateTask}
              onPointerDown={(e) => e.stopPropagation()}
              className={`flex w-full items-start gap-2 text-left transition ${!onUpdateTask ? "cursor-default" : "hover:opacity-80"}`}
            >
              {st.completed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              )}
              <span className={`text-sm ${st.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                {st.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isDaily ? "Daily" : task.category === "Weekly" ? "Weekly" : formatDeadline(task.deadline)}
          </span>
        </div>
        <button
          aria-label={`Mark ${task.title} complete`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onComplete(task.id)}
          className={`rounded-lg border p-1.5 transition disabled:cursor-not-allowed disabled:opacity-45 ${
            isCompleted
              ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
          }`}
          disabled={isCompleted}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
