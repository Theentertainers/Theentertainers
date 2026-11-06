// Statistici proprii The Entertainers – fără cookie-uri, fără IP, fără date personale.
// Vizitatorul primește un cod anonim care se schimbă în fiecare zi (nu poate fi urmărit de la o zi la alta).
(() => {
  const URL_ = 'https://mmnulrkqnbopkxuooocs.supabase.co/rest/v1/rpc/track_view';
  const KEY = 'sb_publishable_o6j_hu_VXCTltuxERfXzEQ_gaJSC6JY';
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { return null; } };
  const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch { return null; } };
  if (!/theentertainers\.ro$/.test(location.hostname) && !/[?&]te_track=1/.test(location.search)) return; // doar pe site-ul real
  if (ls('te_notrack') === '1') return; // vizitele administratorului nu se numără
  const path = (location.pathname.replace(/^\/+/, '').replace(/\.html$/, '') || 'index');
  if (/^(admin|cont-partener)$/.test(path)) return;

  // de unde a venit (o singură dată pe vizită)
  let src = ss('te_src');
  if (!src) {
    const q = new URLSearchParams(location.search).get('utm_source');
    let h = ''; try { h = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch {}
    src = q ? q.toLowerCase().slice(0, 40)
      : !h || /theentertainers\.ro$/.test(h) ? 'direct'
      : /(^|\.)google\./.test(h) ? 'google'
      : /bing\.com$/.test(h) ? 'bing'
      : /(facebook\.com|fb\.me|fb\.com)$/.test(h) ? 'facebook'
      : /instagram\.com$/.test(h) ? 'instagram'
      : /tiktok\.com$/.test(h) ? 'tiktok'
      : /(chatgpt\.com|openai\.com)$/.test(h) ? 'chatgpt'
      : /(whatsapp\.com|wa\.me)$/.test(h) ? 'whatsapp'
      : /duckduckgo\.com$/.test(h) ? 'duckduckgo'
      : /yahoo\./.test(h) ? 'yahoo'
      : h.slice(0, 40);
    ss('te_src', src);
  }
  const ua = navigator.userAgent;
  const device = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tabletă' : /Mobi|Android|iPhone/i.test(ua) ? 'mobil' : 'calculator';

  let base = ls('te_voter');
  if (!base) { base = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); ls('te_voter', base); }
  const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Bucharest' });
  const visitorP = (async () => {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base + '|' + day));
      return [...new Uint8Array(buf)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { return (base.replace(/[^0-9a-f]/gi, '').toLowerCase() + '0000000000000000').slice(0, 32); }
  })();

  const send = async kind => {
    try {
      const body = JSON.stringify({ p_kind: kind, p_path: path, p_src: src, p_device: device, p_visitor: await visitorP });
      fetch(URL_, { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' }, body });
    } catch {}
  };
  window.teTrack = send; // ex. teTrack('rezerva') după trimiterea formularului
  send('view');
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href');
    if (/^tel:/i.test(h)) send('tel');
    else if (/wa\.me|whatsapp\.com/i.test(h)) send('wa');
  }, true);
})();
