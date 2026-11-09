/* Conturi de client – logare, cont nou, parolă uitată (folosit pe rezerva.html și cont-client.html)
   Necesită: supabase-js (UMD) + assets/site.js înainte. */
window.TECont = (() => {
  const ADMIN = 'bacanucozmin@gmail.com';
  const sb = supabase.createClient(TE.SUPABASE_URL, TE.SUPABASE_KEY);
  const H0 = new URLSearchParams(location.hash.slice(1));
  const esc = TE.esc;

  // stiluri comune pentru caseta de cont
  const css = document.createElement('style');
  css.textContent = `
.cx{max-width:520px;margin:0 auto}
.cx .hidden{display:none!important}
.cx-tabs{display:flex;gap:6px;padding:4px;border-radius:999px;background:#0e0e11;border:1px solid var(--line);margin-bottom:20px}
.cx-tabs button{flex:1;padding:10px;border-radius:999px;border:0;background:none;color:#cfcabe;font:600 .9rem Montserrat,sans-serif;cursor:pointer}
.cx-tabs button.on{background:var(--grad);color:#1a1405}
.cx .f{display:grid;gap:6px;margin-bottom:14px}
.cx .f label{font-size:.82rem;font-weight:600;color:#cfcabe}
.cx .f input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#0e0e11;color:var(--text);font:500 .95rem Montserrat,sans-serif;outline:none}
.cx .f input:focus{border-color:var(--gold)}
.cx .f small{color:var(--muted);font-size:.78rem}
.cx .g2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.cx-agree{display:flex;gap:10px;align-items:flex-start;font-size:.84rem;color:var(--muted);margin:2px 0 14px;cursor:pointer}
.cx-agree input{accent-color:var(--gold);width:18px;height:18px;margin-top:2px;flex:none}
.cx-err{color:#ff9b9b;font-size:.88rem;min-height:1.2em;margin:2px 0 10px}
.cx-ok{color:#bfe8b6;font-size:.92rem;margin:12px 0 0;line-height:1.5}
.cx-lnk{background:none;border:0;color:var(--gold2);font:600 .86rem Montserrat,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:0}
@media (max-width:600px){.cx .g2{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  function mount(root, opt = {}) {
    let mode = opt.mode || 'in';
    const back = opt.redirect || (location.origin + location.pathname + location.search);
    root.classList.add('cx');
    root.innerHTML = `
      <form class="cx-auth" autocomplete="on" novalidate>
        <div class="cx-tabs"><button type="button" data-m="up">Cont nou</button><button type="button" data-m="in">Am deja cont</button></div>
        <div class="cx-up g2">
          <div class="f"><label>Nume și prenume *</label><input name="fullname" autocomplete="name" maxlength="120"></div>
          <div class="f"><label>Telefon *</label><input name="phone" type="tel" autocomplete="tel" maxlength="20" placeholder="07xx xxx xxx"></div>
        </div>
        <div class="f"><label>Email *</label><input name="email" type="email" autocomplete="username" maxlength="160"></div>
        <div class="f"><label>Parolă *</label><input name="pw" type="password" autocomplete="current-password" minlength="8"><small class="cx-up">Minim 8 caractere, cu litere, cifre și un semn.</small></div>
        <div class="f cx-up"><label>Scrie parola încă o dată *</label><input name="pw2" type="password" autocomplete="new-password" minlength="8"></div>
        <label class="cx-agree cx-up"><input type="checkbox" name="agree"> <span>Am citit <a href="termeni.html" target="_blank" style="color:var(--gold2)">Termenii și condițiile</a> și <a href="confidentialitate.html" target="_blank" style="color:var(--gold2)">Politica de confidențialitate</a> și sunt de acord ca The Entertainers să-mi păstreze datele ca să-mi gestioneze rezervările și să mă contacteze despre evenimentele mele.</span></label>
        <div class="cx-err" role="alert"></div>
        <button class="btn btn-gold" style="width:100%" name="go">Creează contul</button>
        <div class="cx-in" style="text-align:center;margin-top:14px"><button type="button" class="cx-lnk" name="forgot">Am uitat parola</button></div>
        <div class="cx-ok"></div>
      </form>
      <form class="cx-np hidden" autocomplete="on" novalidate>
        <h2 style="font-size:1.4rem;margin-bottom:6px">Alege o <span class="gold">parolă nouă</span></h2>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:16px">Minim 8 caractere, cu litere, cifre și un semn.</p>
        <div class="f"><label>Parola nouă</label><input name="np1" type="password" autocomplete="new-password" minlength="8"></div>
        <div class="f"><label>Încă o dată</label><input name="np2" type="password" autocomplete="new-password" minlength="8"></div>
        <div class="cx-err" role="alert"></div>
        <button class="btn btn-gold" style="width:100%" name="go">Salvează parola</button>
      </form>`;
    const A = root.querySelector('.cx-auth'), N = root.querySelector('.cx-np');
    const err = (f, t, html) => { const e = f.querySelector('.cx-err'); html ? e.innerHTML = t : e.textContent = t; };
    const ok = t => { A.querySelector('.cx-ok').textContent = t; };
    function setMode(m) {
      mode = m; const up = m === 'up';
      A.querySelectorAll('.cx-tabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
      A.querySelectorAll('.cx-up').forEach(x => x.classList.toggle('hidden', !up));
      A.querySelectorAll('.cx-in').forEach(x => x.classList.toggle('hidden', up));
      A.pw.autocomplete = up ? 'new-password' : 'current-password';
      A.go.textContent = up ? 'Creează contul' : 'Intră în cont';
      err(A, ''); ok('');
    }
    A.querySelectorAll('.cx-tabs button').forEach(b => b.onclick = () => setMode(b.dataset.m));
    setMode(mode);

    A.addEventListener('submit', async e => {
      e.preventDefault(); err(A, ''); ok('');
      const email = A.email.value.trim(), pw = A.pw.value;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err(A, 'Scrie o adresă de email validă.'); A.email.focus(); return; }
      if (email.toLowerCase() === ADMIN) { err(A, 'Acesta e contul de admin. Intră din <a href="admin.html" style="color:var(--gold2)">pagina de admin</a>.', 1); return; }
      if (mode === 'up') {
        const name = A.fullname.value.trim(), phone = A.phone.value.trim();
        if (name.length < 2) { err(A, 'Scrie-ne numele tău.'); A.fullname.focus(); return; }
        if (phone.replace(/[^0-9]/g, '').length < 9) { err(A, 'Scrie un număr de telefon valid.'); A.phone.focus(); return; }
        if (pw.length < 8) { err(A, 'Parola trebuie să aibă minim 8 caractere.'); A.pw.focus(); return; }
        if (pw !== A.pw2.value) { err(A, 'Cele două parole nu sunt la fel.'); A.pw2.focus(); return; }
        if (!A.agree.checked) { err(A, 'Bifează acordul pentru păstrarea datelor.'); return; }
        A.go.disabled = true;
        const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: back, data: { kind: 'client', name, phone } } });
        A.go.disabled = false;
        if (error) { err(A, /not allowed|disabled/i.test(error.message) ? 'Înscrierile nu merg momentan. Sună-ne la 0727 292 171.' : /weak|pwned|leaked|short/i.test(error.message) ? 'Parola e prea slabă. Alege una mai lungă, cu litere, cifre și semne.' : /registered|exists/i.test(error.message) ? 'Există deja un cont cu acest email. Intră din „Am deja cont”.' : /rate|seconds|many/i.test(error.message) ? 'Prea multe încercări. Mai încearcă peste câteva minute.' : 'Nu s-a putut crea contul: ' + error.message); return; }
        if (data.user && !data.user.identities?.length) { err(A, 'Există deja un cont cu acest email. Intră din „Am deja cont”.'); setMode('in'); A.email.value = email; return; }
        if (data.session) { done(data.session.user); return; }
        A.pw.value = A.pw2.value = '';
        ok(`Gata! Ți-am trimis un email la ${email}. Apasă butonul „Confirmă contul” din el (verifică și Spam) și te întorci aici, conectat.`);
      } else {
        if (!pw) { err(A, 'Scrie parola.'); A.pw.focus(); return; }
        A.go.disabled = true;
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
        A.go.disabled = false;
        if (error) { err(A, /confirm/i.test(error.message) ? 'Contul nu e confirmat încă. Apasă linkul din emailul primit la înscriere.' : /invalid/i.test(error.message) ? 'Email sau parolă greșită.' : 'Nu m-am putut conecta: ' + error.message); return; }
        A.pw.value = ''; done(data.user);
      }
    });
    A.forgot.onclick = async () => {
      const email = A.email.value.trim(); err(A, ''); ok('');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err(A, 'Scrie mai întâi adresa de email a contului.'); A.email.focus(); return; }
      A.forgot.disabled = true;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back });
      A.forgot.disabled = false;
      if (error) { err(A, /rate|seconds|many/i.test(error.message) ? 'Ai cerut deja un link de curând. Mai încearcă peste câteva minute.' : 'Nu s-a putut trimite emailul: ' + error.message); return; }
      ok(`Dacă există un cont cu ${email}, ți-am trimis un email cu link pentru parolă nouă.`);
    };
    N.addEventListener('submit', async e => {
      e.preventDefault(); err(N, '');
      const p1 = N.np1.value; if (p1.length < 8) { err(N, 'Minim 8 caractere.'); return; }
      if (p1 !== N.np2.value) { err(N, 'Cele două parole nu sunt la fel.'); return; }
      N.go.disabled = true; const { data, error } = await sb.auth.updateUser({ password: p1 }); N.go.disabled = false;
      if (error) { err(N, /different|same/i.test(error.message) ? 'Parola nouă trebuie să fie diferită de cea veche.' : /weak|pwned|leaked|short/i.test(error.message) ? 'Parola e prea slabă.' : 'Nu s-a salvat: ' + error.message); return; }
      done(data.user);
    });

    function showAuth(msg, html) { A.classList.remove('hidden'); N.classList.add('hidden'); root.hidden = false; if (msg) err(A, msg, html); opt.onGuest && opt.onGuest(); }
    function showNewPw() { A.classList.add('hidden'); N.classList.remove('hidden'); root.hidden = false; opt.onGuest && opt.onGuest(); }
    async function done(u) {
      // ești logat ca admin în acest browser: nu te scoatem din admin, doar arătăm logarea de client
      if ((u.email || '').toLowerCase() === ADMIN) {
        setMode('in');
        showAuth('Ești conectat ca <b>admin</b> în acest browser. Ca să testezi ca client, folosește o fereastră <b>Incognito</b> (sau alt browser) – dacă intri aici cu un cont de client, vei ieși din admin.', 1);
        return;
      }
      root.hidden = true;
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      opt.onUser && opt.onUser(u);
    }

    sb.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') showNewPw(); });
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (H0.get('error_description')) {
        history.replaceState(null, '', location.pathname + location.search);
        showAuth(/expired|invalid/i.test(H0.get('error_description')) ? 'Linkul a expirat sau a fost deja folosit. Încearcă din nou.' : 'Linkul nu a mers: ' + H0.get('error_description'));
        return;
      }
      if (H0.get('type') === 'recovery' && session) { showNewPw(); return; }
      if (session) done(session.user); else showAuth();
    })();
    return { showAuth };
  }

  // profilul clientului; dacă nu există, îl creăm din datele date la înscriere
  async function profile(u) {
    const { data } = await sb.from('clients').select('*').eq('id', u.id).maybeSingle();
    if (data) return data;
    const m = u.user_metadata || {};
    if (m.name && m.phone) { const r = await sb.rpc('client_save', { p_name: m.name, p_phone: m.phone, p_city: null }); if (!r.error) return r.data; }
    return null;
  }
  const logout = () => sb.auth.signOut();
  return { sb, mount, profile, logout, esc };
})();
