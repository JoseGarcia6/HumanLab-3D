"use client";
/* Shared 3D viewer: adapted Human Atlas engine (MIT). Data: male BodyParts3D, female Female Atlas (HuBMAP/BodyParts3D CC BY 4.0). */
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from '@/lib/atlas/explosion-layout';
import {decodeModelResponse} from '@/lib/atlas/model-download';
import {PointerTap} from '@/lib/atlas/pointer-tap';
import {SYSTEMS,type Atlas,type SceneState,type Part} from '@/lib/atlas/anatomy';
import {anatomicalNameEs} from '@/lib/atlas/names-es';
// Recognizable structures available in BodyParts3D 4.0. A named subset keeps mobile labels readable.
const KEY_LABELS: ReadonlyArray<readonly [string,string]> = [
 ['Frontal bone','Hueso frontal'],['Mandible','Mandíbula'],['Cerebellum','Cerebelo'],
 ['Trachea','Tráquea'],['Wall of ventricle','Corazón · ventrículo'],
 ['Stomach','Estómago'],['Pancreas','Páncreas'],['Caudate lobe of liver','Lóbulo caudado del hígado'],
 ['Right kidney','Riñón derecho'],['Left kidney','Riñón izquierdo'],['Urinary bladder','Vejiga'],
 ['Right femur','Fémur derecho'],['Left humerus','Húmero izquierdo'],
 ['Body of sternum','Esternón'],['Right rectus femoris','Músculo recto femoral'],
 ['Diaphragm','Diafragma'],['Spleen','Bazo'],['Right main bronchus','Bronquio derecho'],
 ['Left main bronchus','Bronquio izquierdo'],['Midbrain','Mesencéfalo'],
];
const FEMALE_KEY_LABELS:ReadonlyArray<readonly [string,string]>=[
 ['body of uterus','Útero'],['Left ovary','Ovario izquierdo'],['Right ovary','Ovario derecho'],
 ['uterine cervix','Cuello uterino'],['vagina','Vagina'],
 ['mammary lobe','Glándula mamaria'],['umbilical cord','Cordón umbilical'],
 ['placenta vessels','Vasos placentarios'],
 ['heart left ventricle','Corazón'],['Frontal bone','Hueso frontal'],
 ['Right femur','Fémur derecho'],['Left femur','Fémur izquierdo'],
 ['trachea','Tráquea'],['Stomach','Estómago'],['Right rectus femoris','Músculo recto femoral'],
 ['Spleen','Bazo'],['Diaphragm','Diafragma'],
];
const TRANSLATED_NAMES=new Map([...KEY_LABELS,...FEMALE_KEY_LABELS]);
const nameInSpanish=(name:string)=>TRANSLATED_NAMES.get(name)??anatomicalNameEs(name);
/**
 * Female Atlas combines two original eye datasets (HuBMAP and BodyParts3D).
 * Their coordinate centers differ by about 2 cm, so both pairs look like
 * four eyes if shown simultaneously. Hide only the secondary BP3D ocular
 * layers in the clean presentation. Do not remove meshes or atlas metadata:
 * selecting an individual structure reveals it for teaching.
 */
