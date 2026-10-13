/*
 * 遊戲資料：成長階段、地點、行程卡、菜色、食材、台詞、里程碑
 * 新增內容大多只需要改這個檔案。
 */
window.MD = window.MD || {};

/* ── 成長階段 ──
 * 每個年級 = 遊戲裡的 7 天。國小 6 年 + 國中 3 年 = 63 天，之後是會考、畢業、旅行、回顧。
 */
MD.DAYS_PER_GRADE = 7;
MD.STAGES = {
  low:  { name: '國小低年級', grades: [1, 2] },
  mid:  { name: '國小中年級', grades: [3, 4] },
  high: { name: '國小高年級', grades: [5, 6] },
  jh:   { name: '國中',       grades: [7, 8, 9] },
};
MD.STAGE_ORDER = ['low', 'mid', 'high', 'jh'];
MD.SPECIAL_DAYS = { 64: 'exam', 65: 'graduation', 66: 'trip', 67: 'finale' };
MD.GRADE_NAMES = ['', '國小一年級', '國小二年級', '國小三年級', '國小四年級', '國小五年級', '國小六年級', '國中一年級', '國中二年級', '國中三年級'];

/* ── 地點（地圖上的建築）── 5 列 × 3 欄，家在正中間。opens：哪個階段開放 */
MD.PLACES = {
  market:     { name: '傳統市場', icon: '🧺', pos: [18, 9],  color: '#eadfcd', roof: '#c4775a' },
  pool:       { name: '游泳池',   icon: '🏊', pos: [50, 9],  color: '#dde2e6', roof: '#5a6577', opens: 'mid' },
  cafe:       { name: '咖啡店',   icon: '☕', pos: [82, 9],  color: '#efe6d8', roof: '#9c7b5f' },
  library:    { name: '圖書館',   icon: '📚', pos: [18, 28], color: '#e4e1d8', roof: '#5a6577', opens: 'mid' },
  park:       { name: '公園',     icon: '🌳', pos: [50, 28], color: '#dfe5d8', roof: '#8a9a7b' },
  bookstore:  { name: '書店',     icon: '📖', pos: [82, 28], color: '#efe6d8', roof: '#b98a80', opens: 'high' },
  school:     { name: '小學',     icon: '🏫', pos: [18, 47], color: '#eadfcd', roof: '#c99a47' },
  home:       { name: '家',       icon: '🏠', pos: [50, 47], color: '#f3ebdf', roof: '#b5654a' },
  tennis:     { name: '網球場',   icon: '🎾', pos: [82, 47], color: '#dfe5d8', roof: '#7f9a8a' },
  art:        { name: '畫畫教室', icon: '🎨', pos: [18, 66], color: '#e4e1d8', roof: '#b98a80', opens: 'mid' },
  cram:       { name: '補習班',   icon: '✏️', pos: [50, 66], color: '#dde2e6', roof: '#6b7a8f', opens: 'jh' },
  clinic:     { name: '診所',     icon: '🩺', pos: [82, 66], color: '#e0e7e8', roof: '#7c9aa3' },
  grandma:    { name: '阿嬤家',   icon: '🏮', pos: [18, 85], color: '#eadfcd', roof: '#a8694f' },
  nightmarket:{ name: '夜市',     icon: '🏮', pos: [50, 85], color: '#efe6d8', roof: '#c99a47', opens: 'high' },
  beach:      { name: '海邊',     icon: '🐚', pos: [82, 85], color: '#ece3cf', roof: '#c9a26b', opens: 'high' },
};
MD.PLACES.nightmarket.icon = '🎡';

/* ── 行程卡 ──
 * place：在哪棟建築；levels：去過幾次（at）後解鎖哪個互動（act 對應 acts.js）
 * energy / full：做完後精神、肚子的變化；calm：比較放鬆；stages：哪些階段可以排
 */
