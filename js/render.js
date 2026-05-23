import {
  APP_TITLE,
  BASES,
  FLAVORS,
  GLASSES,
  METHODS,
  MIXERS,
  POSTER_THEMES,
  STEPS,
} from "./config.js";
import { canProceed } from "./logic.js";
import { buildPosterMarkup } from "./poster.js";

export function getRenderMounts() {
  return {
    app: document.getElementById("app"),
    stepHeader: document.getElementById("step-header"),
    mixStage: document.getElementById("mix-stage"),
    optionPanel: document.getElementById("option-panel"),
    bottomControls: document.getElementById("bottom-controls"),
    errorScreen: document.getElementById("error-screen"),
  };
}

export function renderApp(state, viewModel, mounts) {
  renderHeader(state, mounts);
  renderStage(state, viewModel, mounts);
  renderOptions(state, viewModel, mounts);
  renderControls(state, mounts);
}

export function renderHeader(state, mounts) {
  const stepIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.id === state.currentStep),
  );
  const step = STEPS[stepIndex];

  mounts.stepHeader.innerHTML = `
    <p class="eyebrow">Cocktail Lab</p>
    <div class="step-header__main">
      <div>
        <h1 class="app-title">${APP_TITLE}</h1>
        <p class="step-copy">${step.helperText}</p>
      </div>
      <div class="step-progress">
        <p class="step-progress__badge">Step ${stepIndex + 1} / ${STEPS.length}</p>
        <p class="step-progress__label">${step.label}</p>
      </div>
    </div>
  `;
}

export function renderStage(state, viewModel, mounts) {
  const { mixVisual, finalVisual } = viewModel;
  const trayMarkup = state.flavorSelections.length
    ? state.flavorSelections
        .map((flavorId) => {
          const flavor = FLAVORS.find((item) => item.id === flavorId);
          return flavor
            ? `<span class="flavor-chip flavor-chip--${flavor.accentPalette}">${flavor.name}</span>`
            : "";
        })
        .join("")
    : '<span class="flavor-chip flavor-chip--empty">还没有选择风味材料</span>';

  const bubbleMarkup = Array.from(
    { length: mixVisual.bubbleLevel * 3 },
    (_, index) => `
      <span
        class="bubble bubble--${(index % 3) + 1}"
        style="--bubble-left:${18 + ((index * 19) % 58)}%;--bubble-delay:${index * 120}ms;"
      ></span>
    `,
  ).join("");

  const iceMarkup = Array.from(
    { length: mixVisual.iceLevel },
    (_, index) => `
      <span
        class="ice-block ice-block--${(index % 3) + 1}"
        style="--ice-left:${16 + index * 18}%;"
      ></span>
    `,
  ).join("");

  const shakePrompt =
    state.currentStep === "method" &&
    state.methodSelection === "shaken" &&
    !state.methodReady
      ? `
        <div class="shake-prompt">
          <p class="shake-prompt__text">摇一摇手机完成摇和，若设备不支持可点击下方按钮。</p>
          <button type="button" class="shake-prompt__button" data-action="complete-shake">
            点击摇匀
          </button>
        </div>
      `
      : "";

  const garnishMarkup = finalVisual.garnishes
    .map(
      (garnish) =>
        `<span class="garnish-pill garnish-pill--${garnish.accentPalette}">${garnish.id}</span>`,
    )
    .join("");

  mounts.mixStage.innerHTML = `
    <div class="panel__header">
      <p class="panel__eyebrow">Workbench</p>
      <h2 class="panel__title" id="mix-stage-title">调酒舞台</h2>
    </div>
    <div class="flavor-tray">
      <p class="flavor-tray__label">风味托盘</p>
      <div class="flavor-tray__items">${trayMarkup}</div>
    </div>
    <div class="stage-visual stage-visual--${finalVisual.methodId}" data-glass="${finalVisual.glassId}">
      <div class="stage-glow"></div>
      <div class="glass-silhouette glass-silhouette--${finalVisual.glassId}">
        <div
          class="glass-liquid glass-liquid--${mixVisual.paletteKey}"
          style="height:${Math.max(14, mixVisual.fillLevel * 100)}%;opacity:${0.52 +
            mixVisual.clarityLevel * 0.08};"
        >
          <div class="glass-foam glass-foam--${mixVisual.foamLevel}"></div>
          <div class="glass-bubbles">${bubbleMarkup}</div>
          <div class="glass-ice">${iceMarkup}</div>
        </div>
      </div>
      <div class="stage-garnish stage-garnish--${finalVisual.garnishAnchor}">
        ${garnishMarkup}
      </div>
    </div>
    ${shakePrompt}
    <p class="panel__hint">
      当前主色域：${mixVisual.paletteKey} · 气泡 ${mixVisual.bubbleLevel} · 冰块 ${mixVisual.iceLevel}
    </p>
  `;
}

