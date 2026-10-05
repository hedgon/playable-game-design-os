/* =====================================================================
   CONTENT ON DEMAND
   The page carries a light index of every topic, game, path, project,
   platform, engine, comparison, smell, checklist and prompt template: the fields lists, links, the map and
   progress read across the site. Each entity's long text lives in its own
   file, content/<kind>/<id>.js, written by the build, and is loaded here
   the first time a page needs it. A file calls PlayableContent.put(), which
   merges its fields into the light object in place, so view code reads
   TOPICS[id].what as before once the router has awaited need().

   Script tags, not fetch: they load from file:// as well as from a server,
   so the guide still opens from a folder on disk. Each URL carries the
   build id (?v=), which changes with any change to the data or the code,
   so a browser never mixes files from two releases. A file from a different
   build than this page means the page itself is a cached old copy: it is
   reloaded once, by a new URL. The same loader brings in the code only one
   kind of page runs (kind "code", manifest LAZY), such as the build tools.
   ===================================================================== */
window.PlayableContent = (function(){
  const BUILD = window.PLAYABLE_BUILD, NOFILE = window.PLAYABLE_NOFILE || {};
  const find = {
    topic: id => TOPICS[id],
    game: id => REFERENCE_GAMES.find(x => x.id === id),
    path: id => PATHS.find(x => x.id === id),
    case: id => CASE_STUDIES.find(x => x.id === id),
    platform: id => PLATFORMS.find(x => x.id === id),
    engine: id => ENGINES.find(x => x.id === id),
    compare: id => COMPARISONS.find(x => x.id === id),
    smell: id => SMELLS.find(x => x.id === id),
    checklist: id => CHECKLISTS.find(x => x.id === id),
    prompt: id => PROMPT_TEMPLATES.find(x => x.id === id)
  };
  const loaded = new Set(), pending = new Map(), blobs = {};
  // Objects and arrays merge key by key into the light object (which has the same
  // shape with its long fields left out); null in a file means "nothing here".
  function merge(dst, src){
    for(const [k, v] of Object.entries(src)){
      const d = dst[k];
      if(v && typeof v === 'object' && d && typeof d === 'object') merge(d, v);
      else if(v !== null) dst[k] = v;
    }
  }
  function staleShell(){
    // the page is an older build than its content: load the page again, by a URL no cache holds
    let tried = false; try { tried = sessionStorage.getItem('playable.reloaded') === BUILD; sessionStorage.setItem('playable.reloaded', BUILD); } catch(e){}
    if(!tried) location.replace(location.pathname + '?b=' + Date.now() + location.hash);
  }
  function put(kind, id, data, build){
    if(build !== BUILD) return staleShell();
    if(kind === 'file') blobs[id] = data;
    else { const o = find[kind] && find[kind](id); if(o) merge(o, data); }
    loaded.add(kind + ':' + id);
  }
  // An id the build wrote no file for: an unknown entity, or one with nothing to load.
  // Files ("file") and code ("code") are named by the page itself, so they always exist.
  const noFile = (kind, id) => find[kind] ? !find[kind](id) || (NOFILE[kind] || []).includes(id) : false;
  // Resolves when the entity's long fields (or the code) are in place; at once when there is no file.
  function need(kind, id){
    const key = kind + ':' + id;
    if(noFile(kind, id) || loaded.has(key)) return Promise.resolve();
    if(pending.has(key)) return pending.get(key);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'content/' + kind + '/' + id + '.js?v=' + BUILD;
      s.onload = () => { pending.delete(key); s.remove(); loaded.has(key) ? resolve() : reject(new Error('content file did not register: ' + key)); };
      s.onerror = () => { pending.delete(key); s.remove(); reject(new Error('content file failed to load: ' + key)); };
      document.head.appendChild(s);
    });
    pending.set(key, p);
    return p;
  }
  const needAll = list => Promise.all(list.map(([kind, id]) => need(kind, id)));
  const has = (kind, id) => noFile(kind, id) || loaded.has(kind + ':' + id);
  // A whole file that is not one entity (the search index): same rules, its own name.
  const needFile = name => need('file', name).then(() => blobs[name]);
  const blob = name => blobs[name];
  return { need, needAll, needFile, blob, has, put, BUILD };
})();
