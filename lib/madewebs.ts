export type ReminderType = "Deadline" | "Pending Review" | "Payment Pending" | "Revision";
export type ReminderStatus = "Queued" | "Sent" | "Failed";
export type RenewalStatus = "Active" | "Due Soon" | "Renewed" | "Expired";
export type ProjectStatus = "Planning" | "In Progress" | "Review" | "Completed" | "Blocked";
export type ProjectKind = "Website" | "Marketing" | "Maintenance" | "App";

export type Employee = { id: string; name: string; role: string; email: string; phone: string; avatar: string };
export type ActivityLog = { id: string; employeeId: string; projectId?: string; message: string; createdAt: string };
export type DomainRenewal = { domainName: string; hostingProvider: string; renewalDate: string; clientEmail: string; clientPhone: string; status: RenewalStatus };
export type Project = {
  id: string; name: string; clientName: string; kind: ProjectKind; assignedEmployeeIds: string[];
  status: ProjectStatus; deadline: string; reviewDue?: string; paymentDue?: string; revenue: number;
  completedWorks: number; pendingTasks: string[]; domain?: DomainRenewal; activityLogs: ActivityLog[];
};
export type Reminder = {
  id: string; projectId: string; employeeId?: string; type: ReminderType; recipientEmail: string;
  recipientName: string; subject: string; message: string; status: ReminderStatus; createdAt: string; sentAt?: string;
};
export type TrackerNotification = { id: string; title: string; description: string; tone: "info" | "warning" | "success" | "danger"; createdAt: string; read: boolean; href?: string };

export const reminderTypes: ReminderType[] = ["Deadline", "Pending Review", "Payment Pending", "Revision"];
export const teamMembers: Employee[] = [
  { id: "abhin", name: "Abhin", role: "Founder & Marketing Manager", email: "abhin@madewebs.in", phone: "+91 98765 21001", avatar: "AB" },
  { id: "amarnath", name: "Amarnath", role: "Lead Developer", email: "amarnath@madewebs.in", phone: "+91 98765 21002", avatar: "AM" },
  { id: "arjun-b", name: "Arjun B", role: "Developer", email: "arjun@madewebs.in", phone: "+91 98765 21003", avatar: "AR" },
  { id: "jomin", name: "Jomin", role: "Developer", email: "jomin@madewebs.in", phone: "+91 98765 21004", avatar: "JO" },
  { id: "shibili", name: "Shibili", role: "Developer", email: "shibili@madewebs.in", phone: "+91 98765 21005", avatar: "SH" }
];

