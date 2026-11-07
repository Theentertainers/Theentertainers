/* Efect decorativ pe anotimpuri – se schimbă singur după lună:
   iarnă (dec–feb): fulgi de zăpadă · primăvară (mar–mai): petale de flori
   vară (iun–aug): luminițe aurii (licurici) · toamnă (sep–nov): frunze care cad
   Pentru test: adaugă ?sezon=iarna | primavara | vara | toamna la adresa paginii. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const m = new Date().getMonth();
  const auto = m === 11 || m < 2 ? 'iarna' : m < 5 ? 'primavara' : m < 8 ? 'vara' : 'toamna';
  const q = new URLSearchParams(location.search).get('sezon');
  const S = ['iarna', 'primavara', 'vara', 'toamna'].includes(q) ? q : auto;

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
    requestAnimationFrame(frame);
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
