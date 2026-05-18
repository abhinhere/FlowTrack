"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BellRing, BriefcaseBusiness, CircleDollarSign, Globe2, TrendingUp, UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { useMadeWebsTracker } from "@/hooks/useMadeWebsTracker";
import { formatCurrency, formatTrackerDate, getEmployeeStats, getPendingReminderCandidates, getUpcomingRenewals, monthlyRevenueData } from "@/lib/madewebs";

<<<<<<< HEAD
/** Returns today's short weekday name, e.g. "Mon" */
function getTodayShort() {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date());
}

/** Returns today as YYYY-MM-DD */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const { tasks, isHydrated, updateTask, setTaskStatus, addTask } = useTasks();
  const { incrementStreak } = useStreak();
  const { notify } = useToast();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Schedule background notifications for daily tasks
  useNotifications(tasks);

  const todayDay = getTodayShort();
  const today = todayStr();

  // ── Daily tasks ────────────────────────────────────────────────────────────
  const dailyTasks = useMemo(
    () => tasks.filter(t => t.category === "Daily" && t.status !== "Completed"),
    [tasks]
  );

  // ── Deadline tasks ─────────────────────────────────────────────────────────
  // Incomplete + completed-today (shown as green cards until tomorrow)
  const deadlineTasks = useMemo(
    () =>
      tasks.filter(t => {
        if (t.category !== "Deadline") return false;
        if (t.status !== "Completed") return true;
        // Keep visible if completed today
        return t.completedAt?.slice(0, 10) === today;
      }),
    [tasks, today]
  );

  // ── Weekly tasks (only if today is a scheduled day) ────────────────────────
  const weeklyTasks = useMemo(
    () =>
      tasks.filter(
        t =>
          t.category === "Weekly" &&
          t.daysOfWeek?.includes(todayDay as any) &&
          t.status !== "Completed"
      ),
    [tasks, todayDay]
  );

  // ── Overall progress (all 3 sections combined) ─────────────────────────────
  const allTodaysTasks = useMemo(
    () => [...dailyTasks, ...deadlineTasks, ...weeklyTasks],
    [dailyTasks, deadlineTasks, weeklyTasks]
  );

  const overallProgress = useMemo(() => {
    // Count from the raw tasks that are in today's scope
    const scopedTasks = tasks.filter(t => {
      if (t.category === "Daily") return true;
      if (t.category === "Weekly") return t.daysOfWeek?.includes(todayDay as any);
      if (t.category === "Deadline") return t.status !== "Completed" || t.completedAt?.slice(0, 10) === today;
      return false;
    });
    if (scopedTasks.length === 0) return 0;
    let completedWeight = 0;
    scopedTasks.forEach(task => {
      if (task.status === "Completed") {
        completedWeight += 1;
      } else if (task.subtasks && task.subtasks.length > 0) {
        completedWeight += task.subtasks.filter(st => st.completed).length / task.subtasks.length;
      }
    });
    return Math.round((completedWeight / scopedTasks.length) * 100);
  }, [tasks, todayDay, today]);

  // Increment streak at 100%
  useEffect(() => {
    if (overallProgress === 100 && tasks.length > 0) {
      incrementStreak();
    }
  }, [overallProgress, tasks.length, incrementStreak]);

  function handleComplete(id: string) {
    setTaskStatus(id, "Completed");
    notify({ title: "Task completed!", description: "Great job keeping your flow going 🔥" });
  }

  const noop = () => {};

  function handleAddTask(input: Parameters<typeof addTask>[0]) {
    addTask(input);
    notify({ title: "Task added" });
    setIsModalOpen(false);
    setEditingTask(null);
  }

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const hasAnyTask = dailyTasks.length > 0 || deadlineTasks.length > 0 || weeklyTasks.length > 0;

  return (
    <AppShell title="Home" eyebrow={user ? `Hi, ${firstName}` : "Today's Flow"}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">

          {/* ── Progress card ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/20 text-pink-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Daily Progress</h3>
                  <p className="text-xs text-slate-400">Your overall completion for today</p>
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

          {/* ── Empty state ── */}
          {!hasAnyTask && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-300">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-white">No tasks for today</p>
                <p className="mt-1 text-sm text-slate-500">Add a task to start building your flow</p>
              </div>
              <button
                onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          )}

          {/* ── Daily Tasks section ── */}
          <AnimatePresence>
            {dailyTasks.length > 0 && (
              <motion.section
                key="daily-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-300">
                    <Sun className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Daily Tasks</h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {dailyTasks.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dailyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Deadline Tasks section ── */}
          <AnimatePresence>
            {deadlineTasks.length > 0 && (
              <motion.section
                key="deadline-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Deadline Tasks</h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {deadlineTasks.filter(t => t.status !== "Completed").length} remaining
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deadlineTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Weekly Checklist section ── */}
          <AnimatePresence>
            {weeklyTasks.length > 0 && (
              <motion.section
                key="weekly-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    Today's Weekly Checklist
                    <span className="ml-2 text-xs font-normal text-slate-500">({todayDay})</span>
                  </h2>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                    {weeklyTasks.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {weeklyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={noop}
                      onDelete={noop}
                      onComplete={handleComplete}
                      onUpdateTask={updateTask}
                      readOnly={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Quick Add Button at bottom ── */}
          {hasAnyTask && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/40 transition shadow-sm"
              >
                <Plus className="h-4 w-4 text-blue-400" />
                Add New Task
              </button>
            </div>
          )}

        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </AppShell>
  );
=======
const statusColors: Record<string, string> = { Planning: "#38bdf8", "In Progress": "#3b82f6", Review: "#f59e0b", Completed: "#22c55e", Blocked: "#ef4444" };

export default function DashboardPage() {
  const { employees, projects, reminders, notifications, isHydrated } = useMadeWebsTracker();
  if (!isHydrated) return <AppShell title="Dashboard" eyebrow="MadeWebs command center"><LoadingState /></AppShell>;
  const upcomingRenewals = getUpcomingRenewals(projects);
  const pendingReminderCandidates = getPendingReminderCandidates(projects);
  const totalRevenue = projects.reduce((sum, project) => sum + project.revenue, 0);
  const completedWorks = projects.reduce((sum, project) => sum + project.completedWorks, 0);
  const statusData = Object.entries(projects.reduce<Record<string, number>>((acc, project) => { acc[project.status] = (acc[project.status] ?? 0) + 1; return acc; }, {})).map(([status, count]) => ({ status, count }));
  const employeePerformance = employees.map((employee) => ({ employee, stats: getEmployeeStats(employee.id, projects) }));
  return <AppShell title="Dashboard" eyebrow="MadeWebs command center"><div className="space-y-6"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={BriefcaseBusiness} label="Active projects" value={String(projects.filter((p) => p.status !== "Completed").length)} /><StatCard icon={Globe2} label="Upcoming renewals" value={String(upcomingRenewals.length)} tone="warning" /><StatCard icon={BellRing} label="Pending reminders" value={String(pendingReminderCandidates.length)} tone="danger" /><StatCard icon={CircleDollarSign} label="Tracked revenue" value={formatCurrency(totalRevenue)} tone="success" /></section><section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><ChartPanel title="Monthly Revenue" subtitle={`${completedWorks} completed works across assigned projects`} icon={TrendingUp}><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyRevenueData}><CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} /><XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} /><YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} /><Tooltip contentStyle={{ background: "#11141d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} formatter={(value) => formatCurrency(Number(value))} /><Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#22d3ee" }} /></LineChart></ResponsiveContainer></ChartPanel><ChartPanel title="Active Projects" subtitle="Status spread for live delivery" icon={BriefcaseBusiness}><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} /><XAxis dataKey="status" stroke="#64748b" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#11141d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{statusData.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status] ?? "#3b82f6"} />)}</Bar></BarChart></ResponsiveContainer></ChartPanel></section><section className="grid gap-4 xl:grid-cols-3"><Panel title="Upcoming Domain Renewals" icon={Globe2}>{upcomingRenewals.length ? upcomingRenewals.map((project) => <AlertRow key={project.id} title={project.domain?.domainName ?? project.name} detail={`${project.clientName} · ${formatTrackerDate(project.domain?.renewalDate ?? project.deadline)}`} badge={project.domain?.status ?? "Due Soon"} />) : <EmptyPanelText>No renewals due within 5 days.</EmptyPanelText>}</Panel><Panel title="Pending Reminders" icon={BellRing}>{pendingReminderCandidates.length ? pendingReminderCandidates.slice(0, 5).map(({ project, type, dueDate }) => <AlertRow key={`${project.id}-${type}`} title={type} detail={`${project.name} · ${formatTrackerDate(dueDate)}`} badge="Pending" />) : <EmptyPanelText>No pending reminder triggers.</EmptyPanelText>}</Panel><Panel title="Notification Center" icon={AlertTriangle}>{notifications.slice(0, 5).map((notification) => <AlertRow key={notification.id} title={notification.title} detail={notification.description} badge={notification.tone} />)}</Panel></section><section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-card"><div className="mb-4 flex items-center gap-2"><UsersRound className="h-5 w-5 text-blue-300" /><h2 className="text-base font-semibold text-white">Employee Performance</h2></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{employeePerformance.map(({ employee, stats }) => <div key={employee.id} className="rounded-xl border border-white/10 bg-surface-850 p-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/15 text-xs font-bold text-blue-100">{employee.avatar}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{employee.name}</p><p className="truncate text-xs text-slate-500">{employee.role}</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-950"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${stats.completionRate}%` }} /></div><p className="mt-2 text-xs text-slate-400">{stats.completionRate}% completion · {formatCurrency(stats.revenueGenerated)}</p></div>)}</div></section></div></AppShell>;
>>>>>>> 4b272b696ce641828a1b4afb69d1e9d0ee8d5ff8
}
function StatCard({ icon: Icon, label, value, tone = "info" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone?: "info" | "warning" | "danger" | "success" }) { const toneClass = { info: "text-blue-300 bg-blue-500/10", warning: "text-amber-300 bg-amber-500/10", danger: "text-rose-300 bg-rose-500/10", success: "text-emerald-300 bg-emerald-500/10" }[tone]; return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-card"><div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div>; }
function ChartPanel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-card"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold text-white">{title}</h2><p className="text-sm text-slate-400">{subtitle}</p></div><Icon className="h-5 w-5 text-blue-300" /></div><div className="h-72">{children}</div></div>; }
function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-card"><div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-blue-300" /><h2 className="text-sm font-semibold text-white">{title}</h2></div><div className="space-y-2">{children}</div></div>; }
function AlertRow({ title, detail, badge }: { title: string; detail: string; badge: string }) { return <div className="rounded-xl border border-white/10 bg-surface-850 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{detail}</p></div><span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">{badge}</span></div></div>; }
function EmptyPanelText({ children }: { children: React.ReactNode }) { return <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-slate-500">{children}</p>; }
