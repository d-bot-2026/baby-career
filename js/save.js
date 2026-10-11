/*
 * 存檔系統：存在玩家手機的 localStorage，有版本號與遷移，可匯出備份碼。
 */
window.MD = window.MD || {};

MD.SAVE_KEY = 'baby-career-save';
MD.SAVE_VERSION = 3;

MD.newState = function () {
  return {
    version: MD.SAVE_VERSION,
    profile: JSON.parse(JSON.stringify(MD.DEFAULT_PROFILE)),
    day: 1,
    today: null,            // 今天的行程與進度（見 game.js）
    mian: 0,                // 綿：累積的愛
    kid: { full: 2, energy: 3 },   // 肚子 0–5、精神 0–5
    placeVisits: {},        // 各地點去過幾次（決定熟悉度等級）
    dishes: [],             // 已解鎖菜色 id（初始值在 game.js 補）
    ingredients: [],        // 市場買到的食材
    fridge: [],             // Ethan 的畫 { day, seed, theme }
    memories: [],           // 回憶相簿 { id, day, title, icon }
    milestones: [],         // 已達成的綿里程碑
    heightMarks: 0,
    dadHits: 0,
    flags: {},
    settings: { vibrate: true },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

MD.MIGRATIONS = {
  // v1 → v2：幼兒園改成小學、行程改用卡片。進行中的那一天重新排。
  1: s => {
    if (s.placeVisits && s.placeVisits.kinder) { s.placeVisits.school = s.placeVisits.kinder; delete s.placeVisits.kinder; }
    if (s.today && !s.today.nightDone) s.today = null;
    if (s.profile && s.profile.kid) s.profile.kid.age = 7;
    return s;
  },
  // v2 → v3：拿掉「網球轉播」卡片
  2: s => {
    if (s.today && !s.today.nightDone && s.today.plan && s.today.plan.some(x => x.card === 'tv')) s.today = null;
    return s;
  },
};

MD.migrate = function (s) {
  while ((s.version || 0) < MD.SAVE_VERSION) {
    const v = s.version || 0;
    if (MD.MIGRATIONS[v]) s = MD.MIGRATIONS[v](s);
    s.version = v + 1;
  }
  const base = MD.newState();
  for (const k in base) if (!(k in s)) s[k] = base[k];
  for (const k of ['mom', 'kid', 'dad']) s.profile[k] = Object.assign({}, base.profile[k], s.profile[k]);
  s.settings = Object.assign({}, base.settings, s.settings);
  return s;
};

MD.hasSave = function () {
  try { return !!localStorage.getItem(MD.SAVE_KEY); } catch (e) { return false; }
};

MD.load = function () {
  try {
    const raw = localStorage.getItem(MD.SAVE_KEY);
    if (raw) return MD.migrate(JSON.parse(raw));
  } catch (e) { console.warn('讀檔失敗', e); }
  return MD.newState();
};

MD.save = function () {
  MD.state.updatedAt = Date.now();
  try {
    localStorage.setItem(MD.SAVE_KEY, JSON.stringify(MD.state));
    MD.ui && MD.ui.flashSaved();
  } catch (e) { console.warn('存檔失敗', e); }
};

MD.resetSave = function () {
  try { localStorage.removeItem(MD.SAVE_KEY); } catch (e) {}
  MD.state = MD.newState();
};

MD.exportCode = function () {
  const bytes = new TextEncoder().encode(JSON.stringify(MD.state));
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return 'BC1.' + btoa(bin);
};

MD.importCode = function (code) {
  code = (code || '').trim().replace(/\s+/g, '');
  if (!code.startsWith('BC1.')) throw new Error('備份碼格式不對');
  const bytes = Uint8Array.from(atob(code.slice(4)), c => c.charCodeAt(0));
  const s = JSON.parse(new TextDecoder().decode(bytes));
  if (!s || !s.profile) throw new Error('備份碼內容不完整');
  MD.state = MD.migrate(s);
  MD.save();
};

MD.requestPersist = function () {
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
};
