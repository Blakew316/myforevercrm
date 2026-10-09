(function(){
  'use strict';
  var KEY='fagcrm:return-position:v1';
  function pageKey(){return location.pathname+'?'+new URLSearchParams(location.search).toString();}
  function save(form){
    try{
      var action=(form.getAttribute('action')||'');
      if(action.indexOf('admin-post.php')===-1)return;
      var op=form.querySelector('input[name="op"]');
      if(!op)return;
      sessionStorage.setItem(KEY,JSON.stringify({path:location.pathname,company:(new URLSearchParams(location.search)).get('company')||'',tab:(new URLSearchParams(location.search)).get('tab')||'',y:window.scrollY||0,at:Date.now()}));
    }catch(e){}
  }
  document.addEventListener('submit',function(e){if(e.target&&e.target.tagName==='FORM')save(e.target);},true);
  window.addEventListener('DOMContentLoaded',function(){
    try{
      var raw=sessionStorage.getItem(KEY);if(!raw)return;var s=JSON.parse(raw);if(!s||Date.now()-s.at>120000){sessionStorage.removeItem(KEY);return;}
      var q=new URLSearchParams(location.search),company=q.get('company')||'',tab=q.get('tab')||'';
      if(s.path===location.pathname&&s.company===company&&s.tab===tab){sessionStorage.removeItem(KEY);requestAnimationFrame(function(){window.scrollTo({top:Math.max(0,Number(s.y)||0),left:0,behavior:'auto'});});}
    }catch(e){}
  });
})();
