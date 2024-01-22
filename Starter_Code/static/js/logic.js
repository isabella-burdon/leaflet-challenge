// initialise the query URL
// this API contains data from all earthquakes in the last 30 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// get data from the API/URL
d3.json(queryUrl).then(function (data) {
  // send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 3, // radius determined by magnitude of earthquake
        fillColor: getDepthColor(feature.geometry.coordinates[2]), // colour determined by depth of earthquake
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8 // translucent so can see overlapping data
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p><p>${new Date(feature.properties.time)}</p>`);
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function getDepthColor(depth) {
  // Set colours for depth of earthquake
  return depth > 300 ? "#800026" :
         depth > 100 ? "#BD0026" :
         depth > 50  ? "#E31A1C" :
         depth > 20  ? "#FC4E2A" :
                       "#FD8D3C";
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let map = L.map("map", {
      center: [2, 20], //centre map in middle of Africa
      zoom: 1.5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control. Pass it our baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
  
    // Initialise legend
    let legend = L.control({ position: 'bottomright' });
  
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend'),
          depths = [0, 20, 50, 100, 300],
          depthColors = [
            "#FD8D3C", // Depth 0-20
            "#FC4E2A", // Depth 20-50
            "#E31A1C", // Depth 50-100
            "#BD0026", // Depth 100-300
            "#800026"  // Depth 300+
          ];
  
      // Add example boxes of depth colors
      div.innerHTML += '<br><h4>Depth Legend</h4>';
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + depthColors[i] + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
  
      // White background for the legend to stand out
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
  
      return div;
    };
  
    legend.addTo(map);
  }