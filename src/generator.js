import { DATA } from '../data/archetypes.js';
import { VENUES } from '../data/venues.js';
import { PLATS } from '../data/platforms.js';
import { ETH } from '../data/ethnicity.js';

import { CITIES } from '../data/cities/la.js';
import { CITY_VEGAS } from '../data/cities/vegas.js';
import { CITY_HOUSTON } from '../data/cities/houston.js';
import { CITY_SLC } from '../data/cities/slc.js';
import { CITY_NYC } from '../data/cities/nyc.js';
import { CITY_BAY } from '../data/cities/bayarea.js';
import { CITY_SEA } from '../data/cities/seattle.js';

import { buildContext } from './engine/context.js';
import { buildCandidates } from './engine/candidates.js';
import { buildPlan, rerollBeat as reroll } from './engine/planner.js';
import { saveLastPlan } from './engine/state.js';

const CITY_MAP = { la:CITIES, vegas:CITY_VEGAS, houston:CITY_HOUSTON, slc:CITY_SLC, nyc:CITY_NYC, bayarea:CITY_BAY, seattle:CITY_SEA };

export function generatePlan(opts){
  const arch = DATA.archetypes.find(a=>a.id===opts.archetype) || DATA.archetypes[0];
  const ven  = VENUES.venues.find(v=>v.id===opts.venue) || VENUES.venues[0];
  const plat = PLATS.platforms.find(p=>p.id===opts.platform) || PLATS.platforms[0];
  const eth  = ETH.list.find(e=>e.id===opts.ethnicity);
  const cityPack = CITY_MAP[opts.city];

  const ctx = buildContext(opts, arch, ven, plat, cityPack, eth);
  const pool = buildCandidates({opts, arch, ven, plat, cityPack});
  const plan = buildPlan({ pool, ctx });
  plan._pool = pool; // ephemeral for rerolls (not saved)
  saveLastPlan(plan);
  return plan;
}

export function rerollBeat(plan, tag){
  if(!plan._pool) return plan;
  const newPlan = reroll(plan, plan._pool, plan.ctx, tag);
  saveLastPlan(newPlan);
  return newPlan;
}
