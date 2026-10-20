'use strict';
// ─────────────────────────────────────────────────────────────
// Shop: 상점 (구매/판매, 장비 비교, 수량 선택)
// ─────────────────────────────────────────────────────────────
const SHOPS = {
  smithy: {
    name: '「망치와 모루」', keeper: '드른',
    stock: ['club', 'hunting_knife', 'copper_sword', 'oak_staff', 'clothes', 'leather_armor', 'mage_robe', 'wood_shield', 'leather_shield', 'leather_hat', 'wizard_hat'],
    extra: [{ when: () => Game.flag('ironfang_defeated'), items: ['iron_axe', 'steel_sword', 'spellbook', 'chain_mail', 'thief_garb', 'iron_shield', 'iron_helm'] }],
    bye: '또 와라. 무기는 손질도 중요하다.',
  },
  itemshop: {
    name: '「초록 바구니」', keeper: '엘라 할머니',
    stock: ['herb', 'antidote', 'smelling', 'return_wing', 'incense', 'firebomb'],
    extra: [
      { when: () => Game.flag('potion_stock'), items: ['potion'] },
      { when: () => Game.flag('ironfang_defeated'), items: ['panacea', 'feather', 'antidote_bangle'] },
      { when: () => Game.flag('chapter1_done'), items: ['ether'] },
    ],
    bye: '몸조심하렴. 약은 아끼지 말고 쓰고.',
  },
  waystation: {
    name: '역참 매점', keeper: '역참 상인',
    stock: ['herb', 'potion', 'antidote', 'smelling', 'panacea', 'feather', 'return_wing', 'incense', 'ether'],
    bye: '살펴 가시오! 가도엔 늑대가 많으니까.',
  },
  cap_smithy: {
    name: '「강철 사자」', keeper: '레온',
    stock: ['steel_sword', 'iron_axe', 'chain_mail', 'iron_shield', 'iron_helm', 'mythril_sword', 'war_axe', 'silver_dagger', 'rune_staff', 'mythril_mail', 'mystic_robe', 'night_garb', 'buckler', 'knight_shield', 'silver_helm', 'feather_hat'],
    bye: '무기를 아껴 써라. 그게 대장장이에 대한 예의다.',
  },
  cap_shop: {
    name: '약방 「백합」', keeper: '릴리',
    stock: ['herb', 'potion', 'hi_potion', 'ether', 'antidote', 'smelling', 'panacea', 'feather', 'thunder_flask', 'firebomb', 'return_wing', 'incense', 'antidote_bangle'],
    bye: '다치지 마세요! 다쳤으면 또 오시고요.',
  },
  bazaar_arms: {
    name: '바자르 「휘어진 칼」', keeper: '오마르',
    stock: ['flame_saber', 'sand_axe', 'scorpion_dagger', 'sun_staff', 'desert_mail', 'mirage_robe', 'sand_garb', 'sun_shield', 'turban', 'desert_helm', 'mythril_sword', 'war_axe', 'rune_staff', 'mythril_mail', 'knight_shield', 'silver_helm'],
    bye: '칼날에 모래가 끼지 않게 잘 닦아 두게.',
  },
  marea_arms: {
    name: '「닻과 그물」 무기 진열대', keeper: '비욘',
    stock: ['frost_brand', 'tide_axe', 'coral_dagger', 'pearl_staff', 'siren_harp', 'silver_harp', 'whale_mail', 'seafoam_robe', 'sealskin_coat', 'coral_shield', 'fur_hood', 'captain_hat'],
    bye: '손 얼지 않게 조심해라.',
  },
  marea_items: {
    name: '「닻과 그물」 잡화', keeper: '잉가',
    stock: ['hi_potion', 'mega_potion', 'ether', 'hi_ether', 'warm_soup', 'antidote', 'smelling', 'panacea', 'feather', 'sand_bomb', 'return_wing', 'incense', 'warm_charm'],
    extra: [{ when: () => Game.flag('cassandra_joined'), items: ['elixir', 'pearl_ring'] }],
    bye: '따뜻하게 입고 다녀요!',
  },
  bazaar_items: {
    name: '바자르 「모래 별 상회」', keeper: '알리',
    stock: ['potion', 'hi_potion', 'mega_potion', 'ether', 'hi_ether', 'antidote', 'smelling', 'panacea', 'feather', 'sand_bomb', 'return_wing', 'incense'],
    extra: [{ when: () => Game.flag('raiders_beaten'), items: ['oasis_ring'] }],
    bye: '사막에선 물과 약이 곧 목숨이에요. 넉넉히 챙겨 가세요!',
  },
};

