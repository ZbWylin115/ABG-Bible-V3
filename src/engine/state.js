const KEY_STORE = 'abg_v3_store';
const KEY_LAST  = 'abg_v3_last';

export function loadStore(){
  try{ return JSON.parse(localStorage.getItem(KEY_STORE)||'{}'); }catch{ return {}; }
}
export function saveStore(store){ localStorage.setItem(KEY_STORE, JSON.stringify(store)); }

export function saveLastPlan(plan){
  const slim = {
    id: plan.id,
    beats: plan.beats?.map(b=>({tag:b.tag, key:b.key, chosen:b.chosen}))||[],
    moves: plan.moves||[],
    ctx: plan.ctx,
    opts: plan.ctx?.opts || null
  };
  localStorage.setItem(KEY_LAST, JSON.stringify(slim));
}
export function loadLastPlan(){
  try{ return JSON.parse(localStorage.getItem(KEY_LAST)||''); }catch{ return null; }
}
