(function(){
  'use strict';
  function q(s,r){return (r||document).querySelector(s)} function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  document.addEventListener('DOMContentLoaded',function(){
    if(q('[data-call-session]')) document.body.classList.add('crm-call-session-active');
    // Favorites are built only from links already rendered for this user, so they can never expose a hidden permission destination.
    var nav=q('#forever-crm-sidebar nav')||q('aside nav'); if(nav){
      var key='fagcrm_nav_favorites_'+(location.pathname||'crm');var ids=[];try{ids=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(ids))ids=[];}catch(e){ids=[];}
      var links=qa('a[href]',nav).filter(function(a){return !a.closest('.crm-favorites-group')&&!/logout/i.test(a.textContent||'');});
      function idFor(a){return btoa(unescape(encodeURIComponent(a.getAttribute('href')||''))).replace(/=+$/,'').slice(-48);} 
      function save(){try{localStorage.setItem(key,JSON.stringify(ids));}catch(e){}}
      function render(){var old=q('.crm-favorites-group',nav);if(old)old.remove();if(!ids.length)return;var box=document.createElement('div');box.className='crm-favorites-group';box.innerHTML='<strong>★ Favorites</strong>';ids.forEach(function(id){var src=links.find(function(a){return idFor(a)===id;});if(!src)return;var a=document.createElement('a');a.href=src.href;a.textContent=(src.textContent||'').replace(/[★☆]/g,'').trim();box.appendChild(a);});nav.insertBefore(box,nav.firstChild);}
      links.forEach(function(a){var id=idFor(a),b=document.createElement('button');b.type='button';b.className='crm-nav-pin'+(ids.indexOf(id)>=0?' is-pinned':'');b.title='Pin to Favorites';b.setAttribute('aria-label','Pin '+(a.textContent||'page')+' to Favorites');b.textContent=ids.indexOf(id)>=0?'★':'☆';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var i=ids.indexOf(id);if(i>=0)ids.splice(i,1);else ids.push(id);save();b.classList.toggle('is-pinned',ids.indexOf(id)>=0);b.textContent=ids.indexOf(id)>=0?'★':'☆';render();});a.appendChild(b);});render();
    }
    // Normalize readable status chips in tables/cards without changing underlying values.
    qa('.badge').forEach(function(el){var t=(el.textContent||'').trim().toLowerCase();var tone=/won|paid|complete|active|qualified|appointment/.test(t)?'success':/overdue|dnc|do not call|failed|lost|cancel|wrong/.test(t)?'danger':/callback|pending|waiting|retry|hold/.test(t)?'warning':/new|scheduled|sent|open/.test(t)?'info':'neutral';el.classList.add('crm-status-auto');el.dataset.tone=tone;});
  });
})();
