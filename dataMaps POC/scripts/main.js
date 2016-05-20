(function(){

var defaults = defaults || {};
    var defaultOptions = {
        scope: 'world',
        responsive: false,
        aspectRatio: 0.5625,
        projection: 'equirectangular',
        dataType: 'json',
        data: {},
        done: function() {},
        fills: {
            defaultFill: '#ABDDA4'
        },
        filters: {},
        geographyConfig: {
            dataUrl: null,
            hideAntarctica: true,
            hideHawaiiAndAlaska : false,
            borderWidth: 1,
            borderOpacity: 1,
            borderColor: '#FDFDFD',
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
            },
            popupOnHover: true,
            highlightOnHover: true,
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1
        },
        projectionConfig: {
            rotation: [97, 0]
        },
        bubblesConfig: {
            borderWidth: 2,
            borderOpacity: 1,
            borderColor: '#FFFFFF',
            popupOnHover: true,
            radius: null,
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
            },
            fillOpacity: 0.75,
            animate: true,
            highlightOnHover: true,
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1,
            highlightFillOpacity: 0.85,
            exitDelay: 100,
            key: JSON.stringify
        },
        arcConfig: {
            strokeColor: '#DD1C77',
            strokeWidth: 1,
            arcSharpness: 1,
            animationSpeed: 600,
            popupOnHover: false,
            popupTemplate: function(geography, data) {
                // Case with latitude and longitude
                if ( ( data.origin && data.destination ) && data.origin.latitude && data.origin.longitude && data.destination.latitude && data.destination.longitude ) {
                    return '<div class="hoverinfo"><strong>Arc</strong><br>Origin: ' + JSON.stringify(data.origin) + '<br>Destination: ' + JSON.stringify(data.destination) + '</div>';
                }
                // Case with only country name
                else if ( data.origin && data.destination ) {
                    return '<div class="hoverinfo"><strong>Arc</strong><br>' + data.origin + ' -> ' + data.destination + '</div>';
                }
                // Missing information
                else {
                    return '';
                }
            }
        }
    };

    defaults = {
        selectors: {
            zoom: {
                button: '.zoom-button',
                info: '.zoom-info'
            },

            subunit: '.datamaps-subunit',
            map: '#main-map'
        },
        
        colors: {
            red: 'rgba(164, 19, 9, 0.8)',
            white: '#FFFFFF',
            lightGrey: '#D0D0D0',
            black: '#000000'
        },

        time: 40,
        animateOnce: true
    };

    function Zoom(args) {
        $.extend(this, {
            $buttons:   $(defaults.selectors.zoom.button),
            $info:      $(defaults.selectors.zoom.info),
            scale:      { max: 50, currentShift: 0 },
            $container: args.$container,
            datamap:    args.datamap
        });

        this.init();
    }

    Zoom.prototype.init = function() {
        var paths = this.datamap.svg.selectAll('path'),
            subunits = this.datamap.svg.selectAll(defaults.selectors.subunit),
            svg = d3.selectAll('.datamaps-subunits');

        // svg
        //     .insert('svg:image', ':first-child')
        //     .attr('xlink:href', '../images/test-map.jpg')
        //     .attr('class', 'map-terrain')
        //     .attr('x', 346)
        //     .attr('y', -50)
        //     .attr('width', 1257)
        //     .attr('height', 911);

        d3.selectAll('svg').attr('preserveAspectRatio', 'xMidYMid meet');


        // preserve stroke thickness
        paths.style('vector-effect', 'non-scaling-stroke');

        // disable click on drag end
        subunits.call(
            d3.behavior.drag().on('dragend', function() {
                d3.event.sourceEvent.stopPropagation();
            })
        );

        this.scale.set = this._getScalesArray();
        this.d3Zoom = d3.behavior.zoom().scaleExtent([ 1, this.scale.max ]);

        setTimeout(function () {

            d3.selectAll('.mainMarkers').style("visibility", 'hidden');
            d3.selectAll('.secondaryMarkers').style("visibility", 'hidden');
        }, 8);
        this._displayPercentage(1);
        this.listen();
    };

    Zoom.prototype.listen = function() {
        this.$buttons.off('click').on('click', this._handleClick.bind(this));

        this.datamap.svg
            .call(this.d3Zoom.on('zoom', this._handleScroll.bind(this)))
            .on('dblclick.zoom', null); // disable zoom on double-click

    };

    Zoom.prototype.reset = function() {
        this._shift('reset');
    };

    Zoom.prototype._toggleMainMarkers = function(scale) {

        var self = this;

        if (scale > 2 ) {
            d3.selectAll('.mainMarkers').style("visibility", "visible");
            self._animateMainMarkersIn(scale);
        } else {

            self._animateMainMarkersOut();
            setTimeout(function() {
                d3.selectAll('.mainMarkers').style("visibility", 'hidden');
            }, defaults.time);
        }
    };

    Zoom.prototype._toggleSecondaryMarkers = function(scale) {
        var self = this;

        if (scale > 3 ) {
            d3.selectAll('.secondaryMarkers').style("visibility", "visible");
            self._animateSecondaryMarkersIn();
        } else {
            self._animateSecondaryMarkersOut();
            setTimeout(function() {
                d3.selectAll('.secondaryMarkers').style("visibility", 'hidden');
            }, defaults.time);
        }
    };

    // if(datum.main) {
    //     var latLng;
    //     if (datumHasCoords(datum)) {
    //         latLng = self.latLngToXY(datum.latitude, datum.longitude);
    //     }
    //     else if (datum.centered) {
    //         latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
    //     }
    //     if (latLng) return latLng[0];
    // }
    //
    //
    // function datumHasCoords (datum) {
    //     return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    // }
    //
    //
    // Datamap.prototype.latLngToXY = function(lat, lng) {
    //     return this.projection([lng, lat]);
    // };

    Zoom.prototype._animateMainMarkersIn = function(scale) {

        var mainMarkers = d3.selectAll('.main-marker'),
            testMarkers = d3.select('.test-marker'),
            mainMarkersGroup = d3.selectAll('.mainMarkers'),
            mainMarkersText = d3.selectAll('.main-marker-text'),
            mainMarkersHeading = d3.selectAll('.main-marker-heading'),
            mainMarkersLink = d3.selectAll('.main-marker-link'),
            mainMarkersPin = d3.selectAll('.main-marker-pin');

        var delay = function(d, i) { return i * defaults.time; };

        //
        // testMarkers.transition()
        //     .duration(100*defaults.time)
        //     .attr('transform', 'scale(' + scale/1.5 + ')');


        mainMarkers.transition()
            .duration(defaults.time *1.2)
            .attr('r', function ( datum ) {
                return 23;
            })
            .attr('transform', 'translate( 0, ' + eval(0 - scale/1.5) +' )')

            .style('fill-opacity', 1)
            .ease('cube')
            .delay(delay);

        mainMarkersText.transition()
            .duration(1.2*defaults.time)
            .attr('transform', 'translate( 0, ' + eval(0 - scale/1.5) +' )')
            .style('font-size', function() {
                return 6 - 1/4*scale;
            })
            .style('fill-opacity', 1)
            .delay(delay);

        mainMarkersHeading.transition()
            .duration(1.2*defaults.time)
            .attr('transform', 'translate( 0, ' + eval(0 - scale/1.5) +' )')
            .style('font-size', function() {
                return 6 - 1/4*scale;
            })
            .style('fill-opacity', 1)
            .delay(delay);

        mainMarkersPin.transition()
            .duration(defaults.time)
            .style('opacity', 1)
            .ease('cubic')
            .delay(function(d, i) { return 2.5 * i * defaults.time; });

        mainMarkersLink.transition()
            .duration(defaults.time)
            .style('opacity', 1)
            .ease('cubic')
            .delay(function(d, i) { return 2.5 * i * defaults.time; });
    };

    Zoom.prototype._animateMainMarkersOut = function() {

        var mainMarkers = d3.selectAll('circle.main-marker'),
            mainMarkersText = d3.selectAll('.main-marker-text'),
            mainMarkersHeading = d3.selectAll('.main-marker-heading'),
            mainMarkersLink = d3.selectAll('.main-marker-link'),
            mainMarkersPin = d3.selectAll('.main-marker-pin');

        mainMarkers.transition()
            .duration(defaults.time)
            .style('fill-opacity', 0)
            .attr('r', function (datum) {
                return 2;
            })
            .transition();

        mainMarkersText.transition()
            .duration(defaults.time / 1.1)
            .style('fill-opacity', 0);

        mainMarkersHeading.transition()
            .duration(defaults.time / 1.1)
            .style('fill-opacity/1.1', 0);

        mainMarkersPin.transition()
            .duration(defaults.time)
            .style('opacity', 0);

        mainMarkersLink.transition()
            .duration(defaults.time)
            .style('opacity', 0);
    };

