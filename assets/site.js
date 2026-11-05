// Setări comune + funcții folosite de paginile noi (calendar, admin)
window.TE = {
  SUPABASE_URL: 'https://mmnulrkqnbopkxuooocs.supabase.co',
  SUPABASE_KEY: 'sb_publishable_o6j_hu_VXCTltuxERfXzEQ_gaJSC6JY', // cheie publică, e făcută să stea pe site
  CAPACITY: 2, // câte evenimente putem face într-o zi (2 echipe)
  TYPES: ['Nuntă','Cununie','Botez','Majorat','Corporate','Team building','Altul'],
  MONTHS: ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'],
  DOW: ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum'],

  iso(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); },
  nice(iso){ const [y,m,d] = iso.split('-').map(Number); return d + ' ' + TE.MONTHS[m-1] + ' ' + y; },
  esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },

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
        return `<span class="chip${e.status === 'provizoriu' ? ' prov' : ''}" title="${TE.esc(label)}">${TE.esc(label)}</span>`;
      }).join('');
      h += `<div class="${cls}" data-d="${iso}" role="button" tabindex="0" aria-label="${TE.nice(iso)}: ${st || 'trecut'}"><span class="n">${d}</span>${chips}<span class="st">${st}</span></div>`;
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
