"use client";

import { useState } from "react";

export default function AtlasPreviewPage() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#07111f", color: "#e7eef9", padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <header style={{ maxWidth: 1400, margin: "0 auto 14px", display: "flex", gap: 16, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 6px", color: "#7dd3fc", fontSize: 12, letterSpacing: 2 }}>HUMANLAB 3D · PRUEBA DE INTEGRACIÓN</p>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)" }}>Atlas anatómico detallado</h1>
          <p style={{ margin: "8px 0 0", color: "#a9b8cc", maxWidth: 760, lineHeight: 1.5 }}>
            Vista de evaluación del Human Atlas: permite girar, acercar, buscar y seleccionar estructuras anatómicas. Por ahora se ejecuta como una demostración externa; todavía no forma parte del motor 3D local de HumanLab.
          </p>
        </div>
        <a href="/" style={{ color: "#07111f", background: "#93c5fd", padding: "10px 14px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>← Volver a HumanLab</a>
      </header>

      <section style={{ maxWidth: 1400, margin: "0 auto", border: "1px solid #26364b", borderRadius: 16, overflow: "hidden", background: "#101b2b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "10px 14px", color: "#a9b8cc", fontSize: 13, flexWrap: "wrap" }}>
          <span>{loaded ? "Atlas cargado en el marco de prueba" : "Conectando con la demostración del atlas…"}</span>
          <a href="https://human-atlas-seven.vercel.app" target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>Abrir atlas en otra pestaña ↗</a>
        </div>
        {failed ? (
          <div style={{ padding: 28, lineHeight: 1.6 }}>
            <h2>El atlas no permitió mostrarse dentro de HumanLab.</h2>
            <p>Esto puede ocurrir si el sitio externo bloquea la visualización en marcos. El enlace de arriba permite probarlo directamente.</p>
            <a href="https://human-atlas-seven.vercel.app" target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>Abrir Human Atlas ↗</a>
          </div>
        ) : (
          <iframe
            title="Demostración interactiva de Human Atlas"
            src="https://human-atlas-seven.vercel.app"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{ display: "block", width: "100%", height: "min(78vh, 900px)", minHeight: 560, border: 0, background: "#f2f3f3" }}
            allow="fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </section>

      <footer style={{ maxWidth: 1400, margin: "12px auto 0", color: "#9baec4", fontSize: 12, lineHeight: 1.6 }}>
        Referencia: Human Atlas / BodyParts3D 4.0. Los datos anatómicos se publican bajo CC BY 4.0 y requieren atribución. Esta prueba externa no es una integración nativa ni una herramienta de diagnóstico.
      </footer>
    </main>
  );
}
