# Isolated workspace tool policy

**Status: policy contract only. No repository files are accessed and no process is launched by this module.**

This milestone defines the permission boundary a future SIMEONY coding worker must pass before an isolated executor is built.

## Allowed request shapes

- Read a repository-relative path, excluding .git, node_modules, environment files and secret directories.
- Propose a file write only under src/, test/, tests/ or docs/. Content is capped at 100,000 characters and requires a named human repository_write approval.
- Request only the fixed typecheck, test or build checks. They require a named human command_execution approval and carry a 120-second / 20,000-character output budget.

## Explicitly not implemented

- No filesystem adapter, shell, process runner, browser, network, GitHub mutation, secret access, deployment, merge or background worker.
- No arbitrary command strings, command arguments, working-directory selection or environment-variable injection.
- The policy result is not proof that a request is safe. A future server-side executor must independently revalidate paths, permissions and limits at execution time.

## Required next safeguards

1. Run in a disposable, per-task workspace and non-privileged OS/container identity.
2. Mount only the selected repository snapshot; never mount host home directories or credential stores.
3. Enforce CPU, memory, disk, process-count and wall-clock quotas outside the agent process.
4. Record immutable audit events for approval, tool request, result and cancellation.
5. Keep provider credentials server-side and deny network access by default.
6. Return a patch for review; never merge or deploy automatically.
