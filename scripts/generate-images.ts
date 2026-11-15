// Generates the store's illustrated artwork (product, category, hero and brand
// images) as lightweight SVGs in public/images. Run with: npm run assets
// Replace any of these with real photographs from /admin whenever you have them.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Pattern = "plain" | "dots" | "bokul" | "stripes" | "check" | "block" | "floral" | "texture";
type Shape = "saree" | "tunic" | "panjabi" | "shirt" | "polo" | "tee" | "trousers" | "frock" | "scarf" | "kidsset";

interface Art {
  slug: string;
  shape: Shape;
  base: string;
  accent: string;
  pattern: Pattern;
  bg: [string, string];
}

const OUT = join(import.meta.dirname, "..", "public", "images");

const products: Art[] = [
  { slug: "ivory-jamdani-weave-cotton-saree", shape: "saree", base: "#f3ead6", accent: "#b48a3c", pattern: "bokul", bg: ["#efe6d4", "#e2d3b4"] },
  { slug: "midnight-georgette-party-saree", shape: "saree", base: "#1d2a44", accent: "#d4b46a", pattern: "dots", bg: ["#ebe3d3", "#d8c9aa"] },
  { slug: "indigo-block-print-three-piece", shape: "tunic", base: "#2f4b7c", accent: "#f1ead9", pattern: "block", bg: ["#efe8da", "#dcd0b6"] },
  { slug: "rose-garden-printed-kurti", shape: "tunic", base: "#e9b8b4", accent: "#b2475a", pattern: "floral", bg: ["#f4ece2", "#e6d6c4"] },
  { slug: "sage-linen-blend-tunic", shape: "tunic", base: "#9fb29a", accent: "#7b8f76", pattern: "texture", bg: ["#eee9de", "#d9d1bd"] },
  { slug: "classic-ivory-cotton-panjabi", shape: "panjabi", base: "#f4eee0", accent: "#c9b98f", pattern: "texture", bg: ["#e7ddca", "#cdbd9b"] },
  { slug: "maroon-embroidered-eid-panjabi", shape: "panjabi", base: "#6e1f2b", accent: "#d6b36a", pattern: "plain", bg: ["#efe6d4", "#dccaa8"] },
  { slug: "oxford-blue-formal-shirt", shape: "shirt", base: "#a9c3e0", accent: "#7d9cc0", pattern: "texture", bg: ["#eef0ee", "#d6dbd9"] },
  { slug: "olive-check-casual-shirt", shape: "shirt", base: "#6f7650", accent: "#e8dfc4", pattern: "check", bg: ["#efe9dc", "#d8cfb8"] },
  { slug: "navy-pique-polo", shape: "polo", base: "#1f2d4a", accent: "#e9e2cf", pattern: "texture", bg: ["#ece6da", "#d4c9b2"] },
  { slug: "stone-cotton-chino-trousers", shape: "trousers", base: "#cbb894", accent: "#a8946d", pattern: "texture", bg: ["#eeeae1", "#d8d2c3"] },
  { slug: "little-bokul-floral-frock", shape: "frock", base: "#e98a72", accent: "#fbf3e2", pattern: "bokul", bg: ["#f5ede1", "#e8d8c2"] },
  { slug: "kids-mustard-panjabi-set", shape: "kidsset", base: "#d9a531", accent: "#fbf7ee", pattern: "plain", bg: ["#efe8da", "#dccfb3"] },
  { slug: "kids-graphic-cotton-tee", shape: "tee", base: "#8fc1e3", accent: "#f2c14e", pattern: "plain", bg: ["#eef0ec", "#d5dcd6"] },
  { slug: "printed-chiffon-orna", shape: "scarf", base: "#f4c7a8", accent: "#c26a5a", pattern: "floral", bg: ["#f4ede3", "#e5d7c3"] },
  { slug: "handloom-cotton-gamcha", shape: "scarf", base: "#b8312f", accent: "#2f7a4b", pattern: "check", bg: ["#eee8db", "#d9cdb2"] },
];

