"use client";

import {
  Bell, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download,
  Ellipsis, FileUp, Gauge, LayoutDashboard, Mail, Menu, MessageSquare, MoreHorizontal,
  Pause, Play, Plus, Search, Settings, SlidersHorizontal, Square, Target, UserPlus,
  Users, X, Zap,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Page = "dashboard" | "tasks" | "calendar" | "analytics" | "team" | "settings" | "help";
type TaskStatus = "todo" | "progress" | "review" | "done";
type Accent = "forest" | "ocean" | "plum" | "ember";
type Task = { id: string; title: string; status: TaskStatus; tag: string; priority: string; due: string; comments: number; assignee: string };
type Member = [string, string, string, string, number, number, number, string];

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: Check },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: Gauge },
  { id: "team", label: "Team", icon: Users },
];

const taskSeed: Task[] = [
  { id: "t1", title: "Saved filters for projects", status: "todo", tag: "Frontend", priority: "Medium", due: "In 6 days", comments: 2, assignee: "HK" },
  { id: "t2", title: "Write API endpoint docs", status: "todo", tag: "Backend", priority: "Low", due: "In 9 days", comments: 1, assignee: "MS" },
  { id: "t3", title: "Onboarding email sequence", status: "todo", tag: "Marketing", priority: "Low", due: "In 12 days", comments: 0, assignee: "LR" },
  { id: "t4", title: "Cut LCP under 2 seconds", status: "todo", tag: "Frontend", priority: "High", due: "In 5 days", comments: 3, assignee: "OM" },
  { id: "t5", title: "Design login & sign-up screens", status: "progress", tag: "Design", priority: "High", due: "In 2 days", comments: 4, assignee: "PR" },
  { id: "t6", title: "Passkey sign-in", status: "progress", tag: "Backend", priority: "High", due: "In 3 days", comments: 7, assignee: "MS" },
  { id: "t7", title: "Marketing site refresh", status: "progress", tag: "Frontend", priority: "Medium", due: "In 4 days", comments: 3, assignee: "OM" },
  { id: "t8", title: "Q4 launch announcement", status: "progress", tag: "Marketing", priority: "Medium", due: "In 8 days", comments: 1, assignee: "NB" },
  { id: "t9", title: "Safari & Firefox regression pass", status: "review", tag: "QA", priority: "Medium", due: "Tomorrow", comments: 5, assignee: "SS" },
  { id: "t10", title: "Brand illustration set", status: "review", tag: "Design", priority: "Medium", due: "In 2 days", comments: 6, assignee: "MK" },
  { id: "t11", title: "Monorepo cleanup", status: "done", tag: "Backend", priority: "Low", due: "Oct 4", comments: 2, assignee: "PR" },
  { id: "t12", title: "Dashboard analytics widgets", status: "done", tag: "Frontend", priority: "High", due: "Oct 5", comments: 9, assignee: "HK" },
  { id: "t13", title: "Kickoff with Halcyon Labs", status: "done", tag: "Marketing", priority: "Medium", due: "Oct 3", comments: 4, assignee: "NC" },
];

const members: Member[] = [
  ["NC", "Noah Castell", "Project Lead", "Management", 0, 48, 64, "#f4c9b4"],
  ["PR", "Priya Raman", "Product Designer", "Design", 1, 39, 72, "#f6c6c2"],
  ["MS", "Mateo Silva", "Backend Engineer", "Engineering", 2, 51, 88, "#cdeccf"],
  ["HK", "Hana Kobayashi", "Frontend Engineer", "Engineering", 2, 33, 56, "#cfd6f7"],
  ["OM", "Owen Mercer", "Frontend Engineer", "Engineering", 2, 42, 79, "#f8e2ad"],
  ["SS", "Sofia Sato", "QA Engineer", "Engineering", 1, 27, 41, "#e5d3f5"],
  ["MK", "Maya Kovac", "Brand Designer", "Design", 2, 24, 50, "#c6e8f0"],
  ["LR", "Liam Reyes", "Marketing Lead", "Marketing", 1, 30, 67, "#f6dcb3"],
  ["NB", "Nadia Bello", "Content Strategist", "Marketing", 2, 19, 35, "#dceec9"],
];

const chartData = [
  { day: "Sep 7", value: 7.8, previous: 7.2 }, { day: "Sep 10", value: 7.1, previous: 7.5 },
  { day: "Sep 14", value: 6.8, previous: 7.0 }, { day: "Sep 17", value: 7.3, previous: 7.4 },
  { day: "Sep 22", value: 7.7, previous: 7.1 }, { day: "Sep 26", value: 7.3, previous: 7.7 },
  { day: "Sep 29", value: 8.0, previous: 7.4 }, { day: "Oct 6", value: 7.6, previous: 7.9 },
];

const stageLabels: Record<TaskStatus, string> = { todo: "To do", progress: "In progress", review: "In review", done: "Done" };
const stageColors: Record<TaskStatus, string> = { todo: "#8d9a92", progress: "#e8a317", review: "#3b5bdb", done: "#27865a" };

type WorkspaceContextValue = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projects: string[];
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
  members: ReadonlyArray<Member>;
  setMembers: React.Dispatch<React.SetStateAction<ReadonlyArray<Member>>>;
  searchQuery: string;
  notify: (message: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("Workspace context is missing");
  return context;
}

function Avatar({ initials, color = "#cdeccf", large = false }: { initials: string; color?: string; large?: boolean }) {
  return <span className={`avatar ${large ? "avatar-lg" : ""}`} style={{ background: color }}>{initials}</span>;
}

