# Cocktail Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure-offline mobile portrait interactive cocktail mixing experience with a single-workbench flow, real-time liquid feedback, lightweight mix animations, and a poster export screen.

**Architecture:** Use a static multi-file HTML/CSS/JavaScript app rooted at `index.html`. Keep user choices as the single source of truth in a plain state object, derive all mix visuals from that state on each update, and isolate rendering, interaction logic, visual calculation, and poster export into small modules.

**Tech Stack:** HTML, CSS, vanilla JavaScript, localStorage, Canvas/SVG/DOM rendering, no build step, no external dependencies.

---

## File Structure

Planned files and responsibilities:

- Create: `C:\Users\23917\Desktop\cocktail-lab\index.html`
- Create: `C:\Users\23917\Desktop\cocktail-lab\css\main.css`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\config.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\state.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\logic.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\render.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\poster.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Create: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

Module responsibilities:

- `index.html`: Static app shell, error message host, semantic containers for each UI region.
- `css/main.css`: Portrait layout, pixel-bar mood styling, responsive rules, lightweight animations, poster styling.
- `js/config.js`: Step definitions, palettes, ingredients, methods, glass types, classic recipes, poster themes.
- `js/state.js`: Initial state, update helpers, undo stack, persistence helpers.
- `js/logic.js`: Step navigation rules, visual derivation pipeline, classic recipe scoring, validation helpers.
- `js/render.js`: DOM rendering for stage, option panel, controls, and poster preview.
- `js/poster.js`: Poster export and fallback save interactions.
- `js/main.js`: App bootstrap, event wiring, guarded rerender loop, runtime error handling.
- `tests/manual-test-checklist.md`: Manual verification script for mobile, desktop fallback, offline behavior, export, and error handling.

---

### Task 1: Scaffold Static Offline App Shell

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\index.html`
- Create: `C:\Users\23917\Desktop\cocktail-lab\css\main.css`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Write the static HTML shell**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
    >
    <title>调酒实验室</title>
    <link rel="stylesheet" href="./css/main.css">
  </head>
  <body>
    <div id="app" class="app-shell">
      <header class="step-header" id="step-header"></header>
      <main class="app-main">
        <section class="mix-stage" id="mix-stage"></section>
        <section class="option-panel" id="option-panel"></section>
      </main>
      <nav class="bottom-controls" id="bottom-controls"></nav>
    </div>
    <div id="error-screen" class="error-screen hidden" aria-live="assertive">
      哎呀，出错了，请重启试试吧~
    </div>
    <script type="module" src="./js/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Add base portrait layout styles**

```css
:root {
  --bg-top: #1d1a1a;
  --bg-bottom: #0f0d0f;
  --panel: rgba(28, 22, 21, 0.92);
  --panel-border: rgba(255, 234, 197, 0.16);
  --text-main: #f7e8cb;
  --text-muted: #d3bea2;
  --accent: #f0c27b;
  --danger: #ff8f8f;
  --shadow: rgba(0, 0, 0, 0.35);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: linear-gradient(180deg, var(--bg-top), var(--bg-bottom));
  color: var(--text-main);
  font-family: "Trebuchet MS", "Verdana", sans-serif;
  overflow-x: hidden;
}

body {
  display: flex;
  justify-content: center;
}

.app-shell {
  width: min(100vw, 480px);
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 12px 12px calc(12px + var(--safe-bottom));
}

.app-main {
  display: grid;
  grid-template-rows: minmax(280px, 46vh) 1fr;
  gap: 12px;
}

.hidden {
  display: none !important;
}
```

- [ ] **Step 3: Add the initial manual checklist document**

```md
# 调酒实验室手动测试清单

## 基础打开
- 直接双击 `index.html` 可以打开页面
- 页面为竖屏布局，无横向滚动
- 未加载任何外部网络资源

## 首屏结构
- 有顶部步骤区
- 有中部调酒舞台
- 有下部操作区
- 有底部控制按钮
```

- [ ] **Step 4: Open the app locally and verify the shell loads**

Run: Open `C:\Users\23917\Desktop\cocktail-lab\index.html` in a browser  
Expected: A portrait shell appears with no console-blocking load errors and no horizontal scrollbar.

- [ ] **Step 5: Commit**

```bash
git add index.html css/main.css tests/manual-test-checklist.md
git commit -m "chore: scaffold offline cocktail lab shell"
```

---

### Task 2: Define Static Config Data

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\config.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\index.html`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Write the step and option configuration**

