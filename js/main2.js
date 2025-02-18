// Add all scripts to the JS folder
var map;
var geojson;
var info = L.control();

// Function to instantiate the Leaflet map
function createMap() {
    map = L.map('map', {
        center: [44.563, -123.284], // Center the map on Oregon State University
        zoom: 15
    });

    // Add the base tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/underjas/cm6zlihch00ef01sle41zhier/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 14,
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoidW5kZXJqYXMiLCJhIjoiY202eWpqa3AwMHcyZTJucHM2cDBwcnd0NCJ9.RNRXLOp7rDrsdW0qiOHUFw'
    }).addTo(map);

    // Call data function
    getZones();
    addLegend();
}

// Define the style for the Parking Zones
function style(feature) {
    return {
        fillColor: getColor(feature.properties.ZoneGroup),
        weight: 0,
        opacity: 1,
        fillOpacity: 1
    };
}

function getColor(ZoneGroup) {
    const colors = {
        'A1': '#F26221', 'A2': '#F26221', 'A3': '#F26221',
        'B1': '#F68F58', 'B2': '#F68F58', 'B3': '#F68F58',
        'C': '#FABC95',
        'R': '#000000', 'RA': '#000000',
        'ShortTerm': '#DCB326',
        'ADA': '#005E8E'
    };
    return colors[ZoneGroup] || '#ffffff00';
}

// Add event listeners to each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: showPopup,
        mouseout: closePopup,
        click: zoomToFeature
    });
}

// Show popup on hover
function showPopup(e) {
    var layer = e.target;
    var popupContent = `<b>Zone:</b> ${layer.feature.properties.ZoneGroup} <br> 
                        <b>Lot:</b> ${layer.feature.properties.AiM_Desc}`;

    layer.bindPopup(popupContent).openPopup();
    layer.setStyle({
        weight: 3,
        color: '#d73f09',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

// Close popup on mouseout
function closePopup(e) {
    var layer = e.target;
    layer.closePopup();
    geojson.resetStyle(layer);
}

// Zoom to feature on mouse click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Fetch parking zone data
function getZones() {
    fetch("data/ParkingZones.geojson")
        .then(response => response.json())
        .then(data => {
            geojson = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
        .catch(error => console.error('Error loading Parking data:', error));
}

// Create legend
function addLegend() {
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var categories = {
            'Zone A': '#F26221',
            'Zone B': '#F68F58',
            'Zone C': '#FABC95',
            'Residential Zone': '#000000',
            'Hourly (metered)': '#DCB326',
            'ADA': '#005E8E'
        };

        div.innerHTML = '<strong>Parking Zones</strong><br>';
        for (var category in categories) {
            div.innerHTML += `<div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <i style="background:${categories[category]}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>
                                <span>${category}</span>
                              </div>`;
        }
        return div;
    };

    legend.addTo(map);
}

// Initialize map
document.addEventListener('DOMContentLoaded', createMap);
