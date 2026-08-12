var size = 0;
var placement = 'point';

function categories_Inventario2026_0(feature, value, size, resolution, labelText,
                                      labelFont, labelFill, bufferColor, bufferWidth,
                                      placement) {
    var colors = {
        'SOTERRADOS': 'rgba(154,135,236,1)',
        'SUPERFICIAL': 'rgba(215,134,76,1)',
        'RECICLAJE': 'rgba(29,155,91,1)'
    };
    var color = colors[String(value || '')] || 'rgba(120,120,120,1)';
    return [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8 + size,
            stroke: new ol.style.Stroke({ color: 'rgba(0,4,0,1)', width: 1.52 }),
            fill: new ol.style.Fill({ color: color })
        }),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor, bufferWidth)
    })];
}

var style_Inventario2026_0 = function (feature, resolution) {
    var labelText = feature.get('Name') == null ? '' : String(feature.get('Name'));
    return categories_Inventario2026_0(
        feature, feature.get('TIPO'), size, resolution, labelText,
        "10.4px 'Arial', sans-serif", '#323232', '', 0, 'point'
    );
};
