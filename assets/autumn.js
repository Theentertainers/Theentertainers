/* Frunze de toamnă care cad – activ automat doar între 1 septembrie și 30 noiembrie */
(() => {
  const m = new Date().getMonth(); // 0 = ianuarie
  if (m < 8 || m > 10) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9990';
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  const COLORS = ['#d9822b', '#c4561f', '#e0a526', '#a8401c', '#b86b25', '#d4af37', '#8f3b1b', '#e8b04a'];

  // forme de frunze (desenate în jurul lui 0,0, mărime ~1)
  const maple = new Path2D('M0,-1 L.18,-.55 L.45,-.7 L.38,-.3 L.8,-.38 L.6,-.05 L.85,.1 L.4,.22 L.48,.5 L.1,.35 L0,.6 L-.1,.35 L-.48,.5 L-.4,.22 L-.85,.1 L-.6,-.05 L-.8,-.38 L-.38,-.3 L-.45,-.7 L-.18,-.55 Z');
  const oval = new Path2D('M0,-1 C.55,-.6 .55,.4 0,.75 C-.55,.4 -.55,-.6 0,-1 Z');
  const birch = new Path2D('M0,-.9 C.7,-.5 .5,.5 0,.7 C-.5,.5 -.7,-.5 0,-.9 Z');
  const SHAPES = [maple, maple, oval, birch];

  const small = () => innerWidth < 700;
  const count = () => (small() ? 9 : 16);
  const leaves = [];

  function mk(top) {
    const s = (small() ? 11 : 14) + Math.random() * (small() ? 10 : 14);
    return {
      x: Math.random() * W,
      y: top ? -30 - Math.random() * H * .3 : Math.random() * H,
      s,
      vy: .35 + Math.random() * .55 + s * .012,
      sway: 18 + Math.random() * 40,
      ph: Math.random() * Math.PI * 2,
      fr: .006 + Math.random() * .01,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .025,
      flip: Math.random() * Math.PI * 2,
      vf: .015 + Math.random() * .03,
      shape: SHAPES[(Math.random() * SHAPES.length) | 0],
      color: COLORS[(Math.random() * COLORS.length) | 0],
      a: .55 + Math.random() * .35
    };
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    while (leaves.length < count()) leaves.push(mk(false));
    leaves.length = Math.min(leaves.length, count());
  }

  // rafală de vânt din când în când
  let wind = 0, windT = 0, nextGust = 4000 + Math.random() * 6000, last = 0, run = true;

  function frame(t) {
    if (!run) return;
    const dt = Math.min(50, t - (last || t)); last = t;
    const k = dt / 16.7;
    nextGust -= dt;
    if (nextGust <= 0) { windT = (Math.random() < .5 ? -1 : 1) * (1.2 + Math.random() * 1.6); nextGust = 7000 + Math.random() * 9000; }
    windT *= Math.pow(.985, k);
    wind += (windT - wind) * .02 * k;

    ctx.clearRect(0, 0, W, H);
    for (const L of leaves) {
      L.ph += L.fr * k;
      L.y += L.vy * k;
      L.x += (Math.cos(L.ph) * L.sway * L.fr + wind) * k;
      L.rot += (L.vr + wind * .004) * k;
      L.flip += L.vf * k;
      if (L.y > H + 30 || L.x < -60 || L.x > W + 60) {
        Object.assign(L, mk(true));
        if (wind > .5) L.x = -20 - Math.random() * 40;
        else if (wind < -.5) L.x = W + 20 + Math.random() * 40;
      }
      ctx.save();
      ctx.translate(L.x + Math.sin(L.ph) * L.sway, L.y);
      ctx.rotate(L.rot);
      ctx.scale(L.s * (.25 + .75 * Math.abs(Math.cos(L.flip))), L.s);
      ctx.globalAlpha = L.a;
      ctx.fillStyle = L.color;
      ctx.fill(L.shape);
      // nervura centrală
      ctx.globalAlpha = L.a * .5;
      ctx.strokeStyle = 'rgba(60,25,5,.9)';
      ctx.lineWidth = .06;
      ctx.beginPath(); ctx.moveTo(0, -.8); ctx.lineTo(0, .85); ctx.stroke();
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
