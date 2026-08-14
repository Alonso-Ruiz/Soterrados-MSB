var size = 0;
var placement = 'point';

var style_subsectores_1 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };

    var labelText = "";
    var value = feature.get("");
    var labelFont = "13.0px \'Arial Black\', sans-serif";
    var labelFill = "#ffffff";
    var bufferColor = "#05009a";
    var bufferWidth = 3.0;
    var textAlign = 'left';
    var offsetX = 8;
    var offsetY = 3;
    var overflow = false;
    var repeat = 0;
    var placement = 'point';
    if (feature.get("RefName") !== null) {
        labelText = String(feature.get("RefName"));
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(10,83,228,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 3.6479999999999997}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth, textAlign, offsetX, offsetY, overflow, repeat)
    })];

    return style;
};
