let mainChart = null;
let barChartInstance = null;
let pieChartInstance = null;

// Черга для зберігання останніх пошуків (тепер додамо реальний ковід як стартовий)
let searchHistory = ['covid19_us', 'hantavirus', 'dengue'];
let currentDiseaseGlobal = 'covid19_us'; // Початкова хвороба за замовчуванням
let currentPeriodGlobal = 'all';
let cachedServerDiseases = []; // Сюди завантажимо повну живу базу з сервера

const CHART_COLORS = {
  teal:   '#00c9a7',
  red:    '#ff4d6d',
  yellow: '#ffd166',
  blue:   '#4dabf7',
  purple: '#c084fc',
  orange: '#fb923c',
};

// Функція визначення динамічного кольору для будь-якої хвороби (включаючи ковід)
function getDiseaseColor(diseaseId, level) {
  if (diseaseId && diseaseId.startsWith('covid19_')) return CHART_COLORS.teal;
  return { normal: '#00c9a7', medium: '#ffd166', danger: '#ff4d6d' }[level] || CHART_COLORS.blue;
}

function chartDefaults() {
  Chart.defaults.color = '#9aa0b4';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

// ПРАВИЛЬНО: Запитуємо історичні тренди напряму з ендпоінту Андрія!
async function fetchStatsDataFromServer(diseaseId, period) {
  try {
    const response = await fetch(`/api/stats?disease=${diseaseId}`);
    return await response.json();
  } catch(e) { 
    console.error("Помилка завантаження статистики з сервера:", e); 
    return EpiWatch.getStatsData(); // Якщо сервер лежить, підстрахуємося
  }
}

// ПРАВИЛЬНО: Допоміжна функція отримання повної бази хвороб для ініціалізації пошуку
async function fetchAllDiseasesFromServer() {
  try {
    const res = await fetch('/api/map-filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Порожній payload повертає всі 237 записів
    });
    return await res.json();
  } catch (e) {
    console.error("Не вдалося завантажити хвороби з сервера:", e);
    return EpiWatch.getDiseases();
  }
}