MD.CARDS = {
  school:   { place: 'school', name: '上學', icon: '🎒', energy: -1, full: -1, noRec: true,
              levels: [{ at: 0, task: '接放學', act: 'school' }] },
  tennis:   { place: 'tennis', name: '網球課', icon: '🎾', energy: -2, full: -2,
              levels: [{ at: 0, task: '發球練習', act: 'serve' }, { at: 0, task: '撿球', act: 'pickup' }, { at: 2, task: '來回對打', act: 'rally' }, { at: 4, task: '小小比賽', act: 'match' }] },
  park:     { place: 'park', name: '公園', icon: '🌳', energy: 0, full: -1, calm: true, stages: ['low', 'mid', 'high'],
              levels: [{ at: 0, task: '撿葉子', act: 'leaves' }, { at: 0, task: '溜滑梯', act: 'slide' }, { at: 2, task: '吹泡泡', act: 'bubbles' }] },
  market:   { place: 'market', name: '傳統市場', icon: '🧺', energy: 0, full: 0,
              levels: [{ at: 0, task: '買新食材', act: 'market' }] },
  cafe:     { place: 'cafe', name: '{me} 的咖啡時間', icon: '☕', energy: 1, full: 0, calm: true, mom: true,
              levels: [{ at: 0, task: '一個人的四十分鐘', act: 'cafe' }] },
  homework: { place: 'home', name: '陪寫功課', icon: '📓', energy: -1, full: -1, calm: true,
              levels: [{ at: 0, task: '守護專注力', act: 'homework' }] },
  grandma:  { place: 'grandma', name: '回阿嬤家', icon: '🏮', energy: 0, full: 1, calm: true,
              levels: [{ at: 0, task: '跟阿嬤包水餃', act: 'dumpling' }] },
  clinic:   { place: 'clinic', name: '看醫生', icon: '🩺', energy: -1, full: 0, rare: true,
              levels: [{ at: 0, task: '打預防針', act: 'shot' }] },
  pool:     { place: 'pool', name: '游泳課', icon: '🏊', energy: -2, full: -2, stages: ['mid', 'high', 'jh'],
              levels: [{ at: 0, task: '游兩趟', act: 'swim' }] },
  library:  { place: 'library', name: '圖書館', icon: '📚', energy: 0, full: 0, calm: true, stages: ['mid', 'high', 'jh'],
              levels: [{ at: 0, task: '找一本書', act: 'books' }] },
  art:      { place: 'art', name: '畫畫教室', icon: '🎨', energy: 0, full: 0, calm: true, stages: ['mid', 'high', 'jh'],
              levels: [{ at: 0, task: '一起上色', act: 'paint' }] },
  bookstore:{ place: 'bookstore', name: '逛書店', icon: '📖', energy: 0, full: 0, calm: true, stages: ['high', 'jh'],
              levels: [{ at: 0, task: '幫他挑一本書', act: 'bookshop' }] },
  beach:    { place: 'beach', name: '去海邊', icon: '🐚', energy: -1, full: -1, stages: ['high', 'jh'], weekend: true,
              levels: [{ at: 0, task: '撿貝殼', act: 'shells' }] },
  nightmarket:{ place: 'nightmarket', name: '逛夜市', icon: '🎡', energy: -1, full: 1, stages: ['high', 'jh'],
              levels: [{ at: 0, task: '套圈圈', act: 'ringtoss' }] },
  cram:     { place: 'cram', name: '補習班', icon: '✏️', energy: -2, full: -1, stages: ['jh'],
              levels: [{ at: 0, task: '陪他背單字', act: 'flashcards' }] },
};

/* ── 菜色（48 道）──
 * meal：b 早餐、m 正餐（午餐／晚餐）；nut：c 澱粉、p 蛋白質、v 蔬菜
 * like：love 超愛、ok 普通、veg 有蔬菜要「偽裝」；from：需要的食材；stage：到哪個階段才會做
 */
