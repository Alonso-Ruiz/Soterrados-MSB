/* Inicialización mínima del mapa. La interfaz vive en app.js. */
var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        minZoom: 1,
        maxZoom: 28,
        constrainResolution: true
    })
});

map.getView().fit(
    [-8573188.749156, -1358493.962180, -8568635.764778, -1354985.493021],
    map.getSize()
);
