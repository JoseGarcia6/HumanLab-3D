"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnatomyScene } from "@/components/AnatomyScene";
import {
  DEFAULT_VISIBLE,
  SYSTEMS,
  type Atlas,
  type Concept,
  type Part,
  type SceneState,
  type SystemId,
  type View,
} from "@/lib/atlas/anatomy";
import {
  anatomicalNameEs,
  ANATOMICAL_SYSTEMS_ES,
  normalizedTerm,
  SYSTEM_DESCRIPTIONS_ES,
} from "@/lib/atlas/names-es";

const DetailedScene=dynamic(()=>import("@/components/AtlasDetailedScene"),{
  ssr:false,
  loading:()=> <p className="unified-atlas-wait">Preparando el visualizador anatómico…</p>,
});

type Props={
  sex:"m"|"f";
  activeSystem:string;
  selectedStructure:string;
  layers:Record<string,boolean>;
  onSelectLegacy:(id:string)=>void;
};

const RELATED:Record<string,SystemId[]>={
  all:[],
  skeletal:["skeletal"],
  muscular:["muscular","connective"],
  circulatory:["cardiac","arterial","venous"],
  respiratory:["respiratory"],
  digestive:["digestive"],
  nervous:["nervous","sensory"],
  urinary:["urinary"],
  integumentary:["integumentary"],
  reproductive:["reproductive"],
};
const LEGACY_QUERIES:Record<string,string[]>={
  heart:["corazón","ventrículo","heart"],
  lungs:["pulmón","lung"],
  brain:["encéfalo","brain"],
  skull:["cráneo","hueso frontal"],
  spine:["columna","vértebra"],
  ribs:["costilla"],
  biceps:["bíceps"],
  liver:["hígado"],
  kidneys:["riñón"],
  ureters:["uréter"],
  bladder:["vejiga"],
  stomach:["estómago"],
  trachea:["tráquea"],
  bronchi:["bronquio"],
  intestines:["intestino"],
  skeleton:["fémur","hueso"],
  pectoral:["pectoral"],
  quadriceps:["recto femoral"],
  spinalcord:["médula espinal"],
  nerves:["nervio"],
  arteries:["arteria"],
  veins:["vena"],
  skin:["piel"],
  uterus:["útero"],
  ovaries:["ovario"],
};
const ALIASES:ReadonlyArray<[string,string]>= [
 ["corazon","heart"],["pulmon","lung"],["pulmones","lung"],
 ["higado","liver"],["rinon","kidney"],["rinones","kidney"],
 ["utero","uterus"],["ovarios","ovary"],["estomago","stomach"],
 ["craneo","skull"],["traquea","trachea"],["femur","femur"]
];

function availableSystems(active:string,layers:Record<string,boolean>,female:boolean):SystemId[]{
  const allowed=new Set<SystemId>();
  // The legacy layer controls are the single source of truth.
  const layerGroups:Record<string,SystemId[]>={
    skeletal:["skeletal"],muscular:["muscular","connective"],
    circulatory:["cardiac","arterial","venous"],respiratory:["respiratory"],
    digestive:["digestive"],nervous:["nervous","sensory"],
    urinary:["urinary"],integumentary:["integumentary"],
    reproductive:["reproductive"],lymphatic:["lymphatic"],
    endocrine:["endocrine"],pregnancy:["pregnancy"],
  };
  for(const [key,ids] of Object.entries(layerGroups)){
    if((key==="pregnancy"&&!female)||layers[key]===false)continue;
    for(const id of ids)allowed.add(id);
  }
  const focus=RELATED[active];
  if(focus?.length)return [...allowed].filter(id=>focus.includes(id));
  const result: SystemId[]=DEFAULT_VISIBLE.filter(id=>allowed.has(id));
  // Skin is a separate toggle: enable it only on explicit request so the
  // organs remain visible on first load.
  if(layers.integumentary===true)result.push("integumentary");
  if(female&&layers.pregnancy===true)result.push("pregnancy");
  return result;
}

