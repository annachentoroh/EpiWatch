let mainChart = null;
let barChartInstance = null;
let pieChartInstance = null;
let compareRegionsChartInstance = null;

// Черга для зберігання останніх пошуків (для кругового та стовпчастого графіків)
let searchHistory = [];
let currentDiseaseGlobal = 'covid19_ua'; // Дефолтний стартовий запит (буде перезаписано, якщо не знайдено)
let currentPeriodGlobal = 'all';
let cachedServerDiseases = []; // Кеш живих даних з сервера

const CHART_COLORS = {
  teal:   '#00c9a7',
  red:    '#ff4d6d',
  yellow: '#ffd166',
  blue:   '#4dabf7',
  purple: '#c084fc',
  orange: '#fb923c',
};

// Безпечне форматування чисел
const formatNum = (n) => typeof EpiWatch !== 'undefined' ? EpiWatch.formatNumber(n) : n.toLocaleString('uk-UA');

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

// Запит історичних трендів до бекенду
async function fetchStatsDataFromServer(diseaseId, period) {
  try {
    const response = await fetch(`/api/stats?disease=${diseaseId}&period=${period}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch(e) { 
    console.error("Помилка завантаження статистики з сервера:", e); 
    return { labels: [], values: [] };
  }
}

// Запит повної бази хвороб з бекенду (для наповнення фільтрів)
async function fetchAllDiseasesFromServer() {
  try {
    const res = await fetch('/api/map-filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Порожній payload для всіх записів
    });
    return await res.json();
  } catch (e) {
    console.error("Не вдалося завантажити хвороби з сервера:", e);
    return [];
  }
}

async function buildMainChart(diseaseId, period) {
  const data = await fetchStatsDataFromServer(diseaseId, period);
  const ctx = document.getElementById('mainChart');
  if (!ctx || !data.labels) return;

  const diseaseInfo = cachedServerDiseases.find(d => d.id === diseaseId) || { name: 'Епідеміологічна загроза', level: 'danger' };
  const color = getDiseaseColor(diseaseId, diseaseInfo.level);

  if (mainChart) mainChart.destroy();

  // Градієнтна заливка під лінією
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, color + '55'); // 33% opacity
  gradient.addColorStop(1, color + '00'); // 0% opacity

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: diseaseInfo.name,
        data: data.values,
        borderColor: color,
        backgroundColor: gradient,
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
          callbacks: { label: ctx => ` ${formatNum(ctx.parsed.y)} нових випадків` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378', callback: v => formatNum(v) } }
      }
    }
  });
}

function buildBarChart() {
  const ctx = document.getElementById('ageChart');
  if (!ctx) return;

  const filtered = cachedServerDiseases.filter(d => searchHistory.includes(d.id));
  const sorted = [...filtered].sort((a, b) => b.cases - a.cases);

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name),
      datasets: [{
        label: 'Випадки',
        data: sorted.map(d => d.cases),
        backgroundColor: sorted.map(d => getDiseaseColor(d.id, d.level) + '99'),
        borderColor:     sorted.map(d => getDiseaseColor(d.id, d.level)),
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#5c6378' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6378', callback: v => formatNum(v) } }
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
      labels: filtered.map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name),
      datasets: [{
        data: filtered.map(d => d.cases),
        backgroundColor: filtered.map(d => getDiseaseColor(d.id, d.level) + 'cc'),
        borderColor:     filtered.map(d => getDiseaseColor(d.id, d.level)),
        borderWidth: 1.5,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'right', labels: { padding: 14, font: { size: 12 } } } }
    }
  });
}

function updateStatCards(target) {
  if (!target) return;
  
  document.getElementById('totalCasesCard').textContent = formatNum(target.cases);
  
  // Розрахунок реального відсотка смертності
  const deathRate = target.cases > 0 ? ((target.deaths / target.cases) * 100).toFixed(1) : 0;
  document.getElementById('totalDeathsCard').textContent = `${formatNum(target.deaths)} (${deathRate}%)`;
  
  document.getElementById('totalRecoveredCard').textContent = formatNum(target.recovered);
}

function handleDiseaseSearch(id) {
  currentDiseaseGlobal = id;
  if (!searchHistory.includes(id)) {
    searchHistory.push(id);
    if (searchHistory.length > 5) searchHistory.shift(); // Зберігаємо лише 5 останніх
  }
  
  const target = cachedServerDiseases.find(d => d.id === id);
  updateStatCards(target);

  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();
}

async function triggerRegionComparisonAPI(c1, c2) {
  const statusBox = document.getElementById('regionComparisonStatus');
  const chartWrap = document.getElementById('compareChartWrap');
  const canvas = document.getElementById('compareRegionsChart');
  if (!statusBox || !chartWrap || !canvas) return;
  
  chartWrap.style.display = 'none';
  statusBox.innerHTML = `<div class="map-loading__spinner" style="margin:0 auto 10px;"></div> Зіставлення баз даних та прорахунок ризиків: ${c1} vs ${c2}...`;
  
  try {
    const res = await fetch(`/api/compare?country1=${encodeURIComponent(c1)}&country2=${encodeURIComponent(c2)}`);
    if (!res.ok) throw new Error("Помилка відповіді сервера");
    
    const apiData = await res.json();
    
    // Визначаємо колір загрози
    let barColor = CHART_COLORS.teal; // Зелений
    if (apiData.riskPercentage > 75) barColor = CHART_COLORS.red; // Червоний
    else if (apiData.riskPercentage > 35) barColor = CHART_COLORS.yellow; // Жовтий

    // Впроваджуємо гарний прогрес-бар
    statusBox.innerHTML = `
      <div style="text-align:center;color:#e8eaf0; width: 100%;">
        <span class="badge badge--green" style="margin-bottom:8px;">Аналітика з сервера</span>
        <p style="font-size:15px;font-weight:600;margin-bottom:12px;">Коефіцієнт транскордонного ризику (${c1} ↔ ${c2})</p>
        
        <!-- Анімований Прогрес-бар -->
        <div style="width: 100%; max-width: 400px; height: 14px; background: rgba(255,255,255,0.05); border-radius: 7px; margin: 0 auto 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div style="width: ${apiData.riskPercentage}%; height: 100%; background: ${barColor}; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 7px; box-shadow: 0 0 10px ${barColor}88;"></div>
        </div>
        <p style="font-size:26px; font-weight:900; color: ${barColor}; margin-bottom: 12px; text-shadow: 0 2px 10px ${barColor}44;">${apiData.riskPercentage}%</p>
        
        <p style="font-size:13px;color:#9aa0b4; max-width:550px; margin: 0 auto; line-height: 1.5;">${apiData.verdict}</p>
      </div>
    `;

    // Будуємо графік порівняння кейсів для додаткової візуалізації
    chartWrap.style.display = 'block'; 
    if (compareRegionsChartInstance) compareRegionsChartInstance.destroy();

    compareRegionsChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: [c1, c2],
        datasets: [{
          label: 'Всього випадків',
          data: [apiData.cases1, apiData.cases2],
          backgroundColor: [CHART_COLORS.teal + 'cc', CHART_COLORS.blue + 'cc'],
          borderColor: [CHART_COLORS.teal, CHART_COLORS.blue],
          borderWidth: 1.5,
          borderRadius: 4,
          barThickness: 24
        }]
      },
      options: {
        indexAxis: 'y', 
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#5c6378', callback: v => formatNum(v) } },
          y: { grid: { display: false }, ticks: { color: '#e8eaf0', font: { weight: '600' } } }
        }
      }
    });

  } catch(e) { 
    console.error("Помилка модуля порівняння:", e);
    chartWrap.style.display = 'none';
    statusBox.innerHTML = `<span style="color:#ff4d6d;">❌ Не вдалося прорахувати загрозу. Перевірте з'єднання з бекендом.</span>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  chartDefaults();
  
  // КРИТИЧНО: Викачуємо живі дані з сервера
  cachedServerDiseases = await fetchAllDiseasesFromServer();

  // Встановлюємо перший існуючий елемент як стартовий, якщо дефолтного немає
  if (cachedServerDiseases.length > 0) {
    const defaultMatch = cachedServerDiseases.find(d => d.id === 'covid19_us' || d.id === 'covid19_ua');
    currentDiseaseGlobal = defaultMatch ? defaultMatch.id : cachedServerDiseases[0].id;
    
    // Ініціалізуємо історію
    searchHistory = cachedServerDiseases.slice(0, 3).map(d => d.id);
    if (!searchHistory.includes(currentDiseaseGlobal)) searchHistory.unshift(currentDiseaseGlobal);
    
    // Оновлюємо UI
    updateStatCards(cachedServerDiseases.find(d => d.id === currentDiseaseGlobal));
  }

  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();

  // Слухачі для табів часу
  document.querySelectorAll('.time-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriodGlobal = btn.dataset.period;
      buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
    });
  });

  // Автокомпліт: Пошук хвороб (по живій базі)
  const dInput = document.getElementById('diseaseSearchInput');
  const dDrop = document.getElementById('diseaseSuggestBox');
  
  if (dInput && dDrop) {
    const showDiseaseSuggestions = () => {
      const val = dInput.value.toLowerCase().trim();
      dDrop.innerHTML = '';
      const matches = val ? cachedServerDiseases.filter(d => d.name.toLowerCase().includes(val)) : cachedServerDiseases;
      
      if (matches.length > 0) {
        dDrop.style.display = 'block';
        matches.forEach(m => {
          const item = document.createElement('div');
          item.className = 'search-suggest-item';
          item.textContent = m.name;
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            dInput.value = m.name;
            dDrop.style.display = 'none';
            handleDiseaseSearch(m.id); // Оновлюємо всю сторінку під цю хворобу
          });
          dDrop.appendChild(item);
        });
      } else {
        dDrop.style.display = val ? 'block' : 'none';
        if (val) dDrop.innerHTML = `<div class="search-suggest-item" style="color:#ff4d6d;cursor:default;">❌ Хворобу не знайдено</div>`;
      }
    };
    dInput.addEventListener('input', showDiseaseSuggestions);
    dInput.addEventListener('focus', showDiseaseSuggestions);
  }

  // Автокомпліт: Пошук країн (по живій базі)
  ['1', '2'].forEach(num => {
    const input = document.getElementById(`countrySearchInput${num}`);
    const drop = document.getElementById(`countrySuggestBox${num}`);
    
    if (input && drop) {
      const showCountrySuggestions = () => {
        const val = input.value.toLowerCase().trim();
        drop.innerHTML = '';
        const uniqueCountries = [...new Set(cachedServerDiseases.map(d => d.country))].filter(Boolean).sort();
        const matches = val ? uniqueCountries.filter(c => c.toLowerCase().includes(val)) : uniqueCountries;
        
        if (matches.length > 0) {
          drop.style.display = 'block';
          matches.forEach(c => {
            const item = document.createElement('div');
            item.className = 'search-suggest-item';
            item.textContent = c;
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              input.value = c;
              drop.style.display = 'none';
              
              // Якщо обидві країни вибрано - запускаємо порівняння
              const c1 = document.getElementById('countrySearchInput1').value;
              const c2 = document.getElementById('countrySearchInput2').value;
              if (c1 && c2) triggerRegionComparisonAPI(c1, c2);
            });
            drop.appendChild(item);
          });
        } else {
          drop.style.display = val ? 'block' : 'none';
          if (val) drop.innerHTML = `<div class="search-suggest-item" style="color:#ffd166;cursor:default;">🏳 Країна відсутня</div>`;
        }
      };
      input.addEventListener('input', showCountrySuggestions);
      input.addEventListener('focus', showCountrySuggestions);
    }
  });

  // Закриття всіх dropdown-ів при кліку поза ними
  document.addEventListener('click', (e) => {
    if (dDrop && dInput && !dInput.contains(e.target)) dDrop.style.display = 'none';
    ['1', '2'].forEach(num => {
      const input = document.getElementById(`countrySearchInput${num}`);
      const drop = document.getElementById(`countrySuggestBox${num}`);
      if (drop && input && !input.contains(e.target)) drop.style.display = 'none';
    });
  });
});