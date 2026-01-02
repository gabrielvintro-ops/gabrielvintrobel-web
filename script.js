// script.js — versió funcional amb filtres i render
window.addEventListener('DOMContentLoaded', async () => {
  const log = (...args) => console.log('[GVB]', ...args);

  // Referències del DOM
  const bioShortEl = document.getElementById('bioShort');
  const bioLongEl  = document.getElementById('bioLong');
  const filtersEl  = document.getElementById('filters');
  const lib        = document.getElementById('mediaLibrary');

  // Any al footer si hi és
  document.getElementById('year')?.append(new Date().getFullYear());

  // Bios de prova (substitueix-les quan vulguis per les teves definitives)
  if (bioShortEl) bioShortEl.textContent =
    'He repartit la meva vida professional entre la interpretació i la docència...';
  if (bioLongEl)  bioLongEl.textContent  =
    'Biografia extensa validada...';

  // Carrega media.json
  let media;
  try {
    const res = await fetch('media.json', { cache: 'no-store' });
    media = await res.json();
    log('media.json carregat', media);
  } catch (err) {
    console.error('ERROR carregant media.json', err);
    lib.innerHTML = `<p class="muted">No s’ha pogut carregar <code>media.json</code>.</p>`;
    return;
  }

  const audio     = Array.isArray(media.audio)     ? media.audio     : [];
  const video     = Array.isArray(media.video)     ? media.video     : [];
  const playlists = Array.isArray(media.playlists) ? media.playlists : [];

  log(`Elements: audio=${audio.length}, video=${video.length}, playlists=${playlists.length}`);

  // Estat de filtres
  const state = { type: 'all', year: 'all', role: 'all', playlist: 'all' };

  // Dibuixa filtres
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

  // Predicats de filtre i render
  function matches(it) {
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
  }

  function card(it) {
    const title = it.title || '(Sense títol)';
    const meta  = [
      it.subtitle ? `<em>${it.subtitle}</em>` : '',
      it.year ? `Any: ${it.year}` : '',
      it.role ? `Rol: ${it.role}` : '',
      Array.isArray(it.tags)&&it.tags.length ? `Tags: ${it.tags.join(', ')}` : ''
    ].filter(Boolean).join(' · ');

    // Àudio (SoundCloud o arxiu local)
    if (it.embed || it.src) {
      const player = it.embed
        ? `${it.embed}</iframe>`
        : `<audio controlso>`;
      return `
        <article class="card audio">
          <h3>${title}</h3>
          <div class="meta">${meta}</div>
          ${player}
          ${it.program_notes ? `<p class="notes">${it.program_notes}</p>` : ''}
        </article>`;
    }

    // Vídeo (YouTube)
    if (it.platform === 'YouTube' && it.video_id) {
      const url = `https://www.youtube.com/embed/${it.video_id}`;
      return `
        <article class="card video">
          <h3>${title}</h3>
          <div class="meta">${meta}</div>
          ${url}</iframe>
        </article>`;
    }

    return '';
  }

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
``
