export const APP_TITLE = "调酒实验室";
export const ERROR_MESSAGE = "哎呀，出错了，请重启试试吧~";

export const LIMITS = {
  basePours: { min: 1, max: 4 },
  mixerKinds: { min: 0, max: 2 },
  mixerPours: { min: 1, max: 4 },
  flavorKinds: { min: 0, max: 2 },
  posterNameMax: 12,
  posterNoteMax: 36,
  posterSignatureMax: 12,
};

export const STEPS = [
  {
    id: "base",
    label: "基酒",
    optional: false,
    helperText: "选择 1 种基酒，可连续点击增加份数。",
  },
  {
    id: "mixer",
    label: "辅料",
    optional: true,
    helperText: "最多选择 2 种辅料，点击同一项可继续加料。",
  },
  {
    id: "flavor",
    label: "风味材料",
    optional: true,
    helperText: "最多选择 2 种风味材料，再点同一项可取消。",
  },
  {
    id: "method",
    label: "调制方式",
    optional: false,
    helperText: "摇和需要完成一次摇匀动作后才能继续。",
  },
  {
    id: "glass",
    label: "杯型",
    optional: false,
    helperText: "切换杯型会改变最终成品轮廓。",
  },
  {
    id: "poster",
    label: "海报",
    optional: false,
    helperText: "填写酒名和介绍，选择一套海报背景主题。",
  },
];

export const PALETTES = [
  {
    id: "crystal",
    baseColor: "#d7f4ff",
    lightColor: "#f5fdff",
    deepColor: "#8cc7d7",
    foamColor: "#edf8fb",
    bubbleColor: "#ffffff",
  },
  {
    id: "lime",
    baseColor: "#93d66d",
    lightColor: "#ddf7a3",
    deepColor: "#4f8d3d",
    foamColor: "#efffd0",
    bubbleColor: "#f7ffe8",
  },
  {
    id: "amber",
    baseColor: "#d69a35",
    lightColor: "#f6d37b",
    deepColor: "#835219",
    foamColor: "#ffe7b2",
    bubbleColor: "#fff6df",
  },
  {
    id: "tea",
    baseColor: "#8e5f38",
    lightColor: "#c6986b",
    deepColor: "#4e301c",
    foamColor: "#e7c39d",
    bubbleColor: "#f8ebd5",
  },
  {
    id: "berry",
    baseColor: "#b84668",
    lightColor: "#ef90af",
    deepColor: "#6a2037",
    foamColor: "#ffc8d7",
    bubbleColor: "#fff1f4",
  },
  {
    id: "sunset",
    baseColor: "#e76d3b",
    lightColor: "#ffb067",
    deepColor: "#8f3318",
    foamColor: "#ffd7bb",
    bubbleColor: "#fff2e4",
  },
  {
    id: "cola",
    baseColor: "#55352b",
    lightColor: "#8b5a45",
    deepColor: "#261512",
    foamColor: "#d8b79c",
    bubbleColor: "#f6ece0",
  },
  {
    id: "ocean",
    baseColor: "#3d8f99",
    lightColor: "#98d5d8",
    deepColor: "#1a5960",
    foamColor: "#d4f4f2",
    bubbleColor: "#f2ffff",
  },
];

export const BASES = [
  { id: "gin", name: "金酒", paletteBias: "crystal", strength: 3, clarity: 5, fillUnit: 1 },
  { id: "rum", name: "朗姆酒", paletteBias: "amber", strength: 3, clarity: 3, fillUnit: 1 },
  { id: "vodka", name: "伏特加", paletteBias: "crystal", strength: 2, clarity: 5, fillUnit: 1 },
  { id: "tequila", name: "龙舌兰", paletteBias: "sunset", strength: 3, clarity: 3, fillUnit: 1 },
  { id: "whiskey", name: "威士忌", paletteBias: "amber", strength: 4, clarity: 2, fillUnit: 1 },
  { id: "sparkling-water", name: "气泡水", paletteBias: "crystal", strength: 1, clarity: 5, fillUnit: 1 },
];

