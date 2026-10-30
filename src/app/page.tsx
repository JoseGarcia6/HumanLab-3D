"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnatomyScene } from "@/components/AnatomyScene";
import { ExplorationGuide } from "@/components/ExplorationGuide";
import { LearningLibrary } from "@/components/LearningLibrary";

const DetailedAtlasViewer=dynamic(()=>import("@/components/DetailedAtlasViewer"),{ssr:false});

type System = { id: string; name: string; icon: string; color: string; structures: string[]; description: string };
const systems: System[] = [
 {id:"all",name:"Cuerpo completo",icon:"✦",color:"#7c9cff",structures:["Esqueleto","Músculos","Órganos"],description:"Vista general del cuerpo humano de referencia."},
 {id:"circulatory",name:"Circulatorio",icon:"♥",color:"#fb7185",structures:["Corazón","Arterias","Venas"],description:"Transporta sangre, oxígeno y nutrientes por el organismo."},
 {id:"respiratory",name:"Respiratorio",icon:"◉",color:"#67e8f9",structures:["Pulmones","Tráquea","Bronquios"],description:"Permite el intercambio de oxígeno y dióxido de carbono."},
 {id:"digestive",name:"Digestivo",icon:"◌",color:"#fbbf24",structures:["Estómago","Hígado","Intestinos"],description:"Procesa los alimentos y facilita la absorción de nutrientes."},
 {id:"skeletal",name:"Esquelético",icon:"⌁",color:"#e5e7eb",structures:["Cráneo","Columna","Costillas"],description:"Da soporte, protege órganos y ayuda al movimiento."},
 {id:"muscular",name:"Muscular",icon:"〰",color:"#c084fc",structures:["Pectorales","Bíceps","Cuádriceps"],description:"Produce movimiento, estabiliza articulaciones y genera calor."},
 {id:"nervous",name:"Nervioso",icon:"✳",color:"#f0c35b",structures:["Encéfalo","Médula espinal","Nervios"],description:"Coordina respuestas, movimiento, percepción y funciones del organismo."},
 {id:"urinary",name:"Urinario",icon:"◇",color:"#c4b5fd",structures:["Riñones","Uréteres","Vejiga"],description:"Filtra la sangre y contribuye al equilibrio de agua y sales."},
 {id:"integumentary",name:"Tegumentario",icon:"▧",color:"#d7a98e",structures:["Piel","Cabello","Uñas"],description:"La piel y sus anexos forman una barrera protectora del cuerpo."},
];
type Structure = { id: string; name: string; system: string; description: string; tags: string[]; schematic3D: boolean };
const structures: Structure[] = [
 {id:"heart",name:"Corazón",system:"circulatory",description:"Órgano muscular que impulsa la sangre a través de la circulación.",tags:["cardiovascular","sangre"],schematic3D:true},
 {id:"lungs",name:"Pulmones",system:"respiratory",description:"Intercambian oxígeno y dióxido de carbono entre el aire y la sangre.",tags:["respiración","oxígeno"],schematic3D:true},
 {id:"stomach",name:"Estómago",system:"digestive",description:"Mezcla los alimentos con jugos gástricos y participa en la digestión.",tags:["digestión","alimentos"],schematic3D:true},
 {id:"liver",name:"Hígado",system:"digestive",description:"Procesa nutrientes y produce bilis.",tags:["bilis","metabolismo"],schematic3D:true},
 {id:"intestines",name:"Intestinos",system:"digestive",description:"Absorben nutrientes y agua a lo largo del tubo digestivo.",tags:["colon","nutrientes"],schematic3D:true},
 {id:"skeleton",name:"Esqueleto",system:"skeletal",description:"Proporciona soporte, protege órganos y participa en el movimiento.",tags:["huesos","columna","cráneo"],schematic3D:true},
 {id:"brain",name:"Encéfalo",system:"nervous",description:"Procesa información y coordina numerosas funciones.",tags:["cerebro","nervios"],schematic3D:true},
 {id:"kidneys",name:"Riñones",system:"urinary",description:"Filtran la sangre y ayudan a mantener el equilibrio de líquidos y sales.",tags:["orina","filtración"],schematic3D:true},
 {id:"ureters",name:"Uréteres",system:"urinary",description:"Conductos musculares que transportan la orina desde los riñones hasta la vejiga.",tags:["orina","vías urinarias"],schematic3D:true},
 {id:"bladder",name:"Vejiga urinaria",system:"urinary",description:"Almacena temporalmente la orina antes de su eliminación.",tags:["orina"],schematic3D:true},
 {id:"arteries",name:"Arterias",system:"circulatory",description:"Llevan la sangre desde el corazón hacia los tejidos.",tags:["vasos sanguíneos","circulación"],schematic3D:false},
 {id:"veins",name:"Venas",system:"circulatory",description:"Devuelven la sangre desde los tejidos hacia el corazón.",tags:["vasos sanguíneos","circulación"],schematic3D:false},
 {id:"trachea",name:"Tráquea",system:"respiratory",description:"Conduce el aire hacia los vías respiratorias inferiores.",tags:["aire","respiración"],schematic3D:true},
 {id:"bronchi",name:"Bronquios",system:"respiratory",description:"Distribuyen el aire desde la tráquea hacia los pulmones.",tags:["pulmones","aire"],schematic3D:true},
 {id:"skull",name:"Cráneo",system:"skeletal",description:"Protege el encéfalo y sostiene estructuras de la cara.",tags:["huesos","cabeza"],schematic3D:true},
 {id:"spine",name:"Columna vertebral",system:"skeletal",description:"Sostiene el tronco y protege la médula espinal.",tags:["vértebras","espalda"],schematic3D:true},
 {id:"ribs",name:"Costillas",system:"skeletal",description:"Forman parte de la caja torácica y protegen órganos del tórax.",tags:["tórax","huesos"],schematic3D:true},
 {id:"pectoral",name:"Pectorales",system:"muscular",description:"Participan en los movimientos del hombro y el brazo.",tags:["músculos","tórax"],schematic3D:true},
 {id:"biceps",name:"Bíceps",system:"muscular",description:"Contribuye a flexionar el codo y girar el antebrazo.",tags:["brazo","músculos"],schematic3D:true},
 {id:"quadriceps",name:"Cuádriceps",system:"muscular",description:"Extiende la rodilla y participa en caminar y levantarse.",tags:["pierna","muslos"],schematic3D:true},
 {id:"spinalcord",name:"Médula espinal",system:"nervous",description:"Transmite señales entre el encéfalo y el cuerpo.",tags:["columna","nervios"],schematic3D:true},
 {id:"nerves",name:"Nervios",system:"nervous",description:"Conducen señales entre el sistema nervioso central y el resto del cuerpo.",tags:["señales","sensibilidad"],schematic3D:true},
 {id:"skin",name:"Piel",system:"integumentary",description:"Recubre y protege la superficie corporal, contribuye a regular la temperatura y contiene receptores sensoriales.",tags:["barrera","protección","temperatura"],schematic3D:true},
 {id:"hair",name:"Cabello y vello",system:"integumentary",description:"Contribuyen a la protección y sensibilidad de la piel.",tags:["folículos","piel"],schematic3D:false},
 {id:"nails",name:"Uñas",system:"integumentary",description:"Protegen las puntas de los dedos y facilitan tareas de precisión.",tags:["dedos","piel"],schematic3D:false},
];
const structureIdForName: Record<string,string> = {
 "Pulmones":"lungs","Tráquea":"trachea","Bronquios":"bronchi",
 "Corazón":"heart","Arterias":"arteries","Venas":"veins",
 "Estómago":"stomach","Hígado":"liver","Intestinos":"intestines",
 "Esqueleto":"skeleton","Cráneo":"skull","Columna":"spine","Costillas":"ribs",
 "Pectorales":"pectoral","Bíceps":"biceps","Cuádriceps":"quadriceps",
 "Encéfalo":"brain","Médula espinal":"spinalcord","Nervios":"nerves",
 "Riñones":"kidneys","Uréteres":"ureters","Vejiga":"bladder",
 "Piel":"skin","Cabello":"hair","Uñas":"nails"
};
const organInfo: Record<string,{title:string;system:string;function:string;location:string;relations:string[]}> = {
 heart:{title:"Corazón",system:"Sistema cardiovascular",function:"Órgano muscular que impulsa la sangre a través de la circulación pulmonar y sistémica.",location:"En el tórax, entre los pulmones y detrás del esternón, ligeramente hacia la izquierda.",relations:["Pulmones","Grandes vasos sanguíneos","Diafragma"]},
 lungs:{title:"Pulmones",system:"Sistema respiratorio",function:"Realizan el intercambio de oxígeno y dióxido de carbono entre el aire de los alvéolos y la sangre.",location:"Dentro de la cavidad torácica, a ambos lados del mediastino.",relations:["Tráquea","Bronquios","Corazón","Diafragma"]},
 stomach:{title:"Estómago",system:"Sistema digestivo",function:"Mezcla los alimentos con secreciones gástricas y participa en la digestión, especialmente de proteínas.",location:"En la parte superior del abdomen, principalmente hacia el lado izquierdo.",relations:["Esófago","Hígado","Páncreas","Intestino delgado"]},
 liver:{title:"Hígado",system:"Sistema digestivo",function:"Procesa nutrientes, produce bilis y participa en el metabolismo de sustancias.",location:"En la parte superior derecha del abdomen, debajo del diafragma.",relations:["Vesícula biliar","Estómago","Intestino delgado","Vasos sanguíneos"]},
 intestines:{title:"Intestinos",system:"Sistema digestivo",function:"El intestino delgado absorbe la mayoría de los nutrientes; el intestino grueso absorbe agua y contribuye a formar las heces.",location:"Ocupan gran parte de la cavidad abdominal.",relations:["Estómago","Hígado","Páncreas","Recto"]},
 kidneys:{title:"Riñones",system:"Sistema urinario",function:"Filtran la sangre para producir orina y contribuyen al equilibrio de agua, electrolitos y ácido-base.",location:"En la parte posterior del abdomen, a ambos lados de la columna vertebral.",relations:["Uréteres","Vejiga urinaria","Vasos renales","Glándulas suprarrenales"]},
 ureters:{title:"Uréteres",system:"Sistema urinario",function:"Transportan la orina desde la pelvis renal hasta la vejiga mediante contracciones musculares coordinadas.",location:"Descienden desde cada riñón por la parte posterior del abdomen hasta la pelvis.",relations:["Riñones","Vejiga urinaria","Pelvis renal"]},
 bladder:{title:"Vejiga urinaria",system:"Sistema urinario",function:"Almacena temporalmente la orina hasta que se elimina durante la micción.",location:"En la pelvis, detrás de la sínfisis del pubis.",relations:["Uréteres","Uretra","Riñones"]},
 brain:{title:"Encéfalo",system:"Sistema nervioso",function:"Integra información sensorial y participa en el movimiento, la memoria, las emociones y la regulación de funciones corporales.",location:"Dentro de la cavidad craneal, protegido por el cráneo y las meninges.",relations:["Médula espinal","Nervios craneales","Órganos de los sentidos"]},
 skin:{title:"Piel",system:"Sistema tegumentario",function:"Actúa como barrera protectora, ayuda a regular la temperatura y contiene receptores sensoriales.",location:"Recubre la superficie externa del cuerpo.",relations:["Cabello","Uñas","Glándulas sudoríparas","Tejido subcutáneo"]},
 skeleton:{title:"Esqueleto",system:"Sistema esquelético",function:"Proporciona soporte, protege órganos, sirve de anclaje a los músculos y contiene médula ósea.",location:"Distribuido por el cuerpo; incluye el esqueleto axial y el apendicular.",relations:["Articulaciones","Músculos","Médula ósea","Sistema nervioso"]},
 arteries:{title:"Arterias",system:"Sistema cardiovascular",function:"Transportan la sangre desde el corazón hacia los tejidos; la mayoría lleva sangre oxigenada, con excepciones como las arterias pulmonares.",location:"Se distribuyen por todo el cuerpo y se ramifican en vasos cada vez más pequeños.",relations:["Corazón","Arteriolas","Capilares","Venas"]},
 veins:{title:"Venas",system:"Sistema cardiovascular",function:"Devuelven la sangre desde los tejidos hacia el corazón; las venas pulmonares son una excepción respecto a la oxigenación habitual.",location:"Se distribuyen por todo el cuerpo y acompañan muchas rutas arteriales.",relations:["Corazón","Vénulas","Capilares","Arterias"]},
 trachea:{title:"Tráquea",system:"Sistema respiratorio",function:"Conduce el aire entre la laringe y los bronquios y ayuda a filtrar partículas mediante su revestimiento mucociliar.",location:"En el cuello y la parte superior del tórax, delante del esófago.",relations:["Laringe","Bronquios","Pulmones"]},
 bronchi:{title:"Bronquios",system:"Sistema respiratorio",function:"Conducen y distribuyen el aire desde la tráquea hacia los pulmones.",location:"Se originan en la bifurcación de la tráquea y penetran en cada pulmón.",relations:["Tráquea","Pulmones","Bronquiolos"]},
 skull:{title:"Cráneo",system:"Sistema esquelético",function:"Protege el encéfalo y sostiene estructuras de la cara.",location:"En la cabeza, rodeando la cavidad craneal.",relations:["Encéfalo","Columna cervical","Mandíbula"]},
 spine:{title:"Columna vertebral",system:"Sistema esquelético",function:"Sostiene el tronco, permite movimientos y protege la médula espinal.",location:"A lo largo de la línea media de la espalda, desde el cuello hasta la pelvis.",relations:["Médula espinal","Costillas","Pelvis","Músculos"]},
 ribs:{title:"Costillas",system:"Sistema esquelético",function:"Forman parte de la caja torácica y ayudan a proteger órganos del tórax.",location:"En el tórax, conectadas principalmente con las vértebras torácicas.",relations:["Esternón","Columna vertebral","Pulmones","Corazón"]},
 pectoral:{title:"Pectorales",system:"Sistema muscular",function:"Participan en los movimientos del hombro y del brazo, como acercar el brazo al cuerpo.",location:"En la región anterior del tórax.",relations:["Esternón","Clavícula","Húmero","Costillas"]},
 biceps:{title:"Bíceps",system:"Sistema muscular",function:"Contribuye a flexionar el codo y a supinar el antebrazo.",location:"En la parte anterior del brazo, entre el hombro y el codo.",relations:["Escápula","Radio","Músculos del antebrazo"]},
 quadriceps:{title:"Cuádriceps",system:"Sistema muscular",function:"Es el principal grupo muscular extensor de la rodilla y participa en actividades como caminar y levantarse.",location:"En la parte anterior del muslo.",relations:["Pelvis","Fémur","Rótula","Tibia"]},
 spinalcord:{title:"Médula espinal",system:"Sistema nervioso",function:"Transmite señales entre el encéfalo y el cuerpo y coordina determinados reflejos.",location:"Dentro del conducto vertebral.",relations:["Encéfalo","Vértebras","Nervios espinales"]},
 nerves:{title:"Nervios",system:"Sistema nervioso",function:"Conducen señales sensitivas, motoras y autónomas entre el sistema nervioso central y otras partes del cuerpo.",location:"Se extienden desde el encéfalo y la médula espinal hacia distintas regiones corporales.",relations:["Encéfalo","Médula espinal","Músculos","Receptores sensoriales"]},
 hair:{title:"Cabello y vello",system:"Sistema tegumentario",function:"Contribuyen a la protección y a la sensibilidad de la piel; su función varía según la región.",location:"Emergen de folículos distribuidos en distintas áreas de la piel.",relations:["Piel","Folículos pilosos","Glándulas sebáceas"]},
 nails:{title:"Uñas",system:"Sistema tegumentario",function:"Protegen las puntas de los dedos y facilitan tareas de precisión.",location:"En la superficie dorsal de las falanges distales de manos y pies.",relations:["Piel","Falanges","Lecho ungueal"]},
};
const learningQuestions = [
 {question:"¿Cuál es la función principal del corazón?",options:["Producir bilis","Impulsar la sangre","Intercambiar gases"],correct:1,explanation:"El corazón bombea la sangre hacia la circulación pulmonar y sistémica.",structure:"heart"},
 {question:"¿Dónde ocurre el intercambio de oxígeno y dióxido de carbono en los pulmones?",options:["En los alvéolos","En la tráquea","En el diafragma"],correct:0,explanation:"Los alvéolos son pequeños sacos donde los gases intercambian entre el aire y la sangre.",structure:"lungs"},
 {question:"¿Qué estructura almacena temporalmente la orina?",options:["Riñón","Uréter","Vejiga urinaria"],correct:2,explanation:"La vejiga almacena la orina hasta que se elimina por la uretra.",structure:"bladder"},
 {question:"¿Qué protege principalmente el cráneo?",options:["El encéfalo","El estómago","Los pulmones"],correct:0,explanation:"Los huesos del cráneo rodean y protegen el encéfalo.",structure:"skull"},
];
const focusTargets:Record<string,[number,number,number]>={heart:[0,1.15,0],lungs:[0,1.25,0],stomach:[0,0.82,0],liver:[-0.1,0.9,0],intestines:[0,0.55,0],skeleton:[0,1.1,0],skull:[0,2.0,0],spine:[0,1.2,0],ribs:[0,0.55,0],pectoral:[0,1.35,0],biceps:[0.4,1.15,0],quadriceps:[0,-0.05,0],brain:[0,2.0,0],spinalcord:[0,1.2,0],nerves:[0,1.3,0],kidneys:[0,0.7,0],ureters:[0,0.55,0],bladder:[0,0.3,0],skin:[0,0.7,0],trachea:[0,1.6,0],bronchi:[0,1.45,0]};
export default function Home(){
 const [activeSystem,setActiveSystem]=useState("all"); const [selected,setSelected]=useState("heart"); const [query,setQuery]=useState(""); const [mode,setMode]=useState<"anatomy"|"lab">("anatomy"); const [sex,setSex]=useState<"f"|"m">("m"); const [heartRate,setHeartRate]=useState(72); const [breathRate,setBreathRate]=useState(16); const [running,setRunning]=useState(true); const [quizIndex,setQuizIndex]=useState(0); const [quizAnswer,setQuizAnswer]=useState<number|null>(null); const [visibleLayers,setVisibleLayers]=useState<Record<string,boolean>>({circulatory:false,respiratory:true,digestive:true,skeletal:true,muscular:true,nervous:false,urinary:true,integumentary:false}); const [labExperiment,setLabExperiment]=useState<"cardio"|"respiratory">("cardio");
 const system=systems.find(s=>s.id===activeSystem)??systems[0]; const info=organInfo[selected]??organInfo.heart; const selectedStructure=structures.find(item=>item.id===selected);
 const filteredStructures=useMemo(()=>{const q=query.trim().toLocaleLowerCase("es");return structures.filter(item=>(q?true:(activeSystem==="all"||item.system===activeSystem))&&(!q||[item.name,item.description,...item.tags].some(value=>value.toLocaleLowerCase("es").includes(q))))},[activeSystem,query]);
 const chooseStructure=(item:Structure)=>{setSelected(item.id);setActiveSystem(item.system)};
 const chooseBody=(body:"f"|"m")=>{
   if(body===sex)return;
   setSex(body);setActiveSystem("all");setSelected("heart");setQuery("");
   setVisibleLayers({circulatory:false,respiratory:true,digestive:true,skeletal:true,muscular:true,nervous:false,urinary:true,integumentary:false});
 };

 useEffect(()=>{
  const followHash=()=>{
   const hash=window.location.hash;
   if(hash==="#laboratorio-fisiologico")setMode("lab");
  };
  followHash();
  window.addEventListener("hashchange",followHash);
  return ()=>window.removeEventListener("hashchange",followHash);
 },[]);

 
 return <main className="app-shell">
  <aside className="sidebar"><div className="brand"><div className="brand-mark">H<span>+</span></div><div><strong>HumanLab <em>3D</em></strong><small>ANATOMÍA INTERACTIVA</small></div></div>
   <div className="side-label">EXPLORAR</div><a href="#atlas-visualizador" className={`nav-item ${mode==="anatomy"?"active":""}`} onClick={()=>setMode("anatomy")}><span>◈</span> Anatomía 3D detallada</a><a href="#laboratorio-fisiologico" className={`nav-item ${mode==="lab"?"active":""}`} onClick={()=>setMode("lab")}><span>⌁</span> Laboratorio fisiológico</a><a className="nav-item" href="#biblioteca-aprendizaje"><span>▤</span> Diccionario y evaluaciones</a><a className="nav-item" href="#progreso-estudio"><span>◎</span> Progreso y resultados</a>
   <div className="side-label spaced">SISTEMAS DEL CUERPO</div><div className="system-list">{systems.map(s=><button key={s.id} className={`system-item ${activeSystem===s.id?"chosen":""}`} onClick={()=>{setActiveSystem(s.id);setSelected(s.id==="respiratory"?"lungs":s.id==="digestive"?"stomach":s.id==="skeletal"?"skeleton": s.id==="nervous"?"brain":s.id==="urinary"?"kidneys":s.id==="integumentary"?"skin":"heart")}}><span className="system-icon" style={{color:s.color}}>{s.icon}</span>{s.name}{activeSystem===s.id&&<i/>}</button>)}</div>
   <div className="side-label spaced">BUSCAR ESTRUCTURA</div><label className="main-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar estructura anatómica" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Corazón, pulmones…" /><button type="button" onClick={()=>setQuery("")} aria-label="Limpiar búsqueda">×</button></label>
   <div className="main-structure-list">{filteredStructures.map(item=><button key={item.id} className={`main-structure ${selected===item.id?"selected":""}`} onClick={()=>chooseStructure(item)}><span className="structure-dot"/><span>{item.name}</span><small>↗</small></button>)}{filteredStructures.length===0&&<p className="main-search-empty">No hay coincidencias. Probá otro término.</p>}</div>
   <div className="sidebar-bottom"><div className="status-dot"/> <span>Modo educativo</span><small>PREVIEW 0.1</small></div>
  </aside>
  <section className="main-area"><header className="topbar"><div><div className="eyebrow">LABORATORIO DIGITAL <span>•</span> ANATOMÍA HUMANA</div><h1>{mode==="anatomy"?"HumanLab 3D — Plataforma educativa":"Laboratorio fisiológico"}</h1></div><div className="top-actions"><ExplorationGuide /><div className="online-pill"><span/> Motor 3D activo</div><a className="profile-button" href="#progreso-estudio" aria-label="Ver resultados del aprendizaje" title="Ver progreso y resultados">◎</a></div></header>
   <nav className="study-workspace-nav" aria-label="Secciones de estudio HumanLab 3D">
    <a href="#atlas-visualizador">◉ Anatomía 3D · Hombre / Mujer</a>
    <a href="#diccionario">▤ Diccionario</a>
    <a href="#practicar">✎ Cuestionarios y puntuación</a>
    <a href="#repasar-errores">↺ Preguntas falladas</a>
    <a href="#progreso-estudio">◎ Progreso</a>
    <a href="#laboratorio-fisiologico">♥ Laboratorio cardíaco y pulmonar</a>
   </nav>
   <div className="workspace"><section className="viewer-card" id="atlas-visualizador"><div className="viewer-head"><div><span className="live-dot"/> VISUALIZADOR 3D <span className="muted">/ {system.name.toUpperCase()}</span></div><div className="sex-switch"><button className={sex==="m"?"selected":""} onClick={()=>chooseBody("m")}>Masculino</button><button className={sex==="f"?"selected":""} onClick={()=>chooseBody("f")}>Femenino</button></div></div>
    <DetailedAtlasViewer
      sex={sex} activeSystem={activeSystem} selectedStructure={selected}
      onSelectLegacy={id=>{
        setSelected(id);
        const item=structures.find(entry=>entry.id===id);
        if(item)setActiveSystem(item.system);
      }}
      layers={visibleLayers}
    />
    <div className="layer-controls" aria-label="Capas anatómicas"><div className="layer-controls-heading"><strong>Capas del modelo</strong><span>Las capas controlan los sistemas del modelo anatómico detallado</span></div><div className="layer-buttons">{[{id:"skeletal",label:"Óseo"},{id:"muscular",label:"Muscular"},{id:"circulatory",label:"Circulatorio"},{id:"respiratory",label:"Respiratorio"},{id:"digestive",label:"Digestivo"},{id:"nervous",label:"Nervioso"},{id:"urinary",label:"Urinario"},{id:"integumentary",label:"Tegumentario"}].map(layer=><button type="button" key={layer.id} aria-pressed={visibleLayers[layer.id]!==false} className={visibleLayers[layer.id]!==false?"layer-active":""} onClick={()=>{setActiveSystem("all");setVisibleLayers(previous=>({...previous,[layer.id]:previous[layer.id]===false}))}}>{visibleLayers[layer.id]!==false?"◉":"○"} {layer.label}</button>)}</div><button type="button" className="layer-reset" onClick={()=>setVisibleLayers({circulatory:false,respiratory:true,digestive:true,skeletal:true,muscular:true,nervous:false,urinary:true,integumentary:false})}>Mostrar todas las capas</button></div><div className="viewer-footer"><div className="legend"><span className="legend-dot" style={{background:"#f87171"}}/> Cardiovascular <span className="legend-dot" style={{background:"#67e8f9"}}/> Respiratorio <span className="legend-dot" style={{background:"#e5e7eb"}}/> Esquelético</div><div className="model-tag">◉ MODELO 3D INTERACTIVO</div></div>
   </section>
   <aside className="info-column"><section className="panel organ-panel"><div className="panel-heading"><span>ESTRUCTURA SELECCIONADA</span><span className="more">•••</span></div><div className="organ-illustration" style={{"--organ-color":selected==="lungs"?"#67e8f9":selected==="stomach"||selected==="intestines"?"#fbbf24":selected==="kidneys"||selected==="bladder"?"#c4b5fd":selected==="brain"?"#f0c35b":"#fb7185"} as CSSProperties}><div className="organ-orbit"/><div className="organ-symbol">{selected==="lungs"?"♧":selected==="stomach"||selected==="intestines"?"◉":selected==="skeleton"?"♙":selected==="kidneys"||selected==="bladder"?"◇":selected==="brain"?"✳":selected==="skin"?"▧":"♥"}</div><span className="organ-pulse"/></div><h2>{info.title}</h2><div className="latin">{selected==="heart"?"Cor":selected==="lungs"?"Pulmones":"Estructura anatómica"}</div><div className={`model-availability ${selectedStructure?.schematic3D?"available":"informational"}`}>Modelo anatómico detallado · información educativa</div><p className="description">{info.function}</p><div className="info-divider"/><div className="detail-row"><span>Sistema</span><strong>{info.system}</strong></div><div className="detail-row location-row"><span>Ubicación</span><p>{info.location}</p></div><div className="relations-block"><span className="relations-title">RELACIONES ANATÓMICAS</span><div className="relation-chips">{info.relations.map(relation=><span key={relation}>{relation}</span>)}</div></div><div className="detail-row"><span>Uso</span><strong>Referencia educativa</strong></div><a className="outline-button" href="#laboratorio-fisiologico" onClick={()=>setMode("lab")}>Explorar función <span>↗</span></a></section>
    <section className="panel systems-panel"><div className="panel-heading">INDICADORES DE SIMULACIÓN <span className="beta">BETA</span></div><div className="metric"><div className="metric-icon heart-icon">♥</div><div className="metric-copy"><span>Frecuencia cardíaca</span><strong>{heartRate} <small>lpm</small></strong></div><div className="sparkline heart-line">⌁⌁⌁</div></div><div className="metric"><div className="metric-icon lung-icon">◉</div><div className="metric-copy"><span>Frecuencia respiratoria</span><strong>{breathRate} <small>rpm</small></strong></div><div className="sparkline lung-line">⌁⌁⌁</div></div><div className="metric"><div className="metric-icon oxygen-icon">↗</div><div className="metric-copy"><span>Variables modificadas</span><strong>2 <small>parámetros</small></strong></div></div><p className="disclaimer">No se calcula ni estima saturación de oxígeno: esa variable no puede deducirse de la frecuencia respiratoria por sí sola. Todos los valores son ilustrativos, no mediciones médicas.</p></section>
   </aside></div>
   <section className="bottom-grid"><div className="panel system-summary"><div className="section-title"><div><span className="eyebrow">GUÍA DE EXPLORACIÓN</span><h3>Sistemas del cuerpo</h3></div><span className="count-chip">{system.structures.length} estructuras destacadas</span></div><p>{system.description}</p><div className="structure-chips">{system.structures.map((s,i)=><button key={s} onClick={()=>{const id=structureIdForName[s]??"heart";setSelected(id);const item=structures.find(structure=>structure.id===id);if(item)setActiveSystem(item.system)}}>{s}<span>↗</span></button>)}</div></div>
   <div className="panel lab-card" id="laboratorio-fisiologico"><div className="lab-card-top"><div><span className="eyebrow">EXPERIMENTO INTERACTIVO</span><h3>{mode==="lab"?"Laboratorio de fisiología":"Prueba el laboratorio"}</h3></div><span className="lab-icon">⌁</span></div><div className="unified-lab-animation" aria-label="Simulación 3D educativa del corazón y los pulmones">
  <Canvas camera={{position:[1,1.6,3.8],fov:39}} dpr={[1,1.5]}>
    <color attach="background" args={["#0b1628"]}/>
    <ambientLight intensity={1.75}/>
    <directionalLight position={[3,4,5]} intensity={2.0}/>
    <pointLight position={[-2,2,3]} intensity={0.8} color="#8fc5ff"/>
    <OrbitControls enablePan={false} target={[0,1.13,0]} minDistance={2.0} maxDistance={6.2}/>
    <AnatomyScene activeSystem="all" selected={labExperiment==="cardio"?"heart":"lungs"}
      onSelect={id=>{setSelected(id);setLabExperiment(id==="lungs"?"respiratory":"cardio");}}
      sex={sex} heartRate={heartRate} breathRate={breathRate} running={running}
      visibleLayers={{skeletal:false,muscular:false,circulatory:true,respiratory:true,digestive:false,nervous:false,urinary:false,integumentary:false}}/>
  </Canvas>
  <div className="unified-lab-animation-caption">{labExperiment==="cardio"?"♥ Contracción cardíaca ilustrativa":"◉ Expansión pulmonar ilustrativa"} · {running?"Animación activa":"En pausa"}</div>
 </div><div className="lab-tabs" role="group" aria-label="Experimento fisiológico"><button type="button" className={labExperiment==="cardio"?"active":""} onClick={()=>setLabExperiment("cardio")}>♥ Circulación</button><button type="button" className={labExperiment==="respiratory"?"active":""} onClick={()=>setLabExperiment("respiratory")}>◉ Respiración</button></div><p className="lab-explanation">{labExperiment==="cardio"?(heartRate<60?"En esta simulación, la frecuencia seleccionada es menor de 60 lpm. La frecuencia cardíaca real depende de la edad, actividad y contexto individual.":heartRate>100?"La frecuencia seleccionada supera 100 lpm. Durante el ejercicio puede aumentar; en la vida real debe interpretarse según el contexto.":"La frecuencia seleccionada sirve para observar el ritmo ilustrativo del corazón. No representa una medición ni un rango diagnóstico."):(breathRate<12?"La frecuencia seleccionada es menor de 12 respiraciones por minuto. La respiración real debe interpretarse según edad, sueño, actividad y contexto.":breathRate>20?"La frecuencia seleccionada supera 20 respiraciones por minuto. El esfuerzo puede aumentarla; la simulación no evalúa el estado de salud.":"Observá cómo cambia la expansión esquemática de los pulmones al modificar la frecuencia respiratoria.")}</p><div className="lab-presets"><button type="button" onClick={()=>{setHeartRate(72);setBreathRate(16);setRunning(true)}}>Comparar: reposo</button><button type="button" onClick={()=>{setHeartRate(120);setBreathRate(28);setRunning(true)}}>Comparar: actividad física</button></div><div className="lab-flow" aria-live="polite"><strong>{labExperiment==="cardio"?"Recorrido de la sangre":"Recorrido del aire"}</strong><div>{(labExperiment==="cardio"?["Corazón","Pulmones","Corazón","Tejidos"]:["Nariz y boca","Tráquea","Bronquios","Alvéolos"]).map((step,index)=><span key={`${step}-${index}`}>{step}{index<3&&<b aria-hidden="true">→</b>}</span>)}</div><p>{labExperiment==="cardio"?"Esquema educativo simplificado de la circulación pulmonar y sistémica.":"Esquema educativo del recorrido del aire hasta la región donde ocurre el intercambio gaseoso."}</p></div><div className="slider-row"><label htmlFor="heart-rate">Frecuencia cardíaca <strong>{heartRate} lpm</strong></label><input id="heart-rate" type="range" min="45" max="150" value={heartRate} onChange={e=>setHeartRate(Number(e.target.value))}/></div><div className="slider-row"><label htmlFor="breath-rate">Frecuencia respiratoria <strong>{breathRate} rpm</strong></label><input id="breath-rate" type="range" min="8" max="35" value={breathRate} onChange={e=>setBreathRate(Number(e.target.value))}/></div><button className="primary-button" onClick={()=>setRunning(!running)}>{running?"Ⅱ Pausar animación":"▶ Reanudar animación"}</button></div></section>
   <LearningLibrary onExplore={(id) => { const item = structures.find((structure) => structure.id === id); if (item) { setSelected(item.id); setActiveSystem(item.system); setMode("anatomy"); window.setTimeout(() => document.getElementById("atlas-visualizador")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); } }} />
   <footer className="footer"><span>HumanLab 3D <span className="footer-dot">•</span> Proyecto educativo en desarrollo</span><span>Los modelos y simulaciones se ampliarán por fases.</span></footer>
  </section>
 </main>
}
