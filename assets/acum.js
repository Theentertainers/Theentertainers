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

  fetch('/api/vreme')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(w => {
      if (w.city) { $('.a-city').textContent = w.city; $('.a-loc').hidden = false; }
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
    .catch(() => {});
})();
