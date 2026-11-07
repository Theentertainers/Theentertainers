/* Caseta de pe prima pagină: localitatea vizitatorului, data, ora (live) și vremea */
(() => {
  const box = document.getElementById('acum');
  if (!box) return;
  const $ = s => box.querySelector(s);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fDate = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fTime = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  function tick() {
    const d = new Date();
    $('.a-date').textContent = cap(fDate.format(d));
    $('.a-time').textContent = fTime.format(d);
  }
  tick();
  setInterval(tick, 1000);
  box.classList.add('on');

  function meteo(code) {
    if (!code) return null;
    const night = /_night|_polartwilight/.test(code);
    const c = code.replace(/_(day|night|polartwilight)$/, '');
    const light = c.startsWith('light'), heavy = c.startsWith('heavy');
    if (c.includes('thunder')) return ['⛈️', 'Furtună'];
    if (c.includes('sleet')) return ['🌨️', 'Lapoviță'];
    if (c.includes('snow')) return ['🌨️', light ? 'Ninsoare slabă' : heavy ? 'Ninsoare abundentă' : 'Ninsoare'];
    if (c.includes('showers')) return ['🌦️', light ? 'Averse slabe' : heavy ? 'Averse puternice' : 'Averse'];
    if (c.includes('rain')) return ['🌧️', light ? 'Ploaie slabă' : heavy ? 'Ploaie torențială' : 'Ploaie'];
    if (c === 'fog') return ['🌫️', 'Ceață'];
    if (c === 'cloudy') return ['☁️', 'Înnorat'];
    if (c === 'partlycloudy') return [night ? '☁️' : '⛅', 'Parțial noros'];
    if (c === 'fair') return [night ? '🌙' : '🌤️', night ? 'Predominant senin' : 'Predominant însorit'];
    if (c === 'clearsky') return [night ? '🌙' : '☀️', night ? 'Cer senin' : 'Însorit'];
    return null;
  }

  // piese propuse de vizitatori (secțiunea „Piese propuse de voi”)
  const hpl = document.getElementById('hpl');
  if (hpl) {
    const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    fetch('https://mmnulrkqnbopkxuooocs.supabase.co/rest/v1/rpc/playlist_public', { method: 'POST',
      headers: { apikey: 'sb_publishable_o6j_hu_VXCTltuxERfXzEQ_gaJSC6JY', 'Content-Type': 'application/json' }, body: '{"p_limit":8}' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(l => {
        hpl.innerHTML = l.length ? l.map(s => `<li><div class="t"><a href="${/^https?:\/\//i.test(s.url) ? e(s.url) : '#'}" target="_blank" rel="noopener nofollow">${e(s.artist)} – ${e(s.title)}</a>
          <div class="by">propusă de <b>${e(s.name)}</b>${s.city ? ', ' + e(s.city) : ''}</div></div><span class="g">${e(s.genre)}</span></li>`).join('')
          : '<li class="hpl-e">Încă nu a propus nimeni o piesă. Fii primul! 🎧</li>';
      })
      .catch(() => { hpl.closest('section').hidden = true; });
  }

  // Localitatea: întâi după IP (aproximativ – pe date mobile poate arăta orașul operatorului).
  // Apăsând pe localitate, vizitatorul poate permite locația exactă; ținem minte alegerea pe acest dispozitiv.
  const loc = $('.a-loc');
  const KEY = 'te_geo';
  const store = { get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
                  set: v => { try { localStorage.setItem(KEY, v); } catch {} } };
  function precise(ask) {
    if (!navigator.geolocation) return;
    if (ask) loc.classList.add('busy');
    navigator.geolocation.getCurrentPosition(p => {
      store.set('1');
      load(`/api/vreme?lat=${p.coords.latitude.toFixed(3)}&lon=${p.coords.longitude.toFixed(3)}`);
    }, err => {
      loc.classList.remove('busy');
      if (err.code === 1) store.set('0');
      if (ask) loc.title = err.code === 1 ? 'Locația nu este permisă în browser' : 'Nu am putut afla locația';
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 30 * 60e3 });
  }
  loc.addEventListener('click', () => precise(true));

  function load(url) {
  return fetch(url)
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(w => {
      loc.classList.remove('busy');
      if (w.exact) { loc.classList.add('exact'); loc.title = 'Localitatea ta, după locația dispozitivului'; }
      if (w.city) { $('.a-city').textContent = w.city; loc.hidden = false; }
      if (w.temp != null) {
        const m = meteo(w.symbol) || ['🌡️', ''];
        $('.a-ico').textContent = m[0];
        $('.a-temp').textContent = Math.round(w.temp) + '°C';
        $('.a-desc').textContent = m[1];
        $('.a-wx').title = [m[1], w.humidity != null ? 'umiditate ' + Math.round(w.humidity) + '%' : '', w.wind != null ? 'vânt ' + Math.round(w.wind * 3.6) + ' km/h' : ''].filter(Boolean).join(' · ');
        $('.a-wx').hidden = false;
      }
      box.classList.add('full');
    })
    .catch(() => { loc.classList.remove('busy'); });
  }

  load('/api/vreme').then(() => {
    // dacă vizitatorul a permis deja locația (acum sau la o vizită anterioară), o folosim fără să mai întrebăm
    if (store.get() === '1') precise(false);
    else if (navigator.permissions && store.get() !== '0')
      navigator.permissions.query({ name: 'geolocation' }).then(s => { if (s.state === 'granted') precise(false); }).catch(() => {});
  });
})();
