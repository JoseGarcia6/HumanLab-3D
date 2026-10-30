# HumanLab 3D

Plataforma educativa en desarrollo para explorar anatomía humana en 3D y experimentar con modelos fisiológicos simplificados.

## Funcionalidades actuales

- Interfaz principal adaptable a escritorio y móvil.
- Visor 3D interactivo con controles de órbita y zoom.
- Experiencia unificada en la página principal: explorador anatómico y laboratorio fisiológico en una sola interfaz.
- Filtro por sistemas anatómicos y búsqueda de estructuras por nombre o términos relacionados, integrados en la navegación principal.
- Panel de información para la estructura seleccionada.
- Controles educativos para frecuencia cardíaca y respiratoria, vinculados a animaciones ilustrativas.
- Mensajes claros sobre el alcance educativo y la ausencia de validez diagnóstica.
- Sin dependencia de un visor externo para abrir el explorador anatómico.

## Alcance y precisión

La geometría del cuerpo y de las estructuras que se muestra actualmente es **esquemática e ilustrativa**. No equivale a un atlas anatómico clínico ni a un modelo fisiológico validado. Las opciones de presentación masculina/femenina modifican la apariencia ilustrativa, no representan dos modelos anatómicos detallados independientes. Los modelos anatómicos de mayor fidelidad se incorporarán en una fase posterior, una vez verificados su origen, calidad técnica y condiciones de licencia.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Tecnologías

- Next.js, React y TypeScript
- Three.js y React Three Fiber
- GitHub para control de versiones
- Vercel para despliegue web

## Hoja de ruta

1. Ampliar la búsqueda y selección anatómica integrada en el laboratorio principal.
2. Incorporar modelos anatómicos detallados, capas y aislamiento real de estructuras.
3. Añadir simulaciones fisiológicas educativas con parámetros y límites documentados.
4. Ampliar el catálogo de estructuras y los recursos de aprendizaje.
5. Probar accesibilidad, rendimiento y experiencia móvil.

## Licencias y atribuciones

La interfaz y el código propio de HumanLab 3D se mantienen diferenciados de cualquier recurso de terceros. No se debe incorporar código, geometría, texturas ni documentación de otros proyectos sin revisar primero su licencia y conservar los avisos y atribuciones exigidos. Cuando se añadan recursos externos, se documentará su procedencia y licencia en esta sección o en un archivo de atribuciones específico.

## Plataforma educativa unificada

La página principal de HumanLab 3D reúne la anatomía 3D de hombre y mujer, las capas de sistemas, el laboratorio de corazón y pulmones, el diccionario, las evaluaciones y el seguimiento de aciertos, fallos y repaso, manteniendo la identidad visual original. Los resultados se guardan en el navegador.

- Las capas de huesos y músculos se activan cuando se necesitan; la vista de estudio no oculta los órganos.
- Se conservan las posiciones de origen de las mallas anatómicas, sin desplazamientos artificiales de ojos.
- Si no se puede descargar el modelo detallado, aparece automáticamente un esquema 3D interactivo con opción de reintentar; no se obliga al alumno a cambiar de modo.
- El modelo y la simulación son educativos, no una herramienta clínica. Las discrepancias de la geometría original requieren inspección visual independiente.