Zoom.prototype._animateSecondaryMarkersIn = function() {
    var secondaryMarkers = d3.selectAll('rect.secondary-marker');

    secondaryMarkers.transition()
        .duration(defaults.time)
        .style('fill-opacity', 1)
        .ease('cubic');
};

Zoom.prototype._animateSecondaryMarkersOut = function() {
    var secondaryMarkers = d3.selectAll('rect.secondary-marker');

    secondaryMarkers.transition()
        .duration(defaults.time)
        .style('fill-opacity', 0)
        .ease('cubic');
    
};

Zoom.prototype._handleScroll = function() {
    var translate = d3.event.translate,
        scale = d3.event.scale,
        limited = this._bound(translate, scale);

    this.scrolled = true;

    this._update(limited.translate, limited.scale);

    this._toggleMainMarkers(scale);
    this._toggleSecondaryMarkers(scale);
};

Zoom.prototype._handleClick = function(event) {
    var direction = $(event.target).data('zoom');

    this._shift(direction);
};

Zoom.prototype._shift = function(direction) {
    var center = [ this.$container.width() / 2, this.$container.height() / 2 ],
        translate = this.d3Zoom.translate(), translate0 = [], l = [],
        view = {
            x: translate[0],
            y: translate[1],
            k: this.d3Zoom.scale()
        }, bounded;

    translate0 = [
        (center[0] - view.x) / view.k,
        (center[1] - view.y) / view.k
    ];

    if (direction == 'reset') {
        view.k = 1;
        this.scrolled = true;
    } else {
        view.k = this._getNextScale(direction);
    }

    l = [ translate0[0] * view.k + view.x, translate0[1] * view.k + view.y ];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    bounded = this._bound([ view.x, view.y ], view.k);

    this._animate(bounded.translate, bounded.scale);
};

