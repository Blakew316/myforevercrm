(function(){
  'use strict';
  var popupName='fagcrm_oauth_connection';
  function features(){var w=760,h=820,left=Math.max(0,Math.round((screen.width-w)/2)),top=Math.max(0,Math.round((screen.height-h)/2));return 'popup=yes,width='+w+',height='+h+',left='+left+',top='+top+',resizable=yes,scrollbars=yes';}
  function openPopup(url){var win=window.open(url||'about:blank',popupName,features());if(win){try{win.focus();}catch(e){}}return win;}
  function oauthHref(a){if(!a||!a.href||a.getAttribute('data-fagcrm-oauth')!=='1')return false;try{var u=new URL(a.href,location.href);return u.origin===location.origin&&u.pathname.indexOf('admin-post.php')>=0;}catch(e){return false;}}
  document.addEventListener('click',function(e){var a=e.target.closest('a');if(!oauthHref(a))return;if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();var win=openPopup(a.href);if(!win){window.location.href=a.href;}},true);
  document.addEventListener('submit',function(e){var f=e.target;if(!f||f.tagName!=='FORM')return;var op=f.querySelector('input[name="op"]');var val=op?op.value:'';if(val!=='start_integration_oauth'&&val!=='ringcentral_connect')return;var win=openPopup('about:blank');if(!win)return;f.target=popupName;},true);
  window.addEventListener('message',function(e){if(e.origin!==location.origin||!e.data||e.data.type!=='fagcrm-oauth-complete')return;if(e.data.success){window.setTimeout(function(){window.location.reload();},250);}},false);
})();
