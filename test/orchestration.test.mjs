import test from "node:test";
import assert from "node:assert/strict";
import {
  authorizeOperation,
  createStarterWorkPlan,
  getReadyTasks,
  selectAgent,
  validateWorkPlan,
} from "../src/agents/orchestration.ts";

test("starter plan exposes only the first task as ready", () => {
  const plan = createStarterWorkPlan("Build a research dashboard", "project-1", "2026-11-21T00:00:00.000Z");
  assert.equal(validateWorkPlan(plan), true);
  assert.deepEqual(getReadyTasks(plan).map(task => task.id), ["project-1-scope"]);
});

test("dependent task becomes ready only after its prerequisite completes", () => {
  const plan = createStarterWorkPlan("Build a game", "game-1", "2026-11-21T00:00:00.000Z");
  plan.tasks[0].status = "completed";
  assert.deepEqual(getReadyTasks(plan).map(task => task.id), ["game-1-research"]);
});

test("rejects dependency cycles and missing task references", () => {
  const plan = createStarterWorkPlan("Build a tool", "tool-1", "2026-11-21T00:00:00.000Z");
  plan.tasks[0].dependsOn = ["tool-1-test"];
  assert.throws(() => validateWorkPlan(plan), /cycle/);
  plan.tasks[0].dependsOn = ["missing-task"];
  assert.throws(() => validateWorkPlan(plan), /Unknown dependency/);
});

test("only enabled specialists with configured providers are selected", () => {
  const task = createStarterWorkPlan("Build a tool", "tool-2", "2026-11-21T00:00:00.000Z").tasks[0];
  assert.equal(selectAgent(task, [{ id: "a1", role: "architect", label: "Architect", enabled: true, providerId: null }]), null);
  assert.equal(selectAgent(task, [{ id: "a2", role: "architect", label: "Architect", enabled: true, providerId: "mock" }])?.id, "a2");
});

test("consequential actions fail closed until a named user approves", () => {
  assert.equal(authorizeOperation("deployment").allowed, false);
  assert.equal(authorizeOperation("deployment", [{ kind: "deployment", approved: true }]).allowed, false);
  assert.equal(authorizeOperation("deployment", [{ kind: "deployment", approved: true, approvedBy: "owner" }]).allowed, true);
});
