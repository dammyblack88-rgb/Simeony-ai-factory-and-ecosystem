# SIMEONY

**Build beyond imagination.**  
An independent creation platform by SimeonJr Studios.

SIMEONY is being developed as a unified workspace for planning and creating software, applications, AI workflows, games and creative projects.

## Current milestone

The `feat/creative-cloud-foundation` branch adds the first local control-plane foundation while preserving the existing React application and its browser-stored project workspace.

### Start the local control plane (Windows)

Requirements: Python 3.11+.

In PowerShell from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\\scripts\\start-control-plane.ps1
```

The first run creates `backend/.venv` and installs the declared Python dependencies. The API binds to `127.0.0.1:8765` by default.

Useful endpoints:

- `http://127.0.0.1:8765/api/health`
- `http://127.0.0.1:8765/api/v1/system/capabilities`
- `http://127.0.0.1:8765/api/v1/integrations`
- `http://127.0.0.1:8765/docs`

In a second terminal, run `npm install` (if needed) and `npm run dev`. Vite proxies `/api` requests to the local control plane. The Overview now displays real backend reachability, host CPU/memory/disk readings, and Ollama/ComfyUI availability. GPU detection is explicitly marked unconfigured; no GPU is assumed.

Backend checks:

```powershell
cd backend
.venv\\Scripts\\python.exe -m pytest -q
```

This is an initial read-only control plane. It does not yet execute arbitrary commands, schedule jobs, install models, access project files, or expose itself to the internet. Keep the default loopback binding; remote access and LAN worker enrollment require authentication and security work first.


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

## Important status

The current interface is a foundation, not yet an AI coding agent. Project ideas are currently held in browser memory only. Authentication, persistent database storage, model integrations, agent orchestration, isolated execution, testing pipelines and deployment are future milestones.

No paid API, cloud service or deployment is enabled by this starter.

See [the master development prompt](./docs/SIMEONY_MASTER_BUILD_PROMPT.md) for the governing product vision and engineering principles.
