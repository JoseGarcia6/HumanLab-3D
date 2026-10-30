# Plan de anatomía 3D — HumanLab 3D

## Objetivo

Mejorar gradualmente el visualizador de HumanLab 3D sin reemplazar ni dañar las funciones que ya desarrollamos. La escena anatómica esquemática y el laboratorio fisiológico seguirán siendo la versión funcional de respaldo.

## Alcance actual

- El proyecto conserva la escena anatómica esquemática existente.
- Se añadió un componente reutilizable para cargar archivos GLB/GLTF locales mediante React Three Fiber.
- La carpeta `public/models/` queda preparada para futuros modelos propios.
- Todavía no hay archivos GLB/GLTF incorporados y el componente de carga aún no se utiliza en la escena principal.
- No se integran repositorios, atlas ni modelos anatómicos de terceros en esta etapa.

## Próximos pasos propios

1. Crear o preparar un modelo anatómico propio, por ejemplo mediante Blender.
2. Exportarlo como GLB y guardarlo en `public/models/`.
3. Revisar escala, orientación, nombres de mallas, tamaño y rendimiento.
4. Probar el modelo en una vista aislada antes de conectarlo con la escena principal.
5. Mantener la anatomía esquemática como alternativa si el modelo falla o carga lentamente.
6. Verificar que el laboratorio fisiológico, los controles y la interfaz actual sigan funcionando.
7. Ejecutar la compilación y probar el despliegue de vista previa antes de integrar cambios en `main`.

## Precisión y transparencia

HumanLab 3D es un proyecto educativo. Los modelos y los indicadores fisiológicos son ilustrativos y no deben presentarse como herramientas de diagnóstico clínico. Las dimensiones de una malla 3D no demuestran por sí solas que sus medidas sean anatómicamente exactas.

## Estado

- [x] Preparar un componente propio para cargar modelos GLB/GLTF locales.
- [x] Reservar `public/models/` y documentar cómo añadir futuros modelos propios.
- [ ] Incorporar un modelo propio.
- [ ] Integrarlo de forma controlada sin eliminar la escena esquemática.
- [ ] Probar la aplicación y validar la compilación antes de integrar los cambios.

## Actualización: módulo detallado basado en Human Atlas

Con autorización del responsable del proyecto, se incorporó un módulo independiente en `/atlas` que reutiliza componentes del visor Human Atlas (MIT) y geometría BodyParts3D (CC BY 4.0) con atribución. La integración no sustituye la escena esquemática ni el laboratorio fisiológico de HumanLab 3D. Los modelos detallados se solicitan al abrir esa ruta.

**Pruebas pendientes antes de fusionar a `main`:**

- [ ] Confirmar que `next build` termina sin errores en el commit actual.
- [ ] Comprobar `/atlas` en el navegador y que carguen el manifiesto y los archivos de geometría.
- [ ] Validar selección de órganos, búsqueda, capas, aislamiento y restablecimiento de vista.
- [ ] Probar memoria y manejo táctil en Android.
- [ ] Comprobar que la página principal, biblioteca y laboratorio anteriores siguen operativos.

El módulo es educativo, no diagnóstico. Los créditos están en `public/ATTRIBUTION_HUMAN_ATLAS.md`.
