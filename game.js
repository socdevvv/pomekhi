(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const body = document.body;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
  const SETTINGS_KEY = 'pomekhi.settings';
  const ENDS_KEY = 'pomekhi.ends';

  const ENDINGS = {
    normal: { name: 'НОРМАЛЬНО', code: 'E-01 · ТИШИНА', num: 1, line: 'Ты не слушаешь. И это помогает.' },
    dissolve: { name: 'РАСТВОРЕНИЕ', code: 'E-02 · ФОН', num: 2, line: 'Ты стал тем, что остаётся после сигнала.' },
    layer0: { name: 'СЛОЙ 0', code: 'E-03 · ОСНОВА', num: 3, line: 'Теперь ты держишь реальность.' }
  };

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return { sound: raw.sound !== false, fx: raw.fx !== false };
    } catch (err) {
      return { sound: true, fx: true };
    }
  }

  function loadEnds() {
    try {
      const raw = JSON.parse(localStorage.getItem(ENDS_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return [...new Set(raw.filter((id) => !!ENDINGS[id]))];
    } catch (err) {
      return [];
    }
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (err) {}
  }

  function saveEnds() {
    try { localStorage.setItem(ENDS_KEY, JSON.stringify(seenEnds)); } catch (err) {}
  }

  const settings = loadSettings();
  const seenEnds = loadEnds();

  const STORY = {
    prologue: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 0,
      lines: [
        '04:03. Ты просыпаешься не от будильника.',
        'От ритма. Он идёт из стены — ровный, как сердце, которого у тебя нет.',
        'Три удара. Пауза. Снова три.',
        { t: 'Ты лежишь и слушаешь. На четвёртый раз ритм сбивается.', fx: 'glitch' }
      ],
      choices: [
        { t: 'Включить свет', go: 'light_on' },
        { t: 'Лежать неподвижно', go: 'lie_still' }
      ]
    },
    prologue_again: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 0,
      lines: [
        '04:03. Ты снова здесь.',
        'Ритм уже ждёт. Он узнаёт тебя по дыханию.',
        'Три удара. Пауза.',
        { t: 'На этот раз пауза длиннее. Как будто он слушает, что ты выберешь.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Включить свет', go: 'light_on' },
        { t: 'Лежать неподвижно', go: 'lie_still' }
      ]
    },
    light_on: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Щёлк. Комната остаётся тёмной.',
        'Лампочка гудит, но не светит.',
        'В темноте гудит что-то ещё — ниже, чем ток.',
        { t: 'Гудение складывается в слово. Ты не хочешь его разбирать.', fx: 'glitch' }
      ],
      choices: [
        { t: 'Разобрать слово', go: 'word' },
        { t: 'Не слушать', go: 'phone' }
      ]
    },
    word: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Ты вслушиваешься.',
        'Слово короткое. «Ещё».',
        'Лампочка вспыхивает и перегорает. В темноте остаётся ритм.',
        'И телефон на тумбочке начинает вибрировать.'
      ],
      next: 'phone'
    },
    lie_still: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Ты не двигаешься. Считаешь удары.',
        'На семнадцатом они заканчиваются.',
        'Тишина такая плотная, что слышно, как шумит кровь.',
        'А потом телефон на тумбочке вибрирует.'
      ],
      next: 'phone'
    },
    phone: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Экран загорается. 04:04.',
        'Сообщение от тебя. С твоего номера.',
        { t: '«не вставай. это не твоя квартира»', fx: 'glitch' },
        'Ты смотришь на строку «отправитель: я».'
      ],
      choices: [
        { t: 'Ответить', go: 'phone_reply' },
        { t: 'Заблокировать номер', go: 'phone_block' },
        { t: 'Встать и выйти в коридор', go: 'corridor' }
      ]
    },
    phone_reply: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Ты печатаешь: «кто это?»',
        'Ответ приходит мгновенно.',
        '«ты»',
        'И ещё одно: «не открывай глаза, когда они уже открыты».',
        { t: 'Ты поднимаешь взгляд от экрана.', fx: 'shake' }
      ],
      next: 'window'
    },
    phone_block: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Ты жмёшь «заблокировать». Номер исчезает из списка.',
        'Телефон вибрирует в руке.',
        'На экране — твоё лицо. Фронталка включилась сама.',
        { t: 'Ты не улыбаешься. На фото — улыбаешься.', fx: 'dereality' }
      ],
      next: 'window'
    },
    window: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Ты подходишь к окну.',
        'Улица пустая. Фонарь под окном мигает в такт ударам из стены.',
        'Под фонарём стоит человек. Он смотрит вверх.',
        'У него твоё лицо.',
        { t: 'Он поднимает руку и машет. Медленно, как под водой.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Открыть окно', go: 'window_open' },
        { t: 'Отойти от окна', go: 'eyes' }
      ]
    },
    window_open: {
      chapter: 'СЛОЙ 1', layer: 1, intensity: 1,
      lines: [
        'Рама не поддаётся. Ты дёргаешь сильнее.',
        'Человек внизу не двигается. Только машет.',
        'Стекло тёплое. С той стороны — тоже квартира. Твоя.',
        'И ты в ней стоишь у окна. И смотришь на себя.',
        { t: 'Ты опускаешь руку. Тот, внизу, тоже.', fx: 'flash' }
      ],
      next: 'eyes'
    },
    eyes: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты идёшь в ванную, не включая свет.',
        'В зеркале — ты. С опозданием на полсекунды.',
        'Ты моргаешь. Отражение — нет.',
        { t: 'Оно наклоняет голову чуть раньше, чем ты решаешь это сделать.', fx: 'glitch' }
      ],
      choices: [
        { t: 'Смотреть не мигая', go: 'stare' },
        { t: 'Уйти в коридор', go: 'corridor' }
      ]
    },
    stare: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты смотришь. Отражение тоже.',
        'Губы в зеркале шевелятся: «хватит».',
        'Ты не отводишь взгляд.',
        'Комната за спиной отражения становится длиннее.',
        { t: 'Свет в ванной гаснет. В темноте зеркало светится, как экран.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Дотронуться до стекла', go: 'touch' },
        { t: 'Выйти в коридор', go: 'corridor' }
      ]
    },
    touch: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Стекло мягкое. Палец проваливается на миллиметр.',
        'По ту сторону твоя рука тянется навстречу.',
        'На секунду вы совпадаете.',
        'Ты отдёргиваешь руку.',
        { t: 'На пальце — чужая кожа. Тёплая. И она шевелится.', fx: 'glitch' }
      ],
      next: 'corridor'
    },
    corridor: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Коридор. Обои в мелкий ромб. Ты никогда не замечал ромбы.',
        'Дверь в спальню — за спиной. Дверь в кухню — впереди.',
        'Между ними должно быть четыре шага.',
        'Ты делаешь четыре. Кухонная дверь не приблизилась.',
        'Ты делаешь ещё четыре. Она всё там же.'
      ],
      choices: [
        { t: 'Бежать', go: 'run' },
        { t: 'Идти спокойно', go: 'calm' },
        { t: 'Обернуться', go: 'turn' }
      ]
    },
    run: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты бежишь.',
        'Шаги звучат не в такт. Пол мягкий, как язык.',
        'Дверь наконец приближается.',
        'И оказывается зеркалом во весь рост.',
        'В зеркале ты стоишь на месте. И тяжело дышишь.',
        { t: 'Ты оборачиваешься. За спиной — кухня.', fx: 'flash' }
      ],
      next: 'kitchen'
    },
    calm: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты идёшь медленно. Считаешь шаги.',
        'На двадцатом сбиваешься.',
        'Ромбы на обоях складываются в слова.',
        { t: '«ты уже здесь был»', fx: 'glitch' },
        'Дверь в кухню открывается сама.'
      ],
      next: 'kitchen'
    },
    turn: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты оборачиваешься.',
        'Спальни нет. Только коридор, уходящий в темноту.',
        'Оттуда доносится ритм. Тот же.',
        'Три удара. Пауза.',
        'Ты идёшь на ритм.'
      ],
      next: 'kitchen'
    },
    kitchen: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'На кухне горит свет. Чайник кипит, хотя ты его не включал.',
        'На столе — две чашки. Одна полная. Вторая пустая.',
        'Из полной поднимается пар, хотя она холодная.',
        { t: 'За окном — та же улица. Тот же человек под фонарём. Он всё ещё машет.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Сесть и выпить', go: 'drink' },
        { t: 'Выключить чайник', go: 'kettle' },
        { t: 'Выйти из квартиры', go: 'door_out' }
      ]
    },
    drink: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты садишься. Чашка холодная.',
        'Вода на вкус как электричество.',
        'На дне — твоё отражение. Оно подмигивает.',
        'Стены кухни дышат. Медленно, в ритм.',
        { t: 'Ты ставишь чашку. Чашка ставит тебя.', fx: 'glitch' }
      ],
      next: 'door_out'
    },
    kettle: {
      chapter: 'СЛОЙ 2', layer: 2, intensity: 2,
      lines: [
        'Ты жмёшь кнопку. Чайник замолкает.',
        'Через секунду он снова кипит. Громче.',
        'Ты выдёргиваешь шнур из розетки.',
        'Кипение не прекращается.',
        { t: 'Теперь оно идёт из стены. Ритм и кипение совпадают.', fx: 'glitch' }
      ],
      next: 'door_out'
    },
    door_out: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты выходишь из квартиры.',
        'Подъезд заканчивается через два метра. Дальше — улица.',
        'Ты оборачиваешься. Твоей двери нет. Только гладкая стена.',
        'На улице ночь. Фонари горят в ритм.',
        'Сто шестьдесят ударов в минуту.'
      ],
      next: 'street'
    },
    street: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты идёшь по улице. Дома складываются, как декорации.',
        'За углом — та же улица. Ты узнаёшь трещину в асфальте.',
        'Ты идёшь быстрее. Улица повторяется.',
        'Трещина. Фонарь. Человек под фонарём.',
        'Человек поворачивается. Это ты.',
        { t: 'Он говорит: «Наконец-то».', fx: 'dereality' }
      ],
      choices: [
        { t: 'Спросить, кто он', go: 'ask' },
        { t: 'Пройти мимо', go: 'walk' },
        { t: 'Ударить', go: 'hit' }
      ]
    },
    walk: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты идёшь мимо.',
        'Он не пытается тебя остановить.',
        'Через квартал ты снова выходишь к нему.',
        'Он стоит на том же месте. Только теперь ближе.',
        { t: '«Ты не пройдёшь», — говорит он. «Пока не выберешь».', fx: 'dereality' }
      ],
      next: 'ask'
    },
    hit: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты бьёшь.',
        'Кулак проходит сквозь лицо, как сквозь дым.',
        'Человек не исчезает. Он становится тобой. В точности.',
        'Теперь вас двое. Потом трое.',
        'Улица заполняется тобой.',
        { t: 'Все поднимают голову. Все говорят одновременно: «выбери».', fx: 'glitch' }
      ],
      next: 'ask'
    },
    ask: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты стоишь напротив себя. Он ждёт.',
        '«Ты помнишь, как сюда попал?»'
      ],
      choices: [
        { t: 'Помню', go: 'ask_yes' },
        { t: 'Нет', go: 'ask_no' },
        { t: 'Это сон', go: 'ask_dream' }
      ]
    },
    ask_yes: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        '«Тогда назови последнее, что было до ритма».',
        'Ты открываешь рот.',
        'Слова нет. Только ритм.',
        'Он кивает: «Вот и я о том».'
      ],
      next: 'walk_together'
    },
    ask_no: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        '«Хорошо. Честно».',
        'Он улыбается твоей улыбкой.',
        '«Тогда можно всё исправить».',
        'Он берёт тебя за руку. Рука холодная, как стекло.'
      ],
      next: 'walk_together'
    },
    ask_dream: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        '«Сон — это когда ты просыпаешься», — говорит он.',
        '«А это — когда просыпается оно».',
        'Он показывает вверх.',
        'Небо мигает, как сломанный пиксель.',
        { t: 'На секунду ты видишь за ним ещё одно небо. И ещё одно.', fx: 'dereality' }
      ],
      next: 'walk_together'
    },
    walk_together: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Вы идёте вместе. Он — слева.',
        'Ты не помнишь, когда он оказался слева.',
        'Улица заканчивается площадью.',
        'В центре — столб света. Внутри столба — тишина.',
        '«Туда», — говорит он. «Или обратно. Обратно тоже вариант».'
      ],
      choices: [
        { t: 'Войти в свет', go: 'wake' },
        { t: 'Вернуться домой', go: 'home' }
      ]
    },
    home: {
      chapter: 'СЛОЙ 3', layer: 3, intensity: 3,
      lines: [
        'Ты идёшь назад. Улица послушно разворачивается.',
        'Дверь находится. Квартира находится. Кровать находится.',
        'Ты ложишься, не снимая обуви.',
        'Ритм стихает.',
        '04:03.',
        'Ты закрываешь глаза.'
      ],
      next: 'wake'
    },
    wake: {
      chapter: 'СЛОЙ 4', layer: 4, intensity: 2, fx: 'flash',
      lines: [
        'Ты просыпаешься от будильника.',
        '07:30. Обычное утро. За окном светит солнце.',
        'Телефон показывает двенадцать пропущенных.',
        'Все — с твоего номера.',
        'На кухне кто-то гремит чашками.',
        'Ты живёшь один.',
        { t: 'Ты садишься на кровати. Отражение в тёмном экране садится с опозданием.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Пойти на кухню', go: 'awake' },
        { t: 'Остаться в кровати', go: 'stay_bed' }
      ]
    },
    stay_bed: {
      chapter: 'СЛОЙ 4', layer: 4, intensity: 2,
      lines: [
        'Ты натягиваешь одеяло на голову.',
        'Под одеялом темно и тесно.',
        'И там тоже кто-то дышит.',
        'Ты считаешь вдохи.',
        { t: 'На третьем они перестают совпадать с твоими.', fx: 'glitch' },
        { t: 'Ты откидываешь одеяло. Кухня ждёт.', fx: 'flash' }
      ],
      next: 'awake'
    },
    awake: {
      chapter: 'СЛОЙ 0', layer: 0, intensity: 3,
      lines: [
        'На кухне сидит человек. Пьёт из твоей чашки.',
        'Поднимает глаза. Это ты. Только старше на один слой.',
        '«Ты слишком долго слушал», — говорит он.',
        '«Теперь выбирай: выключить или остаться».',
        'На столе лежит вилка от наушников.',
        'И кнопка. Просто кнопка.',
        { t: 'На секунду тебе кажется, что кто-то читает эти строки. Ты не уверен, что это не ты.', fx: 'glitch' }
      ],
      choices: [
        { t: 'Выключить', go: 'ending_normal' },
        { t: 'Остаться', go: 'void' },
        { t: 'Спросить, что это', go: 'ask_what' }
      ]
    },
    ask_what: {
      chapter: 'СЛОЙ 0', layer: 0, intensity: 3,
      lines: [
        '«Это помехи», — говорит он.',
        '«Всё, что не совпало с реальностью».',
        '«Она не любит, когда её слушают слишком внимательно».',
        'Он отставляет чашку.',
        '«Можно уйти в тишину. Или остаться здесь, где нас много».',
        '«Только помни: тишина — тоже сигнал».'
      ],
      choices: [
        { t: 'Выключить', go: 'ending_normal' },
        { t: 'Остаться', go: 'void' }
      ]
    },
    void: {
      chapter: 'СЛОЙ −1', layer: 0, intensity: 4, fx: 'flash',
      lines: [
        'Ты не нажимаешь кнопку.',
        'Ты выбираешь тишину между ударами.',
        'Комната растворяется в ней.',
        'Сначала звук. Потом цвет. Потом ты.',
        'Остаётся только слой.',
        'Ноль. Не пустота — основа, на которой держится всё.',
        'Здесь нет времени.',
        'Здесь есть только ты и то, что ты помнишь.',
        { t: 'Ритм больше не снаружи. Он внутри.', fx: 'dereality' }
      ],
      choices: [
        { t: 'Вспомнить себя', go: 'ending_dissolve' },
        { t: 'Слушать дальше', go: 'ending_layer0' }
      ]
    },
    ending_normal: {
      end: 'normal',
      chapter: 'СЛОЙ 0', layer: 0, intensity: 1,
      lines: [
        'Ты нажимаешь кнопку.',
        'Не щелчок. Просто мир становится на место, как кость в суставе.',
        '07:30. Солнце. Обычное утро.',
        'Чашки на кухне стоят там, где должны.',
        'Ты больше не слышишь ритм.',
        'Иногда, в тишине, тебе кажется, что стена дышит.',
        'Но ты не слушаешь.'
      ],
      endLine: 'Ты не слушаешь. И это помогает.'
    },
    ending_dissolve: {
      end: 'dissolve',
      chapter: 'СЛОЙ 0', layer: 0, intensity: 1,
      lines: [
        'Ты вспоминаешь всё сразу.',
        'Комнату. Улицу. Себя под фонарём. Себя на кухне.',
        'Воспоминание ярче реальности.',
        'Реальность не выдерживает и отступает.',
        'Ты растворяешься.',
        'Не исчезаешь — становишься фоном.',
        'Где-то в 04:03 кто-то просыпается от ритма.',
        'Это ты. Уже без тела.'
      ],
      endLine: 'Ты стал тем, что остаётся после сигнала.'
    },
    ending_layer0: {
      end: 'layer0',
      chapter: 'СЛОЙ 0', layer: 0, intensity: 1,
      lines: [
        'Ты остаёшься.',
        'Слой ноль принимает тебя.',
        'Здесь много таких, как ты.',
        'Тех, кто слушал слишком внимательно.',
        'Теперь вы вместе держите реальность.',
        'Не даёте ей расползтись.',
        'Иногда ты подаёшь сигнал в другой слой.',
        'Кто-то просыпается в 04:03 и слушает.',
        'Три удара. Пауза. Снова три.'
      ],
      endLine: 'Теперь ты держишь реальность.'
    }
  };

  const Sound = (() => {
    let ctx = null;
    let master = null;
    let comp = null;
    let drums = null;
    let music = null;
    let noise = null;
    let droneGain = null;
    const droneOsc = [];
    let timer = null;
    let running = false;
    let nextTime = 0;
    let step = 0;
    let bpm = 160;
    let intensity = 0;

    function build() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC(); } catch (err) { return false; }
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 22;
      comp.ratio.value = 6;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(comp);
      comp.connect(ctx.destination);
      drums = ctx.createGain();
      drums.gain.value = 0.9;
      drums.connect(master);
      music = ctx.createGain();
      music.gain.value = 0.55;
      music.connect(master);
      const len = Math.max(1, Math.floor(ctx.sampleRate * 2));
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      makeDrone();
      return true;
    }

    function makeDrone() {
      if (!ctx) return;
      droneGain = ctx.createGain();
      droneGain.gain.value = 0.0001;
      droneGain.connect(music);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 240;
      lp.Q.value = 1.6;
      lp.connect(droneGain);
      [55, 55.5, 110.3].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 2 ? 'triangle' : 'sawtooth';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = i === 2 ? 0.05 : 0.14;
        osc.connect(gain);
        gain.connect(lp);
        osc.start();
        droneOsc.push(osc);
      });
      droneGain.gain.setTargetAtTime(0.3, ctx.currentTime, 1.2);
    }

    function start() {
      if (!build()) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      running = true;
      if (!timer) timer = setInterval(schedule, 25);
      nextTime = ctx.currentTime + 0.06;
      step = 0;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(settings.sound ? 0.5 : 0, ctx.currentTime, 0.12);
      setIntensity(intensity);
    }

    function quiet() {
      running = false;
      if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.18);
    }

    function setEnabled(on) {
      if (!ctx) return;
      master.gain.setTargetAtTime(on && running ? 0.5 : 0, ctx.currentTime, 0.08);
    }

    function setIntensity(n) {
      const value = Number.isFinite(n) ? n : 0;
      intensity = Math.max(0, Math.min(4, Math.round(value)));
      bpm = [150, 160, 168, 176, 188][intensity];
      if (ctx && droneGain) {
        droneGain.gain.setTargetAtTime([0.26, 0.3, 0.34, 0.38, 0.42][intensity], ctx.currentTime, 0.8);
      }
    }

    function schedule() {
      if (!ctx || !running || ctx.state !== 'running') return;
      if (nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.05;
      while (nextTime < ctx.currentTime + 0.12) {
        playStep(step, nextTime);
        nextTime += (60 / bpm) / 4;
        step++;
      }
    }

    function playStep(s, t) {
      const b = s % 16;
      if (intensity === 0) {
        if (b === 0 || b === 8) kick(t, 0.3);
        if (b === 14) hat(t, 0.025);
        return;
      }
      if (intensity === 1) {
        if (b % 4 === 0) kick(t, 0.42);
        if (b === 2 || b === 6 || b === 10 || b === 14) hat(t, 0.035);
        if (b === 8) snare(t, 0.16);
        if (b === 0 || b === 8) bass(t, 55, 0.11, 0.3);
        return;
      }
      if (intensity === 2) {
        const kicks = [0, 4, 8, 12, 14];
        if (kicks.includes(b)) kick(t, b === 14 ? 0.32 : 0.52);
        if (b === 4 || b === 12) snare(t, 0.3);
        if (b % 2 === 0) hat(t, b === 6 ? 0.07 : 0.04, b === 14);
        if (b === 10) hat(t, 0.045, true);
        const bassPat = [55, 0, 0, 55, 0, 0, 41.2, 0, 55, 0, 0, 61.7, 0, 0, 41.2, 0];
        if (bassPat[b]) bass(t, bassPat[b], 0.14, 0.16);
        return;
      }
      if (intensity === 3) {
        const kicks = [0, 2, 3, 7, 8, 10, 11, 14];
        if (kicks.includes(b)) kick(t, 0.52);
        if (b === 4 || b === 12) snare(t, 0.36);
        if (b === 7 || b === 15) snare(t, 0.16);
        hat(t, b % 2 === 0 ? 0.04 : 0.022, b === 6 || b === 14);
        const bassPat = [55, 0, 0, 41.2, 0, 0, 61.7, 0, 0, 55, 0, 49, 0, 0, 61.7, 0];
        if (bassPat[b]) bass(t, bassPat[b], 0.15, 0.15);
        if (b === 13 && Math.random() < 0.35) {
          for (let i = 0; i < 3; i++) hat(t + i * 0.03, 0.04);
        }
        return;
      }
      if (Math.random() < 0.5) kick(t, 0.46);
      if (b === 4 || b === 12 || Math.random() < 0.1) snare(t, 0.34);
      hat(t, 0.028);
      if (b % 4 === 0) bass(t, [55, 41.2, 61.7, 49][(s >> 2) % 4], 0.15, 0.12);
      if (b === 6 || b === 14) {
        for (let i = 0; i < 4; i++) hat(t + i * 0.025, 0.045);
      }
      if (b === 15 && Math.random() < 0.28) {
        for (let i = 0; i < 3; i++) kick(t + i * 0.04, 0.28);
      }
    }

    function kick(t, gainValue) {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.11);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      osc.connect(gain);
      gain.connect(drums);
      osc.start(t);
      osc.stop(t + 0.3);
    }

    function snare(t, gainValue) {
      if (!ctx) return;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1400;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2600;
      bp.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainValue, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      src.connect(hp);
      hp.connect(bp);
      bp.connect(gain);
      gain.connect(drums);
      src.start(t);
      src.stop(t + 0.2);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
      const og = ctx.createGain();
      og.gain.setValueAtTime(gainValue * 0.5, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(og);
      og.connect(drums);
      osc.start(t);
      osc.stop(t + 0.1);
    }

    function hat(t, gainValue, open) {
      if (!ctx) return;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7500;
      const gain = ctx.createGain();
      const dur = open ? 0.18 : 0.045;
      gain.gain.setValueAtTime(gainValue, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(hp);
      hp.connect(gain);
      gain.connect(drums);
      src.start(t);
      src.stop(t + dur + 0.01);
    }

    function bass(t, freq, gainValue, dur) {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(420, t);
      lp.frequency.exponentialRampToValueAtTime(140, t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(music);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    function impact() {
      if (!ctx || !running || !settings.sound) return;
      const t = ctx.currentTime + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      osc.connect(gain);
      gain.connect(drums);
      osc.start(t);
      osc.stop(t + 0.85);
    }

    function glitch(strong) {
      if (!ctx || !running || !settings.sound) return;
      const t = ctx.currentTime + 0.01;
      for (let i = 0; i < 6; i++) hat(t + i * 0.03, 0.065);
      for (let i = 0; i < 4; i++) kick(t + i * 0.045, 0.3);
      if (strong) snare(t, 0.26);
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1200, t);
      bp.frequency.exponentialRampToValueAtTime(6500, t + 0.18);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      src.connect(bp);
      bp.connect(gain);
      gain.connect(drums);
      src.start(t);
      src.stop(t + 0.22);
    }

    function ui() {
      if (!ctx || !running || !settings.sound) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(740, t);
      gain.gain.setValueAtTime(0.022, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.06);
    }

    return {
      start,
      quiet,
      setEnabled,
      setIntensity,
      impact,
      glitch,
      ui,
      started: () => !!ctx && running,
      intensity: () => intensity
    };
  })();

  const titleScreen = $('#titleScreen');
  const gameScreen = $('#gameScreen');
  const endScreen = $('#endScreen');
  const chapterEl = $('#chapter');
  const stabLabel = $('#stabLabel');
  const stabFill = $('#stabFill');
  const lineEl = $('#lineText');
  const ghostEl = $('#ghost');
  const choicesEl = $('#choices');
  const hintEl = $('#hint');
  const btnStart = $('#btnStart');
  const btnAgain = $('#btnAgain');
  const btnTitle = $('#btnTitle');
  const btnSound = $('#btnSound');
  const btnFx = $('#btnFx');
  const btnSoundTitle = $('#btnSoundTitle');
  const btnFxTitle = $('#btnFxTitle');
  const titleEnds = $('#titleEnds');
  const endNameEl = $('#endName');
  const endCodeEl = $('#endCode');
  const endLineEl = $('#endLine');
  const endNumEl = $('#endNum');
  const endChips = $('#endChips');
  const flashEl = $('#flash');
  const signalEl = $('#signal');

  const state = {
    mode: 'title',
    id: null,
    line: 0,
    typing: false,
    lineDone: false,
    choicesShown: false,
    i: 0,
    currentText: '',
    charTimer: null,
    scrambleTimer: null,
    chapter: 'СЛОЙ 1',
    layer: 1,
    intensity: 0,
    stability: 100,
    fast: false,
    signalShown: false
  };

  let signalTimer = null;

  function updateStability() {
    const value = Math.max(0, Math.min(100, Math.round(state.stability)));
    stabLabel.textContent = value + '%';
    stabFill.style.width = value + '%';
    document.documentElement.style.setProperty('--instab', (1 - value / 100).toFixed(3));
    body.classList.toggle('low-stab', value < 32);
  }

  function stabilityHit(amount) {
    state.stability = Math.max(2, state.stability - amount);
    updateStability();
  }

  function updateHint(kind) {
    if (kind === 'choice') {
      hintEl.style.opacity = '0';
      return;
    }
    hintEl.style.opacity = '';
    if (kind === 'end') hintEl.textContent = 'клик · space — закрыть слой';
    else if (kind === 'typing') hintEl.textContent = 'клик · space — досказать';
    else hintEl.textContent = 'клик · space — дальше';
  }

  function flashScreen() {
    if (!settings.fx) return;
    flashEl.classList.remove('on');
    void flashEl.offsetWidth;
    flashEl.classList.add('on');
    setTimeout(() => flashEl.classList.remove('on'), 520);
  }

  function shakeScreen() {
    if (!settings.fx) return;
    body.classList.remove('fx-shake');
    void body.offsetWidth;
    body.classList.add('fx-shake');
    setTimeout(() => body.classList.remove('fx-shake'), 480);
  }

  function showSignal() {
    if (signalTimer) clearTimeout(signalTimer);
    signalEl.classList.remove('on');
    void signalEl.offsetWidth;
    signalEl.classList.add('on');
    signalTimer = setTimeout(() => signalEl.classList.remove('on'), 1050);
  }

  function applyLineFx(line) {
    const fx = line.fx;
    if (!fx) return;
    if (fx === 'glitch') {
      stabilityHit(3);
      if (settings.fx) {
        body.classList.add('fx-glitch');
        setTimeout(() => body.classList.remove('fx-glitch'), 470);
      }
      Sound.glitch();
    } else if (fx === 'dereality') {
      stabilityHit(6);
      if (settings.fx) {
        body.classList.add('fx-dereality');
        setTimeout(() => body.classList.remove('fx-dereality'), 1500);
        ghostEl.textContent = line.t || '';
        ghostEl.classList.add('on');
        setTimeout(() => ghostEl.classList.remove('on'), 1500);
      }
      Sound.glitch(true);
    } else if (fx === 'flash') {
      stabilityHit(4);
      flashScreen();
      Sound.impact();
    } else if (fx === 'shake') {
      shakeScreen();
    }
  }

  function scrambleText() {
    if (!settings.fx) return;
    const original = state.currentText;
    if (!original) return;
    if (state.scrambleTimer) clearInterval(state.scrambleTimer);
    const glyphs = '#@%&▓▒░<>/\\|=+*';
    let n = 0;
    state.scrambleTimer = setInterval(() => {
      if (state.currentText !== original) {
        clearInterval(state.scrambleTimer);
        state.scrambleTimer = null;
        return;
      }
      let out = '';
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        out += ch !== ' ' && Math.random() < 0.2 ? glyphs[Math.floor(Math.random() * glyphs.length)] : ch;
      }
      lineEl.textContent = out;
      n++;
      if (n >= 9) {
        clearInterval(state.scrambleTimer);
        state.scrambleTimer = null;
        lineEl.textContent = original;
      }
    }, 30);
  }

  function getLine() {
    const node = STORY[state.id];
    if (!node) return { t: '' };
    const raw = node.lines[state.line];
    return typeof raw === 'string' ? { t: raw } : raw;
  }

  function hideChoices() {
    choicesEl.classList.remove('on');
    choicesEl.innerHTML = '';
    state.choicesShown = false;
    updateHint('next');
  }

  function typeLine() {
    const node = STORY[state.id];
    if (!node) return;
    clearTimeout(state.charTimer);
    if (state.scrambleTimer) {
      clearInterval(state.scrambleTimer);
      state.scrambleTimer = null;
    }
    state.typing = true;
    state.lineDone = false;
    state.choicesShown = false;
    choicesEl.classList.remove('on');
    choicesEl.innerHTML = '';
    const line = getLine();
    state.currentText = line.t || '';
    ghostEl.textContent = '';
    ghostEl.classList.remove('on');
    lineEl.textContent = '';
    updateHint('typing');
    applyLineFx(line);
    if (state.fast || prefersReduced) {
      lineEl.textContent = state.currentText;
      finishTyping();
      return;
    }
    state.i = 0;
    const tick = () => {
      if (!state.typing) return;
      const text = state.currentText;
      if (state.i >= text.length) {
        finishTyping();
        return;
      }
      lineEl.textContent += text[state.i++];
      const ch = text[state.i - 1];
      let delay = 15;
      if ('.!?…'.includes(ch)) delay = 118;
      else if (',;:—'.includes(ch)) delay = 52;
      else if (ch === ' ') delay = 22;
      delay *= 0.8 + Math.random() * 0.5;
      state.charTimer = setTimeout(tick, delay);
    };
    tick();
  }

  function finishTyping() {
    clearTimeout(state.charTimer);
    state.charTimer = null;
    if (!state.typing && state.lineDone) return;
    state.typing = false;
    state.lineDone = true;
    lineEl.textContent = state.currentText;
    const line = getLine();
    if (line.fx === 'glitch') scrambleText();
    afterLine();
  }

  function afterLine() {
    const node = STORY[state.id];
    if (!node) return;
    const last = state.line >= node.lines.length - 1;
    if (!last) {
      updateHint('next');
      return;
    }
    if (node.choices && node.choices.length) {
      updateHint('choice');
      const atId = state.id;
      const atLine = state.line;
      setTimeout(() => {
        if (state.mode === 'game' && state.id === atId && state.line === atLine && state.lineDone && !state.typing) {
          showChoices(node.choices);
        }
      }, 300);
    } else if (node.end) {
      updateHint('end');
    } else {
      updateHint('next');
    }
  }

  function showChoices(choices) {
    if (!choices || !choices.length) return;
    if (state.choicesShown) return;
    state.choicesShown = true;
    choicesEl.innerHTML = '';
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.textContent = choice.t;
      button.appendChild(num);
      button.appendChild(label);
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        pick(choice);
      });
      choicesEl.appendChild(button);
    });
    requestAnimationFrame(() => choicesEl.classList.add('on'));
    updateHint('choice');
  }

  function pick(choice) {
    if (!choice || !STORY[choice.go]) return;
    state.choicesShown = false;
    choicesEl.classList.remove('on');
    choicesEl.innerHTML = '';
    Sound.ui();
    if (choice.fx) {
      if (choice.fx === 'flash') flashScreen();
      else if (choice.fx === 'shake') shakeScreen();
    }
    go(choice.go);
  }

  function go(id) {
    const node = STORY[id];
    if (!node) return;
    clearTimeout(state.charTimer);
    if (state.scrambleTimer) {
      clearInterval(state.scrambleTimer);
      state.scrambleTimer = null;
    }
    state.id = id;
    state.line = 0;
    state.typing = false;
    state.lineDone = false;
    state.choicesShown = false;
    state.currentText = '';
    choicesEl.classList.remove('on');
    choicesEl.innerHTML = '';
    ghostEl.textContent = '';
    ghostEl.classList.remove('on');
    if (node.chapter) {
      state.chapter = node.chapter;
      chapterEl.textContent = node.chapter;
    }
    if (typeof node.layer === 'number') state.layer = node.layer;
    if (typeof node.intensity === 'number') state.intensity = node.intensity;
    Sound.setIntensity(state.intensity);
    const cap = state.layer === 0 ? 10 : Math.max(6, 100 - (state.layer - 1) * 20 - (state.intensity >= 3 ? 8 : 0));
    state.stability = Math.min(state.stability, cap);
    updateStability();
    if (id === 'street' && !state.signalShown) {
      state.signalShown = true;
      setTimeout(() => {
        if (state.mode === 'game') {
          showSignal();
          Sound.glitch(true);
        }
      }, 900);
    }
    if (node.fx === 'flash') {
      flashScreen();
      Sound.impact();
    } else if (node.fx === 'shake') {
      shakeScreen();
    } else if (node.fx === 'glitch') {
      if (settings.fx) {
        body.classList.add('fx-glitch');
        setTimeout(() => body.classList.remove('fx-glitch'), 470);
      }
      Sound.glitch();
    } else if (node.fx === 'dereality') {
      if (settings.fx) {
        body.classList.add('fx-dereality');
        setTimeout(() => body.classList.remove('fx-dereality'), 1500);
      }
      Sound.glitch(true);
    }
    typeLine();
  }

  function advance() {
    if (state.mode !== 'game') return;
    if (state.typing) {
      finishTyping();
      return;
    }
    if (state.choicesShown) return;
    const node = STORY[state.id];
    if (!node) return;
    if (state.line < node.lines.length - 1) {
      state.line++;
      typeLine();
      return;
    }
    if (node.choices && node.choices.length) {
      showChoices(node.choices);
      return;
    }
    if (node.end) {
      showEnding(node.end);
      return;
    }
    if (node.next) go(node.next);
  }

  function startGame() {
    state.mode = 'game';
    state.stability = 100;
    state.signalShown = false;
    state.chapter = 'СЛОЙ 1';
    state.layer = 1;
    state.intensity = 0;
    state.line = 0;
    state.id = null;
    clearTimeout(state.charTimer);
    if (state.scrambleTimer) {
      clearInterval(state.scrambleTimer);
      state.scrambleTimer = null;
    }
    titleScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    body.dataset.mode = 'game';
    chapterEl.textContent = 'СЛОЙ 1';
    updateStability();
    hideChoices();
    ghostEl.classList.remove('on');
    Sound.start();
    Sound.ui();
    go(seenEnds.length > 0 ? 'prologue_again' : 'prologue');
  }

  function showEnding(id) {
    const meta = ENDINGS[id];
    if (!meta) return;
    const node = STORY['ending_' + id];
    if (!seenEnds.includes(id)) {
      seenEnds.push(id);
      saveEnds();
    }
    state.mode = 'end';
    state.typing = false;
    clearTimeout(state.charTimer);
    if (state.scrambleTimer) {
      clearInterval(state.scrambleTimer);
      state.scrambleTimer = null;
    }
    hideChoices();
    gameScreen.classList.add('hidden');
    titleScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    body.dataset.mode = 'end';
    body.classList.remove('low-stab', 'fx-glitch', 'fx-dereality', 'fx-shake');
    ghostEl.classList.remove('on');
    Sound.setIntensity(1);
    let text = node && node.endLine ? node.endLine : meta.line;
    if (seenEnds.length >= 3) text += ' Все слои собраны.';
    endNameEl.textContent = meta.name;
    endCodeEl.textContent = meta.code;
    endLineEl.textContent = text;
    endNumEl.textContent = meta.num + ' / 3';
    renderEndChips();
    renderTitleEnds();
  }

  function toTitle() {
    state.mode = 'title';
    state.id = null;
    state.typing = false;
    state.lineDone = false;
    state.choicesShown = false;
    state.currentText = '';
    clearTimeout(state.charTimer);
    if (state.scrambleTimer) {
      clearInterval(state.scrambleTimer);
      state.scrambleTimer = null;
    }
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
    body.dataset.mode = 'title';
    body.classList.remove('low-stab', 'fx-glitch', 'fx-dereality', 'fx-shake');
    lineEl.textContent = '';
    ghostEl.classList.remove('on');
    choicesEl.classList.remove('on');
    choicesEl.innerHTML = '';
    hintEl.style.opacity = '';
    Sound.quiet();
    renderTitleEnds();
  }

  function renderTitleEnds() {
    titleEnds.innerHTML = '';
    const label = document.createElement('span');
    label.textContent = 'концовки';
    titleEnds.appendChild(label);
    Object.keys(ENDINGS).forEach((id) => {
      const dot = document.createElement('i');
      dot.className = 'end-dot' + (seenEnds.includes(id) ? ' seen' : '');
      dot.title = seenEnds.includes(id) ? ENDINGS[id].name : 'не найдена';
      titleEnds.appendChild(dot);
    });
    const count = document.createElement('span');
    count.textContent = seenEnds.length + ' / 3';
    titleEnds.appendChild(count);
  }

  function renderEndChips() {
    endChips.innerHTML = '';
    Object.keys(ENDINGS).forEach((id) => {
      const meta = ENDINGS[id];
      const chip = document.createElement('div');
      const seen = seenEnds.includes(id);
      chip.className = 'end-chip' + (seen ? ' seen' : '');
      chip.textContent = seen ? meta.name : '???';
      chip.title = meta.code;
      endChips.appendChild(chip);
    });
  }

  function syncToggles() {
    btnSoundTitle.textContent = 'звук: ' + (settings.sound ? 'вкл' : 'выкл');
    btnFxTitle.textContent = 'эффекты: ' + (settings.fx ? 'вкл' : 'выкл');
    btnSound.classList.toggle('off', !settings.sound);
    btnFx.classList.toggle('off', !settings.fx);
    btnSound.setAttribute('aria-pressed', String(settings.sound));
    btnFx.setAttribute('aria-pressed', String(settings.fx));
    btnSound.title = settings.sound ? 'звук: вкл' : 'звук: выкл';
    btnFx.title = settings.fx ? 'эффекты: вкл' : 'эффекты: выкл';
  }

  function toggleSound() {
    settings.sound = !settings.sound;
    saveSettings();
    syncToggles();
    if (settings.sound) {
      Sound.setEnabled(true);
      Sound.ui();
    } else {
      Sound.setEnabled(false);
    }
  }

  function toggleFx() {
    settings.fx = !settings.fx;
    saveSettings();
    syncToggles();
    if (!settings.fx) {
      body.classList.remove('fx-glitch', 'fx-dereality', 'fx-shake');
      ghostEl.classList.remove('on');
    }
  }

  function handleAdvanceClick(event) {
    if (state.mode !== 'game') return;
    if (event.target.closest('button, a, input, textarea, select')) return;
    advance();
  }

  function handleKey(event) {
    if (state.mode !== 'game') return;
    const tag = event.target && event.target.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      advance();
    }
  }

  function autoStep() {
    if (state.mode !== 'game') return 'mode:' + state.mode;
    if (state.typing) {
      finishTyping();
      return 'finish';
    }
    const node = STORY[state.id];
    if (!node) return 'no-node';
    if (state.line < node.lines.length - 1) {
      state.line++;
      typeLine();
      return 'line';
    }
    if (node.choices && node.choices.length) {
      pick(node.choices[0]);
      return 'choice';
    }
    if (node.end) {
      showEnding(node.end);
      return 'ending';
    }
    if (node.next) {
      go(node.next);
      return 'next';
    }
    return 'stuck';
  }

  btnStart.addEventListener('click', startGame);
  btnAgain.addEventListener('click', startGame);
  btnTitle.addEventListener('click', toTitle);
  btnSound.addEventListener('click', toggleSound);
  btnFx.addEventListener('click', toggleFx);
  btnSoundTitle.addEventListener('click', toggleSound);
  btnFxTitle.addEventListener('click', toggleFx);
  document.addEventListener('click', handleAdvanceClick);
  document.addEventListener('keydown', handleKey);

  setInterval(() => {
    if (state.mode !== 'game' || state.intensity < 3 || !settings.fx) return;
    if (chapterEl.textContent !== state.chapter) return;
    chapterEl.textContent = Math.random() < 0.5 ? 'СЛОЙ ?' : 'СЛОЙ NaN';
    setTimeout(() => {
      if (state.mode === 'game') chapterEl.textContent = state.chapter;
    }, 240);
  }, 7600);

  syncToggles();
  renderTitleEnds();
  updateStability();
  body.dataset.mode = 'title';

  if (DEBUG) {
    window.__vn = {
      state,
      story: STORY,
      endings: ENDINGS,
      start: startGame,
      title: toTitle,
      go,
      advance,
      choose(index) {
        const node = STORY[state.id];
        if (node && node.choices && node.choices[index]) pick(node.choices[index]);
      },
      autoStep,
      goEnd: showEnding,
      setFast(value) { state.fast = value !== false; },
      seen: () => seenEnds.slice(),
      sound: () => ({ started: Sound.started(), intensity: Sound.intensity(), enabled: settings.sound }),
      validate() {
        const missing = [];
        Object.keys(STORY).forEach((id) => {
          const node = STORY[id];
          if (node.next && !STORY[node.next]) missing.push(id + ' -> ' + node.next);
          (node.choices || []).forEach((choice) => {
            if (!STORY[choice.go]) missing.push(id + ' -> ' + choice.go);
          });
          if (node.end && !ENDINGS[node.end]) missing.push(id + ' -> ending ' + node.end);
        });
        Object.keys(ENDINGS).forEach((id) => {
          if (!STORY['ending_' + id]) missing.push('endings -> ' + id);
        });
        return missing;
      }
    };
  }
})();
