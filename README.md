# SIMEONY

**Build beyond imagination.**  
An independent creation platform by SimeonJr Studios.

SIMEONY is being developed as a unified workspace for planning and creating software, applications, AI workflows, games and creative projects.

## Current milestone

This repository contains the first responsive React + TypeScript application shell:

- Overview and creation workspace
- Simple, Studio and Expert creation modes
- Project list and idea capture
- Creation-engine catalogue
- Responsive navigation and dark studio interface

The first provider-neutral agent orchestration core is now implemented on the current feature branch. It defines specialist roles, dependency-aware tasks, human approval gates and automated tests. It does not yet execute code or connect to an AI provider.

- [Agent orchestration foundation](./docs/AGENT_ORCHESTRATION_FOUNDATION.md)

## Development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Verification:

```bash
npm run typecheck
npm test
npm run build
```

## Important status

The current interface is a foundation, not yet an autonomous coding agent. Project ideas are currently held in browser memory only. Authentication, persistent database storage, model integrations, isolated execution, testing pipelines and deployment adapters are still future milestones.

No paid API, cloud service or deployment is enabled by this change.

See [the master development prompt](./docs/SIMEONY_MASTER_BUILD_PROMPT.md) for the governing product vision and engineering principles.
