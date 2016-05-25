(function(){


    var vdfMap = vdfMap || {};

    vdfMap = {
        template: {

            main: {
                marker: _.template('<div class="marker-main">' +
                    '<span class="main-pin">&nbsp;</span>' +
                    '<span class="main-subunit"><%= country %></span>' +
                    '<p class="main-copy"><%= copy %></p>' +
                    '<a class="main-href" href="<%= link %>">&nbsp</a>'),

                listItem: _.template('<li class="list-item"> <span class="list-item-heading"><%= country %></span>' +
                    '<span class="list-item-copy"><%= copy %></span>' +
                    '<a class="list-item-link" href="<%= link %>">&nbsp</a></li>'),

                hover: _.template(
                    '<div class="marker-main">' +
                    '<span class="main-pin">&nbsp;</span>' +
                    '<span class="main-subunit"><%= country %></span>' +
                    '<p class="main-copy"><%= copy %></p>' +
                    '<a class="main-href" href="<%= link %>">&nbsp</a>'
                )
            },

            secondary: {
                marker: _.template('<div class="secondary-marker-root">' +
                    '<div class="secondary-marker-wrapper">' +
                    '<div class="secondary-marker-content">' +
                    '<a href="<%= link %>">' +
                    '<span class="secondary-marker-content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>' +
                    '<span class="secondary-marker-content-copy"><%= country %></span></a>' +
                    '</div>' +
                    '</div>' +
                    '<div class="secondary-marker-tip-container">' +
                    '<div class="secondary-marker-tip"></div>' +
                    '</div>' +
                    '</div>'),

                listItem: _.template('<li class="list-item"> <span class="list-item-heading"><%= country %></span>' +
                    '<a class="list-item-link" href="<%= link %>">&nbsp</a></li>'),

                hover: _.template('<div class="popup-marker-secondary"><a href="<%= link %>">' +
                    '<span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span><%= country %></div></a>'
                    + '<div class="popup-marker-secondary-tip-container"><div class="popup-marker-secondary-tip"></div></div>')
            }
        },
        style: 'mapbox://styles/sparkdigitaldesign/ciomog30c0019dgm46h7b8gnd',
        token: 'pk.eyJ1Ijoic3BhcmtkaWdpdGFsZGVzaWduIiwiYSI6ImNpb2xsaWk0ZzAwMmh2dm02NGh0aGlnMjIifQ.emvmxCPCZlpQ0ovvxp0F-g',
        url: {
            coverage: 'data/coverage.geojson',
            destinations: 'data/destinations.geojson'
        },

        className: {
            marker: {
                main: 'vdf-marker-main',
                secondary: 'vdf-marker-secondary',
                normal: 'vdf-marker'
            },

            pin: {
                main: 'main-marker-pin',
                secondary: 'secondary-marker-pin'
            }
        },

        selector: {
            marker: {
                main: '.vdf-marker-main',
                secondary: '.vdf-marker-secondary',
                normal: '.vdf-marker'
            },

            list: {
                main: '.destinations__list--main',
                secondary: '.destinations__list--secondary'
            },

            button: '.roaming__coverage',
            popup: '.leaflet-popup-content'
        },

        svg: {
            dot: 'images/dot.svg',
            empty: 'images/empty.svg'
        },

        delayOpacity: function (selector, fn, arg) {
            $(selector).each(function(index) {
                $(this).delay(40*index)[fn](arg);
            });
        },

        setHtml: function(feature) {

            if ( feature.properties.destination
                && feature.properties.destination === 'main'
                && feature.properties.content) {

                var mainMarkerHtml = vdfMap.template.main.marker({
                    country: feature.properties.sr_subunit,
                    copy: feature.properties.content.copy,
                    link: feature.properties.content.href
                });


                return mainMarkerHtml;

            } else if ( feature.properties.destination
                && feature.properties.destination === 'secondary'
                && feature.properties.content) {

                var secondaryMarkerHtml = vdfMap.template.secondary.marker({
                    country: feature.properties.sr_subunit,
                    link: feature.properties.href
                });

                return secondaryMarkerHtml;

            } else {
                return '';
            }
        },

        setClassName: function (feature) {
            if ( feature.properties.destination
                && feature.properties.destination === 'main') {
                return vdfMap.className.marker.main;
            } else if ( feature.properties.destination
                && feature.properties.destination === 'secondary') {
                return vdfMap.className.marker.secondary;
            }

            else {
                return vdfMap.className.marker.normal;
            }
        },

        drawMap: function(e) {

            gj.addData(this.getGeoJSON());

            this.eachLayer(function(marker) {
                var feature = marker.toGeoJSON();
                if (feature.properties.destination === 'main') {

                    //populates the mobile version
                    $(vdfMap.selector.list.main).append(vdfMap.template.main.listItem({
                        country: feature.properties.sr_subunit,
                        copy: feature.properties.content.copy,
                        link: feature.properties.content.href
                    }));

                    marker._icon.src = vdfMap.svg.dot;
                    marker._icon.class = vdfMap.className.pin.main;

                    marker.bindPopup(vdfMap.template.main.hover({
                        country: feature.properties.sr_subunit,
                        copy: feature.properties.content.copy,
                        link: feature.properties.content.href
                    }));

                } else if (feature.properties.destination === 'secondary'){

                    //populate the mobile version
                    $(vdfMap.selector.list.main).append(vdfMap.template.secondary.listItem({
                        country: feature.properties.sr_subunit,
                        link: feature.properties.content.href
                    }));

                    marker.bindPopup(vdfMap.template.secondary.hover({
                        country: feature.properties.sr_subunit,
                        link: feature.properties.href
                    }));

                    marker._icon.src = vdfMap.svg.dot;
                    marker._icon.class = vdfMap.className.pin.secondary;

                } else {
                    marker.setIcon(L.mapbox.marker.icon({}));
                    marker._icon.src = vdfMap.svg.empty;
                }
            });
        }
    };

    L.mapbox.accessToken = vdfMap.token;

    var southWest = L.latLng(-71.300, -165.937),
        northEast = L.latLng(82.118, 189.843),
        bounds = L.latLngBounds(southWest, northEast);

    var map = L.mapbox
            .map('map', 'mapbox.light',
                {
                    attributionControl: false,
                    minZoom: 4,
                    maxZoom: 7,
                    maxBounds: bounds,
                    style: vdfMap.style
                })
            .setView([44, 16], 5);

    var gj = L.geoJson(null, {
        pointToLayer: function(feature, ll) {
            return L.marker(ll, {
                icon: L.divIcon({
                    className: vdfMap.setClassName(feature),
                    html: vdfMap.setHtml(feature),
                    iconSize: [100, 40]
                })
            });
        }
    }).addTo(map);

    var mainMap = L.mapbox.featureLayer()
        .loadURL(vdfMap.url.destinations)
        .on('ready', vdfMap.drawMap).addTo(map);

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
    });

    mainMap.on('mouseout', function(e) {

        setTimeout(function() {
            e.layer.closePopup();
        }, 3000);
    });
    mainMap.on('click', function(e) {
        if (e.layer.feature.properties.content) {
        var link = e.layer.feature.properties.content.href;
            window.open(link, '_self');
        }
    });

    /**
     * Minimap
     */
    map.on('ready', function() {
        var minimap = L.mapbox.tileLayer('mapbox.light', {noWrap: false}, {minZoom: 0, maxZoom: 4, maxBounds: bounds}),
            miniCoverage =  L.mapbox.featureLayer().loadURL(vdfMap.url.coverage);

        layers = new L.LayerGroup([minimap, miniCoverage]);

        new L.Control.MiniMap(layers, {
            width: 300,
            position: 'topright',
            aimingRectOptions: {color: "#333333", weight: 3},
            shadowRectOptions: {color: "#c90000", weight: 1, opacity: 0, fillOpacity: 0},
            centerFixed: [40.7842, -73.9919]
        })
            .addTo(map);

        $('.' + vdfMap.className.marker.secondary).hide();

        setTimeout(function() {
            $(vdfMap.selector.marker.normal).remove();
        }, 300);
    });

    map.on('zoomend', function() {

        $(vdfMap.selector.popup).hide();

        if (map.getZoom() >= 5) {
            vdfMap.delayOpacity(vdfMap.selector.marker.main, 'fadeIn', 100);
        } else {
            vdfMap.delayOpacity(vdfMap.selector.marker.main, 'fadeOut', 100);
        }

        if (map.getZoom() >= 6) {
            vdfMap.delayOpacity(vdfMap.selector.marker.secondary, 'fadeIn', 100);
        } else {
            vdfMap.delayOpacity(vdfMap.selector.marker.secondary, 'fadeOut', 100);
        }
    });


    $(vdfMap.selector.marker.secondary).each(function(index) {
        $(this).delay(400*index).fadeIn(300);
    });


    $(vdfMap.selector.button).on('click', function(){
        map.setView([55, -8], 3);
    });

    L.mapbox.styleLayer(vdfMap.style).addTo(map);
    L.mapbox.featureLayer().loadURL(vdfMap.url.coverage).addTo(map);

})();

