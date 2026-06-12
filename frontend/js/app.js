const EpiWatch = (() => {

  const DISEASES = [
    {
      id: 'hantavirus',
      name: 'Хантавірус',
      origin: '1993, США',
      type: 'Вірус',
      pathogen: 'Hantavirus',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 8412,
      deaths: 312,
      recovered: 7100,
      regions: ['Північна Америка', 'Азія', 'Південна Америка'],
      symptoms: ['Лихоманка', 'Головний біль', 'М\'язовий біль', 'Задишка', 'Кашель'],
      transmission: 'Контакт з виділеннями гризунів',
      prevention: ['Уникати контакту з гризунами', 'Носити захисні рукавички', 'Дезінфекція приміщень'],
      lat: 37.0, lng: -95.0,
      country: 'США',
      date: '2024-03-12',
      sources: [
        { name: 'WHO Disease Outbreak News', url: 'https://www.who.int/emergencies/disease-outbreak-news' },
        { name: 'CDC Health Alerts', url: 'https://emergency.cdc.gov/han/' },
        { name: 'МОЗ України', url: 'https://moz.gov.ua/' }
      ]
    },
    {
      id: 'dengue',
      name: 'Гарячка денге',
      origin: '1950-ті, Азія',
      type: 'Вірус',
      pathogen: 'Dengue virus',
      level: 'medium',
      levelLabel: 'Середній',
      cases: 120400,
      deaths: 980,
      recovered: 118000,
      regions: ['Азія', 'Латинська Америка', 'Африка'],
      symptoms: ['Висока температура', 'Висипка', 'Біль у суглобах', 'Нудота', 'Кровотеча'],
      transmission: 'Укус комара Aedes aegypti',
      prevention: ['Захист від комарів', 'Репеленти', 'Знищення місць розмноження'],
      lat: 14.0, lng: 101.0,
      country: 'Таїланд',
      date: '2024-04-01',
      sources: [
        { name: 'WHO Dengue Info', url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' },
        { name: 'CDC Dengue Resources', url: 'https://www.cdc.gov/dengue/' },
        { name: 'МОЗ України', url: 'https://moz.gov.ua/' }
      ]
    },
    {
      id: 'mpox',
      name: 'Мавпяча віспа',
      origin: '1958, ДР Конго',
      type: 'Вірус',
      pathogen: 'Monkeypox virus',
      level: 'medium',
      levelLabel: 'Середній',
      cases: 34200,
      deaths: 140,
      recovered: 33800,
      regions: ['Африка', 'Європа', 'Північна Америка'],
      symptoms: ['Висипка', 'Лихоманка', 'Збільшені лімфовузли', 'Втома'],
      transmission: 'Контакт зі шкірою або слиною',
      prevention: ['Уникати контакту з хворими', 'Вакцинація (smallpox)'],
      lat: -4.0, lng: 20.0,
      country: 'ДР Конго',
      date: '2024-02-10',
      sources: [
        { name: 'WHO Mpox Factsheet', url: 'https://www.who.int/news-room/fact-sheets/detail/mpox' },
        { name: 'CDC Mpox Updates', url: 'https://www.cdc.gov/poxvirus/mpox/' },
        { name: 'ЦГЗ МОЗ України', url: 'https://phc.org.ua/' }
      ]
    },
    {
      id: 'cholera',
      name: 'Холера',
      origin: '1817, Індія',
      type: 'Бактерія',
      pathogen: 'Vibrio cholerae',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 49000,
      deaths: 1240,
      recovered: 47100,
      regions: ['Ємен', 'Африка', 'Азія'],
      symptoms: ['Сильна діарея', 'Блювання', 'Зневоднення', 'Судоми'],
      transmission: 'Забруднена вода або їжа',
      prevention: ['Кип\'ячення води', 'Миття рук', 'Вакцинація'],
      lat: 15.5, lng: 48.5,
      country: 'Ємен',
      date: '2024-03-20',
      sources: [
        { name: 'WHO Cholera Portal', url: 'https://www.who.int/health-topics/cholera' },
        { name: 'CDC Cholera Information', url: 'https://www.cdc.gov/cholera/' },
        { name: 'МОЗ України', url: 'https://moz.gov.ua/' }
      ]
    },
    {
      id: 'measles',
      name: 'Кір',
      origin: '1954, виявлено вірус',
      type: 'Вірус',
      pathogen: 'Measles morbillivirus',
      level: 'normal',
      levelLabel: 'Нормальний',
      cases: 18700,
      deaths: 38,
      recovered: 18650,
      regions: ['Україна', 'Афганістан', 'Єфіопія'],
      symptoms: ['Висипка', 'Лихоманка', 'Кашель', 'Нежить', 'Кон\'юнктивіт'],
      transmission: 'Повітряно-крапельний шлях',
      prevention: ['Вакцинація MMR', 'Ізоляція хворих'],
      lat: 48.3, lng: 31.2,
      country: 'Україна',
      date: '2024-04-15',
      sources: [
        { name: 'WHO Measles Overview', url: 'https://www.who.int/news-room/fact-sheets/detail/measles' },
        { name: 'CDC Measles Prevention', url: 'https://www.cdc.gov/measles/' },
        { name: 'МОЗ України — Вакцинація', url: 'https://moz.gov.ua/' }
      ]
    },
    {
      id: 'avian_flu',
      name: 'Пташиний грип H5N1',
      origin: '1997, Гонконг',
      type: 'Вірус',
      pathogen: 'Influenza A (H5N1)',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 890,
      deaths: 430,
      recovered: 460,
      regions: ['Азія', 'Єгипет', 'США'],
      symptoms: ['Висока температура', 'Кашель', 'Задишка', 'Пневмонія'],
      transmission: 'Контакт з хворою птицею',
      prevention: ['Уникати птахівничих ринків', 'Гігієна рук', 'Варити м\'ясо ретельно'],
      lat: 30.0, lng: 31.2,
      country: 'Єгипет',
      date: '2024-01-05',
      sources: [
        { name: 'WHO Avian Influenza', url: 'https://www.who.int/health-topics/influenza-(avian-and-other-zoonotic)' },
        { name: 'CDC Bird Flu Alerts', url: 'https://www.cdc.gov/flu/avianflu/' },
        { name: 'МОЗ України', url: 'https://moz.gov.ua/' }
      ]
    },
  ];

  const STATS_DATA = {
    labels: ['Жов', 'Лис', 'Гру', 'Січ', 'Лют', 'Бер', 'Кві'],
    hantavirus: [120, 145, 189, 212, 280, 340, 380],
    dengue:     [3200, 4100, 5600, 8200, 9800, 11200, 12400],
    mpox:       [880, 920, 1100, 1450, 1800, 2100, 2400],
    cholera:    [2200, 2600, 3100, 3900, 4200, 4500, 4900],
    measles:    [310, 390, 480, 620, 810, 1020, 1200],
    avian_flu:  [50, 95, 130, 210, 290, 380, 430]
  };

  //ЦЕНТРАЛІЗОВАНА БАЗА ДАНИХ ДЛЯ ОСВІТНЬОГО БЛОКУ
  const EDUCATION_DATA = {
    firstaid: [
      { id: 'covid19', icon: '👑', title: 'COVID-19 / Коронавірусна інфекція', desc: 'Раптова втрата нюху, сухий кашель, лихоманка, утруднене дихання або задишка.', bgClass: 'var(--teal-dim)', steps: ['Залишайтеся вдома та ізолюйтеся від інших членів родини', 'Зв’яжіться з сімейним лікарем або гарячою лінією МОЗ', 'При падінні сатурації нижче 92% викликайте швидку (103)', 'Не приймайте антибіотики чи стероїди без прямого призначення лікаря'] },
      { id: 'measles', icon: '🔴', title: 'Кір (Measles)', desc: 'Плями на слизовій щок, рясна червона висипка по всьому тілу, висока температура, кон\'юнктивіт.', bgClass: 'var(--red-dim)', steps: ['Негайно ізолюйте дитину або дорослого (вірус надзвичайно заразний)', 'Викличте лікаря додому, уникайте самостійних візитів до поліклініки', 'Забезпечте затемнення кімнати (очі стають дуже чутливими до світла)', 'Приймайте жарознижувальні (парацетамол) та пийте багато води'] },
      { id: 'hantavirus', icon: '🦠', title: 'Хантавірус / Геморагічна лихоманка', desc: 'Сильний головний біль, задишка, м\'язовий біль після контакту з виділеннями гризунів.', bgClass: 'var(--red-dim)', steps: ['Ізолюйтеся і повністю обмежте фізичні навантаження', 'Негайно зателефонуйте до швидкої допомоги та повідомте про симптоми', 'Обов’язково вкажіть лікарям, чи був потенційний контакт із мишами', 'Не приймайте аспірин, оскільки він може посилити ризик кровотечі'] },
      { id: 'dengue', icon: '🌡️', title: 'Гарячка денге', desc: 'Висока температура, висипка, сильний біль за очима та у суглобах після укусів комарів.', bgClass: 'var(--yellow-dim)', steps: ['Забезпечте строгий постільний режим та інтенсивне пиття розчинів ОРС', 'Категорично уникайте ібупрофену та аспірину (викликають внутрішню кровотечу)', 'Використовуйте парацетамол для безпечного зниження температури', 'Негайно госпіталізуйтеся при появі синього висипу чи кровотечі з ясен'] },
      { id: 'malaria', icon: '🦟', title: 'Малярія (Malaria)', desc: 'Повторювані кожні 48-72 години приступи сильного ознобу, які змінюються жаром і потом.', bgClass: 'var(--red-dim)', steps: ['Невідкладно зверніться до інфекційного стаціонару (хвороба розвивається стрімко)', 'Здайте аналіз крові на малярійний плазмодій ("товста крапля")', 'Розпочніть прийом специфічних протималярійних засобів за схемою лікаря', 'Контролюйте роботу нирок та колір сечі (небезпека гемолізу)'] },
      { id: 'cholera', icon: '💧', title: 'Холера', desc: 'Раптова безболісна діарея у вигляді "рисового відвару", блювання, критичне зневоднення.', bgClass: 'var(--teal-dim)', steps: ['Щохвилини відновлюйте рідину — пийте оральні регідратаційні суміші (Регідрон)', 'При неможливості пити через блювоту терміново викликайте 103 для капельниць', 'Жорстко ізолюйте хворого та продезінфікуйте всі санвузли хлорним розчином', 'Усім контактним особам заборонено залишати карантинну зону'] },
      { id: 'westnile', icon: '🦅', title: 'Лихоманка Західного Нілу', desc: 'Гострий початок, біль у м\'язах, збільшені лімфовузли, ризик розвитку менінгіту.', bgClass: 'var(--blue-dim)', steps: ['Зверніться до невропатолога чи інфекціоніста при сильному болю в шиї', 'Забезпечте повний спокій, приберіть джерела яскравого світла та шуму', 'Приймайте симптоматичні протизапальні засоби за рекомендацією лікаря', 'Обробіть приміщення фумігаторами для знищення комарів-переносників'] },
      { id: 'mpox', icon: '🧼', title: 'Мавпяча віспа (Mpox)', desc: 'Глибокі болючі пухирі (папули) на шкірі, лихоманка, сильна втома, біль у попереку.', bgClass: 'var(--yellow-dim)', steps: ['Накрийте всі уражені ділянки шкіри чистою сухою пов\'язкою або одягом', 'Перейдіть у режим строгої ізоляції, виділіть собі окремий посуд та рушник', 'Зверніться дистанційно до інфекціоніста для реєстрації випадку спалаху', 'Повідомте всіх осіб, з якими був близький тілесний контакт за останні дні'] },
      { id: 'zika', icon: '🤰', title: 'Вірус Зіка', desc: 'Помірний жар, висип, почервоніння очей. Найбільша небезпека — для вагітних.', bgClass: 'var(--blue-dim)', steps: ['Вагітним жінкам при найменшій підозрі слід негайно пройти УЗД-моніторинг плоду', 'Вживайте велику кількість води та відпочивайте для зняття інтоксикації', 'Дотримуйтесь правил безпечного сексу (вірус передається статевим шляхом)', 'Використовуйте репеленти з DEET для захисту від повторних укусів'] }
    ],
    myths: [
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Хантавірус передається від людини до людини, як звичайний грип»', truth: 'Хантавірус передається виключно через вдихання пилу, що містить висушені виділення інфікованих гризунів (мишей). Передача від людини до людини у звичайних штамів відсутня. Повітряно-крапельний шлях між людьми НЕ характерний.', linkName: 'CDC Hantavirus Guidelines', linkUrl: 'https://www.cdc.gov/hantavirus' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Вакцини від кору застаріли і викликають аутизм у дітей»', truth: 'Масштабні незалежні дослідження за участю понад 1 200 000 дітей повністю спростували цей фейк. Вакцина MMR є єдиним надійним захистом від кору, який не має жодного відношення до розладів аутистичного спектру.', linkName: 'WHO Immunization Facts', linkUrl: 'https://www.who.int/immunization' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Якщо людина не має симптомів, вона не може заразити інших вірусом»', truth: 'При багатьох інфекціях (COVID-19, кір, грип) безсимптомні носії або люди в інкубаційному періоді виділяють величезну кількість вірусних частинок і активно заражають оточуючих, навіть почуваючись абсолютно здоровими.', linkName: 'WHO Transmission Reports', linkUrl: 'https://covid19.who.int/' },
      { badge: '⚠️ Перебільшення', badgeClass: 'myth-card__claim-badge badge--yellow', claim: '«Через глобальне потепління лихоманка Денге та Зіка стануть пандемією в Україні»', truth: 'Клімат дійсно змінюється, і переносники (комарі) просуваються на північ. Проте станом на 2026 рік в Україні реєструються лише поодинокі імпортовані випадки після подорожей. Масштабна місцева епідемія малоймовірна через особливості зимівлі комах.', linkName: 'ECDC Climate Risk Assessment', linkUrl: 'https://www.ecdc.europa.eu/' }
    ],
    glossary: [
      { term: 'Епідемія', definition: 'Стрімке і значне збільшення кількості випадків конкретного захворювання в межах певного регіону чи популяції, що перевищує очікувану норму.' },
      { term: 'Пандемія', definition: 'Епідемія світового масштабу, яка одночасно охоплює велику кількість країн або цілі континенті, вражаючи значний відсоток населення.' },
      { term: 'Ендемія', definition: 'Постійна присутність інфекційного збудника або захворювання на певній обмеженій географічній території (наприклад, малярія в деяких зонах Африки).' },
      { term: 'Інкубаційний період', definition: 'Час, що минає від моменту проникнення патогену в організм людини до появи перших явних клінічних симптомів хвороби.' },
      { term: 'Летальність (CFR)', definition: 'Статистичний показник, який відображає відсоток смертей від певної хвороби відносно загальної кількості офіційно підтверджених випадків цього захворювання.' },
      { term: 'Зоонозна хвороба', definition: 'Інфекція, яка в природних умовах передається від хребетних тварин до людини (наприклад, сказ, пташиний грип, хантавірус).' },
      { term: 'Вектор (Переносник)', definition: 'Живий організм (переважно членистоногі: комарі, кліщі, блохи), який переносить інфекційного агента від джерела зараження до сприйнятливого організму.' },
      { term: 'Суперрозповсюджувач', definition: 'Інфікована особа, яка через фізіологічні особливості або велику кількість соціальних контактів заражає значно більше людей, ніж середньостатистичний хворий.' }
    ]
  };

  function getEducationData() { return EDUCATION_DATA; }
  function getDiseases() { return DISEASES; }
  function getDiseaseById(id) { return DISEASES.find(d => d.id === id); }
  function getStatsData() { return STATS_DATA; }

  function getUniqueCountries() { return [...new Set(DISEASES.map(d => d.country))]; }
  function getUniqueTypes() { return [...new Set(DISEASES.map(d => d.type))]; }
  function getUniquePathogens() { return [...new Set(DISEASES.map(d => d.pathogen))]; }
  function getUniqueSymptoms() { 
    let s = []; 
    DISEASES.forEach(d => s = s.concat(d.symptoms)); 
    return [...new Set(s)]; 
  }

  function formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  }

  function levelColor(level) {
    return { normal: '#00c9a7', medium: '#ffd166', danger: '#ff4d6d' }[level] || '#9aa0b4';
  }
  function levelBadgeClass(level) {
    return { normal: 'badge--green', medium: 'badge--yellow', danger: 'badge--red' }[level] || '';
  }

  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  const NAV_HTML = `
  <nav class="nav">
    <a href="index.html" class="nav__logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
        <path d="M12 6v6l4 2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      </svg>
      Epi<span>Watch</span>
    </a>
    <div class="nav__links">
      <a href="index.html">Карта</a>
      <a href="charts.html">Графік</a>
      <a href="test.html">Тест на вірус</a>
      <a href="diseases.html">Захворювання</a>
      <a href="education.html">Освітній блок</a>
    </div>
    <div class="nav__search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" placeholder="Пошук хвороби..." id="globalSearch" autocomplete="off">
    </div>
  </nav>`;

  const FOOTER_HTML = `
  <footer class="footer">
    <p>© 2026 EpiWatch — Інформаційно-аналітична платформа епідеміологічного моніторингу</p>
    <p style="margin-top:6px">
      Дані: 
      <a href="https://www.who.int/data/gho" target="_blank" rel="noopener noreferrer">WHO Athena API</a> · 
      <a href="https://wonder.cdc.gov/" target="_blank" rel="noopener noreferrer">CDC WONDER</a> · 
      <a href="https://delphi.cmu.edu/epidata/" target="_blank" rel="noopener noreferrer">Delphi Epidata</a> 
      &nbsp;|&nbsp; Платформа не замінює консультацію лікаря
    </p>
  </footer>`;

  function injectShell() {
    const navEl = document.getElementById('nav-placeholder');
    if (navEl) navEl.outerHTML = NAV_HTML;
    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) footerEl.outerHTML = FOOTER_HTML;
    setActiveNav();

    const gs = document.getElementById('globalSearch');
    if (gs) {
      gs.addEventListener('keydown', e => {
        if (e.key === 'Enter' && gs.value.trim()) {
          window.location.href = `diseases.html?q=${encodeURIComponent(gs.value.trim())}`;
        }
      });
    }
  }

  return { 
    getDiseases, getDiseaseById, getStatsData, getEducationData,
    getUniqueCountries, getUniqueTypes, getUniquePathogens, getUniqueSymptoms,
    formatNumber, levelColor, levelBadgeClass, injectShell, NAV_HTML, FOOTER_HTML 
  };
})();

document.addEventListener('DOMContentLoaded', () => EpiWatch.injectShell());