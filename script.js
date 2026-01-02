
// script.js — versió funcional mínima
window.addEventListener('DOMContentLoaded', async () => {
  // Any al footer
  document.getElementById('year')?.append(new Date().getFullYear());

  // BIOS breu/llarga (pots substituir per la teva versió final)
  const bioShort = `He repartit la meva vida professional entre la interpretació i la docència. Les meves composicions són el fruit d’aquesta experiència i de la necessitat de crear quelcom que aporti bellesa i emoció al meu món.`;
  const bioLong = `Nascut a Barcelona el 1969… (posa aquí la biografia completa que vam validar).`;
  const bioShortEl = document.getElementById('bioShort');
  const bioLongEl = document.getElementById('bioLong');
  if (bioShortEl) bioShortEl.textContent = bioShort;
  if (bioLongEl) bioLongEl.textContent = bioLong;

  // Carrega media.json
  let media;
  try {
    const res = await fetch('media.json', { cache: 'no-store' });
    media = await res.json();
  } catch(e){
    media = { audio: [], video: [], playlists: [] };
  }
  const audio = Array.isArray(media.audio)?media.audio:[];
  const video = Array.isArray(media.video)?media.video:[];
  const playlists = Array.isArray(media.playlists)?media.playlists:[];

  // Estat filtres
  const state = { type:'all', year:'all', role:'all', playlist:'all' };

  // Dibuixa filtres
  const filtersEl = document.getElementById('filters');
  if (filtersEl){
    const years = [...new Set([...audio, ...video].map(i=> i.year ?? '—'))]
      .filter(Boolean).sort((a,b)=> String(b).localeCompare(String(a)));

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
      </label>`;

    ['fType','fYear','fRole','fPlaylist'].forEach(id=>{
      document.getElementById(id)?.addEventListener('change', e=>{
        state.type = document.getElementById('fType').value;
        state.year = document.getElementById('fYear').value;
        state.role = document.getElementById('fRole').value;
        state.playlist = document.getElementById('fPlaylist').value;
        render();
      });
    });
  }

  function matches(it){
    if (state.type!=='all'){
      const t = it.type || (it.embed || it.src ? 'audio':'video');
      if (t!==state.type) return false;
    }
    if (state.year!=='all'){
      const y = it.year ?? '—';
      if (String(y)!==String(state.year)) return false;
    }
    if (state.role!=='all'){
      const r = it.role || 'composer';
      if (r!==state.role) return false;
    }
    if (state.playlist!=='all'){
      const inPl = playlists.some(pl=> pl.id===state.playlist && (pl.items||[]).includes(it.id));
      if (!inPl) return false;
    }
    return true;
  }

  function card(it){
    const title = it.title || '(Sense títol)';
    const meta = [ it.year?`Any: ${it.year}`:'', it.role?`Rol: ${it.role}`:'', Array.isArray(it.tags)&&it.tags.length?`Tags: ${it.tags.join(', ')}`:'' ].filter(Boolean).join(' · ');
    // Àudio
    if (it.embed || it.src){
      const player = it.embed ? `<iframe width="100%" height="166" allow="autoplay" src="${it.embed}"></iframe>` : `<audio controls src="${it.src}"></audio>`;
      return `<article class="card audio"><h3>${title}</h3><div class="meta">${meta}</div>${player}${it.program_notes?`<p class="notes">${it.program_notes}</p>`:''}</article>`;
    }
    // Vídeo YouTube
    if (it.platform==='YouTube' && it.video_id){
      const url = `https://www.youtube.com/embed/${it.video_id}`;
      return `<article class="card video"><h3>${title}</h3><div class="meta">${meta}</div><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen src="${url}"></iframe></article>`;
    }
    return '';
  }

  function render(){
    const lib = document.getElementById('mediaLibrary');
    if (!lib) return;
    const items = [ ...audio.map(a=>({...a, type:'audio'})), ...video.map(v=>({...v, type:'video'})) ].filter(matches);
    lib.innerHTML = items.length ? items.map(card).join('') : `<p class="muted">No hi ha contingut que coincideixi amb els filtres.</p>`;
  }

  render();
});