export const MIXERS = [
  { id: "syrup", name: "糖浆", paletteBias: "amber", strength: 1, clarityShift: -1, fillUnit: 0.6, bubbleLevel: 0, iceLevel: 0, foamLevel: 1, layerWeight: 2 },
  { id: "bitters", name: "苦精", paletteBias: "tea", strength: 1, clarityShift: 0, fillUnit: 0.3, bubbleLevel: 0, iceLevel: 0, foamLevel: 0, layerWeight: 2 },
  { id: "soda", name: "苏打顶", paletteBias: "crystal", strength: 1, clarityShift: 2, fillUnit: 0.8, bubbleLevel: 3, iceLevel: 0, foamLevel: 1, layerWeight: 1 },
  { id: "cola", name: "可乐", paletteBias: "cola", strength: 4, clarityShift: -2, fillUnit: 0.9, bubbleLevel: 1, iceLevel: 0, foamLevel: 0, layerWeight: 3 },
  { id: "tea", name: "红茶", paletteBias: "tea", strength: 3, clarityShift: -1, fillUnit: 0.8, bubbleLevel: 0, iceLevel: 0, foamLevel: 0, layerWeight: 2 },
  { id: "ice", name: "冰块", paletteBias: "crystal", strength: 0, clarityShift: 1, fillUnit: 0.2, bubbleLevel: 0, iceLevel: 3, foamLevel: 0, layerWeight: 1 },
];

export const FLAVORS = [
  { id: "lemon", name: "柠檬", accentPalette: "sunset", accentStrength: 2, garnish: "lemon-wheel", trayIcon: "lemon" },
  { id: "lime", name: "青柠", accentPalette: "lime", accentStrength: 3, garnish: "lime-wheel", trayIcon: "lime" },
  { id: "orange", name: "橙子", accentPalette: "sunset", accentStrength: 3, garnish: "orange-peel", trayIcon: "orange" },
  { id: "strawberry", name: "草莓", accentPalette: "berry", accentStrength: 3, garnish: "strawberry", trayIcon: "strawberry" },
  { id: "peach", name: "蜜桃", accentPalette: "sunset", accentStrength: 2, garnish: "peach-slice", trayIcon: "peach" },
  { id: "cranberry", name: "蔓越莓", accentPalette: "berry", accentStrength: 4, garnish: "berry-cluster", trayIcon: "cranberry" },
  { id: "pineapple", name: "菠萝", accentPalette: "amber", accentStrength: 2, garnish: "pineapple-wedge", trayIcon: "pineapple" },
  { id: "blueberry", name: "蓝莓", accentPalette: "ocean", accentStrength: 2, garnish: "blueberry-skewer", trayIcon: "blueberry" },
];

export const METHODS = [
  { id: "shaken", name: "摇和", mixMode: "shaken", clarityShift: -1, blendStrength: 3, bubbleKeep: 1, animationKey: "shake", requiresCompletion: true, layerMode: "single", highlightStyle: "frost" },
  { id: "stirred", name: "搅拌", mixMode: "stirred", clarityShift: 1, blendStrength: 2, bubbleKeep: 0, animationKey: "stir", requiresCompletion: false, layerMode: "single", highlightStyle: "silk" },
  { id: "layered", name: "轻倒分层", mixMode: "layered", clarityShift: 0, blendStrength: 1, bubbleKeep: 0, animationKey: "layer", requiresCompletion: false, layerMode: "split", highlightStyle: "halo" },
  { id: "built", name: "直接兑和", mixMode: "built", clarityShift: 0, blendStrength: 1, bubbleKeep: 2, animationKey: "build", requiresCompletion: false, layerMode: "single", highlightStyle: "clean" },
];

