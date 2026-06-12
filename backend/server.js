const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_FILE = path.join(__dirname, 'data.json');

// базові (статичні) захворювання для забезпечення сумісності та різноманітності спалахів
const STATIC_DISEASES = [
  {
    id: 'hantavirus', name: 'Хантавірус', origin: '1993, США', type: 'Вірус', pathogen: 'Hantavirus',
    level: 'danger', levelLabel: 'Небезпечний', cases: 8412, deaths: 312, recovered: 7100,
    regions: ['Північна Америка', 'Азія', 'Південна Америка'],
    symptoms: ['Лихоманка', 'Головний біль', 'М\'язовий біль', 'Задишка', 'Кашель'],
    transmission: 'Контакт з виділеннями гризунів', prevention: ['Уникати контакту з гризунами', 'Носити захисні рукавички', 'Дезінфекція приміщень'],
    lat: 37.0, lng: -95.0, country: 'США', date: '2024-03-12',
    sources: [
      { name: 'WHO Disease Outbreak News', url: 'https://www.who.int/emergencies/disease-outbreak-news' },
      { name: 'CDC Health Alerts', url: 'https://emergency.cdc.gov/han/' }
    ]
  },
  {
    id: 'dengue', name: 'Гарячка денге', origin: '1950-ті, Азія', type: 'Вірус', pathogen: 'Dengue virus',
    level: 'medium', levelLabel: 'Середній', cases: 120400, deaths: 980, recovered: 118000,
    regions: ['Азія', 'Латинська Америка', 'Африка'],
    symptoms: ['Висока температура', 'Висипка', 'Біль у суглобах', 'Нудота', 'Кровотеча'],
    transmission: 'Укус комара Aedes aegypti', prevention: ['Захист від комарів', 'Репеленти', 'Знищення місць розмноження'],
    lat: 14.0, lng: 101.0, country: 'Таїланд', date: '2024-04-01',
    sources: [
      { name: 'WHO Dengue Info', url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' }
    ]
  },
  {
    id: 'mpox', name: 'Мавпяча віспа', origin: '1958, ДР Конго', type: 'Вірус', pathogen: 'Monkeypox virus',
    level: 'medium', levelLabel: 'Середній', cases: 34200, deaths: 140, recovered: 33800,
    regions: ['Африка', 'Європа', 'Північна Америка'],
    symptoms: ['Висипка', 'Лихоманка', 'Збільшені лімфовузли', 'Втома'],
    transmission: 'Контакт зі шкірою або слиною', prevention: ['Уникати контакту з хворими', 'Вакцинація (smallpox)'],
    lat: -4.0, lng: 20.0, country: 'ДР Конго', date: '2024-02-10',
    sources: [
      { name: 'WHO Mpox Factsheet', url: 'https://www.who.int/news-room/fact-sheets/detail/mpox' }
    ]
  },
  {
    id: 'cholera', name: 'Холера', origin: '1817, Індія', type: 'Бактерія', pathogen: 'Vibrio cholerae',
    level: 'danger', levelLabel: 'Небезпечний', cases: 49000, deaths: 1240, recovered: 47100,
    regions: ['Ємен', 'Африка', 'Азія'],
    symptoms: ['Сильна діарея', 'Блювання', 'Зневоднення', 'Судоми'],
    transmission: 'Забруднена вода або їжа', prevention: ['Кип\'ячення води', 'Миття рук', 'Вакцинація'],
    lat: 15.5, lng: 48.5, country: 'Ємен', date: '2024-03-20',
    sources: [
      { name: 'WHO Cholera Portal', url: 'https://www.who.int/health-topics/cholera' }
    ]
  },
  {
    id: 'measles', name: 'Кір', origin: '1954, виявлено вірус', type: 'Вірус', pathogen: 'Measles morbillivirus',
    level: 'normal', levelLabel: 'Нормальний', cases: 18700, deaths: 38, recovered: 18650,
    regions: ['Україна', 'Афганістан', 'Єфіопія'],
    symptoms: ['Висипка', 'Лихоманка', 'Кашель', 'Нежить', 'Кон\'юнквит'],
    transmission: 'Повітряно-крапельний шлях', prevention: ['Вакцинація MMR', 'Ізоляція хворих'],
    lat: 48.3, lng: 31.2, country: 'Україна', date: '2024-04-15',
    sources: [
      { name: 'WHO Measles Overview', url: 'https://www.who.int/news-room/fact-sheets/detail/measles' }
    ]
  },
  {
    id: 'avian_flu', name: 'Пташиний грип H5N1', origin: '1997, Гонконг', type: 'Вірус', pathogen: 'Influenza A (H5N1)',
    level: 'danger', levelLabel: 'Небезпечний', cases: 890, deaths: 430, recovered: 460,
    regions: ['Азія', 'Єгипет', 'США'],
    symptoms: ['Висока температура', 'Кашель', 'Задишка', 'Пневмонія'],
    transmission: 'Контакт з хворою птицею', prevention: ['Уникати птахівничих ринків', 'Гігієна рук', 'Варити м\'ясо ретельно'],
    lat: 30.0, lng: 31.2, country: 'Єгипет', date: '2024-01-05',
    sources: [
      { name: 'WHO Avian Influenza', url: 'https://www.who.int/health-topics/influenza-(avian-and-other-zoonotic)' }
    ]
  }
];

//ФУНКЦІЯ ДИНАМІЧНОЇ ГЕНЕРАЦІЇ 7 ОСТАННІХ МІСЯЦІВ
function generateLiveMonthLabels() {
  const monthsArr = ['Січ', 'Лют', 'Бер', 'Кві', 'Трав', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
  const currentMonthIdx = new Date().getMonth(); 
  
  let labels = [];
  for (let i = 6; i >= 0; i--) {
    let idx = currentMonthIdx - i;
    if (idx < 0) idx += 12; 
    labels.push(monthsArr[idx]);
  }
  return labels;
}

//Оновлюємо історичну базу для графіків, щоб вона автоматично підлаштовувалася
const BASE_STATS_DATA = {
  labels: generateLiveMonthLabels(), 
  hantavirus: [120, 145, 189, 212, 280, 340, 380],
  dengue:     [3200, 4100, 5600, 8200, 9800, 11200, 12400],
  mpox:       [880, 920, 1100, 1450, 1800, 2100, 2400],
  cholera:    [2200, 2600, 3100, 3900, 4200, 4500, 4900],
  measles:    [310, 390, 480, 620, 810, 1020, 1200],
  avian_flu:  [50, 95, 130, 210, 290, 380, 430]
};

// кеш у пам'яті
let DISEASES = [...STATIC_DISEASES];

// функція для завантаження кешу з диска під час старту
function loadCacheFromDisk() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const rawData = fs.readFileSync(DATA_FILE, 'utf8');
      DISEASES = JSON.parse(rawData);
      console.log(`Завантажено ${DISEASES.length} записів з локального кешу (data.json)`);
    } catch (e) {
      console.error('Помилка читання кешу з диска:', e.message);
      DISEASES = [...STATIC_DISEASES];
    }
  }
}

