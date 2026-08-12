var style_subsectores_1 = function (feature, resolution) {
    var label = feature.get('RefName');
    return [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(229,229,229,1)', lineCap: 'square', lineJoin: 'bevel', width: 1.9
        }),
        text: createTextStyle(feature, resolution, label == null ? '' : String(label),
            "13px 'Arial Black', sans-serif", '#ffffff', 'point', '#05009a', 3)
    })];
};

