import { DATA } from '../data/archetypes.js';
import { VENUES } from '../data/venues.js';
import { PLATS } from '../data/platforms.js';
import { ETH } from '../data/ethnicity.js';
import { SIG } from '../data/signals.js';
import { EDGY } from '../data/edgy.js';
import { DISCOVERY } from '../data/discovery.js';

import { CITIES } from '../data/cities/la.js';
import { CITY_VEGAS } from '../data/cities/vegas.js';
import { CITY_HOUSTON } from '../data/cities/houston.js';
import { CITY_SLC } from '../data/cities/slc.js';
import { CITY_NYC } from '../data/cities/nyc.js';
import { CITY_BAY } from '../data/cities/bayarea.js';
import { CITY_SEA } from '../data/cities/seattle.js';

import { generatePlan, rerollBeat } from './generator.js';
import { updateFeedback } from './engine/learn.js';
import { saveLastPlan, loadLastPlan } from './engine/state.js';

const cityMap = { la:CITIES, vegas:CITY_VEGAS, houston:CITY_HOUSTON, slc:CITY_SLC, nyc:CITY_NYC, bayarea:CITY_BAY, seattle:CITY_SEA };

function $(id){ return document.getElementById(id); }
function populateSelect(el, arr, includeNone=false){
  el.innerHTML = '';
  if(includeNone){ const o=document.createElement('option'); o.value=''; o.textContent='(none)'; el.appendChild(o); }
  arr.forEach(it=>{
    const opt = document.createElement('option');
    opt.value = it.id || it.name;
    opt.textContent = it.label || it.name;
    el.appendChild(opt);
  });
}
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
}