export const seedProjects: Project[] = [
  { id: "project-nova", name: "Nova Dental Website", clientName: "Dr. Nisha Kumar", kind: "Website", assignedEmployeeIds: ["amarnath", "arjun-b"], status: "In Progress", deadline: "2026-05-28", reviewDue: "2026-05-23", paymentDue: "2026-05-25", revenue: 68000, completedWorks: 18, pendingTasks: ["Treatment pages", "Appointment form QA", "Speed pass"], domain: { domainName: "novadentalcare.in", hostingProvider: "Hostinger", renewalDate: "2026-05-23", clientEmail: "admin@novadentalcare.in", clientPhone: "+91 94470 11223", status: "Due Soon" }, activityLogs: [{ id: "log-nova-1", employeeId: "amarnath", projectId: "project-nova", message: "Completed responsive homepage sections and review notes.", createdAt: "2026-05-17T10:30:00.000Z" }] },
  { id: "project-aura", name: "Aura Interiors Landing", clientName: "Aura Interiors", kind: "Website", assignedEmployeeIds: ["jomin"], status: "Review", deadline: "2026-05-22", reviewDue: "2026-05-20", paymentDue: "2026-05-24", revenue: 42000, completedWorks: 14, pendingTasks: ["Client copy approval", "Gallery image compression"], domain: { domainName: "aurainteriors.co", hostingProvider: "Cloudflare", renewalDate: "2026-06-06", clientEmail: "hello@aurainteriors.co", clientPhone: "+91 94470 11888", status: "Active" }, activityLogs: [{ id: "log-aura-1", employeeId: "jomin", projectId: "project-aura", message: "Shared staging link and collected first round feedback.", createdAt: "2026-05-16T14:15:00.000Z" }] },
  { id: "project-saffron", name: "Saffron Bistro Campaign", clientName: "Saffron Bistro", kind: "Marketing", assignedEmployeeIds: ["abhin", "shibili"], status: "In Progress", deadline: "2026-05-31", reviewDue: "2026-05-27", paymentDue: "2026-06-02", revenue: 36000, completedWorks: 9, pendingTasks: ["Ad creatives", "Meta audience split", "Weekly report"], activityLogs: [{ id: "log-saffron-1", employeeId: "abhin", projectId: "project-saffron", message: "Campaign strategy locked with two launch audiences.", createdAt: "2026-05-17T16:45:00.000Z" }] },
  { id: "project-metro", name: "Metro Legal Maintenance", clientName: "Metro Legal Associates", kind: "Maintenance", assignedEmployeeIds: ["amarnath", "shibili"], status: "Completed", deadline: "2026-05-12", reviewDue: "2026-05-11", paymentDue: "2026-05-18", revenue: 24500, completedWorks: 11, pendingTasks: [], domain: { domainName: "metrolegal.in", hostingProvider: "GoDaddy", renewalDate: "2026-05-21", clientEmail: "accounts@metrolegal.in", clientPhone: "+91 94470 11999", status: "Due Soon" }, activityLogs: [{ id: "log-metro-1", employeeId: "shibili", projectId: "project-metro", message: "Patched CMS, renewed SSL, and delivered completion summary.", createdAt: "2026-05-12T12:00:00.000Z" }] },
  { id: "project-lumen", name: "Lumen Academy Portal", clientName: "Lumen Academy", kind: "App", assignedEmployeeIds: ["amarnath", "arjun-b", "jomin"], status: "Planning", deadline: "2026-06-14", reviewDue: "2026-06-01", paymentDue: "2026-06-10", revenue: 125000, completedWorks: 5, pendingTasks: ["Schema design", "Parent dashboard", "Payment flow"], activityLogs: [{ id: "log-lumen-1", employeeId: "arjun-b", projectId: "project-lumen", message: "Prepared module breakdown and first API contract draft.", createdAt: "2026-05-18T08:20:00.000Z" }] }
];

