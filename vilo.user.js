// ==UserScript==
// @name         Vilo for VuloChat
// @namespace    https://github.com/Tvmanisback/Vilo
// @version      2.1.0
// @description  Standalone Vilo tab with searchable plugins and themes for VuloChat
// @match        https://tvmanisback.github.io/VuloChat/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @homepageURL  https://github.com/Tvmanisback/Vilo
// @supportURL   https://github.com/Tvmanisback/Vilo/issues
// @updateURL    https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js
// @downloadURL  https://raw.githubusercontent.com/Tvmanisback/Vilo/main/vilo.user.js
// ==/UserScript==

(() => {
  'use strict';
  if (window.__VILO_V2__) return;
  window.__VILO_V2__ = true;

  const STORE = 'vilo.v3.settings';
  const LOG = 'vilo.v2.message-log';
  const DRAFT = 'vilo.v2.drafts';
  const defaults = {
    plugins: {
      timestamps: false, compact: false, copy: false, codeCopy: false,
      charCount: false, wordCount: false, emojiBar: false, hideAvatars: false,
      focusMode: false, collapseMedia: false, linkLabels: false, jumpLatest: false,
      draftBackup: false, enterNewline: false, markdownHelp: false, imageFit: false,
      reduceMotion: false, messageLogger: false, messageSearch: false,
      replyHighlight: false, readableText: false
    },
    theme: 'Violet Glow', customCSS: '', loggerLimit: 500
  };
  let saved = {};
  try { saved = GM_getValue(STORE, {}) || {}; } catch {}
  // Start clean in v2.1: previous plugin opt-ins are not carried forward. Preserve appearance preferences only.
  if (!saved.__vilo21Initialized) {
    let previous = {}; try { previous = GM_getValue('vilo.v2.settings', {}) || {}; } catch {}
    saved = { theme: previous.theme || 'Violet Glow', customCSS: previous.customCSS || '', loggerLimit: previous.loggerLimit || 500, __vilo21Initialized: true };
  }
  const cfg = {
    ...defaults, ...saved,
    plugins: { ...defaults.plugins, ...(saved.plugins || {}) }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const enabled = id => cfg.plugins[id] === true;
  const save = () => GM_setValue(STORE, cfg);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // VuloChat's theme engine consumes RGB triples in these CSS custom properties.
  const palettes = {
    'Violet Glow': {'rail':'25 22 38','side':'34 29 51','chat':'42 36 61','input':'49 43 70','hover':'53 47 75','active':'64 56 91','line':'72 63 99','muted':'180 169 207','text':'237 231 250','bright':'250 247 255','accent':'167 139 250','accentHover':'146 115 235'},
    'Midnight': {'rail':'10 14 25','side':'16 23 39','chat':'22 31 51','input':'29 39 62','hover':'33 44 68','active':'42 57 86','line':'48 64 95','muted':'147 163 190','text':'207 219 241','bright':'241 246 255','accent':'124 156 255','accentHover':'99 133 235'},
    'Emerald': {'rail':'12 25 20','side':'18 38 30','chat':'24 49 39','input':'31 59 47','hover':'35 64 52','active':'43 77 62','line':'51 89 72','muted':'154 194 173','text':'216 240 226','bright':'243 255 247','accent':'69 214 160','accentHover':'47 184 132'},
    'Sunset': {'rail':'31 18 25','side':'48 28 37','chat':'64 37 49','input':'73 43 56','hover':'78 47 60','active':'91 54 69','line':'105 64 79','muted':'214 170 160','text':'255 232 222','bright':'255 247 241','accent':'255 155 114','accentHover':'235 128 89'},
    'Light': {'rail':'230 227 239','side':'244 242 250','chat':'255 255 255','input':'243 241 249','hover':'238 235 247','active':'225 220 241','line':'215 209 231','muted':'107 101 124','text':'43 37 58','bright':'25 20 39','accent':'112 86 216','accentHover':'91 65 194'}
  };
  const pluginList = [
    ['timestamps','Message timestamps','Keep VuloChat message times visible.'],
    ['compact','Compact messages','Reduce the vertical spacing between messages.'],
    ['copy','Quick copy','Add a copy button to every loaded message.'],
    ['codeCopy','Code block copy','Add a copy button to Markdown code blocks.'],
    ['charCount','Character counter','Show the draft character count.'],
    ['wordCount','Word counter','Show the draft word count.'],
    ['emojiBar','Quick emoji bar','Insert common emoji into the message composer.'],
    ['hideAvatars','Hide avatars','Hide message avatars without changing profiles.'],
    ['focusMode','Focus mode','Dim side navigation while reading.'],
    ['collapseMedia','Collapse message media','Collapse images and link previews in chat.'],
    ['linkLabels','External link labels','Mark links that leave VuloChat.'],
    ['jumpLatest','Jump to latest','Add a button to scroll to the newest message.'],
    ['draftBackup','Draft backup','Save and restore unsent drafts locally.'],
    ['enterNewline','Enter for new line','Override desktop Enter-to-send so Enter inserts a line instead.'],
    ['markdownHelp','Markdown helper','Show VuloChat Markdown formatting hints.'],
    ['imageFit','Image fit','Keep message images within the chat column.'],
    ['reduceMotion','Reduce motion','Reduce animations and smooth scrolling.'],
    ['messageLogger','Message logger','Optional local archive of messages rendered on screen.'],
    ['messageSearch','Message search','Highlight matching text in currently loaded messages.'],
    ['replyHighlight','Reply highlighting','Highlight reply context in the message list.'],
    ['readableText','Readable text','Increase message line spacing.']
  ];

  const style = document.createElement('style');
  style.id = 'vilo-v2-style';
  style.textContent = `
    .vilo-settings-root{color:rgb(var(--vulo-text));font:14px/1.5 Inter,system-ui,sans-serif}
    .vilo-settings-root *{box-sizing:border-box}
    .vilo-section{margin:0 0 26px}
    .vilo-title{font-size:22px;font-weight:750;color:rgb(var(--vulo-bright));margin:0 0 5px}
    .vilo-muted{color:rgb(var(--vulo-muted));font-size:12px}
    .vilo-card{background:rgb(var(--vulo-side));border:1px solid rgb(var(--vulo-line));border-radius:10px;padding:14px;margin:12px 0}
    .vilo-plugin-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border-bottom:1px solid rgb(var(--vulo-line));background:rgb(var(--vulo-side))}
    .vilo-plugin-row:first-of-type{border-radius:8px 8px 0 0}.vilo-plugin-row:last-child{border:0;border-radius:0 0 8px 8px}
    .vilo-plugin-row strong{display:block;color:rgb(var(--vulo-bright));font-weight:600}
    .vilo-plugin-row small{display:block;color:rgb(var(--vulo-muted));font-size:12px;margin-top:2px}
    .vilo-switch{width:40px;height:22px;accent-color:rgb(var(--vulo-accent));flex:none}
    .vilo-btn{border:1px solid rgb(var(--vulo-line));border-radius:7px;padding:8px 12px;background:rgb(var(--vulo-rail));color:rgb(var(--vulo-text));font:inherit;cursor:pointer}
    .vilo-btn:hover{background:rgb(var(--vulo-hover))}
    .vilo-btn.primary{background:rgb(var(--vulo-accent));color:white;border-color:transparent}
    .vilo-field{display:block;margin:12px 0;color:rgb(var(--vulo-text));font-size:13px}
    .vilo-input{display:block;width:100%;margin-top:6px;padding:9px 10px;border:1px solid rgb(var(--vulo-line));border-radius:7px;background:rgb(var(--vulo-rail));color:rgb(var(--vulo-text));font:inherit}
    .vilo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .vilo-theme-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}
    .vilo-theme-card{min-height:76px;text-align:left;border:2px solid rgb(var(--vulo-line));border-radius:9px;padding:10px;background:rgb(var(--vulo-rail));color:rgb(var(--vulo-text));cursor:pointer}
    .vilo-theme-card[aria-pressed=true]{border-color:rgb(var(--vulo-accent));box-shadow:0 0 0 2px rgb(var(--vulo-accent)/.18)}
    .vilo-theme-dots{display:flex;gap:5px;margin-top:10px}.vilo-theme-dots i{width:15px;height:15px;border-radius:50%}
    .vilo-inline-time{font-size:11px;color:rgb(var(--vulo-muted));margin-left:8px}
    .vilo-message-action{font-size:11px;border:1px solid rgb(var(--vulo-line));border-radius:5px;padding:3px 7px;margin:4px 6px 4px 0;background:rgb(var(--vulo-rail));color:rgb(var(--vulo-text));cursor:pointer}
    #vilo-emoji-bar{display:flex;gap:5px;margin:0 0 6px}
    #vilo-emoji-bar button{border:0;border-radius:6px;padding:5px 7px;background:rgb(var(--vulo-side));cursor:pointer}
    #vilo-jump-latest{position:fixed;z-index:40;right:24px;bottom:86px;border:0;border-radius:20px;padding:9px 13px;background:rgb(var(--vulo-accent));color:white;font-weight:600;box-shadow:0 4px 16px #0004;cursor:pointer}
    .vilo-collapsed-media{display:none!important}
    body.vilo-compact-chat article.group{margin-top:5px!important;padding-top:1px!important;padding-bottom:1px!important}
    body.vilo-hide-avatars article.group>div:first-child{display:none!important}
    body.vilo-focus-mode aside,body.vilo-focus-mode nav[aria-label="Servers"]{opacity:.35;transition:opacity .2s}
    body.vilo-focus-mode aside:hover,body.vilo-focus-mode nav[aria-label="Servers"]:hover{opacity:1}
    body.vilo-reduce-motion *,body.vilo-reduce-motion *::before,body.vilo-reduce-motion *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
    body.vilo-image-fit article.group img{max-width:min(100%,560px)!important;max-height:22rem!important;object-fit:contain}
    body.vilo-readable article.group .text-\\[15px\\]{line-height:1.7!important}
    body.vilo-show-times article.group time.hidden{display:block!important;opacity:1!important}
    .vilo-search-hit{outline:2px solid rgb(var(--vulo-accent));outline-offset:2px;border-radius:5px}
    .vilo-reply-highlight{border-left:3px solid rgb(var(--vulo-accent));padding-left:8px}
    @media(max-width:700px){.vilo-plugin-row{padding:10px}.vilo-theme-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.append(style);

  function applyTheme() {
    const root = document.documentElement;
    const palette = palettes[cfg.theme];
    if (palette) Object.entries(palette).forEach(([key,value]) => root.style.setProperty('--vulo-'+key,value));
    else ['rail','side','chat','input','hover','active','line','muted','text','bright','accent','accentHover'].forEach(key=>root.style.removeProperty('--vulo-'+key));
    let themeStyle = $('#vilo-imported-theme');
    if (!themeStyle) { themeStyle = document.createElement('style'); themeStyle.id = 'vilo-imported-theme'; document.head.append(themeStyle); }
    themeStyle.textContent = cfg.customCSS || '';
    root.style.colorScheme = cfg.theme === 'Light' ? 'light' : 'dark';
  }

  const chatArticles = () => $$('article.group').filter(el => el.querySelector('header time[datetime]') || el.querySelector('.markdown') || el.querySelector('img'));
  const messageText = el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('button,.vilo-message-action,.vilo-inline-time').forEach(n => n.remove());
    return (clone.innerText || '').trim();
  };
  const composer = () => $('textarea[aria-label="Message"]');
  const chatScroller = () => $('div[role="log"]');

  function setBodyClass(id, className) {
    document.body.classList.toggle(className, enabled(id));
  }
  function insertAtCursor(text) {
    const ta = composer();
    if (!ta || ta.disabled) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = ta.value.slice(0,start) + text + ta.value.slice(end);
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
    setter.call(ta,next);
    ta.dispatchEvent(new Event('input',{bubbles:true}));
    ta.focus();
    ta.setSelectionRange(start+text.length,start+text.length);
  }

  function decorateMessages() {
    const articles = chatArticles();
    articles.forEach(article => {
      const time = $('header time[datetime]',article);
      if (enabled('copy') && !$('.vilo-copy-message',article)) {
        const button = document.createElement('button');
        button.type='button';button.className='vilo-message-action vilo-copy-message';button.textContent='Copy';
        button.addEventListener('click', async e => {
          e.stopPropagation();
          try { await navigator.clipboard.writeText(messageText(article)); button.textContent='Copied'; }
          catch { button.textContent='Clipboard blocked'; }
          setTimeout(()=>button.textContent='Copy',1100);
        });
        const content = $(':scope > div.min-w-0',article) || article.lastElementChild || article;
        content.append(button);
      }
      if (enabled('codeCopy')) $$('pre',article).forEach(pre => {
        if ($('.vilo-copy-code',pre)) return;
        const b=document.createElement('button');b.type='button';b.className='vilo-message-action vilo-copy-code';b.textContent='Copy code';
        b.onclick=async e=>{e.stopPropagation();try{await navigator.clipboard.writeText($('code',pre)?.innerText||pre.innerText);b.textContent='Copied';}catch{b.textContent='Blocked';}setTimeout(()=>b.textContent='Copy code',1000)};
        pre.append(b);
      });
      if (!enabled('collapseMedia')) { $$('.vilo-message-action',article).filter(b=>b.textContent==='Hide media'||b.textContent==='Show media').forEach(b=>b.remove()); $$('img,iframe',article).forEach(m=>{m.removeAttribute('data-vilo-media');m.classList.remove('vilo-collapsed-media');}); }
      if (enabled('collapseMedia')) $$('img.msg-image, article img, article iframe',article).forEach(media => {
        if (media.dataset.viloMedia) return;
        media.dataset.viloMedia='1';
        const button=document.createElement('button');button.type='button';button.className='vilo-message-action';button.textContent='Hide media';
        button.onclick=e=>{e.stopPropagation();media.classList.toggle('vilo-collapsed-media');button.textContent=media.classList.contains('vilo-collapsed-media')?'Show media':'Hide media'};
        media.before(button);
      });
      if (!enabled('linkLabels')) $$('a[data-vilo-external]',article).forEach(a=>{const old=a.getAttribute('data-vilo-old-title');if(old===null)a.removeAttribute('title');else a.setAttribute('title',old);a.removeAttribute('data-vilo-old-title');a.removeAttribute('data-vilo-external');});
      if (enabled('linkLabels')) $$('a[href^="http"]',article).forEach(a => {
        try { if(new URL(a.href).origin!==location.origin){a.dataset.viloExternal='true';a.title='External link: '+new URL(a.href).hostname;} } catch {}
      });
      if (!enabled('replyHighlight')) $('.vilo-reply-highlight',article)?.classList.remove('vilo-reply-highlight');
      if (enabled('replyHighlight')) {
        const reply = $('p.mb-0\\.5',article);
        if (reply && /Replying to/.test(reply.innerText)) reply.classList.add('vilo-reply-highlight');
      }
    });
  }

  function updateComposer() {
    const ta=composer();
    if(!ta)return;
    let stats=$('#vilo-draft-stats');
    if(enabled('charCount')||enabled('wordCount')){
      if(!stats){stats=document.createElement('div');stats.id='vilo-draft-stats';ta.after(stats);}
      const value=ta.value||'';
      stats.textContent=[
        enabled('charCount')?value.length+' characters':'',
        enabled('wordCount')?(value.trim()?value.trim().split(/\\s+/).length:0)+' words':''
      ].filter(Boolean).join(' · ');
    } else stats?.remove();

    if(enabled('emojiBar')&&!$('#vilo-emoji-bar')){
      const bar=document.createElement('div');bar.id='vilo-emoji-bar';
      ['😀','😂','😭','❤️','🔥','👍','🎉','✨'].forEach(emoji=>{
        const b=document.createElement('button');b.type='button';b.textContent=emoji;b.title='Insert '+emoji;b.onclick=()=>insertAtCursor(emoji);bar.append(b);
      });
      ta.parentElement?.parentElement?.before(bar);
    } else if(!enabled('emojiBar')) $('#vilo-emoji-bar')?.remove();

    if(enabled('markdownHelp')&&!$('#vilo-markdown-help')){
      const hint=document.createElement('div');hint.id='vilo-markdown-help';hint.className='text-xs text-vulo-muted';hint.textContent='Markdown: **bold** · *italic* · `code` · > quote · - list';
      ta.parentElement?.parentElement?.after(hint);
    } else if(!enabled('markdownHelp')) $('#vilo-markdown-help')?.remove();

    const draftKey=DRAFT+':'+location.pathname;
    if(enabled('draftBackup')&&!ta.dataset.viloDraftBound){
      ta.dataset.viloDraftBound='1';
      const drafts=GM_getValue(DRAFT,{});
      if(!ta.value && drafts[draftKey]) {
        const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
        setter.call(ta,drafts[draftKey]);ta.dispatchEvent(new Event('input',{bubbles:true}));
      }
      ta.addEventListener('input',()=>{if(!enabled('draftBackup'))return;const all=GM_getValue(DRAFT,{});if(ta.value)all[draftKey]=ta.value;else delete all[draftKey];GM_setValue(DRAFT,all);});
    }
    if(!ta.dataset.viloEnterBound){
      ta.dataset.viloEnterBound='1';
      ta.addEventListener('keydown',e=>{
        if(enabled('enterNewline')&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!/iPhone|iPad|Android/i.test(navigator.userAgent)){
          e.stopImmediatePropagation();
        }
      },true);
    }
  }

  function captureRenderedMessages() {
    if(!enabled('messageLogger'))return;
    const log=GM_getValue(LOG,[]);
    const seen=new Set(log.slice(-150).map(item=>item.text+'|'+item.channel));
    let changed=false;
    chatArticles().forEach(article=>{
      const text=messageText(article);
      if(!text)return;
      const channel=location.pathname;
      const key=text+'|'+channel;
      if(!seen.has(key)){
        log.push({text:text.slice(0,4000),capturedAt:new Date().toISOString(),page:channel});
        seen.add(key);changed=true;
      }
    });
    if(changed)GM_setValue(LOG,log.slice(-Math.max(50,Math.min(2000,Number(cfg.loggerLimit)||500))));
  }

  function updateSearch() {
    if(!enabled('messageSearch')){chatArticles().forEach(a=>a.classList.remove('vilo-search-hit'));const status=$('#vilo-search-count');if(status)status.textContent='Message search is disabled in Plugins.';return;}
    const input=$('#vilo-search-input');
    if(!input)return;
    const query=input.value.trim().toLowerCase();
    chatArticles().forEach(article=>article.classList.toggle('vilo-search-hit',!!query&&messageText(article).toLowerCase().includes(query)));
    const count=chatArticles().filter(article=>query&&messageText(article).toLowerCase().includes(query)).length;
    const status=$('#vilo-search-count');if(status)status.textContent=query?count+' matches in loaded messages':'Searches only messages currently loaded in this chat.';
  }

  function refresh() {
    if(!document.body)return;
    setBodyClass('compact','vilo-compact-chat');
    setBodyClass('hideAvatars','vilo-hide-avatars');
    setBodyClass('focusMode','vilo-focus-mode');
    setBodyClass('reduceMotion','vilo-reduce-motion');
    setBodyClass('imageFit','vilo-image-fit');
    setBodyClass('readableText','vilo-readable');
    setBodyClass('timestamps','vilo-show-times');
    decorateMessages();
    updateComposer();
    if(enabled('jumpLatest')&&!$('#vilo-jump-latest')){
      const b=document.createElement('button');b.id='vilo-jump-latest';b.type='button';b.textContent='↓ Latest';
      b.onclick=()=>{const scroller=chatScroller();if(scroller)scroller.scrollTo({top:scroller.scrollHeight,behavior:enabled('reduceMotion')?'auto':'smooth'});};
      document.body.append(b);
    } else if(!enabled('jumpLatest')) $('#vilo-jump-latest')?.remove();
    captureRenderedMessages();
    updateSearch();
  }

  function createPanelContent() {
    return `
      <div class="vilo-settings-root">
        <section class="vilo-section">
          <h2 class="vilo-title">Vilo</h2>
          <p class="vilo-muted">Plugins and appearance extensions for VuloChat. Settings are saved on this device.</p>
        </section>
        <section id="vilo-page-plugins" class="vilo-section">
          <h3 class="mb-3 text-lg font-bold text-vulo-bright">Plugins</h3>
          <div class="vilo-card"><b>21 plugins available</b><p class="vilo-muted">All plugins start disabled. Search by name or description, then enable only what you want.</p><input id="vilo-plugin-search" class="vilo-input" type="search" placeholder="Search plugins..." autocomplete="off"><p id="vilo-plugin-results" class="vilo-muted mt-2">Showing all 21 plugins</p></div>
          <div id="vilo-plugin-list"></div>
        </section>
        <section id="vilo-page-themes" class="vilo-section" hidden>
          <h3 class="mb-3 text-lg font-bold text-vulo-bright">Themes</h3>
          <p class="vilo-muted mb-3">These themes recolor VuloChat's existing interface, not just the Vilo settings panel.</p>
          <div class="vilo-theme-grid" id="vilo-theme-grid"></div>
          <div class="vilo-card">
            <b>Import custom theme</b>
            <p class="vilo-muted mt-1">Choose a .theme.css file. It is stored locally and applied to this browser only.</p>
            <label class="vilo-field">Theme CSS file<input id="vilo-theme-file" class="vilo-input" type="file" accept=".theme.css,.css,text/css"></label>
            <div class="vilo-actions"><button class="vilo-btn" id="vilo-reset-theme">Reset to Violet Glow</button></div>
            <p class="vilo-muted mt-2" id="vilo-theme-status"></p>
          </div>
        </section>
        <section id="vilo-page-logger" class="vilo-section" hidden>
          <h3 class="mb-3 text-lg font-bold text-vulo-bright">Message logger</h3>
          <div class="vilo-card">
            <p class="vilo-muted">Off by default. When enabled, Vilo stores text from message elements currently rendered in your browser, on this device only. It does not fetch hidden history, intercept network traffic, or upload logs. Respect other people's privacy before exporting or sharing an archive.</p>
            <label class="vilo-field"><input id="vilo-logger-toggle" type="checkbox"> Enable local logger</label>
            <label class="vilo-field">Maximum entries<select id="vilo-logger-limit" class="vilo-input"><option>100</option><option>250</option><option>500</option><option>1000</option><option>2000</option></select></label>
            <p id="vilo-logger-count" class="vilo-muted"></p>
            <div class="vilo-actions"><button class="vilo-btn primary" id="vilo-export-log">Export JSON</button><button class="vilo-btn" id="vilo-delete-log">Delete archive</button></div>
          </div>
        </section>
        <section id="vilo-page-tools" class="vilo-section" hidden>
          <h3 class="mb-3 text-lg font-bold text-vulo-bright">Tools</h3>
          <div class="vilo-card">
            <b>Find in loaded messages</b>
            <input id="vilo-search-input" class="vilo-input" placeholder="Search current channel messages">
            <p id="vilo-search-count" class="vilo-muted mt-2">Searches only messages currently loaded in this chat.</p>
            <div class="vilo-actions"><button class="vilo-btn" id="vilo-clear-search">Clear search</button></div>
          </div>
          <div class="vilo-card"><b>Local clock</b><p id="vilo-clock" class="mt-1"></p></div>
          <p class="vilo-muted">Vilo is an independent userscript, not an official VuloChat feature.</p>
          <a class="text-vulo-accent underline" href="https://github.com/Tvmanisback/Vilo" target="_blank" rel="noopener noreferrer">Vilo on GitHub</a>
        </section>
        <div class="border-b border-vulo-line pb-4 mb-5"><h2 class="vilo-title">Vilo</h2><p class="vilo-muted">Independent VuloChat enhancements</p></div>
        <nav class="flex flex-wrap gap-2 border-t border-vulo-line pt-4" aria-label="Vilo sections">
          <button class="vilo-btn" data-vilo-page="plugins">Plugins</button>
          <button class="vilo-btn" data-vilo-page="themes">Themes</button>
          <button class="vilo-btn" data-vilo-page="logger">Logger</button>
          <button class="vilo-btn" data-vilo-page="tools">Tools</button>
        </nav>
      </div>`;
  }

  function renderViloPage(page) {
    ['plugins','themes','logger','tools'].forEach(id=>{
      const section=$('#vilo-page-'+id);
      if(section)section.hidden=id!==page;
      const button=$('[data-vilo-page="'+id+'"]');
      if(button)button.classList.toggle('primary',id===page);
    });
    if(page==='plugins') {
      const list=$('#vilo-plugin-list');
      list.innerHTML=pluginList.map(([id,name,description])=>`
        <label class="vilo-plugin-row">
          <span><strong>${esc(name)}</strong><small>${esc(description)}</small></span>
          <input class="vilo-switch" type="checkbox" data-vilo-plugin="${id}" ${enabled(id)?'checked':''}>
        </label>`).join('');
      $('[data-vilo-plugin]',list).forEach(input=>input.addEventListener('change',()=>{
        cfg.plugins[input.dataset.viloPlugin]=input.checked;save();refresh();
      }));
      const search=$('#vilo-plugin-search');
      search.oninput=()=>{const q=search.value.trim().toLowerCase();let shown=0;$('.vilo-plugin-row',list).forEach(row=>{const match=!q||row.innerText.toLowerCase().includes(q);row.hidden=!match;if(match)shown++;});$('#vilo-plugin-results').textContent=`Showing ${shown} of ${pluginList.length} plugins`;};
    }
    if(page==='themes') {
      const grid=$('#vilo-theme-grid');
      grid.innerHTML=Object.keys(palettes).map(name=>{
        const p=palettes[name];
        return `<button type="button" class="vilo-theme-card" data-vilo-theme="${esc(name)}" aria-pressed="${cfg.theme===name}">
          <strong>${esc(name)}</strong><span class="vilo-theme-dots"><i style="background:rgb(${p.rail})"></i><i style="background:rgb(${p.side})"></i><i style="background:rgb(${p.chat})"></i><i style="background:rgb(${p.accent})"></i></span>
        </button>`;
      }).join('');
      $$('[data-vilo-theme]',grid).forEach(button=>button.onclick=()=>{
        cfg.theme=button.dataset.viloTheme;save();applyTheme();renderViloPage('themes');
        $('#vilo-theme-status').textContent='Applied '+cfg.theme+'.';
      });
      $('#vilo-theme-file').onchange=async event=>{
        const file=event.target.files?.[0];if(!file)return;
        if(file.size>200000){$('#vilo-theme-status').textContent='Theme files must be under 200 KB.';return;}
        const css=await file.text();
        if(/<\s*script|javascript:|expression\s*\(|@import\s+url/i.test(css)){ $('#vilo-theme-status').textContent='This CSS contains blocked active content.';return; }
        cfg.customCSS=css;cfg.theme='Custom';save();applyTheme();
        $('#vilo-theme-status').textContent='Imported and applied '+file.name+'.';
      };
      $('#vilo-reset-theme').onclick=()=>{cfg.customCSS='';cfg.theme='Violet Glow';save();applyTheme();renderViloPage('themes');};
    }
    if(page==='logger') {
      $('#vilo-logger-toggle').checked=enabled('messageLogger');
      $('#vilo-logger-limit').value=String(cfg.loggerLimit);
      $('#vilo-logger-count').textContent=GM_getValue(LOG,[]).length+' locally stored entries.';
      $('#vilo-logger-toggle').onchange=e=>{cfg.plugins.messageLogger=e.target.checked;save();refresh();};
      $('#vilo-logger-limit').onchange=e=>{cfg.loggerLimit=Number(e.target.value);save();};
      $('#vilo-export-log').onclick=()=>{
        const blob=new Blob([JSON.stringify(GM_getValue(LOG,[]),null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='vilo-message-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      };
      $('#vilo-delete-log').onclick=()=>{
        if(confirm('Delete the locally stored Vilo message archive?')){GM_setValue(LOG,[]);$('#vilo-logger-count').textContent='0 locally stored entries.';}
      };
    }
    if(page==='tools') {
      $('#vilo-search-input').oninput=updateSearch;
      $('#vilo-clear-search').onclick=()=>{$('#vilo-search-input').value='';updateSearch();};
      $('#vilo-clock').textContent=new Date().toLocaleString();
    }
  }

  function installViloSettingsTab() {
    const dialog=$('[role="dialog"][aria-label="User settings"]');
    if(!dialog)return;
    const nav=dialog.querySelector('nav > div'), main=dialog.querySelector(':scope > div');
    if(!nav||!main||$('#vilo-native-tab',nav))return;
    const divider=$$('div',nav).find(el=>el.className.includes('h-px'));
    if(!divider)return;
    const button=document.createElement('button');
    button.id='vilo-native-tab';button.type='button';button.textContent='Vilo';
    button.className='block w-full rounded px-2 py-1.5 text-left text-[15px] text-vulo-muted hover:bg-vulo-hover hover:text-vulo-text';
    button.onclick=()=>{
      const original=main.querySelector(':scope > div');
      if(original){original.hidden=true;original.setAttribute('data-vilo-native-content','true');}
      let mount=$('#vilo-settings-content',main);
      if(!mount){mount=document.createElement('div');mount.id='vilo-settings-content';mount.className='mx-auto max-w-2xl';mount.innerHTML=createPanelContent();main.append(mount);$$('nav[aria-label="Vilo sections"] [data-vilo-page]',mount).forEach(x=>x.onclick=()=>renderViloPage(x.dataset.viloPage));}
      button.className='block w-full rounded px-2 py-1.5 text-left text-[15px] bg-vulo-active text-vulo-bright';
      renderViloPage('plugins');
    };
    divider.after(button);
    const logout=Array.from(nav.querySelectorAll('button')).find(x=>/log out/i.test(x.textContent||''));
    if(logout)nav.append(logout);
    $$('button',nav).forEach(other=>{if(other===button||other.dataset.viloSwitchBound)return;other.dataset.viloSwitchBound='1';other.addEventListener('click',()=>{const original=main.querySelector(':scope > div[data-vilo-native-content]');if(original){original.hidden=false;original.removeAttribute('data-vilo-native-content');}$('#vilo-settings-content',main)?.remove();button.className='block w-full rounded px-2 py-1.5 text-left text-[15px] text-vulo-muted hover:bg-vulo-hover hover:text-vulo-text';},true);});
  }


  applyTheme();refresh();installViloSettingsTab();
  let scheduled=false;
  const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;installViloSettingsTab();refresh();});});
  observer.observe(document.body,{childList:true,subtree:true});

})();
