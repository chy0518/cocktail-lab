import {
  BASES,
  MIXERS,
  FLAVORS,
  METHODS,
  GLASSES,
  PALETTES,
  CLASSIC_RECIPES,
} from "./config.js";

const baseById = createLookup(BASES);
const mixerById = createLookup(MIXERS);
const flavorById = createLookup(FLAVORS);
const methodById = createLookup(METHODS);
const glassById = createLookup(GLASSES);
const paletteById = createLookup(PALETTES);

export function canProceed(state, stepId = state?.currentStep) {
  switch (stepId) {
    case "base":
      return Boolean(state?.baseSelection?.id);
    case "mixer":
      return true;
    case "flavor":
      return true;
    case "method":
      return Boolean(state?.methodSelection) && (state.methodSelection !== "shaken" || Boolean(state.methodReady));
    case "glass":
      return Boolean(state?.glassSelection);
    case "poster":
      return true;
    default:
      return false;
  }
}

export function deriveMixVisual(state) {
  const paletteScores = new Map();
  const baseSelection = normalizeSelection(state?.baseSelection);
  const mixerSelections = normalizeSelections(state?.mixerSelections);
  const method = methodById.get(state?.methodSelection) || null;

  let totalPours = 0;
  let fillUnits = 0;
  let clarityLevel = 3;
  let bubbleLevel = 0;
  let iceLevel = 0;
  let foamLevel = 0;

  if (baseSelection) {
    const base = baseById.get(baseSelection.id);
    if (base) {
      accumulatePaletteScore(paletteScores, base.paletteBias, base.strength * baseSelection.pours);
      totalPours += baseSelection.pours;
      fillUnits += (base.fillUnit || 0) * baseSelection.pours;
      clarityLevel = base.clarity ?? clarityLevel;
    }
  }

  for (const selection of mixerSelections) {
    const mixer = mixerById.get(selection.id);
    if (!mixer) {
      continue;
    }

    accumulatePaletteScore(paletteScores, mixer.paletteBias, mixer.strength * selection.pours);
    totalPours += selection.pours;
    fillUnits += (mixer.fillUnit || 0) * selection.pours;
    clarityLevel += (mixer.clarityShift || 0) * selection.pours;
    bubbleLevel += (mixer.bubbleLevel || 0) * selection.pours;
    iceLevel += (mixer.iceLevel || 0) * selection.pours;
    foamLevel += (mixer.foamLevel || 0) * selection.pours;
  }

  if (method) {
    clarityLevel += method.clarityShift || 0;
    bubbleLevel = Math.max(0, bubbleLevel - Math.max(0, 2 - (method.bubbleKeep || 0)));

    if (method.mixMode === "shaken") {
      foamLevel += 1;
    }
  }

  const fillLevel = clamp(fillUnits / 6, 0, 1);
  const toneLevel = clamp(Math.ceil(totalPours / 2) || 1, 1, 5);
  const paletteKey = pickTopPalette(paletteScores, baseSelection?.id);

  return {
    fillLevel,
    paletteKey,
    palette: paletteById.get(paletteKey) || null,
    toneLevel,
    clarityLevel: clamp(clarityLevel, 1, 5),
    bubbleLevel: clamp(bubbleLevel, 0, 3),
    iceLevel: clamp(iceLevel, 0, 3),
    foamLevel: clamp(foamLevel, 0, 3),
    totalPours,
    liquidSelections: [
      ...(baseSelection ? [baseSelection] : []),
      ...mixerSelections,
    ],
  };
}

export function deriveFinalVisual(state, mixVisual = deriveMixVisual(state)) {
  const method = methodById.get(state?.methodSelection) || methodById.get("built") || null;
  const glass = glassById.get(state?.glassSelection) || glassById.get("highball") || null;
  const flavors = normalizeFlavorIds(state?.flavorSelections)
    .map((id) => flavorById.get(id))
    .filter(Boolean);

  const accentKeys = dedupe(flavors.map((item) => item.accentPalette));
  const garnishIds = dedupe(flavors.map((item) => item.garnish).filter(Boolean));

  return {
    paletteKey: mixVisual.paletteKey,
    palette: mixVisual.palette,
    accentKeys,
    garnishIds,
    garnishes: flavors.map((item) => ({
      id: item.id,
      garnish: item.garnish,
      trayIcon: item.trayIcon,
      accentPalette: item.accentPalette,
      accentStrength: item.accentStrength,
    })),
    layerMode: method?.layerMode || "single",
    glassId: glass?.id || "highball",
    glassShape: glass?.shape || "tall",
    glassFillMask: glass?.fillMask || "highball",
    garnishAnchor: glass?.garnishAnchor || "rim-right",
    highlightStyle: method?.highlightStyle || "clean",
    methodId: method?.id || "built",
    methodMixMode: method?.mixMode || "built",
  };
}