function Button({ children, variant = "primary", onClick, className = "", type = "button" }: { children: React.ReactNode; variant?: "primary" | "ghost"; onClick?: () => void; className?: string; type?: "button" | "submit" }) {
  return <button type={type} className={`btn btn-${variant} ${className}`} onClick={onClick}>{children}</button>;
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header" data-reveal><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Sidebar({ page, setPage, open, close }: { page: Page; setPage: (page: Page) => void; open: boolean; close: () => void }) {
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>(".nav-link.active");
    const rail = navRef.current?.querySelector<HTMLElement>(".nav-rail");
    if (!active || !rail) return;
    gsap.to(rail, { y: active.offsetTop, height: active.offsetHeight, duration: 0.48, ease: "power3.out", overwrite: true });
  }, [page]);
  return <>
    <div className={`scrim ${open ? "on" : ""}`} onClick={close} />
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand-row"><span className="brand-mark">⌁</span><span className="brand-name">Fernly</span><button className="icon-btn mobile-only" aria-label="Close menu" onClick={close}><X size={20} /></button></div>
      <div className="sidebar-navs" ref={navRef}>
        <span className="nav-rail" aria-hidden="true" />
        <div className="nav-label">Menu</div>
        <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${page === id ? "active" : ""}`} onClick={() => { setPage(id); close(); }}><Icon size={19} /><span>{label}</span>{id === "tasks" && <b>10</b>}</button>)}</nav>
        <div className="nav-label general-label">General</div>
        <nav>
          <button className={`nav-link ${page === "settings" ? "active" : ""}`} onClick={() => { setPage("settings"); close(); }}><Settings size={19} /><span>Settings</span></button>
          <button className={`nav-link ${page === "help" ? "active" : ""}`} onClick={() => { setPage("help"); close(); }}><CircleHelp size={19} /><span>Help</span></button>
          <button className="nav-link"><LogOutIcon /><span>Logout</span></button>
        </nav>
      </div>
      <div className="promo"><span className="promo-icon">◫</span><strong>Fernly for iOS & Android</strong><small>Your board, in your pocket</small><button>Download</button></div>
    </aside>
  </>;
}

function LogOutIcon() { return <span className="logout-icon">↪</span>; }

function Topbar({ page, openMenu, onNotifications, notificationsOpen, onSearch, searchRef, onProfile, onMessages }: { page: Page; openMenu: () => void; onNotifications: () => void; notificationsOpen: boolean; onSearch: (value: string) => void; searchRef: React.RefObject<HTMLInputElement | null>; onProfile: () => void; onMessages: () => void }) {
  const placeholders: Record<Page, string> = { dashboard: "Search projects & people", tasks: "Search tasks", calendar: "Search tasks (press Enter to open Tasks)", analytics: "Search tasks (press Enter to open Tasks)", team: "Search people", settings: "Search tasks (press Enter to open Tasks)", help: "Search help articles" };
  return <header className="topbar">
    <button className="icon-btn menu-trigger" aria-label="Open menu" onClick={openMenu}><Menu size={21} /></button>
    <div className="search"><Search size={19} /><input ref={searchRef} aria-label={placeholders[page]} placeholder={placeholders[page]} onChange={(e) => onSearch(e.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && ["calendar", "analytics", "settings"].includes(page)) window.location.hash = "tasks"; }} /><kbd>Ctrl K</kbd></div>
    <button className="icon-btn round" aria-label="Messages" onClick={onMessages}><Mail size={19} /><i /></button>
    <div className="notification-wrap"><button className="icon-btn round" aria-label="Notifications" onClick={onNotifications}><Bell size={19} /><i /></button>{notificationsOpen && <NotificationTray />}</div>
    <button className="profile-chip" aria-label="Account settings" onClick={onProfile}><Avatar initials="NC" color="#f4c9b4" /><span className="desktop-only">Noah Castell</span></button>
  </header>;
}

function NotificationTray() {
  const items = [["MS", "Mateo Silva moved Passkey sign-in to In progress", "5m ago", "#cdeccf"], ["SS", "Sofia Sato commented on Safari & Firefox regression pass", "32m ago", "#e5d3f5"], ["PR", "Priya Raman shared Login screens v3 for review", "1h ago", "#f6c6c2"]];
  return <div className="tray motion-pop" data-reveal><div className="tray-head"><strong>Notifications</strong><button>Mark all read</button></div>{items.map(([initials, text, age, color], index) => <div className="notification" data-motion-item key={text} style={{ "--motion-delay": `${index * 45}ms` } as React.CSSProperties}><Avatar initials={initials} color={color} /><span>{text}<small>{age}</small></span></div>)}</div>;
}

function SegmentedControl({ items, value, onChange, className = "" }: { items: string[]; value: string; onChange: (value: string) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = ref.current?.querySelector<HTMLElement>("button.selected");
    const pill = ref.current?.querySelector<HTMLElement>(".segment-pill");
    if (!active || !pill) return;
    gsap.to(pill, { x: active.offsetLeft, width: active.offsetWidth, duration: 0.42, ease: "power3.out", overwrite: true });
  }, [value]);
  return <div ref={ref} className={`segmented has-pill ${className}`}><span className="segment-pill" aria-hidden="true" />{items.map((item) => <button key={item} className={value === item ? "selected" : ""} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

function StatCard({ title, value, note, accent = false }: { title: string; value: string; note: string; accent?: boolean }) {
  return <article className={`stat-card ${accent ? "accent" : ""}`} data-reveal><div className="card-title">{title}<span className="circle-arrow">↗</span></div><strong>{value}</strong><small>{note}</small></article>;
}

function Dashboard({ openDialog }: { openDialog: (type: "project" | "member" | "task") => void }) {
  const [meeting, setMeeting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const { projects, notify, searchQuery } = useWorkspace();
  const visibleProjects = projects.filter((project) => project.toLowerCase().includes(searchQuery.toLowerCase()));
  useEffect(() => { if (!timerRunning) return; const id = window.setInterval(() => setTimer((v) => v + 1), 1000); return () => window.clearInterval(id); }, [timerRunning]);
  return <div className="view dashboard-view">
    <PageHeader title="Dashboard" description="Everything your team is shipping, in one calm place." action={<div className="header-actions"><Button onClick={() => openDialog("project")}><Plus size={18} />Add Project</Button><Button variant="ghost" onClick={() => notify("Import is available for CSV project data.")}><FileUp size={18} />Import Data</Button></div>} />
    <div className="stat-grid"><StatCard title="Total Projects" value="24" note="↗ 5  Increased from last month" accent /><StatCard title="Ended Projects" value="10" note="↗ 6  Increased from last month" /><StatCard title="Running Projects" value="12" note="↗ 2  Increased from last month" /><StatCard title="Pending Projects" value="2" note="Awaiting review" /></div>
    <div className="dashboard-lower">
      <section className="card analytics-preview dashboard-analytics" data-reveal><div className="section-title"><h2>Project Analytics</h2><span>Daily goal completion this week.</span></div><div className="bars">{[60, 86, 74, 96, 95, 70, 85].map((n, i) => <div className={`bar-col ${i === 0 || i > 3 ? "planned" : ""}`} key={i}><div className="bar" data-motion-bar style={{ height: `${n}%` }}>{n === 74 && <b>74%</b>}</div><small>{["S", "M", "T", "W", "T", "F", "S"][i]}</small></div>)}</div></section>
      <section className="card reminder dash-reminder" data-reveal><div className="section-title"><h2>Reminders</h2><span>Today</span></div><strong>Check-in with Halcyon Labs</strong><p><Clock3 size={15} />02.00 pm – 04.00 pm</p><Button onClick={() => setMeeting((v) => !v)}>{meeting ? <><span className="pulse-dot" />Leave Meeting · 00:36</> : <><VideoIcon />Start Meeting</>}</Button></section>
      <div className="dashboard-side">
        <section className="card project-list dash-project" data-reveal><div className="section-title"><h2>Project</h2><button className="link-btn" onClick={() => openDialog("project")}>New</button></div>{visibleProjects.map((p, i) => <div className="project-row" key={p}><span>{p}</span><small>Due date: {(["Oct 8, 2026", "Oct 12, 2026", "Oct 15, 2026", "Oct 20, 2026", "Oct 22, 2026"][i] || "Oct 30, 2026")}</small></div>)}</section>
        <section className="card tracker dash-tracker" data-reveal><div className="section-title"><h2>Time Tracker</h2><span>{String(Math.floor(timer / 3600)).padStart(2, "0")}:{String(Math.floor(timer / 60) % 60).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</span></div><div className="tracker-display">{String(Math.floor(timer / 3600)).padStart(2, "0")}:{String(Math.floor(timer / 60) % 60).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</div><div className="tracker-controls"><button className="timer-btn" aria-label={timerRunning ? "Pause timer" : "Start timer"} onClick={() => setTimerRunning((v) => !v)}>{timerRunning ? <Pause size={18} /> : <Play size={18} />}</button><button className="timer-btn stop" aria-label="Stop and reset timer" onClick={() => { setTimer(0); setTimerRunning(false); }}><Square size={16} /></button></div></section>
      </div>
      <section className="card team-preview dash-team" data-reveal><div className="section-title"><h2>Team Collaboration</h2><button className="link-btn" onClick={() => openDialog("member")}><UserPlus size={15} />Add Member</button></div>{members.slice(1, 5).map(([initials, name, , , , , , color], i) => <div className="collab-row" key={name}><Avatar initials={initials} color={color} /><span><b>{name}</b><small>Working on { ["Design System Tokens", "Passkey Sign-in", "Saved Filters for Projects", "Marketing Site Refresh"][i] }</small></span><em>{["Completed", "In Progress", "Pending", "In Progress"][i]}</em></div>)}</section>
      <section className="card progress-card dash-progress" data-reveal><div className="section-title"><h2>Project Progress</h2></div><div className="gauge" data-motion-gauge><div><strong>42%</strong><small>Project Ended</small></div></div><div className="legend"><span><i className="green" />Completed</span><span><i className="mint" />In Progress</span><span><i className="amber" />Pending</span></div></section>
    </div>
  </div>;
}

function VideoIcon() { return <span className="video-icon">◉</span>; }

function TaskCard({ task, onMove }: { task: Task; onMove: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { status: task.status } });
  const [menuOpen, setMenuOpen] = useState(false);
  return <article ref={setNodeRef} {...listeners} {...attributes} className={`task-card ${isDragging ? "dragging" : ""}`} style={{ transform: CSS.Translate.toString(transform) }}><div className="task-meta"><span className={`tag tag-${task.tag.toLowerCase()}`}>{task.tag}</span><span className={`priority priority-${task.priority.toLowerCase()}`}>⚑ {task.priority}</span><button className="task-menu-button" aria-label={`Move ${task.title}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setMenuOpen((value) => !value); }}><Ellipsis size={16} /></button></div><h3>{task.title}</h3><div className="task-meter"><span style={{ width: `${task.priority === "High" ? 78 : task.priority === "Medium" ? 54 : 28}%` }} /></div><div className="task-footer"><span><Clock3 size={14} />{task.due}</span><span><MessageSquare size={14} />{task.comments}</span><Avatar initials={task.assignee} /></div>{menuOpen && <div className="task-menu motion-menu" onPointerDown={(event) => event.stopPropagation()}><small>Move to</small>{(Object.keys(stageLabels) as TaskStatus[]).map((status) => <button key={status} disabled={status === task.status} onClick={() => { onMove({ ...task, status }); setMenuOpen(false); }}>{stageLabels[status]}{status === task.status ? " · current" : ""}</button>)}</div>}</article>;
}

