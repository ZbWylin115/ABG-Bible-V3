import { rndPick, uniq, hash } from './util.js';
import { scoreMove } from './scoring.js';

function pickTop(cands, ctx, excludeKey=null){
  const pool = cands.filter(c => !excludeKey || c.key !== excludeKey);
  const scored = pool.map(m=>({m, s:scoreMove(m,ctx)}));
  scored.sort((a,b)=>b.s - a.s);
  const top = scored.slice(0,3);
  return top[0]?.m || pool[0];
}

export function buildPlan({ pool, ctx }){
  const open  = pickTop(pool.openers, ctx);
  const hook  = pickTop(pool.hooks, ctx);
  const move  = pickTop(pool.moves, ctx);
  const pivot = pickTop(pool.pivots, ctx);
  const close = pickTop(pool.closers, ctx);

  const beats = [
    { tag:'Open',   soft: open.soft || open.text,  standard: open.standard || null, bold: open.bold || null, key: open.key, chosen: chooseLabel(open) },
    { tag:'Hook',   advice: [hook.text], key: hook.key, chosen:'advice' },
    { tag:'Move',   micro: [move.text],  key: move.key, chosen:'micro' },
    { tag:'Pivot',  options: [pivot.text], key: pivot.key, chosen:'option' },
    { tag:'Close',  options: close.text? [close.text] : (close.options||[]), key: close.key, chosen:'close' },
  ];

  const movesUsed = uniq(beats.flatMap(b=>b.key ? [b.key] : []));

  return {
    id: 'plan_'+hash(JSON.stringify({ctx, t:Date.now()})),
    scene: ctx.sceneLine,
    beats,
    moves: movesUsed,
    do: ctx.doList,
    dont: ctx.dontList,
    cityNote: ctx.cityNote,
    ethNote: ctx.ethNote,
    signalTag: '⚪ Baseline • Build comfort',
    ctx: {...ctx, opts: ctx.opts}
  };
}

export function rerollBeat(plan, pool, ctx, tag){
  const idx = plan.beats.findIndex(b=>b.tag===tag);
  if(idx<0) return plan;
  const exclude = plan.beats[idx].key;
  let repl;
  if(tag==='Open')  repl = pickTop(pool.openers, ctx, exclude);
  if(tag==='Hook')  repl = pickTop(pool.hooks, ctx, exclude);
  if(tag==='Move')  repl = pickTop(pool.moves, ctx, exclude);
  if(tag==='Pivot') repl = pickTop(pool.pivots, ctx, exclude);
  if(tag==='Close') repl = pickTop(pool.closers, ctx, exclude);

  const b = plan.beats[idx];
  if(tag==='Open'){
    plan.beats[idx] = { tag:'Open', soft: repl.soft||repl.text, standard: repl.standard||null, bold: repl.bold||null, key:repl.key, chosen:chooseLabel(repl) };
  }else if(tag==='Hook'){
    plan.beats[idx] = { tag:'Hook', advice:[repl.text], key:repl.key, chosen:'advice' };
  }else if(tag==='Move'){
    plan.beats[idx] = { tag:'Move', micro:[repl.text], key:repl.key, chosen:'micro' };
  }else if(tag==='Pivot'){
    plan.beats[idx] = { tag:'Pivot', options:[repl.text], key:repl.key, chosen:'option' };
  }else if(tag==='Close'){
    plan.beats[idx] = { tag:'Close', options: repl.text? [repl.text] : (repl.options||[]), key:repl.key, chosen:'close' };
  }
  return plan;
}

function chooseLabel(m){
  if(m.bold) return 'bold';
  if(m.standard) return 'standard';
  return 'soft';
}
