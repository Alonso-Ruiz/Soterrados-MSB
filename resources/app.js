

/* ============================================================
   app.js — interfaz del inventario
   • Iconos según diseño: contenedor con flechas de reciclaje
     — BLANCO = SOTERRADO   — VERDE = SUPERFICIAL
   • Popup propio para fotografías y datos
   • Leyenda desglosada: activa/desactiva tipos de contenedores
     y clases de vías por separado
   • Buscador combinado: vías (NOMBRE_FIN) y contenedores (Name)
   • Satélite Esri con slider de transparencia
   Cargar después de map-init.js
   ============================================================ */
(function () {
    'use strict';

    /* ================= ICONOS SVG (diseño contenedor + reciclaje) ================= */
    function svgUri(svg) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function binSvg(lidTop, lidBand, body, feet, line) {
        return "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>" +
          // tapa (trapecio con divisiones)
          "<path d='M8 5 L32 5 L36 13 L4 13 Z' fill='" + lidTop + "' stroke='" + line + "' stroke-width='2' stroke-linejoin='round'/>" +
          "<line x1='15' y1='5' x2='13.5' y2='13' stroke='" + line + "' stroke-width='2'/>" +
          "<line x1='25' y1='5' x2='26.5' y2='13' stroke='" + line + "' stroke-width='2'/>" +
          // banda
          "<rect x='4' y='13' width='32' height='4' fill='" + lidBand + "' stroke='" + line + "' stroke-width='2'/>" +
          // cuerpo
          "<rect x='7' y='17' width='26' height='16' rx='1' fill='" + body + "' stroke='" + line + "' stroke-width='2'/>" +
          // flechas de reciclaje
          "<path d='M25 29.5 L18.5 29.5 L18.5 25.5' fill='none' stroke='" + line + "' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>" +
          "<path d='M25 29.5 l-3 -2.6 M25 29.5 l-3 2.6' fill='none' stroke='" + line + "' stroke-width='2.2' stroke-linecap='round'/>" +
          "<path d='M15 21.5 L21.5 21.5 L21.5 25.5' fill='none' stroke='" + line + "' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>" +
          "<path d='M15 21.5 l3 -2.6 M15 21.5 l3 2.6' fill='none' stroke='" + line + "' stroke-width='2.2' stroke-linecap='round'/>" +
          // patas
          "<rect x='9' y='33' width='5' height='4.5' rx='1' fill='" + feet + "' stroke='" + line + "' stroke-width='2'/>" +
          "<rect x='26' y='33' width='5' height='4.5' rx='1' fill='" + feet + "' stroke='" + line + "' stroke-width='2'/>" +
        "</svg>";
    }

    // VERDE = SUPERFICIAL (como imagen 2)
    var ICON_SUP = svgUri(binSvg('#D40606', '#a10606', '#ff0c0c', '#9c2f2f', '#1f2430'));
    // BLANCO = SOTERRADO (como imagen 1)
    var ICON_SOT = svgUri(binSvg('#ffffff', '#ffffff', '#ffffff', '#ffffff', '#111111'));
    // VERDE INTENSO = RECICLAJE
    var ICON_REC = svgUri(binSvg('#339ffe', '#0088FF', '#4eacff', '#0088FF', '#001527'));
    // VERDE = PROPUESTA DE RECICLAJE
    var ICON_PRO = svgUri(binSvg('#2ecb70', '#178f49', '#52d98a', '#178f49', '#073d22'));

    /* ================= UTILIDADES ================= */
    function driveId(url) {
        if (!url) return null;
        var m = String(url).match(/\/file\/d\/([A-Za-z0-9_-]+)/) ||
                String(url).match(/[?&]id=([A-Za-z0-9_-]+)/);
        return m ? m[1] : null;
    }
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function norm(s) {
        return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    /* ================= ESTADO DE CATEGORÍAS ================= */
    var contState = {
        'SOTERRADOS': true,
        'SUPERFICIAL': true,
        'RECICLAJE': true,
        'PROPUESTA RECICLAJE': true
    };
    var viaState  = { 'Vía Local Preferencial': true, 'Vía Local Secundaria': true, 'Metropolitana': true };

    /* ================= ESTILOS ================= */
    function overrideStyles() {
        var binLabelStyles = Object.create(null);
        var roadStyles = new WeakMap();
        var styleSup = new ol.style.Style({
            image: new ol.style.Icon({ src: ICON_SUP, scale: 0.75, anchor: [0.5, 0.95] })
        });
        var styleSot = new ol.style.Style({
            image: new ol.style.Icon({ src: ICON_SOT, scale: 0.75, anchor: [0.5, 0.95] })
        });
        var styleRec = new ol.style.Style({
            image: new ol.style.Icon({ src: ICON_REC, scale: 0.75, anchor: [0.5, 0.95] })
        });
        var stylePro = new ol.style.Style({
            image: new ol.style.Icon({ src: ICON_PRO, scale: 0.75, anchor: [0.5, 0.95] })
        });

        lyr_Inventario2026_0.setStyle(function (f, resolution) {
            var tipo = f.get('TIPO');
            if (!contState[tipo]) return null;
            var base = tipo === 'SOTERRADOS' ? styleSot :
                       tipo === 'RECICLAJE' ? styleRec :
                       tipo === 'PROPUESTA RECICLAJE' ? stylePro : styleSup;
            if (resolution < 1.2 && f.get('Name')) {
                var name = String(f.get('Name'));
                if (!binLabelStyles[name]) {
                    binLabelStyles[name] = new ol.style.Style({
                        text: new ol.style.Text({
                            text: name,
                            font: '10px -apple-system, Arial, sans-serif',
                            fill: new ol.style.Fill({ color: '#222' }),
                            stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,.9)', width: 3 }),
                            offsetY: 11
                        })
                    });
                }
                return [base, binLabelStyles[name]];
            }
            return base;
        });

        // vías: envolver el estilo original filtrando por clasificación
        var originalRoadStyle = style_red_vial_0;
        lyr_red_vial_0.setStyle(function (f, resolution) {
            if (!viaState[f.get('CLASIFIC')]) return null;
            var cached = roadStyles.get(f);
            if (!cached) {
                cached = originalRoadStyle(f, resolution);
                roadStyles.set(f, cached);
            }
            return cached;
        });
    }

    /* ================= TÍTULO ================= */
    function addTitle() {
        var bar = document.createElement('header');
        bar.className = 'app-title';
        bar.innerHTML =
            '<div class="app-brand"><img src="assets/escudo-san-borja.png" alt="Escudo de San Borja">' +
            '<strong>Municipalidad<br>de San Borja</strong></div>' +
            '<div class="app-heading"><span>INVENTARIO 2026 · SAN BORJA</span>' +
            '<strong>Inventario de Contenedores de Basura e Islas de Reciclaje</strong></div>';
        document.body.appendChild(bar);
    }

    /* ================= PANEL DE CAPAS (leyenda desglosada) ================= */
    function addLayerPanel() {
        var contCounts = {};
        jsonSource_Inventario2026_0.getFeatures().forEach(function (feature) {
            var tipo = feature.get('TIPO');
            contCounts[tipo] = (contCounts[tipo] || 0) + 1;
        });

        var toggle = document.createElement('button');
        toggle.className = 'layer-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Abrir capas y leyenda');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        document.body.appendChild(toggle);

        var div = document.createElement('div');
        div.className = 'layer-panel';
        div.innerHTML =
            '<div class="lp-header"><div><small>INVENTARIO DE CONTENEDORES</small><strong>Leyenda</strong></div>' +
              '<button type="button" class="lp-close" aria-label="Cerrar leyenda"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
            '<p class="lp-help">Active las capas para visualizarlas en el mapa.</p>' +
            '<div class="lp-title">Contenedores</div>' +
            '<label class="lp-item"><input type="checkbox" data-cont="SOTERRADOS" checked>' +
              '<img src="' + ICON_SOT + '" alt=""><span>Soterrados (' + (contCounts.SOTERRADOS || 0) + ')</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-cont="SUPERFICIAL" checked>' +
              '<img src="' + ICON_SUP + '" alt=""><span>Superficial (' + (contCounts.SUPERFICIAL || 0) + ')</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-cont="RECICLAJE" checked>' +
              '<img src="' + ICON_REC + '" alt=""><span>Reciclaje (' + (contCounts.RECICLAJE || 0) + ')</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-cont="PROPUESTA RECICLAJE" checked>' +
              '<img src="' + ICON_PRO + '" alt=""><span>Propuesta (' + (contCounts['PROPUESTA RECICLAJE'] || 0) + ')</span></label>' +
            '<div class="lp-title lp-sep">División territorial</div>' +
            '<label class="lp-item"><input type="checkbox" data-layer="sectores" checked>' +
              '<span>Sectores</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-layer="subsectores" checked>' +
              '<span>Subsectores</span></label>' +
            '<div class="lp-title lp-sep">Red vial</div>' +
            '<label class="lp-item"><input type="checkbox" data-via="Vía Local Preferencial" checked>' +
              '<span class="lp-line" style="border-top:3.5px solid #413ccf"></span><span>Local Preferencial</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-via="Vía Local Secundaria" checked>' +
              '<span class="lp-line" style="border-top:3.5px solid #ffc80a"></span><span>Local Secundaria</span></label>' +
            '<label class="lp-item"><input type="checkbox" data-via="Metropolitana" checked>' +
              '<span class="lp-line" style="border-top:3.5px dashed #000"></span><span>Metropolitana</span></label>' +
            '<p class="lp-help">Imagen satelital: Esri.</p>';
        document.body.appendChild(div);

        function closePanel() {
            div.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('panel-open');
        }
        function togglePanel() {
            var open = !div.classList.contains('is-open');
            div.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('panel-open', open);
        }

        toggle.addEventListener('click', togglePanel);
        div.querySelector('.lp-close').addEventListener('click', closePanel);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

        div.addEventListener('change', function (e) {
            var el = e.target;
            if (el.getAttribute('data-cont')) {
                contState[el.getAttribute('data-cont')] = el.checked;
                lyr_Inventario2026_0.changed();
            } else if (el.getAttribute('data-layer')) {
                var isSectores = el.getAttribute('data-layer') === 'sectores';
                (isSectores ? lyr_Sectores_2 : lyr_subsectores_1).setVisible(el.checked);
            } else if (el.getAttribute('data-via')) {
                viaState[el.getAttribute('data-via')] = el.checked;
                lyr_red_vial_0.changed();
            }
        });
    }

    /* ================= POPUP PROPIO (overlay independiente) ================= */
    var overlay = null, popEl = null;

    function initPopup() {
        popEl = document.createElement('div');
        popEl.className = 'cont-popup';
        popEl.innerHTML = '<button type="button" class="cp-closer" aria-label="Cerrar ficha del contenedor">&#215;</button><div class="cp-content"></div>';
        overlay = new ol.Overlay({
            element: popEl,
            positioning: 'bottom-center',
            offset: [0, -16],
            autoPan: { margin: 16, animation: { duration: 140 } }
        });
        map.addOverlay(overlay);
        // La fotografía cambia la altura de la ficha al terminar de cargar.
        function keepPopupVisible() {
            overlay.panIntoView({ margin: 18, animation: { duration: 200 } });
        }
        popEl.addEventListener('load', keepPopupVisible, true);
        popEl.addEventListener('error', keepPopupVisible, true);
        popEl.querySelector('.cp-closer').addEventListener('click', function (e) {
            e.preventDefault();
            overlay.setPosition(undefined);
        });
    }

    function buildCard(f) {
        var name  = f.get('Name') || '';
        var tipo  = f.get('TIPO') || '';
        var sot   = tipo === 'SOTERRADOS';
        var rec   = tipo === 'RECICLAJE';
        var pro   = tipo === 'PROPUESTA RECICLAJE';
        var icon  = sot ? ICON_SOT : (rec ? ICON_REC : (pro ? ICON_PRO : ICON_SUP));
        var color = sot ? '#475569' : (rec ? '#0875bd' : (pro ? '#178f49' : '#c83030'));
        var capacidad = f.get('CAPACIDAD');
        var link  = f.get('LINK');
        var id    = driveId(link);
        var note  = link && !id ? String(link).replace(/\s+/g, ' ').trim() : '';

        var foto;
        if (id) {
            foto =
                '<a class="mc-photo" href="' + esc(link) + '" target="_blank" title="Abrir en Drive">' +
                  '<img src="https://drive.google.com/thumbnail?id=' + id + '&sz=w900" alt="" loading="eager" fetchpriority="high" ' +
                  'referrerpolicy="no-referrer" ' +
                  'onerror="this.parentNode.className+=\' mc-noimg\'">' +
                '</a>';
        } else {
            foto = '<div class="mc-photo mc-noimg"></div>';
        }

        return '' +
        '<div class="mini-card">' +
          '<div class="mc-head">' +
            '<img class="mc-ico" src="' + icon + '" alt="">' +
            '<span class="mc-name">' + esc(name) + '</span>' +
            '<span class="mc-badge" style="color:' + color + '">' + esc(tipo) + '</span>' +
          '</div>' +
          (capacidad != null ? '<div class="mc-capacity">Capacidad: ' + esc(capacidad) + ' m³</div>' : '') +
          (note ? '<div class="mc-capacity">Estado: ' + esc(note) + '</div>' : '') +
          foto +
        '</div>';
    }

    function showPopup(f) {
        popEl.querySelector('.cp-content').innerHTML = buildCard(f);
        var g = f.getGeometry();
        var coord = g.getType() === 'Point' ? g.getCoordinates()
                                            : ol.extent.getCenter(g.getExtent());
        overlay.setPosition(coord);
    }

    function hookClick() {
        map.on('singleclick', function (evt) {
            var hit = null;
            map.forEachFeatureAtPixel(evt.pixel, function (f) {
                hit = f;
                return true;
            }, {
                layerFilter: function (layer) { return layer === lyr_Inventario2026_0; },
                hitTolerance: 6
            });
            if (hit) { showPopup(hit); }
            else { overlay.setPosition(undefined); }
        });
        map.on('pointermove', function (evt) {
            if (evt.dragging) return;
            var over = false;
            map.forEachFeatureAtPixel(evt.pixel, function () {
                over = true;
                return true;
            }, {
                layerFilter: function (layer) { return layer === lyr_Inventario2026_0; },
                hitTolerance: 6
            });
            map.getTargetElement().style.cursor = over ? 'pointer' : '';
        });
    }

    /* ================= BUSCADOR (vías + contenedores) ================= */
    function addSearch() {
        var entries = [];   // {label, type, features}
        var byLabel = {};

        jsonSource_red_vial_0.getFeatures().forEach(function (f) {
            var n = f.get('NOMBRE_FIN');
            if (!n) return;
            var key = 'v:' + n;
            if (!byLabel[key]) {
                byLabel[key] = { label: n, type: 'via', features: [] };
                entries.push(byLabel[key]);
            }
            byLabel[key].features.push(f);
        });
        jsonSource_Inventario2026_0.getFeatures().forEach(function (f) {
            var n = f.get('Name');
            if (!n) return;
            var key = 'c:' + n;
            if (!byLabel[key]) {
                byLabel[key] = { label: n, type: 'cont', features: [] };
                entries.push(byLabel[key]);
            }
            byLabel[key].features.push(f);
        });
        entries.sort(function (a, b) { return a.label < b.label ? -1 : 1; });

        // capa resaltado de vías
        var highlightSource = new ol.source.Vector();
        map.addLayer(new ol.layer.Vector({
            source: highlightSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(230,57,70,.95)', width: 7, lineCap: 'round' })
            }),
            zIndex: 900
        }));

        var div = document.createElement('div');
        div.className = 'road-search';
        div.innerHTML =
            '<span class="rs-icon" aria-hidden="true"><i class="fa-solid fa-magnifying-glass"></i></span>' +
            '<input type="text" id="rs-input" placeholder="Buscar v&iacute;a o contenedor&hellip;" autocomplete="off">' +
            '<button id="rs-clear" type="button" title="Limpiar búsqueda" aria-label="Limpiar búsqueda" hidden><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
            '<div class="rs-list" id="rs-list"></div>';
        document.body.appendChild(div);

        var input = div.querySelector('#rs-input');
        var clearButton = div.querySelector('#rs-clear');
        var list  = div.querySelector('#rs-list');
        var currentHits = [];

        function hideList() { list.style.display = 'none'; }

        function select(entry) {
            input.value = entry.label;
            hideList();
            highlightSource.clear();
            overlay.setPosition(undefined);

            if (entry.type === 'via') {
                var ext = ol.extent.createEmpty();
                entry.features.forEach(function (f) {
                    ol.extent.extend(ext, f.getGeometry().getExtent());
                    highlightSource.addFeature(new ol.Feature(f.getGeometry()));
                });
                map.getView().fit(ext, { padding: [120, 60, 60, 60], maxZoom: 18, duration: 280 });
            } else {
                var f = entry.features[0];
                var c = f.getGeometry().getCoordinates();
                map.getView().animate({ center: c, zoom: 19, duration: 280 }, function (done) {
                    if (done) showPopup(f);
                });
            }
        }

        input.addEventListener('input', function () {
            clearButton.hidden = !this.value.length;
            var q = norm(this.value);
            if (q.length < 2) { hideList(); return; }
            currentHits = entries.filter(function (e) {
                return norm(e.label).indexOf(q) !== -1;
            }).slice(0, 9);
            if (!currentHits.length) { hideList(); return; }
            list.innerHTML = currentHits.map(function (e) {
                var tag = e.type === 'via'
                    ? '<i class="rs-tag rs-tag-via">v&iacute;a</i>'
                    : '<i class="rs-tag rs-tag-cont">cont.</i>';
                return '<div class="rs-item">' + tag + esc(e.label) + '</div>';
            }).join('');
            list.style.display = 'block';
            Array.prototype.forEach.call(list.children, function (el, i) {
                el.addEventListener('click', function () { select(currentHits[i]); });
            });
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && currentHits.length) select(currentHits[0]);
        });
        clearButton.addEventListener('click', function () {
            input.value = '';
            clearButton.hidden = true;
            hideList();
            highlightSource.clear();
        });
        document.addEventListener('click', function (e) {
            if (!div.contains(e.target)) hideList();
        });
    }

    /* ================= SATÉLITE ================= */
    function initSatellite() {
        var satLayer = new ol.layer.Tile({
            title: 'Satélite',
            visible: true,
            opacity: 0.5,
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                     'World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 19,
                transition: 0,
                attributions: 'Esri'
            })
        });
        try { map.getLayers().insertAt(1, satLayer); }
        catch (e) { map.addLayer(satLayer); }

        var initialCenter = map.getView().getCenter().slice();
        var initialZoom = map.getView().getZoom();
        var div = document.createElement('div');
        div.className = 'map-tools';
        div.setAttribute('aria-label', 'Herramientas del mapa');
        div.innerHTML =
            '<div class="tool-buttons">' +
              '<button type="button" id="map-home" class="map-tool" title="Volver a la vista inicial"><i class="fa-solid fa-house" aria-hidden="true"></i><span>Inicio</span></button>' +
              '<button type="button" id="opacity-toggle" class="map-tool" title="Controlar transparencia" aria-expanded="false"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i><span>Transparencia</span></button>' +
            '</div>' +
            '<div class="opacity-panel" hidden><label for="sat-slider">Transparencia del mapa</label>' +
              '<div class="opacity-row"><input type="range" id="sat-slider" min="0" max="100" value="50" aria-label="Opacidad del satélite"><output class="sat-value" for="sat-slider">50%</output></div></div>';
        document.body.appendChild(div);

        var slider = div.querySelector('#sat-slider');
        var value = div.querySelector('.sat-value');
        var opacityToggle = div.querySelector('#opacity-toggle');
        var opacityPanel = div.querySelector('.opacity-panel');
        function syncSlider() {
            var pct = Number(slider.value);
            satLayer.setOpacity(pct / 100);
            slider.style.setProperty('--sat-value', pct + '%');
            value.textContent = pct + '%';
        }
        syncSlider();
        slider.addEventListener('input', syncSlider);
        div.querySelector('#map-home').addEventListener('click', function () {
            overlay.setPosition(undefined);
            map.getView().animate({ center: initialCenter, zoom: initialZoom, duration: 450 });
        });
        opacityToggle.addEventListener('click', function () {
            var open = opacityPanel.hidden;
            opacityPanel.hidden = !open;
            opacityToggle.classList.toggle('is-active', open);
            opacityToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function addMapChrome() {
        map.getControls().getArray().slice().forEach(function (control) {
            if (control instanceof ol.control.Attribution) map.removeControl(control);
        });
        var compass = document.createElement('button');
        compass.type = 'button';
        compass.className = 'map-compass';
        compass.title = 'Orientar el mapa al norte';
        compass.setAttribute('aria-label', 'Orientar el mapa al norte');
        compass.innerHTML = '<i class="fa-solid fa-location-arrow" aria-hidden="true"></i>';
        compass.addEventListener('click', function () {
            map.getView().animate({ rotation: 0, duration: 300 });
        });
        document.body.appendChild(compass);
        map.addControl(new ol.control.ScaleLine({ units: 'metric' }));
    }

    /* ================= INIT ================= */
    function ready() {
        return typeof map !== 'undefined' && map &&
               typeof lyr_Inventario2026_0 !== 'undefined' &&
               typeof jsonSource_red_vial_0 !== 'undefined' &&
               typeof jsonSource_Inventario2026_0 !== 'undefined';
    }

    function start() {
        overrideStyles();
        addTitle();
        addLayerPanel();
        initPopup();
        hookClick();
        addSearch();
        initSatellite();
        addMapChrome();
    }

    function init() {
        if (ready()) { start(); return; }
        var tries = 0;
        var t = setInterval(function () {
            if (ready()) { clearInterval(t); start(); }
            else if (++tries > 20) clearInterval(t);
        }, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
