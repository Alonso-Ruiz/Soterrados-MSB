
var wms_layers = [];

function vectorLayer(json, style, title, interactive) {
    var format = new ol.format.GeoJSON();
    var features = format.readFeatures(json, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    var source = new ol.source.Vector({ attributions: ' ' });
    source.addFeatures(features);
    var layer = new ol.layer.Vector({
        declutter: false,
        source: source,
        style: style,
        popuplayertitle: title,
        interactive: interactive,
        title: title
    });
    return { source: source, layer: layer };
}

var sectores = vectorLayer(json_Sectores_2, style_Sectores_2, 'Sectores', false);
var jsonSource_Sectores_2 = sectores.source;
var lyr_Sectores_2 = sectores.layer;

var subsectores = vectorLayer(json_subsectores_1, style_subsectores_1, 'Subsectores', false);
var jsonSource_subsectores_1 = subsectores.source;
var lyr_subsectores_1 = subsectores.layer;

var redVial = vectorLayer(json_red_vial_0, style_red_vial_0, 'Red vial', true);
var jsonSource_red_vial_0 = redVial.source;
var lyr_red_vial_0 = redVial.layer;

var inventario = vectorLayer(json_Inventario2026_0, style_Inventario2026_0, 'Inventario 2026', true);
var jsonSource_Inventario2026_0 = inventario.source;
var lyr_Inventario2026_0 = inventario.layer;

// Orden visual explícito: vías al fondo, divisiones territoriales encima
// y contenedores siempre en primer plano.
lyr_red_vial_0.setZIndex(10);
lyr_subsectores_1.setZIndex(20);
lyr_Sectores_2.setZIndex(30);
lyr_Inventario2026_0.setZIndex(40);

lyr_Sectores_2.setVisible(true);
lyr_subsectores_1.setVisible(true);
lyr_red_vial_0.setVisible(true);
lyr_Inventario2026_0.setVisible(true);

var layersList = [lyr_Sectores_2, lyr_subsectores_1, lyr_red_vial_0, lyr_Inventario2026_0];

