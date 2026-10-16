'use strict';
// ─────────────────────────────────────────────────────────────
// Pix: 오프스크린 픽셀아트 생성 도구 (외부 이미지 리소스 없이 코드로 그린다)
// ─────────────────────────────────────────────────────────────
const Pix = (() => {
  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingEnabled = false;
    return { c, g };
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Util.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  function shade(hex, f) {
    const [r, g, b] = hexToRgb(hex);
    if (f < 0) return rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f));
    return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }

  // 픽셀 그리기 헬퍼
  class P {
    constructor(g, w, h) { this.g = g; this.w = w; this.h = h; }
    px(x, y, col) { if (!col) return; this.g.fillStyle = col; this.g.fillRect(x | 0, y | 0, 1, 1); }
    rect(x, y, w, h, col) { this.g.fillStyle = col; this.g.fillRect(x | 0, y | 0, w | 0, h | 0); }
    fill(col) { this.rect(0, 0, this.w, this.h, col); }
    // 결정적 노이즈 점 찍기
    noise(cols, density, seed = 1, area) {
      const [ax, ay, aw, ah] = area || [0, 0, this.w, this.h];
      for (let y = ay; y < ay + ah; y++)
        for (let x = ax; x < ax + aw; x++) {
          const r = Util.hash2(x, y, seed);
          if (r < density) this.px(x, y, cols[Math.floor(Util.hash2(y, x, seed + 7) * cols.length)]);
        }
    }
    circle(cx, cy, r, col) {
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.px(cx + x, cy + y, col);
    }
    ellipse(cx, cy, rx, ry, col) {
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + 0.01) + (y * y) / (ry * ry + 0.01) <= 1.05) this.px(cx + x, cy + y, col);
    }
    line(x0, y0, x1, y1, col) {
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.px(x0, y0, col);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
  }

  function make(w, h, fn) {
    const { c, g } = canvas(w, h);
    fn(new P(g, w, h), g);
    return c;
  }

  // 문자 템플릿 → 캔버스. pal: 문자 → 색
  function fromTemplate(rows, pal, opts = {}) {
    const h = rows.length, w = rows[0].length;
    const { c, g } = canvas(w, h);
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        const col = pal[ch];
        if (!col) continue;
        const [r, gg, b] = hexToRgb(col);
        const i = (y * w + x) * 4;
        img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    if (opts.outline) outline(c, opts.outline);
    return c;
  }

  // 투명 픽셀 중 불투명 픽셀과 맞닿은 곳에 외곽선
  function outline(c, color = '#14101e', diag = false) {
    const g = c.getContext('2d');
    const { width: w, height: h } = c;
    const src = g.getImageData(0, 0, w, h);
    const out = g.getImageData(0, 0, w, h);
    const [r, gg, b] = hexToRgb(color);
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src.data[(y * w + x) * 4 + 3]);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (A(x, y) > 0) continue;
        let n = A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1);
        if (!n && diag) n = A(x - 1, y - 1) || A(x + 1, y - 1) || A(x - 1, y + 1) || A(x + 1, y + 1);
        if (n) { const i = (y * w + x) * 4; out.data[i] = r; out.data[i + 1] = gg; out.data[i + 2] = b; out.data[i + 3] = 255; }
      }
    g.putImageData(out, 0, 0);
    return c;
  }

  // 반투명(안티앨리어싱) 픽셀을 정리해 또렷한 픽셀아트로
  function crisp(c, threshold = 110) {
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] < threshold ? 0 : 255;
    g.putImageData(d, 0, 0);
    return c;
  }

  function flipH(src) {
    const { c, g } = canvas(src.width, src.height);
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
    return c;
  }

  // 흰색 실루엣 (피격 깜빡임)
  function silhouette(src, color = '#ffffff') {
    const { c, g } = canvas(src.width, src.height);
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color; g.fillRect(0, 0, src.width, src.height);
    return c;
  }

  return { canvas, make, fromTemplate, outline, crisp, flipH, silhouette, shade, mix, hexToRgb, rgbToHex, P };
})();
