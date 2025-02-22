let map;
let geojson;


// Parking Zone Colors Mapping
const zoneColors = {
    'A1': '#F26221', 'A2': '#F26221', 'A3': '#F26221',
    'B1': '#F68F58', 'B2': '#F68F58', 'B3': '#F68F58',
    'C': '#FABC95',
    'R': '#000000', 'RA': '#000000',
    'ShortTerm': '#DCB326',
    'ADA': '#005E8E',
    'NonPublic': '#feedde'
};

// Initialize Leaflet Map
function createMap() {
    var map = L.map('map', {
        center: [44.563, -123.284], // OSU Location
        zoom: 15
    });

    // Base Tile Layer (Use a secure way to handle API keys)
    L.tileLayer('https://api.mapbox.com/styles/v1/underjas/cm6zlihch00ef01sle41zhier/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 14,
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoidW5kZXJqYXMiLCJhIjoiY202eWpqa3AwMHcyZTJucHM2cDBwcnd0NCJ9.RNRXLOp7rDrsdW0qiOHUFw'
    }).addTo(map);

    // Load Data and Add Legend
    fetchParkingZones();
    addLegend();
}

function createCanvasPattern() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 10;
    canvas.height = 10;

    // Draw a simple striped pattern as an example
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 10, 5); // Black top half
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 5, 10, 5); // White bottom half

    return ctx.createPattern(canvas, 'repeat');
}

function style(feature) {
    let zoneGroup = feature.properties.ZoneGroup;

    if (zoneGroup === "NonPublic") {
        return {
            fillPattern: createCanvasPattern(),
            weight: 1,
            color: '#feedde',
            fillOpacity: 1
        };
    }

    return {
        fillColor: getColor(zoneGroup),
        weight: 0,
        opacity: 1,
        fillOpacity: 1
    };
}

// Style Parking Zones
/*function style(feature) {
    let zoneGroup = feature.properties.ZoneGroup;

    if (zoneGroup === "NonPublic") {
        let pattern = new L.FillPattern({
            weight: 2,
            spaceWeight: 6,
            color: '#feedde',
            opacity: 1,
            angle: 45
        });

        pattern.addTo(map);

        return {
            fillPattern: pattern,
            weight: 1,
            color: '#feedde',
            fillOpacity: 1
        };
    }

    return {
        fillColor: getColor(zoneGroup),
        weight: 0,
        opacity: 1,
        fillOpacity: 1
    };
}*/


function getColor(zoneGroup) {
    return zoneColors[zoneGroup] || '#ffffff00'; // Default transparent
}

// Interactive Features
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: showPopup,
        mouseout: closePopup,
        click: zoomToFeature
    });
}

function showPopup(e) {
    let layer = e.target;
    let { ZoneGroup, AiM_Desc } = layer.feature.properties;
    let popupContent = `<b>Zone:</b> ${ZoneGroup} <br> <b>Lot:</b> ${AiM_Desc}`;

    layer.bindPopup(popupContent).openPopup();
    layer.setStyle({
        weight: 3,
        color: '#d73f09',
        fillOpacity: 0.7
    }).bringToFront();
}

function closePopup(e) {
    let layer = e.target;
    layer.closePopup();
    geojson.resetStyle(layer);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Fetch GeoJSON Data
async function fetchParkingZones() {
    try {
        let response = await fetch("data/ParkingZones.geojson");
        if (!response.ok) throw new Error("Failed to load parking zones");

        let data = await response.json();
        geojson = L.geoJSON(data, { style, onEachFeature }).addTo(map);
    } catch (error) {
        console.error('Error loading Parking data:', error);
        alert("Failed to load parking data. Please try again later.");
    }
}

// Add Map Legend
function addLegend() {
    let legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let categories = {
            'Zone A': '#F26221',
            'Zone B': '#F68F58',
            'Zone C': '#FABC95',
            'Residential Zone': '#000000',
            'Hourly (metered)': '#DCB326',
            'ADA': '#005E8E',
            'Official Use Only': '#feedde'
        };

        div.innerHTML = '<strong>Parking Zones</strong><br>';
        for (let [label, color] of Object.entries(categories)) {
            div.innerHTML += `<div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <i style="background:${color}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>
                                <span>${label}</span>
                              </div>`;
        }
        return div;
    };

    legend.addTo(map);
}
console.log(L);
console.log(L.Pattern.Fill);
console.log(L.FillPattern);
//console.log(L.StripePattern);

// Initialize the map on DOM ready
document.addEventListener('DOMContentLoaded', createMap);
