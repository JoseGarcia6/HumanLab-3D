"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_VISIBLE, SYSTEMS,
  type Atlas, type Concept, type SceneState, type SystemId, type View,
} from "@/lib/atlas/anatomy";
import { anatomicalNameEs, normalizedTerm, ANATOMICAL_SYSTEMS_ES, SYSTEM_DESCRIPTIONS_ES } from "@/lib/atlas/names-es";
import { FEMALE_SYSTEMS, FEMALE_STRUCTURES, FEMALE_VISIBLE_DEFAULT, type FemaleSystemId } from "@/lib/atlas/female-schematic";

const DetailedScene = dynamic(() => import("@/components/AtlasDetailedScene"), { ssr: false });
const FemaleAnatomyViewer = dynamic(() => import("@/components/FemaleAnatomyViewer"), { ssr: false });

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
  const [femaleAtlas, setFemaleAtlas] = useState<Atlas | null>(null);
  const [state, setState] = useState<SceneState>(originalState);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Concept | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const [body, setBody] = useState<"male"|"female">("male");
  const [femaleLite, setFemaleLite] = useState(false);
  const [cleanFemaleView, setCleanFemaleView] = useState(true);
  const [femaleVisible, setFemaleVisible] = useState<FemaleSystemId[]>([...FEMALE_VISIBLE_DEFAULT]);
  const [femaleSelected, setFemaleSelected] = useState("");
  const [femaleReset, setFemaleReset] = useState(0);

  const detailed = body==="male" || !femaleLite;
  const currentAtlas = body==="male"?atlas:femaleLite?null:femaleAtlas;
  const referenceSystems = body==="male"?SYSTEMS.filter(system=>system.id!=="pregnancy"):SYSTEMS;

  // Only download a body when the user selects it. Keep the manifests cached
  // while switching, but unmount the unused WebGL canvas to save mobile RAM.
  useEffect(() => {
    if(!detailed || currentAtlas)return;
    const controller = new AbortController();
    setError("");setProgress(0);
    const resource=body==="female"?"/api/female-atlas/atlas.json":"/api/atlas/atlas.json";
    fetch(resource,{signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error("No se pudo cargar el catálogo anatómico seleccionado.");
        return (await response.json()) as Atlas;
      })
      .then(data=>{
        if(controller.signal.aborted)return;
        if(body==="female")setFemaleAtlas(data);
        else setAtlas(data);
      })
      .catch((caught:unknown)=>{
        if(!controller.signal.aborted)setError(caught instanceof Error?caught.message:"Error al cargar el atlas.");
      });
    return ()=>controller.abort();
  },[body,detailed,currentAtlas,attempt]);

  const partById = useMemo(() => new Map(currentAtlas?.parts.map((part) => [part.id, part]) ?? []), [currentAtlas]);
  const counts = useMemo(() => {
    const result = new Map<SystemId, number>();
    for (const system of SYSTEMS) result.set(system.id, 0);
    for (const part of currentAtlas?.parts ?? []) result.set(part.system, (result.get(part.system) ?? 0) + 1);
    return result;
  }, [currentAtlas]);

  const results = useMemo(() => {
    if (!currentAtlas || !detailed) return [];
    const search=normalizedTerm(query);
    if (!search) return [];
    const englishAlias=translations[search] ?? search;
    return currentAtlas.concepts.filter((concept) =>
      normalizedTerm(anatomicalNameEs(concept.name)).includes(search) ||
      normalizedTerm(concept.name).includes(search) ||
      normalizedTerm(concept.name).includes(englishAlias) ||
      concept.id.toLowerCase().includes(search)
    ).slice(0,45);
  },[currentAtlas,query,detailed]);

  const femaleResults=useMemo(()=>{
    const search=normalizedTerm(query);
    if(!search || body!=="female" || !femaleLite)return [];
    return FEMALE_STRUCTURES.filter(item=>normalizedTerm(item.name).includes(search));
  },[query,body,femaleLite]);
  const femaleInfo=FEMALE_STRUCTURES.find(item=>item.id===femaleSelected);

  const parts = state.selected.map((id) => partById.get(id)).filter((part) => part != null);
  const selected = parts[0];
  const selectedSystem = selected && SYSTEMS.find((sys) => sys.id === selected.system);
  const visibleCount = currentAtlas?.parts.filter((part) =>
    state.isolate ? state.selected.includes(part.id) : state.visible.includes(part.system) || state.selected.includes(part.id)
  ).length ?? 0;

  function chooseConcept(concept: Concept) {
    setChosen(concept);
    setQuery(anatomicalNameEs(concept.name));
    setState((prev) => ({
      ...prev, selected: concept.elements, isolate: false, rotate: false,
    }));
  }
  function choosePart(id: string) {
    const part = partById.get(id);
    if (!part) return;
    setChosen(currentAtlas?.concepts.find((concept) => concept.id === part.conceptId) ??
      { id: part.conceptId, name: part.name, elements: [part.id] });
    setState((prev) => ({
      ...prev, selected: [id], isolate: false, rotate: false,
    }));
  }
  function chooseBody(value:"male"|"female") {
    if(value===body)return;
    setBody(value);setQuery("");setShowLayers(false);setChosen(null);
    setFemaleSelected("");setError("");setProgress(0);
    const systems=[...DEFAULT_VISIBLE];
    setState(previous=>({
      ...originalState,visible:[...systems],selected:[],reset:previous.reset+1
    }));
  }
  function switchFemaleMode(lite:boolean) {
    if(femaleLite===lite)return;
    setFemaleLite(lite);setQuery("");setChosen(null);setFemaleSelected("");
    setError("");setProgress(0);
    setState(previous=>({...originalState,visible:[...DEFAULT_VISIBLE],reset:previous.reset+1}));
  }
  function chooseFemale(id:string) {
    setFemaleSelected(id);
    const item=FEMALE_STRUCTURES.find(entry=>entry.id===id);
    if(item)setFemaleVisible(previous=>previous.includes(item.system)?previous:[...previous,item.system]);
  }
  function toggleFemaleSystem(id:FemaleSystemId) {
    setFemaleVisible(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);
  }
  function toggleSystem(id: SystemId) {
    setState((prev) => ({
      ...prev,
      isolate: false,
      visible: prev.visible.includes(id) ? prev.visible.filter((item) => item !== id) : [...prev.visible, id],
    }));
  }
  function showWholeBody() {
    if(!detailed){reset();return;}
    setChosen(null);
    setState(previous=>({...previous,explode:0,view:"three-quarter",rotate:false,isolate:false,selected:[],reset:previous.reset+1}));
  }
  function reset() {
    if(body==="female"&&femaleLite){
      setFemaleVisible([...FEMALE_VISIBLE_DEFAULT]);
      setFemaleSelected("");
      setFemaleReset(value=>value+1);
      setState(previous=>({...previous,rotate:false}));
      setQuery("");
      return;
    }
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
          <p>Explorá el cuerpo humano en 3D, identificá estructuras y consultá sus nombres en español.</p>
        </div>
        <div className="hl-atlas-count">
          <strong>{detailed?(currentAtlas?.parts.length.toLocaleString("es-NI")??(body==="female"?"3,004":"2,234")):"9"}</strong>
          <span>{detailed?"piezas anatómicas de referencia":"sistemas esquemáticos femeninos"}</span>
        </div>
      </header>

      <div className="hl-atlas-body-switch">
        <div className="hl-atlas-body-intro">
          <strong>Tipo de cuerpo</strong>
          <small>{body==="male"?"Modelo masculino detallado · BodyParts3D":femaleLite?"Modelo femenino esquemático · modo ligero":"Modelo femenino detallado · Female Atlas"}</small>
        </div>
        <div className="hl-atlas-body-buttons" role="group" aria-label="Cambiar entre cuerpo masculino y femenino">
          <button type="button" aria-pressed={body==="male"} className={body==="male"?"active":""}
            onClick={()=>chooseBody("male")}>Hombre</button>
          <button type="button" aria-pressed={body==="female"} className={body==="female"?"active":""}
            onClick={()=>chooseBody("female")}>Mujer</button>
        </div>
      </div>
      <div className="hl-atlas-layout">
        <aside className={`hl-atlas-sidebar ${showLayers ? "hl-atlas-sidebar-open" : ""}`}>
          <div className="hl-atlas-sidehead">
            <h2>Sistemas anatómicos</h2>
            <span>{detailed?referenceSystems.length:FEMALE_SYSTEMS.length} sistemas</span>
          </div>
          {detailed?<>
            <div className="hl-atlas-presets">
              <button type="button" onClick={() => setState(prev=>({...prev,visible:referenceSystems.map(system=>system.id),isolate:false}))}>Todos</button>
              <button type="button" onClick={() => setState(prev=>({...prev,visible:["skeletal"],isolate:false}))}>Esqueleto</button>
              <button type="button" onClick={() => setState(prev=>({...prev,visible:["cardiac","digestive","respiratory","urinary","endocrine"],isolate:false}))}>Órganos</button>
            </div>
            <div className="hl-atlas-systemlist">
              {referenceSystems.map(system=><label key={system.id} className="hl-atlas-system">
                <span className="hl-atlas-systemname"><i style={{background:system.color}}/>{system.id==="reproductive"?(body==="male"?"Sistema reproductor masculino":"Sistema reproductor femenino"):ANATOMICAL_SYSTEMS_ES[system.id]}</span>
                <span className="hl-atlas-systemcount">{counts.get(system.id)??"—"}</span>
                <input type="checkbox" checked={state.visible.includes(system.id)}
                  onChange={()=>toggleSystem(system.id)} aria-label={`Mostrar ${ANATOMICAL_SYSTEMS_ES[system.id]}`}/>
              </label>)}
            </div>
            <p className="hl-atlas-sidefoot">{visibleCount.toLocaleString("es-NI")} piezas visibles</p>
          </>:<>
            <div className="hl-atlas-presets">
              <button type="button" onClick={()=>setFemaleVisible([...FEMALE_VISIBLE_DEFAULT])}>Todos</button>
              <button type="button" onClick={()=>setFemaleVisible(["skeletal"])}>Esqueleto</button>
              <button type="button" onClick={()=>setFemaleVisible(["circulatory","respiratory","digestive","urinary","reproductive"])}>Órganos</button>
            </div>
            <div className="hl-atlas-systemlist">
              {FEMALE_SYSTEMS.map(system=><label key={system.id} className="hl-atlas-system">
                <span className="hl-atlas-systemname"><i style={{background:system.color}}/>{system.name}</span>
                <input type="checkbox" checked={femaleVisible.includes(system.id)}
                  onChange={()=>toggleFemaleSystem(system.id)} aria-label={`Mostrar ${system.name}`}/>
              </label>)}
            </div>
            <p className="hl-atlas-sidefoot">Vista esquemática educativa · nueve sistemas</p>
          </>}
        </aside>

        <section className="hl-atlas-center" aria-label="Visualizador de anatomía humana tridimensional">
          <div className="hl-atlas-viewer">
            {body==="female"&&femaleLite&&<FemaleAnatomyViewer
              key={femaleReset} visible={femaleVisible} selected={femaleSelected}
              showNames={showNames} rotate={state.rotate} onSelect={chooseFemale}
            />}
            {detailed&&currentAtlas && (
              <DetailedScene key={body+"-"+attempt} atlas={currentAtlas} showNames={showNames} cleanView={body==="female"&&cleanFemaleView}
                state={{ ...state, inspectorOpen: Boolean(selected) }}
                onSelect={choosePart} onProgress={setProgress}
                onError={setError} />
            )}
            {detailed&&!currentAtlas && !error && <div className="hl-atlas-loading" role="status">Cargando el catálogo anatómico…</div>}
            {detailed&&currentAtlas && progress < 100 && !error &&
              <div className="hl-atlas-loading" role="status">
                <strong>Preparando geometría 3D…</strong>
                <div className="hl-atlas-progress"><span style={{ width: `${progress}%` }} /></div>
                <small>{progress}% · Descarga inicial estimada: {body==="female"?"55 MB":"33 MB"}</small>
              </div>}
            {detailed&&error && <div className="hl-atlas-loading hl-atlas-error" role="alert">
              <strong>No se pudo cargar el modelo</strong><p>{error}</p>
              <button type="button" onClick={() => { setError(""); setProgress(0); setAttempt((value) => value + 1); }}>Reintentar</button>
            </div>}
            <div className="hl-atlas-hint">Arrastrá para girar · pellizcá para acercar · tocá una estructura</div>
          </div>
          <div className="hl-atlas-toolbar">
            <button type="button" className="hl-atlas-mobile-layers" onClick={() => setShowLayers((value) => !value)} aria-expanded={showLayers}>☰ Sistemas</button>
            <button type="button" className={`hl-atlas-names-toggle ${showNames ? "active" : ""}`} onClick={() => setShowNames((value) => !value)} aria-pressed={showNames} title="Mostrar u ocultar etiquetas anatómicas sobre el cuerpo">{showNames ? "◉ Ocultar nombres" : "○ Mostrar nombres"}</button>
            {body==="female"&&!femaleLite&&
              <button type="button" className={`hl-atlas-clean-toggle ${cleanFemaleView?"active":""}`}
                aria-pressed={cleanFemaleView}
                title="Vista limpia oculta los componentes oculares superpuestos de los dos atlas de origen"
                onClick={()=>setCleanFemaleView(value=>!value)}>
                {cleanFemaleView?"✓ Vista limpia":"Ver todas las piezas"}
              </button>}
            {detailed&&<div className="hl-atlas-views">
              {([["three-quarter", "¾"], ["front", "Frente"], ["side", "Lado"], ["back", "Atrás"]] as [View, string][]).map(([view, title]) =>
                <button key={view} type="button" className={state.view === view ? "active" : ""}
                  aria-pressed={state.view === view} disabled={state.explode > 0.8 && view !== "front"}
                  onClick={() => setState((prev) => ({ ...prev, view, rotate: false, reset: prev.reset + 1 }))}>{title}</button>
              )}
            </div>}
            <button type="button" onClick={() => setState((prev) => ({ ...prev, rotate: !prev.rotate }))}
              aria-pressed={state.rotate} disabled={detailed&&state.explode > 0.4}>{state.rotate ? "Ⅱ Pausar" : "↻ Girar"}</button>
            {detailed&&<button type="button" className="hl-atlas-fullbody" onClick={showWholeBody} title="Volver a encuadrar el cuerpo completo manteniendo los sistemas seleccionados">Ver cuerpo completo</button>}
            <button type="button" onClick={reset}>Restablecer</button>
          </div>
          {detailed&&<div className="hl-atlas-explode">
            <label htmlFor="hl-explode">Separar estructuras <strong>{Math.round(state.explode * 100)}%</strong></label>
            <input id="hl-explode" type="range" min={0} max={100} step={1}
              value={Math.round(state.explode * 100)}
              onChange={(event) => setState((prev) => ({ ...prev, explode: Number(event.target.value) / 100, rotate: false }))} />
            <div><span>Cuerpo ensamblado</span><span>Piezas individuales</span></div>
          </div>}
        </section>

        <aside className="hl-atlas-inspector">
          <label htmlFor="hl-atlas-search">Buscar estructuras</label>
          <input id="hl-atlas-search" value={query}
            onChange={event=>setQuery(event.target.value)}
            placeholder={body==="male"?"Corazón, hígado, fémur, FMA…":"Corazón, útero, ovarios, pulmones…"}
            autoComplete="off"/>
          {detailed&&query.trim()&&results.length>0&&(!chosen||query!==anatomicalNameEs(chosen.name))&&
            <div className="hl-atlas-results" role="listbox" aria-label="Resultados de búsqueda">
              {results.map(concept=><button type="button" role="option" aria-selected={false}
                key={concept.id} onClick={()=>chooseConcept(concept)}>
                <span>{anatomicalNameEs(concept.name)}</span><small>{concept.elements.length} piezas</small>
              </button>)}
            </div>}
          {body==="female"&&femaleLite&&query.trim()&&femaleResults.length>0&&
            <div className="hl-atlas-results" role="listbox" aria-label="Resultados de búsqueda">
              {femaleResults.map(item=><button type="button" role="option" aria-selected={femaleSelected===item.id}
                key={item.id} onClick={()=>{chooseFemale(item.id);setQuery(item.name);}}>
                <span>{item.name}</span><small>{FEMALE_SYSTEMS.find(system=>system.id===item.system)?.name}</small>
              </button>)}
            </div>}
          {query.trim()&&((detailed&&results.length===0&&currentAtlas)||(body==="female"&&femaleLite&&femaleResults.length===0))&&
            <p className="hl-atlas-empty">Sin coincidencias. Probá otro término.</p>}
          {body==="female"&&femaleLite?(femaleInfo?<>
            <div className="hl-atlas-inspector-kicker">
              <span style={{background:FEMALE_SYSTEMS.find(system=>system.id===femaleInfo.system)?.color}}/>
              ESTRUCTURA SELECCIONADA
            </div>
            <h2>{femaleInfo.name}</h2>
            <p className="hl-atlas-english">Modelo 3D esquemático · referencia educativa</p>
            <div className="hl-atlas-detailrow"><span>Sistema</span>
              <strong>{FEMALE_SYSTEMS.find(system=>system.id===femaleInfo.system)?.name}</strong></div>
            <div className="hl-atlas-detailrow"><span>Ubicación</span><strong>{femaleInfo.location}</strong></div>
            <p className="hl-atlas-description">{femaleInfo.description}</p>
            <div className="hl-atlas-female-relations"><strong>Relaciones anatómicas</strong>
              <p>{femaleInfo.relations.join(" · ")}</p></div>
            <button type="button" className="hl-atlas-clear" onClick={()=>setFemaleSelected("")}>Quitar selección</button>
          </>:<div className="hl-atlas-no-selection">
            <span aria-hidden="true">◎</span>
            <h2>Explorá la anatomía femenina</h2>
            <p>Seleccioná estructuras en el modelo, usá los nombres en español y activá u ocultá sistemas desde el panel.</p>
            <p>Este cuerpo 3D es un esquema didáctico, no un modelo anatómico de alta fidelidad.</p>
          </div>):selected?<>
            <div className="hl-atlas-inspector-kicker">
              <span style={{background:selectedSystem?.color}}/> ESTRUCTURA SELECCIONADA
            </div>
            <h2>{anatomicalNameEs(chosen?.name??selected.name)}</h2>
            <p className="hl-atlas-english">Nombre científico original: {chosen?.name??selected.name}</p>
            <div className="hl-atlas-detailrow"><span>Sistema</span>
              <strong>{ANATOMICAL_SYSTEMS_ES[selected.system]}</strong></div>
            <div className="hl-atlas-detailrow"><span>Piezas seleccionadas</span>
              <strong>{state.selected.length}</strong></div>
            <div className="hl-atlas-detailrow"><span>Identificador</span>
              <strong>{chosen?.id??selected.id}</strong></div>
            <p className="hl-atlas-description">{SYSTEM_DESCRIPTIONS_ES[selected.system]}</p>
            <small>Explicación general del sistema. El nombre original se conserva para identificación científica.</small>
            <button type="button" className="hl-atlas-isolate" onClick={()=>setState(prev=>({...prev,isolate:!prev.isolate,reset:prev.reset+1}))}>
              {state.isolate?"Mostrar el resto del cuerpo":"Aislar estructura seleccionada"}
            </button>
            <button type="button" className="hl-atlas-clear" onClick={()=>{setChosen(null);setState(prev=>({...prev,selected:[],isolate:false}));}}>Quitar selección</button>
          </>:<div className="hl-atlas-no-selection">
            <span aria-hidden="true">◎</span><h2>Explorá el cuerpo humano</h2>
            <p>Buscá una estructura por su nombre en español o tocá el cuerpo para seleccionarla.</p>
            <p>Activá «Mostrar nombres» para identificar estructuras destacadas.</p>
            <p>También podés separar las piezas y aislar los órganos seleccionados.</p>
          </div>}
          <div className="hl-atlas-license">
            <strong>Fuente y alcance</strong>
            {body==="male"?<>
              <p>BodyParts3D 4.0 © Database Center for Life Science · referencia masculina adulta.
                Modelo educativo, no diagnóstico.</p>
              <a href="/ATTRIBUTION_HUMAN_ATLAS.md" target="_blank" rel="noopener noreferrer">Créditos del atlas masculino ↗</a>
              <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
                target="_blank" rel="noopener noreferrer">Licencia de BodyParts3D (CC BY 4.0) ↗</a>
              <a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noopener noreferrer">Human Atlas (MIT) ↗</a>
            </>:femaleLite?<p>Modelo femenino esquemático original de HumanLab 3D. No es un recurso clínico ni un modelo de alta fidelidad.</p>:<>
              <p>Female Atlas © Mahendra Beniwal, con órganos del Human Reference Atlas (HuBMAP)
                y sistemas adaptados de BodyParts3D (CC BY 4.0). No se utiliza para diagnóstico.</p>
              <a href="/ATTRIBUTION_FEMALE_ATLAS.md" target="_blank" rel="noopener noreferrer">Fuentes y adaptaciones femeninas ↗</a>
              <a href="/LICENSE_FEMALE_ATLAS.txt" target="_blank" rel="noopener noreferrer">Licencia MIT del código original ↗</a>
              <a href="https://github.com/HiMahendraBeniwal/female-atlas" target="_blank" rel="noopener noreferrer">Female Atlas original ↗</a>
            </>}
          </div>
        </aside>
      </div>
    </main>
  );
}
