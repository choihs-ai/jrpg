'use strict';
// ─────────────────────────────────────────────────────────────
// 잠든 종의 유적 (지하 1층, 지하 2층, 종의 방) + 우물 아래 동굴
// ─────────────────────────────────────────────────────────────
defMap('ruins1', {
  name: '잠든 종의 유적 B1', kind: 'dungeon', bgm: 'dungeon', base: '_',
  tiles: [
      '##############################', // 0
      '##&#####&####&###&####&####&##', // 1
      '##_______#####_>_#####______##', // 2
      '##_______#####___#####______##', // 3
      '##__-____#####___#####______##', // 4
      '##_______######|######___-__##', // 5
      '##_______#&####_####&#______##', // 6
      '##_______#___________#______##', // 7
      '#####_####___________###_#####', // 8
      '###_________P_____P________###', // 9
      '###%######___________#_#######', // 10
      '###%######___________#_#######', // 11
      '##_____########_######_#######', // 12
      '##_____########_####_______###', // 13
      '##_____########_####_______###', // 14
      '##_____########_####___-___###', // 15
      '##_____########_####_______###', // 16
      '##_____####&###0##&#_______###', // 17
      '###########________#_______###', // 18
      '###########________###########', // 19
      '###########__-___-_###########', // 20
      '###########________###########', // 21
      '###########____<___###########', // 22
      '##############################', // 23
  ],
  enc: { default: 'ruins1', zones: [{ x: 10, y: 17, w: 10, h: 7, enc: null }] },
  warps: [
    { x: 15, y: 22, to: 'field', tx: 31, ty: 6, dir: 'down' },
    { x: 15, y: 2, to: 'ruins2', tx: 15, ty: 20, dir: 'up' },
  ],
  tileFlags: [
    { flag: 'seal_opened', x: 15, y: 17, tile: '_' },
    { flag: 'crack_b1', at: [[3, 10], [3, 11]], tile: '_' },
    { flag: 'gate_b1', x: 15, y: 5, tile: '_' },
  ],
  onEnter: async () => {
    if (!Game.flag('ruins_first')) {
      Game.setFlag('ruins_first');
      await S.say(null, '(차가운 공기가 흘러나온다. 벽에 새겨진 별 문양들이 희미하게 빛난다.)');
      await Story.line('bran', '으, 으스스하네… 유령 같은 건 없겠지? 그렇지?');
      await Story.line('linette', '아스트라 시대의 유적이야. 300년 전… 아니, 그보다 훨씬 오래됐어.');
    }
  },
  objects: [
    { type: 'event', x: 15, y: 17, solid: true, show: () => !Game.flag('seal_opened'), run: () => Story.sealDoor() },
    {
      type: 'event', x: 15, y: 5, solid: true, show: () => !Game.flag('gate_b1'),
      run: async () => {
        if (Game.count('rusty_key') > 0) {
          await S.say(null, '녹슨 열쇠를 자물쇠에 꽂아 돌렸다… 끼이익─');
          Game.removeItem('rusty_key');
          Game.setFlag('gate_b1');
          Sound.sfx('door'); Field.refreshTiles();
          await S.say(null, '철창이 열렸다! 안쪽에 아래로 내려가는 계단이 보인다.');
        } else await S.say(null, '철창이 굳게 잠겨 있다. 녹슨 자물쇠가 달려 있다. 어딘가에 열쇠가 있을 것 같다.');
      },
    },
    {
      type: 'event', x: 3, y: 10, solid: true, show: () => !Game.flag('crack_b1'),
      run: async () => {
        await S.say(null, '벽에 커다랗게 금이 가 있다. 틈새로 바람이 새어 나온다.');
        await Story.line('nell', '여기 벽 너머에 공간이 있어. 냄새로 알아. 보물 냄새.');
        if (await S.yesno(null, '힘껏 밀어 볼까?')) {
          Sound.sfx('impact'); Engine.shake(6, 0.5);
          Game.setFlag('crack_b1'); Field.refreshTiles();
          await S.say(null, '와르르! 벽이 무너지고 숨겨진 통로가 나타났다!');
          await Story.line('bran', '…방금 그거, 내가 민 걸로 해 줘.');
        }
      },
    },
    {
      type: 'note', id: 'note_a', x: 16, y: 8, item: 'note_a',
      text: '바닥에 쪽지가 떨어져 있다.\n「종은 열쇠를 부르고, 열쇠는 문을 연다. 서쪽 벽은 오래되어 무너지기 쉬우니 주의할 것. ─ A.」',
      after: async () => {
        if (!Game.flag('note_seen')) {
          Game.setFlag('note_seen');
          await Story.line('linette', '이 필체… 어디서 본 것 같은데. 단정하고, 끝을 살짝 말아 올리는…');
          await Story.line('mio', '「열쇠」라는 건… {H} 님의 그 문양 말일까요?');
        }
      },
    },
    { type: 'chest', id: 'r1_key', x: 3, y: 3, item: 'rusty_key' },
    { type: 'chest', id: 'r1_w2', x: 7, y: 6, item: 'potion', n: 2 },
    { type: 'chest', id: 'r1_e1', x: 26, y: 3, item: 'ether' },
    { type: 'chest', id: 'r1_e2', x: 23, y: 6, gold: 150 },
    { type: 'chest', id: 'r1_secret1', x: 3, y: 14, item: 'shadow_cloak' },
    { type: 'chest', id: 'r1_secret2', x: 5, y: 16, item: 'star' },
    { type: 'chest', id: 'r1_se1', x: 21, y: 14, item: 'feather' },
    { type: 'chest', id: 'r1_mimic', x: 25, y: 17, item: 'sage_earring', color: 'red', mimic: true },
  ],
});

