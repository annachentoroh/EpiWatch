let epiMap = null;
let markerLayer = null;
let cachedDiseasesForFilter = []; // Глобальний кеш живих даних для автопідбору

// Асинхронний запит до твого нового бекенду
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

// Локальні безпечні функції для збору унікальних значень з живого кешу
function getUniqueCountries() {
  return [...new Set(cachedDiseasesForFilter.map(d => d.country))].filter(Boolean).sort();
}

function getUniqueTypes() {
  return [...new Set(cachedDiseasesForFilter.map(d => d.type))].filter(Boolean).sort();
}

function getUniquePathogens() {
  return [...new Set(cachedDiseasesForFilter.map(d => d.pathogen))].filter(Boolean).sort();
}

function getUniqueSymptoms() {
  const allSymptoms = cachedDiseasesForFilter.flatMap(d => d.symptoms || []);
  return [...new Set(allSymptoms)].filter(Boolean).sort();
}

// Безпечне форматування чисел
const formatNumber = (n) => {
  if (typeof EpiWatch !== 'undefined' && EpiWatch.formatNumber) {
    return EpiWatch.formatNumber(n);
  }
  return n.toLocaleString('uk-UA');
};

// Функція ініціалізації карти (тепер асинхронна)
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

  // Отримуємо дані з сервера при старті
  const initialDiseases = await fetchFilteredMapDataFromServer({});
  cachedDiseasesForFilter = initialDiseases; // Зберігаємо в кеш для фільтрів

  renderMarkers(initialDiseases);
  updateMapStats(initialDiseases);
  
  setupAutosuggestFilters();
  setupRegionCustomSearch();
  setupViewToggle(); // Ініціалізація перемикання кнопок під картою
  setupHardRefreshButton(); // Ініціалізація кнопки примусового оновлення
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
  if (el('statCases')) el('statCases').textContent = formatNumber(totalCases);
}

function setupAutosuggestFilters() {
  const config = [
    { inputId: 'mapCountryInput', dropId: 'mapCountryDrop', dataFn: getUniqueCountries, placeholder: 'Всі країни', errorText: '🏳 Країна без спалахів' },
    { inputId: 'mapTypeInput', dropId: 'mapTypeDrop', dataFn: getUniqueTypes, placeholder: 'Всі типи', errorText: '🔬 Тип не знайдено' },
    { inputId: 'mapPathogenInput', dropId: 'mapPathogenDrop', dataFn: getUniquePathogens, placeholder: 'Всі збудники', errorText: '🦠 Збудник відсутній' },
    { inputId: 'mapSymptomInput', dropId: 'mapSymptomDrop', dataFn: getUniqueSymptoms, placeholder: 'Всі симптоми', errorText: '❌ Симптом не знайдено' }
  ];

  config.forEach(cfg => {
    const input = document.getElementById(cfg.inputId);
    const drop = document.getElementById(cfg.dropId);
    if (!input || !drop) return;

    // Встановлюємо стилі позиціонування ВГОРУ (bottom: 100%), щоб уникнути багів нашарування Leaflet
    drop.style.position = 'absolute';
    drop.style.bottom = '100%';
    drop.style.top = 'auto';
    drop.style.left = '0';
    drop.style.width = '100%';
    drop.style.maxHeight = '180px';
    drop.style.overflowY = 'auto';
    drop.style.zIndex = '1001';
    drop.style.marginBottom = '6px';
    drop.style.boxShadow = '0 -4px 16px rgba(0,0,0,0.4)';

    const showSuggestions = () => {
      const val = input.value.toLowerCase().trim();
      drop.innerHTML = '';

      // Додаємо пункт "Скинути фільтр" на сам початок випадаючого списку
      const resetItem = document.createElement('div');
      resetItem.className = 'search-suggest-item';
      resetItem.style.color = '#ff4d6d';
      resetItem.style.fontWeight = 'bold';
      resetItem.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      resetItem.textContent = '❌ Скинути фільтр';
      resetItem.addEventListener('click', async (e) => {
        e.stopPropagation();
        input.value = '';
        drop.style.display = 'none';
        await applyMapFilters();
      });
      drop.appendChild(resetItem);

      const list = cfg.dataFn();
      const matches = val 
        ? list.filter(item => item.toLowerCase().includes(val))
        : list;

      if (matches.length > 0) {
        drop.style.display = 'block';
        matches.forEach(match => {
          const el = document.createElement('div');
          el.className = 'search-suggest-item';
          el.textContent = match;
          el.addEventListener('click', async (e) => {
            e.stopPropagation();
            input.value = match;
            drop.style.display = 'none';
            await applyMapFilters(); 
          });
          drop.appendChild(el);
        });
      } else {
        if (val) {
          drop.style.display = 'block';
          const fallback = document.createElement('div');
          fallback.className = 'search-suggest-item';
          fallback.style.color = '#ff4d6d';
          fallback.style.cursor = 'default';
          fallback.textContent = cfg.errorText;
          drop.appendChild(fallback);
        } else {
          drop.style.display = 'block'; // Показуємо тільки пункт скидання, якщо поле пусте
        }
      }
    };

    input.addEventListener('input', showSuggestions);
    input.addEventListener('focus', showSuggestions);
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      showSuggestions();
    });
  });

  document.addEventListener('click', (e) => {
    config.forEach(cfg => {
      const input = document.getElementById(cfg.inputId);
      const drop = document.getElementById(cfg.dropId);
      if (drop && input && !input.contains(e.target) && !drop.contains(e.target)) {
        drop.style.display = 'none';
      }
    });
  });
}

