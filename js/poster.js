import { APP_TITLE, DEFAULT_POSTER_COPY, POSTER_THEMES } from "./config.js";

const themeById = new Map(POSTER_THEMES.map((theme) => [theme.id, theme]));

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPosterMarkup(state, posterPayload) {
  const theme = themeById.get(state.posterTheme) || POSTER_THEMES[0];
  const classicBadge = posterPayload.classicMatch?.recipe?.name
    ? `<div class="poster-classic">经典款彩蛋：${escapeHtml(
        posterPayload.classicMatch.recipe.name,
      )}</div>`
    : "";

  return `
    <article class="poster-card" style="background:${theme.background}">
      <div class="poster-card__glow" style="--poster-glow:${theme.edgeGlow};"></div>
      <p class="poster-card__label">${APP_TITLE}</p>
      <div class="poster-card__drink poster-card__drink--${escapeHtml(
        posterPayload.finalVisual.glassId,
      )}">
        <div
          class="poster-card__liquid poster-card__liquid--${escapeHtml(
            posterPayload.mixVisual.paletteKey,
          )}"
          style="height:${Math.max(24, posterPayload.mixVisual.fillLevel * 100)}%"
        ></div>
      </div>
      <h3 class="poster-card__name">${escapeHtml(
        state.cocktailName || DEFAULT_POSTER_COPY.cocktailName,
      )}</h3>
      <p class="poster-card__note">${escapeHtml(
        state.cocktailNote || DEFAULT_POSTER_COPY.cocktailNote,
      )}</p>
      ${classicBadge}
      <p class="poster-card__recipe">${escapeHtml(posterPayload.recipeSummary)}</p>
      <p class="poster-card__signature">${escapeHtml(
        state.signature || DEFAULT_POSTER_COPY.signature,
      )}</p>
    </article>
  `;
}

export function exportPosterImage(state, posterPayload) {
  const theme = themeById.get(state.posterTheme) || POSTER_THEMES[0];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  canvas.width = 1080;
  canvas.height = 1920;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const colors = theme.background.match(/#[0-9a-fA-F]{6}/g) || [
    "#120d0a",
    "#24160f",
    "#4c2f18",
  ];
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[Math.min(1, colors.length - 1)]);
  gradient.addColorStop(1, colors[colors.length - 1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.ellipse(540, 980, 220, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f7e8cb";
  ctx.font = "bold 58px sans-serif";
  ctx.fillText(APP_TITLE, 90, 130);
  ctx.fillStyle = "#cfbea4";
  ctx.font = "28px sans-serif";
  ctx.fillText("Tonight's Custom Cocktail", 90, 180);

  drawDrink(ctx, posterPayload);

  ctx.fillStyle = "#f7e8cb";
  ctx.font = "bold 76px sans-serif";
  ctx.fillText(
    state.cocktailName || DEFAULT_POSTER_COPY.cocktailName,
    90,
    1240,
    900,
  );

  ctx.fillStyle = "#f2dfc4";
  ctx.font = "36px sans-serif";
  wrapText(
    ctx,
    state.cocktailNote || DEFAULT_POSTER_COPY.cocktailNote,
    90,
    1330,
    900,
    54,
  );

  if (posterPayload.classicMatch?.recipe?.name) {
    ctx.fillStyle = theme.edgeGlow;
    ctx.fillRect(90, 1480, 320, 54);
    ctx.fillStyle = "#201512";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(
      `经典彩蛋：${posterPayload.classicMatch.recipe.name}`,
      108,
      1516,
      284,
    );
  }

  ctx.fillStyle = "#cfbea4";
  ctx.font = "30px sans-serif";
  wrapText(ctx, posterPayload.recipeSummary, 90, 1600, 900, 44);

  ctx.fillStyle = "#f7e8cb";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(
    state.signature || DEFAULT_POSTER_COPY.signature,
    90,
    1800,
    900,
  );

  const link = document.createElement("a");
  link.download = "cocktail-lab-poster.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawDrink(ctx, posterPayload) {
  const { finalVisual, mixVisual } = posterPayload;
  const palette = mixVisual.palette;
  const vesselTop = 360;
  const vesselHeight = 760;
  const vesselWidth = finalVisual.glassShape === "short" ? 320 : 260;
  const vesselLeft = 540 - vesselWidth / 2;
  const vesselBottom = vesselTop + vesselHeight;

  ctx.strokeStyle = "rgba(255,247,234,0.82)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(vesselLeft, vesselTop, vesselWidth, vesselHeight, 42);
  ctx.stroke();

  const liquidHeight = Math.max(140, vesselHeight * mixVisual.fillLevel);
  const liquidTop = vesselBottom - liquidHeight;
  const liquidGradient = ctx.createLinearGradient(0, liquidTop, 0, vesselBottom);
  liquidGradient.addColorStop(0, palette.lightColor);
  liquidGradient.addColorStop(0.55, palette.baseColor);
  liquidGradient.addColorStop(1, palette.deepColor);
  ctx.fillStyle = liquidGradient;
  ctx.beginPath();
  ctx.roundRect(vesselLeft + 10, liquidTop, vesselWidth - 20, liquidHeight, 28);
  ctx.fill();

  if (mixVisual.foamLevel > 0) {
    ctx.fillStyle = palette.foamColor;
    ctx.fillRect(vesselLeft + 16, liquidTop + 10, vesselWidth - 32, 18);
  }

  drawBubbles(ctx, mixVisual, vesselLeft, liquidTop, vesselWidth, liquidHeight);
  drawIce(ctx, mixVisual, vesselLeft, vesselBottom, vesselWidth);
}

function drawBubbles(ctx, mixVisual, left, top, width, height) {
  ctx.fillStyle = mixVisual.palette.bubbleColor;
  const bubbleCount = mixVisual.bubbleLevel * 6;

  for (let index = 0; index < bubbleCount; index += 1) {
    const x = left + 36 + ((index * 37) % Math.max(48, width - 72));
    const y = top + 28 + ((index * 79) % Math.max(48, height - 56));
    const radius = 6 + (index % 3) * 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIce(ctx, mixVisual, left, bottom, width) {
  if (mixVisual.iceLevel <= 0) {
    return;
  }

  ctx.fillStyle = "rgba(235,246,255,0.62)";
  for (let index = 0; index < mixVisual.iceLevel; index += 1) {
    const x = left + 40 + index * ((width - 120) / Math.max(1, mixVisual.iceLevel));
    const y = bottom - 110 - (index % 2) * 18;
    ctx.fillRect(x, y, 42, 42);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const content = String(text ?? "");
  let line = "";
  let currentY = y;

  for (const char of content) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY, maxWidth);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY, maxWidth);
  }
}
