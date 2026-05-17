"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/lib/tasks";

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  readOnly = false
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  readOnly?: boolean;
}) {
  if (tasks.length === 0) {
    return <EmptyState title="No matching tasks" description="Adjust your filters or create a new task to start tracking progress." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} onUpdateTask={onUpdateTask} readOnly={readOnly} />
      ))}
    </div>
  );
}
