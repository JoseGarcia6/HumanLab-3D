"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_VISIBLE, SYSTEMS, explanation,
  type Atlas, type Concept, type SceneState, type SystemId, type View,
} from "@/lib/atlas/anatomy";

const DetailedScene = dynamic(() => import("@/components/AtlasDetailedScene"), { ssr: false });

const systemNames: Record<SystemId, string> = {
  skeletal: "Sistema óseo", muscular: "Sistema muscular", arterial: "Arterias",
  venous: "Venas", nervous: "Sistema nervioso", digestive: "Digestivo",
  respiratory: "Respiratorio", urinary: "Urinario", reproductive: "Reproductor masculino",
  lymphatic: "Linfático", endocrine: "Endocrino", integumentary: "Superficie corporal",
  connective: "Tejido conectivo", sensory: "Órganos sensoriales", cardiac: "Corazón",
};
const translations: Record<string, string> = {
  "corazón": "heart", corazon: "heart", cerebro: "brain", encéfalo: "brain",
  pulmones: "lung", "pulmón": "lung", pulmon: "lung", "hígado": "liver",
  higado: "liver", "estómago": "stomach", estomago: "stomach",
  intestino: "intestine", riñon: "kidney", "riñón": "kidney", hueso: "bone",
  huesos: "bone", venas: "vein", vena: "vein", arterias: "artery",
  arteria: "artery", musculo: "muscle", "músculo": "muscle", nervio: "nerve",
  vejiga: "bladder", traquea: "trachea", "tráquea": "trachea",
  craneo: "skull", "cráneo": "skull", columna: "spine",
};
const originalState: SceneState = {
  explode: 0, visible: [...DEFAULT_VISIBLE], selected: [],
  isolate: false, view: "three-quarter", rotate: false, reset: 0,
};