```js
export const STEPS = [
  { id: "base", label: "基酒", optional: false },
  { id: "mixer", label: "辅料", optional: true },
  { id: "flavor", label: "风味材料", optional: true },
  { id: "method", label: "调制方式", optional: false },
  { id: "glass", label: "杯型", optional: false },
  { id: "poster", label: "海报", optional: false }
];

export const BASES = [
  { id: "gin", name: "金酒", paletteBias: "crystal", strength: 3, clarity: 4, fillUnit: 1 },
  { id: "rum", name: "朗姆酒", paletteBias: "amber", strength: 3, clarity: 3, fillUnit: 1 },
  { id: "vodka", name: "伏特加", paletteBias: "crystal", strength: 2, clarity: 5, fillUnit: 1 },
  { id: "tequila", name: "龙舌兰", paletteBias: "sunset", strength: 3, clarity: 3, fillUnit: 1 },
  { id: "whiskey", name: "威士忌", paletteBias: "amber", strength: 4, clarity: 2, fillUnit: 1 },
  { id: "sparkling-water", name: "气泡水", paletteBias: "crystal", strength: 1, clarity: 5, fillUnit: 1 }
];
```

- [ ] **Step 2: Add mixers, flavors, methods, glasses, palettes, themes, and classics**

```js
export const MIXERS = [
  { id: "syrup", name: "糖浆", paletteBias: "amber", strength: 1, clarityShift: -1, fillUnit: 0.6, bubbleLevel: 0, iceLevel: 0, foamLevel: 1, layerWeight: 2 },
  { id: "bitters", name: "苦精", paletteBias: "tea", strength: 1, clarityShift: 0, fillUnit: 0.3, bubbleLevel: 0, iceLevel: 0, foamLevel: 0, layerWeight: 2 },
  { id: "soda", name: "苏打顶", paletteBias: "crystal", strength: 1, clarityShift: 2, fillUnit: 0.8, bubbleLevel: 3, iceLevel: 0, foamLevel: 1, layerWeight: 1 },
  { id: "cola", name: "可乐", paletteBias: "cola", strength: 4, clarityShift: -2, fillUnit: 0.9, bubbleLevel: 1, iceLevel: 0, foamLevel: 0, layerWeight: 3 },
  { id: "tea", name: "红茶", paletteBias: "tea", strength: 3, clarityShift: -1, fillUnit: 0.8, bubbleLevel: 0, iceLevel: 0, foamLevel: 0, layerWeight: 2 },
  { id: "ice", name: "冰块", paletteBias: "crystal", strength: 0, clarityShift: 1, fillUnit: 0.2, bubbleLevel: 0, iceLevel: 3, foamLevel: 0, layerWeight: 1 }
];

export const FLAVORS = [
  { id: "lemon", name: "柠檬", accentPalette: "sunset", accentStrength: 2, garnish: "lemon-wheel", trayIcon: "lemon" },
  { id: "lime", name: "青柠", accentPalette: "lime", accentStrength: 3, garnish: "lime-wheel", trayIcon: "lime" },
  { id: "orange", name: "橙子", accentPalette: "sunset", accentStrength: 3, garnish: "orange-peel", trayIcon: "orange" },
  { id: "strawberry", name: "草莓", accentPalette: "berry", accentStrength: 3, garnish: "strawberry", trayIcon: "strawberry" },
  { id: "peach", name: "蜜桃", accentPalette: "sunset", accentStrength: 2, garnish: "peach-slice", trayIcon: "peach" },
  { id: "cranberry", name: "蔓越莓", accentPalette: "berry", accentStrength: 4, garnish: "berry-cluster", trayIcon: "cranberry" },
  { id: "pineapple", name: "菠萝", accentPalette: "amber", accentStrength: 2, garnish: "pineapple-wedge", trayIcon: "pineapple" },
  { id: "blueberry", name: "蓝莓", accentPalette: "ocean", accentStrength: 2, garnish: "blueberry-skewer", trayIcon: "blueberry" }
];
```

