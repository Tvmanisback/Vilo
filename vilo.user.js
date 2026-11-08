// ==UserScript==
// @name Vilo for VuloChat
// @namespace https://github.com/Tvmanisback/Vilo
// @version 1.0.0
// @description Plugin and theme suite for VuloChat
// @match https://tvmanisback.github.io/VuloChat/*
// @run-at document-idle
// @grant GM_getValue
// @grant GM_setValue
// @homepageURL https://github.com/Tvmanisback/Vilo
// @updateURL https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js
// @downloadURL https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js
// ==/UserScript==
(() => {
'use strict';
if (window.__VILO__) return; window.__VILO__=true;
const KEY='vilo-config', LOG='vilo-log';
const cfg=Object.assign({plugins:{},theme:'Violet Glow',customCSS:'',logger:false,limit:500},GM_getValue(KEY,{}));
const save=()=>GM_setValue(KEY,cfg), $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const names=[
['timestamps','Message timestamps','Show timestamps beside messages.'],
['compact','Compact chat','Reduce message spacing.'],
['copy','Quick copy','Add copy buttons to messages.'],
['codecopy','Code copy','Copy code blocks with one click.'],
['counter','Character counter','Count characters in the composer.'],
['words','Word counter','Count words in the composer.'],
['emoji','Emoji row','Quickly insert common emoji.'],
['avatars','Hide avatars','Hide chat avatars.'],
['typing','Hide typing','Hide typing indicators.'],
['focus','Focus mode','Dim sidebars while reading.'],
['embeds','Collapse embeds','Collapse large embeds and previews.'],
['links','External link labels','Mark links that open another site.'],
['latest','Jump to latest','Show a jump-to-latest button.'],
['draft','Draft backup','Save the current draft locally.'],
['enter','Enter to send','Enter sends; Shift+Enter inserts a line.'],
['markdown','Markdown guide','Show a compact Markdown reminder.'],
['images','Fit images','Keep images inside the chat column.'],
['motion','Reduce motion','Reduce interface animations.'],
['logger','Message logger','Opt-in local archive of rendered messages.'],
['clock','Local clock','Show your local clock in Vilo tools.'],
['finder','Message finder','Highlight matching loaded messages.'],
['theme','Theme manager','Import .theme.css files.'],
['replies','Reply emphasis','Highlight quoted/replied message blocks.'],
['readable','Readable text','Improve message line spacing.'],
['toolbar','Vilo toolbar','Show quick controls in the Vilo panel.']
];
const presets={
'Violet Glow':':root{--v-accent:#a78bfa;--v-bg:#171326;--v-panel:#211a35;--v-card:#2b2144;--v-text:#f5f0ff;--v-muted:#b7a9d3;--v-border:#493866}',
'Midnight':':root{--v-accent:#7c9cff;--v-bg:#0c1220;--v-panel:#111b2d;--v-card:#19263d;--v-text:#eaf1ff;--v-muted:#9eacc5;--v-border:#2d4263}',
'Emerald':':root{--v-accent:#45d6a0;--v-bg:#0d1916;--v-panel:#13251f;--v-card:#1b332a;--v-text:#eafff4;--v-muted:#a5c9b7;--v-border:#2d5747}',
'Sunset':':root{--v-accent:#ff9b72;--v-bg:#21131a;--v-panel:#301c25;--v-card:#422632;--v-text:#fff1eb;--v-muted:#d6aaa0;--v-border:#67404b}',
'Light':':root{--v-accent:#7056d8;--v-bg:#f4f2fa;--v-panel:#fff;--v-card:#eeebf7;--v-text:#211b32;--v-muted:#716b80;--v-border:#d8d2e7}'
};
const on=id=>!!cfg.plugins[id];
const style=document.createElement('style');style.textContent=
'#vilo-panel{position:fixed;z-index:2147483000;right:3vw;top:4vh;width:min(520px,94vw);max-height:92vh;overflow:auto;padding:18px;border-radius:17px;background:var(--v-panel,#211a35);color:var(--v-text,#f5f0ff);border:1px solid var(--v-border,#493866);box-shadow:0 20px 80px #0009;font:14px/1.45 system-ui}'+
'#vilo-panel[hidden]{display:none}#vilo-panel *{box-sizing:border-box}#vilo-fab{position:fixed;z-index:2147482999;right:16px;bottom:16px;border:0;border-radius:30px;padding:11px 16px;background:#8b5cf6;color:white;font-weight:bold;cursor:pointer}'+
'.vilo-tabs,.vilo-actions{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.vilo-tab,.vilo-btn{background:var(--v-card);color:var(--v-text);border:1px solid var(--v-border);border-radius:8px;padding:8px 11px;cursor:pointer}.vilo-tab[aria-selected=true]{background:var(--v-accent);color:#171326}.vilo-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--v-border)}.vilo-row small,.vilo-muted{display:block;color:var(--v-muted);font-size:12px}.vilo-switch{width:40px;accent-color:var(--v-accent)}.vilo-card{background:var(--v-card);border:1px solid var(--v-border);border-radius:11px;padding:12px;margin:10px 0}.vilo-input{max-width:100%;padding:9px;background:var(--v-bg);color:var(--v-text);border:1px solid var(--v-border);border-radius:8px}.vilo-copy{margin:4px;padding:4px 7px;border-radius:6px;border:1px solid var(--v-border);background:var(--v-card);color:inherit;cursor:pointer}.vilo-time{font-size:10px;color:var(--v-muted);margin-left:7px}#vilo-stats{text-align:right;color:var(--v-muted);font-size:11px}#vilo-emoji{display:flex;gap:5px;margin:5px 0}.vilo-emoji{border:0;border-radius:7px;padding:5px;background:var(--v-card);cursor:pointer}#vilo-latest{position:fixed;z-index:2147482998;right:22px;bottom:70px;background:var(--v-accent);border:0;border-radius:20px;padding:8px 12px;cursor:pointer}body.vilo-compact [class*=message]{padding-block:3px!important}body.vilo-avatars [class*=avatar]{display:none!important}body.vilo-typing [class*=typing]{display:none!important}body.vilo-focus aside{opacity:.25}body.vilo-focus aside:hover{opacity:1}body.vilo-motion *,body.vilo-motion *:before,body.vilo-motion *:after{animation:none!important;transition:none!important}body.vilo-images img{max-width:100%!important;height:auto!important}body.vilo-readable [class*=message]{line-height:1.65!important}';
document.head.append(style);
function applyTheme(){let t=document.getElementById('vilo-theme');if(!t){t=document.createElement('style');t.id='vilo-theme';document.head.append(t)}t.textContent=(presets[cfg.theme]||'')+'\n'+(cfg.customCSS||'')}
function messages(){let a=[];['[data-message-id]','[class*=messageContent]','[class*=message-content]','[class*=chat-message]'].forEach(s=>a.push(...$$(s)));return [...new Set(a)].filter(e=>e.innerText&&e.innerText.trim()&&!e.closest('#vilo-panel')).slice(-250)}
function composer(){return $('textarea:not([disabled])')||$('[contenteditable=true][role=textbox]')||$('[contenteditable=true]')}
function msgText(e){let c=e.cloneNode(true);c.querySelectorAll('button,.vilo-copy,.vilo-time').forEach(x=>x.remove());return(c.innerText||'').trim()}
function addCopy(){if(!on('copy'))return;messages().forEach(e=>{if(e.dataset.viloCopy)return;e.dataset.viloCopy='1';let b=document.createElement('button');b.className='vilo-copy';b.textContent='Copy';b.onclick=()=>navigator.clipboard.writeText(msgText(e)).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',900)});e.append(b)})}
function addTimes(){if(!on('timestamps'))return;messages().forEach(e=>{if(e.querySelector('.vilo-time'))return;let s=document.createElement('span');s.className='vilo-time';s.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});e.append(s)})}
function composerFeatures(){let c=composer();if(!c)return;let v=c.isContentEditable?c.innerText:c.value||'';let st=$('#vilo-stats');if(on('counter')||on('words')){if(!st){st=document.createElement('div');st.id='vilo-stats';c.after(st)}st.textContent=[on('counter')?v.length+' chars':'',on('words')?(v.trim()?v.trim().split(/\s+/).length:0)+' words':''].filter(Boolean).join(' · ')}else st?.remove();
if(on('emoji')&&!$('#vilo-emoji')){let row=document.createElement('div');row.id='vilo-emoji';['😀','😂','😭','❤️','🔥','👍','🎉','✨'].forEach(x=>{let b=document.createElement('button');b.className='vilo-emoji';b.textContent=x;b.onclick=()=>{c.focus();if(c.isContentEditable)document.execCommand('insertText',false,x);else{c.setRangeText(x,c.selectionStart,c.selectionEnd,'end');c.dispatchEvent(new Event('input',{bubbles:true}))}};row.append(b)});c.before(row)}
if(on('markdown')&&!$('#vilo-md')){let d=document.createElement('small');d.id='vilo-md';d.className='vilo-muted';d.textContent='Markdown: **bold** · *italic* · `code` · > quote';c.after(d)}
if(on('draft')&&!c.dataset.viloDraft){c.dataset.viloDraft='1';let k='vilo-draft-'+location.pathname;let old=GM_getValue(k,'');if(old&&!v)c.isContentEditable?c.innerText=old:c.value=old;c.addEventListener('input',()=>GM_setValue(k,c.isContentEditable?c.innerText:c.value||''))}
if(on('enter')&&!c.dataset.viloEnter){c.dataset.viloEnter='1';c.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){let f=c.closest('form');let b=f?.querySelector('button[type=submit]')||$('button[aria-label*=Send i]');if(b){e.preventDefault();b.click()}}},true)}
}
function logger(){if(!on('logger')||!cfg.logger)return;let log=GM_getValue(LOG,[]),seen=new Set(log.slice(-100).map(x=>x.text+'|'+x.path));messages().forEach(e=>{let text=msgText(e),key=text+'|'+location.pathname;if(text&&!seen.has(key)){log.push({text:text.slice(0,3000),time:new Date().toISOString(),path:location.pathname});seen.add(key)}});GM_setValue(LOG,log.slice(-Math.max(50,Math.min(2000,+cfg.limit||500))))}
function refresh(){document.body.classList.toggle('vilo-compact',on('compact'));document.body.classList.toggle('vilo-avatars',on('avatars'));document.body.classList.toggle('vilo-typing',on('typing'));document.body.classList.toggle('vilo-focus',on('focus'));document.body.classList.toggle('vilo-motion',on('motion'));document.body.classList.toggle('vilo-images',on('images'));document.body.classList.toggle('vilo-readable',on('readable'));addCopy();addTimes();composerFeatures();logger();
if(on('codecopy'))$$('pre').forEach(p=>{if(p.querySelector('.vilo-code-copy'))return;let b=document.createElement('button');b.className='vilo-copy vilo-code-copy';b.textContent='Copy code';b.onclick=()=>navigator.clipboard.writeText(p.innerText);p.append(b)});
if(on('links'))$$('a[href^="http"]').forEach(a=>{try{if(new URL(a.href).origin!==location.origin)a.title='Opens external website'}catch{}});
if(on('latest')&&!$('#vilo-latest')){let b=document.createElement('button');b.id='vilo-latest';b.textContent='↓ Latest';b.onclick=()=>{let c=composer();(c?.closest('main')||document.scrollingElement).scrollTo({top:1e9,behavior:'smooth'})};document.body.append(b)}if(!on('latest'))$('#vilo-latest')?.remove();
if(on('embeds'))$$('iframe,[class*=embed],[class*=Embed]').forEach(e=>{if(e.dataset.viloEmbed)return;e.dataset.viloEmbed='1';let b=document.createElement('button');b.className='vilo-copy';b.textContent='Collapse';b.onclick=()=>{e.hidden=!e.hidden;b.textContent=e.hidden?'Expand':'Collapse'};e.before(b)});
if(on('replies'))$$('blockquote').forEach(e=>e.style.borderLeft='3px solid var(--v-accent)');
}
function render(tab){$$('.vilo-tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));let out=$('#vilo-content');
if(tab==='plugins'){out.innerHTML='<div class="vilo-card"><b>24 plugins</b><span class="vilo-muted">Toggle features on or off. Preferences stay on this device.</span></div>'+names.map(n=>'<div class="vilo-row"><div><b>'+n[1]+'</b><small>'+n[2]+'</small></div><input class="vilo-switch" type="checkbox" data-id="'+n[0]+'" '+(on(n[0])?'checked':'')+'></div>').join('');$$('[data-id]',out).forEach(x=>x.onchange=()=>{cfg.plugins[x.dataset.id]=x.checked;save();refresh()})}
if(tab==='themes'){out.innerHTML='<div class="vilo-card"><b>Built-in themes</b><div class="vilo-actions">'+Object.keys(presets).map(n=>'<button class="vilo-btn" data-theme="'+n+'">'+n+'</button>').join('')+'</div></div><div class="vilo-card"><b>Import .theme.css</b><p class="vilo-muted">CSS is stored locally. Import only files you trust.</p><input id="vilo-file" type="file" accept=".theme.css,.css,text/css"><button class="vilo-btn" id="vilo-clear">Reset theme</button></div>';$$('[data-theme]',out).forEach(b=>b.onclick=()=>{cfg.theme=b.dataset.theme;save();applyTheme()});$('#vilo-file').onchange=async e=>{let f=e.target.files[0];if(!f)return;if(f.size>150000)return alert('Maximum theme size is 150 KB.');let css=await f.text();if(/<\s*script|javascript:|@import\s+url/i.test(css))return alert('Theme contains blocked content.');cfg.customCSS=css;cfg.theme='Custom';save();applyTheme();alert('Theme imported.')};$('#vilo-clear').onclick=()=>{cfg.customCSS='';cfg.theme='Violet Glow';save();applyTheme()}}
if(tab==='logger'){let count=GM_getValue(LOG,[]).length;out.innerHTML='<div class="vilo-card"><b>Local message logger</b><p class="vilo-muted">Off by default. When enabled, it saves text from messages rendered in your browser on this device only. It does not access hidden server data or upload logs. Use respectfully and follow applicable rules.</p><label><input id="vilo-log-on" type="checkbox" '+(cfg.logger?'checked':'')+'> Enable logger</label><p>Entries stored: '+count+'</p><label>Limit <select id="vilo-limit" class="vilo-input"><option>100</option><option>250</option><option>500</option><option>1000</option><option>2000</option></select></label><div class="vilo-actions"><button class="vilo-btn" id="vilo-export">Export JSON</button><button class="vilo-btn" id="vilo-delete">Delete log</button></div></div>';$('#vilo-limit').value=String(cfg.limit);$('#vilo-log-on').onchange=e=>{cfg.logger=e.target.checked;save()};$('#vilo-limit').onchange=e=>{cfg.limit=+e.target.value;save()};$('#vilo-export').onclick=()=>{let a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(GM_getValue(LOG,[]),null,2)],{type:'application/json'}));a.href=u;a.download='vilo-message-log.json';a.click();URL.revokeObjectURL(u)};$('#vilo-delete').onclick=()=>{if(confirm('Delete the local message archive?')){GM_setValue(LOG,[]);render('logger')}}}
if(tab==='tools'){out.innerHTML='<div class="vilo-card"><b>Find in loaded messages</b><input id="vilo-find" class="vilo-input" placeholder="Search current chat"><button class="vilo-btn" id="vilo-find-clear">Clear</button></div><div class="vilo-card"><b>Local time</b><div id="vilo-clock">'+new Date().toLocaleString()+'</div></div><p class="vilo-muted">Vilo is an independent userscript, not an official VuloChat feature.</p><a href="https://github.com/Tvmanisback/Vilo" target="_blank" rel="noopener">Vilo on GitHub</a>';$('#vilo-find').oninput=e=>messages().forEach(m=>m.style.outline=e.target.value&&msgText(m).toLowerCase().includes(e.target.value.toLowerCase())?'2px solid var(--v-accent)':'');$('#vilo-find-clear').onclick=()=>{messages().forEach(m=>m.style.outline='');$('#vilo-find').value=''}}
}
function init(){let root=document.createElement('div');root.innerHTML='<button id="vilo-fab">✦ Vilo</button><section id="vilo-panel" hidden><header style="display:flex;justify-content:space-between;align-items:center"><div><h2 style="margin:0">✦ Vilo</h2><small class="vilo-muted">VuloChat enhancement suite · 1.0.0</small></div><button class="vilo-btn" id="vilo-close">✕</button></header><nav class="vilo-tabs"><button class="vilo-tab" data-tab="plugins" aria-selected="true">Plugins</button><button class="vilo-tab" data-tab="themes">Themes</button><button class="vilo-tab" data-tab="logger">Logger</button><button class="vilo-tab" data-tab="tools">Tools</button></nav><div id="vilo-content"></div></section>';document.body.append(root);$('#vilo-fab').onclick=()=>{$('#vilo-panel').hidden=!$('#vilo-panel').hidden;render('plugins')};$('#vilo-close').onclick=()=>$('#vilo-panel').hidden=true;$$('.vilo-tab').forEach(b=>b.onclick=()=>render(b.dataset.tab))}
applyTheme();init();refresh();let busy=false;new MutationObserver(()=>{if(!busy){busy=true;requestAnimationFrame(()=>{busy=false;refresh()})}}).observe(document.body,{childList:true,subtree:true});if(typeof GM_registerMenuCommand==='function')GM_registerMenuCommand('Open Vilo',()=>{$('#vilo-panel').hidden=false;render('plugins')});
})();