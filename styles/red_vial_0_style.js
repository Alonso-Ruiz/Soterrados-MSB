var size = 0;
var placement = 'point';
function categories_red_vial_0(feature, value, size, resolution, labelText,
                       labelFont, labelFill, bufferColor, bufferWidth,
                       placement) {
                var valueStr = (value !== null && value !== undefined) ? value.toString() : 'default';
                switch(valueStr) {case 'Vía Local Preferencial':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(65,60,207,1.0)', lineDash: null, lineCap: 'round', lineJoin: 'round', width: 3.8}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'Vía Local Secundaria':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(255,200,10,1.0)', lineDash: null, lineCap: 'round', lineJoin: 'round', width: 3.8}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'Metropolitana':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,0,0,1.0)', lineDash: [15.2,7.6], lineCap: 'butt', lineJoin: 'round', width: 3.8}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;}};

var style_red_vial_0 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("CLASIFIC");
    var labelFont = "15.600000000000001px \'Arial\', sans-serif";
    var labelFill = "#fafafa";
    var bufferColor = "#fafafa";
    var bufferWidth = 0.6000000000000001;
    var textAlign = "left";
    var offsetX = 0;
    var offsetY = 0;
    var placement = 'line';
    if (feature.get("NOMBRE_FIN") !== null) {
        labelText = String(feature.get("NOMBRE_FIN"));
    }
    
    var style = categories_red_vial_0(feature, value, size, resolution, labelText,
                            labelFont, labelFill, bufferColor,
                            bufferWidth, placement);

    return style;
};
