"use client";

import { useState } from "react";

const steps = [
  { title: "1. Elegí un sistema", description: "Usá la lista de sistemas para centrar la exploración en una parte del cuerpo." },
  { title: "2. Buscá una estructura", description: "Escribí un nombre, como corazón o pulmones, en el buscador. También podés elegirlo de la lista." },
  { title: "3. Explorá el modelo", description: "Arrastrá para girar y usá la rueda del ratón o el gesto de pellizcar para acercar y alejar." },
  { title: "4. Leé y experimentá", description: "Consultá la ficha de la estructura y probá las variables del laboratorio. Sus valores son ilustrativos, no mediciones médicas." },
];

export function ExplorationGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="exploration-guide">
      <button
        type="button"
        className="guide-trigger"
        aria-expanded={open}
        aria-controls="exploration-guide-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">?</span>
        Cómo explorar
      </button>
      {open && (
        <section className="guide-popover" id="exploration-guide-panel" aria-label="Guía rápida de exploración">
          <div className="guide-popover-heading">
            <div>
              <span className="eyebrow">GUÍA RÁPIDA</span>
              <h2>Empezá a explorar</h2>
            </div>
            <button type="button" className="guide-close" onClick={() => setOpen(false)} aria-label="Cerrar guía">×</button>
          </div>
          <ol>
            {steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <p className="guide-note">HumanLab 3D es una herramienta educativa; no sirve para diagnosticar enfermedades.</p>
        </section>
      )}
    </div>
  );
}
