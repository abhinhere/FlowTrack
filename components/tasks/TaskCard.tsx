"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { Badge } from "@/components/ui/Badge";
import { Task, formatDeadline, priorityAccent, statusAccent } from "@/lib/tasks";

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  dragListeners,
  dragAttributes,
  style,
  isDragging = false
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  style?: React.CSSProperties;
  isDragging?: boolean;
}) {
  return (
    <motion.article
      layout
      style={style}
      whileHover={{ y: -2 }}
      className={`rounded-xl border border-white/10 bg-surface-850/88 p-4 shadow-sm transition ${
        isDragging ? "opacity-70 ring-2 ring-blue-400/50" : ""
      }`}
      {...dragAttributes}
      {...dragListeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold leading-6 text-white">{task.title}</h3>
          {task.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{task.description}</p>}
        </div>
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
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className={priorityAccent[task.priority]}>{task.priority}</Badge>
        <Badge className={statusAccent[task.status]}>{task.status}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{formatDeadline(task.deadline)}</span>
        </div>
        <button
          aria-label={`Mark ${task.title} complete`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onComplete(task.id)}
          className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-1.5 text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={task.status === "Completed"}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
