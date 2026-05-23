(function () {
  const APP_TITLE = "调酒实验室";
  const ERROR_MESSAGE = "哎呀，出错了，请重启试试吧~";
  const STORAGE_KEY = "cocktail-lab-state";

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
    { id: "syrup", name: "糖浆", palette: "amber", strength: 1, clarityShift: -1, fill: 0.6, bubble: 0, ice: 0, foam: 1 },
    { id: "bitters", name: "苦精", palette: "tea", strength: 1, clarityShift: 0, fill: 0.3, bubble: 0, ice: 0, foam: 0 },
    { id: "soda", name: "苏打顶", palette: "crystal", strength: 1, clarityShift: 2, fill: 0.8, bubble: 3, ice: 0, foam: 1 },
    { id: "cola", name: "可乐", palette: "cola", strength: 4, clarityShift: -2, fill: 0.9, bubble: 1, ice: 0, foam: 0 },
    { id: "tea", name: "红茶", palette: "tea", strength: 3, clarityShift: -1, fill: 0.8, bubble: 0, ice: 0, foam: 0 },
    { id: "ice", name: "冰块", palette: "crystal", strength: 0, clarityShift: 1, fill: 0.2, bubble: 0, ice: 3, foam: 0 },
  ];

  const FLAVORS = [
    { id: "lemon", name: "柠檬", accent: "sunset", garnish: "柠檬片" },
    { id: "lime", name: "青柠", accent: "lime", garnish: "青柠片" },
    { id: "orange", name: "橙子", accent: "sunset", garnish: "橙皮卷" },
    { id: "strawberry", name: "草莓", accent: "berry", garnish: "草莓果粒" },
    { id: "peach", name: "蜜桃", accent: "sunset", garnish: "蜜桃片" },
    { id: "cranberry", name: "蔓越莓", accent: "berry", garnish: "莓果串" },
    { id: "pineapple", name: "菠萝", accent: "amber", garnish: "菠萝角" },
    { id: "blueberry", name: "蓝莓", accent: "ocean", garnish: "蓝莓串" },
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
    { name: "金汤力", base: "gin", mixers: ["soda"], flavors: ["lime"], method: "built", glass: "highball", minScore: 70 },
    { name: "自由古巴", base: "rum", mixers: ["cola", "ice"], flavors: ["lime"], method: "built", glass: "highball", minScore: 75 },
    { name: "威士忌酸", base: "whiskey", mixers: ["syrup"], flavors: ["lemon"], method: "shaken", glass: "rocks", minScore: 70 },
    { name: "龙舌兰日出", base: "tequila", mixers: ["ice"], flavors: ["orange", "cranberry"], method: "layered", glass: "highball", minScore: 70 },
    { name: "蔓越莓伏特加", base: "vodka", mixers: [], flavors: ["cranberry"], method: "built", glass: "highball", minScore: 60 },
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
  let posterModalOpen = false;
  let stageFx = { type: "idle", paletteKey: "crystal", token: 0 };
  let stageFxTimer = null;

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
    };
  }

  function normalizeState(value) {
    return Object.assign(initialState(), value || {});
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
    triggerStageFx("pour", mixer ? mixer.palette : "crystal", 760);
  }

  function toggleFlavor(flavorId) {
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
  }

  function selectMethod(methodId) {
    setState(function (current) {
      var next = cloneState(current);
      next.methodSelection = methodId;
      next.methodReady = methodId !== "shaken";
      return next;
    });

    if (methodId === "shaken") {
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
    renderPosterModal();
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
    posterModalOpen = false;
    clearStageFx(true);
    state = initialState();
    saveState();
    render();
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

  function render() {
    var mix = deriveMix();
    var finalVisual = deriveFinal(mix);
    var classic = findClassic();
    var step = STEPS.find(function (item) {
      return item.id === state.currentStep;
    });

    renderHeader(step);
    renderStage(step, mix, finalVisual);
    renderPanel(step, mix, finalVisual, classic);
    renderControls();
    renderPosterModal();
  }

  function renderHeader(step) {
    var index = STEPS.findIndex(function (item) { return item.id === step.id; });
    mounts.header.innerHTML = `
      <div class="topbar">
        <div class="topbar__copy">
          <p class="eyebrow">Cocktail Lab</p>
          <h1 class="app-title">${APP_TITLE}</h1>
        </div>
        <div class="topbar__step">
          <span class="topbar__step-badge">Step ${index + 1}</span>
          <span class="topbar__step-label">${step.label}</span>
        </div>
      </div>
    `;
  }

  function renderStage(step, mix, finalVisual) {
    var palette = PALETTES[mix.paletteKey] || PALETTES.crystal;
    var accentPalette = PALETTES[finalVisual.accentPalette] || palette;
    var isWaitingShake = state.currentStep === "method" && state.methodSelection === "shaken" && !state.methodReady;
    var tray = state.flavorSelections.length
      ? state.flavorSelections.map(function (id) {
          var item = FLAVORS.find(function (flavor) { return flavor.id === id; });
          return `<span class="tray-pill tray-pill--${item.accent}">${item.name}</span>`;
        }).join("")
      : '<span class="tray-pill tray-pill--empty">还没有选择风味材料</span>';

    var bubbles = new Array(mix.bubbleLevel * 3).fill(0).map(function (_, index) {
      return `<span class="bubble" style="--bubble-left:${18 + ((index * 19) % 54)}%;--bubble-delay:${index * 190}ms;--bubble-size:${5 + (index % 3) * 2}px;--bubble-rise:${54 + (index % 3) * 15}px;"></span>`;
    }).join("");

    var ice = new Array(mix.iceLevel).fill(0).map(function (_, index) {
      return `<span class="ice-block" style="--ice-left:${18 + index * 18}%;--ice-delay:${index * 220}ms;--ice-rotate:${-7 + index * 6}deg;"></span>`;
    }).join("");

    var garnish = finalVisual.garnishes.map(function (item) {
      return `<span class="garnish-pill garnish-pill--${item.accent}">${item.garnish}</span>`;
    }).join("");

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
        <div class="stage-copy">
          <p class="stage-copy__step">${step.label}</p>
          <p class="stage-copy__hint">${step.helper}</p>
        </div>
        <div class="flavor-tray">${tray}</div>
        ${pourFx}
        <div class="glass-zone">
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
          <div class="garnish-row">${garnish}</div>
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

    if (state.currentStep === "base") {
      items = BASES.map(function (item) {
        var pours = state.baseSelection && state.baseSelection.id === item.id ? state.baseSelection.pours : 0;
        return optionCard(item.id, item.name, pours ? pours + " 份" : "点击加入", "base", pours > 0, item.icon);
      }).join("");
    }

    if (state.currentStep === "mixer") {
      items = MIXERS.map(function (item) {
        var current = state.mixerSelections.find(function (entry) { return entry.id === item.id; });
        return optionCard(item.id, item.name, current ? current.pours + " 份" : "点击加入", "mixer", Boolean(current));
      }).join("");
    }

    if (state.currentStep === "flavor") {
      items = FLAVORS.map(function (item) {
        var selected = state.flavorSelections.indexOf(item.id) >= 0;
        return optionCard(item.id, item.name, selected ? "已放入托盘" : "点击选择", "flavor", selected);
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
        <div class="sheet__header">
          <p class="sheet__title">${step.label}</p>
        </div>
        <div class="option-grid">${items}</div>
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
        <div class="poster-preview">${posterMarkup(classic)}</div>
      </div>
    `;
  }

  function syncPosterPreview() {
    var preview = mounts.panel.querySelector(".poster-preview");
    if (!preview || state.currentStep !== "poster") {
      return;
    }
    var classic = findClassic();
    preview.innerHTML = posterMarkup(classic);
  }

  function posterMarkup(classic) {
    var theme = THEMES.find(function (item) {
      return item.id === state.posterTheme;
    }) || THEMES[0];
    return `
      <article class="poster-card" style="background:${theme.background}">
        <div class="poster-card__glow"></div>
        <p class="poster-card__label">${APP_TITLE}</p>
        <h3 class="poster-card__name">${escapeHtml(state.cocktailName || "今夜特调")}</h3>
        <p class="poster-card__note">${escapeHtml(state.cocktailNote || "一杯属于今晚的自定义风味。")}</p>
        ${classic ? `<div class="poster-classic">经典款彩蛋：${classic.recipe.name}</div>` : ""}
        <p class="poster-card__recipe">${escapeHtml(recipeSummary())}</p>
        <p class="poster-card__signature">${escapeHtml(state.signature || "由你亲手调制")}</p>
      </article>
    `;
  }

  function optionCard(id, title, meta, kind, active, iconSrc) {
    var media = iconSrc
      ? `<span class="option-card__media" aria-hidden="true"><img class="option-card__icon" src="${iconSrc}" alt=""></span>`
      : "";
    return `
      <button type="button" class="option-card ${active ? "option-card--active" : ""}" data-kind="${kind}" data-id="${id}">
        <span class="option-card__body">
          <span class="option-card__title">${title}</span>
          <span class="option-card__meta">${meta}</span>
        </span>
        ${media}
      </button>
    `;
  }

  function renderControls() {
    var index = STEPS.findIndex(function (item) {
      return item.id === state.currentStep;
    });

    mounts.controls.innerHTML = `
      <button type="button" class="control-button control-button--ghost" data-action="prev" ${index <= 0 ? "disabled" : ""}>上一步</button>
      <button type="button" class="control-button control-button--ghost" data-action="undo" ${state.actionHistory.length ? "" : "disabled"}>撤销上一份</button>
      <button type="button" class="control-button control-button--ghost" data-action="reset">重置</button>
      <button type="button" class="control-button" data-action="next" ${canProceed() ? "" : "disabled"}>${index >= STEPS.length - 1 ? "完成海报" : "下一步"}</button>
    `;
  }

  function openPosterModal() {
    posterModalOpen = true;
    renderPosterModal();
  }

  function closePosterModal() {
    posterModalOpen = false;
    renderPosterModal();
  }

  function renderPosterModal() {
    if (!mounts.modal) {
      return;
    }

    if (!posterModalOpen) {
      mounts.modal.classList.add("hidden");
      mounts.modal.setAttribute("aria-hidden", "true");
      mounts.modal.innerHTML = "";
      return;
    }

    var classic = findClassic();
    mounts.modal.classList.remove("hidden");
    mounts.modal.setAttribute("aria-hidden", "false");
    mounts.modal.innerHTML = `
      <div class="poster-modal__backdrop" data-action="close-poster-modal"></div>
      <div class="poster-modal__card">
        <button type="button" class="poster-modal__close" data-action="close-poster-modal" aria-label="关闭">×</button>
        <p class="poster-modal__eyebrow">完成海报</p>
        <div class="poster-modal__preview">${posterMarkup(classic)}</div>
        <div class="poster-modal__actions">
          <button type="button" class="control-button control-button--ghost" data-action="close-poster-modal">继续调整</button>
          <button type="button" class="control-button" data-action="save-poster-modal">保存海报</button>
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
    if (action === "next" && canProceed() && state.currentStep !== "poster") {
      moveStep(1);
    }
    if (action === "complete-shake") {
      completeShake();
    }
    if (action === "close-poster-modal") {
      closePosterModal();
    }
    if (action === "save-poster-modal") {
      exportPoster();
    }
  }

  function moveStep(offset) {
    var index = STEPS.findIndex(function (item) {
      return item.id === state.currentStep;
    });
    var nextIndex = clamp(index + offset, 0, STEPS.length - 1);
    if (nextIndex === index) {
      return;
    }
    posterModalOpen = false;
    clearStageFx(true);
    state.currentStep = STEPS[nextIndex].id;
    saveState();
    render();
  }

  function exportPoster() {
    try {
      var theme = THEMES.find(function (item) { return item.id === state.posterTheme; }) || THEMES[0];
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
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
      ctx.fillText(state.cocktailName || "今夜特调", 96, 300, 860);
      ctx.font = "36px sans-serif";
      wrapText(ctx, state.cocktailNote || "一杯属于今晚的自定义风味。", 96, 390, 860, 56);
      ctx.font = "30px sans-serif";
      wrapText(ctx, recipeSummary(), 96, 560, 860, 44);
      ctx.font = "bold 34px sans-serif";
      ctx.fillText(state.signature || "由你亲手调制", 96, 1790, 860);

      var link = document.createElement("a");
      link.download = "cocktail-lab-poster.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      showError(error);
    }
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

  try {
    mounts.panel.addEventListener("click", handlePanelClick);
    mounts.panel.addEventListener("input", handlePanelInput);
    mounts.controls.addEventListener("click", handleControlClick);
    mounts.stage.addEventListener("click", handleControlClick);
    mounts.modal.addEventListener("click", handleControlClick);
    render();
  } catch (error) {
    showError(error);
  }
})();
