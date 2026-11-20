import type { AgentRole, WorkTask } from "./orchestration";

export type ProviderCapability = "text_generation";

export interface AgentCompletionRequest {
  readonly agentId: string;
  readonly role: AgentRole;
  readonly goal: string;
  readonly task: Readonly<WorkTask>;
  readonly context: readonly string[];
  readonly maxOutputCharacters: number;
}

export interface AgentCompletion {
  readonly content: string;
  readonly model: string;
  readonly finishReason: "stop" | "length";
}

export interface AgentProvider {
  readonly id: string;
  readonly label: string;
  readonly capabilities: readonly ProviderCapability[];
  complete(
    request: AgentCompletionRequest,
    signal?: AbortSignal,
  ): Promise<AgentCompletion>;
}

export interface ProviderAgentProfile {
  readonly id: string;
  readonly role: AgentRole;
  readonly label: string;
  readonly enabled: boolean;
  readonly providerId: string | null;
}

export interface AgentExecutionResult {
  readonly taskId: string;
  readonly status: "completed" | "blocked" | "failed" | "cancelled";
  readonly agentId?: string;
  readonly providerId?: string;
  readonly model?: string;
  readonly output?: string;
  readonly reason?: string;
}
