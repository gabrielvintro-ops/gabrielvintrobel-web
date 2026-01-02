// script.js — funcional: bios + filtres + enllaços + miniatures
window.addEventListener('DOMContentLoaded', async () => {
  const $ = (sel) => document.querySelector(sel);

  const bioShortEl = $('#bioShort');
  const bioLongEl  = $('#bioLong');
  const filtersEl  = $('#filters');
  const lib        = $('#mediaLibrary');

  // Any al footer
  $('#year')?.append(new Date().getFullYear());

  // BIOS (substitueix per la teva versió real quan vulguis)
  if (bioShortEl) bioShortEl.textContent =
    'Violinista i compositor. La meva música explora el color de la corda, el diàleg tímbric i la connexió emocional amb el públic.';
  if (bioLongEl)  bioLongEl.textContent  =
    'Format a Barcelona, he combinat interpretació i docència al llarg de la meva trajectòria...';

  // Carrega media.json
  let media;
  try {
    const res = await fetch('media.json', { cache: 'no-store' });
    media = await res.json();
  } catch (e) {
    lib.innerHTML = `<p class="muted">No s’ha pogut carregar <code>media.json</code>.</p>`;
    return;
  }
  const audio     = Array.isArray(media.audio)     ? media.audio     : [];
  const video     = Array.isArray(media.video)     ? media.video     : [];
  const playlists = Array.isArray(media.playlists) ? media.playlists : [];

  // Filtres
  const state = { type:'all', year:'all', role:'all', playlist:'all' };
  if (filtersEl) {
    const years = [...new Set([...audio, ...video].map(i => i.year ?? '—'))]
      .filter(v => v !== undefined && v !== null)
      .sort((a,b)=> String(b).localeCompare(String(a)));
    filtersEl.innerHTML = `
      <label>Tipus
        <select id="fType">
          <option value="all">Tots</option>
          <option value="audio">Àudio</option>
          <option value="video">Vídeo</option>
        </select>
      </label>
      <label>Any
        <select id="fYear">
          <option value="all">Tots</option>
          ${years.map(y=>`<option value="${y}">${y}</option>`).join('')}
        </select>
      </label>
      <label>Rol
        <select id="fRole">
          <option value="all">Tots</option>
          <option value="composer">Compositor</option>
          <option value="interpreter">Intèrpret</option>
        </select>
      </label>
      <label>Playlist
        <select id="fPlaylist">
          <option value="all">Cap</option>
          ${playlists.map(p=>`<option value="${p.id}">${p.title}</option>`).join('')}
        </select>
      </label>
    `;
    ['fType','fYear','fRole','fPlaylist'].forEach(id=>{
      document.getElementById(id)?.addEventListener('change', ()=>{
        state.type     = document.getElementById('fType').value;
        state.year     = document.getElementById('fYear').value;
        state.role     = document.getElementById('fRole').value;
        state.playlist = document.getElementById('fPlaylist').value;
        render();
      });
    });
  }

  // Helpers d’enllaç
  const soundcloudPageUrl = (embedUrl) => {
    try {
      const u = new URL(embedUrl);
      const original = u.searchParams.get('url');
      if (original) return decodeURIComponent(original);
    } catch(e){}
    return null;
  };
  const youtubeWatchUrl = (id) => `https://youtu.be/${id}`;

  const matches = (it) => {
    if (state.type !== 'all') {
      const t = it.type || (it.embed || it.src ? 'audio' : 'video');
      if (t !== state.type) return false;
    }
    if (state.year !== 'all') {
      const y = it.year ?? '—';
      if (String(y) !== String(state.year)) return false;
    }
    if (state.role !== 'all') {
      const r = it.role || 'composer';
      if (r !== state.role) return false;
    }
    if (state.playlist !== 'all') {
      const inPl = playlists.some(pl => pl.id === state.playlist && (pl.items||[]).includes(it.id));
      if (!inPl) return false;
    }
    return true;
  };

  const card = (it) => {
    const title = it.title || '(Sense títol)';
    const subtitle = it.subtitle ? `<div class="sub">${it.subtitle}</div>` : '';
    const meta = [
      it.year ? `Any: ${it.year}` : '',
      it.role ? `Rol: ${it.role}` : '',
      Array.isArray(it.tags)&&it.tags.length ? `Tags: ${it.tags.join(', ')}` : ''
    ].filter(Boolean).join(' · ');

    let outLink = '';
    let player  = '';
    if (it.embed || it.src) {                   // Àudio (SoundCloud / src local)
      const sc = it.embed ? soundcloudPageUrl(it.embed) : null;
      outLink = sc ? `${sc}Obrir a SoundCloud</a>` : '';
      player  = it.embed
        ? `${it.embed}</iframe>`
        : `${it.src}</audio>`;
    } else if (it.platform === 'YouTube' && it.video_id) {  // Vídeo
      const watch = youtubeWatchUrl(it.video_id);
      outLink = `<a class="btn" href="${watch}"      const url = `https://www.youtube.com/embed/${it.video_id}`;
      player  = `${url}</iframe>`;
    }

    const thumb = it.thumbnail ? `<img class="thumb" src="${it.thumbnail}" alt="minie class="card">
        ${thumb}
        <h3>${title}</h3>
        ${subtitle}
        <div class="meta">${meta}</div>
        ${player}
        <div class="actions">${outLink}</div>
        ${it.program_notes ? `<p class="notes">${it.program_notes}</p>` : ''}
      </article>
    `;
  };

  function render() {
    const items = [
      ...audio.map(a => ({ ...a, type: 'audio' })),
      ...video.map(v => ({ ...v, type: 'video' }))
    ].filter(matches);
    lib.innerHTML = items.length
      ? items.map(card).join('')
      : `<p class="muted">No hi ha contingut que coincideixi amb els filtres.</p>`;
  }

  render();
});
