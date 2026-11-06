// Meniu interactiv: pastila aurie pe calculator + meniu animat pe tot ecranul pe telefon
(() => {
  const nav = document.getElementById('nav'), old = document.getElementById('burger');
  if (!nav || !old) return;
  const hdr = nav.closest('.hdr');
  const wide = matchMedia('(min-width:1281px)');

  // iconițe pentru fiecare pagină (meniul de pe telefon)
  const I = {
    'index.html': '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/>',
    'despre.html': '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 15c3.5 0 7 1.5 7 5"/>',
    'cununie.html': '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10 4h4l-2 3z"/>',
    'bytheriver.html': '<circle cx="12" cy="9" r="3.5"/><path d="M2 17c2 0 2-1.5 4-1.5S8 17 10 17s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5S8 21 10 21s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
    'parteneri.html': '<path d="M3 11l4-4 5 3 5-3 4 4"/><path d="M7 7l-4 8 5 4 2-2M17 7l4 8-5 4-6-5"/><path d="M10 14l2 2M12 12l3 3"/>',
    'harta.html': '<path d="M12 21s-7-7.8-7-12a7 7 0 0114 0c0 4.2-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'calendar.html': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'galerie-foto.html': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
    'galerie-video.html': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>'
  };
  const links = [...nav.querySelectorAll('a')];
  links.forEach((a, i) => {
    a.style.setProperty('--i', i);
    const k = (a.getAttribute('href') || '').split(/[?#]/)[0];
    if (I[k] && !a.querySelector('.mi')) a.insertAdjacentHTML('afterbegin', `<span class="mi" aria-hidden="true"><svg viewBox="0 0 24 24">${I[k]}</svg></span>`);
  });

  // butonul ☰ → trei linii care devin ✕ (înlocuim butonul vechi, cu tot cu vechiul lui comportament)
  const burger = old.cloneNode(false);
  burger.innerHTML = '<span class="bl"></span><span class="bl"></span><span class="bl"></span>';
  burger.setAttribute('aria-controls', 'nav');
  old.replaceWith(burger);
  const set = o => {
    nav.classList.toggle('open', o); burger.classList.toggle('x', o);
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Închide meniul' : 'Meniu');
    document.body.classList.toggle('menu-lock', o); hdr && hdr.classList.toggle('menu-open', o);
  };
  burger.addEventListener('click', () => set(!nav.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); burger.focus(); } });
  wide.addEventListener('change', () => { if (wide.matches) set(false); });

  // pastila aurie care alunecă între linkuri (doar pe calculator)
  const pill = document.createElement('span'); pill.className = 'nav-pill'; nav.prepend(pill);
  const items = links.filter(a => !a.classList.contains('btn'));
  const cur = items.find(a => a.classList.contains('on'));
  const go = a => {
    if (!wide.matches || !a) { pill.classList.remove('show'); return; }
    pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; pill.classList.add('show');
  };
  items.forEach(a => { a.addEventListener('mouseenter', () => go(a)); a.addEventListener('focus', () => go(a)); });
  nav.addEventListener('mouseleave', () => go(cur));
  nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) go(cur); });
  const place = () => { pill.style.transition = 'none'; go(cur); pill.offsetWidth; pill.style.transition = ''; };
  addEventListener('resize', place); wide.addEventListener('change', place);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(place); place();
})();
