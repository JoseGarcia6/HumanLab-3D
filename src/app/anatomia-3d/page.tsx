"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnatomyScene } from "@/components/AnatomyScene";

type System = { id: string; name: string; icon: string; color: string; description: string };
type Structure = { id: string; name: string; system: string; description: string; tags: string[] };

const systems: System[] = [
  { id: "all", name: "Cuerpo completo", icon: "✦", color: "#91aaff", description: "Vista general de los sistemas anatómicos disponibles." },
  { id: "circulatory", name: "Circulatorio", icon: "♥", color: "#fb7185", description: "El corazón impulsa la sangre para transportar oxígeno y nutrientes." },
  { id: "respiratory", name: "Respiratorio", icon: "◉", color: "#67e8f9", description: "Las vías respiratorias y los pulmones participan en el intercambio gaseoso." },
  { id: "digestive", name: "Digestivo", icon: "◌", color: "#fbbf24", description: "Procesa los alimentos y facilita la absorción de nutrientes." },
  { id: "skeletal", name: "Esquelético", icon: "⌁", color: "#e5e7eb", description: "Da soporte al cuerpo, protege órganos y participa en el movimiento." },
  { id: "muscular", name: "Muscular", icon: "〰", color: "#c084fc", description: "Los músculos generan movimiento y contribuyen a la estabilidad corporal." },
  { id: "nervous", name: "Nervioso", icon: "✳", color: "#f0c35b", description: "Coordina la percepción, las respuestas y numerosas funciones del organismo." },
  { id: "urinary", name: "Urinario", icon: "◇", color: "#c4b5fd", description: "Los riñones filtran la sangre y ayudan a regular el agua y las sales." },
  { id: "integumentary", name: "Tegumentario", icon: "▧", color: "#d7a98e", description: "La piel forma una barrera protectora y participa en la regulación térmica." },
];
const structures: Structure[] = [
  { id: "heart", name: "Corazón", system: "circulatory", description: "Órgano muscular que impulsa la sangre a través de la circulación.", tags: ["cardiovascular", "sangre"] },
  { id: "lungs", name: "Pulmones", system: "respiratory", description: "Intercambian oxígeno y dióxido de carbono entre el aire y la sangre.", tags: ["respiración", "oxígeno"] },
  { id: "stomach", name: "Estómago", system: "digestive", description: "Mezcla los alimentos con jugos gástricos y participa en la digestión.", tags: ["digestión", "alimentos"] },
  { id: "liver", name: "Hígado", system: "digestive", description: "Procesa nutrientes, produce bilis y realiza múltiples funciones metabólicas.", tags: ["bilis", "metabolismo"] },
  { id: "intestines", name: "Intestinos", system: "digestive", description: "Absorben nutrientes y agua a lo largo del tubo digestivo.", tags: ["colon", "nutrientes"] },
  { id: "skeleton", name: "Esqueleto", system: "skeletal", description: "Conjunto de estructuras que proporciona soporte y protección al cuerpo.", tags: ["huesos", "columna", "cráneo"] },
  { id: "brain", name: "Encéfalo", system: "nervous", description: "Procesa información y coordina numerosas funciones del organismo.", tags: ["cerebro", "nervios"] },
  { id: "kidneys", name: "Riñones", system: "urinary", description: "Filtran la sangre y ayudan a mantener el equilibrio de líquidos y sales.", tags: ["orina", "filtración"] },
  { id: "bladder", name: "Vejiga urinaria", system: "urinary", description: "Almacena temporalmente la orina antes de su eliminación.", tags: ["orina"] },
  { id: "skin", name: "Piel", system: "integumentary", description: "Actúa como barrera protectora y participa en la regulación de la temperatura.", tags: ["protección", "epidermis"] },
];

