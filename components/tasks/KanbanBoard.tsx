"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task, TaskStatus, statusList } from "@/lib/tasks";

export function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onStatusChange,
  onUpdateTask
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((task) => task.id === over.id);
    const targetStatus = (overTask?.status ?? over.id) as TaskStatus;

    if (statusList.includes(targetStatus) && targetStatus !== activeTask.status) {
      onStatusChange(activeTask.id, targetStatus);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-3">
        {statusList.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);

          return (
            <KanbanColumn key={status} status={status} tasks={columnTasks}>
              {columnTasks.length === 0 ? (
                <EmptyState title="Nothing here" description="Drag work into this lane or add a fresh task." />
              ) : (
                <SortableContext items={columnTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onComplete={onComplete}
                        onUpdateTask={onUpdateTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  tasks,
  children
}: {
  status: TaskStatus;
  tasks: Task[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <motion.section
      ref={setNodeRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-[26rem] rounded-2xl border p-3 transition ${
        isOver ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white">{status}</h2>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
          {tasks.length}
        </span>
      </div>
      {children}
    </motion.section>
  );
}

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onUpdateTask
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div ref={setNodeRef}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onUpdateTask={onUpdateTask}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        style={{
          transform: CSS.Transform.toString(transform),
          transition
        }}
      />
    </div>
  );
}
