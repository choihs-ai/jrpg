'use strict';
// ─────────────────────────────────────────────────────────────
// Sound: Web Audio 칩튠 시퀀서 + 효과음 (모든 곡은 이 게임을 위해 작곡한 오리지널)
//  곡 = 코드 진행 + 멜로디. 베이스/아르페지오/드럼은 코드 진행에서 자동 생성.
// ─────────────────────────────────────────────────────────────
const Sound = (() => {
  let ac = null, master, musicBus, sfxBus, noiseBuf;
  const waves = {};
  let unlocked = false;
  let cur = null;       // 재생 중인 BGM
  let jingleCur = null; // 재생 중인 징글
  let timer = null;
  let wantBgm = null;   // 오디오 잠금 해제 전 요청된 곡

  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const freq = (name, oct) => 440 * Math.pow(2, (NOTE[name] + (oct - 4) * 12 - 9) / 12);
  const CHORDS = {
    '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6], sus4: [0, 5, 7], aug: [0, 4, 8],
  };
  function chordNotes(sym) {
    const m = /^([A-G][#b]?)(maj7|m7|m|7|dim|sus4|aug)?(?:\/([A-G][#b]?))?$/.exec(sym);
    if (!m) return { root: 0, tones: [0, 4, 7], bass: 0 };
    const root = NOTE[m[1]];
    return { root, tones: CHORDS[m[2] || ''].map((x) => (root + x) % 12), bass: m[3] ? NOTE[m[3]] : root };
  }
  const midiFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  // ── 곡 정의 ──
  // mel: "음이름옥타브.길이(16분음표 단위)" / r=쉼표
  const SONGS = {
    title: {
      bpm: 84, bar: 16, loop: true, bass: 'long', arp: 'up8', drums: 'none', lead: 'p25', leadVol: 0.09,
      chords: 'C G/B Am F F G Em Am F G C Am F G C C',
      mel: `G4.4 C5.4 E5.6 D5.2 D5.8 B4.4 G4.4 A4.4 C5.4 E5.6 G5.2 F5.12 r.4
            F5.4 E5.4 D5.4 C5.4 D5.6 E5.2 D5.4 B4.4 E5.4 D5.4 C5.4 B4.4 A4.12 r.4
            A4.4 C5.4 F5.6 E5.2 D5.4 B4.4 G5.8 E5.4 G5.4 C6.6 B5.2 A5.12 r.4
            F5.4 A5.4 G5.4 F5.4 E5.4 D5.4 B4.4 D5.4 C5.16 r.16`,
    },
    town: {
      bpm: 112, bar: 12, loop: true, bass: 'waltz', arp: 'none', drums: 'none', lead: 'p25', leadVol: 0.085,
      chords: 'F C Dm Bb F Gm C C Bb F Gm C F Dm Gm F',
      mel: `A4.4 C5.4 F5.4 E5.6 D5.2 C5.4 D5.4 F5.4 A5.4 G5.8 F5.4
            F5.4 E5.2 D5.2 C5.4 Bb4.4 D5.4 G5.4 E5.6 F5.2 E5.4 C5.12
            D5.4 F5.4 Bb5.4 A5.6 G5.2 F5.4 G5.4 F5.4 D5.4 E5.8 C5.4
            F5.4 A5.4 C6.4 Bb5.6 A5.2 F5.4 G5.4 A5.2 G5.2 E5.4 F5.12`,
    },
    field: {
      bpm: 126, bar: 16, loop: true, bass: 'pump', arp: 'none', drums: 'march', lead: 'p25', leadVol: 0.085, harmony: true,
      chords: 'G D Em C G C D D Em C G D C D G G',
      mel: `G4.2 B4.2 D5.4 G5.4 F#5.2 E5.2 D5.4 F#5.4 A5.6 r.2 G5.4 F#5.2 E5.2 B4.4 E5.4 E5.6 D5.2 C5.4 E5.4
            D5.4 G4.4 B4.4 D5.4 E5.4 G5.4 C6.6 B5.2 A5.4 F#5.4 D5.4 E5.2 F#5.2 A5.12 r.4
            B5.4 A5.2 G5.2 E5.4 G5.4 A5.4 G5.2 E5.2 C5.8 D5.4 G5.4 B5.4 A5.2 G5.2 F#5.8 D5.8
            E5.4 F#5.2 G5.2 A5.4 G5.4 F#5.4 E5.2 D5.2 A4.4 D5.4 G5.4 F#5.2 G5.2 B5.4 A5.4 G5.12 r.4`,
    },
    dungeon: {
      bpm: 84, bar: 16, loop: true, bass: 'long', arp: 'slow', drums: 'pulse', lead: 'p12', leadVol: 0.08,
      chords: 'Am Am F E Am Dm E E F G Em Am Dm E Am E',
      mel: `A4.6 C5.2 E5.8 D5.4 C5.4 B4.8 C5.6 A4.2 F4.8 G#4.12 r.4
            E5.6 F5.2 E5.4 C5.4 D5.6 F5.2 A5.8 G#5.4 F5.4 E5.4 D5.4 B4.12 r.4
            A5.6 G5.2 F5.8 G5.6 F5.2 D5.8 E5.4 G5.4 B5.4 G5.4 A5.12 r.4
            F5.4 E5.4 D5.4 F5.4 E5.4 D5.4 C5.4 B4.4 A4.16 G#4.8 B4.8`,
    },
    cave: {
      bpm: 96, bar: 16, loop: true, bass: 'long', arp: 'slow', drums: 'none', lead: 'p12', leadVol: 0.07,
      chords: 'Em C Am B Em C D B',
      mel: `E5.8 G5.4 F#5.4 E5.8 C5.8 A4.4 C5.4 E5.8 D#5.16
            G5.8 B5.4 A5.4 G5.8 E5.8 F#5.4 A5.4 D5.8 B4.16`,
    },
    battle: {
      bpm: 150, bar: 16, loop: true, bass: 'drive', arp: 'none', drums: 'rock', lead: 'p25', leadVol: 0.085, harmony: true,
      chords: 'Dm Dm Bb C Dm Dm Gm A Bb C Dm Dm Bb C A A',
      mel: `D5.2 r.1 D5.1 D5.2 F5.2 A5.4 G5.2 F5.2 E5.2 F5.2 D5.4 A4.4 D5.4 F5.2 r.1 F5.1 F5.2 G5.2 A5.4 Bb5.2 A5.2 G5.4 E5.4 C5.4 E5.4
            D5.2 r.1 D5.1 D5.2 F5.2 A5.4 D6.4 C6.2 Bb5.2 A5.2 G5.2 F5.4 E5.4 D5.4 G5.4 Bb5.4 D6.4 C#6.8 A5.8
            Bb5.4 A5.2 G5.2 F5.4 D5.4 E5.4 F5.2 G5.2 C6.8 A5.4 F5.4 D5.4 F5.4 A5.2 G5.2 F5.2 E5.2 D5.8
            F5.4 Bb5.4 D6.4 Bb5.4 C6.4 G5.4 E5.4 C5.4 E5.2 F5.2 G5.2 A5.2 C#6.4 A5.4 E5.4 C#5.4 A4.4 r.4`,
    },
    boss: {
      bpm: 164, bar: 16, loop: true, bass: 'gallop', arp: 'none', drums: 'heavy', lead: 'p25', leadVol: 0.085, harmony: true,
      chords: 'Em C Am B Em C D B Em G Am B C D B B',
      mel: `E5.2 E5.2 G5.2 B5.2 E6.4 D6.4 C6.2 B5.2 A5.2 G5.2 E5.8 A5.2 A5.2 C6.2 E6.2 A5.4 G5.4 F#5.4 D#5.4 B4.8
            G5.4 F#5.2 E5.2 B5.4 E5.4 C6.4 B5.2 A5.2 G5.4 E5.4 F#5.4 A5.4 D6.4 C6.4 B5.12 r.4
            E6.2 D6.2 B5.4 G5.4 E5.4 D6.2 C6.2 B5.4 G5.4 D5.4 C6.2 B5.2 A5.4 E5.4 C5.4 D#5.4 F#5.4 B5.8
            E5.4 G5.4 C6.4 E6.4 D6.4 C6.4 A5.4 F#5.4 B5.4 C6.4 D#6.4 F#6.4 B5.8 r.8`,
    },
    shrine: {
      bpm: 72, bar: 16, loop: true, bass: 'long', arp: 'up8', drums: 'none', lead: 'p12', leadVol: 0.07,
      chords: 'D A/C# Bm G D G A A',
      mel: `F#5.8 A5.8 E5.8 C#5.8 D5.8 F#5.8 B4.16 A4.8 D5.8 B4.8 G5.8 A5.16 r.16`,
    },
    sad: {
      bpm: 76, bar: 16, loop: true, bass: 'long', arp: 'slow', drums: 'none', lead: 'p12', leadVol: 0.075,
      chords: 'Am F C G Am F E E',
      mel: `E5.8 C5.4 A4.4 F5.8 E5.4 C5.4 G5.12 E5.4 D5.16 C5.8 B4.4 A4.4 A4.8 C5.8 B4.8 G#4.8 E4.16`,
    },
    // ── 징글 (반복 없음) ──
    victory: {
      bpm: 150, bar: 16, loop: false, bass: 'hits', arp: 'none', drums: 'fill', lead: 'p25', leadVol: 0.1, harmony: true,
      chords: 'C F G C',
      mel: `G4.2 C5.2 E5.2 G5.6 E5.2 G5.2 A5.2 G5.2 F5.2 E5.2 D5.4 G5.4 F5.2 E5.2 C6.12 r.4`,
    },
    levelup: { bpm: 170, bar: 16, loop: false, bass: 'none', arp: 'none', drums: 'none', lead: 'p25', leadVol: 0.1, chords: 'C', mel: `C5.2 E5.2 G5.2 C6.4 r.2 G5.2 C6.8` },
    item: { bpm: 150, bar: 16, loop: false, bass: 'none', arp: 'none', drums: 'none', lead: 'p25', leadVol: 0.1, chords: 'G', mel: `G5.2 A5.2 B5.2 D6.6 r.4` },
    inn: {
      bpm: 92, bar: 16, loop: false, bass: 'long', arp: 'none', drums: 'none', lead: 'p12', leadVol: 0.09,
      chords: 'F C Bb F', mel: `A4.4 C5.4 F5.8 E5.4 G5.4 C5.8 D5.4 Bb4.4 G4.4 E4.4 F4.16`,
    },
    quest: { bpm: 140, bar: 16, loop: false, bass: 'hits', arp: 'none', drums: 'none', lead: 'p25', leadVol: 0.1, chords: 'D G A D', mel: `A4.2 D5.2 F#5.2 A5.6 B5.4 G5.4 A5.4 C#6.4 D6.12 r.4` },
    gameover: { bpm: 66, bar: 16, loop: false, bass: 'long', arp: 'none', drums: 'none', lead: 'p12', leadVol: 0.09, chords: 'Dm Bb Gm A', mel: `D5.8 C5.8 Bb4.8 A4.8 G4.8 E4.8 C#4.8 D4.8` },
    join: { bpm: 132, bar: 16, loop: false, bass: 'hits', arp: 'none', drums: 'none', lead: 'p25', leadVol: 0.1, chords: 'F C F', mel: `C5.2 F5.2 A5.2 C6.4 A5.2 Bb5.2 G5.2 F5.12 r.4` },
  };

  // 멜로디 문자열 파싱
  function parseMel(str) {
    const out = [];
    let t = 0;
    for (const tok of str.trim().split(/\s+/)) {
      if (!tok || tok === '|') continue;
      const m = /^([A-G][#b]?|r)(\d)?\.(\d+)$/.exec(tok);
      if (!m) { console.warn('bad note', tok); continue; }
      const d = +m[3];
      if (m[1] !== 'r') out.push({ t, d, f: freq(m[1], +m[2]) });
      t += d;
    }
    return { events: out, length: t };
  }

  function compile(def) {
    const chords = def.chords.split(/\s+/).map(chordNotes);
    const bar = def.bar;
    const mel = parseMel(def.mel);
    const length = Math.max(mel.length, chords.length * bar);
    const ch = [];
    ch.push({ inst: def.lead, vol: def.leadVol, ev: mel.events });
    if (def.harmony) {
      // 멜로디 3도 아래 화음 (코드 구성음으로 스냅)
      const ev = [];
      for (const e of mel.events) {
        const ci = Math.min(chords.length - 1, Math.floor(e.t / bar));
        const midi = Math.round(69 + 12 * Math.log2(e.f / 440));
        let best = midi - 3;
        for (let k = midi - 5; k <= midi - 2; k++) if (chords[ci].tones.includes(((k % 12) + 12) % 12)) { best = k; break; }
        ev.push({ t: e.t, d: e.d, f: midiFreq(best) });
      }
      ch.push({ inst: 'p50', vol: def.leadVol * 0.38, ev });
    }
    const bass = [], arp = [], drums = [];
    chords.forEach((c, i) => {
      const t0 = i * bar;
      const root = 36 + c.bass; // C2 기준
      const r = midiFreq(root < 40 ? root + 12 : root);
      const fifth = midiFreq((root < 40 ? root + 12 : root) + 7);
      switch (def.bass) {
        case 'long': bass.push({ t: t0, d: bar / 2, f: r }, { t: t0 + bar / 2, d: bar / 2, f: r }); break;
        case 'waltz': bass.push({ t: t0, d: 4, f: r }, { t: t0 + 4, d: 2, f: fifth }, { t: t0 + 8, d: 2, f: fifth }); break;
        case 'pump': for (let k = 0; k < bar; k += 2) bass.push({ t: t0 + k, d: 2, f: k % 4 === 0 ? r : (k % 8 === 2 ? r * 2 : fifth) }); break;
        case 'drive': for (let k = 0; k < bar; k += 2) bass.push({ t: t0 + k, d: 2, f: k % 4 === 2 ? r * 2 : r }); break;
        case 'gallop': for (let k = 0; k < bar; k += 4) bass.push({ t: t0 + k, d: 2, f: r }, { t: t0 + k + 2, d: 1, f: r }, { t: t0 + k + 3, d: 1, f: r * 2 }); break;
        case 'hits': bass.push({ t: t0, d: 3, f: r }, { t: t0 + bar / 2, d: 3, f: fifth }); break;
      }
      const tones = c.tones.map((x) => midiFreq(60 + x));
      if (def.arp === 'up8') for (let k = 0; k < bar; k += 2) arp.push({ t: t0 + k, d: 2, f: tones[(k / 2) % tones.length] * (k >= bar / 2 ? 1 : 1) });
      if (def.arp === 'slow') for (let k = 0; k < bar; k += 4) arp.push({ t: t0 + k, d: 4, f: tones[(k / 4) % tones.length] / 2 });
      const D = (tt, kind) => drums.push({ t: t0 + tt, d: 1, drum: kind });
      switch (def.drums) {
        case 'march': for (let k = 0; k < bar; k += 4) D(k, k % 8 === 0 ? 'k' : 's'); for (let k = 2; k < bar; k += 4) D(k, 'h'); break;
        case 'rock': for (let k = 0; k < bar; k += 2) D(k, 'h'); D(0, 'k'); D(6, 'k'); D(8, 'k'); D(4, 's'); D(12, 's'); if (i % 4 === 3) { D(14, 's'); D(15, 's'); } break;
        case 'heavy': for (let k = 0; k < bar; k += 2) D(k, 'h'); for (let k = 0; k < bar; k += 4) D(k, 'k'); D(4, 's'); D(12, 's'); D(10, 'k'); if (i % 2) D(14, 's'); break;
        case 'pulse': D(0, 'k'); D(8, 'k'); break;
        case 'fill': if (i === chords.length - 1) { D(0, 's'); D(2, 's'); D(4, 'k'); } else { D(0, 'k'); D(8, 's'); } break;
      }
    });
    if (bass.length) ch.push({ inst: 'tri', vol: 0.2, ev: bass });
    if (arp.length) ch.push({ inst: 'p12', vol: 0.035, ev: arp });
    if (drums.length) ch.push({ inst: 'drum', vol: 0.14, ev: drums });
    return { bpm: def.bpm, loop: def.loop, length, ch };
  }
  const compiled = {};
  const getSong = (n) => compiled[n] || (compiled[n] = compile(SONGS[n]));

  // ── 오디오 초기화 ──
  function ensure() {
    if (ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    applyVolume();
    // 펄스파 (듀티비 12.5%, 25%, 50%)
    for (const [name, duty] of [['p12', 0.125], ['p25', 0.25], ['p50', 0.5]]) {
      const n = 32, real = new Float32Array(n), imag = new Float32Array(n);
      for (let k = 1; k < n; k++) real[k] = (4 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      waves[name] = ac.createPeriodicWave(real, imag);
    }
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    timer = setInterval(schedule, 25);
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else if (unlocked) ac.resume(); });
    return true;
  }
  function applyVolume() {
    if (!ac) return;
    const v = (x) => Math.pow(x / 10, 1.6);
    musicBus.gain.setTargetAtTime(v(Settings.get('bgm')) * 0.8, ac.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(v(Settings.get('sfx')) * 0.9, ac.currentTime, 0.05);
  }

  function unlock() {
    if (unlocked) return;
    if (!ensure()) return;
    ac.resume().then(() => {
      unlocked = true;
      if (wantBgm && !cur) { const w = wantBgm; wantBgm = null; bgm(w); }
    }).catch(() => {});
  }

  function playNote(bus, inst, f, t, dur, vol) {
    if (inst === 'drum') return drum(bus, f, t, vol);
    const o = ac.createOscillator();
    const g = ac.createGain();
    if (inst === 'tri') o.type = 'triangle';
    else if (waves[inst]) o.setPeriodicWave(waves[inst]);
    else o.type = 'square';
    o.frequency.setValueAtTime(f, t);
    if (inst === 'p25' && dur > 0.25) {
      // 긴 음에 약한 비브라토
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = f * 0.006;
      lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(t + 0.15); lfo.stop(t + dur + 0.1);
    }
    const rel = inst === 'tri' ? 0.03 : 0.06;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.setTargetAtTime(vol * (inst === 'tri' ? 0.9 : 0.7), t + 0.02, 0.08);
    g.gain.setTargetAtTime(0, t + Math.max(0.02, dur - 0.02), rel);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.3);
  }
  function drum(bus, kind, t, vol) {
    if (kind === 'k') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(vol * 2.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.2);
      return;
    }
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const flt = ac.createBiquadFilter(); flt.type = 'highpass';
    flt.frequency.value = kind === 'h' ? 7000 : 1200;
    const g = ac.createGain();
    const dur = kind === 'h' ? 0.04 : 0.13;
    g.gain.setValueAtTime(vol * (kind === 'h' ? 0.5 : 1.4), t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(bus);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }

  function startSong(name, opts = {}) {
    const song = getSong(name);
    const gain = ac.createGain();
    gain.gain.value = 1;
    gain.connect(musicBus);
    const s = { name, song, gain, t0: ac.currentTime + 0.06, idx: song.ch.map(() => 0), loopN: 0, onEnd: opts.onEnd, done: false };
    return s;
  }

  function schedule() {
    if (!ac || !unlocked) return;
    for (const s of [cur, jingleCur]) {
      if (!s || s.done) continue;
      const spb = 60 / s.song.bpm / 4; // 16분음표 길이(초)
      const horizon = ac.currentTime + 0.15;
      let guard = 0;
      while (guard++ < 500) {
        let next = null, nc = -1;
        s.song.ch.forEach((c, ci) => {
          const e = c.ev[s.idx[ci]];
          if (!e) return;
          const tt = s.t0 + (e.t + s.loopN * s.song.length) * spb;
          if (next === null || tt < next) { next = tt; nc = ci; }
        });
        if (next === null) {
          // 한 바퀴 끝
          const endT = s.t0 + (s.loopN + 1) * s.song.length * spb;
          if (s.song.loop) { s.loopN++; s.idx = s.song.ch.map(() => 0); continue; }
          if (ac.currentTime >= endT) { s.done = true; if (s.onEnd) s.onEnd(); }
          break;
        }
        if (next > horizon) break;
        const c = s.song.ch[nc];
        const e = c.ev[s.idx[nc]++];
        if (next >= ac.currentTime - 0.02) playNote(s.gain, c.inst, e.drum || e.f, Math.max(next, ac.currentTime), e.d * spb, c.vol);
      }
    }
  }

  function stopSong(s, fade = 0.25) {
    if (!s) return;
    s.done = true;
    try {
      s.gain.gain.setTargetAtTime(0, ac.currentTime, fade / 3);
      setTimeout(() => { try { s.gain.disconnect(); } catch (e) { /* */ } }, fade * 1000 + 400);
    } catch (e) { /* */ }
  }

  function bgm(name) {
    if (!name) { stop(); return; }
    if (!unlocked || !ac) { wantBgm = name; return; }
    if (cur && cur.name === name && !cur.done) return;
    stopSong(cur);
    cur = startSong(name);
  }
  function stop() { wantBgm = null; if (cur) stopSong(cur); cur = null; }

  // 징글: 현재 BGM을 잠시 낮추고 재생, 끝나면 resolve
  function jingle(name) {
    return new Promise((resolve) => {
      if (!unlocked || !ac || Settings.get('bgm') === 0) { setTimeout(resolve, name === 'levelup' || name === 'item' ? 500 : 900); return; }
      if (jingleCur) stopSong(jingleCur, 0.05);
      if (cur) cur.gain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05);
      jingleCur = startSong(name, {
        onEnd: () => {
          stopSong(jingleCur, 0.1); jingleCur = null;
          if (cur && !cur.done) cur.gain.gain.setTargetAtTime(1, ac.currentTime, 0.3);
          resolve();
        },
      });
    });
  }

  // ── 효과음 ──
  function tone(f, dur, opts = {}) {
    const t = ac.currentTime + (opts.delay || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    if (opts.wave && waves[opts.wave]) o.setPeriodicWave(waves[opts.wave]); else o.type = opts.type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    const v = opts.vol || 0.15;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, opts = {}) {
    const t = ac.currentTime + (opts.delay || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const flt = ac.createBiquadFilter(); flt.type = opts.filter || 'lowpass'; flt.frequency.setValueAtTime(opts.freq || 2000, t);
    if (opts.to) flt.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(opts.vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(sfxBus);
    src.start(t, Math.random()); src.stop(t + dur + 0.02);
  }
  const SFX = {
    cursor: () => tone(1320, 0.035, { wave: 'p25', vol: 0.06 }),
    text: () => tone(900 + Math.random() * 80, 0.02, { wave: 'p50', vol: 0.025 }),
    confirm: () => { tone(880, 0.05, { wave: 'p25', vol: 0.08 }); tone(1320, 0.07, { wave: 'p25', vol: 0.08, delay: 0.05 }); },
    cancel: () => { tone(660, 0.05, { wave: 'p25', vol: 0.07 }); tone(440, 0.07, { wave: 'p25', vol: 0.07, delay: 0.05 }); },
    buzzer: () => tone(120, 0.18, { wave: 'p50', vol: 0.12 }),
    menu: () => { tone(660, 0.04, { wave: 'p25', vol: 0.07 }); tone(990, 0.06, { wave: 'p25', vol: 0.07, delay: 0.04 }); },
    hit: () => { noise(0.12, { freq: 3000, to: 300, vol: 0.4 }); tone(160, 0.1, { type: 'square', to: 60, vol: 0.12 }); },
    crit: () => { noise(0.2, { freq: 6000, to: 200, vol: 0.5 }); tone(220, 0.18, { wave: 'p25', to: 50, vol: 0.18 }); tone(1600, 0.08, { wave: 'p12', vol: 0.08 }); },
    miss: () => tone(1200, 0.12, { wave: 'p12', to: 500, vol: 0.06 }),
    hurt: () => { noise(0.15, { freq: 1500, to: 200, vol: 0.45 }); tone(110, 0.15, { type: 'square', to: 50, vol: 0.14 }); },
    enemyDie: () => { for (let i = 0; i < 6; i++) tone(800 - i * 110, 0.06, { wave: 'p25', vol: 0.07, delay: i * 0.04 }); },
    fire: () => { noise(0.5, { freq: 800, to: 3000, vol: 0.35 }); tone(200, 0.4, { type: 'sawtooth', to: 600, vol: 0.05 }); },
    ice: () => { for (let i = 0; i < 5; i++) tone(2000 + i * 300, 0.08, { type: 'triangle', vol: 0.08, delay: i * 0.05 }); noise(0.3, { filter: 'highpass', freq: 5000, vol: 0.15 }); },
    thunder: () => { noise(0.6, { freq: 5000, to: 100, vol: 0.6 }); tone(80, 0.5, { type: 'sawtooth', to: 30, vol: 0.12 }); },
    light: () => { for (let i = 0; i < 6; i++) tone(880 * Math.pow(1.26, i), 0.12, { type: 'triangle', vol: 0.07, delay: i * 0.05 }); },
    dark: () => { tone(300, 0.5, { type: 'sawtooth', to: 60, vol: 0.08 }); noise(0.5, { freq: 400, vol: 0.2 }); },
    heal: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, { type: 'triangle', vol: 0.09, delay: i * 0.06 })); },
    buff: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.1, { wave: 'p25', vol: 0.06, delay: i * 0.05 })); },
    debuff: () => { [784, 659, 523, 392].forEach((f, i) => tone(f, 0.1, { wave: 'p25', vol: 0.06, delay: i * 0.05 })); },
    mist: () => noise(0.6, { freq: 600, to: 1800, vol: 0.18 }),
    status: () => { tone(400, 0.2, { wave: 'p12', to: 200, vol: 0.08 }); },
    encounter: () => { for (let i = 0; i < 8; i++) tone(300 + (i % 2) * 300 + i * 60, 0.05, { wave: 'p25', vol: 0.08, delay: i * 0.035 }); },
    escape: () => { for (let i = 0; i < 5; i++) tone(400 + i * 150, 0.05, { wave: 'p25', vol: 0.06, delay: i * 0.04 }); },
    door: () => { noise(0.12, { freq: 500, vol: 0.3 }); tone(120, 0.1, { type: 'triangle', vol: 0.12 }); },
    stairs: () => { for (let i = 0; i < 4; i++) noise(0.06, { freq: 900, vol: 0.2, delay: i * 0.09 }); },
    chest: () => { tone(523, 0.08, { wave: 'p25', vol: 0.08 }); tone(784, 0.08, { wave: 'p25', vol: 0.08, delay: 0.07 }); tone(1047, 0.15, { wave: 'p25', vol: 0.08, delay: 0.14 }); },
    coin: () => { tone(988, 0.06, { wave: 'p25', vol: 0.08 }); tone(1319, 0.18, { wave: 'p25', vol: 0.08, delay: 0.06 }); },
    bump: () => tone(90, 0.06, { wave: 'p50', vol: 0.06 }),
    impact: () => { noise(0.4, { freq: 2000, to: 80, vol: 0.6 }); tone(70, 0.35, { type: 'square', to: 30, vol: 0.18 }); },
    bell: () => { [262, 523, 784, 1047].forEach((f, i) => tone(f, 2.2 - i * 0.4, { type: 'triangle', vol: 0.12 - i * 0.02 })); },
    chime: () => { [1047, 1319, 1568, 2093, 1568, 2637].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.06, delay: i * 0.09 })); },
    save: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.07, delay: i * 0.08 })); },
    poison: () => tone(220, 0.12, { wave: 'p12', to: 160, vol: 0.06 }),
    steal: () => { tone(1200, 0.04, { wave: 'p25', vol: 0.06 }); tone(1600, 0.06, { wave: 'p25', vol: 0.06, delay: 0.04 }); },
    summon: () => { tone(150, 0.6, { type: 'sawtooth', to: 400, vol: 0.07 }); noise(0.6, { freq: 300, to: 1200, vol: 0.2 }); },
    charge: () => { tone(200, 0.6, { wave: 'p25', to: 800, vol: 0.06 }); },
    roar: () => { noise(0.7, { freq: 600, to: 200, vol: 0.5 }); tone(90, 0.6, { type: 'sawtooth', to: 60, vol: 0.12 }); },
    step: () => {},
  };

  return {
    SONGS,
    unlock,
    get unlocked() { return unlocked; },
    get current() { return cur ? cur.name : wantBgm; },
    bgm, stop, jingle, applyVolume,
    sfx(name) { try { if (!unlocked || !ac || !SFX[name]) return; SFX[name](); } catch (e) { /* 소리 오류는 무시 */ } },
  };
})();
