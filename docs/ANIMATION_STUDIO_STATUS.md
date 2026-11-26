# SIMEONY Animation Studio — implementation status

## Current milestone: browser-based 2D editor foundation

Animation Studio is integrated into the existing SIMEONY React + TypeScript + Vite application at the `/animation` route. The main workspace includes a Media & animation entry.

### Implemented in this milestone
- Dedicated dark animation workspace and stage preview.
- Basic rectangle, circle and text layers.
- Layer selection, naming, colour and text editing.
- Position, rotation and scale controls.
- Per-layer keyframes and linear interpolation between keyframes.
- 120-frame timeline at 24 FPS, frame scrubbing and playback.
- Local browser persistence using localStorage.
- SVG export of the current frame.
- Responsive layout for desktop and mobile.

### Current boundaries
- This is an early 2D editor foundation, not ToonBee parity.
- Projects are saved in the current browser only; there is no account sync or cloud database.
- SVG frame export works; animated video rendering/export is not implemented.
- No AI image/video generation, voice generation, lip-sync or character rigging is connected.
- No Blender, OpenToonz, Synfig, Krita, ComfyUI or FFmpeg adapter is connected yet.
- The current demo scene is starter content and can be edited; it is not an AI-generated result.
- A production build/typecheck has not yet been run in this environment. Run `npm run typecheck` and `npm run build` in Codespaces before treating this milestone as verified.

## Next engineering steps
1. Verify typecheck and production build in Codespaces; fix any compile/runtime issues.
2. Add project create/rename/duplicate/import/export and a durable project file format.
3. Improve selection, drag-on-stage transforms, multi-select, undo/redo and timeline keyframe editing.
4. Add frame-by-frame raster/vector asset import and sprite/sequence support.
5. Add real animated video export through a local rendering pipeline, then evaluate FFmpeg integration.
6. Add Blender adapter for 3D scenes and headless rendering.
7. Evaluate OpenToonz and Synfig adapters for traditional 2D workflows.
8. Evaluate ComfyUI and model licences for optional AI-assisted generation. Model-weight licences must be reviewed separately from application code licences.

## Cost and deployment policy
No paid API, GPU service, cloud storage, deployment or billing has been activated by this work. Local browser editing does not require a cloud GPU. AI generation and remote rendering will need compute; no unlimited-free-generation promise should be made.
