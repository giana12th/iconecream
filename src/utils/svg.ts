/** SVG文字列内の指定要素の色を置換 */
export function replaceSvgColors(
  svgString: string,
  iceColor: string,
  bgColor: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  const icecreamEl = doc.getElementById("icecream");
  if (icecreamEl) {
    icecreamEl.setAttribute("fill", iceColor);
    icecreamEl.style.fill = iceColor;
  }

  const backgroundEl = doc.getElementById("background");
  if (backgroundEl) {
    backgroundEl.setAttribute("fill", bgColor);
    backgroundEl.style.fill = bgColor;
  }

  return new XMLSerializer().serializeToString(doc.documentElement);
}

/** SVG文字列をbase64 data URLに変換 */
export function svgToDataUrl(svgString: string): string {
  const bytes = new TextEncoder().encode(svgString);
  const base64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
  return `data:image/svg+xml;base64,${base64}`;
}
