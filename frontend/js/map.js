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
  detectUserRegion();
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

function buildPopup(d) {
  const dateStr = new Date(d.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const riskPct = Math.round((d.deaths / d.cases) * 100);

  return `
    <div class="epi-popup">
      <h3>${d.name}</h3>
      <div class="meta">${dateStr} — ${d.country}</div>
      <div class="row"><label>Сума випадків:</label><span>${d.cases.toLocaleString('uk-UA')}</span></div>
      <div class="row"><label>Ризик захворення:</label><span>${riskPct}%</span></div>
      <div class="advice">${d.prevention[0]}</div>
      <button class="detail-btn" onclick="window.location.href='disease-detail.html?id=${d.id}'">Детальніше</button>
    </div>`;
}

function updateMapStats(diseases) {
  const totalCases = diseases.reduce((s, d) => s + d.cases, 0);
  const countries = [...new Set(diseases.map(d => d.country))].length;
  const outbreaks = diseases.length;

  const el = id => document.getElementById(id);
  if (el('statOutbreaks')) el('statOutbreaks').textContent = outbreaks;
  if (el('statCountries')) el('statCountries').textContent = countries + '+';
  if (el('statCases')) el('statCases').textContent = EpiWatch.formatNumber(totalCases);
}

// Filter logic
function applyMapFilters() {
  const country  = document.getElementById('filterCountry')?.value  || '';
  const pathType = document.getElementById('filterType')?.value     || '';
  const pathogen = document.getElementById('filterPathogen')?.value || '';
  const symptom  = document.getElementById('filterSymptom')?.value  || '';
  const view     = document.getElementById('viewToggle')?.dataset.view || 'world';

  let filtered = EpiWatch.getDiseases();

  if (country)  filtered = filtered.filter(d => d.country === country);
  if (pathType) filtered = filtered.filter(d => d.type === pathType);
  if (pathogen) filtered = filtered.filter(d => d.pathogen.toLowerCase().includes(pathogen.toLowerCase()));
  if (symptom)  filtered = filtered.filter(d => d.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())));
  if (view === 'ukraine') filtered = filtered.filter(d => d.country === 'Україна');

  renderMarkers(filtered);
  updateMapStats(filtered);

  if (filtered.length && epiMap) {
    const lats = filtered.map(d => d.lat);
    const lngs = filtered.map(d => d.lng);
    epiMap.fitBounds([[Math.min(...lats)-5, Math.min(...lngs)-5], [Math.max(...lats)+5, Math.max(...lngs)+5]]);
  }
}

document.addEventListener('DOMContentLoaded', initMap);