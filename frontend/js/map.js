let epiMap = null;
let markerLayer = null;
let cachedAllDiseases = []; //Кеш для збереження повної бази з сервера для підказок

//Асинхронний запит до бекенду
async function fetchFilteredMapDataFromServer(payload) {
  try {
    const res = await fetch('/api/map-filter', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) 
    });
    return await res.json();
  } catch(e) { 
    console.error("Помилка завантаження даних з сервера:", e); 
    return []; 
  }
}

//Функція ініціалізації карти
async function initMap() {
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

  //Завантажуємо повну базу для ініціалізації та кешу підказок
  cachedAllDiseases = await fetchFilteredMapDataFromServer({});
  renderMarkers(cachedAllDiseases);
  updateMapStats(cachedAllDiseases);
  
  setupAutosuggestFilters();
  setupRegionCustomSearch();
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
  if (!markerLayer) return;
  markerLayer.clearLayers();
  diseases.forEach(d => {
    const icon = createMarkerIcon(d.level);
    const marker = L.marker([d.lat, d.lng], { icon })
      .bindPopup(buildPopup(d), { maxWidth: 260, className: 'epi-popup-wrap' });
    markerLayer.addLayer(marker);
  });
}

function buildPopup(d) {
  const dateStr = new Date(d.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const riskPct = d.cases > 0 ? Math.round((d.deaths / d.cases) * 100) : 0;

  return `
    <div class="epi-popup">
      <h3>${d.name}</h3>
      <div class="meta">${dateStr} — ${d.country}</div>
      <div class="row"><label>Сума випадків:</label><span>${d.cases.toLocaleString('uk-UA')}</span></div>
      <div class="row"><label>Ризик захворювання:</label><span>${riskPct}%</span></div>
      <div class="advice">${d.prevention && d.prevention[0] ? d.prevention[0] : 'Дотримуйтесь правил гігієни'}</div>
      <button class="detail-btn" onclick="window.location.href='disease-detail.html?id=${d.id}'">Детальніше</button>
    </div>`;
}

function updateMapStats(diseases) {
  const totalCases = diseases.reduce((s, d) => s + d.cases, 0);
  const countries = [...new Set(diseases.map(d => d.country))].length;
  const outbreaks = diseases.length;

  const el = id => document.getElementById(id);
  if (el('statOutbreaks')) el('statOutbreaks').textContent = outbreaks;
  if (el('statCountries')) el('statCountries').textContent = countries + (countries > 0 ? '+' : '');
  if (el('statCases')) el('statCases').textContent = EpiWatch.formatNumber(totalCases);
}

//Підказки генеруються на основі реальних даних із сервера(cachedAllDiseases)
function setupAutosuggestFilters() {
  const getServerCountries = () => [...new Set(cachedAllDiseases.map(d => d.country))];
  const getServerTypes = () => [...new Set(cachedAllDiseases.map(d => d.type))];
  const getServerPathogens = () => [...new Set(cachedAllDiseases.map(d => d.pathogen))];
  const getServerSymptoms = () => {
    let s = [];
    cachedAllDiseases.forEach(d => { if(d.symptoms) s = s.concat(d.symptoms); });
    return [...new Set(s)];
  };

  const config = [
    { inputId: 'mapCountryInput', dropId: 'mapCountryDrop', dataFn: getServerCountries, placeholder: 'Всі країни', errorText: '🏳  Країна без спалахів' },
    { inputId: 'mapTypeInput', dropId: 'mapTypeDrop', dataFn: getServerTypes, placeholder: 'Всі типу', errorText: '🔬  Тип не знайдено' },
    { inputId: 'mapPathogenInput', dropId: 'mapPathogenDrop', dataFn: getServerPathogens, placeholder: 'Всі збудники', errorText: '🦠 Збудник відсутній' },
    { inputId: 'mapSymptomInput', dropId: 'mapSymptomDrop', dataFn: getServerSymptoms, placeholder: 'Всі симптоми', errorText: '❌ Симптом не знайдено' }
  ];

  config.forEach(cfg => {
    const input = document.getElementById(cfg.inputId);
    const drop = document.getElementById(cfg.dropId);
    if (!input || !drop) return;

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase().trim();
      drop.innerHTML = '';
      if (!val) { drop.style.display = 'none'; return; }

      const list = cfg.dataFn();
      const matches = list.filter(item => item && item.toLowerCase().includes(val));
      drop.style.display = 'block';

      if (matches.length > 0) {
        matches.forEach(match => {
          const el = document.createElement('div');
          el.className = 'search-suggest-item';
          el.textContent = match;
          el.addEventListener('click', () => {
            input.value = match;
            drop.style.display = 'none';
          });
          drop.appendChild(el);
        });
      } else {
        const fallback = document.createElement('div');
        fallback.className = 'search-suggest-item';
        fallback.style.color = '#ff4d6d';
        fallback.style.cursor = 'default';
        fallback.textContent = cfg.errorText;
        drop.appendChild(fallback);
      }
    });
  });

  document.addEventListener('click', (e) => {
    config.forEach(cfg => {
      const input = document.getElementById(cfg.inputId);
      const drop = document.getElementById(cfg.dropId);
      if (drop && input && !input.contains(e.target)) drop.style.display = 'none';
    });
  });
}

