/*
 * 聲音：背景音樂與音效，全部用 Web Audio 即時合成（不需要音檔、沒有版權問題）
 *   MD.audio.music('day' | 'night' | null)   切換背景音樂
 *   MD.audio.sfx('tap' | 'pop' | ...)         播放音效
 * 手機瀏覽器規定「使用者點過畫面」之後才能出聲，所以第一次點擊時才啟動。
 */
window.MD = window.MD || {};

(function () {
  let ctx = null, master, musicBus, sfxBus, noiseBuf;
  const on = key => (MD.state && MD.state.settings ? MD.state.settings[key] !== false : true);

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = on('music') ? .32 : 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = on('sfx') ? .55 : 0; sfxBus.connect(master);
    // 一秒的白噪音，給咬東西、切菜、煎鍋用
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  const hz = midi => 440 * Math.pow(2, (midi - 69) / 12);

  /* ── 樂器 ── */
  function tone(bus, freq, t, dur, vol, type = 'sine', attack = .005) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + .05);
    return o;
  }
  // 音樂盒：正弦波 + 一點點高八度的三角波
  function musicBox(bus, midi, t, vol = .22, dur = 1.4) {
    tone(bus, hz(midi), t, dur, vol);
    tone(bus, hz(midi + 12), t, dur * .5, vol * .18, 'triangle');
  }
  function sweep(bus, f1, f2, t, dur, vol, type = 'sine') {
    const o = tone(bus, f1, t, dur, vol, type);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  }
  function noise(bus, t, dur, vol, filterType = 'lowpass', freq = 1500, q = 1) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t, Math.random() * .5); s.stop(t + dur + .05);
    return { s, g };
  }

  /* ── 音效 ── */
  const PENTA = [72, 74, 76, 79, 81, 84, 86, 88];
  const SFX = {
    tap: t => sweep(sfxBus, 900, 700, t, .07, .16),
    pop: t => sweep(sfxBus, 520, 1100, t, .09, .22),
    hit: t => { noise(sfxBus, t, .06, .25, 'bandpass', 2500, 2); sweep(sfxBus, 300, 180, t, .1, .25, 'triangle'); },
    miss: t => noise(sfxBus, t, .25, .12, 'bandpass', 900, .8),
    chime: t => { musicBox(sfxBus, 88, t, .2, .9); musicBox(sfxBus, 93, t + .08, .18, 1.1); },
    sparkle: t => { for (let i = 0; i < 4; i++) musicBox(sfxBus, PENTA[3 + Math.floor(Math.random() * 5)], t + i * .06, .1, .5); },
    star: t => musicBox(sfxBus, 91, t, .22, .9),
    success: t => [72, 76, 79, 84].forEach((n, i) => musicBox(sfxBus, n, t + i * .09, .2, 1.2)),
    fanfare: t => { [72, 76, 79, 84, 88].forEach((n, i) => musicBox(sfxBus, n, t + i * .07, .2, 1.4)); [60, 64, 67].forEach(n => tone(sfxBus, hz(n), t + .35, 1.2, .07, 'triangle', .05)); },
    bite: t => { noise(sfxBus, t, .05, .35, 'lowpass', 1800); noise(sfxBus, t + .07, .05, .25, 'lowpass', 1400); },
    chop: t => { noise(sfxBus, t, .04, .4, 'highpass', 2000); tone(sfxBus, 140, t, .12, .35, 'sine'); },
    whack: t => { noise(sfxBus, t, .08, .5, 'lowpass', 2500); tone(sfxBus, 110, t, .15, .4, 'square'); },
    fly: t => sweep(sfxBus, 300, 1800, t, .7, .18, 'triangle'),
    shutter: t => { noise(sfxBus, t, .03, .4, 'highpass', 3000); noise(sfxBus, t + .07, .04, .35, 'highpass', 2500); },
    bubble: t => sweep(sfxBus, 350, 1000, t, .06, .2),
    step: t => tone(sfxBus, 180 + Math.random() * 40, t, .05, .06, 'triangle'),
    soft: t => sweep(sfxBus, 500, 330, t, .18, .14),
    paper: t => noise(sfxBus, t, .18, .12, 'bandpass', 3500, .7),
  };

  // 煎鍋的滋滋聲（持續到 stop）
  let sizzleNode = null;
  function sizzle(start) {
    if (!init()) return;
    if (start && !sizzleNode && on('sfx')) {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; s.loop = true; f.type = 'highpass'; f.frequency.value = 3200;
      g.gain.value = .0001; g.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .3);
      s.connect(f); f.connect(g); g.connect(sfxBus); s.start();
      sizzleNode = { s, g };
    } else if (!start && sizzleNode) {
      const { s, g } = sizzleNode; sizzleNode = null;
      g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .3); s.stop(ctx.currentTime + .35);
    }
  }

  /* ── 背景音樂：音樂盒琶音 + 簡單旋律，依和弦進行循環 ── */
  const TRACKS = {
    // 白天：C - Am - F - G - C - Em - F - G，輕快
    day: {
      bpm: 92, vol: .2,
      chords: [[48, 'M'], [45, 'm'], [41, 'M'], [43, 'M'], [48, 'M'], [40, 'm'], [41, 'M'], [43, 'M']],
      arp: [0, 7, 12, 16, 19, 16, 12, 7],
      melody: [[76, 79], [76, 72], [77, 81], [79, 74], [79, 84], [79, 76], [77, 72], [74, 71]],
    },
    // 晚上：F - Dm - Bb - C，慢、溫柔
    night: {
      bpm: 64, vol: .16, pad: true,
      chords: [[41, 'M'], [38, 'm'], [46, 'M'], [48, 'M']],
      arp: [0, 7, 12, 16, 12, 7],
      melody: [[77, null], [74, null], [74, 77], [76, null]],
    },
  };
  let cur = null, timer = null, nextT = 0, step = 0;

  function scheduleBar(tr, barIdx, t0) {
    const [root, q] = tr.chords[barIdx % tr.chords.length];
    const third = q === 'm' ? 3 : 4;
    const e = 60 / tr.bpm / 2;   // 八分音符
    tr.arp.forEach((iv, i) => {
      const n = root + 12 + (iv === 16 ? 12 + third : iv === 19 ? 19 : iv);
      musicBox(musicBus, n, t0 + i * e, tr.vol * (i === 0 ? 1 : .7), tr.pad ? 2 : 1.3);
    });
    tone(musicBus, hz(root), t0, e * tr.arp.length * .9, tr.vol * .5, 'sine', .02);
    if (tr.pad) [root + 12, root + 12 + third, root + 19].forEach(n => tone(musicBus, hz(n), t0, e * tr.arp.length, tr.vol * .12, 'triangle', .6));
    const [m1, m2] = tr.melody[barIdx % tr.melody.length];
    if (m1) musicBox(musicBus, m1, t0, tr.vol * 1.1, 1.6);
    if (m2) musicBox(musicBus, m2, t0 + e * tr.arp.length / 2, tr.vol * 1, 1.6);
    return e * tr.arp.length;
  }

  function tick() {
    if (!cur) return;
    const tr = TRACKS[cur];
    while (nextT < ctx.currentTime + .4) { nextT += scheduleBar(tr, step++, nextT); }
  }

  MD.audio = {
    unlock() {
      if (!init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      // 第一次點擊時開始播放目前畫面的音樂
      if (!cur) this.music(document.querySelector('#screen-night.active') ? 'night' : 'day');
    },
    sfx(name) {
      if (!on('sfx') || !init() || !SFX[name]) return;
      try { SFX[name](ctx.currentTime + .01); } catch (e) {}
    },
    sizzle,
    music(name) {
      if (name === cur) return;
      cur = name;
      clearInterval(timer); timer = null;
      if (!name || !init()) return;
      // 換曲時淡入
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(0, ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(on('music') ? .32 : 0, ctx.currentTime + 1.2);
      nextT = ctx.currentTime + .1; step = 0;
      timer = setInterval(tick, 100);
      tick();
    },
    // 除錯用：目前狀態與輸出音量（0 = 沒聲音）
    debug() {
      if (!ctx) return { state: 'none' };
      if (!this._an) { this._an = ctx.createAnalyser(); master.connect(this._an); }
      const a = new Float32Array(this._an.fftSize); this._an.getFloatTimeDomainData(a);
      return { state: ctx.state, track: cur, time: +ctx.currentTime.toFixed(2), peak: +Math.max(...a.map(Math.abs)).toFixed(3) };
    },
    apply() {   // 設定改變後套用音量
      if (!ctx) return;
      musicBus.gain.setTargetAtTime(on('music') ? .32 : 0, ctx.currentTime, .1);
      sfxBus.gain.setTargetAtTime(on('sfx') ? .55 : 0, ctx.currentTime, .05);
      if (!on('sfx')) sizzle(false);
    },
  };

  // 第一次點擊畫面時啟動聲音；所有按鈕都有輕輕的「啵」聲
  document.addEventListener('pointerdown', e => {
    MD.audio.unlock();
    if (e.target.closest('button') && !e.target.closest('[data-nosfx]')) MD.audio.sfx('tap');
  }, true);
  // 切到背景時暫停，省電
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
})();
