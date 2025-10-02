// Intro pop-up shown on first load; accessible from menu via window.showIntro()
const KEY = 'abg_v3_intro_seen';

function template(){
  return `
  <dialog id="introDialog" style="max-width:720px;background:#120d12;border:1px solid #2a1920;color:#f7f2f4;border-radius:14px;padding:16px">
    <h2 style="margin-top:0">How to use this app (30 seconds)</h2>
    <ul>
      <li><b>Read the room.</b> Use the generator as a <i>plan</i>, not a script.</li>
      <li><b>Signals lead.</b> 🟢 escalate • 🟡 coast • 🔴 stop • ⚪ baseline.</li>
      <li><b>Pick your path.</b> Mode (safe/normal/spicy) × Goal (vibe/set date/pull now).</li>
      <li><b>Respect is default.</b> Edge is spice; consent is mandatory.</li>
      <li><b>Keep it light.</b> Short beats, fun pivots, clean exits.</li>
      <li><b>Learn together.</b> Tap “Meh/Good/Great” to tune the planner locally.</li>
    </ul>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
      <button id="introSignals">View Signals</button>
      <button id="introCustomize">Customize Now</button>
      <button id="introClose" style="background:#ff2a56;color:white;border:1px solid #68182a;border-radius:10px;padding:8px 12px">Got it</button>
    </div>
  </dialog>`;
}

function mount(){
  if(document.getElementById('introDialog')) return;
  document.body.insertAdjacentHTML('beforeend', template());
  const dlg = document.getElementById('introDialog');
  document.getElementById('introClose').onclick = ()=>{ dlg.close(); localStorage.setItem(KEY,'1'); };
  document.getElementById('introCustomize').onclick = ()=>{
    dlg.close(); localStorage.setItem(KEY,'1');
    document.querySelector('details.advanced')?.setAttribute('open','open');
    document.querySelector('[data-tab="generator"]')?.click();
  };
  document.getElementById('introSignals').onclick = ()=>{
    dlg.close(); localStorage.setItem(KEY,'1');
    document.querySelector('[data-tab="signals"]')?.click();
  };
  window.showIntro = ()=>dlg.showModal();
  if(!localStorage.getItem(KEY)) dlg.showModal();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', mount);
}else{
  mount();
}
