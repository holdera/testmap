// klick systems const accessToken = 'pk.eyJ1Ijoia2xpY2tzeXN0ZW1zIiwiYSI6ImNrbjRwYmprczB4ZmoydnFzZDY2dGlodDEifQ.zIwAZmTub9D5ZfzHKjheAQ';
const accessToken = 'pk.eyJ1IjoiYWhvbGRlciIsImEiOiJja3BzcXBvMjgwcHdkMnBxdjYwdXpuZGllIn0.qqOJcH7DfLwwHbGht7-50Q';
const mapStyle = 'mapbox://styles/aholder/cl0wfqtt2000814n5c4yn281e';
const mapboxStateData = './us_states.json';

mapboxgl.accessToken = accessToken;

var hoveredStateId = null;
var activeStateId = null;

var map = new mapboxgl.Map({
    container: 'map',
    style: mapStyle,
    center: [-100.30, 12.26],
    zoom: 4,
});

map.scrollZoom.disable();
map.trackResize;

function resizeMap() {
    if (window.innerWidth <= 767) {
        document.getElementById('map').style.height = '655px';
    } else {
        document.getElementById('map').style.height = '1090px';
    }
}

resizeMap();

window.addEventListener('resize', () => {
    resizeMap();
})

map.on('load', function () {
  
    let center;

    center = [-95, 35]

    map.setCenter(center)
    map.setZoom(3.1)


    map.addSource('states', {
        'type': 'geojson',
        'data':  mapboxStateData
    });

    var layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }


    var maxBounds = map.getBounds();
    map.addLayer({
        'id': 'state-fills',
        'type': 'fill',
        'source': 'states',
        'layout': {},
        'paint': {
            'fill-color': [
                'case',
                ['boolean', ['feature-state', 'clicked'], false],
                '#c0d6ea', // if selected true, paint in blue
                '#eaecef', // else paint in gray,
            ],
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.4,
                1,
            ]
        }
    }, firstSymbolId);





    map.addLayer({
        'id': 'state-borders',
        'type': 'line',
        'source': 'states',
        'layout': {},
        'paint': {
            'line-color': '#fff',
            'line-width': 3
        }
    });

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'state-fills', function (e) {
        map.getCanvas().style.cursor = 'pointer';

        if (e.features.length > 0) {
            if (hoveredStateId) {
                map.setFeatureState({
                    source: 'states',
                    id: hoveredStateId
                }, {
                    hover: false
                });
            }

            hoveredStateId = e.features[0].id;
            if (hoveredStateId && hoveredStateId !== activeStateId) {
                map.setFeatureState({
                    source: 'states',
                    id: hoveredStateId
                }, {
                    hover: true
                });
            }

        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'state-fills', function () {
        map.getCanvas().style.cursor = '';

        if (hoveredStateId) {
            map.setFeatureState({
                source: 'states',
                id: hoveredStateId
            }, {
                hover: false
            });
        }
    });

    // a11y keyboard
    // pixels the map pans when the up or down arrow is clicked
    var deltaDistance = 100;

    // degrees the map rotates when the left or right arrow is clicked
    var deltaDegrees = 25;

    function easing(t) {
        return t * (2 - t);
    }


    map.getCanvas().addEventListener( 'keydown',function (e) {
        e.preventDefault();
            if (e.which === 38) {
                // up
                map.panBy([0, -deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 40) {
                // down
                map.panBy([0, deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 37) {
                // left
                map.easeTo({
                    bearing: map.getBearing() - deltaDegrees,
                    easing: easing
                });
            } else if (e.which === 39) {
                // right
                map.easeTo({
                    bearing: map.getBearing() + deltaDegrees,
                    easing: easing
                });
            } else if (e.which === 9 ) {
                document.activeElement.blur();
                map.keyboard.enable();
            }
        },
        true
    );


    map.on('click', function (e) {
        //if a user clicks on a state it would put the info panel on focus
        document.querySelector('.map-info-box__wrapper').focus();

    });



    //  // When a click event occurs on a feature in the states layer, open a popup at the
    //  // location of the click, with description HTML from its properties.
    map.on('click', 'state-fills', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('<strong>' + e.features[0].properties.STATE_NAME + '</strong>')
            .addTo(map);

        if ( dataReturned != false ){
            // stateName.innerText = e.features[0].properties.STATE_NAME;
        }

        if (activeStateId) {
            map.setFeatureState({
                source: 'states',
                id: activeStateId
            }, {
                clicked: false
            });

        }
        map.removeFeatureState({
            source: 'states'
        });

        function gtmMapInteraction() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'Map Interaction',
                'eventCategory': 'Rate Finder',
                'eventAction': 'Map Click',
                'eventLabel': activeStateName.STATE_NAME
            });
        }

        activeStateId = e.features[0].id;
        let activeStateName = e.features[0].properties;

        if (activeStateId) {
            map.setFeatureState({
                source: 'states',
                id: activeStateId
            }, {
                clicked: true
            });
    }


       
    });



    //submit function
    const zipValue = document.querySelector('input#zipState');
    const pattern = /^[a-zA-Z0-9_.-]*$/;

    function setMapContent(inputVal, elmUsData) {
        document.querySelector('.form-error').style.display = 'none';
        if (inputVal != 'undefined' || inputVal != '') {
            let stateNameUs = stateName.innerText;
            if (!elmUsData.state_name) {
                stateNameUs = 'USA';
            } else {
                if ( window.location.href.indexOf('zip_code') > -1 ) {
                    setTimeout( () => {
                        stateName.classList.add('location-details');
                        userZip.style.display = 'block';
                        stateName.innerText = elmUsData.county_name;
                        userZip.innerText = elmUsData.state_name + '/'+ elmUsData.zip_code ;
                    }, 100);
                } else {
                    if ( stateName.matches('.location-details')) {
                        stateName.classList.remove('location-details');
                        userZip.style.display = 'none';
                    }
                    stateName.innerText = elmUsData.state_name;
                }

            }


            map.flyTo({
                center: elmUsData.state_center
            });

            map.removeFeatureState({
                source: 'states'
            });

            if (document.querySelector('.mapboxgl-popup')) {
                document.querySelector('.mapboxgl-popup').remove();
                map.setFeatureState({
                    source: 'states',
                    id: elmUsData.state_id
                }, { clicked: true });

            } else {
                map.setFeatureState({
                    source: 'states',
                    id: elmUsData.state_id
                }, { clicked: true });
            }

            if ( window.location.href.indexOf('zip_code') > -1 )  {
                new mapboxgl.Popup()
                .setLngLat(elmUsData.state_center)
                .setHTML('<strong>' + elmUsData.state_name  + '<br>' + elmUsData.zip_code + '</strong>')
                .addTo(map);
            } else {
                new mapboxgl.Popup()
                .setLngLat(elmUsData.state_center)
                .setHTML('<strong>' + elmUsData.state_name  + '</strong>')
                .addTo(map);
            }

            //add comas to numbers in data panel
            function addCommas(num) {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }


         

          
        }
        document.querySelector('.map-info-box__wrapper').focus();
    } // end of setMapContent


    document.querySelector('a.mapboxgl-ctrl-logo').setAttribute('tabindex', '-1');
    document.querySelectorAll('.mapboxgl-ctrl-attrib-inner a').forEach( mapLink => {
        mapLink.setAttribute('tabindex', '-1');
    });

});