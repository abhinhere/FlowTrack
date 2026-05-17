"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Flag, ListTodo, X, Folder, CalendarDays, Plus, Trash2 } from "lucide-react";
import { Task, TaskPriority, TaskStatus, TaskCategory, DayOfWeek, Subtask, priorityList, statusList, categoryList, daysOfWeekList, createTaskId } from "@/lib/tasks";

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  daysOfWeek: DayOfWeek[];
  subtasks: Subtask[];
  deadline: string;
  status: TaskStatus;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  priority: "Medium",
  category: "Deadline",
  daysOfWeek: [],
  subtasks: [],
  deadline: "",
  status: "Todo"
};

export function TaskFormModal({
  isOpen,
  task,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (task: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category ?? "Deadline",
        daysOfWeek: task.daysOfWeek ?? [],
        subtasks: task.subtasks ?? [],
        deadline: task.deadline,
        status: task.status
      });
    } else {
      setForm(emptyForm);
    }
    setNewSubtaskTitle("");
  }, [task, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim()
    });
  }

  function addSubtask() {
    if (!newSubtaskTitle.trim()) return;
    setForm(current => ({
      ...current,
      subtasks: [
        ...current.subtasks,
        { id: createTaskId(), title: newSubtaskTitle.trim(), completed: false }
      ]
    }));
    setNewSubtaskTitle("");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            onSubmit={handleSubmit}
            onMouseDown={(event) => event.stopPropagation()}
            className="glass-panel w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
                  {task ? "Edit task" : "New task"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{task ? "Update work item" : "Capture next step"}</h2>
              </div>
              <button
                type="button"
                aria-label="Close task form"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ListTodo className="h-4 w-4 text-blue-300" />
                  Title
                </span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.07]"
                  placeholder="Write onboarding checklist"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.07]"
                  placeholder="Add useful detail, context, or acceptance notes."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <label>
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Flag className="h-4 w-4 text-violet-300" />
                    Priority
                  </span>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-850 px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                  >
                    {priorityList.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Folder className="h-4 w-4 text-amber-300" />
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as TaskCategory }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-850 px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                  >
                    {categoryList.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                <label className={form.category === "Daily" ? "opacity-50 pointer-events-none grayscale" : ""}>
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Calendar className="h-4 w-4 text-cyan-300" />
                    Deadline
                  </span>
                  <input
                    type="date"
                    value={form.category === "Daily" ? "" : form.deadline}
                    onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                    disabled={form.category === "Daily"}
                    className="w-full rounded-xl border border-white/10 bg-surface-850 px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                  />
                </label>

                <label>
                  <span className="mb-2 text-sm font-medium text-slate-300">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-850 px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                  >
                    {statusList.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <AnimatePresence mode="popLayout">
                {form.category === "Weekly" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block pt-2">
                      <span className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <CalendarDays className="h-4 w-4 text-emerald-300" />
                        Specific Days
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeekList.map((day) => {
                          const isSelected = form.daysOfWeek.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setForm((current) => ({
                                  ...current,
                                  daysOfWeek: isSelected
                                    ? current.daysOfWeek.filter((d) => d !== day)
                                    : [...current.daysOfWeek, day]
                                }));
                              }}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                isSelected
                                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subtasks Section */}
              <div className="pt-2">
                <span className="mb-2 text-sm font-medium text-slate-300">Subtasks</span>
                <div className="space-y-2 mb-3">
                  {form.subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-850 px-3 py-2">
                      <span className="flex-1 text-sm text-slate-200">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setForm(curr => ({...curr, subtasks: curr.subtasks.filter(s => s.id !== st.id)}))}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                    placeholder="Add a subtask..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.07]"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="rounded-xl bg-white/10 p-2.5 text-slate-300 hover:bg-white/20 hover:text-white transition"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
              >
                {task ? "Save changes" : "Add task"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