Zoom.prototype._bound = function(translate, scale) {
    var width = this.$container.width(),
        height = this.$container.height();

    translate[0] = Math.min(
        (width / height)  * (scale - 1),
        Math.max( width * (1 - scale), translate[0] )
    );

    translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

    return { translate: translate, scale: scale };
};

Zoom.prototype._update = function(translate, scale) {
    this.d3Zoom
        .translate(translate)
        .scale(scale);

    this.datamap.svg.selectAll(['.datamaps-subunits', '.bubbles', '.mainMarkers', '.secondaryMarkers'])
        .attr('transform', 'translate(' + translate + ')scale(' + scale + ')');

    this._displayPercentage(scale);
};

Zoom.prototype._animate = function(translate, scale) {
    var _this = this,
        d3Zoom = this.d3Zoom;

    d3.transition().duration(350).tween('zoom', function() {
        var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
            iScale = d3.interpolate(d3Zoom.scale(), scale);

        return function(t) {
            _this._update(iTranslate(t), iScale(t));
        };
    });
};

Zoom.prototype._displayPercentage = function(scale) {
    var value;

    value = Math.round(Math.log(scale) / Math.log(this.scale.max) * 100);
    this.$info.text(value + '%');
};

Zoom.prototype._getScalesArray = function() {
    var array = [],
        scaleMaxLog = Math.log(this.scale.max);

    for (var i = 0; i <= 10; i++) {
        array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
    }

    return array;
};

