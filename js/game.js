/*
 * 遊戲主流程：早上排行程 → 地圖上照行程走 → 晚上結算
 */
window.MD = window.MD || {};

(function () {
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pick = arr => MD.pick(arr);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const F = t => esc(MD.fill(t));
  const clamp = v => Math.max(0, Math.min(5, v));
  const START_DISHES = Object.keys(MD.DISHES).filter(id => !MD.DISHES[id].from && !MD.DISHES[id].stage);

  /* ── 畫面切換 ── */
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $('screen-' + name).classList.add('active');
    if (MD.audio) MD.audio.music(name === 'night' ? 'night' : 'day');
  }

  /* ── UI 工具 ── */
  MD.ui = {
    flashSaved() {
      const t = $('saved-toast');
      t.classList.add('show'); clearTimeout(t._h);
      t._h = setTimeout(() => t.classList.remove('show'), 1100);
    },
    toast(html) {
      const t = $('float-toast');
      t.innerHTML = html;
      t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    },
    popup(html, opts = {}) {
      return new Promise(resolve => {
        const p = $('popup');
        p.innerHTML = `<div class="pop ${opts.cls || ''}">${html}</div>`;
        p.classList.add('show');
        const finish = v => { p.classList.remove('show'); p.innerHTML = ''; p.onclick = null; resolve(v); };
        p.querySelectorAll('[data-v]').forEach(b => (b.onclick = e => { e.stopPropagation(); finish(b.dataset.v); }));
        if (!opts.buttons) setTimeout(() => (p.onclick = () => finish()), 400);
      });
    },
    confirm(msg, yes = '確定', no = '取消') {
      return MD.ui.popup(`<p class="q" style="font-size:17px">${msg}</p><div class="confirm-btns"><button class="btn" data-v="no">${no}</button><button class="btn primary" data-v="yes">${yes}</button></div>`, { buttons: true })
        .then(v => v === 'yes');
    },
    sheet(html) {
      const s = $('sheet');
      s.innerHTML = `<div class="sheet-body">${html}</div>`;
      s.classList.add('show');
      s.onclick = e => { if (e.target === s) MD.ui.closeSheet(); };
      return s;
    },
    closeSheet() { $('sheet').classList.remove('show'); $('sheet').innerHTML = ''; },
  };

  /* ── 互動場景的背景裝飾 ── */
  MD.sceneDeco = bg => ({
    court: `<div class="deco d-fence"></div><div class="deco d-court"><div class="deco d-net"></div></div>`,
    park: `<span class="deco emoji" style="left:4%;top:16%;font-size:56px">🌳</span><span class="deco emoji" style="right:4%;top:22%;font-size:48px">🌳</span><span class="deco emoji" style="left:40%;bottom:6%;font-size:26px">🌼</span>`,
    class: `<span class="deco emoji" style="left:8%;top:16%;font-size:30px">🖍️</span><span class="deco emoji" style="right:8%;top:14%;font-size:34px">🌈</span><span class="deco emoji" style="left:6%;bottom:30%;font-size:40px">🏫</span>`,
    market: `<div class="deco d-awning"></div><span class="deco emoji" style="left:6%;top:30%;font-size:34px">🥬</span><span class="deco emoji" style="right:6%;top:32%;font-size:34px">🍅</span><span class="deco emoji" style="left:42%;top:26%;font-size:30px">🧺</span>`,
    cafe: `<div class="deco d-window" style="width:52%"></div><div class="deco d-lamp" style="left:18%"></div><div class="deco d-lamp" style="right:18%"></div>`,
    kitchen: `<div class="deco d-window" style="width:40%;height:18%;top:12%"></div><div class="deco d-counter"></div><span class="deco emoji" style="right:8%;top:16%;font-size:30px">🪴</span>`,
    tvroom: `<span class="deco emoji" style="left:4%;top:52%;font-size:28px">🪴</span><span class="deco emoji" style="right:4%;top:50%;font-size:26px">🎾</span>`,
    home: `<div class="deco d-window"></div><span class="deco emoji" style="right:8%;top:16%;font-size:30px">🪴</span>`,
    pool: `<span class="deco emoji" style="left:6%;top:14%;font-size:30px">🛟</span><span class="deco emoji" style="right:6%;top:14%;font-size:28px">🏊</span>`,
    library: `<div class="deco d-bookwall"></div>`,
    art: `<span class="deco emoji" style="left:6%;top:12%;font-size:34px">🖌️</span><span class="deco emoji" style="right:6%;top:14%;font-size:30px">🖼️</span>`,
    bookstore: `<div class="deco d-bookwall"></div><span class="deco emoji" style="right:6%;top:50%;font-size:28px">☕</span>`,
    grandma: `<span class="deco emoji" style="left:6%;top:12%;font-size:34px">🏮</span><span class="deco emoji" style="right:8%;top:14%;font-size:30px">🐈</span><span class="deco emoji" style="left:40%;top:8%;font-size:28px">🧧</span>`,
    beach: `<span class="deco emoji" style="left:8%;top:8%;font-size:40px">☀️</span><span class="deco emoji" style="right:6%;top:14%;font-size:30px">⛱️</span>`,
    cram: `<div class="deco d-board"></div>`,
    clinic: `<span class="deco emoji" style="left:6%;top:12%;font-size:30px">🩺</span><span class="deco emoji" style="right:8%;top:14%;font-size:30px">🧸</span>`,
    nightmarket: `<div class="deco d-lights"></div><span class="deco emoji" style="left:6%;top:30%;font-size:30px">🍢</span><span class="deco emoji" style="right:6%;top:30%;font-size:30px">🧋</span>`,
    japan: `<span class="deco emoji" style="left:6%;top:56%;font-size:40px">⛩️</span><span class="deco emoji" style="right:6%;top:58%;font-size:34px">🌸</span>`,
    fuji: `<div class="deco d-fuji"></div><span class="deco emoji" style="left:8%;top:10%;font-size:30px">🌸</span>`,
    paris: `<span class="deco emoji" style="right:8%;top:8%;font-size:64px">🗼</span><span class="deco emoji" style="left:6%;top:56%;font-size:30px">📚</span>`,
  }[bg] || '');

  /* ── 狀態 ── */
  function ensureDefaults() {
    const s = MD.state;
    START_DISHES.forEach(id => { if (!s.dishes.includes(id)) s.dishes.push(id); });
    // 長大一點，就會做新的菜
    Object.entries(MD.DISHES).forEach(([id, d]) => { if (d.stage && MD.stageAtLeast(d.stage) && !s.dishes.includes(id)) s.dishes.push(id); });
    document.body.dataset.stage = MD.stage();   // 讓孩子的身高、衣服跟著階段變
  }
  // 某個地點在目前階段開放了沒
  const placeOpen = id => { const p = MD.PLACES[id]; return !p.opens || MD.stageAtLeast(p.opens); };
  const cardOk = id => { const c = MD.CARDS[id]; return (!c.stages || c.stages.includes(MD.stage())) && placeOpen(c.place) && (!c.weekend || isWeekend()); };
  const placeName = id => (id === 'school' ? (MD.stage() === 'jh' ? '國中' : '小學') : MD.PLACES[id].name);
  const dow = () => (MD.state.day - 1) % 7;
  const isWeekend = () => dow() >= 5;
  // 行程卡目前的熟悉度等級
  // index：第幾級（同一個門檻解鎖的算同一級）；task：最新解鎖的任務
  const cardLevel = id => {
    const c = MD.CARDS[id], v = MD.state.placeVisits[id] || 0;
    const open = c.levels.filter(l => v >= l.at);
    const tiers = [...new Set(c.levels.map(l => l.at))].filter(at => v >= at);
    return { index: tiers.length - 1, task: open[open.length - 1].task, open };
  };

  // 同一個地點，輪流玩不同的小遊戲：沒玩過的優先，不會連續兩次一樣
  function pickAct(id) {
    const s = MD.state;
    const played = s.actsPlayed || (s.actsPlayed = []);
    const last = (s.lastAct || (s.lastAct = {}))[id];
    const open = cardLevel(id).open.map(l => l.act);
    const fresh = open.filter(a => !played.includes(a));
    const pool = fresh.length ? fresh : open.filter(a => a !== last);
    const act = pick(pool.length ? pool : open);
    s.lastAct[id] = act;
    if (!played.includes(act)) played.push(act);
    return act;
  }

  function addMian(n, why) {
    MD.state.mian += n;
    MD.state.today.earned += n;
    renderMian();
    if (n > 0 && MD.audio) MD.audio.sfx('chime');
    if (why) MD.ui.toast(`${MD.art.mian(22)} +${n} ${esc(why)}`);
  }
  function renderMian() {
    document.querySelectorAll('.mian-count').forEach(el => (el.innerHTML = `${MD.art.mian(22)}<b>${MD.state.mian}</b>`));
  }

  /* ════════════════ 早上：排行程 ════════════════ */
  function newToday() {
    const s = MD.state, we = isWeekend(), d = dow();
    const tennisDay = d === 2 || d === 5;
    // 平日偶爾放假（第一天不放）
    const week = Math.floor((s.day - 1) / 7);
    const holiday = !we && s.day > 1 && s.flags.holidayWeek !== week && Math.random() < .2 ? pick(MD.HOLIDAYS) : null;
    if (holiday) s.flags.holidayWeek = week;   // 一週最多放一次假
    const school = !we && !holiday;
    const plan = [{ slot: 'breakfast', kind: 'meal' }];
    const jh = MD.stage() === 'jh';
    if (school && jh) {
      // 國中：白天整天在學校，放學後吃點心，傍晚一個行程，晚餐後還有一個（補習、功課）
      plan.push({ slot: 'day', kind: 'act', card: 'school', fixed: true });
      plan.push({ slot: 'snack', kind: 'meal' });
      plan.push({ slot: 'evening', kind: 'act' });
      plan.push({ slot: 'dinner', kind: 'meal' });
      plan.push({ slot: 'night', kind: 'act' });
    } else {
      if (school) plan.push({ slot: 'morning', kind: 'act', card: 'school', fixed: true });
      else { plan.push({ slot: 'morning', kind: 'act' }); plan.push({ slot: 'lunch', kind: 'meal' }); }
      plan.push(tennisDay ? { slot: 'pm1', kind: 'act', card: 'tennis', fixed: true } : { slot: 'pm1', kind: 'act' });
      plan.push({ slot: 'snack', kind: 'meal' });
      plan.push({ slot: 'pm2', kind: 'act' });
      plan.push({ slot: 'evening', kind: 'act' });
      plan.push({ slot: 'dinner', kind: 'meal' });
    }
    s.kid = { full: 1, energy: 4 };
    // Ethan 今天的心願（只挑已經做得到的）
    const wishes = MD.WISHES.filter(w => (!w.stages || w.stages.includes(MD.stage())) && (w.type === 'card' ? cardOk(w.id) : s.dishes.includes(w.id)));
    const wish = Object.assign({ done: false }, pick(wishes));
    // 前一天晚上準備好的便當（上學日才帶）
    const bento = school ? s.nextBento : null;
    s.nextBento = null;
    return { plan, idx: 0, earned: 0, nut: { c: 0, p: 0, v: 0 }, at: 'home', confirmed: false, drawings: [], memories: [], bento, holiday, wish };
  }

  const usedCards = () => MD.state.today.plan.filter(x => x.kind === 'act' && x.card).map(x => x.card);

  function recommendCards() {
    const s = MD.state, t = s.today;
    const used = usedCards();
    const cands = Object.keys(MD.CARDS).filter(id => !MD.CARDS[id].noRec && !used.includes(id) && cardOk(id));
    return cands.map(id => {
      const c = MD.CARDS[id], v = s.placeVisits[id] || 0;
      let sc = 1 + 2 / (v + 1) + Math.random() * 1.2;
      if (s.kid.energy <= 2 && c.calm) sc += 2;
      if (s.kid.energy >= 4 && !c.calm) sc += .6;
      if (id === 'market' && s.ingredients.length < Object.keys(MD.INGREDIENTS).length) sc += .4;
      if (c.rare) sc -= 1.8;                          // 看醫生不要太常出現
      if (MD.stage() === 'jh' && id === 'cram') sc += .8;
      const last = (s.placeLast || {})[id] || -9;
      if (last >= s.day - 1) sc -= 2.6;        // 昨天去過的，今天換個地方
      else if (last >= s.day - 2) sc -= 1;
      if (t.wish.type === 'card' && t.wish.id === id) sc += 10; // Ethan 的心願排第一
      return { id, sc };
    }).sort((a, b) => b.sc - a.sc).map(x => x.id);
  }

  function nutOfPlan() {
    const n = { c: 0, p: 0, v: 0 };
    MD.state.today.plan.forEach(x => { if (x.dish) for (const k of MD.DISHES[x.dish].nut) n[k]++; });
    return n;
  }

  function recommendDish(meal) {
    const t = MD.state.today;
    const n = nutOfPlan();
    const missing = ['v', 'p', 'c'].filter(k => !n[k]);
    const list = MD.state.dishes.filter(id => MD.DISHES[id].meal === meal);
    const used = t.plan.map(x => x.dish);
    const wishDish = t.wish.type === 'dish' && !used.includes(t.wish.id) ? t.wish.id : null;
    const sc = id => {
      const d = MD.DISHES[id];
      let v = Math.random() * .5;
      missing.forEach(k => { if (d.nut.includes(k)) v += 2; });
      if (d.like === 'love') v += .6;
      if (used.includes(id)) v -= 3;
      if (id === wishDish) v += 10;
      return v;
    };
    return list.sort((a, b) => sc(b) - sc(a))[0];
  }

  const planDone = () => MD.state.today.plan.every(x => (x.kind === 'meal' ? x.dish : x.card));
  const wishPlanned = () => {
    const w = MD.state.today.wish;
    return MD.state.today.plan.some(x => (w.type === 'dish' ? x.dish === w.id : x.card === w.id));
  };

  function renderPlan() {
    const s = MD.state, t = s.today;
    const k = s.kid;
    const fullTxt = k.full <= 1 ? '肚子餓' : k.full >= 4 ? '飽飽的' : '剛剛好';
    const enTxt = k.energy <= 2 ? '有點累' : '精神好';
    const allSet = planDone();
    const n = nutOfPlan();
    const recs = recommendCards();
    const hint = !s.flags.planned && !allSet;   // 第一次排行程時的提示
    const wOk = wishPlanned();
    $('plan-body').innerHTML = `
      <div class="plan-head">
        <div><b>${MD.GRADE_NAMES[MD.grade()]}</b>・${MD.WEEKDAYS[dow()]}${t.holiday ? `<span class="holiday">${t.holiday}</span>` : ''}${t.leave ? '<span class="holiday">今天請假</span>' : ''}</div>
        <div class="mian-count"></div>
      </div>
      <div class="kid-status">
        <div class="kid-face">${MD.art.char('kid', wOk ? 'sparkle' : 'happy')}</div>
        <div class="wish ${wOk ? 'ok' : ''}"><small>${F('{kid}')}的心願</small>${F(t.wish.line)}${wOk ? ' ✅' : ''}</div>
      </div>
      <div class="status-row">
        <span class="chip ${k.full <= 1 ? 'warn' : ''}">🍙 ${fullTxt}</span>
        <span class="chip">⚡ ${enTxt}</span>
        <span class="nut-stars" title="今天的營養">${['c', 'p', 'v'].map(x => `<i class="${n[x] ? 'on' : ''}" style="--c:${MD.NUT[x].color}">★</i>`).join('')}</span>
      </div>
      ${hint ? `<div class="coach">點空格，排今天的三餐和行程 ✨</div>` : ''}
      <div class="timeline">
        ${t.plan.map((x, i) => {
          const sl = MD.SLOTS[x.slot];
          if (x.kind === 'meal') {
            const d = x.dish && MD.DISHES[x.dish];
            return `<button class="slot meal ${d ? 'set' : ''}" data-i="${i}"><span class="slot-name">${sl.name}</span>${d ? `<span class="slot-val">${d.icon} ${d.name}</span>` : `<span class="slot-empty">選菜色</span>`}</button>`;
          }
          const c = x.card && MD.CARDS[x.card];
          const tagTxt = x.card === 'school' ? '點我可以請假' : '固定';
          return `<button class="slot act ${c ? 'set' : ''} ${x.fixed ? 'fixed' : ''}" data-i="${i}"><span class="slot-name">${sl.name}</span>${c ? `<span class="slot-val">${c.icon} ${F(c.name)}${x.fixed ? `<em>${tagTxt}</em>` : ''}</span>` : `<span class="slot-empty">放一張卡片</span>`}</button>`;
        }).join('')}
      </div>
      <div class="cards-title">推薦行程<small>點一下放進空格</small></div>
      <div class="cards">
        ${recs.slice(0, 4).map((id, i) => {
          const c = MD.CARDS[id], lv = cardLevel(id);
          const isWish = t.wish.type === 'card' && t.wish.id === id;
          return `<button class="card ${i === 0 ? 'top' : ''}" data-card="${id}">${isWish ? '<span class="tag">心願</span>' : i === 0 ? '<span class="tag">推薦</span>' : ''}<span class="card-icon">${c.icon}</span><b>${F(c.name)}</b><small>Lv${lv.index + 1} ${lv.task}</small></button>`;
        }).join('')}
      </div>
      <div class="plan-actions">
        <button class="btn" id="btn-auto">✨ 幫我排</button>
        <button class="btn primary" id="btn-go" ${allSet ? '' : 'data-off="1"'}>開始今天！</button>
      </div>`;
    renderMian();
    document.querySelectorAll('.slot').forEach(b => (b.onclick = () => onSlot(+b.dataset.i)));
    document.querySelectorAll('.card').forEach(b => (b.onclick = () => onCard(b.dataset.card)));
    $('btn-auto').onclick = autoPlan;
    $('btn-go').onclick = () => {
      if (!planDone()) { MD.ui.toast('還有空格喔'); return; }
      t.confirmed = true; s.flags.planned = true; MD.save(); openMap();
    };
  }

  async function onSlot(i) {
    const t = MD.state.today, x = t.plan[i];
    if (x.kind === 'act') {
      if (x.card === 'school') {
        const ok = await MD.ui.confirm(`今天要幫${F('{kid}')}請假嗎？<br><small>上午會空出來，可以排其他行程；午餐改在家吃，便當當晚餐的配菜。</small>`, '請假', '照常上學');
        if (!ok) return;
        t.leave = true;
        x.card = null; x.fixed = false;
        t.plan.splice(t.plan.indexOf(x) + 1, 0, { slot: 'lunch', kind: 'meal' });
        renderPlan();
        return;
      }
      if (x.fixed) { MD.ui.toast('這是固定的行程'); return; }
      if (x.card) { x.card = null; renderPlan(); }
      else MD.ui.toast('從下面選一張卡片');
      return;
    }
    openDishPicker(i);
  }

  function onCard(card) {
    const slot = MD.state.today.plan.find(x => x.kind === 'act' && !x.card);
    if (!slot) { MD.ui.toast('行程排滿了，點已排的行程可以拿掉'); return; }
    slot.card = card;
    renderPlan();
  }

  function openDishPicker(i) {
    const t = MD.state.today, x = t.plan[i];
    const meal = MD.SLOTS[x.slot].meal;
    const rec = recommendDish(meal);
    const list = MD.state.dishes.filter(id => MD.DISHES[id].meal === meal);
    const s = MD.ui.sheet(`
      <h3>${MD.SLOTS[x.slot].icon} ${MD.SLOTS[x.slot].name}要吃什麼？</h3>
      <div class="dish-grid">
        ${list.map(id => {
          const d = MD.DISHES[id];
          const isWish = t.wish.type === 'dish' && t.wish.id === id;
          return `<button class="dish-card ${id === rec ? 'rec' : ''} ${x.dish === id ? 'on' : ''}" data-d="${id}">
            ${isWish ? '<span class="tag">心願</span>' : id === rec ? '<span class="tag">營養推薦</span>' : ''}
            <span class="dish-icon">${d.icon}</span><b>${d.name}</b>
            <span class="dots">${[...d.nut].map(k => `<i style="background:${MD.NUT[k].color}"></i>`).join('')}${d.like === 'love' ? '<em>💗</em>' : d.like === 'veg' ? '<em>🥬</em>' : ''}</span>
          </button>`;
        }).join('')}
      </div>
      <p class="legend">${['c', 'p', 'v'].map(k => `<i style="background:${MD.NUT[k].color}"></i>${MD.NUT[k].name}`).join('　')}　💗 ${F('{kid}')}超愛</p>
      <p class="legend">去市場買新食材，就會學會新菜色（${MD.state.dishes.length} / ${Object.keys(MD.DISHES).length}）</p>`);
    s.querySelectorAll('.dish-card').forEach(b => (b.onclick = () => { x.dish = b.dataset.d; MD.ui.closeSheet(); renderPlan(); }));
  }

  function autoPlan() {
    const t = MD.state.today;
    t.plan.forEach(x => { if (x.kind === 'act' && !x.card) x.card = recommendCards()[0]; });
    t.plan.forEach(x => { if (x.kind === 'meal' && !x.dish) x.dish = recommendDish(MD.SLOTS[x.slot].meal); });
    renderPlan();
  }

  function openPlan() {
    show('plan');
    renderPlan();
  }

  /* ════════════════ 地圖 ════════════════ */
  const ROW_ROAD = y => y + 8;
  function renderMap() {
    const s = MD.state, t = s.today;
    const roadsY = [9, 28, 47, 66, 85].map(ROW_ROAD);
    $('map').innerHTML = `
      <svg class="roads" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${roadsY.map(y => `<line x1="6" y1="${y}" x2="94" y2="${y}"/>`).join('')}
        <line x1="34" y1="${roadsY[0]}" x2="34" y2="${roadsY[4]}"/><line x1="66" y1="${roadsY[0]}" x2="66" y2="${roadsY[4]}"/>
      </svg>
      ${Object.entries(MD.PLACES).map(([id, p]) => { const lk = !placeOpen(id); return `
        <button class="place ${lk ? 'locked' : ''}" data-id="${id}" style="left:${p.pos[0]}%;top:${p.pos[1]}%">
          ${MD.art.badge(id, lk)}${lk ? '<span class="badge-lock">🔒</span>' : ''}
          <span class="place-name">${placeName(id)}</span>
        </button>`; }).join('')}
      <span class="tree" style="left:4%;top:37%">🌳</span><span class="tree" style="left:96%;top:75%">🌲</span>
      <span class="tree" style="left:34%;top:1%">🌸</span><span class="tree" style="left:66%;top:56%">🌷</span>
      <div class="walkers" id="walkers" data-me="${esc(MD.state.profile.mom.ownName || '')}"><div class="w-mom">${MD.art.char('mom', 'smile')}</div><div class="w-kid">${MD.art.char('kid', 'happy')}</div><div class="w-bubble" id="w-bubble"></div></div>
      <div class="pin" id="pin">▼</div>`;
    placeWalkers(t.at, false);
    document.querySelectorAll('.place').forEach(b => (b.onclick = () => onPlace(b.dataset.id)));
    renderStrip();
    updatePin();
    kidBubble();
  }

  function renderStrip() {
    const t = MD.state.today;
    $('day-strip').innerHTML = t.plan.map((x, i) => {
      const icon = x.kind === 'meal' ? MD.DISHES[x.dish].icon : MD.CARDS[x.card].icon;
      return `<span class="step ${i < t.idx ? 'done' : i === t.idx ? 'now' : ''}"><i>${icon}</i><small>${MD.SLOTS[x.slot].name}</small></span>`;
    }).join('');
    $('map-day').innerHTML = `${MD.GRADE_NAMES[MD.grade()]}・${MD.WEEKDAYS[dow()]}`;
    renderMian();
  }

  const itemPlace = x => (x.kind === 'act' ? MD.CARDS[x.card].place : x.slot === 'snack' && MD.state.today.at !== 'cafe' ? MD.state.today.at : 'home');

  function updatePin() {
    const t = MD.state.today, x = t.plan[t.idx];
    document.querySelectorAll('.place').forEach(b => b.classList.remove('next'));
    const pin = $('pin');
    if (!x) { pin.style.display = 'none'; return; }
    const id = itemPlace(x), p = MD.PLACES[id];
    document.querySelector(`.place[data-id="${id}"]`).classList.add('next');
    pin.style.display = '';
    pin.style.left = p.pos[0] + '%'; pin.style.top = (p.pos[1] - 11) + '%';
  }

  function kidBubble(text) {
    const b = $('w-bubble'); if (!b) return;
    const k = MD.state.kid;
    if ($('walkers').classList.contains('solo') && !text) { b.style.display = 'none'; return; }   // 孩子不在旁邊
    const line = text ??(k.full <= 1 ? MD.line('hungry') : k.energy <= 1 ? MD.line('tired') : '');
    b.textContent = F(line);
    b.style.display = line ? '' : 'none';
  }

  // 站在建築的右前方（不要擋住招牌）
  function nodeOf(id) { const p = MD.PLACES[id]; return [p.pos[0] + (p.pos[0] > 70 ? -13 : 13), ROW_ROAD(p.pos[1])]; }
  function placeWalkers(id, anim) {
    const [x, y] = nodeOf(id);
    const w = $('walkers');
    w.style.transition = anim ? '' : 'none';
    w.style.left = x + '%'; w.style.top = y + '%';
  }

  async function walkTo(id, solo = false) {
    const t = MD.state.today;
    if (t.at === id) return;
    const [x1, y1] = nodeOf(t.at), [x2, y2] = nodeOf(id);
    const vx = Math.abs((x1 + x2) / 2 - 34) < Math.abs((x1 + x2) / 2 - 66) ? 34 : 66;
    const pts = y1 === y2 ? [[x2, y2]] : [[vx, y1], [vx, y2], [x2, y2]];
    const w = $('walkers');
    w.classList.add('walking');
    w.classList.toggle('solo', solo);
    const steps = setInterval(() => { if (w.classList.contains('walking') && MD.audio) MD.audio.sfx('step'); }, 330);
    const A = MD.LINES.common.arrive, own = (MD.LINES[MD.stage()] || {}).arrive || [];
    if (solo) kidBubble(''); else kidBubble(pick(Math.random() < .55 && A[id] ? A[id] : [...own, ...A.any]));
    const map = $('map'), W = map.clientWidth, H = map.clientHeight;
    let cx = x1, cy = y1;
    const stopAt = !solo && t.idx > 0 && Math.random() < .3 ? 1 : -1;
    for (let i = 0; i < pts.length; i++) {
      const [nx, ny] = pts[i];
      const dist = Math.hypot((nx - cx) * W / 100, (ny - cy) * H / 100);
      const ms = Math.max(250, dist / 150 * 1000);
      w.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
      w.style.left = nx + '%'; w.style.top = ny + '%';
      w.classList.toggle('flip', nx < cx);
      await wait(ms);
      cx = nx; cy = ny;
      if (i === stopAt) await walkStop();
    }
    w.classList.remove('walking');
    clearInterval(steps);
    t.at = id;
    if (solo && t.kidAway && id !== 'cafe') {
      // 孩子已經在這裡等了
      t.kidAway = false;
      w.classList.remove('solo');
      w.classList.add('kid-pop');
      setTimeout(() => w.classList.remove('kid-pop'), 600);
      kidBubble(MD.line('kidThere'));
      await wait(1300);
    }
    kidBubble();
  }

  /* 路上的小插曲：點一下才繼續走 */
  function walkStop() {
    return new Promise(resolve => {
      const ev = pick(MD.LINES.common.walkStop);
      const w = $('walkers');
      w.classList.remove('walking');
      kidBubble(ev.line);
      const b = document.createElement('button');
      b.className = 'walk-stop'; b.textContent = ev.icon;
      w.appendChild(b);
      b.onclick = e => { e.stopPropagation(); b.remove(); addMian(1, '一起停下來看看'); w.classList.add('walking'); kidBubble(''); resolve(); };
    });
  }

  let busy = false;
  async function onPlace(id) {
    if (busy) return;
    const s = MD.state, t = s.today, p = MD.PLACES[id];
    if (!placeOpen(id)) { MD.ui.toast(`${p.icon} ${p.name}・${MD.STAGES[p.opens].name}開放`); return; }
    const x = t.plan[t.idx];
    if (!x) return;
    if (id !== itemPlace(x)) {
      const target = MD.PLACES[itemPlace(x)];
      MD.ui.toast(`下一站是 ${target.icon} ${target.name}`);
      return;
    }
    busy = true;
    try { await runItem(x); }
    finally { busy = false; }
    const nx = t.plan[t.idx];
    if (nx && itemPlace(nx) === t.at && MD.state.today === t) { await wait(500); onPlace(t.at); }
  }

  async function runItem(x) {
    const s = MD.state, t = s.today;
    const result = { mian: 0 };
    const merge = r => { if (!r) return; result.mian += r.mian || 0; if (r.memory) t.memories.push(r.memory); if (r.drawing) t.drawings.push(r.drawing); };

    if (x.kind === 'meal') {
      const d = MD.DISHES[x.dish];
      if (x.slot !== 'snack' || t.at === 'cafe') await walkTo('home', !!t.kidAway);
      if (x.slot === 'dinner' && (MD.DAY_EVENTS[s.day]?.family || Math.random() < .5) && !t.familyDone) {
        t.familyDone = true;
        merge(await MD.ACTS.family());
      }
      const ctx = { dish: x.dish, today: t, bg: t.at === 'tennis' ? 'court' : t.at === 'home' ? 'kitchen' : t.at === 'cafe' ? 'cafe' : t.at === 'market' ? 'market' : 'park' };
      const fn = { breakfast: 'breakfast', lunch: 'lunch', snack: 'snack', dinner: 'cook' }[x.slot];
      merge(await MD.ACTS[fn](ctx));
      s.kid.full = clamp(s.kid.full + (x.slot === 'snack' ? 1 : x.slot === 'dinner' ? 3 : 2));
      for (const k of d.nut) t.nut[k]++;
      if (x.slot === 'dinner' && (s.day % 7) < 5 && s.day < 63 && !s.nextBento) {
        const r = await MD.ACTS.bentoNight({ dish: x.dish, today: t });
        merge(r);
        s.nextBento = r.bento;
      }
    } else {
      const c = MD.CARDS[x.card];
      if (x.card === 'school' && t.at === 'home' && MD.hasTrait('adhd') && (s.day === 1 || Math.random() < .35)) merge(await MD.ACTS.shoes());
      await walkTo(c.place, x.card === 'cafe' || !!t.kidAway);
      const lv = cardLevel(x.card);
      const fed = s.kid.full >= 2;
      merge(await MD.ACTS[pickAct(x.card)]({ today: t }));
      if (x.card === 'cafe') t.kidAway = true;   // 媽媽喝完咖啡，自己走到下一站
      s.placeVisits[x.card] = (s.placeVisits[x.card] || 0) + 1;
      (s.placeLast = s.placeLast || {})[x.card] = s.day;
      if (x.card === 'school' && t.bento && t.bento.dish) {   // 中午吃了便當
        s.kid.full = clamp(s.kid.full + 2);
        for (const k of MD.DISHES[t.bento.dish].nut) t.nut[k]++;
      }
      s.kid.full = clamp(s.kid.full + c.full);
      s.kid.energy = clamp(s.kid.energy + c.energy);
      if (fed) result.mian += 1;
      const nlv = cardLevel(x.card);
      if (nlv.index > lv.index) {
        t.memories.push({ id: `${x.card}-lv${nlv.index + 1}`, icon: c.icon, title: `${MD.fill(c.name)}升級：${nlv.task}` });
        MD.audio && MD.audio.sfx('fanfare');
        await MD.ui.popup(`<p class="label">熟悉度提升</p><div class="big-icon">${c.icon}</div><h3>${F(c.name)} Lv${nlv.index + 1}</h3><p class="mem">下次的任務：${nlv.task}</p><p class="tap">點一下繼續</p>`);
      }
    }
    // Ethan 的心願達成
    const w = t.wish;
    if (w && !w.done && (w.type === 'dish' ? x.dish === w.id : x.card === w.id)) {
      w.done = true;
      result.mian += 5;
      MD.audio && MD.audio.sfx('fanfare');
      await MD.ui.popup(`<p class="label">心願達成</p><div class="night-kid" style="width:110px;margin:0 auto">${MD.art.char('kid', 'sparkle')}</div><h3>${F(pick(['媽媽你記得！！', '媽媽是魔法師嗎？', '這是我今天最開心的事！']))}</h3><p class="mem">${F(w.line)}</p><p class="tap">${MD.art.mian(18)} +5　點一下繼續</p>`);
    }
    addMian(result.mian);
    t.idx++;
    MD.save();
    renderStrip(); updatePin(); kidBubble();
    if (t.idx >= t.plan.length) { await wait(400); await walkTo('home', !!t.kidAway); showNight(); }
  }

  function openMap() {
    show('map-screen');
    renderMap();
  }

  /* ════════════════ 晚上 ════════════════ */
  async function showNight() {
    const s = MD.state, t = s.today;
    if (t.nightDone) return renderNight();
    t.nightDone = true;
    // 每天至少一張畫
    const themes = [...t.drawings, ...t.plan.filter(x => x.kind === 'act').map(x => x.card), 'food', 'home'];
    // 不要跟上一張畫一樣
    const prev = (s.fridge[s.fridge.length - 1] || {}).theme;
    const theme = pick(themes.filter(x => x !== prev)) || 'home';
    const dish = (t.plan.find(x => x.slot === 'dinner') || {}).dish;
    s.fridge.push({ day: s.day, seed: Math.floor(Math.random() * 1e6), theme, dish: dish && MD.DISHES[dish].icon });
    // 營養全齊 → 獎勵
    const balanced = t.nut.c && t.nut.p && t.nut.v;
    if (balanced) { s.mian += 3; t.earned += 3; }
    t.memories.forEach(m => { if (!s.memories.find(x => x.id === m.id)) s.memories.push({ ...m, day: s.day }); });
    // 綿的里程碑
    t.newMilestones = [];
    MD.MILESTONES.forEach(m => {
      if (s.mian >= m.at && !s.milestones.includes(m.id)) {
        s.milestones.push(m.id);
        if (m.kind === 'height') s.heightMarks++;
        s.memories.push({ id: 'ms-' + m.id, icon: m.icon, title: m.title, day: s.day });
        t.newMilestones.push(m);
      }
    });
    MD.save();
    renderNight();
    for (const m of t.newMilestones) {
      MD.audio && MD.audio.sfx('fanfare');
      await MD.ui.popup(`<p class="label">${MD.art.mian(20)} 綿累積到 ${m.at}</p><div class="big-icon">${m.icon}</div><h3>${esc(m.title)}</h3><p class="tap">點一下繼續</p>`);
    }
    // 每個年級的最後一天：升上下一個年級，門框多一道刻度
    if (s.day % MD.DAYS_PER_GRADE === 0 && s.day < 63 && !s.flags['grade' + s.day]) {
      s.flags['grade' + s.day] = true;
      const g = MD.gradeOf(s.day + 1);
      s.heightMarks++;
      s.memories.push({ id: 'grade-' + g, icon: '📏', title: '升上' + MD.GRADE_NAMES[g], day: s.day });
      MD.save();
      MD.audio && MD.audio.sfx('fanfare');
      await MD.ui.popup(`<p class="label">又長大了一歲</p><div class="big-icon">📏</div><h3>升上${MD.GRADE_NAMES[g]}</h3><p class="mem">${F(MD.GRADE_UP[g] || '')}</p><p class="tap">門框上又多了一道刻度・點一下繼續</p>`);
    }
    if (MD.DAY_EVENTS[s.day]?.letter && !s.flags['letter' + s.day]) {
      s.flags['letter' + s.day] = true;
      s.memories.push({ id: 'letter' + s.day, icon: '💌', title: '枕頭邊的信', day: s.day });
      MD.save();
      await MD.ui.popup(`<p class="q">${F('給媽媽：\n謝謝你每天帶我出門。\n謝謝你做的飯糰。\n你是全世界最好的撿球搭檔。\n\n——{kid}')}</p><p class="tap" style="text-align:center">點一下，把信收好</p>`, { cls: 'letter' });
    }
  }

  function renderNight() {
    const s = MD.state, t = s.today;
    const balanced = t.nut.c && t.nut.p && t.nut.v;
    const line = t.nightLine || MD.DAY_EVENTS[s.day]?.nightLine || MD.line('night');
    t.nightLine = line;
    const last = s.fridge[s.fridge.length - 1];
    $('night-body').innerHTML = `
      <div class="night-sky">${Array.from({ length: 12 }, (_, i) => `<span style="left:${(i * 37) % 95}%;top:${(i * 53) % 60}%;animation-delay:${i * .3}s">✦</span>`).join('')}<span class="moon">🌙</span></div>
      <div class="night-kid">${MD.art.char('kid', 'sleepy')}</div>
      <div class="night-line">${F(line)}</div>
      <div class="night-card">
        <div class="row"><span>今天的綿</span><b class="mian-big">${MD.art.mian(30)} +${t.earned}</b></div>
        <div class="row"><span>${F('{kid}')}的心願</span><span>${t.wish && t.wish.done ? '達成 ✅' : '明天再試試'}</span></div>
        <div class="row"><span>今天的營養</span><span class="nut-stars big">${['c', 'p', 'v'].map(x => `<i class="${t.nut[x] ? 'on' : ''}" style="--c:${MD.NUT[x].color}">★</i>`).join('')}</span></div>
        ${balanced ? `<div class="row small">三種營養都吃到了，長得特別好（+3）</div>` : `<div class="row small">明天試試看，三種營養都吃到</div>`}
        <div class="row"><span>冰箱上的新畫</span></div>
        <div class="fridge-new">${MD.art.drawing(last.theme, last.seed, last.dish)}</div>
      </div>
      <div class="night-btns">
        <button class="btn primary" id="n-home">今天就到這裡 🌙</button>
        <button class="btn" id="n-next">再過一天</button>
      </div>
      <p class="saved-note">✓ 進度已存在這支手機裡</p>`;
    show('night');
    $('n-home').onclick = () => { nextDay(); goTitle(); };
    $('n-next').onclick = () => { nextDay(); startDay(); };
  }

  function nextDay() {
    const s = MD.state;
    if (s.today && s.today.nightDone) { s.day++; s.today = null; MD.save(); }
  }

  function startDay() {
    const s = MD.state;
    ensureDefaults();
    const special = !s.flags.ended && MD.SPECIAL_DAYS[s.day];
    if (special && (!s.today || !s.today.nightDone)) return runSpecial(special);
    if (!s.today) { s.today = newToday(); MD.save(); }
    if (s.today.nightDone) return renderNight();
    if (!s.today.confirmed) return openPlan();
    if (s.today.idx >= s.today.plan.length) return showNight();
    openMap();
  }

  const SPECIAL_INFO = {
    exam: { title: '國中會考', icon: '📝', night: '……媽，今天謝謝你。我先睡了。（他睡得很沉）' },
    graduation: { title: '畢業典禮', icon: '🎓', night: '媽，我們明天要出發了。……我好期待。' },
    trip: { title: '全家旅行', icon: '✈️', night: '媽，這是我這輩子最棒的旅行。' },
    finale: { title: '回到家', icon: '🏠' },
  };
  async function runSpecial(kind) {
    const s = MD.state, info = SPECIAL_INFO[kind];
    s.today = { special: kind, plan: [], idx: 0, earned: 0, nut: { c: 1, p: 1, v: 1 }, at: 'home', confirmed: true, drawings: [], memories: [], nightLine: info.night };
    MD.save();
    show('map-screen');
    renderMap();
    $('day-strip').innerHTML = `<span class="step now"><i>${info.icon}</i><small>${info.title}</small></span>`;
    await MD.ui.popup(`<p class="label">特別的一天</p><div class="big-icon">${info.icon}</div><h3>${info.title}</h3><p class="tap">點一下開始</p>`);
    const r = await MD.ACTS[kind === 'exam' ? 'examDay' : kind]({ today: s.today }) || {};
    s.mian += r.mian || 0; s.today.earned += r.mian || 0;
    if (r.memory) s.today.memories.push(r.memory);
    if (r.drawing) s.today.drawings.push(r.drawing);
    MD.ACTS.closeScene();
    if (kind === 'finale') {
      s.today.memories.forEach(m => { if (!s.memories.find(x => x.id === m.id)) s.memories.push({ ...m, day: s.day }); });
      s.flags.ended = true;
      s.today.nightDone = true;
      MD.save();
      return showEnding();
    }
    showNight();
  }

  function showEnding() {
    const s = MD.state;
    $('night-body').innerHTML = `
      <div class="night-sky">${Array.from({ length: 16 }, (_, i) => `<span style="left:${(i * 37) % 95}%;top:${(i * 53) % 60}%;animation-delay:${i * .3}s">✦</span>`).join('')}<span class="moon">🌙</span></div>
      <div class="ending">
        <div class="end-family">${MD.art.char('mom', 'happy')}${MD.art.char('dad', 'happy')}${MD.art.char('kid', 'smile')}</div>
        <h2>我的寶貝事業</h2>
        <p>這些年，你帶著他走過 ${s.day} 天。<br>累積了 ${s.mian} 綿、${s.memories.length} 個回憶、${s.fridge.length} 張冰箱上的畫。</p>
        <p class="end-thanks">謝謝你，一直是他的撿球搭檔。</p>
        <div class="night-btns">
          <button class="btn primary" id="e-album">📔 翻翻回憶</button>
          <button class="btn" id="e-free">繼續自由遊玩</button>
          <button class="btn" id="e-new">從一年級重新開始</button>
        </div>
      </div>`;
    show('night');
    $('e-album').onclick = openAlbum;
    $('e-free').onclick = () => { s.day++; s.today = null; MD.save(); startDay(); };
    $('e-new').onclick = newGame;
  }

  /* ════════════════ 首頁 / 相簿 / 冰箱 / 設定 ════════════════ */
  function goTitle() {
    MD.ACTS.cancelAll();
    $('scene').className = 'overlay'; $('scene').innerHTML = '';
    $('popup').classList.remove('show');
    MD.ui.closeSheet();
    busy = false;
    refreshTitle();
    show('title');
  }

  function refreshTitle() {
    const s = MD.state, has = MD.hasSave();
    $('btn-continue').style.display = has ? '' : 'none';
    $('btn-new').textContent = has ? '從頭開始' : '開始';
    $('btn-new').className = has ? 'btn' : 'btn primary';
    let prog = '';
    if (has) prog = `${MD.GRADE_NAMES[MD.grade()]}・${MD.WEEKDAYS[dow()]}・累積 ${s.mian} ${MD.POINT}`;
    $('title-progress').innerHTML = esc(prog);
  }

  // 開始前的說明：整段是國小一年級到國中三年級，也可以從比較大的年級開始
  const START_GRADES = [
    { g: 1, label: '國小一年級', note: '完整的 9 年，約 67 天' },
    { g: 3, label: '國小三年級', note: '約 53 天' },
    { g: 5, label: '國小五年級', note: '約 39 天' },
    { g: 7, label: '國中一年級', note: '約 25 天，直接到會考與畢業' },
  ];
  function chooseStartGrade() {
    return MD.ui.popup(`<div class="start-intro">
        <p class="label" style="justify-content:flex-start">開始之前</p>
        <h3>陪他，從小學走到國中畢業</h3>
        <p>這個遊戲從國小一年級開始，一路到國中三年級的會考、畢業和一趟全家旅行。每個年級是遊戲裡的 7 天，每天大約玩 5 到 10 分鐘。<br>如果不想玩這麼久，也可以從比較大的年紀開始。</p>
        <div class="start-grid">${START_GRADES.map((o, i) => `<button data-v="${o.g}" class="${i === 0 ? 'rec' : ''}"><b>${o.label}</b><small>${o.note}</small></button>`).join('')}</div>
      </div>`, { buttons: true }).then(v => +v || 0);
  }

  async function newGame() {
    if (MD.hasSave()) {
      if (!(await MD.ui.confirm('要從頭重新開始嗎？<br><small>所有進度都會重來。</small>', '重新開始', '先不要'))) return;
    }
    const g = await chooseStartGrade();
    if (!g) return;
    const settings = MD.state.settings;
    MD.state = MD.newState(); MD.state.settings = settings;
    const s = MD.state;
    s.day = (g - 1) * MD.DAYS_PER_GRADE + 1;
    s.heightMarks = g - 1;                     // 之前的年級，門框上已經有刻度了
    s.flags.startGrade = g;
    s.memories.push({ id: 'start', icon: '🌱', title: `故事從${MD.GRADE_NAMES[g]}開始`, day: s.day });
    ensureDefaults();
    MD.requestPersist();
    MD.save();
    startDay();
  }

  function openAlbum() {
    const s = MD.state;
    $('album-grid').innerHTML = s.memories.length
      ? s.memories.slice().reverse().map(m => `<div class="polaroid"><div class="pic"><span class="pic-big">${m.icon}</span><span class="pic-day">Day ${m.day}</span></div><h3>${esc(m.title)}</h3></div>`).join('')
      : `<p class="empty">一起出門，就會慢慢累積回憶。</p>`;
    show('album');
  }

  function openFridge() {
    const s = MD.state;
    $('fridge-body').innerHTML = `
      <div class="doorframe"><div class="frame-wood">${Array.from({ length: s.heightMarks }, (_, i) => `<span class="mark" style="bottom:${20 + i * 14}%"><i></i>${i + 1}</span>`).join('')}</div><small>門框上的身高</small></div>
      <div class="fridge">${s.fridge.length ? s.fridge.slice().reverse().map((f, i) => `<div class="fridge-art" style="--r:${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg"><span class="magnet" style="--m:${['#f5a9ba', '#9fd3f0', '#f2c94c', '#8ccaae'][i % 4]}"></span>${MD.art.drawing(f.theme, f.seed, f.dish)}<small>Day ${f.day}</small></div>`).join('') : '<p class="empty">冰箱還空空的。</p>'}</div>`;
    show('fridge-screen');
  }

  function openSettings() {
    const s = MD.state, p = s.profile;
    const traitNames = { asperger: '亞斯伯格特質', adhd: 'ADHD 特質' };
    $('settings').innerHTML = `
      <div class="set-card">
        <h3>震動回饋</h3>
        <div class="seg" id="set-vib"><button data-v="1" class="${s.settings.vibrate ? 'on' : ''}">開</button><button data-v="0" class="${!s.settings.vibrate ? 'on' : ''}">關</button></div>
      </div>
      <div class="set-card">
        <h3>背景音樂</h3>
        <div class="seg" id="set-music"><button data-v="1" class="${s.settings.music !== false ? 'on' : ''}">開</button><button data-v="0" class="${s.settings.music === false ? 'on' : ''}">關</button></div>
      </div>
      <div class="set-card">
        <h3>音效</h3>
        <div class="seg" id="set-sfx"><button data-v="1" class="${s.settings.sfx !== false ? 'on' : ''}">開</button><button data-v="0" class="${s.settings.sfx === false ? 'on' : ''}">關</button></div>
        <p style="margin:8px 0 0">iPhone 如果沒有聲音，請確認側邊的靜音開關沒有打開。</p>
      </div>
      <div class="set-card">
        <h3>角色設定 <span class="badge">之後的版本開放自訂</span></h3>
        <table class="profile-table">
          <tr><td>孩子</td><td>${esc(p.kid.name)}（${p.kid.age} 歲，${p.kid.gender === 'girl' ? '女孩' : '男孩'}，獨生子）</td></tr>
          <tr><td>孩子的特質</td><td>${p.kid.traits.map(t => traitNames[t] || t).join('、')}</td></tr>
          <tr><td>最愛的菜</td><td>${esc(MD.DISHES[p.kid.favoriteDish].name)}</td></tr>
          <tr><td>她的名字</td><td>${esc(p.mom.ownName || '')}</td></tr>
          <tr><td>媽媽喜歡的</td><td>${p.mom.likes.map(esc).join('、')}</td></tr>
        </table>
      </div>
      <div class="set-card">
        <h3>備份進度</h3>
        <p>進度存在這支手機的瀏覽器裡。換手機或清除瀏覽器資料前，先複製這組備份碼，存到記事本或傳給自己。</p>
        <textarea id="exp" readonly></textarea>
        <div class="row"><button class="btn small" id="btn-copy">複製備份碼</button></div>
      </div>
      <div class="set-card">
        <h3>還原進度</h3>
        <textarea id="imp" placeholder="BC1.xxxxx"></textarea>
        <div class="row"><button class="btn small" id="btn-import">還原</button></div>
      </div>
      <div class="set-card">
        <h3>加到主畫面</h3>
        <p><b>iPhone（Safari）</b>：點「分享」→「加入主畫面」<br><b>Android（Chrome）</b>：點「⋮」→「加到主畫面」</p>
      </div>
      <div class="set-card">
        <h3>清除所有資料</h3>
        <div class="row"><button class="btn small" id="btn-wipe" style="color:#c25b6e">清除所有資料</button></div>
      </div>`;
    $('exp').value = MD.exportCode();
    $('set-vib').onclick = e => { const v = e.target.dataset.v; if (!v) return; s.settings.vibrate = v === '1'; MD.save(); openSettings(); };
    $('set-music').onclick = e => { const v = e.target.dataset.v; if (!v) return; s.settings.music = v === '1'; MD.save(); MD.audio.apply(); openSettings(); };
    $('set-sfx').onclick = e => { const v = e.target.dataset.v; if (!v) return; s.settings.sfx = v === '1'; MD.save(); MD.audio.apply(); openSettings(); };
    $('btn-copy').onclick = async () => {
      try { await navigator.clipboard.writeText($('exp').value); } catch (e) { $('exp').select(); document.execCommand('copy'); }
      MD.ui.toast('已複製 ✓');
    };
    $('btn-import').onclick = () => {
      try { MD.importCode($('imp').value); ensureDefaults(); MD.ui.toast('還原成功 ✓'); goTitle(); }
      catch (e) { MD.ui.popup(`<p class="q" style="font-size:17px">還原失敗：${esc(e.message)}</p><p class="tap">點一下關閉</p>`); }
    };
    $('btn-wipe').onclick = async () => {
      if (!(await MD.ui.confirm('確定要清除所有資料嗎？<br>這個動作無法復原。', '清除', '取消'))) return;
      MD.resetSave(); goTitle();
    };
    show('settings');
  }

  /* ── 啟動 ── */
  function init() {
    MD.state = MD.load();
    ensureDefaults();
    if (MD.state.flags.ended && MD.state.today && MD.state.today.special === 'finale') { /* 已完結，首頁照常 */ }
    $('title-art').innerHTML = MD.art.duo();
    $('btn-continue').onclick = startDay;
    $('btn-new').onclick = newGame;
    $('btn-album').onclick = openAlbum;
    $('btn-fridge').onclick = openFridge;
    $('btn-settings').onclick = openSettings;
    document.querySelectorAll('[data-back]').forEach(b => (b.onclick = goTitle));
    $('btn-map-home').onclick = goTitle;
    // 地圖上的快速靜音：同時開關音樂和音效
    const soundIcon = () => ($('btn-sound').textContent = MD.state.settings.music === false && MD.state.settings.sfx === false ? '🔇' : '🔊');
    $('btn-sound').onclick = () => {
      const muted = MD.state.settings.music === false && MD.state.settings.sfx === false;
      MD.state.settings.music = MD.state.settings.sfx = muted;
      MD.save(); MD.audio.apply(); soundIcon();
    };
    soundIcon();
    $('btn-plan-home').onclick = goTitle;
    document.addEventListener('visibilitychange', () => { if (document.hidden && MD.hasSave()) MD.save(); });
    // 手機上：雙擊、雙指縮放都不要放大畫面（iOS Safari 不理會 user-scalable=no，要另外擋）
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
    document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    refreshTitle();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', init);
})();
