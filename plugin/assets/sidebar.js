(function(){
  'use strict';
  var storageKey='foreverCrmSidebarHidden';
  function savedHidden(){try{return window.localStorage.getItem(storageKey)==='1';}catch(error){return false;}}
  function remember(hidden){try{window.localStorage.setItem(storageKey,hidden?'1':'0');}catch(error){}}
  function apply(app,button,hidden){
    app.classList.toggle('sidebar-hidden',hidden);
    button.setAttribute('aria-expanded',hidden?'false':'true');
    var label=button.querySelector('[data-sidebar-label]');if(label){label.textContent=hidden?'Show sidebar':'Hide sidebar';}
  }
  document.addEventListener('DOMContentLoaded',function(){
    var app=document.querySelector('[data-sidebar-app]');var button=document.querySelector('[data-sidebar-toggle]');if(!app||!button){return;}
    apply(app,button,savedHidden());
    button.addEventListener('click',function(){var hidden=!app.classList.contains('sidebar-hidden');apply(app,button,hidden);remember(hidden);});
  });
})();


// 1.79 global command search + quick launcher.
document.addEventListener('DOMContentLoaded',function(){
  var input=document.getElementById('crm-command-search');
  document.addEventListener('keydown',function(e){
    var tag=(document.activeElement&&document.activeElement.tagName||'').toLowerCase();
    if((e.key==='/' && !['input','textarea','select'].includes(tag)) || ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();if(input){input.focus();input.select();}}
    if(e.key==='Escape'){document.querySelectorAll('[data-quick-menu]').forEach(function(m){m.hidden=true;});}
  });
  document.querySelectorAll('[data-quick-toggle]').forEach(function(btn){btn.addEventListener('click',function(){var menu=btn.parentElement.querySelector('[data-quick-menu]');if(menu){menu.hidden=!menu.hidden;}});});
  document.addEventListener('click',function(e){document.querySelectorAll('.crm-command-wrap').forEach(function(w){if(!w.contains(e.target)){var m=w.querySelector('[data-quick-menu]');if(m)m.hidden=true;}});});
});