function redundantFemaleOcularPart(part:Part):boolean {
 if(!part.id.startsWith('BP3D_') || part.system!=='sensory')return false;
 // The BP3D eye set is 2.2 cm below the HuBMAP eye set. Keep the HuBMAP set
 // and omit the superimposed BP3D eye parts in the default cleaned view.
 const centerY=(part.bounds[0][1]+part.bounds[1][1])*.5;
 const centerX=(part.bounds[0][0]+part.bounds[1][0])*.5;
 return centerY>1.515 && centerY<1.59 && Math.abs(centerX)<.08;
}
function isolatedFemaleKneeOverlay(part:Part):boolean {
 if(!part.id.startsWith('VH_F_'))return false;
 const midY=(part.bounds[0][1]+part.bounds[1][1])*.5;
 // Fine knee ligament overlays from an independent atlas float beside the
 // BodyParts3D legs and are better studied in isolation rather than all at once.
 return midY>.37 && midY<.53 &&
    /(?:knee|meniscus|quadriceps_femoris|patellar_ligament|cruciate)/i.test(part.id);
}
function cleanFemaleArtifact(part:Part):boolean {
 return redundantFemaleOcularPart(part)||isolatedFemaleKneeOverlay(part);
}
function eyeAlignment(part:Part,center:T.Vector3,clean:boolean,sex:string|undefined):T.Vector3 {
 if(!clean || sex!=='female' || part.system!=='sensory'||!part.id.startsWith('VH_F_'))return new T.Vector3();
 if(center.y<1.535||center.y>1.605||Math.abs(center.x)>.075||center.z<-.05||center.z>.07)return new T.Vector3();
 // Female Reference Atlas ocular centers y≈1.560, z≈0.018; the original
 // BodyParts3D bony orbits used here center around y≈1.537, z≈-0.005.
 return new T.Vector3(center.x<0?.011:-.004,-.023,-.023);
}
interface Props {atlas:Atlas;state:SceneState;showNames:boolean;cleanView:boolean;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void}
export default function AnatomyScene({atlas,state,showNames,cleanView,onSelect,onProgress,onError}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),namesRef=useRef(showNames),cleanRef=useRef(cleanView);
 latest.current=state;select.current=onSelect;namesRef.current=showNames;cleanRef.current=cleanView;
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('Tu navegador no pudo iniciar el visor 3D. Revisá que WebGL esté habilitado.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Anatomía humana interactiva en 3D. Arrastrá para girar, pellizcá para acercar y tocá una estructura para ver sus datos.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;controls.minPolarAngle=Math.PI*.10;controls.maxPolarAngle=Math.PI*.70;controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  // No platform or ground disk: these previously appeared as a large oval over the feet on mobile.
  const modelBounds=new T.Box3();
  for(const part of atlas.parts){
   if(part.system==='integumentary')continue;
   modelBounds.expandByPoint(new T.Vector3().fromArray(part.bounds[0]));
   modelBounds.expandByPoint(new T.Vector3().fromArray(part.bounds[1]));
  }
  const modelCenter=modelBounds.getCenter(new T.Vector3()),modelSize=modelBounds.getSize(new T.Vector3());
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x64748b,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const hover=document.createElement('div');hover.className='hl-atlas-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  const labelLayer=document.createElement('div');labelLayer.className='hl-atlas-label-layer';labelLayer.setAttribute('aria-label','Nombres de estructuras anatómicas');el.appendChild(labelLayer);
  const partIndexByName=new Map<string,number>();
  atlas.parts.forEach((part,index)=>{if(!partIndexByName.has(part.name))partIndexByName.set(part.name,index);});
  const featured=(atlas.sex==='female'?FEMALE_KEY_LABELS:KEY_LABELS).flatMap(([name,title])=>{const index=partIndexByName.get(name);return index===undefined?[]:[{index,title}];});
  const labelCache=new Map<number,HTMLButtonElement>();
  const labelPoint=new T.Vector3();
  let lastNamesShown=namesRef.current,lastClean=cleanRef.current;
  const syncLabels=(s:SceneState)=>{
   if(!ready||!namesRef.current){labelLayer.replaceChildren();return;}
   const mobile=el.clientWidth<650,budget=mobile?7:12;
   const chosen=s.selected.length?atlas.parts.findIndex(p=>p.id===s.selected[0]):-1;
   const candidates=[...(chosen>=0?[{index:chosen,title:nameInSpanish(atlas.parts[chosen].name),selected:true}]:[]),
    ...featured.map(item=>({...item,selected:false}))];
   const occupied:{x:number;y:number}[]=[],active:HTMLButtonElement[]=[],used=new Set<number>();
   for(const item of candidates){
    if(active.length>=budget)break;
    const i=item.index,part=atlas.parts[i];
    if(used.has(i)||data[i*4+3]<.5||(!s.selected.includes(part.id)&&!s.visible.includes(part.system)))continue;
    used.add(i);
    labelPoint.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);
    if(labelPoint.z < -1||labelPoint.z > 1)continue;
    const px=(labelPoint.x+1)*el.clientWidth/2,py=(1-labelPoint.y)*el.clientHeight/2;
    if(px<20||px>el.clientWidth-20||py<30||py>el.clientHeight-42)continue;
    const side=px<el.clientWidth/2?1:-1;
    const x=T.MathUtils.clamp(px+side*(mobile?55:76),mobile?58:85,el.clientWidth-(mobile?58:85));
    const y=T.MathUtils.clamp(py-12,30,el.clientHeight-55);
    if(occupied.some(p=>Math.abs(p.x-x)<(mobile?104:140)&&Math.abs(p.y-y)<35))continue;
    occupied.push({x,y});
    let label=labelCache.get(i);
    if(!label){
     label=document.createElement('button');label.type='button';label.className='hl-atlas-part-label';
     label.addEventListener('click',e=>{e.stopPropagation();select.current(part.id);});
     labelCache.set(i,label);
    }
    label.classList.toggle('selected',item.selected);
    label.textContent=item.title;
    label.setAttribute('aria-label','Seleccionar '+item.title);
    label.style.left=x+'px';label.style.top=y+'px';
    active.push(label);
   }
   labelLayer.replaceChildren(...active);
  };
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const materialFor=(system:string)=>{
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary',opacity:system==='integumentary'?.1:1,depthWrite:system!=='integumentary'});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  let loaded=0;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(compressed?chunk.gzip!:chunk.url,{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('No se pudo construir la geometría anatómica.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'No se pudo cargar la anatomía.');}})();
  const fit=(view:string,extent=0)=>{
   const aspect=Math.max(.35,camera.aspect),mobile=el.clientWidth<768;
   const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));
   // Fit the actual 1.73 m anatomical mesh, not the old oversized circular platform.
   const heightDistance=modelSize.y/(2*tan*(mobile?.77:.80));
   const horizontalSpan=view==='side'?Math.max(modelSize.z,.26):Math.hypot(modelSize.x,modelSize.z);
   const widthDistance=horizontalSpan/(2*tan*aspect*(mobile?.83:.80));
   const normalDistance=Math.max(heightDistance,widthDistance,1.6)*(atlas.sex==='female'?1.23:1);
   const packingDistance=Math.max(packingHeight,packingWidth/aspect)/(2*tan)*1.20;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.3,packingDistance),extent);
   if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.copy(modelCenter);
   if(extent>.3&&el.clientWidth>767)controls.target.x=-packingWidth*.09;
   camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const down=(e:PointerEvent)=>{hover.hidden=true;tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=nameInSpanish(atlas.parts[index].name);hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
  const up=(e:PointerEvent)=>{
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   // Changing the clean view must refresh both GPU visibility and picking, not just UI.
   const cleanChanged=lastClean!==cleanRef.current;
   if(cleanChanged)lastClean=cleanRef.current;
   const changed=cleanChanged||lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate;
   const isDisplayed=(p:Part,selection:Set<string>,visible:Set<string>):boolean=>{
    const chosen=selection.has(p.id);
    return (s.isolate?chosen:chosen||visible.has(p.system))&&
      (chosen||!cleanRef.current||atlas.sex!=='female'||!cleanFemaleArtifact(p));
   };
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    const visibleParts=atlas.parts.filter(p=>isDisplayed(p,selection,visible));
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);const alignment=eyeAlignment(p,c,cleanRef.current,atlas.sex);
     dx+=alignment.x;dy+=alignment.y;dz+=alignment.z;
     data.set([dx,dy,dz,isDisplayed(p,selection,visible)?1:0],i*4);selectedData[i*4]=selected?255:0;
     markerPositions.set(data[i*4+3]>.5?[c.x+dx,c.y+dy,c.z+dz]:[10000,10000,10000],i*3);const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(lastNamesShown!==namesRef.current){lastNamesShown=namesRef.current;dirty=true;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.hl-atlas-inspector')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   controls.enableRotate=amount<.8;controls.mouseButtons.LEFT=amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);syncLabels(s);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('El teléfono interrumpió la sesión 3D. Volvé a cargar el visor.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();labelLayer.remove();labelCache.clear();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="hl-atlas-scene" ref={host}/>;
}