function TaskColumn({ status, tasks, onMove }: { status: TaskStatus; tasks: Task[]; onMove: (task: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`task-column ${isOver ? "over" : ""}`}><div className="column-title"><span><i style={{ background: stageColors[status] }} />{stageLabels[status]}</span><b>{tasks.length}</b></div>{tasks.length ? tasks.map((task) => <TaskCard key={task.id} task={task} onMove={onMove} />) : <div className="drop-empty">Drop a task here</div>}</section>;
}

function Tasks({ openDialog }: { openDialog: (type: "project" | "member" | "task") => void }) {
  const [filter, setFilter] = useState("All");
  const { tasks, setTasks, searchQuery, notify } = useWorkspace();
  const filtered = tasks.filter((task) => (filter === "All" || (filter === "My tasks" && task.assignee === "NC") || (filter === "High priority" && task.priority === "High") || (filter === "Due this week" && !task.due.includes("Oct"))) && task.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const moveTask = (task: Task) => { setTasks((current) => current.map((item) => item.id === task.id ? task : item)); notify(`${task.title} moved to ${stageLabels[task.status]}.`); };
  const onDragEnd = ({ active, over }: DragEndEvent) => { if (!over || !["todo", "progress", "review", "done"].includes(String(over.id))) return; const task = tasks.find((item) => item.id === active.id); if (task && task.status !== over.id) moveTask({ ...task, status: over.id as TaskStatus }); };
  return <div className="view"><PageHeader title="Tasks" description="Drag a card to another stage, or use its menu to move it." action={<Button onClick={() => openDialog("task")}><Plus size={18} />New Task</Button>} /><div className="task-toolbar"><SegmentedControl items={["All", "My tasks", "High priority", "Due this week"]} value={filter} onChange={setFilter} /><strong>{filtered.length} <span>tasks shown</span></strong></div><DndContext onDragEnd={onDragEnd}><div className="task-board">{(["todo", "progress", "review", "done"] as TaskStatus[]).map((status) => <TaskColumn key={status} status={status} tasks={filtered.filter((task) => task.status === status)} onMove={moveTask} />)}</div></DndContext></div>;
}

function CalendarPage() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 9, 1));
  const [selected, setSelected] = useState(6);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthLabel = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const days = Array.from({ length: 42 }, (_, i) => i - firstWeekday + 1);
  const events: Record<number, Array<{ title: string; time: string; kind: string }>> = { 3: [{ title: "Release retro", time: "Saturday · 11:00 am", kind: "Team" }], 4: [{ title: "Planning sync", time: "Sunday · 2:00 pm", kind: "Meeting" }], 6: [{ title: "Daily stand-up", time: "Today · 10:00 am", kind: "Team" }, { title: "Check-in with Halcyon Labs", time: "Today · 2:00 pm", kind: "Meeting" }], 7: [{ title: "Design review — auth flow", time: "Tomorrow · 11:00 am", kind: "Review" }, { title: "Regression sign-off", time: "Tomorrow · 5:00 pm", kind: "Deadline" }], 8: [{ title: "Sprint planning", time: "Thursday · 9:30 am", kind: "Team" }], 9: [{ title: "Passkey demo", time: "Friday · 3:00 pm", kind: "Review" }], 11: [{ title: "Customer interview", time: "Sunday · 10:00 am", kind: "Meeting" }], 12: [{ title: "Roadmap review", time: "Monday · 4:00 pm", kind: "Review" }], 14: [{ title: "Launch announcement", time: "Wednesday · 12:00 pm", kind: "Deadline" }], 15: [{ title: "Design critique", time: "Thursday · 3:00 pm", kind: "Review" }], 18: [{ title: "Retro + team lunch", time: "Sunday · 1:00 pm", kind: "Social" }], 21: [{ title: "Quarterly planning", time: "Wednesday · 9:00 am", kind: "Team" }], 25: [{ title: "Community demo", time: "Sunday · 3:00 pm", kind: "Social" }] };
  const shiftMonth = (amount: number) => { setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)); setSelected(1); };
  const goToday = () => { setVisibleMonth(new Date(2026, 9, 1)); setSelected(6); };
  const selectedEvents = month === 9 && year === 2026 ? (events[selected] || []) : [];
  const upcoming = [6, 7, 8].flatMap((day) => (events[day] || []).map((event) => ({ day, ...event })));
  return <div className="view"><PageHeader title="Calendar" description="Meetings, reviews and deadlines across the team." action={<Button variant="ghost" onClick={goToday}><CalendarDays size={18} />Today</Button>} /><section className="card calendar-card" data-reveal><div className="calendar-head"><h2>{monthLabel}</h2><div><button className="circle-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft size={17} /></button><button className="circle-btn" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight size={17} /></button></div></div><div className="weekdays">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((day, i) => { const inMonth = day > 0 && day <= daysInMonth; const date = inMonth ? day : day < 1 ? previousMonthDays + day : day - daysInMonth; const event = inMonth && month === 9 && year === 2026 ? events[day]?.[0] : undefined; return <button key={i} className={`${!inMonth ? "muted-day" : ""} ${inMonth && selected === day ? "current-day" : ""}`} aria-label={`${monthLabel} ${date}${event ? `, ${events[day].length} event${events[day].length > 1 ? "s" : ""}` : ""}`} onClick={() => inMonth && setSelected(day)}><b>{date}</b>{event && <span className={`event-${event.kind.toLowerCase()}`}>{event.title}</span>}</button>; })}</div><div className="calendar-legend"><span><i className="dot green" />Meeting</span><span><i className="dot blue" />Team</span><span><i className="dot amber" />Review</span><span><i className="dot red" />Deadline</span><span><i className="dot plum" />Social</span></div></section><section className="agenda-card" data-reveal><div><span className="eyebrow">{selected === 6 && month === 9 && year === 2026 ? "TODAY · TUESDAY" : "SELECTED DAY"}</span><h2>{monthLabel.split(" ")[0]} {selected}</h2></div><div>{selectedEvents.length ? selectedEvents.map((event) => <div className="agenda-event" key={event.title}><strong>{event.time.split(" · ")[1] || event.time}<small>{event.kind}</small></strong><span><b>{event.title}</b><small>{event.kind} · NC · LR</small></span></div>) : <div className="agenda-empty">No events scheduled for this day.</div>}</div></section><section className="card calendar-next" data-reveal><div className="section-title"><h2>Coming up</h2></div>{upcoming.map((event) => <button className="upcoming-row" key={event.title}><strong><small>OCT</small>{event.day}</strong><span><b>{event.title}</b><small>{event.time}</small></span></button>)}</section></div>;
}

