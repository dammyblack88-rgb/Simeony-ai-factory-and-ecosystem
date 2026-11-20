import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, Bot, Box,
  Check, ChevronDown, CircleHelp, Clock3, Code2, Command, Cpu, FolderKanban,
  Gamepad2, Globe2, Layers3, LayoutDashboard, Menu, MoreHorizontal, Plus,
  Search, Settings2, ShieldCheck, Sparkles, WandSparkles, Workflow, X,
  Circle, CircleCheck, ListTodo, CalendarDays, Trash2
} from "lucide-react";

type Mode = "Simple" | "Studio" | "Expert";
type Task = { id: string; title: string; done: boolean };
type ActivityItem = { id: string; message: string; at: string };
type Project = {
  id: string; name: string; description: string; kind: string; status: string;
  updated: string; createdAt: string; mode: Mode; icon: "web" | "mobile" | "game" | "ai";
  tasks: Task[]; activity: ActivityItem[];
};

const STORAGE_KEY = "simeony.workspace.v1";
const starterTasks = [
  "Define the product goal and target users",
  "Confirm core features and user journeys",
  "Choose the technical approach",
  "Create the first working version",
  "Test the main user workflows"
];

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* Recover with an empty workspace if stored data is unreadable. */ }
  return [];
}
function stamp() { return new Date().toISOString(); }
function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
function makePlan(id: string): Task[] {
  return starterTasks.map((title, index) => ({ id: id + "-task-" + index, title, done: false }));
}
function iconFor(icon: Project["icon"]) {
  if (icon === "mobile") return <Box size={18} />;
  if (icon === "game") return <Gamepad2 size={18} />;
  if (icon === "ai") return <Sparkles size={18} />;
  return <Globe2 size={18} />;
}
function classify(idea: string): { kind: string; icon: Project["icon"] } {
  const value = idea.toLowerCase();
  if (/mobile|android|ios|phone app/.test(value)) return { kind: "Mobile application", icon: "mobile" };
  if (/game|3d|simulation|world/.test(value)) return { kind: "Game / interactive experience", icon: "game" };
  if (/ai|agent|automation|assistant/.test(value)) return { kind: "AI / automation project", icon: "ai" };
  if (/website|web app|saas|dashboard|platform|store/.test(value)) return { kind: "Web application", icon: "web" };
  return { kind: "New digital product", icon: "web" };
}