// Налаштування та обробка перемикачів моніторингу під картою
function setupViewToggle() {
  const buttons = document.querySelectorAll('.view-toggle-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      buttons.forEach(b => {
        b.classList.remove('active', 'bg-emerald-500', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
      });

      btn.classList.add('active', 'bg-emerald-500', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-400');

      await applyMapFilters();
    });
  });
}

async function applyMapFilters() {
  const country = document.getElementById('mapCountryInput')?.value || '';
  const pathType = document.getElementById('mapTypeInput')?.value || '';
  const pathogen = document.getElementById('mapPathogenInput')?.value || '';
  const symptom = document.getElementById('mapSymptomInput')?.value || '';
  
  const view = document.querySelector('.view-toggle-btn.active')?.dataset.view || 'world';

  const filterPayload = { country, pathType, pathogen, symptom, view };
  let filtered = await fetchFilteredMapDataFromServer(filterPayload);
  cachedDiseasesForFilter = filtered; // Оновлюємо наш живий кеш автокомпліту

  renderMarkers(filtered);
  updateMapStats(filtered);

  if (epiMap) {
    if (view === 'ukraine' || view === 'regions') {
      epiMap.setView([48.3, 31.2], 6);
    } else if (filtered.length && (country || pathType || pathogen || symptom)) {
      const lats = filtered.map(d => d.lat).filter(l => l !== 0);
      const lngs = filtered.map(d => d.lng).filter(l => l !== 0);
      if (lats.length && lngs.length) {
        epiMap.fitBounds([[Math.min(...lats)-4, Math.min(...lngs)-4], [Math.max(...lats)+4, Math.max(...lngs)+4]]);
      }
    }
  }
}

// Фільтрація за рівнем небезпеки
async function filterByLevel(level) {
  document.querySelectorAll('.legend-btn').forEach(b => b.classList.remove('active-legend'));
  const btn = document.querySelector(`.legend-btn[data-level="${level}"]`);
  if (btn) btn.classList.add('active-legend');

  const view = document.querySelector('.view-toggle-btn.active')?.dataset.view || 'world';
  const allData = await fetchFilteredMapDataFromServer({ view });
  cachedDiseasesForFilter = allData; // Оновлюємо кеш
  
  let filtered = level === 'all' ? allData : allData.filter(d => d.level === level);
  
  renderMarkers(filtered);
  updateMapStats(filtered);
}

// Обробка натискання кнопки «Оновити» (повний дефолт карти + запуск скрапера)
function setupHardRefreshButton() {
  const refreshBtn = document.getElementById('mapRefreshBtn') || [...document.querySelectorAll('button')].find(b => b.textContent.includes('Оновити'));
  if (!refreshBtn) return;

  refreshBtn.addEventListener('click', async () => {
    // Візуальний стан завантаження
    const originalText = refreshBtn.innerHTML;
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Оновлення...`;

    try {
      // 1. Очищуємо всі текстові інпути на сторінці
      ['mapCountryInput', 'mapTypeInput', 'mapPathogenInput', 'mapSymptomInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
      });

      // 2. Скидаємо кнопки табів до "Весь світ"
      const buttons = document.querySelectorAll('.view-toggle-btn');
      buttons.forEach(b => {
        b.classList.remove('active', 'bg-emerald-500', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
        if (b.dataset.view === 'world') {
          b.classList.add('active', 'bg-emerald-500', 'text-white');
          b.classList.remove('bg-slate-800', 'text-slate-400');
        }
      });

      // 3. Робимо примусовий запит на бекенд для запуску скрапінгу
      const res = await fetch('/api/trigger-refresh', { method: 'POST' });
      const result = await res.json();

      if (result.success && result.data) {
        cachedDiseasesForFilter = result.data;
        renderMarkers(result.data);
        updateMapStats(result.data);
      }

      // 4. Повертаємо карту в початкове відображення
      if (epiMap) {
        epiMap.setView([20, 10], 2);
      }
    } catch (e) {
      console.error("Помилка оновлення:", e);
    } finally {
      // Відновлюємо початковий вигляд кнопки
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = originalText;
    }
  });
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

    const countries = getUniqueCountries();
    const matches = countries.filter(c => c.toLowerCase().includes(val));
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
  // Фільтруємо ВСІ загрози для обраної країни
  const localThreats = diseases.filter(d => d.country && d.country.toLowerCase() === countryName.toLowerCase());

  if (localThreats.length > 0) {
    // Формуємо красиві посилання для кожної хвороби, що є в регіоні
    const threatsLinks = localThreats.map(t => `
      <a href="disease-detail.html?id=${t.id}" style="color:#00c9a7; font-size:13px; text-decoration:underline; margin-right:12px; display:inline-block;">
        ${t.name} →
      </a>
    `).join('');

    box.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span class="badge badge--green"><span class="badge__dot"></span>Ваш регіон: ${countryName}</span>
        <span style="color:#9aa0b4; font-size:13px;">Активних загроз у вашому регіоні: <strong style="color:#ff4d6d;">${localThreats.length}</strong></span>
        <div style="display:inline-block; margin-left:10px;">
          ${threatsLinks}
        </div>
      </div>`;
  } else {
    box.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span class="badge badge--green" style="background:rgba(0,201,167,0.1); color:#00c9a7;"><span class="badge__dot" style="background:#00c9a7;"></span>Ваш регіон: ${countryName}</span>
        <span style="color:#9aa0b4; font-size:13px;">🎉 Чудові новини! Активних інфекційних загроз не виявлено.</span>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', initMap);