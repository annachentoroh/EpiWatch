const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Роздача статики з папки frontend, яка знаходиться на рівень вище
app.use(express.static(path.join(__dirname, '../frontend')));

// БАЗА ДАНИХ (Повністю перенесено з frontend/js/app.js)
const DISEASES = [
  {
    id: 'hantavirus', name: 'Хантавірус', origin: '1993, США', type: 'Вірус', pathogen: 'Hantavirus',
    level: 'danger', levelLabel: 'Небезпечний', cases: 8412, deaths: 312, recovered: 7100,
    regions: ['Північна Америка', 'Азія', 'Південна Америка'],
    symptoms: ['Лихоманка', 'Головний біль', 'М\'язовий біль', 'Задишка', 'Кашель'],
    transmission: 'Контакт з виділеннями гризунів', prevention: ['Уникати контакту з гризунами', 'Носити захисні рукавички', 'Дезінфекція приміщень'],
    lat: 37.0, lng: -95.0, country: 'США', date: '2024-03-12'
  },
  {
    id: 'dengue', name: 'Гарячка денге', origin: '1950-ті, Азія', type: 'Вірус', pathogen: 'Dengue virus',
    level: 'medium', levelLabel: 'Середній', cases: 120400, deaths: 980, recovered: 118000,
    regions: ['Азія', 'Латинська Америка', 'Африка'],
    symptoms: ['Висока температура', 'Висипка', 'Біль у суглобах', 'Нудота', 'Кровотеча'],
    transmission: 'Укус комара Aedes aegypti', prevention: ['Захист від комарів', 'Репеленти', 'Знищення місць розмноження'],
    lat: 14.0, lng: 101.0, country: 'Таїланд', date: '2024-04-01'
  },
  {
    id: 'mpox', name: 'Мавпяча віспа', origin: '1958, ДР Конго', type: 'Вірус', pathogen: 'Monkeypox virus',
    level: 'medium', levelLabel: 'Середній', cases: 34200, deaths: 140, recovered: 33800,
    regions: ['Африка', 'Європа', 'Північна Америка'],
    symptoms: ['Висипка', 'Лихоманка', 'Збільшені лімфовузли', 'Втома'],
    transmission: 'Контакт зі шкірою або слиною', prevention: ['Уникати контакту з хворими', 'Вакцинація (smallpox)'],
    lat: -4.0, lng: 20.0, country: 'ДР Конго', date: '2024-02-10'
  },
  {
    id: 'cholera', name: 'Холера', origin: '1817, Індія', type: 'Бактерія', pathogen: 'Vibrio cholerae',
    level: 'danger', levelLabel: 'Небезпечний', cases: 49000, deaths: 1240, recovered: 47100,
    regions: ['Ємен', 'Африка', 'Азія'],
    symptoms: ['Сильна діарея', 'Блювання', 'Зневоднення', 'Судоми'],
    transmission: 'Забруднена вода або їжа', prevention: ['Кип\'ячення води', 'Миття рук', 'Вакцинація'],
    lat: 15.5, lng: 48.5, country: 'Ємен', date: '2024-03-20'
  },
  {
    id: 'measles', name: 'Кір', origin: '1954, виявлено вірус', type: 'Вірус', pathogen: 'Measles morbillivirus',
    level: 'normal', levelLabel: 'Нормальний', cases: 18700, deaths: 38, recovered: 18650,
    regions: ['Україна', 'Афганістан', 'Єфіопія'],
    symptoms: ['Висипка', 'Лихоманка', 'Кашель', 'Нежить', 'Кон\'юнктивіт'],
    transmission: 'Повітряно-крапельний шлях', prevention: ['Вакцинація MMR', 'Ізоляція хворих'],
    lat: 48.3, lng: 31.2, country: 'Україна', date: '2024-04-15'
  },
  {
    id: 'avian_flu', name: 'Пташиний грип H5N1', origin: '1997, Гонконг', type: 'Вірус', pathogen: 'Influenza A (H5N1)',
    level: 'danger', levelLabel: 'Небезпечний', cases: 890, deaths: 430, recovered: 460,
    regions: ['Азія', 'Єгипет', 'США'],
    symptoms: ['Висока температура', 'Кашель', 'Задишка', 'Пневмонія'],
    transmission: 'Контакт з хворою птицею', prevention: ['Уникати птахівничих ринків', 'Гігієна рук', 'Варити м\'ясо ретельно'],
    lat: 30.0, lng: 31.2, country: 'Єгипет', date: '2024-01-05'
  },
  {
    id: 'covid19', name: 'COVID-19', origin: '2019, Китай', type: 'Вірус', pathogen: 'SARS-CoV-2',
    level: 'danger', levelLabel: 'Небезпечний', cases: 7750000, deaths: 70000, recovered: 7600000,
    regions: ['Весь світ'],
    symptoms: ['Лихоманка', 'Кашель', 'Втрата нюху', 'Задишка', 'Втома'],
    transmission: 'Повітряно-крапельний шлях', prevention: ['Вакцинація', 'Маски', 'Миття рук', 'Вентиляція'],
    lat: 30.58, lng: 114.27, country: 'Китай', date: '2024-05-18'
  },
  {
    id: 'ebola', name: 'Хвороба Ебола', origin: '1976, ДР Конго', type: 'Вірус', pathogen: 'Ebolavirus',
    level: 'danger', levelLabel: 'Небезпечний', cases: 34800, deaths: 15200, recovered: 19600,
    regions: ['Африка'],
    symptoms: ['Різка лихоманка', 'Слабкість', 'Кровотечі', 'Біль у м\'язах', 'Блювання'],
    transmission: 'Контакт з рідинами тіла хворої людини або тварини', prevention: ['Уникати контактів з хворими', 'Сувора гігієна'],
    lat: 0.0, lng: 25.0, country: 'ДР Конго', date: '2024-02-05'
  },
  {
    id: 'zika', name: 'Вірус Зіка', origin: '1947, Уганда', type: 'Вірус', pathogen: 'Zika virus',
    level: 'medium', levelLabel: 'Середній', cases: 86000, deaths: 18, recovered: 85900,
    regions: ['Південна Америка', 'Африка', 'Азія'],
    symptoms: ['Незначна лихоманка', 'Висипка', 'Біль у суглобах', 'Кон\'юнктивіт'],
    transmission: 'Укус комара Aedes', prevention: ['Репеленти', 'Москітні сітки', 'Уникати поїздок вагітним'],
    lat: -14.23, lng: -51.92, country: 'Бразилія', date: '2023-11-12'
  },
  {
    id: 'tuberculosis', name: 'Туберкульоз', origin: 'Античність', type: 'Бактерія', pathogen: 'Mycobacterium tuberculosis',
    level: 'medium', levelLabel: 'Середній', cases: 1060000, deaths: 130000, recovered: 800000,
    regions: ['Азія', 'Африка', 'Європа'],
    symptoms: ['Кашель понад 3 тижні', 'Біль у грудях', 'Кровохаркання', 'Слабкість'],
    transmission: 'Повітряно-крапельний шлях', prevention: ['Вакцинація БЦЖ', 'Раннє виявлення та лікування'],
    lat: 20.59, lng: 78.96, country: 'Індія', date: '2024-04-10'
  },
  {
    id: 'malaria', name: 'Малярія', origin: 'Африка', type: 'Паразит', pathogen: 'Plasmodium',
    level: 'danger', levelLabel: 'Небезпечний', cases: 2490000, deaths: 60800, recovered: 2400000,
    regions: ['Африка', 'Південна Америка', 'Азія'],
    symptoms: ['Лихоманка', 'Озноб', 'Головний біль', 'Нудота'],
    transmission: 'Укус комара Anopheles', prevention: ['Москітні сітки', 'Протималярійні препарати', 'Знищення комарів'],
    lat: 9.08, lng: 8.67, country: 'Нігерія', date: '2024-05-01'
  }
];