defMap('ruins2', {
  name: '잠든 종의 유적 B2', kind: 'dungeon', bgm: 'dungeon', base: '_',
  tiles: [
      '##############################', // 0
      '##############################', // 1
      '###&####&#####>>#####&####&###', // 2
      '###______#####__#####______###', // 3
      '###______#####__#####______###', // 4
      '###______##&##__##&##______###', // 5
      '###______##________##______###', // 6
      '###______##____*___##______###', // 7
      '#####_#####________#####_#####', // 8
      '##&##_#####________#####_##&##', // 9
      '##_____####________####_____##', // 10
      '##_____#######||#######_____##', // 11
      '##_______________________-__##', // 12
      '##______-___________-_______##', // 13
      '##__________________________##', // 14
      '##__-__#######__#######_____##', // 15
      '##_____#######__#######_____##', // 16
      '##_____#####&#__#&#####_____##', // 17
      '#####_######______######_#####', // 18
      '##_______###______###_______##', // 19
      '##____-__###______###_______##', // 20
      '##_______###___<__###_______##', // 21
      '############______############', // 22
      '##############################', // 23
  ],
  enc: { default: 'ruins2', zones: [{ x: 11, y: 1, w: 8, h: 10, enc: null }, { x: 12, y: 18, w: 6, h: 5, enc: null }] },
  warps: [
    { x: 15, y: 21, to: 'ruins1', tx: 15, ty: 3, dir: 'down' },
    { x: 14, y: 2, to: 'bell', tx: 9, ty: 12, dir: 'up' },
    { x: 15, y: 2, to: 'bell', tx: 9, ty: 12, dir: 'up' },
  ],
  tileFlags: [{ flag: () => Game.flag('lever_w') && Game.flag('lever_e'), at: [[14, 11], [15, 11]], tile: '_' }],
  onEnter: async () => {
    if (!Game.flag('ruins2_first')) {
      Game.setFlag('ruins2_first');
      await Story.line('mio', '노래가 가까워졌어요… 이 아래예요. 저 철창 너머에서 들려와요.');
      await Story.line('linette', '철창은 기계식이야. 어딘가에 여는 장치가 있을 거야. 아마… 양쪽에.');
    }
  },
  objects: [
    {
      type: 'lever', x: 5, y: 3, flag: 'lever_w',
      after: async () => { await Levers.check(); },
    },
    {
      type: 'lever', x: 24, y: 3, flag: 'lever_e',
      after: async () => { await Levers.check(); },
    },
    { type: 'event', x: 15, y: 7, solid: true, run: () => S.savePoint('수정이 따뜻한 빛을 내뿜는다… 일행의 HP와 MP가 모두 회복되었다!') },
    { type: 'event', x: 14, y: 11, solid: true, show: () => !(Game.flag('lever_w') && Game.flag('lever_e')), run: async () => { await S.say(null, '두꺼운 철창이 길을 막고 있다. 손으로는 꿈쩍도 하지 않는다.\n(어딘가에 여는 장치가 있을 것 같다.)'); } },
    { type: 'event', x: 15, y: 11, solid: true, show: () => !(Game.flag('lever_w') && Game.flag('lever_e')), run: async () => { await S.say(null, '두꺼운 철창이 길을 막고 있다. 손으로는 꿈쩍도 하지 않는다.\n(서쪽과 동쪽, 어딘가에 여는 장치가 있을 것 같다.)'); } },
    { type: 'chest', id: 'r2_sw', x: 3, y: 20, item: 'blessed_staff' },
    { type: 'chest', id: 'r2_se', x: 26, y: 20, item: 'star' },
    { type: 'chest', id: 'r2_w', x: 3, y: 16, item: 'venom_dagger' },
    { type: 'chest', id: 'r2_e', x: 26, y: 16, item: 'ether' },
    { type: 'chest', id: 'r2_nw', x: 8, y: 6, item: 'potion', n: 2 },
    { type: 'chest', id: 'r2_ne', x: 21, y: 6, item: 'panacea', n: 2 },
    { type: 'chest', id: 'r2_hall', x: 22, y: 20, gold: 200 },
  ],
});

