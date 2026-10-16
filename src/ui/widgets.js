'use strict';
// ─────────────────────────────────────────────────────────────
// UI 위젯: 창, 대화 메시지, 선택 목록, 수량 선택, 이름 입력
//  모든 위젯은 Promise 기반 — await로 결과를 받는다
// ─────────────────────────────────────────────────────────────
const UI = (() => {
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawWindow(ctx, x, y, w, h, opts = {}) {
    ctx.save();
    if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, opts.top || Theme.winTop);
    g.addColorStop(1, opts.bot || Theme.winBot);
    roundRect(ctx, x, y, w, h, 7);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = opts.border || Theme.border;
    ctx.stroke();
    roundRect(ctx, x + 3.5, y + 3.5, w - 7, h - 7, 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.border2 || Theme.border2;
    ctx.stroke();
    ctx.restore();
  }

  function gauge(ctx, x, y, w, h, ratio, color, back = 'rgba(0,0,0,0.5)') {
    ratio = Util.clamp(ratio, 0, 1);
    ctx.fillStyle = back;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.round(w * ratio), h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, Math.round(w * ratio), Math.max(1, h / 3));
  }

  function cursorArrow(ctx, x, y, size = 9, color = Theme.cursor) {
    const bob = Math.sin(Engine.time * 8) * 1.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + bob, y - size / 1.4);
    ctx.lineTo(x + size + bob, y);
    ctx.lineTo(x + bob, y + size / 1.4);
    ctx.closePath();
    ctx.fill();
  }

  const textSpeed = () => {
    const s = typeof Settings !== 'undefined' ? Settings.get('textSpeed') : 1;
    return [28, 55, 120, 100000][s] || 55;
  };

  // ───────────── 메시지(대화) 창 ─────────────
  class MessageLayer {
    constructor(text, opts = {}) {
      this.opts = opts;
      this.pagesRaw = Array.isArray(text) ? text : [text];
      this.page = 0;
      this.shown = 0;
      this.lines = null;
      this.modal = true;
      this.y = opts.pos === 'top' ? 12 : Engine.H - 144;
      this.h = 132;
      this.x = 12; this.w = Engine.W - 24;
      this.pages = null;
      this.done = false;
      this.waitingClose = false;
      this.overFade = true;
    }
    prepare(ctx) {
      if (this.pages) return;
      this.pages = [];
      for (const p of this.pagesRaw) {
        const lines = Text.layout(ctx, Util.fill(p), this.w - 40, 19);
        for (let i = 0; i < lines.length; i += 4) this.pages.push(lines.slice(i, i + 4));
      }
      if (!this.pages.length) this.pages.push([[]]);
    }
    get total() { return this.pages ? this.pages[this.page].reduce((n, l) => n + Text.lineLen(l), 0) : 0; }
    open() {
      return new Promise((resolve) => { this.resolve = resolve; Engine.push(this); });
    }
    update(dt) {
      if (!this.pages) return;
      if (this.shown < this.total) {
        const before = Math.floor(this.shown);
        this.shown = Math.min(this.total, this.shown + textSpeed() * dt);
        if (Math.floor(this.shown) !== before && Math.floor(this.shown) % 3 === 0 && typeof Sound !== 'undefined') Sound.sfx('text');
      } else if (this.opts.keepOpen && this.page === this.pages.length - 1 && !this.waitingClose) {
        // 선택지와 함께 쓰는 경우 — 글이 다 나오면 바로 resolve (창은 유지)
        this.waitingClose = true;
        const r = this.resolve; this.resolve = null; if (r) r(this);
      }
      if (this.opts.auto && this.shown >= this.total) {
        this.autoT = (this.autoT || 0) + dt * 1000;
        if (this.autoT >= this.opts.auto) this.advance();
      }
    }
    advance() {
      if (!this.pages || this.opts.keepOpen && this.waitingClose) return;
      if (this.shown < this.total) { this.shown = this.total; return; }
      if (this.page < this.pages.length - 1) { this.page++; this.shown = 0; this.autoT = 0; Sound.sfx('cursor'); return; }
      this.close();
    }
    close() {
      Engine.remove(this);
      const r = this.resolve; this.resolve = null;
      if (r) r(this);
    }
    onAction(a) { if (a === 'confirm' || a === 'cancel') this.advance(); }
    onPointer(ev) { if (ev.type === 'down') this.advance(); return true; }
    draw(ctx) {
      this.prepare(ctx);
      const { x, y, w, h } = this;
      drawWindow(ctx, x, y, w, h);
      if (this.opts.name) {
        const nw = Math.max(90, Text.width(ctx, this.opts.name, 17, true) + 30);
        drawWindow(ctx, x + 10, y - 30, nw, 34, { top: 'rgba(60,48,20,0.97)', bot: 'rgba(36,26,10,0.97)', border2: '#8a7240' });
        Text.draw(ctx, this.opts.name, x + 10 + nw / 2, y - 22, { size: 17, bold: true, color: Theme.gold, align: 'center' });
      }
      const lines = this.pages[this.page];
      Text.drawLines(ctx, lines, x + 20, y + 16, 27, 19, Math.floor(this.shown));
      if (this.shown >= this.total && !(this.opts.keepOpen && this.page === this.pages.length - 1)) {
        if (Math.floor(Engine.time * 2.5) % 2 === 0) {
          ctx.fillStyle = Theme.gold;
          ctx.beginPath();
          const bx = x + w - 26, by = y + h - 20;
          ctx.moveTo(bx - 7, by - 4); ctx.lineTo(bx + 7, by - 4); ctx.lineTo(bx, by + 4);
          ctx.closePath(); ctx.fill();
        }
      }
    }
  }

  // ───────────── 선택 목록 ─────────────
  class ListWindow {
    constructor(o) {
      this.o = Object.assign({ cols: 1, rowH: 30, maxRows: 8, cancel: true, size: 18, padX: 14, padY: 10, title: null }, o);
      this.items = o.items || [];
      this.cursor = Util.clamp(o.initial || 0, 0, Math.max(0, this.items.length - 1));
      this.scroll = 0;
      this.modal = true;
      this.active = true;
      this.closed = false;
      this.resolve = null;
      this.overFade = true;
      this.ensureVisible();
    }
    get rows() { return Math.ceil(this.items.length / this.o.cols); }
    get visRows() { return Math.min(this.o.maxRows, Math.max(1, this.rows)); }
    get titleH() { return this.o.title ? 30 : 0; }
    get rect() {
      const w = this.o.w || 200;
      const h = this.o.h || this.titleH + this.visRows * this.o.rowH + this.o.padY * 2;
      let x = this.o.x, y = this.o.y;
      if (this.o.anchor === 'bottom') y = this.o.y - h;
      x = Util.clamp(x, 2, Engine.W - w - 2);
      y = Util.clamp(y, 2, Engine.H - h - 2);
      return { x, y, w, h };
    }
    setItems(items, keepCursor = true) {
      this.items = items;
      if (!keepCursor) this.cursor = 0;
      this.cursor = Util.clamp(this.cursor, 0, Math.max(0, items.length - 1));
      this.ensureVisible();
    }
    ensureVisible() {
      const row = Math.floor(this.cursor / this.o.cols);
      if (row < this.scroll) this.scroll = row;
      if (row >= this.scroll + this.visRows) this.scroll = row - this.visRows + 1;
      this.scroll = Util.clamp(this.scroll, 0, Math.max(0, this.rows - this.visRows));
      if (this.o.onHover) this.o.onHover(this.items[this.cursor], this.cursor);
    }
    choose() {
      return new Promise((resolve) => { this.resolve = resolve; this.active = true; });
    }
    finish(val) {
      const r = this.resolve; this.resolve = null;
      if (r) r(val);
    }
    close() { this.closed = true; Engine.remove(this); this.finish(null); }
    move(dx, dy) {
      if (!this.items.length) return;
      const cols = this.o.cols;
      let c = this.cursor;
      if (cols === 1) {
        if (dy) c = (c + dy + this.items.length) % this.items.length;
        else return this.o.onLeftRight ? this.lr(dx) : undefined;
      } else {
        if (dx) {
          const col = c % cols;
          const nc = col + dx;
          if (nc >= 0 && nc < cols && c + dx < this.items.length) c += dx;
          else if (this.o.onLeftRight) return this.lr(dx);
        }
        if (dy) {
          c += dy * cols;
          if (c < 0) c = Math.min(this.items.length - 1, (this.rows - 1) * cols + (this.cursor % cols));
          if (c >= this.items.length) c = this.cursor % cols;
        }
      }
      if (c !== this.cursor) { this.cursor = c; Sound.sfx('cursor'); this.ensureVisible(); }
    }
    lr(dx) {
      const it = this.items[this.cursor];
      if (this.o.onLeftRight && this.o.onLeftRight(it, dx, this.cursor) !== false) Sound.sfx('cursor');
    }
    select() {
      const it = this.items[this.cursor];
      if (!it) return;
      if (it.disabled) { Sound.sfx('buzzer'); if (this.o.onDisabled) this.o.onDisabled(it); return; }
      if (!this.resolve) return;
      Sound.sfx('confirm');
      this.finish({ value: it.value !== undefined ? it.value : this.cursor, index: this.cursor, item: it });
    }
    onAction(a) {
      if (!this.resolve) return;
      if (a === 'up') this.move(0, -1);
      else if (a === 'down') this.move(0, 1);
      else if (a === 'left') this.move(-1, 0);
      else if (a === 'right') this.move(1, 0);
      else if (a === 'pageup') { this.cursor = Math.max(0, this.cursor - this.visRows * this.o.cols); this.ensureVisible(); Sound.sfx('cursor'); }
      else if (a === 'pagedown') { this.cursor = Math.min(this.items.length - 1, this.cursor + this.visRows * this.o.cols); this.ensureVisible(); Sound.sfx('cursor'); }
      else if (a === 'confirm') this.select();
      else if ((a === 'cancel' || (a === 'menu' && this.o.menuCancels)) && this.o.cancel) { Sound.sfx('cancel'); this.finish(null); }
    }
    hitIndex(px, py) {
      const { x, y, w } = this.rect;
      const cw = (w - this.o.padX * 2) / this.o.cols;
      const top = y + this.o.padY + this.titleH;
      const row = Math.floor((py - top) / this.o.rowH);
      const col = Math.floor((px - x - this.o.padX) / cw);
      if (row < 0 || row >= this.visRows || col < 0 || col >= this.o.cols) return -1;
      const idx = (row + this.scroll) * this.o.cols + col;
      return idx < this.items.length ? idx : -1;
    }
    onPointer(ev) {
      if (!this.resolve) return true;
      const r = this.rect;
      const inside = ev.x >= r.x && ev.x <= r.x + r.w && ev.y >= r.y && ev.y <= r.y + r.h;
      if (ev.type === 'wheel') {
        if (inside) { this.move(0, ev.dy); }
        return true;
      }
      if (ev.type === 'move') {
        const i = this.hitIndex(ev.x, ev.y);
        if (i >= 0 && i !== this.cursor) { this.cursor = i; this.ensureVisible(); }
        return true;
      }
      if (ev.type === 'down') {
        if (!inside) {
          if (this.o.outsideCancel && this.o.cancel) { Sound.sfx('cancel'); this.finish(null); }
          return true;
        }
        // 스크롤 화살표
        if (this.rows > this.visRows) {
          if (ev.y < r.y + this.o.padY + this.titleH + 4 && this.scroll > 0) { this.scroll--; return true; }
          if (ev.y > r.y + r.h - this.o.padY - 4 && this.scroll < this.rows - this.visRows) { this.scroll++; return true; }
        }
        const i = this.hitIndex(ev.x, ev.y);
        if (i >= 0) {
          if (this.o.onLeftRight && this.items[i] && this.items[i].lr) {
            // 설정 항목: 좌/우 절반 클릭으로 값 변경
            this.cursor = i;
            const mid = r.x + r.w * 0.62;
            this.lr(ev.x < mid ? -1 : 1);
            return true;
          }
          this.cursor = i; this.ensureVisible(); this.select();
        }
      }
      return true;
    }
    draw(ctx) {
      const { x, y, w, h } = this.rect;
      const o = this.o;
      drawWindow(ctx, x, y, w, h);
      if (o.title) {
        Text.draw(ctx, o.title, x + o.padX + 4, y + o.padY + 3, { size: 16, color: Theme.gold, bold: true, maxW: w - 30 });
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 10, y + o.padY + 26, w - 20, 1);
      }
      const cw = (w - o.padX * 2) / o.cols;
      const top = y + o.padY + this.titleH;
      if (!this.items.length) {
        Text.draw(ctx, o.empty || '(없음)', x + o.padX + 20, top + 6, { size: o.size, color: Theme.disabled });
      }
      for (let r = 0; r < this.visRows; r++) {
        for (let c = 0; c < o.cols; c++) {
          const idx = (r + this.scroll) * o.cols + c;
          const it = this.items[idx];
          if (!it) continue;
          const ix = x + o.padX + c * cw, iy = top + r * o.rowH;
          const sel = idx === this.cursor;
          if (sel) {
            ctx.fillStyle = this.resolve ? Theme.select : 'rgba(255,255,255,0.07)';
            ctx.fillRect(ix, iy + 1, cw - 4, o.rowH - 2);
            if (this.resolve) cursorArrow(ctx, ix + 3, iy + o.rowH / 2, 9);
          }
          if (o.drawItem) { o.drawItem(ctx, it, ix + 18, iy, cw - 22, o.rowH, sel); continue; }
          const color = it.disabled ? Theme.disabled : it.color || Theme.text;
          const rightW = it.right != null ? Text.width(ctx, String(it.right), o.size - 2) + 8 : 0;
          Text.draw(ctx, it.label, ix + 18, iy + (o.rowH - o.size) / 2 - 1, { size: o.size, color, maxW: cw - 26 - rightW });
          if (it.right != null) Text.draw(ctx, String(it.right), ix + cw - 10, iy + (o.rowH - o.size) / 2, { size: o.size - 2, color: it.disabled ? Theme.disabled : it.rightColor || Theme.dim, align: 'right' });
        }
      }
      if (this.rows > this.visRows) {
        ctx.fillStyle = Theme.gold;
        const ax = x + w / 2;
        if (this.scroll > 0) { ctx.beginPath(); ctx.moveTo(ax - 6, top + 2); ctx.lineTo(ax + 6, top + 2); ctx.lineTo(ax, top - 5); ctx.fill(); }
        if (this.scroll < this.rows - this.visRows) { const by = y + h - 6; ctx.beginPath(); ctx.moveTo(ax - 6, by - 4); ctx.lineTo(ax + 6, by - 4); ctx.lineTo(ax, by + 3); ctx.fill(); }
      }
      if (o.help) {
        const it = this.items[this.cursor];
        const hb = o.help === true ? { x: 12, y: Engine.H - 76, w: Engine.W - 24, h: 64 } : o.help;
        drawWindow(ctx, hb.x, hb.y, hb.w, hb.h);
        if (it && it.desc) {
          const lines = Text.layout(ctx, it.desc, hb.w - 32, 16);
          Text.drawLines(ctx, lines.slice(0, Math.floor((hb.h - 16) / 22)), hb.x + 16, hb.y + 11, 22, 16);
        }
      }
    }
  }

  async function list(o) {
    const lw = new ListWindow(o);
    Engine.push(lw);
    const r = await lw.choose();
    lw.close();
    return r;
  }

  // ───────────── 수량 선택 ─────────────
  class NumberLayer {
    constructor(o) {
      this.o = o; this.v = o.initial || 1; this.modal = true; this.overFade = true;
    }
    open() { return new Promise((r) => { this.resolve = r; Engine.push(this); }); }
    end(v) { Engine.remove(this); const r = this.resolve; this.resolve = null; if (r) r(v); }
    change(d) {
      const nv = Util.clamp(this.v + d, this.o.min || 1, Math.max(this.o.min || 1, this.o.max));
      if (nv !== this.v) { this.v = nv; Sound.sfx('cursor'); }
    }
    onAction(a) {
      if (a === 'up') this.change(1);
      else if (a === 'down') this.change(-1);
      else if (a === 'right') this.change(10);
      else if (a === 'left') this.change(-10);
      else if (a === 'confirm') { Sound.sfx('confirm'); this.end(this.v); }
      else if (a === 'cancel') { Sound.sfx('cancel'); this.end(null); }
    }
    get rect() { return { x: this.o.x || 330, y: this.o.y || 200, w: 280, h: 112 }; }
    onPointer(ev) {
      if (ev.type === 'wheel') { this.change(-ev.dy); return true; }
      if (ev.type !== 'down') return true;
      const { x, y, w } = this.rect;
      if (ev.y >= y + 30 && ev.y <= y + 70) {
        if (ev.x < x + 70) this.change(-1);
        else if (ev.x > x + w - 70) this.change(1);
      } else if (ev.y > y + 74 && ev.y < y + 106 && ev.x > x && ev.x < x + w) { Sound.sfx('confirm'); this.end(this.v); }
      return true;
    }
    draw(ctx) {
      const { x, y, w, h } = this.rect;
      drawWindow(ctx, x, y, w, h);
      Text.draw(ctx, this.o.title || '수량', x + 16, y + 10, { size: 16, color: Theme.gold });
      Text.draw(ctx, '◀', x + 40, y + 40, { size: 20, color: Theme.dim, align: 'center' });
      Text.draw(ctx, '▶', x + w - 40, y + 40, { size: 20, color: Theme.dim, align: 'center' });
      Text.draw(ctx, '× ' + this.v, x + w / 2, y + 38, { size: 24, bold: true, align: 'center' });
      if (this.o.unit) Text.draw(ctx, '합계 ' + this.v * this.o.unit + 'G', x + w / 2, y + 80, { size: 17, color: Theme.gold, align: 'center' });
      else Text.draw(ctx, '결정', x + w / 2, y + 80, { size: 17, color: Theme.gold, align: 'center' });
    }
  }

  // ───────────── 이름 입력 (DOM — 한글 IME / 모바일 키보드 지원) ─────────────
  function prompt(title, def = '', maxLen = 6) {
    return new Promise((resolve) => {
      Input.setEnabled(false);
      Input.releaseAll();
      const wrap = document.createElement('div');
      wrap.className = 'name-entry';
      wrap.innerHTML = `<form><label>${title}</label><input type="text" maxlength="${maxLen}" autocomplete="off" spellcheck="false" />
        <div class="hint">최대 ${maxLen}글자 · 비워두면 기본 이름</div><button type="submit">결정</button></form>`;
      document.getElementById('game-wrap').appendChild(wrap);
      const input = wrap.querySelector('input');
      input.value = def;
      setTimeout(() => { input.focus(); input.select(); }, 50);
      wrap.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        let v = input.value.replace(/[\[\]{}<>|\\]/g, '').trim().slice(0, maxLen);
        if (!v) v = def;
        wrap.remove();
        Input.setEnabled(true);
        Sound.sfx('confirm');
        resolve(v);
      });
    });
  }

  return {
    drawWindow, gauge, cursorArrow, roundRect, MessageLayer, ListWindow, NumberLayer, list, prompt,
    message(text, opts = {}) { return new MessageLayer(text, opts).open(); },
    number(o) { return new NumberLayer(o).open(); },
  };
})();
