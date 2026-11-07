/* Parteneri sugerați pe tip de eveniment.
   Partenerii vin automat din lista publicată (admin → Parteneri): orice partener nou aprobat
   apare singur la tipurile de eveniment potrivite categoriei lui.
   - prima pagină: clic pe un tip de eveniment → fereastră cu rezervarea + partenerii potriviți
   - <div data-sug="Nuntă"></div> → bloc cu partenerii pentru tipul dat
   - <div data-sug-select="type"></div> → bloc care urmează tipul ales în <select id="type"> */
(() => {
  const URL_ = 'https://mmnulrkqnbopkxuooocs.supabase.co';
  const KEY = 'sb_publishable_o6j_hu_VXCTltuxERfXzEQ_gaJSC6JY';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // grupe de servicii, recunoscute după cuvinte din categoria partenerului
  const G = {
    FV: /foto|video|film|photo|drona/,
    FX: /efect|fum|artific|confetti|scantei|pirotehn|baloan|lumini/,
    BD: /bau|bar|cocktail|dulc|tort|cofet|candy|prajit|catering|sampan/,
    LD: /loca|decor|flor|aranjam|sala|restaurant|cort|mobilier|invitati/
  };
  const T = {
    'Nuntă': 'FV FX LD BD', 'Cununie': 'FV LD BD', 'Botez': 'FV BD LD FX', 'Majorat': 'FV FX BD LD',
    'Aniversare': 'FV BD LD FX', 'Petrecere copii': 'FV BD LD', 'Logodnă & cerere': 'FV LD FX',
    'Burlaci / burlăcițe': 'BD FV LD', 'Aniversare căsătorie': 'FV LD BD', 'Revelion': 'FX FV BD LD',
    'Petrecere tematică': 'LD FV BD FX', 'Petrecere în aer liber': 'LD BD FV FX', 'Banchet & bal absolvire': 'FV FX LD BD',
    'Balul bobocilor': 'FV FX LD', 'Serbare școlară': 'FV LD', 'Întâlnire de promoție': 'FV LD BD',
    'Corporate': 'FV LD BD FX', 'Team building': 'FV LD BD', 'Festival & zilele orașului': 'FX FV',
    'Concert & spectacol': 'FX FV', 'Lansare & inaugurare': 'FV FX BD LD', 'Conferință & gală': 'FV LD BD'
  };
  const NICE = { FV: 'foto & video', FX: 'efecte speciale', BD: 'băuturi & dulciuri', LD: 'locație & decor' };

  function forType(list, type) {
    const order = (T[type] || 'FV FX BD LD').split(' ');
    const rank = p => { const c = norm(p.category); const i = order.findIndex(g => G[g].test(c)); return i; };
    return list.map(p => [rank(p), p]).filter(([r]) => r >= 0).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  }
  // ce fel de servicii avem efectiv în lista sugerată (în ordinea relevanței pentru eveniment)
  const needs = (type, list) => {
    const out = [];
    (T[type] || 'FV FX BD LD').split(' ').forEach(g => {
      const hit = list.filter(p => G[g].test(norm(p.category)));
      if (!hit.length) return;
      if (g === 'FV') {
        const f = hit.some(p => /foto|photo/.test(norm(p.category))), v = hit.some(p => /video|film|drona/.test(norm(p.category)));
        out.push(f && v ? 'foto și video' : f ? 'foto' : 'video');
      } else out.push(NICE[g]);
    });
    return out.length > 1 ? out.slice(0, -1).join(', ') + ' și ' + out[out.length - 1] : out[0];
  };

  let cache;
  const load = () => cache || (cache = fetch(URL_ + '/rest/v1/partners?select=id,name,category,city,description,phone,instagram,facebook,website,logo,sort&published=eq.true&order=sort.desc,name.asc', { headers: { apikey: KEY } })
    .then(r => (r.ok ? r.json() : [])).catch(() => []));

  const tel = p => (p || '').replace(/[^\d+]/g, '');
  const waNum = p => { let d = (p || '').replace(/\D/g, ''); if (d.startsWith('00')) d = d.slice(2); if (d.startsWith('0')) d = '4' + d; return d.length >= 10 ? d : ''; };
  const okUrl = u => (/^https?:\/\//i.test(u || '') ? esc(u) : '');
  const ini = n => String(n).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const short = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') + '…' : s; };
  const WA = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.2-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2.1 1.3 2.4 1.4.3.2.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3z"/></svg>';
  const IG = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
  const FB = '<svg viewBox="0 0 24 24"><path d="M14 9V7c0-.9.6-1 1-1h2V2h-3c-3.3 0-4 2.4-4 4v3H8v4h2v9h4v-9h3l.5-4z" fill="currentColor" stroke="none"/></svg>';
  const PH = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor" stroke="none"/></svg>';

  function card(p, type) {
    const t = tel(p.phone), w = waNum(p.phone);
    const msg = encodeURIComponent(`Bună ziua! Vă contactez de pe site-ul The Entertainers, pentru un eveniment (${type || 'eveniment'}).`);
    const logo = p.logo ? `<span class="sg-lg" style="background-image:url('${URL_}/storage/v1/object/public/photos/${esc(p.logo)}')"></span>` : `<span class="sg-lg ini">${esc(ini(p.name))}</span>`;
    return `<article class="sg-c">
      <div class="sg-top">${logo}<div><b>${esc(p.name)}</b><span class="sg-tag">${esc(p.category)}${p.city ? ' · ' + esc(p.city) : ''}</span></div></div>
      ${p.description ? `<p>${esc(short(p.description, 120))}</p>` : ''}
      <div class="sg-acts">
        ${t ? `<a class="sg-b gold" href="tel:${t}">${PH}Sună</a>` : ''}
        ${w ? `<a class="sg-b sg-wa" href="https://wa.me/${w}?text=${msg}" target="_blank" rel="noopener">${WA}WhatsApp</a>` : ''}
        ${okUrl(p.instagram) ? `<a class="sg-b ic" href="${okUrl(p.instagram)}" target="_blank" rel="noopener" aria-label="Instagram ${esc(p.name)}">${IG}</a>` : ''}
        ${okUrl(p.facebook) ? `<a class="sg-b ic" href="${okUrl(p.facebook)}" target="_blank" rel="noopener" aria-label="Facebook ${esc(p.name)}">${FB}</a>` : ''}
      </div></article>`;
  }

  const css = `
.sg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.sg-c{display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:16px;background:linear-gradient(160deg,#1b1b20,#121215);border:1px solid #2a2a30;text-align:left;transition:border-color .25s,transform .25s}
.sg-c:hover{border-color:rgba(212,175,55,.5);transform:translateY(-3px)}
.sg-top{display:flex;gap:12px;align-items:center}
.sg-top b{display:block;font-size:1rem;color:#f2efe6;line-height:1.25}
.sg-lg{width:54px;height:54px;flex:none;border-radius:14px;background:#111 center/cover no-repeat;border:1px solid #2a2a30;display:grid;place-items:center;font:700 1.1rem "Playfair Display",serif;color:#1a1405}
.sg-lg.ini{background:linear-gradient(135deg,#f3d77a,#d4af37 45%,#a8841f);border:0}
.sg-tag{display:inline-block;margin-top:4px;font-size:.72rem;font-weight:600;letter-spacing:.4px;color:#f3d77a}
.sg-c p{font-size:.84rem;color:#cfcabe;line-height:1.5;margin:0}
.sg-acts{display:flex;flex-wrap:wrap;gap:7px;margin-top:auto}
.sg-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;font:600 .8rem Montserrat,sans-serif;border:1px solid #2a2a30;background:#0e0e11;color:#e6e1d4;text-decoration:none}
.sg-b svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sg-b.gold{background:linear-gradient(135deg,#f3d77a,#d4af37 45%,#a8841f);color:#1a1405;border-color:transparent}
.sg-b.sg-wa{background:#1f8f4a;color:#fff;border-color:transparent}
.sg-b.sg-wa svg{fill:#fff;stroke:none}
.sg-b.ic{width:34px;padding:0}
.sg-b:hover{filter:brightness(1.1)}
.sg-blk{margin-top:28px}
.sg-blk h3{font-family:"Playfair Display",serif;font-size:1.35rem;margin:0 0 4px;color:#f2efe6}
.sg-blk .sg-sub{color:#a9a59a;font-size:.88rem;margin:0 0 14px}
.sg-blk .sg-all{display:inline-block;margin-top:12px;font-size:.85rem;font-weight:600;color:#f3d77a}
/* fereastra de pe prima pagină */
.sg-ov{position:fixed;inset:0;z-index:9995;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .25s}
.sg-ov.on{opacity:1}
.sg-m{position:relative;width:min(760px,100%);max-height:88vh;overflow:auto;padding:26px 22px 22px;border-radius:24px 24px 0 0;background:#111114;border:1px solid rgba(212,175,55,.3);border-bottom:0;box-shadow:0 -20px 60px -10px #000;transform:translateY(40px);transition:transform .3s cubic-bezier(.2,.9,.3,1);text-align:left}
.sg-ov.on .sg-m{transform:none}
@media (min-width:700px){.sg-ov{align-items:center}.sg-m{border-radius:24px;border-bottom:1px solid rgba(212,175,55,.3);padding:30px}}
.sg-x{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:12px;border:1px solid #2a2a30;background:#0b0b0c;color:#f3d77a;font-size:20px;cursor:pointer}
.sg-m .sg-k{display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#f3d77a;border:1px solid rgba(243,215,122,.35);padding:5px 12px;border-radius:999px}
.sg-m h2{font-family:"Playfair Display",serif;font-size:clamp(1.6rem,4vw,2.1rem);margin:12px 0 6px;color:#f2efe6;padding-right:40px}
.sg-m .sg-lead{color:#cfcabe;font-size:.95rem;margin:0 0 16px}
.sg-cta{display:flex;flex-wrap:wrap;gap:10px}
.sg-cta a{display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border-radius:999px;font:700 .92rem Montserrat,sans-serif;text-decoration:none}
.sg-cta .p{background:linear-gradient(135deg,#f3d77a,#d4af37 45%,#a8841f);color:#1a1405;box-shadow:0 8px 28px -8px rgba(212,175,55,.6)}
.sg-cta .s{border:1px solid rgba(243,215,122,.6);color:#f3d77a}
.sg-m hr{border:0;height:1px;background:linear-gradient(90deg,transparent,#2a2a30,transparent);margin:22px 0 18px}
.sg-m h3{font-family:"Playfair Display",serif;font-size:1.25rem;margin:0 0 4px;color:#f2efe6}
.sg-m .sg-sub{color:#a9a59a;font-size:.86rem;margin:0 0 14px}
.sg-m .sg-all{display:inline-block;margin-top:14px;font-size:.85rem;font-weight:600;color:#f3d77a}
@media (max-width:600px){.sg-cta a{flex:1 1 100%}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const blockHtml = (list, type) => `<h3>Parteneri recomandați pentru ${esc(type.toLowerCase())}</h3>
    <p class="sg-sub">Noi ne ocupăm de muzică, MC, sunet și lumini. Pentru ${esc(needs(type, list))} îți recomandăm oameni de încredere:</p>
    <div class="sg-grid">${list.map(p => card(p, type)).join('')}</div>
    <a class="sg-all" href="parteneri.html">Vezi toți partenerii →</a>`;

  async function mount(el, type) {
    const box = el.closest('[data-sug-wrap]') || el;
    const list = type ? forType(await load(), type) : [];
    if (!list.length) { box.hidden = el.hidden = true; el.innerHTML = ''; return; }
    el.classList.add('sg-blk');
    el.innerHTML = blockHtml(list, type);
    box.hidden = el.hidden = false;
  }

  function init() {
    document.querySelectorAll('[data-sug]').forEach(el => mount(el, el.dataset.sug));
    document.querySelectorAll('[data-sug-select]').forEach(el => {
      const sel = document.getElementById(el.dataset.sugSelect);
      if (!sel) return;
      const go = () => mount(el, sel.value);
      sel.addEventListener('change', go); go();
    });

    // prima pagină: tipurile de eveniment deschid fereastra cu sugestii
    const ets = document.querySelectorAll('.events a.et');
    if (!ets.length) return;
    load();
    ets.forEach(a => a.addEventListener('click', async e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      const type = a.querySelector('b').textContent.trim();
      e.preventDefault();
      const list = forType(await load(), type);
      if (!list.length) { location.href = a.href; return; }
      openModal(a, type, list);
    }));
  }

  function openModal(a, type, list) {
    const href = a.getAttribute('href');
    const djPage = /^dj-/.test(href);
    const book = djPage ? 'rezerva.html?tip=' + encodeURIComponent(type) : href;
    const ov = document.createElement('div');
    ov.className = 'sg-ov';
    ov.innerHTML = `<div class="sg-m" role="dialog" aria-modal="true" aria-label="${esc(type)}">
      <button class="sg-x" aria-label="Închide">✕</button>
      <span class="sg-k">${esc(type)}</span>
      <h2>Hai să facem din ${esc(type.toLowerCase())} o petrecere de neuitat!</h2>
      <p class="sg-lead">DJ, MC, sonorizare și lumini profesionale – verifică data și cere oferta în 2 minute.</p>
      <div class="sg-cta"><a class="p" href="${esc(book)}">Rezervă pentru ${esc(type.toLowerCase())}</a>${djPage ? `<a class="s" href="${esc(href)}">Detalii DJ ${esc(type.toLowerCase())}</a>` : `<a class="s" href="calendar.html">Vezi datele libere</a>`}</div>
      <hr>
      ${blockHtml(list, type)}
    </div>`;
    document.body.appendChild(ov);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => ov.classList.add('on'));
    const close = () => {
      ov.classList.remove('on'); document.body.style.overflow = prevOverflow;
      removeEventListener('keydown', onKey); setTimeout(() => ov.remove(), 300); a.focus();
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('.sg-x').onclick = close;
    ov.querySelector('.sg-x').focus();
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init); else init();
})();