function CalendarPageLegacy() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 9, 1));
  const [selected, setSelected] = useState(6);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthLabel = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const days = Array.from({ length: 42 }, (_, i) => i - firstWeekday + 1);
  const events: Record<number, string> = { 6: "Daily stand-up", 7: "Design review", 8: "Sprint planning", 9: "Passkey demo", 14: "Launch announcement", 18: "Retro + team lunch", 21: "Quarterly planning" };
  const shiftMonth = (amount: number) => { setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)); setSelected(1); };
  const goToday = () => { setVisibleMonth(new Date(2026, 9, 1)); setSelected(6); };
  return <div className="view"><PageHeader title="Calendar" description="Meetings, reviews and deadlines across the team." action={<Button variant="ghost" onClick={goToday}><CalendarDays size={18} />Today</Button>} /><section className="card calendar-card" data-reveal><div className="calendar-head"><h2>{monthLabel}</h2><div><button className="circle-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft size={17} /></button><button className="circle-btn" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight size={17} /></button></div></div><div className="weekdays">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((day, i) => { const inMonth = day > 0 && day <= daysInMonth; const date = inMonth ? day : day < 1 ? previousMonthDays + day : day - daysInMonth; const event = inMonth && month === 9 && year === 2026 ? events[day] : ""; return <button key={i} className={`${!inMonth ? "muted-day" : ""} ${inMonth && selected === day ? "current-day" : ""}`} onClick={() => inMonth && setSelected(day)}><b>{date}</b>{event && <span>{event}</span>}</button>; })}</div><div className="calendar-legend"><span><i className="dot green" />Meeting</span><span><i className="dot blue" />Team</span><span><i className="dot amber" />Review</span><span><i className="dot red" />Deadline</span><span><i className="dot plum" />Social</span></div></section><section className="agenda-card" data-reveal><div><span className="eyebrow">{selected === 6 && month === 9 && year === 2026 ? "TODAY · TUESDAY" : "SELECTED DAY"}</span><h2>{monthLabel.split(" ")[0]} {selected}</h2></div><div className="agenda-event"><strong>10:00 am <small>10:30 am</small></strong><span><b>{selected === 6 && month === 9 ? "Daily stand-up" : "Design review — auth flow"}</b><small>Team · MS · HK · OM</small></span></div><div className="agenda-event"><strong>2:00 pm <small>4:00 pm</small></strong><span><b>Check-in with Halcyon Labs</b><small>Meeting · NC · LR</small></span></div></section></div>;
}

