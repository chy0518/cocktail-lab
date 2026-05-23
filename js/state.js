import {
  BASES,
  FLAVORS,
  GLASSES,
  LIMITS,
  MIXERS,
  METHODS,
  POSTER_THEMES,
  STEPS,
} from "./config.js";

const STORAGE_KEY = "cocktail-lab-state";
const HISTORY_TYPES = new Set(["add-base", "add-mixer"]);
const POSTER_FIELDS = new Set(["cocktailName", "cocktailNote", "signature"]);
const STEP_IDS = new Set(STEPS.map((step) => step.id));
const BASE_IDS = new Set(BASES.map((base) => base.id));
const MIXER_IDS = new Set(MIXERS.map((mixer) => mixer.id));
const FLAVOR_IDS = new Set(FLAVORS.map((flavor) => flavor.id));
const METHOD_IDS = new Set(METHODS.map((method) => method.id));
const GLASS_IDS = new Set(GLASSES.map((glass) => glass.id));
const METHOD_COMPLETION = new Map(
  METHODS.map((method) => [method.id, Boolean(method.requiresCompletion)]),
);
const POSTER_THEME_IDS = new Set(POSTER_THEMES.map((theme) => theme.id));
const DEFAULT_POSTER_THEME = POSTER_THEMES[0]?.id || "warm-night";
const DEFAULT_STEP = STEPS[0]?.id || "base";

function cloneState(state) {
  return {
    ...state,
    baseSelection: state.baseSelection ? { ...state.baseSelection } : null,
    mixerSelections: Array.isArray(state.mixerSelections)
      ? state.mixerSelections.map((selection) => ({ ...selection }))
      : [],
    flavorSelections: Array.isArray(state.flavorSelections)
      ? [...state.flavorSelections]
      : [],
    actionHistory: Array.isArray(state.actionHistory)
      ? state.actionHistory.map((entry) => ({ ...entry }))
      : [],
  };
}

function clampInteger(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function toLimitedString(value, limit) {
  return String(value ?? "").slice(0, limit);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      HISTORY_TYPES.has(entry.type) &&
      typeof entry.id === "string" &&
      entry.id.length > 0,
  );
}

function sanitizeBaseSelection(baseSelection) {
  if (
    !baseSelection ||
    typeof baseSelection.id !== "string" ||
    !BASE_IDS.has(baseSelection.id)
  ) {
    return null;
  }

  return {
    id: baseSelection.id,
    pours: clampInteger(
      baseSelection.pours,
      LIMITS.basePours.min,
      LIMITS.basePours.max,
    ),
  };
}

function sanitizeMixerSelections(mixerSelections) {
  if (!Array.isArray(mixerSelections)) {
    return [];
  }

  const sanitized = [];

  for (const selection of mixerSelections) {
    if (!selection || typeof selection.id !== "string") {
      continue;
    }

    if (!MIXER_IDS.has(selection.id)) {
      continue;
    }

    const existing = sanitized.find((item) => item.id === selection.id);
    if (existing) {
      existing.pours = clampInteger(
        existing.pours + selection.pours,
        LIMITS.mixerPours.min,
        LIMITS.mixerPours.max,
      );
      continue;
    }

    if (sanitized.length >= LIMITS.mixerKinds.max) {
      continue;
    }

    sanitized.push({
      id: selection.id,
      pours: clampInteger(
        selection.pours,
        LIMITS.mixerPours.min,
        LIMITS.mixerPours.max,
      ),
    });
  }

  return sanitized;
}

function sanitizeFlavorSelections(flavorSelections) {
  if (!Array.isArray(flavorSelections)) {
    return [];
  }

  const sanitized = [];

  for (const flavorId of flavorSelections) {
    if (
      typeof flavorId !== "string" ||
      !FLAVOR_IDS.has(flavorId) ||
      sanitized.includes(flavorId)
    ) {
      continue;
    }

    if (sanitized.length >= LIMITS.flavorKinds.max) {
      break;
    }

    sanitized.push(flavorId);
  }

  return sanitized;
}

function sanitizeMethodSelection(methodSelection) {
  return METHOD_IDS.has(methodSelection) ? methodSelection : null;
}

function sanitizePosterTheme(posterTheme) {
  return POSTER_THEME_IDS.has(posterTheme)
    ? posterTheme
    : DEFAULT_POSTER_THEME;
}

function pruneHistory(history, type) {
  return history.filter((entry) => entry.type !== type);
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch (error) {
    return null;
  }
}

function normalizeState(candidate) {
  const initialState = createInitialState();

  if (!candidate || typeof candidate !== "object") {
    return initialState;
  }

  const methodSelection = sanitizeMethodSelection(candidate.methodSelection);
  const requiresCompletion = methodSelection
    ? METHOD_COMPLETION.get(methodSelection)
    : false;

  return {
    ...initialState,
    currentStep: STEP_IDS.has(candidate.currentStep)
      ? candidate.currentStep
      : initialState.currentStep,
    methodReady: methodSelection
      ? requiresCompletion
        ? Boolean(candidate.methodReady)
        : true
      : false,
    baseSelection: sanitizeBaseSelection(candidate.baseSelection),
    mixerSelections: sanitizeMixerSelections(candidate.mixerSelections),
    flavorSelections: sanitizeFlavorSelections(candidate.flavorSelections),
    methodSelection,
    glassSelection:
      typeof candidate.glassSelection === "string" &&
      GLASS_IDS.has(candidate.glassSelection)
        ? candidate.glassSelection
        : null,
    actionHistory: sanitizeHistory(candidate.actionHistory),
    posterTheme: sanitizePosterTheme(candidate.posterTheme),
    cocktailName: toLimitedString(
      candidate.cocktailName,
      LIMITS.posterNameMax,
    ),
    cocktailNote: toLimitedString(
      candidate.cocktailNote,
      LIMITS.posterNoteMax,
    ),
    signature: toLimitedString(
      candidate.signature,
      LIMITS.posterSignatureMax,
    ),
  };
}

