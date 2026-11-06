'use strict';
const C = window.PORTFOLIO;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const safeURL = value => { if (!value) return ''; try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const artURL = item => `assets/${/^[a-z]+$/.test(item.art) ? item.art : 'cinema'}.svg`;
let filter = 'All', saved = new Set();
const modalTriggers = new WeakMap();
try { const data = JSON.parse(localStorage.getItem('satya-project-list') || '[]'); if (Array.isArray(data)) saved = new Set(data.filter(id => C.projects.some(p => p.id === id))); } catch {}
function announce(text) { $('#status').textContent = text; }
function save(id) { saved.has(id) ? saved.delete(id) : saved.add(id); try { localStorage.setItem('satya-project-list', JSON.stringify([...saved])); } catch { announce('Your list is available for this session only.'); } $('#saved-count').textContent = saved.size; }
function tags(list=[]) { return list.map(t => `<span>${esc(t)}</span>`).join(''); }
function poster(item) { return `<div class="poster" style="--art:url('${artURL(item)}')"><span class="poster-label">${esc(item.label || item.subtitle || 'THE COLLECTION')}</span><div class="poster-title">${esc(item.title)}<span class="poster-sub">${esc(item.subtitle || '')}</span></div>${item.sample ? '<span class="sample-badge">SAMPLE</span>' : ''}</div>`; }
function makeCard(item, project=false) {
 const article = document.createElement('article'); article.className = 'card' + (item.title.length > 28 ? ' long-title' : '');
 article.innerHTML = `<button class="card-open" aria-label="View ${esc(item.title)} details">${poster(item)}<div class="card-caption"><h3>${esc(project ? item.title : item.subtitle)}</h3><p>${esc(item.date || (item.stack || []).slice(0,3).join(' · '))}</p><span class="card-peek">${project ? 'Explore project' : 'Discover the story'}</span></div></button>${project ? `<button class="save-button" aria-pressed="${saved.has(item.id)}" aria-label="${saved.has(item.id)?'Remove':'Save'} ${esc(item.title)} ${saved.has(item.id)?'from':'to'} my list">${saved.has(item.id)?'✓':'+'}</button>` : ''}`;
 article.querySelector('.card-open').onclick = e => openDetail(item, e.currentTarget, project);
 if(project) article.querySelector('.save-button').onclick = e => { save(item.id); const b=e.currentTarget; b.textContent=saved.has(item.id)?'✓':'+'; b.setAttribute('aria-pressed',String(saved.has(item.id))); b.setAttribute('aria-label',`${saved.has(item.id)?'Remove':'Save'} ${item.title} ${saved.has(item.id)?'from':'to'} my list`); announce(`${item.title} ${saved.has(item.id)?'saved to':'removed from'} my list`); if(filter==='Saved'){ renderProjects(); document.querySelector('[data-filter="Saved"]').focus(); } };
 return article;
}
function updateRail(rail) { document.querySelectorAll(`[data-rail="${rail.id}"]`).forEach(b => b.disabled = Number(b.dataset.direction) < 0 ? rail.scrollLeft < 2 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 3); }
function bindRail(rail) { rail.addEventListener('scroll',()=>updateRail(rail),{passive:true}); rail.addEventListener('keydown', e => { if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key) || !e.target.matches('.card-open')) return; const cards=[...rail.querySelectorAll('.card-open')]; const i=cards.indexOf(e.target); const n=e.key==='Home'?0:e.key==='End'?cards.length-1:Math.max(0,Math.min(cards.length-1,i+(e.key==='ArrowRight'?1:-1))); e.preventDefault(); cards[n]?.focus(); }); }
function renderProjects() { const query=$('#project-search').value.trim().toLowerCase(); const list=C.projects.filter(p=>(filter==='All'||(filter==='Saved'?saved.has(p.id):p.category===filter))&&[p.title,p.subtitle,p.description,p.context,p.track,...p.stack].join(' ').toLowerCase().includes(query)); const rail=$('#project-rail'); rail.replaceChildren(...list.map(p=>makeCard(p,true))); rail.scrollLeft=0; $('#empty-projects').hidden=!!list.length; $('#project-count').textContent=`${String(list.length).padStart(2,'0')} TITLES`; requestAnimationFrame(()=>updateRail(rail)); }
function addRow(id,title,kicker,items,classes) { if(!items.length)return; const section=document.createElement('section'); section.id=id; section.className=`collection ${classes}`; section.setAttribute('aria-labelledby',`${id}-title`); section.innerHTML=`<div class="collection-head"><div><p class="section-kicker">${esc(kicker)}</p><h2 id="${id}-title">${esc(title)} <span class="heading-arrow">›</span></h2></div><div class="carousel-tools"><button class="arrow" data-rail="${id}-rail" data-direction="-1" aria-label="Previous ${esc(title)}">‹</button><button class="arrow" data-rail="${id}-rail" data-direction="1" aria-label="Next ${esc(title)}">›</button></div></div><div class="rail" id="${id}-rail" aria-label="${esc(title)}"></div>`; const rail=section.querySelector('.rail'); rail.append(...items.map(p=>makeCard(p))); $('#other-rows').append(section); }
function link(label,href) { const a=document.createElement('a'); a.className='button secondary'; a.textContent=label+' ↗'; a.href=href; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
function missing(label) { const el=document.createElement('span'); el.className='missing-link'; el.textContent=label; return el; }
function showModal(dialog,trigger) { modalTriggers.set(dialog,trigger); dialog.showModal(); document.body.style.overflow='hidden'; }
function openDetail(item,trigger,project=false) {
 $('#detail-art').hidden=!!item.about;
 $('#about-portrait').hidden=!item.about;
 $('#detail').classList.toggle('about-detail',!!item.about);
 $('#detail-art').style.backgroundImage=`url('${artURL(item)}')`;
 $('#detail-title').textContent=item.title;
 $('#detail-subtitle').textContent=item.subtitle||'';
 $('#detail-meta').textContent=[item.status||item.label,item.date].filter(Boolean).join(' · ')||'THE DEVELOPER COLLECTION';
 $('#detail-description').textContent=item.description;
 $('#detail-stack').innerHTML=tags(item.stack);
 const facts=[['Employment type',item.employmentType],['Location',item.location],['Context',item.context],['Track',item.track],['Credential ID',item.credentialId],['Local development address (not a public demo)',item.localDevelopment]];
 $('#detail-facts').innerHTML=facts.filter(([,value])=>value).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
 $('#detail-facts').hidden=!facts.some(([,value])=>value);
 $('#detail-points').innerHTML=(item.details||[]).map(t=>`<li>${esc(t)}</li>`).join('');
 const actions=$('#detail-actions'); actions.replaceChildren();
 if(project) {
  for(const [label,value] of [['Public demo',item.live],['Repository',item.repo]]) {
   const url=safeURL(value); actions.append(url?link(label,url):missing(`[Add ${label.toLowerCase()} link]`));
  }
  const saveBtn=document.createElement('button'); saveBtn.className='button secondary';
  const update=()=>{saveBtn.textContent=saved.has(item.id)?'✓ In my list':'+ Add to my list';saveBtn.setAttribute('aria-pressed',String(saved.has(item.id)));};
  update();saveBtn.onclick=()=>{save(item.id);update();renderProjects();modalTriggers.set($('#detail'),[...$('#project-rail').querySelectorAll('.card-open')].find(b=>b.getAttribute('aria-label')===`View ${item.title} details`)||document.querySelector('[data-filter="Saved"]'));};actions.append(saveBtn);
 } else if('credential' in item){const url=safeURL(item.credential);actions.append(url?link('Verify credential',url):missing('[Add verification link]'));}
 if(item.about && safeURL(C.resume)) {
  const view=document.createElement('button');view.className='button secondary';view.textContent='View Resume';view.onclick=()=>openResume(view);
  const download=link('Download Resume',safeURL(C.resume));download.removeAttribute('target');download.download='Satya_Prakash_Mohapatra_Resume.pdf';actions.append(view,download);
 }
 showModal($('#detail'),trigger);
}
function contacts() {
 const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C.email);
 const emailHint=C.emailPlaceholder?`${C.emailPlaceholder} — Placeholder (real email not supplied)`:'[Add your email address]';
 $('#email-placeholder').textContent=emailHint;
 if(emailValid){$('#email-cta').href='mailto:'+C.email;$('#email-cta').hidden=false;$('#email-placeholder').hidden=true;}
 for(const [label,value,hint,isEmail] of [['Email',C.email,emailHint,true],['GitHub',C.github,'[Add your GitHub profile]',false],['LinkedIn',C.linkedin,'[Add your LinkedIn profile]',false]]) {
  const url=isEmail?(emailValid?'mailto:'+value:''):safeURL(value);
  const el=document.createElement(url?'a':'div');el.className='contact-link'+(url?'':' placeholder');
  if(url){el.href=url;if(!isEmail){el.target='_blank';el.rel='noopener noreferrer';}}
  el.innerHTML=`<span>${esc(label)}<small>${esc(url?value:hint)}</small></span><span class="link-arrow" aria-hidden="true">${url?'↗':'—'}</span>`;$('#contact-links').append(el);
 }
}
// Add configured categories before binding the existing filter controls.
for(const category of new Set(C.projects.map(p=>p.category))) {
 if([...document.querySelectorAll('[data-filter]')].some(b=>b.dataset.filter===category))continue;
 const button=document.createElement('button');button.dataset.filter=category;button.textContent=category;button.setAttribute('aria-pressed','false');
 document.querySelector('[data-filter="Saved"]').before(button);
}
// Configuration values are inserted as text or escaped markup; arbitrary HTML is not executed.
$('#hero-title').replaceChildren();C.name.split(' ').forEach((word,i,arr)=>{ $('#hero-title').append(document.createTextNode(word.toUpperCase()+(i<arr.length-1?' ':'')));if(i===arr.length-2)$('#hero-title').append(document.createElement('br')); });
$('#hero-role').innerHTML=`${esc(C.role)} <span>at ${esc(C.company)}</span>`;$('#hero-bio').textContent=C.bio;$('#location').textContent=C.location;$('#footer-name').textContent=C.name;$('#year').textContent=new Date().getFullYear();document.title=`${C.shortName} — The Developer Collection`;document.querySelectorAll('.brand').forEach(el=>{el.firstChild.textContent=C.shortName;});$('#saved-count').textContent=saved.size;
addRow('skills','🛠 Tech Stack','BEHIND THE SCENES',C.skills,'compact-row');addRow('experience','Continue the story','EXPERIENCE & EDUCATION',C.experience,'story-row');addRow('certifications','The learning collection','CERTIFICATIONS & JOB SIMULATIONS',C.certifications,'cert-row');renderProjects();contacts();
document.querySelectorAll('.rail').forEach(bindRail);document.querySelectorAll('[data-rail]').forEach(b=>b.onclick=()=>{const rail=document.getElementById(b.dataset.rail);rail.scrollBy({left:Number(b.dataset.direction)*rail.clientWidth*.8,behavior:reduced()?'instant':'smooth'});});function refreshRails(){document.querySelectorAll('.rail').forEach(updateRail);}addEventListener('resize',refreshRails);requestAnimationFrame(refreshRails);
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderProjects();announce(`${filter} collection selected`);});$('#project-search').addEventListener('input',()=>{renderProjects();announce($('#project-count').textContent+' matching projects');});
$('#search-open').onclick=()=>{$('#search-field').hidden=false;$('#projects').scrollIntoView({behavior:reduced()?'instant':'smooth'});$('#project-search').focus({preventScroll:true});};$('#search-close').onclick=()=>{$('#project-search').value='';$('#search-field').hidden=true;renderProjects();$('#search-open').focus({preventScroll:true});};$('#project-search').onkeydown=e=>{if(e.key==='Escape')$('#search-close').click();};
$('#about-open').onclick=e=>openDetail({title:C.name,subtitle:`${C.role} at ${C.company}`,label:'THE STORY SO FAR',art:'hero',description:C.bio,stack:['Java','Spring Boot','React'],details:[`Based in ${C.location}.`,'Building MediConnect, a healthcare microservices project.',...(C.bioIsPlaceholder?['Suggested bio — replace or confirm this introduction in config.js.']:[]),...(!C.resume?['Résumé placeholder — add your PDF path in config.js.']:[])],about:true},e.currentTarget);
$('#profile-open').onclick=e=>showModal($('#profiles'),e.currentTarget);document.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{$('.profile-name').textContent=b.dataset.profile;$('.avatar').textContent=b.dataset.profile[0];const section=document.getElementById(b.dataset.first);const h=section.querySelector('h2');h.tabIndex=-1;modalTriggers.set($('#profiles'),h);$('#profiles').close();section.scrollIntoView({behavior:reduced()?'instant':'smooth'});announce(`Exploring as ${b.dataset.profile}`);});
document.querySelectorAll('dialog').forEach(d=>{const close=d.querySelector('.modal-close');if(close)close.onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});d.addEventListener('close',()=>{document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';const trigger=modalTriggers.get(d);const top=[...document.querySelectorAll('dialog[open]')].at(-1);if(trigger?.isConnected&&(!top||top.contains(trigger)))trigger.focus({preventScroll:true});});});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('keydown',e=>{
 if(e.key!=='Tab')return;
 const controls=[...d.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 const first=controls[0],last=controls.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
}));
const menu=$('.menu-toggle');menu.onclick=()=>{const open=$('#nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));};$('#nav').querySelectorAll('a').forEach(a=>a.onclick=()=>{$('#nav').classList.remove('open');menu.setAttribute('aria-expanded','false');});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#nav').classList.contains('open')){$('#nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});addEventListener('scroll',()=>$('.topbar').classList.toggle('scrolled',scrollY>20),{passive:true});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$('#nav').querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('#home,#projects,#skills,#experience,#contact').forEach(s=>observer.observe(s));

// The same supplied portrait is reused as a smaller crop only in About.
for(const selector of ['#hero-portrait','#about-portrait']) {
 const picture=$(selector),img=picture.querySelector('img'),source=document.createElement('source');
 source.type='image/webp';source.srcset=C.portrait.srcset;
 source.sizes=selector==='#hero-portrait'?'(max-width: 700px) 620px, (max-width: 1050px) 740px, 58vw':'(max-width: 700px) 280px, 380px';
 picture.prepend(source);img.src=C.portrait.src;img.alt=C.portrait.alt;img.width=C.portrait.width;img.height=C.portrait.height;
}
function openResume(trigger) {
 const url=safeURL(C.resume);if(!url)return;
 const frame=$('#resume-preview');frame.hidden=!matchMedia('(min-width: 701px)').matches;
 if(!frame.hidden)frame.src=url;else frame.removeAttribute('src');
 showModal($('#resume'),trigger);
}
document.querySelectorAll('[data-resume-view]').forEach(b=>b.onclick=e=>openResume(e.currentTarget));
document.querySelectorAll('[data-resume-open],[data-resume-download]').forEach(a=>{a.href=safeURL(C.resume);if(a.hasAttribute('data-resume-download'))a.download='Satya_Prakash_Mohapatra_Resume.pdf';});
$('#resume').addEventListener('close',()=>$('#resume-preview').removeAttribute('src'));

// Opening controls are available immediately; profiles never restrict content.
const intro=$('#intro');let introDestination='home';
function finishIntro(destination='home') {introDestination=destination;intro.close();}
$('#intro-skip').onclick=()=>finishIntro();
$('#intro-contact').onclick=()=>finishIntro('contact');
$('#intro-profiles').onclick=()=>finishIntro('profiles');
intro.addEventListener('close',()=>{
 try{sessionStorage.setItem('satya-opening-seen','true');}catch{}
 if(introDestination==='profiles')showModal($('#profiles'),$('#profile-open'));
 else if(introDestination==='contact'){const h=$('#contact-title');h.tabIndex=-1;h.scrollIntoView({behavior:reduced()?'instant':'smooth'});h.focus({preventScroll:true});}
 introDestination='home';
});
$('#opening-replay').onclick=e=>showModal(intro,e.currentTarget);
let openingSeen=false;try{openingSeen=sessionStorage.getItem('satya-opening-seen')==='true';}catch{}
if(!openingSeen&&!location.hash&&!reduced())showModal(intro,$('#hero-title'));
