(() => {
  const box = document.getElementById('fag-chat');
  const status = document.getElementById('fag-chat-status');
  if (!box) return;
  let busy = false, last = '';
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    try {
      const response = await fetch(box.dataset.readUrl, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Access or connection changed. Reload to continue.');
      const result = await response.json();
      if (!result.success || !Array.isArray(result.data)) throw new Error('Unable to refresh messages.');
      const key = JSON.stringify(result.data);
      if (key !== last) {
        const fragment = document.createDocumentFragment();
        for (const message of result.data) {
          const article = document.createElement('article'); article.className = 'note';
          const name = document.createElement('strong'); name.textContent = message.name;
          const time = document.createElement('small'); time.textContent = message.when;
          const body = document.createElement('p'); body.textContent = message.body; body.style.whiteSpace = 'pre-wrap';
          article.append(name);
          const identity = document.createElement('span'); identity.className = 'gam-identity';
          const achievements = [message.identity?.rank, ...(Array.isArray(message.identity?.badges) ? message.identity.badges : [])].filter(Boolean);
          for (const item of achievements) {
            const emblem = document.createElement('span'); emblem.className = 'gam-emblem'; emblem.title = item.name || 'Achievement'; emblem.setAttribute('aria-label', emblem.title);
            if (item.image) { const img = document.createElement('img'); img.src = item.image; img.alt = emblem.title; img.loading = 'lazy'; emblem.append(img); }
            else { emblem.textContent = item.glyph || '⭐'; }
            identity.append(emblem);
          }
          article.append(identity, time, body); fragment.append(article);
        }
        const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
        box.replaceChildren(fragment); if (atBottom) box.scrollTop = box.scrollHeight;
        last = key;
      }
      status.textContent = 'Messages up to date · refreshes every 15 seconds.';
    } catch (error) { status.textContent = error.message; }
    finally { busy = false; }
  }
  box.scrollTop = box.scrollHeight;
  setInterval(refresh, 15000);

  const input = document.getElementById('fag-chat-message');
  const menu = document.getElementById('fag-mention-menu');
  const mentionIds = document.getElementById('fag-chat-mention-ids');
  const people = Array.isArray(window.fagCrmChatPeople) ? window.fagCrmChatPeople : [];
  if (!input || !menu || !people.length) return;
  function mentionQuery() {
    const pos = input.selectionStart || 0, before = input.value.slice(0, pos);
    const m = before.match(/(?:^|\s)@([^@\n]{0,50})$/); return m ? {query:m[1], start:pos-m[1].length-1, pos} : null;
  }
  function closeMenu(){ menu.hidden=true; menu.replaceChildren(); }
  function choose(person, state){
    const prefix=input.value.slice(0,state.start), suffix=input.value.slice(state.pos);
    input.value=prefix+'@'+person.name+' '+suffix; const caret=(prefix+'@'+person.name+' ').length;
    if (mentionIds) { const ids = new Set(mentionIds.value.split(',').filter(Boolean)); ids.add(String(person.id)); mentionIds.value = Array.from(ids).join(','); }
    input.focus(); input.setSelectionRange(caret,caret); closeMenu();
  }
  function updateMentions(){
    const state=mentionQuery(); if(!state){closeMenu();return;}
    const q=state.query.trim().toLowerCase(); const matches=people.filter(p=>!q||p.name.toLowerCase().includes(q)).slice(0,8);
    menu.replaceChildren(); if(!matches.length){closeMenu();return;} menu.hidden=false;
    matches.forEach(person=>{ const b=document.createElement('button'); b.type='button'; b.className='mention-option'; b.textContent='@'+person.name; b.addEventListener('mousedown',e=>{e.preventDefault();choose(person,state);}); menu.appendChild(b); });
  }
  input.addEventListener('input',updateMentions); input.addEventListener('keyup',updateMentions); input.addEventListener('blur',()=>setTimeout(closeMenu,120));
})();