MD.DISHES = {
  danbing:    { name: '蛋餅',       unit: '份', icon: '🌯', meal: 'b', nut: 'cp',  like: 'ok',   ing: ['🥚', '🫓'] },
  onigiri:    { name: '鮭魚飯糰',   unit: '個', icon: '🍙', meal: 'b', nut: 'cp',  like: 'love', ing: ['🍚', '🐟'] },
  frenchtoast:{ name: '法式吐司',   unit: '片', icon: '🍞', meal: 'b', nut: 'cp',  like: 'love', ing: ['🍞', '🥚', '🥛'] },
  yamsoy:     { name: '地瓜豆漿',   unit: '杯', icon: '🍠', meal: 'b', nut: 'cp',  like: 'ok',   ing: ['🍠', '🥛'], from: 'yam' },
  vegomelet:  { name: '菠菜蛋捲',   unit: '份', icon: '🍳', meal: 'b', nut: 'pv',  like: 'veg',  ing: ['🥚', '🥬'], from: 'spinach' },
  ironnoodle: { name: '鐵板麵',     unit: '盤', icon: '🥢', meal: 'b', nut: 'cp',  like: 'love', ing: ['🍜', '🥚', '🧂'], stage: 'mid' },
  radishcake: { name: '蘿蔔糕',     unit: '塊', icon: '🟫', meal: 'b', nut: 'cv',  like: 'ok',   ing: ['🥕', '🍚'], from: 'radish' },
  oatmilk:    { name: '燕麥牛奶',   unit: '碗', icon: '🥣', meal: 'b', nut: 'cp',  like: 'ok',   ing: ['🥣', '🥛'], from: 'oat' },
  waffle:     { name: '格子鬆餅',   unit: '片', icon: '🧇', meal: 'b', nut: 'c',   like: 'love', ing: ['🌾', '🥚', '🍯'], from: 'flour' },
  sandwich:   { name: '總匯三明治', unit: '份', icon: '🥪', meal: 'b', nut: 'cpv', like: 'love', ing: ['🍞', '🥚', '🥬', '🧀'], stage: 'high' },

  friedchicken:{ name: '酥脆炸雞', unit: '塊', icon: '🍗', meal: 'm', nut: 'p',   like: 'love', ing: ['🍗', '🌾', '🧂'] },
  luroufan:   { name: '滷肉飯',     unit: '碗', icon: '🍚', meal: 'm', nut: 'cp',  like: 'love', ing: ['🥩', '🍚', '🥚'] },
  curry:      { name: '咖哩飯',     unit: '盤', icon: '🍛', meal: 'm', nut: 'cpv', like: 'love', ing: ['🥕', '🥔', '🍚'] },
  tomatoegg:  { name: '番茄炒蛋飯', unit: '碗', icon: '🍅', meal: 'm', nut: 'cpv', like: 'ok',   ing: ['🍅', '🥚', '🍚'] },
  greens:     { name: '炒青菜',     unit: '盤', icon: '🥬', meal: 'm', nut: 'v',   like: 'veg',  ing: ['🥬', '🧄'] },
  omurice:    { name: '蛋包飯',     unit: '份', icon: '🍳', meal: 'm', nut: 'cp',  like: 'love', ing: ['🥚', '🍚', '🍅'] },
  steak:      { name: '香煎牛排',   unit: '塊', icon: '🥩', meal: 'm', nut: 'p',   like: 'love', ing: ['🥩', '🧈', '🧂'], from: 'beef' },
  beefnoodle: { name: '紅燒牛肉麵', unit: '碗', icon: '🍜', meal: 'm', nut: 'cpv', like: 'love', ing: ['🥩', '🍜', '🥬'], from: 'beef' },
  teriyaki:   { name: '照燒雞腿飯', unit: '份', icon: '🍱', meal: 'm', nut: 'cp',  like: 'love', ing: ['🍗', '🍚', '🍯'], from: 'chicken' },
  sanbeiji:   { name: '三杯雞',     unit: '盤', icon: '🥘', meal: 'm', nut: 'p',   like: 'ok',   ing: ['🍗', '🌿', '🧄'], from: 'basil' },
  ribs:       { name: '糖醋排骨',   unit: '盤', icon: '🍖', meal: 'm', nut: 'p',   like: 'love', ing: ['🍖', '🍍', '🍅'], from: 'pork' },
  cod:        { name: '清蒸鱈魚',   unit: '塊', icon: '🐟', meal: 'm', nut: 'p',   like: 'ok',   ing: ['🐟', '🫚'], from: 'fish' },
  cornsoup:   { name: '玉米濃湯',   unit: '碗', icon: '🌽', meal: 'm', nut: 'cv',  like: 'love', ing: ['🌽', '🥛'], from: 'corn' },
  bolognese:  { name: '番茄肉醬麵', unit: '盤', icon: '🍝', meal: 'm', nut: 'cpv', like: 'love', ing: ['🍝', '🍅', '🥩'], from: 'mince' },
  hamburg:    { name: '漢堡排',     unit: '個', icon: '🍔', meal: 'm', nut: 'p',   like: 'love', ing: ['🥩', '🧅'], from: 'onion' },
  pumpkin:    { name: '南瓜燉飯',   unit: '盤', icon: '🎃', meal: 'm', nut: 'cv',  like: 'veg',  ing: ['🎃', '🍚', '🧀'], from: 'pumpkin' },
  mapotofu:   { name: '麻婆豆腐',   unit: '盤', icon: '🌶️', meal: 'm', nut: 'pv',  like: 'ok',   ing: ['⬜', '🥩', '🌶️'], from: 'tofu' },
  kungpao:    { name: '宮保雞丁',   unit: '盤', icon: '🥜', meal: 'm', nut: 'pv',  like: 'love', ing: ['🍗', '🥜', '🌶️'], from: 'chicken' },
  sukiyaki:   { name: '壽喜燒',     unit: '鍋', icon: '🫕', meal: 'm', nut: 'cpv', like: 'love', ing: ['🥩', '⬜', '🥬'], from: 'tofu' },
  ricenoodle: { name: '新竹炒米粉', unit: '盤', icon: '🥡', meal: 'm', nut: 'cv',  like: 'ok',   ing: ['🍜', '🥕', '🥬'], from: 'ricenoodle' },
  dumplings:  { name: '高麗菜水餃', unit: '盤', icon: '🥟', meal: 'm', nut: 'cpv', like: 'love', ing: ['🌾', '🥩', '🥬'], stage: 'mid' },
  borscht:    { name: '羅宋湯',     unit: '碗', icon: '🍲', meal: 'm', nut: 'pv',  like: 'ok',   ing: ['🥩', '🍅', '🥔'], from: 'mince' },
  macaroni:   { name: '焗烤通心粉', unit: '盤', icon: '🧀', meal: 'm', nut: 'cp',  like: 'love', ing: ['🍝', '🧀', '🥛'], from: 'cheese' },
  meatball:   { name: '紅燒獅子頭', unit: '顆', icon: '🧆', meal: 'm', nut: 'p',   like: 'love', ing: ['🥩', '🥬', '🧄'], from: 'mince' },
  potnoodle:  { name: '鍋燒意麵',   unit: '碗', icon: '🍥', meal: 'm', nut: 'cpv', like: 'love', ing: ['🍜', '🥚', '🥬'], stage: 'high' },
  ratatouille:{ name: '普羅旺斯燉菜', unit: '盤', icon: '🍆', meal: 'm', nut: 'v',  like: 'veg',  ing: ['🍆', '🍅', '🧅'], stage: 'high' },
  salmon:     { name: '香煎鮭魚排', unit: '塊', icon: '🍣', meal: 'm', nut: 'p',   like: 'love', ing: ['🍣', '🍋', '🧈'], from: 'salmon' },

  banana:     { name: '香蕉',       unit: '根', icon: '🍌', meal: 'b', nut: 'c',   like: 'ok',   ing: ['🍌'] },
  jidangao:   { name: '雞蛋糕',     unit: '包', icon: '🧁', meal: 'b', nut: 'cp',  like: 'love', ing: ['🥚', '🌾'] },
  yogurt:     { name: '草莓優格',   unit: '杯', icon: '🍓', meal: 'b', nut: 'pv',  like: 'love', ing: ['🍓', '🥛'], from: 'strawberry' },
  crepe:      { name: '可麗餅',     unit: '片', icon: '🥞', meal: 'b', nut: 'c',   like: 'love', ing: ['🥞', '🍯'], from: 'flour' },
  fruitplate: { name: '水果切盤',   unit: '盤', icon: '🍉', meal: 'b', nut: 'v',   like: 'ok',   ing: ['🍉', '🍎', '🍇'] },
};

