# SIMEONY agent orchestration foundation

**Status: first provider-neutral orchestration contract committed. Not yet an autonomous coding runner.**

## What is now implemented

`src/agents/orchestration.ts` provides:

- Six specialist roles: architect, researcher, implementer, reviewer, tester and integrator.
- Versioned work-plan and task contracts.
- Dependency validation, including missing references, duplicate IDs and cycle detection.
- Deterministic ready-task selection after dependencies complete.
- Agent selection that ignores disabled agents and agents without a configured provider.
- Fail-closed approval checks for external network access, secrets, paid resources, deployment, merges and destructive changes.
- A deterministic starter checklist. It is explicitly not represented as AI-generated reasoning.

## What is deliberately not enabled

- No model provider is connected.
- No shell, browser, filesystem or repository execution is exposed to an agent.
- No background worker or overnight schedule exists yet.
- No credentials or secrets are stored in the browser.
- No paid resources, deployments or automatic merges are enabled.

This boundary is intentional. The next implementation must add a server-side execution broker with isolated workspaces, per-project permissions, auditable tool calls, bounded runtime, cancellation, logs and human approval. A browser-only app must never receive provider API keys.

## Target specialist workflow

1. Architect turns the user's outcome into acceptance criteria and a dependency-aware plan.
2. Researcher inventories installed tools, existing repositories, open-source projects and licences.
3. Implementer works only in a scoped branch/worktree.
4. Tester runs the project's own checks and reports actual output.
5. Reviewer checks the diff, security, licence obligations and test evidence.
6. Integrator prepares a pull request. Merge and deployment remain explicit human decisions.

Agents should be able to disagree. The coordinator records competing proposals with evidence, risks and a reasoned recommendation; it must not silently treat multiple model opinions as truth.

## Provider strategy

Keep a provider-neutral interface. Start with local/manual tools and free existing integrations. Later, add optional adapters for approved providers such as Claude and ChatGPT/Astra when the owner supplies credentials and approves costs. Provider choice, model, token budget and spend ceiling must be configurable per workspace. If no provider is configured, SIMEONY remains useful for planning and tracking but does not claim to execute AI work.

## Next milestones

- Add unit tests for the orchestration contracts and task graph.
- Add a persistent server-side project/task store with workspace isolation.
- Add authentication and role-based access before exposing private project data.
- Add provider adapter contracts and a mock provider for deterministic tests.
- Add a tool broker with allowlists, sandboxing, command budgets, cancellation and audit logs.
- Add GitHub branch/PR integration using least-privilege tokens.
- Add scheduled cloud runs only after a real worker, cost limits and approval controls are in place.
- Add a dashboard that shows each specialist's assignment, evidence, status and blockers.

## Verification

Run `npm install`, `npm run typecheck` and `npm run build` in the repository. The new module has not yet been compiled in this environment; CI must verify it before merging.
