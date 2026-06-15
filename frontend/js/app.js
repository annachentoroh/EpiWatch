const EpiWatch = (() => {

  // 1. БАЗА ДАНИХ ДЛЯ 6 ЗАХВОРЮВАНЬ (Замість старих штамів)
  const DISEASES = [
    {
      id: 'covid19',
      name: 'COVID-19',
      origin: '2019, Китай',
      type: 'Вірус',
      pathogen: 'SARS-CoV-2',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 775000000,
      deaths: 7000000,
      recovered: 768000000,
      regions: ['Глобально', 'Європа', 'Північна Америка', 'Азія'],
      symptoms: ['Лихоманка', 'Сухий кашель', 'Втрата нюху/смаку', 'Втома', 'Задишка'],
      transmission: 'Повітряно-крапельний шлях',
      prevention: [
        'Вакцинація (основний та бустерні курси щеплень).',
        'Дотримання соціальної дистанції та носіння масок у людних місцях.',
        'Регулярне миття рук з милом або обробка антисептиком.',
        'Часте провітрювання закритих приміщень.'
      ],
      steps: [
        'Залишайтеся вдома, ізолюйтеся в окремій кімнаті.',
        'Дистанційно зв’яжіться зі своїм сімейним лікарем.',
        'Контролюйте рівень кисню в крові за допомогою пульсоксиметра.',
        'При падінні сатурації нижче 92% або сильній задишці терміново викликайте 103.'
      ],
      lat: 30.5928, lng: 114.3055,
      country: 'Китай',
      date: '2026-01-15',
      sources: [
        { name: 'ВООЗ: Коронавірусна інфекція', url: 'https://www.who.int/health-topics/coronavirus' },
        { name: 'ЦГЗ МОЗ України: COVID-19', url: 'https://phc.org.ua/news/vakcinaciya-vid-covid-19-i-covax-nikhto-ne-vigrae-gonku-poki-ne-peremozhut-usi' },
        { name: 'CDC COVID-19 Center', url: 'https://www.cdc.gov/coronavirus/2019-ncov/' }
      ]
    },
    {
      id: 'measles',
      name: 'Кір',
      origin: '9 століття (перші описи)',
      type: 'Вірус',
      pathogen: 'Measles morbillivirus',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 220000,
      deaths: 136000,
      recovered: 84000,
      regions: ['Глобально', 'Африка', 'Європа', 'Південно-Східна Азія'],
      symptoms: ['Плями Копліка на щоках', 'Червоний висип по тілу', 'Висока температура', 'Кон\'юнктивіт', 'Кашель'],
      transmission: 'Повітряно-крапельний шлях (надзвичайно контагіозний)',
      prevention: [
        'Вакцинація комплексною вакциною КПК (кір, паротит, краснуха) у 1 та 6 років.',
        'Термінова екстрена вакцинація контактних осіб протягом 72 годин.',
        'Ізоляція хворих до 5-го дня від появи висипу.',
        'Уникнення перебування невакцинованих дітей у колективах під час спалаху.'
      ],
      steps: [
        'Негайно ізолюйте хворого (вірус переноситься повітрям на великі відстані).',
        'Викличте лікаря додому, уникайте черг у поліклініках.',
        'Затемніть вікна в кімнаті хворого, оскільки розвивається сильна світлобоязнь.',
        'Забезпечте рясне пиття та контроль температури парацетамолом (НЕ аспірином).'
      ],
      lat: 48.3794, lng: 31.1656,
      country: 'Україна',
      date: '2026-02-10',
      sources: [
        { name: 'ВООЗ: Інформаційний бюлетень про кір', url: 'https://www.who.int/news-room/fact-sheets/detail/measles' },
        { name: 'CDC Measles (Measles)', url: 'https://www.cdc.gov/measles/' }
      ]
    },
    {
      id: 'cholera',
      name: 'Холера',
      origin: '1817, Індія (перша пандемія)',
      type: 'Бактерія',
      pathogen: 'Vibrio cholerae',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 470000,
      deaths: 2300,
      recovered: 467700,
      regions: ['Африка', 'Південна Азія', 'Гаїті', 'Близький Схід'],
      symptoms: ['Діарея "рисовий відвар"', 'Блювання', 'Критичне зневоднення', 'Судоми м\'язів', 'Запалі очі'],
      transmission: 'Фекально-оральний (через забруднену воду та їжу)',
      prevention: [
        'Вживання лише кип’яченої, дезінфікованої або бутильованої води.',
        'Ретельне миття рук з милом після вбиральні та перед приготуванням їжі.',
        'Термічна обробка морепродуктів та захист їжі від мух.',
        'Застосування пероральних холерних вакцин у зонах ризику.'
      ],
      steps: [
        'З першої хвилини почніть пити регідратаційні розчини (Регідрон) великими ковтками.',
        'Негайно викликайте екстрену медичну допомогу 103 — смерть може настати за добу.',
        'Категорично заборонено приймати протидіарейні препарати на кшталт лопераміду.',
        'Продезінфікуйте санвузли хлорвмісними засобами для захисту родини.'
      ],
      lat: 22.3511, lng: 78.6677,
      country: 'Індія',
      date: '2026-03-01',
      sources: [
        { name: 'ВООЗ: Холерний портал', url: 'https://www.who.int/health-topics/cholera' },
        { name: 'CDC Cholera Resources', url: 'https://www.cdc.gov/cholera/' },
        { name: 'ЦГЗ МОЗ України: Профілактика холери', url: 'https://phc.org.ua/news/yak-uberegtisya-vid-kholeri' }
      ]
    },
    {
      id: 'polio',
      name: 'Поліомієліт',
      origin: 'Стародавній Єгипет (історично)',
      type: 'Вірус',
      pathogen: 'Poliovirus',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 120,
      deaths: 12,
      recovered: 108,
      regions: ['Афганістан', 'Пакистан', 'Спалахи в Африці/Європі через невакцинованість'],
      symptoms: ['Млявий параліч', 'Лихоманка', 'Біль у м\'язах', 'Головний біль', 'Ригідність шиї'],
      transmission: 'Фекально-оральний та брудні руки',
      prevention: [
        'Обов’язкова вакцинація: ІПВ (інактивована) та ОПВ (жива краплі) за календарем.',
        'Суворий контроль якості та знезараження стічних вод.',
        'Миття рук після відвідування громадських місць та туалетів.',
        'Ретельне миття свіжих овочів та фруктів чистою водою.'
      ],
      steps: [
        'При раптовій слабкості в ногах або руках дитини негайно ізолюйте її.',
        'Терміново зверніться до інфекційного стаціонару або викликайте швидку.',
        'Забезпечте повний фізичний спокій, виключіть будь-які рухові навантаження.',
        'Зберіть дані про статус усіх щеплень дитини для медичної бригади.'
      ],
      lat: 33.9391, lng: 67.7100,
      country: 'Афганістан',
      date: '2026-04-05',
      sources: [
        { name: 'Global Polio Eradication Initiative', url: 'https://polioeradication.org/wp-content/uploads/2026/04/Standard-Operating-Procedures-for-responding-to-a-poliovirus-event-or-outbreak-Pre-publication-V5-20260520.pdf' },
        { name: 'ЦГЗ МОЗ України: Поліомієліт', url: 'https://phc.org.ua/news/poliomielit-dosi-realna-zagroza-chomu-ce-tak-i-yak-zakhistiti-sebe-y-ditey' },
        { name: 'ВООЗ: Поліомієліт', url: 'https://www.who.int/news-room/fact-sheets/detail/poliomyelitis' }
      ]
    },
    {
      id: 'tuberculosis',
      name: 'Туберкульоз',
      origin: '1882, виявлено паличку Коха',
      type: 'Бактерія',
      pathogen: 'Mycobacterium tuberculosis',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 10600000,
      deaths: 1300000,
      recovered: 9300000,
      regions: ['Глобально', 'Східна Європа', 'Азія', 'Африка'],
      symptoms: ['Кашель понад 2 тижні', 'Кровохаркання', 'Субфебрильна температура', 'Нічна пітливість', 'Втрата ваги'],
      transmission: 'Повітряно-крапельний шлях (тривалий контакт)',
      prevention: [
        'Вакцинація вакциною БЦЖ на 3-5 день життя новонародженого.',
        'Регулярне скринінгове обстеження (флюорографія, туберкулінодіагностика / тест Квантиферон).',
        'Підтримання імунітету: збалансоване харчування, відмова від куріння.',
        'Провітрювання та інсоляція (сонячне світло вбиває паличку Коха).'
      ],
      steps: [
        'При тривалому кашлі запишіться на прийом до сімейного лікаря для здачі мокротиння.',
        'Під час кашлю використовуйте паперові серветки та відразу їх утилізуйте.',
        'Пройдіть призначений лікарем рентген або КТ органів грудної клітки.',
        'Суворо дотримуйтесь графіку прийому протитуберкульозних ліків (курс триває місяцями).'
      ],
      lat: 48.5079, lng: 32.2623,
      country: 'Україна',
      date: '2026-05-20',
      sources: [
        { name: 'ЦГЗ МОЗ України: Протидія туберкульозу', url: 'https://phc.org.ua/news/tuberkuloz-yak-vinikae-yak-proyavlyaetsya-i-khto-mae-pidvischeniy-rizik-zakhvoriti' },
        { name: 'ВООЗ: Туберкульоз', url: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis' },
        { name: 'Stop TB Partnership', url: 'https://www.stoptb.org/what-we-do/advocate-endtb/tuberculosis-research-funding-trends-2005-2023' }
      ]
    },
    {
      id: 'malaria',
      name: 'Малярія',
      origin: '1880, виявлено плазмодій',
      type: 'Протист',
      pathogen: 'Plasmodium falciparum / vivax',
      level: 'danger',
      levelLabel: 'Небезпечний',
      cases: 249000000,
      deaths: 608000,
      recovered: 248300000,
      regions: ['Субсахарська Африка', 'Південна Азія', 'Латинська Америка'],
      symptoms: ['Повторювані приступи лихоманки', 'Сильний озноб', 'Проливний піт', 'Анемія', 'Збільшена селезінка'],
      transmission: 'Укус інфікованого комара роду Anopheles',
      prevention: [
        'Прийом профілактичних протималярійних препаратів (хіміопрофілактика) перед поїздкою в ендемічні зони.',
        'Використання протимоскітних сіток, оброблених інсектицидами тривалої дії.',
        'Нанесення репелентів із високим вмістом DEET на відкриту шкіру.',
        'Вакцинація дітей вакцинами RTS,S або R21 в ендемічних регіонах Африки.'
      ],
      steps: [
        'При нападі пропасниці після повернення з тропіків негайно лягайте в інфекційний стаціонар.',
        'Здайте терміновий аналіз крові на малярію за методикою «товстої краплі».',
        'Почніть прийом специфічних артемізинін-комбінованих препаратів під наглядом лікарів.',
        'Постійно контролюйте колір сечі та показники ниркових тестів для уникнення гемолізу.'
      ],
      lat: -1.2921, lng: 36.8219,
      country: 'Кенія',
      date: '2026-06-01',
      sources: [
        { name: 'ВООЗ: Малярійний звіт та факти', url: 'https://www.who.int/news-room/fact-sheets/detail/malaria' },
        { name: 'CDC Malaria Gateway', url: 'https://www.cdc.gov/malaria/' },
        { name: 'ЦГЗ МОЗ України: Пам’ятка для тих, хто подорожує', url: 'https://phc.org.ua/' }
      ]
    }
  ];

  // 2. ДИНАМІЧНИЙ ТРЕНД ДЛЯ 6 ХВОРОБ
  const STATS_DATA = {
    labels: ['Гру', 'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
    covid19:      [45000, 68000, 89000, 52000, 31000, 18000, 12000],
    measles:      [140, 310, 580, 920, 1200, 850, 420],
    cholera:      [1200, 1900, 2400, 3100, 4200, 4900, 5600],
    polio:        [2, 5, 1, 0, 4, 2, 1],
    tuberculosis: [2200, 2150, 2300, 2400, 2250, 2350, 2100],
    malaria:      [12000, 14500, 18900, 21200, 25000, 29000, 34000]
  };

  // 3. ЦЕНТРАЛІЗОВАНА БАЗА ДЛЯ ОСВІТНЬОГО БЛОКУ (Firstaid, 12 Myths, Glossary)
  const EDUCATION_DATA = {
    firstaid: DISEASES.map(d => ({
      id: d.id,
      icon: d.id === 'covid19' ? '👑' : d.id === 'measles' ? '🔴' : d.id === 'cholera' ? '💧' : d.id === 'polio' ? '🩼' : d.id === 'tuberculosis' ? '🫁' : '🦟',
      title: `${d.name} (${d.pathogen})`,
      desc: `Основні симптоми: ${d.symptoms.join(', ').toLowerCase()}.`,
      bgClass: d.id === 'covid19' || d.id === 'cholera' ? 'var(--teal-dim)' : d.id === 'measles' || d.id === 'malaria' ? 'var(--red-dim)' : 'var(--blue-dim)',
      steps: d.steps
    })),
    
    myths: [
      // COVID-19
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Антибіотики допомагають вилікувати або запобігти COVID-19»', truth: 'Антибіотики знищують лише бактерії. COVID-19 викликається вірусом SARS-CoV-2. Вони призначаються виключно лікарем у стаціонарі у випадку розвитку вторинної бактеріальної пневмонії.', linkName: 'ВООЗ: Міфи про антибіотики', linkUrl: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Вакцини проти COVID-19 змінюють людську ДНК»', truth: 'Вакцини мРНК та векторні вакцини доставляють генетичний матеріал у цитоплазму клітини для синтезу шипоподібного білка, вони ніколи не проникають у ядро клітини та жодним чином не взаємодіють із ДНК людини.', linkName: 'CDC: Робота мРНК вакцин', url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters' },
      // Кір
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Кір — це легка дитяча хвороба, якою краще перехворіти природним шляхом»', truth: 'Кір є смертельно небезпечним. Він може викликати важкі ускладнення: енцефаліт (запалення мозку), важку пневмонію та підгострий склерозуючий паненцефаліт, який розвивається через роки після хвороби і є завжди летальним.', linkName: 'CDC: Кір', linkUrl: 'https://www.who.int/news-room/commentaries/detail/embrace-the-facts-about-vaccines-not-the-myths' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Вакцина КПК викликає аутизм у дітей»', truth: 'Цей міф виник через сфальсифіковане дослідження Е. Вейкфілда 1998 року. Масштабні дослідження за участю мільйонів дітей повністю спростували зв’язок між вакцинацією КПК та розладами аутистичного спектру.', linkName: 'CDC: Кір', linkUrl: 'https://www.who.int/news-room/commentaries/detail/embrace-the-facts-about-vaccines-not-the-myths' },
      // Холера
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Холера передається по повітрю при розмові або кашлі з хворим»', truth: 'Холера є кишковою інфекцією та передається виключно фекально-оральним шляхом через забруднену воду, їжу або брудні руки. Повітряно-крапельного шляху передачі холери не існує.', linkName: 'CDC: Передача холери', linkUrl: 'https://www.cdc.gov/global-health/topics-programs/ihr.html' },
      { badge: '⚠️ Маніпуляція', badgeClass: 'myth-card__claim-badge badge--yellow', claim: '«Вживання міцного алкоголю повністю дезінфікує шлунок від холерного вібріона»', truth: 'Алкоголь руйнує захисний бар’єр шлунка та знижує кислотність шлункового соку, що навпаки полегшує бактеріям Vibrio cholerae проходження далі в тонкий кишківник, де вони починають виділяти токсин.', linkName: 'CDC: Передача холери', linkUrl: 'https://www.cdc.gov/global-health/topics-programs/ihr.html' },
      // Поліомієліт
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Поліомієліт повністю зник у світі, тому вакцинація вже непотрібна»', truth: 'Поки у світі (наприклад, у Пакистані чи Афганістані) залишається бодай одна інфікована дитина, вірус може легко поширитися у будь-яку країну серед невакцинованого населення та викликати масові паралічі.', linkName: 'ВООЗ: Статус ліквідації поліо', linkUrl: 'https://www.who.int/health-topics/poliomyelitis' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Жива оральна вакцина (краплі) завжди викликає параліч у щепленої дитини»', truth: 'Вкрай рідкісний випадок вакциноасоційованого паралічу може виникнути лише у дітей із важким вродженим імунодефіцитом. Для повного виключення цього ризику перші два щеплення в Україні роблять інактивованою ін’єкційною вакциною (ІПВ).', linkName: 'МОЗ: Вакцини, поліо', linkUrl: 'https://moz.gov.ua/uk/v-ukrayini-fiksuyut-pozitivnu-dinamiku-ohoplennya-sheplennyami-u-2025-roci-bilshist-pokaznikiv-perevishili-90' },
      // Туберкульоз
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«На туберкульоз хворіють лише бідні, безпритульні та ув’язнені»', truth: 'Туберкульоз поширюється повітрям, паличка Коха не обирає соціальний статус. Заразитися можна у громадському транспорті, кафе чи магазині. Ризик захворювання залежить виключно від стану імунітету людини.', linkName: 'ЦГЗ: Соціальні аспекти туберкульозу', linkUrl: 'https://phc.org.ua/news/mizhnarodna-naukovo-praktichna-konferenciya-vil-asociyovaniy-tuberkuloz-epidemiologichni' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Вакцина БЦЖ у пологовому будинку повністю захищає від зараження туберкульозом на все життя»', truth: 'БЦЖ не захищає від інфікування в дорослому віці, проте вона гарантовано захищає немовлят від смертельних та важких форм генералізованого туберкульозу, таких як туберкульозний менінгіт.', linkName: 'МОЗ: Навіщо потрібна БЦЖ', linkUrl: 'https://moz.gov.ua/uk/vakcina-proti-tuberkulozu-bczh-zahishaye-vid-nebezpechnih-naslidkiv-hvorobi' },
      // Малярія
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Будь-який комар в Україні може переносити малярію»', truth: 'Малярію переносять виключно комарі роду Anopheles. Звичайні міські комарі (роду Culex), які докучають нам щоліта, фізично не здатні підтримувати цикл розвитку малярійного плазмодія.', linkName: 'CDC: Малярійні переносники', linkUrl: 'https://wwwnc.cdc.gov/eid/article/25/7/19-0301_article' },
      { badge: '❌ Міф', badgeClass: 'myth-card__claim-badge', claim: '«Малярію можна повністю вилікувати вживанням часнику або імбиру»', truth: 'Малярія викликається мікроскопічними паразитами крові (плазмодіями). Жодні народні методи не діють на них. Без лікування специфічними артемізиніновими препаратами хвороба швидко руйнує еритроцити та призводить до коми та смерті.', linkName: 'ВООЗ: Лікування малярії', linkUrl: 'https://www.who.int/teams/global-malaria-programme/case-management' }
    ],
    
    glossary: [
      { term: 'Паличка Коха', definition: 'Популярна назва бактерії Mycobacterium tuberculosis, яка є головним збудником туберкульозу в людей, відкрита Робертом Кохом у 1882 році.' },
      { term: 'Малярійний плазмодій', definition: 'Рід найпростіших (протистів), які паразитують в еритроцитах крові людини та викликають малярію. Переноситься виключно комарами Anopheles.' },
      { term: 'Млявий параліч', definition: 'Важке ускладнення поліомієліту, що характеризується раптовою втратою тонусу м\'язів та рефлексів кінцівок через ураження рухових нейронів спинного мозку.' },
      { term: 'Рисовий відвар', definition: 'Характерний вигляд водянистих випорожнень пацієнта при холері. Вони не мають специфічного запаху калу та містять злущений епітелій кишківника.' },
      { term: 'Плями Копліка', definition: 'Специфічні дрібні білуваті плями на слизовій оболонці щік навпроти кутніх зубів, які з’являються за 1-2 дні до появи висипу при кору та є патогномічним симптомом.' },
      { term: 'Вакцина КПК', definition: 'Комбінована вакцина, призначена для одночасного захисту дітей від трьох важких вірусних хвороб: кору, епідемічного паротиту (свинки) та краснухи.' },
      { term: 'Сатурація', definition: 'Показник насичення гемоглобіну артеріальної крові киснем. Критично важливий маркер при моніторингу пацієнтів із важким перебігом COVID-19.' },
      { term: 'Регідратаційна терапія', definition: 'Метод відновлення втраченої організмом рідини та солей (електролітів) за допомогою орального випоювання спеціальних сумішей, основа лікування холери.' }
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
      Дані верифіковано: 
      <a href="https://www.who.int/data/gho" target="_blank" rel="noopener noreferrer">WHO API</a> · 
      <a href="https://wonder.cdc.gov/" target="_blank" rel="noopener noreferrer">CDC WONDER</a> 
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