MD.INGREDIENTS = {
  beef:       { name: '牛肉',   icon: '🐄' },
  chicken:    { name: '雞腿',   icon: '🐔' },
  pork:       { name: '排骨',   icon: '🐖' },
  yam:        { name: '地瓜',   icon: '🍠' },
  spinach:    { name: '菠菜',   icon: '🥬' },
  basil:      { name: '九層塔', icon: '🌿' },
  fish:       { name: '鱈魚',   icon: '🐟' },
  corn:       { name: '玉米',   icon: '🌽' },
  mince:      { name: '絞肉',   icon: '🥩' },
  onion:      { name: '洋蔥',   icon: '🧅' },
  pumpkin:    { name: '南瓜',   icon: '🎃' },
  strawberry: { name: '草莓',   icon: '🍓' },
  flour:      { name: '麵粉',   icon: '🌾' },
  tofu:       { name: '豆腐',   icon: '⬜' },
  radish:     { name: '白蘿蔔', icon: '🥕' },
  oat:        { name: '燕麥',   icon: '🥣' },
  ricenoodle: { name: '米粉',   icon: '🍜' },
  cheese:     { name: '起司',   icon: '🧀' },
  salmon:     { name: '鮭魚',   icon: '🍣' },
};

MD.NUT = { c: { name: '澱粉', color: '#c99a47' }, p: { name: '蛋白質', color: '#c4775a' }, v: { name: '蔬菜', color: '#8a9a7b' } };

MD.WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
MD.WEATHER = ['☀️', '⛅', '☀️', '🌤️', '☀️', '⛅', '☀️'];

/* 行程時段 */
MD.SLOTS = {
  breakfast: { name: '早餐', icon: '🌅', meal: 'b' },
  lunch:     { name: '午餐', icon: '🍽️', meal: 'm' },
  dinner:    { name: '晚餐', icon: '🍲', meal: 'm' },
  morning:   { name: '上午', icon: '☀️' },
  day:       { name: '上課', icon: '🏫' },
  pm1:       { name: '下午', icon: '🌤️' },
  evening:   { name: '傍晚', icon: '🌇' },
};

/* 一天結束時，冰箱上多了什麼（孩子長大，留下的東西也不一樣） */
MD.FRIDGE_LABEL = { low: '冰箱上的新畫', mid: '冰箱上的新畫', high: '冰箱上的新作品', jh: '冰箱上多了一張' };

/* 不用上學的日子 */
MD.HOLIDAYS = ['校慶補假 🎉', '教師研習 📋', '颱風假 🌀', '運動會補假 🏃'];

/* Ethan 的心願：早上提出，排進行程並完成就會很開心。stages 不寫 = 每個階段都可能 */
MD.WISHES = [
  { type: 'dish', id: 'friedchicken', line: '今天可以吃炸雞嗎？' },
  { type: 'dish', id: 'curry',        line: '我想吃咖哩！要很多馬鈴薯。' },
  { type: 'dish', id: 'steak',        line: '我想吃牛排。像大人那樣切。' },
  { type: 'dish', id: 'ribs',         line: '糖醋排骨……酸酸甜甜的那個。' },
  { type: 'dish', id: 'jidangao',     line: '可以吃雞蛋糕嗎？熱熱的那種。', stages: ['low', 'mid'] },
  { type: 'dish', id: 'onigiri',      line: '我要飯糰。一樣的那種。', stages: ['low', 'mid'] },
  { type: 'dish', id: 'crepe',        line: '我想吃可麗餅！法國的那個！' },
  { type: 'dish', id: 'dumplings',    line: '可以吃水餃嗎？我想數有幾顆。', stages: ['mid', 'high'] },
  { type: 'dish', id: 'sukiyaki',     line: '好想吃壽喜燒，蛋要沾很多。', stages: ['high', 'jh'] },
  { type: 'dish', id: 'potnoodle',    line: '媽，晚餐可以吃鍋燒意麵嗎？', stages: ['jh'] },
  { type: 'card', id: 'park',         line: '我想去公園看螞蟻。', stages: ['low', 'mid'] },
  { type: 'card', id: 'park',         line: '我想去公園溜滑梯！', stages: ['low'] },
  { type: 'card', id: 'tennis',       line: '今天可以打網球嗎？' },
  { type: 'card', id: 'market',       line: '我想去市場幫阿姨提東西。', stages: ['low', 'mid'] },
  { type: 'card', id: 'homework',     line: '今天的功課我想要媽媽陪我寫。', stages: ['low', 'mid'] },
  { type: 'card', id: 'grandma',      line: '我想去阿嬤家！阿嬤說要包水餃。' },
  { type: 'card', id: 'pool',         line: '我想去游泳，我要游到另一邊。', stages: ['mid', 'high'] },
  { type: 'card', id: 'library',      line: '圖書館有新的恐龍書，我想去借。', stages: ['mid'] },
  { type: 'card', id: 'art',          line: '我想畫一張畫送給阿嬤。', stages: ['mid', 'high'] },
  { type: 'card', id: 'bookstore',    line: '我想去書店，我要看偵探小說。', stages: ['high', 'jh'] },
  { type: 'card', id: 'nightmarket',  line: '晚上可以去夜市嗎？我想套圈圈。', stages: ['high', 'jh'] },
  { type: 'card', id: 'beach',        line: '週末可以去海邊嗎？', stages: ['high', 'jh'] },
  { type: 'card', id: 'tennis',       line: '下禮拜有比賽，我想多練一下。', stages: ['jh'] },
];

