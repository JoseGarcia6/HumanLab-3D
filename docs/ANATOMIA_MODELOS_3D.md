# Plan de modelos anatómicos 3D — HumanLab 3D

## Objetivo

Ampliar el visualizador existente sin eliminar el laboratorio fisiológico, los controles de frecuencia cardíaca/respiratoria ni la vista esquemática de respaldo. La anatomía seguirá siendo educativa y no diagnóstica.

## Estrategia acordada

1. **Assets listos para usar:** comenzar con modelos CC0 independientes y/o de torso cuando los archivos descargables estén disponibles y verificados.
2. **Atlas anatómico de referencia:** evaluar modelos basados en BodyParts3D/Z-Anatomy por estructura y sistema. No copiar un proyecto entero ni sus modelos sin revisar las licencias de cada asset.
3. **Modelos propios:** preparar una ruta para adaptar o crear modelos en Blender cuando sea posible.

## Fuentes evaluadas

- **Innerscene — torso con órganos extraíbles:** https://www.innerscene.com/tools/library/3d-parts/torso-with-removable-organs-1fe1b70a  
  La página consultada declara CC0. Antes de incorporar el archivo, verificar el enlace de descarga, la licencia visible en el momento de la descarga y el contenido real del GLB.
- **Innerscene — esqueleto simplificado:** https://www.innerscene.com/tools/library/3d-parts/human-skeleton-simplified-anatomical-study-a93f4d8f  
  La página consultada declara CC0. Es una representación simplificada, no un atlas clínico detallado.
- **Innerscene — cerebro:** https://www.innerscene.com/tools/library/3d-parts/brain-10d8f88f  
  La página consultada declara CC0.
- **Innerscene — pulmones con tráquea:** https://www.innerscene.com/tools/library/3d-parts/lungs-with-trachea-respiratory-system-1d019b26  
  La página consultada declara CC0.
- **Z-Anatomy:** https://github.com/Z-Anatomy/Models-of-human-anatomy  
  El proyecto principal declara CC BY-SA 4.0, pero algunos modelos referenciados pueden tener licencias distintas, incluidas restricciones no comerciales. Revisar cada asset y conservar atribuciones antes de redistribuirlo.
- **Human Atlas (referencia de implementación):** https://github.com/ashemag/human-atlas  
  Sirve como referencia técnica para búsqueda, selección y capas anatómicas; su código y datos tienen licencias distintas. No se copiarán archivos ni grandes bloques de código sin comprobar sus condiciones.

## Estado actual

- [x] Crear componente reutilizable para cargar un GLB/GLTF local mediante React Three Fiber.
- [x] Reservar `public/models/` y documentar el flujo de incorporación.
- [ ] Obtener los archivos binarios y confirmar su licencia y tamaño.
- [ ] Inspeccionar mallas, nombres, orientación, escala y rendimiento en móvil.
- [ ] Integrar el primer modelo detrás de una opción controlada y conservar el modelo esquemático como respaldo.
- [ ] Añadir selección/aislamiento de mallas solo si el archivo conserva nombres y separaciones adecuados.
- [ ] Validar build y deployment antes de integrar los cambios a `main`.

## Precisión y transparencia

Las dimensiones de un archivo 3D describen la malla exportada; no demuestran por sí solas medidas anatómicas exactas. No presentar medidas como clínicamente verificadas sin una fuente anatómica fiable. El modelo y los indicadores fisiológicos de HumanLab 3D son para aprendizaje, no para diagnóstico.
