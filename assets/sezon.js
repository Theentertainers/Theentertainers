/* Efect decorativ pe anotimpuri – se schimbă singur după lună:
   iarnă (dec–feb): fulgi de zăpadă · primăvară (mar–mai): petale de flori
   vară (iun–aug): luminițe aurii (licurici) · toamnă (sep–nov): frunze care cad
   Extra: căciulă de Moș Crăciun pe logo (1 dec – 1 ian) și artificii de Revelion (31 dec și 1 ian).
   Pentru test: adaugă ?sezon=iarna | primavara | vara | toamna | craciun | revelion la adresa paginii. */
(() => {
  const now = new Date(), m = now.getMonth(), day = now.getDate();
  const q = new URLSearchParams(location.search).get('sezon');
  const HAT = q === 'craciun' || q === 'revelion' || (!q && (m === 11 || (m === 0 && day === 1)));
  const FIRE = q === 'revelion' || (!q && ((m === 11 && day === 31) || (m === 0 && day === 1)));

  // ---------- căciula de pe logo (statică – apare și cu „animații reduse”) ----------
  if (HAT) {
    const hat = '<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="teHatR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3342f"/><stop offset="1" stop-color="#9b1515"/></linearGradient></defs>' +
      '<path d="M14 66 C22 34 42 10 70 8 C84 7 92 16 90 30 C86 22 78 20 72 24 C62 32 66 50 76 64 Z" fill="url(#teHatR)"/>' +
      '<path d="M40 30 C50 20 60 15 70 14" stroke="rgba(255,255,255,.25)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<rect x="6" y="60" width="78" height="20" rx="10" fill="#fbfbfb"/>' +
      '<rect x="6" y="60" width="78" height="7" rx="3.5" fill="#fff" opacity=".9"/>' +
      '<circle cx="89" cy="33" r="10" fill="#fff"/>' +
      '<circle cx="86" cy="30" r="4" fill="#fff" opacity=".9"/></svg>';
    const st = document.createElement('style');
    st.textContent = '.te-hatw{position:relative;display:inline-block;line-height:0}' +
      '.te-hat{position:absolute;left:-3%;top:-27%;width:18%;transform:rotate(-24deg);transform-origin:50% 90%;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));animation:teHat 4s ease-in-out infinite}' +
      '.te-hat svg{width:100%;height:auto;display:block}' +
      '@keyframes teHat{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(-17deg)}}' +
      '@media (prefers-reduced-motion:reduce){.te-hat{animation:none}}';
    const put = () => {
      document.head.appendChild(st);
      document.querySelectorAll('.brand img').forEach(img => {
        if (img.parentElement.classList.contains('te-hatw')) return;
        const w = document.createElement('span'); w.className = 'te-hatw';
        img.parentNode.insertBefore(w, img); w.appendChild(img);
        const h = document.createElement('span'); h.className = 'te-hat'; h.innerHTML = hat; w.appendChild(h);
      });
    };
    if (document.body) put(); else addEventListener('DOMContentLoaded', put);
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const auto = m === 11 || m < 2 ? 'iarna' : m < 5 ? 'primavara' : m < 8 ? 'vara' : 'toamna';
  const S = ['iarna', 'primavara', 'vara', 'toamna'].includes(q) ? q : HAT ? 'iarna' : auto;

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9990';
  const ctx = cv.getContext('2d');
  let W = 0, H = 0;
  const small = () => innerWidth < 700;
  const R = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];

  // ---------- forme ----------
  const maple = new Path2D('M0,-1 L.18,-.55 L.45,-.7 L.38,-.3 L.8,-.38 L.6,-.05 L.85,.1 L.4,.22 L.48,.5 L.1,.35 L0,.6 L-.1,.35 L-.48,.5 L-.4,.22 L-.85,.1 L-.6,-.05 L-.8,-.38 L-.38,-.3 L-.45,-.7 L-.18,-.55 Z');
  const oval = new Path2D('M0,-1 C.55,-.6 .55,.4 0,.75 C-.55,.4 -.55,-.6 0,-1 Z');
  const birch = new Path2D('M0,-.9 C.7,-.5 .5,.5 0,.7 C-.5,.5 -.7,-.5 0,-.9 Z');
  const petal = new Path2D('M0,.9 C.75,.45 .7,-.55 .22,-.85 L0,-.6 L-.22,-.85 C-.7,-.55 -.75,.45 0,.9 Z');

  // ---------- configurație per anotimp ----------
  const CFG = {
    toamna: {
      n: () => (small() ? 9 : 16),
      make(top) {
        const s = (small() ? 11 : 14) + R(0, small() ? 10 : 14);
        return { s, y: top ? -30 - R(0, H * .3) : R(0, H), vy: R(.35, .9) + s * .012, sway: R(18, 58), fr: R(.006, .016),
          vr: R(-.0125, .0125), vf: R(.015, .045), shape: pick([maple, maple, oval, birch]),
          color: pick(['#d9822b', '#c4561f', '#e0a526', '#a8401c', '#b86b25', '#d4af37', '#8f3b1b', '#e8b04a']), a: R(.55, .9) };
      },
      draw: drawLeaf, vein: true, gust: true
    },
    primavara: {
      n: () => (small() ? 10 : 18),
      make(top) {
        const s = (small() ? 7 : 9) + R(0, small() ? 5 : 7);
        return { s, y: top ? -30 - R(0, H * .3) : R(0, H), vy: R(.3, .7), sway: R(25, 70), fr: R(.008, .018),
          vr: R(-.02, .02), vf: R(.02, .05), shape: petal,
          color: pick(['#f7c6d4', '#f4a9c0', '#fbe1e9', '#ffffff', '#f2b5c8', '#fde2ea']), a: R(.6, .9) };
      },
      draw: drawLeaf, vein: false, gust: true
    },
    iarna: {
      n: () => (small() ? 30 : 60),
      make(top) {
        const crystal = Math.random() < .22;
        const s = crystal ? R(small() ? 6 : 8, small() ? 11 : 14) : R(1.2, small() ? 3.2 : 4);
        return { s, crystal, y: top ? -20 - R(0, H * .2) : R(0, H), vy: crystal ? R(.45, .85) : R(.35, .6) + s * .12,
          sway: R(10, 35), fr: R(.004, .012), vr: R(-.01, .01), vf: 0, a: crystal ? R(.55, .85) : R(.45, .9) };
      },
      draw: drawSnow, gust: true
    },
    vara: {
      n: () => (small() ? 12 : 22),
      make(top) {
        return { s: R(1.5, 3.2), y: top ? H + 20 + R(0, H * .2) : R(0, H), vy: -R(.15, .45), sway: R(20, 60), fr: R(.004, .01),
          vr: 0, vf: R(.02, .05), tw: R(0, 6.3), a: R(.5, 1) };
      },
      draw: drawFirefly, up: true, gust: false
    }
  }[S];

  const parts = [];
  function mk(top) {
    const p = CFG.make(top);
    p.x = R(0, W); p.ph = R(0, 6.3); p.rot = R(0, 6.3); p.flip = R(0, 6.3);
    return p;
  }

  function drawLeaf(p) {
    ctx.translate(p.x + Math.sin(p.ph) * p.sway, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.s * (.25 + .75 * Math.abs(Math.cos(p.flip))), p.s);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.color;
    ctx.fill(p.shape);
    if (CFG.vein) {
      ctx.globalAlpha = p.a * .5; ctx.strokeStyle = 'rgba(60,25,5,.9)'; ctx.lineWidth = .06;
      ctx.beginPath(); ctx.moveTo(0, -.8); ctx.lineTo(0, .85); ctx.stroke();
    }
  }

  function drawSnow(p) {
    ctx.translate(p.x + Math.sin(p.ph) * p.sway, p.y);
    ctx.globalAlpha = p.a;
    if (!p.crystal) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 6.3); ctx.fill();
      return;
    }
    ctx.rotate(p.rot);
    ctx.strokeStyle = '#f4f8ff'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, p.s * .11);
    ctx.shadowColor = 'rgba(200,225,255,.9)'; ctx.shadowBlur = 6;
    const r = p.s;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -r);
      ctx.moveTo(0, -r * .55); ctx.lineTo(r * .25, -r * .78);
      ctx.moveTo(0, -r * .55); ctx.lineTo(-r * .25, -r * .78);
      ctx.stroke();
    }
  }

  function drawFirefly(p) {
    p.tw += p.vf;
    const a = p.a * (.35 + .65 * (.5 + .5 * Math.sin(p.tw)));
    ctx.translate(p.x + Math.sin(p.ph) * p.sway, p.y);
    ctx.globalAlpha = a;
    const r = p.s * 4;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, 'rgba(255,236,160,1)'); g.addColorStop(.25, 'rgba(243,215,122,.55)'); g.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill();
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    while (parts.length < CFG.n()) parts.push(mk(false));
    parts.length = Math.min(parts.length, CFG.n());
  }

  let wind = 0, windT = 0, nextGust = R(4000, 10000), last = 0, run = true;
  const dpr0 = () => Math.min(devicePixelRatio || 1, 2);

  function frame(t) {
    if (!run) return;
    const dt = Math.min(50, t - (last || t)); last = t;
    const k = dt / 16.7;
    if (CFG.gust) {
      nextGust -= dt;
      if (nextGust <= 0) { windT = (Math.random() < .5 ? -1 : 1) * R(1.2, 2.8); nextGust = R(7000, 16000); }
      windT *= Math.pow(.985, k);
      wind += (windT - wind) * .02 * k;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.ph += p.fr * k;
      p.y += p.vy * k;
      p.x += (Math.cos(p.ph) * p.sway * p.fr + wind) * k;
      p.rot += (p.vr + wind * .004) * k;
      if (CFG.draw === drawLeaf) p.flip += p.vf * k;
      const out = CFG.up ? p.y < -40 : p.y > H + 30;
      if (out || p.x < -70 || p.x > W + 70) {
        Object.assign(p, mk(true));
        if (wind > .5) p.x = -20 - R(0, 40); else if (wind < -.5) p.x = W + 20 + R(0, 40);
      }
      const d = dpr0();
      ctx.save();
      ctx.setTransform(d, 0, 0, d, 0, 0);
      CFG.draw(p);
      ctx.restore();
    }
    if (FIRE) fireworks(dt, k);
    requestAnimationFrame(frame);
  }

  // ---------- artificii de Revelion ----------
  const rockets = [], sparks = [];
  const PAL = [['#f3d77a', '#d4af37', '#fff3c4'], ['#ff4d4d', '#f3d77a'], ['#ffffff', '#cfe3ff'], ['#7dff9a', '#f3d77a'],
    ['#ff7ad9', '#ffd1f0'], ['#6ec8ff', '#ffffff'], ['#ffb347', '#ff6a3d']];
  let nextRocket = 400;
  function launch() {
    const tx = R(W * .12, W * .88), ty = R(H * .1, H * .38), g = .06;
    rockets.push({ x: tx + R(-40, 40), y: H + 5, tx, vy: -Math.sqrt(2 * g * (H - ty)), g, pal: pick(PAL) });
  }
  function burst(r) {
    const n = small() ? 55 : 80, sp = small() ? 4.4 : 6, ring = Math.random() < .3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + R(-.05, .05), v = ring ? sp : sp * Math.sqrt(Math.random());
      sparks.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 1, dec: R(.008, .014), c: pick(r.pal), tw: Math.random() < .4 });
    }
  }
  function fireworks(dt, k) {
    nextRocket -= dt;
    if (nextRocket <= 0) {
      launch(); if (Math.random() < .3) launch();
      nextRocket = R(small() ? 1300 : 900, small() ? 2800 : 2200);
    }
    const d = dpr0();
    ctx.save();
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      const py = r.y;
      r.x += (r.tx - r.x) * .02 * k; r.y += r.vy * k; r.vy += r.g * k;
      ctx.globalAlpha = .9; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(r.x, py + 10); ctx.lineTo(r.x, r.y); ctx.stroke();
      if (r.vy >= -.6) { burst(r); rockets.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.px = s.x; s.py = s.y;
      s.vx *= Math.pow(.965, k); s.vy = s.vy * Math.pow(.965, k) + .03 * k;
      s.x += s.vx * k; s.y += s.vy * k; s.life -= s.dec * k;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life * (s.tw ? (.4 + .6 * Math.random()) : 1);
      ctx.strokeStyle = s.c; ctx.lineWidth = 1.2 + s.life * 1.6;
      ctx.beginPath(); ctx.moveTo(s.px - s.vx * 2, s.py - s.vy * 2); ctx.lineTo(s.x, s.y); ctx.stroke();
    }
    ctx.restore();
  }

  function start() {
    document.body.appendChild(cv);
    resize();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      run = !document.hidden;
      if (run) { last = 0; requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);
  }
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
