"use client";

import Link from "next/link";

const atlasUrl = "https://human-atlas-seven.vercel.app";

export default function AdvancedAtlasPage() {
  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#0b1220", color: "#e8eef8", fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 18px", borderBottom: "1px solid #253247", flexWrap: "wrap" }}>
        <div>
          <Link href="/" style={{ color: "#a9c5ff", textDecoration: "none", fontSize: 13 }}>← Volver a HumanLab 3D</Link>
          <h1 style={{ margin: "6px 0 0", fontSize: 20 }}>Atlas anatómico avanzado <span style={{ color: "#8ba9ff", fontSize: 12 }}>BETA</span></h1>
          <p style={{ margin: "4px 0 0", color: "#9eacc0", fontSize: 12 }}>Prueba de integración de Human Atlas · visor externo de referencia</p>
        </div>
        <a href={atlasUrl} target="_blank" rel="noreferrer" style={{ background: "#7c9cff", color: "#07111f", fontWeight: 700, textDecoration: "none", borderRadius: 9, padding: "10px 14px", fontSize: 13 }}>Abrir atlas en otra pestaña ↗</a>
      </header>
      <section style={{ flex: 1, minHeight: "65vh", padding: 12 }}>
        <iframe
          title="Human Atlas — explorador anatómico 3D"
          src={atlasUrl}
          allow="fullscreen; webgl"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ display: "block", width: "100%", height: "100%", minHeight: "65vh", border: "1px solid #253247", borderRadius: 12, background: "#f2f3f3" }}
        />
      </section>
      <footer style={{ padding: "10px 18px 16px", color: "#9eacc0", fontSize: 11, lineHeight: 1.6 }}>
        Esta pantalla es una prueba de integración y carga el visor de referencia desde su publicación independiente; todavía no copia sus modelos dentro de HumanLab 3D. Código Human Atlas: licencia MIT. Datos anatómicos BodyParts3D 4.0: CC BY 4.0; consultar y conservar la atribución original en el proyecto antes de redistribuir modelos.
      </footer>
    </main>
  );
}
