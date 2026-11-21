import test from "node:test";
import assert from "node:assert/strict";
import { authorizeWorkspaceTool } from "../src/agents/workspace-tool-policy.ts";
const writeApproval = [{ kind: "repository_write" as const, approved: true, approvedBy: "owner" }];
const commandApproval = [{ kind: "command_execution" as const, approved: true, approvedBy: "owner" }];
test("allows a safe read-only source path", () => {
  assert.equal(authorizeWorkspaceTool({ kind: "read_file", path: "src/agents/runner.ts" }).allowed, true);
});
test("blocks traversal, absolute paths and secret areas", () => {
  for (const path of ["../.env", "/etc/passwd", "src/../../secret", ".git/config", "node_modules/pkg/index.js", "src\\main.ts"]) {
    assert.equal(authorizeWorkspaceTool({ kind: "read_file", path }).allowed, false, path);
  }
});
test("requires named human approval before proposing a write", () => {
  assert.equal(authorizeWorkspaceTool({ kind: "propose_write_file", path: "src/new.ts", content: "export {};" }).allowed, false);
  assert.equal(authorizeWorkspaceTool({ kind: "propose_write_file", path: "src/new.ts", content: "export {};" }, writeApproval).allowed, true);
  assert.equal(authorizeWorkspaceTool({ kind: "propose_write_file", path: "package.json", content: "{}" }, writeApproval).allowed, false);
  assert.equal(authorizeWorkspaceTool({ kind: "propose_write_file", path: "src/new.ts", content: "x".repeat(100_001) }, writeApproval).allowed, false);
});
test("only permits fixed checks and requires explicit approval", () => {
  assert.equal(authorizeWorkspaceTool({ kind: "run_check", command: "test" }).allowed, false);
  const result = authorizeWorkspaceTool({ kind: "run_check", command: "test" }, commandApproval);
  assert.equal(result.allowed, true);
  assert.equal(result.limits?.timeoutMs, 120_000);
  assert.equal(authorizeWorkspaceTool({ kind: "run_check", command: "typecheck; rm -rf /" as never }, commandApproval).allowed, false);
});
test("does not accept unnamed write authorization", () => {
  const unnamed = [{ kind: "repository_write" as const, approved: true }];
  assert.equal(authorizeWorkspaceTool({ kind: "propose_write_file", path: "docs/plan.md", content: "plan" }, unnamed).allowed, false);
});