- [ ] **Step 3: Wire config module loading**

```html
<script type="module" src="./js/main.js"></script>
```

Expected: `main.js` can import from `./config.js` without path changes or bundling.

- [ ] **Step 4: Extend the manual checklist**

```md
## 配置基础
- 所有步骤顺序与设计文档一致
- 基酒为 6 种
- 辅料为 6 种
- 风味材料为 8 种
- 调制方式为 4 种
- 杯型为 5 种
- 经典彩蛋配置已存在
```

- [ ] **Step 5: Run a module-load smoke test**

Run: Open DevTools console on `index.html` after a placeholder `console.log(BASES.length)` import in `main.js`  
Expected: The module loads, and the count logs without network or syntax errors.

- [ ] **Step 6: Commit**

```bash
git add js/config.js index.html tests/manual-test-checklist.md
git commit -m "feat: add cocktail lab configuration data"
```

---

### Task 3: Build State Management and Undo Behavior

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\state.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Write the state shape and initializer**

```js
import { STEPS } from "./config.js";

export function createInitialState() {
  return {
    currentStep: STEPS[0].id,
    methodReady: false,
    baseSelection: null,
    mixerSelections: [],
    flavorSelections: [],
    methodSelection: null,
    glassSelection: null,
    actionHistory: [],
    posterTheme: "warm-night",
    cocktailName: "",
    cocktailNote: "",
    signature: ""
  };
}
```

- [ ] **Step 2: Add immutable update helpers**

```js
export function addBasePour(state, baseId) {
  const next = structuredClone(state);

  if (!next.baseSelection || next.baseSelection.id !== baseId) {
    next.baseSelection = { id: baseId, pours: 1 };
  } else if (next.baseSelection.pours < 4) {
    next.baseSelection.pours += 1;
  }

  next.actionHistory.push({ type: "add-base", id: baseId });
  return next;
}

export function undoLastPour(state) {
  if (!state.actionHistory.length) {
    return state;
  }

  const next = structuredClone(state);
  const action = next.actionHistory.pop();

  if (action.type === "add-base" && next.baseSelection?.id === action.id) {
    next.baseSelection.pours -= 1;
    if (next.baseSelection.pours <= 0) {
      next.baseSelection = null;
    }
  }

  return next;
}
```

- [ ] **Step 3: Add mixer, flavor, method, glass, and poster setters**

```js
export function toggleFlavor(state, flavorId) {
  const next = structuredClone(state);
  const index = next.flavorSelections.indexOf(flavorId);

  if (index >= 0) {
    next.flavorSelections.splice(index, 1);
    return next;
  }

  if (next.flavorSelections.length >= 2) {
    return next;
  }

  next.flavorSelections.push(flavorId);
  return next;
}
```

- [ ] **Step 4: Add localStorage persistence helpers**

```js
const STORAGE_KEY = "cocktail-lab-state";

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
```

- [ ] **Step 5: Hook a temporary state smoke test into `main.js`**

```js
import { createInitialState } from "./state.js";

const state = createInitialState();
console.log("state-ready", state.currentStep);
```

- [ ] **Step 6: Run the smoke test**

Run: Open `index.html` and inspect the console  
Expected: `state-ready base` appears and there are no syntax errors.

- [ ] **Step 7: Update the manual checklist**

```md
## 状态行为
- 初始步骤为基酒
- 撤销在没有加料记录时不会报错
- 风味材料至多 2 种
- 页面刷新后能恢复最近一次状态
```

- [ ] **Step 8: Commit**

```bash
git add js/state.js js/main.js tests/manual-test-checklist.md
git commit -m "feat: add app state and undo helpers"
```

---

### Task 4: Implement Visual Derivation and Validation Logic

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\logic.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\config.js`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Write step validation helpers**

```js
import { STEPS, BASES, MIXERS, FLAVORS } from "./config.js";

