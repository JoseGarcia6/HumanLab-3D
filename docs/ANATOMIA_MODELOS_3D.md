# Plan de modelos anatómicos 3D — HumanLab 3D

## Objetivo

Ampliar el visualizador existente sin eliminar el laboratorio fisiológico, los controles de frecuencia cardíaca/respiratoria ni la vista esquemática de respaldo. La anatomía seguirá siendo educativa y no diagnóstica.

## Estrategia acordada

1. **Modelos descargables CC0:** incorporar primero modelos independientes compatibles, una vez verificados los archivos GLB, su licencia y su tamaño.
2. **Human Atlas:** utilizar el repositorio [joxxemola/Human-Atlas](https://github.com/joxxemola/Human-Atlas) como referencia principal para estudiar cómo organizar un atlas interactivo con miles de estructuras, selección, visibilidad y sistemas anatómicos. Adaptar su enfoque al proyecto Next.js/React Three Fiber, no asumir que se puede copiar el proyecto entero sin revisar cada licencia.
3. **Z-Anatomy:** evaluar estructuras adicionales individualmente. No mezclar assets de licencias incompatibles ni usar assets con restricciones no comerciales en un proyecto que no cumpla esas condiciones.
4. **Modelos propios:** preparar una ruta para adaptar o crear modelos en Blender cuando sea posible.

## Fuentes evaluadas

- **Innerscene — torso con órganos extraíbles:** https://www.innerscene.com/tools/library/3d-parts/torso-with-removable-organs-1fe1b70a  
  La página consultada declara CC0. Antes de incorporar el archivo, verificar el enlace de descarga, la licencia visible al descargar y el contenido real del GLB.
- **Innerscene — esqueleto simplificado:** https://www.innerscene.com/tools/library/3d-parts/human-skeleton-simplified-anatomical-study-a93f4d8f  
  La página consultada declara CC0. Es una representación simplificada, no un atlas clínico detallado.
- **Innerscene — cerebro:** https://www.innerscene.com/tools/library/3d-parts/brain-10d8f88f  
  La página consultada declara CC0.
- **Innerscene — pulmones con tráquea:** https://www.innerscene.com/tools/library/3d-parts/lungs-with-trachea-respiratory-system-1d019b26  
  La página consultada declara CC0.
- **Human Atlas — repositorio de código y atlas:** https://github.com/joxxemola/Human-Atlas  
  La información revisada indica código bajo MIT y datos/modelos anatómicos bajo CC BY 4.0, que exige atribución. Antes de reutilizar archivos concretos, comprobar los avisos de licencia incluidos en el repositorio y sus carpetas, registrar autores/fuentes y mantener los créditos visibles en HumanLab 3D. El proyecto original usa Vite, React y Three.js, por lo que su lógica y recursos deben adaptarse a la arquitectura Next.js/React Three Fiber de HumanLab.
- **Z-Anatomy — modelos anatómicos:** https://github.com/Z-Anatomy/Models-of-human-anatomy  
  El proyecto principal declara CC BY-SA 4.0, pero algunos modelos referenciados pueden tener licencias distintas, incluidas restricciones no comerciales. Revisar cada asset y conservar atribuciones antes de redistribuirlo.

## Estado actual

- [x] Crear componente reutilizable para cargar un GLB/GLTF local mediante React Three Fiber.
- [x] Reservar `public/models/` y documentar el flujo de incorporación.
- [x] Añadir Human Atlas a la estrategia y registrar las consideraciones de licencia.
- [ ] Inspeccionar el repositorio Human Atlas y seleccionar los datos/modelos concretos que se puedan reutilizar.
- [ ] Obtener los archivos binarios y confirmar licencia, atribución y tamaño.
- [ ] Inspeccionar mallas, nombres, orientación, escala y rendimiento en móvil.
- [ ] Integrar los primeros modelos detrás de una opción controlada y conservar la escena esquemática como respaldo.
- [ ] Añadir selección/aislamiento de mallas solo si el archivo conserva nombres y separaciones adecuados.
- [ ] Validar build y deployment antes de integrar los cambios a `main`.

## Precisión y transparencia

Las dimensiones de un archivo 3D describen la malla exportada; no demuestran por sí solas medidas anatómicas exactas. No presentar medidas como clínicamente verificadas sin una fuente anatómica fiable. El modelo y los indicadores fisiológicos de HumanLab 3D son para aprendizaje, no para diagnóstico.
