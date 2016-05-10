(function(){
function Zoom(args) {
    $.extend(this, {
        $buttons:   $('.zoom-button'),
        $info:      $('.zoom-info'),
        scale:      { max: 50, currentShift: 0 },
        $container: args.$container,
        datamap:    args.datamap
    });

    this.init();
}

Zoom.prototype.init = function() {
    var paths = this.datamap.svg.selectAll('path'),
        subunits = this.datamap.svg.selectAll('.datamaps-subunit');

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

Zoom.prototype._handleScroll = function() {
    var translate = d3.event.translate,
        scale = d3.event.scale,
        limited = this._bound(translate, scale);

    this.scrolled = true;

    this._update(limited.translate, limited.scale);
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

    this.datamap.svg.selectAll('g')
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
    this.$container = $('#container');
    this.instance = new Datamaps({
        scope: 'world',
        responsive: false, 

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
            borderColor: '#FFFFFF',
            popupOnHover: true,
            radius: null,
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
            },
            fillOpacity: 1,
            fillColor: '#000000',
            animate: true,
            highlightOnHover: true,
            highlightFillColor: '#FFFFFF',
            highlightBorderColor: '#FFFFFF',
            highlightBorderWidth: 1,
            highlightBorderOpacity: 1,
            highlightFillOpacity: 0.85,
            exitDelay: 100,
            key: JSON.stringify
        },

        fills: {

            'ALA': '#BB190D',
            'ALB': '#BB190D',
            'AND': '#BB190D',
            'AUT': '#BB190D',
            'BLR': '#BB190D',
            'BEL': '#BB190D',
            'BIH': '#BB190D',
            'BGR': '#BB190D',
            'HRV': '#BB190D',
            'CYP': '#BB190D',
            'CZE': '#BB190D',
            'DNK': '#BB190D',
            'EST': '#BB190D',
            'FRO': '#BB190D',
            'FIN': '#BB190D',
            'FRA': '#BB190D',
            'DEU': '#BB190D',
            'GIB': '#BB190D',
            'GRC': '#BB190D',
            'HUN': '#BB190D',
            'ISL': '#BB190D',
            'IRL': '#BB190D',
            'ITA': '#BB190D',
            'LVA': '#BB190D',
            'LIE': '#BB190D',
            'LTU': '#BB190D',
            'LUX': '#BB190D',
            'MKD': '#BB190D',
            'MLT': '#BB190D',
            'MDA': '#BB190D',
            'MCO': '#BB190D',
            'NLD': '#BB190D',
            'NOR': '#BB190D',
            'POL': '#BB190D',
            'PRT': '#BB190D',
            'ROU': '#BB190D',
            'SMR': '#BB190D',
            'SRB': '#BB190D',
            'SVK': '#BB190D',
            'SVN': '#BB190D',
            'ESP': '#BB190D',
            'SWE': '#BB190D',
            'CHE': '#BB190D',
            'UKR': '#BB190D',
            'GBR': '#BB190D',
            'VAT': '#BB190D',
            'RSB': '#BB190D',
            'IMN': '#BB190D',
            'MNE': '#BB190D',
            'kosovo': '#BB190D',
            'GRL': '#BB190D',
            'black' : '#000000',
            defaultFill: '#D0D0D0'
        },

        data: {
            'ALA': {fillKey: 'ALA'},
            'ALB': {fillKey: 'ALB'},
            'AND': {fillKey: 'AND'},
            'AUT': {fillKey: 'AUT'},
            'BLR': {fillKey: 'BLR'},
            'BEL': {fillKey: 'BEL'},
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
            console.log(bubblesArr);

            return bubblesArr;
        });
    }

    getBubbleData();

    console.log('the bubble: ', getBubbleData() );


    var hardcodedData = [
        {
            name: 'Vodafone in the UK',
            radius: 2,
            centered: 'GBR',
            country: 'GBR',
            fillKey: 'black'
        },
        {
            name: 'The rain in Spain stays mainly on the Plane',
            radius: 2,
            centered: 'ESP',
            country: 'ESP',
            fillKey: 'black'
        },
        {
            name: 'Sprechen sie Deutch?',
            radius: 2,
            centered: 'DEU',
            country: 'DEU',
            fillKey: 'black'
        },
        {
            name: 'Parlez vous Francais?',
            radius: 2,
            centered: 'FRA',
            country: 'FRA',
            fillKey: 'black'
        }
    ];

    //TODO center if no coordinates

    redMap.instance.bubbles(hardcodedData, {
        popupTemplate: function(geo, data) {
            return '<div class="hoverinfo main-info">' + data.name + '</div>'
        }
    }
    );

    window.addEventListener('resize', function() {

        console.log('resize ', redMap.instance.resize);
        redMap.instance.resize();
    });

})();
