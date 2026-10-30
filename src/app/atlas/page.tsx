"use client";

import { useEffect } from "react";

/** Compatibility link for older atlas bookmarks: HumanLab now has one app. */
export default function AtlasLegacyRedirect(){
  useEffect(()=>{
    const hash=window.location.hash||"#atlas-visualizador";
    window.location.replace("/"+hash);
  },[]);
  return (
    <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#080e18",color:"#edf3fb",padding:24}}>
      <p>Abriendo HumanLab 3D — Plataforma educativa…</p>
    </main>
  );
}