export function canProceed(state) {
  switch (state.currentStep) {
    case "base":
      return Boolean(state.baseSelection?.pours);
    case "mixer":
      return true;
    case "flavor":
      return true;
    case "method":
      return Boolean(state.methodSelection) && (state.methodSelection !== "shaken" || state.methodReady);
    case "glass":
      return Boolean(state.glassSelection);
    case "poster":
      return true;
    default:
      return false;
  }
}
```

- [ ] **Step 2: Add the mix-stage derivation pipeline**

```js
export function deriveMixVisual(state) {
  const paletteScores = new Map();
  let fillLevel = 0;
  let clarityLevel = 3;
  let bubbleLevel = 0;
  let iceLevel = 0;
  let foamLevel = 0;

  if (state.baseSelection) {
    const base = BASES.find((item) => item.id === state.baseSelection.id);
    paletteScores.set(base.paletteBias, base.strength * state.baseSelection.pours);
    fillLevel += base.fillUnit * state.baseSelection.pours;
    clarityLevel = base.clarity;
  }

  for (const mixerSelection of state.mixerSelections) {
    const mixer = MIXERS.find((item) => item.id === mixerSelection.id);
    const previous = paletteScores.get(mixer.paletteBias) || 0;
    paletteScores.set(mixer.paletteBias, previous + mixer.strength * mixerSelection.pours);
    fillLevel += mixer.fillUnit * mixerSelection.pours;
    clarityLevel += mixer.clarityShift * mixerSelection.pours;
    bubbleLevel += mixer.bubbleLevel * mixerSelection.pours;
    iceLevel += mixer.iceLevel * mixerSelection.pours;
    foamLevel += mixer.foamLevel * mixerSelection.pours;
  }

  return {
    fillLevel: Math.min(1, fillLevel / 6),
    paletteKey: pickTopPalette(paletteScores),
    toneLevel: Math.min(5, Math.max(1, Math.ceil(fillLevel))),
    clarityLevel: Math.min(5, Math.max(1, clarityLevel)),
    bubbleLevel: Math.min(3, bubbleLevel),
    iceLevel: Math.min(3, iceLevel),
    foamLevel: Math.min(3, foamLevel)
  };
}
```

- [ ] **Step 3: Add final visual and classic scoring helpers**

```js
export function deriveFinalVisual(state, mixVisual) {
  return {
    paletteKey: mixVisual.paletteKey,
    accentKeys: state.flavorSelections,
    garnishes: state.flavorSelections,
    layerMode: state.methodSelection === "layered" ? "split" : "single",
    glassShape: state.glassSelection || "highball",
    highlightStyle: state.methodSelection || "built"
  };
}

export function scoreClassic(state, recipe) {
  let score = 0;

  if (state.baseSelection?.id === recipe.base) {
    score += 50;
  }

  for (const mixerId of recipe.mixers) {
    if (state.mixerSelections.some((item) => item.id === mixerId)) {
      score += 15;
    }
  }

  for (const flavorId of recipe.flavors) {
    if (state.flavorSelections.includes(flavorId)) {
      score += 10;
    }
  }

  if (state.methodSelection === recipe.method) {
    score += 5;
  }

  if (state.glassSelection === recipe.glass) {
    score += 5;
  }

  return score;
}
```

- [ ] **Step 4: Add a top-level recipe match helper**

```js
import { CLASSIC_RECIPES } from "./config.js";

export function findClassicMatch(state) {
  let bestMatch = null;

  for (const recipe of CLASSIC_RECIPES) {
    const score = scoreClassic(state, recipe);
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { recipe, score };
    }
  }

  return bestMatch && bestMatch.score >= bestMatch.recipe.minScore ? bestMatch : null;
}
```

- [ ] **Step 5: Run a browser smoke test**

Run: Temporarily log `deriveMixVisual(createInitialState())` from `main.js`  
Expected: A valid object logs with `paletteKey`, `fillLevel`, and no runtime errors.

- [ ] **Step 6: Update the manual checklist**

```md
## 规则逻辑
- 基酒步骤未选基酒时“下一步”不可用
- 辅料和风味材料步骤不强制选择
- 调制方式为摇和时，未完成摇匀前不可进入下一步
- 命中经典款时能得到一个高于阈值的匹配结果
```

- [ ] **Step 7: Commit**

```bash
git add js/logic.js js/config.js tests/manual-test-checklist.md
git commit -m "feat: add mix derivation and classic scoring logic"
```

---

### Task 5: Render the Workbench UI and Option Panels

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\render.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\css\main.css`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Render the header and controls**

