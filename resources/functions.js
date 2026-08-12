var createTextStyle = function (feature, resolution, labelText, labelFont,
                               labelFill, placement, bufferColor,
                               bufferWidth) {
    if (feature.hide || !labelText) {
        return;
    }

    var bufferStyle = bufferWidth === 0 ? null : new ol.style.Stroke({
        color: bufferColor,
        width: bufferWidth
    });

    return new ol.style.Text({
        font: labelFont,
        text: labelText,
        textBaseline: 'middle',
        textAlign: 'left',
        offsetX: 8,
        offsetY: 3,
        placement: placement,
        maxAngle: 0,
        fill: new ol.style.Fill({ color: labelFill }),
        stroke: bufferStyle
    });
};

