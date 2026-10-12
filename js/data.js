/*
 * 遊戲資料：地點、行程卡、菜色、食材、台詞、里程碑
 * 新增內容大多只需要改這個檔案。
 */
window.MD = window.MD || {};

/* ── 地點（地圖上的建築）──
 * pos：地圖上的位置（%）。3 欄 × 4 列的小鎮。
 */
MD.PLACES = {
  market:   { name: '傳統市場', icon: '🧺', pos: [18, 13], color: '#ffd3b0', roof: '#ff8a65' },
  pool:     { name: '游泳池',   icon: '🏊', pos: [50, 13], color: '#c4e6ff', roof: '#6cb8ff', locked: true },
  cafe:     { name: '咖啡店',   icon: '☕', pos: [82, 13], color: '#ffe0c7', roof: '#d9926a' },
  library:  { name: '圖書館',   icon: '📚', pos: [18, 36], color: '#e2d6ff', roof: '#a88bff', locked: true },
  park:     { name: '公園',     icon: '🌳', pos: [50, 36], color: '#cff5d8', roof: '#4fcf8c' },
  bookstore:{ name: '書店',     icon: '📖', pos: [82, 36], color: '#ffe3ef', roof: '#f78fb3', locked: true },
  school:   { name: '小學',     icon: '🏫', pos: [18, 59], color: '#fff1a8', roof: '#ffc93c' },
  art:      { name: '畫畫教室', icon: '🎨', pos: [50, 59], color: '#ffd9ec', roof: '#ff7eb6', locked: true },
  tennis:   { name: '網球場',   icon: '🎾', pos: [82, 59], color: '#d4f7e3', roof: '#2ec4a0' },
  grandma:  { name: '阿嬤家',   icon: '🏮', pos: [18, 82], color: '#ffd6cc', roof: '#ff7a6b', locked: true },
  home:     { name: '家',       icon: '🏠', pos: [50, 82], color: '#ffe1ee', roof: '#ff6fa5' },
  beach:    { name: '海邊',     icon: '🐚', pos: [82, 82], color: '#fff3c4', roof: '#ffb84d', locked: true },
};

/* ── 行程卡 ──
 * place：在哪棟建築進行
 * levels：去過幾次（at）之後，任務會變成哪一種（act 對應 acts.js）
 * energy / full：做完後 Ethan 的精神、肚子變化；calm：比較放鬆的活動
 */
MD.CARDS = {
  school:   { place: 'school', name: '上學',     icon: '🎒', energy: -1, full: -1, noRec: true,
              levels: [{ at: 0, task: '接放學', act: 'school' }] },
  tennis:   { place: 'tennis', name: '網球課',   icon: '🎾', energy: -2, full: -2,
              levels: [{ at: 0, task: '發球練習', act: 'serve' }, { at: 0, task: '撿球', act: 'pickup' }, { at: 2, task: '來回對打', act: 'rally' }, { at: 4, task: '小小比賽', act: 'match' }] },
  park:     { place: 'park',   name: '公園',     icon: '🌳', energy: 0, full: -1, calm: true,
              levels: [{ at: 0, task: '撿葉子', act: 'leaves' }, { at: 0, task: '溜滑梯', act: 'slide' }, { at: 2, task: '吹泡泡', act: 'bubbles' }] },
  market:   { place: 'market', name: '傳統市場', icon: '🧺', energy: 0, full: 0,
              levels: [{ at: 0, task: '買新食材', act: 'market' }] },
  cafe:     { place: 'cafe',   name: '咖啡店',   icon: '☕', energy: 1, full: 0, calm: true,
              levels: [{ at: 0, task: '拉花時間', act: 'cafe' }] },
  homework: { place: 'home',   name: '陪寫功課', icon: '✏️', energy: -1, full: -1, calm: true,
              levels: [{ at: 0, task: '守護專注力', act: 'homework' }] },
};

/* ── 菜色（25 道）──
 * meal：b 早餐、m 正餐（午餐／晚餐）、s 點心
 * nut：c 澱粉、p 蛋白質、v 蔬菜
 * like：love 超愛、ok 普通、veg 有蔬菜，要「偽裝」一下
 * from：需要哪個食材才解鎖（沒有 = 一開始就會）
 */
