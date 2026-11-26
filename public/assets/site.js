const menu = document.querySelector('.menu-btn');
if (menu) {
  const close = () => {menu.setAttribute('aria-expanded','false');document.querySelector('#nav').classList.remove('open');};
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded',String(open));
    document.querySelector('#nav').classList.toggle('open',open);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu.focus();}});
}
for (const form of document.querySelectorAll('.add-form')) {
  form.addEventListener('submit', async event => {
    event.preventDefault(); const button = form.querySelector('button'); button.disabled=true;
    const toast = document.querySelector('.toast');
    try {
      const res=await fetch(form.getAttribute('action'),{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error || 'Проверьте количество.');
      document.querySelector('#cart-count').textContent=data.count;
      toast.textContent='Позиция добавлена в заявку';
    } catch(err){toast.textContent=err instanceof SyntaxError?'Проверьте соединение и откройте заявку.':err.message;}
    finally {button.disabled=false;toast.classList.add('show');clearTimeout(form.timer);form.timer=setTimeout(()=>toast.classList.remove('show'),4000);}
  });
}
const parentCategory=document.querySelector('.edit-form select[name=category]');
const subgroup=document.querySelector('.edit-form select[name=group]');
if(parentCategory && subgroup){
  const update=()=>{for(const opt of subgroup.options){opt.hidden=!!opt.value&&opt.dataset.parent!==parentCategory.value;opt.disabled=opt.hidden;}
    if(subgroup.selectedOptions[0]?.disabled)subgroup.value='';};
  parentCategory.addEventListener('change',update);update();
}