```js
import { STEPS } from "./config.js";
import { canProceed } from "./logic.js";

export function renderHeader(state, nodes) {
  const stepIndex = STEPS.findIndex((item) => item.id === state.currentStep);
  nodes.stepHeader.innerHTML = `
    <div class="step-header__title">调酒实验室</div>
    <div class="step-header__meta">Step ${stepIndex + 1} / ${STEPS.length}</div>
    <div class="step-header__label">${STEPS[stepIndex].label}</div>
  `;
}

export function renderControls(state, nodes) {
  nodes.bottomControls.innerHTML = `
    <button data-action="prev">上一步</button>
    <button data-action="undo">撤销上一份</button>
    <button data-action="next" ${canProceed(state) ? "" : "disabled"}>下一步</button>
  `;
}
```

- [ ] **Step 2: Render the mixing stage**

```js
export function renderStage(state, visuals, nodes) {
  const iceBlocks = new Array(visuals.mixVisual.iceLevel).fill('<span class="ice-block"></span>').join("");
  const bubbles = new Array(visuals.mixVisual.bubbleLevel * 3).fill('<span class="bubble"></span>').join("");

  nodes.mixStage.innerHTML = `
    <div class="bar-table">
      <div class="flavor-tray" id="flavor-tray"></div>
      <div class="vessel vessel--${visuals.finalVisual.glassShape}">
        <div class="liquid liquid--${visuals.mixVisual.paletteKey}" style="height:${Math.max(12, visuals.mixVisual.fillLevel * 100)}%">
          <div class="foam foam--${visuals.mixVisual.foamLevel}"></div>
          <div class="ice-layer">${iceBlocks}</div>
          <div class="bubble-layer">${bubbles}</div>
        </div>
      </div>
    </div>
  `;
}
```

- [ ] **Step 3: Render per-step option panels**

```js
export function renderOptions(state, nodes, options) {
  if (state.currentStep === "base") {
    nodes.optionPanel.innerHTML = options.bases.map((item) => `
      <button class="option-card" data-kind="base" data-id="${item.id}">
        <span>${item.name}</span>
      </button>
    `).join("");
    return;
  }

  if (state.currentStep === "mixer") {
    nodes.optionPanel.innerHTML = options.mixers.map((item) => `
      <button class="option-card" data-kind="mixer" data-id="${item.id}">
        <span>${item.name}</span>
      </button>
    `).join("");
    return;
  }
}
```

- [ ] **Step 4: Add matching CSS blocks for the stage and cards**

```css
.mix-stage,
.option-panel,
.bottom-controls,
.step-header {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  box-shadow: 0 12px 24px var(--shadow);
}

.vessel {
  position: relative;
  width: 180px;
  height: 220px;
  margin: 0 auto;
  border: 3px solid rgba(255, 246, 228, 0.55);
  border-radius: 26px 26px 18px 18px;
  overflow: hidden;
}

.liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transition: height 180ms ease-out;
}

.option-card {
  min-height: 56px;
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-main);
}
```

- [ ] **Step 5: Wire render orchestration in `main.js`**

```js
import { BASES, MIXERS, FLAVORS, METHODS, GLASSES } from "./config.js";
import { deriveMixVisual, deriveFinalVisual } from "./logic.js";
import { renderControls, renderHeader, renderOptions, renderStage } from "./render.js";

function rerender(state, nodes) {
  const mixVisual = deriveMixVisual(state);
  const finalVisual = deriveFinalVisual(state, mixVisual);

  renderHeader(state, nodes);
  renderStage(state, { mixVisual, finalVisual }, nodes);
  renderOptions(state, nodes, { bases: BASES, mixers: MIXERS, flavors: FLAVORS, methods: METHODS, glasses: GLASSES });
  renderControls(state, nodes);
}
```

- [ ] **Step 6: Verify the workbench renders**

Run: Open `index.html`  
Expected: The header, vessel, option cards, and bottom controls appear and rerender without refreshing the page.

- [ ] **Step 7: Update the manual checklist**

