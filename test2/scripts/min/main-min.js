!function(){L.mapbox.accessToken="pk.eyJ1IjoieW96em8iLCJhIjoiY2lvYTdtOTR5MDA4bHc2bHkzdGV4a2UyciJ9.L3YfGHN-2yVbpjQPvdrY7Q";var o=L.mapbox.map("map","mapbox.light",{attributionControl:!1,zoomControl:!1,minZoom:3,maxZoom:8}).setView([44,16],5);L.control.zoomslider().addTo(o);var e=L.geoJson(null,{pointToLayer:function(o,e){function n(o){if(o.properties.destination&&"main"===o.properties.destination&&o.properties.content){var e='<div class="marker-main"><span class="main-pin">&nbsp;</span><span class="main-subunit">'+o.properties.sr_subunit+'</span><p class="main-copy">'+o.properties.content.copy+'</p><a class="main-href" href="'+o.properties.content.href+'">&nbsp</a>';return e}if(o.properties.destination&&"secondary"===o.properties.destination&&o.properties.content){var n='<div class="marker-secondary"><span class="secondary-subunit">'+o.properties.sr_subunit+'</span><p class="secondary-copy">'+o.properties.content.copy+'</p><a class="secondary-href" href="'+o.properties.content.href+'">&nbsp</a>',a='<div class="leaflet-popup  leaflet-zoom-animated"><div class="leaflet-popup-content-wrapper"><div class="leaflet-popup-content"><span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>'+o.properties.sr_subunit+'</div></div><div class="leaflet-popup-tip-container"><div class="leaflet-popup-tip"></div></div></div>';return a}return""}function a(){return o.properties.destination&&"main"===o.properties.destination?"vdf-marker-main":o.properties.destination&&"secondary"===o.properties.destination?"vdf-marker-secondary":"vdf-marker"}return L.marker(e,{icon:L.divIcon({className:a(o),html:n(o),iconSize:[100,40]})})}}).addTo(o),n=L.mapbox.featureLayer().loadURL("data/destinations.geojson").on("ready",function(o){e.addData(this.getGeoJSON()),this.eachLayer(function(o){"main"===o.toGeoJSON().properties.destination?(o._icon.src="images/dot.svg",o._icon["class"]="main-marker-pin"):"secondary"===o.toGeoJSON().properties.destination?(o.setIcon(L.mapbox.marker.icon({"marker-color":"#88ff88","marker-size":"large"})),o._icon.src="images/dot.svg"):(o.setIcon(L.mapbox.marker.icon({})),o._icon.src="images/dot.svg"),o.bindPopup('<span class="content-heading">&nbsp;&nbsp;A guide to&nbsp;&nbsp;</span>'+o.toGeoJSON().properties.sr_subunit)})}).addTo(o);n.on("mouseover",function(e){var n=e.layer.feature.properties.destination;n||e.layer.openPopup(),o.getZoom()<5&&"main"===n&&e.layer.openPopup(),o.getZoom()<6&&"secondary"===n&&e.layer.openPopup()}),n.on("mouseout",function(e){var n=e.layer.feature.properties.destination;n||e.layer.closePopup(),o.getZoom()<5&&"main"===n&&e.layer.closePopup(),o.getZoom()<6&&"secondary"===n&&e.layer.closePopup()}),n.on("click",function(o){if(o.layer.feature.properties.content){var e=o.layer.feature.properties.content.href;window.open(e)}}),o.on("ready",function(){var e=L.mapbox.tileLayer("mapbox.light"),n=omnivore.topojson("data/vodafoneCoverageTopoJson.json");layers=new L.LayerGroup([e,n]),new L.Control.MiniMap(layers,{width:250,aimingRectOptions:{color:"#333333",weight:3},shadowRectOptions:{color:"#c90000",weight:1,opacity:0,fillOpacity:0}}).addTo(o),$(".vdf-marker-secondary").hide(),setTimeout(function(){console.log("ready"),$(".vdf-marker").remove()},300)}),o.on("zoomend",function(){o.getZoom()>=5?$(".vdf-marker-main").show("slow"):$(".vdf-marker-main").hide("slow"),o.getZoom()>=6?$(".vdf-marker-secondary").show("slow"):$(".vdf-marker-secondary").hide("slow")}),$(".roaming__coverage").on("click",function(){o.setView([55,-8],3)}),L.mapbox.styleLayer("mapbox://styles/yozzo/cioei8vzc002yczmamm4yefeb").addTo(o);var a=omnivore.topojson("data/VodafoneCoverageTopoJson.json").addTo(o)}();