/* 便當：看明天的狀況來裝
 * tags：big 份量多、easy 用手拿著吃、love 他最愛、saucy 有醬汁、spoil 天熱容易壞、sneaky 青菜藏起來、cute 很可愛
 * conds：明天的狀況。slot = 主要靠哪一格解決；good = 哪個選項符合；check = 整個便當有沒有做到
 */
MD.tag = (o, t) => !!(o.tags && o.tags.includes(t));
MD.BENTO = {
  base: [
    { id: 'rice',     name: '白飯（大碗）', icon: '🍚', nut: 'c',  tags: ['big'] },
    { id: 'onigiri',  name: '飯糰',         icon: '🍙', nut: 'c',  tags: ['easy', 'love'] },
    { id: 'sandwich', name: '蛋沙拉三明治', icon: '🥪', nut: 'cp', tags: ['easy', 'spoil'] },
    { id: 'noodle',   name: '炒麵',         icon: '🍝', nut: 'c',  tags: ['big'] },
    { id: 'wrap',     name: '蛋餅捲',       icon: '🌯', nut: 'cp', tags: ['easy'] },
  ],
  main: [
    { id: 'karaage',  name: '炸雞塊',   icon: '🍗', nut: 'p',  tags: ['love', 'easy'] },
    { id: 'salmon',   name: '煎鮭魚',   icon: '🐟', nut: 'p',  tags: [] },
    { id: 'shrimp',   name: '炸蝦',     icon: '🍤', nut: 'p',  tags: ['spoil', 'love'] },
    { id: 'curry',    name: '咖哩',     icon: '🍛', nut: 'cpv', tags: ['saucy', 'big'] },
    { id: 'porkchop', name: '滷排骨',   icon: '🥩', nut: 'p',  tags: ['big', 'saucy'] },
    { id: 'meatball', name: '照燒肉丸', icon: '🧆', nut: 'p',  tags: ['easy'] },
  ],
  side: [
    { id: 'tamago',   name: '玉子燒',       icon: '🍳', nut: 'p',  tags: ['love'] },
    { id: 'spinegg',  name: '菠菜玉子燒',   icon: '🥬', nut: 'pv', tags: ['sneaky'] },
    { id: 'broccoli', name: '燙青花菜',     icon: '🥦', nut: 'v',  tags: [] },
    { id: 'tomato',   name: '小番茄',       icon: '🍅', nut: 'v',  tags: ['easy'] },
    { id: 'octopus',  name: '章魚香腸',     icon: '🐙', nut: 'p',  tags: ['cute', 'love'] },
    { id: 'potato',   name: '馬鈴薯沙拉',   icon: '🥔', nut: 'cv', tags: ['spoil'] },
    { id: 'cucumber', name: '涼拌小黃瓜',   icon: '🥒', nut: 'v',  tags: [] },
    { id: 'corn',     name: '奶油玉米',     icon: '🌽', nut: 'cv', tags: ['love'] },
  ],
  conds: [
    { id: 'trip', stages: ['low', 'mid', 'high'], slot: 'base',
      note: '校外教學，要坐在草地上吃。', hint: '目標：主食要能用手拿著吃', kid: '明天要去校外教學！要坐在草地上吃便當！',
      good: o => MD.tag(o, 'easy'), check: it => MD.tag(it[0], 'easy'), tip: '草地上不好用筷子，下次試試用手拿的主食。',
      yes: '在草地上吃飯糰剛剛好！老師說好羨慕。', no: '在草地上用筷子好難，飯掉了一點點。' },
    { id: 'pe', slot: 'base',
      note: '有體育課，一定會很餓。', hint: '目標：份量要夠多', kid: '明天有體育課，要跑八百公尺……',
      good: o => MD.tag(o, 'big'), check: it => it.some(o => MD.tag(o, 'big')), tip: '跑完步會很餓，下次裝份量多一點的。',
      yes: '跑了八百公尺，還好便當很多。全部吃光光！', no: '體育課後好餓……便當一下就吃完了。',
      jh: { yes: '練完球，便當很夠。……謝啦。', no: '練完球好餓，跟同學借了一包餅乾。' } },
    { id: 'exam', stages: ['mid', 'high', 'jh'], slot: 'main',
      note: '要考試，他有點緊張。', hint: '目標：放一樣他最愛的', kid: '明天要考試……我有一點緊張。',
      good: o => MD.tag(o, 'love'), check: it => it.some(o => MD.tag(o, 'love')), tip: '緊張的時候，吃到最愛的東西會安心一點。',
      yes: '中午吃到最喜歡的，下午考試好像比較會了。', no: '便當很好吃。可是考試前我比較想吃炸雞。',
      jh: { yes: '中午吃到喜歡的，考完覺得還可以。', no: '考試……還好啦。便當有吃完。' } },
    { id: 'hot', slot: 'side',
      note: '很熱，便當要在教室放一個上午。', hint: '目標：不放天熱容易壞的（美乃滋、海鮮）', kid: '明天好像會很熱喔。',
      good: o => !MD.tag(o, 'spoil'), check: it => !it.some(o => MD.tag(o, 'spoil')), tip: '天熱時，美乃滋和海鮮放一個上午容易壞。',
      yes: '今天好熱，可是便當還是好好的。', no: '便當有一點點怪怪的味道，我就沒吃完。' },
    { id: 'noveg', stages: ['low', 'mid', 'high'], slot: 'side',
      note: '他最近都不肯吃青菜。', hint: '目標：讓他吃到青菜（藏起來也可以）', kid: '我明天不要青菜喔。一根都不要。',
      good: o => MD.tag(o, 'sneaky'), check: it => it.some(o => MD.tag(o, 'sneaky')) || (it.some(o => o.nut.includes('v')) && it.some(o => MD.tag(o, 'love'))), tip: '把青菜藏在他喜歡的東西裡，比較容易吃下去。',
      yes: '玉子燒裡面綠綠的是什麼？……算了，好吃。', no: '青菜……我留給便當盒了。' },
    { id: 'sauce', slot: 'main',
      note: '他說醬汁跑到飯上，整個便當就「壞掉了」。', hint: '目標：不放有醬汁的菜', kid: '醬汁不可以碰到飯喔。一點點都不行。',
      good: o => !MD.tag(o, 'saucy'), check: it => !it.some(o => MD.tag(o, 'saucy')), tip: '他很在意食物的界線，有醬汁的菜下次分開裝。',
      yes: '每一格都乾乾淨淨的。今天的便當很完美。', no: '醬汁跑到飯上了。我還是吃了，可是吃得很慢。',
      jh: { yes: '便當很整齊。（他沒說什麼，但便當盒洗好才拿出來）', no: '醬汁滲到飯了。……還是有吃完啦。' } },
    { id: 'cool', stages: ['high', 'jh'], slot: 'side',
      note: '「不要再放可愛的東西了啦，同學都在看。」', hint: '目標：不要可愛造型', kid: '媽，明天不要放章魚香腸了啦……同學會看。',
      good: o => !MD.tag(o, 'cute'), check: it => !it.some(o => MD.tag(o, 'cute')), tip: '他長大了，可愛的造型留在回憶裡就好。',
      yes: '今天的便當很正常。很好。', no: '同學看到章魚香腸了。……沒事啦。' },
  ],
};

