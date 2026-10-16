'use strict';
// ─────────────────────────────────────────────────────────────
// BattleCore: 턴제 전투 규칙 (화면과 분리된 순수 로직)
//  execute()는 상태를 바꾸고 '연출 이벤트' 배열을 돌려준다 → 전투 화면이 순서대로 재생
// ─────────────────────────────────────────────────────────────
const SUFFIX = ['A', 'B', 'C', 'D', 'E', 'F'];

class Actor {
  constructor(side, data) {
    this.side = side;
    this.buffs = {};
    this.defending = false;
    this.coveredBy = null;
    this.taunt = false;
    this.mem = {};
    this.uid = Actor.next++;
    if (side === 'party') {
      this.id = data;
      this.ref = Game.state.members[data];
      this.name = Game.name(data);
    } else {
      const def = MONSTERS[data];
      this.defId = data;
      this.def = def;
      this.name = def.name;
      this.maxhp = def.hp; this._hp = def.hp;
      this.maxmp = def.mp || 0; this._mp = def.mp || 0;
      this._status = {};
      this.elem = Object.assign({}, def.elem || {});
      this.defMod = 1;
      this.stolen = false;
      this.pilfered = 0;
    }
  }
  get isParty() { return this.side === 'party'; }
  get st() { return this.isParty ? Game.stats(this.id) : null; }
  get hp() { return this.isParty ? this.ref.hp : this._hp; }
  set hp(v) { if (this.isParty) this.ref.hp = v; else this._hp = v; }
  get mp() { return this.isParty ? this.ref.mp : this._mp; }
  set mp(v) { if (this.isParty) this.ref.mp = v; else this._mp = v; }
  get mhp() { return this.isParty ? this.st.maxhp : this.maxhp; }
  get mmp() { return this.isParty ? this.st.maxmp : this.maxmp; }
  get status() { return this.isParty ? this.ref.status : this._status; }
  get alive() { return this.hp > 0 && !this.fled; }
  buff(stat) { const b = this.buffs[stat]; return b && b.turns > 0 ? b.mult : 1; }
  buffTurns(stat) { const b = this.buffs[stat]; return b ? b.turns : 0; }
  base(stat) { return this.isParty ? this.st[stat] : this.def[stat]; }
  get atk() { return this.base('atk') * this.buff('atk'); }
  get defense() { return this.base('def') * this.buff('def') * (this.defMod || 1); }
  get mag() { return this.base('mag') * this.buff('mag'); }
  get spd() { return this.base('spd') * this.buff('spd'); }
  get evade() { return this.isParty ? 0.02 : this.def.evade || 0; }
  resist(statusName) {
    if (this.isParty) return (this.st.resist || {})[statusName] || 0;
    return (this.def.resist || {})[statusName] || 0;
  }
  elemMult(el) {
    if (!el) return 1;
    if (this.isParty) return 1;
    return this.elem[el] !== undefined ? this.elem[el] : 1;
  }
  get disabled() { return !!(this.status.sleep || this.status.paralyze); }
}
Actor.next = 1;

class BattleCore {
  // 침묵으로 막히는 '주문 계열' 기술인가
  static spellLike(sk) {
    if (sk.kind === 'spell') return true;
    return sk.kind === 'enemy' && ['magic', 'status', 'debuff', 'heal'].includes(sk.type) && !sk.id.startsWith('res') && sk.id !== 'roar';
  }
  constructor(opts) {
    this.opts = opts;
    this.boss = !!opts.boss;
    this.canEscape = opts.canEscape !== false && !opts.boss;
    this.party = Game.state.party.map((id) => new Actor('party', id));
    this.enemies = [];
    for (const id of opts.enemies) this.addEnemy(id);
    this.round = 0;
    this.escapeTries = 0;
    this.result = null;
    this.killed = [];
    this.recoveredGold = 0;
    // 수면·마비·침묵은 전투 한정 상태 (독은 전투 밖에서도 유지)
    for (const a of this.party) for (const k of ['sleep', 'paralyze', 'silence']) delete a.status[k];
  }