export function createInitialState() {
  return {
    currentStep: DEFAULT_STEP,
    methodReady: false,
    baseSelection: null,
    mixerSelections: [],
    flavorSelections: [],
    methodSelection: null,
    glassSelection: null,
    actionHistory: [],
    posterTheme: DEFAULT_POSTER_THEME,
    cocktailName: "",
    cocktailNote: "",
    signature: "",
  };
}

export function addBasePour(state, baseId) {
  if (typeof baseId !== "string" || !BASE_IDS.has(baseId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  const currentBaseId = next.baseSelection?.id ?? null;

  if (currentBaseId !== baseId) {
    next.baseSelection = { id: baseId, pours: LIMITS.basePours.min };
    next.actionHistory = pruneHistory(next.actionHistory, "add-base");
    next.actionHistory.push({ type: "add-base", id: baseId });
    return next;
  }

  if (next.baseSelection.pours >= LIMITS.basePours.max) {
    return state;
  }

  next.baseSelection.pours += 1;
  next.actionHistory.push({ type: "add-base", id: baseId });
  return next;
}

export function addMixerPour(state, mixerId) {
  if (typeof mixerId !== "string" || !MIXER_IDS.has(mixerId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  const existing = next.mixerSelections.find((selection) => selection.id === mixerId);

  if (existing) {
    if (existing.pours >= LIMITS.mixerPours.max) {
      return state;
    }

    existing.pours += 1;
    next.actionHistory.push({ type: "add-mixer", id: mixerId });
    return next;
  }

  if (next.mixerSelections.length >= LIMITS.mixerKinds.max) {
    return state;
  }

  next.mixerSelections.push({
    id: mixerId,
    pours: LIMITS.mixerPours.min,
  });
  next.actionHistory.push({ type: "add-mixer", id: mixerId });
  return next;
}

export function toggleFlavor(state, flavorId) {
  if (typeof flavorId !== "string" || !FLAVOR_IDS.has(flavorId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  const existingIndex = next.flavorSelections.indexOf(flavorId);

  if (existingIndex >= 0) {
    next.flavorSelections.splice(existingIndex, 1);
    return next;
  }

  if (next.flavorSelections.length >= LIMITS.flavorKinds.max) {
    return state;
  }

  next.flavorSelections.push(flavorId);
  return next;
}

export function setMethodSelection(state, methodId) {
  if (!METHOD_IDS.has(methodId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  const requiresCompletion = Boolean(METHOD_COMPLETION.get(methodId));

  next.methodSelection = methodId;
  next.methodReady = !requiresCompletion;
  return next;
}

export function setMethodReady(state, methodReady) {
  const next = cloneState(normalizeState(state));

  if (!next.methodSelection) {
    return state;
  }

  next.methodReady = Boolean(methodReady);
  return next;
}

export function setGlassSelection(state, glassId) {
  if (typeof glassId !== "string" || !GLASS_IDS.has(glassId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  next.glassSelection = glassId;
  return next;
}

export function setPosterTheme(state, themeId) {
  if (!POSTER_THEME_IDS.has(themeId)) {
    return state;
  }

  const next = cloneState(normalizeState(state));
  next.posterTheme = themeId;
  return next;
}

export function updatePosterField(state, field, value) {
  if (!POSTER_FIELDS.has(field)) {
    return state;
  }

  const next = cloneState(normalizeState(state));

  if (field === "cocktailName") {
    next.cocktailName = toLimitedString(value, LIMITS.posterNameMax);
    return next;
  }

  if (field === "cocktailNote") {
    next.cocktailNote = toLimitedString(value, LIMITS.posterNoteMax);
    return next;
  }

  next.signature = toLimitedString(value, LIMITS.posterSignatureMax);
  return next;
}

export function undoLastPour(state) {
  const next = cloneState(normalizeState(state));

  while (next.actionHistory.length > 0) {
    const action = next.actionHistory.pop();

    if (action.type === "add-base") {
      if (next.baseSelection?.id !== action.id) {
        continue;
      }

      next.baseSelection.pours -= 1;
      if (next.baseSelection.pours < LIMITS.basePours.min) {
        next.baseSelection = null;
      }
      return next;
    }

    if (action.type === "add-mixer") {
      const selectionIndex = next.mixerSelections.findIndex(
        (selection) => selection.id === action.id,
      );

      if (selectionIndex < 0) {
        continue;
      }

      next.mixerSelections[selectionIndex].pours -= 1;
      if (next.mixerSelections[selectionIndex].pours < LIMITS.mixerPours.min) {
        next.mixerSelections.splice(selectionIndex, 1);
      }
      return next;
    }
  }

  return state;
}

export function saveState(state) {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    const serializableState = normalizeState(state);
    storage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
    return true;
  } catch (error) {
    return false;
  }
}

export function loadState() {
  const storage = getStorage();
  if (!storage) {
    return createInitialState();
  }

  try {
    const rawState = storage.getItem(STORAGE_KEY);
    if (!rawState) {
      return createInitialState();
    }

    return normalizeState(JSON.parse(rawState));
  } catch (error) {
    return createInitialState();
  }
}
