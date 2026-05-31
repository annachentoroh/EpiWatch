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
    },
  ];

  const STATS_DATA = {
    labels: ['Жов', 'Лис', 'Гру', 'Січ', 'Лют', 'Бер', 'Кві'],
    hantavirus: [120, 145, 189, 212, 280, 340, 380],
    dengue:     [3200, 4100, 5600, 8200, 9800, 11200, 12400],
    mpox:       [880, 920, 1100, 1450, 1800, 2100, 2400],
    cholera:    [2200, 2600, 3100, 3900, 4200, 4500, 4900],
    measles:    [310, 390, 480, 620, 810, 1020, 1200],
  };

  // Utilities
  function getDiseases() { return DISEASES; }
  function getDiseaseById(id) { return DISEASES.find(d => d.id === id); }
  function getStatsData() { return STATS_DATA; }

  // Динамічні інструменти генерації унікальних списків для фільтрації
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
    <p>© 2025 EpiWatch — Інформаційно-аналітична платформа епідеміологічного моніторингу</p>
    <p style="margin-top:6px">Дані: <a href="#">WHO Athena API</a> · <a href="#">CDC WONDER</a> · <a href="#">Delphi Epidata</a> &nbsp;|&nbsp; Платформа не замінює консультацію лікаря</p>
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
    getDiseases, getDiseaseById, getStatsData, 
    getUniqueCountries, getUniqueTypes, getUniquePathogens, getUniqueSymptoms,
    formatNumber, levelColor, levelBadgeClass, injectShell, NAV_HTML, FOOTER_HTML 
  };
})();

document.addEventListener('DOMContentLoaded', () => EpiWatch.injectShell());