async function buildMainChart(diseaseId, period) {
  const data = await fetchStatsDataFromServer(diseaseId, period);
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;

  // Шукаємо дані хвороби у прийшовшій з сервера структурі
  const selectedData = data[diseaseId] || data.hantavirus || [100, 200, 300, 400, 500, 600, 700];
  const labels = getLabels(period, data.labels);
  const values = getPeriodSlice(selectedData, period);

  // Визначаємо назву та колір
  const diseaseInfo = cachedServerDiseases.find(d => d.id === diseaseId) || { name: 'COVID-19 (USA)', level: 'danger' };
  const color = getDiseaseColor(diseaseId, diseaseInfo.level);

  if (mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: diseaseInfo.name,
        data: values,
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointBorderColor: '#1e2330',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: {
          backgroundColor: '#1e2330',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          titleColor: '#e8eaf0',
          bodyColor: '#9aa0b4',
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('uk-UA')} випадків`,
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378', callback: v => EpiWatch.formatNumber(v) } }
      }
    }
  });
}

function buildBarChart() {
  const ctx = document.getElementById('ageChart');
  if (!ctx) return;

  // Фільтруємо серверні живі дані на основі масиву історії пошуків користувача
  const filtered = cachedServerDiseases.filter(d => searchHistory.includes(d.id));
  const sorted = [...filtered].sort((a, b) => b.cases - a.cases);

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name),
      datasets: [{
        label: 'Випадки',
        data: sorted.map(d => d.cases),
        backgroundColor: sorted.map(d => (d.id.startsWith('covid19_') ? CHART_COLORS.teal :  EpiWatch.levelColor(d.level)) + '99'),
        borderColor:     sorted.map(d => d.id.startsWith('covid19_') ? CHART_COLORS.teal :  EpiWatch.levelColor(d.level)),
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#5c6378' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378', callback: v => EpiWatch.formatNumber(v) } }
      }
    }
  });
}

function buildPieChart() {
  const ctx = document.getElementById('typeChart');
  if (!ctx) return;

  const filtered = cachedServerDiseases.filter(d => searchHistory.includes(d.id));

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: filtered.map(d => d.name),
      datasets: [{
        data: filtered.map(d => d.cases),
        backgroundColor: filtered.map(d => (d.id.startsWith('covid19_') ? CHART_COLORS.teal : EpiWatch.levelColor(d.level)) + 'cc'),
        borderColor:     filtered.map(d => d.id.startsWith('covid19_') ? CHART_COLORS.teal : EpiWatch.levelColor(d.level)),
        borderWidth: 1.5,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { padding: 14, font: { size: 12 } } }
      }
    }
  });
}

function getLabels(period, all) {
  const n = { '7': 2, '30': 3, '90': 5, '365': 7, 'all': 7 }[period] || 7;
  return all.slice(-n);
}
function getPeriodSlice(data, period) {
  const n = { '7': 2, '30': 3, '90': 5, '365': 7, 'all': 7 }[period] || 7;
  return data.slice(-n);
}

function handleDiseaseSearch(id) {
  currentDiseaseGlobal = id;
  if (!searchHistory.includes(id)) {
    searchHistory.push(id);
    if (searchHistory.length > 5) searchHistory.shift();
  }
  
  const target = cachedServerDiseases.find(d => d.id === id);
  if (target) {
    document.getElementById('totalCasesCard').textContent = EpiWatch.formatNumber(target.cases);
    document.getElementById('totalDeathsCard').textContent = EpiWatch.formatNumber(target.deaths);
    document.getElementById('totalRecoveredCard').textContent = EpiWatch.formatNumber(target.recovered);
  }

  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();
}

//ПОРІВНЯННЯ РЕГІОНІВ
async function triggerRegionComparisonAPI(c1, c2) {
  const statusBox = document.getElementById('regionComparisonStatus');
  if (!statusBox) return;
  
  //анімація завантаження
  statusBox.innerHTML = `<div class="map-loading__spinner" style="margin:0 auto 10px;"></div> Швидкий аналіз баз даних: ${c1} vs ${c2}...`;
  
  try {
    //запит на бекенд з параметрами обраних країн
    const res = await fetch(`/api/compare?country1=${encodeURIComponent(c1)}&country2=${encodeURIComponent(c2)}`);
    if (!res.ok) throw new Error("Помилка відповіді сервера");
    
    const apiData = await res.json(); // Отримуємо результат від Андрія
    
    //віконце з результатом прорахунку сервера
    statusBox.innerHTML = `
      <div style="text-align:center;color:#e8eaf0;">
        <span class="badge badge--green" style="margin-bottom:8px;">Реальна аналітика API</span>
        <p style="font-size:15px;font-weight:600;">Коефіцієнт транскордонного ризику (${c1} ↔ ${c2}): <span style="color:#ff4d6d">${apiData.riskPercentage}%</span></p>
        <p style="font-size:12px;color:#9aa0b4;margin-top:4px;">${apiData.verdict}</p>
      </div>
    `;
  } catch(e) { 
    console.error("Помилка модуля порівняння:", e);
    statusBox.innerHTML = `<span style="color:#ff4d6d;">❌ Не вдалося прорахувати загрозу. Перевірте з'єднання з бекендом.</span>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  chartDefaults();
  
  // КРИТИЧНО: Спочатку викачуємо живі дані з сервера для синхронізації
  cachedServerDiseases = await fetchAllDiseasesFromServer();

  // Оновлюємо картки сумарної статистики під стартовий ковід
  const startDisease = cachedServerDiseases.find(d => d.id === currentDiseaseGlobal);
  if (startDisease) {
    document.getElementById('totalCasesCard').textContent = EpiWatch.formatNumber(startDisease.cases);
    document.getElementById('totalDeathsCard').textContent = EpiWatch.formatNumber(startDisease.deaths);
    document.getElementById('totalRecoveredCard').textContent = EpiWatch.formatNumber(startDisease.recovered);
  }

  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();

  document.querySelectorAll('.time-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriodGlobal = btn.dataset.period;
      buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
    });
  });

  // Пошукові підказки тепер шукають по повній базі сервера (237+ захворювань!)
  const dInput = document.getElementById('diseaseSearchInput');
  const dDrop = document.getElementById('diseaseSuggestBox');
  
  if (dInput && dDrop) {
    dInput.addEventListener('input', () => {
      const val = dInput.value.toLowerCase().trim();
      dDrop.innerHTML = '';
      if (!val) { dDrop.style.display = 'none'; return; }
      
      const matches = cachedServerDiseases.filter(d => d.name.toLowerCase().includes(val));
      dDrop.style.display = 'block';

      if (matches.length > 0) {
        matches.forEach(m => {
          const item = document.createElement('div');
          item.className = 'search-suggest-item';
          item.textContent = m.name;
          item.addEventListener('click', () => {
            dInput.value = m.name;
            dDrop.style.display = 'none';
            handleDiseaseSearch(m.id);
          });
          dDrop.appendChild(item);
        });
      } else {
        const noResult = document.createElement('div');
        noResult.className = 'search-suggest-item';
        noResult.style.color = '#ff4d6d';
        noResult.style.cursor = 'default';
        noResult.textContent = '❌ Хворобу не знайдено в базі';
        dDrop.appendChild(noResult);
      }
    });
  }

  // Обробка пошуку країн на основі повної серверної бази
  ['1', '2'].forEach(num => {
    const input = document.getElementById(`countrySearchInput${num}`);
    const drop = document.getElementById(`countrySuggestBox${num}`);
    
    if (input && drop) {
      input.addEventListener('input', () => {
        const val = input.value.toLowerCase().trim();
        drop.innerHTML = '';
        if (!val) { drop.style.display = 'none'; return; }
        
        const countries = [...new Set(cachedServerDiseases.map(d => d.country))];
        const matches = countries.filter(c => c && c.toLowerCase().includes(val));
        drop.style.display = 'block';

        if (matches.length > 0) {
          matches.forEach(c => {
            const item = document.createElement('div');
            item.className = 'search-suggest-item';
            item.textContent = c;
            item.addEventListener('click', () => {
              input.value = c;
              drop.style.display = 'none';
              
              const c1 = document.getElementById('countrySearchInput1').value;
              const c2 = document.getElementById('countrySearchInput2').value;
              if (c1 && c2) triggerRegionComparisonAPI(c1, c2);
            });
            drop.appendChild(item);
          });
        } else {
          const noCountry = document.createElement('div');
          noCountry.className = 'search-suggest-item';
          noCountry.style.color = '#ffd166';
          noCountry.style.cursor = 'default';
          noCountry.textContent = '🏳 Країна відсутня в спалахах';
          drop.appendChild(noCountry);
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (dDrop && dInput && !dInput.contains(e.target)) dDrop.style.display = 'none';
    
    ['1', '2'].forEach(num => {
      const input = document.getElementById(`countrySearchInput${num}`);
      const drop = document.getElementById(`countrySuggestBox${num}`);
      if (drop && input && !input.contains(e.target)) drop.style.display = 'none';
    });
  });
});