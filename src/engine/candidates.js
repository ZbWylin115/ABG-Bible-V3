import { rndPick } from './util.js';
import { EDGY } from '../../data/edgy.js';

export function buildCandidates({opts, arch, ven, plat, cityPack}){
  return opts.channel==='Virtual'
    ? buildVirtualPool({plat, time:opts.time, edgy:opts.edgy, goal:opts.goal})
    : buildIRLPool({arch, ven, time:opts.time, edgy:opts.edgy, goal:opts.goal, cityPack});
}

/* --------- IRL ---------- */
function buildIRLPool({arch, ven, time, edgy, goal, cityPack}){
  const timeTag = time;
  const vt = ven.id;

  const openers = [
    ...(arch.openers||[]).map(t=>({key:`arch_open:${arch.id}:${t}`, text:t, soft:t, tags:['irl','talky', timeTag, arch.tone.energy, vt, 'nonedgy'], risk:'soft'})),
    ...(ven.openers||[]).map(t=>({key:`ven_open:${vt}:${t}`, text:t, standard:t, tags:['irl','talky', timeTag, vt, 'nonedgy'], risk:'soft'})),
  ];
  if(edgy){
    openers.push(...(EDGY.moves.slice(0,4).map(m=>({key:`edgy_open:${m.label}`, text:m.edge, bold:m.edge, tags:['irl','edgy', timeTag, vt], risk:'bold'}))));
  }

  const hooks = [
    {key:`hook:topic:${arch.id}`, text:`Ask about: ${(arch.safe_topics||['current obsession'])[0]}.`, tags:['irl','talky', vt, timeTag], risk:'soft'},
    {key:`hook:venue:${vt}`, text:`Venue observation → tie to her (short).`, tags:['irl','talky', vt, timeTag], risk:'soft'},
  ];

  const moves = [
    {key:`move:2fork`, text:'2-option fork: “A or B — choose wisely.”', tags:['irl','game',vt,timeTag], risk:'soft'},
    {key:`move:rate10`, text:'Rate-it-quick (1–10) + “what makes it a 10?”', tags:['irl','game',vt,timeTag], risk:'soft'},
  ];
  if(vt==='karaoke') moves.push({key:`move:duet`, text:'Duet draft: you pick mine, I pick yours.', tags:['irl','game','karaoke',timeTag], risk:'standard'});
  if(vt==='rooftop_bar') moves.push({key:`move:photo`, text:'Photo co-direct: swap one pose each.', tags:['irl','game','rooftop_bar',timeTag,'intimate'], risk:'standard'});
  if(vt==='club') moves.push({key:`move:songbet`, text:'Song bet: “If the drop slaps, you owe a cheers.”', tags:['irl','game','club','loud','dance',timeTag], risk:'standard'});

  const pivots = [
    ...(ven.pivots||[]).map(t=>({key:`pivot:${vt}:${t}`, text:t, tags:['irl','pivot',vt,timeTag], risk:'soft'})),
    ...(time==='late_night' ? [{key:'pivot:latefood', text:'Late-food reset nearby.', tags:['irl','pivot','late_night'], risk:'soft'}] : []),
  ];

  const closers = closerOptions(goal, time, cityPack).map((t,i)=>({key:`close:${goal}:${i}`, text:t, tags:['irl','close',goal,timeTag], risk: i===0 ? 'standard' : 'soft'}));

  return { openers, hooks, moves, pivots, closers };
}

/* --------- Virtual ---------- */
function buildVirtualPool({plat, time, edgy, goal}){
  const openers = [
    ...(plat.sample?.safe||[]).map(t=>({key:`vopen:safe:${plat.id}:${t}`, text:t, soft:t, tags:['virtual','talky',plat.id,time], risk:'soft'})),
  ];
  if(edgy){
    openers.push(...(plat.sample?.edge||[]).map(t=>({key:`vopen:edge:${plat.id}:${t}`, text:t, bold:t, tags:['virtual','edgy',plat.id,time], risk:'bold'})));
  }
  const hooks = [
    {key:`vhook:prompt`, text:'Mini-prompt tied to her post (Top 3 ___?).', tags:['virtual','talky',plat.id,time], risk:'soft'},
    {key:`vhook:voice`, text:'Short voice note to escalate tone.', tags:['virtual','voice',plat.id,time], risk:'standard'},
  ];
  const moves = [
    {key:`vmove:twoOptions`, text:'Offer 2 windows (“Thu 7–9 or Sat afternoon?”).', tags:['virtual','plan',plat.id,time], risk:'soft'},
  ];
  const pivots = [
    {key:`vpivot:call`, text:'Quick call to vibe-check (8–12 min).', tags:['virtual','pivot',plat.id,time], risk:'standard'},
  ];
  const closers = closerOptions(goal, time).map((t,i)=>({key:`vclose:${goal}:${i}`, text:t, tags:['virtual','close',goal,time], risk: i===0 ? 'standard' : 'soft'}));
  return { openers, hooks, moves, pivots, closers };
}

/* --------- helpers ---------- */
function closerOptions(goal, time, cityPack){
  const alt  = cityPack ? rndPick(cityPack.alt)?.name : null;
  const main = cityPack ? rndPick(cityPack.main)?.name : null;
  const now = alt ? `Bounce now → ${alt}` : 'Bounce now → quieter spot';
  const set = main ? `Lock next: ${main} ${time==='day'?'(day)':'(evening)'} — I’ll text 2 options.` : 'Lock next: same vibe, I’ll text 2 options.';
  const light = 'Swap IG + 1 callback topic.';
  if(goal==='pull_now') return [now, set, light];
  if(goal==='vibe')     return [light, set];
  return [set, now, light];
}
