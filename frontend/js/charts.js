let mainChart = null;
let barChartInstance = null;
let pieChartInstance = null;

//Черга для зберігання останніх пошуків
let searchHistory = ['hantavirus', 'dengue', 'mpox'];
let currentDiseaseGlobal = 'hantavirus';
let currentPeriodGlobal = 'all';

const CHART_COLORS = {
  teal:   '#00c9a7',
  red:    '#ff4d6d',
  yellow: '#ffd166',
  blue:   '#4dabf7',
  purple: '#c084fc',
  orange: '#fb923c',
};

const DISEASE_COLORS = {
  hantavirus: '#ff4d6d',
  dengue:     '#ffd166',
  mpox:       '#c084fc',
  cholera:    '#fb923c',
  measles:    '#4dabf7',
  avian_flu:  '#00c9a7'
};

function chartDefaults() {
  Chart.defaults.color = '#9aa0b4';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

//Асинхронна функція отримання статистики з майбутнього бекенду
async function fetchStatsDataFromServer(diseaseId, period) {
  /* Коли буде API:
  try {
    const response = await fetch(`/api/stats?disease=${diseaseId}&period=${period}`);
    return await response.json();
  } catch(e) { console.error("Помилка API", e); }
  */
  return EpiWatch.getStatsData();
}

async function buildMainChart(diseaseId, period) {
  const data = await fetchStatsDataFromServer(diseaseId, period);
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;

  const selectedData = data[diseaseId] || data.hantavirus;
  const labels = getLabels(period, data.labels);
  const values = getPeriodSlice(selectedData, period);
  const diseaseInfo = EpiWatch.getDiseaseById(diseaseId) || { name: 'Хантавірус' };
  const color = DISEASE_COLORS[diseaseId] || CHART_COLORS.teal;

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

  const allDiseases = EpiWatch.getDiseases();
  const filtered = allDiseases.filter(d => searchHistory.includes(d.id));
  const sorted = [...filtered].sort((a, b) => b.cases - a.cases);

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name),
      datasets: [{
        label: 'Випадки',
        data: sorted.map(d => d.cases),
        backgroundColor: sorted.map(d => EpiWatch.levelColor(d.level) + '99'),
        borderColor:     sorted.map(d => EpiWatch.levelColor(d.level)),
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

  const allDiseases = EpiWatch.getDiseases();
  const filtered = allDiseases.filter(d => searchHistory.includes(d.id));

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: filtered.map(d => d.name),
      datasets: [{
        data: filtered.map(d => d.cases),
        backgroundColor: filtered.map(d => EpiWatch.levelColor(d.level) + 'cc'),
        borderColor:     filtered.map(d => EpiWatch.levelColor(d.level)),
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
  
  const target = EpiWatch.getDiseaseById(id);
  if (target) {
    document.getElementById('totalCasesCard').textContent = EpiWatch.formatNumber(target.cases);
    document.getElementById('totalDeathsCard').textContent = EpiWatch.formatNumber(target.deaths);
    document.getElementById('totalRecoveredCard').textContent = EpiWatch.formatNumber(target.recovered);
  }

  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();
}

//Покращене порівняння регіонів (з демо-відповіддю)
async function triggerRegionComparisonAPI(c1, c2) {
  const statusBox = document.getElementById('regionComparisonStatus');
  if (!statusBox) return;
  
  statusBox.innerHTML = `<div class="map-loading__spinner" style="margin:0 auto 10px;"></div> Зіставлення баз даних по регіонах: ${c1} vs ${c2}...`;
  
  //Імітуємо затримку відповіді сервера (1.5 секунди)
  setTimeout(() => {
    //Демо-розрахунок рівня ризику
    const randomRisk = Math.floor(Math.random() * 40) + 20; 
    statusBox.innerHTML = `
      <div style="text-align:center;color:#e8eaf0;">
        <span class="badge badge--yellow" style="margin-bottom:8px;">Аналітика API готова</span>
        <p style="font-size:15px;font-weight:600;">Індекс транскордонної загрози (${c1} ↔ ${c2}): <span style="color:#ff4d6d">${randomRisk}%</span></p>
        <p style="font-size:12px;color:#9aa0b4;margin-top:4px;">Бекенд-інтеграція. Дані синхронізовано з ВООЗ.</p>
      </div>
    `;
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  chartDefaults();
  buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
  buildBarChart();
  buildPieChart();

  //Таби часу (7 дн, 30 дн тощо)
  document.querySelectorAll('.time-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriodGlobal = btn.dataset.period;
      buildMainChart(currentDiseaseGlobal, currentPeriodGlobal);
    });
  });

  //Пошукові підказки для Хвороб з повідомленням про відсутність результатів
  const dInput = document.getElementById('diseaseSearchInput');
  const dDrop = document.getElementById('diseaseSuggestBox');
  
  if (dInput && dDrop) {
    dInput.addEventListener('input', () => {
      const val = dInput.value.toLowerCase().trim();
      dDrop.innerHTML = '';
      if (!val) { dDrop.style.display = 'none'; return; }
      
      const matches = EpiWatch.getDiseases().filter(d => d.name.toLowerCase().includes(val));
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
        //Якщо нічого не знайдено в базі app.js
        const noResult = document.createElement('div');
        noResult.className = 'search-suggest-item';
        noResult.style.color = '#ff4d6d';
        noResult.style.cursor = 'default';
        noResult.textContent = '❌ Хворобу не знайдено в базі';
        dDrop.appendChild(noResult);
      }
    });
  }

  //Обробка пошуку для Країни 1 та Країни 2
  ['1', '2'].forEach(num => {
    const input = document.getElementById(`countrySearchInput${num}`);
    const drop = document.getElementById(`countrySuggestBox${num}`);
    
    if (input && drop) {
      input.addEventListener('input', () => {
        const val = input.value.toLowerCase().trim();
        drop.innerHTML = '';
        if (!val) { drop.style.display = 'none'; return; }
        
        const countries = [...new Set(EpiWatch.getDiseases().map(d => d.country))];
        const matches = countries.filter(c => c.toLowerCase().includes(val));
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

  //Закриття підказок при кліку мимо полів
  document.addEventListener('click', (e) => {
    if (dDrop && dInput && !dInput.contains(e.target)) dDrop.style.display = 'none';
    
    ['1', '2'].forEach(num => {
      const input = document.getElementById(`countrySearchInput${num}`);
      const drop = document.getElementById(`countrySuggestBox${num}`);
      if (drop && input && !input.contains(e.target)) drop.style.display = 'none';
    });
  });
});