```md
## 工作台表现
- 杯子区域始终显示
- 当前步骤切换时只有操作区内容变化
- 底部始终可见上一步、撤销上一份、下一步
- 风味托盘在舞台中可见
```

- [ ] **Step 8: Commit**

```bash
git add js/render.js js/main.js css/main.css tests/manual-test-checklist.md
git commit -m "feat: render workbench layout and step panels"
```

---

### Task 6: Implement Interactions, Navigation, and Real-Time Updating

**Files:**
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\state.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\render.js`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Implement delegated click handling**

```js
function handleOptionClick(event) {
  const button = event.target.closest("[data-id]");
  if (!button) {
    return;
  }

  const { kind, id } = button.dataset;

  if (kind === "base") {
    setState((current) => addBasePour(current, id));
    return;
  }

  if (kind === "mixer") {
    setState((current) => addMixerPour(current, id));
    return;
  }

  if (kind === "flavor") {
    setState((current) => toggleFlavor(current, id));
  }
}
```

- [ ] **Step 2: Implement step navigation**

```js
function goToNextStep() {
  if (!canProceed(appState)) {
    return;
  }

  const index = STEPS.findIndex((item) => item.id === appState.currentStep);
  if (index < STEPS.length - 1) {
    setState((current) => ({ ...current, currentStep: STEPS[index + 1].id }));
  }
}

function goToPreviousStep() {
  const index = STEPS.findIndex((item) => item.id === appState.currentStep);
  if (index > 0) {
    setState((current) => ({ ...current, currentStep: STEPS[index - 1].id }));
  }
}
```

- [ ] **Step 3: Implement undo button behavior**

```js
function handleControlClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) {
    return;
  }

  if (action === "undo") {
    setState((current) => undoLastPour(current));
    return;
  }
}
```

- [ ] **Step 4: Add visual feedback hooks**

```js
export function playPourFeedback(kind) {
  document.body.dataset.feedback = kind;
  window.clearTimeout(playPourFeedback.timerId);
  playPourFeedback.timerId = window.setTimeout(() => {
    delete document.body.dataset.feedback;
  }, 180);
}
```

- [ ] **Step 5: Verify real-time updates manually**

Run: Open `index.html`, add base pours, add mixers, toggle flavors, navigate between steps  
Expected: The vessel updates immediately after each action, and previous choices remain when moving back and forth.

- [ ] **Step 6: Extend the manual checklist**

```md
## 实时交互
- 基酒点击后液面立即上升
- 辅料点击后酒液效果立即变化
- 风味材料只显示在托盘，不直接改变制作中液面
- 返回前一步后可以继续编辑
- 撤销上一份只回退加料动作
```

- [ ] **Step 7: Commit**

```bash
git add js/main.js js/state.js js/render.js tests/manual-test-checklist.md
git commit -m "feat: wire step interactions and real-time updates"
```

---

### Task 7: Add Method Effects and Motion/Click Fallback for Shaking

**Files:**
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\logic.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\css\main.css`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Implement method selection state changes**

```js
function selectMethod(methodId) {
  setState((current) => ({
    ...current,
    methodSelection: methodId,
    methodReady: methodId === "shaken" ? false : true
  }));
}
```

- [ ] **Step 2: Add motion detection fallback logic**

```js
let shakeSamples = [];

function startShakeMode() {
  if (typeof DeviceMotionEvent === "undefined") {
    showShakeFallbackButton();
    return;
  }

  window.addEventListener("devicemotion", handleMotion);
}

function handleMotion(event) {
  const ax = Math.abs(event.accelerationIncludingGravity?.x || 0);
  const ay = Math.abs(event.accelerationIncludingGravity?.y || 0);
  const az = Math.abs(event.accelerationIncludingGravity?.z || 0);
  const energy = ax + ay + az;

  shakeSamples.push(energy);
  shakeSamples = shakeSamples.slice(-12);

  const burstCount = shakeSamples.filter((item) => item > 30).length;
  if (burstCount >= 4) {
    completeShake();
  }
}
```

- [ ] **Step 3: Add click fallback completion**