const STATS_DATA = {
  labels: ['Жов', 'Лис', 'Гру', 'Січ', 'Лют', 'Бер', 'Кві'],
  hantavirus: [120, 145, 189, 212, 280, 340, 380],
  dengue:     [3200, 4100, 5600, 8200, 9800, 11200, 12400],
  mpox:       [880, 920, 1100, 1450, 1800, 2100, 2400],
  cholera:    [2200, 2600, 3100, 3900, 4200, 4500, 4900],
  measles:    [310, 390, 480, 620, 810, 1020, 1200],
  avian_flu:  [50, 95, 130, 210, 290, 380, 430],
  covid19:    [50000, 45000, 60000, 80000, 75000, 60000, 40000],
  ebola:      [0, 2, 5, 12, 8, 3, 0],
  zika:       [120, 150, 130, 200, 180, 160, 140],
  tuberculosis: [8000, 8200, 8500, 9000, 8800, 8600, 8500],
  malaria:    [20000, 21000, 25000, 30000, 28000, 26000, 24000]
};

// ЕНДПОІНТИ (API)

// 1. Фільтрація для карти (map.js)
app.post('/api/map-filter', (req, res) => {
  const { country, pathType, pathogen, symptom, view } = req.body;
  let filtered = [...DISEASES];

  if (country)  filtered = filtered.filter(d => d.country === country);
  if (pathType) filtered = filtered.filter(d => d.type === pathType);
  if (pathogen) filtered = filtered.filter(d => d.pathogen.toLowerCase().includes(pathogen.toLowerCase()));
  if (symptom)  filtered = filtered.filter(d => d.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())));
  if (view === 'ukraine') filtered = filtered.filter(d => d.country === 'Україна');

  res.json(filtered);
});

// 2. Статистика загальна (charts.js)
app.get('/api/stats', (req, res) => {
  res.json(STATS_DATA);
});

// 3. Статистика хвороби (disease-detail.html)
app.get('/api/disease-stats', (req, res) => {
  res.json(STATS_DATA);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Бекенд-сервер запущено на http://localhost:${PORT}`);
});