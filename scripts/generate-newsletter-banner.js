// One-off generator for the newsletter's typing-animation banner GIF.
// Run with: node scripts/generate-newsletter-banner.js
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gif-encoder-2");

const WIDTH = 420;
const HEIGHT = 100;
const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "public",
  "newsletter",
  "beyond-kvibe-banner.gif",
);

const PREFIX = "FRANVIA";
const SEPARATOR = " | ";
const TYPED_TEXT = "BEYOND K-VIBE";
const RED = "#7f1d1d";
const GRAY = "#9ca3af";
const FRAME_DELAY_MS = 80;
const HOLD_FRAMES = Math.round(1000 / FRAME_DELAY_MS); // ~1s pause on full text

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

const encoder = new GIFEncoder(WIDTH, HEIGHT);
encoder.setDelay(FRAME_DELAY_MS);
encoder.setRepeat(0); // 0 = loop forever
encoder.setQuality(10);
encoder.start();

function drawFrame(typedCount, showCursor) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const y = HEIGHT / 2;
  let x = 24;

  ctx.font = "bold 28px Arial";
  ctx.fillStyle = RED;
  ctx.fillText(PREFIX, x, y);
  x += ctx.measureText(PREFIX).width;

  ctx.font = "28px Arial";
  ctx.fillStyle = GRAY;
  ctx.fillText(SEPARATOR, x, y);
  x += ctx.measureText(SEPARATOR).width;

  const visible = TYPED_TEXT.slice(0, typedCount);
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = RED;
  ctx.fillText(visible, x, y);
  x += ctx.measureText(visible).width;

  if (showCursor) {
    ctx.fillStyle = RED;
    ctx.fillRect(x + 4, y - 16, 3, 32);
  }

  encoder.addFrame(ctx);
}

// Typing phase: one frame per character, cursor blinking on each frame.
for (let i = 0; i <= TYPED_TEXT.length; i++) {
  drawFrame(i, i % 2 === 0);
}

// Hold phase: full text visible for ~1s, cursor blinking.
for (let i = 0; i < HOLD_FRAMES; i++) {
  drawFrame(TYPED_TEXT.length, i % 2 === 0);
}

encoder.finish();

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, encoder.out.getData());

console.log(`GIF written to ${OUTPUT_PATH}`);
console.log(
  `Frames: ${TYPED_TEXT.length + 1} typing + ${HOLD_FRAMES} hold = ${
    TYPED_TEXT.length + 1 + HOLD_FRAMES
  } total`,
);
