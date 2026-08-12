# Inventario de Contenedores de Basura 2026

Mapa web estático basado en OpenLayers.

## Estructura

- `index.html`: estructura mínima y orden de carga.
- `styles/app.css`: diseño completo de la interfaz.
- `resources/ol.js` y `resources/ol.css`: motor cartográfico.
- `resources/functions.js`: creación de etiquetas del mapa.
- `resources/map-init.js`: creación y vista inicial del mapa.
- `resources/app.js`: filtros, búsqueda, popups, iconos y mapa satelital.
- `layers/*.js`: datos GeoJSON y composición de capas.
- `styles/*_style.js`: simbología de cada capa.

## Orden de capas

1. Red vial
2. Subsectores
3. Sectores
4. Contenedores

Los índices Z están definidos explícitamente en `layers/layers.js`.

## Actualizar datos

Para reemplazar una capa, conserve el nombre de su variable global:

- `json_Sectores_2`
- `json_subsectores_1`
- `json_red_vial_0`
- `json_Inventario2026_0`

Después de actualizar datos o estilos, abra el proyecto mediante un servidor HTTP local; no use directamente `file://`.