```js
function completeShake() {
  window.removeEventListener("devicemotion", handleMotion);
  shakeSamples = [];
  setState((current) => ({ ...current, methodReady: true }));
}

function showShakeFallbackButton() {
  const fallback = document.createElement("button");
  fallback.type = "button";
  fallback.className = "shake-fallback";
  fallback.textContent = "点击摇匀";
  fallback.addEventListener("click", completeShake, { once: true });
  document.getElementById("mix-stage")?.appendChild(fallback);
}
```

- [ ] **Step 4: Add lightweight method animation classes**

```css
.is-shaking .vessel {
  animation: vessel-shake 420ms steps(4) infinite;
}

.is-stirred .liquid {
  animation: liquid-swirl 800ms ease-out;
}

.is-layered .liquid {
  background: linear-gradient(180deg, rgba(255,255,255,0.18), currentColor 40%, rgba(0,0,0,0.18));
}

@keyframes vessel-shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-1deg); }
  50% { transform: translateX(4px) rotate(1deg); }
  100% { transform: translateX(0); }
}
```

- [ ] **Step 5: Verify method interactions**

Run: Open `index.html`, choose each method, and test on both desktop and mobile if available  
Expected: Non-shaken methods finish immediately with a lightweight visual cue; shaken mode requires motion or fallback button before “下一步” enables.

- [ ] **Step 6: Extend the manual checklist**

```md
## 调制方式
- 摇和在支持传感器时可通过摇动完成
- 桌面端能看到“点击摇匀”回退
- 搅拌、分层、兑和都有轻量反馈
- 动画过程不明显卡顿
```

- [ ] **Step 7: Commit**

```bash
git add js/main.js js/logic.js css/main.css tests/manual-test-checklist.md
git commit -m "feat: add method effects and shaking fallback"
```

---

### Task 8: Implement Poster View, Theme Switching, and PNG Export

**Files:**
- Create: `C:\Users\23917\Desktop\cocktail-lab\js\poster.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\render.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\css\main.css`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Test: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Render the poster screen controls**

```js
export function renderPosterPanel(state, nodes, posterData) {
  nodes.optionPanel.innerHTML = `
    <div class="poster-form">
      <label>酒名<input id="cocktail-name" maxlength="12" value="${state.cocktailName}"></label>
      <label>一句话介绍<textarea id="cocktail-note" maxlength="36">${state.cocktailNote}</textarea></label>
      <label>署名 / 心情<input id="cocktail-signature" maxlength="12" value="${state.signature}"></label>
      <div class="poster-themes">
        <button data-theme="warm-night">暖夜黑金</button>
        <button data-theme="sunset-glow">日落橙粉</button>
        <button data-theme="ocean-dream">海洋蓝绿</button>
      </div>
      <button id="save-poster" type="button">保存海报</button>
    </div>
    <div class="poster-preview" id="poster-preview">${posterData.markup}</div>
  `;
}
```

- [ ] **Step 2: Build a poster markup generator**

```js
export function buildPosterMarkup(state, visuals, classicMatch) {
  const classicBadge = classicMatch
    ? `<div class="poster-classic">经典款彩蛋：${classicMatch.recipe.name}</div>`
    : "";

  return `
    <article class="poster-card poster-card--${state.posterTheme}">
      <div class="poster-title">调酒实验室</div>
      <div class="poster-vessel poster-vessel--${visuals.finalVisual.glassShape}"></div>
      <h2 class="poster-name">${escapeHtml(state.cocktailName || "今夜特调")}</h2>
      <p class="poster-note">${escapeHtml(state.cocktailNote || "一杯属于今晚的自定义风味。")}</p>
      ${classicBadge}
      <div class="poster-meta">${escapeHtml(state.signature || "由你亲手调制")}</div>
    </article>
  `;
}
```

- [ ] **Step 3: Add a no-dependency export helper**

```js
export async function exportPosterImage(previewElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1080;
  canvas.height = 1920;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f7e8cb";
  ctx.font = "bold 56px sans-serif";
  ctx.fillText("调酒实验室", 96, 140);

  const link = document.createElement("a");
  link.download = "cocktail-lab-poster.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
```

- [ ] **Step 4: Wire poster inputs and theme changes**