const Shop = (() => {
  function stock(shop) {
    const list = shop.stock.slice();
    for (const ex of shop.extra || []) if (ex.when()) for (const it of ex.items) if (!list.includes(it)) list.push(it);
    return list;
  }

  // 장비 비교 패널
  function comparePanel(getItem) {
    return {
      modal: false,
      draw(ctx) {
        UI.drawWindow(ctx, 392, 62, 236, 270);
        const id = getItem();
        if (!id) return;
        const it = ITEMS[id];
        Text.draw(ctx, it.name, 408, 74, { size: 17, bold: true, color: Theme.gold, maxW: 205 });
        Text.draw(ctx, `소지: ${Game.count(id)}  (장비 중 ${Game.ownedTotal(id) - Game.count(id)})`, 408, 98, { size: 13, color: Theme.dim });
        if (!EQUIP_SLOTS.includes(it.kind)) {
          const lines = Text.layout(ctx, it.desc, 200, 14);
          Text.drawLines(ctx, lines, 408, 124, 20, 14);
          return;
        }
        const ids = Game.state.party.concat(Game.state.reserve);
        ids.forEach((mid, i) => {
          const y = 124 + i * 40;
          Menu.charIcon(ctx, mid, 404, y - 6, 1.5);
          Text.draw(ctx, Game.name(mid), 434, y, { size: 14, color: CHARACTERS[mid].color });
          const r = Game.equipDiff(mid, id);
          if (r.state === 'cant') { Text.draw(ctx, '장비 불가', 612, y + 2, { size: 13, align: 'right', color: Theme.disabled }); return; }
          if (r.state === 'equipped') { Text.draw(ctx, '장비 중', 612, y + 2, { size: 13, align: 'right', color: Theme.gold }); return; }
          const txt = Game.equipDiffText(mid, id);
          Text.draw(ctx, txt, 612, y + 18, { size: 13, align: 'right' });
        });
      },
    };
  }

  const goldPanel = {
    modal: false,
    draw(ctx) {
      UI.drawWindow(ctx, 392, 12, 236, 44);
      Text.draw(ctx, `소지금 [y]${Game.gold}G[/]`, 610, 24, { size: 18, align: 'right', bold: true });
    },
  };

  async function buy(shop) {
    let hover = null;
    const panel = comparePanel(() => hover);
    Engine.push(panel);
    const build = () => stock(shop).map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].price + 'G', value: id, desc: ITEMS[id].desc, disabled: ITEMS[id].price > Game.gold, rightColor: ITEMS[id].price > Game.gold ? Theme.disabled : Theme.gold }));
    const lw = new UI.ListWindow({ x: 12, y: 62, w: 372, items: build(), maxRows: 9, rowH: 30, title: '무엇을 살까?', cancel: true, help: { x: 12, y: 398, w: 616, h: 70 }, onHover: (it) => { hover = it ? it.value : null; }, onDisabled: () => {} });
    hover = lw.items[0] ? lw.items[0].value : null;
    Engine.push(lw);
    try {
      for (;;) {
        lw.setItems(build());
        const r = await lw.choose();
        if (!r) break;
        const id = r.value, it = ITEMS[id];
        const isEquip = EQUIP_SLOTS.includes(it.kind);
        const maxByGold = Math.floor(Game.gold / it.price);
        const maxByBag = 99 - Game.count(id);
        const max = Math.min(maxByGold, maxByBag, isEquip ? 9 : 99);
        if (max <= 0) { Sound.sfx('buzzer'); await UI.message(maxByBag <= 0 ? '더 이상 가질 수 없다.' : '돈이 모자라다.'); continue; }
        let n = 1;
        if (!isEquip && max > 1) { n = await UI.number({ title: `${it.name} — 몇 개 살까?`, min: 1, max, unit: it.price, x: 340, y: 180 }); if (!n) continue; }
        const total = n * it.price;
        if (!Game.spend(total)) { Sound.sfx('buzzer'); await UI.message('돈이 모자라다.'); continue; }
        Game.addItem(id, n);
        Sound.sfx('coin');
        await S.say(shop.keeper, `${it.name}${n > 1 ? ` ${n}개` : ''}, ${total}G. 고맙다!`);
        if (isEquip) {
          const can = Game.state.party.concat(Game.state.reserve).filter((mid) => Game.canEquip(mid, id));
          if (can.length && (await Menu.confirm('지금 장비할까?'))) {
            const who = can.length === 1 ? can[0] : await Menu.pickMember({ title: `${it.name} — 누가 장비할까?`, filter: (mid) => Game.canEquip(mid, id), right: (mid) => Game.equipDiffText(mid, id) });
            if (who) {
              const old = Game.state.members[who].equip[it.kind];
              Game.equip(who, it.kind, id);
              Sound.sfx('confirm');
              let t = `${Game.name(who)}${Util.josa(Game.name(who), '은')} ${it.name}${Util.josa(it.name, '을')} 장비했다!`;
              if (old && ITEMS[old].price > 0 && (await Menu.confirm(t + `\n원래 쓰던 ${ITEMS[old].name}${Util.josa(ITEMS[old].name, '은')} 팔까? (${Math.floor(ITEMS[old].price / 2)}G)`))) {
                Game.removeItem(old); Game.addGold(Math.floor(ITEMS[old].price / 2)); Sound.sfx('coin');
              } else if (!old || ITEMS[old].price <= 0) await UI.message(t);
            }
          }
        }
      }
    } finally {
      lw.close();
      Engine.remove(panel);
    }
  }

  async function sell(shop) {
    let hover = null;
    const panel = comparePanel(() => hover);
    Engine.push(panel);
    const build = () => Game.itemList((it) => it.kind !== 'key').map((id) => {
      const p = Math.floor(ITEMS[id].price / 2);
      return { label: `${ITEMS[id].name} ×${Game.count(id)}`, right: p > 0 ? p + 'G' : '팔 수 없음', value: id, disabled: p <= 0, desc: ITEMS[id].desc };
    });
    const lw = new UI.ListWindow({ x: 12, y: 62, w: 372, items: build(), maxRows: 9, rowH: 30, title: '무엇을 팔까? (장비 중인 것은 팔 수 없다)', cancel: true, empty: '팔 물건이 없다', help: { x: 12, y: 398, w: 616, h: 70 }, onHover: (it) => { hover = it ? it.value : null; }, onDisabled: () => {} });
    hover = lw.items[0] ? lw.items[0].value : null;
    Engine.push(lw);
    try {
      for (;;) {
        lw.setItems(build());
        const r = await lw.choose();
        if (!r) break;
        const id = r.value, it = ITEMS[id];
        const price = Math.floor(it.price / 2);
        const have = Game.count(id);
        let n = 1;
        if (have > 1) { n = await UI.number({ title: `${it.name} — 몇 개 팔까?`, min: 1, max: have, unit: price, x: 340, y: 180 }); if (!n) continue; }
        if (!(await Menu.confirm(`${it.name}${n > 1 ? ` ${n}개` : ''}${Util.josa(it.name, '을')} ${price * n}G에 팔까?`))) continue;
        if (Game.removeItem(id, n)) { Game.addGold(price * n); Sound.sfx('coin'); }
      }
    } finally {
      lw.close();
      Engine.remove(panel);
    }
  }

  async function open(shopId) {
    const shop = SHOPS[shopId];
    Engine.push(goldPanel);
    try {
      for (;;) {
        const r = await UI.list({ x: 12, y: 12, w: 220, items: [{ label: '산다', value: 'buy' }, { label: '판다', value: 'sell' }, { label: '나간다', value: 'exit' }], title: shop.name, rowH: 34, cancel: true });
        if (!r || r.value === 'exit') break;
        if (r.value === 'buy') await buy(shop);
        else await sell(shop);
      }
    } finally {
      Engine.remove(goldPanel);
    }
    await S.say(shop.keeper, shop.bye);
  }

  return { open, stock };
})();
