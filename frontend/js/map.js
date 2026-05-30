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

function createMarkerIcon(level) {
  const colors = { normal: '#00c9a7', medium: '#ffd166', danger: '#ff4d6d' };
  const c = colors[level] || '#9aa0b4';
  const html = `
    <div style="
      width:28px;height:28px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);
      border:2.5px solid ${c};background:${c}22;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px ${c}44;
    ">
      <div style="width:8px;height:8px;border-radius:50%;background:${c};transform:rotate(45deg);"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30] });
}

function renderMarkers(diseases) {
  markerLayer.clearLayers();
  allMarkers = [];

  diseases.forEach(d => {
    const icon = createMarkerIcon(d.level);
    const marker = L.marker([d.lat, d.lng], { icon })
      .bindPopup(buildPopup(d), { maxWidth: 260, className: 'epi-popup-wrap' });

    marker._diseaseData = d;
    markerLayer.addLayer(marker);
    allMarkers.push(marker);
  });
}

document.addEventListener('DOMContentLoaded', initMap);