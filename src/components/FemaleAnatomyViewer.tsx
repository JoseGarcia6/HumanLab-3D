"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { AnatomyScene } from "@/components/AnatomyScene";
import { FEMALE_STRUCTURES, type FemaleSystemId } from "@/lib/atlas/female-schematic";

type Props = {
  visible: FemaleSystemId[];
  selected: string;
  showNames: boolean;
  rotate: boolean;
  onSelect: (id: string) => void;
};

const FEATURED=new Set(["brain","lungs","heart","liver","stomach","kidneys","uterus","ovaries"]);

export default function FemaleAnatomyViewer({ visible,selected,showNames,rotate,onSelect }:Props) {
  const layers=useMemo<Record<string,boolean>>(()=>{
    const selectedSystems=new Set(visible);
    return Object.fromEntries(
      ["skeletal","muscular","circulatory","respiratory","digestive","nervous","urinary","reproductive","integumentary"]
        .map(id=>[id,selectedSystems.has(id as FemaleSystemId)])
    );
  },[visible]);
  const labels=FEMALE_STRUCTURES.filter(item=>
    (FEATURED.has(item.id)||item.id===selected)&&
    visible.includes(item.system)
  );
  return (
    <div className="hl-atlas-female-scene">
      <Canvas
        camera={{position:[0.18,0.55,5.75],fov:39,near:0.05,far:100}}
        dpr={[1,1.6]}
        gl={{antialias:true,powerPreference:"high-performance"}}
      >
        <color attach="background" args={["#eef2f4"]}/>
        <ambientLight intensity={1.8}/>
        <directionalLight position={[3,5,5]} intensity={2.0}/>
        <pointLight position={[-3,2,2]} intensity={0.8} color="#a0bbf5"/>
        <AnatomyScene
          activeSystem="all" selected={selected} sex="f"
          onSelect={onSelect} heartRate={72} breathRate={16}
          running={false} visibleLayers={layers}
        />
        {showNames && <group position={[0,-0.2,0]}>
          {labels.map(item=><Html key={item.id} position={item.position} center>
            <button type="button"
              className={`hl-atlas-female-label ${selected===item.id?"selected":""}`}
              onClick={event=>{event.stopPropagation();onSelect(item.id);}}
              aria-label={`Seleccionar ${item.name}`}>
              {item.name}
            </button>
          </Html>)}
        </group>}
        <OrbitControls
          makeDefault
          target={[0,0.55,0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={2.3}
          maxDistance={9}
          maxPolarAngle={Math.PI*0.92}
          autoRotate={rotate}
          autoRotateSpeed={0.75}
        />
      </Canvas>
    </div>
  );
}