/** A bokul (Mimusops elengi) blossom: a star of narrow petals round a small centre. */
function bokulFlower(cx: number, cy: number, r: number, fill: string, petals = 14, centre?: string): string {
  const ps: string[] = [];
  for (let i = 0; i < petals; i++) {
    const a = (360 / petals) * i;
    ps.push(`<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${(r * 0.13).toFixed(2)}" ry="${(r * 0.45).toFixed(2)}" transform="rotate(${a} ${cx} ${cy})"/>`);
  }
  return `<g fill="${fill}">${ps.join("")}<circle cx="${cx}" cy="${cy}" r="${(r * 0.2).toFixed(2)}" fill="${centre ?? fill}"/></g>`;
}

function patternDef(id: string, a: Art): string {
  const { base, accent } = a;
  const tile = (size: number, body: string) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${base}"/>${body}</pattern>`;
  switch (a.pattern) {
    case "dots":
      return tile(26, `<circle cx="6" cy="6" r="1.8" fill="${accent}"/><circle cx="19" cy="19" r="1.2" fill="${accent}" opacity=".7"/>`);
    case "bokul":
      return tile(54, `${bokulFlower(14, 14, 10, accent, 12, base)}${bokulFlower(41, 41, 7, accent, 12, base)}`);
    case "stripes":
      return tile(24, `<rect x="0" width="6" height="24" fill="${accent}" opacity=".55"/>`);
    case "check":
      return tile(44, `<rect width="44" height="12" fill="${accent}" opacity=".55"/><rect width="12" height="44" fill="${accent}" opacity=".55"/><rect x="26" width="3" height="44" fill="${accent}" opacity=".35"/><rect y="26" width="44" height="3" fill="${accent}" opacity=".35"/>`);
    case "block":
      return tile(48, `<g fill="none" stroke="${accent}" stroke-width="2"><path d="M24 6 L42 24 L24 42 L6 24 Z"/><circle cx="24" cy="24" r="5" fill="${accent}"/></g><circle cx="0" cy="0" r="3" fill="${accent}"/><circle cx="48" cy="48" r="3" fill="${accent}"/>`);
    case "floral":
      return tile(60, `${petalFlower(16, 18, 8, accent)}${petalFlower(46, 46, 6, accent)}<path d="M30 40 q6 -8 14 -6" stroke="${accent}" stroke-width="1.5" fill="none" opacity=".6"/>`);
    case "texture":
      return tile(8, `<path d="M0 8 L8 0" stroke="${accent}" stroke-width=".8" opacity=".35"/>`);
    default:
      return tile(10, "");
  }
}

function petalFlower(cx: number, cy: number, r: number, fill: string): string {
  const ps: string[] = [];
  for (let i = 0; i < 5; i++) {
    ps.push(`<circle cx="${cx}" cy="${cy - r * 0.7}" r="${r * 0.55}" transform="rotate(${i * 72} ${cx} ${cy})"/>`);
  }
  return `<g fill="${fill}" opacity=".85">${ps.join("")}<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#fff8e6"/></g>`;
}

const HANGER = `<g fill="none" stroke="#6f5a35" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M300 120 C300 104 320 100 320 82 C320 66 306 58 294 62 C286 65 283 72 284 78"/><path d="M300 122 L150 182 L450 182 Z" fill="#8a6f40" stroke="#6f5a35"/></g>`;

