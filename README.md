# HumanLab 3D

Plataforma educativa en desarrollo para explorar anatomía humana en 3D y experimentar con modelos fisiológicos simplificados.

## Funcionalidades actuales

- Interfaz principal adaptable a escritorio y móvil.
- Visor 3D interactivo con controles de órbita y zoom.
- Explorador dedicado en `/anatomia-3d`, con identidad visual propia de HumanLab 3D.
- Filtro por sistemas anatómicos y búsqueda de estructuras por nombre o términos relacionados.
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

1. Mejorar la navegación, búsqueda y selección de estructuras.
2. Incorporar modelos anatómicos detallados, capas y aislamiento real de estructuras.
3. Añadir simulaciones fisiológicas educativas con parámetros y límites documentados.
4. Ampliar el catálogo de estructuras y los recursos de aprendizaje.
5. Probar accesibilidad, rendimiento y experiencia móvil.

## Licencias y atribuciones

La interfaz y el código propio de HumanLab 3D se mantienen diferenciados de cualquier recurso de terceros. No se debe incorporar código, geometría, texturas ni documentación de otros proyectos sin revisar primero su licencia y conservar los avisos y atribuciones exigidos. Cuando se añadan recursos externos, se documentará su procedencia y licencia en esta sección o en un archivo de atribuciones específico.
