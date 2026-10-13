/*
 * 預設角色設定（Profile）
 * ------------------------------------------------------------
 * 這裡的所有欄位，未來版本都會開放給玩家自訂。
 * 遊戲中的文字一律使用 {kid}、{mom}、{dad} 等佔位符，不寫死名字。
 * 新增欄位時：在 DEFAULT_PROFILE 加預設值，並在 save.js 的 MIGRATIONS 補一步。
 */
window.MD = window.MD || {};

MD.GAME_TITLE = '我的寶貝事業';
MD.POINT = '綿';   // 愛的點數名稱（只累積、不花用）

MD.DEFAULT_PROFILE = {
  mom: {
    name: '媽媽',
    likes: ['咖啡', '網球', '法國文學'],
    drink: '拿鐵',
    friend: 'Sophie',
  },
  kid: {
    name: 'Ethan',
    gender: 'boy',             // boy | girl
    age: 7,               // 國小一年級
    siblings: [],              // 預留
    traits: ['asperger', 'adhd'],
    sport: 'tennis',
    favoriteDish: 'onigiri',   // 天天吃都不膩的那一道
  },
  dad: {
    name: '爸爸',
  },
};

MD.fill = function (text, profile) {
  if (!text) return '';
  const p = profile || MD.state.profile;
  const map = {
    kid: p.kid.name, mom: p.mom.name, dad: p.dad.name,
    drink: p.mom.drink, friend: p.mom.friend,
    '他': p.kid.gender === 'girl' ? '她' : '他',
    pt: MD.POINT,
  };
  return text.replace(/\{([^}]+)\}/g, (m, k) => (k in map ? map[k] : m));
};

MD.hasTrait = t => MD.state.profile.kid.traits.includes(t);

/* 隨機挑一個，但最近挑過的先不要（台詞不會一直重複）。
 * 記錄存在 MD.state.recent，所以關掉遊戲再打開也記得。 */
MD.pick = function (arr) {
  if (!arr || !arr.length) return undefined;
  if (arr.length < 3) return arr[Math.floor(Math.random() * arr.length)];
  const key = arr.length + ':' + arr.slice(0, 3).map(x => (typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 12)).join('|');
  const store = (MD.state && (MD.state.recent = MD.state.recent || {})) || (MD._recent = MD._recent || {});
  const seen = store[key] || [];
  const pool = arr.map((_, i) => i).filter(i => !seen.includes(i));
  const i = pool[Math.floor(Math.random() * pool.length)];
  seen.push(i);
  while (seen.length > Math.max(1, Math.floor(arr.length * .6))) seen.shift();
  store[key] = seen;
  return arr[i];
};

/* ── 成長階段 ── 第幾年級、哪個階段（low / mid / high / jh） */
MD.gradeOf = day => Math.min(9, Math.floor((day - 1) / 7) + 1);
MD.stageOf = g => (g <= 2 ? 'low' : g <= 4 ? 'mid' : g <= 6 ? 'high' : 'jh');
MD.grade = () => MD.gradeOf(MD.state ? MD.state.day : 1);
MD.stage = () => MD.stageOf(MD.grade());
MD.stageAtLeast = st => MD.STAGE_ORDER.indexOf(MD.stage()) >= MD.STAGE_ORDER.indexOf(st);

/* 依目前階段挑一句台詞（階段專屬的 + 共用的） */
MD.line = function (key) {
  const own = (MD.LINES[MD.stage()] || {})[key] || [];
  const common = MD.LINES.common[key] || [];
  return MD.pick([...own, ...common]);
};
