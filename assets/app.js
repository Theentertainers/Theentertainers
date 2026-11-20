// Aplicația The Entertainers: service worker + buton „Instalează aplicația”
(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) { document.documentElement.classList.add('is-app'); return; }

  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;

  const css = `
.fapp{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:9px 16px;border-radius:999px;border:1px solid rgba(243,215,122,.55);background:linear-gradient(135deg,rgba(243,215,122,.16),rgba(212,175,55,.06));color:#f3d77a;font:600 .86rem Montserrat,sans-serif;cursor:pointer}
.fapp svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.fapp:hover{background:rgba(243,215,122,.22)}
.appov{position:fixed;inset:0;z-index:9999;display:grid;place-items:end center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);padding:16px}
.appm{width:100%;max-width:440px;border-radius:22px;background:#141417;border:1px solid rgba(243,215,122,.35);padding:22px 20px 18px;color:#f2efe6;font:15px/1.55 Montserrat,sans-serif;box-shadow:0 20px 60px -10px rgba(0,0,0,.8)}
.appm .hd{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.appm .hd img{width:56px;height:56px;border-radius:14px}
.appm h3{margin:0;font:700 1.15rem "Playfair Display",serif;color:#f3d77a}
.appm small{color:#a39f94}
.appm ol{margin:0 0 16px 20px;padding:0;display:grid;gap:8px}
.appm b{color:#f3d77a}
.appm .x{width:100%;min-height:46px;border:0;border-radius:999px;background:linear-gradient(135deg,#f3d77a,#d4af37 55%,#a8841f);color:#1a1405;font:700 .95rem Montserrat,sans-serif;cursor:pointer}
.appm .sh{display:inline-block;vertical-align:-4px;width:20px;height:20px}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M12 7v7m-3-3l3 3 3-3M10 18h4"/></svg>';
  const SHARE = '<svg class="sh" viewBox="0 0 24 24" fill="none" stroke="#f3d77a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8"/></svg>';

  function help(){
    const ov = document.createElement('div'); ov.className = 'appov';
    const steps = ios
      ? `<ol><li>Apasă butonul <b>Partajează</b> ${SHARE} din bara Safari (jos).</li><li>Alege <b>„Adaugă pe ecranul principal”</b>.</li><li>Apasă <b>Adaugă</b>. Gata – iconița apare lângă celelalte aplicații.</li></ol>`
      : `<ol><li>Deschide meniul browserului <b>⋮</b> (sus, dreapta).</li><li>Alege <b>„Instalează aplicația”</b> sau <b>„Adaugă pe ecranul de pornire”</b>.</li><li>Confirmă. Gata – iconița apare pe telefon.</li></ol>`;
    ov.innerHTML = `<div class="appm" role="dialog" aria-modal="true" aria-label="Instalează aplicația">
      <div class="hd"><img src="/assets/app-192.png" alt=""><div><h3>Aplicația The Entertainers</h3><small>Gratuită · fără magazin · se instalează în 10 secunde</small></div></div>
      ${steps}<button class="x" type="button">Am înțeles</button></div>`;
    const close = () => ov.remove();
    ov.addEventListener('click', e => { if (e.target === ov || e.target.classList.contains('x')) close(); });
    document.body.appendChild(ov);
  }

  async function install(){
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; if (r && r.outcome === 'accepted') btns.forEach(b => b.remove()); return; }
    help();
  }

  const btns = [];
  function addButtons(){
    document.querySelectorAll('footer a.fcm:not(.fadm)').forEach(a => {
      if (a.parentNode.querySelector('.fapp')) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fapp'; b.innerHTML = ICO + 'Instalează aplicația';
      b.addEventListener('click', install);
      a.insertAdjacentElement('afterend', b); btns.push(b);
    });
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => btns.forEach(b => b.remove()));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButtons); else addButtons();
})();
