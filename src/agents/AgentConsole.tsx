import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, CircleDot, ClipboardList, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { createStarterWorkPlan, getReadyTasks } from "./orchestration";

const specialists = [
  { role: "architect", name: "Chief architect", task: "Scope, design and acceptance criteria" },
  { role: "researcher", name: "Open-source researcher", task: "Reuse, dependencies and licences" },
  { role: "implementer", name: "Software / game builder", task: "Scoped implementation work" },
  { role: "tester", name: "QA and security", task: "Tests, regressions and security" },
  { role: "reviewer", name: "Independent reviewer", task: "Challenge decisions and inspect diffs" },
  { role: "integrator", name: "Integration manager", task: "Branches, pull requests and reports" },
] as const;

export default function AgentConsole() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<ReturnType<typeof createStarterWorkPlan> | null>(null);
  const [error, setError] = useState("");
  const ready = useMemo(() => plan ? getReadyTasks(plan) : [], [plan]);

  function createPlan() {
    if (!goal.trim()) {
      setError("Describe the outcome you want the specialists to plan.");
      return;
    }
    try {
      const id = globalThis.crypto?.randomUUID?.() ?? `plan-${Date.now()}`;
      setPlan(createStarterWorkPlan(goal.trim(), id, new Date().toISOString()));
      setError("");
    } catch {
      setError("The plan could not be created. Check the request and try again.");
    }
  }

  return (
    <section className="agent-console">
      <div className="eyebrow"><span className="eyebrow-line" /> SIMEONY INTELLIGENCE</div>
      <div className="agent-hero">
        <div>
          <h1 className="page-title">Agent workspace</h1>
          <p className="view-intro">A coordinated team of specialist roles for research, planning, building and independent review.</p>
        </div>
        <div className="agent-hero-mark"><Bot size={29} /></div>
      </div>

      <div className="agent-boundary">
        <ShieldCheck size={17} />
        <div><b>Safe planning mode is active</b><span>AI providers and isolated code execution are not connected yet. This workspace creates a real dependency-aware plan; it does not pretend to run agents.</span></div>
        <span className="agent-state">PLANNING ONLY</span>
      </div>

      <article className="workspace-panel agent-plan-panel">
        <div className="panel-heading">
          <div><h3>Give the team an objective</h3><p>SIMEONY will prepare a structured work sequence using its local orchestration engine.</p></div>
          <Sparkles size={18} />
        </div>
        <textarea className="agent-goal-input" value={goal} onChange={event => setGoal(event.target.value)} rows={3} placeholder="Example: Build a playable Lagos life-simulation district using existing open-source engines, assets and tools before writing new systems." />
        {error && <p className="agent-error" role="alert"><AlertTriangle size={14} /> {error}</p>}
        <div className="agent-form-footer">
          <span><ClipboardList size={14} /> No external AI call or paid service is used.</span>
          <button className="create-button" onClick={createPlan}><Sparkles size={14} /> Create work plan <ArrowRight size={14} /></button>
        </div>
      </article>

      {plan && (
        <article className="workspace-panel agent-plan-result">
          <div className="panel-heading">
            <div><h3>Work plan created</h3><p>{plan.goal}</p></div>
            <span className="agent-plan-count">{plan.tasks.length} tasks</span>
          </div>
          <div className="agent-ready-row"><CircleDot size={15} /><span>{ready.length} task ready to begin after an execution provider is connected</span></div>
          <div className="agent-task-list">
            {plan.tasks.map((task, index) => (
              <div className="agent-task" key={task.id}>
                <span className="agent-task-number">{String(index + 1).padStart(2, "0")}</span>
                <div><b>{task.title}</b><p>{task.description}</p><small>{task.role} · {task.dependsOn.length ? "Waiting for prerequisite" : "No prerequisite"}</small></div>
                <span className={task.status === "ready" ? "agent-task-ready" : "agent-task-blocked"}>{task.status === "ready" ? "Ready" : "Blocked"}</span>
              </div>
            ))}
          </div>
        </article>
      )}

      <div className="section-heading agent-section-heading"><div><h3>The specialist team</h3><p>Independent responsibilities; execution remains disabled until configured.</p></div></div>
      <div className="agent-specialist-grid">
        {specialists.map(agent => (
          <article className="agent-specialist" key={agent.role}>
            <div className="agent-specialist-icon"><Bot size={17} /></div>
            <div><b>{agent.name}</b><p>{agent.task}</p><span><CircleDot size={11} /> Provider not connected</span></div>
          </article>
        ))}
      </div>

      <article className="workspace-panel agent-guardrails">
        <div className="panel-heading"><div><h3>Human approval gates</h3><p>These actions stay blocked until you explicitly approve them.</p></div><LockKeyhole size={18} /></div>
        <div className="agent-gates">
          {["Paid tools, credits or cloud resources", "Secrets and external account access", "Destructive edits or deleting user data", "Production deployment and publishing", "Merging code into protected branches"].map(item => <span key={item}><CheckCircle2 size={14} /> {item}</span>)}
        </div>
      </article>
    </section>
  );
}
