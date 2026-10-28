"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

function Organ({position,scale,color,onClick,selected, pulse=0.0}:{position:[number,number,number];scale:[number,number,number];color:string;onClick:()=>void;selected:boolean;pulse?:number}){
 const ref=useRef<Mesh>(null);
 useFrame(({clock})=>{if(ref.current){const wave=1+Math.sin(clock.elapsedTime*(pulse||1)*2)*0.025;ref.current.scale.set(scale[0]*wave,scale[1]*wave,scale[2]*wave)}});
 return <mesh ref={ref} position={position} scale={scale} onClick={e=>{e.stopPropagation();onClick()}}><sphereGeometry args={[1,28,24]}/><meshStandardMaterial color={color} roughness={0.42} metalness={0.04} emissive={selected?color:"#000000"} emissiveIntensity={selected?0.18:0}/></mesh>
}
export function AnatomyScene({activeSystem,selected,onSelect,sex,heartRate,breathRate,running}:{activeSystem:string;selected:string;onSelect:(id:string)=>void;sex:"f"|"m";heartRate:number;breathRate:number;running:boolean}){
 const root=useRef<Group>(null); const lungs=useRef<Group>(null);
 useFrame(({clock})=>{if(root.current){root.current.rotation.y=Math.sin(clock.elapsedTime*0.18)*0.10}if(lungs.current&&running){const b=1+Math.sin(clock.elapsedTime*breathRate/9)*0.045;lungs.current.scale.set(1,b,1)}});
 const visibility=(system:string)=>activeSystem==="all"||activeSystem===system;
 const bones=useMemo(()=>Array.from({length:9},(_,i)=>({y:1.35-i*.34})),[]);
 return <group ref={root} position={[0,-0.25,0]}>
  {/* Stylized educational reference body; replaceable with licensed anatomical meshes. */}
  <Organ position={[0,2.0,0]} scale={[0.39,0.43,0.30]} color="#c9d5e5" selected={selected==="skeleton"} onClick={()=>onSelect("skeleton")}/>
  <mesh position={[0,1.48,0]}><capsuleGeometry args={[0.43,1.05,8,18]}/><meshStandardMaterial color={sex==="m"?"#526b89":"#6c719a"} transparent opacity={0.18} roughness={0.65}/></mesh>
  {visibility("skeletal")&&<group>{bones.map((b,i)=><mesh key={i} position={[0,b.y,0.04]}><capsuleGeometry args={[i<3?0.18:0.10,0.15,4,8]}/><meshStandardMaterial color="#e3e8ef" roughness={0.72}/></mesh>)}{[-1,1].map(x=><mesh key={x} position={[x*.25,1.35,0]} rotation={[0,0,x*.18]}><capsuleGeometry args={[0.07,0.76,4,8]}/><meshStandardMaterial color="#e3e8ef"/></mesh>)}</group>}
  {visibility("muscular")&&<group>{[-1,1].map(x=><group key={x}><Organ position={[x*.53,1.25,0]} scale={[0.17,0.48,0.18]} color="#bd6d79" selected={false} onClick={()=>onSelect("heart")}/><Organ position={[x*.20,.35,0]} scale={[0.15,.62,.15]} color="#bd6d79" selected={false} onClick={()=>onSelect("heart")}/></group>)}</group>}
  {visibility("circulatory")&&<><Organ position={[0,1.02,.31]} scale={[.20,.24,.16]} color="#e85e68" selected={selected==="heart"} onClick={()=>onSelect("heart")} pulse={running?heartRate/30:0}/><mesh position={[0,1.45,.25]}><cylinderGeometry args={[.035,.035,.58,10]}/><meshStandardMaterial color="#e85e68"/></mesh></>}
  {visibility("respiratory")&&<group ref={lungs}><Organ position={[-.24,1.25,.19]} scale={[.20,.39,.15]} color="#59bfd0" selected={selected==="lungs"} onClick={()=>onSelect("lungs")} pulse={running?breathRate/6:0}/><Organ position={[.24,1.25,.19]} scale={[.20,.39,.15]} color="#59bfd0" selected={selected==="lungs"} onClick={()=>onSelect("lungs")} pulse={running?breathRate/6:0}/><mesh position={[0,1.66,.2]}><cylinderGeometry args={[.045,.045,.38,12]}/><meshStandardMaterial color="#91d8df"/></mesh></group>}
  {visibility("digestive")&&<><Organ position={[.03,.72,.23]} scale={[.22,.20,.13]} color="#dba45b" selected={selected==="stomach"} onClick={()=>onSelect("stomach")}/><Organ position={[-.22,.83,.18]} scale={[.22,.12,.10]} color="#a95c51" selected={selected==="liver"} onClick={()=>onSelect("liver")}/><Organ position={[0,.36,.20]} scale={[.23,.16,.11]} color="#d99b6b" selected={selected==="stomach"} onClick={()=>onSelect("stomach")}/></>}
  <group>{[-1,1].map(x=><mesh key={x} position={[x*.65,.76,0]} rotation={[0,0,x*.08]}><capsuleGeometry args={[.105,.78,6,12]}/><meshStandardMaterial color="#8fa4bf" transparent opacity={.72}/></mesh>)}{[-1,1].map(x=><mesh key={x} position={[x*.18,-.45,0]} rotation={[0,0,x*.05]}><capsuleGeometry args={[.13,.90,6,12]}/><meshStandardMaterial color="#8fa4bf" transparent opacity={.72}/></mesh>)}</group>
  <mesh position={[0,2.40,0]}><sphereGeometry args={[.11,20,16]}/><meshStandardMaterial color="#d4deeb" transparent opacity={.55}/></mesh>
 </group>
}
