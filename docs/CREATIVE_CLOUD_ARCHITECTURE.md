# SIMEONY Creative Cloud — Foundation Architecture

**Product:** SIMEONY / SimeonJr Creative Cloud  
**Owner:** SimeonJr Studios  
**Repository:** `dammyblack88-rgb/Simeony-ai-factory-and-ecosystem`  
**Branch:** `feat/creative-cloud-foundation`  
**Status:** Architecture baseline; implementation must proceed incrementally.

## Product direction

Evolve the existing SIMEONY React + TypeScript + Vite application into a local-first, extensible creative and software production cloud. Preserve the current workspace, project management, navigation, visual identity, and existing user data. Do not replace the application with a new scaffold.

The platform should coordinate tools and compute workers; it should not attempt to reimplement every specialist engine. Engines are integrated behind stable adapters and capability declarations.

## Production departments

1. **App Factory:** web, mobile, desktop, backend/API, database, UI/UX, testing, packaging, deployment preparation and maintenance.
2. **Game & Interactive Studio:** Godot/Unreal project workspaces, asset pipelines, build/test automation and game-specific AI assistance.
3. **3D Studio:** Blender automation, modelling and sculpting workflows, rigging, materials, asset conversion and rendering.
4. **Image Studio:** text-to-image, image-to-image, inpainting, upscaling and background processing.
5. **Video & Animation Studio:** image/video workflows, animation, interpolation, enhancement and export.
6. **Audio Lab:** transcription, diarization, speech synthesis, audio cleanup and subtitle generation.
7. **AI Model Lab:** local model catalogue, model metadata, installation state, runtime/provider adapters and resource-aware selection.
8. **Research & Data Lab:** document processing, extraction, structured analysis and dataset workflows.
9. **Asset Library:** reusable projects, models, textures, audio, video, generated outputs and metadata.

## Architecture principles

- Local-first: the first usable deployment runs on the user's own Windows computer and local network.
- Hybrid-ready: optional remote workers/providers can be added later, but local operation must not depend on them.
- Hardware-aware: never advertise a model or workflow as runnable until its requirements have been checked against the worker's reported capabilities.
- Modular: each engine is an adapter/service; the UI communicates through the SIMEONY API and job system.
- Durable: projects, jobs, settings and asset metadata belong in a database, not browser localStorage as the authoritative store.
- Observable: show real service health, queue state, worker capabilities, resource usage and errors. Never invent progress, connected status, model availability or hardware metrics.
- Safe by default: secrets stay server-side; dangerous filesystem, shell, deployment and network actions require explicit permissions and approval.
- Cost-conscious: no paid API, GPU rental, hosting, model download or deployment purchase without the user's explicit approval.
- Preserve current work: avoid destructive migrations; back up data before schema changes and keep existing browser-stored workspace data recoverable during migration.

## Target architecture (incremental)

### Existing frontend
- Keep React, TypeScript, Vite and the current SIMEONY interface.
- Add typed API clients, feature modules and real service-status views.
- Keep the current project workspace functional while migrating persistence carefully.

### Local control plane
- Python + FastAPI service for health, projects, workers, models, jobs and assets.
- PostgreSQL as the durable production database when the host can support it; SQLite may be used for a lightweight single-machine development mode behind the same repository/service layer.
- Redis only when asynchronous queue concurrency requires it; begin with the smallest viable queue implementation.
- Worker registry and capability heartbeat, with explicit offline/stale states.
- Job scheduler with queued, running, succeeded, failed, cancelled and awaiting-approval states.
- Local asset storage initially; object-storage adapter for a future MinIO deployment.

### Specialist adapters
- Ollama for compatible local language models.
- ComfyUI for supported image-generation workflows.
- faster-whisper / Whisper for speech-to-text and diarization pipelines where supported.
- Piper or another explicitly configured local TTS engine.
- Blender background automation for 3D and rendering jobs.
- Godot and other build tools through isolated, permission-controlled workers.
- Optional external providers only through explicit user configuration and approval.

### Worker model
- The current i7-6700 / 12 GB RAM / Intel HD Graphics 530 desktop is the initial host, not a high-end GPU server.
- Initial scope should prioritise the control plane, project/app workflows, file orchestration, lightweight CPU tasks and remote-worker readiness.
- Heavy image/video generation, large language models and demanding 3D rendering must be marked as requiring a capable GPU worker or optional remote compute.
- Support adding a dedicated GPU machine or other computers as workers without redesigning the platform.

## Core shared workflow

Idea → project brief → requirements/specification → task plan → workspace/repository → agent-assisted implementation → tests/build → review/approval → deployment package → monitoring and maintenance.

The App Factory must be a first-class department. A project should support repository linking, branch/worktree isolation, file changes, test logs, build artifacts and approval gates. Do not let an agent silently overwrite a user's existing working tree or deploy publicly.

## Delivery stages

### Stage 0 — Repository and safety baseline
- Inspect the complete repository, package scripts, existing features and current build/test commands.
- Preserve the current UI and browser data.
- Establish a branch-based workflow and document architecture.
- Confirm the actual local development environment before changing dependencies.

### Stage 1 — Real local control plane
- Add backend health/readiness endpoints.
- Add configuration and structured logging.
- Add a real worker registry and honest host capability reporting.
- Add persistent projects/jobs/assets metadata with safe migrations.
- Connect the existing UI to real backend status, retaining graceful offline behavior.

### Stage 2 — App Factory
- Project specifications and editable plans.
- Git repository connection and isolated working directories.
- Agent/provider interface with permission boundaries.
- Test/build runner, logs, artifacts and approval workflow.
- Web/mobile/desktop/backend project templates only when requested.

### Stage 3 — Creative engine integrations
- Ollama and model inventory.
- ComfyUI image workflows.
- Whisper transcription workflows.
- Blender automation and render queue.
- TTS, video and 3D adapters added incrementally after capability checks.

### Stage 4 — Multi-worker creative cloud
- Secure worker enrollment and authentication.
- Queue routing by hardware/software capability.
- Worker health, resource telemetry and job cancellation.
- LAN-first access, followed by secure remote access only after threat modelling.

### Stage 5 — Production hardening
- Authentication, roles, audit logs, secrets management, backups and restore tests.
- Resource quotas, retention policies and storage management.
- Automated tests, security checks and deployment documentation.

## First implementation acceptance criteria

- Existing SIMEONY frontend still builds and the current project workflow remains usable.
- The backend exposes a real health endpoint and reports unavailable integrations honestly.
- UI does not display fabricated GPU, model, worker or job data.
- No large model is automatically downloaded.
- No paid provider or cloud resource is activated.
- No existing project data is discarded.
- A user can see the difference between configured, available, running, unavailable and unsupported engines.

## Non-goals for the first release

- Do not promise unlimited local compute.
- Do not install every model or engine at startup.
- Do not require Kubernetes or a multi-node cluster for the first local deployment.
- Do not expose an unauthenticated remote shell or arbitrary command runner.
- Do not replace the existing SIMEONY frontend or create a separate competing product.
