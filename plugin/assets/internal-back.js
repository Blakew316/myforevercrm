(function(){
  'use strict';
  var KEY='fagcrm:internal-back-stack:v1';
  function clean(raw){
    try{
      var u=new URL(raw,location.href);
      if(u.origin!==location.origin)return '';
      if(!u.searchParams.has('tab')&&!u.searchParams.has('company')&&!u.searchParams.has('preview'))return '';
      u.searchParams.delete('notice');
      u.hash='';
      return u.toString();
    }catch(e){return '';}
  }
  function current(){return clean(location.href);}
  function read(){try{var v=JSON.parse(sessionStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
  function write(v){try{sessionStorage.setItem(KEY,JSON.stringify(v.slice(-40)));}catch(e){}}
  function remember(){var c=current();if(!c)return;var a=read();if(a[a.length-1]!==c){a.push(c);write(a);}}
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    var dest=clean(a.href),c=current();if(!dest||!c||dest===c)return;remember();
  },true);
  document.addEventListener('submit',function(e){
    var f=e.target;if(!f||f.tagName!=='FORM')return;
    var method=(f.getAttribute('method')||'get').toLowerCase();
    if(method==='get')remember();
  },true);
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('[data-crm-page-back]').forEach(function(b){
      b.addEventListener('click',function(){
        var c=current(),a=read(),dest='';
        while(a.length){var candidate=clean(a.pop());if(candidate&&candidate!==c){dest=candidate;break;}}
        write(a);
        if(!dest)dest=clean(b.getAttribute('data-fallback')||'');
        if(dest)location.href=dest;
      });
    });
  });
})();
