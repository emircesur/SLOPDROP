// Reads colors out of a matched snippet so a rule can ask what the color is,
// not only how it is spelled. Zero dependencies.
//
// A rule pattern may carry a `colors` spec:
//   { "re": "...", "colors": { "hues": [[238, 340]], "minSaturation": 0.25,
//                              "lightness": [0.08, 0.92], "minAlpha": 0.1 } }
// The hit counts only when at least one color in the match passes every check.

// Named colors the stacks actually use: CSS, Tailwind-ish names, SwiftUI,
// Compose, Flutter. Grays, black, and white are left out on purpose: they
// have no hue, so they can never pass a hue or saturation check.
const NAMED = {
  purple: "#800080",
  deeppurple: "#673ab7",
  violet: "#8b5cf6",
  indigo: "#4f46e5",
  fuchsia: "#d946ef",
  magenta: "#ff00ff",
  pink: "#ec4899",
  hotpink: "#ff69b4",
  rose: "#f43f5e",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  mint: "#00c7be",
  green: "#22c55e",
  lime: "#84cc16",
  yellow: "#eab308",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
};

const NAMED_RE = new RegExp(`(?<![\\w-])(${Object.keys(NAMED).join("|")})(?![\\w-])`, "gi");
const HEX_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/g;
const ARGB_RE = /\b0x([0-9a-fA-F]{2})([0-9a-fA-F]{6})\b/g;
const RGB_RE = /rgba?\(\s*([\d.]+)%?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:[\s,/]+([\d.]+%?))?\s*\)/gi;
const HSL_RE = /hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)/gi;

function alphaOf(raw) {
  if (raw === undefined) return 1;
  return raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
}

function fromRgb(r, g, b, a = 1) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s, l, a };
}

function fromHex(hex) {
  let digits = hex;
  if (digits.length <= 4) digits = [...digits].map((c) => c + c).join("");
  const r = parseInt(digits.slice(0, 2), 16);
  const g = parseInt(digits.slice(2, 4), 16);
  const b = parseInt(digits.slice(4, 6), 16);
  const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
  return fromRgb(r, g, b, a);
}

/** Every color literal in `text`, as { h, s, l, a } with s, l, a in 0..1. */
export function parseColors(text) {
  const colors = [];
  for (const m of text.matchAll(HEX_RE)) colors.push(fromHex(m[1]));
  for (const m of text.matchAll(ARGB_RE)) {
    const c = fromHex(m[2]);
    c.a = parseInt(m[1], 16) / 255;
    colors.push(c);
  }
  for (const m of text.matchAll(RGB_RE)) {
    colors.push(fromRgb(Number(m[1]), Number(m[2]), Number(m[3]), alphaOf(m[4])));
  }
  for (const m of text.matchAll(HSL_RE)) {
    colors.push({ h: Number(m[1]) % 360, s: Number(m[2]) / 100, l: Number(m[3]) / 100, a: alphaOf(m[4]) });
  }
  for (const m of text.matchAll(NAMED_RE)) colors.push(fromHex(NAMED[m[1].toLowerCase()].slice(1)));
  return colors;
}

function inHue(h, ranges) {
  return ranges.some(([from, to]) => (from <= to ? h >= from && h <= to : h >= from || h <= to));
}

/** Does a single color satisfy a `colors` spec? */
export function colorPasses(color, spec) {
  if (spec.minAlpha !== undefined && color.a < spec.minAlpha) return false;
  if (spec.minSaturation !== undefined && color.s < spec.minSaturation) return false;
  if (spec.lightness && (color.l < spec.lightness[0] || color.l > spec.lightness[1])) return false;
  if (spec.hues && !inHue(color.h, spec.hues)) return false;
  return true;
}

/** True when at least one color in `text` satisfies the spec. */
export function textHasColor(text, spec) {
  return parseColors(text).some((color) => colorPasses(color, spec));
}