/** Silhouette path + overlay details for each garment shape, on a 600×750 canvas. */
function garment(shape: Shape, fill: string, a: Art): string {
  const stroke = `stroke="${shade(a.base, -0.28)}" stroke-width="2.5" stroke-linejoin="round"`;
  const detail = shade(a.base, -0.22);
  switch (shape) {
    case "tunic":
      return `<path d="M240 176 Q300 214 360 176 L440 200 L500 336 L452 356 L420 276 L430 690 L170 690 L180 276 L148 356 L100 336 L160 200 Z" fill="${fill}" ${stroke}/>
        <path d="M262 186 Q300 222 338 186" fill="none" stroke="${a.accent}" stroke-width="5"/>
        <path d="M170 672 L430 672" stroke="${a.accent}" stroke-width="7"/><path d="M452 356 L500 336" stroke="${a.accent}" stroke-width="6"/><path d="M148 356 L100 336" stroke="${a.accent}" stroke-width="6"/>`;
    case "panjabi":
    case "kidsset": {
      const kid = shape === "kidsset";
      const body = `<path d="M244 178 Q300 196 356 178 L440 200 L506 520 L460 534 L420 276 L430 ${kid ? 560 : 690} L170 ${kid ? 560 : 690} L180 276 L140 534 L94 520 L160 200 Z" fill="${fill}" ${stroke}/>
        <rect x="262" y="166" width="76" height="22" rx="4" fill="${fill}" ${stroke}/>
        <path d="M300 190 L300 ${kid ? 330 : 360}" stroke="${detail}" stroke-width="3"/>
        ${[220, 260, 300].concat(kid ? [] : [340]).map((y) => `<circle cx="300" cy="${y}" r="5" fill="${a.accent}"/>`).join("")}
        <path d="M262 188 L262 ${kid ? 330 : 370} L338 ${kid ? 330 : 370} L338 188" fill="none" stroke="${a.accent}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`;
      if (!kid) return body;
      const pants = `<g transform="translate(0 0)"><path d="M216 560 L384 560 L398 712 L318 712 L300 600 L282 712 L202 712 Z" fill="${a.accent}" stroke="${shade(a.accent, -0.2)}" stroke-width="2.5" stroke-linejoin="round"/><path d="M216 576 L384 576" stroke="${shade(a.accent, -0.12)}" stroke-width="3"/></g>`;
      return pants + body;
    }
    case "shirt":
      return `<path d="M240 174 Q300 192 360 174 L440 198 L494 520 L448 532 L414 282 L420 584 Q300 604 180 584 L186 282 L152 532 L106 520 L160 198 Z" fill="${fill}" ${stroke}/>
        <path d="M240 174 L300 236 L276 252 L232 196 Z M360 174 L300 236 L324 252 L368 196 Z" fill="${shade(a.base, 0.12)}" ${stroke}/>
        <path d="M300 236 L300 594" stroke="${detail}" stroke-width="3"/>
        ${[280, 340, 400, 460, 520].map((y) => `<circle cx="300" cy="${y}" r="4.5" fill="${shade(a.base, -0.4)}"/>`).join("")}
        <rect x="330" y="290" width="54" height="60" fill="none" stroke="${detail}" stroke-width="2.5"/>
        <path d="M448 532 L494 520 L490 500 L446 512 Z M152 532 L106 520 L110 500 L154 512 Z" fill="${shade(a.base, -0.1)}"/>`;
    case "polo":
    case "tee": {
      const tee = shape === "tee";
      return `<path d="M246 182 Q300 ${tee ? 226 : 204} 354 182 L436 206 L490 298 L442 324 L412 278 L416 566 L184 566 L188 278 L158 324 L110 298 L164 206 Z" fill="${fill}" ${stroke}/>
        ${tee
          ? `<path d="M250 186 Q300 232 350 186" fill="none" stroke="${shade(a.base, -0.2)}" stroke-width="5"/>
             <circle cx="300" cy="380" r="62" fill="${a.accent}"/><path d="M264 384 q36 44 72 0" fill="none" stroke="#fff8e6" stroke-width="10" stroke-linecap="round"/><circle cx="282" cy="362" r="7" fill="#1f2d4a"/><circle cx="318" cy="362" r="7" fill="#1f2d4a"/>`
          : `<path d="M246 182 L300 216 L268 240 L232 196 Z M354 182 L300 216 L332 240 L368 196 Z" fill="${shade(a.base, 0.08)}" ${stroke}/>
             <rect x="288" y="214" width="24" height="84" fill="none" stroke="${a.accent}" stroke-width="2.5"/>
             <circle cx="300" cy="240" r="4" fill="${a.accent}"/><circle cx="300" cy="272" r="4" fill="${a.accent}"/>
             <path d="M442 324 L490 298" stroke="${a.accent}" stroke-width="5"/><path d="M158 324 L110 298" stroke="${a.accent}" stroke-width="5"/>`}`;
    }
    case "trousers":
      return `<path d="M190 190 L410 190 L434 700 L326 700 L300 340 L274 700 L166 700 Z" fill="${fill}" ${stroke}/>
        <rect x="190" y="190" width="220" height="30" fill="${shade(a.base, -0.06)}" ${stroke}/>
        ${[214, 262, 338, 386].map((x) => `<rect x="${x - 4}" y="186" width="8" height="38" fill="${shade(a.base, -0.18)}"/>`).join("")}
        <path d="M300 220 L300 340" stroke="${detail}" stroke-width="3"/>
        <path d="M206 222 Q226 270 214 300 M394 222 Q374 270 386 300" fill="none" stroke="${detail}" stroke-width="2.5"/>
        <rect x="182" y="150" width="236" height="12" rx="6" fill="#8a6f40"/><path d="M220 162 L220 196 M380 162 L380 196" stroke="#6f5a35" stroke-width="5"/>`;
    case "frock":
      return `<path d="M250 184 Q300 214 350 184 L372 192 L398 246 L368 270 L362 334 L476 640 Q300 686 124 640 L238 334 L232 270 L202 246 L228 192 Z" fill="${fill}" ${stroke}/>
        <path d="M238 334 L362 334" stroke="${a.accent}" stroke-width="10"/>
        <path d="M124 640 Q300 686 476 640" fill="none" stroke="${a.accent}" stroke-width="8"/>
        <path d="M398 246 L368 270 M202 246 L232 270" stroke="${a.accent}" stroke-width="6"/>
        <path d="M270 334 Q262 480 220 650 M330 334 Q338 480 380 650 M300 334 L300 668" stroke="${shade(a.base, -0.15)}" stroke-width="2" fill="none" opacity=".6"/>`;
    case "scarf":
      return `<path d="M196 182 L292 182 L304 656 L184 676 Z" fill="${fill}" ${stroke}/>
        <path d="M308 182 L404 182 L418 604 L318 624 Z" fill="${fill}" ${stroke}/>
        <path d="M196 182 L404 182 L404 214 Q300 236 196 214 Z" fill="${shade(a.base, -0.12)}" ${stroke}/>
        ${fringe(184, 676, 304, 656)}${fringe(318, 624, 418, 604)}`;
    case "saree":
      return `<path d="M150 182 L450 182 L474 700 L126 700 Z" fill="${fill}" ${stroke}/>
        <path d="M126 664 L474 664 L476 700 L126 700 Z" fill="${a.accent}"/>
        <path d="M128 650 L472 650" stroke="${a.accent}" stroke-width="3"/>
        <path d="M150 182 L314 182 L474 520 L474 700 L400 700 Z" fill="url(#pallu)" ${stroke}/>
        <path d="M314 182 L474 520" stroke="${a.accent}" stroke-width="12"/>
        <path d="M150 182 L400 700" stroke="${a.accent}" stroke-width="5"/>`;
  }
}

