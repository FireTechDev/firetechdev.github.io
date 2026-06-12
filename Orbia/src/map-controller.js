let map = null;
let markersLayer = null;
let currentContainer = null;

function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    markersLayer = null;
    currentContainer = null;
  }
}

function ensureMap(container) {
  if (!window.L) {
    return null;
  }

  if (map && currentContainer !== container) {
    destroyMap();
  }

  if (!map) {
    map = window.L.map(container, {
      zoomControl: false,
      attributionControl: false
    });
    markersLayer = window.L.layerGroup().addTo(map);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18
    }).addTo(map);

    window.L.control
      .zoom({
        position: "bottomright"
      })
      .addTo(map);

    currentContainer = container;
  }

  return map;
}

export function syncInterventionsMap(root, state) {
  const container = root.querySelector("[data-map-root]");

  if (!container) {
    destroyMap();
    return;
  }

  const leafMap = ensureMap(container);

  if (!leafMap || !markersLayer) {
    container.innerHTML = '<p class="map-fallback">Carte indisponible.</p>';
    return;
  }

  markersLayer.clearLayers();
  const incidents = (state.interventions?.incidents || []).filter((incident) => incident.gps);

  if (!incidents.length) {
    leafMap.setView([43.405086, 1.709438], 10);
    return;
  }

  const bounds = [];

  for (const incident of incidents) {
    const { lat, lng } = incident.gps;
    const centers = incident.centers?.length ? incident.centers.join(" · ") : "Centre non precise";
    const vehicles = incident.vehicleTypes?.length
      ? incident.vehicleTypes.join(" · ")
      : `${incident.vehicleCount} engin(s)`;
    const marker = window.L.circleMarker([lat, lng], {
      radius: 8,
      color: incident.color,
      weight: 2,
      fillColor: incident.color,
      fillOpacity: 0.78
    });

    marker.bindPopup(`
      <strong>${incident.title}</strong><br />
      ${incident.city}<br />
      ${incident.firefighterCount} pompier(s) · ${incident.vehicleCount} engin(s)<br />
      CS : ${centers}<br />
      Engins : ${vehicles}
    `);

    marker.addTo(markersLayer);
    bounds.push([lat, lng]);
  }

  if (bounds.length === 1) {
    leafMap.setView(bounds[0], 11);
  } else {
    leafMap.fitBounds(bounds, {
      padding: [24, 24]
    });
  }
}
