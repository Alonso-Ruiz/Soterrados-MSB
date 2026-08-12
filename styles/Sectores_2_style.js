var style_Sectores_2 = function (feature, resolution) {
    var label = feature.get('Sectores');
    return [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0,87,217,1)', lineCap: 'square', lineJoin: 'bevel', width: 2.3
        }),
        text: createTextStyle(feature, resolution, label == null ? '' : String(label),
            "21px 'Arial Black', sans-serif", '#003b8f', 'point', '#ffffff', 4)
    })];
};

