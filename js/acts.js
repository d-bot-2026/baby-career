/*
 * 互動（手指在做事，心在被療癒）
 * 每個互動都不會失敗，最後回傳 { mian: 得到的綿, memory?, drawing? }
 */
window.MD = window.MD || {};

(function () {
  const $scene = () => document.getElementById('scene');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => MD.pick(arr);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const buzz = ms => { if (MD.state.settings.vibrate && navigator.vibrate) navigator.vibrate(ms); };
  const F = t => MD.fill(t);
  const S = name => MD.audio && MD.audio.sfx(name);

  /* ── 共用 ── */
  function open(bg, title, hint) {
    const m = $scene();
    m.className = 'overlay show scene bg-' + bg;
    m.innerHTML = `
      <div class="deco-layer">${MD.sceneDeco(bg)}</div>
      <div class="mini-head"><h3>${F(title)}</h3>${hint ? `<br><p>${F(hint)}</p>` : ''}</div>
      <div class="mini-field"></div>
      <div class="mini-foot"></div>`;
    return { field: m.querySelector('.mini-field'), foot: m.querySelector('.mini-foot'), head: m.querySelector('.mini-head') };
  }
  function setHead(head, title, hint) { head.innerHTML = `<h3>${F(title)}</h3>${hint ? `<br><p>${F(hint)}</p>` : ''}`; }
  function close() { const m = $scene(); m.className = 'overlay'; m.innerHTML = ''; }

  function pow(field, x, y, text) {
    const p = document.createElement('div');
    p.className = 'pow'; p.textContent = text;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    field.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }

  function hearts(field, n = 6, x, y) {
    S('sparkle');
    const r = field.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div');
      h.className = 'heart'; h.textContent = pick(['💗', '💖', '✨', '💕']);
      h.style.left = ((x ?? r.width / 2) + rand(-60, 60)) + 'px';
      h.style.top = ((y ?? r.height / 2) + rand(-20, 30)) + 'px';
      h.style.setProperty('--rot', rand(-30, 30) + 'deg');
      h.style.animationDelay = (i * 70) + 'ms';
      field.appendChild(h);
      setTimeout(() => h.remove(), 1400);
    }
  }

  function kid(field, expr, line, opts = {}) {
    let k = field.querySelector('.mini-kid');
    if (!k) { k = document.createElement('div'); k.className = 'mini-kid' + (opts.cls ? ' ' + opts.cls : ''); field.appendChild(k); }
    k.innerHTML = MD.art.char('kid', expr);
    say(field, line);
    return k;
  }
  function say(field, line) {
    let b = field.querySelector('.mini-bubble');
    if (!line) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.className = 'mini-bubble'; field.appendChild(b); }
    b.textContent = F(line);
    b.classList.remove('pop-in'); void b.offsetWidth; b.classList.add('pop-in');
  }

  /* 依表現給 1～3 顆星（沒有失敗，只有「還可以更好」） */
  const starsBy = (v, three, two, lowerIsBetter) =>
    lowerIsBetter ? (v <= three ? 3 : v <= two ? 2 : 1) : (v >= three ? 3 : v >= two ? 2 : 1);
  const since = t0 => (performance.now() - t0) / 1000;

  function done(field, title, mian, sub, stars) {
    return new Promise(resolve => {
      const d = document.createElement('div');
      d.className = 'mini-done';
      d.innerHTML = `${stars ? `<div class="stars">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * .15}s">★</i>`).join('')}</div>` : ''}
        <h4>${F(title)}</h4>${sub ? `<p>${F(sub)}</p>` : ''}
        <div class="mian-get">${MD.art.mian(34)}<b>+${mian}</b></div>
        <button class="btn primary">好</button>`;
      field.appendChild(d);
      buzz(20);
      S('success');
      for (let i = 1; i <= (stars || 0); i++) setTimeout(() => S('star'), 250 + i * 160);
      d.querySelector('button').onclick = () => { close(); resolve(); };
    });
  }

  function button(foot, label, cls = 'btn primary') {
    return new Promise(resolve => {
      const b = document.createElement('button');
      b.className = cls; b.innerHTML = label;
      b.onclick = e => { e.stopPropagation(); b.remove(); resolve(); };
      foot.appendChild(b);
    });
  }

  function choose(foot, options, cls = '') {
    return new Promise(resolve => {
      foot.innerHTML = '';
      options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'big-choice ' + cls; b.innerHTML = `<span>${o.icon}</span><small>${o.label}</small>`;
        b.onclick = () => { foot.innerHTML = ''; resolve(o.v); };
        foot.appendChild(b);
      });
    });
  }

  /* ── 網球：撿球 ── */
  async function pickup() {
    const { field, foot } = open('court', '幫忙撿球', '點網球，收進籃子');
    const total = 12; let got = 0;
    foot.innerHTML = `<span class="basket">🧺</span><span class="counter">0 / ${total}</span>`;
    const cnt = foot.querySelector('.counter'), basket = foot.querySelector('.basket');
    kid(field, 'sparkle', '媽媽加油！');
    await wait(60);
    const t0 = performance.now();
    await new Promise(resolve => {
      for (let i = 0; i < total; i++) {
        const b = document.createElement('button');
        b.className = 'mini-ball'; b.innerHTML = MD.art.ball(46);
        b.style.left = rand(12, 88) + '%'; b.style.top = rand(6, 56) + '%';
        b.style.animationDelay = (i * 50) + 'ms';
        b.onclick = () => {
          b.classList.add('got');
          const br = basket.getBoundingClientRect(), fr = field.getBoundingClientRect();
          b.style.left = (br.left - fr.left + br.width / 2) + 'px';
          b.style.top = (br.bottom - fr.top) + 'px';
          b.style.transform = 'translate(-50%,-50%) scale(.3)';
          setTimeout(() => b.remove(), 460);
          cnt.textContent = `${++got} / ${total}`; buzz(12); S('pop');
          if (got % 4 === 0 && got < total) kid(field, pick(['happy', 'sparkle']), pick(['好快！', '撿球搭檔！', '這顆是另一個牌子的！']));
          if (got === total) resolve();
        };
        field.appendChild(b);
      }
    });
    const st = starsBy(since(t0), 8, 14, true);
    kid(field, 'happy', '全部撿完了！');
    await wait(500);
    await done(field, '全部撿完 🎾', 2 + st, st === 3 ? '「媽媽撿球比教練還快！」' : '', st);
    return { mian: 2 + st };
  }

  /* ── 網球：對打 / 比賽 ── */
  async function rallyCore(field, foot, total, opts = {}) {
    let hit = 0;
    foot.innerHTML = `<span class="counter">${opts.score ? `${F('{kid}')} 0 : 0 對手` : '接到 0 球'}</span>`;
    const cnt = foot.querySelector('.counter');
    let me = 0, them = 0;
    kid(field, 'sparkle', opts.start || '來吧！');
    await wait(800);
    for (let n = 1; n <= total; n++) {
      const t = Math.max(1.05, 1.7 - n * 0.04);
      const res = await new Promise(resolve => {
        const b = document.createElement('button');
        b.className = 'mini-ball';
        b.innerHTML = (opts.icon || MD.art.ball(52)) + `<span class="ring" style="--t:${t}s"></span>`;
        const x = rand(16, 84), y = rand(6, 48);
        b.style.left = x + '%'; b.style.top = y + '%';
        let over = false;
        const tm = setTimeout(() => { if (!over) { over = true; b.remove(); resolve({ ok: false, x, y }); } }, t * 1000);
        b.onclick = () => { if (over) return; over = true; clearTimeout(tm); b.remove(); buzz(18); resolve({ ok: true, x, y }); };
        field.appendChild(b);
      });
      const px = field.clientWidth * res.x / 100, py = field.clientHeight * res.y / 100;
      if (res.ok) { hit++; me++; S('hit'); pow(field, px, py, pick(['啪！', '好球！', 'Nice！', '咻！'])); }
      else { them++; S('miss'); pow(field, px, py, pick(['沒關係！', '下一球！'])); }
      cnt.textContent = opts.score ? `${F('{kid}')} ${me} : ${them} 對手` : `接到 ${hit} 球`;
      if (n % 4 === 0) kid(field, res.ok ? 'happy' : 'smile', res.ok ? pick(['再來！', '手肘先往後！']) : '沒關係！');
      await wait(360);
    }
    return hit;
  }

  async function rally() {
    const { field, foot } = open('court', '來回對打', '在球縮小前點它');
    const hit = await rallyCore(field, foot, 10);
    const st = starsBy(hit, 9, 6);
    const mian = 2 + st;
    await done(field, `接到 ${hit} 球`, mian, hit >= 8 ? '「媽媽你根本是職業選手！」' : '「我們越來越有默契了！」', st);
    return { mian };
  }

  async function match() {
    const { field, foot, head } = open('court', '小小比賽', '幫 {kid} 把球打回去');
    const hit = await rallyCore(field, foot, 12, { score: true, start: '我有一點緊張……' });
    const st = starsBy(hit, 10, 7);
    setHead(head, '比賽結束');
    foot.innerHTML = '';
    kid(field, 'think', '');
    say(field, '……（{kid}回頭，在場邊找你）');
    await button(foot, '👋 揮揮手');
    kid(field, 'sparkle', '我看到你了！');
    hearts(field, 10);
    await wait(1200);
    const first = !MD.state.flags.matchWave;
    MD.state.flags.matchWave = true;
    await done(field, hit > 6 ? '贏了！他每次抬頭，都在找你' : '他每次抬頭，都在找你', 3 + st, '', st);
    return { mian: 3 + st, memory: first ? { id: 'wave', icon: '👋', title: '他每次抬頭，都在找你' } : null };
  }

  /* ── 公園：撿葉子 ── */
  async function leaves() {
    const { field, foot } = open('park', '撿葉子', '接住飄下來的葉子');
    let got = 0; const need = 8;
    foot.innerHTML = `<span class="counter">🍃 0</span>`;
    const cnt = foot.querySelector('.counter');
    kid(field, 'happy', '葉子在下雨！');
    let golden = false, finished = false;
    const t0 = performance.now();
    await new Promise(resolve => {
      const spawn = () => {
        if (finished) return;
        const isGold = got >= need && !golden;
        const l = document.createElement('button');
        l.className = 'leaf' + (isGold ? ' gold' : '');
        l.textContent = isGold ? '🍁' : pick(['🍂', '🍃', '🍂', '🌿']);
        l.style.left = rand(8, 88) + '%';
        l.style.animationDuration = rand(4, 6) + 's';
        if (isGold) golden = true;
        l.onclick = () => {
          l.remove(); buzz(10);
          if (l.classList.contains('gold')) { finished = true; resolve(); return; }
          got++; S('paper'); cnt.textContent = `🍃 ${got}`;
          if (got === need) kid(field, 'sparkle', '等一下！那片紅色的！');
        };
        l.addEventListener('animationend', () => { l.remove(); if (l.classList.contains('gold')) golden = false; });
        field.appendChild(l);
        setTimeout(spawn, isGold ? 1800 : rand(380, 700));
      };
      spawn();
    });
    field.querySelectorAll('.leaf').forEach(l => l.remove());
    kid(field, 'sparkle', '這片是完美的形狀。要送給媽媽。');
    hearts(field, 6);
    await wait(1300);
    const first = !MD.state.flags.leaf;
    MD.state.flags.leaf = true;
    const st = starsBy(since(t0), 11, 17, true);
    await done(field, '收到一片完美的葉子 🍁', 2 + st, '', st);
    return { mian: 2 + st, memory: first ? { id: 'leaf', icon: '🍁', title: '完美形狀的葉子' } : null, drawing: 'park' };
  }

  /* ── 公園：溜滑梯，在底下接住他 ──
   * 他每次用不同的姿勢溜下來，滑到底的那一瞬間按「接住！」
   */
  async function slide() {
    const { field, foot } = open('park', '溜滑梯', '他滑到最下面的時候，按「接住！」');
    const sl = document.createElement('div'); sl.className = 'slide';
    sl.innerHTML = `<div class="slide-ladder"></div><div class="slide-chute"></div><div class="slide-kid">${MD.art.char('kid', 'sparkle')}</div><div class="slide-mom">${MD.art.char('mom', 'smile')}</div>`;
    field.appendChild(sl);
    const kidEl = sl.querySelector('.slide-kid'), momEl = sl.querySelector('.slide-mom');
    const btn = document.createElement('button'); btn.className = 'push-btn'; btn.textContent = '接住！';
    foot.appendChild(btn);
    const POSES = [
      { line: '第一次！普通的溜法！', rot: 0, ms: 1500 },
      { line: '這次肚子朝下！', rot: -80, ms: 1300 },
      { line: '我要倒著溜！', rot: 180, ms: 1400 },
      { line: '跟小熊一起溜！🧸', rot: 0, ms: 1600 },
      { line: '火箭模式！！', rot: -20, ms: 950 },
      { line: '慢動作……', rot: 10, ms: 2100 },
    ];
    const rounds = [POSES[0], ...POSES.slice(1).sort(() => Math.random() - .5).slice(0, 4)];
    let caught = 0;
    for (const pose of rounds) {
      say(field, pose.line);
      kidEl.style.transition = 'none';
      kidEl.style.left = '8%'; kidEl.style.top = '6%';
      kidEl.style.transform = `rotate(${pose.rot}deg)`;
      kidEl.innerHTML = MD.art.char('kid', 'sparkle');
      await wait(700);
      // 往下滑：沿著溜滑梯的斜線
      const t0 = performance.now();
      const res = await new Promise(resolve => {
        let raf;
        const loop = now => {
          const p = Math.min(1.25, (now - t0) / pose.ms);
          const q = Math.min(1, p);
          kidEl.style.left = (8 + q * 52) + '%';
          kidEl.style.top = (6 + q * 50 + (p > 1 ? (p - 1) * 60 : 0)) + '%';
          btn.classList.toggle('ready', p > .86 && p < 1.08);
          kidEl.dataset.p = p;
          if (p >= 1.25) { resolve('miss'); return; }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        btn.onclick = () => {
          const p = +kidEl.dataset.p;
          if (p < .7) return;   // 太早按，不算，他還在上面
          cancelAnimationFrame(raf);
          resolve(p > .86 && p < 1.08 ? 'catch' : 'late');
        };
      });
      btn.classList.remove('ready');
      if (res === 'catch') {
        caught++; S('chime'); buzz(25);
        kidEl.style.transform = 'rotate(0)';
        kidEl.innerHTML = MD.art.char('kid', 'happy');
        momEl.innerHTML = MD.art.char('mom', 'happy');
        say(field, pick(['接到了！！', '媽媽是最強的捕手！', '再一次！再一次！']));
        hearts(field, 4, field.clientWidth * .62, field.clientHeight * .6);
      } else {
        S('soft');
        kidEl.innerHTML = MD.art.char('kid', 'surprised');
        say(field, pick(['（咚！坐在沙子上）……沒事！沙子很軟！', '（滑到地上）我是故意的！', '（滾了一圈）哈哈哈哈！']));
      }
      await wait(1300);
      momEl.innerHTML = MD.art.char('mom', 'smile');
    }
    btn.remove();
    say(field, caught >= 4 ? '媽媽每一次都接到我耶。' : '溜滑梯最好玩的是，下面有媽媽。');
    hearts(field, 6);
    await wait(1600);
    const st = caught >= 5 ? 3 : caught >= 3 ? 2 : 1;
    await done(field, '溜了五次滑梯 🛝', 2 + st, `接住了 ${caught} 次`, st);
    return { mian: 2 + st, drawing: 'park' };
  }

  /* ── 公園：吹泡泡 ── */
  async function bubbles() {
    const { field, foot } = open('park', '吹泡泡', '{kid}吹泡泡，你來戳破');
    kid(field, 'happy', '呼～～');
    let popped = 0; const need = 15, total = 22;
    foot.innerHTML = `<span class="counter">🫧 0</span>`;
    const cnt = foot.querySelector('.counter');
    const t0 = performance.now();
    await new Promise(resolve => {
      let made = 0;
      const spawn = () => {
        if (popped >= need) return;
        if (made < total || field.querySelectorAll('.bubble').length < 3) {
          made++;
          const b = document.createElement('button');
          b.className = 'bubble';
          const s = rand(36, 70);
          b.style.width = b.style.height = s + 'px';
          b.style.left = rand(30, 70) + '%';
          b.style.setProperty('--dx', rand(-120, 120) + 'px');
          b.style.animationDuration = rand(4, 6.5) + 's';
          b.onclick = () => {
            b.classList.add('popped'); setTimeout(() => b.remove(), 200); buzz(8); S('bubble');
            cnt.textContent = `🫧 ${++popped}`;
            if (popped === 7) kid(field, 'sparkle', '最大的那個是我的！');
            if (popped >= need) resolve();
          };
          b.addEventListener('animationend', () => b.remove());
          field.appendChild(b);
        }
        setTimeout(spawn, rand(250, 500));
      };
      spawn();
    });
    field.querySelectorAll('.bubble').forEach(b => b.remove());
    kid(field, 'happy', '泡泡裡面有彩虹耶。');
    await wait(1000);
    const st = starsBy(since(t0), 9, 14, true);
    await done(field, '整個公園都是泡泡 🫧', 2 + st, '', st);
    return { mian: 2 + st };
  }

  /* ── 小學：接放學 ──
   * 每天的情境不一樣（輪流，不會連續重複）：
   *   greet 看肢體語言選抱抱或擊掌／show 他有東西要給你看／quiet 今天不太開心
   *   handshake 他發明了秘密握手／forgot 東西又忘在教室
   */
  const PICKUPS = ['greet', 'show', 'quiet', 'handshake', 'forgot'];
  async function school(ctx) {
    const { field, foot } = open('class', '放學了', '');
    const t = ctx.today || {};
    const s = MD.state;
    const last = s.flags.lastPickup;
    // 安靜的那種不要太常出現
    const pool = PICKUPS.filter(p => p !== last && !(p === 'quiet' && s.flags.lastQuiet >= s.day - 3));
    const kind = pick(pool);
    s.flags.lastPickup = kind;
    if (kind === 'quiet') s.flags.lastQuiet = s.day;
    let mian = 3;

    if (kind === 'greet') {
      const wantsHug = MD.hasTrait('asperger') ? Math.random() < .45 : Math.random() < .75;
      const k = kid(field, wantsHug ? 'sparkle' : 'think', '', { cls: wantsHug ? 'arms-open' : 'stiff' });
      k.classList.add('run-in');
      await wait(900);
      say(field, wantsHug ? pick(['媽媽——！', '我在這裡！！', '媽媽我好想你！']) : pick(['……（小步小步地走過來）', '……（低著頭走過來）', '……（慢慢地走，一直看地上的線）']));
      const v = await choose(foot, [{ icon: '🤗', label: '抱抱', v: 'hug' }, { icon: '✋', label: '擊掌', v: 'five' }]);
      if ((v === 'hug') === wantsHug) {
        kid(field, 'happy', wantsHug ? pick(['（整個人撲過來）', '（抱住你的腰，不放開）']) : pick(['啪！（剛剛好的力氣）', '啪！今天的擊掌是 100 分。']));
        hearts(field, 10); buzz([20, 40, 20]); mian = 5;
      } else if (v === 'hug') {
        kid(field, 'shy', pick(['……今天擊掌就好。', '……抱抱可以等一下嗎？']));
        await wait(1100); say(field, '啪。（他還是笑了）');
      } else {
        kid(field, 'surprised', '……要抱抱啦！');
        await wait(900); kid(field, 'happy', '（衝過來抱住你的腿）'); hearts(field, 6);
      }
    } else if (kind === 'show') {
      const item = pick([
        { icon: '🎨', what: '一張畫', yay: '這是我們家。爸爸是那個圓圓的。', ask: '這是你在煮飯，旁邊那個是鍋子在唱歌。' },
        { icon: '⭐', what: '一張貼紙', yay: '老師說我今天很專心！整整 10 分鐘！', ask: '因為我幫同學撿鉛筆。撿了 4 次。' },
        { icon: '🐛', what: '一個小盒子', yay: '是毛毛蟲！我要叫牠阿根廷龍。', ask: '牠在操場的葉子上。我問過牠了，牠說可以來我們家。' },
        { icon: '💯', what: '一張考卷', yay: '100 分！我每個字都寫在格子裡面。', ask: '最後一題我寫了兩次，因為第一次不夠漂亮。' },
        { icon: '🌰', what: '一顆橡實', yay: '這是全世界最圓的橡實。送你。', ask: '我在樹下找了一整個下課。它是第 37 顆，最好的一顆。' },
      ]);
      const k = kid(field, 'sparkle', `媽媽你看！我有${item.what}！`); k.classList.add('run-in');
      const it = document.createElement('div'); it.className = 'show-item'; it.textContent = item.icon; field.appendChild(it);
      await wait(1000);
      const v = await choose(foot, [{ icon: '🤩', label: '哇，好厲害！', v: 'yay' }, { icon: '👂', label: '跟我說說看', v: 'ask' }]);
      kid(field, v === 'yay' ? 'happy' : 'sparkle', item[v]);
      hearts(field, 6); mian = 4;
      if (item.icon === '🎨') t.drawings && t.drawings.push('family');
    } else if (kind === 'quiet') {
      const k = kid(field, 'sad', ''); k.classList.add('run-in');
      await wait(900);
      say(field, pick(['……今天有人說我講話很奇怪。', '……我在下課的時候，一個人。', '……老師說我太大聲了。我不知道怎麼小聲。']));
      const v = await choose(foot, [{ icon: '🤗', label: '先抱一下', v: 'hug' }, { icon: '🍦', label: '去吃冰淇淋', v: 'ice' }, { icon: '👂', label: '我在聽', v: 'listen' }]);
      if (v === 'hug') { kid(field, 'cry', '……（把臉埋在你的衣服裡，很久）'); await wait(1600); kid(field, 'smile', '……好了。我好一點了。'); }
      else if (v === 'ice') { kid(field, 'think', '……草莓口味的？'); await wait(1300); kid(field, 'smile', '吃到一半他說：「我覺得我講話不奇怪，是很特別。」'); }
      else { kid(field, 'think', '……（走了一段路，才開始慢慢說）'); await wait(1600); kid(field, 'smile', '說完以後，他牽住你的手，比平常更用力。'); }
      hearts(field, 5); mian = 5;
      const first = !s.flags.quietMemo; s.flags.quietMemo = true;
      if (first) t.memories && t.memories.push({ id: 'quiet-day', icon: '🌧️', title: '不太開心的那天，你一直都在' });
    } else if (kind === 'handshake') {
      const k = kid(field, 'sparkle', '媽媽！我發明了一個秘密握手！看好喔！'); k.classList.add('run-in');
      const G = ['✋', '👊', '👍', '✌️'];
      const seq = [pick(G), pick(G), pick(G)];
      const show = document.createElement('div'); show.className = 'show-item seq'; field.appendChild(show);
      await wait(900);
      for (const g of seq) { show.textContent = g; S('pop'); await wait(650); show.textContent = ''; await wait(150); }
      say(field, '換你！');
      let ok = false;
      for (let attempt = 0; attempt < 2 && !ok; attempt++) {
        const got = [];
        await new Promise(res => {
          foot.innerHTML = '';
          G.forEach(g => {
            const b = document.createElement('button'); b.className = 'big-choice'; b.innerHTML = `<span>${g}</span>`;
            b.onclick = () => { got.push(g); show.textContent = got.join(' '); if (got.length === 3) res(); };
            foot.appendChild(b);
          });
        });
        foot.innerHTML = '';
        ok = got.join() === seq.join();
        if (!ok && attempt === 0) { kid(field, 'happy', `不對啦！是 ${seq.join(' ')}。再一次！`); show.textContent = ''; }
      }
      kid(field, ok ? 'sparkle' : 'happy', ok ? '一模一樣！這是我們兩個人的秘密。' : '沒關係，明天再練。爸爸也還不會。');
      hearts(field, ok ? 10 : 4); mian = ok ? 5 : 3;
    } else {
      const lost = pick([{ icon: '🧥', name: '外套' }, { icon: '💧', name: '水壺' }, { icon: '📒', name: '聯絡簿' }, { icon: '🧢', name: '帽子' }]);
      const k = kid(field, 'happy', '媽媽！'); k.classList.add('run-in');
      await wait(900);
      say(field, `老師拿著${lost.name}追出來：「${F('{kid}')}，你的${lost.name}！」`);
      const it = document.createElement('div'); it.className = 'show-item'; it.textContent = lost.icon; field.appendChild(it);
      const v = await choose(foot, [{ icon: '🙏', label: '謝謝老師', v: 'thanks' }, { icon: '😅', label: '又來了～', v: 'again' }]);
      kid(field, 'think', v === 'thanks' ? `……我的${lost.name}自己跑出來了。` : `${lost.name}比較喜歡學校，所以想留下來。`);
      await wait(1200); say(field, '（這已經是這個月第 4 次了）'); mian = 3;
    }
    await wait(1500);
    // 便當盒回來了（前一天晚上準備的）
    const b = t.bento;
    if (b && b.dish) {
      const theme = MD.BENTO_THEMES.find(x => x.id === b.theme);
      const box = document.createElement('div'); box.className = 'bento-return';
      box.innerHTML = `🍱${theme ? theme.icon : b.by === 'dad' ? '👨' : ''}`;
      field.appendChild(box);
      let line;
      if (b.by === 'dad') line = MD.DAD_BENTO[b.variant] ? MD.DAD_BENTO[b.variant].school : '爸爸做的便當，吃光光了！';
      else if (b.score === 'perfect') line = `同學都說我的${theme.name}便當好可愛！`;
      else if (b.score === 'creative') line = pick(['同學問我那是什麼動物。我說是新品種。', '有人說我的便當是外星人。我說謝謝。']);
      else line = MD.DISHES[b.dish].like === 'veg' ? '……青菜還在裡面。' : '便當吃光光了！';
      kid(field, 'happy', line);
      mian += b.score === 'perfect' ? 2 : 1;
      await wait(1800);
    }
    // 學校的小新聞（輪流，不會一直重複）
    const news = pick([
      { icon: '⭐', line: '老師給我一張貼紙！因為我坐得很好。（坐了 5 分鐘）' },
      { icon: '💯', line: '聽寫 100 分！「網」這個字我寫最大。' },
      { icon: '🤝', line: '今天有人跟我交換橡皮擦。他可能是我的朋友。' },
      { icon: '🦕', line: '我在下課的時候，跟大家講了 20 分鐘的暴龍。' },
      { icon: '🩹', line: '我跌倒了，可是我沒有哭。（只有哭一點點）' },
      { icon: '📝', line: '老師說，明天要帶一個「會發光的東西」。' },
      { icon: '🎵', line: '音樂課我負責敲三角鐵。叮。' },
      { icon: '🍚', line: '營養午餐有花椰菜。我把它們排成一棵樹。' },
      { icon: '🏃', line: '體育課跑步，我第四名！有八個人！' },
      { icon: '🐟', line: '教室的魚今天換水了，牠好像很開心。' },
    ]);
    if (kind !== 'quiet' && Math.random() < .7) {
      const n = document.createElement('div'); n.className = 'news-item'; n.textContent = news.icon; field.appendChild(n);
      kid(field, 'sparkle', news.line);
      await wait(1900);
    }
    await done(field, '今天也平安下課了', mian);
    return { mian };
  }

  /* ── 陪寫功課：把讓他分心的東西趕走（ADHD 的日常）── */
  async function homework() {
    const { field, foot } = open('home', '陪寫功課', '有東西讓他分心，就點掉它');
    const desk = document.createElement('div');
    desk.className = 'desk';
    desk.innerHTML = `<div class="desk-kid">${MD.art.char('kid', 'think')}</div><div class="desk-top"><span class="notebook">📓</span><span class="pencil">✏️</span></div>`;
    field.appendChild(desk);
    foot.innerHTML = `<div class="meter"><i></i></div>`;
    const meter = foot.querySelector('i');
    say(field, '今天的作業：國語一頁、數學一頁。');
    const DIST = [
      { icon: '🦋', line: '蝴蝶……' }, { icon: '🪀', line: '溜溜球在叫我。' }, { icon: '🐈', line: '貓咪！' },
      { icon: '🎮', line: '只玩一下下……' }, { icon: '🍪', line: '餅乾的味道……' }, { icon: '🚒', line: '消防車！！' },
      { icon: '🦖', line: '暴龍在看我寫字。' }, { icon: '✈️', line: '飛機飛過去了！' },
    ];
    let progress = 0, distracted = null, missed = 0, raf;
    const t0 = performance.now();
    await new Promise(resolve => {
      let last = performance.now(), nextDist = 1.2;
      const spawn = () => {
        const d = pick(DIST);
        const b = document.createElement('button');
        b.className = 'distract'; b.textContent = d.icon;
        b.style.left = rand(10, 80) + '%'; b.style.top = rand(8, 42) + '%';
        b.born = performance.now();
        b.onclick = e => {
          e.stopPropagation(); buzz(12); S('pop');
          pow(field, b.offsetLeft + 20, b.offsetTop, pick(['走開～', '噓！', '掰掰！']));
          b.remove();
          if (distracted === b) { distracted = null; desk.querySelector('.desk-kid').innerHTML = MD.art.char('kid', 'think'); say(field, pick(['……好，繼續。', '我剛剛寫到哪？', '（低頭繼續寫）'])); }
        };
        b.line = d.line;
        field.appendChild(b);
      };
      const loop = now => {
        const dt = (now - last) / 1000; last = now;
        if (!distracted) progress += dt * 7;
        meter.style.width = Math.min(100, progress) + '%';
        nextDist -= dt;
        if (nextDist <= 0 && progress < 92) { spawn(); nextDist = rand(1.1, 2.0); }
        field.querySelectorAll('.distract').forEach(b => {
          if (!distracted && now - b.born > 1700) {
            distracted = b; missed++;
            desk.querySelector('.desk-kid').innerHTML = MD.art.char('kid', 'sparkle');
            say(field, b.line);
            b.classList.add('caught');
          }
        });
        if (progress >= 100) { cancelAnimationFrame(raf); resolve(); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    field.querySelectorAll('.distract').forEach(b => b.remove());
    desk.querySelector('.desk-kid').innerHTML = MD.art.char('kid', 'happy');
    say(field, pick(['寫完了！！我可以去玩了嗎？', '媽媽，你是我的專注力守門員。', '我寫完了。而且字有在格子裡。']));
    hearts(field, 6);
    await wait(1400);
    const st = starsBy(missed, 1, 3, true);
    await done(field, '功課寫完了 ✏️', 2 + st, `花了 ${Math.round(since(t0))} 秒，分心了 ${missed} 次`, st);
    return { mian: 2 + st, drawing: 'school' };
  }

  /* ── 出門前東西不見了（ADHD 的日常）：每次不見的東西、藏的地方都不一樣 ── */
  const LOST = [
    { icon: '👟', name: '鞋子' }, { icon: '🧢', name: '帽子' }, { icon: '📒', name: '聯絡簿' },
    { icon: '🎾', name: '幸運球' }, { icon: '🧤', name: '手套' }, { icon: '🖍️', name: '蠟筆盒' },
  ];
  const HIDE_SPOTS = {
    '🧸': '原來是小熊幫我顧著。', '📦': '它在箱子裡睡午覺。', '🦖': '暴龍幫我顧著。',
    '🧦': '它跟襪子在開會。', '📚': '它躲在書後面看書。', '🎒': '……原來一直在書包裡。',
    '🧺': '它想被洗一洗。', '🪴': '它在跟盆栽一起曬太陽。', '🪁': '它想跟風箏一起飛。',
  };
  async function shoes() {
    const lost = pick(LOST);
    const { field } = open('home', `${lost.name}不見了！`, '把東西移開，找出來');
    kid(field, 'think', pick(['我把它放在一個很安全的地方……', '我記得它剛剛還在……', '它自己跑走了！', '我沒有動它，它自己不見的。']));
    const items = Object.keys(HIDE_SPOTS).sort(() => Math.random() - .5);
    const hideAt = Math.floor(rand(2, items.length));
    let found = '';
    await new Promise(resolve => {
      items.forEach((it, i) => {
        const b = document.createElement('button');
        b.className = 'clutter';
        b.textContent = it;
        b.style.left = (12 + (i % 3) * 32 + rand(-4, 4)) + '%';
        b.style.top = (8 + Math.floor(i / 3) * 18 + rand(-3, 3)) + '%';
        if (i === hideAt) {
          const s = document.createElement('span'); s.className = 'hidden-shoe'; s.textContent = lost.icon;
          s.style.left = b.style.left; s.style.top = b.style.top; field.appendChild(s);
          s.onclick = () => { found = it; resolve(); };
        }
        b.onclick = () => { b.classList.add('moved'); buzz(8); };
        field.appendChild(b);
      });
    });
    kid(field, 'happy', `找到了！${HIDE_SPOTS[found]}`);
    await wait(1300);
    await done(field, '出門囉，剛剛好', 2);
    return { mian: 2 };
  }

  /* ── 市場：買新食材 ── */
  async function market() {
    const { field, foot } = open('market', '傳統市場', '今天想買什麼？');
    const left = Object.keys(MD.INGREDIENTS).filter(i => !MD.state.ingredients.includes(i));
    kid(field, 'sparkle', pick(['阿姨好！', '我可以拿袋子！', '這裡好香。']));
    if (!left.length) {
      say(field, '阿姨又送我們一把蔥！');
      await wait(1300);
      await done(field, '老顧客的蔥 🌱', 3);
      return { mian: 3 };
    }
    const offer = left.sort(() => Math.random() - .5).slice(0, 3);
    const v = await choose(foot, offer.map(id => ({ icon: MD.INGREDIENTS[id].icon, label: MD.INGREDIENTS[id].name, v: id })), 'xl');
    MD.state.ingredients.push(v);
    S('chime');
    const unlocked = Object.entries(MD.DISHES).filter(([, d]) => d.from === v);
    unlocked.forEach(([id]) => { if (!MD.state.dishes.includes(id)) MD.state.dishes.push(id); });
    kid(field, 'happy', Math.random() < .5 ? '阿姨說我很會挑！' : '我來提！我很有力氣。');
    const card = document.createElement('div');
    card.className = 'unlock-card';
    card.innerHTML = `<small>新菜色</small>${unlocked.map(([, d]) => `<div><span>${d.icon}</span>${d.name}</div>`).join('')}`;
    field.appendChild(card);
    await wait(1600);
    await done(field, `買到${MD.INGREDIENTS[v].name}了`, 3);
    return { mian: 3 };
  }

  /* ── 咖啡店：媽媽一個人的時間 ──
   * {kid}這段時間由{dad}或阿嬤照顧。拉花 → 讀幾頁書 → 看窗外 → 手機傳來一則訊息
   */
  async function cafe() {
    const who = pick(['{dad}帶{kid}去騎腳踏車了。', '{kid}在阿嬤家玩積木。', '{dad}說：「今天下午交給我！」']);
    const { field, foot, head } = open('cafe', '媽媽的獨處時間', F(who));
    say(field, '今天，有四十分鐘是自己的。');
    await wait(2000);
    say(field, '');
    const wrap = document.createElement('div');
    wrap.className = 'latte';
    wrap.innerHTML = `<canvas width="520" height="520"></canvas>`;
    field.appendChild(wrap);
    const cv = wrap.querySelector('canvas'), cx = cv.getContext('2d');
    cx.fillStyle = '#c99a78'; cx.beginPath(); cx.arc(260, 260, 250, 0, 7); cx.fill();
    cx.fillStyle = '#e8cdb6'; cx.beginPath(); cx.arc(260, 260, 120, 0, 7); cx.fill();
    cx.strokeStyle = '#fffaf2'; cx.lineWidth = 22; cx.lineCap = cx.lineJoin = 'round';
    let drawing = false, len = 0;
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 520 / r.width, (e.clientY - r.top) * 520 / r.height]; };
    cv.onpointerdown = e => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); cx.beginPath(); cx.moveTo(x, y); };
    cv.onpointermove = e => { if (!drawing) return; const [x, y] = pt(e); cx.lineTo(x, y); cx.stroke(); len++; };
    cv.onpointerup = () => (drawing = false);
    setHead(head, '拉花', '用手指在奶泡上畫畫，畫什麼都可以');
    await button(foot, '畫好了');
    if (len < 3) { cx.font = '160px serif'; cx.textAlign = 'center'; cx.fillText('♡', 260, 310); }
    cv.onpointerdown = null;
    wrap.classList.add('sip');
    S('soft');
    // 讀幾頁書：點一下翻一頁
    setHead(head, '讀幾頁書', '點書，翻到下一頁');
    const book = document.createElement('button'); book.className = 'cafe-book'; book.innerHTML = '<span class="pg">📖</span><small>那本翻到第三章就停下來的法文小說</small>';
    field.appendChild(book);
    const pages = pick([
      ['「她把信摺好，放回抽屜最深的地方。」', '「窗外的栗子樹開始掉葉子了。」', '「她想，原來自己一直在等的，是一個安靜的下午。」'],
      ['「咖啡涼了，她沒有發現。」', '「河面上有人在划船，划得很慢。」', '「她突然記起二十歲時，最想去的那間書店。」'],
      ['「巴黎下雨的時候，街道會變成鏡子。」', '「她在書頁的空白處，寫下一個字。」', '「那個字是：還好。」'],
    ]);
    for (const line of pages) {
      await new Promise(r => (book.onclick = r));
      S('paper');
      const q = field.querySelector('.cafe-quote') || Object.assign(document.createElement('div'), { className: 'cafe-quote' });
      q.textContent = line; field.appendChild(q);
      q.classList.remove('fade'); void q.offsetWidth; q.classList.add('fade');
    }
    book.remove();
    // 看窗外，什麼都不做
    setHead(head, '', '');
    const q = field.querySelector('.cafe-quote');
    q.textContent = pick(['被需要是一種幸福；偶爾不被需要十分鐘，也是。', '咖啡涼了可以再熱，今天的我也可以。', '普魯斯特有他的瑪德蓮，我有這四十分鐘。', '原來安靜，也是一種被照顧。']);
    q.classList.remove('fade'); void q.offsetWidth; q.classList.add('fade');
    await wait(2800);
    // 手機傳來一則訊息
    S('chime');
    const msg = document.createElement('div'); msg.className = 'phone-msg';
    msg.innerHTML = F(pick([
      '<b>{dad}</b>{kid}問你什麼時候回來。他說「我想媽媽了，可是你慢慢來」。',
      '<b>{dad}</b>（照片）{kid}用積木蓋了一間咖啡店，說是要送給你的。',
      '<b>{friend}</b>欸，下次我們一起去那家咖啡店吧！好久沒有好好聊天了。',
      '<b>{dad}</b>晚餐我來煮。你多坐一下沒關係。',
    ]));
    field.appendChild(msg);
    await wait(3000);
    const first = !MD.state.flags.cafe;
    MD.state.flags.cafe = true;
    await done(field, '媽媽的四十分鐘 ☕', 4, '充好電了，回家吧');
    return { mian: 4, memory: first ? { id: 'cafe', icon: '☕', title: '屬於自己的四十分鐘' } : null };
  }

  /* ── 網球：發球練習（球拋到最高點時發球）── */
  async function serve() {
    const { field, foot } = open('court', '發球練習', '球拋到最高點時，按「發球！」');
    const k = kid(field, 'normal', '先拋球……要拋直直的。');
    const toss = document.createElement('div');
    toss.className = 'toss-ball'; toss.innerHTML = MD.art.ball(40);
    field.appendChild(toss);
    const box = document.createElement('div'); box.className = 'serve-box'; field.appendChild(box);
    const btn = document.createElement('button');
    btn.className = 'push-btn'; btn.textContent = '發球！';
    foot.appendChild(btn);
    const TOTAL = 5, DUR = 1300;
    let perfect = 0, good = 0;
    for (let n = 0; n < TOTAL; n++) {
      const res = await new Promise(resolve => {
        let t0 = performance.now(), raf;
        const loop = now => {
          let p = (now - t0) / DUR;
          if (p > 1) { t0 = now; p = 0; }   // 沒按到就重新拋，不算失敗
          toss.style.bottom = (36 + Math.sin(Math.PI * p) * 44) + '%';
          btn.classList.toggle('ready', p > .38 && p < .62);
          toss.dataset.p = p;
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        btn.onclick = () => {
          cancelAnimationFrame(raf);
          const p = +toss.dataset.p;
          resolve(Math.abs(p - .5) < .1 ? 'ace' : Math.abs(p - .5) < .22 ? 'in' : 'out');
        };
      });
      btn.classList.remove('ready');
      // 球飛向發球區
      toss.style.transition = 'bottom .35s ease-in, left .35s ease-in, transform .35s';
      toss.style.bottom = res === 'out' ? '96%' : '74%';
      toss.style.left = res === 'out' ? '92%' : '62%';
      toss.style.transform = 'translateX(-50%) scale(.5)';
      k.innerHTML = MD.art.char('kid', res === 'out' ? 'surprised' : 'sparkle');
      buzz(res === 'ace' ? 30 : 12); S(res === 'out' ? 'miss' : 'hit'); if (res === 'ace') setTimeout(() => S('chime'), 200);
      pow(field, field.clientWidth * .62, field.clientHeight * .2, res === 'ace' ? 'ACE！' : res === 'in' ? '進了！' : '出界～');
      if (res === 'ace') { perfect++; box.classList.add('hit'); }
      if (res !== 'out') good++;
      say(field, res === 'ace' ? pick(['ACE！我是費德勒！', '對手連碰都碰不到！']) : res === 'in' ? pick(['進了！', '有在框框裡！']) : pick(['飛到隔壁場了……', '球想去散步。']));
      await wait(900);
      box.classList.remove('hit');
      toss.style.transition = 'none'; toss.style.left = '50%'; toss.style.transform = 'translateX(-50%)'; toss.style.bottom = '36%';
      k.innerHTML = MD.art.char('kid', 'normal');
      await wait(300);
    }
    btn.remove();
    const st = perfect >= 3 ? 3 : good >= 3 ? 2 : 1;
    say(field, perfect ? `今天有 ${perfect} 個 ACE！我要記在筆記本裡。` : '發球好難，可是我會一直練。');
    await wait(1400);
    await done(field, '發球練習完成 🎾', 2 + st, `${TOTAL} 球裡進了 ${good} 球`, st);
    return { mian: 2 + st, drawing: 'tennis' };
  }

  /* ── 吃飯 ── */
  async function eat(field, foot, dishId, opts = {}) {
    const d = MD.DISHES[dishId];
    const plate = document.createElement('div');
    plate.className = 'plate';
    plate.innerHTML = `<span class="bite-wrap"><span class="dish">${d.icon}</span></span>`;
    field.appendChild(plate);
    const dish = plate.querySelector('.dish');
    const wrap = plate.querySelector('.bite-wrap');
    // 咬一口：從右邊開始，一口一口被「咬掉」，最後整份不見
    const BITES = 4;
    const bite = k => {
      const front = 112 - (k / BITES) * 128;
      for (let i = 0; i < 4; i++) {
        const c = document.createElement('i');
        c.className = 'bite';
        c.style.left = (front + rand(-4, 6)) + '%';
        c.style.top = (6 + i * 30 + rand(-6, 6)) + '%';
        wrap.appendChild(c);
      }
      const crumb = document.createElement('i');
      crumb.className = 'crumb'; crumb.style.left = rand(30, 70) + '%';
      plate.appendChild(crumb); setTimeout(() => crumb.remove(), 700);
    };
    const resetBites = () => wrap.querySelectorAll('.bite').forEach(b => b.remove());
    let mian = 2;
    const fav = dishId === MD.state.profile.kid.favoriteDish;
    if (d.like === 'veg') {
      kid(field, 'sad', pick(MD.LINES.eatVeg));
      const v = await choose(foot, [{ icon: '🎭', label: '偽裝一下', v: 'mix' }, { icon: '🥄', label: '吃一口就好', v: 'one' }]);
      if (v === 'mix') {
        plate.classList.add('mixing');
        await wait(700);
        dish.textContent = '🍚';
        plate.classList.remove('mixing');
        kid(field, 'think', '');
        await wait(500);
        kid(field, 'smile', pick(MD.LINES.disguised));
        if (opts.onDisguise) opts.onDisguise();
        mian = 3;
      } else {
        kid(field, 'think', '……一口。');
        await wait(800);
        kid(field, 'smile', '（勇敢地吞下去）');
        mian = 3;
      }
      await wait(700);
    } else {
      kid(field, d.like === 'love' ? 'sparkle' : 'normal', fav ? '又是飯糰！我最喜歡飯糰！' : d.like === 'love' ? '哇！' + d.name + '！' : '開動了。');
    }
    const eatAll = () => new Promise(resolve => {
      let k = 0;
      foot.innerHTML = `<span class="counter">點盤子，一口一口吃</span>`;
      plate.onclick = () => {
        bite(++k); buzz(10); S('bite');
        plate.classList.remove('chomp'); void plate.offsetWidth; plate.classList.add('chomp');
        kid(field, 'happy', pick(['（嚼嚼）', '（咕嚕）', '嗯！', '（大口）', '（喀滋）']));
        if (k >= BITES) { plate.onclick = null; dish.classList.add('gone'); setTimeout(resolve, 350); }
      };
    });
    await eatAll();
    if (d.like === 'love' && Math.random() < .55) {
      const u = d.unit || '份';
      kid(field, 'sparkle', `再一${u}！！`);
      foot.innerHTML = '';
      await button(foot, `🍽️ 再來一${u}`);
      resetBites(); dish.classList.remove('gone');
      kid(field, 'happy', `（成長中的孩子，認真地吃第二${u}）`);
      await eatAll();
      mian += 1;
    }
    foot.innerHTML = '';
    kid(field, 'happy', pick(d.like === 'love' ? MD.LINES.eatLove : MD.LINES.eatOk));
    await wait(900);
    return mian;
  }

  async function breakfast(ctx) {
    const d = MD.DISHES[ctx.dish];
    const { field, foot } = open('kitchen', '早餐：' + d.name, '');
    const mian = await eat(field, foot, ctx.dish);
    await done(field, '吃飽飽，出門囉', mian);
    return { mian };
  }

  async function snack(ctx) {
    const d = MD.DISHES[ctx.dish];
    const { field, foot } = open(ctx.bg || 'park', '點心：' + d.name, '');
    const mian = await eat(field, foot, ctx.dish);
    await done(field, '補充能量完畢', mian);
    return { mian };
  }

  /* 做菜：在砧板上切一切（每樣點 3 下）→ 下鍋 → 看準時機起鍋 → 上桌 → 吃 */
  async function cook(ctx) {
    const d = MD.DISHES[ctx.dish];
    const { field, foot, head } = open('kitchen', '做' + d.name, '在砧板上切菜，每樣點 3 下');
    kid(field, 'sparkle', pick(['我可以幫忙嗎？', '好香喔……', '我要當小廚師！', '我負責在旁邊看。']));
    const board = document.createElement('div'); board.className = 'board';
    field.appendChild(board);
    const pan = document.createElement('div'); pan.className = 'pan';
    pan.innerHTML = '<span class="pan-food"></span>';
    field.appendChild(pan);
    const panFood = pan.querySelector('.pan-food');
    // 切菜
    await new Promise(resolve => {
      let left = d.ing.length;
      d.ing.forEach(icon => {
        const b = document.createElement('button');
        b.className = 'ing'; b.textContent = icon;
        let cuts = 0;
        b.onclick = () => {
          cuts++; buzz(10); S('chop');
          pow(field, b.offsetLeft + b.offsetWidth / 2 + board.offsetLeft, board.offsetTop, pick(['咚！', '咚咚！', '喀！']));
          b.style.transform = `scale(${1 - cuts * .15}) rotate(${cuts * 12}deg)`;
          if (cuts >= 3) {
            b.disabled = true;
            b.classList.add('to-pan');
            const br = b.getBoundingClientRect(), pr = pan.getBoundingClientRect();
            b.style.transform = `translate(${pr.left + pr.width / 2 - br.left - br.width / 2}px, ${pr.top + pr.height / 2 - br.top - br.height / 2}px) scale(.45)`;
            setTimeout(() => { b.style.opacity = '0'; panFood.textContent += icon; }, 380);
            if (--left === 0) setTimeout(resolve, 600);
          }
        };
        board.appendChild(b);
      });
    });
    board.remove();
    // 下鍋，看準時機起鍋
    setHead(head, '滋滋滋……', '指針到粉紅色的「剛剛好」時，按「起鍋！」');
    pan.classList.add('sizzle');
    MD.audio && MD.audio.sizzle(true);
    say(field, pick(['好香！！', '鍋子在唱歌。', '媽媽小心燙。']));
    const gauge = document.createElement('div'); gauge.className = 'gauge';
    gauge.innerHTML = '<span class="g-raw">生</span><span class="g-good">剛剛好</span><span class="g-burn">焦</span><i class="g-needle"></i>';
    foot.appendChild(gauge);
    const btn = document.createElement('button'); btn.className = 'push-btn'; btn.textContent = '起鍋！';
    foot.appendChild(btn);
    const needle = gauge.querySelector('.g-needle');
    const result = await new Promise(resolve => {
      const t0 = performance.now(), DUR = 4200; let raf, early = false;
      const loop = now => {
        const p = Math.min(1, (now - t0) / DUR);
        needle.style.left = (p * 100) + '%';
        btn.classList.toggle('ready', p >= .56 && p <= .8);
        pan.style.setProperty('--brown', p);
        if (p >= 1) { resolve('burnt'); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      btn.onclick = () => {
        const p = parseFloat(needle.style.left) / 100;
        if (p < .56) { early = true; say(field, '還沒熟喔，再等一下下。'); return; }
        cancelAnimationFrame(raf);
        resolve(p <= .8 ? (early ? 'good' : 'perfect') : 'burnt');
      };
    });
    foot.innerHTML = '';
    pan.classList.remove('sizzle');
    MD.audio && MD.audio.sizzle(false);
    const st = result === 'perfect' ? 3 : result === 'good' ? 2 : 1;
    say(field, result === 'burnt' ? '有一點點焦……可是很香！' : pick(['完美！', '顏色剛剛好！', '媽媽是大廚！']));
    setHead(head, d.name + '完成', '');
    await wait(1100);
    pan.remove();
    const mian = await eat(field, foot, ctx.dish) + st;
    await done(field, '晚餐吃光光', mian, '', st);
    return { mian };
  }

  /* 造型便當：Ethan 點一個主題，媽媽點配料，配料會自己放到飯糰上合適的位置 */
  const BENTO_SPOTS = {
    eyeL: [38, 46], eyeR: [62, 46], earL: [27, 20], earR: [73, 20], nose: [50, 58], mouth: [50, 70],
    cheekL: [29, 62], cheekR: [71, 62], center: [50, 48], top: [50, 16], bottom: [50, 84],
  };
  const DECO_PREF = {
    nori: ['eyeL', 'eyeR', 'earL', 'earR', 'mouth'],
    egg: ['center', 'top', 'bottom'],
    cheese: ['center', 'top', 'bottom'],
    carrot: ['nose', 'mouth', 'top'],
    sausage: ['earL', 'earR', 'cheekL', 'cheekR'],
    ham: ['cheekL', 'cheekR', 'center'],
    tomato: ['cheekL', 'cheekR', 'nose'],
    broccoli: ['earL', 'earR', 'top', 'bottom'],
  };
  // 媽媽做明天的造型便當
  async function bento(ctx) {
    const d = MD.DISHES[ctx.dish];
    const theme = pick(MD.BENTO_THEMES);
    const { field, foot, head } = open('kitchen', '準備明天的便當', '');
    kid(field, 'sparkle', pick([`明天的便當要${theme.name}！${theme.icon}`, `媽媽，明天可以做${theme.name}嗎？${theme.icon}`, `我想要${theme.name}便當！要很像喔！${theme.icon}`]));
    const box = document.createElement('div');
    box.className = 'kyaraben';
    box.innerHTML = `<div class="kb-side"><span>${d.icon}</span><small>${d.name}</small></div><div class="kb-rice"></div>`;
    field.appendChild(box);
    const rice = box.querySelector('.kb-rice');
    await wait(1100);
    setHead(head, `做一個${theme.name}`, '點配料，就會放到飯糰上（再點一下可以拿掉）');
    say(field, '');
    const kidEl = field.querySelector('.mini-kid'); if (kidEl) kidEl.remove();
    const placed = new Map();   // spot → deco id
    const tray = document.createElement('div'); tray.className = 'deco-tray';
    const put = id => {
      if (placed.size >= 6) { MD.ui.toast('飯糰放滿了'); return; }
      const order = [...DECO_PREF[id], ...Object.keys(BENTO_SPOTS)];
      const spot = order.find(s => !placed.has(s));
      if (!spot) return;
      placed.set(spot, id);
      const el = document.createElement('button');
      el.className = 'kb-deco'; el.textContent = MD.BENTO_DECOS[id].icon;
      el.style.left = BENTO_SPOTS[spot][0] + '%'; el.style.top = BENTO_SPOTS[spot][1] + '%';
      el.onclick = () => { placed.delete(spot); el.remove(); };
      rice.appendChild(el); buzz(10); S('pop');
    };
    Object.entries(MD.BENTO_DECOS).forEach(([id, dc]) => {
      const b = document.createElement('button');
      b.className = 'deco-btn'; b.innerHTML = `<span>${dc.icon}</span><small>${dc.name}</small>`;
      b.onclick = () => put(id);
      tray.appendChild(b);
    });
    field.appendChild(tray);
    await button(foot, '完成，放進冰箱');
    tray.remove();
    rice.querySelectorAll('.kb-deco').forEach(el => (el.onclick = null));
    const need = theme.need.slice(); let hit = 0;
    [...placed.values()].forEach(p => { const i = need.indexOf(p); if (i >= 0) { need.splice(i, 1); hit++; } });
    const score = hit === theme.need.length ? 'perfect' : placed.size ? 'creative' : 'plain';
    setHead(head, '');
    if (score === 'perfect') { kid(field, 'sparkle', `是${theme.name}！！一模一樣！我明天要給全班看！`); hearts(field, 8); }
    else if (score === 'creative') kid(field, 'think', pick([`這是……外星${theme.name}嗎？很酷。`, `${theme.name}的親戚。我喜歡。`, '這是一種新的動物。我要幫它取名字。']));
    else kid(field, 'normal', '白白的飯糰……也可以啦。');
    await wait(1500);
    box.classList.add('closed');
    await wait(700);
    const st = score === 'perfect' ? 3 : score === 'creative' ? 2 : 1;
    await done(field, '明天的便當準備好了 🍱', 1 + st, '', st);
    return { mian: 1 + st, bento: { dish: ctx.dish, by: 'mom', theme: theme.id, score } };
  }

  // 爸爸做明天的便當（很有創意）
  async function dadBento(ctx) {
    const d = MD.DISHES[ctx.dish];
    const variant = pick(Object.keys(MD.DAD_BENTO));
    const v = MD.DAD_BENTO[variant];
    const { field, foot } = open('kitchen', '爸爸說他來做便當', '');
    trio(field, { dad: 'smug', kid: 'surprised', mom: 'surprised' }).classList.add('low');
    say(field, '{dad}：「明天的便當交給我！你去休息！」');
    await wait(1500);
    const box = document.createElement('div'); box.className = 'dad-bento';
    box.innerHTML = `<span class="db-dish">${d.icon}</span><span class="db-art">${v.art}</span><small>${v.name}</small>`;
    field.appendChild(box);
    say(field, `{dad}：「${v.dad}」`);
    await wait(1300);
    const r = await choose(foot, [{ icon: '👍', label: '很有創意！', v: 'ok' }, { icon: '🪄', label: '我來補救一下', v: 'fix' }, { icon: '📸', label: '拍照留念', v: 'pic' }]);
    if (r === 'fix') { S('sparkle'); box.querySelector('.db-art').textContent = '🐻'; trio(field, { dad: 'shy', kid: 'happy', mom: 'smile' }); say(field, '（媽媽偷偷把它改成小熊。爸爸假裝沒看到。）'); }
    else if (r === 'pic') { S('shutter'); trio(field, { dad: 'sparkle', kid: 'happy', mom: 'happy' }); say(field, '{dad}：「這張要當手機桌布！」'); }
    else { trio(field, { dad: 'happy', kid: 'think', mom: 'smile' }); say(field, `{kid}：「${v.kid}」`); }
    hearts(field, 5);
    await wait(1900);
    await done(field, '{dad}的愛心便當 🍱', 3, '明天就知道同學的反應了');
    return { mian: 3, bento: { dish: ctx.dish, by: r === 'fix' ? 'mom' : 'dad', variant, theme: r === 'fix' ? 'bear' : null, score: r === 'fix' ? 'perfect' : 'dad' } };
  }

  // 晚餐後：準備明天的便當（有時候媽媽做，有時候爸爸搶著做）
  async function bentoNight(ctx) {
    return Math.random() < .4 ? dadBento(ctx) : bento(ctx);
  }

  /* 中午在家吃（週末） */
  async function lunch(ctx) { return cook(ctx); }

  /* ── 打爸爸 ── */
  const WEAPONS = [
    { id: 'slipper', name: '拖鞋迴旋鏢', hit: ['啪！', '咻～啪！', '正中紅心！'] },
    { id: 'pillow',  name: '抱枕連打',   hit: ['噗！', '噗噗！', '蓬！'] },
    { id: 'glare',   name: '死亡凝視',   hit: ['……', '（瞪）', '（溫度下降）'] },
  ];
  const DAD_SCENES = [
    { icon: '🛋️', line: '「你今天應該很輕鬆吧？」' },
    { icon: '🍰', line: '（爸爸吃掉了你藏在冰箱的蛋糕）' },
    { icon: '📱', line: '（爸爸躺在沙發上：「我在陪孩子啊。」）' },
    { icon: '🍮', line: '（爸爸吃掉了{kid}的獎勵布丁）' },
  ];
  async function dad() {
    const sc = pick(DAD_SCENES);
    const { field, foot, head } = open('tvroom', '回到家……', '');
    const target = document.createElement('div');
    target.className = 'dad-target';
    target.innerHTML = MD.art.char('dad', 'smug');
    field.appendChild(target);
    say(field, sc.line);
    const wid = await choose(foot, WEAPONS.map(x => ({ icon: MD.art.weapon(x.id), label: x.name, v: x.id })));
    const w = WEAPONS.find(x => x.id === wid);
    setHead(head, w.name + '！', '一直點{dad}');
    const HP = 8; let hp = HP;
    foot.innerHTML = `<div class="hp"><div class="hp-label">${F('{dad}的白目值')}</div><div class="meter"><i style="width:100%"></i></div></div>`;
    const bar = foot.querySelector('i');
    await new Promise(resolve => {
      field.onpointerdown = e => {
        if (hp <= 0) return;
        hp--;
        const r = field.getBoundingClientRect();
        if (w.id !== 'glare') {
          const p = document.createElement('div'); p.className = 'projectile'; p.innerHTML = MD.art.weapon(w.id);
          p.style.left = (r.width / 2 + (Math.random() > .5 ? 1 : -1) * r.width * .45) + 'px'; p.style.top = (r.height * .85) + 'px';
          field.appendChild(p);
          requestAnimationFrame(() => { p.style.left = (r.width / 2 - 20) + 'px'; p.style.top = (r.height / 2 - 30) + 'px'; p.style.transform = 'rotate(540deg) scale(1.3)'; p.style.opacity = '.2'; });
          setTimeout(() => p.remove(), 260);
        } else target.style.filter = `grayscale(${(HP - hp) / HP})`;
        target.classList.remove('hit'); void target.offsetWidth; target.classList.add('hit');
        target.innerHTML = MD.art.char('dad', hp > HP / 2 ? 'surprised' : 'hurt');
        pow(field, e.clientX - r.left, e.clientY - r.top, pick(w.hit));
        say(field, pick(['等、等一下！', '我可以解釋！', '老婆大人饒命！', '我錯了我錯了！']));
        bar.style.width = (hp / HP * 100) + '%';
        buzz(w.id === 'pillow' ? 12 : 30); S(w.id === 'glare' ? 'soft' : 'whack');
        if (hp <= 0) { field.onpointerdown = null; resolve(); }
      };
    });
    say(field, w.id === 'glare' ? '（{dad}石化了）' : '哇啊啊啊——！');
    buzz([40, 60, 80]); S('fly');
    target.style.filter = ''; target.classList.remove('hit'); target.classList.add('fly');
    await wait(1300);
    const star = document.createElement('div'); star.className = 'twinkle-star'; star.textContent = '⭐'; field.appendChild(star);
    MD.state.dadHits++;
    await wait(400);
    await done(field, '{dad}飛到天邊變成星星了', 2, `（累計 ${MD.state.dadHits} 次。他說他會反省）`);
    return { mian: 2 };
  }

  /* ══ 晚上回家的全家時光 ══
   * 每天晚餐前有機會發生一件事：有時候好笑（打爸爸），有時候溫馨（全家福、爸爸下廚……）
   */
  function trio(field, exprs = {}) {
    let t = field.querySelector('.trio');
    if (!t) { t = document.createElement('div'); t.className = 'trio'; field.appendChild(t); }
    const e = Object.assign({ mom: 'smile', dad: 'smile', kid: 'happy' }, exprs);
    t.innerHTML = `<div class="t-mom">${MD.art.char('mom', e.mom)}</div><div class="t-dad">${MD.art.char('dad', e.dad)}</div><div class="t-kid">${MD.art.char('kid', e.kid)}</div>`;
    return t;
  }

  // 爸爸下廚：黑黑的荷包蛋
  async function dadCook() {
    const { field, foot } = open('tvroom', '爸爸下廚了', '');
    trio(field, { dad: 'smug', kid: 'surprised', mom: 'surprised' });
    const plate = document.createElement('div'); plate.className = 'plate small'; plate.innerHTML = '<span class="dish burnt">🍳</span>';
    field.appendChild(plate);
    say(field, '{dad}：「今天換我煮！特製荷包蛋！」');
    await wait(1200);
    const v = await choose(foot, [{ icon: '😋', label: '好吃！', v: 'yum' }, { icon: '🤔', label: '很有創意', v: 'idea' }, { icon: '📸', label: '拍照留念', v: 'pic' }]);
    if (v === 'yum') { trio(field, { dad: 'sparkle', kid: 'happy', mom: 'smile' }); say(field, '{dad}：「真的嗎！那我明天再煮！」（{kid}偷偷搖頭）'); }
    else if (v === 'idea') { trio(field, { dad: 'shy', kid: 'think', mom: 'smile' }); say(field, '{kid}：「爸爸，這個蛋是黑色的。可是我會吃完。」'); }
    else { trio(field, { dad: 'happy', kid: 'sparkle', mom: 'happy' }); say(field, '{dad}：「這張要傳到家族群組！」'); }
    hearts(field, 6, field.clientWidth / 2, field.clientHeight * .6);
    await wait(1900);
    await done(field, '爸爸的愛心荷包蛋 🍳', 3, '雖然焦了，可是是愛心的形狀（大概）');
    return { mian: 3 };
  }

  // 全家福：三個人都在笑的時候按快門
  async function photo() {
    const { field, foot } = open('tvroom', '全家福', '大家都在笑的時候，按快門！');
    const t = trio(field);
    t.classList.add('posing');
    say(field, '{dad}：「好，我設定倒數了……咦？怎麼按？」');
    const btn = document.createElement('button'); btn.className = 'push-btn'; btn.textContent = '📸 喀嚓';
    foot.appendChild(btn);
    const FACES = { mom: ['smile', 'happy', 'surprised'], dad: ['smile', 'happy', 'sleepy', 'surprised', 'think'], kid: ['happy', 'sparkle', 'think', 'surprised', 'shy'] };
    const SMILE = ['smile', 'happy', 'sparkle'];
    let tries = 0, cur = {}, h;
    const shuffle = n => {
      const allSmile = n % 3 === 2;   // 每隔幾下，大家會同時笑一次
      cur = allSmile ? { mom: 'happy', dad: 'happy', kid: 'sparkle' } : { mom: pick(FACES.mom), dad: pick(FACES.dad), kid: pick(FACES.kid) };
      trio(field, cur);
      btn.classList.toggle('ready', SMILE.includes(cur.mom) && SMILE.includes(cur.dad) && SMILE.includes(cur.kid));
    };
    let n = 0; shuffle(n);
    await new Promise(resolve => {
      h = setInterval(() => shuffle(++n), 850);
      btn.onclick = () => {
        tries++;
        const flash = document.createElement('div'); flash.className = 'cam-flash'; field.appendChild(flash);
        setTimeout(() => flash.remove(), 400); buzz(15); S('shutter');
        if (btn.classList.contains('ready')) { clearInterval(h); resolve(); }
        else say(field, cur.dad === 'sleepy' ? '……爸爸眨眼了。再一張！' : cur.kid === 'think' ? '{kid}在看別的地方。再一張！' : '有人沒有笑！再一張！');
      };
    });
    btn.remove();
    t.classList.add('framed');
    say(field, '{kid}：「這張要貼在冰箱上。最中間。」');
    hearts(field, 8);
    await wait(1800);
    const first = !MD.state.flags.familyPhoto; MD.state.flags.familyPhoto = true;
    const st = tries <= 1 ? 3 : tries <= 3 ? 2 : 1;
    await done(field, '全家福拍好了 📸', 2 + st, '', st);
    return { mian: 2 + st, drawing: 'family', memory: first ? { id: 'family-photo', icon: '📸', title: '第一張全家福' } : null };
  }

  // 騎馬打仗：爸爸當馬
  async function horse() {
    const { field, foot } = open('tvroom', '爸爸當馬', '一直點，幫{kid}喊「駕！」');
    const stage = document.createElement('div'); stage.className = 'horse';
    stage.innerHTML = `<div class="h-dad">${MD.art.char('dad', 'happy')}</div><div class="h-kid">${MD.art.char('kid', 'sparkle')}</div>`;
    field.appendChild(stage);
    say(field, '{kid}：「爸爸是馬！我是騎士！」');
    foot.innerHTML = '<div class="meter"><i></i></div>';
    const meter = foot.querySelector('i');
    let n = 0; const NEED = 14;
    await new Promise(resolve => {
      field.onpointerdown = e => {
        n++; buzz(8);
        const r = field.getBoundingClientRect();
        S('step'); S('pop'); pow(field, e.clientX - r.left, e.clientY - r.top, pick(['駕！', '駕駕！', '衝啊！']));
        stage.style.left = (20 + (n / NEED) * 60) + '%';
        stage.classList.remove('gallop'); void stage.offsetWidth; stage.classList.add('gallop');
        meter.style.width = (n / NEED * 100) + '%';
        if (n === 7) { stage.querySelector('.h-dad').innerHTML = MD.art.char('dad', 'think'); say(field, '{dad}：「馬……馬需要休息一下……」'); }
        if (n >= NEED) { field.onpointerdown = null; resolve(); }
      };
    });
    stage.querySelector('.h-dad').innerHTML = MD.art.char('dad', 'hurt');
    say(field, '{dad}：「爸爸的腰……」　{kid}：「再一圈！」');
    hearts(field, 6);
    await wait(1900);
    await done(field, '客廳騎馬大冒險 🐴', 3, '（{dad}今晚要貼痠痛貼布）');
    return { mian: 3, drawing: 'family' };
  }

  // 爸爸偷偷買了花
  async function flowers() {
    const { field, foot } = open('tvroom', '爸爸回來了', '');
    trio(field, { dad: 'shy', kid: 'sparkle', mom: 'surprised' });
    const f = document.createElement('div'); f.className = 'bouquet'; f.textContent = '💐';
    field.appendChild(f);
    say(field, '{dad}：「路過花店……就、就買了。」');
    await wait(1300);
    const v = await choose(foot, [{ icon: '🤗', label: '抱一下', v: 'hug' }, { icon: '😏', label: '今天是什麼日子？', v: 'why' }, { icon: '🏺', label: '插起來', v: 'vase' }]);
    if (v === 'hug') { trio(field, { dad: 'happy', kid: 'sparkle', mom: 'shy' }); say(field, '{kid}：「我也要抱！」（三個人抱成一團）'); hearts(field, 10); }
    else if (v === 'why') { trio(field, { dad: 'surprised', kid: 'think', mom: 'smug' }); say(field, '{dad}：「沒有什麼日子……就是想買。」　{kid}：「爸爸臉紅了。」'); hearts(field, 5); }
    else { trio(field, { dad: 'smile', kid: 'happy', mom: 'smile' }); say(field, '{kid}：「我來數有幾朵！……12 朵！不對，11 朵。有一朵是葉子。」'); hearts(field, 5); }
    await wait(2100);
    const first = !MD.state.flags.flowers; MD.state.flags.flowers = true;
    await done(field, '餐桌上多了一束花 💐', 3);
    return { mian: 3, memory: first ? { id: 'flowers', icon: '💐', title: '爸爸偷偷買的花' } : null };
  }

  // 全家一起摺衣服
  async function laundry() {
    const { field, foot } = open('tvroom', '全家一起摺衣服', '點衣服，把它摺好');
    trio(field, { dad: 'normal', kid: 'think', mom: 'smile' }).classList.add('low');
    say(field, '{kid}：「襪子我來配對。要同一個顏色、同一個長度。」');
    const clothes = ['👕', '👖', '🧦', '👗', '🩳', '🧦', '👚', '🧣'];
    let left = clothes.length;
    foot.innerHTML = '<span class="counter">🧺 0</span>';
    const cnt = foot.querySelector('.counter');
    await new Promise(resolve => {
      clothes.forEach((c, i) => {
        const b = document.createElement('button'); b.className = 'cloth'; b.textContent = c;
        b.style.left = (8 + (i % 4) * 23 + rand(-3, 3)) + '%'; b.style.top = (10 + Math.floor(i / 4) * 20 + rand(-3, 3)) + '%';
        b.style.transform = `rotate(${rand(-30, 30)}deg)`;
        b.onclick = () => { b.classList.add('folded'); buzz(8); S('paper'); cnt.textContent = `🧺 ${clothes.length - left + 1}`; if (--left === 0) setTimeout(resolve, 300); };
        field.appendChild(b);
      });
    });
    trio(field, { dad: 'smug', kid: 'surprised', mom: 'surprised' });
    const swan = document.createElement('div'); swan.className = 'bouquet'; swan.textContent = '🦢';
    field.appendChild(swan);
    say(field, '{dad}：「你們看！我把毛巾摺成天鵝了！」　{kid}：「……可以教我嗎？」');
    await wait(2200);
    await done(field, '衣服摺好了，還多了一隻天鵝', 3);
    return { mian: 3 };
  }

  // 選一件今晚的事（不會連續兩天一樣）
  async function family() {
    const pool = { whack: dad, dadCook, photo, horse, flowers, laundry };
    const last = MD.state.flags.lastFamily;
    const id = pick(Object.keys(pool).filter(k => k !== last));
    MD.state.flags.lastFamily = id;
    return pool[id]();
  }

  MD.ACTS = { serve, pickup, rally, match, leaves, slide, bubbles, school, homework, shoes, market, cafe, breakfast, snack, cook, lunch, bento, bentoNight, dad, family };
})();
