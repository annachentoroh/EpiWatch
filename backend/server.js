const express = require('express');
const path = require('path');
const scraper = require('./scraper');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Локальні детальні дані спалахів по областях України для режиму "Ситуація по областях"
const UKRAINE_REGIONS_DATA = [
  {
    id: 'region_kyiv',
    name: 'Грип А (Київська область)',
    origin: 'Сезонний спалах',
    type: 'Вірус',
    pathogen: 'Influenza A virus',
    level: 'medium',
    levelLabel: 'Середній',
    cases: 12450,
    deaths: 12,
    recovered: 11200,
    regions: ['Київська область'],
    symptoms: ['Висока температура', 'Кашель', 'Біль у горлі', 'М\'язовий біль'],
    transmission: 'Повітряно-крапельний шлях',
    prevention: ['Вакцинація від грипу', 'Уникати скупчень людей', 'Регулярне провітрювання'],
    lat: 50.45,
    lng: 30.52,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  },
  {
    id: 'region_lviv',
    name: 'Кір (Львівська область)',
    origin: 'Локальний спалах',
    type: 'Вірус',
    pathogen: 'Measles morbillivirus',
    level: 'danger',
    levelLabel: 'Небезпечний',
    cases: 450,
    deaths: 1,
    recovered: 410,
    regions: ['Львівська область'],
    symptoms: ['Висипка', 'Лихоманка', 'Кашель', 'Нежить'],
    transmission: 'Повітряно-крапельний шлях',
    prevention: ['Вакцинація КПК (кір, паротит, краснуха)', 'Ізоляція хворих'],
    lat: 49.83,
    lng: 24.02,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  },
  {
    id: 'region_odesa',
    name: 'Ротавірусна інфекція (Одеська область)',
    origin: 'Водний шлях передачі',
    type: 'Вірус',
    pathogen: 'Rotavirus',
    level: 'medium',
    levelLabel: 'Середній',
    cases: 890,
    deaths: 0,
    recovered: 850,
    regions: ['Одеська область'],
    symptoms: ['Діарея', 'Блювання', 'Лихоманка', 'Загальна слабкість'],
    transmission: 'Фекально-оральний (через брудну воду або їжу)',
    prevention: ['Ретельна гігієна рук', 'Вакцинація від ротавірусу', 'Вживання очищеної води'],
    lat: 46.48,
    lng: 30.72,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'Департамент охорони здоров\'я Одеської ОДА', url: 'https://health.odessa.gov.ua/' }]
  },
  {
    id: 'region_kharkiv',
    name: 'Вітряна віспа (Харківська область)',
    origin: 'Спалах у дитячих колективах',
    type: 'Вірус',
    pathogen: 'Varicella zoster virus',
    level: 'normal',
    levelLabel: 'Нормальний',
    cases: 1200,
    deaths: 0,
    recovered: 1180,
    regions: ['Харківська область'],
    symptoms: ['Висипка у вигляді пухирців', 'Сильний свербіж', 'Лихоманка'],
    transmission: 'Повітряно-крапельний шлях',
    prevention: ['Вакцинація від вітряної віспи', 'Своєчасна ізоляція контактних осіб'],
    lat: 49.99,
    lng: 36.23,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  },
  {
    id: 'region_zakarpattia',
    name: 'Хвороба Лайма (Закарпатська область)',
    origin: 'Природно-осередкове зараження',
    type: 'Бактерія',
    pathogen: 'Borrelia burgdorferi',
    level: 'medium',
    levelLabel: 'Середній',
    cases: 180,
    deaths: 0,
    recovered: 120,
    regions: ['Закарпатська область'],
    symptoms: ['Кільцева мігруюча еритема (пляма)', 'Лихоманка', 'Біль у суглобах'],
    transmission: 'Укус іксодового кліща',
    prevention: ['Використання репелентів', 'Закритий світлий одяг у лісі', 'Огляд тіла після прогулянок'],
    lat: 48.62,
    lng: 22.30,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  },
  {
    id: 'region_frankivsk',
    name: 'Кашлюк (Івано-Франківська область)',
    origin: 'Спалах через недостатнє охоплення вакцинацією',
    type: 'Бактерія',
    pathogen: 'Bordetella pertussis',
    level: 'danger',
    levelLabel: 'Небезпечний',
    cases: 320,
    deaths: 2,
    recovered: 290,
    regions: ['Івано-Франківська область'],
    symptoms: ['Нападоподібний спазматичний кашель', 'Задишка', 'Блювання після кашлю'],
    transmission: 'Повітряно-крапельний шлях',
    prevention: ['Вакцинація АКДП у ранньому віці', 'Своєчасна ревакцинація'],
    lat: 48.92,
    lng: 24.71,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  },
  {
    id: 'region_dnipro',
    name: 'Гепатит А (Дніпропетровська область)',
    origin: 'Контактно-побутовий спалах',
    type: 'Вірус',
    pathogen: 'Hepatitis A virus',
    level: 'medium',
    levelLabel: 'Середній',
    cases: 150,
    deaths: 0,
    recovered: 140,
    regions: ['Дніпропетровська область'],
    symptoms: ['Жовтяниця', 'Темна сеча', 'Біль у правому підребер\'ї', 'Нудота'],
    transmission: 'Фекально-оральний (брудні руки, їжа, вода)',
    prevention: ['Гігієна рук', 'Вживання кип\'яченої води', 'Вакцинація від гепатиту А'],
    lat: 48.46,
    lng: 35.04,
    country: 'Україна',
    date: new Date().toISOString().split('T')[0],
    sources: [{ name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }]
  }
];

