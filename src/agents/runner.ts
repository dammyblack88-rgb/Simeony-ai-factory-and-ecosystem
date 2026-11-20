import {
  authorizeOperation,
  selectAgent,
  validateWorkPlan,
  type AgentProfile,
  type ApprovalDecision,
  type WorkPlan,
  type WorkTask,
} from "./orchestration.ts";
import type { AgentExecutionResult, AgentProvider } from "./provider";

const MAX_CONTEXT_ITEMS = 20;
const MAX_CONTEXT_CHARACTERS = 20_000;
const DEFAULT_MAX_OUTPUT_CHARACTERS = 12_000;

export interface RunTaskOptions {
  readonly plan: WorkPlan;
  readonly task: WorkTask;
  readonly agents: AgentProfile[];
  readonly providers: AgentProvider[];
  readonly completedTaskIds: readonly string[];
  readonly context?: readonly string[];
  readonly approvals?: ApprovalDecision[];
  readonly signal?: AbortSignal;
  readonly maxOutputCharacters?: number;
}

function blocked(taskId: string, reason: string): AgentExecutionResult {
  return { taskId, status: "blocked", reason };
}

/**
 * Execute one ready task through an explicitly configured text provider.
 * This broker grants no shell, filesystem, browser, network or GitHub tools.
 */
export async function runReadyTask(options: RunTaskOptions): Promise<AgentExecutionResult> {
  const { plan, task, agents, providers } = options;
  validateWorkPlan(plan);

  const plannedTask = plan.tasks.find(item => item.id === task.id);
  if (!plannedTask) return blocked(task.id, "Task does not belong to the supplied work plan.");
  if (plannedTask.status !== "ready" || task.status !== "ready") {
    return blocked(task.id, "Only a ready task in the supplied work plan can be executed.");
  }
  if (!plannedTask.dependsOn.every(id => options.completedTaskIds.includes(id))) {
    return blocked(task.id, "One or more prerequisite tasks are not completed.");
  }

  const agent = selectAgent(plannedTask, agents);
  if (!agent) return blocked(task.id, "No enabled specialist with a configured provider matches this role.");

  const provider = providers.find(item => item.id === agent.providerId);
  if (!provider || !provider.capabilities.includes("text_generation")) {
    return blocked(task.id, "The selected provider is unavailable or lacks text-generation capability.");
  }

  for (const kind of plannedTask.approvalRequired ?? []) {
    const authorization = authorizeOperation(kind, options.approvals ?? []);
    if (!authorization.allowed) return blocked(task.id, authorization.reason);
  }

  const context = options.context ?? [];
  if (!Array.isArray(context) || context.length > MAX_CONTEXT_ITEMS ||
      context.some(item => typeof item !== "string") ||
      context.reduce((total, item) => total + item.length, 0) > MAX_CONTEXT_CHARACTERS) {
    return blocked(task.id, "Context exceeds the allowed size or contains invalid entries.");
  }

  const maxOutputCharacters = options.maxOutputCharacters ?? DEFAULT_MAX_OUTPUT_CHARACTERS;
  if (!Number.isInteger(maxOutputCharacters) || maxOutputCharacters < 1 ||
      maxOutputCharacters > DEFAULT_MAX_OUTPUT_CHARACTERS) {
    return blocked(task.id, "Output limit is outside the permitted range.");
  }

  if (options.signal?.aborted) return { taskId: task.id, status: "cancelled", reason: "Execution was cancelled before it started." };

  try {
    const completion = await provider.complete({
      agentId: agent.id,
      role: agent.role,
      goal: plan.goal,
      task: plannedTask,
      context: [...context],
      maxOutputCharacters,
    }, options.signal);

    if (options.signal?.aborted) {
      return { taskId: task.id, status: "cancelled", agentId: agent.id, providerId: provider.id, reason: "Execution was cancelled." };
    }
    if (!completion || typeof completion.content !== "string" ||
        completion.content.trim().length === 0 ||
        completion.content.length > maxOutputCharacters ||
        typeof completion.model !== "string" || completion.model.trim().length === 0 ||
        !["stop", "length"].includes(completion.finishReason)) {
      return { taskId: task.id, status: "failed", agentId: agent.id, providerId: provider.id, reason: "Provider returned an invalid or oversized completion." };
    }

    return {
      taskId: task.id,
      status: "completed",
      agentId: agent.id,
      providerId: provider.id,
      model: completion.model,
      output: completion.content,
    };
  } catch (error) {
    if (options.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      return { taskId: task.id, status: "cancelled", agentId: agent.id, providerId: provider.id, reason: "Execution was cancelled." };
    }
    return { taskId: task.id, status: "failed", agentId: agent.id, providerId: provider.id, reason: "Provider execution failed. Inspect the provider's private diagnostic logs." };
  }
}
