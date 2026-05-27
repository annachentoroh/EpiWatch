let mainChart = null;
let pieChart = null;

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
};

function chartDefaults() {
  Chart.defaults.color = '#9aa0b4';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

function buildMainChart(diseaseId, period) {
  const data  = EpiWatch.getStatsData();
  const ctx   = document.getElementById('mainChart');
  if (!ctx) return;

  const selectedData = data[diseaseId] || data.hantavirus;
  const labels = getLabels(period, data.labels);
  const values = getPeriodSlice(selectedData, period);
  const color  = DISEASE_COLORS[diseaseId] || CHART_COLORS.teal;

  if (mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Нові випадки',
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
        legend: { display: false },
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
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5c6378' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#5c6378',
            callback: v => EpiWatch.formatNumber(v),
          }
        }
      }
    }
  });
}

function buildBarChart() {
  const ctx = document.getElementById('ageChart');
  if (!ctx) return;

  const diseases = EpiWatch.getDiseases();
  const sorted   = [...diseases].sort((a, b) => b.cases - a.cases);

  new Chart(ctx, {
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
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2330',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          titleColor: '#e8eaf0',
          bodyColor: '#9aa0b4',
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#5c6378' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5c6378', callback: v => EpiWatch.formatNumber(v) }
        }
      }
    }
  });
}

function buildPieChart() {
  const ctx = document.getElementById('typeChart');
  if (!ctx) return;

  const diseases = EpiWatch.getDiseases();

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: diseases.map(d => d.name),
      datasets: [{
        data: diseases.map(d => d.cases),
        backgroundColor: diseases.map(d => EpiWatch.levelColor(d.level) + 'cc'),
        borderColor:     diseases.map(d => EpiWatch.levelColor(d.level)),
        borderWidth: 1.5,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { padding: 14, font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: '#1e2330',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1, padding: 12,
          titleColor: '#e8eaf0', bodyColor: '#9aa0b4',
        }
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

//Init
document.addEventListener('DOMContentLoaded', () => {
  chartDefaults();

  let currentDisease = 'hantavirus';
  let currentPeriod  = 'all';

  buildMainChart(currentDisease, currentPeriod);
  buildBarChart();
  buildPieChart();

  //Time tabs
  document.querySelectorAll('.time-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      buildMainChart(currentDisease, currentPeriod);
    });
  });

  //Disease select
  const dSelect = document.getElementById('chartDisease');
  if (dSelect) {
    dSelect.addEventListener('change', () => {
      currentDisease = dSelect.value;
      buildMainChart(currentDisease, currentPeriod);
    });
  }

  //Country select (for label, demo only)
  const country1 = document.getElementById('chartCountry1');
  const country2 = document.getElementById('chartCountry2');
  //Could extend to show comparison; placeholder for API integration
});

