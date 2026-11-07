// /api/piesa?url=... – citește titlul piesei din link (YouTube, Spotify, SoundCloud, Deezer) ca să completăm automat artistul și titlul.
const OE = [
  [/^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i, u => 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(u.replace('music.youtube.com', 'www.youtube.com'))],
  [/^https?:\/\/open\.spotify\.com\//i, u => 'https://open.spotify.com/oembed?url=' + encodeURIComponent(u)],
  [/^https?:\/\/(www\.|m\.)?soundcloud\.com\//i, u => 'https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(u)],
  [/^https?:\/\/(www\.)?deezer\.com\//i, u => 'https://api.deezer.com/oembed?format=json&url=' + encodeURIComponent(u)]
];

function clean(t) {
  return String(t || '')
    .replace(/\s*[\(\[][^\)\]]*(official|oficial|video|audio|lyric|visualizer|clip|hd|4k|videoclip)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s{2,}/g, ' ').trim();
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const u = String((req.query && req.query.url) || '').trim();
  const hit = OE.find(([re]) => re.test(u));
  if (!hit || u.length > 500) return res.status(200).send('{}');
  try {
    const r = await fetch(hit[1](u), { headers: { 'User-Agent': 'theentertainers.ro/1.0' } });
    if (!r.ok) return res.status(200).send('{}');
    const j = await r.json();
    let title = clean(j.title), artist = '';
    const m = title.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (m) { artist = m[1].trim(); title = m[2].trim(); }
    else if (j.author_name && !/topic$/i.test(j.author_name) && !/spotify/i.test(j.author_name)) artist = String(j.author_name).replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
    else if (j.author_name) artist = String(j.author_name).replace(/\s*-\s*Topic$/i, '').trim();
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    res.status(200).send(JSON.stringify({ artist, title, thumb: j.thumbnail_url || '' }));
  } catch (e) { res.status(200).send('{}'); }
};