function AnalyticsPage() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");
  const { notify } = useWorkspace();
  const values = range === "7D" ? ["58", "304", "91%", "2.8 d"] : range === "90D" ? ["481", "1,842", "94%", "2.4 d"] : ["223", "1,235", "91%", "2.9 d"];
  const metrics = [["Tasks completed", values[0], "5.7%"], ["Hours tracked", values[1], "13.6%"], ["On-time delivery", values[2], "2.2%"], ["Avg. cycle time", values[3], "6.5%"]];
  const exportCsv = () => { const csv = [["Metric", "Value", "Change"], ...metrics.map(([label, value, change]) => [label, value, change])].map((row) => row.join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = `fernly-analytics-${range.toLowerCase()}.csv`; link.click(); URL.revokeObjectURL(url); notify("Analytics CSV exported."); };
  return <div className="view"><PageHeader title="Analytics" description="How the team is shipping, and where the time goes." action={<div className="analytics-actions"><div className="segmented range">{["7D", "30D", "90D"].map((item) => <button className={range === item ? "selected" : ""} onClick={() => setRange(item as typeof range)} key={item}>{item}</button>)}</div><Button variant="ghost" onClick={exportCsv}><Download size={17} />Export CSV</Button></div>} /><div className="metric-grid">{metrics.map(([label, value, change]) => <article className="metric-card" key={label} data-reveal><span>{label}</span><strong>{value}</strong><small>↗ <b>{change}</b> vs previous {range.toLowerCase()}</small><div className="mini-line" /></article>)}</div><section className="card chart-card" data-reveal><div className="section-title"><div><h2>Throughput</h2><span>Tasks completed per day, 7-day average, against the previous period</span></div><div className="chart-legend"><span className="line-key" />This period <span className="dash-key" />Previous</div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="greenFillNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5dbd8b" stopOpacity={0.42} /><stop offset="100%" stopColor="#5dbd8b" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid stroke="#e3e7e4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6c756f", fontSize: 12 }} /><YAxis hide domain={[0, 12]} /><Tooltip /><Area type="monotone" dataKey="previous" stroke="#8d9a92" strokeDasharray="4 4" fill="none" /><Area type="monotone" dataKey="value" stroke="#27865a" strokeWidth={2.5} fill="url(#greenFillNew)" /></AreaChart></ResponsiveContainer></div></section><div className="analytics-lower"><section className="card donut-card" data-reveal><h2>Time by project</h2><div className="donut"><div><strong>1,235h</strong><small>tracked · {range.toLowerCase()}</small></div></div>{[["Payments API v2", "383h"], ["Mobile Onboarding", "296h"], ["Design System Audit", "247h"], ["Search Revamp", "185h"], ["Q4 Launch Site", "124h"]].map(([name, value], i) => <p key={name}><i className={`donut-dot d${i}`} />{name}<b>{value}</b></p>)}</section><section className="card activity-card" data-reveal><h2>Activity</h2><span>Commits, comments and status changes, last 20 weeks</span><div className="heatmap">{Array.from({ length: 140 }, (_, i) => <i key={i} style={{ opacity: 0.18 + ((i * 17) % 7) / 10 }} />)}</div><div className="heat-legend">Less ▫ ▫ ▫ ▫ More</div></section><section className="card contributors-card" data-reveal><h2>Top contributors</h2>{[["MS", "Mateo Silva", 57, "#cdeccf"], ["NC", "Noah Castell", 50, "#f4c9b4"], ["OM", "Owen Mercer", 46, "#f8e2ad"], ["PR", "Priya Raman", 42, "#f6c6c2"], ["HK", "Hana Kobayashi", 34, "#cfd6f7"]].map(([initials, name, score, color]) => <div className="contributor-row" key={name}><Avatar initials={String(initials)} color={String(color)} /><span><b>{name}</b><i><u style={{ width: `${Number(score) / 57 * 100}%` }} /></i></span><strong>{score}</strong></div>)}</section></div></div>;
}

function AnalyticsPageLegacy() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");
  const { notify } = useWorkspace();
  const values = range === "7D" ? ["58", "304", "91%", "2.8 d"] : range === "90D" ? ["481", "1,842", "94%", "2.4 d"] : ["223", "1,235", "91%", "2.9 d"];
  const exportCsv = () => { const csv = [["Metric", "Value", "Change"], ["Tasks completed", values[0], "5.7%"], ["Hours tracked", values[1], "13.6%"], ["On-time delivery", values[2], "2.2%"], ["Avg. cycle time", values[3], "6.5%"]].map((row) => row.join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = `fernly-analytics-${range.toLowerCase()}.csv`; link.click(); URL.revokeObjectURL(url); notify("Analytics CSV exported."); };
  return <div className="view"><PageHeader title="Analytics" description="How the team is shipping, and where the time goes." action={<div className="analytics-actions"><div className="segmented range">{["7D", "30D", "90D"].map((r) => <button className={range === r ? "selected" : ""} onClick={() => setRange(r as typeof range)} key={r}>{r}</button>)}</div><Button variant="ghost" onClick={exportCsv}><Download size={17} />Export CSV</Button></div>} /><div className="metric-grid">{[["Tasks completed", values[0], "5.7%"], ["Hours tracked", values[1], "13.6%"], ["On-time delivery", values[2], "2.2%"], ["Avg. cycle time", values[3], "6.5%"]].map(([label, value, change]) => <article className="metric-card" key={label} data-reveal><span>{label}</span><strong>{value}</strong><small>↗ <b>{change}</b> vs previous {range.toLowerCase()}</small><div className="mini-line" /></article>)}</div><section className="card chart-card" data-reveal><div className="section-title"><div><h2>Throughput</h2><span>Tasks completed per day, 7-day average, against the previous period</span></div><div className="chart-legend"><span className="line-key" />This period <span className="dash-key" />Previous</div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5dbd8b" stopOpacity={0.42} /><stop offset="100%" stopColor="#5dbd8b" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid stroke="#e3e7e4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6c756f", fontSize: 12 }} /><YAxis hide domain={[0, 12]} /><Tooltip /><Area type="monotone" dataKey="previous" stroke="#8d9a92" strokeDasharray="4 4" fill="none" /><Area type="monotone" dataKey="value" stroke="#27865a" strokeWidth={2.5} fill="url(#greenFill)" /></AreaChart></ResponsiveContainer></div></section><div className="analytics-lower"><section className="card donut-card"><h2>Time by project</h2><div className="donut"><div><strong>1,235h</strong><small>tracked · {range.toLowerCase()}</small></div></div>{[["Payments API v2", "383h"], ["Mobile Onboarding", "296h"], ["Design System Audit", "247h"], ["Search Revamp", "185h"], ["Q4 Launch Site", "124h"]].map(([name, value], i) => <p key={name}><i className={`donut-dot d${i}`} />{name}<b>{value}</b></p>)}</section><section className="card activity-card"><h2>Activity</h2><span>Commits, comments and status changes, last 20 weeks</span><div className="heatmap">{Array.from({ length: 140 }, (_, i) => <i key={i} style={{ opacity: 0.18 + ((i * 17) % 7) / 10 }} />)}</div><div className="heat-legend">Less ▫ ▫ ▫ ▫ More</div></section></div></div>;
}