export function scoreClassic(state, recipe) {
  return getClassicBreakdown(state, recipe).score;
}

export function findClassicMatch(state) {
  let bestMatch = null;

  for (const recipe of CLASSIC_RECIPES) {
    const breakdown = getClassicBreakdown(state, recipe);

    if (!bestMatch || breakdown.score > bestMatch.score) {
      bestMatch = {
        recipe,
        score: breakdown.score,
        matchRatio: breakdown.matchRatio,
        missing: breakdown.missing,
        extras: breakdown.extras,
      };
    }
  }

  if (!bestMatch || bestMatch.score < bestMatch.recipe.minScore) {
    return null;
  }

  return bestMatch;
}

function getClassicBreakdown(state, recipe) {
  const baseId = state?.baseSelection?.id || null;
  const mixerIds = normalizeSelections(state?.mixerSelections).map((item) => item.id);
  const flavorIds = normalizeFlavorIds(state?.flavorSelections);
  const methodId = state?.methodSelection || null;
  const glassId = state?.glassSelection || null;

  let score = 0;

  if (baseId === recipe.base) {
    score += 50;
  }

  const matchedMixers = intersect(recipe.mixers, mixerIds);
  const matchedFlavors = intersect(recipe.flavors, flavorIds);
  const extraMixers = difference(mixerIds, recipe.mixers);
  const extraFlavors = difference(flavorIds, recipe.flavors);

  score += matchedMixers.length * 15;
  score += matchedFlavors.length * 10;

  if (methodId === recipe.method) {
    score += 5;
  } else if (methodId) {
    score -= 4;
  }

  if (glassId === recipe.glass) {
    score += 5;
  } else if (glassId) {
    score -= 3;
  }

  score -= extraMixers.length * 6;
  score -= extraFlavors.length * 4;

  const missing = {
    base: baseId !== recipe.base,
    mixers: difference(recipe.mixers, mixerIds),
    flavors: difference(recipe.flavors, flavorIds),
    method: methodId && methodId !== recipe.method ? recipe.method : null,
    glass: glassId && glassId !== recipe.glass ? recipe.glass : null,
  };

  const totalTargets = 1 + recipe.mixers.length + recipe.flavors.length + 1 + 1;
  const matchedTargets =
    (baseId === recipe.base ? 1 : 0) +
    matchedMixers.length +
    matchedFlavors.length +
    (methodId === recipe.method ? 1 : 0) +
    (glassId === recipe.glass ? 1 : 0);

  return {
    score: Math.max(0, score),
    matchRatio: totalTargets > 0 ? matchedTargets / totalTargets : 0,
    missing,
    extras: {
      mixers: extraMixers,
      flavors: extraFlavors,
    },
  };
}

function createLookup(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function normalizeSelection(selection) {
  if (!selection || !selection.id) {
    return null;
  }

  return {
    id: selection.id,
    pours: clamp(Number(selection.pours) || 0, 0, 99),
  };
}

function normalizeSelections(selections) {
  if (!Array.isArray(selections)) {
    return [];
  }

  return selections
    .map(normalizeSelection)
    .filter((item) => item && item.pours > 0);
}

function normalizeFlavorIds(flavorSelections) {
  if (!Array.isArray(flavorSelections)) {
    return [];
  }

  return dedupe(flavorSelections.filter(Boolean));
}

function pickTopPalette(paletteScores, fallbackBaseId) {
  let bestKey = null;
  let bestScore = -Infinity;

  for (const [paletteKey, score] of paletteScores.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = paletteKey;
    }
  }

  if (bestKey) {
    return bestKey;
  }

  const fallbackBase = fallbackBaseId ? baseById.get(fallbackBaseId) : null;
  return fallbackBase?.paletteBias || PALETTES[0]?.id || "crystal";
}

function accumulatePaletteScore(paletteScores, paletteKey, amount) {
  if (!paletteKey || !amount) {
    return;
  }

  paletteScores.set(paletteKey, (paletteScores.get(paletteKey) || 0) + amount);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dedupe(items) {
  return [...new Set(items)];
}

function intersect(left, right) {
  const rightSet = new Set(right);
  return dedupe(left).filter((item) => rightSet.has(item));
}

function difference(source, exclusion) {
  const exclusionSet = new Set(exclusion);
  return dedupe(source).filter((item) => !exclusionSet.has(item));
}