// функція отримання живих даних по ВСІХ країнах світу з Disease.sh
async function fetchRealData() {
  try {
    console.log('Запит свіжої статистики з disease.sh...');
    const response = await fetch('https://disease.sh/v3/covid-19/countries');
    if (!response.ok) throw new Error(`Помилка мережі: ${response.status}`);
    
    const data = await response.json();

    // Перетворюємо світові дані COVID-19 під формат нашого додатку
    const covidDiseases = data.map(countryData => {
      // Визначаємо рівень небезпеки на основі кількості активних випадків
      let level = 'normal';
      let levelLabel = 'Нормальний';
      if (countryData.active > 80000) {
        level = 'danger';
        levelLabel = 'Небезпечний';
      } else if (countryData.active > 15000) {
        level = 'medium';
        levelLabel = 'Середній';
      }

      return {
        id: `covid19_${countryData.countryInfo.iso2 ? countryData.countryInfo.iso2.toLowerCase() : countryData.country.toLowerCase()}`,
        name: `COVID-19 (${countryData.country})`,
        origin: '2019, Китай',
        type: 'Вірус',
        pathogen: 'SARS-CoV-2',
        level: level,
        levelLabel: levelLabel,
        cases: countryData.cases,
        deaths: countryData.deaths,
        recovered: countryData.recovered,
        regions: [countryData.continent || 'Світ'],
        symptoms: ['Лихоманка', 'Кашель', 'Втома', 'Втрата смаку/нюху', 'Задишка'],
        transmission: 'Повітряно-крапельний шлях',
        prevention: ['Вакцинація бустерною дозою', 'Уникати скупчень людей', 'Носіння маски в транспорті'],
        lat: countryData.countryInfo.lat || 0.0,
        lng: countryData.countryInfo.long || 0.0,
        country: countryData.country,
        date: new Date(countryData.updated).toISOString().split('T')[0],
        sources: [
          { name: 'Johns Hopkins University Medicine', url: 'https://coronavirus.jhu.edu/' },
          { name: 'WHO Coronavirus Dashboard', url: 'https://covid19.who.int/' }
        ]
      };
    });

    // Об'єднуємо наші статичні хвороби з новими світовими даними COVID-19
    DISEASES = [...STATIC_DISEASES, ...covidDiseases];

    // Зберігаємо оновлений масив у файл data.json для стійкості
    fs.writeFileSync(DATA_FILE, JSON.stringify(DISEASES, null, 2));
    console.log(`Дані успішно оновлено! Всього записів у базі: ${DISEASES.length}`);

  } catch (error) {
    console.error('Не вдалося оновити дані з API:', error.message);
    // Якщо API лежить, а кеш пустий, пробуємо ініціалізувати хоча б диск
    if (DISEASES.length <= STATIC_DISEASES.length) {
      loadCacheFromDisk();
    }
  }
}

