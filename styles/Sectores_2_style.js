var size = 0;
var placement = 'point';

var style_Sectores_2 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };

    var labelText = "";
    var value = feature.get("");
    var labelFont = "10.4px \'Arial Black\', sans-serif";
    var labelFill = "#ffffff";
    var bufferColor = "#c38800";
    var bufferWidth = 1.5;
    var textAlign = 'left';
    var offsetX = 8;
    var offsetY = 3;
    var overflow = false;
    var repeat = 0;
    var placement = 'point';
    if (feature.get("Sectores") !== null) {
        labelText = String(feature.get("Sectores"));
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(229,162,0,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 1.9}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth, textAlign, offsetX, offsetY, overflow, repeat)
    })];

    return style;
};