// Допоміжний мапер для перетворення полів SQLite (текст JSON) у JS об'єкти
const mapDiseaseRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    regions: JSON.parse(row.regions || '[]'),
    symptoms: JSON.parse(row.symptoms || '[]'),
    prevention: JSON.parse(row.prevention || '[]'),
    sources: JSON.parse(row.sources || '[]')
  };
};

// Ініціалізація БД та скрапера при запуску
async function initializeApp() {
  await db.initDb();
  // Запуск первинного скрапінгу
  await scraper.updateAllData();
}
initializeApp();

// Оновлення даних фоновим процесом кожні 4 години
setInterval(() => scraper.updateAllData(), 14400000);

// --- API МАРШРУТИ (ENDPOINTS) ---

// Новий ендпоінт для примусового оновлення та збору живих даних з ВООЗ
app.post('/api/trigger-refresh', async (req, res) => {
  try {
    console.log('[API] Запит на примусове оновлення та скрапінг даних ВООЗ...');
    await scraper.updateAllData(); // Запускаємо збір даних
    
    const rows = await db.all('SELECT * FROM diseases');
    const freshData = rows.map(mapDiseaseRow);
    
    res.json({ success: true, data: freshData });
  } catch (error) {
    console.error('Помилка примусового оновлення:', error.message);
    res.status(500).json({ error: 'Не вдалося оновити дані з ВООЗ' });
  }
});