export default function AtlasExplorer() {
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [state, setState] = useState<SceneState>(originalState);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Concept | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setAtlas(null); setError(""); setProgress(0);
    fetch("/api/atlas/atlas.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("No fue posible cargar el catálogo anatómico.");
        return (await response.json()) as Atlas;
      })
      .then(setAtlas)
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Error al cargar el atlas.");
        }
      });
    return () => controller.abort();
  }, [attempt]);

  const partById = useMemo(() => new Map(atlas?.parts.map((part) => [part.id, part]) ?? []), [atlas]);
  const counts = useMemo(() => {
    const result = new Map<SystemId, number>();
    for (const system of SYSTEMS) result.set(system.id, 0);
    for (const part of atlas?.parts ?? []) result.set(part.system, (result.get(part.system) ?? 0) + 1);
    return result;
  }, [atlas]);

  const results = useMemo(() => {
    if (!atlas) return [];
    const search = query.trim().toLocaleLowerCase("es");
    if (!search) return [];
    const translated = translations[search] ?? search;
    return atlas.concepts.filter((concept) =>
      concept.name.toLocaleLowerCase("en").includes(translated) ||
      concept.name.toLocaleLowerCase("en").includes(search) ||
      concept.id.toLowerCase().includes(search)
    ).slice(0, 45);
  }, [atlas, query]);

  const parts = state.selected.map((id) => partById.get(id)).filter((part) => part != null);
  const selected = parts[0];
  const selectedSystem = selected && SYSTEMS.find((sys) => sys.id === selected.system);
  const visibleCount = atlas?.parts.filter((part) =>
    state.isolate ? state.selected.includes(part.id) : state.visible.includes(part.system) || state.selected.includes(part.id)
  ).length ?? 0;

  function chooseConcept(concept: Concept) {
    setChosen(concept);
    setQuery(concept.name);
    setState((prev) => ({
      ...prev, selected: concept.elements, isolate: false, rotate: false,
    }));
  }
  function choosePart(id: string) {
    const part = partById.get(id);
    if (!part) return;
    setChosen(atlas?.concepts.find((concept) => concept.id === part.conceptId) ??
      { id: part.conceptId, name: part.name, elements: [part.id] });
    setState((prev) => ({
      ...prev, selected: [id], isolate: false, rotate: false,
    }));
  }
  function toggleSystem(id: SystemId) {
    setState((prev) => ({
      ...prev,
      isolate: false,
      visible: prev.visible.includes(id) ? prev.visible.filter((item) => item !== id) : [...prev.visible, id],
    }));
  }
  function reset() {
    setState((prev) => ({ ...originalState, visible: [...DEFAULT_VISIBLE], reset: prev.reset + 1 }));
    setChosen(null); setQuery("");
  }

  return (
    <main className="hl-atlas">
      <header className="hl-atlas-header">
        <div>
          <Link className="hl-atlas-back" href="/">← Volver a HumanLab 3D</Link>
          <div className="hl-atlas-kicker">LABORATORIO ANATÓMICO · EXPLORACIÓN DETALLADA</div>
          <h1>Atlas anatómico <span>3D</span></h1>
          <p>Explorá estructuras reales de referencia con selección individual y capas interactivas.</p>
        </div>
        <div className="hl-atlas-count">
          <strong>{atlas?.parts.length.toLocaleString("es-NI") ?? "2,234"}</strong>
          <span>piezas anatómicas de referencia</span>
        </div>
      </header>

      <div className="hl-atlas-layout">
        <aside className={`hl-atlas-sidebar ${showLayers ? "hl-atlas-sidebar-open" : ""}`}>
          <div className="hl-atlas-sidehead">
            <h2>Sistemas anatómicos</h2>
            <span>{SYSTEMS.length} sistemas</span>
          </div>
          <div className="hl-atlas-presets">
            <button type="button" onClick={() => setState((prev) => ({ ...prev, visible: SYSTEMS.map((sys) => sys.id), isolate: false }))}>Todos</button>
            <button type="button" onClick={() => setState((prev) => ({ ...prev, visible: ["skeletal"], isolate: false }))}>Esqueleto</button>
            <button type="button" onClick={() => setState((prev) => ({ ...prev, visible: ["cardiac", "digestive", "respiratory", "urinary", "endocrine"], isolate: false }))}>Órganos</button>
          </div>
          <div className="hl-atlas-systemlist">
            {SYSTEMS.map((system) => (
              <label key={system.id} className="hl-atlas-system">
                <span className="hl-atlas-systemname"><i style={{ background: system.color }} />{systemNames[system.id]}</span>
                <span className="hl-atlas-systemcount">{counts.get(system.id) ?? "—"}</span>
                <input type="checkbox" checked={state.visible.includes(system.id)} onChange={() => toggleSystem(system.id)}
                  aria-label={`Mostrar ${systemNames[system.id]}`} />
              </label>
            ))}
          </div>
          <p className="hl-atlas-sidefoot">{visibleCount.toLocaleString("es-NI")} piezas visibles</p>
        </aside>

        <section className="hl-atlas-center" aria-label="Visualizador de anatomía humana tridimensional">
          <div className="hl-atlas-viewer">
            {atlas && (
              <DetailedScene atlas={atlas}
                state={{ ...state, inspectorOpen: Boolean(selected) }}
                onSelect={choosePart} onProgress={setProgress}
                onError={setError} />
            )}
            {!atlas && !error && <div className="hl-atlas-loading" role="status">Cargando el catálogo anatómico…</div>}
            {atlas && progress < 100 && !error &&
              <div className="hl-atlas-loading" role="status">
                <strong>Preparando geometría 3D…</strong>
                <div className="hl-atlas-progress"><span style={{ width: `${progress}%` }} /></div>
                <small>{progress}% · La descarga inicial puede consumir aproximadamente 33 MB</small>
              </div>}
            {error && <div className="hl-atlas-loading hl-atlas-error" role="alert">
              <strong>No se pudo cargar el modelo</strong><p>{error}</p>
              <button type="button" onClick={() => { setError(""); setProgress(0); setAttempt((value) => value + 1); }}>Reintentar</button>
            </div>}
            <div className="hl-atlas-hint">Arrastrá para girar · rueda o pellizcá para acercar · tocá una estructura</div>
          </div>
          <div className="hl-atlas-toolbar">
            <button type="button" className="hl-atlas-mobile-layers" onClick={() => setShowLayers((value) => !value)} aria-expanded={showLayers}>☰ Sistemas</button>
            <div className="hl-atlas-views">
              {([["three-quarter", "¾"], ["front", "Frente"], ["side", "Lado"], ["back", "Atrás"]] as [View, string][]).map(([view, title]) =>
                <button key={view} type="button" className={state.view === view ? "active" : ""}
                  aria-pressed={state.view === view} disabled={state.explode > 0.8 && view !== "front"}
                  onClick={() => setState((prev) => ({ ...prev, view, rotate: false, reset: prev.reset + 1 }))}>{title}</button>
              )}
            </div>
            <button type="button" onClick={() => setState((prev) => ({ ...prev, rotate: !prev.rotate }))}
              aria-pressed={state.rotate} disabled={state.explode > 0.4}>{state.rotate ? "Ⅱ Pausar" : "↻ Girar"}</button>
            <button type="button" onClick={reset}>Restablecer</button>
          </div>
          <div className="hl-atlas-explode">
            <label htmlFor="hl-explode">Separar estructuras <strong>{Math.round(state.explode * 100)}%</strong></label>
            <input id="hl-explode" type="range" min={0} max={100} step={1}
              value={Math.round(state.explode * 100)}
              onChange={(event) => setState((prev) => ({ ...prev, explode: Number(event.target.value) / 100, rotate: false }))} />
            <div><span>Cuerpo ensamblado</span><span>Piezas individuales</span></div>
          </div>
        </section>

        <aside className="hl-atlas-inspector">
          <label htmlFor="hl-atlas-search">Buscar estructuras</label>
          <input id="hl-atlas-search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Corazón, hígado, femur, FMA…" autoComplete="off" />
          {query.trim() && results.length > 0 && (!chosen || query !== chosen.name) &&
            <div className="hl-atlas-results" role="listbox" aria-label="Resultados de búsqueda">
              {results.map((concept) => <button type="button" role="option" aria-selected={false} key={concept.id} onClick={() => chooseConcept(concept)}>
                <span>{concept.name}</span><small>{concept.elements.length} piezas</small>
              </button>)}
            </div>}
          {query.trim() && !results.length && atlas && <p className="hl-atlas-empty">Sin coincidencias. Probá otro término.</p>}
          {selected ? <>
            <div className="hl-atlas-inspector-kicker"><span style={{ background: selectedSystem?.color }} /> ESTRUCTURA SELECCIONADA</div>
            <h2>{chosen?.name ?? selected.name}</h2>
            <p className="hl-atlas-english">Nombre anatómico original · inglés</p>
            <div className="hl-atlas-detailrow"><span>Sistema</span><strong>{systemNames[selected.system]}</strong></div>
            <div className="hl-atlas-detailrow"><span>Piezas seleccionadas</span><strong>{state.selected.length}</strong></div>
            <div className="hl-atlas-detailrow"><span>Identificador</span><strong>{chosen?.id ?? selected.id}</strong></div>
            <p className="hl-atlas-description">{explanation(chosen?.name ?? selected.name, selected.system)}</p>
            <small>Esta explicación procede del atlas de referencia y está disponible en su idioma de origen.</small>
            <button type="button" className="hl-atlas-isolate" onClick={() => setState((prev) => ({ ...prev, isolate: !prev.isolate, reset: prev.reset + 1 }))}>
              {state.isolate ? "Mostrar el resto del cuerpo" : "Aislar estructura seleccionada"}
            </button>
            <button type="button" className="hl-atlas-clear" onClick={() => { setChosen(null); setState((prev) => ({ ...prev, selected: [], isolate: false })); }}>Quitar selección</button>
          </> : <div className="hl-atlas-no-selection">
            <span aria-hidden="true">◎</span>
            <h2>Explorá el cuerpo humano</h2>
            <p>Elegí un sistema o buscá una estructura. Al tocar el modelo, vas a ver su nombre, sistema y ubicación en el conjunto anatómico.</p>
            <p>Podés aislar una parte y separar las estructuras para observar cómo se relacionan.</p>
          </div>}
          <div className="hl-atlas-license">
            <strong>Fuente y alcance</strong>
            <p>BodyParts3D 4.0 © Database Center for Life Science · referencia masculina adulta. Geometría simplificada y adaptada por Human Atlas; integrada a HumanLab 3D con fines educativos. No sirve para diagnóstico.</p><a href="/ATTRIBUTION_HUMAN_ATLAS.md" target="_blank" rel="noopener noreferrer">Créditos completos y adaptaciones ↗</a>
            <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noopener noreferrer">Licencia CC BY 4.0 ↗</a>
            <a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noopener noreferrer">Código original Human Atlas (MIT) ↗</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
