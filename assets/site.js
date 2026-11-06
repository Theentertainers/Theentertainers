// Setări comune + funcții folosite de paginile noi (calendar, admin)
window.TE = {
  SUPABASE_URL: 'https://mmnulrkqnbopkxuooocs.supabase.co',
  SUPABASE_KEY: 'sb_publishable_o6j_hu_VXCTltuxERfXzEQ_gaJSC6JY', // cheie publică, e făcută să stea pe site
  CAPACITY: 1, // câte evenimente putem face într-o zi
  // tipurile de evenimente (aceeași listă e și în baza de date: supabase/12-tipuri-evenimente.sql)
  TYPES: ['Nuntă','Cununie','Botez','Majorat','Aniversare','Petrecere copii','Logodnă & cerere','Burlaci / burlăcițe',
    'Aniversare căsătorie','Revelion','Petrecere tematică','Petrecere în aer liber','Banchet & bal absolvire','Balul bobocilor',
    'Serbare școlară','Întâlnire de promoție','Corporate','Team building','Festival & zilele orașului','Concert & spectacol',
    'Lansare & inaugurare','Conferință & gală','Altul'],
  MONTHS: ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'],
  DOW: ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum'],

  VCATS: ['Nuntă','Cununie civilă','Botez','Majorat','Aniversare','Petrecere copii','Logodnă & cerere','Burlaci / burlăcițe',
    'Aniversare căsătorie','Revelion','Petrecere tematică','Petrecere în aer liber','Banchet & bal absolvire','Balul bobocilor',
    'Serbare școlară','Întâlnire de promoție','Corporate','Team building','Festival & zilele orașului','Concert & spectacol',
    'Lansare & inaugurare','Conferință & gală','By The River','Altele'],

  // Recunoaște un link TikTok sau YouTube → { platform, id, short? }
  parseVideo(url){
    url = String(url || '').trim();
    let m = url.match(/tiktok\.com\/(?:@[^/]+\/video|player\/v1|embed(?:\/v2)?|v)\/(\d{8,25})/i);
    if (m) return { platform: 'tiktok', id: m[1] };
    if (/(?:vm|vt)\.tiktok\.com\/|tiktok\.com\/t\//i.test(url)) return { platform: 'tiktok', short: true };
    m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    if (m) return { platform: 'youtube', id: m[1], vertical: /shorts\//i.test(url) };
    return null;
  },
  embedUrl(v){
    return v.platform === 'tiktok'
      ? `https://www.tiktok.com/player/v1/${v.video_id}?autoplay=1&music_info=1&description=0&rel=0&native_context_menu=0`
      : `https://www.youtube-nocookie.com/embed/${v.video_id}?autoplay=1&rel=0&modestbranding=1`;
  },

  // ---------- reacții ❤️ 👏 🔥 😍 ----------
  RK: [['h','❤️','Îmi place'],['c','👏','Bravo'],['f','🔥','Super'],['l','😍','Superb']],
  voter(){
    if (TE._v) return TE._v;
    try { TE._v = localStorage.getItem('te_voter'); } catch {}
    if (!TE._v) { TE._v = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(16) + '-' + Math.random().toString(16).slice(2)).toLowerCase(); try { localStorage.setItem('te_voter', TE._v); } catch {} }
    return TE._v;
  },
  async rpc(fn, body){
    const r = await fetch(TE.SUPABASE_URL + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: TE.SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.message || r.status);
    return j;
  },
  // { id: { h:{n,mine}, c:{…} } }
  async reactLoad(type, ids){
    const out = {}; if (!ids.length) return out;
    try { (await TE.rpc('reaction_counts', { p_type: type, p_ids: ids, p_voter: TE.voter() })).forEach(r => ((out[r.item_id] ||= {})[r.kind] = { n: +r.n, mine: r.mine })); } catch {}
    return out;
  },
  reactBar(type, id, counts = {}){
    return `<div class="rx" data-rt="${type}" data-ri="${id}">` + TE.RK.map(([k, e, t]) => {
      const c = counts[k] || { n: 0, mine: false };
      return `<button type="button" class="rx-b${c.mine ? ' on' : ''}" data-k="${k}" title="${t}" aria-label="${t}" aria-pressed="${c.mine}"><span class="e">${e}</span><b>${c.n || ''}</b></button>`;
    }).join('') + '</div>';
  },
  // un singur ascultător pentru toate barele de reacții din pagină; onChange(type, id, counts)
  reactInit(onChange){
    document.addEventListener('click', async e => {
      const b = e.target.closest('.rx-b'); if (!b || b.disabled) return;
      e.stopPropagation();
      const bar = b.closest('.rx'), type = bar.dataset.rt, id = bar.dataset.ri, k = b.dataset.k;
      // răspuns imediat pe ecran, apoi confirmăm cu serverul
      const on = !b.classList.contains('on'), num = b.querySelector('b'), n = Math.max(0, (+num.textContent || 0) + (on ? 1 : -1));
      b.classList.toggle('on', on); num.textContent = n || ''; b.classList.remove('pop'); void b.offsetWidth; if (on) b.classList.add('pop');
      b.disabled = true;
      try {
        const rows = await TE.rpc('toggle_reaction', { p_type: type, p_id: id, p_kind: k, p_voter: TE.voter() });
        const counts = {}; rows.forEach(r => counts[r.kind] = { n: +r.n, mine: r.mine });
        document.querySelectorAll(`.rx[data-rt="${type}"][data-ri="${id}"]`).forEach(x => x.outerHTML = TE.reactBar(type, id, counts));
        onChange && onChange(type, id, counts);
      } catch (ex) {
        b.classList.toggle('on', !on); num.textContent = (n + (on ? -1 : 1)) || '';
        b.title = ex.message;
      } finally { b.disabled = false; }
    });
  },

  // ---------- harta României pe județe ----------
  async loadMap(){
    if (TE._map) return TE._map;
    const m = await (await fetch('assets/judete.json')).json();
    // contururile ca liste de puncte, pentru „în ce județ cade punctul”
    m.judete.forEach(j => j.rings = j.d.split('Z').filter(Boolean).map(r => r.replace('M', '').split('L').map(p => p.split(',').map(Number))));
    return TE._map = m;
  },
  proj(m, lat, lon){ const p = m.proj; return [(lon - p.lon0) * p.k * p.c, (p.lat0 - lat) * p.k]; },
  countyAt(m, lat, lon){
    const [x, y] = TE.proj(m, lat, lon);
    const inside = r => { let c = false; for (let i = 0, k = r.length - 1; i < r.length; k = i++) { const [xi, yi] = r[i], [xk, yk] = r[k]; if ((yi > y) !== (yk > y) && x < (xk - xi) * (y - yi) / (yk - yi) + xi) c = !c; } return c; };
    // dacă punctul cade în mai multe contururi (ex. București e în interiorul Ilfovului), alegem județul cel mai mic
    const size = j => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; j.rings.flat().forEach(([px, py]) => { a = Math.min(a, px); b = Math.max(b, px); c = Math.min(c, py); d = Math.max(d, py); }); return (b - a) * (d - c); };
    const hits = m.judete.filter(j => j.rings.some(inside)).sort((p, q) => size(p) - size(q));
    if (hits.length) return hits[0].n;
    // la margine (Dunăre, granițe): cel mai apropiat centru de județ
    let best = null, bd = 1e9; m.judete.forEach(j => { const d = Math.hypot(j.cx - x, j.cy - y); if (d < bd) { bd = d; best = j.n; } });
    return best;
  },
  plain(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); },

  photoUrl(path){ return TE.SUPABASE_URL + '/storage/v1/object/public/photos/' + path; },

  okColor(c){ return /^#[0-9a-fA-F]{6}$/.test(c || '') ? c : ''; },
  // culoarea fiecărui tip de eveniment în calendar (automat, nu se mai alege de mână)
  TYPE_COLORS: {
    'Nuntă': '#ff4f8b', 'Cununie': '#ffb3cf', 'Botez': '#74d0ff', 'Majorat': '#b07cff',
    'Aniversare': '#ff9142', 'Petrecere copii': '#ffe14d', 'Logodnă & cerere': '#e5383b', 'Burlaci / burlăcițe': '#ff2bd6',
    'Aniversare căsătorie': '#d9b26f', 'Revelion': '#d4dbe6', 'Petrecere tematică': '#6246ea', 'Petrecere în aer liber': '#19b8a8',
    'Banchet & bal absolvire': '#2f6bff', 'Balul bobocilor': '#a8e63a', 'Serbare școlară': '#9be3c0', 'Întâlnire de promoție': '#b5764a',
    'Corporate': '#7d93b0', 'Team building': '#2fa84f', 'Festival & zilele orașului': '#c2410c', 'Concert & spectacol': '#00e0ff',
    'Lansare & inaugurare': '#ff6f61', 'Conferință & gală': '#9c1b5a', 'Altul': '#8d8d8d'
  },
  typeColor(t){ return TE.TYPE_COLORS[t] || ''; },
  COLORS: ['#e5484d','#f76b15','#ffc53d','#46a758','#12a594','#0090ff','#3e63dd','#8e4ec6','#d6409f','#8d8d8d'],

  iso(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); },
  nice(iso){ const [y,m,d] = iso.split('-').map(Number); return d + ' ' + TE.MONTHS[m-1] + ' ' + y; },
  esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },

  // Câmp de dată în format românesc zz/ll/aaaa, cu calendar la clic (în locul celui din browser,
  // care afișează formatul după limba Chrome-ului). Folosire: const dp = TE.datePicker(input, {min, onChange});
  // dp.get() → 'AAAA-LL-ZZ' sau '' ; dp.set('AAAA-LL-ZZ')
  datePicker(input, opts = {}){
    input.type = 'text'; input.inputMode = 'numeric'; input.placeholder = 'zz/ll/aaaa';
    input.autocomplete = 'off'; input.maxLength = 10;
    const wrap = document.createElement('div'); wrap.className = 'dp';
    input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dp-btn'; btn.setAttribute('aria-label', 'Alege din calendar');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
    const pop = document.createElement('div'); pop.className = 'dp-pop'; pop.hidden = true;
    wrap.append(btn, pop);
    let iso = '', vy, vm;
    const fmt = i => i ? i.slice(8, 10) + '/' + i.slice(5, 7) + '/' + i.slice(0, 4) : '';
    const parse = s => {
      const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/); if (!m) return '';
      const d = new Date(+m[3], m[2] - 1, +m[1]);
      return d.getMonth() === m[2] - 1 && d.getDate() === +m[1] ? TE.iso(d) : '';
    };
    const fire = () => opts.onChange && opts.onChange(iso);
    const set = (v, notify) => { iso = v || ''; input.value = fmt(iso); if (notify) fire(); };
    input.addEventListener('input', () => {
      const d = input.value.replace(/\D/g, '').slice(0, 8);
      input.value = d.length > 4 ? d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4) : d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      const p = parse(input.value);
      if (p !== iso) { iso = p; fire(); }
    });
    function draw(){
      const first = new Date(vy, vm, 1), days = new Date(vy, vm + 1, 0).getDate(), lead = (first.getDay() + 6) % 7;
      const min = typeof opts.min === 'function' ? opts.min() : opts.min, today = TE.iso(new Date());
      let h = `<div class="dp-top"><button type="button" data-n="-1" aria-label="Luna anterioară">‹</button><b>${TE.MONTHS[vm]} ${vy}</b><button type="button" data-n="1" aria-label="Luna următoare">›</button></div><div class="dp-grid">`;
      h += TE.DOW.map(d => `<span class="dp-dow">${d.slice(0, 2)}</span>`).join('');
      for (let i = 0; i < lead; i++) h += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const v = TE.iso(new Date(vy, vm, d)), off = min && v < min;
        h += `<button type="button" class="dp-d${v === iso ? ' sel' : ''}${v === today ? ' tod' : ''}" data-v="${v}"${off ? ' disabled' : ''}>${d}</button>`;
      }
      pop.innerHTML = h + '</div>';
    }
    function open(){
      const base = iso ? new Date(iso + 'T12:00') : new Date();
      vy = base.getFullYear(); vm = base.getMonth(); draw(); pop.hidden = false;
    }
    const close = () => { pop.hidden = true; };
    btn.addEventListener('click', () => pop.hidden ? open() : close());
    input.addEventListener('click', () => { if (pop.hidden) open(); });
    pop.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.n) { vm += +b.dataset.n; if (vm < 0) { vm = 11; vy--; } if (vm > 11) { vm = 0; vy++; } draw(); }
      else if (b.dataset.v) { set(b.dataset.v, true); close(); }
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
    input.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Tab') close(); });
    return { get: () => iso, set: v => set(v, false), input };
  },

  // Desenează grila unei luni. byDate = { 'YYYY-MM-DD': [ {type,status,...}, ... ] }
  // opts: { admin:bool, onDay(iso, events) }
  renderMonth(el, year, month, byDate, opts = {}){
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // luni = prima zi
    const today = TE.iso(new Date());
    let h = TE.DOW.map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < lead; i++) h += '<div class="day empty"></div>';
    for (let d = 1; d <= days; d++) {
      const iso = TE.iso(new Date(year, month, d));
      const ev = byDate[iso] || [];
      const past = iso < today;
      let cls = 'day', st = '';
      if (ev.length >= TE.CAPACITY) { cls += ' full'; st = ev.every(e => e.status === 'provizoriu') ? 'Rezervare în curs' : 'Ocupat'; }
      else if (ev.length) { cls += ' half'; st = 'Mai e un loc'; }
      else if (opts.blank) { st = ''; } // încă se încarcă / eroare: nu afișăm „Liber”
      else { cls += ' free'; st = past ? '' : 'Liber'; }
      if (past) cls += ' past';
      if (iso === today) cls += ' today';
      const chips = ev.map(e => {
        const label = opts.admin ? (e.type + (e.city ? ' · ' + e.city : '')) : e.type;
        const col = TE.typeColor(e.type) || TE.okColor(e.color);
        return `<span class="chip${e.status === 'provizoriu' ? ' prov' : ''}${col ? ' hc' : ''}"${col ? ` style="--ec:${col}"` : ''} title="${TE.esc(label)}">${TE.esc(label)}</span>`;
      }).join('');
      // culoarea aleasă în admin pentru eveniment colorează toată ziua
      const dc = ev.map(e => TE.typeColor(e.type) || TE.okColor(e.color)).find(Boolean);
      if (dc) cls += ' hc';
      h += `<div class="${cls}"${dc ? ` style="--ec:${dc}"` : ''} data-d="${iso}" role="button" tabindex="0" aria-label="${TE.nice(iso)}: ${st || 'trecut'}"><span class="n">${d}</span>${chips}<span class="st">${st}</span></div>`;
    }
    el.innerHTML = h;
    if (opts.onDay) el.querySelectorAll('.day[data-d]').forEach(c => {
      const go = () => opts.onDay(c.dataset.d, byDate[c.dataset.d] || []);
      c.addEventListener('click', go);
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }
};

// Header, meniu mobil, apariție la scroll, anul din footer
(() => {
  const hdr = document.getElementById('hdr');
  if (hdr) { const f = () => hdr.classList.toggle('scrolled', scrollY > 30); addEventListener('scroll', f, {passive:true}); f(); }
  const nav = document.getElementById('nav'), burger = document.getElementById('burger');
  if (nav && burger) {
    burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.textContent = o ? '✕' : '☰'; });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.textContent = '☰'; }));
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.1});
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