/* 爸爸做的便當（隔天放學時會有同學的反應） */
MD.DAD_BENTO = {
  kanji:   { name: '海苔寫字便當', art: '加油', dad: '我用海苔寫了「加油」！', kid: '爸爸，「油」的三點水掉了一點。', school: '爸爸在飯上寫「加油」，可是海苔掉了，變成「加由」。全班笑了好久。' },
  black:   { name: '全海苔飯糰', art: '⚫', dad: '這是黑色的足球！', kid: '……像一顆炸彈。', school: '整個飯糰都包海苔，同學說是黑色的月亮。我覺得很酷。' },
  sausage: { name: '超長香腸便當', art: '🌭', dad: '一整根香腸，男子漢的便當！', kid: '它比便當盒還長耶。', school: '有一根超級長的香腸，我分給三個同學。我變得很受歡迎。' },
  face:    { name: '爸爸自畫像便當', art: '🤓', dad: '這是我！帥吧？', kid: '爸爸的眼睛是兩顆豆子。', school: '同學問我便當上的人是誰。我說是爸爸。他們說「好像喔」。' },
};

/* 綿的里程碑：只累積、不花用，到了就留下一個紀念（身高刻度改成每升一個年級畫一次） */
MD.MILESTONES = [
  { at: 40,   id: 'fridge',  icon: '🧲', title: '冰箱上的第一塊磁鐵' },
  { at: 150,  id: 'jar1',    icon: '🫙', title: '綿罐子裝滿四分之一' },
  { at: 350,  id: 'jar2',    icon: '🫙', title: '綿罐子滿了一半' },
  { at: 600,  id: 'jar3',    icon: '🫙', title: '綿罐子快滿了' },
  { at: 900,  id: 'jar4',    icon: '☁️', title: '綿罐子滿出來了' },
  { at: 1300, id: 'jar5',    icon: '🏺', title: '換了一個更大的罐子' },
  { at: 1800, id: 'jar6',    icon: '🌸', title: '綿多到可以做一顆枕頭' },
  { at: 2400, id: 'jar7',    icon: '🛏️', title: '綿多到可以做一床被子' },
  { at: 3000, id: 'jar8',    icon: '🌈', title: '這些年的綿，夠蓋一整個家' },
];