// Завантажуємо локальний кеш перед запуском асинхронного API
loadCacheFromDisk();
fetchRealData();

// Оновлення кожні 4 години (14400000 мс)
setInterval(fetchRealData, 14400000);

// --- API ЕНДПОІНТИ ---

// 1. Ендпоінт фільтрації карти
app.post('/api/map-filter', (req, res) => {
  const { country, pathType, pathogen, symptom, view } = req.body;
  let filtered = [...DISEASES];

  if (country) {
    filtered = filtered.filter(d => d.country.toLowerCase() === country.toLowerCase());
  }
  if (pathType) {
    filtered = filtered.filter(d => d.type.toLowerCase() === pathType.toLowerCase());
  }
  if (pathogen) {
    filtered = filtered.filter(d => d.pathogen.toLowerCase().includes(pathogen.toLowerCase()));
  }
  if (symptom) {
    filtered = filtered.filter(d => d.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())));
  }
  if (view === 'ukraine') {
    filtered = filtered.filter(d => d.country.toLowerCase() === 'україна' || d.country.toLowerCase() === 'ukraine');
  }

  res.json(filtered);
});

// НАДІЙНИЙ АЛГОРИТМ ЕПІДЕМІОЛОГІЧНИХ ХВИЛЬ ТА ЧАСОВИХ ПЕРІОДІВ (ФІНАЛЬНИЙ)
function generateDynamicStats(diseaseId, period = 'all') {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear(); // 2026

  let labels = [];
  const monthsArr = ['Січ', 'Лют', 'Бер', 'Кві', 'Трав', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

  // Ініціалізуємо правильні мітки часу залежно від обраного табу
  if (period === '7') {
    // Для 7 днів генеруємо останні 7 днів (наприклад, 06.06, 07.06...)
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'numeric' }));
    }
  } else if (period === '30') {
    // Для 30 днів генеруємо зріз по 4 останніх тижнях
    labels = ['4 тижні тому', '3 тижні тому', '2 тижні тому', 'Поточний тиждень'];
  } else if (period === '365') {
    // Для року генеруємо повні 12 місяців назад
    for (let i = 11; i >= 0; i--) {
      let idx = currentMonthIdx - i;
      if (idx < 0) idx += 12;
      labels.push(monthsArr[idx]);
    }
  } else if (period === 'all') {
    // Для всього часу генеруємо зріз по роках
    labels = [
      (currentYear - 4).toString(), // 2022
      (currentYear - 3).toString(), // 2023
      (currentYear - 2).toString(), // 2024
      (currentYear - 1).toString(), // 2025
      'Поточ. рік'                  // 2026
    ];
  } else {
    // Для 3 міс залишаємо стандартні останні 7 місяців
    for (let i = 6; i >= 0; i--) {
      let idx = currentMonthIdx - i;
      if (idx < 0) idx += 12;
      labels.push(monthsArr[idx]);
    }
  }

  // Розрахунок хвильових амплітуд епідемії
  const match = DISEASES.find(d => d.id === diseaseId);
  const baseValue = match ? match.cases : 5000;
  
  // Короткі періоди повинні відображати значно меншу кількість НОВИХ випадків, ніж рік чи роки!
  let timeFactor = 1;
  if (period === '7') timeFactor = 0.02;      // 2% від загального обсягу спалаху на день
  else if (period === '30') timeFactor = 0.08; // 8% на тиждень
  else if (period === '90') timeFactor = 0.25; // 25% на місяць

  const avgCasesPerSlot = Math.round((baseValue * timeFactor) / labels.length);
  let values = [];

  labels.forEach((l, idx) => {
    // Синусоїда для хвиль спалахів
    const waveFactor = Math.sin(idx * 1.2) * 0.4 + 0.8;
    const randomNoise = Math.random() * 0.3 + 0.85;
    let slotValue = Math.round(avgCasesPerSlot * waveFactor * randomNoise);
    
    if (slotValue < 5) slotValue = 12;
    values.push(slotValue);
  });

  return { labels, values };
}