export function initUI(){
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));

  // Selects
  populateSelect($('archetype'), DATA.archetypes);
  populateSelect($('venue'), VENUES.venues);
  populateSelect($('platform'), PLATS.platforms);
  populateSelect($('city'), [
    {id:'la',label:'Los Angeles'},{id:'vegas',label:'Las Vegas'},{id:'houston',label:'Houston'},
    {id:'slc',label:'Salt Lake City'},{id:'nyc',label:'New York City'},
    {id:'bayarea',label:'Bay Area'},{id:'seattle',label:'Seattle'}
  ]);
  populateSelect($('ethnicity'), ETH.list, true);

  // Party size chips
  document.getElementById('partySize').addEventListener('click', e=>{
    const b = e.target.closest('.chip'); if(!b) return;
    document.querySelectorAll('#partySize .chip').forEach(c=>c.classList.remove('chip-active'));
    b.classList.add('chip-active');
    b.blur();
  });

  // "How to Find" list
  const dl = document.getElementById('discover-list');
  dl.innerHTML = DISCOVERY.items.map(x=>`
    <div class="card">
      <h3>${x.label}</h3>
      <p><b>Why:</b> ${x.why}</p>
      <p><b>Best:</b> ${x.best}</p>
      <p><b>Approach:</b> ${x.energy}</p>
      <p><b>Pivot:</b> ${x.pivot}</p>
      <p><b>Avoid:</b> ${x.avoid}</p>
    </div>`).join('');

  // Signals reference
  const fill = (ul, arr)=>{ ul.innerHTML = arr.map(x=>`<li>${x}</li>`).join(''); };
  fill($('signals-irl-baseline'), SIG.irl.baseline);
  fill($('signals-irl-green'), SIG.irl.green);
  fill($('signals-irl-yellow'), SIG.irl.yellow);
  fill($('signals-irl-red'), SIG.irl.red);
  fill($('signals-vir-baseline'), SIG.virtual.baseline);
  fill($('signals-vir-green'), SIG.virtual.green);
  fill($('signals-vir-yellow'), SIG.virtual.yellow);
  fill($('signals-vir-red'), SIG.virtual.red);

  // Edgy list
  const edgy = document.getElementById('edgy-list');
  edgy.innerHTML = EDGY.moves.map(m=>`
    <div class="card">
      <h3>${m.label} <span class="badge edgy">EDGY</span></h3>
      <p>${m.summary}</p>
      <p><strong>Why it works:</strong> ${m.why}</p>
      <p><strong>Risk:</strong> ${m.risk}</p>
      <p><strong>Edge:</strong> ${m.edge}</p>
      <p><strong>Safe:</strong> ${m.safe}</p>
    </div>
  `).join('');

  // City packs page
  const clist = document.getElementById('cities-list');
  function renderCity(key, title){
    const pack = cityMap[key];
    const main = pack.main.map(s=>`<li><strong>${s.name}</strong> — ${s.desc}</li>`).join('');
    const alt = pack.alt.map(s=>`<li>${s.name} — ${s.desc}</li>`).join('');
    return `<div class="card"><h3>${title}</h3><h4>Main Spots</h4><ul>${main}</ul><h4>Alt Spots</h4><ul>${alt}</ul></div>`;
  }
  clist.innerHTML = [
    renderCity('la','Los Angeles'),
    renderCity('vegas','Las Vegas'),
    renderCity('houston','Houston'),
    renderCity('slc','Salt Lake City Metro'),
    renderCity('nyc','New York City'),
    renderCity('bayarea','Bay Area (SF/SJ/Oakland)'),
    renderCity('seattle','Seattle')
  ].join('');

  // Channel toggle
  $('channel').addEventListener('change', ()=>{
    const showVirtual = $('channel').value==='Virtual';
    $('platform-field').hidden = !showVirtual;
    $('venue-field').hidden = showVirtual;
  });
  $('channel').dispatchEvent(new Event('change'));

  // Actions
  $('generate').addEventListener('click', onGenerate);
  $('shuffle').addEventListener('click', onShuffle);
  $('copy').addEventListener('click', onCopy);
  $('save').addEventListener('click', onSave);
  $('viewSaved').addEventListener('click', onViewSaved);
  $('closeSaved').addEventListener('click', ()=>$('savedDialog').close());
  $('clearSaved').addEventListener('click', onClearSaved);

  // Feedback buttons
  document.querySelectorAll('#feedbackBox .chip[data-fb]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const outcome = btn.dataset.fb; // meh/good/great
      const last = loadLastPlan();
      if(!last){ alert('Generate a plan first.'); return; }
      updateFeedback({ moveKeys: last.moves||[], outcome });
      alert('Noted — generator learned.');
    });
  });
  document.querySelectorAll('#feedbackBox .chip[data-sig]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const signal = btn.dataset.sig; // green/yellow/red
      const last = loadLastPlan();
      if(!last){ alert('Generate a plan first.'); return; }
      updateFeedback({ moveKeys: last.moves||[], outcome:'good', signal });
      alert('Signals logged — planner adjusted.');
      // quick regenerate tilt
      onGenerate(signal);
    });
  });

  // Beat reroll + copy buttons (event delegation)
  document.addEventListener('click', (e)=>{
    const rr = e.target.closest('[data-reroll]'); 
    if(rr){ onReroll(rr.dataset.reroll); return; }
    const cp = e.target.closest('[data-copy]'); 
    if(cp){ copyText(cp.dataset.copy); return; }
  });
}

function getParty(){
  const on = document.querySelector('#partySize .chip-active');
  return on?.dataset?.val || 'solo';
}

function getOpts(){
  return {
    channel: $('channel').value,
    archetype: $('archetype').value,
    venue: $('venue').value,
    platform: $('platform').value,
    city: $('city').value,
    time: $('timeOfDay').value,
    interest: $('interest').value,
    edgy: $('edgy').checked,
    includeEth: $('includeEth').checked,
    ethnicity: $('ethnicity').value,
    mode: $('mode')?.value || 'normal',
    goal: $('goal')?.value || 'set_date',
    party: getParty()
  };
}