function TeamPage({ openDialog }: { openDialog: (type: "project" | "member" | "task") => void }) {
  const [department, setDepartment] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { members: workspaceMembers, searchQuery, notify } = useWorkspace();
  const availability: Record<string, "online" | "away" | "offline"> = { NC: "online", PR: "online", MS: "online", HK: "away", OM: "online", SS: "offline", MK: "away", LR: "online", NB: "offline" };
  const filtered = workspaceMembers.filter((m) => (department === "All" || m[3] === department) && m[1].toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="view"><PageHeader title="Team" description="Everyone on the workspace, what they're carrying and who's around." action={<Button onClick={() => openDialog("member")}><Plus size={18} />Invite member</Button>} /><div className="team-toolbar"><div className="segmented">{["All", "Engineering", "Design", "Marketing", "Management"].map((d) => <button key={d} className={department === d ? "selected" : ""} onClick={() => setDepartment(d)}>{d}</button>)}</div><span><b>5</b> online now</span></div><div className="member-grid">{filtered.map((member) => { const [initials, name, role, dept, open, done, load, color] = member; return <article className="member-card" key={name} data-reveal><Avatar initials={initials} color={color} large /><span className={`online-dot ${availability[initials] || "online"}`} /><h2>{name}</h2><p>{role}</p><em>{dept}</em><div className="member-stats"><span><b>{open}</b>Open tasks</span><span><b>{done}</b>Completed</span></div><div className="workload"><span>Workload <b>{load}%</b></span><i><u style={{ width: `${load}%` }} /></i></div><div className="member-actions"><Button variant="ghost" onClick={() => notify(`Message composer for ${name} is ready.`)}>Message</Button><Button onClick={() => setSelectedMember(member)}>Profile</Button></div></article>; })}</div>{selectedMember && <ProfilePanel member={selectedMember} close={() => setSelectedMember(null)} />}</div>;
}

function ProfilePanel({ member, close }: { member: Member; close: () => void }) {
  const [initials, name, role, dept, open, done, load, color] = member;
  return <div className="panel-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><aside className="profile-panel" role="dialog" aria-modal="true"><button className="close-modal" aria-label="Close profile" onClick={close}><X size={18} /></button><div className="profile-hero"><Avatar initials={initials} color={color} large /><h2>{name}</h2><p>{role}</p><span>{dept} · Jakarta · Online</span></div><div className="profile-stats"><b>{open}<small>Open</small></b><b>{done}<small>Done</small></b><b>{load}%<small>Load</small></b></div><h3>Assigned tasks</h3><ul><li><i />Kickoff with Halcyon Labs <small>Done</small></li><li><i />Design System Tokens <small>In progress</small></li></ul><div className="form-actions"><Button variant="ghost" onClick={close}>Message</Button><Button onClick={close}><Plus size={16} />Assign task</Button></div></aside></div>;
}

function SettingsPage() {
  const [tab, setTab] = useState("Profile"); const [accent, setAccent] = useState<Accent>(() => { if (typeof window === "undefined") return "forest"; return (window.localStorage.getItem("fernly-accent") as Accent | null) || "forest"; }); const [weekStart, setWeekStart] = useState("Sunday"); const [switches, setSwitches] = useState([false, true, true, false, false]); const { notify } = useWorkspace();
  useEffect(() => { document.documentElement.dataset.accent = accent; window.localStorage.setItem("fernly-accent", accent); }, [accent]);
  return <div className="view settings-view"><PageHeader title="Settings" description="Your profile, notifications and how Fernly looks." /><div className="settings-tabs">{["Profile", "Notifications", "Appearance"].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><section className="card settings-pane" data-reveal>{tab === "Profile" && <><div className="settings-title"><Avatar initials="NC" color="#f4c9b4" large /><div><h2>Profile</h2><p>This is how teammates see you across the workspace.</p></div></div><div className="form-grid"><label>Full name<input defaultValue="Noah Castell" /></label><label>Email<input defaultValue="noah@fernly.app" /></label><label>Role<input defaultValue="Project Lead" /></label><label>Time zone<select defaultValue="GMT+7 · Jakarta"><option>GMT+7 · Jakarta</option><option>GMT+0 · London</option><option>GMT+1 · Lagos</option><option>GMT−5 · New York</option></select></label><label className="full">Bio<textarea defaultValue="Shipping calm software with a kind team." /></label></div><div className="form-actions"><Button variant="ghost">Discard</Button><Button onClick={() => notify("Profile changes saved.")}>Save changes</Button></div></>}{tab === "Notifications" && <><div className="settings-title"><Bell size={23} /><div><h2>Notifications</h2><p>Choose what reaches you, and where.</p></div></div>{["Task assigned to me", "Mentions & comments", "Meeting reminders", "Weekly digest", "Product updates"].map((item, i) => <div className="setting-row" key={item}><span><b>{item}</b><small>{["When someone hands you a task or adds you to one.", "Replies and @mentions on tasks you follow.", "Ten minutes before anything on your calendar.", "A Monday summary of what shipped and what slipped.", "New features in Fernly, at most once a month."][i]}</small></span><button className={`switch ${switches[i] ? "on" : ""}`} aria-checked={switches[i]} role="switch" onClick={() => setSwitches((current) => current.map((value, index) => index === i ? !value : value))}>{switches[i] ? <Check size={13} /> : null}</button></div>)}</>}{tab === "Appearance" && <><div className="settings-title"><SlidersHorizontal size={23} /><div><h2>Appearance</h2><p>The accent re-tints the whole workspace, and is remembered on this device.</p></div></div><label className="set-label">Accent</label><div className="swatches">{(["forest", "ocean", "plum", "ember"] as Accent[]).map((name) => <button className={accent === name ? "chosen" : ""} key={name} onClick={() => setAccent(name)}><i className={`swatch-${name}`} />{name[0].toUpperCase() + name.slice(1)}</button>)}</div><label className="set-label">Week starts on</label><div className="week-choice"><button className={weekStart === "Sunday" ? "chosen" : ""} onClick={() => setWeekStart("Sunday")}>Sunday</button><button className={weekStart === "Monday" ? "chosen" : ""} onClick={() => setWeekStart("Monday")}>Monday</button></div></>}</section></div>;
}

function HelpPage() {
  const { searchQuery, notify } = useWorkspace();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = ["How do I create my first project?", "Can I import projects from a spreadsheet?", "How do I move a task to another stage?", "What does the progress gauge measure?", "How do I invite a teammate?", "Who can see my time tracker?", "Is there a free plan?", "How do I change my accent colour?"];
  const visible = faqs.filter((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="view help-view"><PageHeader title="Help center" description="Answers, shortcuts, and a human when you need one." /><section className="help-hero" data-reveal><h2>How can we help?</h2><p>Type in the search bar above, or pick a topic.</p><div className="help-categories">{[["▣", "Getting started"], ["☑", "Projects & tasks"], ["♧", "Team"], ["▤", "Billing & plans"]].map(([icon, label]) => <button key={label} onClick={() => notify(`${label}: 2 articles available.`)}><span>{icon}</span><b>{label}<small>2 articles</small></b></button>)}</div></section><section className="card faq-card" data-reveal><h2>Frequently asked</h2>{visible.map((question) => { const index = faqs.indexOf(question); return <div className="faq" key={question}><button onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><b className={open === index ? "rotate" : ""}>+</b></button>{open === index && <p>Press Add Project on the dashboard, give it a name and a due date. It lands in your project list as pending and every count on the dashboard updates with it.</p>}</div>; })}</section><section className="shortcuts card"><h2>Keyboard shortcuts</h2><p><kbd>Ctrl K</kbd> Search <kbd>/</kbd> Search, from anywhere</p><p><kbd>G D</kbd> Go to dashboard <kbd>G T</kbd> Go to tasks <kbd>G C</kbd> Go to calendar</p><p><kbd>Alt ← →</kbd> Move a focused task card <kbd>Esc</kbd> Close menus and dialogs</p></section><section className="card help-contact" data-reveal><div className="contact-orb">✦</div><div><h2>Still stuck?</h2><p>Our team answers in under 10 minutes, Monday to Friday.</p></div><Button onClick={() => notify("Chat support is ready for this demo.")}>Start a chat</Button><a href="mailto:support@fernly.app">Email us</a></section></div>;
}

function HelpPageLegacy() {
  const { searchQuery } = useWorkspace(); const [open, setOpen] = useState<number | null>(null); const faqs = ["How do I create my first project?", "Can I import projects from a spreadsheet?", "How do I move a task to another stage?", "What does the progress gauge measure?", "How do I invite a teammate?", "Who can see my time tracker?", "Is there a free plan?", "How do I change my accent colour?"]; const visible = faqs.filter((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="view help-view"><PageHeader title="Help center" description="Answers, shortcuts, and a human when you need one." /><section className="help-hero" data-reveal><h2>How can we help?</h2><p>Type in the search bar above, or pick a topic.</p><div className="help-categories">{[["▣", "Getting started"], ["☑", "Projects & tasks"], ["♧", "Team"], ["▤", "Billing & plans"]].map(([icon, label]) => <button key={label}><span>{icon}</span><b>{label}<small>2 articles</small></b></button>)}</div></section><section className="card faq-card" data-reveal><h2>Frequently asked</h2>{visible.map((question) => { const index = faqs.indexOf(question); return <div className="faq" key={question}><button onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><b className={open === index ? "rotate" : ""}>+</b></button>{open === index && <p>Press Add Project on the dashboard, give it a name and a due date. It lands in your project list as pending and every count on the dashboard updates with it.</p>}</div>; })}</section><section className="shortcuts card"><h2>Keyboard shortcuts</h2><p><kbd>Ctrl K</kbd> Search <kbd>/</kbd> Search, from anywhere</p><p><kbd>G D</kbd> Go to dashboard <kbd>G T</kbd> Go to tasks <kbd>G C</kbd> Go to calendar</p><p><kbd>Alt ← →</kbd> Move a focused task card <kbd>Esc</kbd> Close menus and dialogs</p></section></div>;
}

function Modal({ type, close }: { type: "project" | "member" | "task"; close: () => void }) {
  const config = { project: ["New project", "Project name", "Due date", "Add project"], member: ["Invite member", "Full name", "Working on", "Send invite"], task: ["New task", "Title", "Due date", "Create task"] }[type];
  const { setTasks, setProjects, setMembers, notify } = useWorkspace();
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [task, setTask] = useState(""); const [due, setDue] = useState(type === "project" ? "2026-10-20" : ""); const [tag, setTag] = useState("Frontend"); const [priority, setPriority] = useState("Medium"); const [department, setDepartment] = useState("Engineering");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name && type !== "task") return; if (type === "project") { setProjects((current) => [...current, name]); notify(`${name} was added to projects.`); } if (type === "member") { setMembers((current) => [...current, ["NW", name, role || "New teammate", department, 0, 0, 0, "#dceec9"]]); notify(`${name} was invited.`); } if (type === "task") { const title = task || name; setTasks((current) => [...current, { id: `t${Date.now()}`, title, status: "todo", tag, priority, due: due || "In 7 days", comments: 0, assignee: "NC" }]); notify(`${title} was created.`); } close(); };
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><form className="modal" role="dialog" aria-modal="true" onSubmit={submit}><button type="button" className="close-modal" aria-label="Close" onClick={close}><X size={18} /></button><h2>{config[0]}</h2>{type === "task" ? <label>Title<input required value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Ship dark mode" /></label> : <label>{config[1]}<input required value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "project" ? "e.g. Payment Gateway" : "e.g. Grace Hopper"} /></label>}{type === "task" && <div className="form-grid"><label>Tag<select value={tag} onChange={(e) => setTag(e.target.value)}><option>Frontend</option><option>Backend</option><option>Design</option><option>QA</option><option>Marketing</option></select></label><label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value)}><option>Medium</option><option>High</option><option>Low</option></select></label></div>}{type === "member" && <div className="form-grid"><label>Role<input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Engineer" /></label><label>Department<select value={department} onChange={(e) => setDepartment(e.target.value)}><option>Engineering</option><option>Design</option><option>Marketing</option><option>Management</option></select></label></div>}{type === "member" && <label>Working on<input value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Release Checklist" /></label>}{(type === "project" || type === "task") && <label>{config[2]}<input required={type === "project"} type={type === "project" ? "date" : "text"} value={due} onChange={(e) => setDue(e.target.value)} placeholder={type === "task" ? "e.g. In 7 days" : undefined} /></label>}<div className="form-actions"><Button type="button" variant="ghost" onClick={close}>Cancel</Button><Button type="submit">{config[3]}</Button></div></form></div>;
}

export default function Home() {
  const [page, setPageState] = useState<Page>("dashboard"); const [sidebarOpen, setSidebarOpen] = useState(false); const [notificationsOpen, setNotificationsOpen] = useState(false); const [modal, setModal] = useState<"project" | "member" | "task" | null>(null); const [tasks, setTasks] = useState<Task[]>(taskSeed); const [projects, setProjects] = useState(["Payments API v2", "Mobile Onboarding", "Design System Audit", "Search Revamp", "Q4 Launch Site"]); const [workspaceMembers, setWorkspaceMembers] = useState<ReadonlyArray<Member>>(members); const [searchQuery, setSearchQuery] = useState(""); const [toast, setToast] = useState(""); const mainRef = useRef<HTMLElement>(null); const searchRef = useRef<HTMLInputElement>(null);
  const setPage = (next: Page) => { setPageState(next); window.location.hash = next; setNotificationsOpen(false); setSidebarOpen(false); };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  useEffect(() => { const initial = window.location.hash.slice(1) as Page; if (navItems.some((n) => n.id === initial) || ["settings", "help"].includes(initial)) setPageState(initial); const onHash = () => setPageState(window.location.hash.slice(1) as Page || "dashboard"); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  useEffect(() => { const savedAccent = window.localStorage.getItem("fernly-accent") as Accent | null; if (savedAccent) document.documentElement.dataset.accent = savedAccent; let shortcut = ""; let shortcutTimer = 0; const onKey = (event: KeyboardEvent) => { const target = event.target as HTMLElement | null; const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT"; if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); return; } if (event.key === "/" && !typing) { event.preventDefault(); searchRef.current?.focus(); return; } if (event.key === "Escape") { setModal(null); setSidebarOpen(false); setNotificationsOpen(false); return; } if (typing) return; if (event.key.toLowerCase() === "g") { shortcut = "g"; window.clearTimeout(shortcutTimer); shortcutTimer = window.setTimeout(() => { shortcut = ""; }, 900); return; } if (shortcut === "g") { const next = event.key.toLowerCase() === "d" ? "dashboard" : event.key.toLowerCase() === "t" ? "tasks" : event.key.toLowerCase() === "c" ? "calendar" : null; if (next) { setPage(next); shortcut = ""; } } }; window.addEventListener("keydown", onKey); return () => { window.clearTimeout(shortcutTimer); window.removeEventListener("keydown", onKey); }; }, []);
  useEffect(() => { const ctx = gsap.context(() => { gsap.fromTo("[data-reveal]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .045, ease: "power3.out", clearProps: "transform" }); const bars = gsap.utils.toArray<HTMLElement>("[data-motion-bar]"); if (bars.length) gsap.fromTo(bars, { scaleY: 0.02, transformOrigin: "bottom center" }, { scaleY: 1, duration: .72, stagger: .055, ease: "back.out(1.35)", delay: .18 }); const gauge = mainRef.current?.querySelector<HTMLElement>("[data-motion-gauge]"); if (gauge) gsap.fromTo(gauge, { scale: .82, opacity: .35, rotate: -8 }, { scale: 1, opacity: 1, rotate: 0, duration: .8, delay: .2, ease: "back.out(1.4)" }); const cells = gsap.utils.toArray<HTMLElement>(".heatmap i"); if (cells.length) gsap.fromTo(cells, { opacity: .05, scale: .72 }, { opacity: .62, scale: 1, duration: .36, stagger: { each: .008, from: "random" }, ease: "power2.out", delay: .18 }); }, mainRef); return () => ctx.revert(); }, [page]);
  const openDialog = (type: "project" | "member" | "task") => setModal(type);
  const context: WorkspaceContextValue = { tasks, setTasks, projects, setProjects, members: workspaceMembers, setMembers: setWorkspaceMembers, searchQuery, notify };
  return <WorkspaceContext.Provider value={context}><div className="app-shell"><Sidebar page={page} setPage={setPage} open={sidebarOpen} close={() => setSidebarOpen(false)} /><div className="shell-main"><Topbar page={page} openMenu={() => setSidebarOpen(true)} onNotifications={() => setNotificationsOpen((v) => !v)} notificationsOpen={notificationsOpen} onSearch={setSearchQuery} searchRef={searchRef} onProfile={() => setPage("settings")} onMessages={() => notify("Inbox is coming soon")} /><main ref={mainRef}>{page === "dashboard" && <Dashboard openDialog={openDialog} />}{page === "tasks" && <Tasks openDialog={openDialog} />}{page === "calendar" && <CalendarPage />}{page === "analytics" && <AnalyticsPage />}{page === "team" && <TeamPage openDialog={openDialog} />}{page === "settings" && <SettingsPage />}{page === "help" && <HelpPage />}</main></div>{modal && <Modal type={modal} close={() => setModal(null)} />} {toast && <div className="toast" role="status">{toast}</div>}<a className="template-badge" href="https://codeandchill.store/templates/fernly" target="_blank">GET THIS TEMPLATE →</a></div></WorkspaceContext.Provider>;
}
