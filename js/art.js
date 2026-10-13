/*
 * 程式繪製的插圖（暫代美術）
 * 之後換成繪師的正式圖時，只要讓 MD.art.char() 回傳 <img> 即可，
 * 其他程式不用動。
 */
window.MD = window.MD || {};

(function () {
  const INK = '#5a4440';
  const SKIN = '#fde3d3';
  const BLUSH = '#f6a9a4';

  const CHAR = {
    mom: { hair: '#8a6250', shirt: '#f6dfd0', accent: '#e9a8a3' },
    kid: { hair: '#4b3a34', shirt: '#bfe5d3', accent: '#e8f27a' },
    dad: { hair: '#55504d', shirt: '#bcd0ec', accent: '#8fa6c9' },
  };

  // 孩子的樣子依成長階段變化：低年級薄荷綠、中年級天空藍、高年級黃色、國中白襯衫制服
  const KID_LOOK = { low: '#bfe5d3', mid: '#bfe0ff', high: '#ffe4a8', jh: '#ffffff' };
  function kidLook() {
    const st = (MD.stage && MD.state) ? MD.stage() : 'low';
    return Object.assign({}, CHAR.kid, { shirt: KID_LOOK[st], uniform: st === 'jh' });
  }

  // 表情 → 眼睛 / 嘴巴 / 眉毛 / 額外效果
  const EXPR = {
    normal:    { eyes: 'dot',   mouth: 'smile' },
    happy:     { eyes: 'arc',   mouth: 'open' },
    smile:     { eyes: 'arc',   mouth: 'smile' },
    sad:       { eyes: 'dot',   mouth: 'frown', brows: 'sad' },
    cry:       { eyes: 'arc',   mouth: 'wave',  brows: 'sad', extra: 'tears' },
    surprised: { eyes: 'big',   mouth: 'o' },
    think:     { eyes: 'side',  mouth: 'flat',  extra: 'sweat' },
    angry:     { eyes: 'dot',   mouth: 'grit',  brows: 'angry', extra: 'vein' },
    smug:      { eyes: 'half',  mouth: 'smirk' },
    hurt:      { eyes: 'x',     mouth: 'wave',  extra: 'stars' },
    sparkle:   { eyes: 'star',  mouth: 'open' },
    sleepy:    { eyes: 'line',  mouth: 'o',     extra: 'zzz' },
    shy:       { eyes: 'arc',   mouth: 'wave',  extra: 'bigblush' },
  };

  function eyes(type, y) {
    const L = 46, R = 74;
    const pair = f => f(L) + f(R);
    switch (type) {
      case 'arc':  return pair(x => `<path d="M${x - 6} ${y + 1} q6 -7 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
      case 'big':  return pair(x => `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="2.5" fill="${INK}"/>`);
      case 'side': return pair(x => `<circle cx="${x + 3}" cy="${y - 1}" r="4" fill="${INK}"/>`);
      case 'half': return pair(x => `<path d="M${x - 6} ${y} h12" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M${x - 5} ${y} q5 5 10 0" fill="${INK}"/>`);
      case 'x':    return pair(x => `<path d="M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
      case 'line': return pair(x => `<path d="M${x - 6} ${y + 1} q6 3 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
      case 'star': return pair(x => `<circle cx="${x}" cy="${y}" r="5.5" fill="${INK}"/><path d="M${x + 1} ${y - 4} l1.2 2.6 2.8 .3 -2.1 1.9 .6 2.8 -2.5 -1.5 -2.5 1.5 .6 -2.8 -2.1 -1.9 2.8 -.3z" fill="#fff"/>`);
      default:     return pair(x => `<circle cx="${x}" cy="${y}" r="4.6" fill="${INK}"/><circle cx="${x + 1.6}" cy="${y - 1.6}" r="1.5" fill="#fff"/>`);
    }
  }

  function mouth(type, y) {
    switch (type) {
      case 'open':  return `<path d="M52 ${y - 2} q8 12 16 0 z" fill="#d9706f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'frown': return `<path d="M54 ${y + 3} q6 -6 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case 'wave':  return `<path d="M52 ${y} q2 -3 4 0 t4 0 t4 0 t4 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      case 'o':     return `<ellipse cx="60" cy="${y + 1}" rx="4" ry="5" fill="#d9706f" stroke="${INK}" stroke-width="2"/>`;
      case 'flat':  return `<path d="M55 ${y} h10" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
      case 'grit':  return `<rect x="52" y="${y - 3}" width="16" height="7" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M57 ${y - 3} v7 M63 ${y - 3} v7" stroke="${INK}" stroke-width="1.4"/>`;
      case 'smirk': return `<path d="M54 ${y + 1} q8 4 13 -3" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      default:      return `<path d="M54 ${y - 1} q6 6 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    }
  }

  function brows(type, y) {
    if (type === 'sad') return `<path d="M40 ${y} l10 -3 M80 ${y} l-10 -3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (type === 'angry') return `<path d="M39 ${y - 4} l11 4 M81 ${y - 4} l-11 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    return '';
  }

  function extra(type) {
    switch (type) {
      case 'tears': return `<path d="M42 72 q-3 8 0 12 q3 -4 0 -12z M78 72 q-3 8 0 12 q3 -4 0 -12z" fill="#9fd3f0"/>`;
      case 'sweat': return `<path d="M92 40 q-5 8 0 11 q5 -3 0 -11z" fill="#9fd3f0" stroke="#7bb8db" stroke-width="1"/>`;
      case 'vein':  return `<path d="M86 30 l4 4 m0 -4 l-4 4 M92 26 l4 4 m0 -4 l-4 4" stroke="#e0565b" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'stars': return `<text x="16" y="28" font-size="14">⭐</text><text x="88" y="22" font-size="12">✨</text>`;
      case 'zzz':   return `<text x="88" y="26" font-size="14" fill="#8a7fb0" font-weight="700">z z</text>`;
      case 'bigblush': return `<ellipse cx="40" cy="74" rx="9" ry="5" fill="${BLUSH}" opacity=".8"/><ellipse cx="80" cy="74" rx="9" ry="5" fill="${BLUSH}" opacity=".8"/>`;
      default: return '';
    }
  }

  function hairBack(who, c) {
    if (who === 'mom') return `<path d="M18 62 q0 -46 42 -46 q42 0 42 46 v30 q-6 10 -16 6 v-30 h-52 v30 q-10 4 -16 -6z" fill="${c.hair}"/>`;
    return '';
  }

  function hairFront(who, c) {
    if (who === 'mom') return `
      <path d="M18 60 q2 -44 42 -44 q40 0 42 44 q-14 -4 -26 -20 q-10 16 -40 16 q-10 0 -18 4z" fill="${c.hair}"/>
      <circle cx="21" cy="78" r="3" fill="#fff" stroke="#e8d6c8"/>`;
    if (who === 'kid') return `
      <path d="M20 60 q-2 -42 40 -44 q42 2 40 44 q-8 -10 -14 -12 l-4 8 -6 -12 -8 9 -6 -12 -8 11 -6 -10 -8 10 q-12 4 -20 18z" fill="${c.hair}"/>
      <path d="M58 16 q4 -12 14 -10 q-8 4 -8 12z" fill="${c.hair}"/>`;
    if (who === 'dad') return `
      <path d="M20 58 q0 -40 40 -40 q40 0 40 40 q-10 -14 -40 -16 q-28 0 -40 16z" fill="${c.hair}"/>
      <circle cx="46" cy="64" r="10" fill="none" stroke="${INK}" stroke-width="2.4"/>
      <circle cx="74" cy="64" r="10" fill="none" stroke="${INK}" stroke-width="2.4"/>
      <path d="M56 63 h8" stroke="${INK}" stroke-width="2.4"/>
      <path d="M44 88 q16 10 32 0" stroke="#b9a59c" stroke-width="1.5" stroke-dasharray="1 3" fill="none"/>`;
    return '';
  }

  function body(who, c) {
    const w = who === 'dad' ? 80 : who === 'kid' ? 58 : 66;
    const x = 60 - w / 2;
    let deco = '';
    if (who === 'kid' && c.uniform) deco = `<path d="M50 112 l10 10 10 -10" stroke="#3d4f8a" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="57" y="120" width="6" height="20" rx="2" fill="#3d4f8a"/>`;
    else if (who === 'kid') deco = `<circle cx="60" cy="132" r="7" fill="${c.accent}" stroke="#b9c24c" stroke-width="1.5"/><path d="M54 130 q6 4 12 0" stroke="#fff" stroke-width="1.5" fill="none"/>`;
    if (who === 'mom') deco = `<path d="M50 112 l10 10 10 -10" stroke="${c.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (who === 'dad') deco = `<path d="M52 112 l8 8 8 -8" stroke="${c.accent}" stroke-width="3" fill="none"/><rect x="58" y="120" width="4" height="22" fill="${c.accent}"/>`;
    return `<path d="M${x} 160 v-30 q0 -24 ${w / 2} -24 q${w / 2} 0 ${w / 2} 24 v30z" fill="${c.shirt}" stroke="${INK}" stroke-width="2.4" stroke-opacity=".25"/>${deco}`;
  }

  MD.art = {
    char(who, expr) {
      const c = who === 'kid' ? kidLook() : (CHAR[who] || CHAR.kid);
      const e = EXPR[expr] || EXPR.normal;
      const eyeY = who === 'dad' ? 64 : 64;
      return `<svg viewBox="0 0 120 160" class="char-svg" aria-hidden="true">
        ${body(who, c)}
        ${hairBack(who, c)}
        <circle cx="60" cy="64" r="40" fill="${SKIN}"/>
        <ellipse cx="38" cy="76" rx="7" ry="4" fill="${BLUSH}" opacity=".55"/>
        <ellipse cx="82" cy="76" rx="7" ry="4" fill="${BLUSH}" opacity=".55"/>
        ${eyes(e.eyes, eyeY)}
        ${brows(e.brows, eyeY - 12)}
        ${mouth(e.mouth, 84)}
        ${hairFront(who, c)}
        ${extra(e.extra)}
      </svg>`;
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
        <ellipse cx="40" cy="66" rx="34" ry="4" fill="#000" opacity=".07"/>
        <rect x="10" y="28" width="60" height="38" rx="6" fill="${wall}" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/>
        <path d="M4 32 L40 6 L76 32 Z" fill="${roof}" stroke="${INK}" stroke-opacity=".18" stroke-width="2" stroke-linejoin="round"/>
        <rect x="32" y="44" width="16" height="22" rx="7" fill="#fff" opacity=".85"/>
        <rect x="15" y="38" width="12" height="10" rx="3" fill="#fff" opacity=".7"/>
        <rect x="53" y="38" width="12" height="10" rx="3" fill="#fff" opacity=".7"/>
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
      return `<svg viewBox="0 0 40 34" width="${size}" height="${size * .85}" class="mian-svg"><g fill="#fff" stroke="#f0bccb" stroke-width="2"><circle cx="13" cy="20" r="9"/><circle cx="27" cy="20" r="9"/><circle cx="20" cy="13" r="10"/></g><path d="M11 21 q9 7 18 0" fill="#fff"/><circle cx="16" cy="16" r="1.6" fill="#5a4440"/><circle cx="24" cy="16" r="1.6" fill="#5a4440"/><ellipse cx="13" cy="20" rx="2.4" ry="1.4" fill="#f6a9b8" opacity=".7"/><ellipse cx="27" cy="20" rx="2.4" ry="1.4" fill="#f6a9b8" opacity=".7"/></svg>`;
    },

    /* 首頁：媽媽和孩子牽著手 */
    duo() {
      return `<div class="duo"><div class="duo-mom">${this.char('mom', 'smile')}</div><div class="duo-kid">${this.char('kid', 'happy')}</div></div>`;
    },
  };
})();
