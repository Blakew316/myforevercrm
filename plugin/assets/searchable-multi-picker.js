(function(){
  function init(root){
    var search=root.querySelector('[data-multi-search]'), options=root.querySelector('[data-multi-options]'), selected=root.querySelector('[data-multi-selected]');
    if(!options||!selected)return;
    var labels=[].slice.call(options.querySelectorAll('label'));
    function textFor(label){var span=label.querySelector('span');return (span?span.textContent:label.textContent).replace(/\s+/g,' ').trim();}
    function render(){
      selected.innerHTML=''; var count=0;
      labels.forEach(function(label){var cb=label.querySelector('input[type="checkbox"]');if(!cb||!cb.checked)return;count++;var chip=document.createElement('button');chip.type='button';chip.className='crm-multi-chip';chip.innerHTML='<span></span><b aria-hidden="true">×</b>';chip.querySelector('span').textContent=textFor(label);chip.setAttribute('aria-label','Remove '+textFor(label));chip.addEventListener('click',function(){cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));});selected.appendChild(chip);});
      if(!count){var empty=document.createElement('span');empty.className='muted crm-multi-empty';empty.textContent='None selected';selected.appendChild(empty);}
    }
    function filter(){var q=(search&&search.value||'').toLowerCase().trim();labels.forEach(function(label){label.hidden=!!q&&textFor(label).toLowerCase().indexOf(q)===-1;});}
    options.addEventListener('change',render);if(search)search.addEventListener('input',filter);render();
  }
  document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('[data-multi-picker]').forEach(init);});
})();
