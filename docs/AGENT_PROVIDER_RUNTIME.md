# SIMEONY provider contract and guarded runtime

**Status: provider-neutral text execution contract implemented with an offline mock. No real AI provider or coding-tool execution is connected.**

## What this milestone adds

- A provider interface with one capability: bounded text generation.
- A deterministic mock provider for tests and offline development.
- A task runner that requires a valid plan, a ready task, completed prerequisites, an enabled specialist and an explicitly configured provider.
- Approval checks for task-level consequential operations.
- Bounded context and output sizes, cancellation handling and normalized execution results.
- Tests for success, missing configuration, prerequisites, approvals, oversized inputs and cancellation.

## Deliberate security boundary

The provider interface does not expose shell commands, filesystem access, browser automation, network access, secrets, Git operations or deployment. The mock provider is not an AI model and does not write code. Its output is clearly labelled as a deterministic test response.

This is an execution contract, not yet an autonomous coding agent. A future tool broker must be a separate server-side service with isolated workspaces, command allowlists, resource limits, audit logs, cancellation and explicit approval gates. Provider credentials must never be placed in browser code.

## Next implementation

1. Add a server-side provider gateway and secure credential storage.
2. Add one optional provider adapter only after the owner approves the provider and its spend limit.
3. Add isolated repository workspaces and a restricted tool broker.
4. Add GitHub branch and pull-request operations with no automatic merge.
5. Add persistent task state and scheduled workers only after runtime, cancellation and cost controls are proven.

## Verification

CI runs type-checking, tests and the production build. This branch must pass those checks before its pull request is considered ready.
