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
  market:     { name: '傳統市場', icon: '🧺', pos: [18, 9],  color: '#ffd3b0', roof: '#ff8a65' },
  pool:       { name: '游泳池',   icon: '🏊', pos: [50, 9],  color: '#c4e6ff', roof: '#6cb8ff', opens: 'mid' },
  cafe:       { name: '咖啡店',   icon: '☕', pos: [82, 9],  color: '#ffe0c7', roof: '#d9926a' },
  library:    { name: '圖書館',   icon: '📚', pos: [18, 28], color: '#e2d6ff', roof: '#a88bff', opens: 'mid' },
  park:       { name: '公園',     icon: '🌳', pos: [50, 28], color: '#cff5d8', roof: '#4fcf8c' },
  bookstore:  { name: '書店',     icon: '📖', pos: [82, 28], color: '#ffe3ef', roof: '#f78fb3', opens: 'high' },
  school:     { name: '小學',     icon: '🏫', pos: [18, 47], color: '#fff1a8', roof: '#ffc93c' },
  home:       { name: '家',       icon: '🏠', pos: [50, 47], color: '#ffe1ee', roof: '#ff6fa5' },
  tennis:     { name: '網球場',   icon: '🎾', pos: [82, 47], color: '#d4f7e3', roof: '#2ec4a0' },
  art:        { name: '畫畫教室', icon: '🎨', pos: [18, 66], color: '#ffd9ec', roof: '#ff7eb6', opens: 'mid' },
  cram:       { name: '補習班',   icon: '✏️', pos: [50, 66], color: '#e8eaff', roof: '#7c8cff', opens: 'jh' },
  clinic:     { name: '診所',     icon: '🩺', pos: [82, 66], color: '#e6fbff', roof: '#5ccfe6' },
  grandma:    { name: '阿嬤家',   icon: '🏮', pos: [18, 85], color: '#ffd6cc', roof: '#ff7a6b' },
  nightmarket:{ name: '夜市',     icon: '🏮', pos: [50, 85], color: '#fff0c9', roof: '#ff9f43', opens: 'high' },
  beach:      { name: '海邊',     icon: '🐚', pos: [82, 85], color: '#fff3c4', roof: '#ffb84d', opens: 'high' },
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
  park:     { place: 'park', name: '公園', icon: '🌳', energy: 0, full: -1, calm: true,
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
 * meal：b 早餐、m 正餐（午餐／晚餐）、s 點心；nut：c 澱粉、p 蛋白質、v 蔬菜
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

  banana:     { name: '香蕉',       unit: '根', icon: '🍌', meal: 's', nut: 'c',   like: 'ok',   ing: ['🍌'] },
  jidangao:   { name: '雞蛋糕',     unit: '包', icon: '🧁', meal: 's', nut: 'cp',  like: 'love', ing: ['🥚', '🌾'] },
  yogurt:     { name: '草莓優格',   unit: '杯', icon: '🍓', meal: 's', nut: 'pv',  like: 'love', ing: ['🍓', '🥛'], from: 'strawberry' },
  crepe:      { name: '可麗餅',     unit: '片', icon: '🥞', meal: 's', nut: 'c',   like: 'love', ing: ['🥞', '🍯'], from: 'flour' },
  douhua:     { name: '花生豆花',   unit: '碗', icon: '🍨', meal: 's', nut: 'p',   like: 'love', ing: ['⬜', '🥜'], from: 'tofu' },
  bubbletea:  { name: '珍珠奶茶',   unit: '杯', icon: '🧋', meal: 's', nut: 'c',   like: 'love', ing: ['🧋', '⚫'], stage: 'high' },
  macaron:    { name: '馬卡龍',     unit: '顆', icon: '🍬', meal: 's', nut: 'c',   like: 'love', ing: ['🥚', '🍬'], stage: 'jh' },
  yamballs:   { name: '地瓜球',     unit: '包', icon: '🟠', meal: 's', nut: 'c',   like: 'love', ing: ['🍠', '🌾'], from: 'yam' },
  fruitplate: { name: '水果切盤',   unit: '盤', icon: '🍉', meal: 's', nut: 'v',   like: 'ok',   ing: ['🍉', '🍎', '🍇'] },
  pudding:    { name: '雞蛋布丁',   unit: '個', icon: '🍮', meal: 's', nut: 'p',   like: 'love', ing: ['🥚', '🥛', '🍯'], stage: 'mid' },
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

MD.NUT = { c: { name: '澱粉', color: '#ffc93c' }, p: { name: '蛋白質', color: '#ff6f91' }, v: { name: '蔬菜', color: '#2ec4a0' } };

MD.WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
MD.WEATHER = ['☀️', '⛅', '☀️', '🌤️', '☀️', '⛅', '☀️'];

/* 行程時段 */
MD.SLOTS = {
  breakfast: { name: '早餐', icon: '🌅', meal: 'b' },
  lunch:     { name: '午餐', icon: '🍽️', meal: 'm' },
  snack:     { name: '點心', icon: '🧁', meal: 's' },
  dinner:    { name: '晚餐', icon: '🍲', meal: 'm' },
  morning:   { name: '上午', icon: '☀️' },
  day:       { name: '上課', icon: '🏫' },
  pm1:       { name: '下午一', icon: '🌤️' },
  pm2:       { name: '下午二', icon: '⛅' },
  evening:   { name: '傍晚', icon: '🌇' },
  night:     { name: '晚上', icon: '🌙' },
};

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
  { type: 'dish', id: 'bubbletea',    line: '今天可以喝珍奶嗎？半糖就好。', stages: ['high', 'jh'] },
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

/* 造型便當 */
MD.BENTO_THEMES = [
  { id: 'panda',  name: '熊貓', icon: '🐼', need: ['nori', 'nori', 'nori'] },
  { id: 'chick',  name: '小雞', icon: '🐥', need: ['egg', 'carrot', 'nori'] },
  { id: 'bear',   name: '小熊', icon: '🐻', need: ['sausage', 'sausage', 'nori'] },
  { id: 'tennis', name: '網球', icon: '🎾', need: ['egg', 'cheese'] },
  { id: 'heart',  name: '愛心', icon: '💗', need: ['ham', 'tomato'] },
  { id: 'dino',   name: '暴龍', icon: '🦖', need: ['broccoli', 'broccoli', 'nori'] },
];
MD.BENTO_DECOS = {
  nori:     { name: '海苔',     icon: '⚫' },
  egg:      { name: '蛋皮',     icon: '🟡' },
  carrot:   { name: '紅蘿蔔',   icon: '🥕' },
  sausage:  { name: '章魚香腸', icon: '🐙' },
  cheese:   { name: '起司',     icon: '🧀' },
  ham:      { name: '火腿愛心', icon: '💗' },
  tomato:   { name: '小番茄',   icon: '🍅' },
  broccoli: { name: '花椰菜',   icon: '🥦' },
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
    hungry: ['媽，我好餓，我可以吃兩碗嗎？'],
    kidThere: ['媽，你今天看起來很放鬆耶。'],
  },
  jh: {
    arrive: ['媽，你走慢一點，我跟同學在後面。', '……嗯。走吧。', '媽，我自己去就好啦。……好啦，一起走。', '今天考試，還好。'],
    night: ['……晚安。（門關上前小聲說）謝謝。', '媽，你早點睡。', '明天不用叫我，我自己會起來。……還是叫一下好了。', '媽，你以前讀書的時候，壓力也很大嗎？'],
    hungry: ['媽，有什麼可以吃的嗎？什麼都可以。'],
    eatLove: ['……好吃。（又盛了一碗）', '媽，這個可以教我做嗎？'],
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