export default function App() {
  const [mode, setMode] = useState<Mode>("Simple");
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
    catch { setNotice("Browser storage is full or unavailable. Export or remove older workspace data."); }
  }, [projects]);

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);
  const completedCount = (project: Project) => project.tasks.filter((task) => task.done).length;
  const progress = (project: Project) => project.tasks.length ? Math.round(completedCount(project) / project.tasks.length * 100) : 0;

  function createProject() {
    const idea = prompt.trim();
    if (!idea) { setNotice("Describe what you want to create first."); return; }
    const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    const now = stamp();
    const category = classify(idea);
    const project: Project = {
      id, name: idea.length > 58 ? idea.slice(0, 58).trim() + "…" : idea,
      description: idea, kind: category.kind, status: "Planning", updated: "Just now",
      createdAt: now, mode, icon: category.icon, tasks: makePlan(id),
      activity: [{ id: id + "-activity-1", message: "Project workspace created", at: now }]
    };
    setProjects((current) => [project, ...current]);
    setPrompt(""); setSelectedId(id); setActiveNav("Projects");
    setNotice("Project created and saved in this browser. Its starter checklist is ready to edit.");
  }
  function updateProject(id: string, updater: (project: Project) => Project, message?: string) {
    setProjects((current) => current.map((project) => {
      if (project.id !== id) return project;
      const now = stamp();
      return { ...updater(project), updated: "Just now", activity: message
        ? [{ id: now + Math.random(), message, at: now }, ...project.activity].slice(0, 40)
        : project.activity };
    }));
  }
  function toggleTask(project: Project, taskId: string) {
    const task = project.tasks.find((item) => item.id === taskId);
    if (!task) return;
    updateProject(project.id, (current) => {
      const tasks = current.tasks.map((item) => item.id === taskId ? { ...item, done: !item.done } : item);
      const done = tasks.filter((item) => item.done).length;
      return { ...current, tasks, status: done === tasks.length ? "Completed" : done ? "In progress" : "Planning" };
    }, (task.done ? "Reopened: " : "Completed: ") + task.title);
  }
  function addTask() {
    if (!selectedProject || !taskDraft.trim()) return;
    const title = taskDraft.trim();
    updateProject(selectedProject.id, (current) => ({
      ...current, tasks: [...current.tasks, { id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), title, done: false }]
    }), "Added task: " + title);
    setTaskDraft("");
  }
  function deleteProject(project: Project) {
    if (!window.confirm("Delete this project and its workspace history? This cannot be undone.")) return;
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setSelectedId(null); setActiveNav("Projects"); setNotice("Project deleted from this browser.");
  }
  function openProject(id: string) { setSelectedId(id); setActiveNav("Projects"); setMobileMenu(false); }

  const navItems = [
    { label: "Overview", icon: <LayoutDashboard size={17} /> },
    { label: "Projects", icon: <FolderKanban size={17} /> },
    { label: "AI workspace", icon: <Bot size={17} /> },
    { label: "Creation engines", icon: <Layers3 size={17} /> },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>SIMEONY</strong><span>BY SIMEONJR STUDIOS</span></div><button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18} /></button></div>
        <button className="workspace-switch"><div className="workspace-avatar">S</div><span><b>Personal workspace</b><small>Free development space</small></span><ChevronDown size={15} /></button>
        <div className="nav-label">WORKSPACE</div>
        <nav>{navItems.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => { setActiveNav(item.label); if (item.label !== "Projects") setSelectedId(null); setMobileMenu(false); }}>{item.icon}<span>{item.label}</span>{item.label === "Projects" && <small>{projects.length}</small>}</button>)}</nav>
        <div className="nav-label engines-label">YOUR TOOLKIT</div>
        <div className="toolkit-item"><Code2 size={16} /><span>Web & software</span><span className="toolkit-dot ready" /></div>
        <div className="toolkit-item"><Box size={16} /><span>Mobile apps</span><span className="toolkit-dot" /></div>
        <div className="toolkit-item"><Gamepad2 size={16} /><span>Games & 3D</span><span className="toolkit-dot" /></div>
        <div className="toolkit-item"><AudioLines size={16} /><span>Media & animation</span><span className="toolkit-dot" /></div>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><b>Need a hand?</b><p>Your workspace now saves projects, tasks and activity in this browser.</p><button onClick={() => setNotice("AI generation and cloud collaboration are not connected yet.")}>What's connected <ArrowUpRight size={13} /></button></div>
          <button className="nav-item settings-link" onClick={() => setNotice("Workspace settings and accounts are planned for a later milestone.")}><Settings2 size={17} /><span>Settings</span></button>
          <div className="profile-row"><div className="profile-avatar">D</div><div><b>Studio owner</b><small>SimeonJr Studios</small></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>
      {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}
      <main className="main-area">
        <header className="topbar"><div className="crumb"><button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={19} /></button><span>Workspace</span><span className="crumb-slash">/</span><b>{selectedProject ? selectedProject.name : activeNav}</b></div><div className="top-actions"><div className="system-status"><span /> Local workspace active</div><button className="icon-button" aria-label="Search projects" onClick={() => { setActiveNav("Projects"); setSelectedId(null); }}><Search size={18} /></button><button className="icon-button" aria-label="Activity" onClick={() => setNotice("Project activity is recorded inside each project workspace.")}><Activity size={18} /></button><div className="top-avatar">D</div></div></header>
        <div className="content">
          {activeNav === "Projects" && selectedProject ? (
            <section className="project-detail">
              <button className="back-link" onClick={() => setSelectedId(null)}><ArrowLeft size={15} /> All projects</button>
              <div className="detail-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> PROJECT WORKSPACE</div><h1 className="detail-title">{selectedProject.name}</h1><p>{selectedProject.description}</p></div><button className="danger-button" onClick={() => deleteProject(selectedProject)}><Trash2 size={14} /> Delete project</button></div>
              <div className="detail-meta"><span>{iconFor(selectedProject.icon)} {selectedProject.kind}</span><span><Sparkles size={14} /> {selectedProject.mode} mode</span><span><CalendarDays size={14} /> Created {timeLabel(selectedProject.createdAt)}</span><span className="status-pill">{selectedProject.status}</span></div>
              <div className="detail-grid">
                <div className="detail-main">
                  <article className="workspace-panel"><div className="panel-heading"><div><h3>Project progress</h3><p>Track the work needed to bring this idea to life.</p></div><b className="progress-number">{progress(selectedProject)}%</b></div><div className="progress-track"><span style={{ width: progress(selectedProject) + "%" }} /></div><div className="progress-caption">{completedCount(selectedProject)} of {selectedProject.tasks.length} tasks completed</div></article>
                  <article className="workspace-panel"><div className="panel-heading"><div><h3>Build checklist</h3><p>A starter plan you can edit as the project becomes clearer.</p></div><ListTodo size={18} /></div><div className="task-list">{selectedProject.tasks.map((task) => <label className={`task-item ${task.done ? "task-done" : ""}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(selectedProject, task.id)} /><span className="task-check">{task.done ? <CircleCheck size={18} /> : <Circle size={18} />}</span><span>{task.title}</span></label>)}</div><form className="add-task-form" onSubmit={(event) => { event.preventDefault(); addTask(); }}><input value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Add a project task…" aria-label="New task" /><button type="submit" disabled={!taskDraft.trim()}><Plus size={15} /> Add task</button></form></article>
                </div>
                <aside className="detail-side"><article className="workspace-panel"><div className="panel-heading"><div><h3>Activity history</h3><p>Recent changes in this workspace.</p></div><Activity size={17} /></div><div className="activity-list">{selectedProject.activity.map((item) => <div className="activity-item" key={item.id}><span className="activity-dot" /><div><b>{item.message}</b><small>{timeLabel(item.at)}</small></div></div>)}</div></article><article className="workspace-panel boundary-panel"><ShieldCheck size={18} /><b>Workspace boundary</b><p>Project data is saved in this browser only. Cloud sync, AI execution, team access and deployment are not connected yet.</p></article></aside>
              </div>
            </section>
          ) : activeNav === "Overview" || activeNav === "AI workspace" ? (
            <>
              <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR CREATIVE COMMAND CENTRE</div><h1>{greeting}, <span>Creator.</span></h1><p>Big ideas deserve the tools to make them real. What are we building today?</p></div><div className="date-chip"><Clock3 size={14} /> Your workspace · Private</div></section>
              <section className="builder-card"><div className="builder-top"><div><div className="builder-kicker"><WandSparkles size={15} /> THE SIMEONY CREATION ENGINE</div><h2>Start with an idea.</h2><p>Describe what you imagine. SIMEONY will create a project workspace and starter checklist.</p></div><div className="orb-wrap"><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb-core"><Sparkles size={25} /></div></div></div><div className="prompt-box"><textarea value={prompt} onChange={(event) => { setPrompt(event.target.value); setNotice(""); }} placeholder="I want to build a modern e-commerce platform with customer accounts, product management and online payments…" rows={3} /><div className="prompt-footer"><span><Command size={13} /> Your idea becomes a saved project workspace</span><button className="create-button" onClick={createProject}><Sparkles size={15} /> Create project <ArrowRight size={15} /></button></div></div><div className="mode-row"><span className="mode-label">CREATION MODE</span>{(["Simple", "Studio", "Expert"] as Mode[]).map((item) => <button key={item} className={`mode-chip ${mode === item ? "selected" : ""}`} onClick={() => setMode(item)}>{item === "Simple" ? <Sparkles size={13} /> : item === "Studio" ? <Code2 size={13} /> : <Cpu size={13} />}{item}{item === "Simple" && <span className="recommended">START HERE</span>}</button>)}<span className="mode-hint">{mode === "Simple" ? "Guided creation, step by step" : mode === "Studio" ? "Professional project planning" : "Advanced project planning"}</span></div></section>
              <section className="quick-section"><div className="section-heading"><div><h3>Your work at a glance</h3><p>Pick up where you left off.</p></div><button className="text-link" onClick={() => setActiveNav("Projects")}>View all projects <ArrowUpRight size={14} /></button></div><div className="quick-grid">{projects.slice(0,4).map((project) => <button className="quick-card project-quick-card" key={project.id} onClick={() => openProject(project.id)}><div className="quick-icon purple">{iconFor(project.icon)}</div><b>{project.name}</b><span>{project.status} · {progress(project)}% complete</span><ArrowUpRight className="quick-arrow" size={15} /></button>)}{projects.length === 0 && <div className="empty-state"><FolderKanban size={22} /><b>Your first project starts here</b><span>Create a project above to open its workspace and task checklist.</span></div>}</div></section>
            </>
          ) : activeNav === "Projects" ? (
            <section className="projects-view"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR WORK</div><h2 className="page-title">Your projects</h2><p>Projects stay saved in this browser between visits.</p></div><button className="create-button" onClick={() => setActiveNav("Overview")}><Plus size={15} /> New project</button></div><div className="project-toolbar"><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Filter projects…" aria-label="Filter projects" /><span>{projects.length} total</span></div><div className="project-list">{projects.filter((project) => (project.name + " " + project.kind).toLowerCase().includes(searchTerm.toLowerCase())).map((project) => <button className="project-row project-row-button" key={project.id} onClick={() => openProject(project.id)}><div className="project-icon">{iconFor(project.icon)}</div><div className="project-info"><b>{project.name}</b><span>{project.kind} · {project.mode} mode</span></div><span className="project-status"><i />{project.status}</span><span className="project-updated">{progress(project)}%</span><ArrowRight size={16} /></button>) }{projects.length === 0 && <div className="empty-state"><FolderKanban size={24} /><b>No projects yet</b><span>Create your first project from the overview.</span></div>}</div></section>
          ) : (
            <section className="engines-view"><div className="eyebrow"><span className="eyebrow-line" /> THE SIMEONY ECOSYSTEM</div><h2 className="page-title">Creation engines</h2><p className="view-intro">A connected toolkit for turning ambitious ideas into real products.</p><div className="engine-grid">{[{icon:<Globe2/>,name:"Web & software",desc:"Frontend, backend, APIs and databases",state:"Foundation available"},{icon:<Box/>,name:"Mobile & desktop",desc:"Cross-platform and native applications",state:"Integration planned"},{icon:<Gamepad2/>,name:"Games & 3D",desc:"Interactive worlds, engines and assets",state:"Integration planned"},{icon:<AudioLines/>,name:"Media & animation",desc:"Creative production and visual storytelling",state:"Integration planned"},{icon:<Bot/>,name:"AI & agents",desc:"Intelligent workflows and task execution",state:"Provider not connected"},{icon:<Workflow/>,name:"Automation",desc:"Connected processes and repeatable tasks",state:"Integration planned"}].map((engine) => <article className="engine-card" key={engine.name}><div className="engine-icon">{engine.icon}</div><b>{engine.name}</b><p>{engine.desc}</p><span>{engine.state}</span></article>)}</div></section>
          )}
          <section className="bottom-strip"><div className="bottom-icon"><ShieldCheck size={17} /></div><div><b>Your workspace, your rules.</b><span>No deployment, paid service or external AI provider is activated by this change.</span></div><span className="foundation-tag"><Check size={12} /> LOCAL WORKSPACE</span></section>
          {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div>}
          <footer><span>© 2026 SIMEONY · SIMEONJR STUDIOS</span><span>BUILD BEYOND IMAGINATION <Sparkles size={12} /></span></footer>
        </div>
      </main>
    </div>
  );
}
