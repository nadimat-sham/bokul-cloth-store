#!/usr/bin/env bash
# Renders PNG versions of the brand/product artwork with headless Chrome:
# social-share image, app icons and one share image per product.
# Usage: bash scripts/render-raster.sh   (needs google-chrome or chromium)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public"
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FONT="$ROOT/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2"
SANS="$ROOT/node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2"

shot() { # html-file width height out
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=1 --window-size="$2,$3" --virtual-time-budget=3000 --screenshot="$4" "file://$1" 2>/dev/null
}

STYLE="<style>@font-face{font-family:C;src:url(file://$FONT)}@font-face{font-family:M;src:url(file://$SANS)}html,body{margin:0}</style>"

cat > "$TMP/og.html" <<HTML
<!doctype html><html><head>$STYLE</head><body>
<div style="position:relative;width:1200px;height:630px;background:#0f1c29;overflow:hidden;font-family:M">
<img src="file://$PUB/images/scenes/hero.svg" style="position:absolute;right:-180px;top:0;height:630px">
<div style="position:absolute;inset:0;background:linear-gradient(90deg,#0b1520 0%,rgba(11,21,32,.9) 45%,rgba(11,21,32,0) 80%)"></div>
<div style="position:absolute;left:80px;top:120px;color:#fff">
<img src="file://$PUB/images/mark.svg" width="84" height="84">
<div style="font-family:C;font-size:92px;line-height:1;margin-top:26px">Bokul Cloth Store</div>
<div style="font-size:15px;letter-spacing:.3em;text-transform:uppercase;color:#d2ad66;margin-top:22px;font-weight:700">Everyday &amp; festive clothing · Bangladesh</div>
<div style="font-size:24px;color:rgba(255,255,255,.85);margin-top:28px">Sarees · Three-pieces · Panjabis · Kids' wear</div>
<div style="font-size:20px;color:rgba(255,255,255,.7);margin-top:10px">Cash on delivery nationwide</div>
</div></div></body></html>
HTML
shot "$TMP/og.html" 1200 630 "$PUB/og-image.png"

for size in 180 512; do
  cat > "$TMP/icon.html" <<HTML
<!doctype html><html><body style="margin:0"><div style="width:${size}px;height:${size}px;background:#13202d;display:grid;place-items:center">
<img src="file://$PUB/images/mark.svg" style="width:72%;height:72%"></div></body></html>
HTML
  out="$PUB/icon-$size.png"; [ "$size" = 180 ] && out="$PUB/apple-touch-icon.png"
  shot "$TMP/icon.html" "$size" "$size" "$out"
done

mkdir -p "$PUB/images/og"
for svg in "$PUB"/images/products/*.svg; do
  name="$(basename "$svg" .svg)"
  cat > "$TMP/p.html" <<HTML
<!doctype html><html><body style="margin:0"><img src="file://$svg" style="display:block;width:600px;height:750px"></body></html>
HTML
  shot "$TMP/p.html" 600 750 "$PUB/images/og/$name.png"
done
echo "Rendered og-image.png, icons and $(ls "$PUB/images/og" | wc -l) product PNGs"
