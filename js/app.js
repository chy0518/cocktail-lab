(function () {
  const APP_TITLE = "调酒实验室";
  const ERROR_MESSAGE = "哎呀，出错了，请重启试试吧~";
  const STORAGE_KEY = "cocktail-lab-state";
  const CELLAR_STORAGE_KEY = "cocktail-lab-cellar";
  const CHALLENGE_TOTAL_ROUNDS = 5;
  const SOUND_ROOT = "./audio";
  const BGM_SRC = SOUND_ROOT + "/riverFlowsInYou-half.mp3";
  const SOUND_EFFECTS = {
    addWater: SOUND_ROOT + "/加水.mp3",
    addIce: SOUND_ROOT + "/丢入冰块.mp3",
    addFruit: SOUND_ROOT + "/加水果.mp3",
    shake: SOUND_ROOT + "/摇晃.mp3",
  };

  const LIMITS = {
    basePours: { min: 1, max: 4 },
    mixerKinds: 2,
    mixerPours: { min: 1, max: 4 },
    flavorKinds: 2,
    posterNameMax: 12,
    posterNoteMax: 36,
    posterSignatureMax: 12,
  };

  const STEPS = [
    { id: "base", label: "基酒", helper: "先选一支基酒，决定这杯酒的底色。" },
    { id: "mixer", label: "辅料", helper: "往杯里继续加料，让它慢慢成形。" },
    { id: "flavor", label: "风味材料", helper: "把风味放到一旁，最后再点亮这杯酒。" },
    { id: "method", label: "调制方式", helper: "决定它是被摇匀、搅开，还是轻轻分层。" },
    { id: "glass", label: "杯型", helper: "最后替它挑一个合适的杯子。" },
    { id: "poster", label: "海报", helper: "给这杯酒取个名字，留下今晚的心情。" },
  ];

  const BASES = [
    { id: "gin", name: "金酒", palette: "crystal", strength: 3, clarity: 5, fill: 1, icon: "./images/icon/gin.webp" },
    { id: "rum", name: "朗姆酒", palette: "amber", strength: 3, clarity: 3, fill: 1, icon: "./images/icon/rum.webp" },
    { id: "vodka", name: "伏特加", palette: "crystal", strength: 2, clarity: 5, fill: 1, icon: "./images/icon/vodka.webp" },
    { id: "tequila", name: "龙舌兰", palette: "sunset", strength: 3, clarity: 3, fill: 1, icon: "./images/icon/tequila.webp" },
    { id: "whiskey", name: "威士忌", palette: "amber", strength: 4, clarity: 2, fill: 1, icon: "./images/icon/whisky.webp" },
    { id: "sparkling-water", name: "气泡水", palette: "crystal", strength: 1, clarity: 5, fill: 1, icon: "./images/icon/sparklingWater.webp" },
  ];

  const MIXERS = [
    { id: "syrup", name: "糖浆", palette: "amber", strength: 1, clarityShift: -1, fill: 0.6, bubble: 0, ice: 0, foam: 1, icon: "./images/icon/糖浆.webp" },
    { id: "bitters", name: "苦精", palette: "tea", strength: 1, clarityShift: 0, fill: 0.3, bubble: 0, ice: 0, foam: 0, icon: "./images/icon/苦精.webp" },
    { id: "soda", name: "苏打顶", palette: "crystal", strength: 1, clarityShift: 2, fill: 0.8, bubble: 3, ice: 0, foam: 1, icon: "./images/icon/sparklingWater.webp" },
    { id: "cola", name: "可乐", palette: "cola", strength: 4, clarityShift: -2, fill: 0.9, bubble: 1, ice: 0, foam: 0, icon: "./images/icon/可乐.webp" },
    { id: "tea", name: "红茶", palette: "tea", strength: 3, clarityShift: -1, fill: 0.8, bubble: 0, ice: 0, foam: 0, icon: "./images/icon/红茶.webp" },
    { id: "ice", name: "冰块", palette: "crystal", strength: 0, clarityShift: 1, fill: 0.2, bubble: 0, ice: 3, foam: 0, icon: "./images/icon/冰块.webp" },
  ];

  const FLAVORS = [
    { id: "lemon", name: "柠檬", accent: "sunset", garnish: "柠檬片", icon: "./images/icon/柠檬.webp" },
    { id: "lime", name: "青柠", accent: "lime", garnish: "青柠片", icon: "./images/icon/青柠.webp" },
    { id: "orange", name: "橙子", accent: "sunset", garnish: "橙皮卷", icon: "./images/icon/橙子.webp" },
    { id: "strawberry", name: "草莓", accent: "berry", garnish: "草莓果粒", icon: "./images/icon/草莓.webp" },
    { id: "peach", name: "蜜桃", accent: "sunset", garnish: "蜜桃片", icon: "./images/icon/蜜桃.webp" },
    { id: "cranberry", name: "覆盆子", accent: "berry", garnish: "莓果串", icon: "./images/icon/覆盆子.webp" },
    { id: "pineapple", name: "菠萝", accent: "amber", garnish: "菠萝角", icon: "./images/icon/菠萝.webp" },
    { id: "blueberry", name: "蓝莓", accent: "ocean", garnish: "蓝莓串", icon: "./images/icon/蓝莓.webp" },
  ];

  const METHODS = [
    { id: "shaken", name: "摇和", needsShake: true, clarityShift: -1 },
    { id: "stirred", name: "搅拌", needsShake: false, clarityShift: 1 },
    { id: "layered", name: "轻倒分层", needsShake: false, clarityShift: 0 },
    { id: "built", name: "直接兑和", needsShake: false, clarityShift: 0 },
  ];

  const GLASSES = [
    { id: "highball", name: "长饮杯", shape: "tall" },
    { id: "rocks", name: "古典杯", shape: "short" },
    { id: "martini", name: "马天尼杯", shape: "martini" },
    { id: "champagne", name: "香槟杯", shape: "slim" },
    { id: "goblet", name: "高脚杯", shape: "round" },
  ];

  const THEMES = [
    { id: "warm-night", name: "暖夜黑金", background: "linear-gradient(180deg, rgba(18,13,10,0.08), rgba(18,13,10,0.32))" },
    { id: "sunset-glow", name: "日落橙粉", background: "linear-gradient(180deg, rgba(89,25,23,0.12), rgba(171,68,45,0.38))" },
    { id: "ocean-dream", name: "海洋蓝绿", background: "linear-gradient(180deg, rgba(7,22,27,0.14), rgba(16,84,92,0.36))" },
  ];

  const POSTER_IMAGE_ROOT = "./images/finished-cocktails-webp";
  const POSTER_COLOR_LABELS = {
    orange: "橙",
    pink: "粉",
    purple: "紫",
    amber: "琥珀",
    yellow: "黄",
  };
  const POSTER_COLOR_FOLDERS = {
    orange: "橙色",
    pink: "粉色",
    purple: "紫色",
    amber: "琥珀色",
    yellow: "黄色",
  };
  const POSTER_COLOR_TIEBREAK = ["purple", "pink", "orange", "amber", "yellow"];
  const POSTER_FALLBACK_CATEGORY_BY_PALETTE = {
    crystal: "yellow",
    lime: "yellow",
    amber: "amber",
    tea: "amber",
    berry: "pink",
    sunset: "orange",
    cola: "amber",
    ocean: "purple",
  };
  const POSTER_COLOR_WEIGHTS = {
    base: {
      gin: { yellow: 3 },
      rum: { amber: 4, orange: 1 },
      vodka: { yellow: 3, pink: 1 },
      tequila: { orange: 4, yellow: 1 },
      whiskey: { amber: 5, orange: 1 },
      "sparkling-water": { yellow: 3 },
    },
    mixer: {
      syrup: { amber: 2, yellow: 1 },
      bitters: { amber: 2 },
      soda: { yellow: 3 },
      cola: { amber: 4 },
      tea: { amber: 3 },
      ice: { yellow: 1 },
    },
    flavor: {
      lemon: { yellow: 4 },
      lime: { yellow: 4 },
      orange: { orange: 5 },
      peach: { orange: 4, pink: 1 },
      strawberry: { pink: 5 },
      cranberry: { pink: 4, purple: 1 },
      pineapple: { yellow: 4, orange: 1 },
      blueberry: { purple: 5, pink: 1 },
    },
  };
  const POSTER_GLASS_MATCH = {
    highball: ["柯林杯", "飓风杯", "香槟杯"],
    rocks: ["古典杯", "柯林杯"],
    martini: ["马天尼杯", "香槟杯", "玛格丽特杯"],
    champagne: ["香槟杯", "马天尼杯", "柯林杯"],
    goblet: ["飓风杯", "玛格丽特杯", "香槟杯", "柯林杯"],
  };
  const POSTER_IMAGE_MANIFEST = {
    橙色: {
      古典杯: [
        "橙色/橙色-古典杯-s02_r2c1.png",
        "橙色/橙色-古典杯-s04_r2c1.png",
        "橙色/橙色-古典杯-s07_r2c1.png",
      ],
      柯林杯: [
        "橙色/橙色-柯林杯-s04_r1c1.png",
        "橙色/橙色-柯林杯-s04_r1c3.png",
        "橙色/橙色-柯林杯-s08_r1c1.png",
        "橙色/橙色-柯林杯-s08_r1c3.png",
      ],
      玛格丽特杯: [
        "橙色/橙色-玛格丽特杯-s01_r1c2.png",
        "橙色/橙色-玛格丽特杯-s02_r1c2.png",
      ],
      香槟杯: [
        "橙色/橙色-香槟杯-s01_r3c2.png",
        "橙色/橙色-香槟杯-s02_r3c2.png",
        "橙色/橙色-香槟杯-s03_r3c2.png",
      ],
      马天尼杯: "琥珀色/琥珀色-马天尼杯-s09_r3c3.png",
    },
    琥珀色: {
      古典杯: [
        "琥珀色/琥珀色-古典杯-s01_r2c1.png",
        "琥珀色/琥珀色-古典杯-s03_r2c1.png",
        "琥珀色/琥珀色-古典杯-s05_r2c1.png",
        "琥珀色/琥珀色-古典杯-s08_r2c1.png",
        "琥珀色/琥珀色-古典杯-s09_r2c1.png",
      ],
      柯林杯: [
        "琥珀色/琥珀色-柯林杯-s02_r1c1.png",
        "琥珀色/琥珀色-柯林杯-s03_r1c3.png",
        "琥珀色/琥珀色-柯林杯-s09_r1c1.png",
        "琥珀色/琥珀色-柯林杯-s09_r1c3.png",
      ],
      香槟杯: [
        "琥珀色/琥珀色-香槟杯-s04_r2c3.png",
        "琥珀色/琥珀色-香槟杯-s08_r2c3.png",
        "琥珀色/琥珀色-香槟杯-s09_r2c3.png",
      ],
      马天尼杯: "琥珀色/琥珀色-马天尼杯-s09_r3c3.png",
    },
    粉色: {
      古典杯: "粉色/粉色-古典杯-s06_r2c1.png",
      柯林杯: [
        "粉色/粉色-柯林杯-s05_r1c3.png",
        "粉色/粉色-柯林杯-s06_r1c1.png",
        "粉色/粉色-柯林杯-s06_r1c3.png",
      ],
      玛格丽特杯: [
        "粉色/粉色-玛格丽特杯-s01_r3c1.png",
        "粉色/粉色-玛格丽特杯-s02_r3c1.png",
        "粉色/粉色-玛格丽特杯-s06_r1c2.png",
        "粉色/粉色-玛格丽特杯-s06_r3c1.png",
      ],
      飓风杯: [
        "粉色/粉色-飓风杯-s01_r2c2.png",
        "粉色/粉色-飓风杯-s02_r2c2.png",
        "粉色/粉色-飓风杯-s04_r2c2.png",
        "粉色/粉色-飓风杯-s06_r2c2.png",
        "粉色/粉色-飓风杯-s08_r2c2.png",
        "粉色/粉色-飓风杯-s09_r2c2.png",
      ],
      香槟杯: [
        "粉色/粉色-香槟杯-s03_r2c3.png",
        "粉色/粉色-香槟杯-s05_r2c3.png",
        "粉色/粉色-香槟杯-s06_r2c3.png",
        "粉色/粉色-香槟杯-s06_r3c2.png",
      ],
      马天尼杯: "琥珀色/琥珀色-马天尼杯-s09_r3c3.png",
    },
    紫色: {
      柯林杯: [
        "紫色/粉色-柯林杯-s01_r1c1.png",
        "紫色/紫色-柯林杯-s03_r1c1.png",
        "紫色/紫色-柯林杯-s05_r1c1.png",
      ],
      飓风杯: [
        "紫色/紫色-飓风杯-s03_r2c2.png",
        "紫色/紫色-飓风杯-s05_r2c2.png",
      ],
    },
    黄色: {
      柯林杯: [
        "黄色/黄色-柯林杯-s01_r1c3.png",
        "黄色/黄色-柯林杯-s02_r1c3.png",
        "黄色/黄色-柯林杯-s07_r1c1.png",
        "黄色/黄色-柯林杯-s07_r1c3.png",
      ],
      玛格丽特杯: [
        "黄色/黄色-玛格丽特杯-s03_r1c2.png",
        "黄色/黄色-玛格丽特杯-s03_r3c1.png",
        "黄色/黄色-玛格丽特杯-s04_r1c2.png",
        "黄色/黄色-玛格丽特杯-s07_r1c2.png",
        "黄色/黄色-玛格丽特杯-s07_r3c1.png",
        "黄色/黄色-玛格丽特杯-s08_r1c2.png",
        "黄色/黄色-玛格丽特杯-s09_r1c2.png",
      ],
      飓风杯: "黄色/黄色-飓风杯-s07_r2c2.png",
      香槟杯: [
        "黄色/黄色-香槟杯-s01_r2c3.png",
        "黄色/黄色-香槟杯-s02_r2c3.png",
        "黄色/黄色-香槟杯-s04_r3c2.png",
        "黄色/黄色-香槟杯-s05_r3c2.png",
        "黄色/黄色-香槟杯-s07_r2c3.png",
        "黄色/黄色-香槟杯-s07_r3c2.png",
        "黄色/黄色-香槟杯-s08_r3c2.png",
        "黄色/黄色-香槟杯-s09_r3c2.png",
      ],
      马天尼杯: "琥珀色/琥珀色-马天尼杯-s09_r3c3.png",
    },
  };

  const PALETTES = {
    crystal: { top: "#effcff", mid: "#d8f4ff", deep: "#89c7d5", bubble: "#ffffff" },
    lime: { top: "#e4f8af", mid: "#9cda74", deep: "#4f8f3f", bubble: "#f8ffe7" },
    amber: { top: "#f5d27b", mid: "#d79839", deep: "#84521b", bubble: "#fff5de" },
    tea: { top: "#c7996d", mid: "#90613d", deep: "#4d301c", bubble: "#f7ecd8" },
    berry: { top: "#ef98b2", mid: "#be4e70", deep: "#70233d", bubble: "#fff1f5" },
    sunset: { top: "#ffb36d", mid: "#e77040", deep: "#903519", bubble: "#fff3e6" },
    cola: { top: "#8b5c48", mid: "#57362c", deep: "#241411", bubble: "#f6ede1" },
    ocean: { top: "#9bd7db", mid: "#3f9199", deep: "#1a5860", bubble: "#f2ffff" },
  };

  const CLASSICS = [
    { id: "gin-tonic", name: "金汤力", base: "gin", mixers: ["soda"], flavors: ["lime"], method: "built", glass: "highball", minScore: 70, description: "清冽、带气泡感的经典高杯组合。" },
    { id: "cuba-libre", name: "自由古巴", base: "rum", mixers: ["cola", "ice"], flavors: ["lime"], method: "built", glass: "highball", minScore: 75, description: "朗姆与可乐相遇，是深夜里最轻松的一杯。" },
    { id: "whiskey-sour", name: "威士忌酸", base: "whiskey", mixers: ["syrup"], flavors: ["lemon"], method: "shaken", glass: "rocks", minScore: 70, description: "琥珀底色里带一点酸甜平衡的经典气质。" },
    { id: "tequila-sunrise", name: "龙舌兰日出", base: "tequila", mixers: ["ice"], flavors: ["orange", "cranberry"], method: "layered", glass: "highball", minScore: 70, description: "像日出一样向上晕开的暖色层次。" },
    { id: "vodka-cranberry", name: "蔓越莓伏特加", base: "vodka", mixers: [], flavors: ["cranberry"], method: "built", glass: "highball", minScore: 60, description: "冷冽底色配上莓果点缀，清爽又直接。" },
  ];

  const CHALLENGE_TITLES = [
    { count: 0, title: "滴酒不沾局外人", note: "今晚你更像吧台边清醒旁观的人。", purity: 0 },
    { count: 1, title: "微醺试探者", note: "你已经摸到一点经典酒谱的边，但还没彻底上头。", purity: 20 },
    { count: 2, title: "夜场热身选手", note: "你开始有点懂酒了，也开始有点会玩了。", purity: 40 },
    { count: 3, title: "酒馆常驻民", note: "经典酒谱对你来说已经不是偶然，是一种习惯。", purity: 60 },
    { count: 4, title: "经典猎手", note: "你对经典的嗅觉已经很准，再差一点就能封神。", purity: 80 },
    { count: 5, title: "传奇酒鬼", note: "五杯全中，你就是今晚最懂酒的那个人。", purity: 100 },
  ];

  const mounts = {
    app: document.getElementById("app"),
    header: document.getElementById("step-header"),
    stage: document.getElementById("mix-stage"),
    panel: document.getElementById("option-panel"),
    controls: document.getElementById("bottom-controls"),
    error: document.getElementById("error-screen"),
    modal: document.getElementById("poster-modal"),
  };

  let state = loadState();
  let shakeListening = false;
  let modalState = { type: null, recordId: null };
  let stageFx = { type: "idle", paletteKey: "crystal", token: 0 };
  let stageFxTimer = null;
  const sfxPlayers = {};
  let bgmPlayer = null;
  let bgmStarted = false;
  let welcomeVisible = true;
  let basePage = 0;
  let cellar = loadCellar();

  function initialState() {
    return {
      currentStep: "base",
      baseSelection: null,
      mixerSelections: [],
      flavorSelections: [],
      methodSelection: null,
      methodReady: false,
      glassSelection: null,
      actionHistory: [],
      posterTheme: "warm-night",
      cocktailName: "",
      cocktailNote: "",
      signature: "",
      challenge: defaultChallengeState(),
    };
  }

  function defaultChallengeState() {
    return {
      active: false,
      round: 1,
      hits: [],
      attempts: [],
      finished: false,
    };
  }

  function normalizeChallenge(value) {
    var base = defaultChallengeState();
    if (!value || typeof value !== "object") {
      return base;
    }
    return {
      active: Boolean(value.active),
      round: clamp(Number(value.round) || 1, 1, CHALLENGE_TOTAL_ROUNDS),
      hits: Array.isArray(value.hits) ? value.hits.slice(0, CLASSICS.length) : [],
      attempts: Array.isArray(value.attempts) ? value.attempts.slice(0, CHALLENGE_TOTAL_ROUNDS) : [],
      finished: Boolean(value.finished),
    };
  }

  function cloneState(value) {
    return {
      currentStep: value.currentStep,
      baseSelection: value.baseSelection
        ? { id: value.baseSelection.id, pours: value.baseSelection.pours }
        : null,
      mixerSelections: value.mixerSelections.map(function (item) {
        return { id: item.id, pours: item.pours };
      }),
      flavorSelections: value.flavorSelections.slice(),
      methodSelection: value.methodSelection,
      methodReady: value.methodReady,
      glassSelection: value.glassSelection,
      actionHistory: value.actionHistory.slice(),
      posterTheme: value.posterTheme,
      cocktailName: value.cocktailName,
      cocktailNote: value.cocktailNote,
      signature: value.signature,
      challenge: normalizeChallenge(value.challenge),
    };
  }

  function normalizeState(value) {
    var normalized = Object.assign(initialState(), value || {});
    normalized.challenge = normalizeChallenge(value && value.challenge);
    return normalized;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : initialState();
    } catch (error) {
      return initialState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn(error);
    }
  }

  function loadCellar() {
    try {
      var raw = localStorage.getItem(CELLAR_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveCellar() {
    try {
      localStorage.setItem(CELLAR_STORAGE_KEY, JSON.stringify(cellar));
    } catch (error) {
      console.warn(error);
    }
  }

  function setState(producer) {
    state = normalizeState(typeof producer === "function" ? producer(state) : producer);
    saveState();
    render();
  }

  function labelOf(list, id) {
    var found = list.find(function (item) {
      return item.id === id;
    });
    return found ? found.name : id;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function challengeSummary() {
    var challenge = state.challenge || defaultChallengeState();
    var hitCount = challenge.hits.length;
    return CHALLENGE_TITLES.find(function (item) { return item.count === hitCount; }) || CHALLENGE_TITLES[0];
  }

  function isChallengeMode() {
    return Boolean(state.challenge && state.challenge.active && !state.challenge.finished);
  }

  function challengeProgressLabel() {
    if (!isChallengeMode()) {
      return "酒鬼挑战";
    }
    return "挑战 " + clamp(state.challenge.round, 1, CHALLENGE_TOTAL_ROUNDS) + "/" + CHALLENGE_TOTAL_ROUNDS;
  }

  function canProceed() {
    if (state.currentStep === "base") {
      return Boolean(state.baseSelection);
    }
    if (state.currentStep === "method") {
      return Boolean(state.methodSelection) && (state.methodSelection !== "shaken" || state.methodReady);
    }
    if (state.currentStep === "glass") {
      return Boolean(state.glassSelection);
    }
    return true;
  }

  function playSoundEffect(key) {
    var src = SOUND_EFFECTS[key];
    if (!src) {
      return;
    }
    try {
      if (!sfxPlayers[key]) {
        sfxPlayers[key] = new Audio(src);
        sfxPlayers[key].preload = "auto";
      }
      var player = sfxPlayers[key];
      player.currentTime = 0;
      var playPromise = player.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    } catch (error) {
      console.warn(error);
    }
  }

  function startBackgroundMusic() {
    if (bgmStarted) {
      return;
    }
    bgmStarted = true;
    try {
      if (!bgmPlayer) {
        bgmPlayer = new Audio(BGM_SRC);
        bgmPlayer.loop = true;
        bgmPlayer.volume = 0.28;
        bgmPlayer.preload = "auto";
      }
      var playPromise = bgmPlayer.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          bgmStarted = false;
        });
      }
    } catch (error) {
      bgmStarted = false;
      console.warn(error);
    }
  }

  function soundForBase(baseId) {
    return "addWater";
  }

  function soundForMixer(mixerId) {
    if (mixerId === "ice") {
      return "addIce";
    }
    return "addWater";
  }

  function clearStageFx(skipRender) {
    if (stageFxTimer) {
      clearTimeout(stageFxTimer);
      stageFxTimer = null;
    }
    stageFx = { type: "idle", paletteKey: stageFx.paletteKey || "crystal", token: 0 };
    if (!skipRender) {
      render();
    }
  }

  function triggerStageFx(type, paletteKey, duration) {
    if (stageFxTimer) {
      clearTimeout(stageFxTimer);
      stageFxTimer = null;
    }

    stageFx = {
      type: type,
      paletteKey: paletteKey || "crystal",
      token: Date.now(),
    };

    render();

    stageFxTimer = setTimeout(function () {
      clearStageFx(false);
    }, duration || 850);
  }

  function addBase(baseId) {
    var baseIndex = BASES.findIndex(function (item) {
      return item.id === baseId;
    });
    if (baseIndex >= 0) {
      basePage = Math.floor(baseIndex / 3);
    }

    setState(function (current) {
      var next = cloneState(current);
      if (!next.baseSelection || next.baseSelection.id !== baseId) {
        next.baseSelection = { id: baseId, pours: 1 };
        next.actionHistory = next.actionHistory.filter(function (item) {
          return item.type !== "base";
        });
      } else if (next.baseSelection.pours < LIMITS.basePours.max) {
        next.baseSelection.pours += 1;
      }
      next.actionHistory.push({ type: "base", id: baseId });
      return next;
    });

    var base = BASES.find(function (item) {
      return item.id === baseId;
    });
    var baseSound = soundForBase(baseId);
    if (baseSound) {
      playSoundEffect(baseSound);
    }
    triggerStageFx("pour", base ? base.palette : "crystal", 780);
  }

  function addMixer(mixerId) {
    setState(function (current) {
      var next = cloneState(current);
      var existing = next.mixerSelections.find(function (item) {
        return item.id === mixerId;
      });
      if (existing) {
        if (existing.pours >= LIMITS.mixerPours.max) {
          return current;
        }
        existing.pours += 1;
      } else {
        if (next.mixerSelections.length >= LIMITS.mixerKinds) {
          return current;
        }
        next.mixerSelections.push({ id: mixerId, pours: 1 });
      }
      next.actionHistory.push({ type: "mixer", id: mixerId });
      return next;
    });

    var mixer = MIXERS.find(function (item) {
      return item.id === mixerId;
    });
    var mixerSound = soundForMixer(mixerId);
    if (mixerSound) {
      playSoundEffect(mixerSound);
    }
    triggerStageFx("pour", mixer ? mixer.palette : "crystal", 760);
  }

  function toggleFlavor(flavorId) {
    var shouldPlay = state.flavorSelections.indexOf(flavorId) < 0 && state.flavorSelections.length < LIMITS.flavorKinds;
    setState(function (current) {
      var next = cloneState(current);
      var index = next.flavorSelections.indexOf(flavorId);
      if (index >= 0) {
        next.flavorSelections.splice(index, 1);
        return next;
      }
      if (next.flavorSelections.length >= LIMITS.flavorKinds) {
        return current;
      }
      next.flavorSelections.push(flavorId);
      return next;
    });
    if (shouldPlay) {
      playSoundEffect("addFruit");
    }
  }

  function selectMethod(methodId) {
    setState(function (current) {
      var next = cloneState(current);
      next.methodSelection = methodId;
      next.methodReady = methodId !== "shaken";
      return next;
    });

    if (methodId === "shaken") {
      playSoundEffect("shake");
      startShakeMode();
    } else {
      stopShakeMode();
      triggerStageFx(methodId === "layered" ? "layered" : methodId === "stirred" ? "stirred" : "built", deriveMix().paletteKey, 980);
    }
  }

  function selectGlass(glassId) {
    setState(function (current) {
      var next = cloneState(current);
      next.glassSelection = glassId;
      return next;
    });
  }

  function undoLastPour() {
    setState(function (current) {
      var next = cloneState(current);
      var action = next.actionHistory.pop();
      if (!action) {
        return current;
      }

      if (action.type === "base" && next.baseSelection && next.baseSelection.id === action.id) {
        next.baseSelection.pours -= 1;
        if (next.baseSelection.pours <= 0) {
          next.baseSelection = null;
        }
      }

      if (action.type === "mixer") {
        var selection = next.mixerSelections.find(function (item) {
          return item.id === action.id;
        });
        if (selection) {
          selection.pours -= 1;
          if (selection.pours <= 0) {
            next.mixerSelections = next.mixerSelections.filter(function (item) {
              return item.id !== action.id;
            });
          }
        }
      }

      return next;
    });
  }

  function updatePosterField(field, value) {
    if (field === "cocktailName") {
      state.cocktailName = String(value || "").slice(0, LIMITS.posterNameMax);
    }
    if (field === "cocktailNote") {
      state.cocktailNote = String(value || "").slice(0, LIMITS.posterNoteMax);
    }
    if (field === "signature") {
      state.signature = String(value || "").slice(0, LIMITS.posterSignatureMax);
    }
    saveState();
    syncPosterPreview();
    renderModal();
  }

  function setPosterTheme(themeId) {
    setState(function (current) {
      var next = cloneState(current);
      next.posterTheme = themeId;
      return next;
    });
  }

  function resetAll() {
    stopShakeMode();
    modalState = { type: null, recordId: null };
    clearStageFx(true);
    if (isChallengeMode()) {
      var keptChallenge = Object.assign(defaultChallengeState(), state.challenge, {
        active: true,
        finished: false,
      });
      state = initialState();
      state.challenge = keptChallenge;
    } else {
      state = initialState();
    }
    basePage = 0;
    saveState();
    render();
  }

  function startNewRound() {
    stopShakeMode();
    modalState = { type: null, recordId: null };
    clearStageFx(true);
    state = initialState();
    basePage = 0;
    saveState();
    render();
  }

  function startFreePlayFromWelcome() {
    welcomeVisible = false;
    stopShakeMode();
    modalState = { type: null, recordId: null };
    clearStageFx(true);
    state = initialState();
    basePage = 0;
    saveState();
    startBackgroundMusic();
    render();
  }

  function beginChallengeRound(existingChallenge) {
    welcomeVisible = false;
    stopShakeMode();
    modalState = { type: null, recordId: null };
    clearStageFx(true);
    var nextChallenge = normalizeChallenge(existingChallenge || state.challenge);
    nextChallenge.active = true;
    nextChallenge.finished = false;
    nextChallenge.round = clamp(nextChallenge.round || 1, 1, CHALLENGE_TOTAL_ROUNDS);
    state = initialState();
    state.challenge = nextChallenge;
    basePage = 0;
    saveState();
    render();
  }

  function startChallengeMode() {
    beginChallengeRound(defaultChallengeState());
  }

  function restartChallengeMode() {
    beginChallengeRound(defaultChallengeState());
  }

  function continueChallengeRound() {
    var nextChallenge = normalizeChallenge(state.challenge);
    nextChallenge.round = clamp(nextChallenge.round + 1, 1, CHALLENGE_TOTAL_ROUNDS);
    beginChallengeRound(nextChallenge);
  }

  function snapshotState() {
    return cloneState(state);
  }

  function cocktailFingerprint(sourceState) {
    var parts = [];
    parts.push(sourceState.baseSelection ? sourceState.baseSelection.id + ":" + sourceState.baseSelection.pours : "none");
    parts.push(
      sourceState.mixerSelections
        .slice()
        .sort(function (a, b) { return a.id.localeCompare(b.id); })
        .map(function (item) { return item.id + ":" + item.pours; })
        .join(","),
    );
    parts.push(sourceState.flavorSelections.slice().sort().join(","));
    parts.push(sourceState.methodSelection || "none");
    parts.push(sourceState.glassSelection || "none");
    parts.push(sourceState.posterTheme || "warm-night");
    parts.push(sourceState.cocktailName || "");
    parts.push(sourceState.cocktailNote || "");
    parts.push(sourceState.signature || "");
    return parts.join("|");
  }

  function deriveMix() {
    var fillUnits = 0;
    var clarity = 3;
    var bubble = 0;
    var ice = 0;
    var foam = 0;
    var scores = {};

    if (state.baseSelection) {
      var base = BASES.find(function (item) {
        return item.id === state.baseSelection.id;
      });
      if (base) {
        scores[base.palette] = (scores[base.palette] || 0) + base.strength * state.baseSelection.pours;
        fillUnits += base.fill * state.baseSelection.pours;
        clarity = base.clarity;
      }
    }

    state.mixerSelections.forEach(function (selection) {
      var mixer = MIXERS.find(function (item) {
        return item.id === selection.id;
      });
      if (!mixer) {
        return;
      }
      scores[mixer.palette] = (scores[mixer.palette] || 0) + mixer.strength * selection.pours;
      fillUnits += mixer.fill * selection.pours;
      clarity += mixer.clarityShift * selection.pours;
      bubble += mixer.bubble * selection.pours;
      ice += mixer.ice * selection.pours;
      foam += mixer.foam * selection.pours;
    });

    if (state.methodSelection) {
      var method = METHODS.find(function (item) {
        return item.id === state.methodSelection;
      });
      if (method) {
        clarity += method.clarityShift;
      }
    }

    var paletteKey = Object.keys(scores).sort(function (a, b) {
      return scores[b] - scores[a];
    })[0] || (state.baseSelection ? BASES.find(function (item) { return item.id === state.baseSelection.id; }).palette : "crystal");

    return {
      paletteKey: paletteKey,
      fillLevel: clamp(fillUnits / 6, 0.18, 1),
      clarityLevel: clamp(clarity, 1, 5),
      bubbleLevel: clamp(bubble, 0, 3),
      iceLevel: clamp(ice, 0, 3),
      foamLevel: clamp(foam, 0, 3),
    };
  }

  function deriveFinal(mix) {
    var method = METHODS.find(function (item) {
      return item.id === state.methodSelection;
    }) || METHODS[METHODS.length - 1];
    var glass = GLASSES.find(function (item) {
      return item.id === state.glassSelection;
    }) || GLASSES[0];
    var accent = state.flavorSelections.length
      ? (FLAVORS.find(function (item) { return item.id === state.flavorSelections[0]; }) || {}).accent
      : mix.paletteKey;

    return {
      methodId: method.id,
      glassId: glass.id,
      glassShape: glass.shape,
      accentPalette: accent || mix.paletteKey,
      garnishes: state.flavorSelections.map(function (id) {
        var item = FLAVORS.find(function (flavor) {
          return flavor.id === id;
        });
        return item ? item : null;
      }).filter(Boolean),
    };
  }

  function findClassic() {
    var best = null;

    CLASSICS.forEach(function (classic) {
      var score = 0;

      if (state.baseSelection && state.baseSelection.id === classic.base) {
        score += 50;
      }

      classic.mixers.forEach(function (mixerId) {
        if (state.mixerSelections.some(function (item) { return item.id === mixerId; })) {
          score += 15;
        }
      });

      classic.flavors.forEach(function (flavorId) {
        if (state.flavorSelections.indexOf(flavorId) >= 0) {
          score += 10;
        }
      });

      if (state.methodSelection === classic.method) {
        score += 5;
      }

      if (state.glassSelection === classic.glass) {
        score += 5;
      }

      if (!best || score > best.score) {
        best = { recipe: classic, score: score };
      }
    });

    return best && best.score >= best.recipe.minScore ? best : null;
  }

  function posterAssetForClassicRecipe(recipe) {
    if (!recipe) {
      return { src: "", colorCategory: "amber", colorLabel: "琥珀", cupLabel: "" };
    }
    var prevState = state;
    state = normalizeState({
      baseSelection: recipe.base ? { id: recipe.base, pours: 1 } : null,
      mixerSelections: recipe.mixers.map(function (id) { return { id: id, pours: 1 }; }),
      flavorSelections: recipe.flavors.slice(),
      methodSelection: recipe.method,
      methodReady: true,
      glassSelection: recipe.glass,
      posterTheme: "warm-night",
      challenge: defaultChallengeState(),
    });
    var mix = deriveMix();
    var finalVisual = deriveFinal(mix);
    var asset = derivePosterAsset(mix, finalVisual);
    state = prevState;
    return asset;
  }

  function resolveChallengeAttempt() {
    var challenge = normalizeChallenge(state.challenge);
    var classic = findClassic();
    var uniqueHits = challenge.hits.slice();
    if (classic && uniqueHits.indexOf(classic.recipe.id) < 0) {
      uniqueHits.push(classic.recipe.id);
    }
    var attempt = {
      round: clamp(challenge.round, 1, CHALLENGE_TOTAL_ROUNDS),
      success: Boolean(classic),
      classicId: classic ? classic.recipe.id : "",
      classicName: classic ? classic.recipe.name : "",
      classicDescription: classic ? classic.recipe.description : "",
      recipe: recipeSummary(),
      posterAsset: classic ? posterAssetForClassicRecipe(classic.recipe) : derivePosterAsset(deriveMix(), deriveFinal(deriveMix())),
    };
    challenge.hits = uniqueHits;
    challenge.attempts = challenge.attempts.concat([attempt]).slice(0, CHALLENGE_TOTAL_ROUNDS);
    challenge.finished = attempt.round >= CHALLENGE_TOTAL_ROUNDS;
    state.challenge = challenge;
    saveState();
    modalState = {
      type: challenge.finished ? "challenge-result" : "challenge-round",
      recordId: String(attempt.round),
    };
    render();
  }

  function currentChallengeAttempt() {
    var attempts = (state.challenge && state.challenge.attempts) || [];
    if (!attempts.length) {
      return null;
    }
    return attempts[attempts.length - 1];
  }

  function recipeSummary() {
    var parts = [];

    if (state.baseSelection) {
      parts.push(labelOf(BASES, state.baseSelection.id) + " " + state.baseSelection.pours + "份");
    }

    state.mixerSelections.forEach(function (selection) {
      parts.push(labelOf(MIXERS, selection.id) + " " + selection.pours + "份");
    });

    if (state.flavorSelections.length) {
      parts.push(
        "风味：" +
          state.flavorSelections
            .map(function (id) { return labelOf(FLAVORS, id); })
            .join(" / "),
      );
    }

    if (state.methodSelection) {
      parts.push("方式：" + labelOf(METHODS, state.methodSelection));
    }

    if (state.glassSelection) {
      parts.push("杯型：" + labelOf(GLASSES, state.glassSelection));
    }

    return parts.join(" · ");
  }

  function addPosterColorWeight(scores, weights) {
    if (!weights) {
      return;
    }
    Object.keys(weights).forEach(function (key) {
      scores[key] = (scores[key] || 0) + weights[key];
    });
  }

  function currentIngredientSignature() {
    var baseId = state.baseSelection ? state.baseSelection.id : "none";
    var mixers = state.mixerSelections
      .map(function (selection) { return selection.id; })
      .sort()
      .join(",");
    var flavors = state.flavorSelections.slice().sort().join(",");
    return [baseId, mixers, flavors, state.glassSelection || "no-glass"].join("|");
  }

  function hashString(value) {
    var hash = 0;
    for (var index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function derivePosterColorCategory(mix) {
    var scores = {
      orange: 0,
      pink: 0,
      purple: 0,
      amber: 0,
      yellow: 0,
    };
    var selectedIds = [];

    function has(id) {
      return selectedIds.indexOf(id) >= 0;
    }

    if (state.baseSelection) {
      selectedIds.push(state.baseSelection.id);
      addPosterColorWeight(scores, POSTER_COLOR_WEIGHTS.base[state.baseSelection.id]);
    }

    state.mixerSelections.forEach(function (selection) {
      selectedIds.push(selection.id);
      addPosterColorWeight(scores, POSTER_COLOR_WEIGHTS.mixer[selection.id]);
    });

    state.flavorSelections.forEach(function (flavorId) {
      selectedIds.push(flavorId);
      addPosterColorWeight(scores, POSTER_COLOR_WEIGHTS.flavor[flavorId]);
    });

    if (has("blueberry")) {
      scores.purple += 3;
    }
    if ((has("cranberry") || has("strawberry")) && has("blueberry")) {
      scores.purple += 2;
    }
    if (has("cranberry") && (has("whiskey") || has("rum") || has("tea") || has("cola") || has("bitters"))) {
      scores.purple += 2;
    }
    if (has("orange") && (has("tequila") || has("rum"))) {
      scores.orange += 2;
    }
    if (has("peach") && has("cranberry")) {
      scores.pink += 1;
      scores.orange += 1;
    }
    if (has("lemon") && has("lime")) {
      scores.yellow += 2;
    }
    if (has("pineapple") && (has("rum") || has("tequila"))) {
      scores.yellow += 2;
      scores.orange += 1;
    }
    if (has("syrup") && (has("whiskey") || has("rum"))) {
      scores.amber += 1;
    }

    var fallbackCategory = POSTER_FALLBACK_CATEGORY_BY_PALETTE[mix.paletteKey] || "amber";
    scores[fallbackCategory] += 1;

    return POSTER_COLOR_TIEBREAK.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) {
        return scores[b] - scores[a];
      }
      return POSTER_COLOR_TIEBREAK.indexOf(a) - POSTER_COLOR_TIEBREAK.indexOf(b);
    })[0];
  }

  function derivePosterAsset(mix, finalVisual) {
    var colorCategory = derivePosterColorCategory(mix);
    var folderName = POSTER_COLOR_FOLDERS[colorCategory] || POSTER_COLOR_FOLDERS.amber;
    var manifest = POSTER_IMAGE_MANIFEST[folderName] || {};
    var candidateCups = POSTER_GLASS_MATCH[finalVisual.glassId] || [];
    var filePath = "";
    var matchedCup = "";

    candidateCups.some(function (cupName) {
      if (manifest[cupName]) {
        filePath = pickPosterManifestPath(manifest[cupName], colorCategory, cupName);
        matchedCup = cupName;
        return true;
      }
      return false;
    });

    if (!filePath) {
      var fallbackCup = Object.keys(manifest)[0];
      if (fallbackCup) {
        filePath = pickPosterManifestPath(manifest[fallbackCup], colorCategory, fallbackCup);
        matchedCup = fallbackCup;
      }
    }

    if (!filePath) {
      return {
        colorCategory: colorCategory,
        colorLabel: POSTER_COLOR_LABELS[colorCategory] || "琥珀",
        src: "",
        cupLabel: labelOf(GLASSES, finalVisual.glassId),
      };
    }

    return {
      colorCategory: colorCategory,
      colorLabel: POSTER_COLOR_LABELS[colorCategory] || "琥珀",
      src: encodeURI(POSTER_IMAGE_ROOT + "/" + filePath.replace(/\.(png|jpg|jpeg)$/i, ".webp")),
      cupLabel: matchedCup || labelOf(GLASSES, finalVisual.glassId),
    };
  }

  function pickPosterManifestPath(entry, colorCategory, cupName) {
    if (!Array.isArray(entry)) {
      return entry;
    }
    if (!entry.length) {
      return "";
    }
    var seed = currentIngredientSignature() + "|" + colorCategory + "|" + cupName;
    return entry[hashString(seed) % entry.length];
  }

  function posterRecordFromState(sourceState) {
    var prevState = state;
    state = normalizeState(sourceState);
    var mix = deriveMix();
    var finalVisual = deriveFinal(mix);
    var classic = findClassic();
    var posterAsset = derivePosterAsset(mix, finalVisual);
    var record = {
      id: "cocktail-" + Date.now() + "-" + hashString(cocktailFingerprint(state)).toString(36),
      fingerprint: cocktailFingerprint(state),
      createdAt: new Date().toISOString(),
      posterTheme: state.posterTheme,
      cocktailName: state.cocktailName || "今夜特调",
      cocktailNote: state.cocktailNote || "一杯属于今晚的自定义风味。",
      signature: state.signature || "由你亲手调制",
      posterAsset: posterAsset,
      recipe: recipeSummary(),
      classicName: classic ? classic.recipe.name : "",
      snapshot: snapshotState(),
    };
    state = prevState;
    return record;
  }

  function upsertCellarRecord(record) {
    var existingIndex = cellar.findIndex(function (item) {
      return item.fingerprint === record.fingerprint;
    });
    if (existingIndex >= 0) {
      cellar[existingIndex] = Object.assign({}, cellar[existingIndex], record, { id: cellar[existingIndex].id });
      var updated = cellar.splice(existingIndex, 1)[0];
      cellar.unshift(updated);
      saveCellar();
      return updated;
    }
    cellar.unshift(record);
    cellar = cellar.slice(0, 24);
    saveCellar();
    return record;
  }

  function currentPosterRecord() {
    return posterRecordFromState(snapshotState());
  }

  function syncCurrentCocktailToCellar() {
    return upsertCellarRecord(currentPosterRecord());
  }

  function render() {
    var mix = deriveMix();
    var finalVisual = deriveFinal(mix);
    var classic = findClassic();
    var step = STEPS.find(function (item) {
      return item.id === state.currentStep;
    });

    mounts.app.dataset.step = state.currentStep;
    renderHeader(step);
    renderStage(step, mix, finalVisual);
    renderPanel(step, mix, finalVisual, classic);
    renderControls();
    renderModal();
    renderWelcome();
  }

  function renderHeader(step) {
    var challenge = normalizeChallenge(state.challenge);
    var challengeMeta = isChallengeMode()
      ? `<span class="topbar__challenge-meta">已命中 ${challenge.hits.length} / ${CLASSICS.length}</span>`
      : "";
    mounts.header.innerHTML = `
      <div class="topbar">
        <div class="topbar__copy">
          <p class="eyebrow">Cocktail Lab</p>
          <h1 class="app-title">${APP_TITLE}</h1>
          <p class="topbar__helper">${step.helper}</p>
        </div>
        <div class="topbar__step">
          <div class="topbar__actions">
            <button type="button" class="topbar__cellar topbar__cellar--challenge ${isChallengeMode() ? "topbar__cellar--active" : ""}" data-action="open-challenge">${challengeProgressLabel()}</button>
            <button type="button" class="topbar__cellar" data-action="open-cellar">酒单 ${cellar.length ? '<span class="topbar__cellar-count">' + cellar.length + '</span>' : ""}</button>
          </div>
          ${challengeMeta}
        </div>
      </div>
    `;
  }

  function renderStage(step, mix, finalVisual) {
    var palette = PALETTES[mix.paletteKey] || PALETTES.crystal;
    var accentPalette = PALETTES[finalVisual.accentPalette] || palette;
    var isWaitingShake = state.currentStep === "method" && state.methodSelection === "shaken" && !state.methodReady;

    var bubbles = new Array(mix.bubbleLevel * 3).fill(0).map(function (_, index) {
      return `<span class="bubble" style="--bubble-left:${18 + ((index * 19) % 54)}%;--bubble-delay:${index * 190}ms;--bubble-size:${5 + (index % 3) * 2}px;--bubble-rise:${54 + (index % 3) * 15}px;"></span>`;
    }).join("");

    var ice = new Array(mix.iceLevel).fill(0).map(function (_, index) {
      return `<span class="ice-block" style="--ice-left:${18 + index * 18}%;--ice-delay:${index * 220}ms;--ice-rotate:${-7 + index * 6}deg;"></span>`;
    }).join("");

    var selectedSummary = [];
    if (state.baseSelection) {
      selectedSummary.push("基酒 " + labelOf(BASES, state.baseSelection.id));
    }
    if (state.mixerSelections.length) {
      selectedSummary.push("辅料 " + state.mixerSelections.length + " 项");
    }
    if (state.flavorSelections.length) {
      selectedSummary.push("风味 " + state.flavorSelections.length + " 项");
    }

    var stageStatusMarkup = selectedSummary.length
      ? selectedSummary.map(function (label) {
          return `<span class="status-chip">${label}</span>`;
        }).join("")
      : '<span class="status-chip status-chip--muted">尚未加入任何材料</span>';

    var pourFx = stageFx.type === "pour"
      ? `
        <div class="pour-stream pour-stream--${stageFx.paletteKey}" data-token="${stageFx.token}">
          <span class="pour-stream__beam"></span>
          <span class="pour-stream__drop"></span>
        </div>
      `
      : "";

    var shakerMarkup = isWaitingShake
      ? `
        <div class="shaker-zone ${stageFx.type === "shake-ready" ? "shaker-zone--finish" : ""}">
          <div class="shaker-zone__glow"></div>
          <img class="shaker-zone__image" src="./images/icon/shakeCup.webp" alt="雪克杯">
        </div>
      `
      : "";

    var shakePrompt = isWaitingShake
      ? `
        <div class="shake-prompt">
          <p class="shake-prompt__text">摇一摇手机完成摇和；如果当前设备不支持，也可以直接点击下面的按钮。</p>
          <button type="button" class="shake-prompt__button" data-action="complete-shake">点击摇匀</button>
        </div>
      `
      : "";

    mounts.stage.innerHTML = `
      <div
        class="stage-scene stage-scene--${finalVisual.methodId} ${stageFx.type !== "idle" ? "stage-scene--fx-" + stageFx.type : ""}"
        style="--liquid-top:${palette.top};--liquid-mid:${palette.mid};--liquid-deep:${palette.deep};--accent-top:${accentPalette.top};--accent-mid:${accentPalette.mid};--accent-deep:${accentPalette.deep};"
      >
        <div class="stage-scene__overlay"></div>
        <div class="stage-scene__glow"></div>
        <div class="stage-scene__vignette"></div>
        <div class="stage-copy">
          <p class="stage-copy__step">Workbench / ${step.label}</p>
          <p class="stage-copy__hint">${step.helper}</p>
          <div class="stage-copy__status">${stageStatusMarkup}</div>
        </div>
        ${pourFx}
        <div class="glass-zone">
          <div class="glass-pedestal"></div>
          <div class="glass-shadow"></div>
          ${shakerMarkup}
          <div class="glass glass--${finalVisual.glassId}">
            <div class="liquid liquid--${mix.paletteKey}" style="height:${Math.max(14, mix.fillLevel * 100)}%;opacity:${0.48 + mix.clarityLevel * 0.09};">
              <div class="liquid__backglow"></div>
              <div class="liquid__gradient"></div>
              <div class="liquid__accent"></div>
              <div class="liquid__surface"></div>
              <div class="liquid__wave"></div>
              <div class="liquid__shimmer"></div>
              <div class="foam foam--${mix.foamLevel}"></div>
              <div class="bubble-layer">${bubbles}</div>
              <div class="ice-layer">${ice}</div>
            </div>
            <div class="glass__spark glass__spark--a"></div>
            <div class="glass__spark glass__spark--b"></div>
          </div>
        </div>
        ${shakePrompt}
      </div>
    `;
  }

  function renderPanel(step, mix, finalVisual, classic) {
    if (state.currentStep === "poster") {
      renderPosterPanel(classic);
      return;
    }

    var items = "";
    var footer = "";

    if (state.currentStep === "base") {
      var pageSize = 3;
      var totalPages = Math.max(1, Math.ceil(BASES.length / pageSize));
      var safePage = clamp(basePage, 0, totalPages - 1);
      basePage = safePage;
      var pageItems = BASES.slice(safePage * pageSize, safePage * pageSize + pageSize);
      items = pageItems.map(function (item) {
        var pours = state.baseSelection && state.baseSelection.id === item.id ? state.baseSelection.pours : 0;
        return optionCard(item.id, item.name, pours ? pours + " 份" : "点击加入", "base", pours > 0, item.icon);
      }).join("");
      if (totalPages > 1) {
        footer = `
          <div class="option-pager">
            <button type="button" class="option-pager__arrow" data-action="base-page-prev" ${safePage <= 0 ? "disabled" : ""} aria-label="上一批基酒">‹</button>
            <div class="option-pager__dots">
              ${new Array(totalPages).fill(0).map(function (_, index) {
                return `<span class="option-pager__dot ${index === safePage ? "option-pager__dot--active" : ""}"></span>`;
              }).join("")}
            </div>
            <button type="button" class="option-pager__arrow" data-action="base-page-next" ${safePage >= totalPages - 1 ? "disabled" : ""} aria-label="下一批基酒">›</button>
          </div>
        `;
      }
    }

    if (state.currentStep === "mixer") {
      items = MIXERS.map(function (item) {
        var current = state.mixerSelections.find(function (entry) { return entry.id === item.id; });
        return optionCard(item.id, item.name, current ? current.pours + " 份" : "点击加入", "mixer", Boolean(current), item.icon);
      }).join("");
    }

    if (state.currentStep === "flavor") {
      items = FLAVORS.map(function (item) {
        var selected = state.flavorSelections.indexOf(item.id) >= 0;
        return optionCard(item.id, item.name, selected ? "已放入托盘" : "点击选择", "flavor", selected, item.icon);
      }).join("");
    }

    if (state.currentStep === "method") {
      items = METHODS.map(function (item) {
        var selected = state.methodSelection === item.id;
        var meta = item.needsShake && selected && !state.methodReady ? "等待摇匀" : selected ? "已选中" : "点击切换";
        return optionCard(item.id, item.name, meta, "method", selected);
      }).join("");
    }

    if (state.currentStep === "glass") {
      items = GLASSES.map(function (item) {
        var selected = state.glassSelection === item.id;
        return optionCard(item.id, item.name, selected ? "当前杯型" : "点击预览", "glass", selected);
      }).join("");
    }

    mounts.panel.innerHTML = `
      <div class="sheet sheet--${step.id}">
        <p class="sheet__subtitle">${step.helper}</p>
        <div class="option-grid">${items}</div>
        ${footer}
      </div>
    `;
  }

  function renderPosterPanel(classic) {
    var themeButtons = THEMES.map(function (theme) {
      return `
        <button type="button" class="theme-button ${theme.id === state.posterTheme ? "theme-button--active" : ""}" data-theme-id="${theme.id}">
          ${theme.name}
        </button>
      `;
    }).join("");

    mounts.panel.innerHTML = `
      <div class="sheet sheet--poster">
        <div class="sheet__header">
          <p class="sheet__title">生成海报</p>
        </div>
        <div class="poster-editor">
          <label class="field">
            <span class="field__label">酒名</span>
            <input type="text" name="cocktailName" maxlength="12" value="${escapeHtml(state.cocktailName)}">
          </label>
          <label class="field">
            <span class="field__label">一句话介绍</span>
            <textarea name="cocktailNote" maxlength="36">${escapeHtml(state.cocktailNote)}</textarea>
          </label>
          <label class="field">
            <span class="field__label">署名 / 心情</span>
            <input type="text" name="signature" maxlength="12" value="${escapeHtml(state.signature)}">
          </label>
          <div class="theme-switch">${themeButtons}</div>
          <button type="button" class="save-button" data-action="save-poster">保存海报</button>
        </div>
      </div>
    `;
  }

  function syncPosterPreview() {
    if (modalState.type === "poster") {
      renderModal();
    }
  }

  function posterMarkup(record) {
    var theme = THEMES.find(function (item) {
      return item.id === record.posterTheme;
    }) || THEMES[0];
    var posterAsset = record.posterAsset || { src: "", colorCategory: "amber", colorLabel: "琥珀", cupLabel: "" };
    var posterImage = posterAsset.src
      ? `
        <div class="poster-card__visual">
          <div class="poster-card__image-shell poster-card__image-shell--${posterAsset.colorCategory}">
            <img class="poster-card__image" src="${posterAsset.src}" alt="${escapeHtml((record.cocktailName || "今夜特调") + " 成品图")}">
          </div>
          <p class="poster-card__asset-tag">${posterAsset.colorLabel}调 · ${posterAsset.cupLabel}</p>
        </div>
      `
      : `
        <div class="poster-card__visual">
          <div class="poster-card__image-shell poster-card__image-shell--empty">
            <span class="poster-card__image-fallback">等待成品图</span>
          </div>
        </div>
      `;
    return `
      <article class="poster-card" style="background:${theme.background}">
        <div class="poster-card__glow"></div>
        <p class="poster-card__label">${APP_TITLE}</p>
        <h3 class="poster-card__name">${escapeHtml(record.cocktailName || "今夜特调")}</h3>
        <p class="poster-card__note">${escapeHtml(record.cocktailNote || "一杯属于今晚的自定义风味。")}</p>
        ${posterImage}
        ${record.classicName ? `<div class="poster-classic">经典款彩蛋：${record.classicName}</div>` : ""}
        <p class="poster-card__recipe">${escapeHtml(record.recipe || "")}</p>
        <p class="poster-card__signature">${escapeHtml(record.signature || "由你亲手调制")}</p>
      </article>
    `;
  }

  function optionCard(id, title, meta, kind, active, iconSrc) {
    var emblem = optionEmblem(kind, title);
    var hint = optionHint(kind, id);
    var media = iconSrc
      ? `<span class="option-card__media" aria-hidden="true"><img class="option-card__icon" src="${iconSrc}" alt=""></span>`
      : `<span class="option-card__media option-card__media--glyph" aria-hidden="true">${emblem}</span>`;
    return `
      <button type="button" class="option-card ${active ? "option-card--active" : ""}" data-kind="${kind}" data-id="${id}">
        <span class="option-card__badge">${kindLabel(kind)}</span>
        ${media}
        <span class="option-card__body">
          <span class="option-card__title">${title}</span>
          <span class="option-card__meta">${meta}</span>
          <span class="option-card__hint">${hint}</span>
        </span>
      </button>
    `;
  }

  function panelEyebrow(stepId) {
    if (stepId === "base") {
      return "Spirit Archive";
    }
    if (stepId === "mixer") {
      return "Mixer Rack";
    }
    if (stepId === "flavor") {
      return "Flavor Library";
    }
    if (stepId === "method") {
      return "Method Select";
    }
    if (stepId === "glass") {
      return "Serving Vessel";
    }
    return "Poster Forge";
  }

  function panelCounter(stepId) {
    if (stepId === "base") {
      return state.baseSelection ? state.baseSelection.pours + " / " + LIMITS.basePours.max + " 份" : "未选择";
    }
    if (stepId === "mixer") {
      return state.mixerSelections.length + " / " + LIMITS.mixerKinds + " 项";
    }
    if (stepId === "flavor") {
      return state.flavorSelections.length + " / " + LIMITS.flavorKinds + " 项";
    }
    if (stepId === "method") {
      return state.methodSelection ? "已锁定" : "待选择";
    }
    if (stepId === "glass") {
      return state.glassSelection ? "已预览" : "待选择";
    }
    return "Ready";
  }

  function kindLabel(kind) {
    if (kind === "base") {
      return "SPIRIT";
    }
    if (kind === "mixer") {
      return "MIXER";
    }
    if (kind === "flavor") {
      return "FLAVOR";
    }
    if (kind === "method") {
      return "METHOD";
    }
    if (kind === "glass") {
      return "GLASS";
    }
    return "ITEM";
  }

  function optionHint(kind, id) {
    if (kind === "base") {
      return "决定主色、酒体与基底风味";
    }
    if (kind === "mixer") {
      return id === "ice" ? "增强清澈感与冰镇层次" : "改变浓度、气泡与口感";
    }
    if (kind === "flavor") {
      return "用于点亮香气与装饰表达";
    }
    if (kind === "method") {
      return id === "shaken" ? "需要完成一次摇匀动作" : "改变液体表现与气质";
    }
    if (kind === "glass") {
      return "影响成品轮廓与陈列气质";
    }
    return "";
  }

  function optionEmblem(kind, title) {
    if (kind === "method") {
      return title.slice(0, 1);
    }
    if (kind === "glass") {
      return "杯";
    }
    if (kind === "flavor") {
      return "味";
    }
    if (kind === "mixer") {
      return "调";
    }
    return title.slice(0, 1);
  }

  function renderControls() {
    var index = STEPS.findIndex(function (item) {
      return item.id === state.currentStep;
    });
    var nextLabel = "下一步 →";
    if (isChallengeMode() && state.currentStep === "glass") {
      nextLabel = "提交本杯";
    } else if (index >= STEPS.length - 1) {
      nextLabel = "完成海报";
    }

    mounts.controls.innerHTML = `
      <div class="control-strip">
        <button type="button" class="control-button control-button--ghost" data-action="prev" ${index <= 0 ? "disabled" : ""}>← 上一步</button>
        <button type="button" class="control-button control-button--ghost" data-action="undo" ${state.actionHistory.length ? "" : "disabled"}>↻ 撤销</button>
        <button type="button" class="control-button control-button--primary control-button--inline-primary" data-action="next" ${canProceed() ? "" : "disabled"}>${nextLabel}</button>
        <button type="button" class="control-button control-button--ghost control-button--danger" data-action="reset">重置 ↺</button>
      </div>
    `;
  }

  function openPosterModal() {
    var record = syncCurrentCocktailToCellar();
    modalState = { type: "poster", recordId: record.id };
    render();
  }

  function openCellarModal() {
    modalState = { type: "cellar", recordId: null };
    render();
  }

  function openChallengeModal() {
    modalState = { type: "challenge", recordId: null };
    render();
  }

  function openCellarDetail(recordId) {
    modalState = { type: "cellar-detail", recordId: recordId };
    render();
  }

  function closeModal() {
    modalState = { type: null, recordId: null };
    render();
  }

  function renderCellarModal() {
    var cards = cellar.length
      ? cellar.map(function (record) {
          return `
            <button type="button" class="cellar-card" data-action="open-cellar-detail" data-record-id="${record.id}">
              <span class="cellar-card__thumb">
                ${record.posterAsset && record.posterAsset.src
                  ? `<img class="cellar-card__image" src="${record.posterAsset.src}" alt="${escapeHtml(record.cocktailName)}">`
                  : `<span class="cellar-card__fallback">待生成</span>`}
              </span>
              <span class="cellar-card__body">
                <span class="cellar-card__name">${escapeHtml(record.cocktailName)}</span>
                <span class="cellar-card__meta">${escapeHtml(((record.posterAsset && record.posterAsset.colorLabel) || "琥珀") + "调 · " + ((record.posterAsset && record.posterAsset.cupLabel) || "杯型未定"))}</span>
              </span>
            </button>
          `;
        }).join("")
      : `
        <div class="cellar-empty">
          <p class="cellar-empty__title">你的酒单还空着</p>
          <p class="cellar-empty__text">完成一杯属于自己的酒，它就会被收进这里。</p>
        </div>
      `;
    return `
      <div class="poster-modal__backdrop" data-action="close-modal"></div>
      <div class="poster-modal__card poster-modal__card--cellar">
        <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">个人酒单</p>
        <div class="cellar-modal__header">
          <h3 class="cellar-modal__title">调出过的气质之酒</h3>
          <p class="cellar-modal__helper">每一杯都保留了你当时写下的名字、心情和海报。</p>
        </div>
        <div class="cellar-grid">${cards}</div>
      </div>
    `;
  }

  function renderCellarDetailModal(record) {
    return `
      <div class="poster-modal__backdrop" data-action="close-modal"></div>
      <div class="poster-modal__card poster-modal__card--detail">
        <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">酒单收藏</p>
        <div class="poster-modal__preview">${posterMarkup(record)}</div>
        <div class="poster-modal__actions">
          <button type="button" class="control-button control-button--ghost" data-action="back-to-cellar">返回酒单</button>
          <button type="button" class="control-button" data-action="save-poster-modal">保存海报</button>
        </div>
      </div>
    `;
  }

  function renderChallengeIntroModal() {
    var challenge = normalizeChallenge(state.challenge);
    var inProgress = challenge.active && !challenge.finished && challenge.attempts.length > 0;
    return `
      <div class="poster-modal__backdrop" data-action="close-modal"></div>
      <div class="poster-modal__card poster-modal__card--challenge">
        <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">酒鬼挑战</p>
        <div class="challenge-hero">
          <h3 class="challenge-hero__title">5 次机会，看看你能调出几杯经典酒</h3>
          <p class="challenge-hero__text">每次完成一杯，系统都会立刻判断你有没有命中经典配方。挑战结束后，会生成你的酒鬼纯度和专属称号。</p>
          <div class="challenge-hero__rules">
            <span class="challenge-hero__rule">5 次调酒机会</span>
            <span class="challenge-hero__rule">命中经典酒就算成功收集</span>
            <span class="challenge-hero__rule">解锁 0 - 5 的酒鬼称号</span>
          </div>
          ${inProgress ? `<p class="challenge-hero__progress">当前进度：第 ${challenge.round} / ${CHALLENGE_TOTAL_ROUNDS} 杯，已收集 ${challenge.hits.length} / ${CLASSICS.length} 杯经典酒。</p>` : ""}
        </div>
        <div class="poster-modal__actions">
          ${inProgress ? `<button type="button" class="control-button control-button--ghost" data-action="restart-challenge">重新开始</button>` : `<button type="button" class="control-button control-button--ghost" data-action="close-modal">稍后再试</button>`}
          <button type="button" class="control-button" data-action="${inProgress ? "resume-challenge" : "start-challenge"}">${inProgress ? "继续挑战" : "开始挑战"}</button>
        </div>
      </div>
    `;
  }

  function renderChallengeRoundModal(attempt) {
    var challenge = normalizeChallenge(state.challenge);
    return `
      <div class="poster-modal__backdrop" data-action="close-modal"></div>
      <div class="poster-modal__card poster-modal__card--challenge">
        <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">酒鬼挑战 · 第 ${attempt.round} / ${CHALLENGE_TOTAL_ROUNDS} 杯</p>
        <div class="challenge-round ${attempt.success ? "challenge-round--success" : "challenge-round--miss"}">
          <div class="challenge-round__badge">${attempt.success ? "命中经典酒" : "这杯没中"}</div>
          <h3 class="challenge-round__title">${attempt.success ? "你调出了：" + attempt.classicName : "这杯是你的自创特调"}</h3>
          <p class="challenge-round__text">${attempt.success ? attempt.classicDescription : "暂时没有命中经典配方，但这也可能是一杯很有你风格的原创之作。"}</p>
          <p class="challenge-round__meta">已收集 ${challenge.hits.length} / ${CLASSICS.length} 杯经典酒</p>
        </div>
        <div class="poster-modal__actions">
          <button type="button" class="control-button control-button--ghost" data-action="end-challenge-early">提前结算</button>
          <button type="button" class="control-button" data-action="next-challenge-round">下一杯</button>
        </div>
      </div>
    `;
  }

  function renderChallengeResultModal() {
    var challenge = normalizeChallenge(state.challenge);
    var summary = challengeSummary();
    var unlocked = challenge.hits.slice();
    var cards = CLASSICS.map(function (classic) {
      var found = unlocked.indexOf(classic.id) >= 0;
      var asset = found ? posterAssetForClassicRecipe(classic) : null;
      return `
        <div class="challenge-collection-card ${found ? "challenge-collection-card--found" : ""}">
          <div class="challenge-collection-card__thumb">
            ${found && asset && asset.src
              ? `<img class="challenge-collection-card__image" src="${asset.src}" alt="${escapeHtml(classic.name)}">`
              : `<span class="challenge-collection-card__mark">?</span>`}
          </div>
          <span class="challenge-collection-card__name">${found ? classic.name : "？？？"}</span>
        </div>
      `;
    }).join("");
    return `
      <div class="poster-modal__backdrop" data-action="close-modal"></div>
      <div class="poster-modal__card poster-modal__card--challenge-result">
        <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">酒鬼挑战结果</p>
        <div class="challenge-result">
          <div class="challenge-result__hero">
            <p class="challenge-result__purity">你的酒鬼纯度：${summary.purity}%</p>
            <h3 class="challenge-result__title">${summary.title}</h3>
            <p class="challenge-result__text">${summary.note}</p>
            <div class="challenge-result__score">${challenge.hits.length} / ${CLASSICS.length}</div>
          </div>
          <div class="challenge-result__section">
            <p class="challenge-result__section-title">本次解锁的经典酒</p>
            <div class="challenge-collection-grid">${cards}</div>
          </div>
        </div>
        <div class="poster-modal__actions">
          <button type="button" class="control-button control-button--ghost" data-action="restart-challenge">再来一局</button>
          <button type="button" class="control-button" data-action="save-challenge-result">保存结果海报</button>
        </div>
      </div>
    `;
  }

  function renderModal() {
    if (!mounts.modal) {
      return;
    }

    if (!modalState.type) {
      mounts.modal.classList.add("hidden");
      mounts.modal.setAttribute("aria-hidden", "true");
      mounts.modal.innerHTML = "";
      return;
    }
    mounts.modal.classList.remove("hidden");
    mounts.modal.setAttribute("aria-hidden", "false");
    if (modalState.type === "poster") {
      mounts.modal.innerHTML = `
        <div class="poster-modal__backdrop" data-action="close-modal"></div>
        <div class="poster-modal__card">
          <button type="button" class="poster-modal__close" data-action="close-modal" aria-label="关闭">×</button>
          <p class="poster-modal__eyebrow">完成海报</p>
          <div class="poster-modal__preview">${posterMarkup(currentPosterRecord())}</div>
          <div class="poster-modal__actions">
            <button type="button" class="control-button control-button--ghost" data-action="new-round">再来一杯</button>
            <button type="button" class="control-button" data-action="save-poster-modal">保存海报</button>
          </div>
        </div>
      `;
      return;
    }
    if (modalState.type === "cellar") {
      mounts.modal.innerHTML = renderCellarModal();
      return;
    }
    if (modalState.type === "cellar-detail") {
      var record = cellar.find(function (item) { return item.id === modalState.recordId; });
      mounts.modal.innerHTML = record ? renderCellarDetailModal(record) : renderCellarModal();
      return;
    }
    if (modalState.type === "challenge") {
      mounts.modal.innerHTML = renderChallengeIntroModal();
      return;
    }
    if (modalState.type === "challenge-round") {
      var attempt = currentChallengeAttempt();
      mounts.modal.innerHTML = attempt ? renderChallengeRoundModal(attempt) : renderChallengeIntroModal();
      return;
    }
    if (modalState.type === "challenge-result") {
      mounts.modal.innerHTML = renderChallengeResultModal();
    }
  }

  function renderWelcome() {
    if (!mounts.modal) {
      return;
    }
    if (!welcomeVisible) {
      return;
    }
    mounts.modal.classList.remove("hidden");
    mounts.modal.setAttribute("aria-hidden", "false");
    mounts.modal.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-screen__panel">
          <p class="welcome-screen__eyebrow">COCKTAIL LAB</p>
          <h2 class="welcome-screen__title">调酒实验室</h2>
          <p class="welcome-screen__lead">今晚，你会把自己调成什么味道？</p>
          <p class="welcome-screen__copy">挑战经典，调出情绪，调出一杯只属于你的酒。</p>
          <div class="welcome-screen__actions">
            <button type="button" class="welcome-screen__button welcome-screen__button--primary" data-action="start-free-play">调一杯属于我的酒</button>
            <button type="button" class="welcome-screen__button" data-action="start-challenge">酒鬼挑战</button>
          </div>
          <p class="welcome-screen__footer">你调出的不是酒，是今晚的自己</p>
        </div>
      </div>
    `;
  }

  function handlePanelClick(event) {
    var option = event.target.closest("[data-kind][data-id]");
    if (option) {
      var kind = option.getAttribute("data-kind");
      var id = option.getAttribute("data-id");
      if (kind === "base") {
        addBase(id);
      }
      if (kind === "mixer") {
        addMixer(id);
      }
      if (kind === "flavor") {
        toggleFlavor(id);
      }
      if (kind === "method") {
        selectMethod(id);
      }
      if (kind === "glass") {
        selectGlass(id);
      }
      return;
    }

    var pagerAction = event.target.closest("[data-action]");
    if (pagerAction) {
      var action = pagerAction.getAttribute("data-action");
      var totalBasePages = Math.max(1, Math.ceil(BASES.length / 3));
      if (action === "base-page-prev") {
        basePage = clamp(basePage - 1, 0, totalBasePages - 1);
        render();
        return;
      }
      if (action === "base-page-next") {
        basePage = clamp(basePage + 1, 0, totalBasePages - 1);
        render();
        return;
      }
    }

    var themeButton = event.target.closest("[data-theme-id]");
    if (themeButton) {
      setPosterTheme(themeButton.getAttribute("data-theme-id"));
      return;
    }

    var saveButton = event.target.closest('[data-action="save-poster"]');
    if (saveButton) {
      exportPoster();
    }
  }

  function handlePanelInput(event) {
    var input = event.target.closest("[name]");
    if (!input) {
      return;
    }
    updatePosterField(input.getAttribute("name"), input.value);
  }

  function handleControlClick(event) {
    var button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    var action = button.getAttribute("data-action");
    if (action === "prev") {
      moveStep(-1);
    }
    if (action === "undo") {
      undoLastPour();
    }
    if (action === "reset") {
      resetAll();
    }
    if (action === "next" && canProceed() && state.currentStep === "poster") {
      openPosterModal();
    }
    if (action === "next" && canProceed() && state.currentStep === "glass" && isChallengeMode()) {
      resolveChallengeAttempt();
      return;
    }
    if (action === "next" && canProceed() && state.currentStep !== "poster") {
      moveStep(1);
    }
    if (action === "complete-shake") {
      completeShake();
    }
    if (action === "close-modal") {
      closeModal();
    }
    if (action === "new-round") {
      startNewRound();
    }
    if (action === "start-free-play") {
      startFreePlayFromWelcome();
    }
    if (action === "start-challenge") {
      startChallengeMode();
    }
    if (action === "resume-challenge") {
      closeModal();
    }
    if (action === "restart-challenge") {
      restartChallengeMode();
    }
    if (action === "next-challenge-round") {
      continueChallengeRound();
    }
    if (action === "end-challenge-early") {
      state.challenge.finished = true;
      modalState = { type: "challenge-result", recordId: null };
      saveState();
      render();
    }
    if (action === "back-to-cellar") {
      openCellarModal();
    }
    if (action === "save-poster-modal") {
      var record = modalState.type === "cellar-detail"
        ? cellar.find(function (item) { return item.id === modalState.recordId; })
        : null;
      exportPoster(record || undefined);
    }
    if (action === "save-challenge-result") {
      exportChallengeResult();
    }
  }

  function handleHeaderClick(event) {
    var button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    if (button.getAttribute("data-action") === "open-cellar") {
      openCellarModal();
    }
    if (button.getAttribute("data-action") === "open-challenge") {
      openChallengeModal();
    }
  }

  function handleModalClick(event) {
    var button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    var action = button.getAttribute("data-action");
    if (action === "open-cellar-detail") {
      openCellarDetail(button.getAttribute("data-record-id"));
      return;
    }
    handleControlClick(event);
  }

  function moveStep(offset) {
    var index = STEPS.findIndex(function (item) {
      return item.id === state.currentStep;
    });
    var nextIndex = clamp(index + offset, 0, STEPS.length - 1);
    if (nextIndex === index) {
      return;
    }
    modalState = { type: null, recordId: null };
    clearStageFx(true);
    state.currentStep = STEPS[nextIndex].id;
    saveState();
    render();
  }

  function visualForPosterRecord(record) {
    var prevState = state;
    if (record && record.snapshot) {
      state = normalizeState(record.snapshot);
    }
    var mix = deriveMix();
    var finalVisual = deriveFinal(mix);
    state = prevState;
    return { mix: mix, finalVisual: finalVisual };
  }

  function drawCanvasCocktail(ctx, mix, finalVisual, x, y, width, height) {
    var palette = PALETTES[mix.paletteKey] || PALETTES.crystal;
    var glassWidth = finalVisual.glassId === "rocks" ? 390 : finalVisual.glassId === "champagne" ? 250 : 320;
    var glassHeight = finalVisual.glassId === "martini" ? 430 : finalVisual.glassId === "rocks" ? 420 : 620;
    var glassX = x + (width - glassWidth) / 2;
    var glassY = y + (height - glassHeight) / 2 + 30;
    var liquidHeight = Math.max(90, glassHeight * clamp(mix.fillLevel, 0.18, 1));
    var liquidY = glassY + glassHeight - liquidHeight - 16;

    ctx.save();
    ctx.fillStyle = "rgba(255, 214, 158, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height - 52, glassWidth * 0.72, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(0, 0, 0, 0.44)";
    ctx.shadowBlur = 36;
    ctx.strokeStyle = "rgba(255, 241, 212, 0.82)";
    ctx.lineWidth = 8;
    roundRect(ctx, glassX, glassY, glassWidth, glassHeight, finalVisual.glassId === "rocks" ? 42 : 76);
    ctx.stroke();

    var liquidGradient = ctx.createLinearGradient(0, liquidY, 0, glassY + glassHeight);
    liquidGradient.addColorStop(0, palette.top);
    liquidGradient.addColorStop(0.52, palette.mid);
    liquidGradient.addColorStop(1, palette.deep);
    ctx.fillStyle = liquidGradient;
    roundRect(ctx, glassX + 18, liquidY, glassWidth - 36, liquidHeight, 42);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, " + (0.18 + mix.clarityLevel * 0.035) + ")";
    ctx.fillRect(glassX + 42, liquidY + 28, Math.max(42, glassWidth * 0.16), Math.max(90, liquidHeight * 0.6));

    if (mix.foamLevel > 0) {
      ctx.fillStyle = "rgba(255, 244, 220, 0.78)";
      roundRect(ctx, glassX + 30, liquidY + 18, glassWidth - 60, 20 + mix.foamLevel * 8, 18);
      ctx.fill();
    }

    ctx.fillStyle = palette.bubble;
    for (var bubbleIndex = 0; bubbleIndex < mix.bubbleLevel * 8; bubbleIndex += 1) {
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(
        glassX + 54 + ((bubbleIndex * 47) % Math.max(80, glassWidth - 108)),
        liquidY + 54 + ((bubbleIndex * 83) % Math.max(80, liquidHeight - 96)),
        5 + (bubbleIndex % 3) * 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(239, 250, 255, 0.62)";
    for (var iceIndex = 0; iceIndex < mix.iceLevel; iceIndex += 1) {
      ctx.save();
      ctx.translate(glassX + 90 + iceIndex * 78, glassY + glassHeight - 130 - (iceIndex % 2) * 30);
      ctx.rotate((-8 + iceIndex * 7) * Math.PI / 180);
      roundRect(ctx, -30, -30, 60, 60, 12);
      ctx.fill();
      ctx.restore();
    }

    if (finalVisual.garnishes.length) {
      ctx.fillStyle = "rgba(255, 220, 132, 0.92)";
      ctx.beginPath();
      ctx.arc(glassX + glassWidth - 34, glassY + 24, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(103, 161, 74, 0.92)";
      ctx.fillRect(glassX + glassWidth - 42, glassY + 18, 84, 12);
    }

    ctx.restore();
  }

  function downloadCanvas(canvas, filename) {
    var dataUrl = canvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = sanitizeDownloadName(filename || "cocktail-lab-poster.png");
    link.href = dataUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function sanitizeDownloadName(filename) {
    return String(filename || "cocktail-lab-poster.png").replace(/[\\/:*?"<>|]/g, "-");
  }

  async function exportPoster(record) {
    try {
      var activeRecord = record || syncCurrentCocktailToCellar();
      var theme = THEMES.find(function (item) { return item.id === activeRecord.posterTheme; }) || THEMES[0];
      var visual = visualForPosterRecord(activeRecord);
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context unavailable");
      }
      canvas.width = 1080;
      canvas.height = 1920;

      var colors = theme.background.match(/#[0-9a-fA-F]{6}/g) || ["#120d0a", "#24160f"];
      var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[colors.length - 1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f7e8cb";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText(APP_TITLE, 96, 130);
      ctx.font = "bold 78px sans-serif";
      ctx.fillText(activeRecord.cocktailName || "今夜特调", 96, 300, 860);
      ctx.font = "36px sans-serif";
      wrapText(ctx, activeRecord.cocktailNote || "一杯属于今晚的自定义风味。", 96, 390, 860, 56);

      drawCanvasCocktail(ctx, visual.mix, visual.finalVisual, 150, 520, 780, 840);

      ctx.font = "30px sans-serif";
      ctx.fillStyle = "rgba(247, 232, 203, 0.82)";
      wrapText(ctx, activeRecord.recipe || "", 96, 1490, 860, 44);
      ctx.font = "bold 34px sans-serif";
      ctx.fillStyle = "#f7e8cb";
      ctx.fillText(activeRecord.signature || "由你亲手调制", 96, 1790, 860);

      downloadCanvas(canvas, (activeRecord.cocktailName || "cocktail-lab-poster") + ".png");
    } catch (error) {
      showError(error);
    }
  }

  async function exportChallengeResult() {
    try {
      var challenge = normalizeChallenge(state.challenge);
      var summary = challengeSummary();
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = 1080;
      canvas.height = 1920;

      var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#130d09");
      gradient.addColorStop(1, "#2b170d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f7e8cb";
      ctx.font = "bold 58px sans-serif";
      ctx.fillText("酒鬼挑战", 90, 120);
      ctx.font = "34px sans-serif";
      ctx.fillStyle = "rgba(247, 232, 203, 0.86)";
      ctx.fillText("5 次机会，看看你能调出几杯经典酒", 90, 178);

      ctx.fillStyle = "#ffdf9e";
      ctx.font = "bold 76px sans-serif";
      ctx.fillText("酒鬼纯度 " + summary.purity + "%", 90, 316);
      ctx.fillStyle = "#fff1cf";
      ctx.font = "bold 92px sans-serif";
      ctx.fillText(summary.title, 90, 438, 900);
      ctx.font = "34px sans-serif";
      ctx.fillStyle = "rgba(247, 232, 203, 0.8)";
      wrapText(ctx, summary.note, 90, 520, 900, 50);

      ctx.fillStyle = "rgba(255, 221, 164, 0.12)";
      ctx.fillRect(90, 610, 900, 90);
      ctx.fillStyle = "#fff1cf";
      ctx.font = "bold 42px sans-serif";
      ctx.fillText("本次命中：" + challenge.hits.length + " / " + CLASSICS.length, 120, 668);

      ctx.font = "bold 42px sans-serif";
      ctx.fillStyle = "#f7e8cb";
      ctx.fillText("经典酒收集", 90, 792);

      var cardWidth = 280;
      var cardHeight = 310;
      var gap = 30;
      for (var index = 0; index < CLASSICS.length; index += 1) {
        var classic = CLASSICS[index];
        var found = challenge.hits.indexOf(classic.id) >= 0;
        var col = index % 3;
        var row = Math.floor(index / 3);
        var x = 90 + col * (cardWidth + gap);
        var y = 840 + row * (cardHeight + gap);

        ctx.fillStyle = found ? "rgba(38, 28, 20, 0.94)" : "rgba(18, 14, 12, 0.92)";
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeStyle = found ? "rgba(255, 214, 126, 0.54)" : "rgba(255, 236, 206, 0.12)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        if (found) {
          var asset = posterAssetForClassicRecipe(classic);
          if (asset && asset.src) {
            var image = await loadImage(asset.src);
            drawPosterImage(ctx, image, x + 28, y + 20, cardWidth - 56, 190);
          }
          ctx.fillStyle = "#fff1cf";
          ctx.font = "bold 32px sans-serif";
          ctx.fillText(classic.name, x + 20, y + 258, cardWidth - 40);
        } else {
          ctx.fillStyle = "rgba(247, 232, 203, 0.52)";
          ctx.font = "bold 92px sans-serif";
          ctx.fillText("?", x + 116, y + 154);
          ctx.fillStyle = "rgba(247, 232, 203, 0.62)";
          ctx.font = "bold 28px sans-serif";
          ctx.fillText("等待解锁", x + 80, y + 256);
        }
      }

      var link = document.createElement("a");
      link.download = "酒鬼挑战结果.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      showError(error);
    }
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawPosterImage(ctx, image, x, y, width, height) {
    var scale = Math.min(width / image.width, height / image.height);
    var drawWidth = image.width * scale;
    var drawHeight = image.height * scale;
    var drawX = x + (width - drawWidth) / 2;
    var drawY = y + (height - drawHeight) / 2;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 235, 199, 0.12)";
    ctx.lineWidth = 2;
    roundRect(ctx, x + 18, y + 14, width - 36, height - 28, 34);
    ctx.stroke();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 36;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async function startShakeMode() {
    if (shakeListening) {
      return;
    }
    var motion = window.DeviceMotionEvent;
    if (!motion) {
      return;
    }
    try {
      if (typeof motion.requestPermission === "function") {
        var result = await motion.requestPermission();
        if (result !== "granted") {
          return;
        }
      }
      window.addEventListener("devicemotion", handleMotion);
      shakeListening = true;
    } catch (error) {
      console.warn(error);
    }
  }

  function stopShakeMode() {
    if (!shakeListening) {
      return;
    }
    window.removeEventListener("devicemotion", handleMotion);
    shakeListening = false;
  }

  function handleMotion(event) {
    var acceleration = event.accelerationIncludingGravity || {};
    var total =
      Math.abs(acceleration.x || 0) +
      Math.abs(acceleration.y || 0) +
      Math.abs(acceleration.z || 0);
    if (total > 42) {
      completeShake();
    }
  }

  function completeShake() {
    stopShakeMode();
    playSoundEffect("shake");
    setState(function (current) {
      var next = cloneState(current);
      next.methodReady = true;
      return next;
    });
    triggerStageFx("shake-ready", deriveMix().paletteKey, 1150);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var line = "";
    var currentY = y;
    String(text || "")
      .split("")
      .forEach(function (char) {
        var testLine = line + char;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line, x, currentY, maxWidth);
          line = char;
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      });
    if (line) {
      ctx.fillText(line, x, currentY, maxWidth);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showError(error) {
    console.error(error);
    if (mounts.app) {
      mounts.app.classList.add("hidden");
    }
    if (mounts.error) {
      mounts.error.classList.remove("hidden");
      var text = mounts.error.querySelector(".error-screen__text");
      if (text) {
        text.textContent = ERROR_MESSAGE;
      }
    }
  }

  function updateViewportScale() {
    var designWidth = 480;
    var designHeight = 960;
    var viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var fittedScale = Math.min(viewportWidth / designWidth, viewportHeight / designHeight, 1);
    var scale = fittedScale < 1 ? fittedScale * 0.96 : 1;
    document.documentElement.style.setProperty("--ui-scale", String(scale));
  }

  try {
    updateViewportScale();
    mounts.panel.addEventListener("click", handlePanelClick);
    mounts.panel.addEventListener("input", handlePanelInput);
    mounts.header.addEventListener("click", handleHeaderClick);
    mounts.controls.addEventListener("click", handleControlClick);
    mounts.stage.addEventListener("click", handleControlClick);
    mounts.modal.addEventListener("click", handleModalClick);
    document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
    document.addEventListener("keydown", startBackgroundMusic, { once: true });
    window.addEventListener("resize", updateViewportScale);
    window.addEventListener("orientationchange", updateViewportScale);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportScale);
    }
    render();
  } catch (error) {
    showError(error);
  }
})();
