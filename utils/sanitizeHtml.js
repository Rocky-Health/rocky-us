import xss from "xss";

export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  return xss(String(dirty));
}

const svgFilter = new xss.FilterXSS({
  whiteList: {
    ...xss.getDefaultWhiteList(),
    svg: [
      "xmlns",
      "viewBox",
      "width",
      "height",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "class",
      "id",
      "role",
      "aria-hidden",
      "focusable",
    ],
    path: [
      "d",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "fill-rule",
      "clip-rule",
      "transform",
      "opacity",
    ],
    g: ["fill", "stroke", "transform", "opacity", "clip-path"],
    circle: ["cx", "cy", "r", "fill", "stroke", "stroke-width", "opacity"],
    rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke", "stroke-width"],
    line: ["x1", "y1", "x2", "y2", "stroke", "stroke-width", "stroke-linecap"],
    polyline: ["points", "fill", "stroke", "stroke-width"],
    polygon: ["points", "fill", "stroke", "stroke-width"],
    ellipse: ["cx", "cy", "rx", "ry", "fill", "stroke", "stroke-width"],
    defs: [],
    clipPath: ["id"],
    mask: ["id"],
    linearGradient: ["id", "x1", "y1", "x2", "y2", "gradientUnits"],
    radialGradient: ["id", "cx", "cy", "r", "gradientUnits"],
    stop: ["offset", "stop-color", "stop-opacity"],
    title: [],
    desc: [],
  },
});

export function sanitizeSvg(dirty) {
  if (!dirty) return "";
  return svgFilter.process(String(dirty));
}
