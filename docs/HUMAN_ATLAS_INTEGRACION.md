# Inspección técnica de Human Atlas para HumanLab 3D

## Hallazgos confirmados

Repositorio examinado: https://github.com/joxxemola/Human-Atlas

- El catálogo está en `public/models/atlas.json` y la geometría se distribuye en bloques binarios `.bin` y `.bin.gz`.
- La documentación declara 2.234 mallas individuales y 3.432 conceptos anatómicos; un concepto puede agrupar varias mallas.
- El visor carga los bloques con un cargador propio de Three.js, reconstruye geometrías y las agrupa por sistema anatómico. No es un conjunto de archivos GLB independientes.
- El componente GLB que ya preparamos en HumanLab no puede abrir directamente los bloques del atlas. Para integrar Human Atlas hay que adaptar el cargador o convertir un subconjunto a GLB.
- La anatomía se basa en BodyParts3D 4.0, una referencia masculina adulta; no cubre todas las variaciones anatómicas humanas.

## Licencias y créditos

- El código de la aplicación Human Atlas declara MIT.
- `public/ATTRIBUTION.md` declara los datos anatómicos BodyParts3D 4.0 bajo CC BY 4.0 e incluye fuente, publicación y transformaciones.
- Al redistribuir la anatomía, conservar la atribución de BodyParts3D y revisar las condiciones del archivo concreto. Los créditos deben aparecer en HumanLab y en la documentación.
- Fuentes: https://github.com/joxxemola/Human-Atlas/blob/main/public/ATTRIBUTION.md y https://creativecommons.org/licenses/by/4.0/

## Plan técnico recomendado

1. No copiar todo el visor ni sus dependencias de interfaz. Adaptar solamente catálogo, carga de geometría y selección de estructuras.
2. Hacer primero una prueba pequeña con un sistema anatómico para validar ejes, escala, normales, nombres y selección.
3. Mantener la escena esquemática y los controles fisiológicos como fallback mientras se valida el nuevo atlas.
4. Medir carga inicial, memoria y rendimiento en móvil antes de habilitar todos los bloques.
5. No describir dimensiones de malla como medidas anatómicas clínicamente verificadas.

## Estado

La inspección del catálogo, los bloques de geometría, el cargador y la atribución ya se realizó. La integración funcional de la geometría del atlas y la validación de build siguen pendientes; el PR #3 continúa abierto y no se ha fusionado.