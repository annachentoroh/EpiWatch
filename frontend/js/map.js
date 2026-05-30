let epiMap = null;
let markerLayer = null;

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const loading = document.getElementById('mapLoading');

  epiMap = L.map('map', {
    center: [20, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd'
  }).addTo(epiMap);

  if (loading) loading.style.display = 'none';

  markerLayer = L.layerGroup().addTo(epiMap);
  const diseases = EpiWatch.getDiseases();
  renderMarkers(diseases);
  updateMapStats(diseases);
}

document.addEventListener('DOMContentLoaded', initMap);