// Add all scripts to the JS folder
var map
var geojson
var info = L.control();

//Function to instantiate the Leaflet map
function createMap(){
    map = L.map('map', {
        center: [44.563, -123.284],                 //center the map on Oregon State University
        zoom: 15
    });

//add the base tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/underjas/cm6zlihch00ef01sle41zhier/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
            minZoom: 14,
            maxZoom: 19,
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoidW5kZXJqYXMiLCJhIjoiY202eWpqa3AwMHcyZTJucHM2cDBwcnd0NCJ9.RNRXLOp7rDrsdW0qiOHUFw'
        }).addTo(map);

        //Call data function
        getZones();
        info.addTo(map);
}

//define the style for the Parking Zones
function style(feature) {
    return {
        fillColor: getColor(feature.properties.ZoneGroup),
        weight: 0,
        opacity: 1,
        fillOpacity: 0.8
    };
}

//apply custom colors to the parking lot zones
function getColor(ZoneGroup){
    const colors ={
        'A1': '#F26221', 'A2': '#F26221', 'A3': '#F26221',
        'B1': '#F68F58', 'B2': '#F68F58', 'B3': '#F68F58',
        'C': '#FABC95',
        'R': '#000000', 'RA': '#000000',
        'ShortTerm': '#DCB326',
        'ADA': '#005E8E'
    };
    return colors[ZoneGroup] || '#ffffff00';  
}

//add event listeners to each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

//highlight feature on mouse hover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#d73f09',
        dashArray: '',
        fillOpacity: 0.7
    })
    layer.bringToFront();
    info.update(layer.feature.properties);
}
//reset highlight on mouse exit
function resetHighlight(e) {
    if (geojson) {
        geojson.resetStyle(e.target);
    }
    info.update();
}

//zoom to feature on mouse click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

//custom control code
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); //create a div with a class of info
    this.update();
    return this._div;
};

//method to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4></h4>' + (props ?
        '<b>Zone: </b>' + props.ZoneGroup  /*'<br><b> Population:</b> ' + props.population.toLocaleString()*/
        : '<b>For info hover over<br>a parking zone</b>');
};

function getZones() {
    fetch("data/ParkingZones.geojson")
        .then(response => response.json())
        .then(data => {
            geojson = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

            //Filter labels per permit type
            const labeledZones = new Set(['R', 'RA', 'A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C']);
            let zoneLabels = [];

            // Function to toggle labels based on zoom level
            function updateLabels() {
                const zoomLevel = map.getZoom();
                if (zoomLevel >= 15) { // Show labels only when zoomed in to street level
                    zoneLabels.forEach(label => label.openTooltip());
                } else {
                    zoneLabels.forEach(label => label.closeTooltip());
                }
            }

            // Add labels to each polygon
            geojson.eachLayer(function(layer) {
                if (layer.feature.properties && labeledZones.has(layer.feature.properties.ZoneGroup)) {
                    let tooltip = layer.bindTooltip(layer.feature.properties.ZoneGroup, {
                        permanent: true,
                        direction: "center",
                        className: "zone-label"
                    });
                    
                    zoneLabels.push(tooltip);
                }
            });

            map.on('zoomend', updateLabels);

            updateLabels();

        })
        .catch(error => console.error('Error loading Parking data:', error));
}

//Initialize map
document.addEventListener('DOMContentLoaded', createMap);