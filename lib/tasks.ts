export type TaskStatus = "Todo" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskCategory = "Routine" | "Weekly" | "Deadline";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  daysOfWeek?: DayOfWeek[];
  subtasks?: Subtask[];
  deadline: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
};

export const statusList: TaskStatus[] = ["Todo", "In Progress", "Completed"];
export const priorityList: TaskPriority[] = ["Low", "Medium", "High"];
export const categoryList: TaskCategory[] = ["Routine", "Weekly", "Deadline"];
export const daysOfWeekList: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const statusAccent: Record<TaskStatus, string> = {
  Todo: "border-slate-700 bg-slate-900/60 text-slate-200",
  "In Progress": "border-blue-500/30 bg-blue-500/10 text-blue-200",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
};

export const priorityAccent: Record<TaskPriority, string> = {
  Low: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  Medium: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  High: "border-pink-400/30 bg-pink-400/10 text-pink-200"
};

export const seedTasks: Task[] = [];

export function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function calculateStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const todo = tasks.filter((task) => task.status === "Todo").length;
  const pending = total - completed;
  const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, inProgress, todo, completion };
}

export function getWeeklyProductivity(tasks: Task[]) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  return labels.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const completed = tasks.filter((task) => task.completedAt?.slice(0, 10) === key).length;
    const created = tasks.filter((task) => task.createdAt.slice(0, 10) === key).length;

    return {
      day,
      completed,
      created,
      focus: Math.max(completed * 18 + created * 8, index < 5 ? 18 + index * 6 : 10)
    };
  });
}

export function formatDeadline(deadline: string) {
  if (!deadline) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${deadline}T00:00:00`));
}