Zoom.prototype._getNextScale = function(direction) {
    var scaleSet = this.scale.set,
        currentScale = this.d3Zoom.scale(),
        lastShift = scaleSet.length - 1,
        shift, temp = [];

    if (this.scrolled) {

        for (shift = 0; shift <= lastShift; shift++) {
            temp.push(Math.abs(scaleSet[shift] - currentScale));
        }

        shift = temp.indexOf(Math.min.apply(null, temp));

        if (currentScale >= scaleSet[shift] && shift < lastShift) {
            shift++;
        }

        if (direction == 'out' && shift > 0) {
            shift--;
        }

        this.scrolled = false;

    } else {

        shift = this.scale.currentShift;

        if (direction == 'out') {
            shift > 0 && shift--;
        } else {
            shift < lastShift && shift++;
        }
    }

    this.scale.currentShift = shift;

    return scaleSet[shift];
};

function Datamap() {
    this.$container = $(defaults.selectors.map);
    this.instance = new Datamaps({
        scope: 'world',
        // addPlugin : function( name, pluginFn ) {
        //     var self = this;
        //     if ( typeof Datamap.prototype[name] === "undefined" ) {
        //         Datamap.prototype[name] = function(data, options, callback, createNewLayer) {
        //             var layer;
        //             if ( typeof createNewLayer === "undefined" ) {
        //                 createNewLayer = false;
        //             }
        //
        //             if ( typeof options === 'function' ) {
        //                 callback = options;
        //                 options = undefined;
        //             }
        //
        //             options = defaultOptions;
        //
        //             // Add a single layer, reuse the old layer
        //             if ( !createNewLayer && this.options[name + 'Layer'] ) {
        //                 layer = this.options[name + 'Layer'];
        //                 options = options || this.options[name + 'Options'];
        //             }
        //             else {
        //                 layer = this.addLayer(name);
        //                 this.options[name + 'Layer'] = layer;
        //                 this.options[name + 'Options'] = options;
        //             }
        //
        //             pluginFn.apply(this, [layer, data, options]);
        //             if ( callback ) {
        //                 callback(layer);
        //             }
        //         };
        //     }
        // },

        responsive: false,

        //set initial map here
        //TODO positioning relative to window coords
        setProjection: function(element) {
            var projection = d3.geo.mercator()
                .center([-10, 55])
                // .rotate([4.4, 0])
                .scale(650)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            var path = d3.geo.path()
                .projection(projection);

            return {path: path, projection: projection};
        },

        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false,
            borderColor: '#B1B8BD'
            // popupTemplate: function(geography, data) { //this function should just return a string
            //
            //     console.log('geography ', geography);
            //     return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
            // }
        },

        bubblesConfig: {
            borderWidth: 0,
            borderColor: defaults.colors.white,
            popupOnHover: true,
            radius: null,
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
            },
            fillOpacity: 1,
            fillColor: defaults.colors.black,
            animate: true,
            highlightOnHover: true,
            highlightFillColor: defaults.colors.white,
            highlightBorderColor: defaults.colors.white,
            highlightBorderWidth: 1,
            highlightBorderOpacity: 1,
            highlightFillOpacity: 0.85,
            exitDelay: 100,
            key: JSON.stringify
        },

        fills: {

            'ALA': defaults.colors.red,
            'ALB': defaults.colors.red,
            'AND': defaults.colors.red,
            'AUT': defaults.colors.red,
            'BLR': defaults.colors.red,
            'BEL': defaults.colors.red,
            'BIH': defaults.colors.red,
            'BGR': defaults.colors.red,
            'HRV': defaults.colors.red,
            'CYP': defaults.colors.red,
            'CZE': defaults.colors.red,
            'DNK': defaults.colors.red,
            'EST': defaults.colors.red,
            'FRO': defaults.colors.red,
            'FIN': defaults.colors.red,
            'FRA': defaults.colors.red,
            'DEU': defaults.colors.red,
            'GIB': defaults.colors.red,
            'GRC': defaults.colors.red,
            'HUN': defaults.colors.red,
            'ISL': defaults.colors.red,
            'IRL': defaults.colors.red,
            'ITA': defaults.colors.red,
            'LVA': defaults.colors.red,
            'LIE': defaults.colors.red,
            'LTU': defaults.colors.red,
            'LUX': defaults.colors.red,
            'MKD': defaults.colors.red,
            'MLT': defaults.colors.red,
            'MDA': defaults.colors.red,
            'MCO': defaults.colors.red,
            'NLD': defaults.colors.red,
            'NOR': defaults.colors.red,
            'POL': defaults.colors.red,
            'PRT': defaults.colors.red,
            'ROU': defaults.colors.red,
            'SMR': defaults.colors.red,
            'SRB': defaults.colors.red,
            'SVK': defaults.colors.red,
            'SVN': defaults.colors.red,
            'ESP': defaults.colors.red,
            'SWE': defaults.colors.red,
            'TUR': defaults.colors.red,
            'CHE': defaults.colors.red,
            'UKR': defaults.colors.red,
            'GBR': defaults.colors.red,
            'VAT': defaults.colors.red,
            'RSB': defaults.colors.red,
            'IMN': defaults.colors.red,
            'MNE': defaults.colors.red,
            'kosovo': defaults.colors.red,
            'GRL': defaults.colors.red,
            'black' : defaults.colors.black,
            defaultFill: defaults.colors.lightGrey
        },

        data: {
            'ALA': {fillKey: 'ALA'}, //?
            'ALB': {fillKey: 'ALB'}, //?
            'AND': {fillKey: 'AND'},
            'AUT': {fillKey: 'AUT'},
            'BLR': {fillKey: 'BLR'},
            'BEL': {fillKey: 'BEL'}, //?
            'BIH': {fillKey: 'BIH'},
            'BGR': {fillKey: 'BGR'},
            'HRV': {fillKey: 'HRV'},
            'CYP': {fillKey: 'CYP'},
            'CZE': {fillKey: 'CZE'},
            'DNK': {fillKey: 'DNK'},
            'EST': {fillKey: 'EST'},
            'FRO': {fillKey: 'FRO'},
            'FIN': {fillKey: 'FIN'},
            'FRA': {fillKey: 'FRA'},
            'DEU': {fillKey: 'DEU'},
            'GIB': {fillKey: 'GIB'},
            'GRC': {fillKey: 'GRC'},
            'HUN': {fillKey: 'HUN'},
            'ISL': {fillKey: 'ISL'},
            'IRL': {fillKey: 'IRL'},
            'ITA': {fillKey: 'ITA'},
            'LVA': {fillKey: 'LVA'},
            'LIE': {fillKey: 'LIE'},
            'LTU': {fillKey: 'LTU'},
            'LUX': {fillKey: 'LUX'},
            'MKD': {fillKey: 'MKD'},
            'MLT': {fillKey: 'MLT'},
            'MDA': {fillKey: 'MDA'},
            'MCO': {fillKey: 'MCO'},
            'NLD': {fillKey: 'NLD'},
            'NOR': {fillKey: 'NOR'},
            'POL': {fillKey: 'POL'},
            'PRT': {fillKey: 'PRT'},
            'ROU': {fillKey: 'ROU'},
            'SMR': {fillKey: 'SMR'},
            'SRB': {fillKey: 'SRB'},
            'SVK': {fillKey: 'SVK'},
            'SVN': {fillKey: 'SVN'},
            'ESP': {fillKey: 'ESP'},
            'SWE': {fillKey: 'SWE'},
            'TUR': {fillKey: 'SVN'},
            'CHE': {fillKey: 'CHE'},
            'UKR': {fillKey: 'UKR'},
            'GBR': {fillKey: 'GBR'},
            'VAT': {fillKey: 'VAT'},
            'RSB': {fillKey: 'RSB'},
            'IMN': {fillKey: 'IMN'},
            'MNE': {fillKey: 'MNE'},
            'kosovo': {fillKey: 'kosovo'},
            'GRL': {fillKey: 'GRL'}
        },

        // mainMarker: this._handleMainMarkers(),
        element: this.$container.get(0),
        projection: 'mercator',
        done: this._handleMapReady.bind(this)
    });
}

