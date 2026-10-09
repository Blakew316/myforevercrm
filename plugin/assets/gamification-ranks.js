(() => {
  const body = document.getElementById('gam-rank-rows');
  const status = document.getElementById('gam-rank-order-status');
  function reorder() {
    if (!body) return;
    const rows = [...body.querySelectorAll('[data-rank-row]')];
    const score = row => Number(row.querySelector('.gam-rank-points')?.value || 0);
    rows.sort((a,b) => score(a)-score(b));
    const focused = document.activeElement;
    rows.forEach((row,i) => { if(body.children[i] !== row) body.insertBefore(row,body.children[i] || null); });
    if (focused?.classList?.contains('gam-rank-points') && document.activeElement !== focused) focused.focus({preventScroll:true});
    const seen = new Set(); let duplicate = false;
    rows.forEach(row => { const points=score(row); if(seen.has(points)) duplicate=true; seen.add(points); row.classList.toggle('gam-rank-equal',rows.some(other=>other!==row&&score(other)===points)); });
    if(status) status.textContent = duplicate ? 'Ranks are sorted by points. Two or more ranks have the same threshold; use different thresholds for a clear progression.' : 'Ranks are sorted by lifetime points. Save ranks & levels to apply changes.';
  }
  if(body){body.addEventListener('change',event => { if(event.target.matches('.gam-rank-points')) reorder(); });}

  const config=window.FAGGamBadgeUpload||{};
  const modal=document.getElementById('gam-crop-modal');
  const canvas=document.getElementById('gam-crop-canvas');
  const zoomInput=document.getElementById('gam-crop-zoom');
  const cropStatus=modal?.querySelector('.gam-crop-status');
  const cropCtx=canvas?.getContext('2d');
  let activePicker=null,sourceImage=null,sourceUrl='',zoom=1,offsetX=0,offsetY=0,dragging=false,lastX=0,lastY=0;

  const previewFor=picker=>picker?.querySelector('.gam-custom-image-preview');
  const imageFieldFor=picker=>picker?.querySelector('.gam-image-id');
  function setPreview(picker,url,id){
    const preview=previewFor(picker),field=imageFieldFor(picker),remove=picker?.querySelector('.gam-remove-image');
    if(field)field.value=id||0;
    if(preview){preview.classList.toggle('has-image',!!url);preview.innerHTML=url?`<img src="${String(url).replace(/"/g,'&quot;')}" alt="Custom badge preview">`:'<span>Custom<br>image</span>';}
    if(remove)remove.hidden=!url;
  }
  function drawCrop(){
    if(!cropCtx||!canvas||!sourceImage)return;
    cropCtx.clearRect(0,0,canvas.width,canvas.height);cropCtx.imageSmoothingEnabled=true;cropCtx.imageSmoothingQuality='high';
    const base=Math.max(canvas.width/sourceImage.naturalWidth,canvas.height/sourceImage.naturalHeight);const scale=base*zoom;
    const w=sourceImage.naturalWidth*scale,h=sourceImage.naturalHeight*scale;
    const maxX=Math.max(0,(w-canvas.width)/2),maxY=Math.max(0,(h-canvas.height)/2);offsetX=Math.max(-maxX,Math.min(maxX,offsetX));offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
    cropCtx.drawImage(sourceImage,(canvas.width-w)/2+offsetX,(canvas.height-h)/2+offsetY,w,h);
  }
  function closeCrop(){if(modal)modal.hidden=true;if(sourceUrl){URL.revokeObjectURL(sourceUrl);sourceUrl='';}sourceImage=null;activePicker=null;if(cropStatus)cropStatus.textContent='';}
  function openCrop(file,picker){
    if(!modal||!canvas){window.alert('The crop tool could not open. Refresh the page and try again.');return;}
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){window.alert('Choose a PNG, JPG or WebP image.');return;}
    if(file.size>5*1024*1024){window.alert('Choose an image 5 MB or smaller.');return;}
    activePicker=picker;sourceUrl=URL.createObjectURL(file);sourceImage=new Image();sourceImage.onload=()=>{zoom=1;offsetX=0;offsetY=0;if(zoomInput)zoomInput.value='1';drawCrop();modal.hidden=false;};sourceImage.onerror=()=>{window.alert('That image could not be opened.');closeCrop();};sourceImage.src=sourceUrl;
  }
  async function uploadCrop(){
    if(!canvas||!activePicker||!config.ajaxUrl||!config.nonce){window.alert('Badge upload is not available. Refresh the page and try again.');return;}
    const save=modal.querySelector('.gam-crop-save');if(save)save.disabled=true;if(cropStatus)cropStatus.textContent='Uploading cropped badge…';
    try{
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png',0.92));if(!blob)throw new Error('Could not create cropped image.');
      const fd=new FormData();fd.append('action','fagcrm_gamification_badge_image');fd.append('nonce',config.nonce);fd.append('company',config.company);fd.append('file',blob,'badge-'+Date.now()+'.png');
      const res=await fetch(config.ajaxUrl,{method:'POST',body:fd,credentials:'same-origin'});const j=await res.json();if(!j?.success||!j?.data?.id)throw new Error(j?.data?.message||'Upload failed.');
      setPreview(activePicker,j.data.url,j.data.id);closeCrop();
    }catch(err){if(cropStatus)cropStatus.textContent=err.message||'Upload failed.';}finally{if(save)save.disabled=false;}
  }

  document.addEventListener('click', event => {
    const destructive=event.target.closest?.('[data-confirm]');
    if(destructive && !window.confirm(destructive.getAttribute('data-confirm')||'Delete this item?')){event.preventDefault();return;}
    const cancelCreate=event.target.closest?.('.gam-cancel-create');
    if(cancelCreate){const details=cancelCreate.closest('details');if(details)details.open=false;return;}
    const upload = event.target.closest?.('.gam-upload-crop');
    if(upload){const picker=upload.closest('.gam-emblem-picker');picker?.querySelector('.gam-file-input')?.click();return;}
    const remove=event.target.closest?.('.gam-remove-image');
    if(remove){setPreview(remove.closest('.gam-emblem-picker'),'',0);return;}
    const button = event.target.closest?.('.gam-pick-image');
    if (button) {
      const picker=button.closest('.gam-emblem-picker');const field=imageFieldFor(picker);if(!field)return;
      if (!window.wp?.media) { picker?.querySelector('.gam-file-input')?.click(); return; }
      const frame=window.wp.media({title:'Choose rank or badge image',button:{text:'Use this image'},library:{type:'image'},multiple:false});
      frame.on('select', () => { const selected=frame.state().get('selection').first(); if(selected){const id=selected.get('id'),url=selected.get('sizes')?.thumbnail?.url||selected.get('url');setPreview(picker,url,id);} });frame.open();return;
    }
    if(event.target.closest?.('.gam-crop-close,.gam-crop-cancel')){closeCrop();return;}
    if(event.target.closest?.('.gam-crop-save')){uploadCrop();}
  });
  document.addEventListener('change',event=>{const input=event.target.closest?.('.gam-file-input');if(input?.files?.[0]){openCrop(input.files[0],input.closest('.gam-emblem-picker'));input.value='';}});
  if(zoomInput)zoomInput.addEventListener('input',()=>{zoom=Number(zoomInput.value)||1;drawCrop();});
  if(canvas){
    const point=e=>{const r=canvas.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*(canvas.width/r.width),y:(p.clientY-r.top)*(canvas.height/r.height)}};
    const start=e=>{if(!sourceImage)return;dragging=true;const p=point(e);lastX=p.x;lastY=p.y;canvas.setPointerCapture?.(e.pointerId);e.preventDefault();};
    const move=e=>{if(!dragging||!sourceImage)return;const p=point(e);offsetX+=p.x-lastX;offsetY+=p.y-lastY;lastX=p.x;lastY=p.y;drawCrop();e.preventDefault();};
    const end=()=>{dragging=false;};canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  }

  const catalogNode=document.getElementById('gam-emblem-catalog');
  let catalog={};try {catalog=JSON.parse(catalogNode?.textContent||'{}');}catch(e){}
  const items=Object.entries(catalog);
  document.querySelectorAll('.gam-emblem-picker').forEach(picker=>{
    const category=picker.querySelector('.gam-emblem-category'),select=picker.querySelector('.gam-emblem-select'),search=picker.querySelector('.gam-emblem-search'),preview=picker.querySelector('.gam-emblem-preview'),currentName=picker.querySelector('.gam-emblem-current-name'),count=picker.querySelector('.gam-emblem-count');
    if(!category||!select||!search||!items.length)return;const initial=select.value;
    const refresh=()=>{const previous=select.value,query=search.value.trim().toLowerCase(),matching=items.filter(([id,row])=>(query?(row.label+' '+row.category+' '+row.glyph).toLowerCase().includes(query):row.category===category.value));select.replaceChildren();matching.forEach(([id,row])=>{const option=document.createElement('option');option.value=id;option.textContent=row.glyph+' · '+row.label;select.appendChild(option);});const chosen=matching.some(([id])=>id===previous)?previous:(matching.some(([id])=>id===initial)?initial:matching[0]?.[0]);if(chosen)select.value=chosen;select.disabled=!matching.length;if(preview)preview.textContent=catalog[select.value]?.glyph||'☆';if(currentName)currentName.textContent=catalog[select.value]?.label||'Emblem';if(count)count.textContent=matching.length+' choices';};
    category.addEventListener('change',()=>{search.value='';refresh();});search.addEventListener('input',refresh);select.addEventListener('change',()=>{if(preview)preview.textContent=catalog[select.value]?.glyph||'☆';if(currentName)currentName.textContent=catalog[select.value]?.label||'Emblem';});refresh();
  });
  reorder();
})();
