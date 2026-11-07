// /api/vreme – localitatea aproximativă a vizitatorului (din datele Vercel, după IP; nu se salvează nimic)
// + vremea actuală de la MET Norway (api.met.no – gratuit, permis și pentru uz comercial).
const RO = {
  Bucharest: 'București', Constanta: 'Constanța', Timisoara: 'Timișoara', Iasi: 'Iași', Brasov: 'Brașov',
  Ploiesti: 'Ploiești', Pitesti: 'Pitești', 'Ramnicu Valcea': 'Râmnicu Vâlcea', 'Targu Jiu': 'Târgu Jiu',
  Galati: 'Galați', Bacau: 'Bacău', 'Targu Mures': 'Târgu Mureș', Buzau: 'Buzău', Braila: 'Brăila',
  Botosani: 'Botoșani', Calarasi: 'Călărași', Targoviste: 'Târgoviște', Resita: 'Reșița', Bistrita: 'Bistrița',
  Slobozia: 'Slobozia', Alexandria: 'Alexandria', Balș: 'Balș', Bals: 'Balș', Draganesti: 'Drăgănești',
  'Draganesti-Olt': 'Drăgănești-Olt', Scornicesti: 'Scornicești', Corabia: 'Corabia', Caracal: 'Caracal',
  'Drobeta-Turnu Severin': 'Drobeta-Turnu Severin', 'Satu Mare': 'Satu Mare', 'Baia Mare': 'Baia Mare',
  'Sfantu Gheorghe': 'Sfântu Gheorghe', 'Miercurea Ciuc': 'Miercurea Ciuc', Focsani: 'Focșani', Vaslui: 'Vaslui',
  'Piatra Neamt': 'Piatra Neamț', Suceava: 'Suceava', Zalau: 'Zalău', Turnu: 'Turnu Măgurele',
  'Turnu Magurele': 'Turnu Măgurele', Rosiori: 'Roșiorii de Vede', 'Rosiorii de Vede': 'Roșiorii de Vede',
  Giurgiu: 'Giurgiu', Oradea: 'Oradea', Arad: 'Arad', Cluj: 'Cluj-Napoca', 'Cluj-Napoca': 'Cluj-Napoca',
  Sibiu: 'Sibiu', Deva: 'Deva', 'Alba Iulia': 'Alba Iulia', Craiova: 'Craiova', Slatina: 'Slatina'
};

module.exports = async (req, res) => {
  const h = req.headers;
  const dec = v => { try { return decodeURIComponent(v || ''); } catch { return v || ''; } };
  let lat = parseFloat(h['x-vercel-ip-latitude']);
  let lon = parseFloat(h['x-vercel-ip-longitude']);
  let city = dec(h['x-vercel-ip-city']);
  const country = h['x-vercel-ip-country'] || '';
  if (!isFinite(lat) || !isFinite(lon)) { lat = 44.43; lon = 24.37; city = city || 'Slatina'; }
  city = RO[city] || city;

  const out = { city, country, temp: null, symbol: null, wind: null, humidity: null };
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'theentertainers.ro/1.0 https://www.theentertainers.ro' } });
    if (r.ok) {
      const j = await r.json();
      const now = Date.now();
      const ts = j.properties.timeseries;
      const t = ts.find(x => new Date(x.time).getTime() > now - 3600e3) || ts[0];
      const d = t.data;
      out.temp = d.instant.details.air_temperature;
      out.wind = d.instant.details.wind_speed;
      out.humidity = d.instant.details.relative_humidity;
      out.symbol = (d.next_1_hours || d.next_6_hours || {}).summary?.symbol_code || null;
    }
  } catch (e) { /* fără vreme – pagina arată doar ora și data */ }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=600');
  res.status(200).send(JSON.stringify(out));
};
