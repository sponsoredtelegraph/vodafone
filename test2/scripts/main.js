(function(){
    L.mapbox.accessToken = 'pk.eyJ1IjoieW96em8iLCJhIjoiY2lvYTdtOTR5MDA4bHc2bHkzdGV4a2UyciJ9.L3YfGHN-2yVbpjQPvdrY7Q';

    var map = L.mapbox
            .map('map', 'mapbox.light', {attributionControl: false, zoomControl: false, minZoom: 3, maxZoom: 8})
            .setView([44, 16], 5);

    L.control.zoomslider().addTo(map);

    var gj = L.geoJson(null, {
        pointToLayer: function(feature, ll) {

            function setHtml(feature) {

                if ( feature.properties.destination
                    && feature.properties.destination === 'main'
                    && feature.properties.content) {

                    var mainMarkerHtml = '<div class="marker-main">' +
                                            '<span class="main-pin">&nbsp;</span>' +
                                            '<span class="main-subunit">' + feature.properties.sr_subunit + '</span>' +
                                            '<p class="main-copy">' + feature.properties.content.copy + '</p>' +
                                            '<a class="main-href" href="' + feature.properties.content.href + '">&nbsp</a>';


                    return mainMarkerHtml;

                } else if ( feature.properties.destination
                            && feature.properties.destination === 'secondary'
                            && feature.properties.content) {

                    var secondaryMarkerHtml = '<div class="marker-secondary">' +
                        '<span class="secondary-subunit">' + feature.properties.sr_subunit + '</span>' +
                        '<p class="secondary-copy">' + feature.properties.content.copy + '</p>' +
                        '<a class="secondary-href" href="' + feature.properties.content.href + '">&nbsp</a>',


                        testSecondaryMarkerHtml = '<div class="leaflet-popup  leaflet-zoom-animated">' +
                        '<div class="leaflet-popup-content-wrapper">' +
                        '<div class="leaflet-popup-content">' +
                        '<span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>' +
                            feature.properties.sr_subunit +
                    '</div>' +
                            '</div>' +
                    '<div class="leaflet-popup-tip-container">' +
                        '<div class="leaflet-popup-tip"></div>' +
                        '</div>' +
                        '</div>'

                    return testSecondaryMarkerHtml;

                } else {
                    return '';
                }
            }

            function setClassName() {
                if ( feature.properties.destination
                    && feature.properties.destination === 'main') {

                    return 'vdf-marker-main';

                } else if ( feature.properties.destination
                    && feature.properties.destination === 'secondary') {

                    return 'vdf-marker-secondary';

                }

                else {
                    return 'vdf-marker';
                }
            }

            return L.marker(ll, {
                icon: L.divIcon({
                    className: setClassName(feature),
                    html: setHtml(feature),
                    iconSize: [100, 40]
                })
            });
        }
    }).addTo(map);



    var mainMap = L.mapbox.featureLayer()
        .loadURL('data/destinations.geojson')
        .on('ready', function(e) {

            gj.addData(this.getGeoJSON());


            this.eachLayer(function(marker) {
                if (marker.toGeoJSON().properties.destination === 'main') {

                    marker._icon.src = 'images/dot.svg';
                    marker._icon.class = 'main-marker-pin';

                } else if (marker.toGeoJSON().properties.destination === 'secondary'){

                    marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#88ff88',
                        'marker-size': 'large'
                    }));

                    marker._icon.src = 'images/dot.svg';

                } else {
                    marker.setIcon(L.mapbox.marker.icon({}));
                    marker._icon.src = 'images/dot.svg';
                    
                }
                // Bind a popup to each icon based on the same properties
                marker.bindPopup('<span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>' + marker.toGeoJSON().properties.sr_subunit);

            });
        }).addTo(map);

    mainMap.on('mouseover', function(e) {
        var destination = e.layer.feature.properties.destination;
        if (!destination) {
            e.layer.openPopup();
        }

        if (map.getZoom() < 5 &&  destination === 'main') {
            e.layer.openPopup();
        }

        if (map.getZoom() < 6 &&  destination === 'secondary') {
            e.layer.openPopup();
        }

    });
    mainMap.on('mouseout', function(e) {
        var destination = e.layer.feature.properties.destination;
        if (!destination) {
            e.layer.closePopup();
        }

        if (map.getZoom() < 5 &&  destination === 'main') {
            e.layer.closePopup();
        }

        if (map.getZoom() < 6 &&  destination === 'secondary') {
            e.layer.closePopup();
        }
    });
    mainMap.on('click', function(e) {
        if (e.layer.feature.properties.content) {
        var link = e.layer.feature.properties.content.href;
            window.open(link);
        }
    });

    /**
     * Minimap
     */
    map.on('ready', function() {
        var minimap = L.mapbox.tileLayer('mapbox.light'),
            miniCoverage = omnivore.topojson('data/vodafoneCoverageTopoJson.json');

        layers = new L.LayerGroup([minimap, miniCoverage]);

        new L.Control.MiniMap(layers, {
            width: 250,
            aimingRectOptions : {color: "#333333", weight: 3},
            shadowRectOptions: {color: "#c90000", weight: 1, opacity:0, fillOpacity:0}
        })
            .addTo(map);


        // $('.vdf-marker-main').hide();
        $('.vdf-marker-secondary').hide();

        setTimeout(function() {
            console.log('ready');
            $('.vdf-marker').remove();
        }, 300);
    });


    map.on('zoomend', function() {

        if (map.getZoom() >= 5) {

            $('.vdf-marker-main').show('slow');

        } else {
            $('.vdf-marker-main').hide('slow');
        }

        if (map.getZoom() >= 6) {
            $('.vdf-marker-secondary').show('slow');

        } else {
            $('.vdf-marker-secondary').hide('slow');
        }
    });

    $('.roaming__coverage').on('click', function(){
        map.setView([55, -8], 3);
    });

    //TODO get style locally
    L.mapbox.styleLayer('mapbox://styles/yozzo/cioei8vzc002yczmamm4yefeb').addTo(map);

    // Internally this function uses the TopoJSON library to decode the given file
    // into GeoJSON.

    //TODO swap with valid geoJSON
    var VodafoneLayer = omnivore.topojson('data/VodafoneCoverageTopoJson.json')
        .addTo(map);

})();