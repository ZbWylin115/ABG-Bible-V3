import { rndPick } from './util.js';

export function buildContext(opts, arch, ven, plat, cityPack, eth){
  const noise = ({
    club:'loud', festival:'loud', karaoke:'loud', rooftop_bar:'medium',
    cafe:'quiet', boba:'quiet', dinner:'quiet', art_walk:'medium',
    mall_arcade:'medium', chill_in:'quiet', car_meet:'medium',
    museum:'quiet', late_food:'medium'
  }[ven?.id]) || (opts.channel==='Virtual' ? 'quiet' : 'medium');

  const flow = ({
    club:'dance', festival:'walk', karaoke:'seated', rooftop_bar:'seated',
    cafe:'seated', boba:'walk', dinner:'seated', art_walk:'walk',
    mall_arcade:'walk', chill_in:'seated', car_meet:'walk',
    museum:'walk', late_food:'seated'
  }[ven?.id]) || 'walk';

  const sceneLine = opts.channel==='Virtual'
    ? `${plat?.label}: short, specific, playful; reference her content.`
    : `${ven?.scene_setup || 'Match the room'} Tone: ${arch?.tone.energy}/${arch?.tone.pace}.`;

  const doList = (opts.channel==='Virtual')
    ? ['Be specific to her post/story','Use platform norms (voice/pics where normal)','Offer 2 clear time windows']
    : [...(ven?.do||[]), ...(arch?.safe_topics?['Hit topics: '+arch.safe_topics.slice(0,3).join(', ')] : [])];

  const dontList = (opts.channel==='Virtual')
    ? ['Don’t spam or send paragraphs','Don’t hard-push IRL without green signals']
    : [...(ven?.dont||[]), ...(arch?.pitfalls||[]).slice(0,1)];

  const cityNote = makeCityNote(cityPack);
  const ethNote = opts.includeEth && eth ? `${eth.vibe} Easy pivot: ${eth.pivot}. Avoid: ${eth.pitfall}.` : '';

  return {
    channel: opts.channel, time: opts.time, interest: opts.interest, edgy: opts.edgy,
    mode: opts.mode, goal: opts.goal, party: opts.party || 'solo',
    venueType: ven?.id, noise, flow,
    archetypeEnergy: arch?.tone?.energy || 'calm',
    sceneLine, doList, dontList, cityNote, ethNote,
    liveSignal: null,
    opts
  };
}

function makeCityNote(pack){
  if(!pack) return '';
  const s = rndPick(pack.main); const a = rndPick(pack.alt);
  return `Try ${s?.name}${s?' — '+s.desc:''}. Alt: ${a?.name}.`;
}