MD.DISHES = {
  danbing:    { name: '蛋餅',       unit: '份', icon: '🌯', meal: 'b', nut: 'cp',  like: 'ok',   ing: ['🥚', '🫓'] },
  onigiri:    { name: '鮭魚飯糰',   unit: '個', icon: '🍙', meal: 'b', nut: 'cp',  like: 'love', ing: ['🍚', '🐟'] },
  frenchtoast:{ name: '法式吐司',   unit: '片', icon: '🍞', meal: 'b', nut: 'cp',  like: 'love', ing: ['🍞', '🥚', '🥛'] },
  yamsoy:     { name: '地瓜豆漿',   unit: '杯', icon: '🍠', meal: 'b', nut: 'cp',  like: 'ok',   ing: ['🍠', '🥛'], from: 'yam' },
  vegomelet:  { name: '菠菜蛋捲',   unit: '份', icon: '🍳', meal: 'b', nut: 'pv',  like: 'veg',  ing: ['🥚', '🥬'], from: 'spinach' },

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

  banana:     { name: '香蕉',       unit: '根', icon: '🍌', meal: 's', nut: 'c',   like: 'ok',   ing: ['🍌'] },
  jidangao:   { name: '雞蛋糕',     unit: '包', icon: '🧁', meal: 's', nut: 'cp',  like: 'love', ing: ['🥚', '🌾'] },
  yogurt:     { name: '草莓優格',   unit: '杯', icon: '🍓', meal: 's', nut: 'pv',  like: 'love', ing: ['🍓', '🥛'], from: 'strawberry' },
  crepe:      { name: '可麗餅',     unit: '片', icon: '🥞', meal: 's', nut: 'c',   like: 'love', ing: ['🥞', '🍯'], from: 'flour' },
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
};

MD.NUT = { c: { name: '澱粉', color: '#ffc93c' }, p: { name: '蛋白質', color: '#ff6f91' }, v: { name: '蔬菜', color: '#2ec4a0' } };

MD.WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
MD.WEATHER = ['☀️', '⛅', '☀️', '🌤️', '☀️', '⛅', '☀️'];

/* 行程時段 */
MD.SLOTS = {
  breakfast: { name: '早餐', icon: '🌅', meal: 'b' },
  bento:     { name: '便當', icon: '🍱', meal: 'm' },
  lunch:     { name: '午餐', icon: '🍽️', meal: 'm' },
  snack:     { name: '點心', icon: '🧁', meal: 's' },
  dinner:    { name: '晚餐', icon: '🌙', meal: 'm' },
  morning:   { name: '上午', icon: '☀️' },
  pm1:       { name: '下午一', icon: '🌤️' },
  pm2:       { name: '下午二', icon: '⛅' },
  evening:   { name: '傍晚', icon: '🌇' },
};

/* 不用上學的日子 */
MD.HOLIDAYS = ['校慶補假 🎉', '教師研習 📋', '颱風假 🌀', '運動會補假 🏃'];

/* Ethan 的心願：早上提出，排進行程並完成就會很開心 */
MD.WISHES = [
  { type: 'dish', id: 'friedchicken', line: '今天可以吃炸雞嗎？' },
  { type: 'dish', id: 'curry',        line: '我想吃咖哩！要很多馬鈴薯。' },
  { type: 'dish', id: 'steak',        line: '我想吃牛排。像大人那樣切。' },
  { type: 'dish', id: 'ribs',         line: '糖醋排骨……酸酸甜甜的那個。' },
  { type: 'dish', id: 'jidangao',     line: '可以吃雞蛋糕嗎？熱熱的那種。' },
  { type: 'dish', id: 'onigiri',      line: '我要飯糰。一樣的那種。' },
  { type: 'dish', id: 'crepe',        line: '我想吃可麗餅！法國的那個！' },
  { type: 'card', id: 'park',         line: '我想去公園看螞蟻。' },
  { type: 'card', id: 'tennis',       line: '今天可以打網球嗎？' },
  { type: 'card', id: 'market',       line: '我想去市場幫阿姨提東西。' },
  { type: 'card', id: 'park',         line: '我想去公園溜滑梯！' },
  { type: 'card', id: 'homework',     line: '今天的功課我想要媽媽陪我寫。' },
];

