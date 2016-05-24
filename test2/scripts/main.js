(function(){
    L.mapbox.accessToken = 'pk.eyJ1IjoieW96em8iLCJhIjoiY2lvYTdtOTR5MDA4bHc2bHkzdGV4a2UyciJ9.L3YfGHN-2yVbpjQPvdrY7Q';
    // L.mapbox.accessToken = 'pk.eyJ1Ijoic3BhcmtkaWdpdGFsZGVzaWduIiwiYSI6ImNpb2xsaWk0ZzAwMmh2dm02NGh0aGlnMjIifQ.emvmxCPCZlpQ0ovvxp0F-g';

    var vdfMap = vdfMap || {};

    var southWest = L.latLng(-71.300, -165.937),
        northEast = L.latLng(82.118, 189.843),
        bounds = L.latLngBounds(southWest, northEast);

    var map = L.mapbox
            .map('map', 'mapbox.light',
                {
                    attributionControl: false,
                    zoomControl: false,
                    minZoom: 4,
                    maxZoom: 7,
                    maxBounds: bounds,
                    style: 'mapbox://styles/yozzo/cioei8vzc002yczmamm4yefeb'
                })
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

                    var  secondaryMarkerHtml = '<div class="secondary-marker-root">' +
                        '<div class="secondary-marker-wrapper">' +
                        '<div class="secondary-marker-content">' +
                        '<a href="'+ feature.properties.content.href +'">' +
                        '<span class="secondary-marker-content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>' +
                        '<span class="secondary-marker-content-copy">' + feature.properties.sr_subunit + '</span></a>' +
                        '</div>' +
                        '</div>' +
                        '<div class="secondary-marker-tip-container">' +
                        '<div class="secondary-marker-tip"></div>' +
                        '</div>' +
                        '</div>';
                    
                    return secondaryMarkerHtml;

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

                    var feature = marker.toGeoJSON();

                    //TODO move this outside the map
                    $('.destinations__list--main').append('<li class="list-item"> <span class="list-item-heading">' + feature.properties.sr_subunit +'</span>' +
                            '<span class="list-item-copy">' + feature.properties.content.copy +'</span>' +
                        '<a class="list-item-link" href=""' + feature.properties.content.href + '">&nbsp</a></li>');


                    marker._icon.src = 'images/dot.svg';
                    marker._icon.class = 'main-marker-pin';

                    marker.bindPopup(
                        '<div class="marker-main">' +
                        '<span class="main-pin">&nbsp;</span>' +
                        '<span class="main-subunit">' + feature.properties.sr_subunit + '</span>' +
                        '<p class="main-copy">' + feature.properties.content.copy + '</p>' +
                        '<a class="main-href" href="' + feature.properties.content.href + '">&nbsp</a>'
                    );


                } else if (marker.toGeoJSON().properties.destination === 'secondary'){

                    //TODO move this outside the map
                    $('.destinations__list--secondary').append('<li class="list-item"> <span class="list-item-heading">' + marker.toGeoJSON().properties.sr_subunit +'</span>' +
                        '<a class="list-item-link" href=""' + marker.toGeoJSON().properties.content.href + '">&nbsp</a></li>');

                    marker.bindPopup('<div class="popup-marker-secondary"><a href="' + marker.toGeoJSON().properties.content.href +'">' +
                        '<span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>'
                        + marker.toGeoJSON().properties.sr_subunit +
                        '</div></a>'
                        + '<div class="popup-marker-secondary-tip-container"><div class="popup-marker-secondary-tip"></div></div>'
                    );


                    marker._icon.src = 'images/dot.svg';

                } else {
                    marker.setIcon(L.mapbox.marker.icon({}));
                    marker._icon.src = 'images/empty.svg';

                }
            });
        }).addTo(map);




    mainMap.on('mouseover',function(e) {
        var destination = e.layer.feature.properties.destination;

        if (!destination) {
            return;
        }

        if (map.getZoom() < 5 &&  destination === 'main') {
            e.layer.openPopup();
        }

        if (map.getZoom() < 6 &&  destination === 'secondary') {
            e.layer.openPopup();
        }

    } );
    mainMap.on('mouseout', function(e) {

        setTimeout(function() {
            e.layer.closePopup();
        }, 3000);
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
        var minimap = L.mapbox.tileLayer('mapbox.light', {noWrap: false}, {minZoom: 0, maxZoom: 4, maxBounds: bounds}),
            miniCoverage =  L.mapbox.featureLayer().loadURL('data/coverage.geojson');

        layers = new L.LayerGroup([minimap, miniCoverage]);

        new L.Control.MiniMap(layers, {
            width: 240,
            position: 'topright',
            aimingRectOptions: {color: "#333333", weight: 3},
            shadowRectOptions: {color: "#c90000", weight: 1, opacity: 0, fillOpacity: 0},
            centerFixed: [40.7842, -73.9919]
        })
            .addTo(map);

        $('.vdf-marker-secondary').hide();

        setTimeout(function() {
            $('.vdf-marker').remove();
        }, 300);
    });


    map.on('zoomend', function() {

        $('.leaflet-popup-content').hide();

        if (map.getZoom() >= 5) {
            $('.vdf-marker-main').each(function(index) {
                $(this).delay(40*index).fadeIn(100);
            });
        } else {
            $('.vdf-marker-main').each(function(index) {
                $(this).delay(40*index).fadeOut(100);
            });
        }

        if (map.getZoom() >= 6) {
            $('.vdf-marker-secondary').each(function(index) {
                $(this).delay(40*index).fadeIn(100);
            });
        } else {
            $('.vdf-marker-secondary').each(function(index) {
                $(this).delay(40*index).fadeOut(100);
            });
        }
    });


    $('.vdf-marker-secondary').each(function(index) {
        $(this).delay(400*index).fadeIn(300);
    });



    $('.roaming__coverage').on('click', function(){
        map.setView([55, -8], 3);
    });

    //TODO get style locally
    L.mapbox.styleLayer('mapbox://styles/yozzo/cioei8vzc002yczmamm4yefeb').addTo(map);
    L.mapbox.featureLayer().loadURL('data/coverage.geojson').addTo(map);


    function populateMobileLists() {
        var data =  L.mapbox.featureLayer().loadURL('data/coverage.geojson');



        console.log('data', data);
    }

    populateMobileLists();

})();

