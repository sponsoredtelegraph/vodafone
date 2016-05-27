# Main Map

Main map is built on [mapbox.js](https://www.mapbox.com/mapbox.js/api/v2.4.0/)
and is using [underscore.js](http://underscorejs.org/#template) for templating the marker's mark-up

# Data

Destinations
Adding a new destination can be don through destinations.geo.json There are two types of destinations: main and secondary. They can be flagged as follows:

```js

    //...

    {
        "type": "Feature",
        "properties": {
            "sr_subunit": "Holland", //country name
            "sr_brk_a3": "NLX",
            "sr_adm0_a3": "NLD", // ISO3 Country code
            "scalerank": 0,
            "destination": "main", // this flag will render a main marker
            "content" : {
                "copy": "An art lover`s dream",  // Article Title
                "href": "http://www.telegraph.co // Link.uk/travel/untapped-destinations/holland-for-art-lovers/?WT.mc_id=tmgspk_beeos_1375_AmBBkg0lQym3&utm_source=tmgspk&utm_medium=beeos&utm_content=1375&utm_campaign=tmgspk_beeos_1375_AmBBkg0lQym3"
            }
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.4762915,
                53.1357115
            ]
        }
    },
    
    //...

     {
        "type": "Feature",
        "properties": {
            "sr_subunit": "Monaco",
            "sr_brk_a3": "MCO",
            "sr_adm0_a3": "MCO",
            "scalerank": 0,
            "destination": "secondary", // this flag will render a secondary marker
            "content" : {
                "copy": "Lorem Ipsum",
                "href": "http://www.telegraph.co.uk/travel/untapped-destinations/monaco-in-style/?WT.mc_id=tmgspk_beeos_1375_AmBCHrjL5ZFM&utm_source=tmgspk&utm_medium=beeos&utm_content=1375&utm_campaign=tmgspk_beeos_1375_AmBCHrjL5ZFM"
            }
    
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                7.398448957853304,
                43.74614075179443
            ]
        }
    },

```

Red coverage layer comes from data/coverage.geo.json - if new areas need to be displayed on the map here's where they can be added to.  


