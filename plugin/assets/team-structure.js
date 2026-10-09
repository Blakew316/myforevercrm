(() => {
  const app = document.querySelector("[data-team-structure]");
  if (!app) return;

  const viewport = app.querySelector("[data-tree-viewport]");
  const frame = app.querySelector("[data-tree-frame]");
  const stage = app.querySelector("[data-tree-stage]");
  const form = app.querySelector("[data-team-structure-form]");
  const save = app.querySelector("[data-structure-save]");
  const status = app.querySelector("[data-structure-status]");
  const zoomLabel = app.querySelector("[data-tree-zoom-label]");
  let canvasZoomRange = null;
  const treeView = app.querySelector("[data-structure-tree]");
  const listView = app.querySelector("[data-structure-list]");
  const treeControls = app.querySelector("[data-tree-controls]");
  if (!viewport || !frame || !stage) return;

  let scale = 1;
  let dirty = false;
  let dragged = null;
  let panning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panScrollLeft = 0;
  let panScrollTop = 0;
  const clamp = value => Math.max(0.35, Math.min(1.65, value));
  const CANVAS_MARGIN = 900;

  // Freeform organization connectors. The old tree used CSS borders, which do not
  // follow cards after a user moves them. SVG connectors are recalculated from the
  // live card positions so lines stretch, shorten and reroute automatically.
  const SVG_NS = "http://www.w3.org/2000/svg";
  let connectorSvg = null;
  let linkDrag = null;
  function ensureConnectorLayer() {
    if (connectorSvg) return connectorSvg;
    connectorSvg = document.createElementNS(SVG_NS, "svg");
    connectorSvg.setAttribute("class", "structure-connector-layer");
    connectorSvg.setAttribute("aria-hidden", "true");
    connectorSvg.setAttribute("focusable", "false");
    stage.insertBefore(connectorSvg, stage.firstChild);
    app.classList.add("has-svg-connectors");
    return connectorSvg;
  }
  function itemCard(item) {
    return item ? Array.from(item.children).find(child => child.matches && child.matches(".structure-node")) : null;
  }
  function pointOn(card, edge) {
    const r = card.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - sr.left) / Math.max(scale, 0.01),
      y: ((edge === "top" ? r.top : r.bottom) - sr.top) / Math.max(scale, 0.01)
    };
  }
  function connectorPath(from, to) {
    const spread = Math.max(38, Math.min(140, Math.abs(to.y - from.y) * 0.48));
    const c1y = from.y + (to.y >= from.y ? spread : -spread);
    const c2y = to.y - (to.y >= from.y ? spread : -spread);
    return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${from.x.toFixed(1)} ${c1y.toFixed(1)}, ${to.x.toFixed(1)} ${c2y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }
  function drawConnectors(pointer = null) {
    const svg = ensureConnectorLayer();
    const width = Math.max(stage.scrollWidth, 2200);
    const height = Math.max(stage.scrollHeight, 1100);
    svg.setAttribute("width", width); svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.replaceChildren();
    app.querySelectorAll('[data-structure-item]').forEach(parent => {
      const parentCard = itemCard(parent);
      const list = directList(parent);
      if (!parentCard || !list || list.hidden || !parentCard.getClientRects().length) return;
      Array.from(list.children).forEach(child => {
        if (!child.matches('[data-structure-item]')) return;
        const childCard = itemCard(child); if (!childCard || !childCard.getClientRects().length) return;
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", connectorPath(pointOn(parentCard, "bottom"), pointOn(childCard, "top")));
        path.setAttribute("class", "structure-connector");
        svg.appendChild(path);
      });
    });
    // A branch may have a primary manager even when that manager sits elsewhere in
    // the company tree. Draw that oversight relationship separately.
    const primaryManagers = Object.assign({}, (window.fagCrmGroupManagers && typeof window.fagCrmGroupManagers === 'object') ? window.fagCrmGroupManagers : {});
    app.querySelectorAll('[data-group-manager-select]').forEach(select => { primaryManagers[select.dataset.groupManagerSelect] = select.value; });
    Object.entries(primaryManagers).forEach(([groupId,managerId]) => {
      managerId = String(managerId || '0'); if (managerId === '0') return;
      const groupItem = Array.from(app.querySelectorAll('[data-structure-item="group"]')).find(item => item.dataset.itemId === String(groupId));
      const managerItem = branchForManager(managerId);
      const groupCard = itemCard(groupItem), managerCard = itemCard(managerItem);
      if (!groupCard || !managerCard || !groupCard.getClientRects().length || !managerCard.getClientRects().length) return;
      if(groupItem.parentElement&&managerItem&&groupItem.parentElement.closest('[data-structure-item="user"]')===managerItem)return;
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", connectorPath(pointOn(managerCard,"bottom"),pointOn(groupCard,"top")));
      path.setAttribute("class", "structure-connector structure-connector-manager");
      svg.appendChild(path);
    });
    if (linkDrag && pointer) {
      const sourceCard = itemCard(linkDrag.item);
      if (sourceCard) {
        const sr = stage.getBoundingClientRect();
        const to = {x:(pointer.clientX-sr.left)/Math.max(scale,0.01), y:(pointer.clientY-sr.top)/Math.max(scale,0.01)};
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", connectorPath(pointOn(sourceCard,"bottom"),to));
        path.setAttribute("class", "structure-connector structure-connector-preview");
        svg.appendChild(path);
      }
    }
  }

  function setView(view) {
    const showList = view === "list";
    if (treeView) treeView.hidden = showList;
    if (listView) listView.hidden = !showList;
    if (treeControls) treeControls.hidden = showList;
    app.querySelectorAll("[data-structure-view]").forEach(button => {
      const active = button.dataset.structureView === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try { localStorage.setItem("fagcrm-team-structure-view", view); } catch (e) {}
    if (!showList) requestAnimationFrame(() => { if(typeof migrateToFreeform === 'function') migrateToFreeform(); measure(); centerTree(); });
  }

  app.querySelectorAll("[data-structure-view]").forEach(button => {
    button.addEventListener("click", () => setView(button.dataset.structureView || "tree"));
  });

  const savedView = (() => { try { return localStorage.getItem("fagcrm-team-structure-view"); } catch (e) { return null; } })();
  setView(savedView === "tree" ? "tree" : "list");

  function updateZoomUi() {
    const pct = Math.round(scale * 100);
    app.querySelectorAll("[data-tree-zoom-label]").forEach(label => { label.textContent = `${pct}%`; });
    if (canvasZoomRange) canvasZoomRange.value = String(pct);
  }

  function measure() {
    stage.style.transform = `scale(${scale})`;
    const width = stage.scrollWidth;
    const height = stage.scrollHeight;
    frame.style.width = `${Math.max(viewport.clientWidth - 24, Math.ceil(width * scale))}px`;
    frame.style.height = `${Math.max(360, Math.ceil(height * scale))}px`;
    updateZoomUi();
    requestAnimationFrame(() => drawConnectors());
  }

  function setScale(next, center = true) {
    const old = scale;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    scale = clamp(next);
    measure();
    if (center && old) {
      viewport.scrollLeft = centerX * (scale / old) - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * (scale / old) - viewport.clientHeight / 2;
    }
  }

  function centerTree() {
    measure();
    const cards=Array.from(app.querySelectorAll('.structure-node')).filter(card=>card.getClientRects().length);
    if(!cards.length){viewport.scrollLeft=Math.max(0,(frame.scrollWidth-viewport.clientWidth)/2);viewport.scrollTop=0;return;}
    const vr=viewport.getBoundingClientRect();let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    cards.forEach(card=>{const r=card.getBoundingClientRect();minX=Math.min(minX,r.left-vr.left+viewport.scrollLeft);maxX=Math.max(maxX,r.right-vr.left+viewport.scrollLeft);minY=Math.min(minY,r.top-vr.top+viewport.scrollTop);maxY=Math.max(maxY,r.bottom-vr.top+viewport.scrollTop);});
    viewport.scrollLeft=Math.max(0,(minX+maxX)/2-viewport.clientWidth/2);
    viewport.scrollTop=Math.max(0,(minY+maxY)/2-viewport.clientHeight/2);
  }

  function fitTree() {
    stage.style.transform = "none";
    const available = Math.max(280, viewport.clientWidth - 36);
    scale = clamp(Math.min(1, available / Math.max(stage.scrollWidth, 1)));
    measure();
    viewport.scrollLeft = Math.max(0, (frame.scrollWidth - viewport.clientWidth) / 2);
    viewport.scrollTop = 0;
  }

  function markDirty(message = "Unsaved structure changes.") {
    if (!form) return;
    dirty = true;
    if (save) save.disabled = false;
    if (status) {
      status.textContent = message;
      status.classList.add("is-dirty");
    }
  }


  // 3.1.82 true freeform canvas. The previous layout stored relative CSS
  // transforms inside a nested tree, so moving a manager/branch could also shift
  // descendants and the usable canvas still behaved like a fixed org chart. We
  // now migrate the rendered tree into absolute stage coordinates. Every card is
  // independently positioned; SVG lines are redrawn from the live card geometry.
  const layoutInput = form ? form.querySelector('[data-layout-json]') : null;
  let layout = (window.fagCrmTeamLayout && typeof window.fagCrmTeamLayout === 'object') ? window.fagCrmTeamLayout : {};
  function layoutKey(card) {
    const item = card.closest('[data-structure-item]');
    if (!item) return '';
    const kind = item.dataset.structureItem;
    if (kind === 'workspace' || kind === 'owner') return kind;
    return `${kind}:${item.dataset.itemId || '0'}`;
  }
  function normalizeLayout(value) {
    value = value && typeof value === 'object' ? value : {};
    const rawW = Number(value.w || 0);
    return {x:Number(value.x || 0), y:Number(value.y || 0), w:rawW ? Math.max(170,Math.min(520,rawW)) : 0, absolute:Number(value.absolute || 0) ? 1 : 0};
  }
  function applyCardLayout(card) {
    const key=layoutKey(card); if(!key) return;
    const pos=normalizeLayout(layout[key]);
    if(app.classList.contains('is-freeform-canvas')){
      card.style.left=`${pos.x}px`; card.style.top=`${pos.y}px`; card.style.transform='none';
    } else {
      card.style.setProperty('--custom-x',`${pos.x}px`); card.style.setProperty('--custom-y',`${pos.y}px`);
    }
    if(pos.w) card.style.width=`${pos.w}px`; else card.style.removeProperty('width');
    card.classList.toggle('has-custom-layout',!!(pos.x||pos.y||pos.w));
  }
  function updateCanvasBounds(){
    if(!app.classList.contains('is-freeform-canvas')) return;
    let maxX=CANVAS_MARGIN*2+1500,maxY=CANVAS_MARGIN+1100;
    app.querySelectorAll('.structure-node').forEach(card=>{
      const pos=normalizeLayout(layout[layoutKey(card)]);maxX=Math.max(maxX,pos.x+card.offsetWidth+CANVAS_MARGIN);maxY=Math.max(maxY,pos.y+card.offsetHeight+CANVAS_MARGIN);
    });
    stage.style.width=`${maxX}px`;stage.style.height=`${maxY}px`;stage.style.minWidth=`${maxX}px`;stage.style.minHeight=`${maxY}px`;
  }
  function ensureCanvasBreathingRoom(){
    const cards=Array.from(app.querySelectorAll('.structure-node'));if(!cards.length)return;let minX=Infinity,minY=Infinity;
    cards.forEach(card=>{const p=normalizeLayout(layout[layoutKey(card)]);minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);});
    const dx=minX<CANVAS_MARGIN?CANVAS_MARGIN-minX:0,dy=minY<220?220-minY:0;if(!dx&&!dy)return;
    cards.forEach(card=>{const key=layoutKey(card),p=normalizeLayout(layout[key]);layout[key]={...p,x:Math.round(p.x+dx),y:Math.round(p.y+dy),absolute:1};applyCardLayout(card);});
  }
  function syncLayout(mark=false) {
    if(layoutInput) layoutInput.value=JSON.stringify(layout);
    app.querySelectorAll('.structure-node').forEach(applyCardLayout);updateCanvasBounds();measure();requestAnimationFrame(()=>drawConnectors());
    if(mark) markDirty('Canvas layout changed. Save Team Structure to keep these positions.');
  }
  function migrateToFreeform(){
    if(app.classList.contains('is-freeform-canvas')) return;
    // Capture exactly what the user currently sees, including any 3.1.81 legacy
    // transforms, then flatten the nested visual tree without changing hierarchy.
    const sr=stage.getBoundingClientRect();const captured=[];
    app.querySelectorAll('.structure-node').forEach(card=>{const r=card.getBoundingClientRect();captured.push([card,(r.left-sr.left)/Math.max(scale,.01),(r.top-sr.top)/Math.max(scale,.01),r.width/Math.max(scale,.01)]);});
    app.classList.add('is-freeform-canvas');
    captured.forEach(([card,x,y,w])=>{const key=layoutKey(card);const old=normalizeLayout(layout[key]);if(!old.absolute){layout[key]={x:Math.round(x),y:Math.round(y),w:old.w||Math.round(w),absolute:1};}else{layout[key]=old;}applyCardLayout(card);});
    ensureCanvasBreathingRoom();
    // A branch assigned to a manager is presented as that manager's child. The
    // underlying branch record is preserved; this is the intuitive visual hierarchy.
    const managerMap=(window.fagCrmGroupManagers&&typeof window.fagCrmGroupManagers==='object')?window.fagCrmGroupManagers:{};
    Object.entries(managerMap).forEach(([gid,uid])=>{const group=branchForGroup(String(gid)),manager=branchForManager(String(uid));if(group&&manager&&group!==manager&&!group.contains(manager)){ensureList(manager,`manager-${uid}`).appendChild(group);}});
    syncLayout(false);
  }
  // Initialize from the ordinary hierarchy once, then the hierarchy becomes a
  // true freeform canvas like a visual org-chart editor.
  app.querySelectorAll('.structure-node').forEach(applyCardLayout);
  requestAnimationFrame(()=>{if(!treeView || !treeView.hidden){migrateToFreeform();requestAnimationFrame(()=>drawConnectors());}});

  if(form && treeControls){
    const hint=document.createElement('span');hint.className='structure-freeform-hint';hint.textContent='Drag ✥ to move · drag ● to reconnect';treeControls.insertBefore(hint,treeControls.firstChild);
    app.querySelectorAll('.structure-node').forEach(card=>{
      const tools=document.createElement('span');tools.className='structure-layout-tools';
      const move=document.createElement('button');move.type='button';move.className='structure-layout-move';move.textContent='✥';move.title='Move this card anywhere';move.setAttribute('aria-label','Move card');
      const smaller=document.createElement('button');smaller.type='button';smaller.textContent='−';smaller.title='Make card narrower';
      const larger=document.createElement('button');larger.type='button';larger.textContent='+';larger.title='Make card wider';
      const reset=document.createElement('button');reset.type='button';reset.textContent='↺';reset.title='Reset the entire canvas to automatic layout';
      tools.append(move,smaller,larger,reset);card.appendChild(tools);
      const key=layoutKey(card);if(!key)return;
      const resizeBy=delta=>{const cur=normalizeLayout(layout[key]);const base=cur.w||Math.round(card.getBoundingClientRect().width/Math.max(scale,.01));cur.w=Math.max(170,Math.min(520,base+delta));cur.absolute=1;layout[key]=cur;syncLayout(true);};
      smaller.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();resizeBy(-30);});
      larger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();resizeBy(30);});
      reset.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();delete layout[key];app.classList.remove('is-freeform-canvas');stage.style.width='';stage.style.height='';stage.style.minWidth='';stage.style.minHeight='';app.querySelectorAll('.structure-node').forEach(c=>{c.style.left='';c.style.top='';c.style.width='';c.style.transform='';c.classList.remove('has-custom-layout');});requestAnimationFrame(()=>{migrateToFreeform();syncLayout(true);});});
      move.addEventListener('pointerdown',e=>{
        e.preventDefault();e.stopPropagation();const cur=normalizeLayout(layout[key]);const startX=e.clientX,startY=e.clientY;card.classList.add('is-freeform-moving');
        const onMove=ev=>{layout[key]={...cur,x:Math.round(cur.x+(ev.clientX-startX)/Math.max(scale,.01)),y:Math.round(cur.y+(ev.clientY-startY)/Math.max(scale,.01)),absolute:1};applyCardLayout(card);updateCanvasBounds();drawConnectors();};
        const onUp=()=>{card.classList.remove('is-freeform-moving');document.removeEventListener('pointermove',onMove);document.removeEventListener('pointerup',onUp);syncLayout(true);};
        document.addEventListener('pointermove',onMove);document.addEventListener('pointerup',onUp,{once:true});
      });
    });
  }

  function directList(branch) {
    return Array.from(branch.children).find(child => child.matches("ul[data-branch-list]"));
  }

  function ensureList(branch, id) {
    let list = directList(branch);
    if (!list) {
      list = document.createElement("ul");
      list.dataset.branchList = String(id);
      branch.appendChild(list);
    }
    list.hidden = false;
    return list;
  }

  function branchForGroup(id) {
    return id === "0"
      ? app.querySelector("[data-owner-branch]")
      : Array.from(app.querySelectorAll('[data-structure-item="group"]')).find(item => item.dataset.itemId === id);
  }

  function branchForManager(id) {
    return Array.from(app.querySelectorAll('[data-structure-item="user"]')).find(item => item.dataset.itemId === String(id));
  }

  function hasOption(select, value) {
    return !!select && Array.from(select.options).some(option => option.value === String(value) && !option.disabled);
  }

  function setManager(item, managerId) {
    const select = item.querySelector('[data-manager-select="user"]');
    if (!select || !hasOption(select, managerId)) return managerId === "0" || managerId === 0;
    select.value = String(managerId);
    select.dataset.previousValue = select.value;
    return true;
  }

  function connectToGroup(item, targetId, clearManager = true) {
    const kind = item.dataset.structureItem;
    const select = item.querySelector(`[data-structure-select="${kind}"]`);
    const target = branchForGroup(String(targetId));
    if (!select || !target || !hasOption(select, targetId)) return false;
    if (kind === "group" && item.contains(target)) return false;

    select.value = String(targetId);
    select.dataset.previousValue = select.value;
    if (kind === "user" && clearManager) setManager(item, 0);
    ensureList(target, targetId).appendChild(item);
    markDirty(kind === "group" ? "Group connection changed. Review and save." : "Team member branch changed. Review and save.");
    measure();
    requestAnimationFrame(() => drawConnectors());
    return true;
  }

  function connectGroupToManager(item, managerCard) {
    if (!item || item.dataset.structureItem !== "group" || !managerCard) return false;
    const managerId = managerCard.dataset.managerId, targetGroup=managerCard.dataset.groupId||"0";
    const managerSelect = item.querySelector('[data-group-manager-select]');
    const parentSelect = item.querySelector('[data-structure-select="group"]');
    const managerBranch=managerCard.closest('[data-structure-item="user"]');
    if (!managerSelect || !parentSelect || !managerBranch || !managerId || managerId === "0" || !hasOption(managerSelect, managerId) || !hasOption(parentSelect,targetGroup) || item.contains(managerBranch)) return false;
    managerSelect.value=String(managerId);managerSelect.dataset.previousValue=managerSelect.value;
    parentSelect.value=String(targetGroup);parentSelect.dataset.previousValue=parentSelect.value;
    ensureList(managerBranch,`manager-${managerId}`).appendChild(item);
    markDirty("Branch connected beneath this manager. Review and save.");measure();requestAnimationFrame(()=>drawConnectors());return true;
  }

  function connectToManager(item, managerCard) {
    if (item.dataset.structureItem !== "user" || !managerCard) return false;
    const managerId = managerCard.dataset.managerId;
    const targetGroup = managerCard.dataset.groupId || "0";
    const managerBranch = managerCard.closest('[data-structure-item="user"]');
    if (!managerId || managerId === "0" || !managerBranch || item === managerBranch || item.contains(managerBranch)) return false;

    const groupSelect = item.querySelector('[data-structure-select="user"]');
    const managerSelect = item.querySelector('[data-manager-select="user"]');
    if (!hasOption(groupSelect, targetGroup) || !hasOption(managerSelect, managerId)) return false;

    groupSelect.value = String(targetGroup);
    groupSelect.dataset.previousValue = groupSelect.value;
    managerSelect.value = String(managerId);
    managerSelect.dataset.previousValue = managerSelect.value;
    ensureList(managerBranch, `manager-${managerId}`).appendChild(item);
    markDirty("Reporting line changed. Review and save.");
    measure();
    requestAnimationFrame(() => drawConnectors());
    return true;
  }

  function managerSelectChanged(select) {
    const item = select.closest('[data-structure-item="user"]');
    if (!item) return false;
    const managerId = select.value;
    if (managerId === "0") {
      const groupSelect = item.querySelector('[data-structure-select="user"]');
      if (!groupSelect) return false;
      const branch = branchForGroup(groupSelect.value);
      if (!branch) return false;
      ensureList(branch, groupSelect.value).appendChild(item);
      markDirty("Direct manager removed. Review and save.");
      measure();
      requestAnimationFrame(() => drawConnectors());
      return true;
    }
    const managerBranch = branchForManager(managerId);
    const managerCard = managerBranch ? managerBranch.querySelector(':scope > [data-structure-card="manager"]') : null;
    return connectToManager(item, managerCard);
  }

  // 3.1.85: keep zoom controls inside the canvas so they remain available while
  // organizing a large structure. The slider zooms the entire workspace, not
  // individual cards. Ctrl/Cmd + mouse wheel or trackpad pinch also zooms.
  const canvasZoom = document.createElement("div");
  canvasZoom.className = "structure-canvas-zoom";
  canvasZoom.setAttribute("role", "group");
  canvasZoom.setAttribute("aria-label", "Canvas zoom controls");
  canvasZoom.innerHTML = `<button type="button" data-canvas-zoom="out" aria-label="Zoom out">−</button><input type="range" min="35" max="165" step="5" value="100" data-canvas-zoom-range aria-label="Zoom team structure"><button type="button" data-canvas-zoom="in" aria-label="Zoom in">+</button><button type="button" data-canvas-zoom="fit">Fit</button><button type="button" data-canvas-zoom="reset">100%</button><span data-tree-zoom-label>100%</span>`;
  viewport.insertBefore(canvasZoom, viewport.firstChild);
  canvasZoomRange = canvasZoom.querySelector("[data-canvas-zoom-range]");
  canvasZoom.addEventListener("click", event => {
    const button = event.target.closest("[data-canvas-zoom]");
    if (!button) return;
    const action = button.dataset.canvasZoom;
    if (action === "in") setScale(scale + 0.1);
    if (action === "out") setScale(scale - 0.1);
    if (action === "fit") fitTree();
    if (action === "reset") setScale(1);
  });
  canvasZoomRange.addEventListener("input", () => setScale(Number(canvasZoomRange.value) / 100));
  updateZoomUi();

  app.querySelectorAll("[data-tree-zoom]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.treeZoom;
      if (action === "in") setScale(scale + 0.15);
      if (action === "out") setScale(scale - 0.15);
      if (action === "reset") setScale(1);
      if (action === "fit") fitTree();
      if (action === "center") centerTree();
    });
  });

  const autoLayout = app.querySelector("[data-tree-auto-layout]");
  if (autoLayout) autoLayout.addEventListener("click", () => {
    layout={};if(layoutInput)layoutInput.value='{}';app.classList.remove('is-freeform-canvas');stage.style.width='';stage.style.height='';stage.style.minWidth='';stage.style.minHeight='';app.querySelectorAll('.structure-node').forEach(card=>{card.style.left='';card.style.top='';card.style.width='';card.style.transform='';card.classList.remove('has-custom-layout');});
    app.querySelectorAll("[data-structure-collapse]").forEach(button => {
      const branch = button.closest("[data-structure-item]");
      const list = branch ? directList(branch) : null;
      if (list) list.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.textContent = branch && branch.dataset.structureItem === "user" ? "Collapse reports" : "Collapse branch";
    });
    scale = 1;
    measure();
    requestAnimationFrame(() => {migrateToFreeform();fitTree();syncLayout(true);});
    if (status) status.textContent = "Automatic layout restored. Save Team Structure to keep it.";
  });

  viewport.addEventListener("wheel", event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setScale(scale + (event.deltaY < 0 ? 0.1 : -0.1));
  }, { passive: false });

  // Grab the empty canvas and pan it in any direction without shrinking the tree.
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".structure-node, button, select, a, input, label")) return;
    if (![0, 1, 2].includes(event.button)) return;
    panning = true;
    panStartX = event.clientX;
    panStartY = event.clientY;
    panScrollLeft = viewport.scrollLeft;
    panScrollTop = viewport.scrollTop;
    viewport.classList.add("is-panning");
    viewport.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  viewport.addEventListener("pointermove", event => {
    if (!panning) return;
    viewport.scrollLeft = panScrollLeft - (event.clientX - panStartX);
    viewport.scrollTop = panScrollTop - (event.clientY - panStartY);
  });

  const stopPan = event => {
    if (!panning) return;
    panning = false;
    viewport.classList.remove("is-panning");
    try { viewport.releasePointerCapture?.(event.pointerId); } catch (e) {}
  };
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
  viewport.addEventListener("contextmenu", event => {
    if (event.target === viewport || event.target.closest("[data-tree-frame], [data-tree-stage]")) event.preventDefault();
  });

  app.addEventListener("click", event => {
    const visibilityForm=app.querySelector('[data-structure-visibility-form]');
    const hide=event.target.closest('[data-hide-group]');
    const restore=event.target.closest('[data-restore-group]');
    if((hide||restore)&&visibilityForm){
      event.preventDefault();const id=(hide?hide.dataset.hideGroup:restore.dataset.restoreGroup)||'0';const name=hide?(hide.dataset.groupName||'this branch'):'this branch';
      if(hide&&!window.confirm(`Remove ${name} from the Team Structure chart? The team and all of its data will stay in the CRM and can be restored later.`))return;
      visibilityForm.querySelector('input[name="id"]').value=id;visibilityForm.querySelector('input[name="op"]').value=hide?'hide_group_from_structure':'restore_group_to_structure';visibilityForm.submit();return;
    }
    const remove = event.target.closest("[data-remove-person]");
    if (remove) {
      const item = remove.closest('[data-structure-item="user"]');
      if (item && connectToGroup(item, 0, true)) {
        markDirty("Person disconnected from the branch and moved to company level. Their account stays active. Review and save.");
      }
      return;
    }

    const disconnectGroup = event.target.closest("[data-disconnect-group]");
    if (disconnectGroup) {
      const item = disconnectGroup.closest('[data-structure-item="group"]');
      if (item && connectToGroup(item, 0, false)) {
        markDirty("Branch disconnected and moved beneath the company owner. Review and save.");
      }
      return;
    }

    const add = event.target.closest("[data-add-existing-person]");
    if (add) {
      const personSelect = app.querySelector("[data-person-picker]");
      const groupSelect = app.querySelector("[data-branch-picker]");
      const item = personSelect ? branchForManager(personSelect.value) : null;
      if (!item || !groupSelect || !connectToGroup(item, groupSelect.value, true)) {
        if (status) status.textContent = "Choose a movable person and a branch.";
      } else {
        markDirty("Person moved into the selected branch. Review and save.");
      }
      return;
    }

    const button = event.target.closest("[data-structure-collapse]");
    if (!button) return;
    const branch = button.closest("[data-structure-item]");
    const list = branch ? directList(branch) : null;
    if (!list) return;
    list.hidden = !list.hidden;
    button.setAttribute("aria-expanded", list.hidden ? "false" : "true");
    button.textContent = list.hidden ? "Expand branch" : (branch.dataset.structureItem === "user" ? "Collapse reports" : "Collapse branch");
    measure();
    requestAnimationFrame(() => drawConnectors());
  });

  // Drag the small connection dot to reconnect a person/branch without having
  // to drag the whole card. The preview line follows the pointer.
  if (form) {
    app.addEventListener("pointerdown", event => {
      const handle = event.target.closest("[data-link-handle]");
      if (!handle || app.classList.contains("is-arranging-cards")) return;
      const item = handle.closest("[data-structure-item]"); if (!item) return;
      event.preventDefault(); event.stopPropagation();
      linkDrag = {item, pointerId:event.pointerId};
      app.classList.add("is-linking-structure");
      handle.setPointerCapture?.(event.pointerId);
      drawConnectors(event);
    });
    app.addEventListener("pointermove", event => {
      if (!linkDrag || event.pointerId !== linkDrag.pointerId) return;
      drawConnectors(event);
      app.querySelectorAll(".is-link-target").forEach(n => n.classList.remove("is-link-target"));
      const hit = document.elementFromPoint(event.clientX,event.clientY);
      const card = hit ? hit.closest('[data-structure-card="group"], [data-structure-card="root"], [data-structure-card="manager"]') : null;
      if (card && !linkDrag.item.contains(card)) card.classList.add("is-link-target");
    });
    const finishLink = event => {
      if (!linkDrag || event.pointerId !== linkDrag.pointerId) return;
      const item = linkDrag.item;
      const hit = document.elementFromPoint(event.clientX,event.clientY);
      const card = hit ? hit.closest('[data-structure-card="group"], [data-structure-card="root"], [data-structure-card="manager"]') : null;
      let ok = false;
      if (card && !item.contains(card)) ok = card.dataset.structureCard === "manager" ? (item.dataset.structureItem === "group" ? connectGroupToManager(item,card) : connectToManager(item,card)) : connectToGroup(item,card.dataset.groupId || "0",true);
      if (!ok && status) status.textContent = card ? "That organization connection is not allowed by this user’s permissions." : "Connection unchanged.";
      linkDrag = null; app.classList.remove("is-linking-structure");
      app.querySelectorAll(".is-link-target").forEach(n => n.classList.remove("is-link-target"));
      drawConnectors();
    };
    app.addEventListener("pointerup", finishLink);
    app.addEventListener("pointercancel", event => { if(linkDrag && event.pointerId===linkDrag.pointerId){linkDrag=null;app.classList.remove("is-linking-structure");drawConnectors();} });

    app.addEventListener("change", event => {
      const groupManagerSelect = event.target.closest("[data-group-manager-select]");
      if (groupManagerSelect) {
        groupManagerSelect.dataset.previousValue = groupManagerSelect.value;
        markDirty("Primary manager connection changed. Review and save.");
        drawConnectors();
        return;
      }
      const managerSelect = event.target.closest("[data-manager-select]");
      if (managerSelect) {
        const old = managerSelect.dataset.previousValue || managerSelect.defaultValue;
        if (!managerSelectChanged(managerSelect)) {
          managerSelect.value = old;
          if (status) status.textContent = "That reporting line is not allowed.";
        }
        managerSelect.dataset.previousValue = managerSelect.value;
        return;
      }

      const select = event.target.closest("[data-structure-select]");
      if (!select) return;
      const item = select.closest("[data-structure-item]");
      const old = select.dataset.previousValue || select.defaultValue;
      if (!item || !connectToGroup(item, select.value, true)) {
        select.value = old;
        if (status) status.textContent = "That connection is not allowed for this role or level.";
      }
      select.dataset.previousValue = select.value;
    });

    app.addEventListener("dragstart", event => {
      if (app.classList.contains("is-freeform-canvas") || app.classList.contains("is-arranging-cards")) { event.preventDefault(); return; }
      const handle = event.target.closest("[data-drag-kind]");
      const card = event.target.closest('[data-draggable-card="true"]');
      if (!handle && !card) return;
      if (!handle && event.target.closest("select, option, a, button, input, label")) { event.preventDefault(); return; }
      dragged = (handle || card).closest("[data-structure-item]");
      if (!dragged) return;
      const kind = dragged.dataset.structureItem;
      dragged.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", `${kind}:${dragged.dataset.itemId || "0"}`);
    });

    app.addEventListener("dragend", () => {
      if (dragged) dragged.classList.remove("is-dragging");
      dragged = null;
      app.querySelectorAll(".is-drop-target").forEach(node => node.classList.remove("is-drop-target"));
    });

    app.addEventListener("dragover", event => {
      const card = event.target.closest('[data-structure-card="group"], [data-structure-card="root"], [data-structure-card="manager"]');
      if (!card || !dragged || dragged.contains(card)) return;
      let allowed = false;
      if (card.dataset.structureCard === "manager") {
        if(dragged.dataset.structureItem === "group"){const parentSelect=dragged.querySelector('[data-structure-select="group"]'),managerSelect=dragged.querySelector('[data-group-manager-select]');allowed=hasOption(parentSelect,card.dataset.groupId||"0")&&hasOption(managerSelect,card.dataset.managerId);}else{const groupSelect = dragged.querySelector('[data-structure-select="user"]');const managerSelect = dragged.querySelector('[data-manager-select="user"]');allowed = dragged.dataset.structureItem === "user" && hasOption(groupSelect, card.dataset.groupId || "0") && hasOption(managerSelect, card.dataset.managerId);}
      } else {
        const targetId = card.dataset.groupId || "0";
        const select = dragged.querySelector(`[data-structure-select="${dragged.dataset.structureItem}"]`);
        allowed = hasOption(select, targetId) && !(dragged.dataset.structureItem === "group" && dragged.contains(card));
      }
      if (!allowed) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      card.classList.add("is-drop-target");
    });

    app.addEventListener("dragleave", event => {
      const card = event.target.closest('[data-structure-card="group"], [data-structure-card="root"], [data-structure-card="manager"]');
      if (card && !card.contains(event.relatedTarget)) card.classList.remove("is-drop-target");
    });

    app.addEventListener("drop", event => {
      const card = event.target.closest('[data-structure-card="group"], [data-structure-card="root"], [data-structure-card="manager"]');
      if (!card || !dragged) return;
      event.preventDefault();
      card.classList.remove("is-drop-target");
      const ok = card.dataset.structureCard === "manager"
        ? (dragged.dataset.structureItem === "group" ? connectGroupToManager(dragged,card) : connectToManager(dragged, card))
        : connectToGroup(dragged, card.dataset.groupId || "0", true);
      if (!ok && status) status.textContent = "That connection is not allowed for this role or level.";
    });

    form.addEventListener("submit", event => {
      if (!dirty || window.confirm("Save this Team Structure? Branch and direct-manager visibility will follow the connected structure, while individual lead assignments stay unchanged.")) return;
      event.preventDefault();
    });
  }

  window.addEventListener("resize", measure);
  requestAnimationFrame(() => {
    app.querySelectorAll("[data-structure-select], [data-manager-select]").forEach(select => { select.dataset.previousValue = select.value; });
    measure();
    requestAnimationFrame(() => drawConnectors());
  });
})();
