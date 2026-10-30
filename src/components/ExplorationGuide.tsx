"use client";

import { useState } from "react";

const steps = [
  { title: "1. Elegí Hombre o Mujer", description: "Los dos cuerpos detallados están integrados en Anatomía 3D. Podés cambiar de modelo sin salir de HumanLab." },
  { title: "2. Explorá sistemas y órganos", description: "Seleccioná un sistema, activá u ocultá capas, buscá estructuras por su nombre en español y tocá el modelo para ver información." },
  { title: "3. Girá y observá", description: "Arrastrá para girar; en el teléfono, pellizcá para acercar. Usá Vista limpia si las capas del atlas femenino se superponen." },
  { title: "4. Simulá corazón y pulmones", description: "En Laboratorio fisiológico modificá las frecuencias cardíaca y respiratoria, compará reposo y actividad, pausá o reanudá las animaciones." },
  { title: "5. Estudiá y evaluá tu progreso", description: "Consultá el diccionario, respondé cuestionarios y repasá tus errores. La puntuación se guarda localmente en este navegador." },
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