  addEnemy(id) {
    if (this.enemies.filter((e) => e.alive).length >= 5) return null;
    const a = new Actor('enemy', id);
    this.enemies.push(a);
    this.renameEnemies();
    return a;
  }
  renameEnemies() {
    const groups = {};
    for (const e of this.enemies) (groups[e.defId] = groups[e.defId] || []).push(e);
    for (const id in groups) {
      const g = groups[id];
      g.forEach((e, i) => { e.name = g.length > 1 ? `${MONSTERS[id].name} ${SUFFIX[i] || i + 1}` : MONSTERS[id].name; });
    }
  }
  get alivePartyList() { return this.party.filter((a) => a.alive); }
  get aliveEnemyList() { return this.enemies.filter((a) => a.alive); }
  foes(a) { return a.isParty ? this.aliveEnemyList : this.alivePartyList; }
  friends(a) { return a.isParty ? this.alivePartyList : this.aliveEnemyList; }

  checkEnd() {
    if (!this.aliveEnemyList.length) this.result = this.result || 'win';
    else if (!this.alivePartyList.length) this.result = 'lose';
    return this.result;
  }

  // ── 행동 순서 ──
  // cmds: Map(actor → {kind:'attack'|'skill'|'item'|'defend', skill, item, target})
  buildOrder(cmds, opts = {}) {
    this.round++;
    const list = [];
    if (cmds) for (const [actor, cmd] of cmds) {
      if (cmd.kind === 'defend') { actor.defending = true; }
      const sk = cmd.kind === 'skill' ? SKILLS[cmd.skill] : null;
      const prio = cmd.kind === 'defend' ? 3 : sk && sk.priority ? 2 : 0;
      list.push({ actor, cmd, prio, speed: actor.spd * Util.randRange(0.75, 1.25) });
    }
    if (opts.enemiesAct !== false) {
      for (const e of this.aliveEnemyList) {
        const extra = e.def.extraActions ? e.def.extraActions(e) : 0;
        for (let k = 0; k <= extra; k++) list.push({ actor: e, cmd: null, prio: 0, speed: e.spd * Util.randRange(0.75, 1.25) - k * 50 });
      }
    }
    list.sort((a, b) => b.prio - a.prio || b.speed - a.speed);
    return list;
  }

  // ── 대상 선택 도우미 (AI) ──
  pickTarget(side, mode = 'random') {
    const pool = side === 'party' ? this.alivePartyList : this.aliveEnemyList;
    if (!pool.length) return null;
    const taunter = pool.find((a) => a.taunt && !a.disabled);
    if (taunter && Util.chance(0.7)) return taunter;
    if (mode === 'fragile') return pool.slice().sort((a, b) => a.defense * Math.sqrt(a.hp) - b.defense * Math.sqrt(b.hp))[0];
    if (mode === 'weakest') return pool.slice().sort((a, b) => a.hp / a.mhp - b.hp / b.mhp)[0];
    return Util.pick(pool);
  }

  chooseEnemyAction(e) {
    if (e.def.ai) {
      const r = e.def.ai(e, this) || { skill: 'attack' };
      return r;
    }
    const opts = (e.def.actions || [{ s: 'attack', w: 1 }]).filter((a) => {
      const sk = SKILLS[a.s];
      if (e.status.silence && BattleCore.spellLike(sk)) return false;
      if (sk.type === 'heal' && e.hp >= e.mhp * 0.7) return false;
      return true;
    });
    const pick = Util.weighted(opts.length ? opts : [{ s: 'attack', w: 1 }]);
    return { skill: pick.s };
  }