export default function Anatomia3DPage() {
  const [activeSystem, setActiveSystem] = useState("all");
  const [selected, setSelected] = useState("heart");
  const [query, setQuery] = useState("");
  const [sex, setSex] = useState<"m" | "f">("m");
  const [heartRate, setHeartRate] = useState(72);
  const [breathRate, setBreathRate] = useState(16);
  const [running, setRunning] = useState(true);
  const [cameraKey, setCameraKey] = useState(0);

  const selectedStructure = structures.find((item) => item.id === selected) ?? structures[0];
  const currentSystem = systems.find((item) => item.id === activeSystem) ?? systems[0];
  const filteredStructures = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return structures.filter((item) => {
      const matchesSystem = activeSystem === "all" || item.system === activeSystem;
      const matchesQuery = !normalized || [item.name, item.description, ...item.tags].some((value) => value.toLocaleLowerCase("es").includes(normalized));
      return matchesSystem && matchesQuery;
    });
  }, [activeSystem, query]);

  function chooseStructure(item: Structure) {
    setSelected(item.id);
    setActiveSystem(item.system);
  }

  return (
    <main className="anatomy-page">
      <header className="anatomy-header">
        <Link href="/" className="anatomy-brand" aria-label="Volver a HumanLab 3D">
          <span className="brand-mark">H<span>+</span></span>
          <span><strong>HumanLab <em>3D</em></strong><small>ANATOMÍA INTERACTIVA</small></span>
        </Link>
        <div className="anatomy-header-actions">
          <span className="anatomy-badge"><i /> VISOR EDUCATIVO</span>
          <Link className="back-link" href="/">← Inicio</Link>
        </div>
      </header>

      <section className="anatomy-intro">
        <div>
          <p className="eyebrow">LABORATORIO DIGITAL · EXPLORACIÓN 3D</p>
          <h1>Explorá la anatomía humana</h1>
          <p>Seleccioná un sistema, buscá una estructura y observá el modelo interactivo desde distintos ángulos.</p>
        </div>
        <div className="anatomy-intro-stat"><strong>08</strong><span>sistemas representados</span></div>
      </section>

      <div className="anatomy-layout">
        <aside className="anatomy-sidebar panel">
          <label className="anatomy-search-label" htmlFor="structure-search">BUSCAR ESTRUCTURA</label>
          <div className="anatomy-search"><span aria-hidden="true">⌕</span><input id="structure-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. corazón, pulmones…" /><kbd>/</kbd></div>
          <div className="anatomy-section-label">SISTEMAS DEL CUERPO</div>
          <div className="anatomy-system-list">
            {systems.map((system) => <button key={system.id} className={activeSystem === system.id ? "anatomy-system active" : "anatomy-system"} onClick={() => setActiveSystem(system.id)} aria-pressed={activeSystem === system.id}>
              <span className="anatomy-system-icon" style={{ color: system.color }}>{system.icon}</span><span>{system.name}</span>{activeSystem === system.id && <i />}
            </button>)}
          </div>
          <div className="anatomy-section-label anatomy-structure-label">ESTRUCTURAS {filteredStructures.length > 0 && <span>{filteredStructures.length}</span>}</div>
          <div className="anatomy-structure-list">
            {filteredStructures.map((item) => <button key={item.id} className={selected === item.id ? "anatomy-structure active" : "anatomy-structure"} onClick={() => chooseStructure(item)}><span className="structure-dot" /><span>{item.name}</span><span className="structure-arrow">↗</span></button>)}
            {filteredStructures.length === 0 && <p className="anatomy-empty">No encontramos estructuras con esa búsqueda. Probá con otro término.</p>}
          </div>
        </aside>

        <section className="anatomy-viewer panel">
          <div className="anatomy-viewer-top"><div><span className="viewer-live-dot" /> VISUALIZADOR <span className="viewer-muted">/ {currentSystem.name.toUpperCase()}</span></div><div className="anatomy-sex-toggle" aria-label="Presentación del modelo"><button className={sex === "m" ? "active" : ""} onClick={() => setSex("m")}>Masculina</button><button className={sex === "f" ? "active" : ""} onClick={() => setSex("f")}>Femenina</button></div></div>
          <div className="anatomy-canvas">
            <Canvas key={cameraKey} camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={[1, 1.5]}>
              <color attach="background" args={["#091321"]} />
              <ambientLight intensity={1.7} />
              <directionalLight position={[3, 5, 6]} intensity={2.4} />
              <pointLight position={[-3, 1, 3]} intensity={1.4} color="#4387ff" />
              <OrbitControls makeDefault enablePan={false} minDistance={2.8} maxDistance={10} target={[0, 0.5, 0]} />
              <AnatomyScene activeSystem={activeSystem} selected={selected} onSelect={setSelected} sex={sex} heartRate={heartRate} breathRate={breathRate} running={running} />
            </Canvas>
            <div className="anatomy-model-caption"><span>MODELO ILUSTRATIVO</span><strong>{selectedStructure.name}</strong><small>Arrastrá para girar · desplazá para acercar</small></div>
            <button className="anatomy-reset" onClick={() => { setActiveSystem("all"); setSelected("heart"); setCameraKey((value) => value + 1); }} aria-label="Restablecer vista 3D">↻ Restablecer vista</button>
          </div>
          <div className="anatomy-viewer-foot"><span>◉ Motor 3D interactivo</span><span>Modelo esquemático · no diagnóstico</span></div>
          <div className="anatomy-selected-info"><div className="selected-organ-icon" style={{ color: systems.find((system) => system.id === selectedStructure.system)?.color }}>✦</div><div><span>ESTRUCTURA SELECCIONADA</span><h2>{selectedStructure.name}</h2><p>{selectedStructure.description}</p></div></div>
        </section>

        <aside className="anatomy-tools">
          <section className="panel anatomy-detail-panel"><div className="anatomy-panel-title">GUÍA DE EXPLORACIÓN <span>01</span></div><h2>{currentSystem.name}</h2><p>{currentSystem.description}</p><div className="anatomy-detail-meta"><span>Sistema activo</span><strong>{currentSystem.name}</strong></div><div className="anatomy-detail-meta"><span>Estructura seleccionada</span><strong>{selectedStructure.name}</strong></div><button className="anatomy-outline-button" onClick={() => { setActiveSystem("all"); setQuery(""); }}>Mostrar todo el cuerpo <span>↗</span></button></section>
          <section className="panel anatomy-simulation"><div className="anatomy-panel-title">CONTROLES FISIOLÓGICOS <span className="beta">BETA</span></div><p className="anatomy-simulation-note">Ajustá las variables para observar la animación ilustrativa.</p><div className="anatomy-slider-row"><label htmlFor="anatomy-heart-rate">Frecuencia cardíaca <strong>{heartRate} lpm</strong></label><input id="anatomy-heart-rate" type="range" min="45" max="150" value={heartRate} onChange={(event) => setHeartRate(Number(event.target.value))} /></div><div className="anatomy-slider-row"><label htmlFor="anatomy-breath-rate">Frecuencia respiratoria <strong>{breathRate} rpm</strong></label><input id="anatomy-breath-rate" type="range" min="8" max="35" value={breathRate} onChange={(event) => setBreathRate(Number(event.target.value))} /></div><button className="anatomy-primary-button" onClick={() => setRunning((value) => !value)}>{running ? "Ⅱ Pausar animación" : "▶ Reanudar animación"}</button><small className="anatomy-disclaimer">Parámetros de demostración. No representan mediciones reales ni ofrecen orientación médica.</small></section>
        </aside>
      </div>
      <footer className="anatomy-footer"><span>HumanLab 3D · Proyecto educativo en desarrollo</span><span>La geometría actual es esquemática; las estructuras se ampliarán por fases.</span></footer>
    </main>
  );
}
