import type { AgentProvider } from "./provider";

export const mockAgentProvider: AgentProvider = Object.freeze({
  id: "mock",
  label: "Offline mock provider",
  capabilities: Object.freeze(["text_generation"] as const),
  async complete(request, signal) {
    if (signal?.aborted) {
      throw new DOMException("The operation was aborted", "AbortError");
    }

    const lines = [
      `Mock execution for: ${request.task.title}`,
      `Assigned specialist: ${request.role}`,
      "",
      "This is a deterministic test response, not an AI-generated implementation.",
      `Objective: ${request.goal}`,
      `Task: ${request.task.description}`,
      request.context.length ? `Context supplied: ${request.context.length} item(s).` : "No additional context supplied.",
      "",
      "Next step: connect an explicitly approved real provider before treating this task output as production work.",
    ];
    const content = lines.join("\n").slice(0, request.maxOutputCharacters);

    if (signal?.aborted) {
      throw new DOMException("The operation was aborted", "AbortError");
    }

    return { content, model: "deterministic-mock-v1", finishReason: "stop" as const };
  },
});