const Levers = {
  async check() {
    const w = Game.flag('lever_w'), e = Game.flag('lever_e');
    Field.refreshTiles();
    if (w && e) {
      Sound.sfx('impact'); Engine.shake(4, 0.6);
      await S.say(null, '[y]쿠구궁…! 멀리서 무거운 철창이 올라가는 소리가 울려 퍼졌다![/]');
    } else if (w || e) await S.say(null, '…아직 무언가 부족한 것 같다. 반대편에도 장치가 있지 않을까?');
  },
};

defMap('bell', {
  name: '종의 방', kind: 'dungeon', bgm: () => (Game.flag('velgar_defeated') ? 'shrine' : 'dungeon'), base: '_',
  tiles: [
      '##################', // 0
      '########OO########', // 1
      '###&###OOOO###&###', // 2
      '###____cccc____###', // 3
      '###____cccc____###', // 4
      '###_P__cccc__P_###', // 5
      '###____cccc____###', // 6
      '###____cccc____###', // 7
      '##&____cccc____&##', // 8
      '###____cccc____###', // 9
      '###_P__cccc__P_###', // 10
      '###____cccc____###', // 11
      '###____cccc____###', // 12
      '###____cc<c____###', // 13
      '##################', // 14
  ],
  warps: [{ x: 9, y: 13, to: 'ruins2', tx: 15, ty: 3, dir: 'down' }],
  triggers: [{ x: 3, y: 3, w: 12, h: 7, when: () => !Game.flag('velgar_defeated'), run: () => Story.velgar() }],
  npcs: [
    { id: 'velgar', x: 9, y: 5, look: 'monster:velgar', scale: 0.42, dir: 'down', noTurn: true, show: () => !Game.flag('velgar_defeated'), talk: () => Story.velgar() },
    { id: 'osric_bell', x: 9, y: 13, look: 'osric', dir: 'up', show: () => false },
  ],
  objects: [
    { type: 'deco', x: 9, y: 2, draw: 'bell' },
    {
      type: 'event', x: 12, y: 12, art: 'circle', show: () => Game.flag('velgar_defeated'),
      run: async () => { if (await S.yesno(null, '벨가르가 남긴 귀환의 마법진이 빛나고 있다. 리벨 마을로 돌아갈까?')) await S.warp('rivel', 19, 27, 'up', { sfx: 'chime', slow: true }); },
    },
  ],
});

defMap('cellar', {
  name: '우물 아래 동굴', kind: 'dungeon', bgm: 'cave', base: 'y',
  tiles: [
      '######################', // 0
      '#<yyy####yyyyyyyy#####', // 1
      '#yyyyy###yyyyyyyyy####', // 2
      '#yyyyyyyyyyy###yyyyy##', // 3
      '##yyyy~~yyyy###yyyyy##', // 4
      '##yyy~~~~yyyyyyyyyy###', // 5
      '###yyy~~yyyy####yyy###', // 6
      '###yyyyyyyy#####yyyy##', // 7
      '####yyyyy#######yyyyy#', // 8
      '#####yyyy######yyyyyy#', // 9
      '#####yyyyyyyyyyyyyyyy#', // 10
      '######yyyyyyyyyyyyyy##', // 11
      '#######yyyyy##########', // 12
      '######################', // 13
  ],
  enc: { default: 'cellar', zones: [{ x: 0, y: 0, w: 6, h: 4, enc: null }] },
  warps: [{ x: 1, y: 1, to: 'rivel', tx: 19, ty: 15, dir: 'down', sfx: 'stairs' }],
  npcs: [
    { id: 'mush', x: 18, y: 8, look: 'critter:mushroom', dir: 'left', move: 'turn', talk: () => Story.mush() },
  ],
  objects: [
    { type: 'chest', id: 'ce_1', x: 16, y: 1, item: 'ether' },
    { type: 'chest', id: 'ce_2', x: 7, y: 11, item: 'herb', n: 3 },
    { type: 'search', id: 'ce_spot', x: 3, y: 7, gold: 40, hidden: true, msg: '바닥에 동전이 몇 닢 떨어져 있다. 우물에 소원을 빌며 던진 동전일까?' },
  ],
});
