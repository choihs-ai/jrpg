// 실제 키 입력으로 게임을 조작하는 자동 플레이 드라이버
import { sleep } from './helpers.mjs';

export class Driver {
  constructor(page, log = () => {}) {
    this.page = page;
    this.log = log;
    this.choices = [];   // 선택지 응답 큐: 문자열(포함 문자열) 또는 인덱스
    this.name = '테스터';
    this.battles = 0;
  }
  ev(fn, arg) { return this.page.evaluate(fn, arg); }
  async state() {
    return this.ev(() => {
      const J = window.__jr;
      const top = J.Engine.top();
      let kind = 'other';
      if (top === J.Field.layer) kind = 'field';
      else if (top instanceof J.UI.MessageLayer) kind = 'message';
      else if (top instanceof J.UI.ListWindow) kind = 'list';
      else if (top instanceof J.UI.NumberLayer) kind = 'number';
      else if (top === J.Battle.layer) kind = 'battle';
      const st = J.Game.state;
      return {
        kind, busy: J.Field.busy, fading: J.Engine.fading,
        map: J.Field.map && J.Field.map.id, x: J.Field.player.x, y: J.Field.player.y, moving: J.Field.player.moving,
        inBattle: !!J.Battle.core, prompt: !!document.querySelector('.name-entry'),
        items: top instanceof J.UI.ListWindow ? top.items.map((i) => J.UI && (typeof i.label === 'string' ? i.label : '')) : null,
        cursor: top instanceof J.UI.ListWindow ? top.cursor : null,
        listTitle: top instanceof J.UI.ListWindow ? top.o.title : null,
        msg: top instanceof J.UI.MessageLayer ? top.pagesRaw.join(' / ') : null,
        gold: st ? st.gold : 0,
        err: J.Engine.lastError ? String(J.Engine.lastError) : null,
      };
    });
  }
  async key(k, hold = 50) { await this.page.keyboard.down(k); await sleep(hold); await this.page.keyboard.up(k); await sleep(30); }

  // 리스트에서 원하는 항목 고르기
  async pickInList(want) {
    const s = await this.state();
    let idx = typeof want === 'number' ? want : s.items.findIndex((l) => l.includes(want));
    if (idx < 0) { this.log('  ! choice not found: ' + want + ' in ' + JSON.stringify(s.items)); idx = 0; }
    let cur = s.cursor;
    let guard = 0;
    while (cur !== idx && guard++ < 40) {
      await this.key(idx > cur ? 'ArrowDown' : 'ArrowUp');
      cur = (await this.state()).cursor;
    }
    await this.key('Enter');
  }

  // 대화·선택지·전투를 끝까지 넘긴다 (필드 조작 가능 상태가 될 때까지)
  async pump(opts = {}) {
    const t0 = Date.now();
    const timeout = opts.timeout || 90000;
    let idle = 0;
    for (;;) {
      if (Date.now() - t0 > timeout) throw new Error('pump timeout: ' + JSON.stringify(await this.state()));
      const s = await this.state();
      if (s.err && !this.reportedErr) { this.reportedErr = true; this.log('  !! engine error: ' + s.err); }
      if (s.prompt) {
        await this.page.fill('.name-entry input', this.name);
        await this.page.click('.name-entry button');
        await sleep(200);
        continue;
      }
      if (s.inBattle) { await this.battleStep(s); continue; }
      if (s.kind === 'message') { if (opts.onMsg) opts.onMsg(s.msg); await this.key('Enter'); await sleep(60); continue; }
      if (s.kind === 'list') {
        const want = this.choices.length ? this.choices.shift() : 0;
        this.log(`  [choice] ${s.listTitle || ''} → ${want} (${JSON.stringify(s.items)})`);
        await this.pickInList(want);
        continue;
      }
      if (s.kind === 'number') { await this.key('Enter'); continue; }
      if (s.kind === 'other') { await this.key('Enter'); await sleep(100); continue; }
      if (s.kind === 'field' && s.busy === 0 && !s.fading) {
        idle++;
        if (idle >= 3) return s;
        await sleep(80);
        continue;
      }
      idle = 0;
      await sleep(60);
    }
  }

  // 전투: 기본은 엔터 연타(공격). 정책 함수로 바꿀 수 있다
  async battleStep(s) {
    if (this.battlePolicy) { const done = await this.battlePolicy(this, s); if (done) return; }
    if (s.kind === 'list' && s.items && s.items[0] === '공격') { await this.pickInList(0); return; }
    await this.key('Enter', 30);
    await sleep(30);
  }

  // 지정 위치까지 걷기 (게임 내 길찾기로 경로 계산, 실제 방향키 입력)
  async walkTo(x, y, opts = {}) {
    const keyOf = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    const startMap = (await this.state()).map;
    for (let attempt = 0; attempt < 30; attempt++) {
      let s = await this.pump();
      if (s.map !== startMap) return true;
      if (s.x === x && s.y === y && !opts.adjacent) return true;
      const dirs = await this.ev(([tx, ty, adj]) => window.__jr.Field.findPath(tx, ty, adj), [x, y, !!opts.adjacent]);
      if (dirs === null) throw new Error(`no path to (${x},${y}) from ${s.map}(${s.x},${s.y})`);
      if (!dirs.length) return true;
      let interrupted = false;
      for (const d of dirs) {
        const before = await this.state();
        await this.page.keyboard.down(keyOf[d]);
        let moved = false;
        for (let i = 0; i < 40; i++) {
          await sleep(15);
          const st = await this.state();
          if (st.moving || st.x !== before.x || st.y !== before.y || st.busy || st.map !== before.map) { moved = true; break; }
        }
        await this.page.keyboard.up(keyOf[d]);
        for (let i = 0; i < 60; i++) { const st = await this.state(); if (!st.moving) break; await sleep(15); }
        const after = await this.state();
        if (!moved) { this.log(`  ! blocked going ${d} at (${before.x},${before.y})`); interrupted = true; break; }
        if (after.busy || after.map !== before.map || after.inBattle) { interrupted = true; break; }
      }
      if (!interrupted) { const s2 = await this.pump(); if (opts.adjacent || (s2.x === x && s2.y === y)) return true; }
    }
    throw new Error(`walkTo(${x},${y}) failed`);
  }

  async face(dir) {
    const k = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[dir];
    // 막힌 방향이면 제자리에서 방향만 바뀐다
    await this.ev((d) => { window.__jr.Field.player.dir = d; }, dir);
    await sleep(30);
  }
  // 대상(NPC/물체)에 다가가서 조사
  async interactAt(x, y) {
    await this.walkTo(x, y, { adjacent: true });
    const s = await this.state();
    const dir = x > s.x ? 'right' : x < s.x ? 'left' : y > s.y ? 'down' : 'up';
    await this.face(dir);
    await this.key('Enter');
    await sleep(150);
    return this.pump();
  }
  // 현재 칸을 밟고 지나가 워프
  async stepOn(x, y) {
    await this.walkTo(x, y);
    await sleep(200);
    return this.pump();
  }
}