export const monthlyRevenueData = [{ month: "Jan", revenue: 82000 }, { month: "Feb", revenue: 104000 }, { month: "Mar", revenue: 96000 }, { month: "Apr", revenue: 138000 }, { month: "May", revenue: 171500 }, { month: "Jun", revenue: 125000 }];
export function createTrackerId(prefix: string) { return typeof crypto !== "undefined" && "randomUUID" in crypto ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function formatCurrency(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
export function daysUntil(date: string) { const today = new Date(); today.setHours(0, 0, 0, 0); return Math.ceil((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000); }
export function formatTrackerDate(date: string) { return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`)); }
export function getEmployeeProjects(projects: Project[], employeeId: string) { return projects.filter((project) => project.assignedEmployeeIds.includes(employeeId)); }
export function getEmployeeStats(employeeId: string, projects: Project[]) {
  const assignedProjects = getEmployeeProjects(projects, employeeId);
  const completedProjects = assignedProjects.filter((project) => project.status === "Completed");
  const pendingTasks = assignedProjects.flatMap((project) => project.pendingTasks.map((task) => ({ projectId: project.id, projectName: project.name, task })));
  const totalCompletedWorks = assignedProjects.reduce((sum, project) => sum + project.completedWorks, 0);
  const revenueGenerated = assignedProjects.reduce((sum, project) => sum + project.revenue / Math.max(project.assignedEmployeeIds.length, 1), 0);
  const deadlines = assignedProjects.filter((project) => project.status !== "Completed").map((project) => ({ projectId: project.id, projectName: project.name, deadline: project.deadline })).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const activityLogs = assignedProjects.flatMap((project) => project.activityLogs).filter((log) => log.employeeId === employeeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const completionRate = assignedProjects.length > 0 ? Math.round((completedProjects.length / assignedProjects.length) * 100) : 0;
  return { assignedProjects, completedProjects, pendingTasks, deadlines, activityLogs, totalCompletedWorks, revenueGenerated, completionRate };
}
export function getRenewalProjects(projects: Project[]) { return projects.filter((project) => project.domain); }
export function getUpcomingRenewals(projects: Project[], windowDays = 5) { return getRenewalProjects(projects).filter((project) => { const days = daysUntil(project.domain?.renewalDate ?? ""); return days >= 0 && days <= windowDays && project.domain?.status !== "Renewed"; }).sort((a, b) => (a.domain?.renewalDate ?? "").localeCompare(b.domain?.renewalDate ?? "")); }
export function getPendingReminderCandidates(projects: Project[]) {
  return projects.flatMap((project) => {
    const reminders: Array<{ project: Project; type: ReminderType; dueDate: string }> = [];
    if (project.status !== "Completed" && daysUntil(project.deadline) <= 5) reminders.push({ project, type: "Deadline", dueDate: project.deadline });
    if (project.reviewDue && project.status === "Review") reminders.push({ project, type: "Pending Review", dueDate: project.reviewDue });
    if (project.paymentDue && daysUntil(project.paymentDue) <= 7) reminders.push({ project, type: "Payment Pending", dueDate: project.paymentDue });
    if (project.pendingTasks.some((task) => task.toLowerCase().includes("revision"))) reminders.push({ project, type: "Revision", dueDate: project.deadline });
    return reminders;
  });
}
export function buildDashboardNotifications(projects: Project[], reminders: Reminder[]): TrackerNotification[] {
  const renewalAlerts = getUpcomingRenewals(projects).map((project) => ({ id: `renewal-${project.id}`, title: `Renew ${project.domain?.domainName}`, description: `${project.clientName} expires on ${formatTrackerDate(project.domain?.renewalDate ?? project.deadline)}.`, tone: "warning" as const, createdAt: new Date().toISOString(), read: false, href: "/renewals" }));
  const deadlineAlerts = projects.filter((project) => project.status !== "Completed" && daysUntil(project.deadline) <= 3).map((project) => ({ id: `deadline-${project.id}`, title: `${project.name} deadline approaching`, description: `${daysUntil(project.deadline)} day(s) left for delivery.`, tone: "danger" as const, createdAt: new Date().toISOString(), read: false, href: "/projects" }));
  const reminderAlerts = reminders.slice(0, 4).map((reminder) => ({ id: `reminder-${reminder.id}`, title: `${reminder.type} reminder ${reminder.status.toLowerCase()}`, description: `${reminder.recipientName} was contacted about ${reminder.subject}.`, tone: reminder.status === "Sent" ? ("success" as const) : ("info" as const), createdAt: reminder.createdAt, read: false, href: "/projects" }));
  return [...renewalAlerts, ...deadlineAlerts, ...reminderAlerts].slice(0, 12);
}
export function buildReminderEmail(project: Project, employee: Employee, type: ReminderType) {
  const subjectMap: Record<ReminderType, string> = { Deadline: `Deadline Reminder - ${project.name}`, "Pending Review": `Pending Review Reminder - ${project.name}`, "Payment Pending": `Payment Pending - ${project.name}`, Revision: `Revision Reminder - ${project.name}` };
  const messageMap: Record<ReminderType, string> = { Deadline: `Please prioritize ${project.name}. The delivery deadline is ${formatTrackerDate(project.deadline)}.`, "Pending Review": `${project.name} is waiting for review. Please close feedback or update the tracker today.`, "Payment Pending": `Payment follow-up is pending for ${project.clientName}. Please coordinate the next update.`, Revision: `A revision reminder is open for ${project.name}. Please clear the revision queue before the deadline.` };
  return { recipientEmail: employee.email, recipientName: employee.name, subject: subjectMap[type], message: `Hello ${employee.name},\n\n${messageMap[type]}\n\nProject: ${project.name}\nClient: ${project.clientName}\n\nThank you,\nMadeWebs Team` };
}
export function buildDomainRenewalEmail(project: Project) {
  const renewalDate = formatTrackerDate(project.domain?.renewalDate ?? project.deadline);
  const domainName = project.domain?.domainName ?? project.name;
  return { recipientEmail: project.domain?.clientEmail ?? "", recipientName: project.clientName, subject: `Domain Renewal Reminder - ${domainName}`, message: `Hello ${project.clientName},\n\nYour website domain ${domainName} is scheduled for renewal on ${renewalDate}.\n\nTo avoid website downtime or service interruption, please renew the domain before the expiry date.\n\nIf you need assistance, feel free to contact MadeWebs.\n\nThank you,\nMadeWebs Team` };
}