Datamap.prototype._handleMapReady = function(datamap) {
    this.zoom = new Zoom({
        $container: this.$container,
        datamap: datamap
    });
};

var redMap = new Datamap(),
    bubblesArr = [];


    function getBubbleData() {
        $.getJSON('scripts/dataMock.json', function(data) {
            bubblesArr.push(data);

            return bubblesArr;
        });
    }

    getBubbleData();

    var hardcodedData = [
        {
            name: 'United Kingdom',
            heading: 'Visit Britain`s sandy beaches',
            radius: 2,
            main: true,
            // centered: 'GBR',
            country: 'GBR',
            latitude: 53.007347,
            longitude: -1.274414,
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Spain',
            heading: 'Find the best Cava',
            radius: 2,
            main: false,
            centered: 'ESP',
            country: 'ESP',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Germany',
            heading: 'Break your speed record on the Autobahn',
            radius: 2,
            main: true,
            centered: 'DEU',
            country: 'DEU',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'France',
            heading: 'Have you seen the lavender fields?',
            radius: 2,
            main: true,
            centered: 'FRA',
            country: 'FRA',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Holland',
            heading: 'The trendiest places to visit in Amsterdam',
            radius: 2,
            main: true,
            centered: 'NLD',
            country: 'NLD',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Italy',
            heading: 'Why Florence is the new fashion capital',
            radius: 2,
            main: true,
            centered: 'ITA',
            country: 'ITA',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Croatia',
            heading: 'Undisclosed island idylls',
            radius: 2,
            main: true,
            centered: 'HRV',
            country: 'HRV',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Czech Republic',
            heading: 'Find Franz Kafka`s secrets',
            radius: 2,
            main: false,
            centered: 'CZE',
            country: 'CZE',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Austria',
            heading: 'soundtrack by Johan Strauss',
            radius: 2,
            main: false,
            centered: 'AUT',
            country: 'AUT',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Slovenia',
            heading: 'Lorem Ipsum sit dolor amnet',
            radius: 2,
            main: false,
            centered: 'SVN',
            country: 'SVN',
            fillKey: 'black',
            href: '#'
        },
        {
            name: 'Switzerland',
            heading: 'Lorem Ipsum sit dolor amnet',
            radius: 2,
            main: false,
            centered: 'CHE',
            country: 'CHE',
            fillKey: 'black',
            href: '#'
        }
    ];

    redMap.instance.bubbles(hardcodedData, {
        popupTemplate: function(geo, data) {
            return '<div class="hoverinfo main-info"> <div class="main-pin"></div>' + data.name + '</div>'
        }
    });

    redMap.instance.mainMarkers(hardcodedData);
    redMap.instance.secondaryMarkers(hardcodedData);

    window.addEventListener('resize', function() {
        redMap.instance.resize();
    });

})();
