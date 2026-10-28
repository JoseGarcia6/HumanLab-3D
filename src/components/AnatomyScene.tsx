"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

type V = [number, number, number];
function Part({position, scale, color, selected=false, onClick, pulse=0}:{position:V;scale:V;color:string;selected?:boolean;onClick?:()=>void;pulse?:number}) {
 const ref=useRef<Mesh>(null);
 useFrame(({clock})=>{if(ref.current){const f=pulse?1+Math.sin(clock.elapsedTime*pulse*2)*0.035:1;ref.current.scale.set(scale[0]*f,scale[1]*f,scale[2]*f)}});
 return <mesh ref={ref} position={position} onClick={e=>{if(onClick){e.stopPropagation();onClick()}}}><sphereGeometry args={[1,24,20]}/><meshStandardMaterial color={color} roughness={0.5} emissive={selected?color:"#000"} emissiveIntensity={selected?0.15:0}/></mesh>;
}
function Limb({position,rotation=[0,0,0],radius=0.09,length=0.5,color="#aebed1",opacity=0.55}:{position:V;rotation?:V;radius?:number;length?:number;color?:string;opacity?:number}) {
 return <mesh position={position} rotation={rotation}><capsuleGeometry args={[radius,length,6,12]}/><meshStandardMaterial color={color} transparent={opacity<1} opacity={opacity}/></mesh>;
}
export function AnatomyScene({activeSystem,selected,onSelect,sex,heartRate,breathRate,running}:{activeSystem:string;selected:string;onSelect:(id:string)=>void;sex:"f"|"m";heartRate:number;breathRate:number;running:boolean}) {
 const lungs=useRef<Group>(null); const chest=useRef<Group>(null);
 useFrame(({clock})=>{const t=clock.elapsedTime*breathRate*Math.PI/30;if(lungs.current&&running){const s=1+Math.sin(t)*0.045;lungs.current.scale.set(s,s,1)}if(chest.current&&running)chest.current.scale.y=1+Math.sin(t)*0.012});
 const visible=(s:string)=>activeSystem==="all"||activeSystem===s;
 const skin=sex==="m"?"#b8c9dc":"#d2b8ce";
 return <group position={[0,-0.2,0]}>
  {/* Silueta corporal completa, ilustrativa y no clínica */}
  <Part position={[0,2.28,0]} scale={[0.23,0.28,0.20]} color={skin} selected={selected==="skeleton"} onClick={()=>onSelect("skeleton")}/>
  <Limb position={[0,1.93,0]} radius={0.085} length={0.20} color={skin} opacity={0.9}/>
  <Limb position={[0,1.35,0]} radius={0.32} length={0.72} color={skin} opacity={0.22}/>
  <Part position={[0,0.72,0]} scale={[0.27,0.24,0.20]} color={skin}/>
  {[-1,1].map(s=><group key={s}>
   <Part position={[s*0.36,1.67,0]} scale={[0.16,0.16,0.15]} color={skin}/>
   <Limb position={[s*0.48,1.39,0]} rotation={[0,0,s*-0.12]} radius={0.105} length={0.42} color={skin}/>
   <Part position={[s*0.54,1.12,0]} scale={[0.075,0.08,0.07]} color={skin}/>
   <Limb position={[s*0.59,0.88,0]} rotation={[0,0,s*-0.05]} radius={0.07} length={0.36} color={skin}/>
   <Part position={[s*0.60,0.66,0.015]} scale={[0.08,0.13,0.045]} color={skin}/>
   <Limb position={[s*0.16,0.15,0]} radius={0.135} length={0.48} color={skin} opacity={0.7}/>
   <Part position={[s*0.16,-0.30,0]} scale={[0.10,0.11,0.10]} color={skin}/>
   <Limb position={[s*0.16,-0.73,0]} radius={0.08} length={0.60} color={skin} opacity={0.72}/>
   <Part position={[s*0.16,-1.12,0.08]} scale={[0.10,0.08,0.20]} color={skin}/>
  </group>)}
  {visible("skeletal")&&<group>
   <Part position={[0,2.28,0.05]} scale={[0.19,0.23,0.17]} color="#e6ebf1" selected={selected==="skeleton"||selected==="skull"} onClick={()=>onSelect("skull")}/>
   <Limb position={[0,1.39,0.04]} radius={0.035} length={0.72} color={selected==="spine"?"#9ab8ff":"#e6ebf1"} opacity={1}/>
   {Array.from({length:7},(_,i)=><mesh key={i} position={[0,1.67-i*0.105,0.07]} scale={[0.17-i*0.009,0.025,0.045]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color="#e6ebf1"/></mesh>)}
   {[-1,1].map(s=><group key={s}>
    <Limb position={[s*0.27,1.65,0.02]} rotation={[0,0,s*0.85]} radius={0.035} length={0.50} color="#e6ebf1" opacity={1}/>
    <Limb position={[s*0.31,1.34,0.02]} rotation={[0,0,s*0.95]} radius={0.03} length={0.42} color="#e6ebf1" opacity={1}/>
    <Limb position={[s*0.34,1.04,0.02]} rotation={[0,0,s*0.9]} radius={0.025} length={0.38} color="#e6ebf1" opacity={1}/>
    <Limb position={[s*0.16,0.15,0.02]} radius={0.055} length={0.48} color="#e6ebf1" opacity={1}/>
    <Limb position={[s*0.16,-0.73,0.02]} radius={0.04} length={0.58} color="#e6ebf1" opacity={1}/>
   </group>)}
   <mesh position={[0,0.72,0]} rotation={[Math.PI/2,0,0]} onClick={e=>{e.stopPropagation();onSelect("ribs")}}><torusGeometry args={[0.23,0.03,8,20]}/><meshStandardMaterial color={selected==="ribs"?"#9ab8ff":"#e6ebf1"}/></mesh>
  </group>}
  {visible("muscular")&&<group>{[-1,1].map(s=><group key={s}>
   <Part position={[s*0.19,1.58,0.13]} scale={[0.16,0.19,0.10]} color={selected==="pectoral"?"#f0a0b0":"#bb6375"} selected={selected==="pectoral"} onClick={()=>onSelect("pectoral")}/>
   <Part position={[s*0.46,1.40,0.04]} scale={[0.10,0.23,0.09]} color={selected==="biceps"?"#f0a0b0":"#bb6375"} selected={selected==="biceps"} onClick={()=>onSelect("biceps")}/>
   <Part position={[s*0.59,0.88,0.04]} scale={[0.07,0.18,0.06]} color="#bb6375"/>
   <Part position={[s*0.16,0.14,0.05]} scale={[0.11,0.27,0.08]} color={selected==="quadriceps"?"#f0a0b0":"#bb6375"} selected={selected==="quadriceps"} onClick={()=>onSelect("quadriceps")}/>
   <Part position={[s*0.16,-0.73,0.05]} scale={[0.07,0.25,0.06]} color="#bb6375"/>
  </group>)}</group>}
  {visible("circulatory")&&<group>
   <Part position={[0.04,1.40,0.25]} scale={[0.12,0.15,0.09]} color="#e65362" selected={selected==="heart"} onClick={()=>onSelect("heart")} pulse={running?heartRate/18:0}/>
   <Limb position={[0,1.62,0.22]} radius={0.022} length={0.26} color="#e65362" opacity={1}/>
   <Limb position={[0,1.15,0.23]} rotation={[0,0,Math.PI/2]} radius={0.016} length={0.30} color="#e65362" opacity={1}/>
  </group>}
  {visible("respiratory")&&<group ref={lungs}>
   <Part position={[-0.16,1.49,0.20]} scale={[0.13,0.25,0.09]} color="#58bfd0" selected={selected==="lungs"} onClick={()=>onSelect("lungs")}/>
   <Part position={[0.16,1.49,0.20]} scale={[0.13,0.25,0.09]} color="#58bfd0" selected={selected==="lungs"} onClick={()=>onSelect("lungs")}/>
   <Limb position={[0,1.72,0.20]} radius={0.022} length={0.30} color="#91d8df" opacity={1}/>
   <Limb position={[-0.07,1.57,0.20]} rotation={[0,0,-0.4]} radius={0.012} length={0.20} color="#91d8df" opacity={1}/>
   <Limb position={[0.07,1.57,0.20]} rotation={[0,0,0.4]} radius={0.012} length={0.20} color="#91d8df" opacity={1}/>
  </group>}
  {visible("digestive")&&<group>
   <Part position={[-0.13,1.15,0.24]} scale={[0.19,0.12,0.10]} color="#a95c51" selected={selected==="liver"} onClick={()=>onSelect("liver")}/>
   <Part position={[0.11,1.08,0.25]} scale={[0.105,0.15,0.09]} color="#dba45b" selected={selected==="stomach"} onClick={()=>onSelect("stomach")}/>
   {/* Intestino delgado y colon: representación esquemática visible en la parte baja del abdomen */}
   <mesh position={[0,0.79,0.25]} rotation={[0,0,Math.PI/2]} onClick={e=>{e.stopPropagation();onSelect("intestines")}}>
    <torusGeometry args={[0.135,0.027,10,32]}/>
    <meshStandardMaterial color="#d99b6b" roughness={0.55} emissive={selected==="intestines"?"#d99b6b":"#000"} emissiveIntensity={selected==="intestines"?0.18:0}/>
   </mesh>
   {[-1,1].map(s=><group key={s}>
    <mesh position={[s*0.075,0.80,0.27]} rotation={[0,0,s*0.45]} onClick={e=>{e.stopPropagation();onSelect("intestines")}}><torusGeometry args={[0.075,0.018,8,24]}/><meshStandardMaterial color="#e8b18a" emissive={selected==="intestines"?"#d99b6b":"#000"} emissiveIntensity={selected==="intestines"?0.18:0}/></mesh>
    <mesh position={[s*0.055,0.75,0.28]} rotation={[0,0,-s*0.65]} onClick={e=>{e.stopPropagation();onSelect("intestines")}}><torusGeometry args={[0.065,0.017,8,24]}/><meshStandardMaterial color="#e8b18a" emissive={selected==="intestines"?"#d99b6b":"#000"} emissiveIntensity={selected==="intestines"?0.18:0}/></mesh>
   </group>)}
  </group>}
  {visible("urinary")&&<group>
   {[-1,1].map(s=><group key={s}>
    <Part position={[s*0.19,0.94,0.23]} scale={[0.075,0.105,0.065]} color="#9a7bd1" selected={selected==="kidneys"} onClick={()=>onSelect("kidneys")}/>
    <Limb position={[s*0.145,0.74,0.24]} radius={0.012} length={0.24} color="#d4b5ff" opacity={1}/>
   </group>)}
   <Part position={[0,0.54,0.24]} scale={[0.09,0.085,0.07]} color="#9a7bd1" selected={selected==="bladder"} onClick={()=>onSelect("bladder")}/>
  </group>}
  {visible("nervous")&&<group>
   <Part position={[0,2.28,0.22]} scale={[0.15,0.17,0.10]} color="#f0c35b" selected={selected==="brain"} onClick={()=>onSelect("brain")}/>
   {[-1,1].map(s=><Part key={s} position={[s*0.065,2.30,0.285]} scale={[0.075,0.09,0.055]} color="#f6d780" selected={selected==="brain"} onClick={()=>onSelect("brain")}/>)}
   <Limb position={[0,1.48,0.18]} radius={0.024} length={1.1} color={selected==="spinalcord"?"#fff0a6":"#f0c35b"} opacity={1}/>
   {[-1,1].map(s=><Limb key={s} position={[s*0.22,1.30,0.18]} rotation={[0,0,s*0.85]} radius={0.014} length={0.42} color="#f0c35b" opacity={1}/>)}
  </group>}
  {visible("integumentary")&&<Limb position={[0,0.5,-0.13]} radius={0.34} length={1.55} color="#d7a98e" opacity={0.15}/>}
 </group>;
}