function fringe(x1: number, y1: number, x2: number, y2: number): string {
  const lines: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const x = x1 + ((x2 - x1) * i) / 10;
    const y = y1 + ((y2 - y1) * i) / 10;
    lines.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} l2 22" stroke="#6f5a35" stroke-width="2" opacity=".6"/>`);
  }
  return lines.join("");
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function productSvg(a: Art): string {
  const pid = `p-${a.slug.slice(0, 12)}`;
  const palluArt: Art = { ...a, base: shade(a.base, -0.06) };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a.bg[0]}"/><stop offset="1" stop-color="${a.bg[1]}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#fffaf0" stop-opacity=".75"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>
${patternDef(pid, a)}
${patternDef("pallu", palluArt)}
</defs>
<rect width="600" height="750" fill="url(#bg)"/><rect width="600" height="750" fill="url(#glow)"/>
<ellipse cx="300" cy="722" rx="200" ry="14" fill="#5a4a2e" opacity=".12"/>
${a.shape === "trousers" ? "" : HANGER}
${garment(a.shape, `url(#${pid})`, a)}
</svg>`;
}

/** Wide scene: a clothing rail with several garments. */
function railScene(items: Art[], w: number, h: number, theme: "dark" | "light", from = 0, to = 1): string {
  const defs: string[] = [];
  const groups: string[] = [];
  const span = w * (to - from);
  const step = span / items.length;
  const scale = Math.min((h * 0.8) / 750, (step * 0.98) / 410);
  const top = Math.max(h * 0.06, (h - 700 * scale) / 2);
  items.forEach((a, i) => {
    const pid = `s${i}`;
    defs.push(patternDef(pid, a));
    const x = w * from + step * (i + 0.5) - 300 * scale;
    const y = top;
    const body = garment(a.shape, `url(#${pid})`, a).replaceAll("url(#pallu)", `url(#${pid})`);
    groups.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})">${a.shape === "trousers" ? "" : HANGER}${body}</g>`);
  });
  const railY = top + 62 * scale;
  const bg =
    theme === "dark"
      ? `<rect width="${w}" height="${h}" fill="#0f1c29"/><rect width="${w}" height="${h}" fill="url(#spot)"/>`
      : `<rect width="${w}" height="${h}" fill="#efe6d4"/><rect width="${w}" height="${h}" fill="url(#spot)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="spot" cx=".55" cy=".25" r=".8"><stop offset="0" stop-color="${theme === "dark" ? "#c9a25a" : "#fffaf0"}" stop-opacity="${theme === "dark" ? ".32" : ".9"}"/><stop offset="1" stop-color="${theme === "dark" ? "#0f1c29" : "#efe6d4"}" stop-opacity="0"/></radialGradient>
${defs.join("\n")}
</defs>
${bg}
<rect x="${w * from + w * 0.02}" y="${railY - 7}" width="${span - w * 0.04}" height="14" rx="7" fill="${theme === "dark" ? "#b08a46" : "#8a6f40"}"/>
${groups.join("\n")}
<rect y="${h * 0.95}" width="${w}" height="${h * 0.05}" fill="${theme === "dark" ? "#0b1520" : "#e2d3b4"}"/>
</svg>`;
}