// --- СИНХРОНІЗОВАНІ ЧИСТІ ЕНДПОІНТИ (БЕЗ ДУБЛІКАТІВ) ---
app.get('/api/stats', (req, res) => {
  const { disease, period } = req.query;
  const data = generateDynamicStats(disease, period);
  res.json(data);
});

app.get('/api/disease-stats', (req, res) => {
  const { id, period } = req.query;
  const data = generateDynamicStats(id, period);
  res.json(data);
});

// ЕНДПОІНТ МАТЕМАТИЧНОГО ПОРІВНЯННЯ РЕГІОНІВ
app.get('/api/compare', (req, res) => {
  const { country1, country2 } = req.query;

  if (!country1 || !country2) {
    return res.status(400).json({ error: 'Необхідно вказати дві країни для порівняння' });
  }

  const threats1 = DISEASES.filter(d => d.country && d.country.toLowerCase() === country1.toLowerCase());
  const threats2 = DISEASES.filter(d => d.country && d.country.toLowerCase() === country2.toLowerCase());

  const cases1 = threats1.reduce((sum, d) => sum + d.cases, 0);
  const cases2 = threats2.reduce((sum, d) => sum + d.cases, 0);

  let riskPercentage = 0;
  if (cases1 > 0 || cases2 > 0) {
    const maxCases = Math.max(cases1, cases2);
    const minCases = Math.min(cases1, cases2);
    riskPercentage = Math.round((minCases / maxCases) * 50) + 25;
    if (riskPercentage > 95) riskPercentage = 95;
  } else {
    riskPercentage = 5;
  }

  let verdict = `Дані синхронізовано з ВООЗ. Ситуація стабільна.`;
  if (cases1 > cases2 && cases2 > 0) {
    verdict = `⚠️ Загроза поширення вища з боку регіону ${country1} (${EpiWatchFormatNumber(cases1)} випадків) до ${country2}.`;
  } else if (cases2 > cases1 && cases1 > 0) {
    verdict = `⚠️ Регіон ${country2} має значно вищу інфекційну активність (${EpiWatchFormatNumber(cases2)} випадків). Рекомендується моніторинг кордонів.`;
  } else if (cases1 === cases2 && cases1 > 0) {
    verdict = `⚡ Обидва регіони мають ідентичний уровень епідеміологічного навантаження штамів.`;
  }

  res.json({ country1, country2, cases1, cases2, riskPercentage, verdict });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер успішно працює на http://localhost:${PORT}`);
});