/* 造型便當：Ethan 點一個主題，媽媽用配料擺出來 */
MD.BENTO_THEMES = [
  { id: 'panda',  name: '熊貓',   icon: '🐼', need: ['nori', 'nori', 'nori'] },
  { id: 'chick',  name: '小雞',   icon: '🐥', need: ['egg', 'carrot', 'nori'] },
  { id: 'bear',   name: '小熊',   icon: '🐻', need: ['sausage', 'sausage', 'nori'] },
  { id: 'tennis', name: '網球',   icon: '🎾', need: ['egg', 'cheese'] },
  { id: 'heart',  name: '愛心',   icon: '💗', need: ['ham', 'tomato'] },
  { id: 'dino',   name: '暴龍',   icon: '🦖', need: ['broccoli', 'broccoli', 'nori'] },
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

/* 綿的里程碑：只累積、不花用，到了就留下一個紀念 */
MD.MILESTONES = [
  { at: 30,  id: 'h1',     icon: '📏', title: '門框上的第一道刻度', kind: 'height' },
  { at: 80,  id: 'fridge', icon: '🧲', title: '冰箱上的第一塊磁鐵' },
  { at: 150, id: 'h2',     icon: '📏', title: '又長高了一點點', kind: 'height' },
  { at: 230, id: 'jar',    icon: '🫙', title: '綿罐子滿了一半' },
  { at: 320, id: 'h3',     icon: '📏', title: '門框上的第三道刻度', kind: 'height' },
  { at: 420, id: 'spring', icon: '🌸', title: '一起走過的第一個春天' },
  { at: 540, id: 'h4',     icon: '📏', title: '長到媽媽的腰了', kind: 'height' },
  { at: 700, id: 'jarfull',icon: '☁️', title: '綿罐子滿出來了' },
];

/* 短短的台詞（一次只出現一句） */
MD.LINES = {
  // 走路時說的話：依目的地不同，最後一組是到哪裡都可以說的
  arrive: {
    school: ['今天要聽寫，我有一點緊張。', '我要第一個到教室。', '媽媽，放學你會在門口嗎？', '我今天要問老師為什麼天空是藍的。'],
    tennis: ['我的球拍準備好了！', '今天要練反拍。', '教練說我的手肘很棒。', '我要打出 ACE！'],
    park: ['我要去看螞蟻有沒有搬完家。', '溜滑梯在等我！', '公園的風比較香。', '今天的葉子是什麼顏色？'],
    market: ['我要幫阿姨提東西。', '市場有魚的味道。', '今天要買什麼？我可以挑嗎？', '賣菜的阿姨記得我的名字。'],
    home: ['回家囉！', '我想念我的恐龍了。', '回家要先洗手，我知道。', '今天晚餐吃什麼？'],
    any: ['走吧！', '媽媽，牽手。', '我走前面！', '我們比賽誰先到！', '我數過了，到那邊是 312 步。', '紅綠燈要等綠色的小人。', '我要踩白色的線走。'],
  },
  walkStop: [
    { icon: '🐜', line: '媽媽等一下……螞蟻在搬家。' },
    { icon: '🍃', line: '這片葉子是完美的形狀。' },
    { icon: '🐈', line: '貓咪！牠在看我！' },
    { icon: '🌈', line: '媽媽你看！彩虹！' },
    { icon: '🚚', line: '那是垃圾車。它會唱歌。' },
    { icon: '🐌', line: '蝸牛走好慢，我們等它。' },
    { icon: '🦋', line: '蝴蝶！牠的翅膀有眼睛！' },
    { icon: '🐕', line: '小狗在對我笑。' },
  ],
  hungry: ['咕嚕……', '我的肚子在唱歌。', '媽媽，我好像餓了。'],
  tired: ['我的腳在睡覺了……', '（打哈欠）'],
  eatLove: ['好好吃！', '這是世界上最好吃的！', '吃光光！', '媽媽你是大廚！'],
  eatOk: ['嗯，好吃。', '還不錯。', '（認真地嚼）'],
  eatVeg: ['……綠綠的。', '這個滑滑的……', '我可以不要嗎？'],
  disguised: ['這個……可以。', '咦？沒有綠綠的了。', '……好吃耶。'],
  night: [
    '媽媽，今天很好玩。晚安。',
    '明天也要一起走路喔。',
    '媽媽，你今天也很厲害。',
    '我今天吃了好多，有長高嗎？',
    '你是我的撿球搭檔。晚安。',
    '媽媽，我愛你。（小聲）',
  ],
};

/* 特定日子的小事件 */
MD.DAY_EVENTS = {
  1: { planHint: true },
  2: { family: true },
  7: { nightLine: '媽媽，這一個星期，謝謝你每天都帶我出門。', letter: true },
};