/* 每升一個年級，晚上會說的話 */
MD.GRADE_UP = {
  2: '媽媽，我二年級了。我可以自己綁鞋帶了。（綁了十分鐘）',
  3: '三年級要換教室，我有點怕。可是你說新的東西一開始都會怕，對不對？',
  4: '四年級了。我今天幫一年級的小朋友找到他的教室。',
  5: '五年級了。媽媽，我的腳比你的大了耶。',
  6: '六年級了……明年就要畢業了。時間跑好快。',
  7: '國中了。媽，以後不用送我到校門口了，到路口就好。（他回頭揮了一下手）',
  8: '國二了。媽，謝謝你每天幫我準備早餐。……我只是突然想說。',
  9: '國三了。明年會考。媽，你不用緊張，我會加油的。',
};

/* ── 台詞：依成長階段，再加上不分階段的共用台詞 ── */
MD.LINES = {
  common: {
    arrive: {
      school: ['今天要聽寫，我有一點緊張。', '我要第一個到教室。', '媽媽，放學你會在門口嗎？'],
      tennis: ['我的球拍準備好了！', '今天要練反拍。', '我要打出 ACE！'],
      park: ['我要去看螞蟻有沒有搬完家。', '公園的風比較香。', '今天的葉子是什麼顏色？'],
      market: ['我要幫阿姨提東西。', '市場有魚的味道。', '賣菜的阿姨記得我的名字。'],
      home: ['回家囉！', '回家要先洗手，我知道。', '今天晚餐吃什麼？'],
      pool: ['今天要游到另一邊！', '我的蛙鏡帶了嗎？……有！'],
      library: ['圖書館要小聲。我會很小聲。', '上次那本書我看完了！'],
      art: ['今天要畫什麼？', '我要用很多顏色。'],
      bookstore: ['書店的味道是紙的味道。', '我可以只看封面嗎？'],
      grandma: ['阿嬤會煮什麼？', '阿嬤家的貓還記得我嗎？'],
      clinic: ['……我不想打針。', '打完可以拿貼紙嗎？'],
      nightmarket: ['夜市好亮！', '我要先吃還是先玩？'],
      beach: ['我聞到海的味道了！', '今天浪大不大？'],
      cram: ['今天要考英文單字……', '補習班的冷氣好冷。'],
      any: ['走吧！', '我走前面！', '我們比賽誰先到！', '紅綠燈要等綠色的小人。', '我數過了，到那邊是 312 步。'],
    },
    walkStop: [
      { icon: '🐜', line: '媽媽等一下……螞蟻在搬家。' },
      { icon: '🍃', line: '這片葉子是完美的形狀。' },
      { icon: '🐈', line: '貓咪！牠在看我！' },
      { icon: '🌈', line: '你看！彩虹！' },
      { icon: '🚚', line: '那是垃圾車。它會唱歌。' },
      { icon: '🐌', line: '蝸牛走好慢，我們等它。' },
      { icon: '🦋', line: '蝴蝶！牠的翅膀有眼睛！' },
      { icon: '🐕', line: '小狗在對我笑。' },
      { icon: '🌸', line: '這朵花的花瓣有五片。我數過了。' },
      { icon: '☁️', line: '那朵雲像一隻鯨魚。' },
    ],
    hungry: ['咕嚕……', '我的肚子在唱歌。', '我好像餓了。'],
    tired: ['我的腳在睡覺了……', '（打哈欠）'],
    eatLove: ['好好吃！', '這是世界上最好吃的！', '吃光光！', '你是大廚！'],
    eatOk: ['嗯，好吃。', '還不錯。', '（認真地嚼）'],
    eatVeg: ['……綠綠的。', '這個滑滑的……', '我可以不要嗎？'],
    disguised: ['這個……可以。', '咦？沒有綠綠的了。', '……好吃耶。'],
    kidThere: ['媽媽！我在這裡！', '你喝完咖啡了嗎？你身上有咖啡的味道。', '{dad}剛剛送我過來的！'],
  },
  low: {
    arrive: ['媽媽，牽手。', '我要踩白色的線走。', '我是火車，嘟嘟——'],
    night: ['媽媽，今天很好玩。晚安。', '明天也要一起走路喔。', '你是我的撿球搭檔。晚安。', '媽媽，我愛你。（小聲）', '我今天吃了好多，有長高嗎？'],
  },
  mid: {
    arrive: ['媽媽，我可以自己過馬路了，你看著就好。', '我今天要跟你說一個冷知識。', '你知道章魚有三顆心臟嗎？'],
    night: ['媽媽，我今天交到一個朋友。他也喜歡恐龍。', '晚安。明天我想吃一樣的早餐。', '媽媽，你小時候也怕黑嗎？', '今天你有累嗎？……你可以早點睡。'],
    kidThere: ['媽媽，你今天有休息到嗎？'],
  },
  high: {
    arrive: ['媽，我幫你提。', '我們班下禮拜要校外教學。', '媽，你覺得我長大要做什麼？'],
    night: ['媽，你小時候有暗戀過人嗎？……沒事，晚安。', '今天的功課我自己寫完了。', '媽，謝謝你今天載……陪我。晚安。', '我覺得我們家很好。晚安。'],
    hungry: ['媽，我好餓，我可以吃兩碗嗎？', '我的肚子在抗議了。', '媽，晚餐吃什麼？我好餓。'],
    kidThere: ['媽，你今天看起來很放鬆耶。'],
  },
  jh: {
    arrive: ['媽，你走慢一點，我跟同學在後面。', '……嗯。走吧。', '媽，我自己去就好啦。……好啦，一起走。', '今天考試，還好。', '（戴著耳機，但一邊沒塞）', '媽，你包包給我。', '……你今天穿這樣很好看。（很快地說完）', '我們班有人說他媽很兇。我說我媽還好。'],
    night: ['……晚安。（門關上前小聲說）謝謝。', '媽，你早點睡。', '明天不用叫我，我自己會起來。……還是叫一下好了。', '媽，你以前讀書的時候，壓力也很大嗎？'],
    hungry: ['媽，有什麼可以吃的嗎？什麼都可以。', '……（打開冰箱，又關上）', '我好餓。我可以先吃一點嗎？', '練完球好餓……'],
    eatLove: ['……好吃。（又盛了一碗）', '媽，這個可以教我做嗎？', '（默默吃完，把碗拿去洗）', '這個比學校的好吃一百倍。'],
    tired: ['（打哈欠）……我沒事。', '今天好累，可是還好。'],
    eatVeg: ['……青菜。好啦，我吃。', '（面無表情地把青菜吃掉）'],
    disguised: ['……你是不是有偷加什麼。算了，好吃。', '嗯，這個可以。'],
    kidThere: ['媽，你回來了。', '……喔，你到了。（假裝沒有在等）'],
  },
};

