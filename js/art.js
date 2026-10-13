/*
 * 程式繪製的插圖（暫代美術）
 * 之後換成繪師的正式圖時，只要讓 MD.art.char() 回傳 <img> 即可，
 * 其他程式不用動。
 */
window.MD = window.MD || {};

(function () {
  // 圓臉剪影風：圓圓的臉、小點眼、簡單的髮型，身體是圓角色塊。在深色底上配暖色衣服。
  const INK = '#2a2420';
  const SKIN = '#f2d7c3';
  const BLUSH = '#e8a48c';

  const CHAR = {
    mom: { hair: '#3a2a24', shirt: '#e07a5f', accent: '#f3ece2' },
    kid: { hair: '#2a2420', shirt: '#8fc1a9', accent: '#f3ece2' },
    dad: { hair: '#2a2622', shirt: '#7c95b8', accent: '#f3ece2' },
  };

  // 孩子的衣服依成長階段變化：薄荷綠 → 霧藍 → 暖黃 → 國中白襯衫配深藍領帶
  const KID_LOOK = { low: '#8fc1a9', mid: '#8eaad0', high: '#e8b45c', jh: '#eeeae2' };
  function kidLook() {
    const st = (MD.stage && MD.state) ? MD.stage() : 'low';
    return Object.assign({}, CHAR.kid, { shirt: KID_LOOK[st], uniform: st === 'jh', stage: st });
  }

  const EXPR = {
    normal:    { eyes: 'dot',   mouth: 'smile' },
    happy:     { eyes: 'arc',   mouth: 'open' },
    smile:     { eyes: 'arc',   mouth: 'smile' },
    sad:       { eyes: 'dot',   mouth: 'frown', brows: 'sad' },
    cry:       { eyes: 'arc',   mouth: 'wave',  brows: 'sad', extra: 'tears' },
    surprised: { eyes: 'big',   mouth: 'o',     brows: 'up' },
    think:     { eyes: 'side',  mouth: 'flat',  extra: 'sweat' },
    angry:     { eyes: 'dot',   mouth: 'frown', brows: 'angry', extra: 'vein' },
    smug:      { eyes: 'half',  mouth: 'smirk' },
    hurt:      { eyes: 'x',     mouth: 'wave',  extra: 'stars' },
    sparkle:   { eyes: 'star',  mouth: 'open',  brows: 'up' },
    sleepy:    { eyes: 'line',  mouth: 'o',     extra: 'zzz' },
    shy:       { eyes: 'arc',   mouth: 'smile', extra: 'bigblush' },
  };

  const EY = 64, EL = 49, ER = 71, MY = 75;
  function eyes(type) {
    const pair = f => f(EL) + f(ER);
    const s = `stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"`;
    switch (type) {
      case 'arc':  return pair(x => `<path d="M${x - 4.5} ${EY + 1} q4.5 -5 9 0" ${s}/>`);
      case 'big':  return pair(x => `<circle cx="${x}" cy="${EY}" r="3.8" fill="${INK}"/><circle cx="${x + 1.2}" cy="${EY - 1.2}" r="1.2" fill="#fff"/>`);
      case 'side': return pair(x => `<circle cx="${x + 2}" cy="${EY}" r="2.8" fill="${INK}"/>`);
      case 'half': return pair(x => `<path d="M${x - 4.5} ${EY} h9" ${s}/><path d="M${x - 3.5} ${EY} q3.5 3.4 7 0" fill="${INK}"/>`);
      case 'x':    return pair(x => `<path d="M${x - 3.5} ${EY - 3.5} l7 7 M${x + 3.5} ${EY - 3.5} l-7 7" ${s}/>`);
      case 'line': return pair(x => `<path d="M${x - 4.5} ${EY + 1} q4.5 2.6 9 0" ${s}/>`);
      case 'star': return pair(x => `<circle cx="${x}" cy="${EY}" r="3.4" fill="${INK}"/><circle cx="${x + 1.1}" cy="${EY - 1.2}" r="1.2" fill="#fff"/><circle cx="${x - 1}" cy="${EY + 1.1}" r=".6" fill="#fff"/>`);
      default:     return pair(x => `<circle cx="${x}" cy="${EY}" r="2.9" fill="${INK}"/>`);
    }
  }
  function mouth(type) {
    const s = `stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"`;
    switch (type) {
      case 'open':  return `<path d="M54 ${MY - 1} q6 8 12 0 z" fill="#b8574a" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      case 'frown': return `<path d="M55 ${MY + 2} q5 -4 10 0" ${s}/>`;
      case 'wave':  return `<path d="M53 ${MY} q1.75 -2.2 3.5 0 t3.5 0 t3.5 0 t3.5 0" ${s}/>`;
      case 'o':     return `<ellipse cx="60" cy="${MY}" rx="3" ry="3.6" fill="#b8574a" stroke="${INK}" stroke-width="1.6"/>`;
      case 'flat':  return `<path d="M56 ${MY} h8" ${s}/>`;
      case 'smirk': return `<path d="M55 ${MY} q5.5 3.2 10 -2" ${s}/>`;
      default:      return `<path d="M55 ${MY - .5} q5 4 10 0" ${s}/>`;
    }
  }
  function brows(type) {
    const s = `stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"`;
    if (type === 'sad') return `<path d="M44 55 l9 -2 M76 55 l-9 -2" ${s}/>`;
    if (type === 'angry') return `<path d="M44 52 l9 3 M76 52 l-9 3" ${s}/>`;
    if (type === 'up') return `<path d="M44.5 54 q4.5 -3 9 -.8 M75.5 54 q-4.5 -3 -9 -.8" ${s}/>`;
    return '';
  }
  function extra(type) {
    switch (type) {
      case 'tears': return `<path d="M46 70 q-2.5 6 0 8.5 q2.5 -2.5 0 -8.5z M74 70 q-2.5 6 0 8.5 q2.5 -2.5 0 -8.5z" fill="#8fc1e0"/>`;
      case 'sweat': return `<path d="M88 44 q-4 6 0 8.5 q4 -2.5 0 -8.5z" fill="#a9c9dc"/>`;
      case 'vein':  return `<path d="M84 36 l4 4 m0 -4 l-4 4" stroke="#e07a5f" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'stars': return `<text x="20" y="32" font-size="13" fill="#e8b45c">✦</text><text x="92" y="28" font-size="10" fill="#e8b45c">✦</text>`;
      case 'zzz':   return `<text x="86" y="34" font-size="13" fill="#e8b45c" font-style="italic">z z</text>`;
      case 'bigblush': return `<ellipse cx="44" cy="71" rx="6.5" ry="3.4" fill="${BLUSH}" opacity=".7"/><ellipse cx="76" cy="71" rx="6.5" ry="3.4" fill="${BLUSH}" opacity=".7"/>`;
      default: return '';
    }
  }
  function hair(who, c) {
    // 媽媽：圓臉加上兩側到下巴的短髮
    if (who === 'mom') return `
      <path d="M28 62 a32 32 0 0 1 64 0 q-9 -14 -32 -14 q-23 0 -32 14z" fill="${c.hair}"/>
      <path d="M28 58 q-4 26 6 34 l9 -24z M92 58 q4 26 -6 34 l-9 -24z" fill="${c.hair}"/>
      <path d="M40 44 q14 -8 30 -3 q-10 4 -30 3z" fill="${c.hair}"/>`;
    if (who === 'kid') return `
      <path d="M29 62 a31 31 0 0 1 62 0 q-6 -11 -14 -12 q-6 6 -17 4 q-11 -3 -17 2 q-9 1 -14 6z" fill="${c.hair}"/>
      <path d="M58 30 q3 -7 10 -6 q-6 2 -6 7z" fill="${c.hair}"/>`;
    if (who === 'dad') return `
      <path d="M29 60 a31 31 0 0 1 62 0 q-8 -12 -31 -12 q-23 0 -31 12z" fill="${c.hair}"/>
      <circle cx="49" cy="64" r="7.5" fill="none" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="71" cy="64" r="7.5" fill="none" stroke="${INK}" stroke-width="1.8"/>
      <path d="M56.5 63.5 h7" stroke="${INK}" stroke-width="1.8"/>`;
    return '';
  }
  function body(who, c) {
    if (who === 'mom') return `<rect x="30" y="92" width="60" height="80" rx="28" fill="${c.shirt}"/><path d="M52 95 q8 8 16 0" stroke="${c.accent}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>`;
    if (who === 'dad') return `<rect x="26" y="90" width="68" height="82" rx="30" fill="${c.shirt}"/><path d="M51 93 l9 8 l9 -8" stroke="${c.accent}" stroke-width="2.6" fill="none" stroke-linejoin="round" opacity=".6"/>`;
    const deco = c.uniform
      ? `<path d="M52 98 l8 7 l8 -7" stroke="#cfc8bb" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M58.5 105 h3 l1.4 22 -2.9 3 -2.9 -3z" fill="#2a3343"/>`
      : `<path d="M53 97 q7 6 14 0" stroke="${c.accent}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".5"/>`;
    return `<rect x="36" y="94" width="48" height="78" rx="24" fill="${c.shirt}"/>${deco}`;
  }

  MD.art = {
    char(who, expr) {
      const c = who === 'kid' ? kidLook() : (CHAR[who] || CHAR.kid);
      const e = EXPR[expr] || EXPR.normal;
      return `<svg viewBox="0 0 120 160" class="char-svg" aria-hidden="true">
        ${body(who, c)}
        <circle cx="60" cy="62" r="31" fill="${SKIN}"/>
        <ellipse cx="44" cy="71" rx="5" ry="2.8" fill="${BLUSH}" opacity=".4"/>
        <ellipse cx="76" cy="71" rx="5" ry="2.8" fill="${BLUSH}" opacity=".4"/>
        ${eyes(e.eyes)}
        ${brows(e.brows)}
        ${mouth(e.mouth)}
        ${hair(who, c)}
        ${extra(e.extra)}
        ${who === 'mom' ? `<circle cx="30.5" cy="76" r="1.8" fill="#f3ece2"/>` : ''}
      </svg>`;
    },

    /* 地圖上的地點標誌：圓形徽章＋線條圖示；只有家是房子 */
    badge(id, locked) {
      const A = { mint: '#8fc1a9', amber: '#e8b45c', coral: '#e07a5f', blue: '#8eaad0' };
      const S = (c, w = 2.4) => `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
      const ICON = {
        tennis: [A.mint, `<ellipse cx="21" cy="21" rx="7" ry="9.5" ${S(A.mint)} transform="rotate(-35 21 21)"/><path d="M26 27 l8 8" ${S(A.mint, 3)}/><circle cx="32" cy="15" r="3.4" fill="${A.amber}"/>`],
        cafe: [A.amber, `<path d="M14 20 h16 v7 q0 8 -8 8 q-8 0 -8 -8z" ${S(A.amber)}/><path d="M30 22 q6 0 5 5 q-1 4 -5 3" ${S(A.amber)}/><path d="M19 13 q-2 -3 0 -5 M24 13 q-2 -3 0 -5" ${S(A.amber, 1.8)}/>`],
        market: [A.amber, `<path d="M13 21 h22 l-3 14 h-16z" ${S(A.amber)}/><path d="M18 21 q6 -10 12 0" ${S(A.amber)}/><path d="M19 26 v5 M24 26 v5 M29 26 v5" ${S(A.amber, 1.8)}/>`],
        pool: [A.blue, `<path d="M12 22 q3 -3 6 0 t6 0 t6 0 t6 0 M12 29 q3 -3 6 0 t6 0 t6 0 t6 0" ${S(A.blue)}/><circle cx="20" cy="15" r="3" fill="${A.blue}"/>`],
        library: [A.coral, `<path d="M15 14 v20 M21 14 v20 M28 15 l5 19" ${S(A.coral, 3.2)}/><path d="M12 35 h24" ${S(A.coral, 2)}/>`],
        park: [A.mint, `<circle cx="24" cy="19" r="8" ${S(A.mint)}/><path d="M24 27 v9 M20 36 h8" ${S(A.mint)}/>`],
        bookstore: [A.coral, `<path d="M12 17 q6 -3 12 1 q6 -4 12 -1 v16 q-6 -3 -12 1 q-6 -4 -12 -1z M24 18 v16" ${S(A.coral)}/>`],
        school: [A.amber, `<path d="M13 35 v-12 l11 -7 l11 7 v12z" ${S(A.amber)}/><path d="M21 35 v-7 h6 v7 M24 16 v-6 l5 2 -5 2" ${S(A.amber, 1.8)}/>`],
        art: [A.coral, `<path d="M24 12 q12 0 12 10 q0 5 -5 5 h-3 q-3 0 -3 3 q0 5 -4 5 q-9 0 -9 -11 q0 -12 12 -12z" ${S(A.coral)}/><circle cx="19" cy="20" r="1.8" fill="${A.amber}"/><circle cx="25" cy="17" r="1.8" fill="${A.mint}"/><circle cx="30" cy="21" r="1.8" fill="${A.blue}"/>`],
        cram: [A.blue, `<path d="M15 33 l3 -8 l13 -13 l5 5 l-13 13z M28 15 l5 5" ${S(A.blue)}/>`],
        clinic: [A.mint, `<rect x="13" y="13" width="22" height="22" rx="6" ${S(A.mint)}/><path d="M24 18 v12 M18 24 h12" ${S(A.coral, 3)}/>`],
        grandma: [A.coral, `<path d="M24 10 v3 M24 35 v3" ${S(A.coral, 2)}/><ellipse cx="24" cy="24" rx="9" ry="11" ${S(A.coral)}/><path d="M17 18 h14 M17 30 h14" ${S(A.coral, 1.6)}/>`],
        nightmarket: [A.amber, `<circle cx="24" cy="21" r="10" ${S(A.amber)}/><path d="M24 11 v20 M14 21 h20 M17 14 l14 14 M31 14 l-14 14" ${S(A.amber, 1.4)}/><path d="M19 37 l5 -6 l5 6" ${S(A.amber)}/>`],
        beach: [A.coral, `<path d="M12 22 q12 -14 24 0z" ${S(A.coral)}/><path d="M24 22 v12" ${S(A.coral)}/><path d="M12 36 q3 -3 6 0 t6 0 t6 0 t6 0" ${S(A.blue, 2)}/>`],
      };
      if (id === 'home') return `<svg viewBox="0 0 48 48" class="badge-svg home"><rect x="3" y="3" width="42" height="42" rx="13" fill="${A.amber}"/><path d="M13 25 l11 -10 l11 10 v11 h-22z" fill="#1f2633"/><rect x="21" y="28" width="6" height="8" rx="1" fill="${A.amber}"/></svg>`;
      const [col, icon] = ICON[id] || [A.mint, ''];
      return `<svg viewBox="0 0 48 48" class="badge-svg ${locked ? 'locked' : ''}"><circle cx="24" cy="24" r="21.5" fill="#1f2633" stroke="${col}" stroke-width="2.2"/>${icon}</svg>`;
    },

    ball(size = 44) {
      return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="20" r="17" fill="#e4f06b" stroke="#b9c24c" stroke-width="2"/><path d="M6 12 q14 8 0 18 M34 10 q-14 10 0 20" stroke="#fff" stroke-width="2.4" fill="none"/></svg>`;
    },

    cup() {
      return `<svg viewBox="0 0 80 70" class="cup-svg"><path d="M22 10 q-4 -6 0 -10 M36 10 q-4 -6 0 -10 M50 10 q-4 -6 0 -10" stroke="#c9b3a6" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M10 18 h52 v22 q0 22 -26 22 q-26 0 -26 -22z" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-opacity=".4"/><path d="M62 24 q14 0 12 12 q-2 10 -14 8" stroke="${INK}" stroke-opacity=".4" stroke-width="2.4" fill="none"/><ellipse cx="36" cy="20" rx="24" ry="4" fill="#c99a78"/><path d="M30 19 q6 -5 12 0 q-6 4 -12 0z" fill="#fff" opacity=".8"/></svg>`;
    },

    car() {
      return `<svg viewBox="0 0 200 110" class="car-svg"><ellipse cx="100" cy="102" rx="84" ry="6" fill="#000" opacity=".08"/><path d="M20 78 q0 -24 26 -28 l24 -26 q6 -6 16 -6 h40 q10 0 16 8 l18 24 q26 4 26 28 v6 q0 6 -6 6 h-154 q-6 0 -6 -6z" fill="#f7b9c4" stroke="${INK}" stroke-opacity=".3" stroke-width="2.4"/><path d="M76 28 h22 v22 h-40z M106 28 h22 l14 22 h-36z" fill="#dff1fb" stroke="${INK}" stroke-opacity=".25" stroke-width="2"/><circle cx="58" cy="88" r="14" fill="#6e5d5a"/><circle cx="58" cy="88" r="6" fill="#efe7e2"/><circle cx="146" cy="88" r="14" fill="#6e5d5a"/><circle cx="146" cy="88" r="6" fill="#efe7e2"/><circle cx="176" cy="66" r="5" fill="#fff6c9"/><path d="M96 62 h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/><text x="34" y="74" font-size="12">🎀</text></svg>`;
    },

    weapon(kind) {
      if (kind === 'pillow') return `<svg viewBox="0 0 60 44" width="1em" height="1em" style="width:1.2em;height:1em"><path d="M6 8 q24 -8 48 0 q6 14 0 28 q-24 8 -48 0 q-6 -14 0 -28z" fill="#fbd3dc" stroke="#e79aab" stroke-width="2.5"/><circle cx="30" cy="22" r="3" fill="#e79aab"/></svg>`;
      return { slipper: '🩴', glare: '👁️' }[kind] || '💥';
    },

    /* 地圖上的建築 */
    building(p, locked) {
      const wall = p.color;
      const roof = p.roof;
      return `<svg viewBox="0 0 80 70" class="bld-svg">
        <ellipse cx="40" cy="67" rx="32" ry="3" fill="#3a322d" opacity=".08"/>
        <rect x="12" y="30" width="56" height="36" rx="2" fill="${wall}" stroke="${INK}" stroke-opacity=".45" stroke-width="1.2"/>
        <path d="M8 32 L40 10 L72 32 Z" fill="${roof}" stroke="${INK}" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round"/>
        <rect x="34" y="46" width="12" height="20" rx="1" fill="#fbf8f2" stroke="${INK}" stroke-opacity=".35" stroke-width="1"/>
        <rect x="18" y="40" width="10" height="9" rx="1" fill="#fbf8f2" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>
        <rect x="52" y="40" width="10" height="9" rx="1" fill="#fbf8f2" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>
      </svg>`;
    },

    /* Ethan 的蠟筆畫：每個主題一種場景，再隨機變化天空、位置、文字，每張都不一樣 */
    drawing(theme, seed = 1, dish) {
      let r = (seed % 233280) + 1;
      const rnd = (a, b) => { r = (r * 9301 + 49297) % 233280; return a + (r / 233280) * (b - a); };
      const pk = arr => arr[Math.floor(rnd(0, arr.length))];
      const j = (n = 3) => rnd(-n, n).toFixed(1);
      const INK = '#5a4440';
      const crayon = (d, c, w = 3) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const paper = pk(['#fffef6', '#fff6fb', '#f5fbff', '#fffbe8', '#f8fff4']);
      const ground = pk(['#8fcf8f', '#a5d99a', '#c9a27a', '#9ad1c4']);

      // 火柴人：x 位置、身高、頭髮色、衣服色、手的姿勢、手上拿的東西
      const person = (x, h, hair, shirt, pose = 'down', item = '') => {
        const top = 100 - h, hr = h * .2, neck = top + hr;
        const arms = pose === 'up'
          ? `M${x} ${neck + h * .15} l-${h * .28} -${h * .22} M${x} ${neck + h * .15} l${h * .28} -${h * .22}`
          : pose === 'hold'
            ? `M${x} ${neck + h * .15} l-${h * .25} ${h * .12} M${x} ${neck + h * .15} l${h * .3} -${h * .05}`
            : `M${x} ${neck + h * .15} l-${h * .25} ${h * .16} M${x} ${neck + h * .15} l${h * .25} ${h * .16}`;
        const smile = pk([`M${x - 3} ${top + 3} q3 3 6 0`, `M${x - 3} ${top + 2} q3 5 6 0`, `M${x - 2} ${top + 3} h4`]);
        return `
          <circle cx="${x}" cy="${top}" r="${hr}" fill="#fde3d3" stroke="${INK}" stroke-width="2.2"/>
          ${crayon(`M${x - hr} ${top - hr * .3} q${hr} ${-hr * 1.6} ${hr * 2} 0`, hair, 5)}
          <circle cx="${x - 2.6}" cy="${top - 1}" r="1.3" fill="${INK}"/><circle cx="${x + 2.6}" cy="${top - 1}" r="1.3" fill="${INK}"/>
          ${crayon(smile, INK, 1.6)}
          ${crayon(`M${x} ${neck} l${j(1)} ${h * .42}`, shirt, h * .16)}
          ${crayon(arms, INK, 2.2)}
          ${crayon(`M${x} ${neck + h * .42} l-${h * .14} ${h * .38} M${x} ${neck + h * .42} l${h * .14} ${h * .38}`, INK, 2.2)}
          ${item ? `<text x="${x + h * .3}" y="${neck + h * .12}" font-size="${h * .28}">${item}</text>` : ''}`;
      };
      const mom = (x, pose, item) => person(x, rnd(46, 54), '#8a6250', pk(['#f08aa2', '#c38bff', '#ff9e6e']), pose, item);
      const kid = (x, pose, item) => person(x, rnd(30, 36), '#4b3a34', pk(['#5cc9a0', '#6cb8ff', '#ffc93c']), pose, item);

      const skies = [
        () => `<circle cx="${rnd(84, 104)}" cy="${rnd(14, 22)}" r="9" fill="#ffe27a" stroke="#f2b84b" stroke-width="2.5"/>${crayon('M100 4 v-3 M114 18 h4 M86 18 h-4 M110 8 l3 -3', '#f2b84b', 2)}`,
        () => `${['#ff8a8a', '#ffc35c', '#fff06b', '#7fdc8f', '#7fc4ff', '#b58cff'].map((c, i) => crayon(`M${6 + i * 3} 44 q${54 - i * 3} ${-50 + i * 4} ${108 - i * 6} 0`, c, 3)).join('')}`,
        () => `${crayon(`M${rnd(8, 30)} 16 q6 -10 14 -2 q8 -8 14 2 q6 2 0 8 h-26 q-8 -2 -2 -8z`, '#9fd3f0', 2.5)}${crayon(`M${rnd(70, 90)} 12 q5 -8 11 -1 q7 -6 11 2 q5 2 0 7 h-20 q-7 -2 -2 -8z`, '#9fd3f0', 2.5)}`,
        () => `<text x="${rnd(80, 98)}" y="20" font-size="16">🌙</text><text x="${rnd(10, 40)}" y="16" font-size="9">⭐</text><text x="${rnd(50, 70)}" y="12" font-size="7">⭐</text>`,
      ];
      const sky = pk(skies)();
      const caption = rnd(0, 1) < .6 ? pk(['媽媽', 'MAMA', '我和媽媽', '我愛媽媽', '♡♡♡', 'ETHAN', '最開心', '好玩！']) : '';
      const hearts = Array.from({ length: Math.floor(rnd(0, 3)) }, () => `<path transform="translate(${rnd(10, 110)} ${rnd(26, 50)}) scale(${rnd(.5, .9)})" d="M0 0 q4 -6 8 0 q4 -6 8 0 l-8 9z" fill="${pk(['#f08aa2', '#ff6fa5', '#c38bff'])}" opacity=".85"/>`).join('');

      const mx = rnd(24, 42), kx = mx + rnd(20, 30);
      let scene = '';
      switch (theme) {
        case 'tennis':
          scene = `${crayon('M60 100 v-30', '#fff', 3)}${crayon('M60 70 v30', INK, 1.5)}${crayon(`M60 74 h${j()} M60 82 h${j()} M60 90 h${j()}`, '#999', 1)}
            ${crayon(`M${kx - 30} 50 q20 -30 ${rnd(40, 60)} -6`, '#d8e84a', 2)}<circle cx="${kx + 18}" cy="44" r="4" fill="#e4f06b" stroke="#b9c24c"/>
            ${mom(rnd(14, 26), 'up')}${kid(rnd(80, 96), 'hold', '🎾')}`;
          break;
        case 'park':
          scene = `${crayon(`M${rnd(90, 104)} 100 v-34`, '#a0703f', 6)}<circle cx="${rnd(92, 102)}" cy="58" r="${rnd(16, 20)}" fill="#8fd18f" opacity=".7" stroke="#5aa85a" stroke-width="2"/>
            ${Array.from({ length: 6 }, (_, i) => `<circle cx="${40 + i * 6}" cy="${98 - (i % 2)}" r="1.4" fill="${INK}"/>`).join('')}
            <text x="${rnd(10, 60)}" y="${rnd(52, 70)}" font-size="10">🍁</text>${mom(mx, 'down')}${kid(kx, 'up', '🍃')}`;
          break;
        case 'cafe':
          scene = `<rect x="18" y="74" width="84" height="5" fill="#c99a78"/><text x="${rnd(48, 58)}" y="72" font-size="20">☕</text>
            ${crayon('M56 46 q3 -5 0 -10 M62 46 q3 -5 0 -10', '#c9b3a6', 2)}${mom(rnd(14, 24), 'hold', '')}${kid(rnd(92, 102), 'hold', '🖍️')}`;
          break;
        case 'market':
          scene = `${Array.from({ length: 6 }, (_, i) => `<rect x="${18 + i * 14}" y="40" width="14" height="10" fill="${i % 2 ? '#fff' : '#ff8a8a'}" stroke="${INK}" stroke-width="1"/>`).join('')}
            <rect x="20" y="64" width="80" height="12" fill="#e9c49a" stroke="${INK}" stroke-width="1.2"/><text x="24" y="66" font-size="12">🥬🍅🥕🌽</text>
            ${mom(rnd(12, 20), 'hold', '🧺')}${kid(rnd(100, 108), 'up')}`;
          break;
        case 'tv':
          scene = `<rect x="${rnd(34, 44)}" y="38" width="44" height="30" rx="4" fill="#6b6370" stroke="${INK}" stroke-width="2"/><rect x="${rnd(38, 46)}" y="42" width="36" height="22" fill="#7fd39a"/>
            <text x="54" y="58" font-size="10">🎾</text><rect x="16" y="84" width="88" height="14" rx="6" fill="#d9c6ff" opacity=".8"/>
            ${mom(rnd(18, 28), 'down')}${kid(rnd(88, 98), 'up', '🙌')}`;
          break;
        case 'school':
        case 'homework':
          scene = `<rect x="${rnd(70, 80)}" y="52" width="36" height="46" fill="#fff1a8" stroke="${INK}" stroke-width="2"/>${crayon(`M${rnd(70, 80)} 52 l18 -14 l18 14`, '#ff8a65', 3)}
            ${crayon('M88 38 v-14', INK, 1.5)}<path d="M88 24 l10 4 l-10 4z" fill="#ff6fa5"/>
            <text x="${rnd(8, 30)}" y="${rnd(40, 52)}" font-size="14" fill="#e0565b" font-weight="700">100</text>${mom(mx - 8, 'down')}${kid(kx - 6, 'up', '🎒')}`;
          break;
        case 'food':
          scene = `<rect x="20" y="76" width="80" height="5" fill="#e3b58f"/><ellipse cx="60" cy="74" rx="18" ry="5" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
            <text x="50" y="72" font-size="18">${dish || pk(['🍙', '🍛', '🍗', '🍝'])}</text>${crayon('M60 50 q2 -4 0 -8 M66 50 q2 -4 0 -8', '#c9b3a6', 1.6)}
            ${mom(rnd(14, 24), 'hold', '🥄')}${kid(rnd(94, 104), 'up')}`;
          break;
        case 'family': {
          const dx = rnd(54, 66);
          scene = `${mom(rnd(16, 26), 'up')}${person(dx, rnd(50, 56), '#55504d', pk(['#8fb4e8', '#7fc4a8']), 'up')}
            <circle cx="${dx - 3}" cy="${100 - 53}" r="3" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="${dx + 3}" cy="${100 - 53}" r="3" fill="none" stroke="${INK}" stroke-width="1"/>
            ${kid(rnd(94, 104), 'up')}<text x="${rnd(30, 70)}" y="34" font-size="9" fill="#e0565b" font-weight="700">我們家</text>`;
          break;
        }
        default: // home
          scene = `${crayon(`M${rnd(62, 72)} 98 v-30 h36 v30`, '#ff8fb8', 3)}${crayon(`M${rnd(58, 66)} 70 l22 -20 l22 20`, '#ff6fa5', 3.5)}
            <rect x="80" y="80" width="10" height="18" fill="#ffd36e"/>${mom(mx - 10, 'down')}${kid(kx - 10, 'down')}
            ${MD.state && MD.state.dadHits ? `<text x="${rnd(10, 30)}" y="30" font-size="10">⭐</text><text x="${rnd(8, 26)}" y="38" font-size="5" fill="${INK}">爸爸</text>` : ''}`;
      }

      return `<svg viewBox="0 0 120 110" class="drawing-svg">
        <rect width="120" height="110" fill="${paper}"/>
        ${sky}
        ${crayon(`M0 ${100 + +j(1)} q60 ${j(4)} 120 0`, ground, 6)}
        ${hearts}
        ${scene}
        ${caption ? `<text x="${rnd(6, 60)}" y="${rnd(58, 66)}" font-size="9" fill="${pk(['#e0565b', '#6c5ce7', '#2e9e6e', '#f08a24'])}" font-weight="700" transform="rotate(${j(8)} 40 60)" style="font-family:'Comic Sans MS',cursive">${caption}</text>` : ''}
      </svg>`;
    },

    /* 綿：一團軟軟的棉花 */
    mian(size = 24) {
      return `<svg viewBox="0 0 40 34" width="${size}" height="${size * .85}" class="mian-svg"><g fill="#fbf8f2" stroke="#cdbba5" stroke-width="1.6"><circle cx="13" cy="20" r="9"/><circle cx="27" cy="20" r="9"/><circle cx="20" cy="13" r="10"/></g><path d="M11 21 q9 7 18 0" fill="#fbf8f2"/><circle cx="16" cy="16" r="1.6" fill="#5a4440"/><circle cx="24" cy="16" r="1.6" fill="#5a4440"/><ellipse cx="13" cy="20" rx="2.4" ry="1.4" fill="#e2a48e" opacity=".45"/><ellipse cx="27" cy="20" rx="2.4" ry="1.4" fill="#e2a48e" opacity=".45"/></svg>`;
    },

    /* 首頁：媽媽和孩子牽著手 */
    duo() {
      return `<div class="duo"><div class="duo-mom">${this.char('mom', 'smile')}</div><div class="duo-kid">${this.char('kid', 'happy')}</div></div>`;
    },
  };
})();
