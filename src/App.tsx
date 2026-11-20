import { useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Bot, Box,
  Check, ChevronDown, CircleHelp, Clock3, Code2, Command, Compass,
  Cpu, Database, FileCode2, FolderKanban, Gamepad2, Globe2, Layers3,
  LayoutDashboard, Menu, MessageSquare, MoreHorizontal, Plus, Search,
  Settings2, ShieldCheck, Sparkles, WandSparkles, Workflow, X, Zap,
} from "lucide-react";

type Mode = "Simple" | "Studio" | "Expert";
type Project = { id: number; name: string; kind: string; status: string; updated: string; icon: "web" | "mobile" | "game" | "ai"; };

const initialProjects: Project[] = [
  { id: 1, name: "My first creation", kind: "Web application", status: "Workspace ready", updated: "Just now", icon: "web" },
  { id: 2, name: "Creative studio concept", kind: "Creative platform", status: "Planning", updated: "Yesterday", icon: "ai" },
];

const iconFor = (icon: Project["icon"]) => {
  if (icon === "mobile") return <Box size={18} />;
  if (icon === "game") return <Gamepad2 size={18} />;
  if (icon === "ai") return <Sparkles size={18} />;
  return <Globe2 size={18} />;
};

export default function App() {
  const [mode, setMode] = useState<Mode>("Simple");
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeNav, setActiveNav] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  function createProject() {
    const idea = prompt.trim();
    if (!idea) {
      setNotice("Describe what you want to create first.");
      return;
    }
    const project: Project = {
      id: Date.now(),
      name: idea.length > 42 ? idea.slice(0, 42).trim() + "…" : idea,
      kind: "New project · " + mode + " mode",
      status: "Idea captured",
      updated: "Just now",
      icon: "web",
    };
    setProjects((current) => [project, ...current]);
    setPrompt("");
    setActiveNav("Projects");
    setNotice("Your idea has been saved in this browser session. AI execution is not connected yet.");
  }

  const navItems = [
    { label: "Overview", icon: <LayoutDashboard size={17} /> },
    { label: "Projects", icon: <FolderKanban size={17} /> },
    { label: "AI workspace", icon: <Bot size={17} /> },
    { label: "Creation engines", icon: <Layers3 size={17} /> },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div><strong>SIMEONY</strong><span>BY SIMEONJR STUDIOS</span></div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <button className="workspace-switch"><div className="workspace-avatar">S</div><span><b>Personal workspace</b><small>Free development space</small></span><ChevronDown size={15} /></button>
        <div className="nav-label">WORKSPACE</div>
        <nav>{navItems.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => { setActiveNav(item.label); setMobileMenu(false); }}>{item.icon}<span>{item.label}</span>{item.label === "Projects" && <small>{projects.length}</small>}</button>)}</nav>
        <div className="nav-label engines-label">YOUR TOOLKIT</div>
        <div className="toolkit-item"><Code2 size={16} /><span>Web & software</span><span className="toolkit-dot ready" /></div>
        <div className="toolkit-item"><SmartphoneIcon /><span>Mobile apps</span><span className="toolkit-dot" /></div>
        <div className="toolkit-item"><Gamepad2 size={16} /><span>Games & 3D</span><span className="toolkit-dot" /></div>
        <div className="toolkit-item"><AudioLines size={16} /><span>Media & animation</span><span className="toolkit-dot" /></div>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><b>Need a hand?</b><p>Your creative journey starts with an idea. We're building the tools to bring it to life.</p><button onClick={() => setNotice("Help centre is planned for a future milestone.")}>Explore help <ArrowUpRight size={13} /></button></div>
          <button className="nav-item settings-link" onClick={() => setNotice("Settings are planned for a future milestone.")}><Settings2 size={17} /><span>Settings</span></button>
          <div className="profile-row"><div className="profile-avatar">D</div><div><b>Studio owner</b><small>SimeonJr Studios</small></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="crumb"><button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={19} /></button><span>Workspace</span><span className="crumb-slash">/</span><b>{activeNav}</b></div>
          <div className="top-actions"><div className="system-status"><span /> Systems initializing</div><button className="icon-button" aria-label="Search" onClick={() => setNotice("Search will be available as projects and files are added.")}><Search size={18} /></button><button className="icon-button" aria-label="Activity" onClick={() => setNotice("No new notifications.")}><Activity size={18} /></button><div className="top-avatar">D</div></div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR CREATIVE COMMAND CENTRE</div><h1>{greeting}, <span>Creator.</span></h1><p>Big ideas deserve the tools to make them real. What are we building today?</p></div>
            <div className="date-chip"><Clock3 size={14} /> Your workspace · Private</div>
          </section>

          {activeNav === "Overview" || activeNav === "AI workspace" ? (
            <>
              <section className="builder-card">
                <div className="builder-top"><div><div className="builder-kicker"><WandSparkles size={15} /> THE SIMEONY CREATION ENGINE</div><h2>Start with an idea.</h2><p>Describe what you imagine. We'll help shape it into a build plan.</p></div><div className="orb-wrap"><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb-core"><Sparkles size={25} /></div></div></div>
                <div className="prompt-box"><textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setNotice(""); }} placeholder="I want to build a modern e-commerce platform with customer accounts, product management and online payments..." rows={3} /><div className="prompt-footer"><span><Command size={13} /> Describe your idea in plain language</span><button className="create-button" onClick={createProject}><Sparkles size={15} /> Create project <ArrowRight size={15} /></button></div></div>
                <div className="mode-row"><span className="mode-label">CREATION MODE</span>{(["Simple", "Studio", "Expert"] as Mode[]).map((item) => <button key={item} className={`mode-chip ${mode === item ? "selected" : ""}`} onClick={() => setMode(item)}>{item === "Simple" ? <Sparkles size={13} /> : item === "Studio" ? <Code2 size={13} /> : <Cpu size={13} />}{item}{item === "Simple" && <span className="recommended">START HERE</span>}</button>)}<span className="mode-hint">{mode === "Simple" ? "Guided creation, step by step" : mode === "Studio" ? "More control over your stack and workflow" : "Advanced project planning and integrations"}</span></div>
              </section>

              <section className="quick-section"><div className="section-heading"><div><h3>What do you want to create?</h3><p>Choose a starting point. You can change direction anytime.</p></div><button className="text-link" onClick={() => setActiveNav("Creation engines")}>Explore capabilities <ArrowUpRight size={14} /></button></div>
                <div className="quick-grid">
                  <button className="quick-card" onClick={() => { setPrompt("Build a responsive website for "); document.querySelector<HTMLTextAreaElement>(".prompt-box textarea")?.focus(); }}><div className="quick-icon purple"><Globe2 size={19} /></div><b>Websites & apps</b><span>Websites, dashboards, SaaS and APIs</span><ArrowUpRight className="quick-arrow" size={15} /></button>
                  <button className="quick-card" onClick={() => { setPrompt("Build a mobile app for "); document.querySelector<HTMLTextAreaElement>(".prompt-box textarea")?.focus(); }}><div className="quick-icon blue"><Box size={19} /></div><b>Mobile & desktop</b><span>iOS, Android and desktop software</span><ArrowUpRight className="quick-arrow" size={15} /></button>
                  <button className="quick-card" onClick={() => { setPrompt("Create a 3D game where "); document.querySelector<HTMLTextAreaElement>(".prompt-box textarea")?.focus(); }}><div className="quick-icon orange"><Gamepad2 size={19} /></div><b>Games & 3D worlds</b><span>Games, simulations and 3D experiences</span><ArrowUpRight className="quick-arrow" size={15} /></button>
                  <button className="quick-card" onClick={() => { setPrompt("Create an AI assistant that "); document.querySelector<HTMLTextAreaElement>(".prompt-box textarea")?.focus(); }}><div className="quick-icon green"><Bot size={19} /></div><b>AI & automation</b><span>Assistants, agents and smart workflows</span><ArrowUpRight className="quick-arrow" size={15} /></button>
                </div>
              </section>
            </>
          ) : activeNav === "Projects" ? (
            <section className="projects-view"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR WORK</div><h2 className="page-title">Your projects</h2><p>Every great product starts somewhere.</p></div><button className="create-button" onClick={() => setActiveNav("Overview")}><Plus size={15} /> New project</button></div><div className="project-list">{projects.map((project) => <article className="project-row" key={project.id}><div className="project-icon">{iconFor(project.icon)}</div><div className="project-info"><b>{project.name}</b><span>{project.kind}</span></div><span className="project-status"><i />{project.status}</span><span className="project-updated">{project.updated}</span><button className="icon-button" aria-label="Project options"><MoreHorizontal size={18} /></button></article>)}</div></section>
          ) : (
            <section className="engines-view"><div className="eyebrow"><span className="eyebrow-line" /> THE SIMEONY ECOSYSTEM</div><h2 className="page-title">Creation engines</h2><p className="view-intro">A connected toolkit for turning ambitious ideas into real products.</p><div className="engine-grid">{[{icon:<Globe2/>,name:"Web & software",desc:"Frontend, backend, APIs and databases",state:"Foundation planned"},{icon:<Box/>,name:"Mobile & desktop",desc:"Cross-platform and native applications",state:"Integration planned"},{icon:<Gamepad2/>,name:"Games & 3D",desc:"Interactive worlds, engines and assets",state:"Integration planned"},{icon:<AudioLines/>,name:"Media & animation",desc:"Creative production and visual storytelling",state:"Integration planned"},{icon:<Bot/>,name:"AI & agents",desc:"Intelligent workflows and task execution",state:"Integration planned"},{icon:<Workflow/>,name:"Automation",desc:"Connected processes and repeatable tasks",state:"Integration planned"}].map((engine) => <article className="engine-card" key={engine.name}><div className="engine-icon">{engine.icon}</div><b>{engine.name}</b><p>{engine.desc}</p><span>{engine.state}</span></article>)}</div></section>
          )}

          <section className="bottom-strip"><div className="bottom-icon"><ShieldCheck size={17} /></div><div><b>Your workspace, your rules.</b><span>Nothing is deployed or charged without your approval.</span></div><span className="foundation-tag"><Check size={12} /> FOUNDATION MODE</span></section>
          {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div>}
          <footer><span>© 2026 SIMEONY · SIMEONJR STUDIOS</span><span>BUILD BEYOND IMAGINATION <Sparkles size={12} /></span></footer>
        </div>
      </main>
    </div>
  );
}

function SmartphoneIcon() {
  return <Box size={16} />;
}