  // ── 실행 ──
  execute(entry) {
    const a = entry.actor;
    const ev = [];
    if (!a.alive || this.result) return ev;
    if (a.status.sleep) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 잠들어 있다… Zzz` }); return ev; }
    if (a.status.paralyze) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 몸이 마비되어 움직일 수 없다!` }); return ev; }

    if (!a.isParty) {
      const act = this.chooseEnemyAction(a);
      let sk = SKILLS[act.skill] || SKILLS.attack;
      if (a.status.silence && BattleCore.spellLike(sk)) {
        ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 주문을 외우려 했지만 봉인되어 있다! 대신 달려든다!` });
        sk = SKILLS.attack;
      }
      const targets = this.resolveTargets(a, sk, act.target);
      if (!targets.length || !targets[0]) return ev;
      return ev.concat(this.useSkill(a, sk, targets, null));
    }
    const cmd = entry.cmd;
    if (cmd.kind === 'defend') { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 몸을 지키고 있다.` }); return ev; }
    if (cmd.kind === 'attack') return ev.concat(this.useSkill(a, SKILLS.attack, this.resolveTargets(a, SKILLS.attack, cmd.target), null));
    if (cmd.kind === 'skill') {
      const sk = SKILLS[cmd.skill];
      if (sk.kind === 'spell' && a.status.silence) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} ${sk.name}${Util.josa(sk.name, '을')} 외우려 했지만, 입이 봉인되어 소리가 나지 않는다!` }); return ev; }
      if ((sk.mp || 0) > a.mp) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} ${sk.name}${Util.josa(sk.name, '을')} 쓰려 했지만 MP가 부족하다!` }); return ev; }
      const targets = this.resolveTargets(a, sk, cmd.target);
      if (!targets.length) { ev.push({ type: 'msg', text: `${a.name}의 ${sk.name}! …그러나 대상이 없다.` }); return ev; }
      if (sk.mp) { a.mp -= sk.mp; ev.push({ type: 'mp', target: a, mpAfter: a.mp }); }
      return ev.concat(this.useSkill(a, sk, targets, null));
    }
    if (cmd.kind === 'item') {
      const it = ITEMS[cmd.item];
      if (!it || Game.count(cmd.item) <= 0) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 도구를 꺼내려 했지만… 이미 남아 있지 않았다!` }); return ev; }
      const fake = Object.assign({ name: it.name, kind: 'item' }, it.use);
      const targets = this.resolveTargets(a, fake, cmd.target);
      if (!targets.length) { ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} ${it.name}${Util.josa(it.name, '을')} 썼다! …그러나 효과가 없었다.` }); Game.removeItem(cmd.item); return ev; }
      Game.removeItem(cmd.item);
      return ev.concat(this.useSkill(a, fake, targets, it));
    }
    return ev;
  }

  // 대상 확정 (죽은 대상이면 다시 고른다)
  resolveTargets(a, sk, want) {
    const t = sk.target;
    if (t === 'self') return [a];
    if (t === 'none') return [a];
    if (t === 'enemies') return this.foes(a);
    if (t === 'allies') return this.friends(a);
    if (t === 'deadAlly') {
      const pool = (a.isParty ? this.party : this.enemies).filter((x) => !x.alive && !x.fled);
      if (want && pool.includes(want)) return [want];
      return pool.length ? [pool[0]] : [];
    }
    if (t === 'ally' || t === 'allyOther') {
      const pool = this.friends(a).filter((x) => t !== 'allyOther' || x !== a);
      if (want && pool.includes(want)) return [want];
      if (!pool.length) return [];
      if (sk.type === 'heal') return [pool.slice().sort((x, y) => x.hp / x.mhp - y.hp / y.mhp)[0]];
      return [want && want.alive ? want : Util.pick(pool)];
    }
    // 단일 적
    const pool = this.foes(a);
    if (want && pool.includes(want)) return [want];
    if (!pool.length) return [];
    if (!a.isParty) return [this.pickTarget('party')];
    return [Util.pick(pool)];
  }

  useMsg(a, sk, targets, item) {
    if (item) return `${a.name}${Util.josa(a.name, '은')} ${item.name}${Util.josa(item.name, '을')} 사용했다!`;
    if (sk.msg) return Util.fill(sk.msg, { A: a.name, T: targets[0] ? targets[0].name : '' });
    if (sk.id === 'attack') return `${a.name}의 공격!`;
    if (sk.kind === 'spell') return `${a.name}${Util.josa(a.name, '은')} ${sk.name}의 주문을 외웠다!`;
    return `${a.name}의 ${sk.name}!`;
  }

  useSkill(a, sk, targets, item) {
    const ev = [];
    ev.push({ type: 'msg', text: this.useMsg(a, sk, targets, item) });
    const anim = sk.anim || (item ? { heal: 'heal', mp: 'heal', full: 'heal', revive: 'heal', cure: 'heal' }[sk.type] : null);
    if (anim && !['physical', 'drain'].includes(sk.type)) ev.push({ type: 'anim', name: anim, targets, user: a });
    const multi = targets.length > 1;
    switch (sk.type) {
      case 'physical':
      case 'drain': {
        const hits = sk.hits || 1;
        for (let h = 0; h < hits; h++) {
          let list = targets;
          if (sk.randomTargets) { const pool = this.foes(a); if (!pool.length) break; list = [Util.pick(pool)]; }
          for (let t of list) {
            if (!t.alive) { const pool = this.foes(a); if (!pool.length) break; t = Util.pick(pool); }
            // 감싸기
            if (!a.isParty && !multi && t.coveredBy && t.coveredBy.alive && !t.coveredBy.disabled && t.coveredBy !== t) {
              ev.push({ type: 'msg', text: `${t.coveredBy.name}${Util.josa(t.coveredBy.name, '이')} ${t.name}${Util.josa(t.name, '을')} 감싸며 대신 막아섰다!` });
              t = t.coveredBy;
            }
            ev.push(...this.physicalHit(a, t, sk));
            if (this.checkEnd()) return ev;
          }
        }
        break;
      }
      case 'magic':
      case 'damage':
        for (const t of targets) { if (t.alive) ev.push(...this.magicHit(a, t, sk)); }
        break;
      case 'heal': {
        for (const t of targets) {
          if (!t.alive) continue;
          const bonus = a.isParty ? 1 + (a.st.healBonus || 0) : 1;
          const amt = sk.amount ? sk.amount : Math.round((sk.power + a.mag * (sk.scale || 0)) * bonus * Util.randRange(0.95, 1.05));
          const before = t.hp;
          t.hp = Math.min(t.mhp, t.hp + amt);
          ev.push({ type: 'heal', target: t, amount: t.hp - before, hpAfter: t.hp });
          ev.push({ type: 'msg', text: `${t.name}의 HP가 ${t.hp - before} 회복되었다!` });
        }
        break;
      }
      case 'mp':
        for (const t of targets) {
          const before = t.mp;
          t.mp = Math.min(t.mmp, t.mp + sk.amount);
          ev.push({ type: 'mp', target: t, mpAfter: t.mp, gain: t.mp - before });
          ev.push({ type: 'msg', text: `${t.name}의 MP가 ${t.mp - before} 회복되었다!` });
        }
        break;
      case 'full':
        for (const t of targets) {
          t.hp = t.mhp; t.mp = t.mmp;
          ev.push({ type: 'heal', target: t, amount: t.mhp, hpAfter: t.hp });
          ev.push({ type: 'mp', target: t, mpAfter: t.mp });
          ev.push({ type: 'msg', text: `${t.name}의 HP와 MP가 모두 회복되었다!` });
        }
        break;
      case 'revive':
        for (const t of targets) {
          if (t.alive) { ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} 쓰러져 있지 않다.` }); continue; }
          t.hp = Math.max(1, Math.round(t.mhp * sk.pct));
          for (const k in t.status) delete t.status[k];
          t.buffs = {};
          ev.push({ type: 'revive', target: t, hpAfter: t.hp });
          ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '이')} 되살아났다!` });
        }
        break;
      case 'cure':
        for (const t of targets) {
          const cured = (sk.cures || []).filter((s) => t.status[s]);
          for (const s of cured) delete t.status[s];
          if (cured.length) { ev.push({ type: 'status', target: t }); ev.push({ type: 'msg', text: `${t.name}의 ${cured.map((s) => STATUS_NAMES[s]).join('·')} 상태가 나았다!` }); }
          else ev.push({ type: 'msg', text: `${t.name}에게는 아무 효과도 없었다.` });
        }
        break;
      case 'buff':
        for (const t of targets) {
          for (const k in sk.buff) t.buffs[k] = { mult: sk.buff[k], turns: sk.turns || 3 };
          if (sk.taunt) t.taunt = true;
          ev.push({ type: 'buff', target: t, up: true });
          for (const k in sk.buff) ev.push({ type: 'msg', text: `${t.name}의 ${BUFF_NAMES[k]}${Util.josa(BUFF_NAMES[k], '이')} ${sk.buff[k] >= 1.6 ? '크게 ' : ''}올랐다!` });
        }
        break;
      case 'debuff':
        for (const t of targets) {
          if (!t.alive) continue;
          let chance = sk.chance !== undefined ? sk.chance : 0.8;
          if (!t.isParty && t.def.boss) chance *= 0.5;
          if (Util.chance(chance)) {
            for (const k in sk.buff) t.buffs[k] = { mult: sk.buff[k], turns: sk.turns || 3 };
            ev.push({ type: 'buff', target: t, up: false });
            for (const k in sk.buff) ev.push({ type: 'msg', text: `${t.name}의 ${BUFF_NAMES[k]}${Util.josa(BUFF_NAMES[k], '이')} 떨어졌다!` });
          } else ev.push({ type: 'msg', text: `${t.name}에게는 효과가 없었다.` });
        }
        break;
      case 'status':
        for (const t of targets) { if (t.alive) ev.push(...this.inflict(t, sk.status, true)); }
        break;
      case 'analyze':
        ev.push(...this.analyze(targets[0]));
        break;
      case 'steal': {
        const t = targets[0];
        const st = t.def.steal;
        if (!st || t.stolen) { ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} 훔칠 만한 것을 갖고 있지 않다.` }); break; }
        const chance = Util.clamp(0.45 + (a.spd - t.spd) * 0.012, 0.2, 0.9) * (st.p >= 0.3 ? 1 : 0.7);
        if (Util.chance(chance)) {
          t.stolen = true;
          Game.addItem(st.item, 1);
          ev.push({ type: 'sfx', name: 'steal' });
          ev.push({ type: 'msg', text: `[y]${ITEMS[st.item].name}[/]${Util.josa(ITEMS[st.item].name, '을')} 훔쳐 냈다!` });
        } else ev.push({ type: 'msg', text: '그러나 훔치지 못했다!' });
        break;
      }
      case 'cover': {
        const t = targets[0];
        t.coveredBy = a;
        ev.push({ type: 'buff', target: t, up: true });
        ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} ${t.name}의 앞을 막아섰다!` });
        break;
      }
      case 'pilfer': {
        const t = targets[0];
        if (!t || !t.alive) break;
        const amt = Math.min(Game.gold, Util.randInt(6, 18));
        if (amt <= 0 || Util.chance(0.35)) { ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} 재빨리 몸을 피했다!` }); break; }
        Game.addGold(-amt);
        a.pilfered += amt;
        ev.push({ type: 'sfx', name: 'steal' });
        ev.push({ type: 'msg', text: `[r]${amt}G[/]를 도둑맞았다! (쓰러뜨리면 되찾을 수 있다)` });
        break;
      }
      case 'charge': {
        a.charging = sk.next;
        ev.push({ type: 'sfx', name: 'charge' });
        if (sk.hint) ev.push({ type: 'msg', text: sk.hint });
        break;
      }
      case 'summon': {
        const added = [];
        for (const id of sk.summon) { const n = this.addEnemy(id); if (n) added.push(n); }
        if (added.length) { ev.push({ type: 'sfx', name: a.defId === 'ironfang' ? 'roar' : 'summon' }); ev.push({ type: 'summon', actors: added }); }
        else ev.push({ type: 'msg', text: '…그러나 아무것도 나타나지 않았다.' });
        break;
      }
      case 'absorb': {
        const echoes = this.aliveEnemyList.filter((e) => e.defId === 'shadow_echo');
        if (!echoes.length) { ev.push({ type: 'msg', text: '…그러나 흡수할 그림자가 없다!' }); break; }
        let healed = 0;
        for (const e of echoes) { e.hp = 0; e.absorbed = true; ev.push({ type: 'die', target: e, silent: true }); healed += 110; }
        const before = a.hp;
        a.hp = Math.min(a.mhp, a.hp + healed);
        ev.push({ type: 'heal', target: a, amount: a.hp - before, hpAfter: a.hp });
        ev.push({ type: 'msg', text: `${a.name}의 HP가 ${a.hp - before} 회복되었다! [y](그림자 잔향을 먼저 쓰러뜨려 두면 막을 수 있다)[/]` });
        break;
      }
      case 'flee': {
        a.fled = true;
        ev.push({ type: 'flee', target: a });
        break;
      }
    }
    if (!a.isParty && a.charging && sk.type !== 'charge') a.charging = null;
    if (sk.type === 'physical' && sk.debuff) { /* peck 등은 physicalHit 안에서 처리 */ }
    this.checkEnd();
    return ev;
  }

  physicalHit(a, t, sk) {
    const ev = [];
    let hitChance = (0.95 + (sk.hit || 0)) * a.buff('hit') * (1 - t.evade);
    if (t.disabled) hitChance = 1;
    if (!Util.chance(hitChance)) {
      ev.push({ type: 'anim', name: 'slash', targets: [t], user: a, miss: true });
      ev.push({ type: 'miss', target: t });
      ev.push({ type: 'msg', text: `그러나 ${t.name}${Util.josa(t.name, '은')} 재빨리 피했다!` });
      return ev;
    }
    const critChance = 0.04 + (sk.crit || 0) + (a.isParty && a.id === 'nell' ? 0.06 : 0);
    const crit = a.isParty ? Util.chance(critChance) : !a.def.boss && Util.chance(0.02);
    const atk = a.atk, def = t.defense;
    let dmg;
    if (crit) dmg = atk * 1.5;
    else if (!t.isParty && t.def.shiny) dmg = Util.randInt(0, 1);
    else dmg = (atk * atk) / (atk + def);
    const element = sk.element || (sk.id === 'attack' && a.isParty ? a.st.element : null);
    const em = t.elemMult(element);
    if (!(t.def && t.def.shiny && !crit)) dmg *= (sk.mult || 1) * Util.randRange(0.88, 1.12) * em;
    if (t.defending) dmg *= 0.5;
    dmg = Math.max(t.def && t.def.shiny && !crit ? 0 : 1, Math.round(dmg));
    ev.push({ type: 'anim', name: sk.anim || 'slash', targets: [t], user: a, crit });
    if (crit) ev.push({ type: 'msg', text: a.isParty ? '[y]회심의 일격![/]' : '[r]통한의 일격![/]' });
    ev.push(...this.damage(t, dmg, { crit, em, physical: true, from: a }));
    if (sk.type === 'drain' && dmg > 0) {
      const before = a.hp; a.hp = Math.min(a.mhp, a.hp + Math.round(dmg * 0.6));
      if (a.hp > before) { ev.push({ type: 'heal', target: a, amount: a.hp - before, hpAfter: a.hp }); ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} HP를 ${a.hp - before} 빨아들였다!` }); }
    }
    if (t.alive) {
      if (sk.status) ev.push(...this.inflict(t, sk.status, false));
      if (sk.id === 'attack' && a.isParty && a.st.onHit) ev.push(...this.inflict(t, a.st.onHit, false));
      if (sk.debuff && Util.chance(sk.debuff.chance || 0.3)) {
        t.buffs.def = { mult: sk.debuff.def, turns: sk.debuff.turns || 3 };
        ev.push({ type: 'buff', target: t, up: false });
        ev.push({ type: 'msg', text: `${t.name}의 방어력이 떨어졌다!` });
      }
      if (t.status.sleep && Util.chance(0.5)) { delete t.status.sleep; ev.push({ type: 'status', target: t }); ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} 충격으로 잠에서 깼다!` }); }
    }
    return ev;
  }

  magicHit(a, t, sk) {
    const ev = [];
    const em = t.elemMult(sk.element);
    let dmg = (sk.power + (sk.type === 'damage' ? 0 : a.mag * (sk.scale || 0))) * Util.randRange(0.92, 1.08) * em;
    if (t.defending) dmg *= 0.5;
    dmg = Math.round(dmg);
    if (em === 0) { ev.push({ type: 'msg', text: `${t.name}에게는 ${ELEMENTS[sk.element] || ''} 속성이 전혀 통하지 않는다!` }); ev.push({ type: 'miss', target: t }); return ev; }
    dmg = Math.max(1, dmg);
    ev.push(...this.damage(t, dmg, { em, from: a }));
    if (t.alive && sk.status) ev.push(...this.inflict(t, sk.status, false));
    return ev;
  }

  damage(t, dmg, info = {}) {
    const ev = [];
    t.hp = Math.max(0, t.hp - dmg);
    ev.push({ type: 'damage', target: t, amount: dmg, crit: info.crit, weak: info.em > 1, resist: info.em < 1, hpAfter: t.hp });
    let txt = t.isParty ? `${t.name}${Util.josa(t.name, '은')} [r]${dmg}[/]의 피해를 입었다!` : `${t.name}에게 [y]${dmg}[/]의 피해!`;
    if (info.em > 1) txt += ' [y]약점을 찔렀다![/]';
    else if (info.em < 1 && info.em > 0) txt += ' [d](잘 통하지 않는다)[/]';
    ev.push({ type: 'msg', text: txt });
    if (t.hp <= 0) ev.push(...this.kill(t));
    else if (!t.isParty && t.def.phases) ev.push(...this.checkPhases(t));
    return ev;
  }

  kill(t) {
    const ev = [];
    t.hp = 0;
    t.buffs = {};
    t.charging = null;
    if (t.isParty) {
      for (const k of ['sleep', 'paralyze', 'silence', 'poison']) delete t.status[k];
      ev.push({ type: 'die', target: t });
      ev.push({ type: 'msg', text: `[r]${t.name}${Util.josa(t.name, '은')} 쓰러졌다…[/]` });
    } else {
      this.killed.push(t);
      if (t.pilfered) { Game.addGold(t.pilfered); this.recoveredGold += t.pilfered; }
      ev.push({ type: 'die', target: t });
      ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '을')} 쓰러뜨렸다!` + (t.pilfered ? ` [y](${t.pilfered}G를 되찾았다)[/]` : '') });
    }
    return ev;
  }

  checkPhases(t) {
    const ev = [];
    for (const ph of t.def.phases) {
      if (t.mem['phase_' + ph.key]) continue;
      if (t.hp / t.mhp <= ph.below) {
        t.mem['phase_' + ph.key] = true;
        ev.push({ type: 'phase', target: t, variant: 2 });
        ev.push(...t.def.onPhase(t, this, ph.key));
      }
    }
    return ev;
  }

  inflict(t, statusMap, verbose) {
    const ev = [];
    for (const s in statusMap) {
      if (t.status[s]) { if (verbose) ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} 이미 ${STATUS_NAMES[s]} 상태다.` }); continue; }
      const res = t.resist(s);
      if (res >= 1) { if (verbose) ev.push({ type: 'msg', text: `${t.name}에게는 ${STATUS_NAMES[s]}${Util.josa(STATUS_NAMES[s], '이')} 통하지 않는다!` }); continue; }
      if (!Util.chance(statusMap[s] * (1 - res))) { if (verbose) ev.push({ type: 'msg', text: `${t.name}에게는 효과가 없었다.` }); continue; }
      t.status[s] = s === 'poison' ? 1 : s === 'sleep' ? Util.randInt(2, 4) : s === 'paralyze' ? Util.randInt(1, 3) : Util.randInt(3, 4);
      ev.push({ type: 'status', target: t, status: s, on: true });
      const msg = { poison: '독에 걸렸다!', sleep: '잠들어 버렸다!', paralyze: '몸이 마비되었다!', silence: '주문이 봉인되었다!' }[s];
      ev.push({ type: 'msg', text: `${t.name}${Util.josa(t.name, '은')} ${msg}` });
    }
    return ev;
  }

  analyze(t) {
    const ev = [];
    const d = t.def;
    Game.state.seen[t.defId] = true;
    const weak = [], res = [], immune = [];
    for (const k in ELEMENTS) {
      const m = t.elemMult(k);
      if (m > 1) weak.push(ELEMENTS[k]); else if (m === 0) immune.push(ELEMENTS[k]); else if (m < 1) res.push(ELEMENTS[k]);
    }
    const sres = Object.keys(d.resist || {}).filter((k) => d.resist[k] >= 1).map((k) => STATUS_NAMES[k]);
    ev.push({ type: 'analyze', target: t });
    ev.push({ type: 'msg', text: `[b]【${t.name}】[/] HP ${t.hp}/${t.mhp} · 공격 ${Math.round(t.atk)} · 방어 ${Math.round(t.defense)}` });
    ev.push({ type: 'msg', text: `약점: [y]${weak.join('·') || '없음'}[/]  내성: ${res.join('·') || '없음'}${immune.length ? `  무효: ${immune.join('·')}` : ''}${sres.length ? `  상태이상 무효: ${sres.join('·')}` : ''}` });
    ev.push({ type: 'msg', text: `[d]${d.desc}[/]` });
    return ev;
  }

  // 라운드 종료 처리
  endRound() {
    const ev = [];
    for (const a of [...this.party, ...this.enemies]) {
      if (!a.alive) continue;
      a.defending = false; a.coveredBy = null; a.taunt = false;
      if (a.status.poison) {
        let dmg = Math.max(1, Math.round(a.mhp * (a.isParty ? 0.06 : 0.08)));
        if (!a.isParty && a.def.boss) dmg = Math.min(dmg, 30);
        if (a.isParty) dmg = Math.min(dmg, a.hp - 1);
        if (dmg > 0) {
          a.hp -= dmg;
          ev.push({ type: 'damage', target: a, amount: dmg, poison: true, hpAfter: a.hp });
          ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} 독으로 [p]${dmg}[/]의 피해를 입었다!` });
          if (a.hp <= 0) ev.push(...this.kill(a));
        }
      }
      for (const s of ['sleep', 'paralyze', 'silence']) {
        if (!a.status[s]) continue;
        a.status[s]--;
        const wake = s === 'sleep' && Util.chance(0.25);
        if (a.status[s] <= 0 || wake) {
          delete a.status[s];
          ev.push({ type: 'status', target: a });
          ev.push({ type: 'msg', text: `${a.name}${Util.josa(a.name, '은')} ${{ sleep: '잠에서 깨어났다!', paralyze: '마비가 풀렸다!', silence: '다시 주문을 외울 수 있게 되었다!' }[s]}` });
        }
      }
      for (const k in a.buffs) {
        const b = a.buffs[k];
        if (b.turns >= 99) continue;
        b.turns--;
        if (b.turns <= 0) {
          delete a.buffs[k];
          ev.push({ type: 'buff', target: a, reset: true });
          ev.push({ type: 'msg', text: `${a.name}의 ${BUFF_NAMES[k]}${Util.josa(BUFF_NAMES[k], '이')} 원래대로 돌아왔다.` });
        }
      }
    }
    this.checkEnd();
    return ev;
  }

  tryEscape() {
    if (!this.canEscape) return { ok: false, impossible: true };
    const ps = this.alivePartyList, es = this.aliveEnemyList;
    const avg = (l) => l.reduce((n, a) => n + a.spd, 0) / Math.max(1, l.length);
    const chance = Util.clamp(0.55 + (avg(ps) - avg(es)) * 0.02 + this.escapeTries * 0.15, 0.3, 0.95);
    this.escapeTries++;
    const ok = Util.chance(chance);
    if (ok) this.result = 'escape';
    return { ok };
  }

  // 승리 보상: 경험치·골드·드롭 적용, 레벨업 목록 반환
  rewards() {
    let exp = 0, gold = 0;
    const drops = [];
    for (const e of this.killed) {
      if (e.absorbed) continue;
      exp += e.def.exp; gold += e.def.gold;
      for (const d of e.def.drops || []) if (Util.chance(d.p)) { drops.push(d.item); break; }
      Game.state.kills[e.defId] = (Game.state.kills[e.defId] || 0) + 1;
    }
    Game.addGold(gold);
    for (const it of drops) Game.addItem(it, 1);
    const ups = [];
    for (const id of Game.state.party) if (Game.state.members[id].hp > 0) ups.push(...Game.addExp(id, exp));
    for (const id of Game.state.reserve) ups.push(...Game.addExp(id, Math.floor(exp / 2)));
    const questMsgs = [];
    for (const e of this.killed) { const m = Quests.onKill(e.defId); if (m) questMsgs.push(m); }
    return { exp, gold, drops, ups, questMsgs };
  }
}