//Клієнтська фільтрація робиться сервером 
async function applyMapFilters() {
  const country = document.getElementById('mapCountryInput')?.value || '';
  const pathType = document.getElementById('mapTypeInput')?.value || '';
  const pathogen = document.getElementById('mapPathogenInput')?.value || '';
  const symptom = document.getElementById('mapSymptomInput')?.value || '';
  const view = document.getElementById('viewToggle')?.dataset.view || 'world';

  const filterPayload = { country, pathType, pathogen, symptom, view };
  
  let filtered = await fetchFilteredMapDataFromServer(filterPayload);

  renderMarkers(filtered);
  updateMapStats(filtered);

  if (filtered.length && epiMap) {
    const lats = filtered.map(d => d.lat).filter(l => l !== 0);
    const lngs = filtered.map(d => d.lng).filter(l => l !== 0);
    if (lats.length && lngs.length) {
      epiMap.fitBounds([[Math.min(...lats)-4, Math.min(...lngs)-4], [Math.max(...lats)+4, Math.max(...lngs)+4]]);
    }
  }
}

//Фільтрація за рівнем небезпеки (клієнтський швидкий фільтр по поточному кешу)
async function filterByLevel(level) {
  document.querySelectorAll('.legend-btn').forEach(b => b.classList.remove('active-legend'));
  const btn = document.querySelector(`.legend-btn[data-level="${level}"]`);
  if (btn) btn.classList.add('active-legend');

  const allData = await fetchFilteredMapDataFromServer({});
  let filtered = level === 'all' ? allData : allData.filter(d => d.level === level);
  
  renderMarkers(filtered);
  updateMapStats(filtered);
}

function setupRegionCustomSearch() {
  const rInput = document.getElementById('userRegionInput');
  const rDrop = document.getElementById('userRegionDrop');
  const box = document.getElementById('regionBox');
  if (!rInput || !rDrop || !box) return;

  setTimeout(() => {
    renderRegionStatus('Ukraine');
  }, 1000);

  rInput.addEventListener('input', () => {
    const val = rInput.value.toLowerCase().trim();
    rDrop.innerHTML = '';
    if (!val) { rDrop.style.display = 'none'; return; }

    const countries = [...new Set(cachedAllDiseases.map(d => d.country))];
    const matches = countries.filter(c => c && c.toLowerCase().includes(val));
    rDrop.style.display = 'block';

    if (matches.length > 0) {
      matches.forEach(c => {
        const item = document.createElement('div');
        item.className = 'search-suggest-item';
        item.textContent = c;
        item.addEventListener('click', () => {
          rInput.value = c;
          rDrop.style.display = 'none';
          box.textContent = `Оновлення аналітики для регіону ${c}...`;
          setTimeout(() => renderRegionStatus(c), 800);
        });
        rDrop.appendChild(item);
      });
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'search-suggest-item';
      fallback.style.color = '#ff4d6d';
      fallback.style.cursor = 'default';
      fallback.textContent = '❌ Немає спалахів у цьому регіоні';
      rDrop.appendChild(fallback);
    }
  });

  document.addEventListener('click', (e) => {
    if (rDrop && !rInput.contains(e.target)) rDrop.style.display = 'none';
  });
}

async function renderRegionStatus(countryName) {
  const box = document.getElementById('regionBox');
  if (!box) return;

  const diseases = await fetchFilteredMapDataFromServer({});
  const localThreats = diseases.filter(d => d.country && d.country.toLowerCase() === countryName.toLowerCase());

  if (localThreats.length > 0) {
    const t = localThreats[0];
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="badge badge--green"><span class="badge__dot"></span>Ваш регіон: ${countryName}</span>
        <span style="color:#9aa0b4;font-size:13px;">Активних загроз у вашому регіоні: <strong style="color:#ff4d6d;">${localThreats.length}</strong></span>
        <a href="disease-detail.html?id=${t.id}" style="color:#00c9a7;font-size:13px;text-decoration:underline;">${t.name} — дізнатись більше →</a>
      </div>`;
  } else {
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="badge badge--green" style="background:rgba(0,201,167,0.1); color:#00c9a7;"><span class="badge__dot" style="background:#00c9a7;"></span>Ваш регіон: ${countryName}</span>
        <span style="color:#9aa0b4;font-size:13px;">🎉 Чудові новини! Активних інфекційних загроз не виявлено.</span>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', initMap);