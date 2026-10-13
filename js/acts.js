/*
 * 互動（手指在做事，心在被療癒）
 * 每個互動都不會失敗，最後回傳 { mian: 得到的綿, memory?, drawing? }
 */
window.MD = window.MD || {};

(function () {
  const $scene = () => document.getElementById('scene');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => MD.pick(arr);
  // 回首頁時把進行中的場景作廢：之後的等待都不會再繼續（避免舊場景又跳出來）
  let GEN = 0;
  const wait = ms => { const g = GEN; return new Promise(r => setTimeout(() => { if (g === GEN) r(); }, ms)); };
  const buzz = ms => { if (MD.state.settings.vibrate && navigator.vibrate) navigator.vibrate(ms); };
  const F = t => MD.fill(t);
  const S = name => MD.audio && MD.audio.sfx(name);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
      h.className = 'heart'; h.textContent = pick(['♡', '✦', '♡', '·']);
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
    const visits = MD.state.placeVisits.tennis || 0;
    const total = visits < 2 ? 6 : visits < 5 ? 9 : 12; let got = 0;
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
    const st = starsBy(since(t0), total * .7, total * 1.2, true);
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

  /* ── 學校：接放學 ──
   * 情境依成長階段輪流（見 MD.PICKUPS），不會連續重複。國中時他會開始害羞、有自己的世界。
   */
  const FRIENDS = ['小宇', '阿哲', '小米', '凱凱', '安安'];
  async function school(ctx) {
    const st = MD.stage();
    const { field, foot } = open('class', st === 'jh' ? '放學了（國中）' : '放學了', '');
    const t = ctx.today || {};
    const s = MD.state;
    const last = s.flags.lastPickup;
    const pool = MD.PICKUPS[st].filter(p => p !== last && !(p === 'quiet' && s.flags.lastQuiet >= s.day - 3));
    const kind = pick(pool);
    s.flags.lastPickup = kind;
    if (kind === 'quiet') s.flags.lastQuiet = s.day;
    let mian = 3;
    const memo = (id, icon, title) => { if (!s.flags['m_' + id]) { s.flags['m_' + id] = true; t.memories && t.memories.push({ id, icon, title }); } };
    const enter = (expr, line, opts) => { const k = kid(field, expr, line, opts); k.classList.add('run-in'); return k; };

    if (kind === 'greet') {
      const wantsHug = MD.hasTrait('asperger') ? Math.random() < .45 : Math.random() < .75;
      enter(wantsHug ? 'sparkle' : 'think', '', { cls: wantsHug ? 'arms-open' : 'stiff' });
      await wait(900);
      say(field, wantsHug ? pick(['媽媽——！', '我在這裡！！', '媽媽我好想你！']) : pick(['……（小步小步地走過來）', '……（低著頭走過來）', '……（慢慢地走，一直看地上的線）']));
      const v = await choose(foot, [{ icon: '🤗', label: '抱抱', v: 'hug' }, { icon: '✋', label: '擊掌', v: 'five' }]);
      if ((v === 'hug') === wantsHug) { kid(field, 'happy', wantsHug ? pick(['（整個人撲過來）', '（抱住你的腰，不放開）']) : pick(['啪！（剛剛好的力氣）', '啪！今天的擊掌是 100 分。'])); hearts(field, 10); buzz([20, 40, 20]); mian = 5; }
      else if (v === 'hug') { kid(field, 'shy', pick(['……今天擊掌就好。', '……抱抱可以等一下嗎？'])); await wait(1100); say(field, '啪。（他還是笑了）'); }
      else { kid(field, 'surprised', '……要抱抱啦！'); await wait(900); kid(field, 'happy', '（衝過來抱住你的腿）'); hearts(field, 6); }
    } else if (kind === 'show') {
      const item = pick([
        { icon: '🎨', what: '一張畫', yay: '這是我們家。爸爸是那個圓圓的。', ask: '這是你在煮飯，旁邊那個是鍋子在唱歌。' },
        { icon: '⭐', what: '一張貼紙', yay: '老師說我今天很專心！整整 10 分鐘！', ask: '因為我幫同學撿鉛筆。撿了 4 次。' },
        { icon: '🐛', what: '一個小盒子', yay: '是毛毛蟲！我要叫牠阿根廷龍。', ask: '牠在操場的葉子上。我問過牠了，牠說可以來我們家。' },
        { icon: '💯', what: '一張考卷', yay: '100 分！我每個字都寫在格子裡面。', ask: '最後一題我寫了兩次，因為第一次不夠漂亮。' },
        { icon: '🌰', what: '一顆橡實', yay: '這是全世界最圓的橡實。送你。', ask: '我在樹下找了一整個下課。它是第 37 顆，最好的一顆。' },
        { icon: '🏅', what: '一個獎牌', yay: '跳繩比賽第三名！我跳了 87 下！', ask: '其實我數了，是 88 下，老師數錯了。但沒關係。' },
        { icon: '🧪', what: '一個瓶子', yay: '自然課做的！裡面是會長出結晶的水。', ask: '要放在窗邊三天。我會每天檢查。每一個小時。' },
      ]);
      enter('sparkle', `媽媽你看！我有${item.what}！`);
      const it = document.createElement('div'); it.className = 'show-item'; it.textContent = item.icon; field.appendChild(it);
      await wait(1000);
      const v = await choose(foot, [{ icon: '🤩', label: '哇，好厲害！', v: 'yay' }, { icon: '👂', label: '跟我說說看', v: 'ask' }]);
      kid(field, v === 'yay' ? 'happy' : 'sparkle', item[v]); hearts(field, 6); mian = 4;
    } else if (kind === 'quiet') {
      enter('sad', '');
      await wait(900);
      say(field, st === 'jh' ? pick(['……今天在班上，好像沒有人懂我在說什麼。', '……我不想講。', '……分組的時候，我又是最後一個。']) : pick(['……今天有人說我講話很奇怪。', '……我在下課的時候，一個人。', '……老師說我太大聲了。我不知道怎麼小聲。']));
      const v = await choose(foot, [{ icon: '🤗', label: '先抱一下', v: 'hug' }, { icon: '🍦', label: '去吃冰淇淋', v: 'ice' }, { icon: '👂', label: '我在聽', v: 'listen' }]);
      if (v === 'hug') { kid(field, 'cry', st === 'jh' ? '……（沒有推開你。過了很久才說：好了）' : '……（把臉埋在你的衣服裡，很久）'); await wait(1600); kid(field, 'smile', '……好了。我好一點了。'); }
      else if (v === 'ice') { kid(field, 'think', '……草莓口味的？'); await wait(1300); kid(field, 'smile', '吃到一半他說：「我覺得我不奇怪，是很特別。」'); }
      else { kid(field, 'think', '……（走了一段路，才開始慢慢說）'); await wait(1600); kid(field, 'smile', '說完以後，他靠著你走，比平常更近。'); }
      hearts(field, 5); mian = 5;
      memo('quiet-day', '🌧️', '不太開心的那天，你一直都在');
    } else if (kind === 'handshake') {
      enter('sparkle', '媽媽！我發明了一個秘密握手！看好喔！');
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
          G.forEach(g => { const b = document.createElement('button'); b.className = 'big-choice'; b.innerHTML = `<span>${g}</span>`; b.onclick = () => { got.push(g); show.textContent = got.join(' '); if (got.length === 3) res(); }; foot.appendChild(b); });
        });
        foot.innerHTML = '';
        ok = got.join() === seq.join();
        if (!ok && attempt === 0) { kid(field, 'happy', `不對啦！是 ${seq.join(' ')}。再一次！`); show.textContent = ''; }
      }
      kid(field, ok ? 'sparkle' : 'happy', ok ? '一模一樣！這是我們兩個人的秘密。' : '沒關係，明天再練。爸爸也還不會。');
      hearts(field, ok ? 10 : 4); mian = ok ? 5 : 3;
    } else if (kind === 'forgot') {
      const lost = pick([{ icon: '🧥', name: '外套' }, { icon: '💧', name: '水壺' }, { icon: '📒', name: '聯絡簿' }, { icon: '🧢', name: '帽子' }, { icon: '🎒', name: '餐袋' }]);
      enter('happy', '媽媽！');
      await wait(900);
      say(field, `老師拿著${lost.name}追出來：「${F('{kid}')}，你的${lost.name}！」`);
      const it = document.createElement('div'); it.className = 'show-item'; it.textContent = lost.icon; field.appendChild(it);
      const v = await choose(foot, [{ icon: '🙏', label: '謝謝老師', v: 'thanks' }, { icon: '😅', label: '又來了～', v: 'again' }]);
      kid(field, 'think', v === 'thanks' ? `……我的${lost.name}自己跑出來了。` : `${lost.name}比較喜歡學校，所以想留下來。`);
      await wait(1200); say(field, pick(['（這已經是這個月第 4 次了）', '（上禮拜是另一隻鞋子）', '（老師笑著揮揮手）']));
    } else if (kind === 'friend') {
      const name = pick(FRIENDS);
      enter('happy', st === 'jh' ? `媽，這是${name}。` : `媽媽！這是${name}！他也喜歡${pick(['網球', '恐龍', '星星', '樂高'])}！`);
      const it = document.createElement('div'); it.className = 'show-item'; it.textContent = '🧒'; field.appendChild(it);
      await wait(1000);
      const v = await choose(foot, [{ icon: '👋', label: '你好呀', v: 'hi' }, { icon: '🍪', label: '要一起吃點心嗎？', v: 'snack' }]);
      if (v === 'hi') say(field, `${name}：「${F('{kid}')}媽媽好！${F('{kid}')}說你做的飯糰是世界第一。」`);
      else say(field, `${name}：「真的可以嗎！」　${F('{kid}')}：「我媽很會做點心。」（偷偷驕傲）`);
      await wait(1800); kid(field, 'sparkle', st === 'jh' ? `……媽，${name}下次可以來我們家嗎？` : `我們說好明天下課一起玩！`);
      hearts(field, 6); mian = 4;
      memo('first-friend', '🧒', `${F('{kid}')}帶${name}來給你認識`);
    } else if (kind === 'cool') {
      enter('normal', '');
      await wait(900);
      say(field, '（他跟同學一起走出校門，看到你，假裝沒看到）');
      const v = await choose(foot, [{ icon: '👋', label: '大力揮手', v: 'wave' }, { icon: '📱', label: '傳訊息給他', v: 'msg' }, { icon: '🚶', label: '在轉角等', v: 'corner' }]);
      if (v === 'wave') { kid(field, 'shy', '……媽！（但還是很小很小地揮了一下手）'); await wait(1500); say(field, '同學：「你媽好可愛喔。」　他：「……還好啦。」（耳朵紅了）'); }
      else if (v === 'msg') { S('chime'); say(field, '你：「我在轉角。」　他：「好」（附一個小熊貼圖）'); await wait(1600); kid(field, 'smile', '……（走到轉角，接過你手上的水）謝啦。'); }
      else { kid(field, 'smile', '（他跟同學說掰掰，小跑步到轉角）媽，謝謝你沒有在門口等。'); await wait(1500); say(field, '……走了幾步，他說：「今天其實有點想你。」'); hearts(field, 6); }
      mian = 4;
      memo('cool-corner', '🚶', '從校門口，變成在轉角等他');
    } else if (kind === 'crush') {
      enter('think', '');
      await wait(900);
      say(field, '……媽，怎樣才知道一個人喜歡你？');
      const v = await choose(foot, [{ icon: '💬', label: '你覺得呢？', v: 'ask' }, { icon: '📖', label: '說我跟你爸的故事', v: 'story' }, { icon: '🤫', label: '我會幫你保密', v: 'secret' }]);
      if (v === 'ask') { kid(field, 'shy', '……我覺得，是她借你橡皮擦的時候，會選你。'); await wait(1600); say(field, '（你忍住沒有笑。這是很認真的研究。）'); }
      else if (v === 'story') { kid(field, 'surprised', `……爸爸以前每天繞路，只為了跟你搭同一班公車？`); await wait(1600); kid(field, 'happy', '……爸爸好遜。（但他笑得很開心）'); }
      else { kid(field, 'shy', '……好。那我跟你說，她叫……算了，下次再說。'); await wait(1500); say(field, '（三天後，他自己跑來告訴你了）'); }
      hearts(field, 6); mian = 5;
      memo('first-crush', '💌', '他第一次問你，關於喜歡一個人');
    } else if (kind === 'exam') {
      enter('sad', '……');
      await wait(900);
      say(field, pick(['這次數學……考不好。', '英文小考，不及格。', '理化好難……我都聽不懂。']));
      const v = await choose(foot, [{ icon: '🤗', label: '有盡力就好', v: 'hug' }, { icon: '📊', label: '一起看哪裡錯', v: 'review' }, { icon: '🧋', label: '先去喝珍奶', v: 'tea' }]);
      if (v === 'hug') kid(field, 'smile', '……嗯。我下次再試一次。');
      else if (v === 'review') { kid(field, 'think', '……原來是這裡看錯了。'); await wait(1400); kid(field, 'smile', '媽，你講解得比老師清楚。'); }
      else { kid(field, 'happy', '……半糖少冰。（心情好了一半）'); await wait(1400); say(field, '喝完他說：「我明天會早點起來複習。」'); }
      hearts(field, 4); mian = 4;
    } else {
      enter('sleepy', '……');
      await wait(900);
      say(field, '……好累。今天有八堂課加一個小考。');
      const v = await choose(foot, [{ icon: '🎒', label: '我幫你背書包', v: 'bag' }, { icon: '🍙', label: '先吃點東西', v: 'eat' }, { icon: '🎧', label: '安靜陪他走', v: 'quiet' }]);
      if (v === 'bag') { kid(field, 'shy', '不用啦……'); await wait(1200); kid(field, 'smile', '……好啦，背一下下就好。（書包比你想的重好多）'); }
      else if (v === 'eat') kid(field, 'happy', '（三口吃掉一個飯糰）……活過來了。');
      else { kid(field, 'smile', '（一路上都沒說話。快到家時，他把一邊耳機遞給你）'); hearts(field, 5); }
      mian = 4;
    }
    await wait(1500);
    // 便當盒回來了（前一天晚上準備的）
    const b = t.bento;
    if (b) {
      const box = document.createElement('div'); box.className = 'bento-return';
      box.innerHTML = `🍱${b.by === 'dad' ? '👨' : ''}`;
      field.appendChild(box);
      let line;
      const c = b.cond && MD.BENTO.conds.find(x => x.id === b.cond);
      if (b.by === 'dad') line = MD.DAD_BENTO[b.variant] ? MD.DAD_BENTO[b.variant].school : '爸爸做的便當，吃光光了！';
      else if (c) line = (st === 'jh' && c.jh ? c.jh : c)[b.met ? 'yes' : 'no'];
      else line = '便當吃光光了！';
      kid(field, b.by === 'dad' || b.met ? 'happy' : 'think', line);
      mian += b.met || b.by === 'dad' ? 2 : 1;
      await wait(1800);
    }
    // 學校的小新聞（依階段，輪流不重複）
    if (!['quiet', 'crush', 'exam'].includes(kind) && Math.random() < .7) {
      const news = pick(MD.SCHOOL_NEWS[st]);
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

  /* ── 國中出門：他自己會找東西了，只是常常忘了今天要帶什麼 ── */
  const FORGOT = [
    { today: '今天有體育課。', need: 'gym' },
    { today: '今天要交數學作業。', need: 'math' },
    { today: '今天放學要搭公車去比賽。', need: 'card' },
    { today: '今天要考英文聽力。', need: 'phones' },
    { today: '今天下午有實驗課，老師說要帶水。', need: 'bottle' },
  ];
  const TABLE = { gym: ['👕', '運動服'], math: ['📄', '數學作業'], card: ['💳', '悠遊卡'], phones: ['🎧', '耳機'], bottle: ['🧴', '水壺'] };
  async function forgot() {
    const f = pick(FORGOT);
    const { field, foot } = open('home', '出門前', '桌上有一樣他今天會用到的，拿給他');
    kid(field, 'normal', `媽，我走了。${f.today}`);
    const items = [f.need, ...Object.keys(TABLE).filter(k => k !== f.need).sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
    let tries = 0;
    await new Promise(resolve => {
      foot.innerHTML = '';
      items.forEach(k => {
        const b = document.createElement('button');
        b.className = 'big-choice'; b.innerHTML = `<span>${TABLE[k][0]}</span><small>${TABLE[k][1]}</small>`;
        b.onclick = () => {
          if (k === f.need) { foot.innerHTML = ''; resolve(); return; }
          tries++; buzz(8);
          b.disabled = true; b.style.opacity = '.35';
          say(field, pick(['那個今天用不到啦。', '不是那個……', '嗯？那個放著就好。']));
        };
        foot.appendChild(b);
      });
    });
    kid(field, 'shy', pick(['……啊。謝啦，媽。', '差點忘了。（接過去，沒有回頭，但揮了揮手）', '喔對。……謝謝。']));
    if (!tries) hearts(field, 4);
    await wait(1500);
    await done(field, '出門囉', tries ? 2 : 3, tries ? '' : '「你怎麼知道？」');
    return { mian: tries ? 2 : 3 };
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
    const { field, foot, head } = open('cafe', '{me} 的四十分鐘', F(who));
    say(field, pick(['在這裡，她不是誰的媽媽。她是 {me}。', '推開咖啡店的門，她又變回了 {me}。', '接下來四十分鐘，她只是 {me}。']));
    await wait(2400);
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
    // 店員叫她的名字
    say(field, '店員：「{me}，你的{drink}好了。」');
    await wait(1800);
    say(field, pick(['……好久沒有人這樣叫我了。', '（她愣了一下，然後笑了）', '……對，我是 {me}。']));
    await wait(1800);
    say(field, '');
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
      '<b>{dad}</b>{me}，{kid}問你什麼時候回來。他說「我想媽媽了，可是你慢慢來」。',
      '<b>{dad}</b>（照片）{kid}用積木蓋了一間咖啡店，說是要送給 {me} 的。',
      '<b>{friend}</b>{me}！下次我們一起去那家咖啡店吧！好久沒有好好聊天了。',
      '<b>{dad}</b>{me}，晚餐我來煮。你多坐一下沒關係。',
      '<b>{friend}</b>{me}，我最近在想，你以前說想翻譯的那本書，還有在看嗎？',
    ]));
    field.appendChild(msg);
    await wait(3000);
    const first = !MD.state.flags.cafe;
    MD.state.flags.cafe = true;
    await done(field, '{me} 的四十分鐘 ☕', 4, '充好電了，回家吧');
    return { mian: 4, memory: first ? { id: 'cafe', icon: '☕', title: '她不只是媽媽，她是 {me}' } : null };
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
  MD.TRIP_FOOD = {
    ramen: { name: '豚骨拉麵', unit: '碗', icon: '🍜', nut: 'cp', like: 'love' },
    croissant: { name: '巴黎可頌', unit: '個', icon: '🥐', nut: 'c', like: 'love' },
  };
  async function eat(field, foot, dishId, opts = {}) {
    const d = MD.DISHES[dishId] || MD.TRIP_FOOD[dishId];
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
      kid(field, 'sad', MD.line('eatVeg'));
      const v = await choose(foot, [{ icon: '🎭', label: '偽裝一下', v: 'mix' }, { icon: '🥄', label: '吃一口就好', v: 'one' }]);
      if (v === 'mix') {
        plate.classList.add('mixing');
        await wait(700);
        dish.textContent = '🍚';
        plate.classList.remove('mixing');
        kid(field, 'think', '');
        await wait(500);
        kid(field, 'smile', MD.line('disguised'));
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
    kid(field, 'happy', MD.line(d.like === 'love' ? 'eatLove' : 'eatOk'));
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

  /* 準備明天的便當：先看明天的狀況，再選主食、主菜、配菜。
   * 選得對不對，隔天放學時他會告訴你（便當盒回來了）。 */
  const BENTO_STEPS = [['base', '主食'], ['main', '主菜'], ['side', '配菜']];
  async function bento(ctx) {
    const st = MD.stage();
    const B = MD.BENTO;
    const conds = B.conds.filter(c => !c.stages || c.stages.includes(st));
    const cond = pick(conds);
    const { field, foot, head } = open('kitchen', '準備明天的便當', '');
    kid(field, st === 'jh' ? 'normal' : 'think', cond.kid);
    await wait(1500);
    say(field, '');
    const kidEl = field.querySelector('.mini-kid'); if (kidEl) kidEl.remove();
    const box = document.createElement('div');
    box.className = 'bento lunchbox';
    box.innerHTML = '<div class="cell big" data-k="base"><small>主食</small></div><div class="cell" data-k="main"><small>主菜</small></div><div class="cell" data-k="side"><small>配菜</small></div>';
    field.appendChild(box);
    const note = document.createElement('div');
    note.className = 'bento-note';
    note.innerHTML = `<b>明天</b>${F(cond.note)}<span class="bn-goal">${F(cond.hint)}</span><span class="bn-nut">${['c', 'p', 'v'].map(k => `<i data-n="${k}" style="--c:${MD.NUT[k].color}">★</i>`).join('')} 三種營養</span>`;
    field.appendChild(note);
    await wait(500);
    // 晚餐多做一份，也可以當主菜（湯麵類不適合放便當）
    const dinner = ctx.dish && MD.DISHES[ctx.dish];
    const mains = B.main.slice();
    if (dinner && dinner.meal === 'm' && dinner.unit !== '碗') {
      mains.unshift({ id: 'dinner', name: '晚餐的' + dinner.name, icon: dinner.icon, nut: dinner.nut, tags: [...(dinner.like === 'love' ? ['love'] : []), ...(/咖哩|糖醋|燴|滷/.test(dinner.name) ? ['saucy'] : [])] });
    }
    const pool = { base: B.base, main: mains, side: B.side };
    const chosen = {};
    for (const [k, label] of BENTO_STEPS) {
      setHead(head, `選${label}`, '想想明天的狀況');
      // 三個選項，至少一個符合明天的需要
      let opts = pool[k].filter(o => !o.stages || o.stages.includes(st)).sort(() => Math.random() - .5);
      if (k === 'main' && opts.some(o => o.id === 'dinner')) opts = [opts.find(o => o.id === 'dinner'), ...opts.filter(o => o.id !== 'dinner')];
      let three = opts.slice(0, 3);
      const good = opts.find(o => cond.good && cond.good(o));
      if (good && !three.includes(good) && cond.slot === k) three[2] = good;
      three = three.sort(() => Math.random() - .5);
      const v = await choose(foot, three.map(o => ({ icon: o.icon, label: `${o.name}<em class="dots">${[...o.nut].map(n => `<i style="background:${MD.NUT[n].color}"></i>`).join('')}</em>`, v: o })));
      chosen[k] = v;
      const cell = box.querySelector(`[data-k="${k}"]`);
      cell.innerHTML = `<span>${v.icon}</span><small>${v.name}</small>`;
      cell.classList.add('filled');
      buzz(10); S('pop');
      const have = new Set(Object.values(chosen).flatMap(o => [...o.nut]));
      note.querySelectorAll('.bn-nut i').forEach(i => i.classList.toggle('on', have.has(i.dataset.n)));
    }
    const items = Object.values(chosen);
    const met = cond.check(items);
    const nut = [...new Set(items.flatMap(o => [...o.nut]))].join('');
    const balanced = ['c', 'p', 'v'].every(n => nut.includes(n));
    setHead(head, '便當裝好了', '');
    note.querySelector('.bn-goal').classList.add(met ? 'ok' : 'miss');
    await wait(500);
    const happy = st === 'jh' ? pick(['……喔，看起來不錯。', '謝啦。', '嗯。（偷偷看了一眼）']) : pick(['好好看！明天中午好期待！', '我要第一個打開！', '這是我的便當！']);
    kid(field, met ? (st === 'jh' ? 'smile' : 'sparkle') : 'normal', met ? happy : (st === 'jh' ? '嗯，好。' : '謝謝媽媽！'));
    if (met) hearts(field, 5);
    await wait(1500);
    box.classList.add('closed');
    await wait(700);
    const stars = 1 + (met ? 1 : 0) + (balanced ? 1 : 0);
    await done(field, '明天的便當準備好了 🍱', 1 + stars, met ? '明天放學，看看他怎麼說' : F(cond.tip), stars);
    const mainDish = chosen.main.id === 'dinner' ? ctx.dish : null;
    return { mian: 1 + stars, bento: { by: 'mom', cond: cond.id, met, balanced, nut, dish: mainDish, icons: items.map(o => o.icon).join('') } };
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

  /* 午餐（不用上學的日子）：上午的行程結束，就在那裡吃 */
  const PLACE_BG = { tennis: 'court', home: 'kitchen', school: 'class' };
  async function lunch(ctx) {
    const d = MD.DISHES[ctx.dish];
    const at = ctx.at || 'home';
    const where = at === 'home' ? '' : `在${MD.PLACES[at].name}`;
    const { field, foot } = open(PLACE_BG[at] || at, `午餐${where ? '・' + where : ''}：${d.name}`, '');
    const mian = await eat(field, foot, ctx.dish);
    await done(field, '吃飽了，下午繼續', mian);
    return { mian };
  }

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
    const pool = { whack: dad, dadCook, photo, horse, flowers, laundry, oldPhotos };
    if (MD.stageAtLeast('high')) pool.kidCooks = kidCooks;
    if (MD.stage() === 'jh') delete pool.horse;   // 國中生太大了，爸爸背不動
    const last = MD.state.flags.lastFamily;
    const id = pick(Object.keys(pool).filter(k => k !== last));
    MD.state.flags.lastFamily = id;
    return pool[id]();
  }

  /* ══════════ 新地點的互動 ══════════ */

  /* 游泳池：左右手輪流划，游兩趟 */
  async function swim() {
    const { field, foot } = open('pool', '游泳課', '左手、右手輪流按，幫他往前游');
    const lane = document.createElement('div'); lane.className = 'lane';
    lane.innerHTML = '<div class="lane-rope"></div><div class="swimmer">🏊</div><div class="lane-end">🏁</div>';
    field.appendChild(lane);
    const sw = lane.querySelector('.swimmer');
    say(field, MD.stage() === 'low' ? '我會閉氣了！五秒！' : pick(['今天要游兩趟！', '教練說我的蛙腳很漂亮。', '我要比上次快！']));
    let pos = 0, dir = 1, lap = 0, lastSide = null, splash = 0;
    const t0 = performance.now();
    await new Promise(resolve => {
      foot.innerHTML = '';
      ['左手', '右手'].forEach((label, i) => {
        const b = document.createElement('button'); b.className = 'big-choice swim-btn'; b.innerHTML = `<span>${i ? '🫱' : '🫲'}</span><small>${label}</small>`;
        b.onclick = () => {
          if (lastSide === i) { splash++; S('miss'); pow(field, sw.offsetLeft + 20, sw.offsetTop, pick(['嗆到水了！', '咕嚕咕嚕', '換另一隻手！'])); lastSide = null; return; }
          lastSide = i; S('bubble');
          pos += 9 * dir;
          if (pos >= 88) { pos = 88; dir = -1; lap++; sw.classList.add('turn'); say(field, '轉身！'); }
          if (pos <= 0 && dir === -1) { pos = 0; lap++; }
          sw.style.left = pos + '%';
          if (lap >= 2) resolve();
        };
        foot.appendChild(b);
      });
    });
    foot.innerHTML = '';
    sw.classList.remove('turn');
    const secs = since(t0);
    say(field, secs < 9 ? '我是海豚！！' : pick(['我游完兩趟了！', '我的手好累，可是好開心。']));
    hearts(field, 5);
    await wait(1300);
    const st = starsBy(secs + splash * 1.5, 9, 14, true);
    await done(field, '游完兩趟了 🏊', 2 + st, `花了 ${Math.round(secs)} 秒`, st);
    return { mian: 2 + st };
  }

  /* 圖書館：照他的描述找出那本書 */
  const BOOK_COLORS = [['紅', '#ff8a8a'], ['藍', '#7fb8ff'], ['綠', '#6fd39a'], ['黃', '#ffd36e'], ['紫', '#b58cff'], ['粉紅', '#ff9ac6']];
  const BOOK_ICONS = [['恐龍', '🦖'], ['星星', '⭐'], ['網球', '🎾'], ['貓', '🐱'], ['火箭', '🚀'], ['魚', '🐟']];
  const FUNNY_TITLES = ['《如何讓爸爸不打呼》', '《一百種襪子的配對法》', '《章魚的三顆心臟》', '《為什麼天空是藍的》', '《世界上最無聊的書》', '《媽媽也需要休息》'];
  async function books() {
    const { field, foot, head } = open('library', '圖書館', '照他說的，找出那本書');
    let wrong = 0;
    for (let round = 0; round < 3; round++) {
      const shelf = [];
      for (let i = 0; i < 12; i++) shelf.push({ c: BOOK_COLORS[Math.floor(Math.random() * 6)], ic: BOOK_ICONS[Math.floor(Math.random() * 6)] });
      const target = shelf[Math.floor(Math.random() * 12)];
      // 讓答案只有一本
      shelf.forEach(b => { if (b !== target && b.c === target.c && b.ic === target.ic) b.ic = BOOK_ICONS[(BOOK_ICONS.indexOf(b.ic) + 1) % 6]; });
      kid(field, 'think', `我要找……${target.c[0]}色的，上面有${target.ic[0]}的書。`);
      setHead(head, `第 ${round + 1} 本`, '');
      const sh = document.createElement('div'); sh.className = 'shelf';
      field.appendChild(sh);
      await new Promise(res => {
        shelf.forEach(b => {
          const el = document.createElement('button'); el.className = 'book';
          el.style.background = b.c[1]; el.innerHTML = `<span>${b.ic[1]}</span>`;
          el.onclick = () => {
            if (b === target) { S('chime'); el.classList.add('picked'); kid(field, 'sparkle', pick(['就是這本！', '找到了！你好厲害！', '對！這本！'])); setTimeout(res, 900); }
            else { wrong++; S('soft'); el.classList.add('nope'); say(field, `${pick(FUNNY_TITLES)}……不是這本啦。`); }
          };
          sh.appendChild(el);
        });
      });
      sh.remove();
    }
    kid(field, 'happy', MD.stage() === 'jh' ? '借好了。……媽，你要不要也借一本？' : '三本都借到了！今天晚上要看完。');
    await wait(1300);
    const st = starsBy(wrong, 0, 3, true);
    await done(field, '借了三本書 📚', 2 + st, '', st);
    return { mian: 2 + st };
  }

  /* 畫畫教室：他畫線稿，你來上色 */
  const PAINT = ['#ff8a8a', '#ffd36e', '#6fd39a', '#7fb8ff', '#b58cff', '#ff9ac6', '#8b5e3c'];
  async function paint() {
    const { field, foot, head } = open('art', '畫畫教室', '先選顏色，再點畫裡的區塊');
    kid(field, 'sparkle', pick(['我畫好線了！你幫我塗顏色！', '今天畫我們家！你來上色！']));
    const pic = document.createElement('div'); pic.className = 'paint-pic';
    pic.innerHTML = `<svg viewBox="0 0 200 150">
      <rect data-r="sky" x="0" y="0" width="200" height="100" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <circle data-r="sun" cx="165" cy="28" r="16" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <rect data-r="ground" x="0" y="100" width="200" height="50" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <rect data-r="wall" x="40" y="62" width="70" height="52" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <path data-r="roof" d="M32 64 L75 30 L118 64 Z" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <rect data-r="door" x="66" y="86" width="18" height="28" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <circle data-r="tree" cx="150" cy="78" r="20" fill="#fff" stroke="#5a4440" stroke-width="2"/>
      <rect x="146" y="96" width="8" height="18" fill="#8b5e3c"/></svg>`;
    field.appendChild(pic);
    let color = null;
    const pal = document.createElement('div'); pal.className = 'palette';
    PAINT.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.onclick = () => { color = c; pal.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }; pal.appendChild(b); });
    field.appendChild(pal);
    const filled = {};
    pic.querySelectorAll('[data-r]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        if (!color) { MD.ui.toast('先選一個顏色'); return; }
        el.setAttribute('fill', color); filled[el.dataset.r] = color; S('pop');
        if (el.dataset.r === 'sun' && color === '#b58cff') say(field, '紫色的太陽！好有創意！');
        if (el.dataset.r === 'sky' && color === '#ff9ac6') say(field, '粉紅色的天空，是傍晚的時候！');
      });
    });
    await button(foot, '畫好了');
    pal.remove();
    const n = Object.keys(filled).length;
    kid(field, 'happy', n >= 6 ? '這是我們家最漂亮的一張畫。要貼在冰箱最上面。' : '空白的地方是雪。對，是下雪了。');
    hearts(field, 5);
    await wait(1600);
    const st = n >= 7 ? 3 : n >= 4 ? 2 : 1;
    await done(field, '一起完成一幅畫 🎨', 2 + st, '', st);
    return { mian: 2 + st, drawing: 'home' };
  }

  /* 書店：幫他挑一本書，也看到一本自己的書 */
  const OBSESSION = { low: '恐龍', mid: '宇宙', high: '偵探', jh: '網球' };
  const SHOP_BOOKS = [
    { t: '《恐龍大百科》', tag: '恐龍', icon: '🦖' }, { t: '《宇宙的盡頭有什麼》', tag: '宇宙', icon: '🪐' },
    { t: '《少年偵探團》', tag: '偵探', icon: '🔍' }, { t: '《網球名將傳記》', tag: '網球', icon: '🎾' },
    { t: '《小王子》', tag: '經典', icon: '🌹' }, { t: '《章魚的秘密生活》', tag: '動物', icon: '🐙' },
  ];
  async function bookshop() {
    const { field, foot } = open('bookstore', '逛書店', '幫他挑一本');
    const want = OBSESSION[MD.stage()];
    const opts = SHOP_BOOKS.slice().sort(() => Math.random() - .5).slice(0, 3);
    if (!opts.some(b => b.tag === want)) opts[0] = SHOP_BOOKS.find(b => b.tag === want);
    kid(field, 'think', '媽，你覺得我會喜歡哪一本？');
    const v = await choose(foot, opts.map((b, i) => ({ icon: b.icon, label: b.t, v: i })), 'xl');
    const b = opts[v];
    if (b.tag === want) { kid(field, 'sparkle', `${b.t}！你怎麼知道我最近在看${want}的東西！`); hearts(field, 6); }
    else kid(field, 'smile', `${b.t}……我沒看過這種的。好，我試試看。`);
    await wait(1600);
    say(field, '（結帳的時候，你在架上看到一本法文小說的中文版……就是那本，你二十五歲時沒翻譯完的那本。）');
    const v2 = await choose(foot, [{ icon: '📕', label: '買給自己', v: 'buy' }, { icon: '🙂', label: '下次吧', v: 'later' }]);
    if (v2 === 'buy') { MD.state.flags.frenchBook = (MD.state.flags.frenchBook || 0) + 1; kid(field, 'happy', '媽，你也買書了！我們回家一起看。'); }
    else kid(field, 'think', '……媽，你剛剛看那本書看很久耶。');
    await wait(1500);
    await done(field, '各自帶了一本書回家 📖', 4);
    return { mian: 4 };
  }

  /* 阿嬤家：跟阿嬤包水餃 */
  async function dumpling() {
    const { field, foot, head } = open('grandma', '跟阿嬤包水餃', '點麵皮放餡，再沿著邊捏 4 下');
    say(field, pick(['阿嬤：「來來來，阿嬤教你們，這個要捏漂亮才會發財喔！」', '阿嬤：「乖孫！阿嬤準備好餡了，今天包一百顆！」']));
    const tray = document.createElement('div'); tray.className = 'dumpling-tray'; field.appendChild(tray);
    let made = 0; const NEED = 4;
    while (made < NEED) {
      const d = document.createElement('button'); d.className = 'dough'; d.innerHTML = '<span class="filling"></span>';
      field.appendChild(d);
      let stage = 0;
      await new Promise(res => {
        d.onclick = () => {
          stage++; S('pop');
          if (stage === 1) { d.classList.add('filled'); setHead(head, `第 ${made + 1} 顆`, '沿著邊捏 4 下'); }
          else { d.style.setProperty('--pinch', stage - 1); }
          if (stage >= 5) { d.classList.add('done'); res(); }
        };
      });
      made++;
      await wait(300);
      d.remove();
      const m = document.createElement('span'); m.textContent = made === 3 ? '🦖' : '🥟'; tray.appendChild(m);
      if (made === 2) kid(field, 'sparkle', MD.stage() === 'jh' ? '阿嬤，我的有沒有比上次漂亮？' : '阿嬤你看！我的是恐龍形狀！');
    }
    say(field, pick(['阿嬤：「哇，包得比阿嬤還漂亮！」', '阿嬤：「你媽媽小時候也包得歪歪的，現在多會煮！」', '阿嬤：「下次再來，阿嬤再教你們包湯圓。」']));
    hearts(field, 6);
    await wait(1900);
    const first = !MD.state.flags.grandma; MD.state.flags.grandma = true;
    await done(field, '跟阿嬤包了一盤水餃 🥟', 4, '阿嬤塞了兩大包讓你們帶回家');
    if (!MD.state.dishes.includes('dumplings')) MD.state.dishes.push('dumplings');
    return { mian: 4, memory: first ? { id: 'grandma-dumpling', icon: '🥟', title: '阿嬤家的水餃' } : null };
  }

  /* 海邊：浪退的時候撿貝殼 */
  async function shells() {
    const { field, foot } = open('beach', '去海邊', '浪退下去的時候，趕快撿貝殼');
    kid(field, 'sparkle', pick(['海！！', '我要撿最漂亮的貝殼！', '浪來了要跑喔！']));
    const wave = document.createElement('div'); wave.className = 'wave'; field.appendChild(wave);
    let got = 0, rare = false; const NEED = 8;
    foot.innerHTML = '<span class="counter">🐚 0</span>';
    const cnt = foot.querySelector('.counter');
    await new Promise(resolve => {
      let cycle = 0;
      const tide = () => {
        if (got >= NEED) return resolve();
        cycle++;
        wave.classList.remove('in'); void wave.offsetWidth;
        // 浪退：貝殼出現
        for (let i = 0; i < 4; i++) {
          const s = document.createElement('button'); s.className = 'shell';
          const isRare = !rare && cycle === 3 && i === 0;
          s.textContent = isRare ? '🌟' : pick(['🐚', '🐚', '🦀', '🪸', '🐚']);
          s.style.left = rand(8, 86) + '%'; s.style.top = rand(30, 70) + '%';
          s.onclick = () => { s.remove(); S('pop'); got++; cnt.textContent = `🐚 ${got}`; if (isRare) { rare = true; kid(field, 'sparkle', '星星形狀的貝殼！！這是我這輩子最好的貝殼！'); } if (got >= NEED) resolve(); };
          field.appendChild(s);
        }
        setTimeout(() => { wave.classList.add('in'); S('miss'); field.querySelectorAll('.shell').forEach(s => s.remove()); }, 2400);
        setTimeout(tide, 3300);
      };
      tide();
    });
    field.querySelectorAll('.shell').forEach(s => s.remove());
    kid(field, 'happy', pick(['媽，你聽，貝殼裡面有海的聲音。', '我要把這些排在窗台上，按照大小。']));
    hearts(field, 6);
    await wait(1600);
    const first = !MD.state.flags.beach; MD.state.flags.beach = true;
    await done(field, `撿了 ${got} 個貝殼 🐚`, rare ? 5 : 4);
    return { mian: rare ? 5 : 4, memory: first ? { id: 'beach', icon: '🐚', title: '第一次一起去海邊' } : null, drawing: 'park' };
  }

  /* 補習班：陪他背單字（翻牌配對） */
  const WORDS = [['apple', '蘋果'], ['tennis', '網球'], ['mother', '媽媽'], ['dream', '夢想'], ['graduate', '畢業'], ['ocean', '海洋'], ['family', '家人'], ['brave', '勇敢']];
  async function flashcards() {
    const { field, foot } = open('cram', '陪他背單字', '翻兩張卡，找出英文和中文的配對');
    kid(field, 'sleepy', pick(['媽，你考我。', '明天要考單字……救我。', '這些字我都看過，可是記不起來。']));
    const pairs = WORDS.slice().sort(() => Math.random() - .5).slice(0, 4);
    const cards = pairs.flatMap((p, i) => [{ i, t: p[0] }, { i, t: p[1] }]).sort(() => Math.random() - .5);
    const grid = document.createElement('div'); grid.className = 'cards-grid'; field.appendChild(grid);
    let open1 = null, tries = 0, matched = 0, lock = false;
    await new Promise(resolve => {
      cards.forEach(c => {
        const el = document.createElement('button'); el.className = 'flash'; el.innerHTML = `<span>${c.t}</span>`;
        el.onclick = () => {
          if (lock || el.classList.contains('up')) return;
          el.classList.add('up'); S('paper');
          if (!open1) { open1 = { c, el }; return; }
          tries++;
          if (open1.c.i === c.i) { S('chime'); el.classList.add('ok'); open1.el.classList.add('ok'); open1 = null; matched++; if (matched === 4) setTimeout(resolve, 500); }
          else { lock = true; const o = open1; open1 = null; setTimeout(() => { el.classList.remove('up'); o.el.classList.remove('up'); lock = false; }, 700); }
        };
        grid.appendChild(el);
      });
    });
    grid.remove();
    kid(field, 'happy', tries <= 6 ? '媽，你記憶力比我好欸。……我是說，我也記住了。' : '好，我記住了。graduate 是畢業。三年後我就要 graduate 了。');
    await wait(1600);
    const st = starsBy(tries, 5, 8, true);
    await done(field, '單字背好了 ✏️', 2 + st, `翻了 ${tries} 次`, st);
    return { mian: 2 + st };
  }

  /* 診所：打預防針，按住他的手 */
  async function shot() {
    const { field, foot } = open('clinic', '打預防針', '按住「握住他的手」，讓他安心');
    kid(field, 'sad', MD.stage() === 'jh' ? '……我不怕打針。（手在抖）' : pick(['……我不想打針。', '會痛嗎？會痛幾秒？', '我可以閉眼睛嗎？']));
    const meter = document.createElement('div'); meter.className = 'meter calm'; meter.innerHTML = '<i></i>';
    foot.appendChild(meter);
    const btn = document.createElement('button'); btn.className = 'push-btn hold'; btn.textContent = '🤝 握住他的手';
    foot.appendChild(btn);
    let v = 0, holding = false, h;
    await new Promise(resolve => {
      const tick = () => {
        v = Math.max(0, Math.min(100, v + (holding ? 2.2 : -1.5)));
        meter.firstChild.style.width = v + '%';
        if (v > 40 && v < 45) say(field, pick(['……你的手好溫暖。', '我數到三。一……二……']));
        if (v >= 100) { clearInterval(h); resolve(); }
      };
      h = setInterval(tick, 50);
      btn.onpointerdown = e => { e.preventDefault(); holding = true; btn.classList.add('ready'); };
      btn.onpointerup = btn.onpointerleave = () => { holding = false; btn.classList.remove('ready'); };
      btn.onclick = () => { v = Math.min(100, v + 6); if (v >= 100) { clearInterval(h); resolve(); } };   // 不方便長按的人，一直點也可以
    });
    foot.innerHTML = '';
    S('pop');
    kid(field, 'cry', '（咻——）');
    await wait(900);
    kid(field, 'smile', MD.stage() === 'jh' ? '……就這樣？還好嘛。' : '一點都不痛！（眼淚還在眼眶裡）');
    const it = document.createElement('div'); it.className = 'show-item'; it.textContent = '🦖'; field.appendChild(it);
    say(field, '護理師給了一張恐龍貼紙。');
    await wait(1600);
    await done(field, '勇敢的一天 💉', 4);
    return { mian: 4 };
  }

  /* 夜市：套圈圈（擺動到瓶子上方時丟） */
  async function ringtoss() {
    const { field, foot } = open('nightmarket', '逛夜市・套圈圈', '圈圈移到瓶子正上方時，按「丟！」');
    kid(field, 'sparkle', pick(['我要那隻大熊！', '五個圈圈，我要全部套中！', '媽，你丟，我幫你看準。']));
    const row = document.createElement('div'); row.className = 'bottles';
    row.innerHTML = [0, 1, 2, 3, 4].map(() => '<span>🍾</span>').join('');
    field.appendChild(row);
    const ring = document.createElement('div'); ring.className = 'ring-aim'; ring.textContent = '⭕'; field.appendChild(ring);
    const btn = document.createElement('button'); btn.className = 'push-btn'; btn.textContent = '丟！'; foot.appendChild(btn);
    let hits = 0;
    for (let n = 0; n < 5; n++) {
      const res = await new Promise(resolve => {
        const t0 = performance.now(); let raf;
        const loop = now => { const x = 50 + 40 * Math.sin((now - t0) / 520); ring.style.left = x + '%'; ring.dataset.x = x; btn.classList.toggle('ready', [14, 32, 50, 68, 86].some(c => Math.abs(c - x) < 4.5)); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
        btn.onclick = () => { cancelAnimationFrame(raf); const x = +ring.dataset.x; const centers = [14, 32, 50, 68, 86]; resolve(centers.some(c => Math.abs(c - x) < 4.5)); };
      });
      btn.classList.remove('ready');
      ring.classList.add('throw'); S(res ? 'chime' : 'miss');
      await wait(450);
      ring.classList.remove('throw');
      if (res) { hits++; pow(field, field.clientWidth * (+ring.dataset.x) / 100, field.clientHeight * .4, '套中了！'); }
      else say(field, pick(['差一點點！', '圈圈彈出去了！', '下一個一定中！']));
      await wait(500);
    }
    btn.remove();
    const prize = hits >= 4 ? '🧸 大熊' : hits >= 2 ? '🐥 小雞鑰匙圈' : '🍬 安慰糖果';
    kid(field, 'happy', hits >= 4 ? '大熊！！媽你好厲害！我要叫牠「套中」。' : `我們拿到${prize}了！`);
    hearts(field, 5);
    await wait(1500);
    const st = hits >= 4 ? 3 : hits >= 2 ? 2 : 1;
    await done(field, `套中 ${hits} 個，拿到${prize}`, 2 + st, '回家路上還買了一包地瓜球', st);
    return { mian: 2 + st };
  }

  /* ══════════ 新的全家時光 ══════════ */

  // 他第一次做菜給全家吃（高年級以後）
  async function kidCooks() {
    const { field, foot } = open('tvroom', '今天他做晚餐', '');
    trio(field, { dad: 'surprised', kid: 'sparkle', mom: 'surprised' });
    say(field, MD.stage() === 'jh' ? '{kid}：「媽，今天你去坐著，我來煮。」' : '{kid}：「今天我是主廚！你們去坐好！」');
    await wait(1600);
    const dish = pick(['🍳 番茄炒蛋（有點太鹹）', '🍜 泡麵加蛋加青菜（他說是改良版）', '🍛 咖哩（馬鈴薯切得超大塊）']);
    const it = document.createElement('div'); it.className = 'show-item'; it.textContent = dish.split(' ')[0]; field.appendChild(it);
    say(field, `端上桌的是：${dish}`);
    const v = await choose(foot, [{ icon: '😋', label: '好好吃！', v: 'yum' }, { icon: '🥹', label: '（眼眶有點熱）', v: 'teary' }]);
    if (v === 'yum') { trio(field, { dad: 'happy', kid: 'shy', mom: 'happy' }); say(field, '{kid}：「真的嗎？……那我下次再煮。」'); }
    else { trio(field, { dad: 'smile', kid: 'think', mom: 'cry' }); say(field, '{kid}：「媽你怎麼了？太鹹了嗎？」　{dad}：「她是太開心了。」'); }
    hearts(field, 8);
    await wait(2000);
    const first = !MD.state.flags.kidCooks; MD.state.flags.kidCooks = true;
    await done(field, '他煮的第一頓晚餐 🍳', 4);
    return { mian: 4, memory: first ? { id: 'kid-cooks', icon: '🍳', title: '他煮給全家吃的第一頓晚餐' } : null };
  }

  // 全家一起翻舊照片
  async function oldPhotos() {
    const { field, foot } = open('tvroom', '翻舊相簿', '點照片，聊聊那時候');
    trio(field, { dad: 'smile', kid: 'happy', mom: 'smile' }).classList.add('low');
    const mems = (MD.state.memories || []).slice(-6);
    const list = mems.length ? mems : [{ icon: '👶', title: '剛出生的時候' }, { icon: '🎂', title: '第一個生日' }];
    const wrap = document.createElement('div'); wrap.className = 'old-photos'; field.appendChild(wrap);
    let seen = 0;
    await new Promise(res => {
      list.slice(0, 4).forEach((m, i) => {
        const p = document.createElement('button'); p.className = 'old-photo'; p.style.setProperty('--r', (i % 2 ? 4 : -4) + 'deg');
        p.innerHTML = `<span>${m.icon}</span><small>${esc(m.title)}</small>`;
        p.onclick = () => { if (p.classList.contains('seen')) return; p.classList.add('seen'); S('paper'); seen++; say(field, pick(['{kid}：「我記得這個！」', '{dad}：「那時候你才這麼小。」', '{kid}：「我那時候好矮喔。」', '（大家都笑了）'])); if (seen >= Math.min(4, list.length)) setTimeout(res, 1200); };
        wrap.appendChild(p);
      });
    });
    hearts(field, 6);
    await wait(800);
    await done(field, '那些時候，都還記得 📷', 3);
    return { mian: 3 };
  }

  /* ══════════ 最後的特別日子：會考、畢業、旅行、回顧 ══════════ */

  // 點一下才繼續（給旁白、回憶用）
  function tapNext(field, label = '點一下繼續') {
    return new Promise(res => {
      const hint = document.createElement('div'); hint.className = 'tap-hint'; hint.textContent = label;
      field.appendChild(hint);
      setTimeout(() => { field.onclick = () => { field.onclick = null; hint.remove(); res(); }; }, 350);
    });
  }
  async function lines(field, list, who = 'kid', expr = 'smile') {
    for (const l of list) {
      if (who === 'kid') kid(field, expr, l); else say(field, l);
      await tapNext(field);
    }
  }

  /* 第 64 天：國中會考 */
  async function examDay() {
    const s = MD.state;
    let mian = 0;
    // 1. 早餐
    let sc = open('kitchen', '會考的早上', '');
    kid(sc.field, 'think', '……媽，早。我昨天有睡著，大概四個小時。');
    await wait(1400);
    say(sc.field, '今天的早餐要做什麼？');
    const b = await choose(sc.foot, [{ icon: '🍙', label: '一樣的鮭魚飯糰', v: 'onigiri' }, { icon: '🥪', label: '總匯三明治', v: 'sandwich' }, { icon: '🌯', label: '蛋餅', v: 'danbing' }]);
    if (b === 'onigiri') { kid(sc.field, 'smile', '……一樣的飯糰。跟一年級的時候一樣。'); await wait(1600); kid(sc.field, 'happy', '吃這個，我就不緊張了。'); }
    else kid(sc.field, 'happy', '好。吃飽才有力氣寫考卷。');
    await wait(1500);
    // 2. 考場門口
    sc = open('class', '考場門口', '');
    kid(sc.field, 'normal', '媽，你送到這裡就好。');
    await wait(1400);
    say(sc.field, '最後，想跟他說什麼？');
    const w = await choose(sc.foot, [{ icon: '💪', label: '盡力就好', v: 'try' }, { icon: '🤝', label: '握一下手', v: 'hand' }, { icon: '🎾', label: '一球一球來', v: 'tennis' }]);
    if (w === 'try') kid(sc.field, 'smile', '嗯。我會的。');
    else if (w === 'hand') { kid(sc.field, 'shy', '……（他握了一下，比你想的用力）'); hearts(sc.field, 4); }
    else kid(sc.field, 'sparkle', '……對，就像打網球。手肘先往後。（他笑了）');
    await wait(1600);
    sc.field.querySelector('.mini-kid').classList.add('walk-away');
    say(sc.field, '（他走進校門，回頭揮了一下手）');
    await wait(2000);
    // 3. 在外面等：回憶一張一張浮現
    sc = open('cafe', '在考場外面等', '點一下浮起來的照片');
    say(sc.field, '考試要考一整天。你坐在對面的咖啡店，看著校門。');
    const mems = (s.memories || []).filter(m => m.icon).slice(0, 8);
    const wrap = document.createElement('div'); wrap.className = 'float-mems'; sc.field.appendChild(wrap);
    const show = mems.length ? mems.slice(0, 6) : [{ icon: '🎾', title: '撿球搭檔' }];
    let seen = 0;
    await new Promise(res => {
      show.forEach((m, i) => {
        const p = document.createElement('button'); p.className = 'float-mem'; p.style.left = (8 + (i % 3) * 30) + '%'; p.style.top = (14 + Math.floor(i / 3) * 30) + '%'; p.style.animationDelay = (i * .3) + 's';
        p.innerHTML = `<span>${m.icon}</span><small>${esc(F(m.title))}</small>`;
        p.onclick = () => { if (p.classList.contains('seen')) return; p.classList.add('seen'); S('paper'); seen++; if (seen >= show.length) setTimeout(res, 900); };
        wrap.appendChild(p);
      });
    });
    wrap.remove();
    say(sc.field, '原來我等的不是考試結束，是這九年。');
    await wait(2600);
    // 4. 考完了
    sc = open('class', '考完了', '');
    const k = kid(sc.field, 'sleepy', '……考完了。'); k.classList.add('run-in');
    await wait(1500);
    const e = await choose(sc.foot, [{ icon: '🤗', label: '張開手', v: 'hug' }, { icon: '🧋', label: '去喝珍奶', v: 'tea' }]);
    if (e === 'hug') { kid(sc.field, 'cry', '……（這次他沒有躲，抱得很久）'); await wait(1800); kid(sc.field, 'smile', '媽，謝謝你。不只是今天。'); hearts(sc.field, 10); }
    else { kid(sc.field, 'happy', '全糖！今天可以全糖！'); await wait(1600); kid(sc.field, 'smile', '……媽，謝謝你今天在外面等那麼久。'); hearts(sc.field, 6); }
    await wait(2000);
    mian += 10;
    await done(sc.field, '會考結束了', mian, '不管結果怎麼樣，這一天都會記得');
    return { mian, memory: { id: 'exam-day', icon: '📝', title: '會考那天，你在外面等了一整天' } };
  }

  /* 第 65 天：畢業典禮，決定全家旅行 */
  async function graduation() {
    let sc = open('class', '國中畢業典禮', '一直點，為他鼓掌！');
    say(sc.field, '台上念到他的名字了。');
    const k = kid(sc.field, 'sparkle', ''); k.classList.add('on-stage');
    sc.foot.innerHTML = '<div class="meter"><i></i></div>';
    const meter = sc.foot.querySelector('i');
    let n = 0;
    await new Promise(res => {
      sc.field.onpointerdown = ev => {
        n++; S('pop');
        const r = sc.field.getBoundingClientRect();
        pow(sc.field, ev.clientX - r.left, ev.clientY - r.top, pick(['👏', '👏👏', '好棒！', '畢業快樂！']));
        meter.style.width = Math.min(100, n / 16 * 100) + '%';
        if (n === 8) say(sc.field, '（旁邊的爸爸哭得比誰都大聲）');
        if (n >= 16) { sc.field.onpointerdown = null; res(); }
      };
    });
    sc.foot.innerHTML = '';
    hearts(sc.field, 10);
    await wait(1500);
    sc = open('tvroom', '典禮結束後', '');
    trio(sc.field, { dad: 'cry', kid: 'smile', mom: 'smile' }).classList.add('low');
    await lines(sc.field, [
      '媽，我有一些話想說。',
      '一年級的時候，你每天帶我出門。我的鞋子常常不見，你都陪我找。',
      '你做的便當，同學都說好可愛。爸爸做的那個「加由」，我到現在還記得。',
      '國中以後，我叫你不要在校門口等。可是我每次走到轉角，都會先看你在不在。',
      '……謝謝你。你一直是我的撿球搭檔。',
    ]);
    trio(sc.field, { dad: 'cry', kid: 'shy', mom: 'cry' });
    say(sc.field, '{dad}：「好了好了，我們來決定畢業旅行要去哪裡！」');
    await wait(1600);
    const dest = await choose(sc.foot, [{ icon: '🗾', label: '日本', v: 'japan' }, { icon: '🗼', label: '歐洲', v: 'europe' }]);
    MD.state.flags.trip = dest;
    say(sc.field, dest === 'japan' ? '{kid}：「日本！我想吃真正的拉麵，還要看富士山！」' : '{kid}：「歐洲！媽，我們去巴黎，還有……溫布頓！」');
    await wait(2000);
    await done(sc.field, '畢業了 🎓', 15, dest === 'japan' ? '下一站：日本' : '下一站：歐洲');
    return { mian: 15, memory: { id: 'graduation', icon: '🎓', title: '畢業那天，他說你一直是他的撿球搭檔' } };
  }

  /* 第 66 天：全家旅行 */
  async function trip() {
    const dest = MD.state.flags.trip || 'japan';
    let total = 0;
    if (dest === 'japan') {
      // 京都：穿浴衣散步，收集燈籠
      let sc = open('japan', '京都・穿浴衣散步', '點亮路上的燈籠');
      kid(sc.field, 'sparkle', '媽，你穿浴衣好好看。爸爸的有點緊。');
      let lit = 0;
      await new Promise(res => {
        for (let i = 0; i < 6; i++) {
          const l = document.createElement('button'); l.className = 'lantern'; l.textContent = '🏮';
          l.style.left = (10 + i * 14) + '%'; l.style.top = (18 + (i % 2) * 14) + '%';
          l.onclick = () => { if (l.classList.contains('lit')) return; l.classList.add('lit'); S('chime'); lit++; if (lit === 6) setTimeout(res, 600); };
          sc.field.appendChild(l);
        }
      });
      kid(sc.field, 'happy', '整條街都亮了。像我們家冰箱上的那些畫一樣。');
      await wait(1800);
      await done(sc.field, '京都的夜晚 🏮', 5); total += 5;
      // 拉麵
      sc = open('japan', '一碗真正的拉麵', '');
      total += await eat(sc.field, sc.foot, 'ramen');
      kid(sc.field, 'sparkle', '……好好吃。可是媽做的牛肉麵，第二好吃。');
      await wait(1800);
      await done(sc.field, '日本的拉麵 🍜', 3); total += 3;
      // 富士山前的全家福
      sc = open('fuji', '富士山前的全家福', '大家都笑的時候，按快門');
      trio(sc.field, { dad: 'happy', kid: 'sparkle', mom: 'happy' }).classList.add('posing');
      await button(sc.foot, '📸 喀嚓');
      S('shutter'); sc.field.querySelector('.trio').classList.add('framed');
      say(sc.field, '{kid}：「這張要貼在冰箱最中間。」');
      await wait(2000);
      await done(sc.field, '富士山前的我們 🗻', 5); total += 5;
      return { mian: total, memory: { id: 'trip', icon: '🗻', title: '全家在富士山前的照片' }, drawing: 'family' };
    }
    // 歐洲
    let sc = open('paris', '巴黎・塞納河畔的書攤', '');
    say(sc.field, '河邊一整排綠色的舊書攤。你在其中一攤停下來。');
    await wait(1600);
    say(sc.field, '是那本法文小說。二十五歲時，你翻譯到第三章就停下來的那一本。');
    await wait(2200);
    kid(sc.field, 'smile', '媽，這本我買給你。我存了很久的零用錢。');
    const v = await choose(sc.foot, [{ icon: '🥹', label: '收下', v: 'take' }, { icon: '📖', label: '請他唸第一句', v: 'read' }]);
    if (v === 'read') { kid(sc.field, 'shy', '「La vie……」……後面我不會唸。媽，你唸給我聽。'); await wait(2000); say(sc.field, '你唸了。唸到一半，聲音有點抖。'); }
    else { say(sc.field, '你把書抱在胸前。他假裝在看河，沒有看你。'); }
    hearts(sc.field, 8);
    await wait(2000);
    await done(sc.field, '那本書，終於要讀完了 📕', 6); total += 6;
    // 溫布頓
    sc = open('court', '倫敦・溫布頓', '在旁邊的草地球場，跟他打一場');
    kid(sc.field, 'sparkle', '溫布頓……我從一年級就想來這裡。');
    await wait(1500);
    const hit = await rallyCore(sc.field, sc.foot, 10, { start: '媽，跟我打一場！' });
    kid(sc.field, 'happy', hit >= 7 ? '媽，你根本是職業選手！' : '在溫布頓跟媽媽打網球……我會記一輩子。');
    await wait(1800);
    await done(sc.field, '溫布頓的草地 🎾', 6); total += 6;
    // 可頌
    sc = open('paris', '巴黎的早晨', '');
    total += await eat(sc.field, sc.foot, 'croissant');
    kid(sc.field, 'smile', '回去以後，我們在家也做可頌好不好？');
    await wait(1600);
    await done(sc.field, '巴黎的可頌 🥐', 3); total += 3;
    MD.state.flags.frenchBookDone = true;
    return { mian: total, memory: { id: 'trip', icon: '🗼', title: '巴黎的書攤，和溫布頓的草地' }, drawing: 'family' };
  }

  /* 第 67 天：回家，一起回顧這些年 */
  async function finale() {
    const s = MD.state;
    let sc = open('home', '回到家', '');
    trio(sc.field, { dad: 'sleepy', kid: 'smile', mom: 'smile' }).classList.add('low');
    say(sc.field, '{kid}：「……還是家裡最好。」');
    await wait(2000);
    say(sc.field, '晚上，三個人坐在客廳，把這些年的回憶一張一張拿出來看。');
    await tapNext(sc.field);
    // 回憶一張一張出現
    sc = open('home', '這些年', '點一下看下一張');
    const mems = (s.memories || []).filter(m => m.icon);
    const pickMems = mems.length > 12 ? mems.filter((_, i) => i % Math.ceil(mems.length / 12) === 0) : mems;
    const card = document.createElement('div'); card.className = 'review-card'; sc.field.appendChild(card);
    for (const m of pickMems) {
      card.innerHTML = `<span>${m.icon}</span><h4>${esc(F(m.title))}</h4><small>${m.day ? MD.GRADE_NAMES[MD.gradeOf(m.day)] : ''}</small>`;
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
      S('paper');
      await tapNext(sc.field, '');
    }
    card.remove();
    // 數字
    sc = open('home', '這些年，我們一起', '');
    const stats = document.createElement('div'); stats.className = 'review-stats';
    stats.innerHTML = `
      <div><b>${s.day}</b><small>天</small></div>
      <div><b>${s.mian}</b><small>綿</small></div>
      <div><b>${s.dishes.length}</b><small>道會做的菜</small></div>
      <div><b>${s.fridge.length}</b><small>張冰箱上的畫</small></div>
      <div><b>${s.memories.length}</b><small>個回憶</small></div>
      <div><b>${s.dadHits}</b><small>次爸爸飛到天邊</small></div>`;
    sc.field.appendChild(stats);
    say(sc.field, '{dad}：「我被打飛了這麼多次喔？」');
    await tapNext(sc.field);
    stats.remove();
    // 他寫的信
    await MD.ui.popup(`<p class="q">${esc(F('給媽媽：\n\n小時候，我的鞋子常常不見。\n你每次都蹲下來，陪我一起找。\n\n你帶我去網球場、去公園、去阿嬤家。\n下雨天，你在客廳陪我打氣球網球。\n\n國中以後，我變得不太說話。\n可是我都知道，你在轉角等我。\n\n媽，謝謝你。\n你是全世界最好的撿球搭檔。\n以後換我陪你，去你想去的地方。\n\n——{kid}（15 歲）\n\nP.S. 我知道你的名字是 {me}。\n以後你也要常常當 {me} 喔。'))}</p><p class="tap" style="text-align:center">點一下，把信收好</p>`, { cls: 'letter' });
    sc.field.querySelector('.mini-bubble')?.remove();
    return { mian: 20, memory: { id: 'finale', icon: '💌', title: '十五歲的他寫給你的信' } };
  }

  MD.ACTS = { cancelAll: () => { GEN++; close(); }, closeScene: close, swim, books, paint, bookshop, dumpling, shells, flashcards, shot, ringtoss, examDay, graduation, trip, finale, serve, pickup, rally, match, leaves, slide, bubbles, school, homework, shoes, market, cafe, breakfast, cook, lunch, bento, bentoNight, forgot, dad, family };
})();