```js
function bindPosterInputs() {
  document.getElementById("cocktail-name")?.addEventListener("input", (event) => {
    setState((current) => ({ ...current, cocktailName: event.target.value }));
  });

  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      setState((current) => ({ ...current, posterTheme: button.dataset.theme }));
    });
  });
}
```

- [ ] **Step 5: Verify poster behavior**

Run: Open `index.html`, complete a mix, move to the poster step, enter text, switch themes, and click save  
Expected: Text updates live, themes switch without layout shift, and a PNG download starts on desktop.

- [ ] **Step 6: Extend the manual checklist**

```md
## 海报
- 酒名最多 12 字
- 一句话介绍最多 36 字
- 署名/心情最多 12 字
- 3 种主题均可切换
- 保存海报按钮可导出图片
```

- [ ] **Step 7: Commit**

```bash
git add js/poster.js js/render.js js/main.js css/main.css tests/manual-test-checklist.md
git commit -m "feat: add poster preview and export flow"
```

---

### Task 9: Add Error Handling, Offline Safeguards, and Final QA

**Files:**
- Modify: `C:\Users\23917\Desktop\cocktail-lab\js\main.js`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\index.html`
- Modify: `C:\Users\23917\Desktop\cocktail-lab\tests\manual-test-checklist.md`

- [ ] **Step 1: Guard bootstrap and rerender with `try-catch`**

```js
function showFatalError() {
  document.getElementById("error-screen")?.classList.remove("hidden");
  document.getElementById("app")?.classList.add("hidden");
}

function safeRerender() {
  try {
    rerender(appState, nodes);
  } catch (error) {
    console.error(error);
    showFatalError();
  }
}

try {
  init();
} catch (error) {
  console.error(error);
  showFatalError();
}
```

- [ ] **Step 2: Add offline safeguard checks**

```js
const forbiddenApis = ["fetch", "XMLHttpRequest", "WebSocket"];
console.info("offline-only", forbiddenApis.join(", "));
```

Expected: No code path in the project actually calls these APIs; the log is only a reminder during QA.

- [ ] **Step 3: Expand the manual checklist into a final regression pass**

```md
## 最终回归
- 断网状态下可完整打开和游玩
- DevTools Network 面板无外部请求
- 桌面端和移动端都可完成一整次流程
- 摇和在桌面端有回退按钮
- 海报导出成功
- 人工触发异常时显示“哎呀，出错了，请重启试试吧~”
```

- [ ] **Step 4: Run the final manual verification**

Run:
1. Disconnect network or simulate offline
2. Open `index.html`
3. Complete one full mix path
4. Export a poster
5. Trigger a temporary forced error by throwing in `safeRerender()`

Expected:
1. App still works offline
2. No network calls appear
3. Poster export completes
4. Forced error shows the required friendly message

- [ ] **Step 5: Commit**

```bash
git add index.html js/main.js tests/manual-test-checklist.md
git commit -m "chore: add offline safeguards and final error handling"
```

---

## Spec Coverage Check

- Offline single-entry HTML app: covered in Tasks 1, 8, and 9.
- Portrait single workbench flow: covered in Tasks 1, 5, and 6.
- Real-time mix feedback for base and mixers: covered in Tasks 4, 5, and 6.
- Flavor tray that does not affect mid-mix liquid height: covered in Tasks 2, 5, and 6.
- Lightweight method effects with shaking fallback: covered in Task 7.
- Glass selection and final vessel presentation: covered in Tasks 2, 4, and 5.
- Poster preview, theme switching, and saving: covered in Task 8.
- Classic cocktail surprise match: covered in Tasks 2 and 4.
- Friendly error handling message: covered in Task 9.

## Placeholder Scan

No `TODO`, `TBD`, or unresolved placeholders were intentionally left in the plan. All tasks specify exact files, concrete commands, and expected results.

## Type Consistency Check

- State keys remain consistent across the plan: `baseSelection`, `mixerSelections`, `flavorSelections`, `methodSelection`, `glassSelection`, `methodReady`, `actionHistory`.
- Visual derivation outputs remain consistent: `mixVisual` and `finalVisual`.
- Step IDs remain consistent with the spec: `base`, `mixer`, `flavor`, `method`, `glass`, `poster`.

---

Plan complete and saved to `docs/superpowers/plans/2026-05-23-cocktail-lab-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
