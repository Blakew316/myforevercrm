(()=>{
  document.addEventListener('click',e=>{
    const menu=e.target.closest('[data-crm-mobile-menu]');if(!menu)return;e.preventDefault();document.body.classList.toggle('crm-sidebar-open');
  });
  document.addEventListener('click',e=>{
    if(!document.body.classList.contains('crm-sidebar-open'))return;
    const sidebar=document.getElementById('forever-crm-sidebar');if(sidebar&&sidebar.contains(e.target)&&e.target.closest('a'))document.body.classList.remove('crm-sidebar-open');
  });
})();