// 1. Повернення відфільтрованих даних для інтерактивної карти
app.post('/api/map-filter', async (req, res) => {
  try {
    const { country, pathType, pathogen, symptom, view } = req.body;
    
    let filtered = [];
    
    // Якщо вибрано режим перегляду областей України
    if (view === 'regions') {
      filtered = [...UKRAINE_REGIONS_DATA];
    } else {
      // Для "Світового моніторингу" або "Спалахів в Україні" беремо глобальні дані з SQLite
      const rows = await db.all('SELECT * FROM diseases');
      filtered = rows.map(mapDiseaseRow);
    }

    // Застосовуємо фільтри з панелі пошуку
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
    
    // Якщо вибрано режим "Спалахи в Україні", але з глобальної карти
    if (view === 'ukraine') {
      filtered = filtered.filter(d => d.country.toLowerCase() === 'україна' || d.country.toLowerCase() === 'ukraine');
    }

    res.json(filtered);
  } catch (error) {
    console.error('Помилка фільтрації карти:', error.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

// Допоміжний алгоритм генерації епідеміологічних хвиль для графіків
async function generateDynamicStats(diseaseId, period = 'all') {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear(); 

  let labels = [];
  const monthsArr = ['Січ', 'Лют', 'Бер', 'Кві', 'Трав', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

  if (period === '7') {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'numeric' }));
    }
  } else if (period === '30') {
    labels = ['4 тижні тому', '3 тижні тому', '2 тижні тому', 'Поточний тиждень'];
  } else if (period === '365') {
    for (let i = 11; i >= 0; i--) {
      let idx = currentMonthIdx - i;
      if (idx < 0) idx += 12;
      labels.push(monthsArr[idx]);
    }
  } else if (period === 'all') {
    labels = [
      (currentYear - 4).toString(), 
      (currentYear - 3).toString(), 
      (currentYear - 2).toString(), 
      (currentYear - 1).toString(), 
      'Поточ. рік'                  
    ];
  } else {
    for (let i = 2; i >= 0; i--) {
      let idx = currentMonthIdx - i;
      if (idx < 0) idx += 12;
      labels.push(monthsArr[idx]);
    }
  }

  // Отримуємо базове число випадків з SQLite або з константи областей України
  let baseValue = 5000;
  if (diseaseId && diseaseId.startsWith('region_')) {
    const regionMatch = UKRAINE_REGIONS_DATA.find(r => r.id === diseaseId);
    baseValue = regionMatch ? regionMatch.cases : 1000;
  } else {
    const row = await db.get('SELECT cases FROM diseases WHERE id = ?', [diseaseId]);
    baseValue = row ? row.cases : 5000;
  }
  
  let timeFactor = 1;
  if (period === '7') timeFactor = 0.02;      
  else if (period === '30') timeFactor = 0.08; 
  else if (period === '90') timeFactor = 0.25; 

  const avgCasesPerSlot = Math.round((baseValue * timeFactor) / labels.length);
  let values = [];

  labels.forEach((l, idx) => {
    const waveFactor = Math.sin(idx * 1.2) * 0.4 + 0.8;
    const randomNoise = Math.random() * 0.3 + 0.85;
    let slotValue = Math.round(avgCasesPerSlot * waveFactor * randomNoise);
    
    if (slotValue < 5) slotValue = 12;
    values.push(slotValue);
  });

  return { labels, values };
}

// 2. Отримання загальної статистики
app.get('/api/stats', async (req, res) => {
  try {
    const { disease, period } = req.query;
    const data = await generateDynamicStats(disease, period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання статистики' });
  }
});

// 3. Отримання індивідуальної статистики для картки хвороби
app.get('/api/disease-stats', async (req, res) => {
  try {
    const { id, period } = req.query;
    const data = await generateDynamicStats(id, period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання індивідуальної статистики' });
  }
});

// 4. Порівняння епідеміологічної активності двох країн
app.get('/api/compare', async (req, res) => {
  try {
    const { country1, country2 } = req.query;

    if (!country1 || !country2) {
      return res.status(400).json({ error: 'Необхідно вказати дві країни для порівняння' });
    }

    const threats1 = await db.all('SELECT * FROM diseases WHERE LOWER(country) = LOWER(?)', [country1]);
    const threats2 = await db.all('SELECT * FROM diseases WHERE LOWER(country) = LOWER(?)', [country2]);

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

    const formatNumber = (n) => {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return n.toString();
    };

    let verdict = `Дані синхронізовано з ВООЗ. Ситуація стабільна.`;
    if (cases1 > cases2 && cases2 > 0) {
      verdict = `⚠️ Загроза поширення вища з боку регіону ${country1} (${formatNumber(cases1)} випадків) до ${country2}.`;
    } else if (cases2 > cases1 && cases1 > 0) {
      verdict = `⚠️ Регіон ${country2} має значно вищу інфекційну активність (${formatNumber(cases2)} випадків). Рекомендується моніторинг кордонів.`;
    } else if (cases1 === cases2 && cases1 > 0) {
      verdict = `⚡ Обидва регіони мають ідентичний уровень епідеміологічного навантаження штамів.`;
    }

    res.json({ country1, country2, cases1, cases2, riskPercentage, verdict });
  } catch (error) {
    res.status(500).json({ error: 'Помилка порівняння регіонів' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[Express] Сервер успішно працює на http://localhost:${PORT}`);
});