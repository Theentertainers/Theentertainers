/* Contractul de prestări servicii The Entertainers – modelul (text din „Model contract - Prestari Servicii The Entertainers firme.doc”,
   cu greșelile evidente corectate) + completarea automată. Folosit în cont-client.html și admin.html. */
window.TEContract = (() => {
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DOTS = '<span class="ct-dots">..............................</span>';
  const v = (x, dots = DOTS) => (x === 0 || (x != null && String(x).trim() !== '')) ? `<b>${E(x)}</b>` : dots;
  const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const dmy = iso => { if (!iso) return null; const d = new Date(iso.length === 10 ? iso + 'T12:00' : iso); return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const lei = n => n == null || n === '' ? null : Number(n).toLocaleString('ro-RO', { maximumFractionDigits: 2 });

  // suma în litere, în română (ex. 3500 → „trei mii cinci sute de lei”)
  function words(n) {
    n = Math.round(Number(n) || 0);
    if (n === 0) return 'zero lei';
    if (n === 1) return 'un leu';
    const U = ['', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă'];
    const UF = ['', 'una', 'două', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă'];
    const T = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'];
    const Z = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'];
    const de = x => (x % 100 === 0 || x % 100 >= 20) ? ' de' : '';
    function sub1000(x, fem) {
      const h = Math.floor(x / 100), r = x % 100, out = [];
      if (h) out.push(h === 1 ? 'o sută' : h === 2 ? 'două sute' : U[h] + ' sute');
      if (r) {
        if (r < 10) out.push(fem ? UF[r] : U[r]);
        else if (r < 20) out.push(r === 12 && fem ? 'douăsprezece' : T[r - 10]);
        else { const u = r % 10; out.push(Z[Math.floor(r / 10)] + (u ? ' și ' + (fem ? UF[u] : U[u]) : '')); }
      }
      return out.join(' ');
    }
    const parts = [];
    const mil = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, rest = n % 1000;
    if (mil) parts.push(mil === 1 ? 'un milion' : mil === 2 ? 'două milioane' : sub1000(mil, true) + de(mil) + ' milioane');
    if (th) parts.push(th === 1 ? 'o mie' : th === 2 ? 'două mii' : sub1000(th, true) + de(th) + ' mii');
    if (rest) parts.push(rest === 1 ? 'unu' : rest === 2 ? 'doi' : sub1000(rest, false));
    return parts.join(' ') + de(n) + ' lei';
  }

  function beneficiar(b) {
    if (b && b.type === 'pf')
      return `1.2. ${v(b.name)} cu domiciliul in ${v(b.address)}, identificat(a) prin CNP ${v(b.cnp)}, in calitate de Beneficiar, pe de alta parte,`;
    if (b && b.type === 'firma')
      return `1.2. ${v(b.company)} cu sediul in ${v(b.seat)}, identificat prin ${b.regcom ? v(b.regcom) : 'J' + DOTS} CUI ${v(b.cui)}, reprezentata prin ${v(b.rep)}, in calitate de Beneficiar, pe de alta parte,`;
    return `1.2. ${DOTS} cu sediul/domiciliul in ${DOTS} identificat prin J${DOTS} CUI/CNP ${DOTS} in calitate de Beneficiar, pe de alta parte,`;
  }

  // c = { number, data, beneficiary, signature, signed_at }, opt.date = data afișată „din data” când nu e semnat încă
  function html(c, opt = {}) {
    const d = c.data || {}, b = c.beneficiary || null;
    const signedDate = c.signed_at ? dmy(c.signed_at) : opt.date || null;
    const price = Number(d.price) || 0, dep = Number(d.deposit) || 0, rest = Math.max(0, price - dep);
    const end = d.end_date ? new Date(d.end_date + 'T12:00') : null;
    const team = (d.team && d.team.length ? d.team : [{ role: 'DJ', n: 1 }, { role: 'Entertainer', n: 1 }, { role: 'Asistent', n: 1 }]);
    const services = (d.services && d.services.length ? d.services : ['DJ', 'Entertainer/MC', 'Sonorizare', 'Lumini']).join(', ');
    const bName = b ? (b.type === 'firma' ? b.company : b.name) : '';
    return `<article class="ct-doc">
<h1>CONTRACT DE PRESTARI SERVICII${c.number ? ' NR. ' + E(c.number) : ''}<br><small>DIN DATA ${v(signedDate)}</small></h1>

<h2>Capitolul 1: PARTILE CONTRACTANTE</h2>
<p>1.1. SC THE ENTERTAINERS LTD SRL cu sediul in Mun. Slatina, jud. Olt, J28/85/2024, CUI: 49475592, IBAN: RO28BRDE290SV97313752900 deschis la BRD, reprezentata prin dl. Trusca Adrian, in calitate de Prestator, pe de o parte si</p>
<p>${beneficiar(b)} au incheiat prezentul contract de prestari servicii.</p>

<h2>Capitolul 2: OBIECTUL CONTRACTULUI</h2>
<p>2.1. SC THE ENTERTAINERS LTD SRL – in calitate de Prestator, se obliga sa asigure la evenimentul ${v(d.event)} servicii de ${v(services)}.</p>
<p>2.2. Prestatorul, pentru indeplinirea serviciilor solicitate de Beneficiar, in urma discutiilor avute, va oferi echipa formata din:</p>
<table class="ct-team"><thead><tr><th>Echipa</th><th>Nr. persoane</th></tr></thead><tbody>${team.map(t => `<tr><td>${E(t.role)}</td><td>${E(t.n)}</td></tr>`).join('')}</tbody></table>
<p>2.3. Detaliile evenimentului:<br>
2.3.1. Data Eveniment: ${v(d.date ? dmy(d.date) : null)}<br>
2.3.2. Locatie Eveniment: ${v(d.location)}<br>
2.3.3. Telefon: ${v(d.phone)} (orice modificare a datelor de contact se anunta in termen de minim 7 zile de la data modificarii.)</p>

<h2>Capitolul 3: VALOAREA CONTRACTULUI</h2>
<p>3.1. Partile convin ca valoarea serviciilor de la Capitolul 2 este de ${v(price ? lei(price) : null)} Lei adica (${price ? '<b>' + E(words(price)) + '</b>' : DOTS}).</p>

<h2>Capitolul 4: PLATA SERVICIILOR</h2>
<p>4.1. Plata serviciilor de la Capitolul 2, se va efectua astfel:<br>
4.1.1. ${v(price ? lei(dep) : null)} lei, reprezentand taxa rezervare data, la data semnarii contractului.<br>
4.1.2. ${v(price ? lei(rest) : null)} lei, diferenta la data incheierii contractului.<br>
4.1.3. DATA FINALIZARII EVENIMENTULUI: AN ${v(end ? end.getFullYear() : null)} LUNA ${v(end ? LUNI[end.getMonth()] : null)} ZI ${v(end ? end.getDate() : null)}</p>
<p>Orice prelungire a termenului pentru incasarea contravalorii serviciilor prevazute la art. 4.1.2. si 4.1.3. se va face numai cu acordul expres al prestatorului. De asemenea, orice prestare in plus a serviciilor contractate (sonorizare, dj/mc, efecte speciale, gheata carbonica, artificii interior) peste data si ora prevazute pentru data finalizarii evenimentului se va face numai cu acordul expres al prestatorului.</p>

<h2>Capitolul 5: DURATA CONTRACTULUI</h2>
<p>5.1. Durata contractului este de la data semnarii acestuia pana la Data Finalizarii Evenimentului solicitate de Beneficiar.</p>

<h2>Capitolul 6: OBLIGATIILE PARTILOR</h2>
<p>6.1. Prestatorul se obliga:<br>
6.1.1. sa presteze intocmai serviciile in conformitate cu prevederile de la Capitolul 2;<br>
6.1.2. sa pastreze confidentialitatea datelor prezentului contract; prestatorul poate face cunoscute catre terti datele continute in prezentul contract, partial sau integral, numai cu acordul scris al beneficiarului.</p>
<p>6.2. Beneficiarul se obliga:<br>
6.2.1. sa puna la dispozitia prestatorului informatiile necesare prestarii serviciilor, intr-un termen cat mai scurt cu putinta;<br>
6.2.2. sa plateasca prestatia conform prezentului contract;<br>
6.2.3. sa asigure securitatea echipei Prestatorului si sa impiedice orice actiune de natura a periclita activitatea acestuia si se angajeaza sa raspunda civil si patrimonial si sa acopere toate prejudiciile cauzate Prestatorului atat pe cele ce rezulta din fapta proprie, cat si pe acelea ce rezulta din faptele invitatilor/participantilor la eveniment, cu exceptia cazului in care prejudiciul a fost cauzat din culpa exclusiva a Prestatorului.<br>
6.2.4. sa pastreze confidentialitatea datelor contractuale; beneficiarul poate face cunoscute catre terti datele continute in prezentul contract, partial sau integral, numai cu acordul scris al prestatorului.<br>
6.2.5. sa desemneze o persoana de contact care va asigura, in cadrul evenimentului, conditiile pentru prestarea serviciilor contractate si, totodata, care va prelua documentatia de la prestator, potrivit clauzelor contractuale;</p>

<h2>Capitolul 7: RASPUNDEREA CONTRACTUALA</h2>
<p>7.1. In cazul in care una dintre parti nu indeplineste obligatiile contractuale sau le indeplineste in mod necorespunzator, se obliga sa plateasca celeilalte parti penalitati/daune-interese, dupa cum urmeaza:<br>
7.1.1. In cazul in care Prestatorul se razgandeste sau nu mai poate asigura efectuarea serviciilor contractate se obliga sa restituie Beneficiarului suma incasata cu titlu de avans prevazuta la art. 4.1.<br>
7.1.2. In cazul in care Beneficiarul invoca imposibilitatea desfasurarii evenimentului din alte cauze decat forta majora sau fie nu mai doreste ca Prestatorul sa execute serviciile contractate, va fi obligat sa plateasca catre Prestator cu titlu de clauza penala dupa cum urmeaza:<br>
7.1.2.1. 0 % din suma prevazuta la art. 4.1.2., daca imposibilitatea a fost adusa la cunostinta Prestatorului cu cel mult 6 luni, dar nu mai putin de 3 luni inainte de Data Evenimentului.<br>
7.1.2.2. 25 % din suma prevazuta la art. 4.1.2., daca imposibilitatea a fost adusa la cunostinta Prestatorului cu cel mult 3 luni, dar nu mai putin de 0 luna inainte de Data Evenimentului.<br>
7.1.2.3. 50 % din suma prevazuta la art. 4.1.2. daca imposibilitatea a fost adusa la cunostinta Prestatorului cu cel mult 1 luna inainte de Data Evenimentului.</p>
<p>In toate cazurile avansul incasat de catre Prestator nu este supus restituirii, cu exceptia cazului prevazut la art. 7.1.1.</p>
<p>Clauza penala constituie un pact comisoriu si va fi executata fara interventia instantelor judecatoresti sau punere in intarziere a Beneficiarului. Pana la plata efectiva a sumelor datorate, Prestatorul este indreptatit sa restrictioneze accesul Beneficiarului la lucrarile efectuate, si sa pastreze drepturile de autor asupra lucrarilor prestate. Aceste drepturi vor fi cedate la finalizarea prezentului contract dupa plata integrala a datoriilor restante.</p>
<p>7.2. Forta majora exonereaza partile contractante de indeplinirea obligatiilor contractuale asumate, pe toata perioada in care acestea actioneaza, dar fara a prejudicia drepturile si indatoririle ce li se cuveneau partilor pana la data declararii starii de forta majora. Cazul fortuit nu exonereaza partile de indeplinirea obligatiilor.</p>
<p>7.3. Prestatorul nu-si asuma raspunderea profesionala definita prin legile si regulamentele in vigoare decat in masura greselilor personale. El nu va putea fi tras la raspundere nici solidar, nici individual pentru greseli comise de alti factori interveniti in lucrare (invitati, fapta Beneficiarului, intreruperi intempestive de curent etc).</p>
<p>7.4. Beneficiarul nu are dreptul sa dea nici un fel de dispozitii referitoare la indeplinirea misiunilor fara a-l consulta pe Prestator. In caz contrar, Prestatorul va fi exonerat de raspunderea cerintelor ce decurg din astfel de dispozitii.</p>

<h2>Capitolul 8: INCETAREA CONTRACTULUI</h2>
<p>8.1. Prezentul contract inceteaza de plin drept prin acordul scris al partilor semnatare.<br>
8.2. Contractul mai inceteaza in urmatoarele situatii:<br>
8.2.1. la expirarea duratei contractului;<br>
8.2.2. in cazul mortii, dizolvarii, lichidarii, falimentului, retragerii autorizatiei de functionare a unuia din contractanti;</p>

<h2>Capitolul 9: LITIGII SI NOTIFICARILE INTRE PARTI</h2>
<p>9.1. In acceptiunea partilor contractante, orice notificare adresata de una dintre acestea celeilalte este valabil indeplinita daca va fi transmisa la sediul prevazut in partea introductiva a prezentului contract. Notificarile si corespondenta intre partile contractante se poate face si pe cale electronica (email) sau fax.<br>
9.2. In cazul in care notificarea se face pe cale postala, ea va fi transmisa, prin scrisoare recomandata, cu confirmare de primire si se considera primita de destinatar la data mentionata de oficiul postal primitor pe aceasta confirmare.<br>
9.3. In cazul unui litigiu, competenta teritorial este instanta de la sediul Prestatorului.</p>

<h2>Capitolul 10: CLAUZE FINALE</h2>
<p>10.1. Modificarea prezentului contract se face numai prin act aditional incheiat intre partile contractante.<br>
10.2. Dupa semnarea prezentului contract, Beneficiarul nu mai are posibilitatea de a renunta la serviciile/produsele alese, chiar daca acesta nu mai doreste efectuarea acestora de catre Prestator.<br>
10.3. Selectarea de catre Beneficiar a altor servicii decat cele pentru care a fost incheiat prezentul contract, vor fi trecute intr-o anexa separata/act aditional, urmand ca obligatiile prevazute in contract sa se extinda si asupra anexei/actului aditional. Pretul contractului va fi astfel majorat cu contravaloarea noilor servicii solicitate de Beneficiar.<br>
10.4. Prezentul contract reprezinta vointa partilor si inlatura orice alta intelegere verbala dintre acestea, anterioara sau ulterioara incheierii lui.<br>
10.5. Prezentul contract a fost incheiat intr-un numar de 2 exemplare, unul pentru prestator si unul pentru beneficiar, astazi ${v(signedDate)} data semnarii lui.</p>

<div class="ct-sign">
  <div><b>Prestator</b><br>The Entertainers<br>Trusca Adrian</div>
  <div><b>Beneficiar</b><br>${bName ? E(bName) : '_______________________'}
    ${c.signature ? `<br><img src="${E(c.signature)}" alt="Semnătura beneficiarului">` : ''}
    ${c.signed_at ? `<br><small>Semnat electronic pe ${E(new Date(c.signed_at).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</small>` : ''}</div>
</div>
</article>`;
  }

  const CSS = `
.ct-doc{background:#fff;color:#1a1a1a;font:14px/1.6 Georgia,'Times New Roman',serif;padding:40px 44px;border-radius:6px;max-width:820px;margin:0 auto;text-align:justify}
.ct-doc h1{font:700 18px/1.4 Georgia,serif;text-align:center;margin:0 0 22px;letter-spacing:.5px}
.ct-doc h1 small{font-size:14px;font-weight:400}
.ct-doc h2{font:700 14px/1.4 Georgia,serif;margin:18px 0 6px;text-transform:none}
.ct-doc p{margin:0 0 8px}
.ct-doc b{font-weight:700}
.ct-doc .ct-dots{color:#999;letter-spacing:1px}
.ct-team{border-collapse:collapse;margin:6px 0 10px;min-width:260px}
.ct-team th,.ct-team td{border:1px solid #999;padding:4px 14px;text-align:left}
.ct-sign{display:flex;justify-content:space-between;gap:30px;margin-top:34px;text-align:center}
.ct-sign>div{flex:1}
.ct-sign img{max-width:240px;max-height:110px;margin-top:6px}
.ct-sign small{color:#555;font-size:11px}
@media (max-width:600px){.ct-doc{padding:24px 18px;font-size:13px}}`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  // fereastră de tipărire / „Salvează ca PDF”
  function print(c) {
    const w = window.open('', '_blank');
    if (!w) { alert('Permite ferestrele pop-up ca să descarci contractul.'); return; }
    w.document.write(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Contract ${c.number ? 'nr. ' + c.number : ''} – The Entertainers</title>
      <style>${CSS} body{margin:0;background:#fff} .ct-doc{padding:10mm 4mm;max-width:none} @page{size:A4;margin:16mm 16mm}
      .bar{position:sticky;top:0;background:#111;color:#fff;padding:10px;text-align:center;font:14px Arial} .bar button{font:600 14px Arial;padding:8px 18px;border-radius:20px;border:0;background:#d4af37;cursor:pointer}
      @media print{.bar{display:none}}</style></head><body>
      <div class="bar"><button onclick="print()">Tipărește / Salvează ca PDF</button></div>${html(c)}</body></html>`);
    w.document.close(); setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 600);
  }

  return { html, print, words, dmy };
})();
