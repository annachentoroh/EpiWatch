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
