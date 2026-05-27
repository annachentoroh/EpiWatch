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
