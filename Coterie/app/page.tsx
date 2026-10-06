"use client";

import gsap from "gsap";
import {
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Download,
  EllipsisVertical,
  Mail,
  Monitor,
  Pause,
  Play,
  Search,
  Settings,
  TimerReset,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type View = "overview" | "people" | "payroll";
type Person = {
  id: number;
  initials: string;
  name: string;
  role: string;
  team: string;
  status: "Active" | "Onboarding" | "Away";
  salary: number;
  hours: number;
  color: string;
};

const people: Person[] = [
  { id: 1, initials: "MO", name: "Mira Okafor", role: "Product Designer", team: "Design", status: "Active", salary: 4850, hours: 34, color: "#f2b7a1" },
  { id: 2, initials: "AL", name: "Amara Liu", role: "People Lead", team: "People", status: "Active", salary: 6200, hours: 38, color: "#f5d36f" },
  { id: 3, initials: "JK", name: "Jules Karim", role: "Frontend Engineer", team: "Product", status: "Onboarding", salary: 5300, hours: 29, color: "#a7d9cb" },
  { id: 4, initials: "NR", name: "Nadia Reyes", role: "Payroll Analyst", team: "Finance", status: "Active", salary: 4550, hours: 36, color: "#b8c7f4" },
  { id: 5, initials: "ES", name: "Eli Stone", role: "Brand Strategist", team: "Marketing", status: "Away", salary: 4100, hours: 21, color: "#d7c2ef" },
  { id: 6, initials: "TT", name: "Tara Tan", role: "Ops Coordinator", team: "People", status: "Onboarding", salary: 3900, hours: 26, color: "#f0c28d" },
];

const week = [
  ["Mon", 5.7],
  ["Tue", 6.4],
  ["Wed", 7.2],
  ["Thu", 6.9],
  ["Fri", 8.1],
  ["Sat", 3.4],
  ["Sun", 4.7],
] as const;

const seedTasks = [
  { title: "Intro interview", when: "Sep 29, 08:30", phase: "Paperwork", done: true },
  { title: "Sign the offer", when: "Sep 29, 10:30", phase: "Paperwork", done: true },
  { title: "Tax and bank forms", when: "Sep 29, 13:00", phase: "Paperwork", done: false },
  { title: "Accounts and access", when: "Sep 30, 09:00", phase: "Setup", done: false },
  { title: "Laptop hand-off", when: "Sep 30, 11:15", phase: "Setup", done: false },
  { title: "Q4 goals draft", when: "Oct 1, 14:45", phase: "Setup", done: false },
  { title: "Coffee with the team", when: "Oct 2, 10:00", phase: "Team", done: false },
  { title: "Handbook walkthrough", when: "Oct 2, 16:30", phase: "Team", done: false },
];

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(people[0]);
  const [tasks, setTasks] = useState(seedTasks);
  const [seconds, setSeconds] = useState(9300);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [openPanel, setOpenPanel] = useState("Devices");
  const [weekOffset, setWeekOffset] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "people" || hash === "payroll" || hash === "overview") setView(hash);
  }, []);

  useEffect(() => {
    window.location.hash = view;
  }, [view]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".motion-card");
      const words = gsap.utils.toArray(".split-word");
      const rails = gsap.utils.toArray(".rail-fill");
      if (cards.length) gsap.fromTo(cards, { y: 26, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out", stagger: 0.07 });
      if (words.length) gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.035 });
      if (rails.length) gsap.fromTo(rails, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.2 });
    }, rootRef);
    return () => ctx.revert();
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 1900);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filteredPeople = useMemo(() => {
    const lower = query.toLowerCase();
    return people.filter((person) => `${person.name} ${person.role} ${person.team} ${person.status}`.toLowerCase().includes(lower));
  }, [query]);

  useEffect(() => {
    if (filteredPeople.length && !filteredPeople.some((person) => person.id === selected.id)) {
      setSelected(filteredPeople[0]);
    }
  }, [filteredPeople, selected.id]);

  const done = tasks.filter((task) => task.done).length;
  const completion = Math.round((done / tasks.length) * 100);
  const timerText = formatTime(seconds);

  return (
    <div className="coterie-shell" ref={rootRef}>
      <main className="workspace" data-view={view}>
        <header className="topbar">
          <button className="brand" type="button" onClick={() => setView("overview")}><span />Coterie</button>
          <nav className="tabs" aria-label="Sections">
            {(["overview", "people", "payroll"] as View[]).map((item) => (
              <button key={item} className={view === item ? "active" : ""} type="button" onClick={() => setView(item)}>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <button className="pill-btn" type="button"><Settings size={17} />Settings</button>
            <button className="round-btn" type="button" aria-label="Notifications"><Bell size={18} /><i>3</i></button>
            <button className="round-btn" type="button" aria-label="Profile"><User size={18} /></button>
          </div>
        </header>

        {view === "overview" && (
          <section className="view overview-view">
            <div className="hello">
              <h1>{"Good morning, Amara".split(" ").map((word) => <span className="split" key={word}><span className="split-word">{word}</span></span>)}</h1>
              <div className="hello-row">
                <div className="pipeline motion-card" aria-label="Hiring pipeline this quarter">
                  <Rail label="Interviews" value={17} tone="ink" />
                  <Rail label="Hired" value={15} tone="gold" />
                  <Rail label="Project time" value={56} tone="stripe" />
                  <Rail label="Output" value={12} tone="line" />
                </div>
                <div className="stats motion-card">
                  <Metric icon={<Users size={16} />} label="Team" value="84" />
                  <Metric icon={<UserPlus size={16} />} label="Hiring" value="37" />
                  <Metric icon={<BriefcaseBusiness size={16} />} label="Projects" value="212" />
                </div>
              </div>
            </div>

            <div className="bento">
              <article className="card profile-card motion-card tilt">
                <img className="profile-photo" src="https://images.unsplash.com/photo-1660794258264-89a5272269b5?auto=format&fit=crop&w=900&q=85" alt="Mira Okafor smiling by a studio window" />
                <div className="profile-meta">
                  <span><strong>Mira Okafor</strong><small>Product Designer</small></span>
                  <b>$4,850</b>
                </div>
              </article>

              <article className="card progress-card motion-card">
                <CardHead title="Progress" />
                <div className="big-line"><strong>6.6 h</strong><span>Avg. workday<br />last 7 days</span></div>
                  <div className="week-bars">
                  {week.map(([day, hours], index) => <button className={index === 6 ? "today" : ""} key={day} type="button" aria-label={`${day}: ${hours} hours`}><i style={{ height: `${hours * 12}%` }} /><span>{day[0]}</span></button>)}
                </div>
              </article>

              <article className="card timer-card motion-card">
                <CardHead title="Time tracker" />
                <div className="dial" style={{ "--pct": `${Math.min(100, (seconds / 28800) * 100)}%` } as React.CSSProperties}>
                  <div><strong>{timerText.slice(0, 5)}</strong><span>{running ? "Running" : "Paused"} · {timerText.slice(6)}s</span></div>
                </div>
                <div className="timer-controls">
                  <button className="control primary" type="button" aria-label={running ? "Pause timer" : "Start timer"} onClick={() => setRunning((value) => !value)}>{running ? <Pause size={18} /> : <Play size={18} />}</button>
                  <button className="control" type="button" aria-label="Reset timer" onClick={() => { setSeconds(9300); setRunning(false); }}><TimerReset size={18} /></button>
                  <button className="control dark" type="button" aria-label="Set reminder" onClick={() => setToast("Break reminder set for 25 minutes.")}><Clock3 size={18} /></button>
                </div>
              </article>

              <article className="card onboard-card motion-card">
                <CardHead title="Onboarding" meta={`${completion}%`} />
                <div className="phases">
                  {["Paperwork", "Setup", "Team"].map((phase) => {
                    const phaseTasks = tasks.filter((task) => task.phase === phase);
                    const pct = Math.round((phaseTasks.filter((task) => task.done).length / phaseTasks.length) * 100);
                    return <div className="phase" key={phase}><span>{pct}%</span><i><b style={{ width: `${pct}%` }} /></i><small>{phase}</small></div>;
                  })}
                </div>
                <ul className="task-list">
                  {tasks.map((task, index) => (
                    <li key={task.title}>
                      <button type="button" aria-pressed={task.done} onClick={() => setTasks((items) => items.map((item, i) => i === index ? { ...item, done: !item.done } : item))}>
                        <span className="task-icon">{task.done && <Check size={15} />}</span>
                        <span><b>{task.title}</b><small>{task.when}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="card benefits-card motion-card">
                {["Pension plan", "Devices", "Compensation", "Benefits"].map((title) => {
                  const expanded = openPanel === title;
                  return <section className="benefit-row" key={title}>
                    <button type="button" aria-expanded={expanded} onClick={() => setOpenPanel(expanded ? "" : title)}><span>{title}</span>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    {expanded && <div className="benefit-content">
                      {title === "Devices" ? <><span className="benefit-icon"><Monitor size={19} /></span><span><b>Studio laptop 14&quot;</b><small>Issued Sep 29</small></span><button className="more-button" aria-label="Device options" type="button"><EllipsisVertical size={16} /></button></> : <><span className="benefit-icon"><BriefcaseBusiness size={18} /></span><span><b>{title === "Pension plan" ? "Retirement plan" : title === "Benefits" ? "Health coverage" : "Monthly salary"}</b><small>{title === "Pension plan" ? "Enrolled · 4% match" : title === "Benefits" ? "Plan active" : "$4,850 per month"}</small></span></>}
                    </div>}
                  </section>;
                })}
              </article>

              <article className="card calendar-card motion-card">
                <header className="calendar-heading">
                  <button type="button" aria-label="Previous week" onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft size={15} />Sep {21 + weekOffset * 7}</button>
                  <strong>{weekOffset === 0 ? "Sep 28 – Oct 3" : weekOffset > 0 ? `Oct ${5 + (weekOffset - 1) * 7} – Oct ${10 + (weekOffset - 1) * 7}` : `Sep ${28 + weekOffset * 7} – Oct ${3 + weekOffset * 7}`}</strong>
                  <button type="button" aria-label="Next week" onClick={() => setWeekOffset((value) => value + 1)}>Oct {5 + weekOffset * 7}<ChevronRight size={15} /></button>
                </header>
                <div className="calendar-grid">
                  <div className="time-labels"><span>8:00 am</span><span>9:00 am</span><span>10:00 am</span><span>11:00 am</span></div>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => <div className={`calendar-day ${index === 1 ? "selected-day" : ""}`} key={day}>
                    <span className="day-label">{day} <b>{[28, 29, 30, 1, 2, 3][index]}</b></span>
                    <i />
                  </div>)}
                  <span className="calendar-event event-sync">Weekly team sync</span>
                  <span className="calendar-event event-onboard">Onboarding session</span>
                  <span className="calendar-event event-one">1:1 with Mira</span>
                  <i className="current-time" />
                </div>
              </article>
            </div>
          </section>
        )}

        {view === "people" && (
          <section className="view people-view">
            <ViewHeader title="People" subtitle="Filter, search and select a teammate without leaving the workspace." query={query} setQuery={setQuery} />
            <div className="people-grid">
              {filteredPeople.map((person) => (
                <button className={`person-card motion-card ${selected.id === person.id ? "selected" : ""}`} key={person.id} type="button" onClick={() => setSelected(person)}>
                  <AvatarBlock person={person} />
                  <span><b>{person.name}</b><small>{person.role}</small></span>
                  <em>{person.status}</em>
                </button>
              ))}
            </div>
            <aside className="detail-panel motion-card">
              <AvatarBlock person={selected} large />
              <h2>{selected.name}</h2>
              <p>{selected.role} · {selected.team}</p>
              <div className="detail-stats"><span><b>{selected.hours}h</b><small>This week</small></span><span><b>{selected.status}</b><small>Status</small></span><span><b>{money(selected.salary)}</b><small>Monthly</small></span></div>
              <button type="button" onClick={() => setToast(`${selected.name} profile exported.`)}><Download size={17} />Export profile</button>
            </aside>
          </section>
        )}

        {view === "payroll" && (
          <section className="view payroll-view">
            <ViewHeader title="Payroll" subtitle="Pick a person and review the month, taxes and payout status." query={query} setQuery={setQuery} />
            <div className="payroll-layout">
              <div className="payroll-list motion-card">
                {filteredPeople.map((person) => (
                  <button type="button" className={selected.id === person.id ? "active" : ""} key={person.id} onClick={() => setSelected(person)}>
                    <AvatarBlock person={person} /><span><b>{person.name}</b><small>{person.team}</small></span><strong>{money(person.salary)}</strong>
                  </button>
                ))}
              </div>
              <article className="payroll-card motion-card">
                <CardHead title="October payout" meta="Ready" />
                <div className="payroll-hero"><AvatarBlock person={selected} large /><div><h2>{selected.name}</h2><p>{selected.role}</p></div></div>
                <dl>
                  <div><dt>Gross pay</dt><dd>{money(selected.salary)}</dd></div>
                  <div><dt>Benefits</dt><dd>$420</dd></div>
                  <div><dt>Tax reserve</dt><dd>-{money(Math.round(selected.salary * 0.22))}</dd></div>
                  <div><dt>Net payout</dt><dd>{money(Math.round(selected.salary * 0.78 + 420))}</dd></div>
                </dl>
                <button type="button" onClick={() => setToast(`Payroll packet sent to ${selected.name}.`)}><Mail size={17} />Send packet</button>
              </article>
            </div>
          </section>
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
      <a className="template-badge" href="../">Template preview</a>
    </div>
  );
}

function formatTime(total: number) {
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function Rail({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className={`rail rail-${tone}`} style={{ "--value": `${value}%` } as React.CSSProperties}><span>{label}</span><i><b className="rail-fill" /></i><strong>{value}%</strong></div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <span className="metric">{icon}<small>{label}</small><b>{value}</b></span>;
}

function CardHead({ title, meta }: { title: string; meta?: string }) {
  return <header className="card-head"><h2>{title}</h2>{meta ? <strong>{meta}</strong> : <button type="button" aria-label={`Open ${title}`}><EllipsisVertical size={17} /></button>}</header>;
}

function AvatarBlock({ person, large = false }: { person: Person; large?: boolean }) {
  return <span className={`avatar ${large ? "large" : ""}`} style={{ background: person.color }}><span>{person.initials}</span></span>;
}

function ViewHeader({ title, subtitle, query, setQuery }: { title: string; subtitle: string; query: string; setQuery: (value: string) => void }) {
  return <header className="view-head motion-card"><div><h1>{title}</h1><p>{subtitle}</p></div><label><Search size={17} /><input aria-label={`Search ${title.toLowerCase()}`} placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)} /></label></header>;
}
