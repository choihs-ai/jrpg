'use strict';
// ─────────────────────────────────────────────────────────────
// Text: 폰트, 줄바꿈, 색상 마크업([y]노랑 [r]빨강 [g]초록 [b]파랑 [p]보라 [/]원래색)
// ─────────────────────────────────────────────────────────────
const Theme = {
  font: '"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic","NanumGothic","WenQuanYi Zen Hei",system-ui,sans-serif',
  text: '#f4f1e6', dim: '#a7adc6', disabled: '#6f768f', gold: '#ffd75e', red: '#ff7b7b', green: '#7cf08a',
  blue: '#7cc4ff', purple: '#d59bff', hp: '#63e07a', mp: '#5fb2ff', exp: '#ffcf5a',
  winTop: 'rgb(30,40,88)', winBot: 'rgb(12,16,44)', border: '#ece8d8', border2: '#5c6bb0',
  cursor: '#ffd75e', select: 'rgba(255,215,94,0.16)',
};
const MARK = { y: Theme.gold, r: Theme.red, g: Theme.green, b: Theme.blue, p: Theme.purple, d: Theme.dim };

const Text = (() => {
  const fontCache = {};
  function font(size = 18, bold = false) {
    const k = size + (bold ? 'b' : '');
    return fontCache[k] || (fontCache[k] = `${bold ? '700' : '400'} ${size}px ${Theme.font}`);
  }

  // 마크업을 [{t, color}] 런 배열로 파싱
  function parse(text, base) {
    const runs = [];
    let color = base;
    const re = /\[([yrgbpd/])\]/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) runs.push({ t: text.slice(last, m.index), color });
      color = m[1] === '/' ? base : MARK[m[1]];
      last = re.lastIndex;
    }
    if (last < text.length) runs.push({ t: text.slice(last), color });
    return runs;
  }
  const strip = (text) => String(text).replace(/\[([yrgbpd/])\]/g, '');

  // 줄바꿈: 공백 단위로 감싸고, 너무 긴 단어는 글자 단위로 자른다
  function layout(ctx, text, maxW, size = 18, base = Theme.text, bold = false) {
    ctx.font = font(size, bold);
    const lines = [];
    const paragraphs = String(text).split('\n');
    let carry = base;
    for (const para of paragraphs) {
      const runs = parse(para, carry);
      if (runs.length) carry = runs[runs.length - 1].color;
      // 토큰화 (색 유지)
      const tokens = [];
      for (const r of runs) {
        const parts = r.t.split(/( )/);
        for (const p of parts) if (p !== '') tokens.push({ t: p, color: r.color });
      }
      let line = [], lineW = 0;
      const pushLine = () => { lines.push(line); line = []; lineW = 0; };
      for (const tk of tokens) {
        const w = ctx.measureText(tk.t).width;
        if (tk.t === ' ' && line.length === 0) continue;
        if (lineW + w <= maxW) { line.push({ ...tk }); lineW += w; continue; }
        if (tk.t === ' ') { pushLine(); continue; }
        if (w <= maxW) { pushLine(); line.push({ ...tk }); lineW = w; continue; }
        // 긴 토큰: 글자 단위
        for (const ch of tk.t) {
          const cw = ctx.measureText(ch).width;
          if (lineW + cw > maxW && line.length) pushLine();
          if (line.length && line[line.length - 1].color === tk.color) line[line.length - 1].t += ch;
          else line.push({ t: ch, color: tk.color });
          lineW += cw;
        }
      }
      // 끝의 공백 제거
      while (line.length && line[line.length - 1].t === ' ') line.pop();
      lines.push(line);
    }
    return lines;
  }

  const lineLen = (line) => line.reduce((n, r) => n + [...r.t].length, 0);

  // 줄 배열을 그린다. limit = 표시할 글자 수(타자기 효과)
  function drawLines(ctx, lines, x, y, lh, size = 18, limit = Infinity, opts = {}) {
    ctx.font = font(size, opts.bold);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    let left = limit;
    for (let i = 0; i < lines.length; i++) {
      let cx = x;
      for (const r of lines[i]) {
        if (left <= 0) return;
        const chars = [...r.t];
        const s = chars.length > left ? chars.slice(0, left).join('') : r.t;
        left -= Math.min(chars.length, left);
        if (opts.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(s, cx + 1, y + i * lh + 1); }
        ctx.fillStyle = r.color;
        ctx.fillText(s, cx, y + i * lh);
        cx += ctx.measureText(r.t).width;
      }
    }
  }

  // 단순 한 줄 텍스트 (마크업 지원, 정렬, 최대폭 축소)
  function draw(ctx, text, x, y, opts = {}) {
    const size = opts.size || 18;
    ctx.font = font(size, opts.bold);
    ctx.textBaseline = opts.baseline || 'top';
    const runs = parse(String(text), opts.color || Theme.text);
    let total = 0;
    for (const r of runs) total += ctx.measureText(r.t).width;
    let sx = 1;
    if (opts.maxW && total > opts.maxW) sx = opts.maxW / total;
    let cx = x;
    if (opts.align === 'right') cx = x - total * sx;
    else if (opts.align === 'center') cx = x - (total * sx) / 2;
    ctx.save();
    if (sx !== 1) { ctx.translate(cx, 0); ctx.scale(sx, 1); cx = 0; }
    for (const r of runs) {
      if (opts.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(r.t, cx + 1, y + 1); }
      if (opts.outline) { ctx.lineWidth = opts.outline; ctx.strokeStyle = opts.outlineColor || '#000'; ctx.strokeText(r.t, cx, y); }
      ctx.fillStyle = r.color;
      ctx.fillText(r.t, cx, y);
      cx += ctx.measureText(r.t).width;
    }
    ctx.restore();
    return total * sx;
  }

  function width(ctx, text, size = 18, bold = false) {
    ctx.font = font(size, bold);
    return ctx.measureText(strip(text)).width;
  }

  return { font, parse, strip, layout, lineLen, drawLines, draw, width };
})();
