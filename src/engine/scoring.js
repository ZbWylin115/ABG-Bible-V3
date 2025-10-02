import { jaccard, clamp } from './util.js';
import { banditBoost } from './learn.js';

export function scoreMove(move, ctx){
  const want = tagsForContext(ctx);
  let s = 0;

  s += 0.6 * jaccard(move.tags || [], want.core);
  s += 0.2 * jaccard(move.tags || [], want.scene);
  s += 0.2 * jaccard(move.tags || [], want.goal);

  // Risk alignment
  if(ctx.mode==='safe' && move.risk==='bold') s -= 0.25;
  if(ctx.mode==='spicy' && move.risk==='soft') s -= 0.05;
  if(ctx.interest==='low' && move.risk==='bold') s -= 0.2;
  if(ctx.edgy && move.risk==='bold') s += 0.1;

  // Noise / flow penalties
  if(ctx.channel==='IRL' && ctx.noise==='loud' && move.tags?.includes('talky')) s -= 0.2;
  if(ctx.channel==='IRL' && ctx.flow==='seated' && move.tags?.includes('dance')) s -= 0.15;

  // Party size influence
  if(ctx.party==='crew' && move.tags?.includes('intimate')) s -= 0.2;
  if(ctx.party==='crew' && move.tags?.includes('game')) s += 0.1;
  if(ctx.party==='solo' && move.tags?.includes('talky')) s += 0.05;

  // Recent signal intent (live nudge)
  if(ctx.liveSignal==='green' && move.risk!=='bold') s += 0.05;
  if(ctx.liveSignal==='yellow' && move.risk==='bold') s -= 0.15;
  if(ctx.liveSignal==='red') s -= 0.25;

  // Bandit boost
  s += banditBoost(move.key || move.text?.slice(0,40));

  return clamp(s, -1, 1);
}

function tagsForContext(ctx){
  const core = [
    ctx.channel==='IRL' ? 'irl' : 'virtual',
    ctx.edgy ? 'edgy' : 'nonedgy',
    ctx.time,
    ctx.archetypeEnergy,
  ];
  const scene = [
    ctx.noise, ctx.flow, ctx.venueType, ctx.party
  ];
  const goal = [
    ctx.goal, ctx.mode
  ];
  return { core, scene, goal };
}
