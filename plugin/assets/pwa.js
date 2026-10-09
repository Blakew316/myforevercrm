(()=>{
  if(!('serviceWorker' in navigator))return;

  window.addEventListener('load',()=>{
    navigator.serviceWorker.register(new URL('/?fagcrm_sw=1',location.origin),{scope:'/'}).then(reg=>{
      const show=()=>{let b=document.querySelector('[data-pwa-update]');if(!b){b=document.createElement('button');b.type='button';b.className='pwa-update button primary';b.dataset.pwaUpdate='1';b.textContent='My Forever CRM updated · Refresh';b.onclick=()=>location.reload();document.body.appendChild(b);}};
      if(reg.waiting)show();
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)show();});});
    }).catch(()=>{});
  });

  let deferred=null;
  const KEY='fagcrm_pwa_installed_v1';
  const buttons=()=>Array.from(document.querySelectorAll('[data-fagcrm-install]'));
  const helps=()=>Array.from(document.querySelectorAll('[data-fagcrm-install-help]'));
  const statusNodes=()=>Array.from(document.querySelectorAll('[data-fagcrm-install-status]'));
  const titleNodes=()=>Array.from(document.querySelectorAll('[data-fagcrm-app-title]'));
  const messageNodes=()=>Array.from(document.querySelectorAll('[data-fagcrm-app-message]'));
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const isiOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isAndroid=()=>/Android/i.test(navigator.userAgent);
  const remembered=()=>{try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}};
  const remember=v=>{try{v?localStorage.setItem(KEY,'1'):localStorage.removeItem(KEY);}catch(e){}};
  const setText=(nodes,text)=>nodes.forEach(n=>{n.textContent=text;});

  const state=(kind)=>{
    document.documentElement.dataset.fagcrmAppState=kind;
    if(kind==='standalone'){
      remember(true);buttons().forEach(b=>b.hidden=true);helps().forEach(h=>h.hidden=true);
      setText(statusNodes(),'Installed · app window');setText(titleNodes(),'Installed on this device');setText(messageNodes(),'You are currently using My Forever CRM in its installed app window.');
      return;
    }
    if(kind==='available'){
      remember(false);buttons().forEach(b=>{b.hidden=false;b.dataset.installMode='prompt';b.textContent='Install My Forever CRM app';});
      helps().forEach(h=>{h.hidden=false;h.textContent='Install is available on this device.';});
      setText(statusNodes(),'Install available');setText(titleNodes(),'Install on this device');setText(messageNodes(),'This browser says My Forever CRM can be installed. Installation is optional and applies only to this device.');
      return;
    }
    if(kind==='ios'){
      buttons().forEach(b=>{b.hidden=false;b.dataset.installMode='ios';b.textContent='Add My Forever CRM to Home Screen';});
      helps().forEach(h=>{h.hidden=false;h.textContent='On iPhone or iPad: tap Share, then Add to Home Screen.';});
      setText(statusNodes(),'Home Screen available');setText(titleNodes(),'Add to Home Screen');setText(messageNodes(),'Safari uses Add to Home Screen instead of the desktop install prompt.');
      return;
    }
    if(kind==='remembered'){
      buttons().forEach(b=>b.hidden=true);helps().forEach(h=>h.hidden=true);
      setText(statusNodes(),'Installed / browser-managed');setText(titleNodes(),'App already installed on this device');setText(messageNodes(),'This browser previously confirmed installation. Open it from your browser Apps menu, Start menu, taskbar, dock, or home screen. If you uninstall it, the Install button will return when the browser makes installation available again.');
      return;
    }
    buttons().forEach(b=>b.hidden=true);helps().forEach(h=>h.hidden=true);
    setText(statusNodes(),'Browser-managed');setText(titleNodes(),'Use in browser');setText(messageNodes(),'No install prompt is available right now. You can keep using My Forever CRM normally in this browser. Open Installation help for browser-specific app management and reinstall steps.');
  };

  if(standalone())state('standalone');
  else if(isiOS())state('ios');
  else if(remembered())state('remembered');
  else state('browser');

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();deferred=e;document.documentElement.classList.add('fagcrm-installable');state('available');
  });

  window.addEventListener('appinstalled',()=>{
    deferred=null;remember(true);state(standalone()?'standalone':'remembered');
  });

  const modeQuery=window.matchMedia('(display-mode: standalone)');
  if(modeQuery&&modeQuery.addEventListener){modeQuery.addEventListener('change',()=>{if(standalone())state('standalone');});}

  document.addEventListener('click',async e=>{
    const help=e.target.closest('[data-fagcrm-install-help-button]');
    if(help){const d=document.querySelector('[data-fagcrm-install-instructions]');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'nearest'});}return;}
    const b=e.target.closest('[data-fagcrm-install]');if(!b)return;
    if(b.dataset.installMode==='ios'){alert('To install on iPhone or iPad: tap the Share button in Safari, then choose “Add to Home Screen.”');return;}
    if(!deferred){alert('The browser is not offering installation right now. Open My Account → App & Device for browser-specific install or reinstall steps.');return;}
    deferred.prompt();
    const choice=await deferred.userChoice.catch(()=>null);
    if(choice&&choice.outcome==='accepted'){remember(true);state('remembered');}
    else{state('browser');}
    deferred=null;
  });

  const ensureBanner=()=>{let b=document.querySelector('[data-network-banner]');if(!b){b=document.createElement('div');b.className='network-banner';b.dataset.networkBanner='1';b.setAttribute('role','status');document.body.appendChild(b);}return b;};
  const network=()=>{const offline=!navigator.onLine;document.documentElement.classList.toggle('fagcrm-offline',offline);const b=ensureBanner();b.textContent=offline?'Offline — private CRM changes are not queued. Reconnect to save field activity.':'Back online';b.classList.toggle('show',offline);if(!offline){b.classList.add('online');setTimeout(()=>{b.classList.remove('show','online')},2200);}};
  window.addEventListener('online',network);window.addEventListener('offline',network);network();
})();
