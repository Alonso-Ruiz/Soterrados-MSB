var createTextStyle = function (feature, resolution, labelText, labelFont,
                               labelFill, placement, bufferColor,
                               bufferWidth, textAlign, offsetX, offsetY,
                               overflow, repeat) {
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
        textAlign: textAlign || 'left',
        offsetX: offsetX == null ? 8 : offsetX,
        offsetY: offsetY == null ? 3 : offsetY,
        placement: placement,
        maxAngle: 0,
        overflow: Boolean(overflow),
        repeat: repeat || undefined,
        fill: new ol.style.Fill({ color: labelFill }),
        stroke: bufferStyle
    });
};