/* 放學時的學校小新聞 */
MD.SCHOOL_NEWS = {
  low: [
    { icon: '⭐', line: '老師給我一張貼紙！因為我坐得很好。（坐了 5 分鐘）' },
    { icon: '💯', line: '聽寫 100 分！「網」這個字我寫最大。' },
    { icon: '🤝', line: '今天有人跟我交換橡皮擦。他可能是我的朋友。' },
    { icon: '🦕', line: '我在下課的時候，跟大家講了 20 分鐘的暴龍。' },
    { icon: '🩹', line: '我跌倒了，可是我沒有哭。（只有哭一點點）' },
    { icon: '🎵', line: '音樂課我負責敲三角鐵。叮。' },
    { icon: '🍚', line: '營養午餐有花椰菜。我把它們排成一棵樹。' },
  ],
  mid: [
    { icon: '🔬', line: '自然課看顯微鏡，洋蔥裡面有好多小格子！' },
    { icon: '📚', line: '我借了三本書，老師說一次最多兩本，我說服她了。' },
    { icon: '🏃', line: '大隊接力我跑第三棒，沒有掉棒！' },
    { icon: '🧪', line: '今天做實驗，我們這組的火山噴最高。' },
    { icon: '🎤', line: '我上台報告「章魚的三顆心臟」，大家都說好酷。' },
    { icon: '🐟', line: '教室的魚今天換水了，牠好像很開心。' },
  ],
  high: [
    { icon: '🏆', line: '我們班拔河贏了！我在最後面，我是錨。' },
    { icon: '📝', line: '作文題目是「我的媽媽」。……我不告訴你寫什麼。' },
    { icon: '🧮', line: '數學小考 95 分，錯的那題是我太急了。' },
    { icon: '🎻', line: '畢業典禮要表演，我被選上拉小提琴。……我說的是真的。' },
    { icon: '💌', line: '……有人塞紙條給我。不是那種啦！是問我功課。' },
    { icon: '🗺️', line: '下禮拜校外教學去科博館，可以帶零食。' },
  ],
  jh: [
    { icon: '📈', line: '段考數學進步 12 分。……還好啦。' },
    { icon: '🏸', line: '體育課打羽球，我說網球比較難，同學不信。' },
    { icon: '🎧', line: '同學推薦我一首歌，我覺得你也會喜歡。' },
    { icon: '🍜', line: '今天福利社的泡麵賣完了，人生好難。' },
    { icon: '🗣️', line: '英文課我被叫起來唸課文，我唸得超標準。' },
    { icon: '👥', line: '我們分組做報告，我負責查資料。我很會查資料。' },
  ],
};

/* 接放學的情境（依階段輪流） */
MD.PICKUPS = {
  low:  ['greet', 'show', 'quiet', 'handshake', 'forgot'],
  mid:  ['greet', 'show', 'quiet', 'handshake', 'forgot', 'friend'],
  high: ['greet', 'show', 'quiet', 'forgot', 'friend'],
  jh:   ['cool', 'friend', 'crush', 'exam', 'tired', 'quiet'],
};

/* 特定日子的小事件 */
MD.DAY_EVENTS = {
  1: { planHint: true },
  2: { family: true },
};
