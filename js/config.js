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