function renderBeats(beats){
  if(!beats || !beats.length) return '';
  return beats.map(b=>{
    const parts = [];
    parts.push(`<h4>${b.tag}</h4>`);
    parts.push(`<div class="beat-actions">
      <button class="chip" data-reroll="${b.tag}">🎲 Reroll</button>
      <button class="chip" data-copy="${textForCopy(b)}">Copy ${b.tag}</button>
    </div>`);
    if(b.soft || b.standard || b.bold){
      parts.push('<ul>');
      if(b.soft)     parts.push(`<li><strong>Soft:</strong> ${b.soft}</li>`);
      if(b.standard) parts.push(`<li><strong>Standard:</strong> ${b.standard}</li>`);
      if(b.bold)     parts.push(`<li><span class="badge edgy">Bold</span> ${b.bold}</li>`);
      parts.push('</ul>');
    }
    if(b.advice) parts.push('<ul>'+b.advice.map(a=>`<li>${a}</li>`).join('')+'</ul>');
    if(b.micro)  parts.push('<ul>'+b.micro.map(m=>`<li>${m}</li>`).join('')+'</ul>');
    if(b.options)parts.push('<ul>'+b.options.map(o=>`<li>${o}</li>`).join('')+'</ul>');
    return `<div class="beat">${parts.join('')}</div>`;
  }).join('');
}
function textForCopy(b){
  if(b.soft||b.standard||b.bold) return (b.bold||b.standard||b.soft);
  if(b.advice) return b.advice.join(' • ');
  if(b.micro) return b.micro.join(' • ');
  if(b.options) return b.options.join(' • ');
  return '';
}

function renderOutput(plan){
  const out = document.getElementById('output');
  out.classList.add('output');
  out.innerHTML = `
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px">
      <button class="chip" data-copy="${strip(out.innerText||'')}">Copy Plan</button>
    </div>
    <h3>Scene Setup</h3><p>${plan.scene}</p>
    ${plan.beats ? `<h3>Beat Plan</h3>${renderBeats(plan.beats)}` : ''}
    ${plan.cityNote?`<h3>Local Note</h3><p>${plan.cityNote}</p>`:''}
    ${plan.ethNote?`<h3>Context</h3><p>${plan.ethNote}</p>`:''}
    <h3>Do</h3><ul>${plan.do.map(x=>`<li>${x}</li>`).join('')}</ul>
    <h3>Don’t</h3><ul>${plan.dont.map(x=>`<li>${x}</li>`).join('')}</ul>
    <h3>Signals</h3><p><strong>${plan.signalTag}</strong></p>`;
  out.dataset.plan = JSON.stringify(plan);
  saveLastPlan(plan);
  document.getElementById('feedbackBox').hidden = false;
}

function strip(s){ return (s||'').replace(/\s+/g,' ').trim(); }

function onGenerate(liveSignal=null){
  const opts = getOpts();
  const plan = generatePlan(opts);
  if(liveSignal) plan.ctx.liveSignal = liveSignal;
  renderOutput(plan);
}
function onShuffle(){ onGenerate(); }

async function onCopy(){
  const txt = document.getElementById('output').innerText;
  copyText(txt);
}
async function copyText(txt){
  try{ await navigator.clipboard.writeText(txt); alert('Copied.'); }
  catch{ alert('Copy failed. Select text and copy manually.'); }
}
function onSave(){
  const out = document.getElementById('output');
  if(!out.dataset.plan){ alert('Generate a plan first.'); return; }
  const plan = JSON.parse(out.dataset.plan);
  const list = JSON.parse(localStorage.getItem('abg_saved')||'[]');
  plan.savedAt = new Date().toISOString();
  list.push(plan);
  localStorage.setItem('abg_saved', JSON.stringify(list));
  alert('Saved.');
}
function onViewSaved(){
  const list = JSON.parse(localStorage.getItem('abg_saved')||'[]');
  const c = document.getElementById('savedList');
  c.innerHTML = !list.length ? '<p class="small">No saved plans yet.</p>' :
    list.map(p=>`<div class="card"><div class="small">${new Date(p.savedAt).toLocaleString()}</div><div>${p.scene}</div></div>`).join('');
  document.getElementById('savedDialog').showModal();
}
function onClearSaved(){
  if(confirm('Clear all saved plans?')){
    localStorage.removeItem('abg_saved');
    document.getElementById('savedList').innerHTML = '<p class="small">Cleared.</p>';
  }
}

function onReroll(tag){
  const out = document.getElementById('output');
  if(!out.dataset.plan){ alert('Generate a plan first.'); return; }
  const plan = JSON.parse(out.dataset.plan);
  const newPlan = rerollBeat(plan, tag);
  renderOutput(newPlan);
}
