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

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Automated tests:

```bash
npm test
```

## Browser data recovery limits

The current browser-only workspace validates and caps stored data to keep malformed or outdated
records from breaking the Studio:

- 500 projects
- 500 tasks per project
- 500-character project descriptions
- 500-character activity messages
- 100 activity entries per project
- 180-character task titles
- 58-character displayed project names
- 128-character stored project and task IDs

Malformed workspace data is kept in place until the user explicitly chooses recovery. Recovered
projects are shown as in-memory data until SIMEONY verifies that the browser write succeeded.

TypeScript typecheck:

```bash
npm run typecheck
```

## Important status

The current interface is a foundation, not yet an AI coding agent. Project ideas are currently held in browser memory only. Authentication, persistent database storage, model integrations, agent orchestration, isolated execution, testing pipelines and deployment are future milestones.

No paid API, cloud service or deployment is enabled by this starter.

See [the master development prompt](./docs/SIMEONY_MASTER_BUILD_PROMPT.md) for the governing product vision and engineering principles.
