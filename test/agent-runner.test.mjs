import test from "node:test";
import assert from "node:assert/strict";
import { createStarterWorkPlan } from "../src/agents/orchestration.ts";
import { mockAgentProvider } from "../src/agents/mock-provider.ts";
import { runReadyTask } from "../src/agents/runner.ts";

function setup() {
  const plan = createStarterWorkPlan("Improve the existing game safely", "next-world", "2026-11-21T00:00:00.000Z");
  const task = plan.tasks[0];
  const agents = [{ id: "architect-1", role: "architect", label: "Architect", enabled: true, providerId: "mock" }];
  return { plan, task, agents, providers: [mockAgentProvider] };
}

test("runs a ready task through the explicit offline mock provider", async () => {
  const options = setup();
  const result = await runReadyTask({ ...options, completedTaskIds: [] });
  assert.equal(result.status, "completed");
  assert.equal(result.providerId, "mock");
  assert.match(result.output, /not an AI-generated implementation/);
});

test("blocks tasks without a configured specialist or provider", async () => {
  const options = setup();
  const noAgent = await runReadyTask({ ...options, agents: [], completedTaskIds: [] });
  assert.equal(noAgent.status, "blocked");
  const noProvider = await runReadyTask({ ...options, providers: [], completedTaskIds: [] });
  assert.equal(noProvider.status, "blocked");
});

test("blocks tasks whose prerequisites are incomplete", async () => {
  const options = setup();
  options.task.dependsOn = ["required-first"];
  const result = await runReadyTask({ ...options, completedTaskIds: [] });
  assert.equal(result.status, "blocked");
  assert.match(result.reason, /prerequisite/);
});

test("does not trust a caller-modified task status over the stored plan", async () => {
  const options = setup();
  const blockedTask = options.plan.tasks[1];
  const forgedTask = { ...blockedTask, status: "ready" };
  const result = await runReadyTask({ ...options, task: forgedTask, completedTaskIds: [options.plan.tasks[0].id] });
  assert.equal(result.status, "blocked");
  assert.match(result.reason, /ready task in the supplied work plan/);
});

test("requires named approval for consequential task operations", async () => {
  const options = setup();
  options.task.approvalRequired = ["external_network"];
  const blocked = await runReadyTask({ ...options, completedTaskIds: [] });
  assert.equal(blocked.status, "blocked");
  const allowed = await runReadyTask({
    ...options,
    completedTaskIds: [],
    approvals: [{ kind: "external_network", approved: true, approvedBy: "owner" }],
  });
  assert.equal(allowed.status, "completed");
});

test("rejects oversized context and output limits", async () => {
  const options = setup();
  const context = await runReadyTask({ ...options, completedTaskIds: [], context: ["x".repeat(20_001)] });
  assert.equal(context.status, "blocked");
  const output = await runReadyTask({ ...options, completedTaskIds: [], maxOutputCharacters: 12_001 });
  assert.equal(output.status, "blocked");
});

test("honours cancellation before provider execution", async () => {
  const options = setup();
  const controller = new AbortController();
  controller.abort();
  const result = await runReadyTask({ ...options, completedTaskIds: [], signal: controller.signal });
  assert.equal(result.status, "cancelled");
});

test("does not expose arbitrary tool execution through the provider contract", () => {
  assert.deepEqual(mockAgentProvider.capabilities, ["text_generation"]);
  assert.equal("executeCommand" in mockAgentProvider, false);
  assert.equal("runShell" in mockAgentProvider, false);
});
