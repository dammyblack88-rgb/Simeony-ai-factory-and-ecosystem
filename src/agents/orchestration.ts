export type AgentRole =
  | "architect"
  | "researcher"
  | "implementer"
  | "reviewer"
  | "tester"
  | "integrator";

export type TaskStatus =
  | "blocked"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ApprovalKind =
  | "external_network"
  | "secret_access"
  | "paid_resource"
  | "deployment"
  | "merge"
  | "destructive_change";

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  role: AgentRole;
  dependsOn: string[];
  status: TaskStatus;
  approvalRequired?: ApprovalKind[];
}

export interface AgentProfile {
  id: string;
  role: AgentRole;
  label: string;
  enabled: boolean;
  providerId: string | null;
}

export interface ApprovalDecision {
  kind: ApprovalKind;
  approved: boolean;
  approvedBy?: string;
  reason?: string;
}

export interface WorkPlan {
  schemaVersion: 1;
  id: string;
  goal: string;
  tasks: WorkTask[];
  createdAt: string;
}

const APPROVAL_KINDS: ApprovalKind[] = [
  "external_network",
  "secret_access",
  "paid_resource",
  "deployment",
  "merge",
  "destructive_change",
  "repository_write",
  "command_execution",
];

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function validateTask(task: WorkTask): void {
  requiredText(task.id, "task.id");
  requiredText(task.title, "task.title");
  requiredText(task.description, "task.description");
  if (!["architect", "researcher", "implementer", "reviewer", "tester", "integrator"].includes(task.role)) {
    throw new RangeError("Unsupported task role");
  }
  if (!Array.isArray(task.dependsOn) || new Set(task.dependsOn).size !== task.dependsOn.length) {
    throw new TypeError("task.dependsOn must be a unique array");
  }
  if (!["blocked", "ready", "running", "completed", "failed", "cancelled"].includes(task.status)) {
    throw new RangeError("Unsupported task status");
  }
  for (const kind of task.approvalRequired ?? []) {
    if (!APPROVAL_KINDS.includes(kind)) throw new RangeError(`Unsupported approval kind: ${kind}`);
  }
}

/** Validate references and reject cycles before a plan can be scheduled. */
export function validateWorkPlan(plan: WorkPlan): true {
  if (!plan || plan.schemaVersion !== 1 || !Array.isArray(plan.tasks)) {
    throw new TypeError("A supported work plan is required");
  }
  requiredText(plan.id, "plan.id");
  requiredText(plan.goal, "plan.goal");
  const ids = new Set<string>();
  for (const task of plan.tasks) {
    validateTask(task);
    if (ids.has(task.id)) throw new RangeError(`Duplicate task ID: ${task.id}`);
    ids.add(task.id);
  }
  for (const task of plan.tasks) {
    for (const dependency of task.dependsOn) {
      if (!ids.has(dependency)) throw new RangeError(`Unknown dependency ${dependency} for task ${task.id}`);
      if (dependency === task.id) throw new RangeError("A task cannot depend on itself");
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(plan.tasks.map(task => [task.id, task]));
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new RangeError("Work plan contains a dependency cycle");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)!.dependsOn) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of ids) visit(id);
  return true;
}

/** Return only tasks whose dependencies have completed. No code is executed here. */
export function getReadyTasks(plan: WorkPlan): WorkTask[] {
  validateWorkPlan(plan);
  const completed = new Set(plan.tasks.filter(task => task.status === "completed").map(task => task.id));
  return plan.tasks
    .filter(task => task.status === "ready" || task.status === "blocked")
    .filter(task => task.dependsOn.every(id => completed.has(id)))
    .map(task => ({ ...task, status: "ready" }));
}

/** Match a task to an enabled specialist; disabled/unconfigured agents never run. */
export function selectAgent(task: WorkTask, agents: AgentProfile[]): AgentProfile | null {
  validateTask(task);
  if (!Array.isArray(agents)) throw new TypeError("agents must be an array");
  return agents.find(agent =>
    agent.enabled &&
    agent.role === task.role &&
    typeof agent.id === "string" &&
    agent.id.trim() !== "" &&
    typeof agent.providerId === "string" &&
    agent.providerId.trim() !== ""
  ) ?? null;
}

/** Fail closed: consequential operations require an explicit approved decision. */
export function authorizeOperation(
  kind: ApprovalKind,
  decisions: ApprovalDecision[] = [],
): { allowed: boolean; reason: string } {
  if (!APPROVAL_KINDS.includes(kind)) throw new RangeError("Unsupported operation approval kind");
  const decision = decisions.find(item => item.kind === kind && item.approved === true);
  if (!decision) return { allowed: false, reason: `Human approval required: ${kind}` };
  if (!decision.approvedBy || decision.approvedBy.trim() === "") {
    return { allowed: false, reason: "Approval must identify the approving user" };
  }
  return { allowed: true, reason: "Explicit approval recorded" };
}

/** A deterministic, provider-neutral starter plan. It is not an AI-generated plan. */
export function createStarterWorkPlan(
  goal: string,
  id: string,
  createdAt: string,
): WorkPlan {
  const safeGoal = requiredText(goal, "goal");
  const safeId = requiredText(id, "id");
  const safeTime = requiredText(createdAt, "createdAt");
  const tasks: WorkTask[] = [
    { id: safeId + "-scope", title: "Clarify scope and acceptance criteria", description: "Define the outcome, constraints and measurable completion criteria.", role: "architect", dependsOn: [], status: "ready" },
    { id: safeId + "-research", title: "Inspect existing tools and reusable projects", description: "Compare available dependencies, open-source options, licences and compatibility before building new components.", role: "researcher", dependsOn: [safeId + "-scope"], status: "blocked" },
    { id: safeId + "-implement", title: "Implement the smallest useful increment", description: "Make a focused change in an isolated workspace and preserve existing user data.", role: "implementer", dependsOn: [safeId + "-research"], status: "blocked" },
    { id: safeId + "-test", title: "Run tests and security checks", description: "Verify acceptance criteria, regressions, dependency health and security boundaries.", role: "tester", dependsOn: [safeId + "-implement"], status: "blocked" },
    { id: safeId + "-review", title: "Review changes and prepare handoff", description: "Summarise evidence, risks and remaining decisions; never merge or deploy without approval.", role: "reviewer", dependsOn: [safeId + "-test"], status: "blocked" },
  ];
  const plan: WorkPlan = { schemaVersion: 1, id: safeId, goal: safeGoal, tasks, createdAt: safeTime };
  validateWorkPlan(plan);
  return plan;
}

export const orchestrationPolicy = Object.freeze({
  schemaVersion: 1,
  roles: Object.freeze(["architect", "researcher", "implementer", "reviewer", "tester", "integrator"]),
  approvalsRequiredFor: Object.freeze(APPROVAL_KINDS),
  executionEnabled: false,
  providerConfigurationRequired: true,
});