function findConcept(atlas:Atlas,term:string):Concept|undefined{
  const normalized=normalizedTerm(term);
  if(!normalized)return;
  const translated=ALIASES.find(([es])=>normalized.includes(es))?.[1];
  return atlas.concepts.find(c=>{
    const name=normalizedTerm(anatomicalNameEs(c.name));
    const original=normalizedTerm(c.name);
    return name===normalized||original===normalized;
  })??atlas.concepts.find(c=>
    normalizedTerm(anatomicalNameEs(c.name)).includes(normalized)||
    normalizedTerm(c.name).includes(translated??normalized)
  );
}

export default function DetailedAtlasViewer({sex,activeSystem,selectedStructure,layers,onSelectLegacy}:Props){
  const female=sex==="f";
  const [maleAtlas,setMaleAtlas]=useState<Atlas|null>(null);
  const [femaleAtlas,setFemaleAtlas]=useState<Atlas|null>(null);
  const [attempt,setAttempt]=useState(0);
  const lastLocalLegacySelect=useRef<string|null>(null);
  const atlas=female?femaleAtlas:maleAtlas;
  const [error,setError]=useState("");
  const [progress,setProgress]=useState(0);
  const [selectedIds,setSelectedIds]=useState<string[]>([]);
  const [term,setTerm]=useState("");
  const [showResults,setShowResults]=useState(false);
  const [showNames,setShowNames]=useState(true);
  const [clean,setClean]=useState(true);
  const [view,setView]=useState<View>("three-quarter");
  const [rotate,setRotate]=useState(false);
  const [explode,setExplode]=useState(0);
  const [isolate,setIsolate]=useState(false);
  const [reset,setReset]=useState(0);

  useEffect(()=>{
    if(atlas)return;
    const controller=new AbortController();
    const path=female?"/api/female-atlas/atlas.json":"/api/atlas/atlas.json";
    fetch(path,{signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error("No fue posible descargar el catálogo anatómico. Revisá la conexión.");
        return await response.json() as Atlas;
      })
      .then(data=>{
        if(controller.signal.aborted)return;
        if(female)setFemaleAtlas(data);
        else setMaleAtlas(data);
      })
      .catch((caught:unknown)=>{
        if(!controller.signal.aborted)setError(caught instanceof Error?caught.message:"Falló la carga del catálogo.");
      });
    return ()=>controller.abort();
  },[female,atlas,attempt]);

  // Switching sex frees the old WebGL canvas and resets selections and zoom.
  useEffect(()=>{
    setSelectedIds([]);setTerm("");setShowResults(false);
    setExplode(0);setView("three-quarter");setRotate(false);
    setIsolate(false);setProgress(0);setError("");
    setReset(value=>value+1);
  },[sex]);

  const visible=useMemo(()=>availableSystems(activeSystem,layers,female),[activeSystem,layers,female]);
  const state=useMemo<SceneState>(()=>({
    visible,selected:selectedIds,isolate,view,rotate,explode,reset,
    inspectorOpen:selectedIds.length>0,
  }),[visible,selectedIds,isolate,view,rotate,explode,reset]);

  const selected=useMemo(()=>atlas?.parts.find(part=>part.id===selectedIds[0]),[atlas,selectedIds]);
  const results=useMemo(()=>{
    if(!atlas || !term.trim() || !showResults)return [];
    const query=normalizedTerm(term);
    const translated=ALIASES.find(([es])=>query.includes(es))?.[1];
    return atlas.concepts.filter(concept=>{
      const spanish=normalizedTerm(anatomicalNameEs(concept.name));
      const english=normalizedTerm(concept.name);
      return spanish.includes(query)||english.includes(query)||
        Boolean(translated&&english.includes(translated))||concept.id.toLowerCase().includes(query);
    }).slice(0,24);
  },[atlas,term,showResults]);

  function pickPart(id:string){
    const part=atlas?.parts.find(item=>item.id===id);
    if(!part)return;
    setSelectedIds([id]);
    setIsolate(false);
    setTerm(anatomicalNameEs(part.name));
    setShowResults(false);
    const name=normalizedTerm(anatomicalNameEs(part.name));
    const legacy=Object.entries(LEGACY_QUERIES).find(([,aliases])=>aliases.some(alias=>
      name.includes(normalizedTerm(alias))
    ))?.[0];
    if(legacy){lastLocalLegacySelect.current=legacy;onSelectLegacy(legacy);}
  }

  function pickConcept(concept:Concept){
    setSelectedIds(concept.elements);
    setTerm(anatomicalNameEs(concept.name));
    setShowResults(false);
    setIsolate(false);
    const part=atlas?.parts.find(item=>item.id===concept.elements[0]);
    if(part)pickPart(part.id);
    // Preserve the whole anatomical concept, not only the first mesh.
    setSelectedIds(concept.elements);
  }

  function showFromStudy(){
    if(!atlas)return;
    const names=LEGACY_QUERIES[selectedStructure];
    if(!names?.length)return;
    const match=names.map(name=>findConcept(atlas,name)).find(Boolean);
    if(match){setSelectedIds(match.elements);setTerm(anatomicalNameEs(match.name));setShowResults(false);}
  }
  useEffect(()=>{
    if(lastLocalLegacySelect.current===selectedStructure){
      lastLocalLegacySelect.current=null;
      return;
    }
    if(!atlas || !selectedStructure)return;
    // Study navigation changes the legacy selection. Also locate it in the
    // detailed atlas so the 3D view and educational card point to the same topic.
    const words=LEGACY_QUERIES[selectedStructure];
    if(!words?.length)return;
    const found=words.map(name=>findConcept(atlas,name)).find(Boolean);
    if(found)setSelectedIds(found.elements);
  },[atlas,selectedStructure]);

  function resetView(){
    setView("three-quarter");setRotate(false);setExplode(0);setIsolate(false);
    setSelectedIds([]);setTerm("");setShowResults(false);setReset(value=>value+1);
  }
  function retry(){
    if(female)setFemaleAtlas(null);else setMaleAtlas(null);
    setError("");setProgress(0);setAttempt(value=>value+1);
  }

  const selectedSystem=selected?SYSTEMS.find(system=>system.id===selected.system):undefined;
  return (
    <div className="unified-detail-root">
      <div className="unified-detail-search">
        <label htmlFor="unified-structure-search">Buscar en el cuerpo detallado</label>
        <div className="unified-search-row">
          <input id="unified-structure-search" value={term}
            placeholder="Corazón, pulmón, útero, fémur..."
            onFocus={()=>setShowResults(true)}
            onChange={event=>{setTerm(event.target.value);setShowResults(true);}}
            autoComplete="off"/>
          <button type="button" onClick={()=>{setTerm("");setShowResults(false);setSelectedIds([]);}} aria-label="Limpiar búsqueda">×</button>
        </div>
        {showResults && term.trim() && <div className="unified-detail-results">
          {results.length?results.map(concept=><button key={concept.id} type="button" onClick={()=>pickConcept(concept)}>
            <span>{anatomicalNameEs(concept.name)}</span><small>{concept.elements.length} pieza(s)</small>
          </button>):<span className="unified-no-results">{atlas?"No hay coincidencias":"Cargando catálogo…"}</span>}
        </div>}
      </div>

      <div className="unified-3d-stage" role="region" aria-label={female?"Anatomía femenina detallada 3D":"Anatomía masculina detallada 3D"}>
        {atlas&&!error&&<DetailedScene key={sex+"-"+attempt} atlas={atlas} state={state} showNames={showNames}
          cleanView={female&&clean} onSelect={pickPart} onProgress={setProgress} onError={setError}/>}
        {error && !/WebGL/i.test(error) && <div className="unified-schematic-fallback" aria-label="Representación anatómica esquemática de respaldo">
          <Canvas dpr={[1,1.5]} camera={{position:[1.2,1.35,4.5],fov:39}}>
            <ambientLight intensity={1.15}/>
            <directionalLight position={[3,4,5]} intensity={1.3}/>
            <AnatomyScene activeSystem={activeSystem} selected={selectedStructure}
              onSelect={onSelectLegacy} sex={sex} heartRate={72} breathRate={16}
              running={false} visibleLayers={layers}/>
            <OrbitControls enableDamping minDistance={1.6} maxDistance={8} target={[0,0.9,0]}/>
          </Canvas>
        </div>}
        {!atlas&&!error&&<div className="unified-stage-message" role="status">Cargando catálogo {female?"femenino":"masculino"}…</div>}
        {atlas&&progress<100&&!error&&<div className="unified-stage-message" role="status">
          <strong>Descargando geometría anatómica · {progress}%</strong>
          <div className="unified-stage-progress"><span style={{width:progress+"%"}}/></div>
          <small>La primera carga puede consumir {female?"alrededor de 55":"alrededor de 33"} MB. Recomendamos Wi-Fi.</small>
        </div>}
        {error&&<div className="unified-stage-message unified-error" role="alert">
          <strong>Problema al cargar la anatomía detallada</strong><p>{error}</p><p>{/WebGL/i.test(error)?"El visualizador necesita WebGL habilitado.":"Podés continuar estudiando con el esquema anatómico mientras se recupera la carga."}</p>
          <button type="button" onClick={retry}>Reintentar</button>
        </div>}
        <div className="unified-stage-hint">Arrastrá para girar · pellizcá para acercar · tocá una estructura</div>
      </div>

      <div className="unified-view-controls" aria-label="Controles del modelo anatómico">
        <button type="button" className={showNames?"active":""} onClick={()=>setShowNames(value=>!value)}
          aria-pressed={showNames}>{showNames?"Ocultar nombres":"Mostrar nombres"}</button>
        {female&&<button type="button" className={clean?"active":""} onClick={()=>setClean(value=>!value)}
          aria-pressed={clean} title="Oculta piezas superpuestas del conjunto femenino">Vista anatómica limpia</button>}
        <button type="button" className={rotate?"active":""} onClick={()=>setRotate(value=>!value)}
          aria-pressed={rotate}>{rotate?"Pausar giro":"Girar"}</button>
        <button type="button" onClick={resetView}>Ver cuerpo completo</button>
        <div className="unified-views">
          {([["three-quarter","¾"],["front","Frente"],["side","Lado"],["back","Atrás"]] as const).map(([id,label])=>
            <button key={id} type="button" aria-pressed={view===id} className={view===id?"active":""}
              onClick={()=>{setView(id);setRotate(false);setReset(v=>v+1);}}>{label}</button>
          )}
        </div>
      </div>
      <div className="unified-explode-row">
        <label htmlFor="unified-explode">Separar estructuras <strong>{Math.round(explode*100)}%</strong></label>
        <input id="unified-explode" type="range" value={explode*100} min={0} max={100} step={1}
          onChange={event=>{setExplode(Number(event.target.value)/100);setRotate(false);}}/>
      </div>
      <div className="unified-selected-info">
        <div>
          <span className="unified-selected-label">ESTRUCTURA ANATÓMICA</span>
          <strong>{selected?anatomicalNameEs(selected.name):"Elegí una estructura para estudiarla"}</strong>
          <p>{selected?(SYSTEM_DESCRIPTIONS_ES[selected.system]??"Estructura anatómica de referencia."):"Podés usar la búsqueda, las etiquetas o la lista de sistemas. El diccionario y los cuestionarios están en esta misma página."}</p>
          {selected&&<small>Nombre original: {selected.name} · {ANATOMICAL_SYSTEMS_ES[selected.system]??selectedSystem?.name??"Anatomía"}</small>}
        </div>
        <div className="unified-selected-actions">
          {selected&&<button type="button" onClick={()=>setIsolate(v=>!v)}>
            {isolate?"Mostrar el cuerpo":"Aislar pieza"}
          </button>}
          <button type="button" onClick={showFromStudy} disabled={!atlas}>Buscar tema del estudio</button>
        </div>
      </div>
      <p className="unified-model-source">
        {female?"Modelo femenino adaptado de Female Atlas, HuBMAP y BodyParts3D. Algunas capas se reconstruyeron digitalmente.":"Modelo masculino BodyParts3D."}
        {" "}Uso educativo, no diagnóstico. Las simulaciones cardíacas y respiratorias se encuentran en la sección Fisiología.
        {" "}<a href={female?"/ATTRIBUTION_FEMALE_ATLAS.md":"/ATTRIBUTION_HUMAN_ATLAS.md"} target="_blank" rel="noopener noreferrer">Créditos y atribución</a>.
        {" "}<a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noopener noreferrer">Licencia anatómica CC BY 4.0</a>.
      </p>
    </div>
  );
}
