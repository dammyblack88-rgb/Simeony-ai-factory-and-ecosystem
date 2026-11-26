import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Circle, Download, Layers3, Minus, Pause, Play, Plus, RectangleHorizontal, Save, Sparkles, Type, Trash2 } from "lucide-react";
import "./animation-studio.css";

type Key = { frame: number; x: number; y: number; rotation: number; scale: number };
type Layer = { id: string; name: string; kind: "rect" | "circle" | "text"; color: string; text?: string; keys: Key[] };
const STORE = "simeony.animation-studio.v1";
const initial: Layer[] = [
  { id: "layer-1", name: "Main title", kind: "text", color: "#f2edff", text: "A NEW STORY", keys: [{ frame: 1, x: 210, y: 145, rotation: 0, scale: 1 }, { frame: 48, x: 210, y: 145, rotation: 0, scale: 1 }] },
  { id: "layer-2", name: "Orbit", kind: "circle", color: "#a78bfa", keys: [{ frame: 1, x: 170, y: 260, rotation: 0, scale: .75 }, { frame: 48, x: 430, y: 260, rotation: 0, scale: 1.15 }] },
  { id: "layer-3", name: "Backdrop", kind: "rect", color: "#282044", keys: [{ frame: 1, x: 210, y: 260, rotation: 0, scale: 1 }, { frame: 48, x: 210, y: 260, rotation: 0, scale: 1 }] }
];
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
function atFrame(layer: Layer, frame: number): Key {
  const keys = [...layer.keys].sort((a,b) => a.frame-b.frame);
  const before = [...keys].reverse().find(k => k.frame <= frame) ?? keys[0];
  const after = keys.find(k => k.frame >= frame) ?? keys[keys.length-1];
  if (!before || !after || before.frame === after.frame) return before ?? { frame, x: 210, y: 260, rotation: 0, scale: 1 };
  const t = (frame-before.frame)/(after.frame-before.frame);
  return { frame, x: before.x+(after.x-before.x)*t, y: before.y+(after.y-before.y)*t, rotation: before.rotation+(after.rotation-before.rotation)*t, scale: before.scale+(after.scale-before.scale)*t };
}
export default function AnimationStudio() {
  const [layers, setLayers] = useState<Layer[]>(() => {
    try { const raw = localStorage.getItem(STORE); if (raw) { const data = JSON.parse(raw); if (Array.isArray(data) && data.length) return data; } } catch {}
    return initial;
  });
  const [selected, setSelected] = useState("layer-1");
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState("Your animation project is stored in this browser.");
  const stageRef = useRef<HTMLDivElement>(null);
  const active = layers.find(l => l.id === selected) ?? layers[0];
  const current = active ? atFrame(active, frame) : null;
  const totalFrames = 120;
  const fps = 24;
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(layers)); setSaved(true); } catch { setSaved(false); setNotice("Could not save: browser storage is unavailable or full."); } }, [layers]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame(f => f >= totalFrames ? 1 : f + 1), 1000/fps);
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => { if (frame >= totalFrames) setPlaying(false); }, [frame]);
  const ordered = useMemo(() => [...layers].reverse(), [layers]);
  function updateSelected(patch: Partial<Layer>) {
    if (!active) return;
    setLayers(items => items.map(l => l.id === active.id ? { ...l, ...patch } : l));
  }
  function updateTransform(patch: Partial<Key>) {
    if (!active || !current) return;
    const next = { ...current, ...patch, frame };
    setLayers(items => items.map(l => l.id !== active.id ? l : { ...l, keys: [...l.keys.filter(k => k.frame !== frame), next].sort((a,b) => a.frame-b.frame) }));
    setNotice("Keyframe updated at frame " + frame + ".");
  }
  function addLayer(kind: Layer["kind"]) {
    const id = "layer-" + Date.now();
    const name = kind === "rect" ? "Rectangle" : kind === "circle" ? "Circle" : "Text layer";
    const layer: Layer = { id, name, kind, color: kind === "text" ? "#ffffff" : "#8b72e8", text: kind === "text" ? "Your text" : undefined, keys: [{ frame: 1, x: 210, y: 260, rotation: 0, scale: 1 }] };
    setLayers(items => [...items, layer]); setSelected(id); setNotice(name + " added.");
  }
  function removeLayer() {
    if (!active || layers.length < 2) { setNotice("Keep at least one layer in your scene."); return; }
    const rest = layers.filter(l => l.id !== active.id); setLayers(rest); setSelected(rest[0].id); setNotice("Layer removed.");
  }
  function exportSvg() {
    const shapes = layers.map(l => {
      const k = atFrame(l, frame); const transform = `translate(${k.x} ${k.y}) rotate(${k.rotation}) scale(${k.scale})`;
      if (l.kind === "circle") return `<circle cx="0" cy="0" r="54" fill="${l.color}" transform="${transform}"/>`;
      if (l.kind === "text") return `<text x="0" y="0" fill="${l.color}" font-family="Arial,sans-serif" font-size="30" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="${transform}">${(l.text ?? "Text").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c] ?? c))}</text>`;
      return `<rect x="-78" y="-48" width="156" height="96" rx="18" fill="${l.color}" transform="${transform}"/>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="520" viewBox="0 0 840 520"><rect width="840" height="520" fill="#100e19"/>${shapes}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a"); a.href = url; a.download = "simeony-animation-frame-" + frame + ".svg"; a.click(); URL.revokeObjectURL(url);
    setNotice("SVG frame exported. Animated video export will be added with the render pipeline.");
  }
  return <div className="anim-shell">
    <header className="anim-topbar"><a className="anim-brand" href="/"><span className="anim-logo"><Sparkles size={17}/></span><span><b>SIMEONY</b><small>ANIMATION STUDIO</small></span></a><div className="anim-project-name"><span className="live-dot"/> Untitled animation <small>· 24 FPS</small></div><div className="anim-top-actions"><span className={saved ? "save-state" : "save-state unsaved"}><Save size={14}/> {saved ? "Saved locally" : "Not saved"}</span><button className="anim-export" onClick={exportSvg}><Download size={15}/> Export frame</button></div></header>
    <div className="anim-toolbar"><a href="/" className="anim-back"><ArrowLeft size={15}/> SIMEONY</a><span className="anim-divider"/><button onClick={() => addLayer("rect")}><RectangleHorizontal size={15}/> Rectangle</button><button onClick={() => addLayer("circle")}><Circle size={15}/> Circle</button><button onClick={() => addLayer("text")}><Type size={15}/> Text</button><span className="anim-toolbar-note">2D SCENE EDITOR · EARLY ACCESS</span></div>
    <main className="anim-main">
      <section className="anim-stage-panel"><div className="anim-panel-head"><div><b>Scene 01</b><span> · Main composition</span></div><span>840 × 520</span></div><div className="anim-stage-wrap"><div className="anim-stage" ref={stageRef}><svg viewBox="0 0 840 520" role="img" aria-label="Animation stage preview"><defs><radialGradient id="stageGlow"><stop stopColor="#46356e"/><stop offset="1" stopColor="#100e19"/></radialGradient><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ffffff" strokeOpacity=".055" strokeWidth="1"/></pattern></defs><rect width="840" height="520" fill="url(#stageGlow)"/><rect width="840" height="520" fill="url(#grid)"/>{layers.map(l => { const k = atFrame(l, frame); const transform = `translate(${k.x*2} ${k.y*2-260}) rotate(${k.rotation}) scale(${k.scale})`; return <g key={l.id} transform={transform} opacity={1} onClick={() => setSelected(l.id)} style={{cursor:"pointer"}}>{l.kind === "circle" ? <circle r="54" fill={l.color} stroke={selected===l.id ? "#fff" : "none"} strokeWidth="3"/> : l.kind === "text" ? <text textAnchor="middle" dominantBaseline="middle" fill={l.color} fontSize="30" fontWeight="700" letterSpacing="5">{l.text}</text> : <rect x="-78" y="-48" width="156" height="96" rx="18" fill={l.color} stroke={selected===l.id ? "#fff" : "none"} strokeWidth="3"/>}</g>; })}</svg><div className="stage-label">PREVIEW · FRAME {String(frame).padStart(3,"0")}</div></div></div><div className="anim-stage-footer"><span>Click an object to select its layer</span><span>Canvas preview · 2D</span></div></section>
      <aside className="anim-inspector"><div className="anim-inspector-tabs"><b>Properties</b><span>Layer</span></div>{active && current ? <><div className="selected-layer"><span className="layer-thumb">{active.kind==="circle"?<Circle size={16}/>:active.kind==="text"?<Type size={16}/>:<RectangleHorizontal size={16}/>}</span><div><b>{active.name}</b><small>{active.kind.toUpperCase()} LAYER</small></div></div><label className="anim-field">Layer name<input value={active.name} onChange={e => updateSelected({name:e.target.value})}/></label>{active.kind==="text" && <label className="anim-field">Text content<input value={active.text ?? ""} onChange={e => updateSelected({text:e.target.value})}/></label>}<label className="anim-field">Fill colour<div className="colour-input"><input type="color" value={active.color} onChange={e => updateSelected({color:e.target.value})}/><span>{active.color.toUpperCase()}</span></div></label><div className="anim-field-label">TRANSFORM</div><div className="anim-transform-grid"><label>X position<input type="number" value={Math.round(current.x)} onChange={e=>updateTransform({x:Number(e.target.value)})}/></label><label>Y position<input type="number" value={Math.round(current.y)} onChange={e=>updateTransform({y:Number(e.target.value)})}/></label><label>Rotation<input type="number" value={Math.round(current.rotation)} onChange={e=>updateTransform({rotation:Number(e.target.value)})}/></label><label>Scale<input type="number" min=".1" max="5" step=".1" value={Number(current.scale.toFixed(2))} onChange={e=>updateTransform({scale:clamp(Number(e.target.value),.1,5)})}/></label></div><button className="anim-key-button" onClick={()=>updateTransform({})}><Sparkles size={14}/> Set keyframe at {frame}</button><button className="anim-delete-layer" onClick={removeLayer}><Trash2 size={14}/> Delete selected layer</button></> : <p className="anim-empty">Select a layer to edit its properties.</p>}</aside>
    </main>
    <section className="anim-timeline"><div className="timeline-heading"><div><Layers3 size={16}/><b>Timeline</b><span> {totalFrames} frames</span></div><div className="timeline-controls"><button onClick={()=>setFrame(f=>Math.max(1,f-1))} aria-label="Previous frame"><Minus size={13}/></button><span>{String(frame).padStart(3,"0")} / {totalFrames}</span><button onClick={()=>setFrame(f=>Math.min(totalFrames,f+1))} aria-label="Next frame"><Plus size={13}/></button><button className="play-button" onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={14}/>:<Play size={14}/>} {playing?"Pause":"Play"}</button></div></div><div className="timeline-body"><div className="timeline-layers">{ordered.map(l=><button key={l.id} className={selected===l.id?"timeline-layer active":"timeline-layer"} onClick={()=>setSelected(l.id)}><span>{l.kind==="circle"?<Circle size={13}/>:l.kind==="text"?<Type size={13}/>:<RectangleHorizontal size={13}/>}</span>{l.name}</button>)}</div><div className="timeline-track-area"><div className="timeline-ruler">{Array.from({length:13},(_,i)=><button key={i} onClick={()=>setFrame(i*10+1)}>{String(i*10+1).padStart(3,"0")}</button>)}</div>{ordered.map(l=><div className="timeline-track" key={l.id} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setFrame(clamp(Math.round((e.clientX-r.left)/r.width*(totalFrames-1))+1,1,totalFrames));setSelected(l.id);}}><div className="timeline-track-line"/>{l.keys.map(k=><button title={"Keyframe at "+k.frame} className="key-dot" style={{left:((k.frame-1)/(totalFrames-1)*100)+"%"}} key={k.frame} onClick={e=>{e.stopPropagation();setSelected(l.id);setFrame(k.frame);}}/>)}{selected===l.id&&<div className="playhead" style={{left:((frame-1)/(totalFrames-1)*100)+"%"}}/>}</div>)}</div></div><div className="timeline-scrub"><span>FRAME</span><input type="range" min="1" max={totalFrames} value={frame} onChange={e=>setFrame(Number(e.target.value))}/><span>{fps} FPS</span></div></section>
    <footer className="anim-footer"><span>SIMEONY ANIMATION STUDIO · BY SIMEONJR STUDIOS</span><span>{notice}</span><a href="/">Back to SIMEONY <ArrowLeft size={12}/></a></footer>
  </div>;
}