export function renderOptions(state, viewModel, mounts) {
  const step = STEPS.find((item) => item.id === state.currentStep);

  if (state.currentStep === "poster") {
    const themeButtons = POSTER_THEMES.map(
      (theme) => `
        <button
          type="button"
          class="theme-button ${theme.id === state.posterTheme ? "theme-button--active" : ""}"
          data-theme-id="${theme.id}"
        >
          ${theme.name}
        </button>
      `,
    ).join("");

    mounts.optionPanel.innerHTML = `
      <div class="panel__header">
        <p class="panel__eyebrow">Poster</p>
        <h2 class="panel__title">生成海报</h2>
      </div>
      <div class="poster-editor">
        <label class="field">
          <span class="field__label">酒名</span>
          <input
            type="text"
            id="cocktail-name"
            name="cocktailName"
            maxlength="12"
            value="${escapeAttr(state.cocktailName)}"
          >
        </label>
        <label class="field">
          <span class="field__label">一句话介绍</span>
          <textarea
            id="cocktail-note"
            name="cocktailNote"
            maxlength="36"
          >${escapeHtml(state.cocktailNote)}</textarea>
        </label>
        <label class="field">
          <span class="field__label">署名 / 心情</span>
          <input
            type="text"
            id="cocktail-signature"
            name="signature"
            maxlength="12"
            value="${escapeAttr(state.signature)}"
          >
        </label>
        <div class="theme-group">
          <p class="field__label">背景主题</p>
          <div class="theme-group__buttons">${themeButtons}</div>
        </div>
        <button type="button" class="save-button" data-action="save-poster">保存海报</button>
      </div>
      <div id="poster-preview">${buildPosterMarkup(state, viewModel.posterPayload)}</div>
    `;
    return;
  }

  let items = [];

  if (state.currentStep === "base") {
    items = BASES.map((item) => {
      const pours = state.baseSelection?.id === item.id ? state.baseSelection.pours : 0;
      return optionCard(item.id, item.name, pours ? `${pours} 份` : "点击加入", "base", pours > 0);
    });
  } else if (state.currentStep === "mixer") {
    items = MIXERS.map((item) => {
      const selection = state.mixerSelections.find((entry) => entry.id === item.id);
      return optionCard(
        item.id,
        item.name,
        selection ? `${selection.pours} 份` : "点击加入",
        "mixer",
        Boolean(selection),
      );
    });
  } else if (state.currentStep === "flavor") {
    items = FLAVORS.map((item) =>
      optionCard(
        item.id,
        item.name,
        state.flavorSelections.includes(item.id) ? "已放入托盘" : "点击选择",
        "flavor",
        state.flavorSelections.includes(item.id),
      ),
    );
  } else if (state.currentStep === "method") {
    items = METHODS.map((item) => {
      const isActive = state.methodSelection === item.id;
      const label =
        item.requiresCompletion && isActive && !state.methodReady
          ? "等待摇匀"
          : isActive
            ? "已选中"
            : "点击切换";
      return optionCard(item.id, item.name, label, "method", isActive);
    });
  } else if (state.currentStep === "glass") {
    items = GLASSES.map((item) =>
      optionCard(
        item.id,
        item.name,
        state.glassSelection === item.id ? "当前杯型" : "点击预览",
        "glass",
        state.glassSelection === item.id,
      ),
    );
  }

  mounts.optionPanel.innerHTML = `
    <div class="panel__header">
      <p class="panel__eyebrow">Controls</p>
      <h2 class="panel__title">${step.label}</h2>
      <p class="panel__hint">${step.helperText}</p>
    </div>
    <div class="option-grid option-grid--interactive">
      ${items.join("")}
    </div>
  `;
}

export function renderControls(state, mounts) {
  const stepIndex = STEPS.findIndex((step) => step.id === state.currentStep);
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= STEPS.length - 1;

  mounts.bottomControls.innerHTML = `
    <button class="control-button control-button--ghost" type="button" data-action="prev" ${
      isFirst ? "disabled" : ""
    }>
      上一步
    </button>
    <button class="control-button control-button--ghost" type="button" data-action="undo" ${
      state.actionHistory.length ? "" : "disabled"
    }>
      撤销上一份
    </button>
    <button class="control-button" type="button" data-action="next" ${
      canProceed(state) ? "" : "disabled"
    }>
      ${isLast ? "完成海报" : "下一步"}
    </button>
  `;
}

export function renderError(mounts) {
  mounts.app?.classList.add("hidden");
  mounts.errorScreen?.classList.remove("hidden");
}

export function hideError(mounts) {
  mounts.errorScreen?.classList.add("hidden");
  mounts.app?.classList.remove("hidden");
}

function optionCard(id, title, meta, kind, isActive) {
  return `
    <button
      type="button"
      class="option-card option-card--button ${isActive ? "option-card--active" : ""}"
      data-kind="${kind}"
      data-id="${id}"
    >
      <span class="option-card__title">${title}</span>
      <span class="option-card__meta">${meta}</span>
    </button>
  `;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