function write(rel: string, svg: string) {
  const file = join(OUT, rel);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, svg.replace(/\n\s*/g, "\n"));
  console.log("wrote", rel);
}

const bySlug = (s: string) => products.find((p) => p.slug === s)!;
for (const p of products) write(`products/${p.slug}.svg`, productSvg(p));

write("scenes/hero.svg", railScene(
  ["ivory-jamdani-weave-cotton-saree", "maroon-embroidered-eid-panjabi", "indigo-block-print-three-piece", "little-bokul-floral-frock"].map(bySlug),
  1600, 1000, "dark", 0.42, 1));
write("scenes/about.svg", railScene(
  ["rose-garden-printed-kurti", "classic-ivory-cotton-panjabi", "printed-chiffon-orna"].map(bySlug), 1000, 760, "light"));
write("scenes/cta.svg", railScene(
  ["midnight-georgette-party-saree", "navy-pique-polo", "olive-check-casual-shirt", "sage-linen-blend-tunic", "kids-mustard-panjabi-set", "handloom-cotton-gamcha"].map(bySlug),
  1800, 800, "dark", 0.02, 0.98));
const cats: Record<string, string[]> = {
  women: ["ivory-jamdani-weave-cotton-saree", "rose-garden-printed-kurti"],
  men: ["maroon-embroidered-eid-panjabi", "oxford-blue-formal-shirt"],
  kids: ["little-bokul-floral-frock", "kids-graphic-cotton-tee"],
  accessories: ["printed-chiffon-orna", "handloom-cotton-gamcha"],
};
for (const [slug, items] of Object.entries(cats)) write(`categories/${slug}.svg`, railScene(items.map(bySlug), 800, 1000, "light"));

// The favicon and logo come from the official artwork in public/brand/ (not generated here).