export const GLASSES = [
  { id: "highball", name: "长饮杯", shape: "tall", fillMask: "highball", garnishAnchor: "rim-right", scaleBias: 1.1 },
  { id: "rocks", name: "古典杯", shape: "short", fillMask: "rocks", garnishAnchor: "rim-left", scaleBias: 0.9 },
  { id: "martini", name: "马天尼杯", shape: "v", fillMask: "martini", garnishAnchor: "rim-center", scaleBias: 0.8 },
  { id: "champagne", name: "香槟杯", shape: "slim", fillMask: "champagne", garnishAnchor: "rim-right", scaleBias: 0.85 },
  { id: "goblet", name: "高脚杯", shape: "round", fillMask: "goblet", garnishAnchor: "rim-right", scaleBias: 1 },
];

export const POSTER_THEMES = [
  {
    id: "warm-night",
    name: "暖夜黑金",
    background: "linear-gradient(180deg, #120d0a 0%, #24160f 45%, #4c2f18 100%)",
    particleColor: "#f4c86d",
    edgeGlow: "#ffdc98",
    accentColor: "#d79d39",
  },
  {
    id: "sunset-glow",
    name: "日落橙粉",
    background: "linear-gradient(180deg, #341119 0%, #8a2d36 42%, #ff8b5e 100%)",
    particleColor: "#ffd0ae",
    edgeGlow: "#ffb27c",
    accentColor: "#ff6f61",
  },
  {
    id: "ocean-dream",
    name: "海洋蓝绿",
    background: "linear-gradient(180deg, #07161b 0%, #12313a 42%, #1d7a76 100%)",
    particleColor: "#9ce7db",
    edgeGlow: "#64c9d7",
    accentColor: "#56a9b2",
  },
];

export const CLASSIC_RECIPES = [
  {
    id: "gin-tonic",
    name: "金汤力",
    base: "gin",
    mixers: ["soda"],
    flavors: ["lime"],
    method: "built",
    glass: "highball",
    minScore: 70,
    description: "清冽、带气泡感的经典高杯组合。",
  },
  {
    id: "cuba-libre",
    name: "自由古巴",
    base: "rum",
    mixers: ["cola", "ice"],
    flavors: ["lime"],
    method: "built",
    glass: "highball",
    minScore: 75,
    description: "朗姆与可乐相遇，是深夜里最轻松的一杯。",
  },
  {
    id: "whiskey-sour",
    name: "威士忌酸",
    base: "whiskey",
    mixers: ["syrup"],
    flavors: ["lemon"],
    method: "shaken",
    glass: "rocks",
    minScore: 70,
    description: "琥珀底色里带一点酸甜平衡的经典气质。",
  },
  {
    id: "tequila-sunrise",
    name: "龙舌兰日出",
    base: "tequila",
    mixers: ["ice"],
    flavors: ["orange", "cranberry"],
    method: "layered",
    glass: "highball",
    minScore: 70,
    description: "像日出一样向上晕开的暖色层次。",
  },
  {
    id: "vodka-cranberry",
    name: "蔓越莓伏特加",
    base: "vodka",
    mixers: [],
    flavors: ["cranberry"],
    method: "built",
    glass: "highball",
    minScore: 60,
    description: "冷冽底色配上莓果点缀，清爽又直接。",
  },
  {
    id: "sparkling-citrus",
    name: "气泡柑橘特调",
    base: "sparkling-water",
    mixers: ["soda", "ice"],
    flavors: ["lime", "orange"],
    method: "built",
    glass: "champagne",
    minScore: 65,
    description: "适合轻饮和无酒精路线的明亮气泡款。",
  },
];

export const DEFAULT_POSTER_COPY = {
  cocktailName: "今夜特调",
  cocktailNote: "一杯属于今晚的自定义风味。",
  signature: "由你亲手调制",
};

const CONFIG = {
  APP_TITLE,
  ERROR_MESSAGE,
  LIMITS,
  STEPS,
  PALETTES,
  BASES,
  MIXERS,
  FLAVORS,
  METHODS,
  GLASSES,
  POSTER_THEMES,
  CLASSIC_RECIPES,
  DEFAULT_POSTER_COPY,
};

export default CONFIG;
